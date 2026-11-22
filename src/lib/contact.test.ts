import { describe, expect, it } from "vitest";

import { STAMP_IDS, ticketSerial } from "@/content/stamps";

import { buildGmailCompose, buildMailto, validateNote } from "./contact";

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

  it("adds the Golden Ticket to the email for passport holders", () => {
    const url = new URL(
      buildGmailCompose("me@example.com", {
        name: "Ada",
        topic: "hello",
        message: "Hello there!",
        goldenTicket: true,
      }),
    );
    const body = url.searchParams.get("body") ?? "";
    expect(url.searchParams.get("su")).toBe("🎟 Hello from your portfolio — Ada");
    expect(body).toMatch(/P\.S\. I filled the whole passport/);
    expect(body).toContain("ADMIT ONE · GOLDEN TICKET");
    expect(body).toContain("Passenger: Ada");
    expect(body).toContain(`All ${STAMP_IDS.length} stamps ★  Serial ${ticketSerial("Ada")}`);
  });

  it("leaves the ticket out for everyone else", () => {
    const href = buildMailto("me@example.com", {
      name: "Ada",
      topic: "hello",
      message: "Hi!!!!!!!!",
    });
    const url = new URL(href);
    expect(url.searchParams.get("body")).not.toMatch(/GOLDEN TICKET/);
    expect(url.searchParams.get("subject")).not.toMatch(/🎟/);
  });

  it("builds a pre-filled Gmail compose link", () => {
    const url = new URL(
      buildGmailCompose("me@example.com", {
        name: "Ada",
        topic: "collab",
        message: "Let's team up & ship it?",
      }),
    );
    expect(url.origin).toBe("https://mail.google.com");
    expect(url.pathname).toBe("/mail/");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe("me@example.com");
    expect(url.searchParams.get("su")).toBe("Let's build something together — Ada");
    expect(url.searchParams.get("body")).toBe("Hi Akash,\n\nLet's team up & ship it?\n\n— Ada");
  });
});
