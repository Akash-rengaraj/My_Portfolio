import { describe, expect, it } from "vitest";

import { COLLEGE, COLLEGE_TOWN, HOMETOWN, percentOf, ROLES, SCHOOLING } from "./journey";

describe("journey content", () => {
  it("goes from Sivakasi to Coimbatore", () => {
    expect(HOMETOWN.name).toBe("Sivakasi");
    expect(COLLEGE_TOWN.name).toBe("Coimbatore");
  });

  it("lists class 10 then class 12, with the class 10 score out of 500", () => {
    expect(SCHOOLING.map((s) => s.level)).toEqual(["Class 10", "Class 12"]);
    expect(SCHOOLING[0]?.score).toEqual({ value: 449, max: 500 });
    expect(SCHOOLING[0]?.board).toBe("Tamil Nadu State Board");
    expect(SCHOOLING[1]?.score).toEqual({ value: 543, max: 600 });
  });

  it("works each percentage out from the marks", () => {
    expect(percentOf(SCHOOLING[0]!)).toBe(89.8);
    expect(percentOf(SCHOOLING[1]!)).toBe(90.5);
  });

  it("has the current college details", () => {
    expect(COLLEGE.short).toBe("SKCET");
    expect(COLLEGE.cgpa).toBeLessThanOrEqual(COLLEGE.cgpaMax);
    expect(COLLEGE.semester).toBe(6);
  });

  it("lists the roles held alongside college", () => {
    expect(ROLES.map((r) => r.title)).toEqual([
      "Tech Lead",
      "Google Student Ambassador",
      "Freelancer",
    ]);
  });
});
