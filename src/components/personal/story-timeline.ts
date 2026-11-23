"use client";

import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

import {
  DRIP,
  FRONT_SPOKES_ORIGIN,
  HOLE_CUT,
  REAR_SPOKES_ORIGIN,
  RULES,
  SCREEN_CENTER,
  STRING_CUTS,
  WHEEL_CUT,
} from "./art/cuts";
import { SCENES } from "./scenes";

gsap.registerPlugin(MorphSVGPlugin);

/** Story length in timeline units: each scene holds for 6 and cuts for 4. */
export const STORY_UNITS = SCENES.length * 10;

/** Where scene `i` starts on the timeline. */
const at = (i: number) => i * 10;

/**
 * The whole personal story as one paused GSAP timeline (scrubbed by scroll).
 * `root` is the sticky stage holding the `StoryArt` SVG, the captions and
 * the route line. Every tweened property starts from a `set`/`fromTo`, so a
 * rebuild (resize, rotate) never inherits stale state.
 */
export function buildPersonalTimeline(root: HTMLElement): gsap.core.Timeline {
  const q = gsap.utils.selector(root);
  const scene = (id: string) => q(`[data-scene="${id}"]`);
  const part = (name: string) => q(`[data-part="${name}"]`);
  const cut = (name: string) => q(`[data-cut="${name}"]`);

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut", duration: 1 } });

  // Starting state.
  tl.set(
    scene("room"),
    { opacity: 1, scale: 1, svgOrigin: `${SCREEN_CENTER.x} ${SCREEN_CENTER.y}` },
    0,
  )
    .set([scene("ride"), scene("guitar"), scene("poem"), scene("bake")], { opacity: 0 }, 0)
    .set([part("game-wrap"), part("pad-hands"), part("ink-drop")], { opacity: 0 }, 0)
    .set([part("code"), part("type-hands")], { opacity: 1, y: 0 }, 0)
    .set(q('[data-part="poem-text"] text'), { opacity: 0 }, 0)
    .set([cut("wheel"), cut("strings"), cut("ink"), cut("glow")], { opacity: 0 }, 0)
    .set(q("[data-caption]"), { autoAlpha: 0 }, 0)
    .set(q("[data-intro]"), { autoAlpha: 1 }, 0);

  // Intro out, captions in and out with their scenes.
  tl.to(q("[data-intro]"), { autoAlpha: 0, duration: 1.2 }, 1.2);
  SCENES.forEach((_, i) => {
    const caption = q(`[data-caption="${i}"]`);
    tl.to(caption, { autoAlpha: 1, duration: 0.8 }, i === 0 ? 2 : at(i) + 0.6);
    if (i < SCENES.length - 1) tl.to(caption, { autoAlpha: 0, duration: 0.8 }, at(i) + 8.8);
    tl.to(q(`[data-route-dot="${i}"]`), { opacity: 1, scale: 1.3, duration: 0.5 }, at(i));
  });
  tl.fromTo(
    q("[data-route-fill]"),
    { scaleX: 0 },
    { scaleX: 1, ease: "none", duration: STORY_UNITS, transformOrigin: "left center" },
    0,
  );

  // 1 · coding: the code scrolls.
  tl.to(part("code"), { y: -40, ease: "none", duration: 6 }, 0);

  // Cut 1 → 2: the code becomes a racing game, the hands pick up the controller.
  tl.to([part("code"), part("type-hands")], { opacity: 0, duration: 1.5 }, at(0) + 6.2).to(
    [part("game-wrap"), part("pad-hands")],
    { opacity: 1, duration: 2 },
    at(0) + 7,
  );

  // 2 · gaming: the road rushes by.
  tl.fromTo(part("dashes"), { y: -10 }, { y: 30, ease: "none", duration: 6 }, at(1));

  // Cut 2 → 3: dive into the screen; the game's road becomes the real one.
  tl.to(scene("room"), { scale: 7, duration: 3.5, ease: "power2.in" }, at(1) + 6)
    .fromTo(
      scene("ride"),
      { opacity: 0, scale: 1.25, svgOrigin: "910 520" },
      { opacity: 1, scale: 1, duration: 2.4, ease: "power2.out" },
      at(1) + 8.6,
    )
    .to(scene("room"), { opacity: 0, duration: 0.5 }, at(1) + 9.5);

  // 3 · riding: wheels spin, the hills slide past.
  tl.fromTo(
    part("front-spokes"),
    { rotation: 0 },
    { rotation: 1440, svgOrigin: FRONT_SPOKES_ORIGIN, ease: "none", duration: 11.4 },
    at(1) + 8.6,
  )
    .fromTo(
      part("rear-spokes"),
      { rotation: 0 },
      { rotation: 1440, svgOrigin: REAR_SPOKES_ORIGIN, ease: "none", duration: 11.4 },
      at(1) + 8.6,
    )
    .fromTo(part("far"), { x: 0 }, { x: -60, ease: "none", duration: 10 }, at(2))
    .fromTo(part("mid"), { x: 0 }, { x: -140, ease: "none", duration: 10 }, at(2))
    .fromTo(part("near"), { x: 0 }, { x: -260, ease: "none", duration: 10 }, at(2))
    .fromTo(
      part("road-dashes"),
      { strokeDashoffset: 0 },
      { strokeDashoffset: -480, ease: "none", duration: 10 },
      at(2),
    );

  // Cut 3 → 4: the front wheel becomes the guitar's sound hole.
  tl.set(
    cut("wheel"),
    { opacity: 1, attr: { ...WHEEL_CUT, "stroke-width": 16, "fill-opacity": 0 } },
    at(2) + 6.2,
  )
    .to(
      cut("wheel"),
      {
        attr: { ...HOLE_CUT, "stroke-width": 3, "fill-opacity": 1 },
        duration: 3.2,
        ease: "power3.inOut",
      },
      at(2) + 6.2,
    )
    .to(scene("ride"), { opacity: 0, duration: 2 }, at(2) + 6.5)
    .to(scene("guitar"), { opacity: 1, duration: 1.8 }, at(2) + 7.6)
    .to(cut("wheel"), { opacity: 0, duration: 0.6 }, at(2) + 9.4);

  // 4 · guitar: strumming.
  tl.fromTo(
    part("strum"),
    { rotation: 0 },
    { rotation: -5, svgOrigin: "700 584", ease: "sine.inOut", duration: 1, repeat: 5, yoyo: true },
    at(3),
  );

  // Cut 4 → 5: the strings become the notebook's rules.
  tl.set(cut("strings"), { opacity: 1 }, at(3) + 6.2);
  q('[data-cut="strings"] line').forEach((line, i) => {
    const from = STRING_CUTS[i];
    const to = RULES[i];
    if (!from || !to) return;
    tl.fromTo(
      line,
      { attr: { ...from, stroke: "#e6e6ea" } },
      { attr: { ...to, stroke: "#9db7e0" }, duration: 3.2, ease: "power3.inOut" },
      at(3) + 6.2 + i * 0.08,
    );
  });
  tl.to(scene("guitar"), { opacity: 0, duration: 2 }, at(3) + 6.5)
    .to(scene("poem"), { opacity: 1, duration: 1.8 }, at(3) + 7.6)
    .to(cut("strings"), { opacity: 0, duration: 0.6 }, at(3) + 9.4);

  // 5 · writing: the poem appears line by line; a drop of ink falls.
  tl.to(q('[data-part="poem-text"] text'), { opacity: 1, duration: 0.9, stagger: 1 }, at(4) + 0.4)
    .fromTo(
      part("pen"),
      { x: 0 },
      { x: 14, ease: "sine.inOut", duration: 1, repeat: 3, yoyo: true },
      at(4) + 0.4,
    )
    .fromTo(
      part("ink-drop"),
      { opacity: 0, attr: { cx: 988, cy: 608 } },
      { opacity: 1, attr: { cx: 1040, cy: 640 }, duration: 1.2, ease: "power2.in" },
      at(4) + 4,
    )
    .to(cut("ink"), { opacity: 1, duration: 0.3 }, at(4) + 5.2)
    .to(part("ink-drop"), { opacity: 0, duration: 0.2 }, at(4) + 5.2);

  // Cut 5 → 6: the ink blot becomes the chocolate drip on the cake.
  tl.to(
    cut("ink"),
    { morphSVG: DRIP, fill: "#3f1d0b", duration: 3.4, ease: "power2.inOut" },
    at(4) + 6,
  )
    .to(scene("poem"), { opacity: 0, duration: 2 }, at(4) + 6.4)
    .to(scene("bake"), { opacity: 1, duration: 1.8 }, at(4) + 7.6)
    .to(cut("ink"), { opacity: 0, duration: 0.6 }, at(4) + 9.4);

  // 6 · baking: the flame flickers, then its glow opens into the end.
  tl.fromTo(
    part("flame"),
    { scaleY: 1 },
    {
      scaleY: 1.18,
      transformOrigin: "50% 100%",
      ease: "sine.inOut",
      duration: 0.6,
      repeat: 7,
      yoyo: true,
    },
    at(5),
  )
    .set(cut("glow"), { opacity: 0, attr: { r: 30 } }, at(5) + 6)
    .to(cut("glow"), { opacity: 1, attr: { r: 1500 }, duration: 4, ease: "power2.in" }, at(5) + 6);

  tl.set({}, {}, STORY_UNITS);
  return tl;
}
