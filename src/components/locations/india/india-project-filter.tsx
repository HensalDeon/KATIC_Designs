"use client";

import { type ReactNode, useRef, useState } from "react";

import { UrlParamFilter } from "@/components/filters/url-param-filter";
import { cardGridVariants } from "@/components/sections/card-grid-variants";
import { resultCountLabel } from "@/components/works/portfolio-layout";
import type { IndiaFilter } from "@/content/locations/india";
import { useFlipReflow } from "@/hooks/use-flip-reflow";
import { cn } from "@/lib/cn";
import type { IndiaArea } from "@/lib/routes";

import {
  INDIA_FILTER_PARAM,
  indiaFilterHref,
  type IndiaFilterValue,
  inIndiaFilter,
  parseIndiaArea,
} from "./india-filter";

export type IndiaProjectSlot = {
  readonly slug: string;
  readonly area: IndiaArea;
  /** Server-rendered card (`Card` of the shared card grid). */
  readonly content: ReactNode;
};

type IndiaProjectFilterProps = {
  readonly filters: readonly IndiaFilter[];
  /** Accessible name of the filter group. */
  readonly filtersLabel: string;
  readonly cards: readonly IndiaProjectSlot[];
  /** Id of the card list (the buttons' `aria-controls`). */
  readonly listId: string;
};

/**
 * `.kcats button` (global 1918–1921): white with a light border, orange when on, a dark border on
 * hover. The active one has black semibold text like the Works filter: the original's white on
 * orange is 3.4:1 at 12px (KI-A19).
 */
const FILTER_BUTTON = cn(
  "h-40 cursor-pointer border border-[#ddd] bg-white px-18 font-sans text-[12px] font-medium text-ink-2 transition-colors duration-200 hover:border-ink-2",
  "aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:font-semibold aria-pressed:text-black",
);

/**
 * Client part of India's project grid (`.kcats[data-filter="india"]` + `[data-filter-target]`):
 * All / Kochi / Rest of Kerala toggle buttons (`aria-pressed`), a live "N projects" count for
 * screen readers and the three-column card grid, which closes up around the shown cards.
 *
 * Same design as the Works portfolio (DECISIONS P7-03): the filter lives in the URL (`?area=`,
 * pushed without a reload; deep links, back/forward and the legacy `#india/india-projects/<f>`
 * redirect read it back through `UrlParamFilter`), and the cards reflow with `useFlipReflow`, off
 * under reduced motion and on the first sync with the URL.
 */
export function IndiaProjectFilter({
  filters,
  filtersLabel,
  cards,
  listId,
}: IndiaProjectFilterProps) {
  const [filter, setFilter] = useState<IndiaFilterValue>("all");
  const listRef = useRef<HTMLUListElement>(null);
  const prepareReflow = useFlipReflow(listRef, filter);
  const visible = cards.filter((card) => inIndiaFilter(card.area, filter));

  const select = (next: IndiaFilterValue) => {
    if (next === filter) return;
    prepareReflow({ animate: true, measure: true });
    setFilter(next);
    window.history.pushState(null, "", indiaFilterHref(next));
  };

  const syncFromUrl = (next: IndiaFilterValue, initial: boolean) => {
    if (next === filter) return;
    prepareReflow({ animate: !initial });
    setFilter(next);
  };

  return (
    <>
      <UrlParamFilter param={INDIA_FILTER_PARAM} parse={parseIndiaArea} onChange={syncFromUrl} />
      <div role="group" aria-label={filtersLabel} className="flex flex-wrap gap-10">
        {filters.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={option.value === filter}
            aria-controls={listId}
            onClick={() => {
              select(option.value);
            }}
            className={FILTER_BUTTON}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p role="status" data-india-count="" className="sr-only">
        {resultCountLabel(visible.length)}
      </p>
      <ul ref={listRef} id={listId} className={cn(cardGridVariants({ columns: 3 }), "mt-60")}>
        {visible.map((card) => (
          <li key={card.slug} data-card={card.slug} data-area={card.area} className="flex">
            {card.content}
          </li>
        ))}
      </ul>
    </>
  );
}
