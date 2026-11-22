"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from "react";

import { LoadingImage } from "@/components/ui/loading-image";
import type { Project } from "@/content/projects";
import { formatIndex, splitTitle, tiltFor } from "@/lib/works";

import { useInView } from "./use-in-view";
import { useReducedMotion } from "./use-reduced-motion";

const MAX_TILT = 6;

/** Each card is pinned slightly crooked; it straightens when you pick it up. */
const REST_TILT = [-1.4, 0.9, -0.7, 1.2, -1, 0.6] as const;
const TAPE_TILT = [-4, 3, -2, 5, -3, 2] as const;

interface ProjectTileProps {
  project: Project;
  /** Zero-based position in the full project list. */
  index: number;
  /** True when a technology filter is active and this project doesn't use it. */
  dimmed: boolean;
  onOpen: (slug: string) => void;
  /** Reports hover so the technologies tile can light up this project's stack. */
  onHover: (slug: string | null) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

interface MediaProps {
  project: Project;
  videoRef: RefObject<HTMLVideoElement | null>;
  onTime: (fraction: number) => void;
  onPlayingChange: (playing: boolean) => void;
}

/** The project's real preview in its native device: a browser window or a phone. */
function TileMedia({ project, videoRef, onTime, onPlayingChange }: MediaProps) {
  const screen = (
    <>
      <LoadingImage
        src={project.media.poster}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
        className="object-cover object-top"
      />
      <video
        ref={videoRef}
        src={project.media.video}
        poster={project.media.poster}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        data-playing="false"
        onPlaying={(e) => {
          e.currentTarget.dataset.playing = "true";
          onPlayingChange(true);
        }}
        onPause={() => onPlayingChange(false)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration > 0) onTime(v.currentTime / v.duration);
        }}
        className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-500 data-[playing=true]:opacity-100"
      />
    </>
  );

  if (project.frame === "phone") {
    return (
      <span className="relative flex size-full items-center justify-center overflow-hidden rounded-2xl bg-[color-mix(in_srgb,var(--hue)_14%,var(--surface))]">
        {/* The app's own screen, blurred, as the backdrop */}
        <Image
          src={project.media.poster}
          alt=""
          fill
          sizes="33vw"
          className="scale-125 object-cover opacity-25 blur-2xl dark:opacity-35"
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(55% 60% at 50% 50%, color-mix(in srgb, var(--hue) 30%, transparent), transparent 75%)",
          }}
        />
        <span className="relative block aspect-[9/19.5] h-[88%] overflow-hidden rounded-[1.6rem] border-[5px] border-[#1d1f25] bg-black shadow-[0_30px_50px_-18px_var(--shadow-ink)] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-2">
          {screen}
          <span className="absolute top-1.5 left-1/2 z-10 h-3 w-12 -translate-x-1/2 rounded-full bg-black" />
        </span>
      </span>
    );
  }

  const host = splitTitle(project.title)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return (
    <span className="flex size-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_22px_40px_-26px_var(--shadow-ink)]">
      <span className="flex h-7 shrink-0 items-center gap-1.5 border-b border-line bg-tint px-3">
        {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
          <span
            key={color}
            className="size-2 rounded-full opacity-80"
            style={{ background: color }}
          />
        ))}
        <span className="mx-auto max-w-[60%] truncate rounded-md bg-tint px-2.5 py-px font-mono text-[10px] text-stage-muted">
          {host}.app
        </span>
      </span>
      <span className="relative block min-h-0 flex-1 overflow-hidden bg-black">
        <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.03]">
          {screen}
        </span>
      </span>
    </span>
  );
}

/**
 * One card pinned to the board: taped on slightly crooked, it straightens and
 * lifts when picked up, tilts toward the pointer with a glare, and opens the
 * case study. Its live preview autoplays inside the device frame (with a
 * progress bar) while the card is on screen, and pauses when scrolled away.
 */
export function ProjectTile({
  project,
  index,
  dimmed,
  onOpen,
  onHover,
  buttonRef,
}: ProjectTileProps) {
  const cardRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(mediaRef, "200px");
  const [playing, setPlaying] = useState(false);
  const { name } = splitTitle(project.title);
  const shipped = project.status === "shipped";
  const chips = 4;

  // Autoplay (muted, looping) only while on screen; the poster stays for reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !reduced) void video.play().catch(() => undefined);
    else video.pause();
  }, [inView, reduced]);

  const resetTilt = () => {
    onHover(null);
    const card = cardRef.current;
    if (card) {
      card.style.transform = "";
      card.style.setProperty("--glare", "0");
    }
  };

  const onMove = (event: PointerEvent<HTMLButtonElement>) => {
    const card = cardRef.current;
    if (!card || event.pointerType === "touch" || reduced) return;
    const rect = card.getBoundingClientRect();
    const { rx, ry } = tiltFor(event.clientX, event.clientY, rect, MAX_TILT);
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    card.style.setProperty("--glare", "1");
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`Open case study: ${name}`}
      data-dim={dimmed}
      onClick={() => onOpen(project.slug)}
      onPointerEnter={(event) => event.pointerType === "mouse" && onHover(project.slug)}
      onPointerLeave={resetTilt}
      onPointerMove={onMove}
      onFocus={() => onHover(project.slug)}
      onBlur={resetTilt}
      style={
        {
          "--hue": project.hue,
          "--rest": `${REST_TILT[index % REST_TILT.length]}deg`,
        } as CSSProperties
      }
      className="group relative block h-full w-full rotate-[var(--rest)] rounded-[1.75rem] text-left transition-[opacity,filter,rotate] duration-500 ease-out [perspective:1200px] hover:rotate-0 focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal data-[dim=true]:opacity-30 data-[dim=true]:saturate-50 motion-reduce:rotate-0"
    >
      {/* Washi tape holding the card to the board */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 z-30 h-7 w-28 -translate-x-1/2 opacity-90 mix-blend-multiply transition-transform duration-500 group-hover:-translate-y-1 dark:opacity-70 dark:mix-blend-normal"
        style={{
          rotate: `${TAPE_TILT[index % TAPE_TILT.length]}deg`,
          background:
            "repeating-linear-gradient(45deg, color-mix(in srgb, var(--hue) 45%, #fff6e0) 0 8px, color-mix(in srgb, var(--hue) 32%, #fff6e0) 8px 16px)",
          clipPath:
            "polygon(2% 10%, 0 30%, 3% 50%, 0 72%, 2% 92%, 98% 88%, 100% 70%, 97% 48%, 100% 28%, 98% 8%)",
        }}
      />
      <span
        ref={cardRef}
        style={{ "--glare": 0 } as CSSProperties}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-[0_18px_36px_-24px_var(--shadow-ink)] transition-[transform,border-color,box-shadow] duration-300 ease-out will-change-transform group-hover:border-[color-mix(in_srgb,var(--hue)_55%,transparent)] group-hover:shadow-[0_40px_60px_-30px_var(--shadow-ink),0_30px_70px_-45px_var(--hue)]"
      >
        {/* Glare that follows the pointer */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 opacity-[calc(var(--glare)*1)] transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--hue) 16%, transparent), transparent 60%)",
          }}
        />

        {/* Media */}
        <span ref={mediaRef} aria-hidden="true" className="relative block p-3 pb-0">
          <span className="relative block aspect-[16/10]">
            <TileMedia
              project={project}
              videoRef={videoRef}
              onTime={(fraction) => progressRef.current?.style.setProperty("--p", String(fraction))}
              onPlayingChange={setPlaying}
            />
            {/* Rubber stamp: shipped, or still cooking */}
            <span
              className={`absolute top-10 left-4 z-10 inline-flex -rotate-6 items-center gap-1.5 rounded-md border-2 bg-surface/90 px-2 py-0.5 font-hand text-lg leading-none whitespace-nowrap shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:-rotate-3 ${
                shipped ? "border-ok/70 text-ok" : "border-warn/70 text-warn"
              }`}
            >
              {shipped ? "shipped ✓" : "still cooking…"}
            </span>
            <span
              data-on={playing}
              className="absolute top-10 right-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-white/85 uppercase opacity-0 backdrop-blur-md transition-opacity duration-300 data-[on=true]:opacity-100"
            >
              <span className="size-1.5 animate-pulse rounded-full bg-signal" />
              live
            </span>
            <span
              ref={progressRef}
              data-on={playing}
              style={{ "--p": 0 } as CSSProperties}
              className="absolute inset-x-3 bottom-2 z-10 h-0.5 overflow-hidden rounded-full bg-white/25 opacity-0 transition-opacity duration-300 data-[on=true]:opacity-100"
            >
              <span className="block h-full w-full origin-left scale-x-[var(--p)] bg-[var(--hue)]" />
            </span>
          </span>
        </span>

        {/* Text */}
        <span className="flex flex-1 flex-col gap-4 p-5 pt-4">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[11px] tracking-[0.18em] text-hue uppercase">
              {project.category}
            </span>
            <span className="font-mono text-[11px] text-stage-muted">#{formatIndex(index)}</span>
          </span>
          <span className="block">
            <span className="block font-heading text-2xl font-semibold tracking-tight text-balance">
              {name}
            </span>
            <span className="mt-2 line-clamp-2 block text-sm leading-snug text-stage-foreground/70">
              {project.tagline}
            </span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, chips).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-line bg-tint px-2.5 py-1 font-mono text-[11px] text-stage-foreground/80"
              >
                {tech}
              </span>
            ))}
            {project.stack.length > chips ? (
              <span className="px-1.5 py-1 font-mono text-[11px] text-stage-muted">
                +{project.stack.length - chips}
              </span>
            ) : null}
          </span>
          <span className="mt-auto flex items-center justify-between border-t border-dashed border-line-strong pt-4 font-mono text-[11px] tracking-[0.14em] text-stage-muted uppercase">
            <span>{project.duration}</span>
            <span className="inline-flex items-center gap-2 text-stage-foreground transition-colors group-hover:text-hue">
              case study
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
