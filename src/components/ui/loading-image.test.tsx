import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingImage } from "./loading-image";

describe("LoadingImage", () => {
  it("shows the skeleton until the image loads", async () => {
    render(<LoadingImage src="/works/neo-poster.webp" alt="Neo" width={160} height={100} />);
    const img = screen.getByRole("img", { name: "Neo" });
    expect(img).toHaveAttribute("data-loading", "true");
    fireEvent.load(img);
    // next/image reports onLoad after the image decodes (async).
    await waitFor(() => expect(img).toHaveAttribute("data-loading", "false"));
  });

  it("drops the skeleton if the image fails", () => {
    render(<LoadingImage src="/missing.webp" alt="Missing" width={160} height={100} />);
    const img = screen.getByRole("img", { name: "Missing" });
    fireEvent.error(img);
    expect(img).toHaveAttribute("data-loading", "false");
  });
});
