import type { SectorTile } from "@/lib/schemas/entities";

/**
 * Sector tiles (`.ksec`). The four sector tiles are identical on every page that shows them
 * (architecture, turnkey, renovation, exterior, property care, works, the care division): same
 * image, copy and works filter. Exterior adds a fifth, non-link tile (docs/analysis/03 §1.7).
 */
export type { SectorTile };

export const SECTOR_KEYS = ["residential", "commercial", "institutional", "hospitality"] as const;
export type SectorKey = (typeof SECTOR_KEYS)[number];

export const SECTORS = {
  residential: {
    label: "SECTOR",
    title: "Residential",
    text: "Homes, villas and apartments shaped around daily life.",
    image: "photos/canal-house-sunset",
    alt: "House beside a canal at sunset",
    category: "residential",
  },
  commercial: {
    label: "SECTOR",
    title: "Commercial",
    text: "Workplaces, retail and mixed-use spaces built for business.",
    image: "photos/commercial-facade-dusk",
    alt: "Industrial-style commercial building lit at dusk",
    category: "commercial",
  },
  institutional: {
    label: "SECTOR",
    title: "Institutional",
    text: "Schools, healthcare and civic buildings for communities.",
    image: "photos/hillside-house-greenery",
    alt: "House set into a green hillside",
    category: "institutional",
  },
  hospitality: {
    label: "SECTOR",
    title: "Hospitality",
    text: "Hotels, wellness and leisure spaces made to welcome.",
    image: "photos/garden-veranda-chairs",
    alt: "Garden veranda with cane chairs",
    category: "hospitality",
  },
} as const satisfies Record<SectorKey, SectorTile>;

/** Exterior & Landscape's extra, non-link tile (`.ksec div.t`). */
export const OUTDOOR_ENVIRONMENTS_TILE = {
  label: "ENVIRONMENT",
  title: "Outdoor environments",
  text: "Parks, campuses and public landscapes.",
  image: "photos/house-rain-garden",
  alt: "Two-storey house with a rain garden and textured walls",
} as const satisfies SectorTile;
