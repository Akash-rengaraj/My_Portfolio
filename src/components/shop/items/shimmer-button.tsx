import type { ReactNode } from "react";

/**
 * A premium call-to-action: gradient border, soft glow, and a band of light
 * that sweeps across on hover. Pure CSS — no state, no keyframes to install.
 */
export function ShimmerButton({
  children = "Get early access",
  href = "#",
}: {
  children?: ReactNode;
  href?: string;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex rounded-full bg-linear-to-r from-orange-500 via-rose-500 to-violet-500 p-px shadow-[0_0_40px_-8px_rgb(244_63_94/0.6)] transition-shadow hover:shadow-[0_0_50px_-4px_rgb(244_63_94/0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
    >
      <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-zinc-950 px-7 py-3 text-sm font-semibold text-white">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[300%]"
        />
        <span className="relative">{children}</span>
        <span
          aria-hidden="true"
          className="relative transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </a>
  );
}
