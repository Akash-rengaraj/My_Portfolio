/**
 * A classic product hero: announcement pill, headline, two calls to action,
 * social proof and a product mock-up. Stacks on narrow containers.
 */
export function HeroSplit({
  title = "Ship your next idea this weekend",
  subtitle = "Everything you need to go from blank page to launched product — auth, payments and a dashboard your users will love.",
  primary = "Start for free",
  secondary = "Watch demo",
}: {
  title?: string;
  subtitle?: string;
  primary?: string;
  secondary?: string;
}) {
  return (
    <section className="@container w-full overflow-hidden rounded-3xl bg-white px-6 py-14 @3xl:px-12 dark:bg-zinc-950">
      <div className="grid items-center gap-12 @3xl:grid-cols-2">
        <div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-orange-400 dark:border-zinc-800 dark:text-zinc-400"
          >
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
              new
            </span>
            Version 2.0 is out <span aria-hidden="true">→</span>
          </a>
          <h1 className="mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance text-zinc-900 @xl:text-5xl dark:text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">{subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-transform hover:-translate-y-0.5"
            >
              {primary}
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <span aria-hidden="true">▶</span> {secondary}
            </a>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              {["bg-rose-400", "bg-sky-400", "bg-amber-400", "bg-emerald-400"].map((c) => (
                <span
                  key={c}
                  className={`size-8 rounded-full border-2 border-white dark:border-zinc-950 ${c}`}
                />
              ))}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Loved by <strong className="text-zinc-900 dark:text-white">2,000+</strong> makers
            </p>
          </div>
        </div>

        <div aria-hidden="true" className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-linear-to-tr from-orange-500/30 via-rose-500/20 to-violet-500/30 blur-2xl" />
          <div className="relative rotate-1 rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex gap-1.5 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              {["Revenue", "Users", "Uptime"].map((label, i) => (
                <div key={label} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <p className="text-[10px] text-zinc-500 uppercase">{label}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-white">
                    {["$12.4k", "1,893", "99.9%"][i]}
                  </p>
                </div>
              ))}
              <svg viewBox="0 0 300 90" className="col-span-3 h-24 w-full">
                <defs>
                  <linearGradient id="hero-split-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="rgb(249 115 22)" stopOpacity="0.35" />
                    <stop offset="1" stopColor="rgb(249 115 22)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 70 L40 60 L80 64 L120 40 L160 48 L200 26 L240 32 L300 10 L300 90 L0 90 Z"
                  fill="url(#hero-split-area)"
                />
                <path
                  d="M0 70 L40 60 L80 64 L120 40 L160 48 L200 26 L240 32 L300 10"
                  fill="none"
                  stroke="rgb(249 115 22)"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
