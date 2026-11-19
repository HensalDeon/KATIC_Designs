import { expect, type Locator, type Page, test } from "@playwright/test";

import { getProjects, projectHref } from "@/content/projects";
import { REVIEWS_CLIENTS, REVIEWS_PROJECTS } from "@/content/reviews";
import { testimonials } from "@/content/testimonials";

/**
 * Reviews (`/reviews`, original `#p-reviews`, docs/analysis/04 §9). Expected values are the
 * ORIGINAL's rendered output, probed at 1440 / 1024 / 768 / 390 with its fit() auto-zoom removed
 * (D4); deliberate deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const PATH = "/reviews";
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const ORANGE = "rgb(232, 98, 44)";
const SMALL_ORANGE = "rgb(194, 78, 30)";

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

async function open(page: Page) {
  await page.goto(PATH);
  await page.evaluate(() => document.fonts.ready);
}

/** Rect relative to the section's top-left on the 1440 canvas (zoom is 1 at 1440). */
async function box(locator: Locator, root: Locator) {
  const [el, parent] = await Promise.all([locator.boundingBox(), root.boundingBox()]);
  if (!el || !parent) throw new Error("not rendered");
  const round = (v: number) => Math.round(v * 10) / 10;
  return { x: round(el.x), y: round(el.y - parent.y), w: round(el.width), h: round(el.height) };
}

const section = (page: Page, key: string) =>
  page.locator(key === "hero" ? "[data-hero]" : `main [data-parity="${key}"]`);

async function expectNoHorizontalOverflow(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

const QUOTES = testimonials(REVIEWS_CLIENTS.testimonials);
const PROJECTS = getProjects(REVIEWS_PROJECTS.projects);

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle("Client Reviews & Testimonials | Katic Designs");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "What homeowners and businesses say about working with Katic Designs on design and build projects.",
    );
    await expect(page.locator("h1")).toHaveCount(1);
    // "Reviews" is the active main-menu item, as in the original's ACTIVE map.
    await expect(page.locator('header a[aria-current="page"]').first()).toHaveText("Reviews");
  });

  test("sections keep the original order, tones and heights; no reveals (D7)", async ({ page }) => {
    await open(page);
    const sections = await page.locator("main > section").evaluateAll((all) =>
      all.map((el) => ({
        key: el.hasAttribute("data-hero") ? "hero" : (el.getAttribute("data-parity") ?? ""),
        tone: el.getAttribute("data-tone"),
        background: getComputedStyle(el).backgroundColor,
        height: Math.round(el.getBoundingClientRect().height * 10) / 10,
        id: el.id,
      })),
    );
    expect(sections.map(({ key, tone }) => [key, tone])).toEqual([
      ["hero", "dark"],
      ["tr", "light"],
      ["cl", "dark"],
      ["xp", "light"],
      ["pp-host", "dark"],
      ["sp", "light"],
      ["ctasec", "dark"],
    ]);
    // The original's sections have no ids, so none are invented (P5-01).
    expect(sections.every(({ id }) => id === "")).toBe(true);
    expect(sections.slice(1, 6).map(({ background }) => background)).toEqual([
      WHITE,
      BLACK,
      WHITE,
      BLACK,
      WHITE,
    ]);
    // No auto-zoom (KI-L13): the long sections grow instead of shrinking their content.
    expect(sections.map(({ height }) => height)).toEqual([
      900, 900, 1157.7, 900, 1229.4, 1168, 900,
    ]);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
  });

  test("heading levels never skip (h1 → h2 → h3)", async ({ page }) => {
    await open(page);
    const levels = await page
      .locator("main :is(h1, h2, h3, h4, h5, h6)")
      .evaluateAll((all) => all.map((el) => Number(el.tagName[1])));
    expect(levels[0]).toBe(1);
    for (const [index, level] of levels.entries()) {
      if (index > 0) expect(level - (levels[index - 1] ?? 1), `heading ${index}`).toBeLessThan(2);
    }
    // Four discipline cards, three story rows, six projects.
    expect(levels.filter((level) => level === 3)).toHaveLength(13);
  });

  test("hero", async ({ page }) => {
    await open(page);
    const hero = section(page, "hero");
    await expectStyles(hero, { height: "900px", paddingTop: "90px" });
    await expectStyles(hero.locator(":scope > div").nth(1), {
      backgroundImage:
        "linear-gradient(90deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.35))",
    });
    const kicker = hero.locator("p").first();
    await expect(kicker).toHaveText("Client experiences");
    await expectStyles(kicker, { fontSize: "9.5px", letterSpacing: "1.9px", color: ORANGE });
    expect((await box(kicker, hero)).y).toBe(262);
    const title = hero.locator("h1");
    await expect(title).toHaveText("Spaces That Speakfor Themselves.");
    await expectStyles(title, { fontSize: "76px", lineHeight: "76px", fontWeight: "700" });
    await expectStyles(title.locator("span"), { color: ORANGE });
    expect(await box(title, hero)).toMatchObject({ y: 295, h: 152 });
    await expectStyles(hero.locator("h1 + p"), {
      fontSize: "17px",
      lineHeight: "28.9px",
      color: "rgb(238, 238, 238)",
      maxWidth: "640px",
    });
    const cta = hero.getByRole("link", { name: "Start Your Project" });
    // Reviews has no form of its own: the original's `data-go="contact"` lands on Home's.
    await expect(cta).toHaveAttribute("href", "/#start");
    expect(await box(cta, hero)).toEqual({ x: 86, y: 544.8, w: 187.3, h: 52 });
    await expectStyles(cta, { backgroundColor: "rgb(247, 244, 239)", fontWeight: "600" });
  });

  test("trust: copy, the photo at the top right and its caption box", async ({ page }) => {
    await open(page);
    const tr = section(page, "tr");
    await expectStyles(tr.locator("p").first(), { color: SMALL_ORANGE });
    const title = tr.locator("h2");
    await expectStyles(title, { fontSize: "58px", lineHeight: "66.12px" });
    expect(await box(title, tr)).toEqual({ x: 86, y: 269, w: 1268, h: 198.3 });
    await expectStyles(tr.locator("h2 + p"), {
      fontSize: "14.5px",
      lineHeight: "27.55px",
      color: "rgb(94, 91, 85)",
      maxWidth: "520px",
    });
    const about = tr.getByRole("link", { name: "About Katic" });
    await expect(about).toHaveAttribute("href", "/about");
    expect(await box(about, tr)).toEqual({ x: 86, y: 618, w: 140.6, h: 46 });
    const photo = tr.getByRole("button", {
      name: "Enlarge image: Open timber pavilion lounge at night",
    });
    expect(await box(photo, tr)).toEqual({ x: 676, y: 236, w: 678, h: 571 });
    const label = tr.getByText("SPACES MADE PERSONAL");
    await expectStyles(label, { fontSize: "9px", color: ORANGE });
    expect(await box(label, tr)).toMatchObject({ x: 1098, y: 706.8 });
    expect(await box(tr.getByText("A warm, lived-in interior"), tr)).toMatchObject({
      x: 1098,
      y: 729.8,
      h: 35.2,
    });
  });

  test("trust photo opens the lightbox with the keyboard", async ({ page }) => {
    await open(page);
    const photo = section(page, "tr").getByRole("button", { name: /^Enlarge image:/ });
    await photo.focus();
    await page.keyboard.press("Enter");
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expect(photo).toBeFocused();
  });

  test("testimonials: six cards from the shared pool, decorative marks hidden (KI-A16)", async ({
    page,
  }) => {
    await open(page);
    const cl = section(page, "cl");
    // KI-A11: brand orange on black (the original prints the light-section orange).
    await expectStyles(cl.locator("p").first(), { color: ORANGE });
    await expect(cl.locator("p").first()).toHaveText(
      "Representative client experiences • copy pending approval",
    );
    await expectStyles(cl.locator("h2"), { fontSize: "58px", lineHeight: "66.12px" });
    await expectStyles(cl.locator(":scope > div > div").first(), {
      gridTemplateColumns: "646px 622px",
    });
    const cards = cl.getByRole("listitem");
    await expect(cards.locator("blockquote")).toHaveText(QUOTES.map(({ quote }) => quote));
    await expect(cards.locator("b")).toHaveText(QUOTES.map(({ name }) => name));
    await expect(cards.locator("figcaption span span")).toHaveText(QUOTES.map(({ meta }) => meta));
    await expectStyles(cl.locator("ul"), {
      gridTemplateColumns: "410.656px 410.672px 410.656px",
      rowGap: "18px",
    });
    const card = cards.first().locator("figure");
    await expectStyles(card, {
      backgroundColor: "rgb(17, 17, 17)",
      borderTopColor: "rgb(42, 42, 42)",
      padding: "26px 30px 22px",
    });
    expect(await box(card, cl)).toEqual({ x: 86, y: 343.2, w: 410.7, h: 290.3 });
    const mark = card.locator("span").first();
    await expect(mark).toHaveAttribute("aria-hidden", "true");
    await expectStyles(mark, { fontSize: "24px", color: ORANGE, fontStyle: "italic" });
    await expectStyles(card.locator("blockquote"), { fontSize: "18.5px", lineHeight: "26.825px" });
    expect(await box(card.locator("blockquote"), cl)).toMatchObject({ x: 117, y: 424.2 });
    await expectStyles(card.locator("figcaption"), { borderTopColor: "rgb(51, 51, 51)" });
    expect(await box(card.locator("img"), cl)).toEqual({ x: 117, y: 570.5, w: 40, h: 40 });
    await expectStyles(card.locator("figcaption span span"), {
      fontSize: "8.5px",
      letterSpacing: "1.36px",
      color: "rgb(187, 187, 187)",
    });
    const note = cl.getByText("Representative testimonials — replace");
    await expectStyles(note, { fontSize: "11px", color: "rgb(204, 204, 204)" });
    expect(await box(note, cl)).toMatchObject({ x: 86, y: 1007.7 });
    const work = cl.getByRole("link", { name: "View Our Work" });
    await expect(work).toHaveAttribute("href", "/works#works-list");
    expect(await box(work, cl)).toEqual({ x: 1193.4, y: 991.7, w: 160.6, h: 46 });
  });

  test("expertise: four service cards with descriptive alts and hover zoom", async ({ page }) => {
    await open(page);
    const xp = section(page, "xp");
    const explore = xp.getByRole("link", { name: "Explore Services" });
    await expect(explore).toHaveAttribute("href", "/services");
    expect(await box(explore, xp)).toEqual({ x: 1182.7, y: 234.5, w: 171.3, h: 46 });
    const cards = xp.getByRole("listitem");
    const titles = ["Architecture", "Interior Design", "Construction", "Turnkey Projects"];
    for (const [index, title] of titles.entries()) {
      // The ↗ is decorative, so it is not part of the heading's name.
      await expect(cards.nth(index).locator("h3")).toHaveAccessibleName(title);
    }
    expect(
      await cards.getByRole("link").evaluateAll((all) => all.map((a) => a.getAttribute("href"))),
    ).toEqual([
      "/services/architecture",
      "/services/interior",
      "/services/construction",
      "/services/turnkey",
    ]);
    // KI-A13: no "↗" in the alts; the ↗ in the title is decorative.
    const alts = await cards
      .locator("img")
      .evaluateAll((all) => all.map((i) => i.getAttribute("alt")));
    expect(alts.every((alt) => alt && !alt.includes("↗"))).toBe(true);
    await expect(cards.locator("h3 i[aria-hidden=true]")).toHaveCount(4);
    const image = cards.first().locator("img");
    expect(await box(image, xp)).toEqual({ x: 86, y: 336.5, w: 299, h: 292 });
    expect(await box(cards.first().locator("h3"), xp)).toEqual({ x: 86, y: 650.5, w: 299, h: 44 });
    await expectStyles(cards.first().locator("h3"), {
      fontSize: "22.5px",
      borderBottomColor: "rgb(221, 221, 221)",
    });
    await expectStyles(cards.first().locator("p"), {
      fontSize: "13px",
      lineHeight: "23.4px",
      color: "rgb(85, 85, 85)",
    });
    await expectStyles(image, { scale: "none" });
    await cards.first().getByRole("link").hover();
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.05");
  });

  test("featured story: gallery, quote, rows and plant", async ({ page }) => {
    await open(page);
    const bb = section(page, "pp-host");
    await expectStyles(bb.locator("p").first(), { color: ORANGE });
    const facts = bb.getByText("PRIVATE FAMILY RESIDENCE").locator("..");
    await expectStyles(facts, { fontSize: "9.5px", lineHeight: "18.05px", textAlign: "right" });
    expect(await box(facts, bb)).toMatchObject({ y: 162, h: 54.1 });
    const photos = bb.getByRole("button", { name: /^Enlarge image:/ });
    await expect(photos).toHaveCount(4);
    // KI-A13: four distinct alts instead of "From brief to built" ×4.
    const alts = await bb
      .locator("button img")
      .evaluateAll((all) => all.map((i) => i.getAttribute("alt")));
    expect(new Set(alts).size).toBe(4);
    expect(await box(bb.locator("button img").first(), bb)).toEqual({
      x: 86,
      y: 275.1,
      w: 720,
      h: 330,
    });
    expect(await box(bb.locator("button img").nth(1), bb)).toMatchObject({ y: 620.1, h: 215 });
    const quote = bb.locator("blockquote");
    await expectStyles(quote, { fontSize: "29px", lineHeight: "40.02px" });
    expect(await box(quote, bb)).toMatchObject({ x: 850, y: 275.1, w: 504 });
    await expect(bb.locator("figcaption")).toHaveText(
      "— Homeowner · Representative testimonial pending approval",
    );
    await expect(bb.locator("h3")).toHaveText([
      "The requirement",
      "The design journey",
      "The outcome",
    ]);
    expect(await box(bb.locator("h3").first(), bb)).toMatchObject({ x: 902, y: 760.3 });
    expect(await box(bb.locator("li p").last(), bb)).toMatchObject({ y: 1000, h: 41.4 });
    const project = bb.getByRole("link", { name: "View Project" });
    await expect(project).toHaveAttribute("href", "/works/the-courtyard-house");
    expect(await box(project, bb)).toEqual({ x: 850, y: 1063.4, w: 144, h: 46 });
    const plant = bb.locator(":scope > img");
    await expect(plant).toHaveAttribute("aria-hidden", "true");
    expect(await box(plant, bb)).toEqual({ x: 0, y: 955, w: 155, h: 274.4 });

    // The four photos browse as one gallery.
    await photos.first().click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.locator("figcaption")).toContainText("1 / 4");
    await page.keyboard.press("ArrowRight");
    await expect(viewer.locator("figcaption")).toContainText("2 / 4");
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("projects: six cards from the project list, safe links, hover zoom", async ({ page }) => {
    await open(page);
    const sp = section(page, "sp");
    const explore = sp.getByRole("link", { name: "Explore Our Work" });
    await expect(explore).toHaveAttribute("href", "/works#works-list");
    expect(await box(explore, sp)).toEqual({ x: 1178, y: 232, w: 176, h: 46 });
    const cards = sp.getByRole("listitem");
    await expect(cards.locator("h3")).toHaveText([
      "Courtyard Residence",
      "Garden House",
      "The Social Kitchen",
      "Quiet Play House",
      "Monsoon Court",
      "Studio Commons",
    ]);
    await expect(cards.locator("p")).toHaveText([
      "Architecture + InteriorsKochi",
      "Residential InteriorsThrissur",
      "Turnkey ResidenceKottayam",
      "Interior DesignErnakulam",
      "Residential ArchitectureAlappuzha",
      "Commercial InteriorKozhikode",
    ]);
    expect(
      await cards.getByRole("link").evaluateAll((all) => all.map((a) => a.getAttribute("href"))),
    ).toEqual(PROJECTS.map(projectHref));
    const image = cards.first().locator("img");
    expect(await box(image, sp)).toEqual({ x: 86, y: 380, w: 404, h: 240 });
    await expectStyles(cards.first().locator("p"), {
      fontSize: "8.5px",
      letterSpacing: "1.36px",
      textTransform: "uppercase",
      color: "rgb(85, 85, 85)",
    });
    expect(await box(cards.first().locator("p"), sp)).toMatchObject({ y: 679, h: 10 });
    await cards.first().getByRole("link").hover();
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.04");
  });

  test("call to action: reviews band, Home's form, static photo with reduced motion", async ({
    page,
  }) => {
    await open(page);
    const cta = section(page, "ctasec");
    await expectStyles(cta, { paddingTop: "110px" });
    await expectStyles(cta.locator("h2"), { fontSize: "62px", lineHeight: "69.44px" });
    expect(await box(cta.locator("h2"), cta)).toMatchObject({ y: 259, h: 138.9 });
    const link = cta.getByRole("link", { name: "Start Your Project" });
    await expect(link).toHaveAttribute("href", "/#start");
    expect(await box(link, cta)).toEqual({ x: 86, y: 515.9, w: 187.3, h: 52 });
    const image = cta.locator("img");
    await expectStyles(image, { objectPosition: "50% 40%" });
    // The CTA photo is decorative background, not zoomable.
    await expect(cta.getByRole("button")).toHaveCount(0);
    await cta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await expectStyles(image, { transform: "none" });
  });

  test("every link on the page resolves", async ({ page, request }) => {
    await open(page);
    const hrefs = await page.evaluate(() => [
      ...new Set(
        [...document.querySelectorAll<HTMLAnchorElement>("main a[href]")].map(
          (a) => new URL(a.href).pathname,
        ),
      ),
    ]);
    expect(hrefs.length).toBeGreaterThan(8);
    for (const href of hrefs) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("1440 canvas, motion on", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("the CTA photo drifts with the scroll like the original (E25)", async ({ page }) => {
    await open(page);
    const cta = section(page, "ctasec");
    const image = cta.locator("img");
    const transformAt = async (offset: number) => {
      await cta.evaluate((el, offset) => {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "instant" });
      }, offset);
      await page.waitForTimeout(200);
      return image.evaluate((el) => getComputedStyle(el).transform);
    };
    // Same values as the original at the same scroll positions (−72px, −36px).
    await expect.poll(() => transformAt(600)).toMatch(/^matrix\(1\.3, 0, 0, 1\.3, 0, -72\.\d+\)$/);
    expect(await transformAt(300)).toMatch(/^matrix\(1\.3, 0, 0, 1\.3, 0, -36\.\d+\)$/);
  });

  test("card photos zoom over .8s on hover (expertise 1.05, projects 1.04)", async ({ page }) => {
    await open(page);
    for (const [key, scale] of [
      ["xp", "1.05"],
      ["sp", "1.04"],
    ] as const) {
      const card = section(page, key).getByRole("listitem").first();
      const image = card.locator("img");
      await card.scrollIntoViewIfNeeded();
      await expectStyles(image, {
        transitionProperty: "transform, translate, scale, rotate",
        transitionDuration: "0.8s",
      });
      await card.getByRole("link").hover();
      await expect(image).toHaveCSS("scale", scale);
    }
  });

  test("no reveal-on-scroll and no parallax on the trust photo (as the original)", async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
    const photo = section(page, "tr").locator("img");
    await photo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await expectStyles(photo, { transform: "none" });
  });
});

test.describe("1024 (≤1099)", () => {
  test.use({ viewport: { width: 1024, height: 768 }, reducedMotion: "reduce" });

  test("titles scale (KI-L16, KI-N04); grids go to two columns; the photo follows the text", async ({
    page,
  }) => {
    await open(page);
    await expectStyles(page.locator("[data-hero] h1"), { fontSize: "62px" });
    for (const key of ["tr", "cl", "xp", "pp-host", "sp"]) {
      await expectStyles(section(page, key).locator("h2"), {
        fontSize: "46px",
        lineHeight: "52.44px",
      });
    }
    const tr = section(page, "tr");
    expect(await box(tr.getByRole("button", { name: /^Enlarge image:/ }), tr)).toMatchObject({
      x: 36,
      w: 952,
      h: 571,
    });
    await expectStyles(tr, { paddingTop: "80px", paddingBottom: "80px" });
    await expectStyles(section(page, "cl").locator(":scope > div > div").first(), {
      gridTemplateColumns: "952px",
      rowGap: "36px",
    });
    await expectStyles(section(page, "cl").locator("ul"), { gridTemplateColumns: "467px 467px" });
    await expectStyles(section(page, "xp").locator("ul"), {
      gridTemplateColumns: "464px 464px",
      rowGap: "28px",
    });
    await expectStyles(section(page, "sp").locator("ul"), { gridTemplateColumns: "462px 462px" });
    expect(
      await box(section(page, "sp").locator("img").first(), section(page, "sp")),
    ).toMatchObject({ h: 330 });
    const bb = section(page, "pp-host");
    await expectStyles(bb.locator(":scope > div > div").nth(1), {
      gridTemplateColumns: "952px",
      rowGap: "36px",
    });
    expect(await box(bb.locator("button img").first(), bb)).toMatchObject({ w: 952, h: 430 });
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("768 (≤860)", () => {
  test.use({ viewport: { width: 768, height: 1024 }, reducedMotion: "reduce" });

  test("header rows stack (KI-L26); one column; no overflow", async ({ page }) => {
    await open(page);
    for (const key of ["xp", "pp-host", "sp"]) {
      const row = section(page, key).locator(":scope > div > div").first();
      await expectStyles(row, { flexDirection: "column", rowGap: "20px" });
      // The aside (button or facts) starts at the left edge, under the heading, as the original.
      expect((await box(row.locator(":scope > *").last(), section(page, key))).x).toBe(20);
    }
    const sp = section(page, "sp");
    expect(await box(sp.getByRole("link", { name: "Explore Our Work" }), sp)).toMatchObject({
      x: 20,
      y: 255.3 + 3, // the 11px kicker (KI-A10)
    });
    await expectStyles(section(page, "cl").locator("ul"), { gridTemplateColumns: "728px" });
    await expectStyles(section(page, "xp").locator("ul"), { gridTemplateColumns: "728px" });
    await expectStyles(section(page, "sp").locator("ul"), { gridTemplateColumns: "728px" });
    await expectStyles(section(page, "pp-host").locator("blockquote"), { fontSize: "22px" });
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("small text is at least 11px (KI-A10); plant room; full-width hero button", async ({
    page,
  }) => {
    await open(page);
    const tiny = await page.locator("main").evaluate((root) =>
      [...root.querySelectorAll<HTMLElement>("*")]
        .filter(
          (el) =>
            el.getClientRects().length > 0 &&
            [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()),
        )
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 11)
        .map((el) => el.textContent.trim().slice(0, 30)),
    );
    expect(tiny).toEqual([]);
    const bb = section(page, "pp-host");
    // 95% of the 58%-scale plant (155px → 89.9 × 159.2) below the content, as the original (P6-04).
    await expectStyles(bb, { paddingBottom: "231.21px" });
    expect(await box(bb.locator(":scope > img"), bb)).toMatchObject({ x: 0, w: 89.9 });
    const hero = section(page, "hero");
    expect(await box(hero.getByRole("link", { name: "Start Your Project" }), hero)).toMatchObject({
      x: 20,
      w: 350,
      h: 50,
    });
    await expectStyles(hero.locator("h1"), { fontSize: "37.44px" });
    await expectNoHorizontalOverflow(page);
  });
});
