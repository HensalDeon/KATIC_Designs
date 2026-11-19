"use client";

import { useSyncExternalStore } from "react";

/** The part of the Network Information API this hook reads (Chromium only; absent elsewhere). */
type NetworkInformation = EventTarget & { readonly saveData?: boolean };

function connection(): NetworkInformation | undefined {
  return (navigator as Navigator & { readonly connection?: NetworkInformation }).connection;
}

const REDUCED_DATA_QUERY = "(prefers-reduced-data: reduce)";

function subscribe(onChange: () => void) {
  const network = connection();
  const query = window.matchMedia(REDUCED_DATA_QUERY);
  network?.addEventListener("change", onChange);
  query.addEventListener("change", onChange);
  return () => {
    network?.removeEventListener("change", onChange);
    query.removeEventListener("change", onChange);
  };
}

/**
 * Live "the visitor asked to save data": the browser's Data Saver (`navigator.connection.saveData`,
 * the `Save-Data` header) or `prefers-reduced-data: reduce`. `false` during SSR and hydration, and
 * in browsers that expose neither.
 */
export function useSaveData(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => connection()?.saveData === true || window.matchMedia(REDUCED_DATA_QUERY).matches,
    () => false,
  );
}
