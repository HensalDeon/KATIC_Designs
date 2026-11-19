import { routes, WORKS_CATEGORIES, type WorksCategory } from "@/lib/routes";

/**
 * Filter state and grid layout of the Works portfolio (`#p-works section.sw#works-list`). Pure, so
 * the rules are unit-tested (portfolio-layout.test.ts) and shared by the server and client render.
 */

/** A portfolio filter: a category or every project. */
export type WorksFilterValue = WorksCategory | "all";

const PORTFOLIO_ID = "works-list";

/**
 * The filter named by a `?category=` value. Missing, empty and unknown values show every project,
 * like the original's `#works/works-list/<f>` router (JS 4744).
 */
export function parseWorksCategory(value: string | null | undefined): WorksFilterValue {
  return (WORKS_CATEGORIES as readonly string[]).includes(value ?? "")
    ? (value as WorksCategory)
    : "all";
}

/** Shareable URL of a filter state; it lands on the portfolio (`/works?category=x#works-list`). */
export function worksFilterHref(filter: WorksFilterValue): string {
  return filter === "all" ? `${routes.works}#${PORTFOLIO_ID}` : routes.worksCategory(filter);
}

/**
 * The original's four hand-tuned two-card rows (page `<style>` 3647–3649 and the inline last row,
 * markup 3742): column widths and image heights on the 1296px `.wrap.w72`, with 34px between the
 * columns and 80px between rows.
 */
export const ROW_PATTERNS = [
  /** `.r1`: 790px / 1fr. */
  { columns: [790, 472], heights: [570, 570], alignEnd: false },
  /** `.r2`: 472px / 1fr, cards aligned to the bottom. */
  { columns: [472, 790], heights: [430, 560], alignEnd: true },
  /** `.r3`: 632px / 1fr. */
  { columns: [632, 630], heights: [509, 509], alignEnd: false },
  /** `.r1` with inline `grid-template-columns: 1fr 790px`. */
  { columns: [472, 790], heights: [470, 570], alignEnd: false },
] as const;

export type RowPattern = 0 | 1 | 2 | 3;

/**
 * Where a card sits: its row, the row's pattern and its side. A card left alone on the last row is
 * `single`: it takes the wide editorial column (790px, 570 tall) instead of a narrow one.
 */
export type PortfolioSlot = {
  readonly row: number;
  readonly pattern: RowPattern;
  readonly side: "left" | "right" | "single";
};

/**
 * Lays out `count` cards (the filtered list, in order) two per row, cycling through the original's
 * row patterns by row index. With all 8 projects this is exactly the original layout; any filtered
 * list reflows the same way, so every row but the last is full and no row is left empty
 * (KI-L05: the original hid cards inside fixed rows, leaving holes and empty 80px rows).
 */
export function portfolioSlots(count: number): PortfolioSlot[] {
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / 2);
    const pattern = (row % ROW_PATTERNS.length) as RowPattern;
    const isLeft = index % 2 === 0;
    const side = isLeft ? (index === count - 1 ? "single" : "left") : "right";
    return { row, pattern, side };
  });
}

/** Width (canvas px) and image height of a slot on the 1440 canvas. */
export function slotSize(slot: PortfolioSlot): { readonly width: number; readonly height: number } {
  if (slot.side === "single") {
    return { width: ROW_PATTERNS[0].columns[0], height: ROW_PATTERNS[0].heights[0] };
  }
  const pattern = ROW_PATTERNS[slot.pattern];
  const index = slot.side === "left" ? 0 : 1;
  return { width: pattern.columns[index], height: pattern.heights[index] };
}

/**
 * The card's meta line (`.m`): location, type and scope, separated by orange slashes. Scopes that
 * already start with the type (the home showcase's "Institutional / Architecture") are not
 * repeated. Built from data, so every separator is styled (KI-D06: the original typed a plain
 * " / " on two cards).
 */
export function cardMetaParts(project: {
  readonly location: string;
  readonly type: string;
  readonly scope: string;
}): string[] {
  const parts = [project.location, project.type, ...project.scope.split(" / ")];
  return parts.filter((part, index) => parts.indexOf(part) === index);
}

/** "1 project" / "8 projects": the live result count. */
export function resultCountLabel(count: number): string {
  return `${String(count)} ${count === 1 ? "project" : "projects"}`;
}
