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

/**
 * Scroll geometry of an element, from its bounding rect and the viewport height. Both are in
 * **real viewport px** (getBoundingClientRect / innerHeight), which is what makes the maths correct
 * under the desktop canvas `zoom` (docs/analysis/06-zoom-cross-browser.md). Never mix in offset*
 * or canvas-px values.
 */
export type ScrollRect = { readonly top: number; readonly height: number };

/** 0 when the element's top reaches the viewport top, 1 when its bottom reaches the viewport bottom (pinned sections). */
export function pinProgress({ top, height }: ScrollRect, viewportHeight: number): number {
  const travel = Math.max(1, height - viewportHeight);
  return Math.min(Math.max(-top / travel, 0), 1);
}

/** Inner-page parallax: −0.5…0.5 as the element crosses the viewport (original `pxTick`). */
export function parallaxCentre({ top, height }: ScrollRect, viewportHeight: number): number {
  return (top + height / 2 - viewportHeight / 2) / (viewportHeight + height);
}

/** Home signature parallax: −1…1, clamped (original signature tick). */
export function signatureCentre({ top, height }: ScrollRect, viewportHeight: number): number {
  const value = (top + height / 2 - viewportHeight / 2) / (viewportHeight / 2 + height / 2);
  return Math.min(Math.max(value, -1), 1);
}

export function isInViewport({ top, height }: ScrollRect, viewportHeight: number): boolean {
  return top + height > 0 && top < viewportHeight;
}
