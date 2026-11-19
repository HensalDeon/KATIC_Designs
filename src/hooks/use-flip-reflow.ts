"use client";

import { type RefObject, useLayoutEffect, useRef } from "react";

/** Reflow timing: subtle, on the site's ease-out curve. */
const MOVE_MS = 520;
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

type Point = { readonly x: number; readonly y: number };

/** Canvas scale (`--z`, set by the zoom script); transforms inside the canvas are in canvas px. */
function canvasZoom(): number {
  const zoom = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--z"),
  );
  return zoom > 0 ? zoom : 1;
}

/** Each `[data-card]` item's position relative to the list, in canvas px (independent of scrolling). */
function measure(list: HTMLElement): Map<string, Point> {
  const origin = list.getBoundingClientRect();
  const zoom = canvasZoom();
  const points = new Map<string, Point>();
  for (const item of list.querySelectorAll<HTMLElement>("[data-card]")) {
    const rect = item.getBoundingClientRect();
    points.set(item.dataset["card"] ?? "", {
      x: (rect.left - origin.left) / zoom,
      y: (rect.top - origin.top) / zoom,
    });
  }
  return points;
}

/**
 * Call right before changing the filtered set. `measure` (a visitor's click) starts the animation
 * from where the cards are now, mid-animation included; without it (the URL changed), from where
 * the last change left them. `animate: false` changes the set without motion (the first sync with
 * the URL).
 */
export type PrepareReflow = (options: {
  readonly animate: boolean;
  readonly measure?: boolean;
}) => void;

/**
 * FLIP reflow of a filtered card list (the Works portfolio and India's projects, DECISIONS P7-03):
 * when `state` changes, the `[data-card="<key>"]` children of `listRef` that stay slide from their
 * old place to the new one and new ones fade in, with the Web Animations API. Positions are in
 * canvas px, so it is correct under the desktop `zoom`. Nothing moves under reduced motion or
 * unless `prepare({ animate: true })` ran.
 */
export function useFlipReflow(
  listRef: RefObject<HTMLElement | null>,
  state: unknown,
): PrepareReflow {
  /** Card positions before the next change (list-relative canvas px). */
  const previous = useRef<Map<string, Point>>(new Map());
  const animateNext = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = [...list.querySelectorAll<HTMLElement>("[data-card]")];
    for (const item of items) for (const animation of item.getAnimations()) animation.cancel();
    const next = measure(list);
    const animate =
      animateNext.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    animateNext.current = false;
    if (animate) {
      let entering = 0;
      for (const item of items) {
        const key = item.dataset["card"] ?? "";
        const from = previous.current.get(key);
        const to = next.get(key);
        if (!to) continue;
        if (from) {
          const dx = from.x - to.x;
          const dy = from.y - to.y;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
          item.animate(
            [
              { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` },
              { transform: "none" },
            ],
            { duration: MOVE_MS, easing: EASE },
          );
        } else {
          item.animate(
            [
              { opacity: 0, transform: "translateY(24px)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: MOVE_MS,
              delay: 80 + Math.min(entering, 5) * 40,
              easing: EASE,
              fill: "backwards",
            },
          );
          entering += 1;
        }
      }
    }
    previous.current = next;
  }, [listRef, state]);

  return ({ animate, measure: measureNow = false }) => {
    const list = listRef.current;
    if (measureNow && list) previous.current = measure(list);
    animateNext.current = animate;
  };
}
