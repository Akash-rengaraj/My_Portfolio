"use client";

import { useId, useState } from "react";

const FAQS = [
  { q: "Is there a free plan?", a: "Yes — the Starter plan is free forever, with no card needed." },
  {
    q: "Can I cancel any time?",
    a: "Of course. Cancel from settings in two clicks; you keep access until the period ends.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Students get 50% off Pro. Write to us from your college email.",
  },
  {
    q: "Where is my data stored?",
    a: "In encrypted databases in the region you choose when you sign up.",
  },
] as const;

/** One question; the answer slides open with a grid-rows transition. */
function Item({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <li className="border-b border-zinc-200 dark:border-zinc-800">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 dark:text-white"
        >
          {q}
          <span
            aria-hidden="true"
            className={`grid size-7 shrink-0 place-items-center rounded-full border border-zinc-300 text-zinc-500 transition-transform duration-300 dark:border-zinc-700 ${open ? "rotate-45" : ""}`}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!open}>
          <p className="pb-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{a}</p>
        </div>
      </div>
    </li>
  );
}

/**
 * An FAQ section: one answer open at a time, smooth height animation, and the
 * right ARIA wiring for screen readers.
 */
export function FaqAccordion({ items = FAQS }: { items?: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="w-full max-w-2xl rounded-3xl bg-white px-6 py-10 dark:bg-zinc-950">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Questions, answered
      </h2>
      <ul className="mt-4">
        {items.map((item, i) => (
          <Item
            key={item.q}
            {...item}
            open={open === i}
            onToggle={() => setOpen((current) => (current === i ? null : i))}
          />
        ))}
      </ul>
    </section>
  );
}
