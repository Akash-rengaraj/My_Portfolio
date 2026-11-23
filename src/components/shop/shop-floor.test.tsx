import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SHOP_ITEMS, sourceFiles, stockIn } from "./catalog";
import { ShopFloor } from "./shop-floor";

const sources = Object.fromEntries(
  SHOP_ITEMS.map((item) => [
    item.slug,
    sourceFiles(item).map((path) => ({ path, code: `// ${path}` })),
  ]),
);

const products = (container: HTMLElement) => container.querySelectorAll("[data-product]");
const card = (container: HTMLElement, slug: string) =>
  container.querySelector<HTMLElement>(`[data-product="${slug}"]`)!;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ShopFloor", () => {
  it("puts every item on the shelves", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    expect(products(container)).toHaveLength(SHOP_ITEMS.length);
    for (const item of SHOP_ITEMS) {
      expect(
        within(card(container, item.slug)).getByRole("heading", { name: item.name }),
      ).toBeInTheDocument();
    }
  });

  it("filters the shelves by aisle", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    const games = screen.getByRole("button", { name: /^games/i });
    fireEvent.click(games);
    expect(games).toHaveAttribute("aria-pressed", "true");
    expect(products(container)).toHaveLength(stockIn("games"));
  });

  it("searches the shelves", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    fireEvent.change(screen.getByRole("searchbox", { name: /search the shop/i }), {
      target: { value: "password" },
    });
    expect(products(container)).toHaveLength(1);
    expect(card(container, "password-field")).toBeInTheDocument();
  });

  it("waits for a click before starting heavy previews", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    const runner = card(container, "neon-runner");
    expect(within(runner).getByRole("button", { name: /start neon runner/i })).toBeInTheDocument();
  });

  it("shows an item's code only when asked", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    const navbar = card(container, "navbar");
    const code = within(navbar).getByText("// components/shop/items/navbar.tsx");
    expect(code).not.toBeVisible();
    fireEvent.click(within(navbar).getByRole("button", { name: "view code" }));
    expect(code).toBeVisible();
  });

  it("lets you switch between a game's files", () => {
    const { container } = render(<ShopFloor sources={sources} />);
    const runner = card(container, "neon-runner");
    fireEvent.click(within(runner).getByRole("button", { name: "view code" }));
    fireEvent.click(within(runner).getByRole("button", { name: "neon-runner.ts" }));
    expect(within(runner).getByText("// lib/neon-runner.ts")).toBeVisible();
  });

  it("copies an item's code to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { container } = render(<ShopFloor sources={sources} />);

    fireEvent.click(
      within(card(container, "magnetic-button")).getByRole("button", { name: "copy code" }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("// components/shop/items/magnetic-button.tsx"),
    );
    expect(
      await within(card(container, "magnetic-button")).findByRole("button", { name: "copied ✓" }),
    ).toBeInTheDocument();
  });

  it("leads back to the shop on the portfolio", () => {
    render(<ShopFloor sources={sources} />);
    for (const link of screen.getAllByRole("link", { name: /back to the portfolio/i })) {
      expect(link).toHaveAttribute("href", "/#shop");
    }
  });
});
