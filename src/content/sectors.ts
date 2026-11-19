import type { WorksCategory } from "@/lib/routes";

import type { MediaId } from "./media";

/**
 * Sector tiles (`.ksec`). The four sector tiles are identical on every page that shows them
 * (architecture, turnkey, renovation, exterior, property care, works, the care division): same
 * image, copy and works filter. Exterior adds a fifth, non-link tile (docs/analysis/03 §1.7).
 */
export type SectorTile = {
  /** Small orange label above the title (`.lb small`). */
  readonly label: string;
  readonly title: string;
  readonly text: string;
  readonly image: MediaId;
  readonly alt: string;
  /** Works filter the tile links to. Tiles without one are not links. */
  readonly category?: WorksCategory;
};

export const SECTOR_KEYS = ["residential", "commercial", "institutional", "hospitality"] as const;
export type SectorKey = (typeof SECTOR_KEYS)[number];

export const SECTORS = {
  residential: {
    label: "SECTOR",
    title: "Residential",
    text: "Homes, villas and apartments shaped around daily life.",
    image: "photos/canal-house-sunset",
    alt: "Residential",
    category: "residential",
  },
  commercial: {
    label: "SECTOR",
    title: "Commercial",
    text: "Workplaces, retail and mixed-use spaces built for business.",
    image: "photos/commercial-facade-dusk",
    alt: "Commercial",
    category: "commercial",
  },
  institutional: {
    label: "SECTOR",
    title: "Institutional",
    text: "Schools, healthcare and civic buildings for communities.",
    image: "photos/hillside-house-greenery",
    alt: "Institutional",
    category: "institutional",
  },
  hospitality: {
    label: "SECTOR",
    title: "Hospitality",
    text: "Hotels, wellness and leisure spaces made to welcome.",
    image: "photos/garden-veranda-chairs",
    alt: "Hospitality",
    category: "hospitality",
  },
} as const satisfies Record<SectorKey, SectorTile>;

/** The four sector tiles in their original order. */
export const SECTOR_TILES: readonly SectorTile[] = SECTOR_KEYS.map((key) => SECTORS[key]);

/** Exterior & Landscape's extra, non-link tile (`.ksec div.t`). */
export const OUTDOOR_ENVIRONMENTS_TILE = {
  label: "ENVIRONMENT",
  title: "Outdoor environments",
  text: "Parks, campuses and public landscapes.",
  image: "photos/house-rain-garden",
  alt: "Outdoor environments",
} as const satisfies SectorTile;
