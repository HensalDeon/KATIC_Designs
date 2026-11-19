import { expect, test } from "@playwright/test";

/**
 * Home reveal-on-scroll inventory. The counts per section and variant were measured on the
 * original (`data-rv` set by its `RV` list, analysis/01 E16), so a missing or extra animation fails
 * here instead of being noticed by eye.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "motion inventory runs once");
});

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

const EXPECTED: Record<string, Record<string, number>> = {
  "home-about": { "fade-up": 12, clip: 1, left: 5 },
  "home-signature": { "fade-up": 3, clip: 1 },
  "home-deliver": {},
  "home-works": { "fade-up": 4, clip: 1 },
  "home-process": {},
  "home-divisions": {},
  "home-news": {},
  "home-stories": { "fade-up": 3, clip: 1 },
  "home-blog": {},
  start: { "fade-up": 9, clip: 2 },
};

test("every section reveals the same elements as the original", async ({ page }) => {
  await page.goto("/");
  for (const [id, expected] of Object.entries(EXPECTED)) {
    const counts = await page.locator(`#${id}`).evaluate((section) => {
      const tally: Record<string, number> = {};
      for (const el of section.querySelectorAll("[data-reveal]")) {
        const variant = el.getAttribute("data-reveal") ?? "";
        tally[variant] = (tally[variant] ?? 0) + 1;
      }
      return tally;
    });
    expect(counts, `reveals in #${id}`).toEqual(expected);
  }
});

test("the hero intro animates its four lines", async ({ page }) => {
  await page.goto("/");
  const animated = await page
    .locator("[data-hero]")
    .evaluate(
      (hero) =>
        [...hero.querySelectorAll("*")].filter(
          (el) => getComputedStyle(el).animationName !== "none",
        ).length,
    );
  expect(animated).toBeGreaterThanOrEqual(4);
});

test("stories and contact start hidden and reveal when scrolled into view", async ({ page }) => {
  await page.goto("/");
  for (const id of ["home-stories", "start"]) {
    const reveals = page.locator(`#${id} [data-reveal]`);
    await expect(reveals.first()).not.toHaveAttribute("data-shown");
    await expect(reveals.first()).toHaveCSS("opacity", "0");

    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await expect(reveals.first()).toHaveAttribute("data-shown", "");
    await expect(reveals.first()).toHaveCSS("opacity", "1");
  }
});

test("contact fields stagger like the original (.form .f, 0.09s steps)", async ({ page }) => {
  await page.goto("/");
  const delays = await page
    .locator("#start form [data-reveal]")
    .evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).style.getPropertyValue("--reveal-delay")),
    );
  expect(delays).toEqual(["0s", "0.09s", "0.18s", "0.27s", "0.36s", "0s"]);
});
