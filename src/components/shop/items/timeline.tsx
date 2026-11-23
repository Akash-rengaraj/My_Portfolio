const EVENTS = [
  {
    date: "Today",
    title: "Shipped v2.0",
    text: "New editor, faster sync and dark mode.",
    tone: "bg-orange-500",
  },
  {
    date: "Last week",
    title: "Hit 10,000 users",
    text: "Thank you, every one of you.",
    tone: "bg-emerald-500",
  },
  {
    date: "March",
    title: "Raised a seed round",
    text: "To hire four more people.",
    tone: "bg-sky-500",
  },
  {
    date: "January",
    title: "Started the company",
    text: "Two laptops and a whiteboard.",
    tone: "bg-zinc-400",
  },
] as const;

/**
 * A vertical timeline for changelogs, histories and order tracking: dated
 * entries on a line, each with a coloured marker.
 */
export function Timeline({
  events = EVENTS,
}: {
  events?: readonly { date: string; title: string; text: string; tone: string }[];
}) {
  return (
    <ol className="relative w-full max-w-sm border-l-2 border-zinc-200 pl-6 dark:border-zinc-800">
      {events.map((event) => (
        <li key={event.title} className="relative pb-7 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute top-1 -left-[33px] size-4 rounded-full border-4 border-white dark:border-zinc-950 ${event.tone}`}
          />
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {event.date}
          </p>
          <h3 className="mt-0.5 font-semibold text-zinc-900 dark:text-white">{event.title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.text}</p>
        </li>
      ))}
    </ol>
  );
}
