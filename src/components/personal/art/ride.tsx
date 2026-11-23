import { Hand, Head } from "./character";
import { BIKE_AT } from "./cuts";
import { Himalayan } from "./props";

const JACKET = "#18181b";
const PIPING = "#ff6a1f";

/** The rider, in the bike's local space (seat at about (-100, -170)). */
function Rider() {
  return (
    <g>
      {/* leg and boot */}
      <path
        d="M-92 -170 L12 -144 L-6 -80"
        stroke="#1f2533"
        strokeWidth="32"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="-30" y="-92" width="44" height="30" rx="10" fill="#141418" />
      {/* jacket */}
      <path
        d="M-122 -168 C-130 -232 -98 -302 -52 -322 C-22 -332 6 -314 8 -292 C10 -252 -20 -200 -40 -166 Z"
        fill={JACKET}
      />
      <path d="M-48 -320 C-12 -302 -2 -262 -40 -170" stroke={PIPING} strokeWidth="3" fill="none" />
      {/* arm to the handlebar */}
      <path
        d="M-42 -296 L28 -252 L94 -240"
        stroke={JACKET}
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M-38 -308 L32 -264 L92 -252" stroke={PIPING} strokeWidth="2" fill="none" />
      <g transform="translate(104 -240)">
        <Hand glove />
      </g>
      <g transform="translate(-12 -372)">
        <Head helmet />
      </g>
    </g>
  );
}

/** Scene 3: riding the black Himalayan along a winding hill road at dawn. */
export function Ride({ p }: { p: string }) {
  return (
    <g>
      <rect width="1600" height="900" fill={`url(#${p}-dawn)`} />
      <circle cx="1180" cy="470" r="120" fill={`url(#${p}-sun)`} />
      <circle cx="1180" cy="470" r="52" fill="#ffe2b0" />
      <g data-part="far">
        <path
          d="M-200 470 C0 400 180 450 360 410 C560 370 700 440 900 400 C1100 360 1260 420 1400 390 C1560 360 1700 400 1800 390 L1800 900 L-200 900 Z"
          fill="#b07aa1"
        />
      </g>
      <g data-part="mid">
        <path
          d="M-200 560 C40 500 220 560 420 520 C620 480 800 540 1000 500 C1180 470 1300 520 1500 500 C1640 486 1720 500 1800 495 L1800 900 L-200 900 Z"
          fill="#7b5a8c"
        />
        {[180, 260, 1300, 1400, 1480].map((x, i) => (
          <path key={x} d={`M${x} ${530 + (i % 2) * 10} l14 -44 l14 44 Z`} fill="#4d3d63" />
        ))}
      </g>
      <g data-part="near">
        <path
          d="M-200 660 C100 610 300 660 600 630 C900 600 1100 650 1400 620 C1600 600 1700 620 1800 615 L1800 900 L-200 900 Z"
          fill="#4d3d63"
        />
      </g>
      {/* the road, winding up to the horizon */}
      <path
        d="M470 900 C600 790 980 770 900 660 C840 580 950 510 906 440 L918 440 C968 510 872 580 944 660 C1040 770 800 830 1130 900 Z"
        fill="#3a3048"
      />
      <path
        d="M800 900 C840 820 930 760 922 660 C916 590 920 520 912 450"
        stroke="#f3e9d2"
        strokeWidth="4"
        strokeDasharray="22 26"
        fill="none"
        opacity=".7"
        data-part="road-dashes"
      />
      <g transform={`translate(${BIKE_AT.x} ${BIKE_AT.y})`} data-part="bike">
        <ellipse cx="0" cy="4" rx="260" ry="14" fill="#000" opacity=".25" />
        <Himalayan />
        <Rider />
      </g>
    </g>
  );
}
