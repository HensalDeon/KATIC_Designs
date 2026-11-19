import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Pins the design-system primitives to the computed styles measured on the ORIGINAL site
 * (reference/probes/primitives.json, captured with reference/probes/primitives.mts).
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

async function open(page: Page) {
  await page.goto("/styleguide");
  await page.evaluate(() => document.fonts.ready);
}

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("layout: container and section rhythm", async ({ page }) => {
    await open(page);
    await expectStyles(page.getByTestId("container"), { width: "1268px", marginLeft: "86px" });
    await expectStyles(page.getByTestId("section-light"), {
      paddingTop: "120px",
      paddingBottom: "120px",
      backgroundColor: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByTestId("section-dark"), { backgroundColor: "rgb(0, 0, 0)" });
  });

  test("kickers follow the original scale and tone colours", async ({ page }) => {
    await open(page);
    const sans = page.getByTestId("kicker-sans-light");
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
    await expectStyles(page.getByTestId("kicker-sans-dark"), { color: "rgb(232, 98, 44)" });

    const home = page.getByTestId("kicker-home-light");
    await expectFont(home, JOST);
    await expectStyles(home, { fontSize: "11px", letterSpacing: "2.42px" });
  });

  test("titles", async ({ page }) => {
    await open(page);
    const standard = page.getByTestId("title-standard-light");
    await expectFont(standard, JOST);
    await expectStyles(standard, {
      fontSize: "58px",
      fontWeight: "400",
      lineHeight: "64.96px",
      letterSpacing: "-0.29px",
      textTransform: "uppercase",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(page.getByTestId("title-standard-dark"), { color: "rgb(255, 255, 255)" });
    await expectStyles(page.getByTestId("title-home-light"), {
      fontSize: "56px",
      fontWeight: "500",
      lineHeight: "57.12px",
    });
    await expectStyles(page.getByTestId("hero-title"), {
      fontSize: "76px",
      fontWeight: "700",
      lineHeight: "72.96px",
      letterSpacing: "-0.38px",
      color: "rgb(255, 255, 255)",
    });
  });

  test("leads and body copy", async ({ page }) => {
    await open(page);
    const lead = page.getByTestId("lead-section-light");
    await expectFont(lead, INTER);
    await expectStyles(lead, {
      fontSize: "16px",
      lineHeight: "28.8px",
      color: "rgb(85, 85, 85)",
      maxWidth: "600px",
    });
    await expectStyles(page.getByTestId("lead-section-dark"), { color: "rgb(187, 187, 187)" });
    await expectStyles(page.getByTestId("lead-home-light"), {
      fontSize: "15px",
      lineHeight: "26.25px",
    });
    await expectStyles(page.getByTestId("lead-hero"), {
      fontSize: "17px",
      lineHeight: "28.9px",
      color: "rgb(238, 238, 238)",
    });
    await expectStyles(page.getByTestId("body-section-light"), {
      fontSize: "14px",
      lineHeight: "26.6px",
      color: "rgb(85, 85, 85)",
    });
    await expectStyles(page.getByTestId("body-section-dark"), { color: "rgb(170, 170, 170)" });
  });

  test("buttons", async ({ page }) => {
    await open(page);
    const section = page.getByTestId("btn-light-section-light");
    await expectFont(section, INTER);
    await expectStyles(section, {
      height: "52px",
      paddingLeft: "24px",
      fontSize: "12.5px",
      fontWeight: "600",
      columnGap: "22px",
      backgroundColor: "rgb(247, 244, 239)",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(page.getByTestId("btn-outline-sm-light"), {
      height: "46px",
      paddingLeft: "22px",
      fontWeight: "500",
      borderTopWidth: "1px",
      borderTopColor: "rgb(207, 203, 195)",
      backgroundColor: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByTestId("btn-dark-section-dark"), {
      backgroundColor: "rgb(17, 17, 17)",
      borderTopColor: "rgba(255, 255, 255, 0.28)",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByTestId("btn-outline-light-section-dark"), {
      borderTopColor: "rgba(255, 255, 255, 0.4)",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByTestId("btn-primary-section-light"), {
      backgroundColor: "rgb(232, 98, 44)",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(page.getByTestId("btn-light-hero-light"), {
      height: "54px",
      paddingLeft: "26px",
    });

    const home = page.getByTestId("btn-home-light");
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
    await open(page);
    const light = page.getByTestId("btn-light-section-light");
    await light.hover();
    await expect(light).toHaveCSS("background-color", "rgb(255, 255, 255)");

    const primary = page.getByTestId("btn-primary-section-light");
    await primary.hover();
    await expect(primary).toHaveCSS("background-color", "rgb(212, 82, 30)");
  });

  test("links and labels", async ({ page }) => {
    await open(page);
    await expectStyles(page.getByTestId("more-link-light"), {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "1.32px",
      textTransform: "uppercase",
      columnGap: "10px",
    });
    await expectStyles(page.getByTestId("underline-link-light"), {
      fontSize: "10px",
      letterSpacing: "2px",
      color: "rgb(232, 98, 44)",
      borderBottomWidth: "1px",
    });
    await expectStyles(page.getByTestId("chip-light"), {
      height: "20px",
      paddingLeft: "9px",
      fontSize: "8.5px",
      borderTopColor: "rgb(204, 204, 204)",
    });
    await expectStyles(page.getByTestId("tag-light"), {
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
    await open(page);
    await expectStyles(page.getByTestId("container"), { width: "952px" });
    await expectStyles(page.getByTestId("section-light"), {
      paddingTop: "80px",
      paddingBottom: "80px",
    });
  });

  test("titles scale down on every page (KI-N04, KI-L16)", async ({ page }) => {
    await open(page);
    await expectStyles(page.getByTestId("title-standard-light"), {
      fontSize: "46px",
      lineHeight: "51.52px",
    });
    await expectStyles(page.getByTestId("hero-title"), { fontSize: "62px" });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("phone type scale", async ({ page }) => {
    await open(page);
    await expectStyles(page.getByTestId("container"), { width: "350px" });
    await expectStyles(page.getByTestId("kicker-sans-light"), {
      fontSize: "11px",
      letterSpacing: "2.2px",
    });
    await expectStyles(page.getByTestId("title-standard-light"), {
      fontSize: "34px",
      lineHeight: "37.4px",
    });
    await expectStyles(page.getByTestId("lead-section-light"), {
      fontSize: "15px",
      lineHeight: "27px",
    });
    await expectStyles(page.getByTestId("hero-title"), {
      fontSize: "37.44px",
      lineHeight: "39.312px",
      letterSpacing: "-0.3744px",
    });
    await expectStyles(page.getByTestId("lead-hero"), { fontSize: "15px", lineHeight: "24px" });
    await expectStyles(page.getByTestId("chip-light"), { fontSize: "11px" });
  });
});
