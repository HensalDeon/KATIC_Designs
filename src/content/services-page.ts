import { routes } from "@/lib/routes";
import type {
  LabelledPhoto,
  ServiceBlockContent,
  ServicesHeroContent,
  WhatWeDeliverContent,
  WhatWeDoContent,
} from "@/lib/schemas/services-page";

import { media, type MediaId } from "./media";

/**
 * Services overview (`#p-services`, docs/analysis/02 §3). Copy is verbatim from the original.
 * Service names, descriptions and links are not repeated here: each block names its service by slug
 * and the page takes them from the shared service cards (`RELATED_SERVICES`), so it cannot drift
 * from the rest of the site. Will come from Laravel (Phase 11).
 */

/** `<head>` of the page: the original's `data-title` / `data-desc` on `#p-services`. */
export const SERVICES_PAGE_SEO = {
  title: "Architecture, Interior & Construction Services | Katic Designs",
  description:
    "Architectural design, interior design, construction, turnkey projects, renovation, landscape and property care for homes and commercial spaces in Kerala and the UAE.",
} as const;

/**
 * Alt text from the asset's description. The original repeats the service name as the alt of all
 * five images of a block (KI-A13); each photo now describes itself.
 */
function photo(src: MediaId, label: string): LabelledPhoto {
  return { src, alt: media[src].description, label };
}

export const SERVICES_HERO = {
  // Decorative backdrop: the original's alt only repeated the title (KI-A13).
  image: { src: "photos/dark-lounge-interior", alt: "" },
  kicker: "Integrated design and build",
  titleLines: ["Architecture,", "Interiors &", "Construction —"],
  accent: "Under One Vision",
  lead: "Katic Designs brings architecture, interior design, construction and related services together to create complete spaces across Kerala and the UAE.",
  cta: { label: "Explore Our Work", href: routes.works },
  indexLabel: "OUR SERVICES",
} as const satisfies ServicesHeroContent;

/** "What we do" (`section.pp-host.wd2`). The step icons repeat the original's (KI-D03). */
export const WHAT_WE_DO = {
  kicker: "Integrated practice",
  title: "What We Do",
  statement: "One studio. One standard. One continuous line from first sketch to final handover.",
  lead: "KATIC is an integrated practice: architecture, interiors, construction and care delivered by one team, from concept to completion.",
  body: "Our architects, interior designers and site teams work as one, aligning ideas, materials, budgets and craft from the start.",
  cta: { label: "Our Process", href: `${routes.service("architecture")}#process` },
  steps: [
    { icon: "compass", title: "Concept", text: "Brief, site and possibility." },
    { icon: "compass", title: "Design", text: "Architecture and interiors." },
    { icon: "crane", title: "Build", text: "Coordination and execution." },
    { icon: "key", title: "Complete", text: "Details, handover and care." },
  ],
} as const satisfies WhatWeDoContent;

/** "What we deliver" (`section.fd`). */
export const WHAT_WE_DELIVER = {
  kicker: "What we deliver",
  titleLines: ["Seven services.", "One point of", "responsibility."],
  // TODO(content): KI-C07 — reads as designer-brief copy ("on one page… its full page"); confirm with the client.
  lead: "Every KATIC service on one page. Open any service for its full page, process, projects and enquiry form.",
} as const satisfies WhatWeDeliverContent;

/**
 * The seven blocks, in the order the page, its hero index and the footer list the services. Tones
 * strictly alternate, images alternate right/left.
 */
export const SERVICE_BLOCKS = [
  {
    slug: "architecture",
    tone: "light",
    contrast: "standard",
    reverse: false,
    icon: "leaf",
    tagline: "SITE · CLIMATE · FORM",
    ctaLabel: "Explore Architectural Design",
    image: photo("photos/house-reflecting-pool", "SITE · CLIMATE · FORM"),
    thumbnails: [
      photo("photos/brick-courtyard-garden", "VILLA 01"),
      photo("photos/spiral-stair-courtyard", "VILLA 02"),
      photo("photos/coastal-terrace-house", "VILLA 03"),
      photo("photos/brick-jali-facade", "VILLA 04"),
    ],
  },
  {
    slug: "interior",
    tone: "dark",
    contrast: "standard",
    reverse: true,
    icon: "layers",
    tagline: "MATERIAL · MOOD · FUNCTION",
    ctaLabel: "Explore Interior Design",
    image: photo("photos/sofa-jali-detail", "MATERIAL · MOOD · FUNCTION"),
    thumbnails: [
      photo("photos/living-room-tv-wall", "LIVING"),
      photo("photos/living-room-garden-doors", "LOUNGE"),
      photo("photos/kitchen-island-teak", "KITCHEN"),
      photo("photos/bedroom-teak-screen", "BEDROOM"),
    ],
  },
  {
    slug: "construction",
    tone: "light",
    contrast: "high",
    reverse: false,
    icon: "shield",
    tagline: "PLAN · BUILD · INSPECT",
    ctaLabel: "Explore Construction",
    image: photo("photos/house-under-construction", "PLAN · BUILD · INSPECT"),
    thumbnails: [
      photo("photos/construction-team-drawings", "SITE 01"),
      photo("photos/site-review-timber-screen", "SITE 02"),
      photo("photos/massing-model", "MODEL"),
      photo("photos/architect-site-drawings", "SURVEY"),
    ],
  },
  {
    slug: "turnkey",
    tone: "dark",
    contrast: "standard",
    reverse: true,
    icon: "key",
    tagline: "BRIEF TO HANDOVER",
    ctaLabel: "Explore Turnkey Projects",
    image: photo("photos/two-storey-house-lawn", "BRIEF TO HANDOVER"),
    thumbnails: [
      photo("photos/courtyard-facade-night", "FACADE"),
      photo("photos/formal-dining-room", "DINING"),
      photo("photos/courtyard-tree-timber-balconies", "COURTYARD"),
      photo("photos/house-reflecting-pool-garden", "RESIDENCE"),
    ],
  },
  {
    slug: "renovation",
    tone: "light",
    contrast: "standard",
    reverse: false,
    icon: "tools",
    tagline: "RETHINK · RESTORE · RENEW",
    ctaLabel: "Explore Renovation",
    image: photo("photos/brick-house-arched-windows-night", "RETHINK · RESTORE · RENEW"),
    thumbnails: [
      photo("photos/kerala-house-pond", "HOME"),
      photo("photos/garden-veranda-chairs", "WELLNESS"),
      photo("photos/commercial-facade-dusk", "ATELIER"),
      photo("photos/timber-house-night", "MONSOON"),
    ],
  },
  {
    slug: "exterior",
    tone: "dark",
    contrast: "high",
    reverse: true,
    icon: "door",
    tagline: "FACADE · GARDEN · OUTDOOR",
    ctaLabel: "Explore Exterior & Landscape",
    image: photo("photos/courtyard-tree-timber-balconies", "FACADE · GARDEN · OUTDOOR"),
    thumbnails: [
      photo("photos/house-rain-garden", "RAIN GARDEN"),
      photo("photos/brick-garden-walkway", "COURTYARD"),
      photo("photos/apartment-living-sea-view", "TERRACE"),
      photo("photos/contemporary-villa-entrance", "VILLA"),
    ],
  },
  {
    slug: "property-care",
    tone: "light",
    contrast: "standard",
    reverse: false,
    icon: "shield",
    tagline: "INSPECT · MAINTAIN · SUPPORT",
    ctaLabel: "Explore Property Care",
    image: photo("photos/homeowners-walkthrough", "INSPECT · MAINTAIN · SUPPORT"),
    thumbnails: [
      photo("photos/teak-stair-handrail", "DETAIL"),
      photo("photos/bathroom-kota-stone", "BATH"),
      photo("photos/timber-screen-atrium", "SCREENS"),
      photo("photos/brick-house-garden-path", "HOME"),
    ],
  },
] as const satisfies readonly ServiceBlockContent[];
