"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while `ref`'s element intersects the viewport (always true without IntersectionObserver). */
export function useInView(ref: RefObject<Element | null>, margin = "0px"): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: margin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);

  return inView;
}
