import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Pins the shared body sections (sectors, cards, gallery, before/after, divisions strip,
 * testimonials, CTA band) to the computed styles measured on the ORIGINAL site
 * (reference/probes/sections.json, captured with reference/probes/sections.mts).
 * Expected values are written as the browser reports them (px, rgb()).
 *
 * Deliberate deviations from the original are marked with their KNOWN_ISSUES id or "deviation".
 * The original's fit() auto-zoom is not reproduced (D4), so 1440 values are the unzoomed ones.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before" | "::after") {
  const actual = await locator.evaluate(
    (el, { keys, pseudoElt }) => {
      const style = getComputedStyle(el, pseudoElt ?? null);
      return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
    },
    { keys: Object.keys(expected).map(kebab), pseudoElt: pseudo },
  );
  const normalised = Object.fromEntries(
    Object.keys(expected).map((key) => [key, actual[kebab(key)]]),
  );
  expect(normalised).toEqual(expected);
}

async function open(page: Page) {
  await page.goto("/styleguide/sections-b");
  await page.evaluate(() => document.fonts.ready);
}

const BRAND = "rgb(232, 98, 44)";
const testId = (page: Page, id: string) => page.getByTestId(id);
const grid = (page: Page, id: string) => testId(page, id).locator(":scope > *").first();

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("sector tiles", async ({ page }) => {
    await open(page);
    await expectStyles(grid(page, "sectors-dark"), {
      gridTemplateColumns: "303.5px 303.5px 303.5px 303.5px",
      columnGap: "18px",
    });
    const tile = grid(page, "sectors-dark").locator("a").first();
    await expectStyles(tile, { height: "400px", overflow: "hidden", color: "rgb(255, 255, 255)" });
    await expectStyles(
      tile,
      { backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.05) 40%, rgba(0, 0, 0, 0.75))" },
      "::after",
    );
    await expectStyles(tile.locator("img"), { objectFit: "cover", transitionDuration: "0.8s" });
    await expectStyles(tile.locator("small"), {
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.8px",
      color: BRAND,
    });
    await expectStyles(tile.locator("b"), {
      fontSize: "26px",
      fontWeight: "400",
      marginTop: "6px",
    });
    await expectStyles(tile.locator("span > span"), {
      fontSize: "12px",
      lineHeight: "19.2px",
      marginTop: "8px",
      color: "rgb(221, 221, 221)",
    });
    // Exterior: five columns, the fifth tile is not a link.
    const five = grid(page, "sectors-light");
    const columns = await five.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" "),
    );
    expect(columns).toHaveLength(5);
    await expect(five.locator("a")).toHaveCount(4);
  });

  test("project, service and product cards", async ({ page }) => {
    await open(page);
    const c4 = grid(page, "cards-project-c4");
    await expectStyles(c4, { gridTemplateColumns: "299px 299px 299px 299px", columnGap: "24px" });
    const card = c4.locator("a").first();
    await expectStyles(card, { height: "363.75px", color: "rgb(17, 17, 17)" });
    await expectStyles(card.locator(":scope > span").first(), {
      height: "260px",
      backgroundColor: "rgb(238, 238, 238)",
    });
    await expectStyles(card.locator("small"), {
      marginTop: "20px",
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.44px",
      textTransform: "uppercase",
      color: "rgb(192, 82, 42)",
    });
    await expectStyles(card.locator("h3"), {
      marginTop: "14px",
      fontSize: "23px",
      fontWeight: "400",
      lineHeight: "28.75px",
    });
    await expectStyles(card.locator(":scope > span").last(), {
      height: "30px",
      paddingTop: "16px",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "1.32px",
      textTransform: "uppercase",
      columnGap: "10px",
    });

    const dark = grid(page, "cards-service-dark").locator("a").first();
    await expectStyles(dark.locator(":scope > span").first(), {
      height: "200px",
      backgroundColor: "rgb(17, 17, 17)",
    });
    await expectStyles(dark.locator("h3"), { color: "rgb(255, 255, 255)" });
    await expectStyles(dark.locator("p"), {
      marginTop: "6px",
      fontSize: "13px",
      lineHeight: "22.75px",
      color: "rgb(170, 170, 170)",
    });
    await expectStyles(grid(page, "cards-service-light").locator("a p").first(), {
      color: "rgb(85, 85, 85)",
    });
    await expectStyles(grid(page, "cards-project-dark").locator("small").first(), {
      color: BRAND,
    });
    await expectStyles(grid(page, "cards-product").locator("a").first(), { height: "301.5px" });
    // Works division cards: five columns of 234.4px with 230px images.
    const c5 = grid(page, "cards-division");
    const c5Columns = await c5.evaluate((el) =>
      getComputedStyle(el).gridTemplateColumns.split(" "),
    );
    expect(c5Columns).toHaveLength(5);
    await expectStyles(c5.locator("a > span").first(), { height: "230px" });
    await expect(c5.locator("a").first()).toContainText("Explore Division");
  });

  test("card hover zooms the image and turns the title orange", async ({ page }) => {
    await open(page);
    const card = grid(page, "cards-project-c4").locator("a").first();
    await expectStyles(card.locator("img"), { transitionDuration: "0.8s" });
    await card.hover();
    await expect(card.locator("h3")).toHaveCSS("color", BRAND);
  });

  test("gallery", async ({ page }) => {
    await open(page);
    const gallery = grid(page, "gallery");
    await expectStyles(gallery, { columnGap: "18px", rowGap: "18px" });
    const figure = gallery.locator("figure").first();
    await expectStyles(figure, { height: "320px", overflow: "hidden" });
    await expectStyles(gallery.locator("figure").last(), { gridColumnEnd: "span 2" });
    await expectStyles(figure.locator("img"), { height: "320px", objectFit: "cover" });
    await expectStyles(figure.locator("figcaption"), {
      position: "absolute",
      bottom: "14px",
      left: "16px",
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.8px",
      textTransform: "uppercase",
      color: "rgb(255, 255, 255)",
      textShadow: "rgba(0, 0, 0, 0.6) 0px 1px 6px",
    });
  });

  test("gallery images open the lightbox as one group", async ({ page }) => {
    await open(page);
    await grid(page, "gallery").getByRole("button").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("1 / 5");
    await page.keyboard.press("Escape");
  });

  test("before / after", async ({ page }) => {
    await open(page);
    const ba = grid(page, "before-after");
    await expectStyles(ba, { rowGap: "28px" });
    const pair = ba.locator(":scope > div").first();
    await expectStyles(pair, {
      gridTemplateColumns: "436px 436px 360px",
      columnGap: "18px",
      alignItems: "end",
      height: "250px",
    });
    await expectStyles(pair.locator("figure").first(), { height: "250px" });
    const chip = pair.locator("figure span");
    await expectStyles(chip.first(), {
      top: "16px",
      left: "16px",
      paddingTop: "7px",
      paddingLeft: "10px",
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.8px",
      backgroundColor: "rgb(17, 17, 17)",
    });
    await expectStyles(chip.last(), { backgroundColor: BRAND });
    await expectStyles(pair.locator("h3"), { fontSize: "24px", fontWeight: "400" });
    await expectStyles(pair.locator("small"), {
      marginTop: "10px",
      fontSize: "9px",
      letterSpacing: "1.44px",
      color: "rgb(192, 82, 42)",
    });
    await expectStyles(pair.locator("p"), {
      marginTop: "12px",
      lineHeight: "22.75px",
      color: "rgb(85, 85, 85)",
    });
  });

  test("divisions strip", async ({ page }) => {
    await open(page);
    await expectStyles(testId(page, "divisions-light").locator("section"), {
      minHeight: "900px",
      paddingTop: "120px",
    });
    const label = testId(page, "divisions-light").locator("nav > p");
    await expectStyles(label, {
      marginBottom: "26px",
      fontSize: "11px",
      fontWeight: "500",
      letterSpacing: "2.42px",
      color: BRAND,
    });
    const first = testId(page, "divisions-light").locator("a").first();
    await expectStyles(first, {
      height: "92px",
      paddingTop: "22px",
      fontSize: "46px",
      fontWeight: "500",
      lineHeight: "46px",
      textTransform: "uppercase",
      justifyContent: "space-between",
      borderTopWidth: "1px",
      borderTopColor: "rgb(221, 221, 221)",
      borderBottomColor: "rgb(221, 221, 221)",
    });
    await expectStyles(testId(page, "divisions-light").locator("a").nth(1), {
      height: "91px",
      borderTopWidth: "0px",
    });
    await expectStyles(first.locator("i"), { fontSize: "28px", color: BRAND });
    await expectStyles(testId(page, "divisions-dark").locator("a").first(), {
      color: "rgb(255, 255, 255)",
      borderTopColor: "rgb(42, 42, 42)",
    });
  });

  test("testimonials", async ({ page }) => {
    await open(page);
    const dark = grid(page, "testimonials-dark");
    await expectStyles(dark, {
      gridTemplateColumns: "410.656px 410.672px 410.656px",
      columnGap: "18px",
    });
    const card = dark.locator("figure").first();
    await expectStyles(card, {
      height: "293px",
      paddingTop: "28px",
      paddingRight: "30px",
      paddingBottom: "24px",
      backgroundColor: "rgb(12, 12, 12)",
      borderTopColor: "rgb(42, 42, 42)",
    });
    const mark = card.locator(":scope > span");
    await expectStyles(mark, {
      fontSize: "26px",
      fontWeight: "600",
      fontStyle: "italic",
      lineHeight: "26px",
      color: BRAND,
    });
    await expect(mark).toHaveAttribute("aria-hidden", "true"); // KI-A16
    await expectStyles(card.locator("blockquote"), {
      marginTop: "24px",
      fontSize: "18px",
      lineHeight: "27px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(card.locator("figcaption"), {
      marginTop: "24px",
      paddingTop: "16px",
      columnGap: "14px",
      borderTopColor: "rgb(42, 42, 42)",
    });
    await expectStyles(card.locator("img"), {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
    });
    await expectStyles(card.locator("b"), { fontSize: "11.5px", fontWeight: "600" });
    await expectStyles(card.locator("figcaption span span"), {
      marginTop: "3px",
      fontSize: "9px",
      letterSpacing: "1.44px",
      textTransform: "uppercase",
      color: "rgb(153, 153, 153)",
    });
    const light = grid(page, "testimonials-light").locator("figure").first();
    await expectStyles(light, {
      backgroundColor: "rgb(255, 255, 255)",
      borderTopColor: "rgb(227, 223, 215)",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(light.locator("figcaption span span"), { color: "rgb(102, 102, 102)" });
  });

  test("CTA bands", async ({ page }) => {
    await open(page);
    const works = testId(page, "cta-works");
    await expectStyles(works, {
      height: "900px",
      paddingTop: "110px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(
      works,
      { backgroundImage: "linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.45))" },
      "::before",
    );
    await expectStyles(works.locator("img"), { objectFit: "cover", height: "900px" });
    const wrap = works.locator(":scope > div").last();
    await expectStyles(wrap, { width: "1296px", height: "790px", paddingTop: "100px" });
    await expectStyles(works.locator("h2"), {
      marginTop: "140px",
      fontSize: "58px",
      fontWeight: "400",
      lineHeight: "66.12px",
      textTransform: "uppercase",
    });
    await expectStyles(works.locator("p").last(), {
      marginTop: "20px",
      maxWidth: "580px",
      fontSize: "15.5px",
      lineHeight: "27.125px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(works.getByRole("link", { name: "Start Your Project" }), {
      marginTop: "22px",
      height: "46px",
      paddingLeft: "22px",
      fontSize: "12.5px",
      fontWeight: "600",
      columnGap: "14px",
      backgroundColor: BRAND,
    });
    const call = wrap.locator(":scope > div");
    await expectStyles(call, {
      position: "absolute",
      bottom: "80px",
      width: "270px",
      height: "102px",
      paddingTop: "22px",
    });
    await expectStyles(call.locator("a"), {
      marginTop: "8px",
      fontSize: "21px",
      fontWeight: "500",
    });
    await expectStyles(call.locator("span"), {
      marginTop: "10px",
      fontSize: "10.5px",
      color: "rgb(204, 204, 204)",
    });

    const project = testId(page, "cta-project");
    await expectStyles(project.locator(":scope > div").last(), {
      width: "1268px",
      paddingTop: "104px",
    });
    await expectStyles(project.locator("h2"), {
      marginTop: "110px",
      fontSize: "66px",
      lineHeight: "69.3px",
      letterSpacing: "-0.66px",
    });
    await expectStyles(project.locator("p").last(), { marginTop: "28px", maxWidth: "520px" });
    await expectStyles(project.getByRole("link", { name: "Discuss Your Project" }), {
      marginTop: "12px",
      height: "54px",
      paddingLeft: "24px",
      fontSize: "11.5px",
      letterSpacing: "1.38px",
      textTransform: "uppercase",
      columnGap: "24px",
    });

    const reviews = testId(page, "cta-reviews");
    await expectStyles(reviews.locator("img"), { objectPosition: "50% 40%" });
    await expectStyles(reviews.locator(":scope > div").last(), { paddingTop: "96px" });
    await expectStyles(reviews.locator("h2"), {
      marginTop: "42px",
      fontSize: "62px",
      lineHeight: "69.44px",
    });
    await expectStyles(reviews.locator("p").last(), { marginTop: "18px", fontSize: "17px" });
    await expectStyles(reviews.getByRole("link", { name: "Start Your Project" }), {
      marginTop: "80px",
      height: "52px",
      columnGap: "22px",
    });
  });
});

test.describe("1024 (no zoom, tablet-landscape rules)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("grids go to two columns", async ({ page }) => {
    await open(page);
    await expectStyles(grid(page, "sectors-dark"), { gridTemplateColumns: "467px 467px" });
    await expectStyles(grid(page, "cards-project-c4"), { gridTemplateColumns: "464px 464px" });
    const project = grid(page, "cards-project-c4").locator("a").first();
    await expectStyles(project.locator(":scope > span").first(), { height: "260px" });
    await expectStyles(project.locator("h3"), { marginTop: "8px" });
    const service = grid(page, "cards-service-dark").locator("a").first();
    await expectStyles(service.locator(":scope > span").first(), { height: "300px" });
    await expectStyles(service.locator("h3"), { marginTop: "20px" });
    await expectStyles(service.locator("p"), { marginTop: "10px" });
  });

  test("gallery: two columns with no orphan (KI-L23)", async ({ page }) => {
    await open(page);
    const gallery = grid(page, "gallery");
    await expectStyles(gallery, { gridTemplateColumns: "467px 467px" });
    await expectStyles(gallery.locator("figure").last(), { width: "952px", height: "320px" });
  });

  test("testimonials: odd last card spans the row (KI-L23)", async ({ page }) => {
    await open(page);
    const quotes = grid(page, "testimonials-dark");
    await expectStyles(quotes, { gridTemplateColumns: "467px 467px" });
    await expectStyles(quotes.locator("figure").first(), { width: "467px", height: "266px" });
    await expectStyles(quotes.locator("li").last(), { width: "952px" });
  });

  test("before / after stacks", async ({ page }) => {
    await open(page);
    const ba = grid(page, "before-after");
    await expectStyles(ba, { rowGap: "56px" });
    const pair = ba.locator(":scope > div").first();
    await expectStyles(pair, { gridTemplateColumns: "952px", rowGap: "28px" });
    await expectStyles(pair.locator("figure").first(), { height: "380px" });
  });

  test("CTA band grows with its content", async ({ page }) => {
    await open(page);
    const works = testId(page, "cta-works");
    // Deviation: 80px bottom padding below 1100px (the original's button touches the edge).
    await expectStyles(works, { paddingTop: "0px", paddingBottom: "80px" });
    await expectStyles(works.locator(":scope > div").last(), {
      height: "525.469px",
      paddingTop: "100px",
    });
    await expectStyles(works.locator("h2"), { fontSize: "58px", marginTop: "140px" });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("single column and 11px minimum text", async ({ page }) => {
    await open(page);
    await expectStyles(grid(page, "sectors-dark"), { gridTemplateColumns: "350px" });
    await expectStyles(grid(page, "sectors-dark").locator("small").first(), {
      fontSize: "11px",
      letterSpacing: "2.2px",
    });
    await expectStyles(grid(page, "cards-project-c4"), { gridTemplateColumns: "350px" });
    await expectStyles(grid(page, "cards-project-c4").locator("a > span").first(), {
      height: "260px",
    });
    await expectStyles(grid(page, "cards-service-light").locator("a > span").first(), {
      height: "300px",
    });
    await expectStyles(grid(page, "testimonials-light"), { gridTemplateColumns: "350px" });
    await expectStyles(grid(page, "testimonials-light").locator("figcaption span span").first(), {
      fontSize: "11px",
      letterSpacing: "1.76px",
    });
  });

  test("gallery and before / after", async ({ page }) => {
    await open(page);
    const gallery = grid(page, "gallery");
    await expectStyles(gallery, { gridTemplateColumns: "350px" });
    // Deviation: figures as tall as their 300px image.
    await expectStyles(gallery.locator("figure").last(), { width: "350px", height: "300px" });
    await expectStyles(gallery.locator("figcaption").first(), { fontSize: "11px" });
    const figure = grid(page, "before-after").locator("figure").first();
    await expectStyles(figure, { height: "300px" });
    await expectStyles(figure.locator("span"), { fontSize: "11px", letterSpacing: "2.2px" });
  });

  test("divisions strip", async ({ page }) => {
    await open(page);
    await expectStyles(testId(page, "divisions-light").locator("a").first(), {
      height: "62px",
      paddingTop: "16px",
      fontSize: "26px",
      lineHeight: "26px",
    });
  });

  test("CTA bands", async ({ page }) => {
    await open(page);
    const works = testId(page, "cta-works");
    await expectStyles(works, { paddingBottom: "80px" });
    await expectStyles(works.locator(":scope > div").last(), { paddingTop: "80px" });
    await expectStyles(works.locator("h2"), {
      marginTop: "30px",
      fontSize: "34px",
      lineHeight: "38.76px",
    });
    await expectStyles(works.locator(":scope > div").last().locator(":scope > div"), {
      position: "static",
      marginTop: "40px",
    });
    await expectStyles(testId(page, "cta-project").locator("h2"), {
      fontSize: "34px",
      lineHeight: "35.7px",
      letterSpacing: "-0.34px",
    });
  });
});
