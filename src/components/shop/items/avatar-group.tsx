const PEOPLE = [
  { name: "Ava Patel", tint: "bg-rose-400" },
  { name: "Ben Ortiz", tint: "bg-sky-400" },
  { name: "Chloe Kim", tint: "bg-amber-400" },
  { name: "Dev Sharma", tint: "bg-emerald-400" },
  { name: "Eli Novak", tint: "bg-violet-400" },
  { name: "Fay Moreau", tint: "bg-orange-400" },
  { name: "Gus Lund", tint: "bg-teal-400" },
] as const;

/**
 * Overlapping avatars with a "+N" counter for the rest. Each avatar fans out
 * a little on hover; names are available to screen readers and as tooltips.
 */
export function AvatarGroup({
  people = PEOPLE,
  max = 4,
}: {
  people?: readonly { name: string; tint: string }[];
  max?: number;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return (
    <div className="flex flex-col items-center gap-3">
      <ul className="group flex -space-x-3" aria-label={`${people.length} people`}>
        {shown.map((person) => (
          <li
            key={person.name}
            title={person.name}
            className="transition-[margin] duration-300 group-hover:mx-1"
          >
            <span
              className={`grid size-11 place-items-center rounded-full border-[3px] border-white text-sm font-bold text-white dark:border-zinc-950 ${person.tint}`}
            >
              <span aria-hidden="true">{person.name.charAt(0)}</span>
              <span className="sr-only">{person.name}</span>
            </span>
          </li>
        ))}
        {rest > 0 ? (
          <li className="transition-[margin] duration-300 group-hover:mx-1">
            <span className="grid size-11 place-items-center rounded-full border-[3px] border-white bg-zinc-200 text-xs font-bold text-zinc-700 dark:border-zinc-950 dark:bg-zinc-800 dark:text-zinc-200">
              +{rest}
            </span>
          </li>
        ) : null}
      </ul>
      <p className="text-sm text-zinc-500">
        {shown.map((p) => p.name.split(" ")[0]).join(", ")}
        {rest > 0 ? ` and ${rest} other${rest === 1 ? "" : "s"}` : ""}
      </p>
    </div>
  );
}
