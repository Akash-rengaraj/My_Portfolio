import type { ComponentProps } from "react";

/** Shimmering placeholder block shown while content loads (a span, so it fits inside buttons). */
export function Skeleton({ className = "", ...props }: ComponentProps<"span">) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} {...props} />;
}
