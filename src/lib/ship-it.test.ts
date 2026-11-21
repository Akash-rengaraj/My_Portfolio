import { describe, expect, it } from "vitest";

import {
  altitudeAt,
  gaugeAt,
  gaugePeriod,
  isSuccess,
  ORBIT_ALTITUDE,
  outcomeFor,
  pointsFor,
  zoneFor,
} from "./ship-it";

describe("ship it rules", () => {
  it("sweeps the gauge empty → full → empty", () => {
    expect(gaugeAt(0, 2)).toBe(0);
    expect(gaugeAt(1, 2)).toBe(1);
    expect(gaugeAt(2, 2)).toBe(0);
    expect(gaugeAt(0.5, 2)).toBeCloseTo(0.5);
  });

  it("narrows the zone and speeds the gauge up every level", () => {
    const first = zoneFor(0);
    const later = zoneFor(6);
    expect(later.to - later.from).toBeLessThan(first.to - first.from);
    expect(gaugePeriod(6)).toBeLessThan(gaugePeriod(0));
  });

  it("maps fuel to an outcome", () => {
    const zone = zoneFor(0);
    const centre = (zone.perfectFrom + zone.perfectTo) / 2;
    expect(outcomeFor(0.1, zone)).toBe("fizzle");
    expect(outcomeFor(zone.from - 0.02, zone)).toBe("suborbital");
    expect(outcomeFor(centre, zone)).toBe("perfect");
    expect(outcomeFor(zone.from + 0.005, zone)).toBe("orbit");
    expect(outcomeFor(zone.to + 0.02, zone)).toBe("overload");
  });

  it("rewards orbit and perfect burns only", () => {
    expect(isSuccess("orbit")).toBe(true);
    expect(pointsFor("perfect")).toBe(2);
    expect(pointsFor("overload")).toBe(0);
  });

  it("reaches orbit on success and comes back down otherwise", () => {
    expect(altitudeAt("orbit", 5)).toBeCloseTo(ORBIT_ALTITUDE);
    expect(altitudeAt("fizzle", 2.5)).toBe(0);
    expect(altitudeAt("suborbital", 6)).toBe(0);
  });
});
