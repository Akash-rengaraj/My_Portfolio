import { useId } from "react";

import type { StampInfo } from "@/content/stamps";

/** Centre icon of a stamp, drawn in a 24×24 box. */
function StampIcon({ icon }: { icon: StampInfo["icon"] }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "pen":
      return <path {...common} d="M4 20l4-1L19 8l-3-3L5 16l-1 4ZM14 7l3 3" />;
    case "pin":
      return <path {...common} d="M12 3a4 4 0 0 1 4 4v3l2 3H6l2-3V7a4 4 0 0 1 4-4ZM12 13v8" />;
    case "wrench":
      return (
        <path
          {...common}
          d="M15 3.5a5 5 0 0 0-4.6 6.9l-6.6 6.6a2 2 0 0 0 2.8 2.8l6.6-6.6A5 5 0 0 0 20 7.6l-3 3-2.6-.6-.6-2.6 3-3a5 5 0 0 0-1.8-.9Z"
        />
      );
    case "frame":
      return <path {...common} d="M4 5h16v14H4ZM7 8h10v8H7ZM9 2l3 3 3-3" />;
    case "trophy":
      return (
        <path
          {...common}
          d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9.5 17h5"
        />
      );
    case "door":
      return (
        <path {...common} d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14.5 12.5h.01" />
      );
    case "train":
      return (
        <path
          {...common}
          d="M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2ZM5 10h14M9 14.5h.01M15 14.5h.01M8 21l1.5-3M16 21l-1.5-3"
        />
      );
    default:
      return <path {...common} d="M15 3a9 9 0 1 0 6 15 7 7 0 0 1-6-15Z" />;
  }
}

/**
 * The inked impression a stamp leaves: double ring, place name around the
 * top, motto along the bottom, icon in the middle — with a rough ink texture.
 */
export function StampMark({
  stamp,
  className = "",
  seed = 1,
}: {
  stamp: StampInfo;
  className?: string;
  seed?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const top = `${uid}-top`;
  const bottom = `${uid}-bottom`;
  const ink = `${uid}-ink`;
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${stamp.place} stamp`}
      className={className}
      style={{ color: stamp.ink }}
    >
      <defs>
        <path id={top} d="M20 60 a40 40 0 0 1 80 0" />
        <path id={bottom} d="M17 60 a43 43 0 0 0 86 0" />
        <filter id={ink} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            seed={seed}
            result="noise"
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" result="rough" />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55"
            result="speckle"
          />
          <feComposite in="rough" in2="speckle" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${ink})`} fill="currentColor" opacity="0.88">
        <circle cx="60" cy="60" r="55" fill="none" stroke="currentColor" strokeWidth="4" />
        <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="1.6" />
        {/* Long place names get a smaller face so they fit the arc. */}
        <text
          fontSize={stamp.place.length > 11 ? 9.5 : 11.5}
          fontWeight="800"
          letterSpacing={stamp.place.length > 11 ? 1.2 : 2}
          className="font-mono"
        >
          <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">
            {stamp.place}
          </textPath>
        </text>
        <text fontSize="8.5" fontWeight="700" letterSpacing="1.5" className="font-mono uppercase">
          <textPath href={`#${bottom}`} startOffset="50%" textAnchor="middle">
            {`· ${stamp.motto} ·`}
          </textPath>
        </text>
        <text x="60" y="85" fontSize="8" fontWeight="800" textAnchor="middle" className="font-mono">
          No. {stamp.number}
        </text>
        <g transform="translate(45.5 36) scale(1.2)">
          <StampIcon icon={stamp.icon} />
        </g>
      </g>
    </svg>
  );
}

/** A little wooden rubber stamp: knob, neck and an inked base. */
export function RubberStamp({ ink, className = "" }: { ink: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <ellipse
        cx="16"
        cy="6.5"
        rx="5.5"
        ry="4.5"
        fill="#9a6a3e"
        stroke="#4e2f17"
        strokeWidth="1.2"
      />
      <ellipse cx="14.2" cy="5" rx="1.8" ry="1.1" fill="#d7a978" />
      <rect
        x="13"
        y="10"
        width="6"
        height="8"
        rx="1.5"
        fill="#7a4b28"
        stroke="#4e2f17"
        strokeWidth="1.2"
      />
      <rect
        x="6"
        y="17.5"
        width="20"
        height="7"
        rx="1.8"
        fill="#b07a48"
        stroke="#4e2f17"
        strokeWidth="1.2"
      />
      <rect
        x="7"
        y="24.5"
        width="18"
        height="3.5"
        rx="1"
        fill={ink}
        stroke="#4e2f17"
        strokeWidth="1"
      />
    </svg>
  );
}
