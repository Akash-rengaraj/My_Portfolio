"use client";

import { useId, useState, type KeyboardEvent } from "react";

/**
 * Type a tag and press Enter (or comma) to add it as a chip. Backspace on an
 * empty input removes the last one; duplicates are ignored.
 */
export function TagInput({
  initial = ["react", "design"],
  max = 8,
  onChange,
}: {
  initial?: readonly string[];
  max?: number;
  onChange?: (tags: string[]) => void;
}) {
  const id = useId();
  const [tags, setTags] = useState<string[]>([...initial]);
  const [draft, setDraft] = useState("");

  const commit = (next: string[]) => {
    setTags(next);
    onChange?.(next);
  };

  const add = () => {
    const tag = draft.trim().toLowerCase().replace(/,/g, "");
    setDraft("");
    if (!tag || tags.includes(tag) || tags.length >= max) return;
    commit([...tags, tag]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && draft === "" && tags.length) {
      commit(tags.slice(0, -1));
    }
  };

  return (
    <div className="w-80">
      <label htmlFor={id} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Skills
      </label>
      <div className="mt-1.5 flex flex-wrap gap-1.5 rounded-xl border border-zinc-300 bg-white p-2 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15 dark:border-zinc-700 dark:bg-zinc-950">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 py-1 pr-1 pl-2.5 text-sm font-medium text-orange-700 dark:text-orange-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => commit(tags.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="grid size-5 place-items-center rounded-md hover:bg-orange-500/20"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={tags.length >= max ? "That's the max" : "Add a tag…"}
          disabled={tags.length >= max}
          className="min-w-24 flex-1 bg-transparent px-1 text-sm text-zinc-900 outline-none dark:text-white"
        />
      </div>
      <p className="mt-1.5 text-xs text-zinc-500">
        {tags.length}/{max} · Enter or comma to add
      </p>
    </div>
  );
}
