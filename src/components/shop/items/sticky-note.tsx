"use client";

import { useId, useState } from "react";

const COLORS = {
  lemon: "bg-yellow-200",
  peach: "bg-orange-200",
  mint: "bg-emerald-200",
  sky: "bg-sky-200",
} as const;

type NoteColor = keyof typeof COLORS;

/**
 * A sticky note you can write on and recolour, held up by a strip of tape.
 * It straightens up when you hover it.
 */
export function StickyNote({
  defaultText = "ship it first,\nthen polish it ✿",
  defaultColor = "lemon",
}: {
  defaultText?: string;
  defaultColor?: NoteColor;
}) {
  const id = useId();
  const [text, setText] = useState(defaultText);
  const [color, setColor] = useState<NoteColor>(defaultColor);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative w-56 -rotate-2 p-5 pt-7 shadow-[0_18px_24px_-14px_rgb(0_0_0/0.45)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 ${COLORS[color]}`}
      >
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-3 bg-white/60 shadow-sm backdrop-blur-sm"
        />
        <label htmlFor={id} className="sr-only">
          Note
        </label>
        <textarea
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          maxLength={120}
          className="w-full resize-none bg-transparent font-['Caveat','Segoe_Print','Bradley_Hand',cursive] text-2xl leading-7 text-zinc-800 outline-none"
        />
      </div>
      <div role="group" aria-label="Note colour" className="flex gap-2">
        {(Object.keys(COLORS) as NoteColor[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={option === color}
            aria-label={option}
            onClick={() => setColor(option)}
            className={`size-6 rounded-full ring-zinc-900 ring-offset-2 ring-offset-white transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500 aria-pressed:ring-2 dark:ring-white dark:ring-offset-zinc-950 ${COLORS[option]}`}
          />
        ))}
      </div>
    </div>
  );
}
