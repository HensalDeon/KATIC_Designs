"use client";

import { type RefObject, useEffect, useState } from "react";

type InViewOptions = {
  readonly threshold?: number;
  readonly rootMargin?: string;
  /** Stop observing after the first intersection (default true). */
  readonly once?: boolean;
};

/** Whether `ref` intersects the viewport, via IntersectionObserver. */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0, rootMargin = "0px", once = true }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);

  return inView;
}
