import { Hand, Head } from "./character";
import { GUITAR_AT } from "./cuts";
import { F310, Himalayan } from "./props";

const TEE = "#f2efe9";
const JEANS = "#2b3a55";

/** Scene 4: playing the F310 at a roadside viewpoint, the bike parked behind, golden hour. */
export function GuitarScene({ p }: { p: string }) {
  return (
    <g>
      <rect width="1600" height="900" fill={`url(#${p}-golden)`} />
      <circle cx="1170" cy="560" r="170" fill={`url(#${p}-sun)`} />
      <circle cx="1170" cy="560" r="78" fill="#ffd27a" />
      <path
        d="M0 620 C200 560 380 610 560 580 C760 548 900 600 1100 590 C1300 580 1460 610 1600 590 L1600 900 L0 900 Z"
        fill="#7a4a5f"
      />
      <path
        d="M0 700 C260 660 520 700 800 680 C1080 660 1340 700 1600 680 L1600 900 L0 900 Z"
        fill="#4a2f45"
      />
      <path d="M0 770 C400 750 1200 780 1600 760 L1600 900 L0 900 Z" fill="#2a1d2a" />

      {/* the bike, parked, and the helmet on the ground */}
      <g transform="translate(300 790) scale(.7)">
        <Himalayan />
      </g>
      <g transform="translate(500 772)">
        <path d="M-30 0 C-34 -34 -10 -52 14 -50 C38 -48 50 -30 48 -8 L48 0 Z" fill="#17171c" />
        <path d="M18 -44 L52 -34 L46 -28 L14 -38 Z" fill="#26262d" />
      </g>

      {/* the rock he sits on */}
      <path d="M600 800 C590 740 640 700 720 702 C800 704 840 740 834 800 Z" fill="#3a2a36" />

      {/* far arm, reaching the neck */}
      <path
        d="M716 572 L840 640 L1000 600"
        stroke="#d9d4cb"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* body */}
      <path d="M690 700 L830 704 L842 800 L812 804 L800 734 L690 736 Z" fill={JEANS} />
      <ellipse cx="832" cy="806" rx="30" ry="11" fill="#1a1a20" />
      <path
        d="M646 708 C636 636 654 566 694 546 C726 532 754 552 758 584 C764 634 752 684 744 708 Z"
        fill={TEE}
      />
      <g transform="translate(736 482)">
        <Head />
      </g>

      {/* the guitar */}
      <g
        transform={`translate(${GUITAR_AT.x} ${GUITAR_AT.y}) rotate(${GUITAR_AT.rotate}) scale(${GUITAR_AT.scale})`}
      >
        <F310 />
      </g>
      <g transform="translate(1004 600)">
        <Hand />
      </g>
      {/* near arm, strumming */}
      <g data-part="strum">
        <path
          d="M700 584 L676 670 L760 664"
          stroke={TEE}
          strokeWidth="26"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform="translate(772 660)">
          <Hand />
        </g>
      </g>
    </g>
  );
}
