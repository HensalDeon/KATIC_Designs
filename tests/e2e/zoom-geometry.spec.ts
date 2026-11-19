import { expect, type Page, test } from "@playwright/test";

/**
 * Scroll geometry under the desktop canvas `zoom` (decision D1, docs/analysis/06). Runs in the
 * `desktop` (Chromium), `geometry-webkit` and, in CI, `geometry-firefox` projects.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "desktop canvas only");
});

const VIEWPORTS = [
  { width: 1100, height: 700, zoom: 1100 / 1440 },
  { width: 1440, height: 900, zoom: 1 },
  { width: 1920, height: 1080, zoom: 1920 / 1440 },
] as const;

/** Scrolls so the pinned section is at `fraction` of its scroll travel; returns stage metrics. */
async function scrollPin(page: Page, fraction: number) {
  await page.evaluate((f) => {
    const section = document.querySelector<HTMLElement>("[data-testid=pin-section]");
    if (!section) throw new Error("pin section missing");
    const rect = section.getBoundingClientRect();
    const start = window.scrollY + rect.top;
    // `instant`: the page uses `scroll-behavior: smooth`, which would animate the jump.
    window.scrollTo({
      top: Math.round(start + (rect.height - window.innerHeight) * f),
      behavior: "instant",
    });
  }, fraction);
  // Two frames: the scroll event, then the rAF that writes the progress.
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  return page.getByTestId("pin-stage").evaluate((stage) => ({
    progress: Number(stage.getAttribute("data-progress")),
    top: stage.getBoundingClientRect().top,
    bottom: stage.getBoundingClientRect().bottom,
    viewport: window.innerHeight,
  }));
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.width}×${viewport.height} (zoom ${viewport.zoom.toFixed(3)})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("sticky stage stays pinned and progress runs 0 → 1", async ({ page }) => {
      await page.goto("/styleguide/motion");

      const start = await scrollPin(page, 0);
      expect(start.progress).toBe(0);
      expect(Math.abs(start.top)).toBeLessThanOrEqual(1);

      const middle = await scrollPin(page, 0.5);
      expect(middle.progress).toBeCloseTo(0.5, 1);
      expect(Math.abs(middle.top)).toBeLessThanOrEqual(1);

      const end = await scrollPin(page, 1);
      expect(end.progress).toBeGreaterThanOrEqual(0.995);
      expect(Math.abs(end.bottom - end.viewport)).toBeLessThanOrEqual(1);
    });

    test("one-screen stage is exactly one viewport tall", async ({ page }) => {
      await page.goto("/styleguide/motion");
      const { height, viewport: vh } = await page.getByTestId("pin-stage").evaluate((stage) => ({
        height: stage.getBoundingClientRect().height,
        viewport: window.innerHeight,
      }));
      expect(Math.abs(height - vh)).toBeLessThanOrEqual(1);
    });

    test("fixed header offset scales with the canvas", async ({ page }) => {
      await page.goto("/styleguide/motion");
      const top = await page
        .locator(".zoom-root > header")
        .evaluate((el) => el.getBoundingClientRect().top);
      const expected = viewport.width >= 1100 ? 18 * viewport.zoom : 18;
      expect(Math.abs(top - expected)).toBeLessThanOrEqual(1);
    });

    test("parallax image drifts while scrolling and reveals fire in view", async ({ page }) => {
      await page.goto("/styleguide/motion");
      const image = page.getByTestId("parallax-image");
      await image.scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollBy({ top: -200, behavior: "instant" }));
      await page.waitForTimeout(100);
      const first = await image.evaluate((el) => el.style.transform);
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: "instant" }));
      await page.waitForTimeout(100);
      const second = await image.evaluate((el) => el.style.transform);
      expect(first).toMatch(/^translate3d\(0px, -?[\d.]+%, 0px\) scale\(1\.3\)$/);
      expect(second).not.toBe(first);

      const reveal = page.getByTestId("reveal-clip");
      await reveal.scrollIntoViewIfNeeded();
      await expect(reveal.locator("xpath=..")).toHaveAttribute("data-shown", "");
    });
  });
}
