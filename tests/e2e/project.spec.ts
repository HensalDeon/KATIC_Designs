import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Project detail page (`/works/the-courtyard-house`, original `#p-project`, docs/analysis/04 §2).
 * Expected values are the ORIGINAL's rendered output (probed at 1440/1024/768/390); deliberate
 * deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const PATH = "/works/the-courtyard-house";
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const ORANGE = "rgb(232, 98, 44)";
const SMALL_ORANGE = "rgb(192, 82, 42)";

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

async function open(page: Page, path = PATH) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

/** Rect relative to the section's top-left on the 1440 canvas (zoom is 1 at 1440). */
async function box(locator: Locator, section: Locator) {
  const [el, root] = await Promise.all([locator.boundingBox(), section.boundingBox()]);
  if (!el || !root) throw new Error("not rendered");
  const round = (v: number) => Math.round(v * 10) / 10;
  return { x: round(el.x), y: round(el.y - root.y), w: round(el.width), h: round(el.height) };
}

const section = (page: Page, key: string) =>
  page.locator(key === "project-gallery" ? "#project-gallery" : `[data-parity="${key}"]`);

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle("The Courtyard House, Kochi | Project by Katic Designs");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "A multi-generational family home in Kochi organised around a planted courtyard, designed and built by Katic Designs.",
    );
  });

  test("sections keep the original order, ids and alternating tones", async ({ page }) => {
    await open(page);
    const sections = await page.locator("main > *").evaluateAll((all) =>
      all.map((el) => {
        const sectionEl = el.matches("section") ? el : el.querySelector("section");
        return {
          key: el.hasAttribute("data-hero")
            ? "hero"
            : el.id || (el.getAttribute("data-parity") ?? ""),
          tone: sectionEl?.getAttribute("data-tone"),
          background: sectionEl ? getComputedStyle(sectionEl).backgroundColor : "",
          height: el.getBoundingClientRect().height,
        };
      }),
    );
    expect(sections.map(({ key, tone }) => [key, tone])).toEqual([
      ["hero", "dark"],
      ["ov", "light"],
      ["dr", "dark"],
      ["br", "light"],
      ["mt", "dark"],
      ["project-gallery", "light"],
      ["rl", "dark"],
      ["ctasec", "dark"],
    ]);
    expect(sections.slice(1, 7).map(({ background }) => background)).toEqual([
      WHITE,
      BLACK,
      WHITE,
      BLACK,
      WHITE,
      BLACK,
    ]);
    // Measured on the original; the brief and related projects grow instead of zooming (KI-L13).
    expect(sections.map(({ height }) => Math.round(height))).toEqual([
      900, 1364, 1698, 1181, 1705, 3542, 960, 900,
    ]);
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
  });

  test("nothing reveals on scroll (reveals are home-only, D7)", async ({ page }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero: title, location, gallery button and sector line", async ({ page }) => {
    await open(page);
    const hero = page.locator("[data-hero]");
    const title = hero.getByRole("heading", { level: 1 });
    await expect(title).toHaveText("The CourtyardHouse");
    await expectStyles(title, { fontSize: "78px", lineHeight: "78px", fontWeight: "700" });
    await expectStyles(title.locator("span"), { color: ORANGE });
    expect(await box(title, hero)).toMatchObject({ x: 86, y: 388, h: 156 });
    const location = hero.getByText("Kakkanad, Kochi, Kerala");
    expect(await box(location, hero)).toMatchObject({ x: 86, y: 566 });
    const gallery = hero.getByRole("link", { name: "VIEW GALLERY" });
    await expect(gallery).toHaveAttribute("href", "#project-gallery");
    expect(await box(gallery, hero)).toMatchObject({ y: 460, h: 52 });
    expect((await box(gallery, hero)).x + (await box(gallery, hero)).w).toBeCloseTo(1354, 0);
    await expectStyles(gallery, { fontSize: "11.5px", letterSpacing: "1.38px", gap: "26px" });
    const year = hero.getByText("RESIDENTIAL ARCHITECTURE · 2025");
    expect(await box(year, hero)).toMatchObject({ y: 815, h: 13 });

    await gallery.click();
    await expect
      .poll(() => page.locator("#project-gallery").evaluate((el) => el.getBoundingClientRect().top))
      .toBeLessThan(10);
  });

  test("overview: title, facts strip and photos", async ({ page }) => {
    await open(page);
    const ov = section(page, "ov");
    await expectStyles(ov.locator("h2"), {
      fontSize: "58px",
      lineHeight: "66.12px",
      color: "rgb(11, 11, 11)",
    });
    const facts = ov.locator("dl");
    await expectStyles(facts, {
      gridTemplateColumns: "253.594px 253.594px 253.609px 253.594px 253.609px",
      borderTopColor: "rgb(217, 213, 205)",
      borderBottomWidth: "2px",
    });
    await expect(facts.locator("dt")).toHaveText([
      "LOCATION",
      "PROJECT TYPE",
      "AREA",
      "YEAR",
      "SERVICES",
    ]);
    await expectStyles(facts.locator("dt").first(), { fontSize: "8.5px", color: SMALL_ORANGE });
    expect(await box(facts, ov)).toMatchObject({ y: 501.4, h: 108 });
    const [large, small] = [ov.locator("img").nth(0), ov.locator("img").nth(1)];
    expect(await box(large, ov)).toMatchObject({ x: 86, y: 667.4, w: 820, h: 502 });
    expect(await box(small, ov)).toMatchObject({ x: 954, y: 778.4, w: 400, h: 260 });
    const cta = ov.getByRole("link", { name: "Explore Service" });
    await expect(cta).toHaveAttribute("href", "/services/architecture");
    expect(await box(cta, ov)).toMatchObject({ y: 1190.4, h: 54 });
  });

  test("design response: plan block, principles and the process link", async ({ page }) => {
    await open(page);
    const dr = section(page, "dr");
    await expectStyles(dr.locator("h2"), { color: "rgb(244, 244, 244)" });
    await expectStyles(dr.locator("h3").first(), { fontSize: "28px", lineHeight: "36.4px" });
    expect(await box(dr.locator("img").first(), dr)).toMatchObject({ y: 519.4, w: 760, h: 680 });
    const points = dr.locator("ul");
    await expectStyles(points, {
      gridTemplateColumns: "384px 384px 384px",
      borderTopColor: "rgb(34, 34, 34)",
    });
    await expect(points.locator("h3")).toHaveText([
      "A shaded courtyard",
      "A porous plan",
      "A protective edge",
    ]);
    expect(await box(points.locator("h3").first(), dr)).toMatchObject({ y: 1346.4 });
    const process = dr.getByRole("link", { name: "Our Process" });
    await expect(process).toHaveAttribute("href", "/services/architecture#process");
    await expectStyles(process, { color: BLACK, backgroundColor: ORANGE, height: "54px" });
  });

  test("materials: captioned photos and the four swatches", async ({ page }) => {
    await open(page);
    const mt = section(page, "mt");
    const swatches = mt.locator("ul i");
    expect(
      await swatches.evaluateAll((all) => all.map((el) => getComputedStyle(el).backgroundColor)),
    ).toEqual(["rgb(228, 220, 203)", "rgb(124, 139, 117)", "rgb(154, 90, 60)", "rgb(38, 38, 38)"]);
    await expect(mt.locator("figcaption")).toHaveText([
      "DINING ROOM · TEAK JOINERY · COURTYARD EDGE",
      "STAIR DETAIL · STONE · BLACKENED STEEL",
    ]);
    expect(await box(mt.locator("img").first(), mt)).toMatchObject({ y: 509.4, w: 790, h: 636 });
    await expect(mt.getByRole("link", { name: "Explore Service" })).toHaveCSS(
      "background-color",
      "rgb(17, 17, 17)",
    );
  });

  test("gallery: ten photos in five rows, browsable as one lightbox group", async ({ page }) => {
    await open(page);
    const gl = section(page, "project-gallery");
    await expect(gl.getByText("10 VIEWS · KAKKANAD, KOCHI")).toBeVisible();
    const triggers = gl.getByRole("button", { name: /^Enlarge image:/ });
    await expect(triggers).toHaveCount(10);
    await expect(gl.locator("figcaption")).toHaveCount(10);
    await expectStyles(gl.locator("figcaption").first(), {
      fontSize: "8.5px",
      letterSpacing: "1.19px",
      color: "rgb(85, 85, 85)",
      textTransform: "uppercase",
    });
    expect(
      await gl
        .locator("div:has(> figure)")
        .evaluateAll((all) => all.map((el) => getComputedStyle(el).gridTemplateColumns)),
    ).toEqual([
      "1268px",
      "760px 488px",
      "488px 760px",
      "409.328px 409.328px 409.344px",
      "760px 488px",
    ]);
    expect(await box(gl.locator("img").nth(2), gl)).toMatchObject({ x: 866, y: 1238.2, h: 430 });

    await triggers.first().click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    const caption = viewer.locator("figcaption");
    await expect(caption).toHaveText(
      /Courtyard house south garden elevation with deep overhangs in Kakkanad Kochi\s*1 \/ 10/,
    );
    await viewer.getByRole("button", { name: "Next image" }).click();
    await expect(caption).toHaveText(
      /open-plan living and dining room facing the central garden\s*2 \/ 10/,
    );
    await viewer.getByRole("button", { name: "Previous image" }).click();
    await viewer.getByRole("button", { name: "Previous image" }).click();
    await expect(caption).toHaveText(
      /illuminated courtyard facade at blue hour in Kochi\s*10 \/ 10/,
    );
    await page.keyboard.press("ArrowRight");
    await expect(caption).toHaveText(/1 \/ 10/);

    // Enlarged to fit 90vw × 86vh at its own aspect ratio (KI-N13), far above its 1268px slot's source.
    const image = viewer.locator("img");
    const fit = await image.evaluate((img: HTMLImageElement) => {
      const ratio = img.naturalWidth / img.naturalHeight;
      return Math.min(window.innerWidth * 0.9, window.innerHeight * 0.86 * ratio);
    });
    await expect.poll(async () => (await image.boundingBox())?.width).toBeCloseTo(fit, 0);
    expect(fit).toBeGreaterThan(1000);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("section photos open the lightbox on their own", async ({ page }) => {
    await open(page);
    await section(page, "br")
      .getByRole("button", { name: "Enlarge image: House with a timber screen entrance porch" })
      .click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("button", { name: "Next image" })).toHaveCount(0);
    await page.keyboard.press("Escape");
    // The CTA photo is decorative background, not zoomable (the original skips `.ctasec`).
    await expect(section(page, "ctasec").getByRole("button")).toHaveCount(0);
  });

  test("related projects: four cards, own facts, safe links, hover zoom", async ({ page }) => {
    await open(page);
    const rl = section(page, "rl");
    const cards = rl.getByRole("listitem");
    await expect(cards.locator("h3")).toHaveText([
      "Canopy House",
      "River Edge Villa",
      "Linear Courtyard Home",
      "Garden Fold House",
    ]);
    await expect(cards.locator("p")).toHaveText([
      "RESIDENTIAL · THRIPPUNITHURA",
      "RESIDENTIAL · ALUVA",
      "ARCHITECTURE · EDAPPALLY",
      "ARCHITECTURE + INTERIORS · KOCHI",
    ]);
    // None of them has its own page yet: like the original, they open The Courtyard House (KI-F09).
    expect(
      await rl.getByRole("link").evaluateAll((all) => all.map((a) => a.getAttribute("href"))),
    ).toEqual(Array.from({ length: 4 }, () => PATH));
    expect(
      await cards.locator("img").evaluateAll((all) => all.map((i) => i.getAttribute("alt"))),
    ).toEqual([
      "Brick house behind a garden path",
      "Riverside house glowing at night",
      "Stone garden path leading to a white modern house",
      "Narrow urban house lit at dusk",
    ]);
    const image = cards.first().locator("img");
    // Tailwind's scale utilities use the `scale` property (the original: transform scale(1.04)).
    await expectStyles(image, { height: "350px", scale: "none", transitionDuration: "0.7s" });
    await cards.first().getByRole("link").hover();
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.04");
  });
});

test.describe("1440 canvas, motion on", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("call to action: copy, contact link and parallax photo (E25)", async ({ page }) => {
    await open(page);
    const cta = section(page, "ctasec");
    await expectStyles(cta.locator("h2"), { fontSize: "66px", lineHeight: "69.3px" });
    await expect(cta.getByRole("link", { name: "Discuss Your Project" })).toHaveAttribute(
      "href",
      "/#start",
    );
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
});

test.describe("1024 (≤1099)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("titles scale (KI-L16, KI-N04); grids go to two columns", async ({ page }) => {
    await open(page);
    await expectStyles(page.locator("[data-hero] h1"), { fontSize: "62px" });
    await expectStyles(section(page, "ov").locator("h2"), { fontSize: "46px" });
    await expectStyles(section(page, "ov").locator("dl"), {
      gridTemplateColumns: "476px 476px",
      rowGap: "28px",
    });
    await expectStyles(section(page, "dr").locator("ul"), { gridTemplateColumns: "447px 447px" });
    await expectStyles(section(page, "rl").locator("ul"), { gridTemplateColumns: "467px 467px" });
    expect(
      await section(page, "project-gallery")
        .locator("div:has(> figure)")
        .evaluateAll((all) => all.map((el) => getComputedStyle(el).gridTemplateColumns)),
    ).toEqual(["952px", "466px 466px", "466px 466px", "304px 304px 304px", "466px 466px"]);
  });
});

test.describe("390 (phone)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("small text is at least 11px (KI-A10)", async ({ page }) => {
    await open(page);
    const tiny = await page
      .locator("main")
      .evaluate((main) =>
        [...main.querySelectorAll<HTMLElement>("*")]
          .filter(
            (el) =>
              el.offsetWidth > 0 &&
              [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()) &&
              parseFloat(getComputedStyle(el).fontSize) < 11,
          )
          .map((el) => `${el.tagName} ${el.textContent.trim().slice(0, 30)}`),
      );
    expect(tiny).toEqual([]);
  });

  test("phone layout: stacked hero button, one column, phone photo heights (KI-L24)", async ({
    page,
  }) => {
    await open(page);
    const hero = page.locator("[data-hero]");
    await expect(hero.getByText("RESIDENTIAL ARCHITECTURE · 2025")).toBeHidden();
    const gallery = hero.getByRole("link", { name: "VIEW GALLERY" });
    expect(await gallery.boundingBox()).toMatchObject({ x: 20, width: 350, height: 50 });
    const heights = async (key: string) =>
      section(page, key)
        .locator("img")
        .evaluateAll((all) => all.map((img) => Math.round(img.getBoundingClientRect().height)));
    expect(await heights("ov")).toEqual([340, 260]);
    expect(await heights("dr")).toEqual([340, 251]);
    expect(await heights("br")).toEqual([340, 340]);
    expect(await heights("mt")).toEqual([340, 340]);
    expect(await heights("project-gallery")).toEqual(Array.from({ length: 10 }, () => 300));
    await expectStyles(section(page, "rl").locator("ul"), { gridTemplateColumns: "350px" });
  });
});

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`no horizontal overflow at ${String(viewport.width)}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await open(page);
    const { scroll, client } = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(scroll).toBeLessThanOrEqual(client);
  });
}

test.describe("project links", () => {
  test("unknown and unbuilt project slugs answer 404", async ({ request }) => {
    for (const slug of ["not-a-project", "canopy-house", "linear-courtyard-home"]) {
      const response = await request.get(`/works/${slug}`);
      expect(response.status(), slug).toBe(404);
    }
  });

  /** Every page built so far. Extend as pages are added. */
  const PAGES = [
    "/",
    "/about",
    "/services",
    ...[
      "architecture",
      "interior",
      "factory",
      "construction",
      "turnkey",
      "renovation",
      "exterior",
      "property-care",
    ].map((slug) => `/services/${slug}`),
    PATH,
  ];

  test("every /works/<slug> link on the built pages resolves (no card leads to a 404)", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    const targets = new Map<string, string>();
    for (const path of PAGES) {
      await page.goto(path);
      const hrefs = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLAnchorElement>("a[href]")].map(
          (a) => new URL(a.href).pathname,
        ),
      );
      for (const href of hrefs) {
        if (href.startsWith("/works/") && !targets.has(href)) targets.set(href, path);
      }
    }
    expect(targets.size).toBeGreaterThan(0);
    for (const [target, from] of targets) {
      const response = await request.get(target);
      expect(response.status(), `${target} (linked from ${from})`).toBe(200);
    }
  });
});
