import { type DivisionSlug, routes } from "@/lib/routes";

import type { MediaId } from "./media";

/**
 * The five KATIC divisions. Name, description and card image are identical in the header
 * dropdown, the division cards (`.kc-grid.c5`) and the divisions strips (`.kdiv`)
 * (docs/analysis/04 §3; original `NAV` config and `#about-divisions`).
 */
export type Division = {
  readonly slug: DivisionSlug;
  readonly href: string;
  /** Full name, e.g. "KATIC Design". */
  readonly name: string;
  /** The part after "KATIC", shown in orange in the division hero. */
  readonly accent: string;
  readonly description: string;
  /** Card image (`.kc .im`). */
  readonly image: MediaId;
  readonly alt: string;
};

export const DIVISIONS = {
  design: {
    slug: "design",
    href: routes.division("design"),
    name: "KATIC Design",
    accent: "Design",
    description: "Architecture, planning and facade design shaped by site, climate and purpose.",
    image: "photos/brick-courtyard-house-dusk",
    alt: "KATIC Design",
  },
  interior: {
    slug: "interior",
    href: routes.division("interior"),
    name: "KATIC Interior",
    accent: "Interior",
    description: "Interiors, furniture and in-house manufacturing, from concept to finish.",
    image: "photos/city-view-living-room",
    alt: "KATIC Interior",
  },
  infrastructure: {
    slug: "infrastructure",
    href: routes.division("infrastructure"),
    name: "KATIC Infrastructure",
    accent: "Infrastructure",
    description:
      "Construction and execution for residential, commercial, institutional and hospitality projects.",
    image: "photos/house-under-construction",
    alt: "KATIC Infrastructure",
  },
  developers: {
    slug: "developers",
    href: routes.division("developers"),
    name: "KATIC Developers",
    accent: "Developers",
    description: "Design-led residential and commercial developments, from land to handover.",
    image: "photos/villa-pool-city-skyline",
    alt: "KATIC Developers",
  },
  care: {
    slug: "care",
    href: routes.division("care"),
    name: "KATIC Care",
    accent: "Care",
    description: "Maintenance, repairs and ongoing care that protect your property’s value.",
    image: "photos/lakeside-house-dusk",
    alt: "KATIC Care",
  },
} as const satisfies { readonly [S in DivisionSlug]: Division & { slug: S } };

/** The divisions for `slugs`, in that order. */
export function divisions(slugs: readonly DivisionSlug[]): Division[] {
  return slugs.map((slug) => DIVISIONS[slug]);
}
