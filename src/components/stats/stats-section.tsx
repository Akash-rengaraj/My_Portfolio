import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { Lightbox } from "@/components/works/lightbox";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import { profiles } from "@/config/site";
import { HACKATHONS, HACKERRANK_BADGES } from "@/content/achievements";
import {
  getContributions,
  getGitHubProfile,
  getLeetCodeStats,
  type Contributions,
  type GitHubProfile,
  type LeetCodeStats,
} from "@/lib/dev-stats";

import { CountUp } from "./count-up";
import { Heatmap, HeatmapLegend } from "./heatmap";
import { LoadingImage } from "@/components/ui/loading-image";

const card =
  "relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-[0_18px_36px_-26px_var(--shadow-ink)] sm:p-7";

const DIFFICULTY = [
  { key: "easy", label: "Easy", tint: "color-mix(in srgb, var(--signal) 40%, transparent)" },
  { key: "medium", label: "Medium", tint: "color-mix(in srgb, var(--signal) 70%, transparent)" },
  { key: "hard", label: "Hard", tint: "var(--signal)" },
] as const;

function CardHeader({ label, href }: { label: string; href?: string }) {
  return (
    <header className="flex items-center justify-between gap-3">
      <p className="font-mono text-[11px] tracking-[0.18em] text-stage-muted uppercase">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          profile ↗
        </a>
      ) : null}
    </header>
  );
}

function Unavailable({ what, href }: { what: string; href: string }) {
  return (
    <p className="mt-6 text-sm text-stage-muted">
      {what} is taking a break right now.{" "}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-signal underline-offset-4 hover:underline"
      >
        See it on the site ↗
      </a>
    </p>
  );
}

/** Solved-by-difficulty as a ring, plus ranking and streak. */
function LeetCodeCard({ stats }: { stats: LeetCodeStats | null }) {
  const href = profiles.leetcode.url;
  if (!stats) {
    return (
      <article className={card}>
        <CardHeader label="leetcode" href={href} />
        <Unavailable what="LeetCode" href={href} />
      </article>
    );
  }
  const shares = DIFFICULTY.map((d) =>
    stats.solved > 0 ? (stats[d.key].solved / stats.solved) * 100 : 0,
  );
  const arcs = DIFFICULTY.map((d, i) => ({
    ...d,
    share: shares[i] ?? 0,
    offset: shares.slice(0, i).reduce((sum, s) => sum + s, 0),
  }));
  return (
    <article className={card} aria-label={`LeetCode: ${stats.solved} problems solved`}>
      <CardHeader label="leetcode" href={href} />
      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
        <div className="relative size-44 shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--tint)" strokeWidth="10" />
            {arcs.map((arc) =>
              arc.share > 0 ? (
                <circle
                  key={arc.key}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={arc.tint}
                  strokeWidth="10"
                  pathLength={100}
                  strokeDasharray={`${Math.max(0, arc.share - 1)} ${100 - Math.max(0, arc.share - 1)}`}
                  strokeDashoffset={-arc.offset}
                />
              ) : null,
            )}
          </svg>
          <div className="absolute inset-0 grid place-content-center text-center">
            <CountUp
              value={stats.solved}
              className="font-heading text-4xl font-semibold tracking-tight"
            />
            <span className="font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
              of {stats.total.toLocaleString("en-IN")} solved
            </span>
          </div>
        </div>
        <ul className="w-full space-y-3">
          {DIFFICULTY.map((d) => {
            const { solved, total } = stats[d.key];
            return (
              <li key={d.key}>
                <p className="flex items-baseline justify-between font-mono text-xs">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: d.tint }} />
                    {d.label}
                  </span>
                  <span className="text-stage-muted tabular-nums">
                    <span className="text-stage-foreground">{solved}</span> / {total}
                  </span>
                </p>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-tint">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${total ? (solved / total) * 100 : 0}%`, background: d.tint }}
                  />
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <dl className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-5">
        {[
          ["global rank", stats.ranking ? `#${stats.ranking.toLocaleString("en-IN")}` : "—"],
          ["active days", stats.activeDays?.toString() ?? "—"],
          ["best streak", stats.streak ? `${stats.streak} days` : "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.14em] text-stage-muted uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-heading text-lg font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/** Contribution heatmap plus the GitHub profile numbers and top languages. */
function GitHubCard({
  contributions,
  profile,
}: {
  contributions: Contributions | null;
  profile: GitHubProfile | null;
}) {
  const href = profiles.github.url;
  const topLanguageRepos = Math.max(1, ...(profile?.languages.map((l) => l.repos) ?? [1]));
  return (
    <article className={card} aria-label="GitHub activity">
      <CardHeader label="github · last 12 months" href={href} />
      {contributions ? (
        <>
          <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <CountUp
              value={contributions.total}
              className="font-heading text-5xl font-semibold tracking-tight"
            />
            <span className="text-stage-muted">contributions this year</span>
          </p>
          <div className="mt-5 text-stage-muted">
            <Heatmap days={contributions.days} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-stage-muted">
            <span>
              longest streak{" "}
              <span className="text-stage-foreground">{contributions.longestStreak} days</span>
              {contributions.bestDay ? (
                <>
                  {" · "}best day{" "}
                  <span className="text-stage-foreground">
                    {contributions.bestDay.count} on {contributions.bestDay.date}
                  </span>
                </>
              ) : null}
            </span>
            <HeatmapLegend />
          </div>
        </>
      ) : (
        <Unavailable what="The GitHub contribution graph" href={href} />
      )}

      {profile ? (
        <div className="mt-6 grid gap-6 border-t border-line pt-5 sm:grid-cols-[auto_1fr]">
          <dl className="grid grid-cols-3 gap-5 sm:gap-7">
            {[
              ["repos", profile.repos],
              ["stars", profile.stars],
              ["followers", profile.followers],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[10px] tracking-[0.14em] text-stage-muted uppercase">
                  {label}
                </dt>
                <dd className="mt-1 font-heading text-2xl font-semibold">
                  <CountUp value={Number(value)} />
                </dd>
              </div>
            ))}
          </dl>
          {profile.languages.length > 0 ? (
            <ul className="space-y-1.5" aria-label="Top languages by repository">
              {profile.languages.map((language) => (
                <li key={language.name} className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="w-24 shrink-0 truncate">{language.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-tint">
                    <span
                      className="block h-full rounded-full bg-stage-foreground/70"
                      style={{ width: `${(language.repos / topLanguageRepos) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-stage-muted tabular-nums">
                    {language.repos} {language.repos === 1 ? "repo" : "repos"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function HackathonCard() {
  const hack = HACKATHONS[0];
  if (!hack) return null;
  return (
    <article
      className={`${card} grid gap-6 md:grid-cols-[1.1fr_1fr]`}
      aria-label={`${hack.title}: ${hack.result}`}
    >
      <div className="flex flex-col gap-4">
        <CardHeader label="hackathon" />
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-signal px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
            🏆 {hack.result}
          </span>
          <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight">{hack.title}</h3>
          <p className="mt-1 text-sm text-stage-muted">
            {hack.kind} · {hack.date} · {hack.venue}
          </p>
        </div>
        <p className="font-medium">
          {hack.project} <span className="text-stage-muted">· {hack.team}</span>
        </p>
        <ul className="space-y-1.5 text-sm text-stage-foreground/80">
          {hack.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span aria-hidden="true" className="text-signal">
                →
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <Lightbox image={hack.photo}>
          <LoadingImage
            src={hack.photo.src}
            alt={hack.photo.alt}
            width={hack.photo.width}
            height={hack.photo.height}
            sizes="(min-width: 1024px) 30vw, 90vw"
            className="h-auto w-full rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Lightbox>
        <div className="grid grid-cols-3 gap-3">
          {hack.gallery.map((photo) => (
            <Lightbox key={photo.src} image={photo}>
              <LoadingImage
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 1024px) 10vw, 30vw"
                className="aspect-square w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </Lightbox>
          ))}
        </div>
      </div>
    </article>
  );
}

function HackerRankCard() {
  return (
    <article className={`${card} flex flex-col`} aria-label="HackerRank badges">
      <CardHeader label="hackerrank badges" />
      <ul className="mt-6 grid flex-1 grid-cols-2 gap-4">
        {HACKERRANK_BADGES.map((badge) => (
          <li key={badge} className="flex flex-col items-center gap-2 text-center">
            <span className="relative grid size-16 place-items-center">
              <svg viewBox="0 0 64 64" className="absolute inset-0 size-full" aria-hidden="true">
                <path
                  d="M32 3 57 17.5v29L32 61 7 46.5v-29Z"
                  fill="var(--tint)"
                  stroke="var(--line-strong)"
                  strokeWidth="1.5"
                />
              </svg>
              <span aria-hidden="true" className="relative text-xl text-signal">
                ★
              </span>
            </span>
            <span className="font-mono text-[11px] leading-tight">{badge}</span>
          </li>
        ))}
      </ul>
      <HiddenStamp id="scoreboard" className="absolute right-4 bottom-4" />
    </article>
  );
}

/**
 * "The scoreboard" — chapter 05. Live LeetCode and GitHub numbers (fetched
 * on the server and refreshed hourly), the hackathon result and badges.
 */
export async function StatsSection() {
  const [leetcode, contributions, github] = await Promise.all([
    getLeetCodeStats(profiles.leetcode.user),
    getContributions(profiles.github.user),
    getGitHubProfile(profiles.github.user),
  ]);

  return (
    <section
      id="scoreboard"
      aria-labelledby="scoreboard-title"
      className="dark relative bg-[var(--bg-stats)] text-stage-foreground"
      style={{
        backgroundImage:
          "radial-gradient(70% 45% at 50% 0%, var(--tint), transparent 70%), linear-gradient(var(--blueprint-line) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 100% 48px",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-certs)]" variant="tornAlt" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        <div className="max-w-3xl">
          <ChapterMarker chapter="scoreboard" note="the numbers keep me honest" />
          <h2
            id="scoreboard-title"
            className="mt-6 font-heading text-6xl font-semibold tracking-tight md:text-8xl"
          >
            By the Numbers
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/75">
            Problems solved, code shipped and competitions entered — the LeetCode and GitHub numbers
            are live, refreshed every hour.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <LeetCodeCard stats={leetcode} />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <GitHubCard contributions={contributions} profile={github} />
          </div>
          <div className="lg:col-span-8">
            <HackathonCard />
          </div>
          <div className="lg:col-span-4">
            <HackerRankCard />
          </div>
        </div>
      </div>
    </section>
  );
}
