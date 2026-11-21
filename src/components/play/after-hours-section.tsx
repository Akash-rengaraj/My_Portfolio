import { Passport } from "@/components/passport/passport";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { PaperEdge } from "@/components/world/paper-edge";
import { ScribbleArrow } from "@/components/world/scribble";

const HOW_TO = [
  "Every place on this page hides a little rubber stamp — eight in all.",
  "Spot one, click it, and it stamps your passport (and leaves an ink mark behind).",
  "Fill every page to earn the Golden Ticket, with your name on it.",
] as const;

/**
 * Chapter 05, after hours: time to look back at where you've been. The
 * section holds the visitor's passport for "Fill the Passport", the stamp
 * hunt that runs across the whole portfolio.
 */
export function AfterHoursSection() {
  return (
    <section
      id="play"
      aria-labelledby="play-title"
      className="dark relative overflow-hidden text-stage-foreground"
      style={{
        backgroundColor: "var(--bg-play)",
        backgroundImage:
          "radial-gradient(60% 50% at 50% 0%, var(--tint), transparent 70%), repeating-linear-gradient(135deg, var(--blueprint-line) 0 1px, transparent 1px 16px)",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-journey)]" variant="tornAlt" />
      <div className="relative mx-auto grid w-full max-w-[110rem] gap-12 px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 lg:grid-cols-12 lg:items-start xl:px-14">
        <div className="lg:col-span-4">
          <ChapterMarker
            chapter="afterHours"
            note="after hours — look back at where you've been."
          />
          <h2
            id="play-title"
            className="mt-6 font-heading text-6xl font-semibold tracking-tight md:text-7xl xl:text-8xl"
          >
            Fill the Passport
          </h2>
          <p className="mt-5 max-w-md text-lg leading-snug text-stage-foreground/75">
            You&apos;ve walked through my whole world. Did you collect the proof?
          </p>
          <ol className="mt-8 space-y-3">
            {HOW_TO.map((step, i) => (
              <li key={step} className="flex gap-3 text-stage-foreground/80">
                <span className="font-mono text-xs leading-6 text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 hidden items-center gap-2 font-hand text-2xl text-stage-muted lg:flex">
            start back at the top
            <ScribbleArrow className="h-8 w-10 -rotate-[100deg]" />
          </p>
        </div>

        <div className="lg:col-span-8">
          <Passport />
        </div>
      </div>
    </section>
  );
}
