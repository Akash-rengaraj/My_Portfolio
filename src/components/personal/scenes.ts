/**
 * The personal hero's story: six scenes of the owner off the clock, played
 * by scrolling, each one turning into the next through a match cut.
 */

export type SceneId = "code" | "game" | "ride" | "guitar" | "poem" | "bake";

export interface StoryScene {
  id: SceneId;
  /** The handwritten line shown during the scene. */
  line: string;
  /** What the (decorative) illustration shows, for screen readers and the storyboard. */
  description: string;
}

export const STORY_TITLE = "Akash, off the clock";

export const SCENES: readonly StoryScene[] = [
  {
    id: "code",
    line: "I build things",
    description: "Late at night, coding at a laptop in a dark room lit by the screen.",
  },
  {
    id: "game",
    line: "I play everything",
    description: "The code on the screen turns into a racing game, controller in hand.",
  },
  {
    id: "ride",
    line: "I love travelling",
    description: "Riding a black Himalayan 450 along a winding hill road at dawn.",
  },
  {
    id: "guitar",
    line: "I make music",
    description: "Playing a Yamaha F310 acoustic guitar at a roadside viewpoint at golden hour.",
  },
  {
    id: "poem",
    line: "I write",
    description: "Writing a poem with a fountain pen in a notebook under a desk lamp.",
  },
  {
    id: "bake",
    line: "and I bake (and eat) everything",
    description:
      "Baking a chocolate cake in a warm kitchen, flour on one cheek, one candle on top.",
  },
];

/** The slice of story progress (0–1) that a scene occupies. */
export function sceneWindow(index: number): { start: number; end: number } {
  return { start: index / SCENES.length, end: (index + 1) / SCENES.length };
}

/** Which scene is showing at a story progress between 0 and 1. */
export function sceneAt(progress: number): number {
  const index = Math.floor(progress * SCENES.length);
  return Math.min(SCENES.length - 1, Math.max(0, index));
}

/** The whole story in words, for screen readers. */
export const STORY_SUMMARY = `${STORY_TITLE}. ${SCENES.map((s) => `${s.description} “${s.line}.”`).join(" ")}`;
