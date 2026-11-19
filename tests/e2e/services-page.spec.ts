import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Services overview (`/services`, original `#p-services`). Computed styles are the values measured
 * on the ORIGINAL with coverage-style probes (docs/analysis/02 §3), written as the browser reports
 * them. Deliberate deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected) {
  const actual = await locator.evaluate((el, keys) => {
    const style = getComputedStyle(el);
    return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
  }, Object.keys(expected).map(kebab));
  const normalised = Object.fromEntries(
    Object.keys(expected).map((key) => [key, actual[kebab(key)]]),
  );
  expect(normalised).toEqual(expected);
}

async function open(page: Page) {
  await page.goto("/services");
  await page.evaluate(() => document.fonts.ready);
}

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });

const SLUGS = [
  "architecture",
  "interior",
  "construction",
  "turnkey",
  "renovation",
  "exterior",
  "property-care",
] as const;
const BLOCK_TONES = ["light", "dark", "light", "dark", "light", "dark", "light"] as const;

const hero = (page: Page) => page.locator("[data-hero]");
const whatWeDo = (page: Page) => page.locator("[data-parity=pp-host]");
const whatWeDeliver = (page: Page) => page.locator("[data-parity=fd]");
const block = (page: Page, slug: string) => page.locator(`#svc-${slug}`);
const textColumn = (page: Page, slug: string) => block(page, slug).locator(":scope > div").first();
const imageColumn = (page: Page, slug: string) => block(page, slug).locator(":scope > div").nth(1);
const thumbnails = (page: Page, slug: string) =>
  imageColumn(page, slug).locator(":scope > div").nth(1);

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("metadata is the original's data-title / data-desc", async ({ page }) => {
    await open(page);
    await expect(page).toHaveTitle(
      "Architecture, Interior & Construction Services | Katic Designs",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Architectural design, interior design, construction, turnkey projects, renovation, landscape and property care for homes and commercial spaces in Kerala and the UAE.",
    );
  });

  test("sections keep the original order, ids and rendered tones", async ({ page }) => {
    await open(page);
    const sections = await page.locator("main > section").evaluateAll((all) =>
      all.map((section) => ({
        id: section.hasAttribute("data-hero")
          ? "hero"
          : (section.getAttribute("data-parity") ?? section.id),
        tone: section.getAttribute("data-tone"),
        background: getComputedStyle(section).backgroundColor,
      })),
    );
    const white = "rgb(255, 255, 255)";
    const black = "rgb(0, 0, 0)";
    expect(sections.map(({ id, tone }) => [id, tone])).toEqual([
      ["hero", "dark"],
      ["pp-host", "light"],
      ["fd", "dark"],
      ...SLUGS.map((slug, index) => [`svc-${slug}`, BLOCK_TONES[index]]),
      ["services-contact", "dark"],
    ]);
    expect(sections.slice(1).map((section) => section.background)).toEqual([
      white,
      black,
      ...BLOCK_TONES.map((tone) => (tone === "light" ? white : black)),
      black,
    ]);
    // One screen each on the canvas.
    for (const section of await page.locator("main > section").all()) {
      expect((await rect(section)).height).toBe(900);
    }
  });

  test("nothing reveals on scroll (reveals are home-only)", async ({ page }) => {
    await open(page);
    await expect(page.locator("[data-reveal]")).toHaveCount(0);
    await expect(page.locator("[data-rv]")).toHaveCount(0);
  });

  test("hero type, shade and the side index of services", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page).locator("h1"), {
      fontSize: "76px",
      lineHeight: "74.48px",
      fontWeight: "700",
      letterSpacing: "-0.38px",
      color: "rgb(255, 255, 255)",
    });
    expect((await rect(hero(page).locator("h1"))).y).toBe(237);
    await expectStyles(hero(page).locator("h1 span"), { color: "rgb(232, 98, 44)" });
    await expectStyles(hero(page).locator("p").first(), {
      fontSize: "9.5px",
      letterSpacing: "1.9px",
      color: "rgb(232, 98, 44)",
    });
    await expectStyles(hero(page).locator("h1 + p"), {
      fontSize: "15.5px",
      lineHeight: "27.125px",
      color: "rgb(238, 238, 238)",
      maxWidth: "620px",
    });
    const cta = hero(page).getByRole("link", { name: "Explore Our Work" });
    await expect(cta).toHaveAttribute("href", "/works");
    expect(await rect(cta)).toMatchObject({ x: 86, y: 637.125, height: 54 });

    const index = hero(page).getByRole("navigation", { name: "OUR SERVICES" });
    expect(await rect(index)).toMatchObject({ x: 1084, y: 250, width: 270 });
    const links = index.getByRole("link");
    await expect(links).toHaveCount(7);
    expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
      SLUGS.map((slug) => `/services/${slug}`),
    );
    expect((await rect(links.first())).y).toBe(306);
    await expectStyles(links.first(), { fontSize: "15px", color: "rgb(255, 255, 255)" });
  });

  test("what we do: header, steps and the clipped hanging plant (KI-L32)", async ({ page }) => {
    await open(page);
    const section = whatWeDo(page);
    await expectStyles(section, { overflow: "hidden", paddingTop: "120px" });
    await expectStyles(section.locator("h2").first(), {
      fontSize: "58px",
      lineHeight: "64.96px",
      textTransform: "uppercase",
      color: "rgb(11, 11, 11)",
    });
    await expectStyles(section.locator("h2 + p"), { fontSize: "26px", lineHeight: "33.8px" });
    const title = await rect(section.locator("h2").first());
    expect(title.x).toBe(86);
    expect(title.y).toBeCloseTo(900 + 199.8, 0);
    const plant = section.locator("img").first();
    await expect(plant).toHaveAttribute("alt", "");
    // Flush with the section top, 28px past the left edge, clipped by the section.
    expect(await rect(plant)).toMatchObject({ x: -28, y: 900, width: 110 });
    await expect(section.locator("li[data-step] h3")).toHaveText([
      "Concept",
      "Design",
      "Build",
      "Complete",
    ]);
    await expect(section.getByRole("link", { name: "Our Process" })).toHaveAttribute(
      "href",
      "/services/architecture#process",
    );
  });

  test("what we deliver stays a centred one-screen block (KI-L19)", async ({ page }) => {
    await open(page);
    const section = whatWeDeliver(page);
    await section.scrollIntoViewIfNeeded();
    const outer = await rect(section);
    const inner = await rect(section.locator(":scope > div"));
    expect(outer.height).toBe(900);
    expect(inner.height).toBeGreaterThan(200);
    expect(Math.abs(inner.y - outer.y - (outer.bottom - inner.bottom))).toBeLessThan(1);
    await expectStyles(section.locator("h2"), { color: "rgb(244, 244, 244)" });
    await expectStyles(section.locator(":scope > div > p"), {
      color: "rgb(170, 170, 170)",
      fontSize: "17px",
    });
  });

  test("service blocks: content, links and the palette the original renders", async ({ page }) => {
    await open(page);
    const palette = {
      architecture: ["rgb(85, 85, 85)", "rgb(11, 11, 11)", "rgb(255, 255, 255)"],
      interior: ["rgb(170, 170, 170)", "rgb(244, 244, 244)", "rgb(0, 0, 0)"],
      construction: ["rgb(136, 136, 136)", "rgb(0, 0, 0)", "rgb(0, 0, 0)"],
      exterior: ["rgb(119, 119, 119)", "rgb(255, 255, 255)", "rgb(255, 255, 255)"],
    } as const;
    for (const [slug, [header, title, button]] of Object.entries(palette)) {
      const column = textColumn(page, slug);
      await expectStyles(column.locator("p").first(), {
        fontSize: "9.5px",
        letterSpacing: "1.9px",
        color: header,
        borderBottomWidth: "2px",
      });
      await expectStyles(column.locator("h2"), {
        fontSize: "46px",
        fontWeight: "500",
        letterSpacing: "-0.23px",
        color: title,
      });
      await expectStyles(column.locator("h2 + p"), { fontSize: "16px", lineHeight: "26.4px" });
      await expectStyles(column.getByRole("link"), { height: "52px", backgroundColor: button });
    }
    for (const slug of SLUGS) {
      const cta = textColumn(page, slug).getByRole("link");
      await expect(cta).toHaveAttribute("href", `/services/${slug}`);
      await expect(cta).toHaveText(/^Explore /);
    }
    // The button sits 76px above the section's bottom padding (36px).
    expect((await rect(textColumn(page, "architecture").getByRole("link"))).bottom).toBe(
      2700 + 900 - 36 - 76,
    );
    const label = imageColumn(page, "interior").locator("span").first();
    await expectStyles(label, {
      fontSize: "8.5px",
      letterSpacing: "1.7px",
      backgroundColor: "rgba(10, 10, 10, 0.82)",
      paddingTop: "6px",
      paddingRight: "10px",
    });
    await expectStyles(imageColumn(page, "interior"), { gridTemplateRows: "245px 204px" });
    await expectStyles(thumbnails(page, "interior"), {
      gridTemplateColumns: "196px 196px 196px 196px",
      columnGap: "16px",
    });
  });

  test("text column on the gutter and photos clear of the contact rail (KI-L18)", async ({
    page,
  }) => {
    await open(page);
    const rail = await rect(page.getByRole("navigation", { name: "Quick contact" }));
    for (const slug of ["architecture", "construction", "renovation", "property-care"]) {
      await block(page, slug).scrollIntoViewIfNeeded();
      expect((await rect(textColumn(page, slug).locator("p").first())).x).toBe(86);
      const photos = await rect(imageColumn(page, slug).locator(":scope > div").first());
      expect(photos.right).toBeLessThanOrEqual(1440 - 86);
      expect(photos.right).toBeLessThanOrEqual(rail.x);
      const label = await rect(imageColumn(page, slug).locator("span").first());
      expect(label.right).toBeLessThan(rail.x);
    }
    // Reversed blocks keep the original geometry: photos from 16px, text at 864 + 86.
    expect((await rect(imageColumn(page, "interior").locator(":scope > div").first())).x).toBe(16);
    expect((await rect(textColumn(page, "interior").locator("p").first())).x).toBe(950);
  });

  test("thumbnails zoom on hover", async ({ page }) => {
    await open(page);
    const thumb = thumbnails(page, "turnkey").locator("img").first();
    await thumb.scrollIntoViewIfNeeded();
    await expectStyles(thumb, { transitionDuration: "0.6s", cursor: "zoom-in" });
    await thumb.hover();
    await expect(thumb).toHaveCSS("scale", "1.06");
  });

  test("block photos open the lightbox as one gallery per block", async ({ page }) => {
    await open(page);
    const dialog = page.locator("dialog[open]");
    const thumbs = thumbnails(page, "interior").getByRole("button");
    await expect(thumbs).toHaveCount(4);
    await thumbs.first().click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("figcaption")).toHaveText(/LIVING\s*2 \/ 5/);
    await dialog.getByRole("button", { name: "Next image" }).click();
    await expect(dialog.locator("figcaption")).toHaveText(/LOUNGE\s*3 \/ 5/);
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.locator("figcaption")).toHaveText(/MATERIAL · MOOD · FUNCTION\s*1 \/ 5/);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("the services contact: black, form on the right", async ({ page }) => {
    await open(page);
    const section = page.locator("#services-contact");
    await expect(section).toHaveAttribute("data-contact-section", "");
    await expectStyles(section.locator("h2"), {
      fontSize: "54px",
      lineHeight: "54px",
      fontWeight: "700",
      color: "rgb(255, 255, 255)",
    });
    await expect(section.locator("dl a")).toHaveText([
      "hello@katicdesigns.com",
      "+1 (000) 000-0000",
    ]);
    const form = await rect(section.locator("form"));
    expect(form).toMatchObject({ x: 714, width: 640 });
    await expectStyles(section.locator("input[name=name]"), { height: "46px" });
    await expectStyles(section.locator("textarea"), { height: "108px" });
  });
});

test.describe("1440 canvas, motion on", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("the architecture photo drifts with scroll (E25) and still opens the lightbox", async ({
    page,
  }) => {
    await open(page);
    const photo = imageColumn(page, "architecture").locator("img").first();
    const transformAt = async (top: number) => {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
      await page.waitForTimeout(150);
      return photo.evaluate((img) => getComputedStyle(img).transform);
    };
    const early = await transformAt(2700 - 600);
    const later = await transformAt(2700 + 200);
    expect(early).toMatch(/^matrix\(1\.3, 0, 0, 1\.3, 0, -?[\d.]+\)$/);
    expect(later).not.toBe(early);
    // translateY = c × −24%, c falling from +0.5 to −0.5 as the frame crosses the viewport.
    const ty = (matrix: string) => Number(matrix.split(",")[5]?.replace(")", ""));
    expect(ty(early)).toBeLessThan(0);
    expect(ty(later)).toBeGreaterThan(0);

    await imageColumn(page, "architecture").getByRole("button").first().click();
    await expect(page.locator("dialog[open] figcaption")).toHaveText(
      /SITE · CLIMATE · FORM\s*1 \/ 5/,
    );
  });
});

test.describe("1024 (below the canvas)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("hero title scales to 62px and the side index hides (KI-L16)", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page).locator("h1"), { fontSize: "62px" });
    await expect(hero(page).getByRole("navigation")).toBeHidden();
    expect((await rect(hero(page).locator("p").first())).y).toBe(118);
  });

  test("blocks stack text first, full width", async ({ page }) => {
    await open(page);
    const column = textColumn(page, "interior");
    await expectStyles(column, { paddingTop: "48px", paddingLeft: "36px", order: "0" });
    expect((await rect(column)).y).toBe((await rect(block(page, "interior"))).y);
    await expectStyles(column.getByRole("link"), { marginTop: "28px", marginBottom: "0px" });
    expect((await rect(block(page, "architecture"))).height).toBeCloseTo(913.8, 0);
    await expectStyles(whatWeDo(page).locator("h2").first(), { fontSize: "46px" });
  });

  test("contact keeps two equal columns", async ({ page }) => {
    await open(page);
    expect(await rect(page.locator("#services-contact form"))).toMatchObject({
      x: 532,
      width: 456,
    });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("hero sits at the bottom with a fluid title", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page).locator("h1"), { fontSize: "37.44px" });
    const cta = await rect(hero(page).getByRole("link", { name: "Explore Our Work" }));
    expect(cta).toMatchObject({ x: 20, width: 350, height: 50 });
    expect(cta.bottom).toBe(844 - 40);
  });

  test("the plant gets its own room above What we do", async ({ page }) => {
    await open(page);
    await expectStyles(whatWeDo(page), { paddingTop: "229.878px" });
    expect(await rect(whatWeDo(page).locator("img").first())).toMatchObject({ x: -18 });
  });

  test("block titles step down to 34/1.1 (KI-L17)", async ({ page }) => {
    await open(page);
    for (const slug of SLUGS) {
      await expectStyles(textColumn(page, slug).locator("h2"), {
        fontSize: "34px",
        lineHeight: "37.4px",
      });
    }
  });

  test("thumbnails form a 2×2 grid with whole captions (KI-L09)", async ({ page }) => {
    await open(page);
    for (const slug of SLUGS) {
      const grid = thumbnails(page, slug);
      await expectStyles(grid, { gridTemplateColumns: "191px 191px", columnGap: "8px" });
      const fits = await grid.locator(":scope > div").evaluateAll((cells) =>
        cells.every((cell) => {
          const label = cell.querySelector("span");
          if (!label) return false;
          const c = cell.getBoundingClientRect();
          const l = label.getBoundingClientRect();
          return l.left >= c.left && l.right <= c.right && l.height < 30;
        }),
      );
      expect(fits, `#svc-${slug} captions`).toBe(true);
    }
    await expectStyles(imageColumn(page, "architecture").locator("span").first(), {
      fontSize: "11px",
    });
  });

  test("contact is one column with a 38px heading", async ({ page }) => {
    await open(page);
    await expectStyles(page.locator("#services-contact h2"), { fontSize: "38px" });
    expect(await rect(page.locator("#services-contact form"))).toMatchObject({ x: 20, width: 350 });
  });
});

for (const [width, height] of [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
] as const) {
  test.describe(`${width}px`, () => {
    test.use({ viewport: { width, height } });

    test("no horizontal overflow", async ({ page }) => {
      await open(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBe(0);
    });
  });
}
