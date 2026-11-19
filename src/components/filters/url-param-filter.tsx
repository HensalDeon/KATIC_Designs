"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useEffectEvent, useRef } from "react";

type UrlParamFilterProps<T extends string> = {
  /** Query parameter holding the filter, e.g. `category` (Works) or `area` (India). */
  readonly param: string;
  /** Maps the raw value (missing, empty or unknown included) to a filter. */
  readonly parse: (value: string | null) => T;
  /** Reports the URL's filter; `initial` is true for the value on arrival. */
  readonly onChange: (filter: T, initial: boolean) => void;
};

/**
 * Reads a filter from the URL query and reports it (first call: the value on arrival), for the
 * filterable grids whose state lives in the URL (DECISIONS P7-03): deep links, back/forward and the
 * legacy hash redirects. Wrapped in its own Suspense boundary, so only this null-rendering
 * component waits for the URL and the page around it stays static.
 */
export function UrlParamFilter<T extends string>(props: UrlParamFilterProps<T>) {
  return (
    <Suspense fallback={null}>
      <Listener {...props} />
    </Suspense>
  );
}

function Listener<T extends string>({ param, parse, onChange }: UrlParamFilterProps<T>) {
  const filter = parse(useSearchParams().get(param));
  const initial = useRef(true);
  // Runs only when the URL changes. A click updates the grid before the router commits the pushed
  // URL; re-running on every new `onChange` would report the stale URL and undo the click.
  const report = useEffectEvent((next: T) => {
    onChange(next, initial.current);
    initial.current = false;
  });
  useEffect(() => {
    report(filter);
  }, [filter]);
  return null;
}
