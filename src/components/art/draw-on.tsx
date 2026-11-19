"use client";

import {
  type ComponentPropsWithoutRef,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";

import { useMediaQuery } from "@/hooks/use-media-query";

type DrawOnProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * Share of the element that must be visible before it draws: `0.25` for process rows
   * (`.ksteps`), `0.2` for feature grids (`.kfeat`), as in the original.
   */
  threshold?: number;
  /**
   * Delay between consecutive drawings in ms (`220` for `.ksteps`, `140` for `.kfeat`). Each
   * `IsoArt` multiplies it by its `order` prop.
   */
  stagger?: number;
};

/**
 * Draw-on trigger for the isometric line art (E23/E24). Renders a `div` (usually the grid itself)
 * that gains `data-drawn` the first time it is `threshold` visible, and never loses it; every
 * `IsoArt` inside then animates in. With `prefers-reduced-motion: reduce` it is drawn immediately.
 *
 * Server-rendered without `data-drawn`, so the markup matches on hydration.
 */
export function DrawOn({ threshold = 0.2, stagger = 0, style, ...props }: DrawOnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const drawn = seen || reducedMotion;

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);

  return (
    <div
      ref={ref}
      data-drawn={drawn ? "" : undefined}
      style={{ "--draw-stagger": `${stagger}ms`, ...style } as CSSProperties}
      {...props}
    />
  );
}
