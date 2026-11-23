const FEATURES = [
  {
    title: "Lightning fast",
    text: "Pages load in under a second, even on slow phones.",
    icon: "M13 2 4 14h7l-1 8 9-12h-7z",
  },
  {
    title: "Secure by default",
    text: "Encryption, audit logs and 2FA out of the box.",
    icon: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z",
  },
  {
    title: "Works offline",
    text: "Keep working on the train; it syncs when you're back.",
    icon: "M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5",
  },
  {
    title: "Team ready",
    text: "Invite your team, share spaces, set roles.",
    icon: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1a3 3 0 0 0-2-2.8M4 19v-1a3 3 0 0 1 2-2.8",
  },
  {
    title: "Analytics",
    text: "See what's working with clear, private stats.",
    icon: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  },
  {
    title: "Open API",
    text: "Automate anything with a clean, documented API.",
    icon: "m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14",
  },
] as const;

/**
 * A features section: eyebrow, heading and a grid of icon cards that lift on
 * hover. One, two or three columns depending on the container width.
 */
export function FeatureGrid({
  eyebrow = "Why teams switch",
  title = "Everything you need, nothing you don't",
  features = FEATURES,
}: {
  eyebrow?: string;
  title?: string;
  features?: readonly { title: string; text: string; icon: string }[];
}) {
  return (
    <section className="@container w-full rounded-3xl bg-zinc-50 px-6 py-14 @3xl:px-12 dark:bg-zinc-900/50">
      <p className="text-center text-xs font-semibold tracking-[0.2em] text-orange-600 uppercase dark:text-orange-400">
        {eyebrow}
      </p>
      <h2 className="mx-auto mt-3 max-w-xl text-center text-3xl font-bold tracking-tight text-balance text-zinc-900 dark:text-white">
        {title}
      </h2>
      <ul className="mt-10 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
        {features.map((f) => (
          <li
            key={f.title}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-orange-500/10 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white dark:text-orange-400">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={f.icon} />
              </svg>
            </span>
            <h3 className="mt-4 font-semibold text-zinc-900 dark:text-white">{f.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {f.text}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
