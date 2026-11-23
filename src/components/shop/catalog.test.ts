import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { matchesQuery, SHOP_CATEGORIES, SHOP_ITEMS, sourceFiles, stockIn } from "./catalog";
import { PREVIEWS } from "./previews";

const SRC = path.join(process.cwd(), "src");

describe("UI Components Shop catalog", () => {
  it("gives every item a unique slug", () => {
    const slugs = SHOP_ITEMS.map((item) => item.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has source files to copy and a live preview for every item", () => {
    for (const item of SHOP_ITEMS) {
      for (const file of sourceFiles(item)) {
        expect(existsSync(path.join(SRC, file)), `${item.slug}: ${file}`).toBe(true);
      }
      expect(PREVIEWS[item.slug], item.slug).toBeTypeOf("function");
    }
  });

  it("stocks every aisle, and every item sits in exactly one", () => {
    for (const category of SHOP_CATEGORIES) expect(stockIn(category), category).toBeGreaterThan(0);
    const total = SHOP_CATEGORIES.reduce((sum, category) => sum + stockIn(category), 0);
    expect(total).toBe(SHOP_ITEMS.length);
  });

  it("keeps heavy previews (heroes, games) behind a click", () => {
    for (const item of SHOP_ITEMS.filter(
      (i) => i.category === "heroes" || i.category === "games",
    )) {
      expect("heavy" in item && item.heavy, item.slug).toBe(true);
    }
  });

  it("searches names, tags and aisles", () => {
    const runner = SHOP_ITEMS.find((i) => i.slug === "neon-runner")!;
    expect(matchesQuery(runner, "NEON")).toBe(true);
    expect(matchesQuery(runner, "games")).toBe(true);
    expect(matchesQuery(runner, "one-input")).toBe(true);
    expect(matchesQuery(runner, "pricing")).toBe(false);
    expect(matchesQuery(runner, "  ")).toBe(true);
  });
});
