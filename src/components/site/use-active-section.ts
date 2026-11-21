"use client";

import { useEffect, useState } from "react";

/**
 * Which of `ids` is currently in the middle band of the viewport (scrollspy).
 * Returns the first id until the observer reports.
 */
export function useActiveSection<T extends string>(ids: readonly T[]): T | null {
  const [active, setActive] = useState<T | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as T);
        }
      },
      // A thin band across the middle of the screen decides the active section.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
