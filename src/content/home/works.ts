import type { ProjectCategory, ProjectSlug } from "@/content/projects";
import { routes } from "@/lib/routes";

/**
 * Home "Selected Works" (`section.wk.pinsec#home-works`, docs/analysis/02 §1.4). Copy is verbatim
 * from the original; the cards are projects referenced by slug (`src/content/projects.ts`).
 */

export type ShowcaseFilter = {
  readonly label: string;
  /** Category the tab shows; `"all"` shows every project. */
  readonly category: ProjectCategory | "all";
};

export type HomeWorksContent = {
  readonly kicker: string;
  /** Title lines (the original breaks "Selected<br>Works"). */
  readonly title: readonly string[];
  readonly lead: string;
  readonly cta: { readonly label: string; readonly href: string };
  /**
   * Category tabs, as rendered. Hospitality and Institutional have no tab on the home page; those
   * projects show under All (and their other categories). The client may add tabs (KI-D02).
   */
  readonly filters: readonly ShowcaseFilter[];
  /** Cards in showcase order. */
  readonly projects: readonly ProjectSlug[];
  /** Card link label (`.sc-more`, the arrow is drawn by the component). */
  readonly cardLinkLabel: string;
};

export const HOME_WORKS = {
  kicker: "Selected Works",
  title: ["Selected", "Works"],
  lead: "A selection of residential, commercial, and civic commissions delivered across Kerala and beyond — each built to our founding principle of eco-conscious design.",
  cta: { label: "View All Projects", href: routes.works },
  filters: [
    { label: "All", category: "all" },
    { label: "Residential", category: "residential" },
    { label: "Commercial", category: "commercial" },
    { label: "Architecture", category: "architecture" },
    { label: "Interiors", category: "interiors" },
    { label: "Villas / Flats", category: "villas" },
  ],
  projects: [
    "obsidian-lounge",
    "velvet-suite-penthouse",
    "galicica-retreat",
    "palm-veil-residence",
    "cinder-house",
    "nila-apartments",
    "serein-wellness-club",
    "house-of-three-courts",
    "al-quoz-atelier",
    "greenfield-school-campus",
    "difc-gallery-office",
  ],
  cardLinkLabel: "View Project",
} as const satisfies HomeWorksContent;

/** "1 project" / "5 projects" (the original's `.wk-count` text). */
export function projectCountLabel(count: number): string {
  return `${String(count)} ${count === 1 ? "project" : "projects"}`;
}
