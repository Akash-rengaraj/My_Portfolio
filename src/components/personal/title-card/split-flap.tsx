"use client";

import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * A departure-board display: every few seconds each tile rattles through
 * random letters and lands on the next word, left to right. Reduced motion
 * just swaps the word.
 */
export function SplitFlap({
  words,
  width,
  holdMs = 2200,
}: {
  words: readonly string[];
  width: number;
  holdMs?: number;
}) {
  const [shown, setShown] = useState(() => (words[0] ?? "").padEnd(width, " "));

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let index = 0;
    let scramble = 0;
    const timers: number[] = [];

    const flipTo = (word: string) => {
      const target = word.padEnd(width, " ");
      if (reduced) {
        setShown(target);
        return;
      }
      const started = performance.now();
      window.clearInterval(scramble);
      scramble = window.setInterval(() => {
        const elapsed = performance.now() - started;
        let done = true;
        const next = Array.from(target, (ch, i) => {
          if (elapsed > 260 + i * 70) return ch;
          done = false;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? ch;
        }).join("");
        setShown(next);
        if (done) window.clearInterval(scramble);
      }, 45);
    };

    const cycle = window.setInterval(() => {
      index = (index + 1) % words.length;
      flipTo(words[index] ?? "");
    }, holdMs);
    timers.push(cycle);

    return () => {
      timers.forEach((t) => window.clearInterval(t));
      window.clearInterval(scramble);
    };
  }, [words, width, holdMs]);

  return (
    <span aria-hidden="true" className="flex gap-1 sm:gap-1.5">
      {Array.from(shown, (ch, i) => (
        <span
          key={i}
          className="relative grid h-9 w-6 place-items-center overflow-hidden rounded-[5px] bg-[linear-gradient(#1d1b1f_50%,#151316_50%)] font-mono text-lg font-bold text-[#ffd9a8] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_6px_14px_-6px_rgb(0_0_0/0.9)] sm:h-12 sm:w-8 sm:text-2xl"
        >
          {ch === " " ? " " : ch}
          <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
        </span>
      ))}
    </span>
  );
}
