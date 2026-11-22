import type { Project } from "@/content/projects";
import { formatIndex, splitTitle } from "@/lib/works";

import { Lightbox } from "./lightbox";
import { LoadingImage } from "@/components/ui/loading-image";

const STEPS = ["challenge", "solution", "impact"] as const;

function ArrowUpRight() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const linkClass =
  "inline-flex h-11 items-center gap-2 rounded-full px-5 font-mono text-xs tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal";

/** Everything about one project below its stage: header, links, overview and case study. */
export function ProjectDetails({ project, index }: { project: Project; index: number }) {
  const { name, subtitle } = splitTitle(project.title);
  const shipped = project.status === "shipped";

  return (
    <div className="mt-10 space-y-12">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-stage-muted uppercase">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-tint px-3 py-1">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${shipped ? "bg-ok" : "bg-warn"}`}
              />
              issue #{formatIndex(index)} · {shipped ? "fixed & shipped" : "in progress"}
            </span>
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.duration}</span>
          </p>
          <h3 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance md:text-5xl">
            {name}
          </h3>
          {subtitle ? <p className="mt-2 text-lg text-stage-foreground/70">{subtitle}</p> : null}
          <p className="mt-4 text-xl leading-snug text-balance text-stage-foreground/90 md:text-2xl">
            {project.tagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.links.live ? (
            <a
              href={project.links.live}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkClass} bg-signal text-stage hover:brightness-110`}
            >
              live site <ArrowUpRight />
            </a>
          ) : null}
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkClass} border border-line-strong text-stage-foreground hover:border-signal hover:text-signal`}
          >
            source <ArrowUpRight />
          </a>
        </div>
      </header>

      <div className="flex flex-wrap gap-2" aria-label="Tech stack" role="list">
        {project.stack.map((tech) => (
          <span
            key={tech}
            role="listitem"
            className="rounded-full border border-line bg-tint px-3.5 py-1.5 font-mono text-xs text-stage-foreground/85"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* Overview */}
        <div className="space-y-8 lg:col-span-7">
          <div className="space-y-4 text-base leading-relaxed text-stage-foreground/80">
            {project.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="font-mono text-xs tracking-[0.2em] text-signal uppercase">{project.role}</p>

          {project.features.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border border-line bg-tint p-5 transition-colors hover:border-[color-mix(in_srgb,var(--hue)_55%,transparent)]"
                >
                  <p className="font-heading text-base font-semibold">{feature.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stage-foreground/70">
                    {feature.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.extras.map((extra) => (
                <li
                  key={extra}
                  className="rounded-2xl border border-line bg-tint p-5 text-sm leading-relaxed text-stage-foreground/80"
                >
                  {extra}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Case study: challenge → solution → impact */}
        <ol className="relative space-y-8 border-l border-line pl-8 lg:col-span-5">
          {STEPS.map((step, i) => (
            <li key={step} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-0.5 -left-[2.65rem] grid size-8 place-items-center rounded-full border border-line-strong bg-stage font-mono text-[11px] text-signal"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h4 className="font-mono text-xs tracking-[0.2em] text-signal uppercase">{step}</h4>
              {step === "impact" ? (
                <ul className="mt-3 space-y-2.5">
                  {project.impact.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-stage-foreground/85"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="mt-0.5 size-4 shrink-0 text-ok"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-stage-foreground/80">
                  {project[step]}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>

      {project.gallery.length > 0 ? (
        <div>
          <h4 className="font-mono text-xs tracking-[0.2em] text-stage-muted uppercase">gallery</h4>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {project.gallery.map((image) => (
              <li key={image.src}>
                <Lightbox image={image}>
                  <LoadingImage
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 40vw, 90vw"
                    className="h-64 w-full rounded-2xl border border-line object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </Lightbox>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
