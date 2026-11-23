"use client";

import { useId, useState, type FormEvent } from "react";

type Fields = { name: string; email: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a message for every field that isn't filled in properly. */
export function validateContact(fields: Fields): Errors {
  const errors: Errors = {};
  if (fields.name.trim().length < 2) errors.name = "Tell me your name.";
  if (!EMAIL.test(fields.email.trim())) errors.email = "That email doesn't look right.";
  if (fields.message.trim().length < 10) errors.message = "Say a little more (10+ characters).";
  return errors;
}

const input =
  "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 aria-invalid:border-rose-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white";

/**
 * A contact form with inline validation, accessible error messages, a
 * sending state and a success screen. Pass `onSend` to deliver the message
 * (an API route, a form service, a mailto link…).
 */
export function ContactForm({ onSend }: { onSend?: (fields: Fields) => Promise<void> }) {
  const id = useId();
  const [fields, setFields] = useState<Fields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const set = (key: keyof Fields) => (value: string) => setFields((f) => ({ ...f, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateContact(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStatus("sending");
    try {
      await (onSend ? onSend(fields) : new Promise<void>((resolve) => setTimeout(resolve, 900)));
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div
        role="status"
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center dark:bg-zinc-950"
      >
        <p className="text-4xl" aria-hidden="true">
          📬
        </p>
        <h2 className="mt-3 text-xl font-bold text-zinc-900 dark:text-white">Message sent!</h2>
        <p className="mt-1 text-sm text-zinc-500">I&apos;ll get back to you within a day.</p>
      </div>
    );
  }

  const field = (key: keyof Fields, label: string, multiline = false) => {
    const fieldId = `${id}-${key}`;
    const errorId = `${fieldId}-error`;
    const props = {
      id: fieldId,
      value: fields[key],
      "aria-invalid": errors[key] ? true : undefined,
      "aria-describedby": errors[key] ? errorId : undefined,
      className: input,
    };
    return (
      <div>
        <label htmlFor={fieldId} className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
          {label}
        </label>
        {multiline ? (
          <textarea {...props} rows={4} onChange={(e) => set(key)(e.target.value)} />
        ) : (
          <input
            {...props}
            type={key === "email" ? "email" : "text"}
            onChange={(e) => set(key)(e.target.value)}
          />
        )}
        {errors[key] ? (
          <p id={errorId} className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
            {errors[key]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form
      onSubmit={(e) => void submit(e)}
      noValidate
      className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-xl shadow-black/5 dark:bg-zinc-950"
    >
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Get in touch</h2>
      {field("name", "Name")}
      {field("email", "Email")}
      {field("message", "Message", true)}
      {status === "failed" ? (
        <p role="alert" className="text-sm text-rose-600">
          Something went wrong — please try again.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
