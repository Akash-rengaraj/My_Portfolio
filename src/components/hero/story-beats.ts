/**
 * The nine beats of the hero story. `start` / `end` are fractions of story
 * time (0–1) and drive the captions, the progress rail and the camera.
 */

import type { TimeWarp } from "./camera-path";

export type BeatId =
  "throw" | "catch" | "understand" | "root-cause" | "swot" | "decision" | "build" | "ship";

export interface StoryBeat {
  id: BeatId;
  index: string;
  title: string;
  line: string;
  start: number;
  end: number;
}

/** Master timeline length in story units; beats map onto it as fractions. */
export const STORY_DURATION = 174;

const beat = (
  id: BeatId,
  index: number,
  title: string,
  line: string,
  start: number,
  end: number,
): StoryBeat => ({
  id,
  index: String(index).padStart(2, "0"),
  title,
  line,
  start: start / STORY_DURATION,
  end: end / STORY_DURATION,
});

/** Story-unit stamps where each beat starts (and the outro). */
export const BEAT_AT = {
  throw: 10,
  catch: 29,
  understand: 42,
  rootCause: 62,
  swot: 82,
  decision: 98,
  build: 126,
  ship: 150,
  outro: 166,
} as const;

export const STORY_BEATS: readonly StoryBeat[] = [
  beat(
    "throw",
    1,
    "the throw",
    "Every product starts as a problem someone gave up on.",
    BEAT_AT.throw,
    BEAT_AT.catch,
  ),
  beat(
    "catch",
    2,
    "the catch",
    "I catch it before it hits the floor.",
    BEAT_AT.catch,
    BEAT_AT.understand,
  ),
  beat(
    "understand",
    3,
    "understand",
    "First, understand it: the symptoms, the people, the cost, in numbers.",
    BEAT_AT.understand,
    BEAT_AT.rootCause,
  ),
  beat(
    "root-cause",
    4,
    "root cause",
    "Ask why five times until you hit the one cause that matters.",
    BEAT_AT.rootCause,
    BEAT_AT.swot,
  ),
  beat(
    "swot",
    5,
    "swot",
    "Weigh what's there: strengths, weaknesses, opportunities, threats.",
    BEAT_AT.swot,
    BEAT_AT.decision,
  ),
  beat(
    "decision",
    6,
    "the decision",
    "Score every fix. Pick the one that's cheapest to run and hardest to break.",
    BEAT_AT.decision,
    BEAT_AT.build,
  ),
  beat("build", 7, "the build", "Write it. Test it. Make it real.", BEAT_AT.build, BEAT_AT.ship),
  beat(
    "ship",
    8,
    "shipped",
    "Ship it, measure it, and hand it back to the people who needed it.",
    BEAT_AT.ship,
    BEAT_AT.outro,
  ),
];

/** Story time while the ball is in flight — the visitor can catch it. */
export const CATCH_WINDOW = [22 / STORY_DURATION, BEAT_AT.catch / STORY_DURATION] as const;

/** Scroll slows to ~1/3 speed around the catch. */
export const TIME_WARPS: readonly TimeWarp[] = [
  { at: BEAT_AT.catch / STORY_DURATION, radius: 0.02, speed: 0.35 },
];

/** Caption shown after the visitor catches the ball themselves. */
export const VISITOR_CATCH_LINE = "Nice catch. Now watch what I do with it.";

/** Plain-text version of the story for screen readers and search engines. */
export const STORY_SUMMARY =
  "A client writes a problem on paper, crumples it and throws it away. " +
  "I catch it and unfold it, write down the symptoms, who is affected and what it costs, " +
  "ask why five times to find the root cause, " +
  "weigh strengths, weaknesses, opportunities and threats, score the possible fixes and " +
  "pick the most efficient one, build and test it, and ship it back " +
  "to the people who needed it.";
