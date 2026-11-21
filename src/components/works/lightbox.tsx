"use client";

import Image from "next/image";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

interface LightboxProps {
  image: { src: string; alt: string; width: number; height: number };
  /** The thumbnail; it becomes the button that opens the full image. */
  children: ReactNode;
}

/** Click-to-enlarge image. Radix handles focus trapping, Escape and scroll lock. */
export function Lightbox({ image, children }: LightboxProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        aria-label={`Enlarge: ${image.alt}`}
        className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        {children}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-4 z-[61] flex items-center justify-center outline-none sm:inset-10"
        >
          <Dialog.Title className="sr-only">{image.alt}</Dialog.Title>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="100vw"
            className="max-h-full w-auto max-w-full rounded-2xl border border-line object-contain"
          />
          <Dialog.Close
            aria-label="Close"
            className="absolute top-0 right-0 grid size-11 place-items-center rounded-full border border-line-strong bg-stage/80 text-stage-foreground backdrop-blur hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
