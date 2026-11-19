"use client";

import { useEffect, useRef, useState } from "react";

import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { COUNT_UP_MS, countUpValue } from "@/lib/motion";

type CountUpProps = {
  readonly to: number;
  readonly duration?: number;
  readonly className?: string;
};

/**
 * Counts from 0 to `to` once in view (E17: 1.4s, ease-out cubic). The final number is rendered on
 * the server, so it is correct for search engines, no-JS visitors and reduced motion.
 */
export function CountUp({ to, duration = COUNT_UP_MS, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!inView || reduced) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setValue(countUpValue(to, elapsed, duration));
      if (elapsed < duration) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, to, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
