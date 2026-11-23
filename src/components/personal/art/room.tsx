import { Hand, Head } from "./character";
import { LAPTOP_AT } from "./cuts";
import { Laptop } from "./props";

const HOODIE = "#3a3a46";
const JEANS = "#2b3a55";

const CODE_LINES = [
  [14, 60, "#ff7a59"],
  [30, 120, "#8ab4ff"],
  [30, 90, "#c3e88d"],
  [46, 140, "#c792ea"],
  [46, 70, "#ffcb6b"],
  [30, 110, "#89ddff"],
  [14, 40, "#ff7a59"],
  [14, 150, "#8ab4ff"],
  [30, 100, "#c3e88d"],
] as const;

/** Code on the laptop screen (scene 1). */
function Code() {
  return (
    <g data-part="code">
      {CODE_LINES.map(([x, w, c], i) => (
        <rect key={i} x={x} y={16 + i * 18} width={w} height="7" rx="3" fill={c} opacity=".9" />
      ))}
      <rect x="110" y="142" width="8" height="12" fill="#e6e6ea" data-part="caret" />
    </g>
  );
}

/** A racing game on the same screen (scene 2): road to the horizon, just like the ride. */
function Game({ p }: { p: string }) {
  return (
    <g data-part="game">
      <rect width="296" height="186" fill="#3b5e3f" />
      <rect width="296" height="82" fill={`url(#${p}-dawn)`} />
      <path d="M0 82 C60 64 120 76 170 66 C220 58 260 72 296 66 L296 90 L0 90 Z" fill="#7b5a8c" />
      <path d="M96 186 L200 186 L154 82 L142 82 Z" fill="#3a3048" />
      <g data-part="dashes">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={147 - i * 0.6}
            y={90 + i * 20}
            width={2 + i * 0.8}
            height={8 + i * 2}
            fill="#f3e9d2"
          />
        ))}
      </g>
      <g transform="translate(148 168)">
        <rect x="-16" y="-10" width="32" height="16" rx="5" fill="#ff5a3c" />
        <rect x="-10" y="-14" width="20" height="8" rx="3" fill="#ffb4a3" />
        <rect x="-18" y="2" width="8" height="6" rx="2" fill="#111" />
        <rect x="10" y="2" width="8" height="6" rx="2" fill="#111" />
      </g>
      <text x="10" y="16" fontFamily="ui-monospace, monospace" fontSize="10" fill="#fff">
        LAP 2/3
      </text>
    </g>
  );
}

/**
 * Scenes 1 and 2: a dark room at night, coding (or gaming) at the laptop.
 * `variant="both"` draws both states for the animated story, with gaming
 * hidden until the timeline swaps it in.
 */
export function Room({ p, variant }: { p: string; variant: "code" | "game" | "both" }) {
  const showCode = variant !== "game";
  const showGame = variant !== "code";
  const hiddenUntilSwap = variant === "both" ? 0 : 1;

  return (
    <g>
      <rect width="1600" height="900" fill={`url(#${p}-night)`} />
      {/* window with the moon */}
      <rect
        x="190"
        y="140"
        width="250"
        height="290"
        rx="6"
        fill="#121a3c"
        stroke="#2c2c38"
        strokeWidth="12"
      />
      <circle cx="370" cy="210" r="30" fill="#f4f0d8" />
      <circle cx="384" cy="202" r="28" fill="#121a3c" />
      {[
        [240, 190],
        [300, 260],
        [230, 330],
        [400, 320],
        [330, 380],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="#fff" opacity=".8" />
      ))}
      <path d="M315 140 V430 M190 285 H440" stroke="#2c2c38" strokeWidth="8" />
      {/* shelf */}
      <rect x="1220" y="230" width="230" height="10" fill="#2c2438" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={1236 + i * 30}
          y={180 - (i % 2) * 12}
          width="22"
          height={50 + (i % 2) * 12}
          fill={["#5a4a8a", "#8a4a5a", "#3a6a7a", "#7a6a3a"][i]}
        />
      ))}
      {/* the screen's glow */}
      <ellipse
        data-part="screen-glow"
        cx="900"
        cy="500"
        rx="420"
        ry="280"
        fill={`url(#${p}-glow)`}
      />

      {/* chair */}
      <rect x="536" y="460" width="22" height="200" rx="8" fill="#26262f" />
      <rect x="536" y="624" width="150" height="16" rx="6" fill="#26262f" />
      {/* legs */}
      <path d="M590 610 L770 620 L770 652 L590 650 Z" fill={JEANS} />
      <path d="M744 626 L774 770 L746 774 L716 636 Z" fill={JEANS} />
      <ellipse cx="770" cy="776" rx="30" ry="12" fill="#1a1a20" />
      {/* hoodie */}
      <path
        d="M574 634 C566 560 590 488 640 468 C676 456 704 478 708 520 C712 572 696 612 686 636 Z"
        fill={HOODIE}
      />
      <path
        d="M626 478 C612 452 640 432 668 446"
        stroke="#2c2c36"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"
      />
      <g transform="translate(690 402)">
        <Head />
      </g>

      {/* desk and laptop */}
      <rect x="700" y="640" width="680" height="22" rx="4" fill="#3d2b22" />
      <rect x="740" y="662" width="18" height="238" fill="#2e2019" />
      <rect x="1320" y="662" width="18" height="238" fill="#2e2019" />
      <rect x="1160" y="598" width="70" height="42" rx="8" fill="#4a3a5a" />
      <g transform={`translate(${LAPTOP_AT.x} ${LAPTOP_AT.y})`}>
        <Laptop>
          {showCode ? <Code /> : null}
          {showGame ? (
            <g opacity={showCode ? hiddenUntilSwap : 1} data-part="game-wrap">
              <Game p={p} />
            </g>
          ) : null}
        </Laptop>
      </g>

      {/* arms: typing, or holding the controller */}
      {showCode ? (
        <g data-part="type-hands">
          <path
            d="M662 492 L716 592 L872 626"
            stroke={HOODIE}
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g transform="translate(886 628)">
            <Hand />
          </g>
        </g>
      ) : null}
      {showGame ? (
        <g data-part="pad-hands" opacity={showCode ? hiddenUntilSwap : 1}>
          <path
            d="M662 492 L704 592 L790 566"
            stroke={HOODIE}
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M770 540 C790 532 830 532 850 540 C866 546 870 574 856 580 C846 584 836 572 826 570 L794 570 C784 572 774 584 764 580 C750 574 754 546 770 540 Z"
            fill="#24242c"
          />
          <circle cx="836" cy="550" r="4" fill="#ff5a3c" />
          <circle cx="846" cy="560" r="4" fill="#4ad66d" />
          <path d="M776 556 H792 M784 548 V564" stroke="#9a9aa3" strokeWidth="3" />
          <g transform="translate(792 568)">
            <Hand />
          </g>
        </g>
      ) : null}
    </g>
  );
}
