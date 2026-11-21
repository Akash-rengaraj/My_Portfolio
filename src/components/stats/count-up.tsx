"use client";

import { useRef } from "react";

import { useCountUp } from "@/components/works/stat-tile";
import { useInView } from "@/components/works/use-in-view";

/** A number that counts up from zero the first time it scrolls into view. */
export function CountUp({ value, className = "" }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const shown = useCountUp(value, inView);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {shown.toLocaleString("en-IN")}
    </span>
  );
}
