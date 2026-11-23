"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef, useState, type CSSProperties } from "react";

gsap.registerPlugin(useGSAP);

/** Freshly painted joinery with a soft light from the upper left. */
const JOINERY: CSSProperties = {
  background: "linear-gradient(160deg, #fffdf8 0%, #f4ecdd 45%, #e3d6be 100%)",
};

/** A painted timber member: the joinery colour with a crisp edge and a little depth. */
const MEMBER =
  "shadow-[0_1px_2px_rgb(60_40_20/0.35),inset_0_1px_0_#fff,inset_0_-1px_0_rgb(120_95_60/0.25)]";

const BRASS = "bg-linear-to-b from-[#f6dc95] via-[#b8904a] to-[#6e4e20]";

/** How far the lower sash slides up, as a share of its own height. */
const LIFT = -86;

/** Carriages on the boulevard: lane (0 = coming toward us, 1 = going away), start delay, colour. */
const CARRIAGES = [
  { lane: 0, delay: 0, color: "#2e2620" },
  { lane: 1, delay: 3.5, color: "#3a3028" },
  { lane: 0, delay: 6.2, color: "#4a3a2c" },
  { lane: 1, delay: 9, color: "#2a2420" },
  { lane: 0, delay: 11.8, color: "#3e3226" },
] as const;

const reducedMotion = () =>
  Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

/** Clear glass: almost invisible, just a faint sky reflection across it. */
function Glass({ className }: { className: string }) {
  return (
    <span
      className={`absolute ${className} bg-[linear-gradient(115deg,rgb(255_255_255/0.2)_0%,transparent_26%,transparent_58%,rgb(255_255_255/0.1)_66%,transparent_76%)] shadow-[inset_0_1px_2px_rgb(60_40_20/0.35)]`}
    />
  );
}

/**
 * One sash of a double-hung window. The upper one is a single clear pane; the
 * lower one has three lites across, a bar near the bottom, and a brass lift.
 */
function Sash({ lower }: { lower: boolean }) {
  const rail = 11;
  const bottom = lower ? 26 : 9;
  return (
    <div
      data-sash={lower ? "lower" : "upper"}
      className={`absolute inset-x-0 h-[53%] ${lower ? "bottom-0 z-10 drop-shadow-[0_-3px_4px_rgb(60_40_20/0.25)]" : "top-0"}`}
    >
      <Glass className="inset-0" />
      {/* stiles and rails */}
      <span className={`absolute inset-y-0 left-0 ${MEMBER}`} style={{ ...JOINERY, width: rail }} />
      <span
        className={`absolute inset-y-0 right-0 ${MEMBER}`}
        style={{ ...JOINERY, width: rail }}
      />
      <span
        className={`absolute inset-x-0 top-0 ${MEMBER}`}
        style={{ ...JOINERY, height: lower ? rail + 3 : rail }}
      />
      <span
        className={`absolute inset-x-0 bottom-0 ${MEMBER}`}
        style={{ ...JOINERY, height: bottom }}
      />
      {lower ? (
        <>
          {/* glazing bars: three lites across, with a low bar */}
          {[1, 2].map((col) => (
            <span
              key={col}
              className={`absolute -translate-x-1/2 ${MEMBER}`}
              style={{ ...JOINERY, left: `${(col * 100) / 3}%`, top: rail, bottom, width: 5 }}
            />
          ))}
          <span
            className={`absolute inset-x-0 ${MEMBER}`}
            style={{ ...JOINERY, bottom: bottom + 22, height: 4 }}
          />
          {/* the brass lift on the bottom rail */}
          <span className="absolute bottom-[8px] left-1/2 flex h-2.5 w-20 -translate-x-1/2 items-center justify-between">
            <span className={`size-2.5 rounded-full ${BRASS} shadow-[0_1px_2px_rgb(0_0_0/0.4)]`} />
            <span
              className={`mx-[-2px] h-1.5 flex-1 rounded-full ${BRASS} shadow-[0_2px_2px_rgb(0_0_0/0.35)]`}
            />
            <span className={`size-2.5 rounded-full ${BRASS} shadow-[0_1px_2px_rgb(0_0_0/0.4)]`} />
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Where each fold's edge sits at the rod, at the tie-back, and at the hem (0–100 across the drape). */
const foldEdge = (i: number, n: number) => ({
  top: (i / n) * 100,
  tie: 6 + (i / n) * 22,
  hem: (i / n) * 66,
});

/** Velvet folds hanging from the rod, gathered at the tie-back and flaring out below it. */
function CurtainFolds({ id }: { id: string }) {
  const n = 9;
  const down = (i: number) => {
    const { top, tie, hem } = foldEdge(i, n);
    return `M${top} 0 C${top} 110 ${tie} 170 ${tie} 232 C${tie} 290 ${hem} 340 ${hem} 400`;
  };
  const up = (i: number) => {
    const { top, tie, hem } = foldEdge(i, n);
    const prev = foldEdge(i - 1, n).hem;
    return `Q${(prev + hem) / 2} 409 ${hem} 400 C${hem} 340 ${tie} 290 ${tie} 232 C${tie} 170 ${top} 110 ${top} 0 Z`;
  };
  return (
    <>
      <defs>
        <linearGradient id={`${id}-crest`} x1="0" x2="1">
          <stop offset="0" stopColor="#4f1a21" />
          <stop offset=".5" stopColor="#93404a" />
          <stop offset="1" stopColor="#561d24" />
        </linearGradient>
        <linearGradient id={`${id}-trough`} x1="0" x2="1">
          <stop offset="0" stopColor="#3a1217" />
          <stop offset=".5" stopColor="#682730" />
          <stop offset="1" stopColor="#3d141a" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".3" />
          <stop offset=".1" stopColor="#000" stopOpacity="0" />
          <stop offset=".86" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".24" />
        </linearGradient>
      </defs>
      {Array.from({ length: n }, (_, i) => (
        <path
          key={i}
          d={`${down(i)} ${up(i + 1)}`}
          fill={`url(#${id}-${i % 2 ? "trough" : "crest"})`}
        />
      ))}
      <path d={`${down(0)} ${up(n)}`} fill={`url(#${id}-shade)`} />
      {/* the leading edge, with a fine gold braid */}
      <path
        d={down(n)}
        fill="none"
        stroke="#c9a35a"
        strokeOpacity=".75"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* the gold tie-back band */}
      <path d="M2 223 C14 218 30 219 36 227 L36 240 C30 232 14 231 2 236 Z" fill="#c9a35a" />
      <path
        d="M2 229 C14 224 30 225 36 233"
        fill="none"
        stroke="#8a6a2e"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}

/** A tied-back velvet drape hanging on rings from the rod. */
function Curtain({ side }: { side: "left" | "right" }) {
  return (
    <div
      data-curtain={side}
      aria-hidden="true"
      className={`pointer-events-none absolute -top-[3.05rem] bottom-[-3.5rem] z-20 w-[30%] ${side === "left" ? "-left-[32%] origin-top-left" : "-right-[32%] origin-top-right"}`}
    >
      <div data-sway className="size-full" style={{ transformOrigin: "50% 0" }}>
        <svg
          viewBox="0 0 100 410"
          preserveAspectRatio="none"
          className="size-full drop-shadow-[0_14px_14px_rgb(60_35_20/0.35)]"
          style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
        >
          <CurtainFolds id={`curtain-${side}`} />
        </svg>
      </div>
      {/* the brass holdback on the wall */}
      <span
        className={`absolute top-[58%] size-5 -translate-y-1/2 rounded-full ${BRASS} shadow-[0_2px_4px_rgb(0_0_0/0.4)] ${side === "left" ? "left-0" : "right-0"}`}
      />
    </div>
  );
}

/** A brass finial: a turned ball with a collar, at the end of the rod. */
function Finial({ side }: { side: "left" | "right" }) {
  return (
    <span className={`flex shrink-0 items-center ${side === "right" ? "flex-row-reverse" : ""}`}>
      <span className={`size-6 rounded-full ${BRASS} shadow-[0_3px_4px_rgb(0_0_0/0.35)]`} />
      <span className={`h-4 w-1.5 rounded-[2px] ${BRASS}`} />
    </span>
  );
}

/** A wall bracket: a round rose on the wall and a stem holding the rod. */
function Bracket({ className }: { className: string }) {
  return (
    <span className={`absolute -top-3 flex -translate-x-1/2 flex-col items-center ${className}`}>
      <span className={`size-4 rounded-full ${BRASS} shadow-[0_2px_3px_rgb(0_0_0/0.35)]`} />
      <span className={`-mt-0.5 h-3 w-1.5 ${BRASS}`} />
    </span>
  );
}

/** A proper brass curtain rod: finials, wall brackets, and a rod wider than the window. */
function Rod() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-[3.3rem] -right-[35%] -left-[35%] z-30 flex items-center"
    >
      <Bracket className="left-[9%]" />
      <Bracket className="left-1/2" />
      <Bracket className="left-[91%]" />
      <Finial side="left" />
      <span
        className={`relative h-3 flex-1 rounded-full ${BRASS} shadow-[0_4px_5px_rgb(60_40_20/0.35)]`}
      />
      <Finial side="right" />
    </div>
  );
}

/**
 * A Parisian sash window: through clear old glass, Pissarro's Boulevard
 * Montmartre (1897), with clouds drifting, carriages rolling and birds crossing.
 * Click it and the lower sash slides up, the drapes catch the breeze, and the
 * cat on the sill turns around to watch the street.
 */
export function ParisWindow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const busy = useRef(false);

  // The living view, the cat's breathing and the drapes' sway (unless reduced motion).
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const q = gsap.utils.selector(rootRef);
      gsap.fromTo(
        q("[data-painting]"),
        { scale: 1.1, xPercent: -1.5 },
        { scale: 1.16, xPercent: 1.5, duration: 32, ease: "sine.inOut", repeat: -1, yoyo: true },
      );
      q("[data-cloud]").forEach((cloud, i) => {
        gsap.fromTo(
          cloud,
          { xPercent: -140 },
          { xPercent: 420, duration: 46 + i * 14, ease: "none", repeat: -1, delay: -i * 17 },
        );
      });
      gsap.fromTo(
        q("[data-birds]"),
        { x: "-30%", y: "0%" },
        { x: "140%", y: "-30%", duration: 14, ease: "none", repeat: -1, repeatDelay: 6, delay: 2 },
      );
      gsap.to(q("[data-wing]"), {
        scaleY: -0.4,
        duration: 0.18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.05,
        transformOrigin: "50% 50%",
      });
      CARRIAGES.forEach((c, i) => {
        // perspective along the boulevard: tiny at the far end, larger as it nears
        const far = { left: "31%", top: "44%", scale: 0.25 };
        const near = { left: c.lane === 0 ? "24%" : "40%", top: "104%", scale: 1.6 };
        const [a, b] = c.lane === 0 ? [far, near] : [near, far];
        gsap.fromTo(q(`[data-carriage="${i}"]`), a, {
          ...b,
          duration: 13,
          ease: c.lane === 0 ? "power1.in" : "power1.out",
          repeat: -1,
          delay: c.delay,
        });
      });
      gsap.to(q("[data-cat-body]"), {
        scaleY: 1.012,
        duration: 1.7,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 100%",
      });
      gsap.to(q("[data-sway]"), {
        skewX: 0.5,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    },
    { scope: rootRef },
  );

  /** Lifts or lowers the sash, and turns the cat around with a little hop. */
  const toggle = () => {
    if (busy.current) return;
    busy.current = true;
    const next = !open;
    setOpen(next);
    const q = gsap.utils.selector(rootRef);
    const reduce = reducedMotion();
    const tl = gsap.timeline({ onComplete: () => void (busy.current = false) });

    // a little catch first, as old sashes do, then the slide
    tl.to(
      q("[data-sash='lower']"),
      { yPercent: next ? -3 : LIFT + 3, duration: reduce ? 0 : 0.18, ease: "power1.out" },
      0,
    )
      .to(
        q("[data-sash='lower']"),
        { yPercent: next ? LIFT : 0, duration: reduce ? 0 : 1.1, ease: "power3.inOut" },
        reduce ? 0 : 0.22,
      )
      .to(q("[data-daylight]"), { opacity: next ? 1 : 0, duration: 1.2 }, 0.3)
      .to(
        q("[data-curtain='left']"),
        { rotation: next ? 1.8 : 0, duration: 1.6, ease: "sine.out" },
        0.6,
      )
      .to(
        q("[data-curtain='right']"),
        { rotation: next ? -1.8 : 0, duration: 1.6, ease: "sine.out" },
        0.6,
      );

    const cat = q("[data-cat]");
    const turn = () => {
      gsap.set(q("[data-cat-face='front']"), { opacity: next ? 0 : 1 });
      gsap.set(q("[data-cat-face='back']"), { opacity: next ? 1 : 0 });
    };
    if (reduce) {
      tl.call(turn, [], 0.4);
      return;
    }
    tl.to(
      cat,
      {
        scaleY: 0.9,
        scaleX: 1.05,
        duration: 0.12,
        ease: "power2.out",
        transformOrigin: "50% 100%",
      },
      0.7,
    )
      .to(cat, { y: -26, scaleY: 1.04, scaleX: 0.97, duration: 0.2, ease: "power2.out" }, 0.82)
      .to(cat, { scaleX: 0.06, duration: 0.09, ease: "power1.in" }, 0.95)
      .call(turn, [], 1.04)
      .to(cat, { scaleX: 1, duration: 0.11, ease: "power1.out" }, 1.04)
      .to(cat, { y: 0, scaleY: 1, duration: 0.18, ease: "power2.in" }, 1.15)
      .to(cat, { scaleY: 0.94, scaleX: 1.04, duration: 0.08, ease: "power1.out" }, 1.33)
      .to(cat, { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" }, 1.41);
  };

  return (
    <div
      ref={rootRef}
      className="relative w-[min(34rem,62vw)] min-[1800px]:w-[40rem] xl:w-[28rem] 2xl:w-[36rem]"
    >
      <Rod />
      <Curtain side="left" />
      <Curtain side="right" />

      {/* the casing: two stepped mouldings, crisp against the wall */}
      <div
        className="relative rounded-[3px] p-[14px] shadow-[0_0_0_1px_rgb(120_95_60/0.4),0_40px_60px_-28px_rgb(70_45_20/0.55),0_12px_20px_-12px_rgb(70_45_20/0.3),inset_0_1px_0_#fff,inset_0_-2px_0_rgb(120_95_60/0.3)]"
        style={JOINERY}
      >
        <div
          className="rounded-[2px] p-[10px] shadow-[inset_0_2px_4px_rgb(120_95_60/0.45),inset_0_-1px_0_#fff,0_0_0_1px_rgb(120_95_60/0.25)]"
          style={JOINERY}
        >
          {/* the opening: the view behind, then the two sashes */}
          <div className="relative aspect-[7/5] w-full overflow-hidden shadow-[0_0_0_1px_rgb(120_95_60/0.35)]">
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[#c9c3b4]">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
              <img
                data-painting
                src="/personal/paris-1897.webp"
                alt=""
                className="absolute inset-0 size-full object-cover"
                draggable={false}
              />
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  data-cloud
                  className="absolute h-[18%] w-[38%] rounded-full bg-white/45 mix-blend-screen blur-xl"
                  style={{ top: `${2 + i * 9}%`, left: 0 }}
                />
              ))}
              {CARRIAGES.map((c, i) => (
                <span
                  key={i}
                  data-carriage={i}
                  className="absolute h-[3.4%] w-[2.6%] -translate-x-1/2 rounded-[40%] opacity-80 blur-[0.6px]"
                  style={{ background: c.color, top: "44%", left: "31%" }}
                />
              ))}
              <span data-birds className="absolute top-[14%] left-0 block w-[16%]">
                <svg
                  viewBox="0 0 60 24"
                  className="w-full"
                  fill="none"
                  stroke="#3a3530"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  {[
                    [8, 12],
                    [22, 6],
                    [34, 14],
                    [48, 8],
                  ].map(([x, y]) => (
                    <path
                      key={`${x}-${y}`}
                      data-wing
                      d={`M${x! - 5} ${y} Q${x! - 2.5} ${y! - 3} ${x} ${y} Q${x! + 2.5} ${y! - 3} ${x! + 5} ${y}`}
                    />
                  ))}
                </svg>
              </span>
              {/* fresh daylight when the sash is up */}
              <span
                data-daylight
                className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_70%,rgb(255_250_235/0.3),transparent)] opacity-0"
              />
            </div>

            <div aria-hidden="true" className="absolute inset-0">
              <Sash lower={false} />
              <Sash lower />
            </div>
            {/* the reveal's shadowed edges, over everything in the opening */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 shadow-[inset_0_6px_8px_-4px_rgb(50_35_20/0.45),inset_6px_0_8px_-5px_rgb(50_35_20/0.3),inset_-6px_0_8px_-5px_rgb(50_35_20/0.3)]"
            />

            <button
              type="button"
              onClick={toggle}
              aria-pressed={open}
              aria-label={open ? "Close the window" : "Open the window onto Paris, 1897"}
              className="absolute inset-0 z-30 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#8a5426]"
            />
          </div>
        </div>
      </div>

      {/* the sill: a deep stool and an apron below it */}
      <div
        aria-hidden="true"
        className="relative -mx-[6%] h-6 rounded-[3px] shadow-[0_0_0_1px_rgb(120_95_60/0.35),0_18px_22px_-12px_rgb(70_45_20/0.6),inset_0_2px_0_#fff,inset_0_-4px_5px_rgb(120_95_60/0.3)]"
        style={JOINERY}
      />
      <div
        aria-hidden="true"
        className="relative -mx-[3%] h-3 rounded-b-[3px] shadow-[0_8px_10px_-6px_rgb(70_45_20/0.55)]"
        style={{ background: "linear-gradient(180deg,#e4d7bf,#cbbb9d)" }}
      />

      {/* the cat on the sill */}
      <div
        data-cat
        aria-hidden="true"
        className="pointer-events-none absolute right-[5%] bottom-[30px] z-30 h-[50%] w-auto"
      >
        <div data-cat-body className="relative h-full">
          <span className="absolute -bottom-1 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-[50%] bg-[rgb(60_40_20/0.35)] blur-[3px]" />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
          <img
            data-cat-face="front"
            src="/personal/cat-front.webp"
            alt=""
            className="relative h-full w-auto"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- static export serves images as-is */}
          <img
            data-cat-face="back"
            src="/personal/cat-back.webp"
            alt=""
            className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-1/2 opacity-0"
            draggable={false}
          />
        </div>
      </div>

      <p className="absolute inset-x-0 top-full mt-16 text-center font-[family-name:var(--font-serif)] text-[11px] tracking-[0.32em] whitespace-nowrap text-[#6a5a45] uppercase">
        {open ? "Boulevard Montmartre, 1897 · tap to close" : "lift the window — Paris, 1897"}
      </p>
    </div>
  );
}
