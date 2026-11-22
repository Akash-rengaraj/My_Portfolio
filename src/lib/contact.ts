/**
 * The contact postcard: no server, no third-party form service. The note is
 * turned into a Gmail compose link (opens in the browser, so it works without
 * a desktop email app) with a `mailto:` link as the fallback for other apps.
 */

export const TOPICS = [
  { id: "internship", label: "Internship / job", subject: "An opportunity for you" },
  { id: "freelance", label: "Freelance project", subject: "A project I'd like your help with" },
  { id: "collab", label: "Collaboration", subject: "Let's build something together" },
  { id: "hello", label: "Just saying hi", subject: "Hello from your portfolio" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];

export interface Note {
  name: string;
  topic: TopicId;
  message: string;
  /** True when the visitor filled the passport (adds a P.S.). */
  goldenTicket?: boolean;
}

export const LIMITS = { name: { min: 2, max: 60 }, message: { min: 10, max: 2000 } } as const;

export interface NoteErrors {
  name?: string;
  message?: string;
}

/** Friendly validation messages, or an empty object when the note is good to go. */
export function validateNote(note: Pick<Note, "name" | "message">): NoteErrors {
  const errors: NoteErrors = {};
  const name = note.name.trim();
  const message = note.message.trim();
  if (name.length < LIMITS.name.min) errors.name = "Sign it with your name.";
  else if (name.length > LIMITS.name.max) errors.name = "That name is a little long.";
  if (message.length < LIMITS.message.min)
    errors.message = "Write a little more — a sentence or two.";
  else if (message.length > LIMITS.message.max)
    errors.message = "That's a long one! Trim it a bit.";
  return errors;
}

/** Subject line and plain-text body for a note. */
export function composeNote(note: Note): { subject: string; body: string } {
  const topic = TOPICS.find((t) => t.id === note.topic) ?? TOPICS[3];
  const name = note.name.trim();
  const lines = ["Hi Akash,", "", note.message.trim(), "", `— ${name}`];
  if (note.goldenTicket)
    lines.push("", "P.S. I filled the whole passport and got the Golden Ticket.");
  return { subject: `${topic.subject} — ${name}`, body: lines.join("\n") };
}

/** The `mailto:` link for a note, with subject and body encoded. */
export function buildMailto(to: string, note: Note): string {
  const { subject, body } = composeNote(note);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Gmail's web compose window for a note, pre-filled and ready to send. */
export function buildGmailCompose(to: string, note: Note): string {
  const { subject, body } = composeNote(note);
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: subject, body });
  return `https://mail.google.com/mail/?${params.toString()}`;
}
