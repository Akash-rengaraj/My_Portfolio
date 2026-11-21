/**
 * The hero's master timeline: one paused GSAP timeline over 0–174 "story
 * units" that tweens a plain-object rig; a single render pass writes the rig
 * to the DOM (parallax layers, paper, cursors, motion blur, ghost trail).
 */

import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import { addInvestigationTweens } from "./analysis-timeline";
import { localToWorld, worldToScreen, type Camera, type Point, type Viewport } from "./geometry";
import {
  BUILD_LINES,
  CLIENT_CURSOR,
  DEV_CURSOR,
  EDITOR,
  EDITOR_BOX,
  HANDWRITING,
  PAPER_OUTLINES,
  PAPER_STAGES,
  PROBLEM_LINES,
  SPEC_LINES,
  TERMINAL_LINES,
  THROW_PATH,
  USERS,
} from "./scene-layout";
import { BEAT_AT, STORY_BEATS, STORY_DURATION } from "./story-beats";
import {
  createRig,
  frameViewBox,
  frameViewport,
  rigTransforms,
  type Layout,
  type Rig,
} from "./story-rig";
import { TAG_OFFSET } from "./story-scene";

gsap.registerPlugin(MotionPathPlugin);

export interface StoryController {
  timeline: gsap.core.Timeline;
  /** Resize to a stage of `pixels` size and re-render. */
  setViewport: (pixels: Viewport) => void;
  /** The ball's position in stage pixels (for the interactive catch). */
  ballScreen: () => Point;
  /** Hand-write the problem on load (outside the scroll timeline). */
  playIntro: () => gsap.core.Timeline;
}

interface BuildOptions {
  root: HTMLElement;
  layout: Layout;
  viewport: Viewport;
}

/** Story-unit stamps of the main events (0–174). */
const AT = {
  scribble: 10,
  crumple: 13,
  throw: 17,
  catch: BEAT_AT.catch,
  unfold: 34,
  build: BEAT_AT.build,
  wipe: 146,
  ship: BEAT_AT.ship,
  outro: BEAT_AT.outro,
} as const;

/** Linear flight time between consecutive ghosts. */
const GHOST_LAG = 0.022;

/** Camera framings per layout; zoom is relative to the frame (1 = 1500 / 760 units across). */
const SHOTS: Record<Layout, Record<string, Camera>> = {
  wide: {
    writing: { x: 800, y: 470, zoom: 1.3, tilt: 0 },
    crumple: { x: 920, y: 440, zoom: 1.1, tilt: -3 },
    apex: { x: 1650, y: 270, zoom: 0.9, tilt: -1.5 },
    arrive: { x: 2540, y: 420, zoom: 1.25, tilt: 0 },
    caught: { x: 2560, y: 450, zoom: 1.2, tilt: 0 },
    understand: { x: 2980, y: 450, zoom: 0.95, tilt: 0 },
    brief: { x: 3330, y: 420, zoom: 1.05, tilt: 0 },
    whys: { x: 4030, y: 385, zoom: 1.28, tilt: 0 },
    swot: { x: 4830, y: 385, zoom: 1.28, tilt: 0 },
    decision: { x: 4460, y: 975, zoom: 1.2, tilt: 0 },
    wall: { x: 4200, y: 700, zoom: 0.5, tilt: 0 },
    build: { x: 6300, y: 480, zoom: 1.17, tilt: 0 },
    ship: { x: 6100, y: 500, zoom: 0.55, tilt: 0 },
    outro: { x: 4700, y: 640, zoom: 0.24, tilt: 0 },
  },
  narrow: {
    writing: { x: 800, y: 600, zoom: 1.19, tilt: 0 },
    crumple: { x: 860, y: 470, zoom: 1, tilt: -3 },
    apex: { x: 1650, y: 250, zoom: 0.58, tilt: -1.5 },
    arrive: { x: 2540, y: 440, zoom: 1.05, tilt: 0 },
    caught: { x: 2560, y: 450, zoom: 1.22, tilt: 0 },
    understand: { x: 2550, y: 480, zoom: 1.27, tilt: 0 },
    brief: { x: 3420, y: 420, zoom: 1.2, tilt: 0 },
    whys: { x: 4180, y: 410, zoom: 1.12, tilt: 0 },
    swot: { x: 4980, y: 410, zoom: 1.2, tilt: 0 },
    decision: { x: 4580, y: 1000, zoom: 1.06, tilt: 0 },
    wall: { x: 4200, y: 700, zoom: 0.25, tilt: 0 },
    build: { x: 6300, y: 480, zoom: 1.05, tilt: 0 },
    ship: { x: 6200, y: 520, zoom: 0.38, tilt: 0 },
    outro: { x: 4700, y: 640, zoom: 0.13, tilt: 0 },
  },
};

/** Find one `[data-hero=name]` element inside `root`, or throw a named error. */
export function pick<T extends Element = SVGElement>(root: ParentNode, name: string): T {
  const el = root.querySelector<T>(`[data-hero="${name}"]`);
  if (!el) throw new Error(`Hero story: missing element [data-hero="${name}"]`);
  return el;
}

/** Rendered width of an SVG text line, with a font-metric fallback outside a layout engine. */
function measureText(el: SVGTextElement, fallbackChars: number, fontSize: number): number {
  try {
    const width = el.getComputedTextLength();
    if (width > 0) return width;
  } catch {
    // getComputedTextLength is unavailable without a real layout engine (jsdom).
  }
  return fallbackChars * fontSize * 0.45;
}

/**
 * Build the paused master timeline. Positions are story units (0–100), so
 * scroll progress maps straight onto STORY_BEATS.
 */
export function buildStoryTimeline({ root, layout, viewport }: BuildOptions): StoryController {
  const shots = SHOTS[layout];
  const shot = (name: string): Camera => {
    const camera = shots[name] ?? SHOTS.wide[name];
    if (!camera) throw new Error(`Hero story: unknown camera shot "${name}"`);
    return camera;
  };
  const rig: Rig = createRig(layout);
  let pixels = viewport;
  let frame = frameViewport(pixels, layout);

  const svg = pick<SVGSVGElement>(root, "svg");
  const layers = {
    far: pick(root, "layer-far"),
    mid: pick(root, "layer-mid"),
    near: pick(root, "layer-near"),
  };
  const vignette = pick(root, "vignette");
  const paper = pick(root, "paper");
  const paperInner = pick(root, "paper-inner");
  const paperMotion = pick(root, "paper-motion");
  const clientCursor = pick(root, "client");
  const devCursor = pick(root, "dev");
  const tag = pick(root, "tag");
  const blurEl = pick(root, "ball-blur");
  const blurFilterId = blurEl.parentElement?.id ?? "";
  const ghosts = Array.from(
    pick(root, "trail-ghosts").querySelectorAll<SVGGElement>("[data-hero-ghost]"),
  );

  // Flight path through THROW_PATH, sampled by eased flight time.
  const flightPath = MotionPathPlugin.arrayToRawPath(THROW_PATH, { curviness: 1.1 });
  MotionPathPlugin.cacheRawPathMeasurements(flightPath);
  const flightEase = gsap.parseEase("power1.inOut");
  const flightPoint = (time: number): Point => {
    const t = Math.min(1, Math.max(0, time));
    const p = MotionPathPlugin.getPositionOnPath(flightPath, flightEase(t));
    return { x: p.x, y: p.y };
  };
  const spinFrom = PAPER_STAGES.crumpled.rot;
  const spinTo = PAPER_STAGES.catch.rot;

  const applyFrame = () => {
    svg.setAttribute("viewBox", frameViewBox(frame));
    vignette.setAttribute("width", frame.width.toFixed(2));
    vignette.setAttribute("height", frame.height.toFixed(2));
    // The server frame is a 16:9 guess; show the scene only once it is framed.
    svg.style.opacity = "1";
  };

  const render = () => {
    const t = rigTransforms(rig, frame);
    layers.far.setAttribute("transform", t.far);
    layers.mid.setAttribute("transform", t.mid);
    layers.near.setAttribute("transform", t.near);
    paper.setAttribute("transform", t.paper);
    paperInner.setAttribute("transform", t.paperInner);
    clientCursor.setAttribute("transform", t.client);
    devCursor.setAttribute("transform", t.dev);
    tag.setAttribute(
      "transform",
      `translate(${rig.paper.x.toFixed(2)} ${(rig.paper.y - TAG_OFFSET).toFixed(2)})`,
    );

    const blur = rig.blur > 0.05 ? rig.blur : 0;
    blurEl.setAttribute("stdDeviation", `${blur.toFixed(2)} ${(blur * 0.2).toFixed(2)}`);
    if (blur > 0 && blurFilterId) paperMotion.setAttribute("filter", `url(#${blurFilterId})`);
    else paperMotion.removeAttribute("filter");

    const inFlight = rig.flight > 0 && rig.flight < 1;
    ghosts.forEach((ghost, i) => {
      const time = rig.flight - (i + 1) * GHOST_LAG;
      if (!inFlight || time <= 0) {
        ghost.style.opacity = "0";
        ghost.style.visibility = "hidden";
        return;
      }
      const p = flightPoint(time);
      const rot = spinFrom + (spinTo - spinFrom) * time;
      ghost.setAttribute(
        "transform",
        `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${rot.toFixed(1)})`,
      );
      ghost.style.visibility = "visible";
      ghost.style.opacity = (0.32 * (1 - i / ghosts.length) * Math.min(1, blur / 4)).toFixed(3);
    });
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" }, onUpdate: render });

  const cameraTo = (name: string, at: number, duration: number, ease = "sine.inOut") => {
    tl.to(rig.camera, { ...shot(name), duration, ease }, at);
  };

  const desk = PAPER_STAGES.desk;
  const unfolded = PAPER_STAGES.unfolded;
  const deskPoint = (local: Point) => localToWorld(local, desk, desk.rot);
  const unfoldedPoint = (local: Point) => localToWorld(local, unfolded, unfolded.rot);
  const baseline = (line: number) => HANDWRITING.firstBaseline + line * HANDWRITING.lineHeight;

  const lineWidths = PROBLEM_LINES.map((text, i) =>
    measureText(pick<SVGTextElement>(root, `line-${i}`), text.length, HANDWRITING.fontSize),
  );
  const lineWidth = (i: number) => lineWidths[i] ?? 0;

  /* ------------------------------------------------- 0–10 settle on the note */
  cameraTo("writing", 2, 8);

  /* ------------------------------------------- 10–13 frustration scribble */
  tl.to(
    pick(root, "scribble"),
    { strokeDashoffset: 0, duration: 2.6, ease: "power1.inOut" },
    AT.scribble,
  );
  tl.to(
    rig.client,
    {
      keyframes: [
        deskPoint({ x: -150, y: baseline(1) }),
        deskPoint({ x: 170, y: baseline(2) - 10 }),
        deskPoint({ x: -140, y: baseline(3) - 6 }),
        deskPoint({ x: 180, y: baseline(3) + 20 }),
      ],
      duration: 2.6,
    },
    AT.scribble,
  );

  /* -------------------------------------------------------- 13–17 crumple */
  for (const name of ["sheet", "sheet-shadow"]) {
    tl.to(
      pick(root, name),
      { attr: { points: PAPER_OUTLINES.ball }, duration: 3.5, ease: "power2.in" },
      AT.crumple,
    );
  }
  tl.to(
    pick(root, "sheet-content"),
    { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 50%", duration: 2.2, ease: "power2.in" },
    AT.crumple,
  );
  tl.to(pick(root, "creases-ball"), { autoAlpha: 1, duration: 1.2 }, AT.crumple + 2.2);
  tl.to(rig.paper, { ...PAPER_STAGES.crumpled, duration: 3.5, ease: "power2.in" }, AT.crumple);
  tl.to(rig.client, { ...CLIENT_CURSOR.rest, duration: 2.5, ease: "power2.out" }, AT.crumple + 0.5);
  cameraTo("crumple", AT.crumple, 4);

  /* ---------------------------------------------------------- 17–29 throw */
  const flightDuration = AT.catch - AT.throw;
  tl.to(
    rig,
    {
      flight: 1,
      duration: flightDuration,
      onUpdate: () => {
        const p = flightPoint(rig.flight);
        rig.paper.x = p.x;
        rig.paper.y = p.y;
      },
    },
    AT.throw,
  );
  tl.to(rig.paper, { rot: spinTo, duration: flightDuration }, AT.throw);
  tl.to(
    rig,
    {
      keyframes: [
        { blur: 9, duration: flightDuration / 2, ease: "power1.in" },
        { blur: 0, duration: flightDuration / 2, ease: "power2.out" },
      ],
    },
    AT.throw,
  );
  tl.to(tag, { autoAlpha: 1, duration: 1 }, AT.throw + 1);
  tl.to(tag, { autoAlpha: 0, duration: 1 }, AT.catch - 2);
  // The client recoils, then leaves.
  tl.to(rig.client, { x: "-=60", y: "+=40", duration: 1.2, ease: "power2.out" }, AT.throw);
  tl.to(clientCursor, { autoAlpha: 0, duration: 2 }, AT.throw + 1.5);
  tl.to(
    rig.camera,
    {
      keyframes: [
        { ...shot("apex"), duration: flightDuration * 0.5, ease: "sine.inOut" },
        { ...shot("arrive"), duration: flightDuration * 0.5, ease: "sine.inOut" },
      ],
    },
    AT.throw,
  );

  /* ---------------------------------------------------------- 29–34 catch */
  const streak = 3.6;
  tl.to(devCursor, { autoAlpha: 1, duration: 0.6 }, AT.catch - streak);
  tl.to(rig.dev, { ...DEV_CURSOR.catch, duration: streak, ease: "power3.out" }, AT.catch - streak);
  tl.to(
    pick(root, "dev-trail"),
    { strokeDashoffset: 0, duration: streak, ease: "power3.out" },
    AT.catch - streak,
  );
  tl.to(pick(root, "dev-trail"), { autoAlpha: 0, duration: 2 }, AT.catch);
  tl.to(rig.paper, { scale: 0.84, duration: 0.5, ease: "power2.out" }, AT.catch);
  tl.to(rig.paper, { scale: 1, duration: 1.2, ease: "back.out(3)" }, AT.catch + 0.5);
  tl.fromTo(
    pick(root, "shock"),
    { attr: { r: 20, "stroke-width": 6 }, autoAlpha: 1 },
    {
      attr: { r: 210, "stroke-width": 1 },
      autoAlpha: 0,
      duration: 3.5,
      ease: "power2.out",
      immediateRender: false,
    },
    AT.catch,
  );
  tl.to(pick(root, "caught"), { autoAlpha: 1, duration: 1 }, AT.catch + 0.4);
  tl.to(pick(root, "caught"), { autoAlpha: 0, duration: 1 }, AT.catch + 5);
  // Zoom punch on impact.
  tl.to(
    rig.camera,
    {
      keyframes: [
        { zoom: shot("arrive").zoom * 1.08, duration: 0.6, ease: "power2.out" },
        { ...shot("caught"), duration: 4.4, ease: "power2.inOut" },
      ],
    },
    AT.catch,
  );

  /* -------------------------------------------------------- 34–39 unfold */
  for (const name of ["sheet", "sheet-shadow"]) {
    tl.to(
      pick(root, name),
      { attr: { points: PAPER_OUTLINES.wrinkled }, duration: 4.5, ease: "power2.out" },
      AT.unfold,
    );
  }
  tl.to(
    rig.paper,
    {
      x: unfolded.x,
      y: unfolded.y,
      rot: unfolded.rot + 720,
      duration: 4.5,
      ease: "power2.out",
    },
    AT.unfold,
  );
  tl.to(pick(root, "creases-ball"), { autoAlpha: 0, duration: 1.2 }, AT.unfold);
  tl.to(pick(root, "creases-sheet"), { autoAlpha: 1, duration: 2 }, AT.unfold + 2.5);
  tl.to(
    pick(root, "sheet-content"),
    { autoAlpha: 1, scale: 1, duration: 2.5, ease: "power2.out" },
    AT.unfold + 2,
  );
  tl.to(pick(root, "scribble"), { autoAlpha: 0.28, duration: 2 }, AT.unfold + 2);
  tl.to(rig.dev, { ...DEV_CURSOR.aside, duration: 3, ease: "power2.inOut" }, AT.unfold + 0.5);

  /* ---------------------------------- 42–126 understand → root cause → decision */
  addInvestigationTweens({
    tl,
    pick: (name) => pick(root, name),
    cameraTo,
    dev: rig.dev,
    highlightEnd: (line) =>
      unfoldedPoint({ x: HANDWRITING.x + lineWidth(line), y: baseline(line) }),
    lineWidth,
  });

  /* -------------------------------------------------------- 126–146 build */
  cameraTo("build", AT.build, 6);
  tl.to(
    pick(root, "thread-4"),
    { strokeDashoffset: 0, duration: 3, ease: "power1.inOut" },
    AT.build - 1,
  );
  tl.fromTo(
    pick(root, "editor"),
    { autoAlpha: 0, y: 30 },
    { autoAlpha: 1, y: 0, duration: 3, ease: "power2.out" },
    AT.build + 2,
  );
  SPEC_LINES.forEach((_, i) => {
    tl.to(
      pick(root, `spec-reveal-${i}`),
      { attr: { width: 640 }, duration: 0.9 },
      AT.build + 4 + i * 0.9,
    );
  });
  tl.to(
    rig.dev,
    { x: EDITOR.cx + 230, y: EDITOR.cy + 70, duration: 4, ease: "power2.inOut" },
    AT.build + 3,
  );
  const code = AT.build + 11;
  tl.to(pick(root, "spec"), { autoAlpha: 0, duration: 1.5 }, code);
  tl.to(pick(root, "tab-spec"), { autoAlpha: 0, duration: 1 }, code);
  tl.to(pick(root, "tab-build"), { autoAlpha: 1, duration: 1 }, code + 0.5);
  tl.to(pick(root, "build"), { autoAlpha: 1, duration: 0.5 }, code + 1.5);
  BUILD_LINES.forEach((_, i) => {
    tl.to(pick(root, `build-reveal-${i}`), { attr: { width: 640 }, duration: 1 }, code + 2 + i);
  });
  tl.to(pick(root, "terminal"), { autoAlpha: 1, duration: 1 }, code + 4);
  TERMINAL_LINES.forEach((_, i) => {
    tl.fromTo(
      pick(root, `term-${i}`),
      { autoAlpha: 0, x: -12 },
      { autoAlpha: 1, x: 0, duration: 1, ease: "power2.out" },
      code + 4.5 + i * 1.5,
    );
  });
  tl.to(
    pick(root, "progress"),
    { attr: { width: EDITOR.width - 48 }, duration: 4.5, ease: "power1.inOut" },
    code + 4.5,
  );
  tl.to(
    rig.dev,
    { x: EDITOR.cx + 120, y: EDITOR.cy + 170, duration: 4, ease: "power2.inOut" },
    code + 2,
  );

  /* ------------------------------------------------ 146–150 deploy wipe */
  const scan = pick(root, "scan");
  tl.to(scan, { autoAlpha: 1, duration: 0.4 }, AT.wipe);
  tl.to(
    scan,
    { attr: { y: EDITOR_BOX.y + EDITOR.height - 3 }, duration: 4, ease: "power1.inOut" },
    AT.wipe,
  );
  tl.to(
    pick(root, "wipe"),
    { attr: { height: EDITOR.height }, duration: 4, ease: "power1.inOut" },
    AT.wipe,
  );
  tl.to(scan, { autoAlpha: 0, duration: 0.8 }, AT.wipe + 4);
  root.querySelectorAll<SVGRectElement>("[data-hero-bar]").forEach((bar, i) => {
    const height = Number(bar.dataset.heroBar);
    const bottom = Number(bar.dataset.heroBottom);
    tl.fromTo(
      bar,
      { attr: { height: 0, y: bottom } },
      { attr: { height, y: bottom - height }, duration: 1.6, ease: "power2.out" },
      AT.wipe + 2.5 + i * 0.25,
    );
  });
  tl.to(
    rig.dev,
    { x: EDITOR.cx + 390, y: EDITOR.cy + 260, duration: 4, ease: "power2.inOut" },
    AT.wipe + 1,
  );

  /* -------------------------------------------------------- 150–166 ship */
  cameraTo("ship", AT.ship, 10, "power2.inOut");
  tl.to(root.querySelectorAll("[data-hero-user]"), { autoAlpha: 1, duration: 1.5 }, AT.ship + 1);
  USERS.forEach((_, i) => {
    const at = AT.ship + 2 + i * 0.7;
    tl.to(
      pick(root, `user-line-${i}`),
      { strokeDashoffset: 0, duration: 1.6, ease: "power1.in" },
      at,
    );
    tl.to(pick(root, `user-fill-${i}`), { autoAlpha: 1, duration: 0.6 }, at + 1.6);
  });
  tl.set(rig.client, { ...CLIENT_CURSOR.return }, AT.ship + 6);
  tl.to(clientCursor, { autoAlpha: 1, duration: 1.2 }, AT.ship + 7);
  tl.fromTo(
    pick(root, "bubble"),
    { autoAlpha: 0, scale: 0.6, transformOrigin: "0% 100%" },
    { autoAlpha: 1, scale: 1, duration: 1.2, ease: "back.out(2)" },
    AT.ship + 8,
  );
  // Final pull-back: the whole journey, note to users, in one frame.
  cameraTo("outro", AT.outro - 2, STORY_DURATION - AT.outro + 1, "power2.inOut");

  // Pin the length so scroll fractions match STORY_BEATS exactly.
  tl.set({}, {}, STORY_DURATION);

  applyFrame();
  render();

  return {
    timeline: tl,
    setViewport: (next) => {
      pixels = next;
      frame = frameViewport(pixels, layout);
      applyFrame();
      render();
    },
    ballScreen: () => {
      const p = worldToScreen(rig.paper, rig.camera, 1, frame);
      const scale = pixels.width > 0 ? pixels.width / frame.width : 1;
      return { x: p.x * scale, y: p.y * scale };
    },
    playIntro: () => {
      const intro = gsap.timeline({ onUpdate: render, defaults: { ease: "none" } });
      PROBLEM_LINES.forEach((_, i) => {
        const start = deskPoint({ x: HANDWRITING.x, y: baseline(i) + 4 });
        const end = deskPoint({ x: HANDWRITING.x + lineWidth(i), y: baseline(i) + 4 });
        intro.to(rig.client, { ...start, duration: 0.25, ease: "power2.inOut" });
        intro.to(rig.client, { ...end, duration: 0.7 }, "<0.25");
        intro.to(
          pick(root, `reveal-${i}`),
          { attr: { width: lineWidth(i) + 12 }, duration: 0.7 },
          "<",
        );
      });
      intro.to(rig.client, { ...CLIENT_CURSOR.rest, duration: 0.8, ease: "power2.inOut" });
      return intro;
    },
  };
}

/**
 * Overlay tweens (captions, progress rail, intro/outro copy) for the HTML
 * that DevHero renders around the scene.
 */
export function addOverlayTweens(tl: gsap.core.Timeline, root: HTMLElement): void {
  tl.to(pick<HTMLElement>(root, "hint"), { autoAlpha: 0, duration: 2 }, 1);
  tl.to(
    pick<HTMLElement>(root, "intro"),
    // opacity only: the h1 must stay in the accessibility tree.
    { opacity: 0, y: -40, duration: 5, ease: "power1.in" },
    4,
  );

  for (const beat of STORY_BEATS) {
    const caption = pick<HTMLElement>(root, `caption-${beat.id}`);
    const start = beat.start * STORY_DURATION;
    const end = beat.end * STORY_DURATION;
    tl.fromTo(caption, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1.5 }, start);
    tl.to(caption, { autoAlpha: 0, y: -16, duration: 1.5 }, end - 1.5);
    tl.to(pick<HTMLElement>(root, `rail-${beat.id}`), { opacity: 1, duration: 1 }, start);
  }

  const railFill = pick<HTMLElement>(root, "rail-fill");
  STORY_BEATS.forEach((beat, i) => {
    const next = STORY_BEATS[i + 1];
    if (!next) return;
    tl.fromTo(
      railFill,
      { scaleY: i / (STORY_BEATS.length - 1) },
      {
        scaleY: (i + 1) / (STORY_BEATS.length - 1),
        duration: (next.start - beat.start) * STORY_DURATION,
        immediateRender: i === 0,
      },
      beat.start * STORY_DURATION,
    );
  });
  tl.fromTo(
    pick<HTMLElement>(root, "progress-mobile"),
    { scaleX: 0 },
    { scaleX: 1, duration: STORY_DURATION },
    0,
  );
  tl.fromTo(
    pick<HTMLElement>(root, "outro"),
    { autoAlpha: 0, y: 24 },
    { autoAlpha: 1, y: 0, duration: 3, ease: "power2.out" },
    BEAT_AT.outro + 1,
  );
  tl.to(pick<HTMLElement>(root, "fade"), { opacity: 1, duration: 4 }, STORY_DURATION - 4);
}
