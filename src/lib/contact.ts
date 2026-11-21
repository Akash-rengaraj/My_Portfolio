/**
 * The contact postcard: no server, no third-party form service. The note is
 * turned into a `mailto:` link so it opens in the visitor's own email app
 * with everything filled in.
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

/** The `mailto:` link for a note, with subject and body encoded. */
export function buildMailto(to: string, note: Note): string {
  const topic = TOPICS.find((t) => t.id === note.topic) ?? TOPICS[3];
  const name = note.name.trim();
  const lines = ["Hi Akash,", "", note.message.trim(), "", `— ${name}`];
  if (note.goldenTicket)
    lines.push("", "P.S. I filled the whole passport and got the Golden Ticket.");
  const subject = `${topic.subject} — ${name}`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
}
