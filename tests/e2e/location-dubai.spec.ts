import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Dubai location page (`/locations/dubai`, original `#p-dubai`). Values are the ORIGINAL's
 * rendered output, measured with a probe of `#p-dubai` at 1440 / 1024 / 768 / 390, written as the
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

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error("element not rendered");
  return rect;
}

async function open(page: Page) {
  await page.goto("/locations/dubai");
  await page.evaluate(() => document.fonts.ready);
}

/** Section roots in page order (`main > section`). */
const SECTIONS = [
  { selector: "[data-hero]", tone: "dark" },
  { selector: "#dubai-context", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" }, // services
  { selector: "[data-parity=ks]", tone: "light" }, // divisions
  { selector: "[data-parity=ks]", tone: "dark" }, // cross-border split
  { selector: "[data-parity=ks]", tone: "light" }, // steps
  { selector: "[data-parity=ks]", tone: "dark" }, // features
  { selector: "#dubai-office", tone: "light" },
  { selector: "[data-parity=s5]", tone: "dark" },
  { selector: "#dubai-contact", tone: "light" },
] as const;

const section = (page: Page, index: number) => page.locator("main > section").nth(index);
const context = (page: Page) => page.locator("#dubai-context");
const office = (page: Page) => page.locator("#dubai-office");
const projects = (page: Page) => page.locator("[data-parity=s5]");
const contact = (page: Page) => page.locator("#dubai-contact");
const cactus = (page: Page) => context(page).locator(":scope > img[aria-hidden]");

/** The cactus image is 521×379 (KI-L08: the original stretches it to 327×379). */
const CACTUS_RATIO = 379 / 521;

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
    await expect(page).toHaveTitle("Architects & Interior Designers in Dubai, UAE | Katic Designs");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Architecture, interior design, construction and turnkey projects for residential and commercial clients in Dubai and the UAE.",
    );
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
    await expect(page.locator("[data-parity=footer]")).toBeAttached();
  });

  test("no reveal-on-scroll (home-only in the original, D7)", async ({ page }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero: type, buttons and the bottom bar", async ({ page }) => {
    await open(page);
    const hero = section(page, 0);
    expect(await box(hero)).toMatchObject({ y: 0, height: 900 });
    await expectStyles(hero.locator("h1"), {
      fontSize: "76px",
      lineHeight: "74.48px",
      fontWeight: "700",
      marginTop: "22px",
    });
    await expect(hero.locator("h1 .text-brand")).toHaveText("Dubai.");
    const kicker = hero.getByText("Katic Designs · Dubai");
    expect((await box(kicker)).y).toBe(242);
    await expectStyles(hero.locator("h1 + p"), {
      fontSize: "16.5px",
      lineHeight: "28.875px",
      maxWidth: "660px",
      color: "rgb(238, 238, 238)",
    });
    const start = hero.getByRole("link", { name: "Start a Project" });
    const services = hero.getByRole("link", { name: "Explore Our Services" });
    expect(await box(start)).toMatchObject({ x: 86, height: 56 });
    expect((await box(start)).width).toBeCloseTo(170, 0);
    expect((await box(services)).x).toBeCloseTo(272, 0);
    await expectStyles(services, { fontSize: "13px", fontWeight: "600", paddingLeft: "24px" });
    await expect(services).toHaveAttribute("href", "/services");

    const label = hero.getByText("UAE · RESIDENTIAL · COMMERCIAL");
    expect(await box(label)).toMatchObject({ x: 86, y: 836, height: 12 });
    await expectStyles(label, {
      fontSize: "10px",
      letterSpacing: "2.4px",
      color: "rgb(232, 98, 44)",
    });
    const scroll = hero.getByRole("link", { name: "SCROLL TO EXPLORE" });
    await expect(scroll).toHaveAttribute("href", "#dubai-context");
    const scrollBox = await box(scroll);
    expect(scrollBox.y).toBe(836);
    expect(scrollBox.x + scrollBox.width).toBeCloseTo(1354, 0);
    await expectStyles(scroll, { color: "rgb(221, 221, 221)" });
    await scroll.click();
    await expect
      .poll(() => context(page).evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBe(0);
  });

  test("the hero CTA scrolls to the page's own form and writes the location (PREFILL)", async ({
    page,
  }) => {
    await open(page);
    const details = contact(page).getByLabel("Project Details");
    await expect(details).toHaveValue("");
    await section(page, 0).getByRole("link", { name: "Start a Project" }).click();
    await expect(contact(page).getByLabel("Full Name")).toBeFocused();
    await expect(details).toHaveValue("Location: Dubai, UAE\n");
  });

  test("KATIC in Dubai: photo column, pin box, title and paragraph", async ({ page }) => {
    await open(page);
    const root = context(page);
    expect((await box(root)).height).toBe(900);
    const grid = root.locator(":scope > div");
    await expectStyles(grid, { gridTemplateColumns: "663px 531px", columnGap: "74px" });
    const photo = root.getByRole("button", { name: /^Enlarge image:/ });
    expect(await box(photo)).toMatchObject({ x: 86, width: 663, height: 614 });
    expect((await box(photo)).y - (await box(root)).y).toBe(128);
    await expect(root.getByText("CLIMATE-AWARE LIVING")).toBeVisible();
    const pin = root.locator("span.size-46");
    expect(await box(pin)).toMatchObject({ x: 1308, width: 46, height: 46 });
    await expectStyles(pin, { borderTopColor: "rgb(204, 204, 204)", color: "rgb(232, 98, 44)" });
    // `#p-dubai .st`: 58px with a 1.14 line height.
    await expectStyles(root.locator("h2"), { fontSize: "58px", lineHeight: "66.12px" });
    await expectStyles(root.locator("p.max-w-470"), {
      fontSize: "16px",
      lineHeight: "27.2px",
      marginTop: "62px",
      color: "rgb(85, 85, 85)",
    });
    const cta = root.getByRole("link", { name: "Our Process" });
    await expect(cta).toHaveAttribute("href", "/services/architecture#process");
    expect(await box(cta)).toMatchObject({ x: 823, height: 54 });
  });

  test("the cactus keeps its proportions on the bottom edge (KI-L08)", async ({ page }) => {
    await open(page);
    const plant = cactus(page);
    const rect = await box(plant);
    const root = await box(context(page));
    expect(rect.width).toBe(327);
    expect(rect.height / rect.width).toBeCloseTo(CACTUS_RATIO, 2);
    expect(rect.x + rect.width).toBe(1440 - 190);
    expect(rect.y + rect.height).toBeCloseTo(root.y + root.height, 0);
  });

  test("the context photo and the split photo open in the lightbox", async ({ page }) => {
    await open(page);
    for (const root of [context(page), section(page, 4)]) {
      await root.getByRole("button", { name: /^Enlarge image:/ }).click();
      const viewer = page.getByRole("dialog");
      await expect(viewer).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(viewer).toBeHidden();
    }
  });

  test("standard blocks: services, divisions, split, steps, features", async ({ page }) => {
    await open(page);
    const services = section(page, 2);
    await expect(services.locator("li a")).toHaveCount(7);
    await expect(services.getByRole("link", { name: "All Services" })).toHaveAttribute(
      "href",
      "/services",
    );
    await expect(section(page, 3).locator("li a")).toHaveCount(5);
    await expect(section(page, 3).locator("li a").first()).toHaveAttribute(
      "href",
      "/divisions/design",
    );
    const split = section(page, 4);
    await expect(split.locator("li")).toHaveCount(6);
    await expect(
      split.getByRole("link", { name: "Discuss a Cross-Border Project" }),
    ).toHaveAttribute("href", "#dubai-contact");
    await expect(section(page, 5).locator("li[data-step]")).toHaveCount(5);
    await expect(section(page, 6).locator("[data-feature]")).toHaveCount(4);
    // Every title on the page uses `#p-dubai .st` (1.14).
    for (const index of [2, 3, 4, 5, 6]) {
      await expectStyles(section(page, index).locator("h2"), { lineHeight: "66.12px" });
    }
  });

  test("office block: details, placeholders and directions", async ({ page }) => {
    await open(page);
    const root = office(page);
    expect((await box(root)).height).toBe(900);
    await expectStyles(root.locator(":scope > div"), {
      gridTemplateColumns: "602px 602px",
      columnGap: "64px",
    });
    const list = root.locator("dl");
    await expectStyles(list, {
      gridTemplateColumns: "150px 432px",
      rowGap: "18px",
      columnGap: "20px",
      marginTop: "36px",
    });
    await expect(list.locator("dt")).toHaveText(["Office", "Telephone", "Email", "Hours"]);
    await expectStyles(list.locator("dt").first(), {
      fontSize: "10px",
      fontWeight: "600",
      color: "rgb(194, 78, 30)",
    });
    await expectStyles(list.locator("dd").first(), { fontSize: "16px", lineHeight: "25.6px" });
    await expect(
      list.getByText("Address placeholder — replace with the confirmed office address."),
    ).toBeVisible();
    await expect(list.getByRole("link", { name: "+971 0 000 0000" })).toHaveAttribute(
      "href",
      "tel:+97100000000",
    );
    const directions = root.getByRole("link", { name: "Get Directions" });
    await expect(directions).toHaveAttribute("target", "_blank");
    expect((await box(directions)).height).toBe(52);
    const photo = root.locator("img");
    expect(await box(photo)).toMatchObject({ x: 752, width: 602 });
    expect((await box(photo)).height).toBeGreaterThanOrEqual(460);
  });

  test("project mosaic: rows, cards, links and hover", async ({ page }) => {
    await open(page);
    const root = projects(page);
    const rows = root.locator("ul");
    await expectStyles(rows.nth(0), { gridTemplateColumns: "765px 479px", marginTop: "62px" });
    await expectStyles(rows.nth(1), { gridTemplateColumns: "528px 716px", marginTop: "30px" });
    const cards = root.locator("li a");
    await expect(cards).toHaveCount(4);
    await expect(cards.locator("b")).toHaveText([
      "Jumeirah Courtyard House",
      "Palm Residence",
      "Desert Edge Villa",
      "DIFC Gallery Office",
    ]);
    // P7-02: projects without their own page link to the Courtyard House.
    for (const href of await cards.evaluateAll((els) => els.map((el) => el.getAttribute("href"))))
      expect(href).toBe("/works/the-courtyard-house");
    expect((await box(cards.nth(0).locator("img"))).height).toBe(475);
    expect((await box(cards.nth(2).locator("img"))).height).toBe(445);
    await expectStyles(cards.first().locator("b"), {
      fontSize: "26px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(root.locator("h2"), { color: "rgb(244, 244, 244)" });
    const image = cards.first().locator("img");
    await image.scrollIntoViewIfNeeded();
    await expectStyles(image, { scale: "none", transitionDuration: "0.8s" });
    await cards.first().hover();
    await expect.poll(() => image.evaluate((el) => getComputedStyle(el).scale)).toBe("1.04");
    const more = root.getByRole("link", { name: "View Our Work" });
    await expect(more).toHaveAttribute("href", "/works#works-list");
    await expectStyles(more, { height: "54px", color: "rgb(238, 238, 238)" });
  });

  test("contact: the page's own section (white), fields in the original's order", async ({
    page,
  }) => {
    await open(page);
    const root = contact(page);
    expect((await box(root)).height).toBe(900);
    await expect(root).toHaveAttribute("data-contact-section", "");
    await expectStyles(root.locator(":scope > div"), { gridTemplateColumns: "588px 640px" });
    await expect(root.locator("h2")).toHaveText("Start Your Projectin Dubai or India");
    await expectStyles(root.locator("h2 .text-brand"), { color: "rgb(232, 98, 44)" });
    await expect(root.locator("dt")).toHaveText(["Email", "Phone", "WhatsApp"]);
    await expect(root.getByRole("link", { name: "Chat with our team" })).toHaveAttribute(
      "target",
      "_blank",
    );
    const labels = await root.locator("form label").allTextContents();
    expect(labels.slice(0, 7)).toEqual([
      "Full Name",
      "Email",
      "Phone",
      "Service Needed",
      "Project Location",
      "Project Type",
      "Project Details",
    ]);
    await expect(root.getByLabel("Project Location").locator("option")).toHaveText([
      "Select",
      "Dubai / UAE",
      "Kerala, India",
      "Elsewhere in India",
    ]);
    await expectStyles(root.locator("button[type=submit]"), { color: "rgb(255, 255, 255)" });
  });

  test("internal links resolve (no 404)", async ({ page }) => {
    await open(page);
    const hrefs = await page
      .locator("main a[href^='/']")
      .evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? ""));
    const paths = [...new Set(hrefs.map((href) => href.split("#")[0] ?? ""))];
    expect(paths.length).toBeGreaterThan(10);
    for (const path of paths) {
      const response = await page.request.get(path);
      expect(response.status(), path).toBe(200);
    }
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("1024 (≤1099)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("titles scale (KI-L16, KI-N04) and the bespoke blocks collapse", async ({ page }) => {
    await open(page);
    await expectStyles(section(page, 0).locator("h1"), { fontSize: "62px" });
    await expect(section(page, 0).getByText("UAE · RESIDENTIAL · COMMERCIAL")).toBeVisible();
    for (const root of [context(page), office(page), projects(page)])
      await expectStyles(root.locator("h2"), { fontSize: "46px" });
    await expectStyles(context(page).locator(":scope > div"), {
      gridTemplateColumns: "952px",
      rowGap: "74px",
    });
    await expectStyles(office(page).locator(":scope > div"), {
      gridTemplateColumns: "952px",
      rowGap: "28px",
    });
    await expectStyles(projects(page).locator("ul").first(), {
      gridTemplateColumns: "952px",
      rowGap: "36px",
    });
    const plant = await box(cactus(page));
    expect(plant.width).toBe(327);
    expect(plant.height / plant.width).toBeCloseTo(CACTUS_RATIO, 2);
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("768 (≤860)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("the bottom bar is hidden; no horizontal overflow", async ({ page }) => {
    await open(page);
    await expect(section(page, 0).getByText("UAE · RESIDENTIAL · COMMERCIAL")).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("390 (phone)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero sits at the bottom with stacked buttons; no bottom bar", async ({ page }) => {
    await open(page);
    const hero = section(page, 0);
    const start = await box(hero.getByRole("link", { name: "Start a Project" }));
    const services = await box(hero.getByRole("link", { name: "Explore Our Services" }));
    expect(start).toMatchObject({ x: 20, width: 350, height: 50 });
    expect(services.y - start.y).toBe(60);
    expect(services.y + services.height).toBe(844 - 40);
    await expect(hero.getByRole("link", { name: "SCROLL TO EXPLORE" })).toBeHidden();
  });

  test("the cactus is 240px with its proportions, not 92px (KI-L25, KI-L08)", async ({ page }) => {
    await open(page);
    const plant = await box(cactus(page));
    const root = await box(context(page));
    expect(plant).toMatchObject({ x: 10, width: 240 });
    expect(plant.height / plant.width).toBeCloseTo(CACTUS_RATIO, 2);
    expect(plant.y + plant.height).toBeCloseTo(root.y + root.height, 0);
    // The button sits above the room made for the plant.
    const button = await box(context(page).getByRole("link", { name: "Our Process" }));
    expect(button.y + button.height).toBeLessThan(plant.y);
  });

  test("project names never cover their label (KI-L10)", async ({ page }) => {
    await open(page);
    const card = projects(page).locator("li a").first();
    const label = await box(card.locator("small"));
    const name = await box(card.locator("b"));
    expect(name.height).toBeGreaterThan(40); // wraps to two lines
    expect(label.y + label.height).toBeLessThanOrEqual(name.y + 1);
  });

  test("small text in the bespoke blocks is at least 11px (KI-A10)", async ({ page }) => {
    await open(page);
    const sizes = await page
      .locator("#dubai-context, #dubai-office, [data-parity=s5]")
      .evaluateAll((roots) =>
        roots.flatMap((root) =>
          [...root.querySelectorAll<HTMLElement>("p, span, small, dt, dd, a")]
            .filter((el) => el.offsetParent !== null && el.textContent.trim() !== "")
            .map((el) => Number.parseFloat(getComputedStyle(el).fontSize)),
        ),
      );
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});
