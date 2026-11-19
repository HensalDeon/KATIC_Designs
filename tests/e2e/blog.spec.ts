import { expect, type Locator, type Page, test } from "@playwright/test";

import {
  articleSeo,
  BLOG_PAGE,
  blogCategorySeo,
  otherLatestPosts,
  POST_CATEGORIES,
  POSTS,
  postsByDate,
} from "@/content/posts";

/**
 * Blog listing, category pages and articles (`/blog`, `/blog/category/<slug>`, `/blog/<slug>`;
 * original `#p-blog` and `#p-article`, docs/analysis/04 §5–6). Expected values are the ORIGINAL's
 * rendered output (probed at 1440/1024/768/390); deliberate deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const ARTICLE = "/blog/designing-for-kerala-monsoon";
const WHITE = "rgb(255, 255, 255)";
const ORANGE = "rgb(232, 98, 44)";
const SMALL_ORANGE = "rgb(192, 82, 42)";
/** Text-safe orange for small text on white (KI-A11). */
const TEXT_ORANGE = "rgb(194, 78, 30)";

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected) {
  const actual = await locator.evaluate((el, keys) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
  }, Object.keys(expected).map(kebab));
  expect(Object.fromEntries(Object.keys(expected).map((key) => [key, actual[kebab(key)]]))).toEqual(
    expected,
  );
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** Rect relative to `root`'s top-left, in CSS px (zoom is 1 at 1440). */
async function box(locator: Locator, root: Locator) {
  const [el, base] = await Promise.all([locator.boundingBox(), root.boundingBox()]);
  if (!el || !base) throw new Error("not rendered");
  const round = (v: number) => Math.round(v * 10) / 10;
  return { x: round(el.x), y: round(el.y - base.y), w: round(el.width), h: round(el.height) };
}

const list = (page: Page) => page.locator("#blog-list");
const cards = (page: Page) => list(page).locator("ul[aria-labelledby] > li");
const visibleCards = (page: Page) => cards(page).filter({ visible: true });
const articleSection = (page: Page) => page.locator('[data-parity="ks"]');
const aside = (page: Page) => articleSection(page).locator("aside");

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("listing at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page, "/blog");
    await expect(page).toHaveTitle("Architecture & Interior Design Blog | Katic Designs");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Ideas on architecture, interiors, materials, construction and caring for homes in Kerala's climate.",
    );
  });

  test("hero then the white list, as the original; no contact section", async ({ page }) => {
    await open(page, "/blog");
    const sections = await page.locator("main > *").evaluateAll((all) =>
      all.map((el) => ({
        key: el.hasAttribute("data-hero") ? "hero" : el.id,
        tone: el.getAttribute("data-tone"),
        background: getComputedStyle(el).backgroundColor,
        height: Math.round(el.getBoundingClientRect().height),
      })),
    );
    expect(sections).toEqual([
      { key: "hero", tone: "dark", background: "rgb(17, 17, 17)", height: 900 },
      { key: "blog-list", tone: "light", background: WHITE, height: 1315 },
    ]);
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero: kicker, accent title and lead", async ({ page }) => {
    await open(page, "/blog");
    const hero = page.locator("[data-hero]");
    const title = hero.getByRole("heading", { level: 1 });
    await expect(title).toHaveText("Ideas on Building Well");
    await expectStyles(title, { fontSize: "74px", lineHeight: "74px", fontWeight: "700" });
    await expectStyles(title.locator("span"), { color: ORANGE });
    expect(await box(title, hero)).toMatchObject({ x: 86, y: 313, h: 74 });
    expect(await box(hero.getByText("Journal"), hero)).toMatchObject({ y: 280 });
    const lead = hero.getByText(BLOG_PAGE.hero.lead);
    expect(await box(lead, hero)).toMatchObject({ y: 411, w: 640 });
    await expect(hero.locator("img")).not.toHaveAttribute("alt", /Ideas on/);
  });

  test("six newest cards on a 3-column grid, then three more per click", async ({ page }) => {
    await open(page, "/blog");
    const newest = postsByDate();
    await expect(visibleCards(page)).toHaveCount(6);
    expect(
      await visibleCards(page)
        .locator("a")
        .evaluateAll((links) => links.map((a) => a.getAttribute("href"))),
    ).toEqual(newest.slice(0, 6).map((post) => `/blog/${post.slug}`));
    expect(await visibleCards(page).locator("h3").allTextContents()).toEqual(
      newest.slice(0, 6).map((post) => post.title),
    );
    const grid = list(page).locator("ul[aria-labelledby]");
    await expectStyles(grid, {
      gridTemplateColumns: "406.656px 406.672px 406.656px",
      rowGap: "40px",
      columnGap: "24px",
    });
    expect(await box(grid, list(page))).toMatchObject({ x: 86, y: 164, w: 1268 });

    const more = list(page).getByRole("button", { name: BLOG_PAGE.loadMore });
    expect(await box(more, list(page))).toMatchObject({ x: 638, y: 1143.4, w: 164.1, h: 52 });
    // `.ks .btn.ol` as the original renders it.
    await expectStyles(more, {
      paddingLeft: "24px",
      fontSize: "12.5px",
      fontWeight: "600",
      color: "rgb(17, 17, 17)",
      backgroundColor: WHITE,
      borderTopColor: "rgb(207, 203, 195)",
    });
    await more.hover();
    await expect
      .poll(() => more.evaluate((el) => getComputedStyle(el).borderTopColor))
      .toBe("rgb(17, 17, 17)");
    await more.click();
    await expect(visibleCards(page)).toHaveCount(9);
    await expect(more).toHaveCount(0);
    // Focus moves to the first new card.
    await expect(cards(page).nth(6).locator("a")).toBeFocused();
  });

  test("card: photo, meta row, title, excerpt and read-more label", async ({ page }) => {
    await open(page, "/blog");
    const card = cards(page).first().locator("a");
    const [first] = postsByDate();
    if (!first) throw new Error("no posts");
    expect(await box(card, card)).toMatchObject({ w: 406.7, h: 443.7 });
    const image = card.locator("img");
    expect(await box(image, card)).toMatchObject({ y: 0, h: 260 });
    await expect(image).toHaveAttribute("alt", /\w+/);
    await expect(image).not.toHaveAttribute("alt", first.title);
    const category = card.getByText(first.category, { exact: true });
    await expectStyles(category, {
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.44px",
      textTransform: "uppercase",
      color: SMALL_ORANGE,
    });
    expect(await box(category, card)).toMatchObject({ y: 278, h: 11 });
    const date = card.locator("time");
    await expect(date).toHaveText("14 Oct 2026");
    await expectStyles(date, { color: "rgb(136, 136, 136)" });
    const title = card.locator("h3");
    await expectStyles(title, { fontSize: "22px", lineHeight: "28.6px", fontWeight: "400" });
    expect(await box(title, card)).toMatchObject({ y: 301, h: 57.2 });
    const excerpt = card.locator("p");
    await expectStyles(excerpt, {
      fontSize: "13px",
      lineHeight: "22.75px",
      color: "rgb(85, 85, 85)",
    });
    const more = card.getByText("Read Article");
    await expectStyles(more, { fontSize: "11px", fontWeight: "600", letterSpacing: "1.32px" });
    expect(await box(more, card)).toMatchObject({ y: 429.7, h: 14 });

    // Hover: the photo zooms to 1.04, the title turns orange.
    await card.hover();
    await expect.poll(() => title.evaluate((el) => getComputedStyle(el).color)).toBe(ORANGE);
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.04");
  });

  test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("every card shows and the button, which could not work, is hidden", async ({ page }) => {
      await page.goto("/blog");
      await expect(visibleCards(page)).toHaveCount(POSTS.length);
      await expect(list(page).getByRole("button", { name: BLOG_PAGE.loadMore })).toBeHidden();
    });
  });

  test("every card links to a built article", async ({ page, request }) => {
    await open(page, "/blog");
    const hrefs = await cards(page)
      .locator("a")
      .evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(postsByDate().map((post) => `/blog/${post.slug}`));
    for (const href of hrefs) {
      expect((await request.get(href ?? "")).status(), href ?? "").toBe(200);
    }
  });

  test("headings do not jump from the h1 to the card h3s (KI-A14)", async ({ page }) => {
    await open(page, "/blog");
    await expect(list(page).getByRole("heading", { level: 2, name: "Articles" })).toBeAttached();
  });
});

test.describe("category pages", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("one page per category with its posts and visible links (KI-F13)", async ({
    page,
    request,
  }) => {
    for (const category of POST_CATEGORIES) {
      const path = `/blog/category/${category.slug}`;
      expect((await request.get(path)).status(), path).toBe(200);
    }
    const category = POST_CATEGORIES[1];
    await open(page, `/blog/category/${category.slug}`);
    const seo = blogCategorySeo(category);
    await expect(page).toHaveTitle(seo.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      seo.description,
    );
    await expect(visibleCards(page)).toHaveCount(1);
    await expect(visibleCards(page).locator("a")).toHaveAttribute(
      "href",
      "/blog/planning-an-interior-that-lasts",
    );
    await expect(list(page).getByRole("button", { name: BLOG_PAGE.loadMore })).toHaveCount(0);

    const nav = page.getByRole("navigation", { name: BLOG_PAGE.categoriesLabel });
    const current = nav.locator('[aria-current="page"]');
    await expect(current).toHaveText(category.name);
    await expectStyles(current, { backgroundColor: ORANGE, color: "rgb(0, 0, 0)" });
    await expect(nav.getByRole("link")).toHaveCount(POST_CATEGORIES.length + 1);
    await nav.getByRole("link", { name: "All", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(visibleCards(page)).toHaveCount(6);
    await expect(page.getByRole("navigation", { name: BLOG_PAGE.categoriesLabel })).toHaveCount(0);
  });

  test("unknown categories (and `all`) are a real 404", async ({ request }) => {
    expect((await request.get("/blog/category/nope")).status()).toBe(404);
    expect((await request.get("/blog/category/all")).status()).toBe(404);
  });

  test("legacy hash URLs redirect", async ({ page }) => {
    await page.goto("/#blog");
    await expect(page).toHaveURL(/\/blog$/);
    await page.goto("/#blog/blog-list/all");
    await expect(page).toHaveURL(/\/blog$/);
    await page.goto("/#blog/blog-list/materials-finishes");
    await expect(page).toHaveURL(/\/blog\/category\/materials-finishes$/);
    await expect(visibleCards(page)).toHaveCount(1);
    await page.goto("/#article/choosing-natural-stone");
    await expect(page).toHaveURL(/\/blog\/choosing-natural-stone$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Choosing Natural Stone for Kerala Homes",
    );
  });
});

test.describe("articles at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("every article: metadata as the original sets it at runtime, its own body", async ({
    page,
  }) => {
    for (const post of POSTS) {
      await page.goto(`/blog/${post.slug}`);
      const seo = articleSeo(post);
      await expect(page).toHaveTitle(seo.title);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        seo.description,
      );
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(post.title);
      const body = articleSection(page).locator("article > div");
      await expect(body.locator(":scope > h2")).toHaveText(
        post.body.flatMap((block) => (block.type === "h" ? [block.text] : [])),
      );
      await expect(body.locator(":scope > p")).toHaveCount(
        post.body.filter((block) => block.type === "p").length + 1,
      );
      await expect(body.locator("figure")).toHaveCount(
        post.body.filter((block) => block.type === "img").length,
      );
      expect(
        await aside(page)
          .locator("li a")
          .evaluateAll((links) => links.map((a) => a.getAttribute("href"))),
      ).toEqual(otherLatestPosts(post.slug, 4).map((other) => `/blog/${other.slug}`));
    }
  });

  test("unknown slugs are a real 404 (KI-F12)", async ({ request }) => {
    expect((await request.get("/blog/not-a-post")).status()).toBe(404);
  });

  test("cover then the white article section; no reveals", async ({ page }) => {
    await open(page, ARTICLE);
    const blocks = await page.locator("main > *").evaluateAll((all) =>
      all.map((el) => ({
        key: el.getAttribute("data-parity"),
        tone: el.getAttribute("data-tone"),
        height: Math.round(el.getBoundingClientRect().height),
      })),
    );
    expect(blocks).toEqual([
      { key: "kart-cover", tone: null, height: 520 },
      { key: "ks", tone: "light", height: 1658 },
    ]);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
    const cover = page.locator('[data-parity="kart-cover"] img');
    await expect(cover).toHaveAttribute("alt", /\w+/);
    await expect(cover).not.toHaveAttribute(
      "alt",
      "KATIC Developers announces first villa community",
    );
  });

  test("header: breadcrumb, title and byline", async ({ page }) => {
    await open(page, ARTICLE);
    const section = articleSection(page);
    const crumb = section.getByRole("navigation", { name: "Breadcrumb" });
    expect(await box(crumb, section)).toMatchObject({ x: 86, y: 120, h: 14 });
    await expectStyles(crumb, { fontSize: "11px", color: "rgb(136, 136, 136)" });
    await expect(crumb.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    await expect(crumb.getByRole("link", { name: "Architecture" })).toHaveAttribute(
      "href",
      "/blog/category/architecture",
    );
    const title = section.getByRole("heading", { level: 1 });
    await expectStyles(title, {
      fontSize: "52px",
      lineHeight: "56.16px",
      fontWeight: "500",
      textTransform: "uppercase",
      color: "rgb(17, 17, 17)",
    });
    expect(await box(title, section)).toMatchObject({ y: 152, w: 842.8, h: 112.3 });
    const info = section.locator("article > p").first();
    expect(await box(info, section)).toMatchObject({ y: 286.3, h: 42 });
    await expectStyles(info, {
      borderBottomColor: "rgb(227, 223, 215)",
      columnGap: "22px",
      fontSize: "12px",
    });
    await expect(info.locator("b")).toHaveText("KATIC Design Studio");
    await expect(info.locator("time")).toHaveText("14 Oct 2026");
    await expectStyles(info.getByText("Architecture"), {
      fontSize: "10.5px",
      color: SMALL_ORANGE,
      letterSpacing: "1.26px",
    });
  });

  test("body: paragraphs, subheadings, figure, list and the closing link", async ({ page }) => {
    await open(page, ARTICLE);
    const section = articleSection(page);
    const body = section.locator("article > div");
    expect(await box(body.locator("p").first(), section)).toMatchObject({ y: 360.3, h: 62.7 });
    await expectStyles(body.locator("p").first(), {
      fontSize: "16.5px",
      lineHeight: "31.35px",
      color: "rgb(51, 51, 51)",
    });
    const subheading = body.locator("h2").first();
    await expectStyles(subheading, {
      fontSize: "30px",
      lineHeight: "37.5px",
      fontWeight: "500",
      textTransform: "uppercase",
    });
    expect(await box(subheading, section)).toMatchObject({ y: 467, h: 37.5 });
    const figure = body.locator("figure");
    expect(await box(figure, section)).toMatchObject({ y: 646.5, h: 445 });
    await expect(figure.locator("figcaption")).toHaveText(
      "Deep overhangs shading the south garden elevation.",
    );
    await expect(figure.locator("img")).not.toHaveAttribute(
      "alt",
      "Deep overhangs shading the south garden elevation.",
    );
    const list = body.locator("ul");
    expect(await box(list, section)).toMatchObject({ x: 106, y: 1271.7, h: 136.4 });
    await expectStyles(list.locator("li").first(), { fontSize: "16px", lineHeight: "29.6px" });
    const closing = body.getByRole("link", { name: "Talk to the KATIC team" });
    await expect(closing).toHaveAttribute("href", "/#start");
    await expectStyles(closing, { color: TEXT_ORANGE, textDecorationLine: "underline" });
    expect(await box(closing, section)).toMatchObject({ y: 1511.8 });
    await closing.click();
    await expect(page).toHaveURL(/\/#start$/);
  });

  test("aside: latest articles, at rest 110px below the article, then sticky", async ({
    page,
    request,
  }) => {
    await open(page, ARTICLE);
    const section = articleSection(page);
    expect(await box(aside(page), section)).toMatchObject({ x: 992.8, y: 230, w: 361.2, h: 523 });
    await expectStyles(aside(page), { borderTopColor: "rgb(227, 223, 215)", paddingTop: "26px" });
    // h2, not the original's h4 (KI-A14); text-safe orange (KI-A11).
    const heading = aside(page).getByRole("heading", { level: 2, name: "Latest articles" });
    await expectStyles(heading, { fontSize: "10px", letterSpacing: "2px", color: TEXT_ORANGE });
    const rows = aside(page).locator("li a");
    await expect(rows).toHaveCount(4);
    const hrefs = await rows.evaluateAll((links) => links.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(
      otherLatestPosts("designing-for-kerala-monsoon", 4).map((post) => `/blog/${post.slug}`),
    );
    for (const href of hrefs) expect((await request.get(href ?? "")).status()).toBe(200);
    expect(await box(rows.first(), aside(page))).toMatchObject({ y: 39, h: 96 });
    expect(await box(rows.first().locator("img"), rows.first())).toMatchObject({ w: 84, h: 64 });
    await expectStyles(rows.first().locator("span > span"), {
      fontSize: "13.5px",
      lineHeight: "18.9px",
      fontWeight: "500",
    });
    const all = aside(page).getByRole("link", { name: "All Articles" });
    await expect(all).toHaveAttribute("href", "/blog");
    expect(await box(all, aside(page))).toMatchObject({ x: 1019.8, y: 444, w: 307.2, h: 52 });
    // The original's button loses its bottom border to the rows' rule; this one keeps it.
    await expectStyles(all, { borderBottomWidth: "1px", justifyContent: "center" });

    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect
      .poll(() => aside(page).evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBe(110);
  });
});

test.describe("1024", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("listing: two columns", async ({ page }) => {
    await open(page, "/blog");
    await expectStyles(list(page).locator("ul[aria-labelledby]"), {
      gridTemplateColumns: "464px 464px",
    });
    expect(Math.round((await list(page).boundingBox())?.height ?? 0)).toBe(1690);
  });

  test("article: one column, the aside below the article and static", async ({ page }) => {
    await open(page, ARTICLE);
    const section = articleSection(page);
    expect(Math.round((await section.boundingBox())?.height ?? 0)).toBe(2129);
    expect(await box(aside(page), section)).toMatchObject({ x: 36, y: 1526.1, w: 952, h: 523 });
    await expectStyles(aside(page), { position: "static" });
  });
});

test.describe("390", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("listing: one column; small text at least 11px (KI-A10)", async ({ page }) => {
    await open(page, "/blog");
    await expectStyles(list(page).locator("ul[aria-labelledby]"), {
      gridTemplateColumns: "350px",
    });
    await expectStyles(cards(page).first().locator("a > span").nth(1), { fontSize: "11px" });
  });

  test("article: 300px cover and figures, 34px title, 11px small text", async ({ page }) => {
    await open(page, ARTICLE);
    expect(
      Math.round((await page.locator('[data-parity="kart-cover"]').boundingBox())?.height ?? 0),
    ).toBe(300);
    const section = articleSection(page);
    await expectStyles(section.getByRole("heading", { level: 1 }), {
      fontSize: "34px",
      lineHeight: "36.72px",
    });
    expect(Math.round((await section.locator("figure img").boundingBox())?.height ?? 0)).toBe(300);
    // Breadcrumb links get a larger tap area, as the original's phone rule.
    expect((await section.getByRole("link", { name: "Blog" }).boundingBox())?.height).toBe(34);
    await expectStyles(section.locator("article > p").first().locator("span").last(), {
      fontSize: "11px",
    });
    await expectStyles(aside(page).locator("h2"), { fontSize: "11px" });
  });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test.describe(`${String(viewport.width)}px`, () => {
    test.use({ viewport });

    for (const path of ["/blog", "/blog/category/property-care", ARTICLE]) {
      test(`no horizontal overflow on ${path}`, async ({ page }) => {
        await open(page, path);
        const { scroll, client } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(scroll).toBeLessThanOrEqual(client);
      });
    }
  });
}
