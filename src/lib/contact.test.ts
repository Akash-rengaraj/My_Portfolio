import { describe, expect, it } from "vitest";

import { buildMailto, validateNote } from "./contact";

describe("contact postcard", () => {
  it("asks for a name and a real message", () => {
    expect(validateNote({ name: "", message: "hi" })).toEqual({
      name: "Sign it with your name.",
      message: "Write a little more — a sentence or two.",
    });
    expect(validateNote({ name: "Ada", message: "Loved the passport idea!" })).toEqual({});
  });

  it("builds a mailto link with the topic subject and a signed body", () => {
    const href = buildMailto("me@example.com", {
      name: " Ada ",
      topic: "freelance",
      message: "Can you build our site?",
    });
    const url = new URL(href);
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe("me@example.com");
    expect(url.searchParams.get("subject")).toBe("A project I'd like your help with — Ada");
    expect(url.searchParams.get("body")).toBe("Hi Akash,\n\nCan you build our site?\n\n— Ada");
  });

  it("adds a P.S. for Golden Ticket holders", () => {
    const href = buildMailto("me@example.com", {
      name: "Ada",
      topic: "hello",
      message: "Hello there!",
      goldenTicket: true,
    });
    expect(new URL(href).searchParams.get("body")).toMatch(/P\.S\. I filled the whole passport/);
  });
});
