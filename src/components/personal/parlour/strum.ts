/**
 * A plucked steel string, synthesised with the Karplus–Strong algorithm: a
 * burst of noise circulates in a delay line one period long, and averaging
 * neighbouring samples damps the highs the way a real string does.
 */

/** Open G major on a six-string, low to high: G2 B2 D3 G3 B3 G4. */
export const G_MAJOR = [98.0, 123.47, 146.83, 196.0, 246.94, 392.0] as const;

/** Seconds between strings in a downstroke. */
export const STRUM_GAP = 0.028;

/** Renders one plucked string as mono samples. `random` is injectable for tests. */
export function pluckString(
  frequency: number,
  sampleRate: number,
  seconds = 2.8,
  random: () => number = Math.random,
): Float32Array<ArrayBuffer> {
  const period = Math.max(2, Math.round(sampleRate / frequency));
  const ring = new Float32Array(period);
  // a softened noise burst: a pick, not a hammer
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const noise = random() * 2 - 1;
    prev = prev * 0.5 + noise * 0.5;
    ring[i] = prev;
  }
  // lower strings ring longer
  const decay = 0.9965 + Math.min(0.0025, 98 / frequency / 400);
  const out = new Float32Array(Math.floor(sampleRate * seconds));
  let idx = 0;
  for (let i = 0; i < out.length; i++) {
    const next = (idx + 1) % period;
    const sample = ring[idx]!;
    out[i] = sample;
    ring[idx] = decay * 0.5 * (sample + ring[next]!);
    idx = next;
  }
  return out;
}

/** Strums the chord through `ctx`, each string slightly after the last. */
export function strumChord(ctx: AudioContext, frequencies: readonly number[] = G_MAJOR): void {
  const body = ctx.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = 3200;
  const level = ctx.createGain();
  level.gain.value = 0.32;
  body.connect(level).connect(ctx.destination);

  const start = ctx.currentTime + 0.02;
  frequencies.forEach((frequency, i) => {
    const samples = pluckString(frequency, ctx.sampleRate);
    const buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(body);
    source.start(start + i * STRUM_GAP);
  });
}
