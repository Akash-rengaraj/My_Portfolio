"use client";

import { useId, useRef } from "react";

/**
 * A confirm dialog built on the native <dialog>: the browser traps focus,
 * closes it on Escape and makes the page behind it inert. Clicking the
 * backdrop closes it too.
 */
export function ModalDialog({
  trigger = "Delete project",
  title = "Delete this project?",
  text = "This removes the project and its files for everyone. You can't undo it.",
  confirm = "Delete",
  onConfirm,
}: {
  trigger?: string;
  title?: string;
  text?: string;
  confirm?: string;
  onConfirm?: () => void;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
      >
        {trigger}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-2xl bg-white p-0 text-zinc-900 shadow-2xl backdrop:bg-zinc-950/60 backdrop:backdrop-blur-sm dark:bg-zinc-900 dark:text-white"
      >
        <div className="p-6">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-rose-500/15 text-xl text-rose-600"
          >
            !
          </span>
          <h2 id={titleId} className="mt-4 text-lg font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{text}</p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              autoFocus
              className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm?.();
                close();
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {confirm}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
