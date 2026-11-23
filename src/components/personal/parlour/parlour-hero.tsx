import type { CSSProperties } from "react";

import { ParisWindow } from "./paris-window";
import { Turntable } from "./turntable";
import { DustMotes } from "./dust-motes";
import { GuitarOnWall } from "./guitar";
import { RoomLights } from "./room-lights";
import { MonaLisa } from "./wall-art";

/** Tone-on-tone cream damask: an ogee lattice with a fleuron in each cell. */
const DAMASK = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='180' viewBox='0 0 120 180'>
<g fill='none' stroke='#c9b796' stroke-opacity='.5' stroke-width='1.1'>
<path d='M60 0 C22 28 22 62 0 90 C22 118 22 152 60 180 C98 152 98 118 120 90 C98 62 98 28 60 0 Z'/>
<path d='M60 22 C48 34 48 46 60 52 C72 46 72 34 60 22 Z'/>
<path d='M60 128 C48 140 48 152 60 158 C72 152 72 140 60 128 Z'/>
</g>
<g fill='#cdbb98' fill-opacity='.42'>
<path d='M60 64 C51 75 50 86 60 96 C70 86 69 75 60 64 Z'/>
<path d='M60 96 C49 91 39 95 36 104 C47 105 54 102 60 96 Z'/>
<path d='M60 96 C71 91 81 95 84 104 C73 105 66 102 60 96 Z'/>
<circle cx='60' cy='108' r='3'/>
<path d='M60 112 L55 125 L60 121 L65 125 Z'/>
<circle cx='0' cy='0' r='4'/><circle cx='120' cy='0' r='4'/><circle cx='0' cy='180' r='4'/><circle cx='120' cy='180' r='4'/>
</g></svg>`;

const GRAIN = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .18  0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='.16'/></svg>`;

const svgUrl = (svg: string) =>
  `url("data:image/svg+xml;utf8,${svg.replace(/\n/g, "").replace(/#/g, "%23")}")`;

const WALL: CSSProperties = {
  backgroundColor: "#ece2cf",
  backgroundImage: `${svgUrl(GRAIN)}, ${svgUrl(DAMASK)}`,
};

const FLOOR: CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(0 0 0 / 0.35), rgb(0 0 0 / 0.1) 40%, rgb(0 0 0 / 0.3)), repeating-linear-gradient(90deg, #4a2f1c 0 118px, #2a1a0f 118px 120px, #553621 120px 236px, #2a1a0f 236px 238px, #4f321e 238px 360px, #2a1a0f 360px 362px)",
};

/** How tall the floor is, so the side table can stand on it. */
const FLOOR_H = "7vh";

/** Panelling below a chair rail, a skirting board, then the floorboards. */
function LowerWall() {
  return (
    <div aria-hidden="true" className="absolute inset-x-0 bottom-0">
      <div className="h-3 bg-linear-to-b from-[#f8f1e2] via-[#e3d4b8] to-[#b9a682] shadow-[0_4px_8px_rgb(90_65_35/0.3)]" />
      <div className="flex h-[15vh] min-h-28 gap-6 bg-[#e2d4b9] px-6 py-6 sm:gap-10 sm:px-12">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[2px] shadow-[inset_2px_2px_0_rgb(255_250_240/0.75),inset_-2px_-2px_0_rgb(150_125_85/0.4),0_0_0_6px_#e8dcc4,0_0_0_7px_rgb(150_125_85/0.3)] ${i > 3 ? "hidden lg:block" : i > 1 ? "hidden sm:block" : ""}`}
          />
        ))}
      </div>
      <div className="h-4 bg-linear-to-b from-[#f2e8d4] to-[#cdbb98] shadow-[0_3px_5px_rgb(60_40_20/0.35)]" />
      <div style={{ ...FLOOR, height: FLOOR_H }} />
    </div>
  );
}

/**
 * The personal side's opening: a vintage parlour. Cream damask, panelling, a
 * window onto Pissarro's Paris dead centre with a cat on the sill, and a
 * turntable on a side table under the Mona Lisa, records on the wall above it.
 */
export function ParlourHero() {
  return (
    <section
      aria-labelledby="parlour-title"
      className="relative isolate flex min-h-[max(100svh,54rem)] flex-col items-center gap-16 overflow-hidden px-6 pt-28 text-[#2b2118] sm:px-10 xl:block xl:p-0"
      style={WALL}
    >
      {/* light spilling from the window, and the room's corners in shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_46%_at_50%_48%,rgb(255_249_232/0.65),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_45%,transparent_55%,rgb(90_65_35/0.22)_100%)]"
      />

      <LowerWall />

      <DustMotes />

      {/* the window, dead centre of the room */}
      <div className="relative z-10 mt-10 xl:absolute xl:top-[45%] xl:left-1/2 xl:mt-0 xl:-translate-x-1/2 xl:-translate-y-1/2">
        <ParisWindow />
      </div>

      {/* the headline, across the top of the wall */}
      <div className="relative z-10 mt-6 max-w-xl text-center xl:absolute xl:inset-x-0 xl:top-[6rem] xl:mx-auto xl:mt-0 xl:max-w-none">
        <h1
          id="parlour-title"
          className="font-[family-name:var(--font-serif)] text-[clamp(2.6rem,7vw,3.2rem)] leading-[1.02] font-medium tracking-[-0.01em] text-[#2b2118] xl:text-[clamp(2.4rem,3vw,3.4rem)]"
        >
          Coder by day, <span className="text-[#8a5f24] italic">poet by night.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-[#5a4a38] xl:max-w-none">
          I build software, ride a Himalayan, play my F310, write poems, and bake far too many
          desserts.
        </p>
      </div>

      {/* the left wall: the F310 on its hanger, standing clear of the panelling */}
      <GuitarOnWall className="absolute bottom-[calc(22vh+4rem)] left-[3vw] z-10 hidden h-[min(28rem,calc(78vh-14rem))] min-[1800px]:left-[4.5vw] min-[1800px]:h-[min(38rem,calc(78vh-14rem))] xl:block 2xl:left-[5vw] 2xl:h-[min(32rem,calc(78vh-14rem))]" />

      {/* the record corner stands on the floor */}
      <div className="relative z-10 mt-auto flex flex-col items-center pb-[calc(7vh-0.25rem)] min-[1800px]:right-[4vw] min-[1800px]:scale-100 min-[2200px]:right-[9vw] xl:absolute xl:right-[1.5vw] xl:bottom-[calc(7vh-0.25rem)] xl:mt-0 xl:origin-bottom-right xl:scale-[0.7] xl:pb-0 2xl:right-[4vw] 2xl:scale-[0.85]">
        <MonaLisa className="mb-8 hidden h-[clamp(9rem,calc(93vh-52rem),22rem)] xl:block" />
        <Turntable />
      </div>

      <RoomLights />
    </section>
  );
}
