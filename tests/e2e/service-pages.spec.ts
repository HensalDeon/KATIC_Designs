import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Service detail pages (`/services/<slug>`, original `#p-<slug>`, docs/analysis/03). Expected
 * values are the ORIGINAL's rendered output (probed at 1440/1024/768/390); deliberate deviations
 * carry their KNOWN_ISSUES id.
 *
 * Every page gets the shared checks through `describeServicePage(spec)`. To add a page, write its
 * `ServicePageSpec` and call `describeServicePage` with it (plus a `test.describe` for anything
 * page-specific).
 */

type Tone = "light" | "dark";
type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

type HeroCta = { readonly name: string; readonly href: string };

type ServicePageSpec = {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** Option the hero CTA preselects in the enquiry form (`data-svc`). */
  readonly service: string;
  readonly heroCtas: readonly [HeroCta, ...HeroCta[]];
  /** Sections after the hero: original id, or the `data-parity` class for blocks without one. */
  readonly sections: readonly (readonly [key: string, tone: Tone])[];
  readonly contactTone: Tone;
  /**
   * Process steps: title size and art height (dense rows of 6+ steps are smaller). Omit for pages
   * without a process block (exterior).
   */
  readonly process?: {
    readonly heading: RegExp;
    readonly titleSize: string;
    readonly artHeight: string;
  };
  /**
   * Featured-project cards: image height on the canvas (c3 200px, c4 260px). Omit for pages without
   * a projects block (property care).
   */
  readonly projects?: {
    readonly heading: RegExp;
    readonly imageHeight: string;
    readonly count: number;
  };
  readonly related: { readonly heading: RegExp; readonly hrefs: readonly string[] };
  /** A zoomable split photo (its alt). */
  readonly zoomImage: string;
};

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
  await page.goto(`/services/${slug}`);
  await page.evaluate(() => document.fonts.ready);
}

const sectionByHeading = (page: Page, heading: string | RegExp) =>
  page.locator("main > section").filter({ has: page.getByRole("heading", { name: heading }) });

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

function describeServicePage(spec: ServicePageSpec) {
  const contactId = `${spec.slug}-contact`;
  const contact = (page: Page) => page.locator(`#${contactId}`);

  test.describe(`/services/${spec.slug}`, () => {
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

      test("sections keep the original order, ids and alternating tones", async ({ page }) => {
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
        const expected = [["hero", "dark"], ...spec.sections, [contactId, spec.contactTone]];
        expect(sections.map(({ key, tone }) => [key, tone])).toEqual(expected);
        expect(sections.slice(1).map(({ background }) => background)).toEqual(
          expected.slice(1).map(([, tone]) => (tone === "light" ? WHITE : BLACK)),
        );
        // At least one screen each; content taller than that grows instead of zooming (KI-L13).
        for (const { height } of sections) expect(height).toBeGreaterThanOrEqual(900);
        await expect(page.locator("[data-parity=footer]")).toBeAttached();
      });

      test("nothing reveals on scroll (reveals are home-only, D7)", async ({ page }) => {
        await open(page, spec.slug);
        await expect(page.locator("main [data-reveal]")).toHaveCount(0);
        await expect(page.locator("[data-rv]")).toHaveCount(0);
      });

      test("hero type, buttons and links", async ({ page }) => {
        await open(page, spec.slug);
        const hero = page.locator("[data-hero]");
        await expectStyles(hero.locator("h1"), {
          fontSize: "74px",
          lineHeight: "74px",
          fontWeight: "700",
          color: WHITE,
        });
        await expectStyles(hero.locator("h1 span"), { color: ORANGE });
        await expectStyles(hero.locator("h1 + p"), {
          fontSize: "17px",
          lineHeight: "28.9px",
          color: "rgb(238, 238, 238)",
          maxWidth: "640px",
        });
        for (const [index, cta] of spec.heroCtas.entries()) {
          const link = hero.getByRole("link", { name: cta.name });
          await expect(link).toHaveAttribute("href", cta.href);
          const box = await link.boundingBox();
          expect(box?.height).toBe(54);
          if (index > 0) continue;
          // Original: the cream button at (86, 568.8).
          expect(box?.x).toBe(86);
          expect(box?.y).toBeCloseTo(568.8, 0);
          await expectStyles(link, { backgroundColor: "rgb(247, 244, 239)" });
        }
      });

      test("section titles, process steps and project cards", async ({ page }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("main > section h2").nth(1), {
          fontSize: "58px",
          lineHeight: "64.96px",
          textTransform: "uppercase",
        });
        if (spec.process) {
          const process = sectionByHeading(page, spec.process.heading);
          await expectStyles(process.locator("li[data-step] h3").first(), {
            fontSize: spec.process.titleSize,
            color: WHITE,
          });
          await expectStyles(process.locator("li[data-step] svg").first(), {
            height: spec.process.artHeight,
          });
        }
        if (spec.projects) {
          const projects = sectionByHeading(page, spec.projects.heading);
          const cards = projects.locator("li a");
          await expect(cards).toHaveCount(spec.projects.count);
          await expectStyles(cards.first().locator("span").first(), {
            height: spec.projects.imageHeight,
          });
          const hrefs = await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href")));
          for (const href of hrefs) expect(href).toMatch(/^\/works\/[a-z-]+$/);
        }
      });

      test("process line art draws on when scrolled into view", async ({ page }) => {
        test.skip(!spec.process, "no process block");
        if (!spec.process) return;
        await open(page, spec.slug);
        const process = sectionByHeading(page, spec.process.heading);
        await expect(process.locator("[data-drawn]")).toHaveCount(0);
        await process.locator("li[data-step]").first().scrollIntoViewIfNeeded();
        await expect(process.locator("[data-drawn]")).toHaveCount(1);
      });

      test("the hero CTA scrolls to the form and preselects the page's service", async ({
        page,
      }) => {
        await open(page, spec.slug);
        const service = contact(page).getByLabel("Service Needed");
        await expect(service).toHaveValue(spec.service);
        // Pick another service first, so the click has something to change.
        await service.selectOption(
          spec.service === "Turnkey Projects" ? "Interior Design" : "Turnkey Projects",
        );
        await page.evaluate(() => window.scrollTo(0, 0));

        await page
          .locator("[data-hero]")
          .getByRole("link", { name: spec.heroCtas[0].name })
          .click();
        await expect(contact(page).getByLabel("Full Name")).toBeFocused();
        await expect(service).toHaveValue(spec.service);
        // A long smooth scroll can outlast the 1s focus fallback, so wait for it to land.
        await expect
          .poll(() => contact(page).evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
          .toBeLessThan(4);
      });

      test("contact + FAQ tone and single-open accordion", async ({ page }) => {
        await open(page, spec.slug);
        const section = contact(page);
        await expectStyles(section.locator("h2").first(), {
          fontSize: "44px",
          color: spec.contactTone === "light" ? BLACK : WHITE,
        });
        const questions = section.locator("h3 > button");
        await expect(questions).toHaveCount(5);
        await expectStyles(questions.first(), { fontSize: "15.5px" });
        await expect(questions.first()).toHaveAttribute("aria-expanded", "true");
        await questions.nth(1).click();
        await expect(questions.nth(1)).toHaveAttribute("aria-expanded", "true");
        await expect(questions.first()).toHaveAttribute("aria-expanded", "false");
        await expect(section.getByRole("region").nth(1)).toBeVisible();
      });

      test("related services link to their pages and highlight on hover", async ({ page }) => {
        await open(page, spec.slug);
        const cards = sectionByHeading(page, spec.related.heading).locator("li a");
        expect(await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
          spec.related.hrefs,
        );
        await cards.first().hover();
        await expect(cards.first().locator("h3")).toHaveCSS("color", ORANGE);
      });

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

      test("titles scale (KI-L16, KI-N04) and the testimonials leave no orphan (KI-L23)", async ({
        page,
      }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("[data-hero] h1"), { fontSize: "62px" });
        await expectStyles(page.locator("main > section h2").nth(1), { fontSize: "46px" });
        const quotes = sectionByHeading(page, /In our clients/).locator("li");
        const [first, last] = [
          await quotes.first().boundingBox(),
          await quotes.last().boundingBox(),
        ];
        expect(last?.width).toBeGreaterThan((first?.width ?? 0) * 1.9);
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

const RELATED = (...slugs: string[]) => slugs.map((slug) => `/services/${slug}`);

describeServicePage({
  slug: "turnkey",
  title: "Turnkey Home & Building Projects in Kerala | Katic Designs",
  description:
    "One team and one contract for design, approvals, construction, interiors and handover. Turnkey villas, homes and commercial projects in Kerala and the UAE.",
  service: "Turnkey Projects",
  heroCtas: [
    { name: "Get a Turnkey Plan", href: "#turnkey-contact" },
    { name: "See Turnkey Projects", href: "/works#works-list" },
  ],
  sections: [
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
  ],
  contactTone: "dark",
  process: { heading: /Eight stages/, titleSize: "22px", artHeight: "120px" },
  projects: { heading: /Integrated/, imageHeight: "200px", count: 3 },
  related: { heading: /Explore the/, hrefs: RELATED("architecture", "interior", "construction") },
  zoomImage: "Courtyard facade lit at night",
});

describeServicePage({
  slug: "interior",
  title: "Interior Designers in Kochi, Kerala | Interior Design | Katic Designs",
  description:
    "Interior design with in-house joinery and furniture: space planning, materials, lighting and installation for homes, apartments and offices in Kerala and Dubai.",
  service: "Interior Design",
  heroCtas: [
    { name: "Discuss Your Interior", href: "#interior-contact" },
    { name: "View Interior Projects", href: "/works?category=interiors#works-list" },
  ],
  sections: [
    ["ks", "light"],
    ["interior-services", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  contactTone: "light",
  process: { heading: /How we take/, titleSize: "30px", artHeight: "170px" },
  projects: { heading: /Interiors across/, imageHeight: "260px", count: 4 },
  related: {
    heading: /alongside interiors/,
    hrefs: RELATED("architecture", "construction", "turnkey"),
  },
  zoomImage: "Timber lounge chair by a curtained window",
});

test.describe("/services/interior FAQ links", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("land on the page's services rows (KI-F08) and the form (KI-F07)", async ({ page }) => {
    await open(page, "interior");
    const faq = page.locator("#interior-contact");
    await expect(faq.getByRole("link", { name: /See our interior services/ })).toHaveAttribute(
      "href",
      "#interior-services",
    );
    await expect(page.locator("#interior-services")).toBeAttached();
    await faq.getByRole("button", { name: /How do you plan the budget/ }).click();
    const quote = faq.getByRole("button", { name: /Ask for a quote/ });
    await faq.getByLabel("Service Needed").selectOption("Turnkey Projects");
    await quote.click();
    await expect(faq.getByLabel("Full Name")).toBeFocused();
    await expect(faq.getByLabel("Service Needed")).toHaveValue("Interior Design");
  });
});

describeServicePage({
  slug: "exterior",
  title: "Landscape & Exterior Design in Kerala | Katic Designs",
  description:
    "Facade, garden, courtyard and outdoor living design planned together with the building, for homes, campuses and commercial sites.",
  service: "Exterior & Landscape Design",
  heroCtas: [
    { name: "Discuss Your Outdoor Space", href: "#exterior-contact" },
    { name: "View Projects", href: "/works#works-list" },
  ],
  // The plant-hosting testimonials block is `section.pp-host.ks` in the original.
  sections: [
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["pp-host", "light"],
  ],
  contactTone: "dark",
  projects: { heading: /Outdoor spaces/, imageHeight: "200px", count: 3 },
  related: {
    heading: /alongside landscape/,
    hrefs: RELATED("architecture", "interior", "construction"),
  },
  zoomImage: "Planted courtyard with a tree and timber balconies",
});

test.describe("/services/exterior specifics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("five sector tiles in one row; the outdoor tile is not a link", async ({ page }) => {
    await open(page, "exterior");
    const tiles = sectionByHeading(page, /Where we/).locator("li");
    await expect(tiles).toHaveCount(5);
    const boxes = await tiles.evaluateAll((all) =>
      all.map((tile) => {
        const { y, width, height } = tile.getBoundingClientRect();
        return { y, width, height };
      }),
    );
    for (const box of boxes) expect(box).toMatchObject({ y: boxes[0]?.y, height: 400 });
    await expect(tiles.locator("a")).toHaveCount(4);
    await expect(tiles.last()).toContainText("Outdoor environments");
  });

  test("the projects block is dark with a light outline button", async ({ page }) => {
    await open(page, "exterior");
    const projects = sectionByHeading(page, /Outdoor spaces/);
    await expect(projects).toHaveAttribute("data-tone", "dark");
    await expect(projects.getByRole("link", { name: /View All Projects/ })).toHaveAttribute(
      "href",
      "/works#works-list",
    );
  });

  test("the testimonials host the ageratum plant in the bottom-left corner", async ({ page }) => {
    await open(page, "exterior");
    const testimonials = sectionByHeading(page, /In our clients/);
    const plant = testimonials.locator("img[aria-hidden]");
    await expect(plant).toHaveCount(1);
    const [section, box] = [await testimonials.boundingBox(), await plant.boundingBox()];
    expect(box?.x).toBe(section?.x);
    expect(box?.width).toBe(222);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeCloseTo(
      (section?.y ?? 0) + (section?.height ?? 0),
      0,
    );
  });

  test("the FAQ links to property care", async ({ page }) => {
    await open(page, "exterior");
    const faq = page.locator("#exterior-contact");
    await faq.getByRole("button", { name: /low maintenance/ }).click();
    await expect(faq.getByRole("link", { name: /About property care/ })).toHaveAttribute(
      "href",
      "/services/property-care",
    );
  });
});

describeServicePage({
  slug: "property-care",
  title: "Property Maintenance & Repairs in Kerala | Katic Care",
  description:
    "Planned maintenance, repairs, pre-monsoon inspections and priority support for homes and commercial properties in Kerala and the UAE.",
  service: "Property Care & Maintenance",
  heroCtas: [
    { name: "Request Support", href: "#property-care-contact" },
    { name: "Our Services", href: "#pc-services" },
  ],
  sections: [
    ["pp-host", "light"],
    ["pc-services", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
  ],
  contactTone: "dark",
  process: { heading: /Assess\. Plan\./, titleSize: "30px", artHeight: "170px" },
  related: {
    heading: /alongside property care/,
    hrefs: RELATED("construction", "renovation", "interior", "turnkey"),
  },
  zoomImage: "Bathroom with Kota stone and a courtyard view",
});

test.describe("/services/property-care specifics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("#pc-services deep-links to the services grid", async ({ page }) => {
    await page.goto("/services/property-care#pc-services");
    const services = page.locator("#pc-services");
    await expect(services).toContainText("What we");
    await expect
      .poll(() => services.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(4);

    await open(page, "property-care");
    await page.locator("[data-hero]").getByRole("link", { name: "Our Services" }).click();
    await expect(page).toHaveURL(/#pc-services$/);
    await expect
      .poll(() => services.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(4);
  });

  test("six service tiles in three columns draw on; four related services in one row", async ({
    page,
  }) => {
    await open(page, "property-care");
    const services = page.locator("#pc-services");
    const tiles = services.locator("[data-feature]");
    await expect(tiles).toHaveCount(6);
    // The isometric icons draw on once the grid is in view.
    await expect(services.locator("[data-drawn]")).toHaveCount(0);
    await tiles.first().scrollIntoViewIfNeeded();
    await expect(services.locator("[data-drawn]")).toHaveCount(1);
    const tileTops = await tiles.evaluateAll((all) =>
      all.map((tile) => tile.getBoundingClientRect().top),
    );
    expect(new Set(tileTops).size).toBe(2);
    const related = sectionByHeading(page, /alongside property care/).locator("li");
    await expect(related).toHaveCount(4);
    const relatedTops = await related.evaluateAll((all) =>
      all.map((card) => card.getBoundingClientRect().top),
    );
    expect(new Set(relatedTops).size).toBe(1);
  });

  test("the intro split hosts the fern in the bottom-right corner", async ({ page }) => {
    await open(page, "property-care");
    const intro = page.locator("main > section").nth(1);
    const plant = intro.locator("img[aria-hidden]");
    await expect(plant).toHaveCount(1);
    const [section, box] = [await intro.boundingBox(), await plant.boundingBox()];
    expect(box?.width).toBe(170);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeCloseTo(
      (section?.x ?? 0) + (section?.width ?? 0),
      0,
    );
  });

  test("on phones the fern gets its own room below the content", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await open(page, "property-care");
    const intro = page.locator("main > section").nth(1);
    const plant = await intro.locator("img[aria-hidden]").boundingBox();
    const padding = await intro.evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
    // Original JS 5285–5293: 80px + 95% of the 58%-size plant (KI-X06, done statically).
    expect(plant?.width).toBeCloseTo(170 * 0.58, 0);
    expect(padding).toBeCloseTo(80 + (plant?.height ?? 0) * 0.95, 0);
  });

  test("FAQ links: locations, and the form (KI-F07)", async ({ page }) => {
    await open(page, "property-care");
    const faq = page.locator("#property-care-contact");
    await faq.getByRole("button", { name: /Which areas do you cover/ }).click();
    await expect(faq.getByRole("link", { name: /See our locations/ })).toHaveAttribute(
      "href",
      "/locations/india",
    );
    await faq.getByRole("button", { name: /How fast do you respond/ }).click();
    await faq.getByLabel("Service Needed").selectOption("Turnkey Projects");
    await faq.getByRole("button", { name: /Request support/ }).click();
    await expect(faq.getByLabel("Full Name")).toBeFocused();
    await expect(faq.getByLabel("Service Needed")).toHaveValue("Property Care & Maintenance");
  });
});

test.describe("unbuilt service pages", () => {
  test("answer 404", async ({ request }) => {
    for (const slug of ["not-a-service", "turnkey-projects"]) {
      const response = await request.get(`/services/${slug}`);
      expect(response.status(), slug).toBe(404);
    }
  });
});
