// Single source of truth for how points are awarded.
// Both the score that gets committed (App) and the floating "+points" the
// player sees (GameScreen) run through this so they can never disagree.

export const BASE_POINTS = 10;
export const MAX_SPEED_BONUS = 15;
export const MAX_MULTIPLIER = 10;

export interface ScoreInput {
  /** Seconds the player took to answer. */
  timeElapsedSec: number;
  /** Total time that was available for this question. */
  timeLimitSec: number;
  /** Combo count BEFORE this answer (0 for the first correct answer). */
  combo: number;
  /** Whether the double-score power-up is active for this answer. */
  doubleScore: boolean;
}

/**
 * Fraction of the time limit that was left when the answer came in (0..1).
 * Faster answers keep this closer to 1.
 */
export function speedFraction(timeElapsedSec: number, timeLimitSec: number): number {
  if (timeLimitSec <= 0) return 0;
  return Math.min(1, Math.max(0, 1 - timeElapsedSec / timeLimitSec));
}

/** Combo multiplier, capped so late-game numbers stay readable. */
export function comboMultiplier(comboBeforeAnswer: number): number {
  return Math.min(comboBeforeAnswer + 1, MAX_MULTIPLIER);
}

/** Points awarded for a single correct answer. */
export function computePoints({
  timeElapsedSec,
  timeLimitSec,
  combo,
  doubleScore,
}: ScoreInput): number {
  const speedBonus = Math.round(speedFraction(timeElapsedSec, timeLimitSec) * MAX_SPEED_BONUS);
  const base = BASE_POINTS + speedBonus;
  const multiplier = comboMultiplier(combo);
  return base * multiplier * (doubleScore ? 2 : 1);
}
