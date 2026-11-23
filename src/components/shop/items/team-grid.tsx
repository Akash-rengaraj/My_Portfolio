const TEAM = [
  { name: "Ananya Rao", role: "Founder & CEO", tint: "from-orange-400 to-rose-500" },
  { name: "Leo Martin", role: "Head of Design", tint: "from-sky-400 to-indigo-500" },
  { name: "Mei Chen", role: "Lead Engineer", tint: "from-emerald-400 to-teal-600" },
  { name: "Omar Haddad", role: "Customer Success", tint: "from-amber-400 to-orange-600" },
] as const;

/** First letters of the first and last name. */
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("");

/**
 * Meet-the-team cards with gradient initial avatars (swap in photos with an
 * <img>). The card lifts and reveals a "say hi" link on hover or focus.
 */
export function TeamGrid({
  team = TEAM,
}: {
  team?: readonly { name: string; role: string; tint: string }[];
}) {
  return (
    <section className="@container w-full rounded-3xl bg-zinc-50 px-6 py-14 dark:bg-zinc-900/50">
      <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Meet the team
      </h2>
      <ul className="mt-10 grid grid-cols-2 gap-4 @3xl:grid-cols-4">
        {team.map((person) => (
          <li
            key={person.name}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 text-center transition-transform duration-300 focus-within:-translate-y-1 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span
              aria-hidden="true"
              className={`mx-auto grid size-20 place-items-center rounded-full bg-linear-to-br text-xl font-bold text-white ${person.tint}`}
            >
              {initials(person.name)}
            </span>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{person.name}</h3>
            <p className="text-sm text-zinc-500">{person.role}</p>
            <a
              href="#"
              className="mt-3 inline-block text-sm font-medium text-orange-600 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 dark:text-orange-400"
            >
              say hi →
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
