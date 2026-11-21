"use client";

import { useSyncExternalStore } from "react";

import { BUG_IDS, parseCaught, serializeCaught, type BugId } from "@/content/bugs";

const KEY = "caught-bugs";
const EVENT = "caught-bugs-change";

/** Fallback when localStorage is unavailable. */
let memory = "";

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function write(ids: readonly BugId[]) {
  try {
    localStorage.setItem(KEY, serializeCaught(ids));
  } catch {
    // Storage blocked: progress lasts for this visit only.
    memory = serializeCaught(ids);
  }
  window.dispatchEvent(new Event(EVENT));
}

function snapshot(): string {
  return readRaw() || memory;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Marks a bug as caught. */
export function catchBug(id: BugId) {
  const caught = parseCaught(snapshot());
  if (!caught.includes(id)) write([...caught, id]);
}

/** Lets every bug loose again. */
export function releaseBugs() {
  memory = "";
  write([]);
}

/** The bugs caught so far, in hunt order (none on the server). */
export function useCaughtBugs(): BugId[] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return parseCaught(raw);
}

export const TOTAL_BUGS = BUG_IDS.length;
