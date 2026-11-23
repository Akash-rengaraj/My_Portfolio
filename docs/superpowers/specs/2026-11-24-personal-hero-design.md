# Personal portfolio — story hero (design)

Date: 2026-11-24 · Status: approved in conversation, pending sign-off on this document

## Intent and why

The site has a developer side (live) and a personal side (the header switch says "soon"). The
personal side is the owner's **portable gallery**: the person behind the CV, for recruiters,
friends, colleagues and new people who want to get to know him. Its opening must make people
stop scrolling, and it must not repeat the developer opening.

The owner's own idea: **a story told in the hero** that shows who he is off the clock. He codes,
games, rides his motorbike through the hills, plays guitar, writes poems and bakes desserts.

## Goals

- A scroll-played, pinned story of **six scenes**, each linked to the next by a **match cut**:
  a shared shape turns into the next scene, never a plain fade.
- One continuous illustrated character who clearly reads as the owner.
- A `/personal` page with the header switch made live in both directions.
- It must work on phones (the "portable" part) as well as on desktops.

## Non-goals (this build)

- The personal "rooms" (music, games hall of fame, trips map, poems, desserts). They come
  later, one at a time.
- Sound, video, photos, WebGL / 3D, AI-generated or paid art.
- Changes to the developer side, apart from the header switch.

## Anti-goals (failure even if it works)

- **Feeling like a sequel of the developer hero.** The developer hero is a camera move through
  one world. This one must read as a single unbroken animation, with its own palette and cast.
- **Trapping visitors.** A recruiter in a hurry must always be able to skip it.
- **Pointing at empty rooms.** No links or teasers to rooms that don't exist yet.
- **A character that doesn't look like him**, or that looks generic.

## Constraints

- Static export on Render (no server features), Next 16, React 19, TypeScript strict,
  Tailwind v4 (project CLAUDE.md).
- The vector (SVG) direction is the house style. Photoreal, WebGL, 3D and video were rejected
  for the developer hero.
- Use theme tokens for page chrome. The illustration has its own fixed palette in both themes.
- Respect `prefers-reduced-motion`.
- Owner's working rules: the builder makes the calls, and runs no tests, builds or browser
  checks unless asked (the pre-push hook runs typecheck and tests).

## Approaches considered

| Approach                                                                             | Trade-off                                                                                                                                                            | Verdict    |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **A. SVG scenes + GSAP timeline scrubbed by ScrollTrigger, MorphSVG for match cuts** | Same tooling as the developer hero: installed, proven smooth on this site, handles reduced motion. Risk of sameness, which the art, palette and match cuts mitigate. | **Chosen** |
| B. CSS scroll-driven animations only                                                 | No JS, but shape morphing isn't cross-browser and complex sequencing is impractical.                                                                                 | Rejected   |
| C. Canvas / pre-rendered frames                                                      | Heavy assets and an art pipeline, close to the rejected video direction.                                                                                             | Rejected   |

The owner chose **scroll to play** over "just watch" and "tap to turn the page".

## Decided

### The story (owner's scenes; match cuts and lines proposed and accepted)

| #   | Scene                                  | Handwritten line                  | Match cut into the next scene                                              |
| --- | -------------------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| 1   | Coding at the laptop, late night       | "I build things"                  | The code on screen becomes a **racing game** on the same screen            |
| 2   | Gaming, controller in hand             | "I play everything"               | Dive into the screen; the game's road becomes **a real hill road at dawn** |
| 3   | Riding the Himalayan through the hills | "I love travelling"               | The spinning front wheel becomes **the guitar's sound hole**               |
| 4   | Playing guitar at a roadside viewpoint | "I make music"                    | The strings become **notebook lines**                                      |
| 5   | Writing a poem                         | "I write"                         | An ink drop becomes **chocolate dripping down a cake**                     |
| 6   | Baking a dessert                       | "and I bake (and eat) everything" | The candle glow opens into the closing frame                               |

Listening to music, painting and trekking were considered and **dropped by the owner**.

### The character (owner's details, plus the builder's calls the owner delegated)

- **Owner:** skin between fair and dusky (warm wheatish), straight black hair **slicked back**,
  a **moustache**, no beard, **no glasses**.
- **Owner's gear:** a **black Royal Enfield Himalayan 450** (round headlamp, small windscreen,
  tank guards, spoked wheels, upright adventure stance) and a **Yamaha F310** acoustic guitar
  (natural wood top, tortoiseshell pickguard, round sound hole with a rosette). Draw both so
  they're recognisable, with **no brand logos or badges**.
- **Outfits (builder's call, shown to the owner):**
  - Scenes 1–2: charcoal oversized hoodie.
  - Scene 3: black riding jacket with thin orange piping, gloves, helmet with the visor up so
    the eyes and moustache show.
  - Scene 4: helmet off with the hair still slicked back, white tee, bike parked behind.
  - Scene 5: tee with an open flannel shirt, desk lamp, notebook and fountain pen.
  - Scene 6: apron over the tee, a flour smudge on the cheek, chocolate cake with one candle.

### Look and feel

- Colour journey: **night blue (1–2) → dawn pink (3) → golden hour (4) → lamplight (5) → warm
  kitchen (6)**, a mini day. It deliberately avoids the developer hero's palette.
- Handwriting (Caveat, `font-hand`) for the scene lines, as across the site; the orange accent
  stays the one accent in page chrome.

### Behaviour

- The section **pins** while the story plays, about **one viewport of scroll per scene**
  (roughly 5–6 screens in total), then releases into the closing frame.
- A **route line with one dot per scene** shows progress, echoing the Journey section's road.
- **"Skip to the end"** is always visible during the pin and jumps past the story.
- **Phones:** the same scenes, re-framed for portrait so the character fills the screen
  (crop or camera, not separate art), as the developer hero does for narrow screens.
- **Reduced motion:** no pin and no scrub. Show the six scenes as a stacked storyboard of
  still frames, each with its line.
- **Accessibility:** the story is also real text (each scene's line plus a short description)
  for screen readers; the illustration itself is `aria-hidden`.

### Pages and navigation

- New route **`/personal`**, added to the sitemap with its own metadata.
- Header switch: "personal" becomes a real link (the "soon" badge goes), and `aria-current`
  follows the page. Off the developer page, section links lead back to `/#…` (already built).
- **Closing frame:** a short sign-off with two links, **"see the developer side"** (`/`) and
  **"say hi"** (`/#contact`). No teasers for rooms that don't exist.

## Builder's calls (decided during the builder check; change if wrong)

- **Opening frame (before any scroll):** scene 1 is already visible, with the page's single
  `h1`, "Akash, off the clock", and a small "scroll" cue.
- **No site footer on `/personal`** for now: the footer's section links belong to the
  developer page. The closing frame ends the page.
- The stamp counter / passport stays on the developer page only.
- **No sound.** Browsers block autoplay with sound, and the guitar recording doesn't exist yet.
  It can be added later in the music room.

## Left to the builder

- Exact art, composition, poses and timings (scrub smoothing, beats inside each scene).
- Whether to reuse the developer hero's generic helpers (camera path, story rig, time warps)
  or keep the personal hero self-contained. Prefer reuse where it is generic.
- File layout under `src/components/personal/`, and tests for the pure logic (scene list,
  timing math, reduced-motion storyboard) plus component smoke tests, in the project's style.
