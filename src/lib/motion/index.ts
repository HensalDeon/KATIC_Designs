/** Motion constants and pure helpers shared by the motion components (original values, analysis/01 §5). */

/** Reveal stagger: `min(index, 6) × 0.09s` (E16). */
export const REVEAL_STAGGER_S = 0.09;
export const REVEAL_STAGGER_CAP = 6;

export function revealDelay(index: number): number {
  const steps = Math.min(Math.max(index, 0), REVEAL_STAGGER_CAP);
  return Math.round(steps * REVEAL_STAGGER_S * 100) / 100;
}

/** Count-up duration (E17). */
export const COUNT_UP_MS = 1400;

/** `1 − (1 − t)³` */
export function easeOutCubic(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return 1 - (1 - clamped) ** 3;
}

/** Value shown by a count-up `elapsed` ms after it started. */
export function countUpValue(target: number, elapsed: number, duration = COUNT_UP_MS): number {
  return Math.round(target * easeOutCubic(elapsed / duration));
}
