"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";

import { HiddenStamp } from "@/components/passport/hidden-stamp";
import { TOTAL_STAMPS, useStamps } from "@/components/passport/stamp-store";
import { Reveal } from "@/components/works/reveal";
import { ChapterMarker } from "@/components/world/chapter-marker";
import { ResumeIcon } from "@/components/site/resume-icon";
import { handOffTicket, type TicketHandoff } from "@/components/passport/ticket-image";
import { PaperEdge } from "@/components/world/paper-edge";
import { RESUME_FILE, RESUME_PATH } from "@/config/resume";
import { author, contact } from "@/config/site";
import {
  buildGmailCompose,
  buildMailto,
  LIMITS,
  ticketFor,
  TOPICS,
  validateNote,
  type NoteErrors,
  type TopicId,
} from "@/lib/contact";

const PAPER = "#fbf8f1";
const INK = "#2a2620";
/** Red / blue airmail stripes around the postcard. */
const AIRMAIL =
  "repeating-linear-gradient(135deg, #c8372d 0 14px, #fbf8f1 14px 22px, #1f4e9c 22px 36px, #fbf8f1 36px 44px)";

/* ---------------------------------------------------------------- icons */

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
      {children}
    </svg>
  );
}

const ICONS = {
  email: (
    <Icon>
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.2V17h16V7.2l-8 5.3-8-5.3ZM5.4 7l6.6 4.4L18.6 7H5.4Z" />
    </Icon>
  ),
  linkedin: (
    <Icon>
      <path d="M4.98 3.5A2.48 2.48 0 1 1 5 8.46 2.48 2.48 0 0 1 4.98 3.5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.84-2.06 3.78-2.06 4.04 0 4.79 2.66 4.79 6.12V21h-4v-4.98c0-1.19-.02-2.72-1.66-2.72-1.66 0-1.91 1.3-1.91 2.63V21h-4V9.75Z" />
    </Icon>
  ),
  github: (
    <Icon>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </Icon>
  ),
  x: (
    <Icon>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.32l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </Icon>
  ),
} as const;

function handleOf(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

const LINKS = [
  { id: "linkedin", label: "LinkedIn", href: contact.linkedin, icon: ICONS.linkedin },
  { id: "github", label: "GitHub", href: contact.github, icon: ICONS.github },
  { id: "x", label: "X", href: contact.x, icon: ICONS.x },
] as const;

/* --------------------------------------------------------------- pieces */

/** A perforated postage stamp with the site's mark on it. */
function PostageStamp() {
  return (
    <div
      aria-hidden="true"
      className="relative grid h-24 w-20 shrink-0 rotate-3 place-items-center bg-[#1e2a4a] p-1.5 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.4)]"
      // Perforated edge: a dotted outline in the card's paper colour.
      style={{ outline: `4px dotted ${PAPER}`, outlineOffset: "-2px" }}
    >
      <div className="grid size-full place-items-center border border-[#e8c15a]/60 text-center">
        <span className="font-mono text-xl font-bold text-[#e8c15a]">{"{ }"}</span>
        <span className="font-mono text-[7px] tracking-[0.2em] text-[#e8c15a]/80 uppercase">
          priceless
        </span>
      </div>
    </div>
  );
}

/** The round postmark that lands when the card is sent. */
function Postmark() {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="pointer-events-none absolute -top-6 right-14 size-28 -rotate-12 text-[#9f1239] opacity-85 motion-safe:animate-[stamp-thunk_0.45s_cubic-bezier(0.2,1.4,0.5,1)_both]"
    >
      <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="36" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fontSize="15"
        fontWeight="800"
        fill="currentColor"
        className="font-mono"
      >
        POSTED
      </text>
      <text
        x="60"
        y="72"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill="currentColor"
        className="font-mono"
      >
        COIMBATORE · IN
      </text>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M104 ${44 + i * 10} q8 -5 16 0 t16 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------- section */

/**
 * "Let's build something" — chapter 08, the door. A postcard the visitor
 * writes to me: pick a topic, write a note, sign it, send. It's postmarked,
 * then opens Gmail's compose window in a new tab, pre-filled (no desktop email
 * app needed; a mailto: link is offered as the fallback — no server, nothing
 * stored). Direct links sit alongside, with one-click copy for the email.
 */
export function ContactSection() {
  const ids = useId();
  const stamps = useStamps();
  const goldenTicket = stamps.length >= TOTAL_STAMPS;
  const [topic, setTopic] = useState<TopicId>("internship");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<NoteErrors>({});
  const [posted, setPosted] = useState(false);
  const [links, setLinks] = useState<{ gmail: string; mailto: string } | null>(null);
  const [ticket, setTicket] = useState<TicketHandoff | null>(null);
  const [copied, setCopied] = useState(false);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validateNote({ name, message });
    setErrors(found);
    if (found.name || found.message) return;
    const note = { name, topic, message, goldenTicket };
    const gmail = buildGmailCompose(contact.email, note);
    setLinks({ gmail, mailto: buildMailto(contact.email, note) });
    setPosted(true);
    // Email links can't attach files, so the ticket image goes to the clipboard
    // (or downloads) for pasting in. Started before the new tab takes focus.
    if (goldenTicket) {
      const { holder, serial } = ticketFor(name);
      void handOffTicket(holder, serial).then(setTicket);
    }
    // Opened synchronously inside the click so popup blockers allow it.
    window.open(gmail, "_blank", "noopener,noreferrer");
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (permissions / insecure context): the address is visible to copy by hand.
      setCopied(false);
    }
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative bg-[var(--bg-contact)] text-stage-foreground"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 30% 20%, var(--tint), transparent 70%), radial-gradient(var(--board-dot) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 32px 32px",
      }}
    >
      <PaperEdge colorClass="text-[var(--bg-play)]" />
      <div className="mx-auto w-full max-w-[110rem] px-6 pt-28 pb-24 sm:px-10 md:pt-36 md:pb-32 xl:px-14">
        <Reveal>
          <div className="max-w-3xl">
            <ChapterMarker chapter="door" note="you made it to the end — knock knock." />
            <h2
              id="contact-title"
              className="mt-6 font-heading text-6xl font-semibold tracking-tight text-balance md:text-8xl"
            >
              Let&apos;s build something.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-snug text-stage-foreground/75">
              Got a problem worth solving, a project, or just want to say hi? Write me a postcard —
              it lands straight in my inbox.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* The postcard */}
          <Reveal className="lg:col-span-7">
            <div
              className="rounded-xl p-[7px] shadow-[0_40px_70px_-40px_var(--shadow-ink)]"
              style={{ background: AIRMAIL }}
            >
              <form
                onSubmit={send}
                noValidate
                aria-label="Write me a postcard"
                className="relative grid gap-6 rounded-lg p-5 sm:grid-cols-[1fr_auto_15rem] sm:p-7"
                style={{ background: PAPER, color: INK }}
              >
                {posted ? <Postmark /> : null}

                {/* Message side */}
                <div className="flex min-w-0 flex-col gap-4">
                  <fieldset>
                    <legend className="font-mono text-[10px] tracking-[0.2em] text-[#6b665d] uppercase">
                      what&apos;s it about?
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {TOPICS.map((t) => (
                        <label
                          key={t.id}
                          className="cursor-pointer rounded-full border border-[#2a2620]/20 px-3 py-1 text-xs transition-colors has-checked:border-[#2a2620] has-checked:bg-[#2a2620] has-checked:text-[#fbf8f1] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-signal"
                        >
                          <input
                            type="radio"
                            name="topic"
                            value={t.id}
                            checked={topic === t.id}
                            onChange={() => setTopic(t.id)}
                            className="sr-only"
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor={`${ids}-message`} className="font-hand text-2xl leading-none">
                      Dear Akash,
                    </label>
                    <textarea
                      id={`${ids}-message`}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={LIMITS.message.max}
                      rows={6}
                      placeholder="Write your note here…"
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? `${ids}-message-error` : undefined}
                      className="mt-1 block w-full resize-none bg-transparent font-hand text-2xl leading-[2rem] text-[#1d2a4a] outline-none placeholder:text-[#2a2620]/35"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(transparent 0 calc(2rem - 1px), rgba(31,78,156,0.18) calc(2rem - 1px) 2rem)",
                      }}
                    />
                    {errors.message ? (
                      <p id={`${ids}-message-error`} className="mt-1 text-xs text-[#c8372d]">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-end gap-2">
                    <span aria-hidden="true" className="pb-1 font-hand text-2xl">
                      —
                    </span>
                    <div className="min-w-0 flex-1">
                      <label htmlFor={`${ids}-name`} className="sr-only">
                        Your name
                      </label>
                      <input
                        id={`${ids}-name`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={LIMITS.name.max}
                        autoComplete="name"
                        placeholder="your name"
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? `${ids}-name-error` : undefined}
                        className="w-full border-b border-[#2a2620]/30 bg-transparent pb-1 font-hand text-2xl text-[#1d2a4a] outline-none placeholder:text-[#2a2620]/35 focus:border-[#2a2620]"
                      />
                      {errors.name ? (
                        <p id={`${ids}-name-error`} className="mt-1 text-xs text-[#c8372d]">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <span aria-hidden="true" className="hidden w-px bg-[#2a2620]/15 sm:block" />

                {/* Address side */}
                <div className="flex flex-col gap-5">
                  <div className="flex justify-end">
                    <PostageStamp />
                  </div>
                  <address className="space-y-3 not-italic">
                    {[author.name, "Coimbatore, Tamil Nadu", "India"].map((line) => (
                      <p
                        key={line}
                        className="border-b border-[#2a2620]/25 pb-1 font-hand text-xl leading-none"
                      >
                        {line}
                      </p>
                    ))}
                  </address>
                  {goldenTicket ? (
                    <p className="rounded-md bg-[#f3d77a]/60 px-2.5 py-1.5 text-xs font-medium">
                      🎟 Golden Ticket holder — your ticket image comes along to paste into the
                      email.
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={posted}
                    className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2a2620] px-5 font-mono text-xs tracking-[0.14em] text-[#fbf8f1] uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal disabled:opacity-70"
                  >
                    {posted ? "posted ✓" : "send postcard →"}
                  </button>
                </div>
              </form>
            </div>
            <p aria-live="polite" className="mt-4 min-h-5 text-sm text-stage-muted">
              {posted && links ? (
                <>
                  Gmail opened in a new tab with your note ready to send. Didn&apos;t open?{" "}
                  <a
                    href={links.gmail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-stage-foreground underline underline-offset-4"
                  >
                    Open Gmail
                  </a>
                  {" · "}
                  <a
                    href={links.mailto}
                    className="font-medium text-stage-foreground underline underline-offset-4"
                  >
                    use another email app
                  </a>
                  {" · or write to "}
                  {contact.email}.
                  {ticket === "copied" ? (
                    <span className="mt-2 block font-medium text-stage-foreground">
                      🎟 Your Golden Ticket image is copied — click into the email and press Ctrl+V
                      (⌘V on Mac) to paste it in.
                    </span>
                  ) : null}
                  {ticket === "saved" ? (
                    <span className="mt-2 block font-medium text-stage-foreground">
                      🎟 Your Golden Ticket image was downloaded — attach golden-ticket.png to the
                      email.
                    </span>
                  ) : null}
                </>
              ) : (
                "Opens Gmail in a new tab, ready to send — nothing is stored here."
              )}
            </p>
          </Reveal>

          {/* Direct lines */}
          <Reveal className="lg:col-span-5" delay={120}>
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_18px_36px_-26px_var(--shadow-ink)] sm:p-7">
              <p className="font-mono text-[11px] tracking-[0.18em] text-stage-muted uppercase">
                or reach me directly
              </p>

              {/* Email, with copy */}
              <div className="relative mt-5 flex items-center gap-4 rounded-xl border border-line p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-stage-foreground text-stage">
                  {ICONS.email}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
                    email
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="block truncate font-medium underline-offset-4 hover:text-signal hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    {contact.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label="Copy email address"
                  className="shrink-0 rounded-full border border-line-strong px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span aria-live="polite">{copied ? "copied ✓" : "copy"}</span>
                </button>
                <HiddenStamp id="door" className="absolute -top-4 -right-3" />
              </div>

              {/* Résumé: view in the browser or download */}
              <div className="mt-3 flex flex-wrap items-center gap-4 rounded-xl border border-line p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-signal/15 text-signal">
                  <ResumeIcon className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
                    résumé · pdf
                  </p>
                  <p className="truncate font-medium">{RESUME_FILE}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={RESUME_PATH}
                    target="_blank"
                    rel="noopener"
                    className="rounded-full bg-stage-foreground px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-stage uppercase transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    view ↗
                  </a>
                  <a
                    href={RESUME_PATH}
                    download={RESUME_FILE}
                    className="rounded-full border border-line-strong px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    download ↓
                  </a>
                </div>
              </div>

              {/* Socials */}
              <ul className="mt-3 grid gap-3">
                {LINKS.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 rounded-xl border border-line p-4 transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-tint">
                        {link.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[10px] tracking-[0.16em] text-stage-muted uppercase">
                          {link.label}
                        </span>
                        <span className="block truncate font-medium">{handleOf(link.href)}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-stage-muted transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-signal"
                      >
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-line pt-5 text-sm leading-relaxed text-stage-foreground/75">
                Based in{" "}
                <span className="font-medium text-stage-foreground">{author.location}</span> (IST,
                UTC+5:30). Studying AI &amp; Data Science and freelancing alongside.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
