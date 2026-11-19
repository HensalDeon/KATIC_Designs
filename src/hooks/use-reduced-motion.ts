"use client";

import { useMediaQuery } from "./use-media-query";

/** Live `prefers-reduced-motion: reduce` (the original read it once; KI-F19). */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
