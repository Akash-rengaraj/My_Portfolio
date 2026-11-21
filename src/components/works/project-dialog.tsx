"use client";

import { Dialog } from "radix-ui";

import { PROJECTS, type Project } from "@/content/projects";
import { formatIndex } from "@/lib/works";

import { ProjectDetails } from "./project-details";
import { ProjectStage } from "./project-stage";

interface ProjectDialogProps {
  /** The project to show, or null when closed. */
  project: Project | null;
  /** Position within the visible list, for the "03 / 06" counter. */
  position: number;
  total: number;
  onClose: () => void;
  onStep: (direction: 1 | -1) => void;
  /** Called after the dialog closes, to restore focus to the tile. */
  onCloseFocus: () => void;
}

const iconButton =
  "grid size-11 place-items-center rounded-full border border-line-strong bg-tint text-stage-foreground transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";

/** Full case study in a modal panel, with previous/next browsing. */
export function ProjectDialog({
  project,
  position,
  total,
  onClose,
  onStep,
  onCloseFocus,
}: ProjectDialogProps) {
  const index = project ? PROJECTS.indexOf(project) : 0;
  return (
    <Dialog.Root open={project !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseFocus();
          }}
          className="fixed inset-0 z-[61] overflow-y-auto bg-stage text-stage-foreground outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-bottom-4 sm:inset-5 sm:rounded-[2rem] sm:border sm:border-line"
        >
          <Dialog.Title className="sr-only">{project?.title ?? "Project"}</Dialog.Title>
          {project ? (
            <>
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-stage/85 px-5 py-3 backdrop-blur-md sm:px-8">
                <p className="font-mono text-xs tracking-[0.18em] text-stage-muted uppercase">
                  <span className="text-signal">{formatIndex(position)}</span> /{" "}
                  {formatIndex(total - 1)} · my works
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous project"
                    onClick={() => onStep(-1)}
                    className={iconButton}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Next project"
                    onClick={() => onStep(1)}
                    className={iconButton}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <Dialog.Close aria-label="Close case study" className={iconButton}>
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
                </div>
              </div>
              <div
                key={project.slug}
                style={{ "--hue": project.hue } as React.CSSProperties}
                className="mx-auto w-full max-w-6xl px-5 pt-8 pb-16 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-3 sm:px-8"
              >
                <ProjectStage project={project} index={index} active />
                <ProjectDetails project={project} index={index} />
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
