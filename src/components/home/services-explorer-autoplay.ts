"use client";

import {
  type FocusEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
} from "react";

import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

/**
 * Auto-advance shared by the home services explorer (E27, 6s) and divisions carousel (E28, 5s).
 * It lives next to the explorer because home components may not add shared hooks yet; it is a
 * candidate for `src/hooks/use-autoplay.ts`.
 */

/** `off`: never advances (out of view, reduced motion or paused); `held`: waits; `running`: ticks. */
export type AutoplayPhase = "off" | "held" | "running";

export type AutoplayConditions = {
  /** Enough of the section is in view (IntersectionObserver threshold). */
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

function subscribeVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Marks the pause control, so focusing it does not hold the rotation it controls. */
export const AUTOPLAY_CONTROL_ATTR = "data-autoplay-control";

type AutoplayOptions = {
  readonly ref: RefObject<HTMLElement | null>;
  /** Share of the root that must be visible (explorer .3, carousel .35). */
  readonly threshold: number;
  readonly interval: number;
  /** Current item; changing it restarts the interval. */
  readonly index: number;
  readonly onAdvance: () => void;
};

export type Autoplay = {
  readonly phase: AutoplayPhase;
  readonly paused: boolean;
  readonly togglePaused: () => void;
  /** Changes each time an interval starts: key the progress bar with it to restart its animation. */
  readonly cycle: number;
  /** Spread on the widget root: hover and focus hold the rotation. */
  readonly rootProps: {
    /** Current phase, for styling hooks and tests. */
    readonly "data-autoplay": AutoplayPhase;
    readonly onPointerEnter: (event: PointerEvent) => void;
    readonly onPointerLeave: (event: PointerEvent) => void;
    readonly onFocus: (event: FocusEvent) => void;
    readonly onBlur: (event: FocusEvent) => void;
  };
};

/**
 * Advances every `interval` ms while the root is at least `threshold` visible, never under reduced
 * motion, and holds while hovered (mouse), while focus is inside or while the tab is hidden. A
 * hold restarts the full interval when it ends, as in the original.
 */
export function useAutoplay({ ref, threshold, interval, index, onAdvance }: AutoplayOptions) {
  const visible = useInView(ref, { threshold, once: false });
  const reducedMotion = useReducedMotion();
  const documentHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    () => false,
  );
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const phase = autoplayPhase({
    visible,
    reducedMotion,
    paused,
    hovered,
    focused,
    documentHidden,
  });
  const running = phase === "running";

  // Count interval starts (state adjusted during render, React's pattern for derived resets).
  const [cycle, setCycle] = useState(0);
  const [wasRunning, setWasRunning] = useState(running);
  if (wasRunning !== running) {
    setWasRunning(running);
    if (running) setCycle(cycle + 1);
  }

  const advance = useEffectEvent(onAdvance);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      advance();
    }, interval);
    return () => window.clearTimeout(timer);
  }, [running, interval, index, cycle]);

  return {
    phase,
    paused,
    togglePaused: () => setPaused((value) => !value),
    cycle,
    rootProps: {
      "data-autoplay": phase,
      onPointerEnter: (event: PointerEvent) => {
        if (event.pointerType === "mouse") setHovered(true);
      },
      onPointerLeave: () => setHovered(false),
      onFocus: (event: FocusEvent) => {
        const onControl =
          event.target instanceof Element &&
          event.target.closest(`[${AUTOPLAY_CONTROL_ATTR}]`) !== null;
        setFocused(!onControl);
      },
      onBlur: (event: FocusEvent) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setFocused(false);
      },
    },
  } satisfies Autoplay;
}
