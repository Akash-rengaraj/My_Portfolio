"use client";

import { useId, useState } from "react";

const WORDS = ["", "Awful", "Meh", "Good", "Great", "Loved it!"] as const;

/**
 * A 1–5 star rating built from real radio buttons, so it works with the
 * keyboard (arrow keys) and in forms. Hovering previews the score.
 */
export function StarRating({
  name = "rating",
  onChange,
}: {
  name?: string;
  onChange?: (value: number) => void;
}) {
  const id = useId();
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <fieldset className="flex flex-col items-center gap-2">
      <legend className="mb-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        How was it?
      </legend>
      <div className="flex" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <label
            key={star}
            htmlFor={`${id}-${star}`}
            onPointerEnter={() => setHover(star)}
            className="cursor-pointer p-0.5"
          >
            <input
              id={`${id}-${star}`}
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => {
                setValue(star);
                onChange?.(star);
              }}
              className="peer sr-only"
            />
            <span className="sr-only">
              {star} star{star > 1 ? "s" : ""}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`size-9 transition-[color,scale] duration-150 peer-focus-visible:scale-110 hover:scale-110 ${star <= shown ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700"}`}
              fill="currentColor"
            >
              <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
            </svg>
          </label>
        ))}
      </div>
      <p aria-live="polite" className="h-5 text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {WORDS[shown]}
      </p>
    </fieldset>
  );
}
