/** Hand-drawn marker underline that draws itself in once `drawn` turns true. */
export function ScribbleUnderline({
  drawn = true,
  className = "",
}: {
  drawn?: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 300 24"
      preserveAspectRatio="none"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M4 15 C 60 6, 120 20, 170 11 S 260 6, 296 13 M 30 19 C 90 14, 170 21, 250 16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: drawn ? 0 : 1 }}
        className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
      />
    </svg>
  );
}

/** Hand-drawn curly arrow, pointing right-down by default. */
export function ScribbleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 60"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <path
        d="M6 10 C 30 0, 58 8, 54 28 C 51 42, 34 40, 38 30 C 42 20, 64 30, 70 50"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M60 46 L 70 51 L 73 40"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
