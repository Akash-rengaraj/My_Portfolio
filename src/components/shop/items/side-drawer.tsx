"use client";

import { useId, useRef, type ReactNode } from "react";

/**
 * A side sheet that slides in from the right — for carts, filters and
 * settings. Built on the native <dialog> for free focus trapping and Escape.
 */
export function SideDrawer({
  trigger = "Open cart",
  title = "Your cart",
  children,
}: {
  trigger?: string;
  title?: string;
  children?: ReactNode;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
      >
        {trigger} <span aria-hidden="true">→</span>
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(24rem,100%)] bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/50 dark:bg-zinc-900 dark:text-white"
      >
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-zinc-800">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-8 place-items-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-5">
            {children ?? (
              <ul className="space-y-4">
                {[
                  ["Canvas tote", "$24"],
                  ["Ceramic mug", "$18"],
                  ["Sticker pack", "$6"],
                ].map(([name, price]) => (
                  <li key={name} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="size-12 rounded-lg bg-linear-to-br from-orange-300 to-rose-400"
                    />
                    <span className="flex-1 text-sm font-medium">{name}</span>
                    <span className="text-sm text-zinc-500">{price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <footer className="border-t border-zinc-200 p-5 dark:border-zinc-800">
            <button
              type="button"
              className="w-full rounded-full bg-orange-500 py-3 text-sm font-semibold text-white"
            >
              Checkout
            </button>
          </footer>
        </div>
      </dialog>
    </>
  );
}
