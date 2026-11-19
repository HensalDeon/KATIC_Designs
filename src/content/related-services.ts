import { routes, type ServiceSlug } from "@/lib/routes";

import type { MediaId } from "./media";

/**
 * Related-service cards (`.kc` service flavour). The original shows the same image, title and
 * description for a service everywhere; pages only choose which cards appear and in what order
 * (docs/analysis/03 §2.10). Factory has no card. Fields match `CardGrid` items.
 */
export type RelatedService = {
  readonly slug: RelatedServiceSlug;
  readonly href: string;
  readonly title: string;
  readonly text: string;
  readonly image: MediaId;
  readonly alt: string;
};

export type RelatedServiceSlug = Exclude<ServiceSlug, "factory">;

export const RELATED_SERVICES = {
  architecture: {
    slug: "architecture",
    href: routes.service("architecture"),
    title: "Architectural Design",
    text: "Consultation, planning, architecture, elevations and spatial design.",
    image: "photos/brick-courtyard-house-dusk",
    alt: "Architectural Design",
  },
  interior: {
    slug: "interior",
    href: routes.service("interior"),
    title: "Interior Design",
    text: "Interior planning, materials, furniture and execution.",
    image: "photos/living-room-tv-wall",
    alt: "Interior Design",
  },
  construction: {
    slug: "construction",
    href: routes.service("construction"),
    title: "Construction & Execution",
    text: "Residential and commercial construction, project coordination and finishing.",
    image: "photos/construction-team-drawings",
    alt: "Construction & Execution",
  },
  turnkey: {
    slug: "turnkey",
    href: routes.service("turnkey"),
    title: "Turnkey Projects",
    text: "Complete project delivery for residential, commercial and hospitality spaces.",
    image: "photos/formal-dining-room",
    alt: "Turnkey Projects",
  },
  renovation: {
    slug: "renovation",
    href: routes.service("renovation"),
    title: "Renovation & Remodeling",
    text: "Transforming existing spaces through renovation and redesign.",
    image: "photos/brick-house-arched-windows-night",
    alt: "Renovation & Remodeling",
  },
  exterior: {
    slug: "exterior",
    href: routes.service("exterior"),
    title: "Exterior & Landscape Design",
    text: "Outdoor spaces, parks, facades and landscape planning.",
    image: "photos/house-rain-garden",
    alt: "Exterior & Landscape Design",
  },
  "property-care": {
    slug: "property-care",
    href: routes.service("property-care"),
    title: "Property Care & Maintenance",
    text: "Property maintenance, repairs and ongoing support.",
    image: "photos/teak-stair-handrail",
    alt: "Property Care & Maintenance",
  },
} as const satisfies { readonly [S in RelatedServiceSlug]: RelatedService & { slug: S } };

/** The cards for `slugs`, in that order. */
export function relatedServices(slugs: readonly RelatedServiceSlug[]): RelatedService[] {
  return slugs.map((slug) => RELATED_SERVICES[slug]);
}
