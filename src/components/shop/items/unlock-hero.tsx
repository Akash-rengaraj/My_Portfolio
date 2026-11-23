"use client";

import { useEffect, useRef, useState } from "react";

const NOTES = [
  { icon: "🎸", app: "Music", time: "now", text: "New riff recorded — “late bus home”" },
  { icon: "🏆", app: "Hall of Fame", time: "2m", text: "Achievement unlocked: game #48 finished" },
  { icon: "📍", app: "Trips", time: "1h", text: "Checked in somewhere new 🌄" },
  { icon: "✍️", app: "Poems", time: "yesterday", text: "“rain doesn't ask, it just arrives…”" },
] as const;

const APPS = [
  { icon: "🎸", label: "Music", tint: "bg-orange-500", href: "#music" },
  { icon: "🏆", label: "Hall of Fame", tint: "bg-violet-500", href: "#games" },
  { icon: "🗺️", label: "Trips", tint: "bg-teal-500", href: "#trips" },
  { icon: "✍️", label: "Poems", tint: "bg-amber-100", href: "#poems" },
  { icon: "📸", label: "Gallery", tint: "bg-blue-600", href: "#gallery" },
  { icon: "💬", label: "Say hi", tint: "bg-emerald-500", href: "#contact" },
] as const;

const time = (d: Date) => `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

/**
 * "Unlock me" hero: the page becomes a phone lock screen — a live clock and
 * notifications landing one by one, each a recent thing from a part of your
 * life. Swipe up (or click) to unlock a home screen where every passion is
 * an app.
 */
export function UnlockHero({
  name = "Akash",
  notes = NOTES,
  apps = APPS,
}: {
  name?: string;
  notes?: readonly (typeof NOTES)[number][];
  apps?: readonly (typeof APPS)[number][];
}) {
  const [now, setNow] = useState<Date | null>(null);
  const [landed, setLanded] = useState(0);
  const [open, setOpen] = useState(false);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = requestAnimationFrame(tick);
    const clock = window.setInterval(tick, 10_000);
    return () => {
      cancelAnimationFrame(first);
      window.clearInterval(clock);
    };
  }, []);

  useEffect(() => {
    if (open) return;
    const timers = notes.map((_, i) => window.setTimeout(() => setLanded(i + 1), 500 + i * 900));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [open, notes]);

  const unlock = () => setOpen(true);
  const lock = () => {
    setLanded(0);
    setOpen(false);
  };

  return (
    <section
      aria-label={`${name}'s phone`}
      className="relative h-full min-h-[32rem] w-full overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#1b1b22,#0a0a0b_60%,#1a1208)] text-white"
    >
      {/* Home screen */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 p-8"
        inert={!open}
      >
        <p className="font-['Caveat',cursive] text-5xl text-orange-200">welcome in.</p>
        <ul className="grid grid-cols-3 gap-x-8 gap-y-6">
          {apps.map((app, i) => (
            <li key={app.label}>
              <a
                href={app.href}
                className="flex flex-col items-center gap-2 text-xs transition-[scale,opacity] duration-500 ease-[cubic-bezier(.2,1.4,.4,1)]"
                style={{
                  transitionDelay: open ? `${i * 60}ms` : "0ms",
                  scale: open ? "1" : "0.4",
                  opacity: open ? 1 : 0,
                }}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-16 place-items-center rounded-2xl text-3xl shadow-lg ${app.tint}`}
                >
                  {app.icon}
                </span>
                {app.label}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={lock}
          className="font-mono text-[11px] tracking-[0.15em] text-white/50 uppercase hover:text-white"
        >
          lock again
        </button>
      </div>

      {/* Lock screen */}
      <div
        inert={open}
        onPointerDown={(e) => {
          startY.current = e.clientY;
        }}
        onPointerUp={(e) => {
          if (startY.current !== null && startY.current - e.clientY > 40) unlock();
          startY.current = null;
        }}
        className={`absolute inset-0 flex flex-col items-center bg-[linear-gradient(160deg,#1b1b22,#0a0a0b_60%,#1a1208)] px-6 pt-12 transition-[translate,opacity] duration-700 ease-[cubic-bezier(.7,0,.2,1)] ${open ? "-translate-y-full opacity-20" : ""}`}
      >
        <p
          className="text-7xl font-extralight tracking-tight tabular-nums"
          suppressHydrationWarning
        >
          {now ? time(now) : "--:--"}
        </p>
        <p className="mt-2 mb-8 text-sm text-white/70">{name}&apos;s phone</p>
        <ul className="w-full max-w-sm space-y-2" aria-live="polite">
          {notes.map((note, i) => (
            <li
              key={note.text}
              className={`flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5 text-sm backdrop-blur transition-[opacity,translate,scale] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${i < landed ? "" : "-translate-y-3 scale-95 opacity-0"}`}
            >
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xl"
              >
                {note.icon}
              </span>
              <span>
                <span className="block text-[11px] tracking-wide text-white/55 uppercase">
                  {note.app} · {note.time}
                </span>
                {note.text}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={unlock}
          className="mt-auto mb-5 flex flex-col items-center gap-3 font-mono text-[11px] tracking-[0.15em] text-white/60 uppercase"
        >
          swipe up or tap to unlock
          <span aria-hidden="true" className="h-1.5 w-28 rounded-full bg-white/70" />
        </button>
      </div>
    </section>
  );
}
