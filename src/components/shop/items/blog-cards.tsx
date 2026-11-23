const POSTS = [
  {
    title: "How we cut our load time in half",
    tag: "Engineering",
    date: "Mar 12",
    minutes: 6,
    cover: "from-orange-400 via-rose-400 to-fuchsia-500",
  },
  {
    title: "Designing for one-handed use",
    tag: "Design",
    date: "Mar 05",
    minutes: 4,
    cover: "from-sky-400 via-indigo-400 to-violet-500",
  },
  {
    title: "What 1,000 user interviews taught us",
    tag: "Research",
    date: "Feb 26",
    minutes: 9,
    cover: "from-emerald-400 via-teal-400 to-cyan-500",
  },
] as const;

/**
 * A "latest from the blog" section: cover, tag, title, date and reading time.
 * The whole card is one link, and its cover zooms gently on hover.
 */
export function BlogCards({
  posts = POSTS,
}: {
  posts?: readonly { title: string; tag: string; date: string; minutes: number; cover: string }[];
}) {
  return (
    <section className="@container w-full rounded-3xl bg-white px-6 py-14 dark:bg-zinc-950">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          From the blog
        </h2>
        <a href="#" className="text-sm font-medium text-orange-600 dark:text-orange-400">
          All posts →
        </a>
      </div>
      <ul className="mt-8 grid gap-5 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {posts.map((post) => (
          <li key={post.title}>
            <a
              href="#"
              className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
            >
              <div className="overflow-hidden rounded-2xl">
                <div
                  aria-hidden="true"
                  className={`aspect-[16/10] bg-linear-to-br transition-transform duration-500 group-hover:scale-105 ${post.cover}`}
                />
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 font-medium text-orange-600 dark:text-orange-400">
                  {post.tag}
                </span>
                {post.date} · {post.minutes} min read
              </p>
              <h3 className="mt-2 text-lg leading-snug font-semibold text-zinc-900 group-hover:underline dark:text-white">
                {post.title}
              </h3>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
