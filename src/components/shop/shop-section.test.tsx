import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SHOP_ITEMS } from "./catalog";
import { ShopSection } from "./shop-section";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));

afterEach(() => {
  push.mockReset();
  vi.useRealTimers();
});

describe("ShopSection", () => {
  it("names the shop and counts what's in stock", () => {
    render(<ShopSection />);
    expect(screen.getByRole("heading", { name: "UI Components Shop" })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${SHOP_ITEMS.length} pieces`))).toBeInTheDocument();
  });

  it("leads into the shop page through the door and the button", () => {
    render(<ShopSection />);
    expect(screen.getByRole("link", { name: /enter the ui components shop/i })).toHaveAttribute(
      "href",
      "/shop",
    );
    expect(screen.getByRole("link", { name: /enter the shop/i })).toHaveAttribute("href", "/shop");
  });

  it("swings the door open before walking in", () => {
    vi.useFakeTimers();
    render(<ShopSection />);
    const door = screen.getByRole("link", { name: /enter the ui components shop/i });

    const notPrevented = fireEvent.click(door);
    expect(notPrevented).toBe(false);
    expect(door).toHaveAttribute("data-open", "true");
    expect(push).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(push).toHaveBeenCalledWith("/shop");
  });
});
