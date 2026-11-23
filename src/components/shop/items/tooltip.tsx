import { useId, type ReactNode } from "react";

/**
 * A tooltip that appears on hover and on keyboard focus, wired with
 * aria-describedby so screen readers read it too. Pure CSS — no state.
 */
export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <span aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-[opacity,translate] duration-150 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-zinc-900"
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-white"
        />
      </span>
    </span>
  );
}

/** Demo: a toolbar whose icon buttons explain themselves. */
export function TooltipDemo() {
  const tools = [
    { label: "Bold (Ctrl+B)", glyph: "B", cls: "font-bold" },
    { label: "Italic (Ctrl+I)", glyph: "I", cls: "italic" },
    { label: "Underline (Ctrl+U)", glyph: "U", cls: "underline" },
  ];
  return (
    <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1 pt-10 dark:border-zinc-800 dark:bg-zinc-950">
      {tools.map((tool) => (
        <Tooltip key={tool.label} label={tool.label}>
          <button
            type="button"
            aria-label={tool.label.split(" (")[0]}
            className={`grid size-9 place-items-center rounded-lg text-zinc-700 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-orange-500 dark:text-zinc-300 dark:hover:bg-zinc-900 ${tool.cls}`}
          >
            {tool.glyph}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
