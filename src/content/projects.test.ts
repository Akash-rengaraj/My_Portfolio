import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { PROJECTS } from "./projects";

const publicFile = (src: string) => join(process.cwd(), "public", src);

describe("PROJECTS", () => {
  it("has the five showcased projects with unique slugs", () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map((p) => p.slug)).size).toBe(5);
  });

  it("ships every video, poster and gallery image it references", () => {
    for (const project of PROJECTS) {
      expect(existsSync(publicFile(project.media.video)), project.media.video).toBe(true);
      expect(existsSync(publicFile(project.media.poster)), project.media.poster).toBe(true);
      for (const image of project.gallery) {
        expect(existsSync(publicFile(image.src)), image.src).toBe(true);
      }
    }
  });

  it("links to https repositories (and a live site only when there is one)", () => {
    for (const project of PROJECTS) {
      expect(project.links.github).toMatch(/^https:\/\/github\.com\//);
      if (project.links.live) expect(project.links.live).toMatch(/^https:\/\//);
    }
  });

  it("tells each project as challenge → solution → impact", () => {
    for (const project of PROJECTS) {
      expect(project.challenge.length, project.slug).toBeGreaterThan(40);
      expect(project.solution.length, project.slug).toBeGreaterThan(40);
      expect(project.impact.length, project.slug).toBeGreaterThanOrEqual(3);
      expect(project.stats.length, project.slug).toBeGreaterThanOrEqual(2);
      expect(project.stack.length, project.slug).toBeGreaterThan(0);
    }
  });

  it("keeps no raw HTML in the copy", () => {
    const text = JSON.stringify(PROJECTS.map((p) => [p.summary, p.features, p.extras, p.impact]));
    expect(text).not.toMatch(/<\/?(li|ul|b)\b/);
  });

  it("gives the phone recording a phone frame", () => {
    const phone = PROJECTS.filter((p) => p.frame === "phone");
    expect(phone.map((p) => p.slug)).toEqual(["get-up"]);
    expect(phone[0]!.media.height).toBeGreaterThan(phone[0]!.media.width);
  });
});
