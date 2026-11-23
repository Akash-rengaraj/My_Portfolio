# Personal Story Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `/personal` page that opens with a pinned, scroll-played, six-scene SVG story of the owner off the clock, linked by match cuts.

**Architecture:** Scene data and timing math live in a pure module (`scenes.ts`). The SVG art lives in focused art files: the character, the props and one file per scene setting. A client component pins a sticky stage inside a tall section and scrubs one GSAP timeline with ScrollTrigger, inside `gsap.matchMedia` as in `dev-hero.tsx`. Match cuts are overlay shapes tweened between scenes: screen swap, zoom into the screen, circle tween, line tweens and a MorphSVG path. Reduced motion gets a static storyboard rendered from the same art, with no JS.

**Tech Stack:** Next 16 static export, React 19, TypeScript strict, Tailwind v4, GSAP 3.15 (`ScrollTrigger`, `MorphSVGPlugin`, `@gsap/react`), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-24-personal-hero-design.md`

## Global Constraints

- Static export only, no server features (project CLAUDE.md). New route goes into `src/app/sitemap.ts`.
- SVG art only: no photos, video, WebGL or brand logos. The Himalayan 450 is black; the Yamaha F310 has a natural top, a tortoiseshell pickguard and a rosette.
- Character: warm wheatish skin, straight black slicked-back hair, a moustache, no beard, no glasses.
- Scene lines, verbatim: "I build things", "I play everything", "I love travelling", "I make music", "I write", "and I bake (and eat) everything".
- Page `h1`: "Akash, off the clock". Closing links: "see the developer side" → `/`, "say hi" → `/#contact`.
- About one viewport of scroll per scene. The route line has 6 dots. "skip to the end" is always visible while pinned.
- Reduced motion: no pin, no scrub; a stacked storyboard with each scene's line.
- Owner's rule: no tests, builds or browser runs unless asked. Each task's verification is left to the pre-push hook (typecheck + vitest) and the owner's own look.

## Review Focus

- Reloading mid-story: the scrub must start where the page is, not fast-forward from 0. Start the scrubber at `sectionProgress` (as `dev-hero.tsx` does).
- Portrait phones: the character must stay in frame in every scene. Compose each scene with the character inside the centre column x 560–1040 of the 1600×900 viewBox and use `preserveAspectRatio="xMidYMid slice"`.
- Resizing or rotating while pinned: `gsap.matchMedia` reverts and rebuilds; the art must not keep stale inline transforms. Set every tweened property in the timeline's `fromTo` / `set`.
- The skip button with reduced motion: it must not exist when there is no pin (render it inside the pinned stage only).
- No JS: the storyboard should still be readable. Render it in HTML and show it with `motion-reduce:` and a `<noscript>` style, like the developer hero.

---

### Task 1: Scene data and timing

**Files:**

- Create: `src/components/personal/scenes.ts`
- Test: `src/components/personal/scenes.test.ts`

**Interfaces:**

- Produces: `type SceneId = "code" | "game" | "ride" | "guitar" | "poem" | "bake"`; `interface StoryScene { id: SceneId; line: string; description: string }`; `SCENES: readonly StoryScene[]` (in spec order); `STORY_TITLE = "Akash, off the clock"`; `sceneWindow(index: number): { start: number; end: number }` (equal sixths of 0–1); `sceneAt(progress: number): number` (clamped 0–5); `STORY_SUMMARY: string` (all descriptions joined, for screen readers).

- [ ] **Step 1: Tests:** six scenes, in order, with the exact lines; windows are contiguous and cover 0–1; `sceneAt(0) === 0`, `sceneAt(0.5) === 3`, `sceneAt(1) === 5`, `sceneAt(-1) === 0`; the summary mentions each scene.
- [ ] **Step 2: Implement** `scenes.ts`.

### Task 2: The character and props (art)

**Files:**

- Create: `src/components/personal/art/character.tsx`: `Head({ helmet?: boolean })` in profile facing right (hair, moustache, ear, eye, brow), drawn around (0, 0) at about 110 units tall; `SKIN`, `HAIR` colour constants.
- Create: `src/components/personal/art/props.tsx`: `Himalayan()` (side view facing right, front wheel centre exported as `FRONT_WHEEL = { cx, cy, r }` in its local space), `F310()` (sound hole centre exported as `SOUND_HOLE`, string endpoints as `STRINGS`), `Laptop()` with a `data-part="screen"` rect.

No unit tests (pure presentational SVG). Task 3's smoke test renders them.

### Task 3: Scene art, the hero component and the timeline

**Files:**

- Create: `src/components/personal/art/scene-art.tsx`: `SceneArt({ id }: { id: SceneId })` for the storyboard, plus `StoryArt()`, which renders every scene layer for the animated stage with `data-scene="<id>"` groups and the overlay cut shapes (`data-cut="wheel"`, `data-cut="strings"`, `data-cut="ink"`).
- Create: `src/components/personal/story-timeline.ts`: `buildPersonalTimeline(root: HTMLElement): gsap.core.Timeline` (paused, 60 units: each scene holds 6 and transitions 4; captions, route-line fill and dots included).
- Create: `src/components/personal/personal-hero.tsx`: `PersonalHero()`. A section about `h-[700svh]` with a sticky `h-svh` stage, the h1 intro, captions, the route line, the skip button, the sr-only summary and the reduced-motion storyboard.
- Test: `src/components/personal/personal-hero.test.tsx`: the h1 is `STORY_TITLE`; every scene line is rendered; the summary is `sr-only`; "skip to the end" links to `#personal-end`.

Match cuts, with exact coordinates chosen in the art:
1→2 the screen content swaps (code lines out, racing road in) and the hands go from keyboard to controller ·
2→3 the camera scales the room about the screen centre until the screen fills the frame, then the ride scene fades in at the same road composition ·
3→4 the overlay circle tweens `cx/cy/r` from the front wheel to the sound hole while the spokes spin out ·
4→5 six overlay lines tween from the strings to the notebook's rules (silver → blue) ·
5→6 the ink blot morphs (MorphSVG) into the chocolate drip (navy → brown) ·
6→end the candle glow grows to fill the frame.

### Task 4: Page, switch and sitemap

**Files:**

- Create: `src/app/personal/page.tsx`: metadata (title "Off the clock", canonical `/personal`), `<main id="main">` with `PersonalHero` and the closing frame (`id="personal-end"`, the two links).
- Modify: `src/components/site/site-header.tsx`: `PortfolioSwitch` turns personal into a `Link href="/personal"`; `aria-current="page"` follows `usePathname()`; the "soon" badge goes.
- Modify: `src/components/site/site-header.test.tsx`: replace the "coming soon" test with "links to the personal portfolio" and "marks the personal side current on /personal".
- Modify: `src/app/sitemap.ts`: add `"/personal"`.
