import { Hand, Head } from "./character";
import { CANDLE, DRIP } from "./cuts";

const TEE = "#f2efe9";
const APRON = "#f1e6d0";

/** Scene 6: baking a chocolate cake in a warm kitchen, flour on one cheek. */
export function Bake({ p }: { p: string }) {
  return (
    <g>
      <rect width="1600" height="900" fill={`url(#${p}-kitchen)`} />
      {/* tiles */}
      <g stroke="#ffffff" strokeOpacity=".06">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={60 + i * 50} x2="1600" y2={60 + i * 50} />
        ))}
        {Array.from({ length: 33 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="650" />
        ))}
      </g>
      {/* hanging pans */}
      <path d="M1220 120 H1480" stroke="#5a3a28" strokeWidth="6" />
      {[1260, 1340, 1420].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="120" x2={x} y2="150" stroke="#8a8a94" strokeWidth="3" />
          <circle
            cx={x}
            cy={180 + i * 6}
            r={28 + i * 4}
            fill="#3a2a22"
            stroke="#8a8a94"
            strokeWidth="3"
          />
        </g>
      ))}

      {/* him, behind the counter */}
      <path d="M612 660 C602 560 622 470 682 450 C722 440 754 470 758 520 L762 660 Z" fill={TEE} />
      <path d="M644 520 L742 520 L754 660 L630 660 Z" fill={APRON} />
      <path d="M650 522 L676 456 M738 522 L716 456" stroke={APRON} strokeWidth="6" />
      <g transform="translate(714 386)">
        <Head flour />
      </g>
      <path
        d="M700 486 L782 566 L866 536"
        stroke={TEE}
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="translate(878 532)">
        <Hand />
      </g>
      <path d="M884 528 L920 490" stroke="#b9b9c2" strokeWidth="5" strokeLinecap="round" />

      {/* counter */}
      <rect x="0" y="650" width="1600" height="22" fill="#efe3cf" />
      <rect x="0" y="672" width="1600" height="228" fill="#c9a77f" />
      <path d="M0 700 H1600" stroke="#000" strokeOpacity=".08" strokeWidth="2" />

      {/* cake on a stand */}
      <ellipse cx="930" cy="648" rx="150" ry="12" fill="#e2e2ea" />
      <rect x="918" y="648" width="24" height="6" fill="#cfcfd8" />
      <rect x="830" y="520" width="200" height="126" rx="6" fill="#6b3a1e" />
      <rect x="830" y="578" width="200" height="12" fill="#f3d9b1" />
      <ellipse cx="930" cy="520" rx="100" ry="14" fill="#4a2412" />
      <path d={DRIP} fill="#3f1d0b" />
      <path
        d="M850 516 C880 508 940 506 980 510"
        stroke="#ffffff"
        strokeOpacity=".25"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* candle */}
      <rect x={CANDLE.cx - 6} y="460" width="12" height="56" rx="3" fill="#f6f0ff" />
      {[470, 486, 502].map((y) => (
        <path
          key={y}
          d={`M${CANDLE.cx - 6} ${y} L${CANDLE.cx + 6} ${y - 6}`}
          stroke="#ff8aa8"
          strokeWidth="3"
        />
      ))}
      <circle
        cx={CANDLE.cx}
        cy={CANDLE.cy}
        r="30"
        fill={`url(#${p}-flame)`}
        data-part="candle-halo"
      />
      <path
        data-part="flame"
        d={`M${CANDLE.cx} ${CANDLE.cy - 18} C${CANDLE.cx + 9} ${CANDLE.cy - 4} ${CANDLE.cx + 7} ${CANDLE.cy + 8} ${CANDLE.cx} ${CANDLE.cy + 9} C${CANDLE.cx - 7} ${CANDLE.cy + 8} ${CANDLE.cx - 9} ${CANDLE.cy - 4} ${CANDLE.cx} ${CANDLE.cy - 18} Z`}
        fill="#ffb347"
      />

      {/* bowl and whisk */}
      <path
        d="M1160 600 L1300 600 C1296 640 1270 652 1230 652 C1190 652 1164 640 1160 600 Z"
        fill="#d8dde6"
      />
      <ellipse cx="1230" cy="600" rx="70" ry="10" fill="#f3e2c4" />
      <path d="M1250 596 L1310 520" stroke="#9a9aa3" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}
