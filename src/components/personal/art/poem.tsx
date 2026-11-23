import { Hand, Head } from "./character";
import { RULES } from "./cuts";

const FLANNEL = "#8a2f2f";

/** Scene 5: writing a poem in a notebook under a desk lamp at night. */
export function Poem({ p }: { p: string }) {
  return (
    <g>
      <rect width="1600" height="900" fill={`url(#${p}-lamp-room)`} />
      {/* lamp and its light */}
      <path
        d="M1160 440 L940 660 L1400 660 L1230 440 Z"
        fill="#ffcf7a"
        opacity=".14"
        data-part="lamp-light"
      />
      <path
        d="M1290 660 L1290 560 L1200 450"
        stroke="#3a3040"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M1140 452 L1250 420 L1262 460 L1160 486 Z" fill="#c75d3a" />
      <ellipse cx="1290" cy="660" rx="44" ry="8" fill="#3a3040" />
      <circle cx="1196" cy="470" r="12" fill="#fff1c9" />

      {/* chair, body in a flannel shirt */}
      <rect x="536" y="460" width="22" height="200" rx="8" fill="#241c28" />
      <rect x="536" y="624" width="150" height="16" rx="6" fill="#241c28" />
      <path d="M590 610 L770 620 L770 652 L590 650 Z" fill="#2b3a55" />
      <path
        d="M574 634 C566 560 590 488 640 468 C676 456 704 478 708 520 C712 572 696 612 686 636 Z"
        fill={FLANNEL}
      />
      {[600, 630, 660, 690].map((x) => (
        <line
          key={x}
          x1={x}
          y1="470"
          x2={x - 6}
          y2="636"
          stroke="#5a1c1c"
          strokeWidth="4"
          opacity=".7"
        />
      ))}
      <path d="M672 470 C690 500 696 560 690 630" stroke="#f2efe9" strokeWidth="10" fill="none" />
      <g transform="translate(702 404)">
        <Head />
      </g>

      {/* desk and the open notebook */}
      <rect x="700" y="660" width="760" height="22" rx="4" fill="#3d2b22" />
      <path d="M818 602 L964 590 L964 662 L810 670 Z" fill="#f3ead6" />
      <path d="M964 590 L1112 600 L1120 670 L964 662 Z" fill="#f9f3e6" />
      <line x1="964" y1="590" x2="964" y2="662" stroke="#d6c9ad" strokeWidth="2" />
      <g data-part="poem-text" fontFamily="Caveat, cursive" fontSize="17" fill="#2a2a44">
        <text x="826" y="620" data-line="0">
          rain doesn&apos;t ask,
        </text>
        <text x="826" y="640" data-line="1">
          it just arrives —
        </text>
        <text x="826" y="660" data-line="2">
          like you.
        </text>
      </g>
      <g stroke="#9db7e0" strokeWidth="1.2">
        {RULES.map((r, i) => (
          <line key={i} {...r} />
        ))}
      </g>

      {/* writing arm and pen */}
      <path
        d="M664 492 L720 592 L930 624"
        stroke={FLANNEL}
        strokeWidth="28"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g data-part="pen">
        <g transform="translate(944 624)">
          <Hand />
        </g>
        <path d="M948 630 L986 606" stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" />
        <circle cx="988" cy="605" r="2" fill="#1a1a2e" />
      </g>
      <circle data-part="ink-drop" cx="988" cy="608" r="4" fill="#1a1a2e" opacity="0" />
    </g>
  );
}
