import { describe, expect, it } from "vitest";

import { longestStreak, parseContributions, parseLeetCode, summarizeGitHub } from "./dev-stats";

describe("dev stats parsing", () => {
  it("reads LeetCode solved counts by difficulty", () => {
    const stats = parseLeetCode({
      data: {
        allQuestionsCount: [
          { difficulty: "All", count: 3000 },
          { difficulty: "Easy", count: 800 },
          { difficulty: "Medium", count: 1600 },
          { difficulty: "Hard", count: 600 },
        ],
        matchedUser: {
          submitStatsGlobal: {
            acSubmissionNum: [
              { difficulty: "All", count: 120 },
              { difficulty: "Easy", count: 70 },
              { difficulty: "Medium", count: 45 },
              { difficulty: "Hard", count: 5 },
            ],
          },
          profile: { ranking: 512345 },
          userCalendar: { streak: 12, totalActiveDays: 80 },
        },
      },
    });
    expect(stats).toEqual({
      solved: 120,
      total: 3000,
      easy: { solved: 70, total: 800 },
      medium: { solved: 45, total: 1600 },
      hard: { solved: 5, total: 600 },
      ranking: 512345,
      streak: 12,
      activeDays: 80,
    });
  });

  it("returns null for an unknown LeetCode user or a bad payload", () => {
    expect(parseLeetCode({ data: { allQuestionsCount: [], matchedUser: null } })).toBeNull();
    expect(parseLeetCode({ nope: true })).toBeNull();
  });

  it("totals contributions, finds the best day and the longest streak", () => {
    const result = parseContributions({
      total: { lastYear: 6 },
      contributions: [
        { date: "2025-01-03", count: 0, level: 0 },
        { date: "2025-01-01", count: 1, level: 1 },
        { date: "2025-01-02", count: 4, level: 3 },
        { date: "2025-01-04", count: 1, level: 1 },
      ],
    });
    expect(result?.total).toBe(6);
    expect(result?.days.map((d) => d.date)).toEqual([
      "2025-01-01",
      "2025-01-02",
      "2025-01-03",
      "2025-01-04",
    ]);
    expect(result?.bestDay?.date).toBe("2025-01-02");
    expect(result?.longestStreak).toBe(2);
  });

  it("counts a streak only across consecutive active days", () => {
    const day = (count: number) => ({ date: "x", count, level: 0 as const });
    expect(longestStreak([day(1), day(1), day(0), day(1), day(1), day(1)])).toBe(3);
    expect(longestStreak([])).toBe(0);
  });

  it("summarises GitHub repos without forks", () => {
    const profile = summarizeGitHub({ public_repos: 4, followers: 9 }, [
      { fork: false, stargazers_count: 3, language: "TypeScript" },
      { fork: false, stargazers_count: 1, language: "TypeScript" },
      { fork: false, stargazers_count: 0, language: "Python" },
      { fork: true, stargazers_count: 50, language: "Go" },
    ]);
    expect(profile).toEqual({
      repos: 4,
      followers: 9,
      stars: 4,
      languages: [
        { name: "TypeScript", repos: 2 },
        { name: "Python", repos: 1 },
      ],
    });
  });
});
