import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { author } from "@/config/site";

const LINKS = [
  { href: "#hero", label: "the desk" },
  { href: "#works", label: "the pinboard" },
  { href: "#toolkit", label: "the workbench" },
  { href: "#shop", label: "the shop" },
  { href: "#certifications", label: "the frame wall" },
  { href: "#scoreboard", label: "the scoreboard" },
  { href: "#journey", label: "the road" },
  { href: "#play", label: "after hours" },
  { href: "#contact", label: "the door" },
] as const;

/** Sign-off: a handwritten thank-you, the chapter map and a way back up. */
export function SiteFooter() {
  return (
    <footer className="dark relative bg-[var(--bg-footer)] text-stage-foreground">
      <div className="mx-auto w-full max-w-[110rem] px-6 pb-10 sm:px-10 xl:px-14">
        <div className="flex flex-col gap-10 border-t border-dashed border-line-strong pt-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="-rotate-1 font-hand text-4xl leading-tight md:text-5xl">
              thanks for scrolling all the way down.
            </p>
            <p className="mt-4 max-w-lg text-stage-foreground/70">
              Designed and built from scratch by {author.name} — every scene, card and game on this
              page.
            </p>
          </div>

          <nav aria-label="Chapters">
            <ol className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs tracking-[0.14em] uppercase sm:grid-cols-3">
              {LINKS.map((link, i) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-stage-foreground/75 transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <span className="text-signal">{String(i + 1).padStart(2, "0")}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
          <span className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-md border border-line text-[10px] font-semibold text-signal"
            >
              {"{ }"}
            </span>
            © {author.name}
            <HiddenStamp id="afterHours" className="relative inline-block" />
          </span>
          <a
            href="#main"
            className="inline-flex items-center gap-2 transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            back to the top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
