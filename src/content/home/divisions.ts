import { DIVISIONS } from "@/content/divisions";
import { type DivisionSlug, routes } from "@/lib/routes";

import type { MediaId } from "../media";

/**
 * Home divisions carousel (`section.ks.dvs.dvx#home-divisions`): copy verbatim from the original
 * (reference/original, lines 2885–2893). Names and links come from the shared `DIVISIONS`; the
 * home slides add their own headline, description and photo (`dd00000001…05`), which differ from
 * the division cards used elsewhere.
 */
export type DivisionSlide = {
  readonly slug: DivisionSlug;
  readonly name: string;
  readonly href: string;
  /** The headline's three lines (each rises separately). */
  readonly titleLines: readonly [string, string, string];
  readonly description: string;
  readonly image: MediaId;
};

export type DivisionsCarouselContent = {
  readonly kicker: string;
  /** Title lines (the original's `<br>`). */
  readonly titleLines: readonly string[];
  readonly lead: string;
  readonly cta: { readonly label: string; readonly href: string };
  readonly exploreLabel: string;
  /** Accessible name of the carousel (original `aria-label`). */
  readonly label: string;
  readonly slides: readonly DivisionSlide[];
};

function slide(
  slug: DivisionSlug,
  titleLines: DivisionSlide["titleLines"],
  description: string,
  image: MediaId,
): DivisionSlide {
  const { name, href } = DIVISIONS[slug];
  return { slug, name, href, titleLines, description, image };
}

export const HOME_DIVISIONS: DivisionsCarouselContent = {
  kicker: "Our Divisions",
  titleLines: ["One vision.", "Five divisions."],
  lead: "Specialist teams for design, interiors, construction, development and care — working together on every KATIC project.",
  cta: { label: "About Our Divisions", href: `${routes.about}#about-divisions` },
  exploreLabel: "Explore Division",
  label: "Our divisions",
  slides: [
    slide(
      "design",
      ["Buildings shaped", "by site, climate", "and purpose."],
      "Architecture, planning and facade design that start with the land, the light and the way you want to live.",
      "photos/white-hallway-stair",
    ),
    slide(
      "interior",
      ["Rooms designed,", "made and installed", "by one team."],
      "Interiors, joinery and lighting drawn in our studio and built in our own workshop — so what you approve is what arrives.",
      "photos/kitchen-joinery",
    ),
    slide(
      "infrastructure",
      ["Where drawings", "become", "buildings."],
      "Construction and execution for homes, workplaces, institutions and hospitality, built to the drawing and on programme.",
      "photos/ornate-bedroom-suite",
    ),
    slide(
      "developers",
      ["Homes built", "from land", "to handover."],
      "Design-led residential and commercial developments, planned and delivered by the same teams that design them.",
      "photos/living-room-tropical-wallpaper",
    ),
    slide(
      "care",
      ["Spaces kept at", "their very best,", "year after year."],
      "Maintenance, repairs and inspections that protect your property’s value long after the keys are handed over.",
      "photos/timber-entrance-door",
    ),
  ],
};
