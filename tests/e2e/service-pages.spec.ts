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
  /**
   * `hidden`: the form has no service select and files every lead under `service` (Factory,
   * KI-F01). Default `select`.
   */
  readonly serviceField?: "select" | "hidden";
  readonly heroCtas: readonly [HeroCta, ...HeroCta[]];
  /** Sections after the hero: original id, or the `data-parity` class for blocks without one. */
  readonly sections: readonly (readonly [key: string, tone: Tone])[];
  readonly contactTone: Tone;
  /** Process steps: title size and art height (dense rows of 6+ steps are smaller). Omit if none. */
  readonly process?: {
    readonly heading: RegExp;
    readonly titleSize: string;
    readonly artHeight: string;
  };
  /** Featured-project cards: image height on the canvas (c3 200px, c4 260px). Omit if none. */
  readonly projects?: {
    readonly heading: RegExp;
    readonly imageHeight: string;
    readonly count: number;
  };
  /** Omit if the page has no related services. */
  readonly related?: { readonly heading: RegExp; readonly hrefs: readonly string[] };
  /** Whether the page has the testimonials block (default true). */
  readonly testimonials?: boolean;
  /** A zoomable split photo (its alt). */
  readonly zoomImage: string;
  /**
   * Banner values when they differ from the standard `.kh-hero` (architecture's own variant):
   * title and lead styles, and the y of the primary button on the canvas.
   */
  readonly hero?: { readonly title: Expected; readonly lead: Expected; readonly ctaY: number };
  /** Section-title line height on the canvas (default 64.96px = 58 × 1.12). */
  readonly titleLineHeight?: string;
};

const STANDARD_HERO = {
  title: { fontSize: "74px", lineHeight: "74px", fontWeight: "700", color: "rgb(255, 255, 255)" },
  lead: {
    fontSize: "17px",
    lineHeight: "28.9px",
    color: "rgb(238, 238, 238)",
    maxWidth: "640px",
  },
  ctaY: 568.8,
} as const satisfies NonNullable<ServicePageSpec["hero"]>;

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
        const expected = spec.hero ?? STANDARD_HERO;
        await expectStyles(hero.locator("h1"), expected.title);
        await expectStyles(hero.locator("h1 span"), { color: ORANGE });
        await expectStyles(hero.locator("h1 + p"), expected.lead);
        for (const [index, cta] of spec.heroCtas.entries()) {
          const link = hero.getByRole("link", { name: cta.name });
          await expect(link).toHaveAttribute("href", cta.href);
          const box = await link.boundingBox();
          expect(box?.height).toBe(54);
          if (index > 0) continue;
          // Original: the cream button at (86, 568.8) on the standard banner.
          expect(box?.x).toBe(86);
          expect(box?.y).toBeCloseTo(expected.ctaY, 0);
          await expectStyles(link, { backgroundColor: "rgb(247, 244, 239)" });
        }
      });

      test("section titles, process steps and project cards", async ({ page }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("main > section h2").nth(1), {
          fontSize: "58px",
          lineHeight: spec.titleLineHeight ?? "64.96px",
          textTransform: "uppercase",
        });
        if (spec.process) {
          const process = sectionByHeading(page, spec.process.heading);
          // Process steps are white on dark sections and ink on light ones (Factory).
          const tone = await process.getAttribute("data-tone");
          await expectStyles(process.locator("li[data-step] h3").first(), {
            fontSize: spec.process.titleSize,
            color: tone === "light" ? "rgb(17, 17, 17)" : WHITE,
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
          for (const href of await cards.evaluateAll((all) =>
            all.map((a) => a.getAttribute("href")),
          ))
            expect(href).toMatch(/^\/works\/[a-z-]+$/);
        }
      });

      if (spec.process) {
        const heading = spec.process.heading;
        test("process line art draws on when scrolled into view", async ({ page }) => {
          await open(page, spec.slug);
          const process = sectionByHeading(page, heading);
          await expect(process.locator("[data-drawn]")).toHaveCount(0);
          await process.locator("li[data-step]").first().scrollIntoViewIfNeeded();
          await expect(process.locator("[data-drawn]")).toHaveCount(1);
        });
      }

      test("the hero CTA scrolls to the form and preselects the page's service", async ({
        page,
      }) => {
        await open(page, spec.slug);
        const hidden = spec.serviceField === "hidden";
        const service = hidden
          ? contact(page).locator('input[type="hidden"][name="service"]')
          : contact(page).getByLabel("Service Needed");
        await expect(service).toHaveValue(spec.service);
        // Pick another service first, so the click has something to change.
        if (hidden) await expect(contact(page).getByLabel("Service Needed")).toHaveCount(0);
        else
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
        // Address the panels by `aria-controls`: a closed panel is hidden from the accessibility
        // tree once its transition ends, so `getByRole("region").nth(1)` raced the close.
        const panel = async (index: number) =>
          page.locator(`#${await questions.nth(index).getAttribute("aria-controls")}`);
        await expect(await panel(1)).toBeVisible();
        await expect(await panel(0)).toBeHidden();
      });

      if (spec.related) {
        const related = spec.related;
        test("related services link to their pages and highlight on hover", async ({ page }) => {
          await open(page, spec.slug);
          const cards = sectionByHeading(page, related.heading).locator("li a");
          expect(await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
            related.hrefs,
          );
          // Hover text is the text-safe orange on white, the brand orange on black (KI-A11).
          const dark = await cards
            .first()
            .evaluate((el) => el.closest("[data-tone]")?.getAttribute("data-tone") === "dark");
          await cards.first().hover();
          await expect(cards.first().locator("h3")).toHaveCSS(
            "color",
            dark ? ORANGE : "rgb(194, 78, 30)",
          );
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

      test("titles scale (KI-L16, KI-N04) and the testimonials leave no orphan (KI-L23)", async ({
        page,
      }) => {
        await open(page, spec.slug);
        await expectStyles(page.locator("[data-hero] h1"), { fontSize: "62px" });
        await expectStyles(page.locator("main > section h2").nth(1), { fontSize: "46px" });
        if (spec.testimonials === false) {
          await expect(sectionByHeading(page, /In our clients/)).toHaveCount(0);
          return;
        }
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
  slug: "architecture",
  title: "Architects in Kochi, Kerala | Architectural Design Services | Katic Designs",
  description:
    "Climate-responsive architectural design for homes, villas and commercial buildings in Kerala and Dubai — from site study and concept to approval drawings.",
  service: "Architectural Design",
  heroCtas: [{ name: "Discuss Your Project", href: "#architecture-contact" }],
  sections: [
    ["ap", "light"],
    ["services-list", "dark"],
    ["ks", "light"],
    ["process", "dark"],
    ["arch-projects", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  contactTone: "light",
  process: { heading: /From Site to/, titleSize: "30px", artHeight: "170px" },
  projects: { heading: /Architecture\s*Projects/, imageHeight: "563px", count: 5 },
  related: {
    heading: /alongside architecture/,
    hrefs: RELATED(
      "exterior",
      "interior",
      "turnkey",
      "construction",
      "renovation",
      "property-care",
    ),
  },
  zoomImage: "White massing model on a dark background",
  hero: {
    title: { fontSize: "76px", lineHeight: "75.24px", fontWeight: "700", color: WHITE },
    lead: {
      fontSize: "17px",
      lineHeight: "28.9px",
      color: "rgb(242, 242, 242)",
      maxWidth: "660px",
    },
    ctaY: 640.5,
  },
  // `#p-architecture .st{line-height:1.14}` applies to every section title of the page.
  titleLineHeight: "66.12px",
});

/** The four architecture-only blocks (`.ap`, `.sv`, `.pr`, `.ap2`, analysis/03 §1.15). */
test.describe("/services/architecture bespoke blocks", () => {
  const intro = (page: Page) => page.locator("[data-parity=ap]");
  const services = (page: Page) => page.locator("#services-list");
  const process = (page: Page) => page.locator("#process");
  const projects = (page: Page) => page.locator("#arch-projects");

  test.describe("1440 canvas", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("intro: lead, figures, photo and caption as the original (no dead spacer, KI-L21)", async ({
      page,
    }) => {
      await open(page, "architecture");
      const section = intro(page);
      await expectStyles(section.locator("h2"), { fontSize: "58px", lineHeight: "66.12px" });
      await expectStyles(section.locator("h2 + p"), {
        fontSize: "17px",
        lineHeight: "28.9px",
        color: "rgb(85, 85, 85)",
        maxWidth: "500px",
        marginTop: "26px",
      });
      await expect(section.getByRole("link", { name: "Our Process" })).toHaveAttribute(
        "href",
        "#process",
      );
      await expectStyles(section.locator("dl"), { gridTemplateColumns: "265px 243px" });
      await expectStyles(section.locator("dd").first(), { fontSize: "26px", height: "31px" });
      await expectStyles(section.locator("dt").first(), {
        fontSize: "9.5px",
        letterSpacing: "1.9px",
        color: "rgb(85, 85, 85)",
      });
      const photo = section.locator("figure img");
      expect(await photo.boundingBox()).toMatchObject({ width: 700, height: 523 });
      await expectStyles(section.locator("figcaption span").last(), { fontSize: "10.5px" });
      // Content (592px) centred in one screen: 154px above it, 154px below.
      const box = await section.boundingBox();
      const grid = await section.locator(":scope > div").boundingBox();
      expect(box?.height).toBe(900);
      expect((grid?.y ?? 0) - (box?.y ?? 0)).toBeCloseTo(154, 0);
    });

    test("services: summary, 61px rows into the form, button and photos", async ({ page }) => {
      await open(page, "architecture");
      const section = services(page);
      await expectStyles(section.locator("h2"), { marginTop: "44px" });
      await expectStyles(section.locator("h2").locator("xpath=../following-sibling::div/p"), {
        fontSize: "14.5px",
        lineHeight: "26.1px",
        color: "rgb(221, 221, 221)",
        marginTop: "58px",
      });
      const rows = section.locator("li a");
      await expect(rows).toHaveCount(9);
      await expectStyles(rows.first(), {
        height: "61px",
        gridTemplateColumns: "56px 524px 20px",
        borderBottomColor: "rgba(255, 255, 255, 0.2)",
      });
      await expectStyles(rows.first().locator("span").nth(1), {
        fontSize: "20px",
        color: WHITE,
      });
      await rows.first().hover();
      await expect(rows.first().locator("span").nth(1)).toHaveCSS("color", ORANGE);
      const works = section.getByRole("link", { name: "View Architecture Works" });
      await expect(works).toHaveAttribute("href", "/works?category=architecture#works-list");
      expect(await works.boundingBox()).toMatchObject({ height: 52 });
      await expectStyles(works, { marginTop: "88px", backgroundColor: "rgb(17, 17, 17)" });
      const photos = section.locator("button img");
      expect((await photos.nth(0).boundingBox())?.height).toBe(290);
      expect(await photos.nth(1).boundingBox()).toMatchObject({ width: 293, height: 362 });

      // A row goes to the form with the service preselected (`data-go="contact" data-svc`).
      const form = page.locator("#architecture-contact");
      await form.getByLabel("Service Needed").selectOption("Interior Design");
      await rows.nth(4).click();
      await expect(form.getByLabel("Full Name")).toBeFocused();
      await expect(form.getByLabel("Service Needed")).toHaveValue("Architectural Design");
    });

    test("services photos browse as one lightbox gallery with descriptive alts (KI-A13)", async ({
      page,
    }) => {
      await open(page, "architecture");
      await services(page)
        .getByRole("button", { name: "Enlarge image: Pavilion building with vertical fins" })
        .click();
      const viewer = page.getByRole("dialog");
      await expect(viewer).toContainText("1 / 3");
      await page.keyboard.press("ArrowRight");
      await expect(viewer).toContainText("2 / 3");
      await page.keyboard.press("Escape");
      await expect(viewer).toBeHidden();
    });

    test("process: lead, 512px photo row and the steps 80px below (#process-tl)", async ({
      page,
    }) => {
      await open(page, "architecture");
      const section = process(page);
      await expectStyles(section.locator("h2").locator("xpath=../following-sibling::div/p"), {
        fontSize: "15.5px",
        lineHeight: "26.35px",
        color: "rgb(221, 221, 221)",
      });
      await expect(section.getByRole("link", { name: "See Our Process" })).toHaveAttribute(
        "href",
        "#process-tl",
      );
      const photos = page.getByTestId("arch-process-photos");
      await expectStyles(photos, { gridTemplateColumns: "512px 738px", marginTop: "62px" });
      expect((await photos.locator("img").first().boundingBox())?.height).toBe(333);
      const steps = page.locator("#process-tl");
      await expectStyles(steps, { marginTop: "80px" });
      await expect(steps.locator("li")).toHaveCount(5);
      await expectStyles(steps.locator("li p").first(), { color: "rgb(143, 137, 132)" });
    });

    test("projects: featured and grid cards, hover zoom, links to each project", async ({
      page,
    }) => {
      await open(page, "architecture");
      const cards = projects(page).locator("li a");
      // Only The Courtyard House has its own page; the others open it, as in the original (KI-F09).
      expect(await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href")))).toEqual(
        Array.from({ length: 5 }, () => "/works/the-courtyard-house"),
      );
      expect(await cards.nth(1).locator("img").boundingBox()).toMatchObject({
        width: 606.5,
        height: 420,
      });
      await expectStyles(cards.first().locator("h3"), { fontSize: "30px" });
      await expectStyles(cards.nth(1).locator("h3"), { fontSize: "26px" });
      await expectStyles(cards.first().locator("h3").locator("xpath=preceding-sibling::span"), {
        fontSize: "8.5px",
        letterSpacing: "1.19px",
        color: "rgb(192, 82, 42)",
      });
      const image = cards.first().locator("img");
      await expectStyles(image, { transitionDuration: "0.8s" });
      await cards.first().hover();
      await expect(image).toHaveCSS("scale", "1.03");
      // Meta row: description left, "View Project ↗" right (big card at x 1267).
      const view = cards.first().getByText("View Project");
      expect((await view.boundingBox())?.x).toBeCloseTo(1267.2, 0);
    });
  });

  test.describe("1024 (≤1099)", () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test("one column, 46px titles (KI-N04)", async ({ page }) => {
      await open(page, "architecture");
      for (const section of [intro(page), services(page), process(page), projects(page)])
        await expectStyles(section.locator("h2"), { fontSize: "46px" });
      expect((await intro(page).locator("figure img").boundingBox())?.width).toBe(952);
      // The photo row only stacks on phones; at 1024 it is still 512px + the rest.
      await expectStyles(page.getByTestId("arch-process-photos"), {
        gridTemplateColumns: "512px 422px",
      });
    });
  });

  for (const viewport of [
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]) {
    test.describe(`${String(viewport.width)} (≤860)`, () => {
      test.use({ viewport });

      test("process photos stack inside the canvas (KI-L20) and cards stack their meta", async ({
        page,
      }) => {
        await open(page, "architecture");
        const container = viewport.width - 40;
        const photos = page.getByTestId("arch-process-photos").locator("img");
        for (const index of [0, 1]) {
          const box = await photos.nth(index).boundingBox();
          expect(box).toMatchObject({ x: 20, width: container, height: 333 });
        }
        await expectStyles(intro(page).locator("figure img"), { height: "320px" });
        await expectStyles(services(page).locator("button img").nth(1), { height: "220px" });
        const view = projects(page).locator("li a").first().getByText("View Project");
        expect((await view.boundingBox())?.x).toBe(20);
        await expectStyles(projects(page).locator("h2"), {
          fontSize: "34px",
          lineHeight: "38.76px",
        });
      });
    });
  }
});

describeServicePage({
  slug: "factory",
  title: "Custom Furniture & Joinery Manufacturing in Kerala | Katic Designs",
  description:
    "Kitchens, wardrobes, panelling, doors and custom furniture made in the Katic Designs workshop and installed by our own teams.",
  service: "Interior Design",
  serviceField: "hidden",
  heroCtas: [
    { name: "Enquire About Manufacturing", href: "#factory-contact" },
    { name: "Back to Interior Design", href: "/services/interior" },
  ],
  sections: [
    ["pp-host", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  contactTone: "light",
  process: { heading: /Every piece/, titleSize: "30px", artHeight: "170px" },
  testimonials: false,
  zoomImage: "Teak stair handrail detail",
});

test.describe("/services/factory specifics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("gallery: 3 + 2 grid, captions, browsable in the lightbox", async ({ page }) => {
    await open(page, "factory");
    const gallery = sectionByHeading(page, /Inside the/);
    const figures = gallery.locator("figure");
    await expect(figures.locator("figcaption")).toHaveText([
      "Model & mock-ups",
      "Timber screens",
      "Handrail detail",
      "Teak screen",
      "Joinery in place",
    ]);
    const boxes = await figures.evaluateAll((all) =>
      all.map((figure) => {
        const r = figure.getBoundingClientRect();
        return { w: Math.round(r.width), h: r.height };
      }),
    );
    expect(boxes.map(({ h }) => h)).toEqual([320, 320, 320, 320, 320]);
    expect(boxes[4]?.w).toBeGreaterThan((boxes[0]?.w ?? 0) * 2);
    await figures.first().getByRole("button").click();
    const viewer = page.getByRole("dialog");
    await expect(viewer.locator("figcaption")).toHaveText(/MODEL & MOCK-UPS\s*1 \/ 5/i);
    await page.keyboard.press("ArrowRight");
    await expect(viewer.locator("figcaption")).toHaveText(/TIMBER SCREENS\s*2 \/ 5/i);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("finished products link to their project; no related or testimonials", async ({ page }) => {
    await open(page, "factory");
    const cards = sectionByHeading(page, /Made here/).locator("li a");
    await expect(cards.locator("h3")).toHaveText([
      "Kitchen island & cabinetry",
      "Bedroom screen & wardrobe",
      "Dining joinery",
    ]);
    for (const href of await cards.evaluateAll((all) => all.map((a) => a.getAttribute("href"))))
      expect(href).toBe("/works/the-courtyard-house");
    await expect(sectionByHeading(page, /Services that work/)).toHaveCount(0);
  });

  test("the hidden form spans its odd field (KI-L22) and the FAQ link goes to the form (KI-F07)", async ({
    page,
  }) => {
    await open(page, "factory");
    const section = page.locator("#factory-contact");
    const form = section.locator("form");
    const [product, quantity] = [
      await form.getByLabel("Product").boundingBox(),
      await form.getByLabel("Quantity").boundingBox(),
    ];
    expect(quantity?.width).toBeGreaterThan((product?.width ?? 0) * 1.9);
    await section.getByRole("button", { name: /Is there a minimum order/ }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await section.getByRole("button", { name: /Discuss your order/ }).click();
    await expect(section.getByLabel("Full Name")).toBeFocused();
    await expect(section.locator('input[type="hidden"][name="service"]')).toHaveValue(
      "Interior Design",
    );
  });
});

describeServicePage({
  slug: "construction",
  title: "Construction Company in Kochi, Kerala | Construction & Execution | Katic Designs",
  description:
    "Residential and commercial construction built to the drawing, with site management, MEP coordination and stage-wise quality checks across Kerala.",
  service: "Construction & Execution",
  heroCtas: [
    { name: "Request a Build Quote", href: "#construction-contact" },
    { name: "View Projects", href: "/works#works-list" },
  ],
  // The services grid comes before the intro split, which is therefore dark (as rendered).
  sections: [
    ["ks", "light"],
    ["pp-host", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  contactTone: "light",
  projects: { heading: /Built by/, imageHeight: "200px", count: 3 },
  related: {
    heading: /alongside construction/,
    hrefs: RELATED("architecture", "interior", "turnkey"),
  },
  zoomImage: "House under construction in a forest clearing",
});

test.describe("/services/construction specifics", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("services grid first, then the dark split with its plant", async ({ page }) => {
    await open(page, "construction");
    const sections = page.locator("main > section");
    await expect(sections.nth(1).getByRole("heading", { level: 2 })).toHaveText(/What we\s*build/);
    const split = sections.nth(2);
    await expect(split.getByRole("heading", { level: 2 })).toHaveText(/Planning, people/);
    await expect(split.locator("li")).toHaveText([
      "Detailed programme",
      "Dedicated site lead",
      "Skilled workmanship",
      "Stage-wise QC checks",
    ]);
    await expect(split.locator('img[alt=""]')).toHaveCount(1);
  });

  test("the FAQ quote link preselects construction (KI-F07)", async ({ page }) => {
    await open(page, "construction");
    const section = page.locator("#construction-contact");
    await section.getByRole("button", { name: /How is the budget planned/ }).click();
    await section.getByLabel("Service Needed").selectOption("Turnkey Projects");
    await section.getByRole("button", { name: /Request a build quote/ }).click();
    await expect(section.getByLabel("Full Name")).toBeFocused();
    await expect(section.getByLabel("Service Needed")).toHaveValue("Construction & Execution");
    await expect(section.getByLabel("Built-up area")).toBeVisible();
  });
});

describeServicePage({
  slug: "renovation",
  title: "Home Renovation & Remodeling in Kochi, Kerala | Katic Designs",
  description:
    "Renovate and remodel homes and buildings with better light, layouts, kitchens, bathrooms and facades while keeping the character worth saving.",
  service: "Renovation & Remodeling",
  heroCtas: [
    { name: "Plan a Renovation", href: "#renovation-contact" },
    { name: "See Transformations", href: "#ba" },
  ],
  sections: [
    ["pp-host", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
    ["ba", "light"],
    ["ks", "dark"],
    ["ks", "light"],
    ["ks", "dark"],
  ],
  contactTone: "light",
  process: { heading: /From survey/, titleSize: "22px", artHeight: "120px" },
  related: {
    heading: /alongside renovation/,
    hrefs: RELATED("interior", "construction", "turnkey"),
  },
  zoomImage: "Brick house with arched windows lit at night",
});

test.describe("/services/renovation before & after", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("See Transformations lands on #ba", async ({ page }) => {
    await open(page, "renovation");
    await page.locator("[data-hero]").getByRole("link", { name: "See Transformations" }).click();
    await expect(page).toHaveURL(/#ba$/);
    await expect
      .poll(() => page.locator("#ba").evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(4);
  });

  test("pairs: chips, captions, geometry and the lightbox (KI-F17 static)", async ({ page }) => {
    await open(page, "renovation");
    const ba = page.locator("#ba");
    await expect(ba.locator("h3")).toHaveText(["The Old Mill Renewal", "Kottayam Family Home"]);
    await expect(ba.locator("figure span")).toHaveText(["BEFORE", "AFTER", "BEFORE", "AFTER"]);
    await expectStyles(ba.locator("figure span").nth(0), { backgroundColor: "rgb(17, 17, 17)" });
    await expectStyles(ba.locator("figure span").nth(1), { backgroundColor: "rgb(197, 83, 37)" });
    const figures = await ba.locator("figure").evaluateAll((all) =>
      all.map((figure) => {
        const r = figure.getBoundingClientRect();
        return { x: r.x, width: r.width, height: r.height };
      }),
    );
    // Original: 436 × 250 figures at 86 and 540 on the canvas.
    expect(figures.slice(0, 2)).toEqual([
      { x: 86, width: 436, height: 250 },
      { x: 540, width: 436, height: 250 },
    ]);
    await ba.getByRole("button", { name: /Enlarge image: After: brick house/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer.locator("figcaption")).toHaveText(/AFTER · The Old Mill Renewal\s*2 \/ 4/i);
    await page.keyboard.press("ArrowRight");
    await expect(viewer.locator("figcaption")).toHaveText(
      /BEFORE · Kottayam Family Home\s*3 \/ 4/i,
    );
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("the FAQ link books a site assessment (KI-F07)", async ({ page }) => {
    await open(page, "renovation");
    const section = page.locator("#renovation-contact");
    await section.getByRole("button", { name: /Do you assess the site first/ }).click();
    await section.getByRole("button", { name: /Book a site assessment/ }).click();
    await expect(section.getByLabel("Full Name")).toBeFocused();
    await expect(section.getByLabel("Service Needed")).toHaveValue("Renovation & Remodeling");
  });
});

test.describe("/services/renovation phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("pairs stack, before above after, with the text last", async ({ page }) => {
    await open(page, "renovation");
    const pair = page.locator("#ba figure").first().locator("..");
    const [before, after, text] = await Promise.all([
      pair.locator("figure").nth(0).boundingBox(),
      pair.locator("figure").nth(1).boundingBox(),
      pair.locator("h3").boundingBox(),
    ]);
    expect(before?.width).toBe(350);
    expect(after?.y).toBeGreaterThan((before?.y ?? 0) + (before?.height ?? 0));
    expect(text?.y).toBeGreaterThan((after?.y ?? 0) + (after?.height ?? 0));
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
