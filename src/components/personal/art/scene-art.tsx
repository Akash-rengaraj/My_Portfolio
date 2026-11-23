import type { SceneId } from "../scenes";
import { Bake } from "./bake";
import { BLOT, CANDLE, FRAME, STRING_CUTS, WHEEL_CUT } from "./cuts";
import { GuitarScene } from "./guitar-scene";
import { Poem } from "./poem";
import { Ride } from "./ride";
import { Room } from "./room";

/** Shared gradients; `p` prefixes the ids so several SVGs can sit on one page. */
function Defs({ p }: { p: string }) {
  const linear = (id: string, stops: readonly [number, string][]) => (
    <linearGradient id={`${p}-${id}`} x1="0" y1="0" x2="0" y2="1">
      {stops.map(([offset, color]) => (
        <stop key={offset} offset={offset} stopColor={color} />
      ))}
    </linearGradient>
  );
  return (
    <defs>
      {linear("night", [
        [0, "#0b1026"],
        [1, "#1b2148"],
      ])}
      {linear("dawn", [
        [0, "#5b4a8a"],
        [0.55, "#f08a7e"],
        [1, "#ffd6a5"],
      ])}
      {linear("golden", [
        [0, "#3b2d5c"],
        [0.5, "#f4845f"],
        [1, "#f9c06b"],
      ])}
      {linear("lamp-room", [
        [0, "#17121f"],
        [1, "#2a2033"],
      ])}
      {linear("kitchen", [
        [0, "#4a2a1a"],
        [1, "#8a5634"],
      ])}
      <radialGradient id={`${p}-glow`}>
        <stop offset="0" stopColor="#7d96ff" stopOpacity=".35" />
        <stop offset="1" stopColor="#7d96ff" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-sun`}>
        <stop offset="0" stopColor="#fff1c9" stopOpacity=".9" />
        <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={`${p}-flame`}>
        <stop offset="0" stopColor="#ffe3a3" stopOpacity=".9" />
        <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

/** One scene as a still frame (the reduced-motion storyboard). */
export function SceneArt({ id, p }: { id: SceneId; p: string }) {
  return (
    <svg
      viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="block size-full"
      aria-hidden="true"
    >
      <Defs p={p} />
      {id === "code" || id === "game" ? <Room p={p} variant={id} /> : null}
      {id === "ride" ? <Ride p={p} /> : null}
      {id === "guitar" ? <GuitarScene p={p} /> : null}
      {id === "poem" ? <Poem p={p} /> : null}
      {id === "bake" ? <Bake p={p} /> : null}
    </svg>
  );
}

/**
 * Every scene layered for the animated story, plus the match-cut overlays.
 * Only the room shows until the timeline takes over.
 */
export function StoryArt({ p }: { p: string }) {
  return (
    <svg
      viewBox={`0 0 ${FRAME.width} ${FRAME.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="block size-full"
      aria-hidden="true"
    >
      <Defs p={p} />
      <g data-scene="room">
        <Room p={p} variant="both" />
      </g>
      <g data-scene="ride" opacity="0">
        <Ride p={p} />
      </g>
      <g data-scene="guitar" opacity="0">
        <GuitarScene p={p} />
      </g>
      <g data-scene="poem" opacity="0">
        <Poem p={p} />
      </g>
      <g data-scene="bake" opacity="0">
        <Bake p={p} />
      </g>

      {/* match-cut overlays */}
      <circle
        data-cut="wheel"
        {...WHEEL_CUT}
        fill="#21140a"
        fillOpacity="0"
        stroke="#111114"
        strokeWidth="16"
        opacity="0"
      />
      <g data-cut="strings" opacity="0">
        {STRING_CUTS.map((line, i) => (
          <line key={i} {...line} stroke="#e6e6ea" strokeWidth="1.6" />
        ))}
      </g>
      <path data-cut="ink" d={BLOT} fill="#1a1a2e" opacity="0" />
      <circle data-cut="glow" cx={CANDLE.cx} cy={CANDLE.cy} r="30" fill="#ffe3a3" opacity="0" />
    </svg>
  );
}
