# Developer hero v2 — "the catch", vector edition (upgraded)

Approved 2026-11-20 ("do it").

## Intent

First thing developers and HR see. It must prove two things in seconds: **I'm a strong engineer**
and **I have taste**. The owner liked the first (vector, multiplayer-cursor) version best; v2 keeps
its story and language and makes it look and feel far more premium and memorable.

## Goals

- Story readable in ~2 s per beat: problem note → crumple & throw → catch → spec → code →
  product → users.
- Speaks developer: multiplayer cursors, `caught()`, `spec.ts`, terminal ticks.
- Razor sharp at any size (vector), fast to load, no AI imagery.
- One interactive "how did they do that?" moment.

## Non-goals / anti-goals

- No photoreal/AI images, no video, no WebGL (keep it crisp, light, reliable).
- No slideshow feel: one continuous camera move, never a cut.
- No generic stock feeling: cartoon blobs, flat boxes, tiny diagrams.

## Approaches considered

1. **Upgraded SVG world (chosen)**: rebuild v1 with layered parallax depth, camera zoom/tilt, motion
   blur, shading and glass UI; GSAP ScrollTrigger scrubs one master timeline.
2. Same story in WebGL: rejected; the owner disliked the 3D looks, and it's heavier and less crisp.
3. Canvas 2D: rejected; worse text crispness/accessibility than SVG, no gain.

## Design

- **Stage:** full-viewport sticky stage, dark (#0b0b0c), single accent (#ff5a1f), Geist + Geist
  Mono + Caveat (handwriting).
- **Depth:** scene split into layers (far grid/backdrop, mid scene, near foreground particles and
  bokeh). A camera `{x, y, zoom, tilt}` moves layers with different parallax factors; light
  vignette follows the action.
- **Paper:** shaded sheet (gradient, soft drop shadow, ruled lines, margin, handwriting written
  on load). Crumple = polygon morph into a lumpy ball with radial shading and crease strokes;
  unfold leaves visible creases.
- **Throw:** motion-blurred arc with ghost trail; client cursor recoils.
- **Catch:** owner's cursor streaks in, shockwave, `caught()`; scroll slows (time-warp) here.
- **Interactive catch:** while the ball is in flight, the visitor's pointer becomes a third
  cursor labelled "you". Clicking/tapping the ball triggers a catch flourish and swaps the caption
  to "Nice catch. Now watch what I do with it." Does not alter the scroll path.
- **Analysis → build:** highlighted phrases fly into a glass `spec.ts` panel; it becomes code,
  tests/build/deploy pass in a terminal, then a deploy wipe reveals the product.
- **Delivery:** camera pulls back; product connects to users who light up; client says
  "finally. it just works ✓"; outro hands off to `#work`.
- **Overlays:** chapter captions (01–05), commit-graph progress rail, outro link.
- **Accessibility:** real h1/tagline in DOM; scene `aria-hidden` with text summary;
  reduced-motion users get a static, unpinned hero.

## Constraints

- Static page, CSP unchanged (all self-hosted), GSAP already installed.
- Phones: own camera framings; tap-to-catch.
- Remove the WebGL hero code/deps that v2 replaces.

## Open (owner's input needed, not blocking the hero)

- Real projects (name, one-liner, stack, link) for the editor/dashboard copy and for the work grid
  the hero hands off to. Until provided, the product shown is the illustrative "OrderSync" example,
  clearly framed as a story, not a claimed project.
