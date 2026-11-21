"use client";

import { useSyncExternalStore } from "react";

const EVENT = "best-score-change";

function read(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

/** Saves `score` under `key` if it beats the stored best; returns true when it did. */
export function saveBestScore(key: string, score: number): boolean {
  const better = score > read(key);
  if (better) {
    try {
      localStorage.setItem(key, String(score));
    } catch {
      // Storage blocked: the best score just isn't remembered.
    }
    window.dispatchEvent(new Event(EVENT));
  }
  return better;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** A game's best score from this browser (0 on the server and on first visit). */
export function useBestScore(key: string): number {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => 0,
  );
}
