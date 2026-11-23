"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";

const CX = 400;
const CY = 225;
/** Portal radius; each scene hides the next one inside this circle. */
const R = 78;
/** How much bigger each scene is than the one inside it. */
const Z = 6;
/** The next scene is clipped to R × Z so it covers the whole frame (corners included) when it takes over. */
const CLIP = R * Z;
const BG = <rect x="-2000" y="-2000" width="4800" height="4450" />;

type Scene = { caption: string; art: ReactNode };

/** The scenes, in order; the last one leads back into the first. */
function buildScenes(name: string): Scene[] {
  return [
    {
      caption: `hi, I'm ${name.toLowerCase()}`,
      art: (
        <>
          <g fill="#0b0b0e">{BG}</g>
          <text
            x={CX}
            y="95"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="60"
            fill="#ffd9b0"
          >
            hi, I&apos;m {name}
          </text>
          <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="#ff8a3d" strokeWidth="4" />
          <text
            x={CX}
            y="390"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="14"
            fill="#999"
            letterSpacing="3"
          >
            MUSIC · GAMES · TRIPS · POEMS
          </text>
        </>
      ),
    },
    {
      caption: "the music",
      art: (
        <>
          <g fill="#2a1408">{BG}</g>
          <ellipse
            cx={CX}
            cy={CY + 40}
            rx="330"
            ry="260"
            fill="#c46a22"
            stroke="#7a3a10"
            strokeWidth="8"
          />
          <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="#f3d7a8" strokeWidth="8" />
          {[-15, -9, -3, 3, 9, 15].map((d) => (
            <line
              key={d}
              x1="-2000"
              y1={CY + d}
              x2="2800"
              y2={CY + d}
              stroke="#eee"
              strokeWidth="1.4"
              opacity=".8"
            />
          ))}
        </>
      ),
    },
    {
      caption: "the hall of fame",
      art: (
        <>
          <g fill="#120a2a">{BG}</g>
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={i}
              x1="-2000"
              y1={i * 36}
              x2="2800"
              y2={i * 36}
              stroke="#7c4dff"
              strokeOpacity=".25"
            />
          ))}
          <text
            x={CX}
            y="70"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontWeight="700"
            fontSize="30"
            fill="#b79bff"
            letterSpacing="4"
          >
            HALL OF FAME
          </text>
          <text
            x={CX}
            y="110"
            textAnchor="middle"
            fontFamily="ui-monospace, monospace"
            fontSize="15"
            fill="#ffd54a"
            letterSpacing="3"
          >
            INSERT COIN
          </text>
          <circle cx={CX} cy={CY} r={R + 14} fill="#ffd54a" />
          <circle cx={CX} cy={CY} r={R + 6} fill="#e0a800" />
        </>
      ),
    },
    {
      caption: "the trips",
      art: (
        <>
          <g fill="#e9dcb8">{BG}</g>
          {Array.from({ length: 10 }, (_, i) => (
            <path
              key={i}
              d={`M-2000 ${i * 50} C 0 ${i * 50 - 30} 600 ${i * 50 + 30} 2800 ${i * 50}`}
              fill="none"
              stroke="#b9a777"
            />
          ))}
          <path
            d={`M90 400 C 160 340 200 320 ${CX - 70} ${CY + 40}`}
            fill="none"
            stroke="#c0392b"
            strokeWidth="4"
            strokeDasharray="9 7"
          />
          <circle cx="90" cy="400" r="8" fill="#c0392b" />
          <circle cx={CX} cy={CY} r={R + 12} fill="none" stroke="#5a4a2a" strokeWidth="6" />
          <text
            x={CX}
            y="80"
            textAnchor="middle"
            fontFamily="Caveat, cursive"
            fontSize="48"
            fill="#5a4a2a"
          >
            places I&apos;ve been
          </text>
        </>
      ),
    },
    {
      caption: "the poems",
      art: (
        <>
          <g fill="#f6efe0">{BG}</g>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={i} x1="-2000" y1={i * 30} x2="2800" y2={i * 30} stroke="#a9c6e8" />
          ))}
          <text x="60" y="78" fontFamily="Caveat, cursive" fontSize="34" fill="#2a2a44">
            rain doesn&apos;t ask,
          </text>
          <text x="60" y="128" fontFamily="Caveat, cursive" fontSize="34" fill="#2a2a44">
            it just arrives —
          </text>
          <circle cx={CX} cy={CY} r={R + 5} fill="#1a1a2e" />
          <path d={`M${CX + 60} ${CY + 60} q 26 28 8 52 q -14 -22 -8 -52`} fill="#1a1a2e" />
        </>
      ),
    },
  ];
}

/**
 * "Rabbit hole" hero: an endless zoom through your world. Press and hold to
 * fall in: your name's ring opens into a guitar's sound hole, then an arcade
 * coin, a trip map, a poem's ink blot — and back to your name, forever. It
 * drifts slowly on its own (unless reduced motion is on).
 */
export function RabbitHoleHero({ name = "Akash" }: { name?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wrap = useRef<HTMLElement>(null);
  const layers = useRef<(SVGGElement | null)[]>([]);
  const uses = useRef<(SVGUseElement | null)[]>([]);
  const scenes = useMemo(() => buildScenes(name), [name]);
  const [caption, setCaption] = useState(scenes[0]?.caption ?? "");

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let t = 0;
    let holding = false;
    let frame = 0;
    let lastScene = -1;

    const down = () => {
      holding = true;
    };
    const up = () => {
      holding = false;
    };
    const loop = () => {
      t += holding ? 0.022 : reduced ? 0 : 0.0035;
      const k = Math.floor(t);
      const f = t - k;
      for (let j = 0; j < 3; j++) {
        const s = Math.pow(Z, f - j);
        uses.current[j]?.setAttribute("href", `#${uid}-scene-${(k + j) % scenes.length}`);
        layers.current[j]?.setAttribute(
          "transform",
          `translate(${CX} ${CY}) scale(${s}) translate(${-CX} ${-CY})`,
        );
      }
      const scene = (k + (f > 0.55 ? 1 : 0)) % scenes.length;
      if (scene !== lastScene) {
        lastScene = scene;
        setCaption(scenes[scene]?.caption ?? "");
      }
      frame = requestAnimationFrame(loop);
    };

    el.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [scenes, uid]);

  return (
    <section
      ref={wrap}
      aria-label="An endless zoom through my world"
      className="relative h-full min-h-[32rem] w-full cursor-zoom-in touch-none overflow-hidden rounded-3xl bg-[#0b0b0e] select-none"
    >
      <svg
        viewBox="0 0 800 450"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          {scenes.map((scene, i) => (
            <g key={i} id={`${uid}-scene-${i}`}>
              {scene.art}
            </g>
          ))}
          <clipPath id={`${uid}-clip`} clipPathUnits="userSpaceOnUse">
            <circle cx={CX} cy={CY} r={CLIP} />
          </clipPath>
        </defs>
        {[0, 1, 2].map((j) => (
          <g
            key={j}
            ref={(node) => {
              layers.current[j] = node;
            }}
          >
            <g clipPath={j ? `url(#${uid}-clip)` : undefined}>
              <use
                ref={(node) => {
                  uses.current[j] = node;
                }}
                href={`#${uid}-scene-${j}`}
              />
            </g>
          </g>
        ))}
      </svg>
      <p
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 top-5 text-center font-['Caveat',cursive] text-4xl text-orange-200 [text-shadow:0_2px_14px_rgb(0_0_0/0.7)]"
      >
        {caption}
      </p>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center font-mono text-[11px] tracking-[0.15em] text-white/60 uppercase [text-shadow:0_1px_6px_rgb(0_0_0/0.8)]">
        press &amp; hold to fall in
      </p>
    </section>
  );
}
