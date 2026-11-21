/**
 * Live coding stats for the scoreboard, fetched on the server and cached
 * hourly with `"use cache"` — the page stays static, the browser never calls
 * these APIs (so no CSP changes), and a failed API just yields `null`.
 */
import { cacheLife } from "next/cache";
import { z } from "zod";

const TIMEOUT_MS = 8000;
/** A generic client name, as GitHub asks for one. */
const USER_AGENT = "portfolio-stats";

/* ------------------------------------------------------------- LeetCode */

const leetCodeSchema = z.object({
  data: z.object({
    allQuestionsCount: z.array(z.object({ difficulty: z.string(), count: z.number() })),
    matchedUser: z
      .object({
        submitStatsGlobal: z.object({
          acSubmissionNum: z.array(z.object({ difficulty: z.string(), count: z.number() })),
        }),
        profile: z.object({ ranking: z.number().nullable() }).nullable(),
        userCalendar: z
          .object({ streak: z.number(), totalActiveDays: z.number() })
          .nullable()
          .optional(),
      })
      .nullable(),
  }),
});

export interface LeetCodeStats {
  solved: number;
  total: number;
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  ranking: number | null;
  streak: number | null;
  activeDays: number | null;
}

/** Turns LeetCode's GraphQL answer into our shape (null if the user is missing). */
export function parseLeetCode(json: unknown): LeetCodeStats | null {
  const parsed = leetCodeSchema.safeParse(json);
  if (!parsed.success || !parsed.data.data.matchedUser) return null;
  const { allQuestionsCount, matchedUser } = parsed.data.data;
  const count = (list: { difficulty: string; count: number }[], d: string) =>
    list.find((x) => x.difficulty === d)?.count ?? 0;
  const ac = matchedUser.submitStatsGlobal.acSubmissionNum;
  const pair = (d: string) => ({ solved: count(ac, d), total: count(allQuestionsCount, d) });
  return {
    solved: count(ac, "All"),
    total: count(allQuestionsCount, "All"),
    easy: pair("Easy"),
    medium: pair("Medium"),
    hard: pair("Hard"),
    ranking: matchedUser.profile?.ranking ?? null,
    streak: matchedUser.userCalendar?.streak ?? null,
    activeDays: matchedUser.userCalendar?.totalActiveDays ?? null,
  };
}

const LEETCODE_QUERY = `query stats($username: String!) {
  allQuestionsCount { difficulty count }
  matchedUser(username: $username) {
    submitStatsGlobal { acSubmissionNum { difficulty count } }
    profile { ranking }
    userCalendar { streak totalActiveDays }
  }
}`;

/** Solved counts by difficulty, ranking and streak. Null when LeetCode is unreachable. */
export async function getLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return parseLeetCode(await res.json());
  } catch {
    return null;
  }
}

/* ------------------------------------------------------- GitHub heatmap */

const contributionsSchema = z.object({
  total: z.record(z.string(), z.number()),
  contributions: z.array(
    z.object({ date: z.string(), count: z.number(), level: z.number().int().min(0).max(4) }),
  ),
});

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface Contributions {
  total: number;
  days: ContributionDay[];
  /** Longest run of consecutive days with at least one contribution. */
  longestStreak: number;
  /** Busiest single day. */
  bestDay: ContributionDay | null;
}

/** Longest run of consecutive non-zero days (days must be in date order). */
export function longestStreak(days: readonly ContributionDay[]): number {
  let best = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export function parseContributions(json: unknown): Contributions | null {
  const parsed = contributionsSchema.safeParse(json);
  if (!parsed.success) return null;
  const days = parsed.data.contributions
    .map((d) => ({ ...d, level: d.level as ContributionDay["level"] }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const bestDay = days.reduce<ContributionDay | null>(
    (best, d) => (d.count > (best?.count ?? 0) ? d : best),
    null,
  );
  return { total, days, longestStreak: longestStreak(days), bestDay };
}

/** The last year of GitHub contributions. Null when the API is unreachable. */
export async function getContributions(username: string): Promise<Contributions | null> {
  "use cache";
  cacheLife("hours");
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
      { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) },
    );
    if (!res.ok) return null;
    return parseContributions(await res.json());
  } catch {
    return null;
  }
}

/* ------------------------------------------------------- GitHub profile */

const userSchema = z.object({ public_repos: z.number(), followers: z.number() });
const reposSchema = z.array(
  z.object({
    fork: z.boolean(),
    stargazers_count: z.number(),
    language: z.string().nullable(),
  }),
);

export interface GitHubProfile {
  repos: number;
  followers: number;
  stars: number;
  /** Most-used languages across own (non-fork) repos, with repo counts. */
  languages: { name: string; repos: number }[];
}

export function summarizeGitHub(user: unknown, repos: unknown): GitHubProfile | null {
  const u = userSchema.safeParse(user);
  const r = reposSchema.safeParse(repos);
  if (!u.success || !r.success) return null;
  const own = r.data.filter((repo) => !repo.fork);
  const counts = new Map<string, number>();
  for (const repo of own) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  }
  return {
    repos: u.data.public_repos,
    followers: u.data.followers,
    stars: own.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    languages: [...counts]
      .map(([name, n]) => ({ name, repos: n }))
      .sort((a, b) => b.repos - a.repos || a.name.localeCompare(b.name))
      .slice(0, 5),
  };
}

/** Repo, star and follower counts plus top languages. Null when GitHub is unreachable. */
export async function getGitHubProfile(username: string): Promise<GitHubProfile | null> {
  "use cache";
  cacheLife("hours");
  const init = {
    headers: { Accept: "application/vnd.github+json", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  };
  try {
    const user = encodeURIComponent(username);
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`, init),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100&type=owner`, init),
    ]);
    if (!userRes.ok || !reposRes.ok) return null;
    return summarizeGitHub(await userRes.json(), await reposRes.json());
  } catch {
    return null;
  }
}
