# Vector Hero v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the first (vector, multiplayer-cursor) hero with real depth, premium shading, motion blur, glass UI and an interactive "you catch it" moment.

**Architecture:** One SVG world split into three parallax layers (far / mid / near) under a 2D camera `{x, y, zoom, tilt}`. A paused GSAP master timeline (0–100 story units) tweens a plain "rig" object; one render pass writes rig → SVG attributes. ScrollTrigger maps scroll → progress through a time-warp so the catch plays in slow motion. A small pointer hook adds the visitor's "you" cursor and the click-to-catch flourish.

**Tech Stack:** Next.js 16, React 19, TypeScript strict, Tailwind v4, GSAP 3.15 + ScrollTrigger + MotionPathPlugin, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-20-vector-hero-v2-design.md`

## Global Constraints

- No WebGL, video or AI imagery; everything is SVG/HTML, self-hosted (CSP unchanged).
- Palette: stage `#0b0b0c`, accent `#ff5a1f`, paper `#f4f0e6`, ink `#1d2a4a`; fonts Geist, Geist Mono, Caveat (`--font-hand`).
- Story beats and copy: 01 the throw, 02 the catch, 03 the analysis, 04 the build, 05 shipped.
- Interactive-catch caption swap text: "Nice catch. Now watch what I do with it."
- One continuous camera move; never a cut or a fade-to-black between beats.
- Reduced motion: no pinning, section is one viewport tall, static intro frame.
- `pnpm check` (format, lint, typecheck, test, secrets) passes after every task.
- Commits: only when the owner asks (repo rule). Until then, treat each "commit" step as a checkpoint: `pnpm check` green.

## Review Focus

- Resizing or rotating the device mid-story reframes immediately without jumps (aspect change re-renders the camera).
- Scrolling fast or jumping (Home/End, scrollbar drag) leaves every element in the right state for that progress; going back to 0 restores the opening frame exactly.
- Touch devices: tapping the ball during flight counts as a catch; no hover-only behaviour.
- The "you" cursor only exists while the ball is in flight and disappears when the pointer leaves the stage.
- The handwriting font loading late doesn't break line measurements (fallback width used, re-measured once fonts are ready).

---

### Task 1: Remove the WebGL hero

**Files:**

- Delete: `src/components/hero/{paper-material.ts,paper-canvas.ts,paper-scene.tsx,name-wall.tsx,story.ts,dust.ts,ui-textures.ts,stage-canvas.tsx,paper-hero.tsx,paper-hero.test.tsx,story-copy.ts}`, `public/fonts/`, `tools/fonts/`
- Modify: `package.json` (remove `three`, `@react-three/fiber`, `@react-three/postprocessing`, `postprocessing`, `@types/three`, `geist`, `opentype.js`), `eslint.config.mjs` (drop the hero3d override block), `src/app/page.tsx` (temporarily render no hero)
- Keep: `src/components/hero/camera-path.ts` (`smoothstep`, `windowProgress`, `warpProgress`, `TimeWarp`)

**Interfaces:** Produces `smoothstep(x)`, `windowProgress(t, start, end)`, `warpProgress(progress, warps)`, type `TimeWarp` from `camera-path.ts` (drop `sampleCamera`/`CameraKey`/`Vec3` if unused after Task 4).

- [ ] Step 1: Delete files and deps (`pnpm remove …`), keep `camera-path.ts`; add `camera-path.test.ts` covering `warpProgress` monotonic, endpoints 0→0/1→1, slowed inside a warp, identity without warps.
- [ ] Step 2: `pnpm check` → all green.
- [ ] Step 3: Commit `refactor(hero): remove WebGL hero, keep scroll math`.

### Task 2: 2D geometry + camera math

**Files:** Create `src/components/hero/geometry.ts`, test `geometry.test.ts`

**Interfaces (produces):**

- `type Point = { x: number; y: number }`, `type Camera = { x: number; y: number; zoom: number; tilt: number }`
- `createRandom(seed: number): () => number`
- `sheetOutline(width, height, count): Point[]`
- `crumpledOutline(outline, radius, seed): Point[]` — keeps each point's angle; radius = `radius * (0.86 + 0.1·sin(3θ+φ1) + 0.06·sin(8θ+φ2) ± 0.04)`
- `wrinkledOutline(outline, amplitude, seed): Point[]`
- `toPointsAttr(points): string` (1 decimal)
- `layerTransform(camera: Camera, depth: number, viewport: { width: number; height: number }): string` — SVG `transform` for a layer: translate viewport centre, rotate `tilt·depth`, scale `zoom^depth`, translate `-camera.x·depth, -camera.y·depth`. Depth 1 = mid layer, 0.6 = far, 1.35 = near.
- `worldToScreen(p: Point, camera, depth, viewport): Point` (inverse-free forward transform, used for hit-testing)

- [ ] Step 1: Tests: same-seed determinism; outline lengths equal; crumpled radius within `[0.6r, 1.15r]` and angle preserved; `toPointsAttr` precision; `worldToScreen(camera.x/y, camera, d, vp)` = viewport centre for any depth; zoom 2 doubles screen distance at depth 1; far layer moves less than mid for the same camera pan.
- [ ] Step 2: Run → FAIL. Step 3: implement. Step 4: run → PASS.
- [ ] Step 5: Commit `feat(hero): 2D geometry and parallax camera math`.

### Task 3: Scene layout, beats and copy

**Files:** Create `src/components/hero/scene-layout.ts`, `src/components/hero/story-beats.ts`, test `story-beats.test.ts`

**Interfaces (produces):**

- `PALETTE` (Global Constraints colours + `panel #121418`, `panelBorder #2a2e35`, `cool #8ab4ff`, `ok #4ade80`, `client #a3a19b`)
- `SHEET {width:460,height:580,pointCount:72}`, `PAPER_OUTLINES {sheet, ball, wrinkled}` (attr strings)
- `PAPER_STAGES {desk, crumpled, catch, unfolded}` each `{x,y,rot}`; `THROW_PATH: Point[]`
- `PROBLEM_LINES` (4 lines: "We track every order", "in 14 spreadsheets.", "Nothing ever matches.", "We lose hours. Help?"), `ANALYSED_LINES = [1,2,3]`, `TOKEN_LABELS`
- `EDITOR`, `SPEC_LINES`, `BUILD_LINES`, `TERMINAL_LINES`, `USERS` (8 nodes, labels ops/sales/finance/support/warehouse/founders/drivers/you?) — reuse v1 content
- `STORY_BEATS: StoryBeat[]` `{id,index,title,line,start,end}` with ids throw/catch/analysis/build/ship, windows `[.15,.31] [.31,.44] [.44,.62] [.62,.8] [.8,.93]`; `STORY_DURATION = 100`; `STORY_SUMMARY`; `CATCH_WINDOW = [.22, .31]` (ball in flight, interactive)
- `TIME_WARPS = [{ at: .31, radius: .04, speed: .35 }]`

- [ ] Step 1: Tests: five beats in order, sequential indexes, non-overlapping inside 0–1, first beat ≥ .1; `CATCH_WINDOW` ends at the catch beat start; every `ANALYSED_LINES` index exists in `PROBLEM_LINES`.
- [ ] Step 2–4: FAIL → implement → PASS. Step 5: commit `feat(hero): scene layout and story beats`.

### Task 4: SVG scene with depth, shading and glass UI

**Files:** Create `src/components/hero/story-scene.tsx`

**Interfaces:** Consumes Tasks 2–3. Produces `StoryScene({ devName }: { devName: string })` rendering `<svg data-hero="svg">` containing `<g data-hero="layer-far|layer-mid|layer-near">` and these addressable nodes (all `data-hero`): `paper`, `paper-inner`, `sheet`, `sheet-shadow`, `sheet-content`, `creases-ball`, `creases-sheet`, `line-0..3`, `reveal-0..3`, `highlight-1..3`, `scribble`, `ball-blur` (feGaussianBlur), `trail-ghosts`, `tag`, `client`, `bubble`, `dev`, `you`, `shock`, `caught`, `editor`, `tab-spec`, `tab-build`, `spec`, `spec-reveal-0..6`, `build`, `build-reveal-0..5`, `terminal`, `term-0..2`, `progress`, `wipe`, `scan`, `token-0..2`, `user-line-0..7`, `user-fill-0..7`, `[data-hero-user]`, `[data-hero-bar]`, `vignette`.

Look requirements: paper = linear gradient + soft shadow filter (`feDropShadow` stdDev 18, opacity .5) + ruled lines + red margin; ball = same outline with radial-gradient fill + crease polylines; glass panels = `#121418` at .82 opacity, 1px gradient border, inner top highlight, 14px radius; far layer = dot grid + 3 large soft bokeh circles; near layer = 30 drifting dust specks and 2 out-of-focus foreground shapes (blurred); cursors = v1 arrow + name tag, `you` cursor in `#8ab4ff`.

- [ ] Step 1: Test (`story-scene.test.tsx`): renders `aria-hidden` svg; every id listed above resolves (loop over the list, `querySelector` not null).
- [ ] Step 2–4: FAIL → implement → PASS. Step 5: commit `feat(hero): layered SVG scene`.

### Task 5: Master timeline

**Files:** Create `src/components/hero/story-timeline.ts`, test `story-timeline.test.ts`

**Interfaces:**

- Produces `buildStoryTimeline({ root: HTMLElement, layout: "wide" | "narrow", viewport: { width: number; height: number } }): StoryController` where `StoryController = { timeline: gsap.core.Timeline; setViewport(v): void; ballScreen(): Point }`.
- Rig: `{ camera: Camera, paper: {x,y,rot,scale}, client: Point, dev: Point, blur: number }`; render pass sets `transform` on the three layers via `layerTransform`, paper/cursors, and `stdDeviation` on `ball-blur` (`"${blur} ${blur*0.2}"`).
- Beats (story units): writing auto-plays on load (not on the timeline); scribble 12–15; crumple 15–19; throw 19–31 along `THROW_PATH` with blur ramp up to 9 mid-flight then 0 at catch, camera tilt −3° → 0, zoom 1 → .9 → 1.25; catch at 31 (shockwave, `caught()`, zoom punch 1.25→1.35→1.2); unfold 36–41; analysis 42–60 (highlights, editor slide-in, tokens fly, spec types); build 62–74 (code, terminal, progress); deploy wipe 74–78; ship 80–93 (pull back zoom .55, users light, client bubble); outro 93–100. Captions/rail as v1.
- Missing element → throw `Error('Hero story: missing element [data-hero="…"]')`.

- [ ] Step 1: Tests: builds for wide and narrow with duration 100; `progress(1)` then `progress(0)` restores layer transforms and paper transform exactly; `ballScreen()` at progress .25 differs from .2; resizing via `setViewport` changes the mid-layer transform; removing `[data-hero="tag"]` throws the named error.
- [ ] Step 2–4: FAIL → implement → PASS. Step 5: commit `feat(hero): master story timeline with parallax camera`.

### Task 6: Interactive catch

**Files:** Create `src/components/hero/use-catch-interaction.ts`, test `catch-interaction.test.ts`

**Interfaces:**

- Pure: `isInCatchWindow(t: number): boolean` (uses `CATCH_WINDOW`), `isCatch(pointer: Point, ball: Point, radius = 70): boolean`.
- Hook: `useCatchInteraction({ stage: RefObject<HTMLElement>, getStoryTime: () => number, getBall: () => Point, onCatch: () => void }): void` — on `pointermove` inside the stage during the window, move `[data-hero="you"]` to the pointer and show it; hide on `pointerleave` or outside the window; on `pointerdown` (mouse or touch) inside the window with `isCatch` → call `onCatch` once per scroll pass (resets when t < window start).

- [ ] Step 1: Tests: window boundaries inclusive start / exclusive end; `isCatch` at 69px true, 71px false; hook with a fake stage: pointerdown inside window + near ball calls `onCatch` once, a second pointerdown doesn't, scrolling back before the window and catching again calls it again; outside window never calls.
- [ ] Step 2–4: FAIL → implement → PASS. Step 5: commit `feat(hero): visitor can catch the ball`.

### Task 7: Hero section, overlays, wiring

**Files:** Create `src/components/hero/dev-hero.tsx`, test `dev-hero.test.tsx`; Modify `src/app/page.tsx` (render `<DevHero />` above `#work`)

**Interfaces:** Consumes Tasks 3–6. Produces `DevHero()`.

- Section `h-[680svh] motion-reduce:h-svh`, sticky stage; DOM `h1` = `author.name` (visible), role, tagline "I catch the problems people throw away — and ship them back as working software."; captions top-left; rail right; outro → `#work`; ScrollTrigger scrub .8 with `warpProgress(TIME_WARPS)` mapping (`timeline.progress(warpProgress(self.progress))`); `gsap.matchMedia` for reduced motion and `(max-aspect-ratio: 4/5)` narrow; `ResizeObserver` → `setViewport`; catch → caption `[data-hero="caption-catch"]` line text swaps to the Global Constraints text and a "you caught it" flourish toast shows for 1.6s.

- [ ] Step 1: Tests: h1 = author name and labels the region; summary text sr-only; each beat line rendered; outro link `#work`; after simulating `onCatch`, catch caption reads "Nice catch. Now watch what I do with it."
- [ ] Step 2–4: FAIL → implement → PASS.
- [ ] Step 5: `pnpm check` and `pnpm build` green; browser check at 1440×900 and 390×844 at progress 0, .2, .3, .5, .7, .9, 1 and reduced-motion; fix framing issues found.
- [ ] Step 6: Update `docs/design/2026-11-20-dev-hero.md` to describe v2; commit `feat(hero): upgraded vector hero`.
