/** A little beetle, drawn facing up. Legs twitch unless motion is reduced. */
export function BugArt({
  shell,
  ink = "#1b1a17",
  wiggle = true,
  className = "",
}: {
  shell: string;
  ink?: string;
  wiggle?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <g
        stroke={ink}
        strokeWidth="1.6"
        strokeLinecap="round"
        className={
          wiggle ? "origin-center motion-safe:animate-[bug-legs_0.3s_ease-in-out_infinite]" : ""
        }
      >
        <path d="M9 12 L4 9 M9 16 L3 16 M9 20 L4 24 M23 12 L28 9 M23 16 L29 16 M23 20 L28 24" />
        <path d="M13 6 L10 2 M19 6 L22 2" />
      </g>
      <circle cx="16" cy="8" r="3.6" fill={ink} />
      <ellipse cx="16" cy="18" rx="7.5" ry="9" fill={shell} stroke={ink} strokeWidth="1.4" />
      <line x1="16" y1="9.5" x2="16" y2="27" stroke={ink} strokeWidth="1.2" />
      <circle cx="12.6" cy="15" r="1.5" fill={ink} />
      <circle cx="19.4" cy="20" r="1.5" fill={ink} />
      <circle cx="19" cy="14" r="1.1" fill={ink} />
    </svg>
  );
}
