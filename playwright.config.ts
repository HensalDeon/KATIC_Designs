import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env["CI"]);
/** Point the suite at an already running server (e.g. `pnpm dev`) instead of building one. */
const externalBaseURL = process.env["E2E_BASE_URL"];

/**
 * End-to-end tests against a production build (`next start`).
 * Locally the server is built and started on demand; in CI the workflow builds first.
 * Set E2E_BASE_URL=http://localhost:3000 to run against a dev server you already have running.
 * The original-site baseline capture lives in tests/visual and is not part of this suite.
 */
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
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
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
