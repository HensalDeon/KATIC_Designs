import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

/**
 * Automated accessibility audit (Phase 10): axe-core with the WCAG 2.1 A/AA rules (and 2.2 target size) on every page
 * reachable from the home page (the crawl from site-links.spec.ts) at 1440 and 390, plus the
 * interactive states a static scan never sees: menus, dialogs, lightbox, accordions, filters,
 * load-more and form errors. Zero violations is the bar.
 *
 * Scans run under reduced motion, the parity mode: the Home reveal transitions otherwise leave text
 * at partial opacity mid-scan, which axe reports as low contrast. A motion-on pass of Home, after
 * every reveal has played, covers the other mode.
 *
 * Exclusions: none. A rule may only be disabled for a specific element, with the reason written
 * next to it.
 */

/** WCAG 2.1 A/AA, plus 2.2 AA for the 24px target-size minimum (2.5.8, KI-A12). */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const WIDTHS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
] as const;

/** Pages not linked from anywhere: reached only after an action (the enquiry thank-you). */
const UNLINKED = ["/thank-you"];

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "widths are set per test");
});

test.use({ reducedMotion: "reduce" });

/** Every same-origin path (with query: filters are real states) reachable from `/`. */
async function crawl(page: Page): Promise<string[]> {
  const queue = ["/"];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const path = queue.shift() ?? "/";
    if (visited.has(path)) continue;
    visited.add(path);
    await page.goto(path);
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .map((a) => new URL(a.href, location.href))
        .filter((url) => url.origin === location.origin)
        .map((url) => url.pathname + url.search),
    );
    for (const href of hrefs) if (!visited.has(href) && !queue.includes(href)) queue.push(href);
  }
  return [...visited, ...UNLINKED];
}

/** Runs axe and returns readable lines, one per failing node, so a failure names the culprit. */
async function audit(page: Page, label: string): Promise<string[]> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return violations.flatMap((violation) =>
    violation.nodes.map(
      (node) =>
        `${label} · ${violation.id} · ${node.target.join(" ")} · ${node.html.slice(0, 120)}`,
    ),
  );
}

async function settle(page: Page) {
  // Let client components hydrate and layout settle (fonts, measured carousels).
  await page.waitForLoadState("load");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
}

/** A visible control among several copies (header, footer, phone CTA bar). */
const visibleButton = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name }).filter({ visible: true }).first();

for (const viewport of WIDTHS) {
  test.describe(`axe at ${viewport.width}`, () => {
    test.use({ viewport });

    test("every reachable page has no WCAG 2.1 AA violations", async ({ page }) => {
      test.setTimeout(420_000);
      const routes = await crawl(page);
      expect(routes.length).toBeGreaterThan(30);
      const failures: string[] = [];
      for (const route of routes) {
        await page.goto(route);
        await settle(page);
        failures.push(...(await audit(page, route)));
      }
      expect(failures).toEqual([]);
    });

    test("the Start-a-Project popup, open and with errors", async ({ page }) => {
      await page.goto("/");
      await settle(page);
      if (viewport.width < 861) await page.evaluate(() => window.scrollTo(0, 1200));
      await visibleButton(page, "Start a Project").click();
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      await page.waitForTimeout(400);
      expect(await audit(page, "popup")).toEqual([]);
      await dialog.locator("button[type=submit]").click();
      await expect(dialog.locator("[aria-invalid=true]").first()).toBeVisible();
      expect(await audit(page, "popup errors")).toEqual([]);
    });

    test("the lightbox, open on a gallery", async ({ page }) => {
      await page.goto("/works/the-courtyard-house");
      await settle(page);
      await page
        .getByRole("button", { name: /^Enlarge image/ })
        .first()
        .click();
      await expect(page.locator("dialog[open]")).toBeVisible();
      await page.waitForTimeout(400);
      expect(await audit(page, "lightbox")).toEqual([]);
    });

    test("an FAQ item opened and an inline form with errors", async ({ page }) => {
      await page.goto("/services/architecture");
      await settle(page);
      const questions = page.locator("button[aria-controls][aria-expanded]").filter({
        has: page.locator("i[aria-hidden]"),
      });
      await questions.nth(1).click();
      await expect(questions.nth(1)).toHaveAttribute("aria-expanded", "true");
      await page.waitForTimeout(400);
      expect(await audit(page, "faq open")).toEqual([]);
      await page.locator("main form button[type=submit]").first().click();
      await expect(page.locator("main [aria-invalid=true]").first()).toBeVisible();
      expect(await audit(page, "inline form errors")).toEqual([]);
    });

    test("filters applied (works, india) and blog load-more", async ({ page }) => {
      await page.goto("/works");
      await settle(page);
      const works = page.locator("main [role=group][aria-label] button[aria-pressed]");
      await works.last().click();
      await expect(page).toHaveURL(/category=/);
      await page.waitForTimeout(500);
      const failures = await audit(page, "works filtered");

      await page.goto("/locations/india");
      await settle(page);
      const india = page.locator("#india-projects").getByRole("group").getByRole("button");
      await india.nth(1).click();
      await expect(india.nth(1)).toHaveAttribute("aria-pressed", "true");
      await page.waitForTimeout(500);
      failures.push(...(await audit(page, "india filtered")));

      await page.goto("/blog");
      await settle(page);
      const more = page.getByRole("button", { name: /Load More/i });
      const hidden = page.locator("main li[data-paged=hidden]");
      const before = await hidden.count();
      await more.click();
      await expect.poll(() => hidden.count()).toBeLessThan(before);
      failures.push(...(await audit(page, "blog load-more")));
      expect(failures).toEqual([]);
    });
  });
}

test.describe("axe at 1440, menus", () => {
  test.use({ viewport: WIDTHS[0] });

  test("a desktop dropdown open", async ({ page }) => {
    await page.goto("/about");
    await settle(page);
    await page.locator("header").getByRole("link", { name: "Services", exact: true }).focus();
    await expect(
      page.locator("header").getByRole("link", { name: "Architectural Design" }),
    ).toBeVisible();
    expect(await audit(page, "dropdown")).toEqual([]);
  });
});

test.describe("axe at 390, menus", () => {
  test.use({ viewport: WIDTHS[1] });

  test("the phone menu open with a submenu expanded", async ({ page }) => {
    await page.goto("/about");
    await settle(page);
    await page.getByRole("button", { name: "Menu" }).click();
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    expect(await audit(page, "phone menu")).toEqual([]);
    await nav.getByRole("link", { name: "Services", exact: true }).click();
    await expect(nav.getByRole("link", { name: "Architectural Design" })).toBeVisible();
    expect(await audit(page, "phone submenu")).toEqual([]);
  });
});

test.describe("axe with motion", () => {
  test.use({ viewport: WIDTHS[0], reducedMotion: "no-preference" });

  test("Home after every reveal has played", async ({ page }) => {
    await page.goto("/");
    await settle(page);
    // Scroll through the page so each reveal fires, then wait for the 1s transitions.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(1600);
    expect(await audit(page, "home motion")).toEqual([]);
  });
});
