import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Pins the Phase 3 section components (hero, split, rows, feature grid, process steps) to the
 * computed styles measured on the ORIGINAL site (reference/probes/sections.json, read with
 * `python3 reference/probes/summarize-sections.py hero,split,rows,feat,steps`; the architecture
 * hero was probed separately). Values are written as the browser reports them (px, rgb()).
 * Rendered on /styleguide/sections-a. Deliberate deviations are marked with their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before") {
  const keys = Object.keys(expected);
  const actual = await locator.evaluate(
    (el, { props, pseudoElt }) => {
      const style = getComputedStyle(el, pseudoElt ?? null);
      return props.map((prop) => style.getPropertyValue(prop));
    },
    { props: keys.map(kebab), pseudoElt: pseudo },
  );
  expect(Object.fromEntries(keys.map((key, i) => [key, actual[i]]))).toEqual(expected);
}

const JOST = /^(__Jost|Jost)/;
const INTER = /^(__Inter|Inter)/;

async function expectFont(locator: Locator, family: RegExp) {
  expect(await locator.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(family);
}

/** Box of `locator` relative to `origin` (both in CSS px of the 1440 canvas at zoom 1). */
async function offset(locator: Locator, origin: Locator) {
  const [a, b] = await Promise.all([locator.boundingBox(), origin.boundingBox()]);
  if (!a || !b) throw new Error("element not rendered");
  return { x: a.x - b.x, y: a.y - b.y, width: a.width, height: a.height };
}

async function open(page: Page) {
  await page.goto("/styleguide/sections-a");
  await page.evaluate(() => document.fonts.ready);
}

const hero = (page: Page, id: string) => {
  const root = page.getByTestId(id);
  return {
    root,
    shade: root.locator(":scope > div").nth(1),
    container: root.locator(":scope > div").nth(2),
    kicker: root.locator("p").first(),
    title: root.locator("h1"),
    lead: root.locator("h1 + p"),
    buttons: root.locator("a, button"),
  };
};

const DARK_LINE = "rgba(255, 255, 255, 0.18)";

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("service hero (.hero.kh-hero)", async ({ page }) => {
    await open(page);
    const h = hero(page, "hero-service");
    await expect(h.root).toHaveAttribute("data-hero");
    await expectStyles(h.root, {
      height: "900px",
      paddingTop: "90px",
      backgroundColor: "rgb(17, 17, 17)",
      overflow: "hidden",
    });
    await expectStyles(h.shade, {
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.74), rgba(0, 0, 0, 0.42) 55%, rgba(0, 0, 0, 0.25))",
    });
    await expectStyles(h.container, { width: "1268px", paddingTop: "190px", zIndex: "2" });
    await expectStyles(h.root.locator("img"), {
      width: "1440px",
      height: "900px",
      objectFit: "cover",
    });

    await expectFont(h.kicker, INTER);
    await expectStyles(h.kicker, {
      fontSize: "9.5px",
      letterSpacing: "1.9px",
      color: "rgb(232, 98, 44)",
      columnGap: "12px",
    });
    await expectFont(h.title, JOST);
    await expectStyles(h.title, {
      marginTop: "22px",
      fontSize: "74px",
      fontWeight: "700",
      lineHeight: "74px",
      letterSpacing: "-0.37px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(h.lead, {
      marginTop: "24px",
      maxWidth: "640px",
      fontSize: "17px",
      lineHeight: "28.9px",
      color: "rgb(238, 238, 238)",
    });
    await expectStyles(h.buttons.first().locator(".."), {
      display: "flex",
      marginTop: "26px",
      columnGap: "16px",
    });
    await expectStyles(h.buttons.nth(0), {
      height: "54px",
      paddingLeft: "26px",
      fontSize: "12.5px",
      fontWeight: "600",
      columnGap: "22px",
      backgroundColor: "rgb(247, 244, 239)",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(h.buttons.nth(1), {
      height: "54px",
      borderTopColor: "rgba(255, 255, 255, 0.4)",
      color: "rgb(255, 255, 255)",
    });
    // Vertical rhythm: kicker at 90 + 190, buttons under a two-line title and two-line lead.
    expect((await offset(h.kicker, h.root)).y).toBe(280);
    expect((await offset(h.buttons.first(), h.root)).y).toBeCloseTo(568.8, 0);
  });

  test("primary hero CTA opens Start-a-Project with the page's service", async ({ page }) => {
    await open(page);
    await hero(page, "hero-service").buttons.first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Service needed")).toHaveValue("Interior Design");
  });

  test("architecture hero variant", async ({ page }) => {
    await open(page);
    const h = hero(page, "hero-architecture");
    await expectStyles(h.shade, {
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0.3) 55%, rgba(0, 0, 0, 0.15))",
    });
    await expectStyles(h.title, {
      marginTop: "20px",
      fontSize: "76px",
      lineHeight: "75.24px",
      letterSpacing: "-0.38px",
    });
    await expectStyles(h.lead, {
      marginTop: "26px",
      maxWidth: "660px",
      color: "rgb(242, 242, 242)",
    });
    await expect(h.buttons).toHaveCount(1);
    await expectStyles(h.buttons.first(), { height: "54px", paddingLeft: "24px" });
    expect((await offset(h.buttons.first(), h.root)).y).toBeCloseTo(640.5, 0);

    const caption = h.root.getByText("Private residence · Kochi");
    await expectFont(caption, INTER);
    await expectStyles(caption, {
      fontSize: "10px",
      letterSpacing: "2.4px",
      color: "rgb(204, 204, 204)",
      textTransform: "uppercase",
    });
    const box = await offset(caption, h.root);
    expect(box.x).toBe(86);
    expect(box.y + box.height).toBe(900 - 34);
  });

  test("split feature (.ksplit) light, reverse and dark", async ({ page }) => {
    await open(page);
    const split = page.getByTestId("split-light");
    await expectStyles(split, {
      display: "grid",
      gridTemplateColumns: "602px 602px",
      columnGap: "64px",
      alignItems: "center",
    });
    const im = split.locator(":scope > div").first();
    await expectStyles(im, { width: "602px", height: "560px", overflow: "hidden" });
    await expectStyles(im.locator("img"), { width: "602px", height: "560px", objectFit: "cover" });

    const cap = im.getByText("Dining room · teak joinery");
    await expectStyles(cap, {
      paddingTop: "9px",
      paddingLeft: "12px",
      fontSize: "9px",
      fontWeight: "600",
      letterSpacing: "1.8px",
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgba(10, 10, 10, 0.85)",
    });
    const capBox = await offset(cap, im);
    expect(capBox).toMatchObject({ x: 20, y: 511, height: 29 });

    const tx = split.locator(":scope > div").nth(1);
    await expectStyles(tx.locator("h2"), { marginTop: "22px", fontSize: "58px" });
    await expectFont(tx.locator("h2 + p"), INTER);
    await expectStyles(tx.locator("h2 + p"), {
      marginTop: "28px",
      fontSize: "18px",
      lineHeight: "29.7px",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(tx.locator("h2 + p + p"), {
      marginTop: "18px",
      fontSize: "14px",
      lineHeight: "26.6px",
      color: "rgb(85, 85, 85)",
    });
    await expectStyles(tx.locator("ul"), {
      marginTop: "24px",
      gridTemplateColumns: "289px 289px",
      rowGap: "12px",
      columnGap: "24px",
    });
    const li = tx.locator("li").first();
    await expectStyles(li, {
      height: "29px",
      paddingBottom: "12px",
      fontSize: "13.5px",
      columnGap: "12px",
      borderBottomWidth: "1px",
      borderBottomColor: "rgb(227, 223, 215)",
    });
    await expectStyles(
      li,
      { width: "6px", height: "6px", backgroundColor: "rgb(232, 98, 44)" },
      "::before",
    );

    const reverse = page.getByTestId("split-reverse");
    await expectStyles(reverse.locator(":scope > div").first(), { order: "2" });
    await expectStyles(reverse.getByRole("link", { name: "Visit the Factory" }), {
      marginTop: "30px",
      height: "52px",
      paddingLeft: "24px",
      borderTopColor: "rgb(207, 203, 195)",
      backgroundColor: "rgb(255, 255, 255)",
    });

    const dark = page.getByTestId("split-dark");
    await expectStyles(dark.locator("h2 + p"), { color: "rgb(255, 255, 255)" });
    await expectStyles(dark.locator("h2 + p + p"), { color: "rgb(170, 170, 170)" });
    await expectStyles(dark.locator("li").first(), { borderBottomColor: "rgb(38, 38, 38)" });
  });

  test("split image opens the lightbox", async ({ page }) => {
    await open(page);
    await page.getByTestId("split-light").getByRole("button").click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("row list (.krows) dark and light", async ({ page }) => {
    await open(page);
    const dark = page.getByTestId("rows-dark");
    const row = dark.locator(":scope > *").first();
    await expectStyles(row, {
      display: "grid",
      gridTemplateColumns: "64px 300px 880px 24px",
      alignItems: "center",
      height: "84px",
      minHeight: "84px",
      paddingTop: "14px",
      paddingBottom: "14px",
      borderTopWidth: "1px",
      borderTopColor: DARK_LINE,
    });
    await expectStyles(dark.locator(":scope > *").last(), {
      borderBottomWidth: "1px",
      borderBottomColor: DARK_LINE,
    });
    const [icon, title, text, marker] = [0, 1, 2, 3].map((i) => row.locator(":scope > *").nth(i));
    if (!icon || !title || !text || !marker) throw new Error("row cells missing");
    await expectStyles(icon, { width: "64px", height: "20px", color: "rgb(170, 170, 170)" });
    await expectFont(title, INTER);
    await expectStyles(title, {
      width: "300px",
      height: "26px",
      fontSize: "22px",
      fontWeight: "400",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(text, {
      fontSize: "13.5px",
      lineHeight: "22.95px",
      color: "rgb(170, 170, 170)",
    });
    await expectStyles(marker, { width: "24px", height: "0px", color: "rgb(232, 98, 44)" });

    // Interior: only "Furniture & joinery" links (to the factory page).
    const link = dark.getByRole("link");
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", "/services/factory");

    const light = page.getByTestId("rows-light");
    const lightRow = light.getByRole("link").first();
    await expectStyles(lightRow, {
      gridTemplateColumns: "64px 300px 880px 24px",
      borderTopColor: "rgb(225, 221, 213)",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(lightRow.locator(":scope > *").first(), { color: "rgb(232, 98, 44)" });
    await expectStyles(lightRow.locator(":scope > *").nth(2), { color: "rgb(85, 85, 85)" });
    await expectStyles(lightRow.locator("i"), { height: "23px", color: "rgb(232, 98, 44)" });
    await lightRow.hover();
    await expect(lightRow.locator("b")).toHaveCSS("color", "rgb(232, 98, 44)");
  });

  test("feature grid (.kfeat) 4 and 3 columns, both tones", async ({ page }) => {
    await open(page);
    const grid = page.getByTestId("feat-4");
    await expectStyles(grid, {
      gridTemplateColumns: "306.5px 306.5px 306.5px 306.5px",
      rowGap: "14px",
      columnGap: "14px",
    });
    const card = grid.locator("[data-feature]").first();
    await expectStyles(card, {
      height: "334.094px",
      paddingTop: "22px",
      paddingRight: "24px",
      paddingBottom: "24px",
      paddingLeft: "24px",
      borderTopWidth: "1px",
      borderTopColor: "rgb(38, 38, 38)",
      backgroundColor: "rgb(12, 12, 12)",
      overflow: "hidden",
    });
    const slot = card.locator("[data-art-slot]");
    await expectStyles(slot, {
      width: "276.5px",
      height: "150px",
      marginTop: "-8px",
      marginBottom: "14px",
      backgroundImage:
        "radial-gradient(55% 70% at 50% 70%, rgba(150, 58, 22, 0.38), rgba(0, 0, 0, 0) 72%)",
    });
    await expectStyles(card.locator("svg").first(), {
      width: "28px",
      height: "28px",
      color: "rgb(232, 98, 44)",
    });
    await expectFont(card.locator("h3"), INTER);
    await expectStyles(card.locator("h3"), {
      marginTop: "10px",
      fontSize: "22px",
      fontWeight: "400",
      lineHeight: "28.6px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(card.locator("p"), {
      marginTop: "12px",
      fontSize: "13px",
      lineHeight: "22.75px",
      color: "rgb(170, 170, 170)",
    });
    expect((await offset(card.locator("h3"), card)).y).toBe(1 + 22 - 8 + 150 + 14 + 34 + 10);
    await card.hover();
    await expect(card).toHaveCSS("border-top-color", "rgb(232, 98, 44)");
    await expect(slot).toHaveCSS(
      "background-image",
      "radial-gradient(60% 76% at 50% 70%, rgba(200, 76, 28, 0.62), rgba(0, 0, 0, 0) 74%)",
    );

    const light = page.getByTestId("feat-light");
    const columns = await light.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    for (const width of columns.split(" ")) expect(parseFloat(width)).toBeCloseTo(413.33, 1);
    const lightCard = light.locator("[data-feature]").first();
    await expectStyles(lightCard, {
      borderTopColor: "rgb(227, 223, 215)",
      backgroundColor: "rgb(255, 255, 255)",
    });
    await expectStyles(lightCard.locator("[data-art-slot]"), {
      height: "150px",
      backgroundImage:
        "radial-gradient(62% 72% at 50% 72%, rgba(232, 98, 44, 0.08), rgba(255, 255, 255, 0) 72%)",
    });
    await expectStyles(lightCard.locator("h3"), { color: "rgb(17, 17, 17)" });
    await expectStyles(lightCard.locator("p"), { color: "rgb(85, 85, 85)" });
  });

  test("process steps (.ksteps.k3d) 5 and 8 columns, both tones", async ({ page }) => {
    await open(page);
    const five = page.getByTestId("steps-5");
    await expectStyles(five, {
      display: "grid",
      gridTemplateColumns: "231.188px 231.203px 231.203px 231.203px 231.188px",
      columnGap: "28px",
    });
    const step = five.locator("[data-step]").first();
    await expectStyles(step.locator("[data-art-slot]"), {
      height: "170px",
      marginBottom: "20px",
      overflow: "hidden",
      backgroundImage:
        "radial-gradient(62% 72% at 50% 72%, rgba(150, 58, 22, 0.42), rgba(0, 0, 0, 0) 72%)",
    });
    await expectStyles(step.locator("svg").first(), {
      width: "28px",
      height: "28px",
      color: "rgb(232, 98, 44)",
    });
    await expectFont(step.locator("h3"), JOST);
    await expectStyles(step.locator("h3"), {
      marginTop: "10px",
      fontSize: "30px",
      fontWeight: "500",
      lineHeight: "31.5px",
      letterSpacing: "0.15px",
      textTransform: "uppercase",
      color: "rgb(255, 255, 255)",
    });
    await expectFont(step.locator("p"), JOST);
    await expectStyles(step.locator("p"), {
      marginTop: "10px",
      fontSize: "14px",
      lineHeight: "23.8px",
      color: "rgb(170, 170, 170)",
    });
    expect((await offset(step.locator("h3"), step)).y).toBe(170 + 20 + 34 + 10);
    await step.hover();
    await expect(step.locator("[data-art-slot]")).toHaveCSS(
      "background-image",
      "radial-gradient(66% 78% at 50% 72%, rgba(190, 72, 26, 0.6), rgba(0, 0, 0, 0) 74%)",
    );

    const eight = page.getByTestId("steps-8");
    const columns = await eight.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(columns.split(" ")).toHaveLength(8);
    const dense = eight.locator("[data-step]").first();
    await expectStyles(dense.locator("[data-art-slot]"), { height: "120px" });
    await expectStyles(dense.locator("h3"), {
      fontSize: "22px",
      lineHeight: "23.1px",
      letterSpacing: "0.11px",
    });
    await expectStyles(page.getByTestId("steps-6").locator("h3").first(), { fontSize: "22px" });

    const light = page.getByTestId("steps-light").locator("[data-step]").first();
    await expectStyles(light.locator("[data-art-slot]"), {
      backgroundImage:
        "radial-gradient(62% 72% at 50% 72%, rgba(232, 98, 44, 0.1), rgba(255, 255, 255, 0) 72%)",
    });
    await expectStyles(light.locator("h3"), { color: "rgb(17, 17, 17)" });
    await expectStyles(light.locator("p"), { color: "rgb(102, 102, 102)" });
  });
});

test.describe("1024 (no zoom, tablet-landscape rules)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("hero is one screen tall without the canvas offset", async ({ page }) => {
    await open(page);
    const h = hero(page, "hero-service");
    await expectStyles(h.root, { height: "768px", minHeight: "768px", paddingTop: "0px" });
    await expectStyles(h.container, { width: "952px", paddingTop: "190px" });
    // The original keeps 74px here; every hero scales to 62px below 1100px (KI-L16).
    await expectStyles(h.title, { fontSize: "62px" });
    const arch = hero(page, "hero-architecture");
    const caption = await offset(arch.root.getByText("Private residence · Kochi"), arch.root);
    expect(caption.x).toBe(36);
    expect(caption.y + caption.height).toBe(768 - 34);
  });

  test("sections collapse to one or two columns", async ({ page }) => {
    await open(page);
    const split = page.getByTestId("split-reverse");
    await expectStyles(split, { gridTemplateColumns: "952px", rowGap: "28px" });
    await expectStyles(split.locator(":scope > div").first(), {
      order: "0",
      width: "952px",
      height: "560px",
    });
    await expectStyles(split.locator("ul"), { gridTemplateColumns: "464px 464px" });

    const row = page.getByTestId("rows-dark").locator(":scope > *").first();
    await expectStyles(row, { gridTemplateColumns: "44px 888px 20px" });
    await expectStyles(row.locator(":scope > span").nth(1), { gridColumn: "2" });

    const feat = page.getByTestId("feat-dark");
    await expectStyles(feat, { gridTemplateColumns: "467px 467px", columnGap: "18px" });
    const card = feat.locator("[data-feature]").first();
    await expectStyles(card, {
      paddingTop: "30px",
      paddingRight: "28px",
      paddingBottom: "32px",
      paddingLeft: "28px",
    });
    await expectStyles(card.locator("[data-art-slot]"), { width: "429px", height: "150px" });
    await expectStyles(card.locator("h3"), { marginTop: "16px" });

    const steps = page.getByTestId("steps-8");
    await expectStyles(steps, {
      gridTemplateColumns: "462px 462px",
      rowGap: "28px",
      columnGap: "28px",
    });
    await expectStyles(steps.locator("[data-art-slot]").first(), {
      width: "462px",
      height: "120px",
    });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero is bottom-aligned with stacked full-width buttons", async ({ page }) => {
    await open(page);
    const h = hero(page, "hero-service");
    await expectStyles(h.root, {
      display: "flex",
      justifyContent: "flow-end", // `justify-end`; the original reports the same value
      height: "844px",
      paddingBottom: "40px",
    });
    // The original's `linear-gradient(0deg, .82 0%, .5 45%, .28 100%)`, which the CSS minifier
    // rewrites as the identical top-to-bottom gradient.
    await expectStyles(h.shade, {
      backgroundImage:
        "linear-gradient(rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.5) 55%, rgba(0, 0, 0, 0.82) 100%)",
    });
    await expectStyles(h.container, { paddingTop: "110px" });
    await expectStyles(h.kicker, {
      width: "350px",
      fontSize: "11px",
      letterSpacing: "1.98px",
      columnGap: "10px",
    });
    await expectStyles(h.title, {
      marginTop: "14px",
      fontSize: "37.44px",
      lineHeight: "39.312px",
    });
    await expectStyles(h.lead, { marginTop: "16px", fontSize: "15px", lineHeight: "24px" });
    await expectStyles(h.buttons.first().locator(".."), {
      flexDirection: "column",
      rowGap: "10px",
      marginTop: "24px",
    });
    for (const button of await h.buttons.all()) {
      await expectStyles(button, {
        width: "350px",
        height: "50px",
        paddingLeft: "20px",
        fontSize: "12px",
        justifyContent: "space-between",
      });
    }
    // Content ends 40px above the bottom of the screen.
    const last = await offset(h.buttons.last(), h.root);
    expect(last.y + last.height).toBe(844 - 40);
    await expect(
      hero(page, "hero-architecture").root.getByText("Private residence · Kochi"),
    ).toBeHidden();
  });

  test("single-column sections", async ({ page }) => {
    await open(page);
    const split = page.getByTestId("split-light");
    await expectStyles(split, { gridTemplateColumns: "350px" });
    await expectStyles(split.locator(":scope > div").first(), { height: "320px" });
    await expectStyles(split.locator("ul"), { gridTemplateColumns: "350px" });
    await expectStyles(split.locator("h2 + p"), { fontSize: "15px", lineHeight: "24.75px" });

    await expectStyles(page.getByTestId("rows-dark").locator(":scope > *").first(), {
      gridTemplateColumns: "44px 286px 20px",
    });
    await expectStyles(page.getByTestId("feat-light"), { gridTemplateColumns: "350px" });
    await expectStyles(page.getByTestId("feat-light").locator("[data-art-slot]").first(), {
      width: "312px",
      height: "150px",
    });
    await expectStyles(page.getByTestId("steps-5"), { gridTemplateColumns: "350px" });
  });
});
