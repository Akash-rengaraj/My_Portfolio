"use client";

import { useSyncExternalStore } from "react";

import { parseStamps, serializeStamps, STAMP_IDS, type StampId } from "@/content/stamps";

const KEY = "passport-stamps";
const EVENT = "passport-stamps-change";

/** Fallback when localStorage is unavailable. */
let memory = "";

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function snapshot(): string {
  return readRaw() || memory;
}

function write(ids: readonly StampId[]) {
  memory = serializeStamps(ids);
  try {
    localStorage.setItem(KEY, memory);
  } catch {
    // Storage blocked: the passport lasts for this visit only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Stamps the passport for `id`. */
export function collectStamp(id: StampId) {
  const stamps = parseStamps(snapshot());
  if (!stamps.includes(id)) write([...stamps, id]);
}

/** Starts a fresh, empty passport. */
export function resetPassport() {
  write([]);
}

/** Stamps collected so far, in route order (none on the server). */
export function useStamps(): StampId[] {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  return parseStamps(raw);
}

export const TOTAL_STAMPS = STAMP_IDS.length;
