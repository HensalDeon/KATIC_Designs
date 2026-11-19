import { expect, type Locator, type Page, test } from "@playwright/test";

import { getProjects, projectHref, projectsByCategory } from "@/content/projects";
import { WORKS_PORTFOLIO } from "@/content/works";

/**
 * Works (`/works`, original `#p-works`). Values are the ORIGINAL's rendered output, measured with a
 * probe of `#p-works` at 1440 / 1024 / 768 / 390 (the fit() auto-zoom removed, D4), written as the
 * browser reports them. Deliberate deviations are marked with their KNOWN_ISSUES id.
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

async function open(page: Page, path = "/works") {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** Section roots in page order (`main > section`). */
const SECTIONS = [
  { selector: "[data-hero]", tone: "dark" },
  { selector: "[data-parity=ft1]", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" },
  { selector: "#works-list", tone: "light" },
  { selector: "[data-parity=pp-host]", tone: "dark" },
  { selector: "[data-parity=xp]", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" },
  { selector: "[data-parity=ctasec]", tone: "dark" },
] as const;

const hero = (page: Page) => page.locator("[data-hero]");
const featured = (page: Page) => page.locator("[data-parity=ft1]");
const portfolio = (page: Page) => page.locator("#works-list");
const grid = (page: Page) => page.locator("#works-list-grid");
const cards = (page: Page) => grid(page).locator(":scope > li");
const filter = (page: Page, label: string) =>
  portfolio(page).getByRole("button", { name: label, exact: true });
const count = (page: Page) => page.locator("[data-portfolio-count]");

const PROJECTS = getProjects(WORKS_PORTFOLIO.projects);
const expectedSlugs = (category: (typeof WORKS_PORTFOLIO.filters)[number]["category"]) =>
  projectsByCategory(category, PROJECTS).map((project) => project.slug);

async function visibleSlugs(page: Page) {
  return cards(page).evaluateAll((items) => items.map((item) => item.getAttribute("data-card")));
}

/**
 * Cards fill rows left to right with no empty cell before the last card: every row but the last
 * holds two cards spanning the full grid width; a card alone on the last row starts at the left.
 * Rows are told apart by the slot data the grid renders, positions by geometry.
 */
async function expectNoGaps(page: Page, columns: 1 | 2) {
  const gridBox = await box(grid(page));
  const items = await cards(page).evaluateAll((elements) =>
    elements.map((el) => {
      const rect = el.getBoundingClientRect();
      return { row: Number(el.getAttribute("data-row")), left: rect.left, right: rect.right };
    }),
  );
  expect(items.length).toBeGreaterThan(0);
  const rows = new Map<number, typeof items>();
  for (const item of items) rows.set(item.row, [...(rows.get(item.row) ?? []), item]);
  const rowNumbers = [...rows.keys()];
  expect(rowNumbers).toEqual(rowNumbers.map((_, index) => index));
  for (const [row, members] of rows) {
    const isLast = row === rowNumbers.length - 1;
    if (!isLast) expect(members).toHaveLength(2);
    const first = members[0];
    if (!first) throw new Error("empty row");
    expect(Math.abs(first.left - gridBox.x)).toBeLessThan(1);
    if (members.length === 2 && columns === 2) {
      const second = members[1];
      if (!second) throw new Error("missing card");
      expect(second.left).toBeGreaterThan(first.right);
      expect(Math.abs(second.right - (gridBox.x + gridBox.width))).toBeLessThan(1);
    }
    if (columns === 1) {
      for (const member of members) expect(Math.abs(member.left - gridBox.x)).toBeLessThan(1);
    }
  }
}

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
  // Reduced motion: geometry is read without the filter's reflow animation in flight.
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle(
      "Architecture & Interior Design Projects | Portfolio | Katic Designs",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Residential, commercial, institutional and hospitality projects by Katic Designs across Kerala, South India and Dubai.",
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
    // Rendered backgrounds: the data-fx swaps make the portfolio and capabilities white.
    const backgrounds = await roots.evaluateAll((els) =>
      els.slice(1, 7).map((el) => getComputedStyle(el).backgroundColor),
    );
    expect(backgrounds).toEqual([
      "rgb(255, 255, 255)",
      "rgb(0, 0, 0)",
      "rgb(255, 255, 255)",
      "rgb(0, 0, 0)",
      "rgb(255, 255, 255)",
      "rgb(0, 0, 0)",
    ]);
    // Works has no contact section; the footer comes from the layout.
    await expect(page.locator("[data-contact-section]")).toHaveCount(0);
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
  });

  test("no reveal-on-scroll on Works (home-only in the original, D7)", async ({ page }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page), { height: "900px", paddingTop: "90px", overflow: "hidden" });
    await expectStyles(hero(page).locator(":scope > div").nth(1), {
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.42) 55%, rgba(0, 0, 0, 0.3))",
    });
    const kicker = hero(page).locator("p").first();
    await expectFont(kicker, INTER);
    await expectStyles(kicker, { fontSize: "9.5px", color: "rgb(232, 98, 44)" });
    expect(await box(kicker)).toMatchObject({ x: 72, y: 282 });
    const title = hero(page).locator("h1");
    await expectFont(title, JOST);
    await expectStyles(title, {
      fontSize: "78px",
      fontWeight: "700",
      lineHeight: "74.88px",
      marginTop: "22px",
    });
    expect((await box(title)).height).toBeCloseTo(149.8, 0);
    await expectStyles(title.locator("span"), { color: "rgb(232, 98, 44)" });
    const lead = hero(page).locator("h1 + p");
    await expectStyles(lead, {
      fontSize: "16px",
      lineHeight: "26.4px",
      maxWidth: "600px",
      marginTop: "26px",
      color: "rgb(242, 242, 242)",
    });
    const button = hero(page).getByRole("link", { name: "Explore Projects" });
    await expectStyles(button, {
      height: "46px",
      paddingLeft: "22px",
      fontSize: "12.5px",
      fontWeight: "600",
      backgroundColor: "rgb(247, 244, 239)",
    });
    expect((await box(button)).y).toBeCloseTo(565.5, 0);
    await expect(button).toHaveAttribute("href", "/works#works-list");
  });

  test("hero 'current project' note opens the project page", async ({ page }) => {
    await open(page);
    const current = hero(page).getByRole("link", { name: /Courtyard House/ });
    expect(await box(current)).toMatchObject({ x: 1113, y: 342, width: 255, height: 89 });
    await expect(current).toHaveAttribute("href", "/works/the-courtyard-house");
    await expectStyles(current.locator("b"), { fontSize: "17.5px" });
    await expectStyles(current.locator("span"), {
      fontSize: "10.5px",
      color: "rgb(187, 187, 187)",
    });
  });

  test("featured project (fit() zoom not reproduced, KI-L13)", async ({ page }) => {
    await open(page);
    const section = featured(page);
    // The original zooms this section's content to 0.719; without it, it is 1157px tall.
    expect((await box(section)).height).toBeCloseTo(1157.3, 0);
    const title = section.locator("h2");
    await expectFont(title, JOST);
    await expectStyles(title, { fontSize: "58px", lineHeight: "66.12px", marginTop: "44px" });
    expect(await box(title)).toMatchObject({ x: 72, width: 660 });
    const card = section.getByRole("link", { name: /The Rain Court House/ });
    expect(await box(card)).toMatchObject({ x: 72, width: 820, height: 612 });
    await expect(card).toHaveAttribute("href", "/works/the-courtyard-house");
    await expectStyles(card.locator("h3"), { fontSize: "41px", color: "rgb(255, 255, 255)" });
    await expectStyles(card.locator("em"), { fontSize: "10px", color: "rgb(232, 98, 44)" });
    const heading = section.locator("h4");
    await expectStyles(heading, { fontSize: "27.5px", lineHeight: "34.375px", marginTop: "122px" });
    expect((await box(heading)).x).toBe(940);
    const stats = section.locator("ul li");
    await expect(stats).toHaveCount(3);
    await expectStyles(stats.first().locator("b"), { fontSize: "22px" });
    await expectStyles(stats.first().locator("span"), {
      fontSize: "8.5px",
      letterSpacing: "1.7px",
    });
    await expect(section.getByRole("link", { name: "View Project" })).toHaveAttribute(
      "href",
      "/works/the-courtyard-house",
    );
  });

  test("portfolio header and filter bar", async ({ page }) => {
    await open(page);
    const section = portfolio(page);
    await expectStyles(section, { paddingTop: "120px", backgroundColor: "rgb(255, 255, 255)" });
    await expectStyles(section.locator("p").first(), { color: "rgb(0, 0, 0)", fontSize: "9.5px" });
    await expectStyles(section.locator("h2"), {
      fontSize: "58px",
      lineHeight: "66.12px",
      color: "rgb(0, 0, 0)",
    });
    const text = section.locator("h2").locator("xpath=../following-sibling::p");
    await expectStyles(text, { marginTop: "110px", fontSize: "13.5px", color: "rgb(68, 68, 68)" });
    const bar = section.getByRole("group", { name: "Filter projects by category" });
    await expectStyles(bar, {
      marginTop: "56px",
      paddingBottom: "22px",
      borderBottomColor: "rgba(0, 0, 0, 0.14)",
      columnGap: "9px",
    });
    const buttons = bar.getByRole("button");
    await expect(buttons).toHaveText(WORKS_PORTFOLIO.filters.map((option) => option.label));
    const [all, residential] = [buttons.nth(0), buttons.nth(1)];
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(residential).toHaveAttribute("aria-pressed", "false");
    await expectStyles(all, {
      height: "40px",
      fontSize: "11px",
      fontWeight: "600",
      backgroundColor: "rgb(232, 98, 44)",
      color: "rgb(0, 0, 0)",
    });
    await expectStyles(residential, {
      fontWeight: "500",
      color: "rgb(34, 34, 34)",
      borderTopColor: "rgba(0, 0, 0, 0.22)",
    });
    expect((await box(all)).width).toBeCloseTo(53.8, 0);
    expect((await box(residential)).x).toBeCloseTo(134.8, 0);
    await expect(count(page)).toHaveText("8 projects");
    await expect(count(page)).toHaveAttribute("role", "status");
  });

  test("all projects: the original editorial layout", async ({ page }) => {
    await open(page);
    expect(await visibleSlugs(page)).toEqual(WORKS_PORTFOLIO.projects);
    const gridBox = await box(grid(page));
    const rects = await cards(page).evaluateAll((items) =>
      items.map((item) => {
        const r = item.getBoundingClientRect();
        return [r.left, r.top, r.width, r.height].map((v) => Math.round(v));
      }),
    );
    // Original card rects (x, y from the first row, width, height), docs/analysis/04 §1.
    const top = Math.round(gridBox.y);
    expect(rects.map(([x, y, w, h]) => [x, (y ?? 0) - top, w, h])).toEqual([
      [72, 0, 790, 675],
      [896, 0, 472, 675],
      [72, 885, 472, 535],
      [578, 755, 790, 665],
      [72, 1500, 632, 614],
      [738, 1500, 630, 614],
      [72, 2194, 472, 675],
      [578, 2194, 790, 675],
    ]);
    expect((await box(portfolio(page))).height).toBeCloseTo(3607.4, 0);
  });

  test("project cards: facts from the Project entity, links use projectHref", async ({ page }) => {
    await open(page);
    const links = cards(page).locator(":scope > a");
    await expect(links).toHaveCount(8);
    const hrefs = await links.evaluateAll((items) => items.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual(PROJECTS.map((project) => projectHref(project)));
    const first = cards(page).first();
    await expect(first.locator("h3")).toHaveText("Palm Veil Residence");
    await expectStyles(first.locator("h3"), {
      fontSize: "29px",
      marginTop: "20px",
      color: "rgb(0, 0, 0)",
    });
    const image = first.locator("a > span").first();
    expect(await box(image)).toMatchObject({ width: 790, height: 570 });
    await expectStyles(image.locator(":scope > span").first(), {
      fontSize: "8.5px",
      letterSpacing: "1.7px",
      textTransform: "uppercase",
    });
    await expect(image.locator(":scope > span").first()).toHaveText("Villa");
    const go = image.locator(":scope > span").nth(1);
    expect(await box(go)).toMatchObject({ x: 800, width: 42, height: 42 });
    await expectStyles(go, { backgroundColor: "rgb(232, 98, 44)" });
    const meta = first.locator("p");
    await expect(meta).toHaveText("Thrissur, Kerala/Villa/Architecture");
    await expectStyles(meta, {
      fontSize: "9.5px",
      letterSpacing: "1.52px",
      color: "rgb(68, 68, 68)",
    });
    // Every card's separators are orange, including the two the original typed as " / " (KI-D06).
    const separators = cards(page).locator("p i");
    await expect(separators).toHaveCount(16);
    for (const color of await separators.evaluateAll((items) =>
      items.map((i) => getComputedStyle(i).color),
    )) {
      expect(color).toBe("rgb(232, 98, 44)");
    }
    await expect(cards(page).nth(6).locator("p")).toHaveText(
      "Kottayam, Kerala/Institutional/Architecture",
    );
  });

  test("card photos zoom on hover", async ({ page }) => {
    await open(page);
    const image = cards(page).first().locator("img");
    await image.scrollIntoViewIfNeeded();
    await expectStyles(image, { transitionProperty: "transform, translate, scale, rotate" });
    await cards(page).first().hover();
    await expect(image).toHaveCSS("scale", "1.03");
  });

  test("every filter shows its projects and reflows without gaps (KI-L05)", async ({ page }) => {
    await open(page);
    // "All" is selected on arrival; it is checked last, after the others.
    const [all, ...others] = WORKS_PORTFOLIO.filters;
    for (const option of [...others, all]) {
      await filter(page, option.label).click();
      const expected = expectedSlugs(option.category);
      await expect.poll(() => visibleSlugs(page)).toEqual(expected);
      await expect(filter(page, option.label)).toHaveAttribute("aria-pressed", "true");
      await expect(portfolio(page).locator("[aria-pressed=true]")).toHaveCount(1);
      await expect(count(page)).toHaveText(
        `${String(expected.length)} ${expected.length === 1 ? "project" : "projects"}`,
      );
      await expect(page).toHaveURL(
        option.category === "all"
          ? /\/works#works-list$/
          : new RegExp(`/works\\?category=${option.category}#works-list$`),
      );
      await expectNoGaps(page, 2);
      // The list starts right under the filter bar, whatever the filter (the original kept empty
      // rows and their 60–80px margins).
      const bar = await box(portfolio(page).getByRole("group"));
      expect((await box(cards(page).first())).y - (bar.y + bar.height)).toBeCloseTo(60, 0);
    }
  });

  test("a lone result takes the wide column", async ({ page }) => {
    await open(page);
    await filter(page, "Institutional").click();
    await expect(cards(page)).toHaveCount(1);
    expect(await box(cards(page).first())).toMatchObject({ x: 72, width: 790 });
    expect(await box(cards(page).first().locator("a > span").first())).toMatchObject({
      height: 570,
    });
  });

  test("?category= deep link, back and forward", async ({ page }) => {
    await open(page, "/works?category=commercial#works-list");
    await expect(filter(page, "Commercial")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("commercial"));
    // The deep link lands on the portfolio.
    await expect.poll(async () => Math.round((await box(portfolio(page))).y)).toBe(0);

    await filter(page, "Interiors").click();
    await expect(page).toHaveURL(/\?category=interiors#works-list$/);
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("interiors"));

    await page.goBack();
    await expect(page).toHaveURL(/\?category=commercial#works-list$/);
    await expect(filter(page, "Commercial")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("commercial"));

    await page.goForward();
    await expect(filter(page, "Interiors")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("interiors"));
  });

  test("unknown ?category= values show every project", async ({ page }) => {
    await open(page, "/works?category=castles");
    await page.waitForTimeout(300);
    await expect(filter(page, "All")).toHaveAttribute("aria-pressed", "true");
    expect(await visibleSlugs(page)).toEqual(WORKS_PORTFOLIO.projects);
  });

  test("legacy #works/works-list/<f> links open the filtered portfolio", async ({ page }) => {
    await open(page, "/#works/works-list/hospitality");
    await expect(page).toHaveURL(/\/works\?category=hospitality#works-list$/);
    await expect(filter(page, "Hospitality")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("hospitality"));
  });

  test("sector tiles filter the portfolio in place", async ({ page }) => {
    await open(page);
    const tile = page
      .locator("[data-parity=ks]")
      .first()
      .getByRole("link", { name: /Residential/ });
    await expect(tile).toHaveAttribute("href", "/works?category=residential#works-list");
    await tile.click();
    await expect(page).toHaveURL(/\?category=residential#works-list$/);
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("residential"));
  });

  test("case study: zoomable photo, facts and link", async ({ page }) => {
    await open(page);
    const section = page.locator("[data-parity=pp-host]");
    await expectStyles(section.locator("h2"), { fontSize: "58px", lineHeight: "66.12px" });
    await expect(section.locator("li")).toHaveText([
      "Kakkanad, Kochi",
      "4,850 sq ft",
      "Architecture + Interiors",
      "Completed 2025",
    ]);
    await expect(section.getByRole("link", { name: /View Case Study/ })).toHaveAttribute(
      "href",
      "/works/the-courtyard-house",
    );
    const plant = section.locator("img[aria-hidden]");
    expect(await box(plant)).toMatchObject({ x: 1299, width: 141 });
    await section.getByRole("button").first().click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  });

  test("capabilities: four service cards (fit() zoom not reproduced, KI-L13)", async ({ page }) => {
    await open(page);
    const section = page.locator("[data-parity=xp]");
    expect((await box(section)).height).toBeCloseTo(1032.4, -1);
    await expectStyles(section.locator("h2"), { color: "rgb(0, 0, 0)", lineHeight: "66.12px" });
    const list = section.locator("ul");
    await expectStyles(list, {
      marginTop: "62px",
      gridTemplateColumns: "310.5px 310.5px 310.5px 310.5px",
      columnGap: "18px",
    });
    const links = list.getByRole("link");
    await expect(links).toHaveCount(4);
    expect(await links.evaluateAll((items) => items.map((a) => a.getAttribute("href")))).toEqual([
      "/services/architecture",
      "/services/interior",
      "/services/construction",
      "/services/turnkey",
    ]);
    const card = links.first();
    expect(await box(card.locator(":scope > span").first())).toMatchObject({ height: 258 });
    await expectStyles(card.locator("h3"), {
      fontSize: "21px",
      paddingTop: "16px",
      marginTop: "18px",
      borderTopColor: "rgba(0, 0, 0, 0.18)",
    });
    await expectStyles(card.locator("p"), { fontSize: "12px", lineHeight: "20.4px" });
  });

  test("divisions and the CTA band", async ({ page }) => {
    await open(page);
    const divisions = page.locator("[data-parity=ks]").nth(1);
    await expect(divisions.getByRole("link")).toHaveCount(5);
    const cta = page.locator("[data-parity=ctasec]");
    await expectStyles(cta, { height: "900px" });
    await expectStyles(cta.locator("h2"), { fontSize: "58px", lineHeight: "66.12px" });
    await expect(cta.getByRole("link", { name: /Start Your Project/ })).toHaveAttribute(
      "href",
      "/#start",
    );
    const phone = cta.getByRole("link", { name: "+91 8086 000 600" });
    await expect(phone).toHaveAttribute("href", "tel:+918086000600");
    expect(await box(phone.locator(".."))).toMatchObject({ x: 1098, width: 270 });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("1440 canvas, motion on", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("filtered cards slide to their new place and new ones fade in", async ({ page }) => {
    await open(page, "/works?category=villas");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("villas"));
    await filter(page, "Residential").click();
    const animations = await grid(page).evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>(":scope > li")].map((li) => ({
        slug: li.dataset["card"],
        count: li.getAnimations().length,
      })),
    );
    // Palm Veil stays put, Nila moves (row 1 right → row 2 left), Cinder and House of Three
    // Courts fade in.
    expect(animations).toEqual([
      { slug: "palm-veil-residence", count: 0 },
      { slug: "cinder-house", count: 1 },
      { slug: "nila-apartments", count: 1 },
      { slug: "house-of-three-courts", count: 1 },
    ]);
    const nila = await grid(page).evaluate((el) => {
      const [animation] = el.querySelector("[data-card=nila-apartments]")?.getAnimations() ?? [];
      const effect = animation?.effect;
      return effect instanceof KeyframeEffect ? effect.getKeyframes()[0]?.["transform"] : null;
    });
    // From its old place (row 1 right, x 824 in the grid) to row 2 left (x 0, bottom-aligned at
    // y 885), back to none.
    expect(nila).toBe("translate(824px, -885px)");
  });

  test("the CTA photo drifts with scroll (E25)", async ({ page }) => {
    await open(page);
    const photo = page.locator("[data-parity=ctasec] img");
    const top = await page
      .locator("[data-parity=ctasec]")
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    const transformAt = async (y: number) => {
      await page.evaluate((offset) => window.scrollTo({ top: offset, behavior: "instant" }), y);
      await page.waitForTimeout(150);
      return photo.evaluate((img) => getComputedStyle(img).transform);
    };
    const ty = (matrix: string) => Number(matrix.split(",")[5]?.replace(")", ""));
    // Section top at mid-viewport: c = 0.25, translateY(−6%) of 900px, scale 1.3 (original: −54.02).
    expect(ty(await transformAt(top - 450))).toBeCloseTo(-54, 0);
    expect(ty(await transformAt(top + 450))).toBeGreaterThan(0);
  });
});

test.describe("1440 canvas, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("filtering does not animate", async ({ page }) => {
    await open(page);
    await filter(page, "Commercial").click();
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("commercial"));
    const running = await grid(page).evaluate(
      (el) => [...el.querySelectorAll("li")].flatMap((li) => li.getAnimations()).length,
    );
    expect(running).toBe(0);
  });
});

test.describe("1024 (below the canvas)", () => {
  test.use({ viewport: { width: 1024, height: 768 }, reducedMotion: "reduce" });

  test("titles scale (KI-N04, KI-L16) and the current-project note hides", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page).locator("h1"), { fontSize: "62px" });
    await expect(hero(page).getByRole("link", { name: /Courtyard House/ })).toBeHidden();
    for (const selector of ["[data-parity=ft1] h2", "#works-list h2", "[data-parity=xp] h2"]) {
      await expectStyles(page.locator(selector), { fontSize: "46px", lineHeight: "52.44px" });
    }
  });

  test("the portfolio keeps two columns (KI-L28) and reflows without gaps", async ({ page }) => {
    await open(page);
    await expectStyles(grid(page), { gridTemplateColumns: "458px 458px", columnGap: "36px" });
    await expectNoGaps(page, 2);
    expect(await box(cards(page).first().locator("a > span").first())).toMatchObject({
      height: 400,
    });
    for (const label of ["Commercial", "Institutional", "Villas / Flats"]) {
      await filter(page, label).click();
      await expect(count(page)).toHaveText(/project/);
      await expectNoGaps(page, 2);
    }
    // A card alone on the last row spans the full width.
    await filter(page, "Interiors").click();
    await expect(cards(page)).toHaveCount(3);
    expect((await box(cards(page).last())).width).toBe(952);
  });

  test("capabilities in two columns", async ({ page }) => {
    await open(page);
    await expectStyles(page.locator("[data-parity=xp] ul"), {
      gridTemplateColumns: "467px 467px",
      rowGap: "28px",
    });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("768 (tablet)", () => {
  test.use({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });

  test("one-column portfolio, wrapping filters, no overflow", async ({ page }) => {
    await open(page);
    await expectStyles(portfolio(page).getByRole("group"), { flexWrap: "wrap" });
    await expectNoGaps(page, 1);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("390 (phone)", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });

  test("hero sits at the bottom with a full-width button", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page), { display: "flex", justifyContent: "flow-end" });
    const button = hero(page).getByRole("link", { name: "Explore Projects" });
    expect(await box(button)).toMatchObject({ x: 20, width: 350, height: 50 });
    await expectStyles(hero(page).locator("h1"), { fontSize: "37.44px" });
  });

  test("portfolio: one column, the original's 36/80px rhythm, 11px meta (KI-A10)", async ({
    page,
  }) => {
    await open(page);
    await expectNoGaps(page, 1);
    const rects = await cards(page).evaluateAll((items) =>
      items.map((item) => item.getBoundingClientRect()),
    );
    const gaps = rects
      .slice(1)
      .map((rect, index) => Math.round(rect.top - (rects[index]?.bottom ?? 0)));
    expect(gaps).toEqual([36, 80, 36, 80, 36, 80, 36]);
    const first = cards(page).first();
    expect(await box(first.locator("a > span").first())).toMatchObject({ width: 350, height: 320 });
    expect((await box(first.locator("img"))).height).toBe(300);
    await expectStyles(first.locator("p"), { fontSize: "11px" });
    await expectStyles(first.locator("a > span > span").first(), { fontSize: "11px" });
    // Filtered lists keep the rhythm and start at the top.
    await filter(page, "Architecture").click();
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("architecture"));
    await expectNoGaps(page, 1);
  });

  test("small featured labels are 11px (KI-A10)", async ({ page }) => {
    await open(page);
    const section = featured(page);
    await expectStyles(section.locator("ul li span").first(), { fontSize: "11px" });
    await expectStyles(section.locator("em"), { fontSize: "11px" });
    await expectStyles(section.locator("h2"), { fontSize: "34px", lineHeight: "38.76px" });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});
