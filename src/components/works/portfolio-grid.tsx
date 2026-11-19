"use client";

import { useSearchParams } from "next/navigation";
import {
  type CSSProperties,
  type ReactNode,
  Suspense,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import type { ShowcaseFilter } from "@/content/home/works";
import type { ProjectCategory } from "@/content/projects";
import { cn } from "@/lib/cn";

import {
  parseWorksCategory,
  type PortfolioSlot,
  portfolioSlots,
  resultCountLabel,
  type RowPattern,
  slotSize,
  worksFilterHref,
  type WorksFilterValue,
} from "./portfolio-layout";

export type PortfolioCardSlot = {
  readonly slug: string;
  readonly categories: readonly ProjectCategory[];
  /** Server-rendered card (`ProjectCard`). */
  readonly content: ReactNode;
};

type PortfolioGridProps = {
  readonly filters: readonly ShowcaseFilter[];
  /** Accessible name of the filter group. */
  readonly filtersLabel: string;
  readonly cards: readonly PortfolioCardSlot[];
  /** Id of the card list (the buttons' `aria-controls`). */
  readonly listId: string;
};

/*
 * One grid holds every card, so a filter change only moves cards (no remounts) and the reflow can
 * animate. On the canvas its columns are the original rows' split points on the 1296px wrap:
 * 472 | 34 | 126 | 34 | 124 | 34 | 472, i.e. edges at 472/506 (`.r2`, last row), 632/666 (`.r3`)
 * and 790/824 (`.r1`). Each card spans the columns of its slot (`portfolioSlots`).
 * - 861–1099px: two equal columns (KI-L28: the original stacks them in one column at 1024).
 * - ≤860px: one column; 36px between the two cards of a row and 80px between rows, as the
 *   original's stacked rows.
 */
const GRID = cn(
  "mt-60 grid grid-cols-[472px_34px_126px_34px_124px_34px_472px] gap-y-80",
  "max-lg:grid-cols-2 max-lg:gap-x-36 max-md:grid-cols-1 max-md:gap-y-36",
);

/** Column spans per row pattern on the canvas (`ROW_PATTERNS`); one cell each below 1100px. */
const SLOT_CLASS: Record<RowPattern, { readonly left: string; readonly right: string }> = {
  0: { left: "col-[1/6]", right: "col-[7/8]" },
  1: { left: "col-[1/2] self-end", right: "col-[3/8] self-end" },
  2: { left: "col-[1/4]", right: "col-[5/8]" },
  3: { left: "col-[1/2]", right: "col-[3/8]" },
};

function slotClass(slot: PortfolioSlot): string {
  // A card alone on the last row takes the wide column on the canvas and the full row on tablets.
  return cn(
    slot.side === "single"
      ? "col-[1/6] max-lg:col-span-2 max-md:col-span-1"
      : cn(SLOT_CLASS[slot.pattern][slot.side], "max-lg:col-auto max-lg:self-auto"),
    // Phones: the first card of each row after the first adds the 80px row gap.
    slot.side !== "right" && slot.row > 0 && "max-md:mt-44",
  );
}

/** `.fl button`, as rendered on the white section (the active one keeps black text). */
const FILTER_BUTTON = cn(
  "h-40 cursor-pointer border border-[rgba(0,0,0,0.22)] bg-transparent px-19 font-sans text-[11px] font-medium text-[#222] transition-colors duration-200 hover:border-[#222]",
  "aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:font-semibold aria-pressed:text-black",
);

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

/** Each card's position relative to the grid, in canvas px (independent of scrolling). */
function measure(grid: HTMLElement): Map<string, Point> {
  const origin = grid.getBoundingClientRect();
  const zoom = canvasZoom();
  const points = new Map<string, Point>();
  for (const item of grid.querySelectorAll<HTMLElement>("[data-card]")) {
    const rect = item.getBoundingClientRect();
    points.set(item.dataset["card"] ?? "", {
      x: (rect.left - origin.left) / zoom,
      y: (rect.top - origin.top) / zoom,
    });
  }
  return points;
}

/**
 * Client part of the Works portfolio (`.fl` + `[data-filter-target]`, E21-style filter): toggle
 * buttons (`aria-pressed`, KI-A07), a live "N projects" count for screen readers and the reflowing
 * card grid (KI-L05).
 *
 * The filter lives in the URL (`?category=`, KI-F15): a click pushes a history entry without a
 * reload, and the URL is read back through `useSearchParams` (inside a Suspense boundary, so the
 * page stays static and the server renders every project), which also covers back/forward, deep
 * links and the legacy `#works/works-list/<f>` redirect. Unknown values show everything.
 *
 * Cards that stay slide to their new place and new ones fade in (FLIP, Web Animations); nothing
 * moves with reduced motion or on the first sync with the URL.
 */
export function PortfolioGrid({ filters, filtersLabel, cards, listId }: PortfolioGridProps) {
  const [filter, setFilter] = useState<WorksFilterValue>("all");
  const gridRef = useRef<HTMLUListElement>(null);
  /** Card positions before the next change (grid-relative canvas px). */
  const previous = useRef<Map<string, Point>>(new Map());
  const animateNext = useRef(false);

  const visible = cards.filter((card) => filter === "all" || card.categories.includes(filter));
  const slots = portfolioSlots(visible.length);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const items = [...grid.querySelectorAll<HTMLElement>("[data-card]")];
    for (const item of items) for (const animation of item.getAnimations()) animation.cancel();
    const next = measure(grid);
    const animate =
      animateNext.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    animateNext.current = false;
    if (animate) {
      let entering = 0;
      for (const item of items) {
        const slug = item.dataset["card"] ?? "";
        const from = previous.current.get(slug);
        const to = next.get(slug);
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
  }, [filter]);

  const select = (next: WorksFilterValue) => {
    if (next === filter) return;
    // Start from where the cards are now (mid-animation included).
    const grid = gridRef.current;
    if (grid) previous.current = measure(grid);
    animateNext.current = true;
    setFilter(next);
    window.history.pushState(null, "", worksFilterHref(next));
  };

  const syncFromUrl = (next: WorksFilterValue, initial: boolean) => {
    if (next === filter) return;
    animateNext.current = !initial;
    setFilter(next);
  };

  return (
    <>
      <Suspense fallback={null}>
        <UrlFilter onChange={syncFromUrl} />
      </Suspense>
      <div
        role="group"
        aria-label={filtersLabel}
        className="mt-56 flex gap-9 border-b border-[rgba(0,0,0,0.14)] pb-22 max-md:flex-wrap"
      >
        {filters.map((option) => (
          <button
            key={option.category}
            type="button"
            aria-pressed={option.category === filter}
            aria-controls={listId}
            onClick={() => {
              select(option.category);
            }}
            className={FILTER_BUTTON}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p role="status" data-portfolio-count="" className="sr-only">
        {resultCountLabel(visible.length)}
      </p>
      <ul ref={gridRef} id={listId} className={GRID}>
        {visible.map((card, index) => {
          const slot = slots[index] ?? { row: 0, pattern: 0, side: "single" };
          return (
            <li
              key={card.slug}
              data-card={card.slug}
              data-row={slot.row}
              data-side={slot.side}
              style={{ "--im-h": `${String(slotSize(slot).height)}px` } as CSSProperties}
              className={slotClass(slot)}
            >
              {card.content}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/**
 * Reads `?category=` and reports it (first call: the value on arrival). Isolated in its own Suspense
 * boundary so only this null-rendering component waits for the URL on a static page.
 */
function UrlFilter({
  onChange,
}: {
  readonly onChange: (filter: WorksFilterValue, initial: boolean) => void;
}) {
  const filter = parseWorksCategory(useSearchParams().get("category"));
  const initial = useRef(true);
  // Runs only when the URL changes. A click updates the grid before the router commits the pushed
  // URL; re-running on every new `onChange` would report the stale URL and undo the click.
  const report = useEffectEvent((next: WorksFilterValue) => {
    onChange(next, initial.current);
    initial.current = false;
  });
  useEffect(() => {
    report(filter);
  }, [filter]);
  return null;
}
