/**
 * Pure helpers of auto-advancing content (home services explorer E27, divisions carousel E28),
 * used by `useAutoplay` (src/hooks/use-autoplay.ts).
 */

/** `off`: never advances (out of view, reduced motion or paused); `held`: waits; `running`: ticks. */
export type AutoplayPhase = "off" | "held" | "running";

export type AutoplayConditions = {
  /** Enough of the widget is in view (IntersectionObserver threshold). */
  readonly visible: boolean;
  readonly reducedMotion: boolean;
  /** Paused with the visible pause control (WCAG 2.2.2, KI-A01). */
  readonly paused: boolean;
  readonly hovered: boolean;
  /** Keyboard or pointer focus is inside the widget (other than on the pause control). */
  readonly focused: boolean;
  /** The browser tab is in the background. */
  readonly documentHidden: boolean;
};

export function autoplayPhase(c: AutoplayConditions): AutoplayPhase {
  if (!c.visible || c.reducedMotion || c.paused) return "off";
  if (c.hovered || c.focused || c.documentHidden) return "held";
  return "running";
}

/** `index + step` wrapped into `0 … count − 1`. */
export function wrapIndex(index: number, step: number, count: number): number {
  return (((index + step) % count) + count) % count;
}

/** Whether a horizontal touch gesture is a swipe, and in which direction (original: > 45px). */
export function swipeStep(dx: number, threshold = 45): -1 | 0 | 1 {
  if (Math.abs(dx) <= threshold) return 0;
  return dx < 0 ? 1 : -1;
}

/** Marks a pause control, so focusing it does not hold the rotation it controls. */
export const AUTOPLAY_CONTROL_ATTR = "data-autoplay-control";
