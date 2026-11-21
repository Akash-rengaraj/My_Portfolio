"use client";

import { useSyncExternalStore } from "react";

import { applyTheme, readServerTheme, readTheme, subscribeTheme } from "./theme";

/** Sun / moon switch. The icon morphs; the page repaints from the button outward. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, readServerTheme);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        applyTheme(dark ? "light" : "dark", {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }}
      className="group/theme relative grid size-9 place-items-center rounded-full border border-line bg-tint text-stage-foreground backdrop-blur-sm transition-colors hover:border-signal/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[18px] transition-transform duration-500 ease-out group-hover/theme:rotate-[24deg]"
      >
        <defs>
          <mask id="theme-moon-mask">
            <rect width="24" height="24" fill="white" />
            <circle
              r="7"
              fill="black"
              className="transition-[cx,cy] duration-500 ease-out"
              cx={dark ? 17 : 30}
              cy={dark ? 7 : -6}
            />
          </mask>
        </defs>
        <circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask="url(#theme-moon-mask)"
          className="transition-[r] duration-500 ease-out"
          r={dark ? 8 : 5}
        />
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="origin-center transition-[opacity,scale] duration-500 ease-out"
          style={{ opacity: dark ? 0 : 1, scale: dark ? "0.5" : "1" }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="12"
              y1="2.5"
              x2="12"
              y2="4.5"
              transform={`rotate(${angle} 12 12)`}
            />
          ))}
        </g>
      </svg>
    </button>
  );
}
