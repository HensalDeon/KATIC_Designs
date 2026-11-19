import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Division pages (`/divisions/<slug>`, original `#p-div-<slug>`, docs/analysis/04 §3). Expected
 * values are the ORIGINAL's rendered output (probed at 1440/1024/768/390); deliberate deviations
 * carry their KNOWN_ISSUES id.
 *
 * Every page gets the shared checks through `describeDivisionPage(spec)`; page-specific checks
 * follow in their own `test.describe`.
 */

type Tone = "light" | "dark";
type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

type DivisionPageSpec = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** Service "Start a Project" preselects in the popup (the original `PREFILL`); none = "". */
  readonly service: string;
  /** Blocks after the hero: the `data-parity` class (no block has an id) and tone. */
  readonly blocks: readonly (readonly ["ks" | "pp-host", Tone])[];
  readonly process: { readonly heading: RegExp };
  readonly projects?: { readonly heading: RegExp; readonly count: number };
  /** A split CTA (`btn.orf`, `data-go="contact" data-svc`). */
  readonly splitCta?: { readonly name: string; readonly service: string };
  /** A zoomable split photo (its alt). */
  readonly zoomImage: string;
  /** y of the hero buttons on the canvas: 494.8 under a two-line lead, 465.9 under one. */
  readonly ctaY: number;
};

const SLUGS = ["design", "interior", "infrastructure", "developers", "care"] as const;
const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const ORANGE = "rgb(232, 98, 44)";

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

async function open(page: Page, slug: string) {
  await page.goto(`/divisions/${slug}`);
  await page.evaluate(() => document.fonts.ready);
}

const sectionByHeading = (page: Page, heading: string | RegExp) =>
  page.locator("main > section").filter({ has: page.getByRole("heading", { name: heading }) });

const popup = (page: Page) => page.getByRole("dialog", { name: /Let’s build/ });

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

function describeDivisionPage(spec: DivisionPageSpec) {
  const others = SLUGS.filter((slug) => slug !== spec.slug).map((slug) => `/divisions/${slug}`);

  test.describe(`/divisions/${spec.slug}`, () => {
    test.describe("1440 canvas", () => {
      test.use({ viewport: { width: 1440, height: 900 } });

      test("metadata is the original's data-title / data-desc", async ({ page }) => {
        await open(page, spec.slug);
        await expect(page).toHaveTitle(spec.title);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
          "content",
          spec.description,
        );
      });

      test("blocks keep the original order and alternating tones, no contact section", async ({
        page,
      }) => {
        await open(page, spec.slug);
        const sections = await page.locator("main > section").evaluateAll((all) =>
          all.map((section) => ({
            key: section.hasAttribute("data-hero")
              ? "hero"
              : section.id || (section.getAttribute("data-parity") ?? ""),
            tone: section.getAttribute("data-tone"),
            background: getComputedStyle(section).backgroundColor,
            height: section.getBoundingClientRect().height,
          })),
        );
        const expected = [["hero", "dark"], ...spec.blocks];
        expect(sections.map(({ key, tone }) => [key, tone])).toEqual(expected);
        expect(sections.slice(1).map(({ background }) => background)).toEqual(
          expected.slice(1).map(([, tone]) => (tone === "light" ? WHITE : BLACK)),
        );
        // At least one screen each; content taller than that grows instead of zooming (KI-L13).
        for (const { height } of sections) expect(height).toBeGreaterThanOrEqual(900);
        await expect(page.locator("[data-contact-section]")).toHaveCount(0);
        await expect(page.locator("[data-parity=footer]")).toBeAttached();
      });

      test("nothing reveals on scroll (the original has no [data-rv] here, D7)", async ({
        page,
      }) => {
        await open(page, spec.slug);
        await expect(page.locator("main [data-reveal]")).toHaveCount(0);
        await expect(page.locator("[data-rv]")).toHaveCount(0);
      });

      test("hero type and buttons", async ({ page }) => {
        await open(page, spec.slug);
        const hero = page.locator("[data-hero]");
        const name = spec.slug === "developers" ? "Developers" : undefined;
        await expect(hero.locator("h1")).toHaveText(new RegExp(`^KATIC ${name ?? "[A-Z][a-z]+"}$`));
        await expectStyles(hero.locator("h1"), {
          fontSize: "74px",
          lineHeight: "74px",
          color: WHITE,
        });
        await expectStyles(hero.locator("h1 span"), { color: ORANGE });
        await expectStyles(hero.locator("h1 + p"), { fontSize: "17px", maxWidth: "640px" });
        await expect(hero.getByText(/^KATIC Divisions · KATIC /)).toBeVisible();

        const start = hero.getByRole("button", { name: "Start a Project" });
        const box = await start.boundingBox();
        // Original: the cream button at (86, ctaY), 170.6 × 54.
        expect(box?.x).toBe(86);
        expect(box?.y).toBeCloseTo(spec.ctaY, 0);
        expect(box?.width).toBeCloseTo(170.6, 0);
        expect(box?.height).toBe(54);
        await expectStyles(start, { backgroundColor: "rgb(247, 244, 239)" });
        const projects = hero.getByRole("link", { name: "View Projects" });
        await expect(projects).toHaveAttribute("href", "/works#works-list");
        expect((await projects.boundingBox())?.height).toBe(54);
      });

      test("Start a Project opens the popup with the division's service", async ({ page }) => {
        await open(page, spec.slug);
        await page.locator("[data-hero]").getByRole("button", { name: "Start a Project" }).click();
        await expect(popup(page)).toBeVisible();
        await expect(popup(page).getByLabel("Service needed")).toHaveValue(spec.service);
        await expect(page).toHaveURL(new RegExp(`/divisions/${spec.slug}$`));
      });

      if (spec.splitCta) {
        const cta = spec.splitCta;
        test(`"${cta.name}" opens the popup with ${cta.service}`, async ({ page }) => {
          await open(page, spec.slug);
          const button = page.getByRole("button", { name: cta.name });
          await expectStyles(button, { backgroundColor: ORANGE, height: "52px" });
          await button.click();
          await expect(popup(page).getByLabel("Service needed")).toHaveValue(cta.service);
        });
      }

      test("section titles and process steps", async ({ page }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("main > section h2").nth(1), {
          fontSize: "58px",
          lineHeight: "64.96px",
          textTransform: "uppercase",
        });
        const process = sectionByHeading(page, spec.process.heading);
        const tone = await process.getAttribute("data-tone");
        await expectStyles(process.locator("li[data-step] h3").first(), {
          fontSize: "30px",
          color: tone === "light" ? "rgb(17, 17, 17)" : WHITE,
        });
        await expectStyles(process.locator("li[data-step] svg").first(), { height: "170px" });
      });

      test("process line art draws on when scrolled into view", async ({ page }) => {
        await open(page, spec.slug);
        const process = sectionByHeading(page, spec.process.heading);
        await expect(process.locator("[data-drawn]")).toHaveCount(0);
        await process.locator("li[data-step]").first().scrollIntoViewIfNeeded();
        await expect(process.locator("[data-drawn]")).toHaveCount(1);
      });

      test("ends with the other four divisions, never itself", async ({ page }) => {
        await open(page, spec.slug);
        const last = page.locator("main > section").last();
        await expect(last.getByRole("heading", { level: 2 })).toHaveText(
          "One vision.Five divisions.",
        );
        const links = last.getByRole("link");
        expect(await links.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
          others,
        );
        await expect(page.locator(`main a[href="/divisions/${spec.slug}"]`)).toHaveCount(0);
        await expectStyles(links.first().locator("span").first(), { height: "260px" });
        await expect(links.first()).toContainText("Explore Division");
        await links.first().hover();
        await expect(links.first().locator("h3")).toHaveCSS("color", ORANGE);
      });

      if (spec.projects) {
        const projects = spec.projects;
        test("featured project cards link to built project pages", async ({ page, request }) => {
          await open(page, spec.slug);
          const cards = sectionByHeading(page, projects.heading).locator("li a");
          await expect(cards).toHaveCount(projects.count);
          await expectStyles(cards.first().locator("span").first(), { height: "200px" });
          const hrefs = await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href")));
          for (const href of hrefs) {
            expect(href).toMatch(/^\/works\/[a-z-]+$/);
            expect((await request.get(href ?? "")).status(), href ?? "").toBe(200);
          }
        });
      }

      test("split photos open in the lightbox", async ({ page }) => {
        await open(page, spec.slug);
        await page.getByRole("button", { name: `Enlarge image: ${spec.zoomImage}` }).click();
        const viewer = page.getByRole("dialog");
        await expect(viewer).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(viewer).toBeHidden();
      });
    });

    test.describe("1024 (≤1099)", () => {
      test.use({ viewport: { width: 1024, height: 768 } });

      test("titles scale (KI-L16, KI-N04) and card grids go to two columns", async ({ page }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("[data-hero] h1"), { fontSize: "62px" });
        await expectStyles(page.locator("main > section h2").nth(1), { fontSize: "46px" });
        const grid = page.locator("main > section").last().locator("ul");
        const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
        expect(columns.split(" ")).toHaveLength(2);
      });
    });

    test.describe("390 (phone)", () => {
      test.use({ viewport: { width: 390, height: 844 } });

      test("small text is at least 11px (KI-A10)", async ({ page }) => {
        await open(page, spec.slug);
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

      test("hero buttons stack full width", async ({ page }) => {
        await open(page, spec.slug);
        const hero = page.locator("[data-hero]");
        for (const button of [
          hero.getByRole("button", { name: "Start a Project" }),
          hero.getByRole("link", { name: "View Projects" }),
        ]) {
          const box = await button.boundingBox();
          expect(box?.width).toBe(350);
          expect(box?.height).toBe(50);
        }
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
        await open(page, spec.slug);
        const { scroll, client } = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(scroll).toBeLessThanOrEqual(client);
      });
    }
  });
}

describeDivisionPage({
  slug: "design",
  ctaY: 494.8,
  title: "KATIC Design | Architecture & Planning Division",
  description:
    "KATIC Design delivers architecture, planning and facade design shaped by site, climate and purpose.",
  service: "Architectural Design",
  blocks: [
    ["ks", "light"],
    ["pp-host", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  process: { heading: /From brief to/ },
  projects: { heading: /Architecture/, count: 3 },
  splitCta: { name: "Start a Design Brief", service: "Architectural Design" },
  zoomImage: "Architect reviewing drawings on a forested site",
});

describeDivisionPage({
  slug: "interior",
  ctaY: 465.9,
  title: "KATIC Interior | Interiors & In-house Manufacturing",
  description:
    "KATIC Interior designs, manufactures and installs interiors, furniture and joinery under one team.",
  service: "Interior Design",
  blocks: [
    ["pp-host", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
  ],
  process: { heading: /Design, make/ },
  projects: { heading: /Interiors across/, count: 3 },
  zoomImage: "Bedroom with a teak screen and wardrobe",
});

describeDivisionPage({
  slug: "infrastructure",
  ctaY: 494.8,
  title: "KATIC Infrastructure | Construction & Execution Division",
  description:
    "KATIC Infrastructure builds homes, workplaces, institutions and hospitality projects to the drawing and on programme.",
  service: "Construction & Execution",
  blocks: [
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["pp-host", "dark"],
    ["ks", "light"],
  ],
  process: { heading: /How we/ },
  projects: { heading: /Built by/, count: 3 },
  splitCta: { name: "Request a Build Quote", service: "Construction & Execution" },
  zoomImage: "Construction team reviewing drawings on site",
});

describeDivisionPage({
  slug: "developers",
  ctaY: 465.9,
  title: "KATIC Developers | Design-led Residential & Commercial Developments",
  description:
    "Design-led villas, apartments and commercial developments in Kerala, from land to handover.",
  service: "",
  blocks: [
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  process: { heading: /From opportunity/ },
  projects: { heading: /Completed, ongoing/, count: 3 },
  zoomImage: "Mid-rise apartment tower with planted balconies",
});

describeDivisionPage({
  slug: "care",
  ctaY: 465.9,
  title: "KATIC Care | Property Maintenance & Care",
  description:
    "Maintenance, repairs and inspections that protect your property’s value long after handover.",
  service: "Property Care & Maintenance",
  blocks: [
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
  ],
  process: { heading: /Care, step/ },
  splitCta: { name: "Request Support", service: "Property Care & Maintenance" },
  zoomImage: "Two homeowners walking through a finished interior with timber shelving",
});

test.describe("/divisions/developers blocks", () => {
  test("development focus cards are not links; featured developments carry status tags", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "developers");
    const focus = sectionByHeading(page, /What we/);
    await expect(focus.locator("li")).toHaveCount(4);
    await expect(focus.getByRole("link")).toHaveCount(0);
    await expectStyles(focus.locator("li h3").first(), { fontSize: "23px", color: WHITE });
    await expectStyles(focus.locator("li p").first(), { fontSize: "13px" });

    const tags = sectionByHeading(page, /Completed, ongoing/).locator("li a span span");
    await expect(tags).toHaveText(["Completed", "Ongoing", "Upcoming"]);
    // Original `.kc .im .tg`: Inter 600 8.5px, #111 on white, 7px 10px, 16px from the corner.
    await expectStyles(tags.first(), {
      fontSize: "8.5px",
      fontWeight: "600",
      letterSpacing: "1.36px",
      color: WHITE,
      backgroundColor: "rgb(17, 17, 17)",
      // 7px vertical padding in the original; the shared tag is a 24px centred flex box (same box).
      paddingLeft: "10px",
      top: "16px",
      left: "16px",
    });
    expect((await tags.first().boundingBox())?.height).toBeCloseTo(24, 0);

    const backed = sectionByHeading(page, /Backed by three/);
    expect(
      await backed.getByRole("link").evaluateAll((all) => all.map((a) => a.getAttribute("href"))),
    ).toEqual(["/divisions/design", "/divisions/interior", "/divisions/infrastructure"]);
  });
});

test.describe("/divisions/care blocks", () => {
  test("sector tiles filter the works list", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "care");
    const sectors = sectionByHeading(page, /Properties/).getByRole("link");
    expect(await sectors.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
      ["residential", "commercial", "institutional", "hospitality"].map(
        (category) => `/works?category=${category}#works-list`,
      ),
    );
  });
});

test.describe("/divisions/interior factory gallery", () => {
  test("opens the lightbox and links to the factory", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "interior");
    const gallery = sectionByHeading(page, /Our own/);
    await expect(gallery.locator("figure")).toHaveCount(3);
    await expect(gallery.getByRole("link", { name: "Visit the Factory" })).toHaveAttribute(
      "href",
      "/services/factory",
    );
    await gallery.getByRole("button", { name: /Kitchen island/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test("unknown division slugs answer 404", async ({ request }) => {
  for (const slug of ["nope", "constructor", "div-design"]) {
    const response = await request.get(`/divisions/${slug}`);
    expect(response.status(), slug).toBe(404);
  }
});
