// Lightweight synthesized sound effects using the Web Audio API.
// No audio files to ship, no network — just short oscillator blips.
// All calls are safe to make before the user has interacted; they no-op
// until an AudioContext can be created/resumed off a real gesture.

const STORAGE_KEY = "speedMathMuted";

let ctx: AudioContext | null = null;
let muted = loadMuted();

function loadMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") {
    // Best-effort; resolves once a user gesture has occurred.
    void ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Call from a user gesture (e.g. the Start button) to unlock audio. */
export function unlockAudio(): void {
  getCtx();
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

interface ToneOptions {
  freq: number;
  duration: number; // seconds
  type?: OscillatorType;
  gain?: number;
  delay?: number; // seconds from now
  sweepTo?: number; // optional glide target frequency
}

function tone({ freq, duration, type = "sine", gain = 0.14, delay = 0, sweepTo }: ToneOptions): void {
  const audio = getCtx();
  if (!audio || muted) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, sweepTo), start + duration);
  }

  // Quick attack, smooth exponential release — avoids clicks.
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(amp).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sounds = {
  correct(): void {
    tone({ freq: 660, duration: 0.1, type: "triangle" });
    tone({ freq: 990, duration: 0.12, type: "triangle", delay: 0.08 });
  },
  /** Rising sparkle that climbs with the combo level. */
  combo(level: number): void {
    const base = 620 + Math.min(level, 12) * 45;
    tone({ freq: base, duration: 0.09, type: "triangle" });
    tone({ freq: base * 1.5, duration: 0.11, type: "triangle", delay: 0.07 });
    if (level >= 5) tone({ freq: base * 2, duration: 0.12, type: "triangle", delay: 0.14 });
  },
  wrong(): void {
    tone({ freq: 220, duration: 0.28, type: "sawtooth", gain: 0.1, sweepTo: 120 });
  },
  powerup(): void {
    tone({ freq: 520, duration: 0.1, type: "square", gain: 0.09 });
    tone({ freq: 780, duration: 0.1, type: "square", gain: 0.09, delay: 0.09 });
    tone({ freq: 1040, duration: 0.12, type: "square", gain: 0.09, delay: 0.18 });
  },
  countTick(): void {
    tone({ freq: 440, duration: 0.09, type: "sine", gain: 0.08 });
  },
  go(): void {
    tone({ freq: 880, duration: 0.18, type: "triangle", gain: 0.12 });
  },
  gameOver(): void {
    tone({ freq: 440, duration: 0.22, type: "sawtooth", gain: 0.1 });
    tone({ freq: 330, duration: 0.24, type: "sawtooth", gain: 0.1, delay: 0.18 });
    tone({ freq: 220, duration: 0.4, type: "sawtooth", gain: 0.1, delay: 0.36 });
  },
  highScore(): void {
    tone({ freq: 660, duration: 0.12, type: "triangle", gain: 0.12 });
    tone({ freq: 880, duration: 0.12, type: "triangle", gain: 0.12, delay: 0.12 });
    tone({ freq: 1320, duration: 0.28, type: "triangle", gain: 0.12, delay: 0.24 });
  },
};
