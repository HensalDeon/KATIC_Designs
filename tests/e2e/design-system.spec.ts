import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Pins the design-system primitives to the computed styles measured on the ORIGINAL site
 * (reference/probes/primitives.json, captured with reference/probes/primitives.mts), on real pages
 * that render each primitive in the measured configuration (variant, size, tone) without a
 * className override of the asserted property. Most specimens live on /services/interior, which
 * is the original's `#interior` probe page.
 * Expected values are written as the browser reports them (px, rgb()).
 *
 * Deliberate deviations from the original are marked with their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before") {
  const actual = await locator.evaluate(
    (el, { keys, pseudoElt }) => {
      const style = getComputedStyle(el, pseudoElt ?? null);
      return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
    },
    {
      keys: Object.keys(expected).map((key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)),
      pseudoElt: pseudo,
    },
  );
  const normalised = Object.fromEntries(
    Object.keys(expected).map((key) => [
      key,
      actual[key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)],
    ]),
  );
  expect(normalised).toEqual(expected);
}

const JOST = /^(__Jost|Jost)/;
const INTER = /^(__Inter|Inter)/;

async function expectFont(locator: Locator, family: RegExp) {
  const value = await locator.evaluate((el) => getComputedStyle(el).fontFamily);
  expect(value).toMatch(family);
}

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** A `<p>` whose whole text matches (kickers, leads, body copy). */
function paragraph(scope: Page | Locator, text: RegExp) {
  return scope.locator("p").filter({ hasText: text });
}

/**
 * /services/interior: the banner (`PageHero`), the light "Philosophy" split (`ContentSection` +
 * `SplitFeature`), the dark "Our interior services" rows (`ContentSection` + `SectionHeader`), the
 * light "Featured projects" header and the dark testimonials header.
 */
const interior = {
  path: "/services/interior",
  hero: (page: Page) => page.locator("section[data-hero]"),
  /** Light `Section` (standard spacing) with a sans `Kicker`, standard `SectionTitle` and `Body`. */
  philosophy: (page: Page) =>
    page.locator("section").filter({ has: page.getByRole("heading", { name: /^Beauty that/ }) }),
  /** Dark `Section` whose only child is the site `Container`. */
  services: (page: Page) => page.locator("#interior-services"),
  container: (page: Page) => page.locator("#interior-services > div"),
  featuredLead: (page: Page) =>
    paragraph(page, /^Residential, commercial, institutional and hospitality interiors\.$/),
};

const aboutHeroTitle = (page: Page) => page.getByRole("heading", { level: 1 });

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("layout: container and section rhythm", async ({ page }) => {
    await open(page, interior.path);
    await expectStyles(interior.container(page), { width: "1268px", marginLeft: "86px" });
    await expectStyles(interior.philosophy(page), {
      paddingTop: "120px",
      paddingBottom: "120px",
      backgroundColor: "rgb(255, 255, 255)",
    });
    await expectStyles(interior.services(page), { backgroundColor: "rgb(0, 0, 0)" });
  });

  test("kickers follow the original scale and tone colours", async ({ page }) => {
    await open(page, interior.path);
    const sans = paragraph(interior.philosophy(page), /^Philosophy$/);
    await expectFont(sans, INTER);
    await expectStyles(sans, {
      fontSize: "9.5px",
      fontWeight: "500",
      letterSpacing: "1.9px",
      textTransform: "uppercase",
      columnGap: "12px",
      color: "rgb(194, 78, 30)", // text-safe orange on white (KI-A11)
    });
    await expectStyles(
      sans,
      { width: "22px", height: "1px", backgroundColor: "rgb(232, 98, 44)" },
      "::before",
    );
    await expectStyles(paragraph(interior.services(page), /^Our interior services$/), {
      color: "rgb(232, 98, 44)",
    });

    // Home page scale (`font="home"`), light "Our Divisions" section.
    await open(page, "/");
    const home = paragraph(page.locator("#home-divisions"), /^Our Divisions$/);
    await expectFont(home, JOST);
    await expectStyles(home, { fontSize: "11px", letterSpacing: "2.42px" });
  });

  test("titles", async ({ page }) => {
    await open(page, interior.path);
    const standard = interior.philosophy(page).getByRole("heading", { level: 2 });
    await expectFont(standard, JOST);
    await expectStyles(standard, {
      fontSize: "58px",
      fontWeight: "400",
      lineHeight: "64.96px",
      letterSpacing: "-0.29px",
      textTransform: "uppercase",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(interior.services(page).getByRole("heading", { level: 2 }), {
      color: "rgb(255, 255, 255)",
    });

    await open(page, "/");
    await expectStyles(page.locator("#home-divisions").getByRole("heading", { level: 2 }), {
      fontSize: "56px",
      fontWeight: "500",
      lineHeight: "57.12px",
    });

    // Standard-scale `HeroTitle`. Every banner sets its own line height; About's is 0.98
    // (original 1440#about `.h1`: 76px / 74.48px).
    await open(page, "/about");
    await expectStyles(aboutHeroTitle(page), {
      fontSize: "76px",
      fontWeight: "700",
      lineHeight: "74.48px",
      letterSpacing: "-0.38px",
      color: "rgb(255, 255, 255)",
    });
  });

  test("leads and body copy", async ({ page }) => {
    await open(page, interior.path);
    const lead = interior.featuredLead(page);
    await expectFont(lead, INTER);
    await expectStyles(lead, {
      fontSize: "16px",
      lineHeight: "28.8px",
      color: "rgb(85, 85, 85)",
      maxWidth: "600px",
    });
    await expectStyles(paragraph(interior.services(page), /^From the first space plan/), {
      color: "rgb(187, 187, 187)",
    });
    await expectStyles(paragraph(interior.hero(page), /^Interior planning, materials/), {
      fontSize: "17px",
      lineHeight: "28.9px",
      color: "rgb(238, 238, 238)",
    });
    await expectStyles(paragraph(interior.philosophy(page), /^Every room starts with how/), {
      fontSize: "14px",
      lineHeight: "26.6px",
      color: "rgb(85, 85, 85)",
    });

    // Dark split body: /services/construction "Our approach".
    await open(page, "/services/construction");
    await expectStyles(paragraph(page, /^Each project has a dedicated/), {
      color: "rgb(170, 170, 170)",
    });

    await open(page, "/");
    await expectStyles(paragraph(page.locator("#home-divisions"), /^Specialist teams for design/), {
      fontSize: "15px",
      lineHeight: "26.25px",
    });
  });

  test("buttons", async ({ page }) => {
    await open(page, interior.path);
    // `size="section"` (`.ks .btn`): the outline "Visit the Factory" split CTA.
    const section = page.getByRole("link", { name: "Visit the Factory" });
    await expectFont(section, INTER);
    await expectStyles(section, {
      height: "52px",
      paddingLeft: "24px",
      fontSize: "12.5px",
      fontWeight: "600",
      columnGap: "22px",
    });
    // `variant="light" size="hero"` (`.kh-hero .btn.wh`).
    await expectStyles(interior.hero(page).getByRole("link", { name: "Discuss Your Interior" }), {
      height: "54px",
      paddingLeft: "26px",
      backgroundColor: "rgb(247, 244, 239)",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(interior.hero(page).getByRole("link", { name: "View Interior Projects" }), {
      borderTopColor: "rgba(255, 255, 255, 0.4)",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByRole("link", { name: "Read All Client Reviews" }), {
      backgroundColor: "rgb(17, 17, 17)",
      borderTopColor: "rgba(255, 255, 255, 0.28)",
      color: "rgb(255, 255, 255)",
    });

    await open(page, "/about");
    await expectStyles(page.getByRole("link", { name: "Meet the Founder" }), {
      height: "46px",
      paddingLeft: "22px",
      fontWeight: "500",
      borderTopWidth: "1px",
      borderTopColor: "rgb(207, 203, 195)",
      backgroundColor: "rgb(255, 255, 255)",
    });

    await open(page, "/works");
    await expectStyles(page.getByRole("link", { name: "View Case Study" }), {
      backgroundColor: "rgb(197, 83, 37)",
      color: "rgb(255, 255, 255)",
    });

    await open(page, "/");
    const home = page
      .locator("section[data-hero]")
      .getByRole("button", { name: "Start a Project" });
    await expectFont(home, JOST);
    await expectStyles(home, {
      height: "52px",
      paddingLeft: "28px",
      fontSize: "12px",
      fontWeight: "500",
      letterSpacing: "1.92px",
      textTransform: "uppercase",
      columnGap: "14px",
    });
  });

  test("button hover states", async ({ page }) => {
    await open(page, interior.path);
    const light = interior.hero(page).getByRole("link", { name: "Discuss Your Interior" });
    await light.hover();
    await expect(light).toHaveCSS("background-color", "rgb(255, 255, 255)");

    await open(page, "/works");
    const primary = page.getByRole("link", { name: "View Case Study" });
    await primary.hover();
    await expect(primary).toHaveCSS("background-color", "rgb(179, 75, 33)");
  });

  test("links and labels", async ({ page }) => {
    await open(page, "/about");
    // `.k-more` label of the "Our services" cards (`MoreLabel`, the same styles as `MoreLink`).
    await expectStyles(page.locator("#about-services").getByText("Explore Service").first(), {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "1.32px",
      textTransform: "uppercase",
      columnGap: "10px",
    });
    await expectStyles(page.locator("span").filter({ hasText: /^Residential Interior$/ }), {
      fontSize: "9px",
      letterSpacing: "1.26px",
      paddingTop: "7px",
      paddingLeft: "9px",
      backgroundColor: "rgb(26, 26, 26)",
    });
  });
});

test.describe("1024 (no zoom, tablet-landscape rules)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("container gutters and section padding", async ({ page }) => {
    await open(page, interior.path);
    await expectStyles(interior.container(page), { width: "952px" });
    await expectStyles(interior.philosophy(page), {
      paddingTop: "80px",
      paddingBottom: "80px",
    });
  });

  test("titles scale down on every page (KI-N04, KI-L16)", async ({ page }) => {
    await open(page, interior.path);
    await expectStyles(interior.philosophy(page).getByRole("heading", { level: 2 }), {
      fontSize: "46px",
      lineHeight: "51.52px",
    });
    await open(page, "/about");
    await expectStyles(aboutHeroTitle(page), { fontSize: "62px" });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("phone type scale", async ({ page }) => {
    await open(page, interior.path);
    await expectStyles(interior.container(page), { width: "350px" });
    await expectStyles(paragraph(interior.philosophy(page), /^Philosophy$/), {
      fontSize: "11px",
      letterSpacing: "2.2px",
    });
    await expectStyles(interior.philosophy(page).getByRole("heading", { level: 2 }), {
      fontSize: "34px",
      lineHeight: "37.4px",
    });
    await expectStyles(interior.featuredLead(page), { fontSize: "15px", lineHeight: "27px" });
    await expectStyles(paragraph(interior.hero(page), /^Interior planning, materials/), {
      fontSize: "15px",
      lineHeight: "24px",
    });

    await open(page, "/about");
    await expectStyles(aboutHeroTitle(page), {
      fontSize: "37.44px",
      lineHeight: "39.312px",
      letterSpacing: "-0.3744px",
    });
  });
});
