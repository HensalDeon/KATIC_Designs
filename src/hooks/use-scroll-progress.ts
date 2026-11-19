"use client";

import { type RefObject, useEffect, useEffectEvent } from "react";

import type { ScrollRect } from "@/lib/motion";

/**
 * Calls `onFrame(rect, viewportHeight)` at most once per animation frame while the page scrolls or
 * resizes (and once on mount), with `ref`'s bounding rect in **viewport px**. Use the pure helpers
 * in `@/lib/motion` (`pinProgress`, `parallaxCentre`, …) to turn that into progress values, and write
 * styles directly to DOM nodes inside the callback so scrolling never re-renders React.
 */
export function useScrollProgress(
  ref: RefObject<Element | null>,
  onFrame: (rect: ScrollRect, viewportHeight: number) => void,
  { enabled = true }: { enabled?: boolean } = {},
): void {
  const handleFrame = useEffectEvent(onFrame);

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = element.getBoundingClientRect();
      handleFrame({ top, height }, window.innerHeight);
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(update);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resizeObserver.disconnect();
    };
  }, [ref, enabled]);
}
