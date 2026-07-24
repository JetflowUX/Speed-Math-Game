import { useEffect, useRef, useState } from "react";

interface TimerBarProps {
  /** Total seconds allowed for the current question. Increasing this mid-question
   *  (e.g. an Extra Time power-up) extends the remaining time by the delta. */
  durationSec: number;
  /** Changes whenever a new question appears — this is what actually resets the
   *  timer, so it no longer matters whether two questions share the same duration. */
  resetKey: number;
  /** Freezes the countdown (answer reveal, pre-game countdown, tab hidden). */
  paused: boolean;
  onTimeout: () => void;
}

export function TimerBar({ durationSec, resetKey, paused, onTimeout }: TimerBarProps) {
  const [remainingMs, setRemainingMs] = useState(durationSec * 1000);

  const remainingRef = useRef(durationSec * 1000);
  const durationRef = useRef(durationSec);
  const firedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  // New question → full reset. Keyed on resetKey only (not duration) so it
  // fires exactly once per question, reliably.
  useEffect(() => {
    remainingRef.current = durationSec * 1000;
    durationRef.current = durationSec;
    firedRef.current = false;
    setRemainingMs(remainingRef.current);
    // durationSec intentionally omitted: extensions are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // Duration grew within the same question (power-up) → extend, don't reset.
  useEffect(() => {
    const deltaMs = (durationSec - durationRef.current) * 1000;
    durationRef.current = durationSec;
    if (deltaMs > 0) {
      remainingRef.current += deltaMs;
      setRemainingMs(remainingRef.current);
    }
  }, [durationSec]);

  // The countdown loop. Uses real frame deltas (no accumulated setInterval
  // drift) and skips entirely while paused, so paused time isn't counted.
  useEffect(() => {
    if (paused) return;

    lastTsRef.current = null;
    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;

      remainingRef.current = Math.max(0, remainingRef.current - dt);
      setRemainingMs(remainingRef.current);

      if (remainingRef.current <= 0) {
        if (!firedRef.current) {
          firedRef.current = true;
          onTimeoutRef.current();
        }
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, resetKey]);

  const totalMs = durationRef.current * 1000;
  const percentage = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;
  const secondsLeft = remainingMs / 1000;

  const color = percentage > 55 ? "#00ff88" : percentage > 28 ? "#ffaa00" : "#ff3355";
  const isLow = percentage <= 28;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[0.6rem] xs:text-xs tracking-[0.2em] uppercase text-slate-400">
          Time
        </span>
        <span
          className={`orbitron-text text-sm xs:text-base font-bold tabular-nums transition-colors ${
            isLow ? "timer-readout-low" : ""
          }`}
          style={{ color }}
          aria-live="off"
        >
          {secondsLeft.toFixed(1)}s
        </span>
      </div>
      <div
        className="w-full h-3 xs:h-4 bg-slate-800/80 rounded-full overflow-hidden"
        role="progressbar"
        aria-label="Time remaining"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalMs / 1000)}
        aria-valuenow={Math.round(secondsLeft)}
      >
        <div
          className={`h-full rounded-full ${isLow && !paused ? "timer-bar-pulse" : ""}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}66`,
            // No CSS transition — width is driven per-frame by rAF for smoothness.
          }}
        />
      </div>
    </div>
  );
}
