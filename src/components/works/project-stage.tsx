"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { LoadingImage } from "@/components/ui/loading-image";
import type { Project } from "@/content/projects";
import { formatIndex, splitTitle, tiltFor } from "@/lib/works";

import { StatTile } from "./stat-tile";
import { useReducedMotion } from "./use-reduced-motion";
import { useInView } from "./use-in-view";

const MAX_TILT = 9;

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

interface ProjectStageProps {
  project: Project;
  /** Zero-based position in the full project list. */
  index: number;
  /** True while this project is the one shown. */
  active: boolean;
}

/**
 * Device stage for one project: its preview video in a browser or phone frame
 * that tilts towards the pointer, with a glare, playback controls and stats.
 * The video only loads and plays while the project is active and on screen.
 */
export function ProjectStage({ project, index, active }: ProjectStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(stageRef, "100px");

  /** null = follow the OS motion preference; true/false = the visitor chose. */
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const reduced = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  /** True while playback is stalled waiting for video data. */
  const [buffering, setBuffering] = useState(false);
  const [time, setTime] = useState({ current: 0, duration: 0 });

  const wantsPlay = userPlaying ?? !reduced;
  const shouldPlay = active && inView && wantsPlay;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) void video.play().catch(() => setUserPlaying(false));
    else video.pause();
  }, [shouldPlay]);

  const { name } = splitTitle(project.title);
  const isPhone = project.frame === "phone";
  const aspect = `${project.media.width} / ${project.media.height}`;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    const stage = stageRef.current;
    if (!frame || !stage || event.pointerType === "touch" || prefersReducedMotion()) return;
    const rect = frame.getBoundingClientRect();
    const { rx, ry } = tiltFor(event.clientX, event.clientY, rect, MAX_TILT);
    frame.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
    frame.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    frame.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    frame.style.setProperty("--glare", "1");
  };

  const resetTilt = () => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.transform = "";
    frame.style.setProperty("--glare", "0");
  };

  const seek = (fraction: number) => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) video.currentTime = fraction * video.duration;
  };

  const progress = time.duration > 0 ? time.current / time.duration : 0;

  return (
    <div
      ref={stageRef}
      onPointerMove={onPointerMove}
      onPointerLeave={resetTilt}
      style={{ "--hue": project.hue } as CSSProperties}
      className="relative overflow-hidden rounded-3xl border border-line bg-surface"
    >
      {/* Ambient glow in the project's colour, dot grid and a ghost index number */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 55% at 50% 38%, color-mix(in srgb, var(--hue) 26%, transparent), transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(var(--line-strong) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(70% 70% at 50% 40%, black, transparent)",
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-4 font-mono text-[9rem] leading-none font-bold text-transparent select-none sm:text-[12rem]"
        style={{ WebkitTextStroke: "1px color-mix(in srgb, var(--hue) 35%, transparent)" }}
      >
        {formatIndex(index)}
      </span>

      <div className="relative flex flex-col items-center gap-6 px-4 pt-10 pb-5 sm:px-8 sm:pt-12">
        {/* Device frame */}
        <div
          ref={frameRef}
          style={{ "--glare": 0 } as CSSProperties}
          className={`relative w-full transition-transform duration-200 ease-out will-change-transform ${
            isPhone ? "max-w-[15.5rem]" : "max-w-[46rem]"
          }`}
        >
          <div
            className={`relative overflow-hidden border border-line-strong shadow-[0_40px_90px_-20px_var(--shadow-ink),0_0_70px_-25px_var(--hue)] ${
              isPhone ? "rounded-[2.1rem] bg-[#111216] p-2" : "rounded-2xl bg-surface"
            }`}
          >
            {isPhone ? null : (
              <div className="flex h-9 items-center gap-2 border-b border-line bg-tint px-4">
                {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
                  <span
                    key={color}
                    aria-hidden="true"
                    className="size-2.5 rounded-full opacity-80"
                    style={{ background: color }}
                  />
                ))}
                <span className="mx-auto max-w-[60%] truncate rounded-md bg-tint px-3 py-0.5 font-mono text-[11px] text-stage-muted">
                  {name.toLowerCase().replace(/\s+/g, "-")}.preview
                </span>
              </div>
            )}
            <div
              className={`relative overflow-hidden bg-black ${isPhone ? "rounded-[1.6rem]" : ""}`}
              style={{ aspectRatio: aspect }}
            >
              {/* Poster with a skeleton until it loads; same URL as the video poster, so one download. */}
              <LoadingImage
                src={project.media.poster}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
              <video
                ref={videoRef}
                src={project.media.video}
                poster={project.media.poster}
                aria-label={project.media.alt}
                muted
                loop
                playsInline
                preload="none"
                onPlay={() => setPlaying(true)}
                onPause={() => {
                  setPlaying(false);
                  setBuffering(false);
                }}
                onWaiting={() => setBuffering(true)}
                onPlaying={() => setBuffering(false)}
                onCanPlay={() => setBuffering(false)}
                onTimeUpdate={(e) =>
                  setTime({
                    current: e.currentTarget.currentTime,
                    duration: e.currentTarget.duration,
                  })
                }
                onLoadedMetadata={(e) =>
                  setTime({
                    current: e.currentTarget.currentTime,
                    duration: e.currentTarget.duration,
                  })
                }
                className="relative size-full object-cover"
              />
              {buffering ? (
                <span aria-hidden="true" className="skeleton absolute inset-0 opacity-50" />
              ) : null}
            </div>
            {isPhone ? (
              <span
                aria-hidden="true"
                className="absolute top-3.5 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black/90"
              />
            ) : null}
            {/* Pointer glare */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[calc(var(--glare)*0.55)] transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.2), transparent 55%)",
              }}
            />
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex w-full max-w-[46rem] items-center gap-3 font-mono text-[11px] text-stage-muted">
          <button
            type="button"
            onClick={() => setUserPlaying(!playing)}
            aria-label={playing ? `Pause ${name} preview` : `Play ${name} preview`}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong bg-tint text-stage-foreground transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
              </svg>
            )}
          </button>
          <span className="w-9 tabular-nums">{formatTime(time.current)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label={`Seek ${name} preview`}
            style={{ "--p": `${progress * 100}%` } as CSSProperties}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,var(--hue)_var(--p),var(--line-strong)_var(--p))] accent-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-stage-foreground [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-stage-foreground"
          />
          <span className="w-9 text-right tabular-nums">{formatTime(time.duration)}</span>
        </div>

        {/* Headline numbers */}
        <div className="flex w-full max-w-[46rem] gap-3">
          {project.stats.map((stat) => (
            <StatTile key={stat.label} stat={stat} play={active && inView} />
          ))}
        </div>
      </div>
    </div>
  );
}
