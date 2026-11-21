import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CATCH_WINDOW } from "./story-beats";
import { isCatch, isInCatchWindow, useCatchInteraction } from "./use-catch-interaction";

const [OPEN, CLOSE] = CATCH_WINDOW;
/** Story times inside, before and after the catch window. */
const IN = (OPEN + CLOSE) / 2;
const BEFORE = OPEN / 2;
const AFTER = CLOSE + 0.1;

describe("isInCatchWindow", () => {
  it("includes the start and excludes the end", () => {
    expect(isInCatchWindow(OPEN - 0.001)).toBe(false);
    expect(isInCatchWindow(OPEN)).toBe(true);
    expect(isInCatchWindow(CLOSE - 0.001)).toBe(true);
    expect(isInCatchWindow(CLOSE)).toBe(false);
  });
});

describe("isCatch", () => {
  it("accepts taps within the radius only", () => {
    expect(isCatch({ x: 69, y: 0 }, { x: 0, y: 0 })).toBe(true);
    expect(isCatch({ x: 71, y: 0 }, { x: 0, y: 0 })).toBe(false);
  });
});

/** A stage element at the page origin with a visitor cursor inside it. */
function fakeStage() {
  const stage = document.createElement("div");
  const you = document.createElement("div");
  you.dataset.hero = "you";
  stage.append(you);
  document.body.append(stage);
  stage.getBoundingClientRect = () => new DOMRect(0, 0, 1600, 900);
  return { stage, you };
}

function pointer(stage: HTMLElement, type: string, x: number, y: number, pointerType = "mouse") {
  const event = new MouseEvent(type, { clientX: x, clientY: y, bubbles: true });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  stage.dispatchEvent(event);
}

describe("useCatchInteraction", () => {
  function setup() {
    const { stage, you } = fakeStage();
    let time = IN;
    const onCatch = vi.fn();
    const hook = renderHook(() =>
      useCatchInteraction({
        stage: { current: stage },
        getStoryTime: () => time,
        getBall: () => ({ x: 500, y: 300 }),
        onCatch,
      }),
    );
    return {
      stage,
      you,
      onCatch,
      hook,
      sync: () => hook.result.current(),
      setTime: (t: number) => (time = t),
    };
  }

  it("catches once per pass, and again after scrolling back before the window", () => {
    const { stage, onCatch, setTime } = setup();
    pointer(stage, "pointerdown", 510, 300);
    pointer(stage, "pointerdown", 505, 300);
    expect(onCatch).toHaveBeenCalledTimes(1);

    setTime(BEFORE);
    pointer(stage, "pointermove", 10, 10);
    setTime(IN);
    pointer(stage, "pointerdown", 500, 300);
    expect(onCatch).toHaveBeenCalledTimes(2);
  });

  it("never catches outside the window or far from the ball", () => {
    const { stage, onCatch, setTime } = setup();
    pointer(stage, "pointerdown", 900, 700);
    setTime(AFTER);
    pointer(stage, "pointerdown", 500, 300);
    expect(onCatch).not.toHaveBeenCalled();
  });

  it("shows the visitor cursor at the pointer only during the window", () => {
    const { stage, you, setTime } = setup();
    pointer(stage, "pointermove", 120, 80);
    expect(you.style.visibility).toBe("visible");
    expect(you.style.transform).toContain("translate3d(120px, 80px");

    pointer(stage, "pointerleave", 120, 80);
    expect(you.style.visibility).toBe("hidden");

    setTime(AFTER);
    pointer(stage, "pointermove", 120, 80);
    expect(you.style.visibility).toBe("hidden");
  });

  it("removes its listeners on unmount", () => {
    const { stage, onCatch, hook } = setup();
    hook.unmount();
    pointer(stage, "pointerdown", 500, 300);
    expect(onCatch).not.toHaveBeenCalled();
  });
});

describe("useCatchInteraction · story frames", () => {
  function setup() {
    const { stage, you } = fakeStage();
    let time = IN;
    const hook = renderHook(() =>
      useCatchInteraction({
        stage: { current: stage },
        getStoryTime: () => time,
        getBall: () => ({ x: 500, y: 300 }),
        onCatch: () => undefined,
      }),
    );
    return { stage, you, sync: () => hook.result.current(), setTime: (t: number) => (time = t) };
  }

  it("hides the visitor cursor when the story leaves the window without pointer events", () => {
    const { stage, you, sync, setTime } = setup();
    pointer(stage, "pointermove", 120, 80);
    setTime(AFTER);
    sync();
    expect(you.style.visibility).toBe("hidden");
    expect(stage.style.cursor).toBe("");
  });

  it("shows the cursor at the last pointer position when the story enters the window", () => {
    const { stage, you, sync, setTime } = setup();
    setTime(BEFORE);
    pointer(stage, "pointermove", 140, 90);
    expect(you.style.visibility).not.toBe("visible");
    setTime(IN);
    sync();
    expect(you.style.visibility).toBe("visible");
    expect(you.style.transform).toContain("translate3d(140px, 90px");
  });

  it("replaces the native cursor while shown", () => {
    const { stage } = setup();
    pointer(stage, "pointermove", 120, 80);
    expect(stage.style.cursor).toBe("none");
    pointer(stage, "pointerleave", 120, 80);
    expect(stage.style.cursor).toBe("");
  });

  it("never shows the visitor cursor for touch", () => {
    const { stage, you } = setup();
    pointer(stage, "pointermove", 120, 80, "touch");
    expect(you.style.visibility).not.toBe("visible");
  });

  it("still catches on a touch tap", () => {
    const { stage } = fakeStage();
    const onCatch = vi.fn();
    renderHook(() =>
      useCatchInteraction({
        stage: { current: stage },
        getStoryTime: () => IN,
        getBall: () => ({ x: 500, y: 300 }),
        onCatch,
      }),
    );
    pointer(stage, "pointerdown", 500, 300, "touch");
    expect(onCatch).toHaveBeenCalledTimes(1);
  });
});
