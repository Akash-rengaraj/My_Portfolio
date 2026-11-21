/**
 * Rules for "Ship It": hold to fuel, release while the gauge is in the green
 * zone, and the rocket reaches orbit and deploys the release. Each successful
 * deploy narrows the zone and speeds the gauge up.
 */

export type Outcome = "fizzle" | "suborbital" | "orbit" | "perfect" | "overload";

export interface Zone {
  from: number;
  to: number;
  perfectFrom: number;
  perfectTo: number;
}

export const ORBIT_ALTITUDE = 3000;
export const SPACE_ALTITUDE = 1400;

/** Green zone for a level: wide at first, narrowing with every deploy. */
export function zoneFor(level: number): Zone {
  const width = Math.max(0.1, 0.28 - level * 0.025);
  const centre = 0.76 + (((level * 37) % 5) - 2) * 0.02;
  const perfect = Math.max(0.025, width * 0.18);
  return {
    from: centre - width / 2,
    to: centre + width / 2,
    perfectFrom: centre - perfect / 2,
    perfectTo: centre + perfect / 2,
  };
}

/** Seconds for the gauge to go empty → full → empty; quicker on later levels. */
export function gaugePeriod(level: number): number {
  return Math.max(0.95, 1.7 - level * 0.08);
}

/** Gauge reading (0..1) `t` seconds after you start holding. */
export function gaugeAt(t: number, period: number): number {
  const p = (((t % period) + period) % period) / period;
  return p < 0.5 ? p * 2 : 2 - p * 2;
}

export function outcomeFor(power: number, zone: Zone): Outcome {
  if (power < 0.35) return "fizzle";
  if (power < zone.from) return "suborbital";
  if (power > zone.to) return "overload";
  if (power >= zone.perfectFrom && power <= zone.perfectTo) return "perfect";
  return "orbit";
}

export function isSuccess(outcome: Outcome): boolean {
  return outcome === "orbit" || outcome === "perfect";
}

export function pointsFor(outcome: Outcome): number {
  if (outcome === "perfect") return 2;
  return outcome === "orbit" ? 1 : 0;
}

/** How long each flight plays before the result card. */
export const FLIGHT_SECONDS: Record<Outcome, number> = {
  fizzle: 2.6,
  suborbital: 5,
  orbit: 6.4,
  perfect: 6.4,
  overload: 3.4,
};

/** Seconds of engine burn (for flame and smoke). */
export const BURN_SECONDS: Record<Outcome, number> = {
  fizzle: 0.9,
  suborbital: 2.4,
  orbit: 4.2,
  perfect: 4.2,
  overload: 2.1,
};

/** When the rocket blows up on an overload. */
export const OVERLOAD_AT = 2.1;

/** Altitude (world units) `t` seconds into a flight. */
export function altitudeAt(outcome: Outcome, t: number): number {
  switch (outcome) {
    case "fizzle":
      return Math.max(0, 110 * t - 55 * t * t);
    case "suborbital": {
      if (t < 2.4) return 225 * t * t;
      const peak = 225 * 2.4 * 2.4;
      return Math.max(0, peak - 330 * (t - 2.4) ** 2);
    }
    case "overload":
      return 150 * Math.min(t, OVERLOAD_AT) ** 2;
    default: {
      const p = Math.min(1, t / 5);
      return ORBIT_ALTITUDE * (1 - (1 - p) ** 2.6);
    }
  }
}

/** Gravity turn: the rocket pitches over toward orbit (degrees from vertical). */
export function pitchAt(outcome: Outcome, t: number): number {
  if (!isSuccess(outcome)) return 0;
  const p = Math.min(1, Math.max(0, (t - 1.2) / 3.8));
  return 72 * p * p * (3 - 2 * p);
}

/** Sideways drift that comes with the pitch-over (world units). */
export function downrangeAt(outcome: Outcome, t: number): number {
  if (!isSuccess(outcome)) return 0;
  return 520 * Math.max(0, t - 1.4) ** 1.7;
}

export interface Verdict {
  title: string;
  line: string;
}

export function verdictFor(outcome: Outcome): Verdict {
  switch (outcome) {
    case "fizzle":
      return {
        title: "Build failed",
        line: "Not enough fuel to leave the pad. Hold a little longer.",
      };
    case "suborbital":
      return {
        title: "Rolled back",
        line: "Touched space, missed orbit. A bit more fuel next time.",
      };
    case "overload":
      return {
        title: "Overheated",
        line: "Too much fuel — rapid unscheduled disassembly. Let go sooner.",
      };
    case "perfect":
      return { title: "Perfect deploy ✦", line: "Dead-centre burn. Double points." };
    default:
      return { title: "Shipped to production ✓", line: "Satellite deployed and stable in orbit." };
  }
}
