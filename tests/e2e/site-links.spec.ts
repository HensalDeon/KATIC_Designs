import { expect, test } from "@playwright/test";

/**
 * Site-wide link check: crawls every page reachable from the home page through internal links
 * (header, footer, cards, buttons, in-page CTAs) and asserts that each one answers 200, so no link
 * on the site leads to a 404 (KI-F09 and friends). Hash fragments are ignored; query strings are
 * kept because filters (`?category=`, `?area=`) are real states.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "crawl runs once");
});

test("every internal link on every reachable page resolves", async ({ page }) => {
  test.setTimeout(240_000);
  const queue = ["/"];
  const visited = new Set<string>();
  /** Target → first page that links to it, for a useful failure message. */
  const linkedFrom = new Map<string, string>();

  while (queue.length > 0) {
    const path = queue.shift() ?? "/";
    if (visited.has(path)) continue;
    visited.add(path);

    const response = await page.goto(path);
    expect(response?.status(), `${path} (linked from ${linkedFrom.get(path) ?? "start"})`).toBe(
      200,
    );
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .map((a) => new URL(a.href, location.href))
        .filter((url) => url.origin === location.origin)
        .map((url) => url.pathname + url.search),
    );
    for (const href of hrefs) {
      if (!linkedFrom.has(href)) linkedFrom.set(href, path);
      if (!visited.has(href) && !queue.includes(href)) queue.push(href);
    }
  }

  // Every page family is reachable from the home page.
  const reached = [...visited];
  for (const prefix of [
    "/about",
    "/services/",
    "/works/",
    "/divisions/",
    "/locations/",
    "/blog/",
    "/news",
    "/reviews",
  ]) {
    expect(
      reached.some((path) => path.startsWith(prefix)),
      `nothing under ${prefix}`,
    ).toBe(true);
  }
  expect(visited.size).toBeGreaterThan(30);
});

test("unknown pages answer 404", async ({ request }) => {
  for (const path of ["/nope", "/services/nope", "/works/nope", "/divisions/nope", "/blog/nope"]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});
