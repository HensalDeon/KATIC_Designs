"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

/**
 * Derives a primitive from the scroll position (and other layout reads) and re-renders only when
 * that value changes. `read` runs on every scroll event, so keep it cheap and return a primitive.
 */
export function useScrollSnapshot<T extends boolean | number | string>(
  read: () => T,
  serverValue: T,
): T {
  return useSyncExternalStore(subscribe, read, () => serverValue);
}
