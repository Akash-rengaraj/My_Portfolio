export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const DEV_STORAGE_KEY = "dev-mode";

/**
 * Runs inline in <head> before first paint, so a saved dark preference (or
 * Dev Mode, which rides on dark) never flashes light. Light is the default.
 */
export const THEME_BOOT_SCRIPT = `(function(){try{var c=document.documentElement.classList;if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")c.add("dark");if(localStorage.getItem("${DEV_STORAGE_KEY}")==="on"){c.add("dark");c.add("dev")}}catch(e){}})()`;

/** The theme currently applied to <html>. */
export function readTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Server snapshot: pages are prerendered in the default light theme. */
export function readServerTheme(): Theme {
  return "light";
}

/** Notifies `onChange` whenever the <html> class list changes. */
export function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function store(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the switch still works for this visit.
  }
}

function savedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Runs `swap` as a circular reveal from `origin` when motion is allowed. */
function transition(swap: () => void, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || typeof document.startViewTransition !== "function") {
    swap();
    return;
  }
  if (origin) {
    root.style.setProperty("--vt-x", `${origin.x}px`);
    root.style.setProperty("--vt-y", `${origin.y}px`);
  }
  document.startViewTransition(swap);
}

/**
 * Applies `theme` (and leaves Dev Mode). When the browser supports view
 * transitions and motion is allowed, the new theme spreads out from `origin`.
 */
export function applyTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  transition(() => {
    root.classList.remove("dev");
    root.classList.toggle("dark", theme === "dark");
    store(THEME_STORAGE_KEY, theme);
    store(DEV_STORAGE_KEY, "off");
  }, origin);
}

/** True while the Dev Mode skin is on. */
export function readDevMode(): boolean {
  return document.documentElement.classList.contains("dev");
}

/** Server snapshot: Dev Mode is never on in the prerendered page. */
export function readServerDevMode(): boolean {
  return false;
}

/** Turns the Dev Mode skin on or off (off returns to the saved light / dark theme). */
export function applyDevMode(on: boolean, origin?: { x: number; y: number }) {
  const root = document.documentElement;
  transition(() => {
    root.classList.toggle("dev", on);
    root.classList.toggle("dark", on || savedTheme() === "dark");
    store(DEV_STORAGE_KEY, on ? "on" : "off");
  }, origin);
}
