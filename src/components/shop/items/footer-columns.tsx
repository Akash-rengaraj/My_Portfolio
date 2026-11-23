const COLUMNS = [
  { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
  { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Docs", "Guides", "Community", "Status"] },
] as const;

const SOCIALS = [
  {
    name: "GitHub",
    d: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2",
  },
  {
    name: "X",
    d: "M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z",
  },
  {
    name: "LinkedIn",
    d: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5M3 9.75h4v11H3zm6.5 0h3.8v1.5h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6v6.5h-4v-5.8c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.9h-4z",
  },
] as const;

const THIS_YEAR = new Date().getFullYear();

/**
 * A full site footer: brand blurb, link columns, social icons and a bottom
 * bar with the year. Columns collapse on narrow containers.
 */
export function FooterColumns({ brand = "Northwind" }: { brand?: string }) {
  return (
    <footer className="@container w-full rounded-3xl bg-zinc-950 px-6 pt-12 pb-6 text-zinc-400 @3xl:px-12">
      <div className="grid gap-10 @3xl:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="flex items-center gap-2 font-semibold text-white">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-orange-500 text-sm font-bold"
            >
              {brand.charAt(0)}
            </span>
            {brand}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            Tools for small teams who ship big things. Made with care, everywhere.
          </p>
          <ul className="mt-5 flex gap-2">
            {SOCIALS.map((s) => (
              <li key={s.name}>
                <a
                  href="#"
                  aria-label={s.name}
                  className="grid size-9 place-items-center rounded-full border border-zinc-800 transition-colors hover:border-orange-500 hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="currentColor"
                  >
                    <path d={s.d} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 @md:grid-cols-3 @3xl:contents">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-white">{col.title}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="mt-12 flex flex-col gap-2 border-t border-zinc-800 pt-6 text-xs @md:flex-row @md:justify-between">
        <p suppressHydrationWarning>
          © {THIS_YEAR} {brand}. All rights reserved.
        </p>
        <p className="flex gap-4">
          <a href="#" className="hover:text-white">
            Privacy
          </a>
          <a href="#" className="hover:text-white">
            Terms
          </a>
        </p>
      </div>
    </footer>
  );
}
