import { describe, expect, it } from "vitest";

import { toWeeks } from "./heatmap";

describe("heatmap weeks", () => {
  it("pads the first week so each column runs Sunday to Saturday", () => {
    // 2025-01-01 was a Wednesday: three empty cells first.
    const days = Array.from({ length: 10 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, "0")}`,
      count: i,
      level: 0 as const,
    }));
    const weeks = toWeeks(days);
    expect(weeks[0]?.slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0]?.[3]?.date).toBe("2025-01-01");
    expect(weeks[1]?.[0]?.date).toBe("2025-01-05");
  });
});
