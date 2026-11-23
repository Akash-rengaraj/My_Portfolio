"use client";

import { useId, useState, type FormEvent } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A call-to-action band with an email sign-up. Validates the address, shows
 * an inline error, and swaps to a thank-you message on success. Wire
 * `onSubmit` to your mailing list.
 */
export function CtaBanner({
  title = "Ready to build something great?",
  text = "Join 2,000+ makers getting one useful idea every Friday.",
  onSubmit,
}: {
  title?: string;
  text?: string;
  onSubmit?: (email: string) => void;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onSubmit?.(email.trim());
    setDone(true);
  };

  return (
    <section className="@container relative w-full overflow-hidden rounded-3xl bg-linear-to-br from-orange-500 via-rose-500 to-violet-600 px-6 py-12 text-white @3xl:px-12">
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 size-72 rounded-full bg-white/15 blur-2xl"
      />
      <div className="relative grid items-center gap-8 @3xl:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-balance">{title}</h2>
          <p className="mt-2 text-white/85">{text}</p>
        </div>
        {done ? (
          <p role="status" className="rounded-2xl bg-white/15 p-4 font-medium">
            🎉 You&apos;re in! Check your inbox to confirm.
          </p>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-2">
            <div className="flex gap-2 rounded-full bg-white p-1.5">
              <label htmlFor={id} className="sr-only">
                Email address
              </label>
              <input
                id={id}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
              >
                Subscribe
              </button>
            </div>
            {error ? (
              <p id={`${id}-error`} className="px-4 text-sm font-medium text-white">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
