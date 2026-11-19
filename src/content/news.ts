import type { MediaId } from "./media";

/**
 * Studio news (`.knw` cards on the home page and `/news`, docs/analysis/04 §4), copy verbatim.
 * The original has no news detail pages: every card links to the news page itself (KI-F11).
 * Laravel serves this list in Phase 11.
 */
export const NEWS_CATEGORIES = [
  "Studio",
  "Project",
  "Manufacturing",
  "Services",
  "Partners",
  "Developers",
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export type NewsItem = {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: NewsCategory;
  /** ISO date `YYYY-MM-DD`. */
  readonly date: string;
  readonly image: MediaId;
  /** Shown as the large lead card on `/news` (`.knw.big`). */
  readonly featured?: boolean;
};

/** Newest first, as on the original news page. */
export const NEWS: readonly NewsItem[] = [
  {
    slug: "dubai-design-studio",
    title: "KATIC opens its Dubai design studio",
    excerpt:
      "A dedicated team in Dubai now supports clients across the UAE, backed by our design and build teams in Kerala.",
    category: "Studio",
    date: "2026-10-28",
    image: "photos/brick-courtyard-house-dusk",
    featured: true,
  },
  {
    slug: "courtyard-house-kochi-handed-over",
    title: "Courtyard House, Kochi handed over",
    excerpt:
      "A three-generation family home organised around a planted courtyard is complete and occupied.",
    category: "Project",
    date: "2026-10-14",
    image: "photos/modern-house-rain-dusk",
  },
  {
    slug: "joinery-workshop-expands",
    title: "In-house joinery workshop expands",
    excerpt:
      "More floor space and new CNC equipment shorten lead times for kitchens, wardrobes and custom furniture.",
    category: "Manufacturing",
    date: "2026-09-30",
    image: "photos/city-view-living-room",
  },
  {
    slug: "katic-care-maintenance-plans",
    title: "KATIC Care launches annual maintenance plans",
    excerpt:
      "Scheduled inspections, repairs and seasonal upkeep for homes and commercial buildings we have built.",
    category: "Services",
    date: "2026-09-12",
    image: "photos/lakeside-house-dusk",
  },
  {
    slug: "material-partnerships-2026-27",
    title: "New material partnerships for 2026–27",
    excerpt:
      "Working with leading finish and hardware suppliers to bring tested, consistent materials to every project.",
    category: "Partners",
    date: "2026-08-22",
    image: "photos/house-under-construction",
  },
  {
    slug: "first-villa-community",
    title: "KATIC Developers announces first villa community",
    excerpt:
      "A design-led residential development in Kerala, planned and delivered by the same teams that design our homes.",
    category: "Developers",
    date: "2026-08-05",
    image: "photos/villa-pool-city-skyline",
  },
];

/** The `count` newest items. */
export function latestNews(count: number): NewsItem[] {
  return [...NEWS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, count);
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Display date as the original's markup writes it: two-digit day and a three-letter month
 * ("05 Aug 2026", "30 Sep 2026"). Unlike blog dates these were typed by hand, so "Sept" is
 * normalised to "Sep".
 */
export function formatNewsDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`)).replace("Sept", "Sep");
}

/** Copy of the home page's news teaser (`#home-news`). */
export const HOME_NEWS_TEASER = {
  kicker: "In the news",
  title: ["Latest from", "KATIC"],
  lead: "Studio updates, completed projects and announcements from across our divisions.",
  cta: "View All News",
  readMore: "Read more",
} as const;
