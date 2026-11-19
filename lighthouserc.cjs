// Lighthouse CI: lab performance on a representative set of routes (Phase 10).
//
//   pnpm build && pnpm perf             # starts `next start` on PERF_PORT (default 3590)
//   PERF_BASE_URL=http://127.0.0.1:3591 pnpm perf   # measure a server that is already running
//
// `pnpm perf` runs this file twice, once per preset (PERF_PRESET=mobile | desktop). Reports go to
// .tmp/lhci/<preset>/ (git-ignored); nothing is uploaded. Budgets are set from measured medians
// with headroom for run-to-run noise (see BUDGETS).

const preset = process.env.PERF_PRESET === "desktop" ? "desktop" : "mobile";
const port = process.env.PERF_PORT ?? "3590";
const baseUrl = (process.env.PERF_BASE_URL ?? `http://127.0.0.1:${port}`).replace(/\/$/, "");

const ROUTES = [
  "/",
  "/about",
  "/services",
  "/services/architecture",
  "/works",
  "/works/the-courtyard-house",
  "/divisions/design",
  "/locations/dubai",
  "/blog",
  "/blog/designing-for-kerala-monsoon",
  "/reviews",
];

/**
 * Budgets, from the medians measured in Phase 10 (lighthouse 13.6, simulated throttling) with
 * headroom for run-to-run noise. Mobile is Lighthouse's default (Moto G Power, slow 4G, 4x CPU);
 * desktop is its desktop preset. Bytes are transfer sizes. CLS measured 0 everywhere.
 *
 * - Home plays a ~2.6 MB hero video (fetched after the load event) and is LCP-bound by its
 *   staggered hero intro, so it gets its own byte and LCP budgets.
 * - The article's LCP is its cover photo (measured ~3.6 s mobile): budgeted as measured until
 *   that is improved.
 */
const BUDGETS = {
  mobile: {
    default: { lcp: 2000, cls: 0.01, tbt: 400, totalBytes: 800_000, imageBytes: 400_000 },
    home: { lcp: 5000, cls: 0.01, tbt: 600, totalBytes: 3_600_000, imageBytes: 450_000 },
    article: { lcp: 4500 },
  },
  desktop: {
    default: { lcp: 800, cls: 0.01, tbt: 100, totalBytes: 1_000_000, imageBytes: 450_000 },
    home: { lcp: 1500, cls: 0.01, tbt: 200, totalBytes: 4_200_000, imageBytes: 1_000_000 },
    article: { lcp: 1200 },
  },
}[preset];

/** @param {{ lcp: number, cls: number, tbt: number, totalBytes: number, imageBytes: number }} b */
function assertions(b) {
  return {
    "largest-contentful-paint": ["error", { maxNumericValue: b.lcp }],
    "cumulative-layout-shift": ["error", { maxNumericValue: b.cls }],
    "total-blocking-time": ["error", { maxNumericValue: b.tbt }],
    "total-byte-weight": ["error", { maxNumericValue: b.totalBytes }],
    "resource-summary:image:size": ["error", { maxNumericValue: b.imageBytes }],
  };
}

const HOME = "^https?://[^/]+/$";
const ARTICLE = "/blog/[^/]+$";

/** @type {import("@lhci/types").LHCI.Config} */
module.exports = {
  ci: {
    collect: {
      url: ROUTES.map((route) => `${baseUrl}${route}`),
      numberOfRuns: 3,
      ...(process.env.PERF_BASE_URL
        ? {}
        : {
            startServerCommand: `pnpm start --port ${port}`,
            startServerReadyPattern: "Ready",
          }),
      settings: {
        ...(preset === "desktop" ? { preset: "desktop" } : {}),
        onlyCategories: ["performance"],
        // Headless Chrome on CI runners has no GPU or sandbox.
        chromeFlags: "--headless=new --no-sandbox",
      },
    },
    assert: {
      // Asserted on the median run of each URL; each URL matches exactly one entry.
      assertMatrix: [
        {
          matchingUrlPattern: HOME,
          aggregationMethod: "median-run",
          assertions: assertions(BUDGETS.home),
        },
        {
          matchingUrlPattern: ARTICLE,
          aggregationMethod: "median-run",
          assertions: assertions({ ...BUDGETS.default, ...BUDGETS.article }),
        },
        {
          // Every other route (negative lookahead: not Home, not an article).
          matchingUrlPattern: "^https?://[^/]+/(?!blog/[^/]+$).+",
          aggregationMethod: "median-run",
          assertions: assertions(BUDGETS.default),
        },
      ],
    },
    upload: {
      target: "filesystem",
      outputDir: `.tmp/lhci/${preset}`,
    },
  },
};
