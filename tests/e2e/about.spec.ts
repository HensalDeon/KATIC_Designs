import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * About page (`/about`, original `#p-about`). Values are the ORIGINAL's rendered output, measured
 * with a probe of `#p-about` at 1440 / 1024 / 768 / 390 (the fit() auto-zoom removed, D4), written
 * as the browser reports them. Deliberate deviations are marked with their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected) {
  const keys = Object.keys(expected);
  const actual = await locator.evaluate((el, props) => {
    const style = getComputedStyle(el);
    return props.map((prop) => style.getPropertyValue(prop));
  }, keys.map(kebab));
  expect(Object.fromEntries(keys.map((key, i) => [key, actual[i]]))).toEqual(expected);
}

const JOST = /^(__Jost|Jost)/;
const INTER = /^(__Inter|Inter)/;

async function expectFont(locator: Locator, family: RegExp) {
  expect(await locator.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(family);
}

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("element not rendered");
  return rect;
}

async function open(page: Page) {
  await page.goto("/about");
  await page.evaluate(() => document.fonts.ready);
}

/** Section roots in page order (`main > section`). */
const SECTIONS = [
  { selector: "[data-hero]", tone: "dark" },
  { selector: "[data-parity=i1]", tone: "light" },
  { selector: "#about-philosophy", tone: "dark" },
  { selector: "#about-services", tone: "light" },
  { selector: "#about-divisions", tone: "dark" },
  { selector: "#about-founder", tone: "light" },
  { selector: "[data-parity=ex]", tone: "dark" },
  { selector: "[data-parity=ld]", tone: "light" },
  { selector: "[data-parity=sw]", tone: "dark" },
  { selector: "#about-contact", tone: "light" },
] as const;

const section = (page: Page, index: number) => page.locator(SECTIONS[index]?.selector ?? "");

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle(
      "About Katic Designs | Architecture & Interior Design Studio, Kochi",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Founded in 2013 in Kochi, Katic Designs brings architects, interior designers and site teams together to design and build eco-conscious homes and buildings.",
    );
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("sections keep the original order, ids and tones", async ({ page }) => {
    await open(page);
    const roots = page.locator("main > section");
    await expect(roots).toHaveCount(SECTIONS.length);
    for (const [index, { selector, tone }] of SECTIONS.entries()) {
      const root = roots.nth(index);
      expect(await root.evaluate((el, s) => el.matches(s), selector), selector).toBe(true);
      await expect(root).toHaveAttribute("data-tone", tone);
    }
    // The approach block keeps its own id inside the philosophy section (hero deep link).
    await expect(page.locator("#about-philosophy #about-approach")).toHaveCount(1);
    await expect(page.locator("a[href='/about#about-approach']").first()).toBeVisible();
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
  });

  test("no reveal-on-scroll on About (home-only in the original, D7)", async ({ page }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero", async ({ page }) => {
    await open(page);
    const hero = section(page, 0);
    await expectStyles(hero, { height: "900px", paddingTop: "90px", overflow: "hidden" });
    await expectStyles(hero.locator(":scope > div").nth(1), {
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.45) 50%, rgba(0, 0, 0, 0.35))",
    });
    const kicker = hero.locator("p").first();
    await expectFont(kicker, JOST);
    await expectStyles(kicker, { fontSize: "12.5px", color: "rgb(238, 238, 238)", height: "18px" });
    expect((await box(kicker)).y).toBe(258);
    const title = hero.locator("h1");
    await expectFont(title, JOST);
    await expectStyles(title, {
      fontSize: "76px",
      fontWeight: "700",
      lineHeight: "74.48px",
      marginTop: "22px",
    });
    expect((await box(title)).height).toBeCloseTo(223.4, 0);
    const lead = hero.locator("h1 + p");
    await expectStyles(lead, { fontSize: "16px", lineHeight: "28px", maxWidth: "640px" });
    const [primary, secondary] = [hero.locator("a").nth(0), hero.locator("a").nth(1)];
    await expectFont(primary, INTER);
    await expectStyles(primary, {
      height: "50px",
      paddingLeft: "24px",
      fontSize: "13px",
      fontWeight: "500",
      backgroundColor: "rgb(247, 244, 239)",
    });
    expect((await box(primary)).width).toBeCloseTo(216.2, 0);
    expect((await box(secondary)).x).toBeCloseTo(322.2, 0);
    await expect(primary).toHaveAttribute("href", "/about#about-approach");
    await expect(secondary).toHaveAttribute("href", "/works#works-list");
  });

  test("hero corner labels read bottom-to-top, not upside down (KI-L15)", async ({ page }) => {
    await open(page);
    const labels = page.locator("[data-vertical-label]");
    await expect(labels).toHaveCount(2);
    for (const label of await labels.all()) {
      await expect(label).toHaveAttribute("aria-hidden", "true");
      await expectStyles(label, { writingMode: "vertical-rl", rotate: "180deg", bottom: "22px" });
      const rect = await box(label);
      expect(rect.height).toBeGreaterThan(rect.width);
    }
    expect((await box(labels.nth(0))).x).toBe(36);
  });

  test("who we are grows instead of being zoomed (KI-L13)", async ({ page }) => {
    await open(page);
    const intro = section(page, 1);
    const introBox = await box(intro);
    expect(introBox.height).toBeCloseTo(983.2, 0);
    const title = intro.locator("h2");
    await expectStyles(title, { fontSize: "58px", lineHeight: "64.96px", zoom: "1" });
    expect((await box(title)).x).toBe(86);
    const lead = intro.locator("h2").locator("xpath=../following-sibling::div/p[1]");
    await expectFont(lead, INTER);
    await expectStyles(lead, {
      fontSize: "19.5px",
      lineHeight: "30.225px",
      color: "rgb(17, 17, 17)",
    });
    expect((await box(lead)).x).toBe(732);
    const mosaic = intro.locator(".grid").nth(1);
    await expectStyles(mosaic, { gridTemplateColumns: "340px 641px 238px", marginTop: "62px" });
    expect((await box(mosaic.locator("img").nth(1))).height).toBe(391);
  });

  test("the croton keeps its aspect ratio (KI-L08)", async ({ page }) => {
    await open(page);
    const plant = section(page, 1).locator("img[aria-hidden]");
    const rect = await box(plant);
    expect(rect.width).toBe(200);
    expect(rect.height / rect.width).toBeCloseTo(302 / 295, 2);
    await expectStyles(plant, { right: "40px", bottom: "-4px" });
  });

  test("philosophy + approach (two-column approach header, KI-L14)", async ({ page }) => {
    await open(page);
    const philosophy = section(page, 2);
    await expectStyles(philosophy, { paddingTop: "120px", backgroundColor: "rgb(0, 0, 0)" });
    const frame = philosophy.locator("img").first().locator("..");
    const frameBox = await box(frame);
    expect([frameBox.x, frameBox.width, frameBox.height]).toEqual([86, 760, 450]);
    const tags = philosophy.locator("ul").first().locator("li");
    await expect(tags).toHaveCount(5);
    await expectStyles(tags.first(), { height: "32px", fontSize: "9.5px" });

    const approach = page.locator("#about-approach");
    await expectStyles(approach, { paddingTop: "120px", paddingBottom: "120px" });
    const header = approach.locator(":scope > div > div").first();
    await expectStyles(header, { gridTemplateColumns: "646px 622px", alignItems: "flow-end" });
    const steps = approach.locator("[data-step]");
    await expect(steps).toHaveCount(5);
    expect((await box(steps.nth(1))).x).toBeCloseTo(345.2, 0);
    // Philosophy block 734px + approach (120 + 163 header + 60 + 323 steps + 120).
    expect((await box(philosophy)).height).toBeCloseTo(1520, -1);
  });

  test("services and divisions card grids", async ({ page }) => {
    await open(page);
    const services = page.locator("#about-services");
    expect((await box(services)).height).toBeCloseTo(1414.1, 0);
    await expect(services.locator("li")).toHaveCount(7);
    await expect(services.locator("a[href='/services']")).toBeVisible();
    expect((await box(services.locator("li").first())).width).toBe(299);
    const divisions = page.locator("#about-divisions");
    expect((await box(divisions)).height).toBe(900);
    await expect(divisions.locator("li")).toHaveCount(5);
    await expect(divisions.getByText("Explore Division").first()).toBeVisible();
    await expect(divisions.locator("a").first()).toHaveAttribute("href", "/divisions/design");
  });

  test("founder", async ({ page }) => {
    await open(page);
    const founder = section(page, 5);
    const name = founder.locator("h2");
    await expectFont(name, INTER);
    await expectStyles(name, { fontSize: "56px", fontWeight: "500", letterSpacing: "-0.56px" });
    expect(await box(name)).toMatchObject({ x: 86, height: 68 });
    const photo = founder.locator("img");
    expect(await box(photo)).toMatchObject({ x: 658, width: 696, height: 520 });
    await expectStyles(founder.locator("blockquote"), {
      fontWeight: "500",
      color: "rgb(17, 17, 17)",
    });
  });

  test("experience stats", async ({ page }) => {
    await open(page);
    const stats = section(page, 6).locator("dl");
    await expectStyles(stats, {
      gridTemplateColumns: "317px 317px 317px 317px",
      borderTopColor: "rgb(255, 255, 255)",
      borderBottomColor: "rgb(51, 51, 51)",
      marginTop: "62px",
    });
    const items = stats.locator(":scope > div");
    await expectStyles(items.nth(0), { paddingLeft: "0px", borderLeftWidth: "0px" });
    await expectStyles(items.nth(1), {
      paddingLeft: "24px",
      borderLeftWidth: "1px",
      borderLeftColor: "rgb(42, 42, 42)",
    });
    const figure = items.nth(0).locator("dd").first();
    await expectStyles(figure, { fontSize: "50px", fontWeight: "300" });
    expect((await box(figure)).height).toBe(60);
    expect((await box(items.nth(0))).height).toBe(171);
    await expectStyles(section(page, 6).locator("p").first(), { color: "rgb(163, 163, 163)" });
  });

  test("management team grows instead of being zoomed (KI-L13)", async ({ page }) => {
    await open(page);
    const team = section(page, 7);
    expect((await box(team)).height).toBeCloseTo(953.9, 0);
    const cards = team.locator("li");
    await expect(cards).toHaveCount(4);
    await expectStyles(team.locator("ul"), { gridTemplateColumns: "290px 290px 290px 290px" });
    await expectStyles(cards.first(), {
      backgroundColor: "rgb(241, 241, 241)",
      borderTopColor: "rgb(224, 224, 224)",
      paddingBottom: "60px",
    });
    expect((await box(cards.first())).height).toBe(495);
    expect(await box(cards.first().locator("img"))).toMatchObject({ width: 240, height: 222 });
  });

  test("works mosaic grows instead of being zoomed (KI-L13) and links projects", async ({
    page,
  }) => {
    await open(page);
    const works = section(page, 8);
    expect((await box(works)).height).toBe(1177);
    const grid = works.locator("ul");
    await expectStyles(grid, {
      gridTemplateColumns: "410px 410px 412px",
      gridTemplateRows: "460px 270px",
      marginTop: "70px",
    });
    const tiles = grid.locator("a");
    await expect(tiles).toHaveCount(4);
    expect(await box(tiles.nth(0))).toMatchObject({ x: 86, width: 838, height: 460 });
    expect(await box(tiles.nth(1))).toMatchObject({ x: 942, width: 412, height: 747 });
    // No project page but The Courtyard House's exists yet; cards open it, as in the original (KI-F09).
    await expect(tiles.nth(0)).toHaveAttribute("href", "/works/the-courtyard-house");
    await expect(tiles.nth(2)).toContainText("The Courtyard House");
    const title = works.locator("h2");
    await expectFont(title, JOST);
    await expectStyles(title, { fontSize: "60px", fontWeight: "500" });
  });

  test("works tiles zoom their image on hover", async ({ page }) => {
    await open(page);
    const tile = section(page, 8).locator("ul a").first();
    await tile.scrollIntoViewIfNeeded();
    const image = tile.locator("img");
    // Tailwind's scale utilities use the `scale` property (the original: transform scale(1.04)).
    await expectStyles(image, { scale: "none", transitionDuration: "0.7s" });
    await tile.hover();
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.04");
  });

  test("contact (plain CONTACT template, no FAQ)", async ({ page }) => {
    await open(page);
    const contact = page.locator("#about-contact");
    expect((await box(contact)).height).toBe(900);
    await expect(contact).toHaveAttribute("data-contact-section", "");
    await expectStyles(contact.locator(":scope > div"), {
      gridTemplateColumns: "588px 640px",
      columnGap: "40px",
    });
    const heading = contact.locator("h2");
    await expectStyles(heading, { fontSize: "54px", fontWeight: "700", lineHeight: "54px" });
    const form = contact.locator("form");
    expect((await box(form)).x).toBe(714);
    await expectStyles(form.locator("input[name=name]"), { height: "46px" });
    await expectStyles(form.locator("textarea"), { height: "108px" });
    await expectStyles(form.locator("button[type=submit]"), { color: "rgb(17, 17, 17)" });
    await expect(contact.locator("dt")).toHaveText(["Email", "Phone"]);
  });

  test("the philosophy photo drifts with the scroll (E25)", async ({ page }) => {
    await open(page);
    const image = section(page, 2).locator("img").first();
    await image.scrollIntoViewIfNeeded();
    const transform = () => image.evaluate((el) => getComputedStyle(el).transform);
    await expect.poll(transform).not.toBe("none");
    const before = await transform();
    expect(before).toMatch(/^matrix\(1\.3, 0, 0, 1\.3,/);
    await page.mouse.wheel(0, 300);
    await expect.poll(transform).not.toBe(before);
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("1024 (≤1099)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("hero title scales to 62px (KI-L16)", async ({ page }) => {
    await open(page);
    const hero = section(page, 0);
    await expectStyles(hero, { height: "768px", paddingTop: "0px" });
    await expectStyles(hero.locator("h1"), { fontSize: "62px" });
    expect((await box(hero.locator("p").first())).y).toBe(168);
  });

  test("section titles scale to 46px (KI-N04) and layouts collapse", async ({ page }) => {
    await open(page);
    await expectStyles(section(page, 1).locator("h2"), { fontSize: "46px" });
    await expectStyles(section(page, 1), { paddingTop: "80px", paddingBottom: "80px" });
    await expectStyles(section(page, 1).locator(".grid").nth(1), {
      gridTemplateColumns: "464px 464px",
    });
    await expectStyles(page.locator("#about-approach > div > div").first(), {
      gridTemplateColumns: "952px",
    });
    await expectStyles(section(page, 6).locator("dl"), {
      gridTemplateColumns: "476px 476px",
    });
    const stats = section(page, 6).locator("dl > div");
    await expectStyles(stats.nth(2), { borderTopWidth: "1px", borderLeftWidth: "0px" });
    await expectStyles(section(page, 7).locator("ul"), { gridTemplateColumns: "464px 464px" });
    await expectStyles(section(page, 8).locator("ul"), { gridTemplateColumns: "467px 467px" });
    expect((await box(section(page, 8).locator("ul a").nth(0))).width).toBe(952);
    expect((await box(section(page, 8).locator("ul a").nth(1))).height).toBe(360);
    await expectStyles(page.locator("#about-contact > div"), {
      gridTemplateColumns: "456px 456px",
    });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("768 (≤860)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("390 (phone)", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("hero sits at the bottom with stacked full-width buttons", async ({ page }) => {
    await open(page);
    const hero = section(page, 0);
    await expectStyles(hero, { height: "844px", paddingBottom: "40px" });
    await expectStyles(hero.locator("h1"), { fontSize: "37.44px" });
    const buttons = hero.locator("a");
    expect((await box(buttons.nth(0))).width).toBe(350);
    expect((await box(buttons.nth(1))).y - (await box(buttons.nth(0))).y).toBe(60);
    await expect(page.locator("[data-vertical-label]").first()).toBeHidden();
  });

  test("one column everywhere, tiny text raised to 11px (KI-A10)", async ({ page }) => {
    await open(page);
    await expectStyles(section(page, 1).locator(".grid").nth(1), {
      gridTemplateColumns: "350px",
    });
    await expectStyles(section(page, 1).locator("h2"), {
      fontSize: "34px",
      lineHeight: "38.08px",
    });
    await expectStyles(section(page, 7).locator("li p").first(), { fontSize: "11px" });
    await expectStyles(section(page, 2).locator("li").first(), { fontSize: "11px" });
    await expectStyles(section(page, 8).locator("a span").first(), { fontSize: "11px" });
    const plant = section(page, 1).locator("img[aria-hidden]");
    expect((await box(plant)).width).toBeCloseTo(116, 0);
    expect((await box(section(page, 5).locator("img"))).height).toBe(360);
    await expectStyles(section(page, 6).locator("dl > div").nth(1), {
      paddingTop: "22px",
      paddingLeft: "0px",
      borderTopWidth: "1px",
      borderLeftWidth: "0px",
    });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});
