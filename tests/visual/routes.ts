/**
 * Route and viewport definitions shared by the original-site baseline capture and (later) the
 * parity test against the Next.js build. `hash` is the route on the original hash-routed site,
 * `path` is its new URL (docs/MIGRATION_PLAN.md §1).
 */

export type ParityRoute = {
  readonly id: string;
  readonly hash: string;
  readonly path: string;
};

export const PARITY_ROUTES = [
  { id: "home", hash: "#home", path: "/" },
  { id: "about", hash: "#about", path: "/about" },
  { id: "services", hash: "#services", path: "/services" },
  { id: "architecture", hash: "#architecture", path: "/services/architecture" },
  { id: "interior", hash: "#interior", path: "/services/interior" },
  { id: "factory", hash: "#factory", path: "/services/factory" },
  { id: "construction", hash: "#construction", path: "/services/construction" },
  { id: "turnkey", hash: "#turnkey", path: "/services/turnkey" },
  { id: "renovation", hash: "#renovation", path: "/services/renovation" },
  { id: "exterior", hash: "#exterior", path: "/services/exterior" },
  { id: "property-care", hash: "#property-care", path: "/services/property-care" },
  { id: "works", hash: "#works", path: "/works" },
  { id: "project", hash: "#project", path: "/works/the-courtyard-house" },
  { id: "div-design", hash: "#div-design", path: "/divisions/design" },
  { id: "div-interior", hash: "#div-interior", path: "/divisions/interior" },
  { id: "div-infrastructure", hash: "#div-infrastructure", path: "/divisions/infrastructure" },
  { id: "div-developers", hash: "#div-developers", path: "/divisions/developers" },
  { id: "div-care", hash: "#div-care", path: "/divisions/care" },
  { id: "news", hash: "#news", path: "/news" },
  { id: "blog", hash: "#blog", path: "/blog" },
  {
    id: "article",
    hash: "#article/designing-for-kerala-monsoon",
    path: "/blog/designing-for-kerala-monsoon",
  },
  { id: "india", hash: "#india", path: "/locations/india" },
  { id: "dubai", hash: "#dubai", path: "/locations/dubai" },
  { id: "reviews", hash: "#reviews", path: "/reviews" },
  { id: "thank-you", hash: "#thank-you", path: "/thank-you" },
] as const satisfies readonly ParityRoute[];

export type ParityRouteId = (typeof PARITY_ROUTES)[number]["id"];

export type ParityViewport = {
  readonly width: number;
  readonly height: number;
  /** Emulates a touch device (mobile UA, touch events, `isMobile`). */
  readonly touch: boolean;
};

/** The four widths every page must match (MIGRATION_PLAN §7). */
export const PARITY_VIEWPORTS = {
  desktop: { width: 1440, height: 900, touch: false },
  laptop: { width: 1024, height: 768, touch: false },
  tablet: { width: 768, height: 1024, touch: true },
  mobile: { width: 390, height: 844, touch: true },
} as const satisfies Record<string, ParityViewport>;

export type ParityViewportId = keyof typeof PARITY_VIEWPORTS;

/**
 * Sections whose original reduced-motion rendering is broken (KI-L02, KI-L04). Their baseline is
 * captured with motion ON at fixed scroll-progress points instead.
 */
export const SCROLL_SCRUB_SECTIONS = [
  { routeId: "home", selector: "#home-works", name: "selected-works" },
  { routeId: "home", selector: "#home-process", name: "seven-stages" },
] as const;

export const SCRUB_PROGRESS_POINTS = [0, 0.25, 0.5, 0.75, 1] as const;
