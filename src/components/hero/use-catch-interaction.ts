"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

import type { Point } from "./geometry";
import { CATCH_WINDOW } from "./story-beats";

/** True while the ball is in flight and the visitor may catch it (start inclusive). */
export function isInCatchWindow(t: number): boolean {
  return t >= CATCH_WINDOW[0] && t < CATCH_WINDOW[1];
}

/** True when the pointer is within `radius` stage pixels of the ball. */
export function isCatch(pointer: Point, ball: Point, radius = 70): boolean {
  return Math.hypot(pointer.x - ball.x, pointer.y - ball.y) < radius;
}

interface CatchOptions {
  stage: RefObject<HTMLElement | null>;
  /** Story progress 0–1 as currently drawn. */
  getStoryTime: () => number;
  /** Ball position in stage pixels. */
  getBall: () => Point;
  onCatch: () => void;
}

type PointerLike = MouseEvent & { pointerType?: string };

/** Mouse and pen get the "you" cursor; touch only taps. */
const hasHoverCursor = (event: PointerLike) => event.pointerType !== "touch";

/**
 * While the ball is in flight, the visitor's pointer becomes a "you" cursor;
 * clicking or tapping the ball calls `onCatch` once per scroll pass.
 * Returns `sync`, to call on every story frame so the cursor follows the
 * (scrub-smoothed) story rather than raw scroll events.
 */
export function useCatchInteraction({
  stage,
  getStoryTime,
  getBall,
  onCatch,
}: CatchOptions): () => void {
  const callbacks = useRef({ getStoryTime, getBall, onCatch });
  /** Frame-sync implementation, installed by the effect that owns the DOM. */
  const syncImpl = useRef<() => void>(() => undefined);

  useEffect(() => {
    callbacks.current = { getStoryTime, getBall, onCatch };
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const you = el.querySelector<HTMLElement>('[data-hero="you"]');
    /** Last hover-pointer position inside the stage, or null when outside. */
    let pointer: Point | null = null;
    let caught = false;

    const local = (event: MouseEvent): Point => {
      const rect = el.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    /** Window state now; re-arms the catch after scrolling back before the window. */
    const inWindow = () => {
      const t = callbacks.current.getStoryTime();
      if (t < CATCH_WINDOW[0]) caught = false;
      return isInCatchWindow(t);
    };

    const sync = () => {
      if (!you) return;
      if (pointer && inWindow()) {
        you.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
        you.style.visibility = "visible";
        you.style.opacity = "1";
        el.style.cursor = "none";
      } else {
        you.style.visibility = "hidden";
        you.style.opacity = "0";
        el.style.cursor = "";
      }
    };

    const onMove = (event: PointerLike) => {
      pointer = hasHoverCursor(event) ? local(event) : null;
      sync();
    };

    const onLeave = () => {
      pointer = null;
      sync();
    };

    const onDown = (event: PointerLike) => {
      if (!inWindow() || caught) return;
      if (isCatch(local(event), callbacks.current.getBall())) {
        caught = true;
        callbacks.current.onCatch();
      }
    };

    syncImpl.current = sync;
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointercancel", onLeave);
    return () => {
      syncImpl.current = () => undefined;
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointercancel", onLeave);
      el.style.cursor = "";
    };
  }, [stage]);

  return useCallback(() => syncImpl.current(), []);
}
