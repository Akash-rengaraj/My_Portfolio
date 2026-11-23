/**
 * Cinematic hits made in the browser (Web Audio), no audio files: a deep
 * sub-bass drop with a crack of noise for each impact, and a rising whoosh.
 * Silent until `unlock()` runs inside a click (browsers require a gesture).
 */
export interface Bass {
  unlock(): void;
  hit(power?: number): void;
  whoosh(): void;
  close(): void;
}

/** A decaying noise buffer, `seconds` long. */
function noise(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  return buffer;
}

export function createBass(): Bass {
  let ctx: AudioContext | null = null;

  return {
    unlock() {
      try {
        ctx ??= new AudioContext();
        void ctx.resume();
      } catch {
        ctx = null;
      }
    },
    hit(power = 1) {
      if (!ctx) return;
      const t = ctx.currentTime;
      const level = Math.min(1, 0.55 + power * 0.25);

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(150, t);
      sub.frequency.exponentialRampToValueAtTime(36, t + 0.4);
      subGain.gain.setValueAtTime(level, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      sub.connect(subGain).connect(ctx.destination);
      sub.start(t);
      sub.stop(t + 0.75);

      const crack = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const crackGain = ctx.createGain();
      crack.buffer = noise(ctx, 0.3);
      filter.type = "lowpass";
      filter.frequency.value = 1400;
      crackGain.gain.value = 0.28 * level;
      crack.connect(filter).connect(crackGain).connect(ctx.destination);
      crack.start(t);
    },
    whoosh() {
      if (!ctx) return;
      const t = ctx.currentTime;
      const source = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      source.buffer = noise(ctx, 1.2);
      filter.type = "bandpass";
      filter.Q.value = 1.2;
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 1.1);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      source.connect(filter).connect(gain).connect(ctx.destination);
      source.start(t);
    },
    close() {
      void ctx?.close();
      ctx = null;
    },
  };
}
