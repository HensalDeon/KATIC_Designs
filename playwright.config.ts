import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env["CI"]);
/** Point the suite at an already running server (e.g. `pnpm dev`) instead of building one. */
const externalBaseURL = process.env["E2E_BASE_URL"];
// The server this config starts signs nothing itself; give it a webhook secret so the
// /api/revalidate spec can sign requests. An external server must be started with the same
// REVALIDATE_SECRET in the environment of both (tests/e2e/revalidate.spec.ts skips otherwise).
if (!externalBaseURL) process.env["REVALIDATE_SECRET"] ??= "e2e-revalidate-secret-0123456789";

/**
 * End-to-end tests against a production build (`next start`).
 * Locally the server is built and started on demand; in CI the workflow builds first.
 * Set E2E_BASE_URL=http://localhost:3000 to run against a dev server you already have running.
 * The original-site baseline capture lives in tests/visual and is not part of this suite.
 */
/** The accessibility suites (`tests/e2e/a11y*.spec.ts`). */
const A11Y_SPECS = /a11y[^/]*\.spec\.ts/;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: externalBaseURL ?? `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      testIgnore: A11Y_SPECS,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", testIgnore: A11Y_SPECS, use: { ...devices["Pixel 7"] } },
    // axe on every page and state, keyboard paths, reduced motion (Phase 10): the slowest suites,
    // kept in their own project so day-to-day runs stay fast. CI runs every project.
    {
      name: "a11y",
      testMatch: A11Y_SPECS,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    // Scroll geometry under the desktop canvas zoom in the other engines (docs/analysis/06).
    {
      name: "geometry-webkit",
      testMatch: /(zoom-geometry|home-pinned)\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },
    // Playwright's Firefox does not launch on recent macOS; CI (Linux) covers it.
    ...(isCI
      ? [
          {
            name: "geometry-firefox",
            testMatch: /(zoom-geometry|home-pinned)\.spec\.ts/,
            use: { ...devices["Desktop Firefox"] },
          },
        ]
      : []),
  ],
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          command: isCI ? `pnpm start --port ${PORT}` : `pnpm build && pnpm start --port ${PORT}`,
          url: `http://127.0.0.1:${PORT}`,
          reuseExistingServer: !isCI,
          timeout: 180_000,
        },
      }),
});
