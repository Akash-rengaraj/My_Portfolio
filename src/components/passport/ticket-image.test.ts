import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handOffTicket } from "./ticket-image";

/** A 2D context whose every method is a no-op, since jsdom has no canvas. */
const fakeContext = new Proxy(
  {},
  {
    get: (_target, key) =>
      key === "createLinearGradient" ? () => ({ addColorStop() {} }) : () => {},
    set: () => true,
  },
);

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    fakeContext as CanvasRenderingContext2D,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
    "data:image/png;base64,iVBORw0=",
  );
});

const { createObjectURL, revokeObjectURL } = URL;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.assign(URL, { createObjectURL, revokeObjectURL });
});

describe("handOffTicket", () => {
  it("copies the ticket PNG to the clipboard", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal(
      "ClipboardItem",
      class {
        items: Record<string, Blob>;
        constructor(items: Record<string, Blob>) {
          this.items = items;
        }
      },
    );
    Object.defineProperty(navigator, "clipboard", { value: { write }, configurable: true });

    await expect(handOffTicket("Ada", "AR-00001")).resolves.toBe("copied");
    const [[item]] = write.mock.calls[0] as [[{ items: Record<string, Blob> }]];
    expect(item.items["image/png"]?.type).toBe("image/png");
  });

  it("downloads the PNG when the clipboard refuses images", async () => {
    vi.stubGlobal("ClipboardItem", undefined);
    const createObjectURL = vi.fn().mockReturnValue("blob:ticket");
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await expect(handOffTicket("Ada", "AR-00001")).resolves.toBe("saved");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
  });

  it("gives up quietly without a canvas", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    await expect(handOffTicket("Ada", "AR-00001")).resolves.toBe("failed");
  });
});
