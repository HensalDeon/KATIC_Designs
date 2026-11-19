import { expect, type Locator, type Page, test } from "@playwright/test";

import { INDIA_PAGE, type IndiaBlock, type IndiaProjectsBlock } from "@/content/locations/india";
import { getProject, projectHref } from "@/content/projects";

/**
 * India (`/locations/india`, original `#p-india`, lines 4071–4096, docs/analysis/04 §7). Values are
 * the ORIGINAL's rendered output, probed at 1440 / 1024 / 768 / 390 (the fit() auto-zoom removed,
 * D4), written as the browser reports them. Deliberate deviations carry their KNOWN_ISSUES id.
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

async function open(page: Page, path = "/locations/india") {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";
const ORANGE = "rgb(232, 98, 44)";
const INK = "rgb(17, 17, 17)";

/** Section roots in page order (`main > section`). */
const SECTIONS = [
  { selector: "[data-hero]", tone: "dark" },
  { selector: "[data-parity=ks]", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" },
  { selector: "[data-parity=pp-host]", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" },
  { selector: "#india-projects", tone: "light" },
  { selector: "[data-parity=ks]", tone: "dark" },
  { selector: "[data-parity=ks]", tone: "light" },
  { selector: "#india-contact", tone: "dark" },
] as const;

const blocks: readonly IndiaBlock[] = INDIA_PAGE.blocks;
const PROJECTS = blocks.find(
  (block): block is IndiaProjectsBlock => block.type === "indiaProjects",
);
if (!PROJECTS) throw new Error("India has no project grid");
const PROJECT_ITEMS = PROJECTS.items;
const expectedSlugs = (area: "all" | "kochi" | "kerala") =>
  PROJECT_ITEMS.filter((item) => area === "all" || item.area === area).map((item) => item.project);

const section = (page: Page, index: number) => page.locator("main > section").nth(index);
const locations = (page: Page) => section(page, 2);
const projects = (page: Page) => page.locator("#india-projects");
const grid = (page: Page) => page.locator("#india-projects-grid");
const cards = (page: Page) => grid(page).locator(":scope > li");
const filter = (page: Page, label: string) =>
  projects(page).getByRole("button", { name: label, exact: true });
const count = (page: Page) => page.locator("[data-india-count]");
const contact = (page: Page) => page.locator("#india-contact");

async function visibleSlugs(page: Page) {
  return cards(page).evaluateAll((items) => items.map((item) => item.getAttribute("data-card")));
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
      "Architects & Interior Designers in Kerala, India | Katic Designs",
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Katic Designs serves clients across Kochi, Kerala and South India with architecture, interiors, construction and property care.",
    );
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("nine sections in the original order, ids and tones", async ({ page }) => {
    await open(page);
    const roots = page.locator("main > section");
    await expect(roots).toHaveCount(SECTIONS.length);
    for (const [index, { selector, tone }] of SECTIONS.entries()) {
      const root = roots.nth(index);
      expect(await root.evaluate((el, s) => el.matches(s), selector), selector).toBe(true);
      await expect(root).toHaveAttribute("data-tone", tone);
    }
    const backgrounds = await roots.evaluateAll((els) =>
      els.slice(1).map((el) => getComputedStyle(el).backgroundColor),
    );
    expect(backgrounds).toEqual([WHITE, BLACK, WHITE, BLACK, WHITE, BLACK, WHITE, BLACK]);
    // One screen per section on the canvas; the services grid (4 + 3 cards) is taller.
    for (const index of [1, 2, 4, 6, 7, 8]) {
      expect((await box(roots.nth(index))).height, `section ${String(index)}`).toBe(900);
    }
    expect((await box(roots.nth(3))).height).toBeCloseTo(1284, -1);
  });

  test("no reveal-on-scroll (the original has no [data-rv] on India, D7)", async ({ page }) => {
    await open(page);
    await expect(page.locator("main [data-reveal]")).toHaveCount(0);
  });

  test("hero: kicker, title, lead and both buttons", async ({ page }) => {
    await open(page);
    const hero = page.locator("[data-hero]");
    await expectStyles(hero, { height: "900px" });
    await expect(hero.locator("h1")).toHaveText("Designing Spaces.Building Possibilities.");
    await expectStyles(hero.locator("h1"), { fontSize: "74px", lineHeight: "74px" });
    await expectStyles(hero.locator("h1 span"), { color: ORANGE });
    const explore = hero.getByRole("link", { name: "Explore Our Projects" });
    await expect(explore).toHaveAttribute("href", "/works#works-list");
    expect(await box(explore)).toMatchObject({ x: 86, height: 54 });
    expect((await box(explore)).y).toBeCloseTo(568.8, 0);
    await expect(hero.getByRole("link", { name: "Start a Project" })).toHaveAttribute(
      "href",
      "#india-contact",
    );
  });

  test("intro split: zoomable photo with its caption", async ({ page }) => {
    await open(page);
    const intro = section(page, 1);
    await expect(intro.locator("h2")).toHaveText("Rooted in Kochi.Growing acrossthe south.");
    await expectStyles(intro.locator("h2"), { fontSize: "58px", lineHeight: "64.96px" });
    expect(await box(intro.locator("h2"))).toMatchObject({ x: 752, width: 602 });
    await expect(intro.getByText("Courtyard light · Kochi")).toBeVisible();
    await intro.getByRole("button", { name: /Brick veranda/ }).click();
    await expect(page.locator("dialog[open] img")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  });

  test("locations: three cards with status tags; only Kochi is a link", async ({ page }) => {
    await open(page);
    const section = locations(page);
    await expect(section.locator("h2")).toHaveText("Where tofind us");
    const items = section.locator("li");
    await expect(items).toHaveCount(3);
    await expect(items.locator("h3")).toHaveText(["Kochi", "Chennai", "Bangalore"]);
    await expect(items.locator("small")).toHaveText(["Kerala", "Tamil Nadu", "Karnataka"]);
    const tags = items.locator("span[class*='top-16']");
    await expect(tags).toHaveText(["Office", "Expanding", "Expanding"]);
    await expectStyles(tags.first(), {
      height: "24px",
      paddingLeft: "10px",
      fontSize: "8.5px",
      fontWeight: "600",
      letterSpacing: "1.36px",
      textTransform: "uppercase",
      color: WHITE,
      backgroundColor: INK,
    });
    expect(await box(tags.first())).toMatchObject({ x: 102 });
    expect((await box(items.first().locator("span").first())).height).toBe(200);
    const kochi = section.getByRole("link");
    await expect(kochi).toHaveCount(1);
    await expect(kochi).toHaveAttribute("href", "#india-contact");
    await expect(kochi).toContainText("Contact the Kochi office");
    await expect(kochi).toContainText(
      "Katic Designs Studio, 14 Ridgeline Road, Countryside District, 400001 · hello@katicdesigns.com",
    );
    await expectStyles(items.nth(1).locator("p"), { color: "rgb(170, 170, 170)" });
  });

  test("the Kochi card goes to the form and writes the location (PREFILL)", async ({ page }) => {
    await open(page);
    const details = contact(page).getByLabel("Project Details");
    await expect(details).toHaveValue("");
    await locations(page).getByRole("link", { name: /Kochi/ }).click();
    await expect(contact(page).getByLabel("Full Name")).toBeFocused();
    await expect(details).toHaveValue("Location: India\n");
    await expect
      .poll(() => contact(page).evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(4);
  });

  test("services: seven cards with the hanging plant, linking to each service", async ({
    page,
  }) => {
    await open(page);
    const services = section(page, 3);
    await expect(services.locator("h2")).toHaveText("Everything underone roof");
    await expect(services.getByRole("link", { name: "All Services" })).toHaveAttribute(
      "href",
      "/services",
    );
    const links = services.locator("li a");
    await expect(links).toHaveCount(7);
    expect(await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual([
      "/services/architecture",
      "/services/interior",
      "/services/construction",
      "/services/turnkey",
      "/services/renovation",
      "/services/exterior",
      "/services/property-care",
    ]);
    // Four per row (c4): 260px photos, the fifth card starts the second row.
    expect((await box(links.first().locator("span").first())).height).toBe(260);
    expect((await box(links.nth(4))).x).toBe(86);
    await expect(services.locator("img[aria-hidden], img[alt='']").first()).toBeAttached();
  });

  test("divisions: the five division cards", async ({ page }) => {
    await open(page);
    const divisions = section(page, 4);
    await expect(divisions.locator("h2")).toHaveText("One vision.Five divisions.");
    const links = divisions.locator("li a");
    await expect(links).toHaveCount(5);
    expect(await links.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual([
      "/divisions/design",
      "/divisions/interior",
      "/divisions/infrastructure",
      "/divisions/developers",
      "/divisions/care",
    ]);
    await expect(links.first()).toContainText("Explore Division");
    expect((await box(links.first().locator("span").first())).height).toBe(230);
  });

  test("projects: header, filter bar and three-column cards", async ({ page }) => {
    await open(page);
    await expect(projects(page).locator("h2")).toHaveText("Selected workin India");
    await expect(
      projects(page).getByText("Project type and location, with location filters."),
    ).toBeVisible();
    const buttons = projects(page).getByRole("group").getByRole("button");
    await expect(buttons).toHaveText(["All", "Kochi", "Rest of Kerala"]);
    await expectStyles(buttons.first(), {
      height: "40px",
      paddingLeft: "18px",
      fontSize: "12px",
      // Active: black semibold on orange like Works (KI-A19), not the original's white 500.
      fontWeight: "600",
      backgroundColor: ORANGE,
      color: "rgb(0, 0, 0)",
    });
    await expectStyles(buttons.nth(1), {
      backgroundColor: WHITE,
      color: INK,
      borderTopColor: "rgb(221, 221, 221)",
    });
    const header = await box(projects(page).locator("h2"));
    const bar = await box(projects(page).getByRole("group"));
    const lead = await box(projects(page).locator("h2").locator("xpath=../.."));
    expect(bar.y - (lead.y + lead.height)).toBeCloseTo(36, 0);
    expect(bar.y).toBeGreaterThan(header.y);
    expect((await box(cards(page).first())).y - (bar.y + bar.height)).toBeCloseTo(60, 0);
    await expect(cards(page)).toHaveCount(6);
    expect(await box(cards(page).nth(1))).toMatchObject({ x: 516.65625 });
    expect((await box(cards(page).first().locator("a > span").first())).height).toBe(200);
    await expect(cards(page).first().locator("small")).toHaveText(
      "Residential · Architecture · Panampilly Nagar, Kochi",
    );
  });

  test("project cards: facts from the Project entity, links resolve", async ({ page }) => {
    await open(page);
    for (const [index, item] of PROJECT_ITEMS.entries()) {
      const project = getProject(item.project);
      const card = cards(page).nth(index);
      await expect(card.locator("h3")).toHaveText(project.name);
      await expect(card.locator("small")).toHaveText(item.meta);
      await expect(card.locator("img")).toHaveAttribute("alt", project.coverAlt);
      await expect(card.getByRole("link")).toHaveAttribute("href", projectHref(project));
    }
    const hrefs = new Set(
      await page
        .locator("main a[href^='/']")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")?.split("#")[0] ?? "")),
    );
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });

  test("each filter shows its area, updates the URL and the live count", async ({ page }) => {
    await open(page);
    for (const [label, area] of [
      ["Kochi", "kochi"],
      ["Rest of Kerala", "kerala"],
      ["All", "all"],
    ] as const) {
      await filter(page, label).click();
      const expected = expectedSlugs(area);
      await expect.poll(() => visibleSlugs(page)).toEqual(expected);
      await expect(filter(page, label)).toHaveAttribute("aria-pressed", "true");
      // Black on orange like the Works filter, not the original's 3.4:1 white (KI-A19).
      await expect(filter(page, label)).toHaveCSS("color", "rgb(0, 0, 0)");
      await expect(projects(page).locator("[aria-pressed=true]")).toHaveCount(1);
      await expect(count(page)).toHaveText(`${String(expected.length)} projects`);
      await expect(page).toHaveURL(
        area === "all"
          ? /\/locations\/india#india-projects$/
          : new RegExp(`/locations/india\\?area=${area}#india-projects$`),
      );
      // The grid closes up: the shown cards fill the first row from the left.
      expect((await box(cards(page).first())).x).toBe(86);
    }
  });

  test("?area= deep link, back and forward", async ({ page }) => {
    await open(page, "/locations/india?area=kerala#india-projects");
    await expect(filter(page, "Rest of Kerala")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kerala"));
    await expect.poll(async () => Math.round((await box(projects(page))).y)).toBe(0);

    await filter(page, "Kochi").click();
    await expect(page).toHaveURL(/\?area=kochi#india-projects$/);
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kochi"));
    await page.goBack();
    await expect(page).toHaveURL(/\?area=kerala#india-projects$/);
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kerala"));
    await page.goForward();
    await expect(filter(page, "Kochi")).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kochi"));
  });

  test("unknown ?area= values show every project", async ({ page }) => {
    await open(page, "/locations/india?area=dubai");
    await page.waitForTimeout(300);
    await expect(filter(page, "All")).toHaveAttribute("aria-pressed", "true");
    expect(await visibleSlugs(page)).toEqual(expectedSlugs("all"));
  });

  for (const hash of ["#india/india-projects/kochi", "#kochi/india-projects/kochi"]) {
    test(`legacy ${hash} opens the filtered grid`, async ({ page }) => {
      await open(page, `/${hash}`);
      await expect(page).toHaveURL(/\/locations\/india\?area=kochi#india-projects$/);
      await expect(filter(page, "Kochi")).toHaveAttribute("aria-pressed", "true");
      await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kochi"));
    });
  }

  test("legacy #kochi opens the India page", async ({ page }) => {
    await open(page, "/#kochi");
    await expect(page).toHaveURL(/\/locations\/india$/);
    await expect(page.getByRole("heading", { level: 1, name: /Designing Spaces/ })).toBeVisible();
  });

  test("why KATIC and approach: four tiles and four steps", async ({ page }) => {
    await open(page);
    await expect(section(page, 6).locator("h3")).toHaveText([
      "Integrated capabilities",
      "Design expertise",
      "Coordinated execution",
      "Project management",
    ]);
    await expect(section(page, 7).locator("h3")).toHaveText([
      "Consultation",
      "Design",
      "Execution",
      "Handover",
    ]);
  });

  test("contact: India's copy, three channels and the extra selects", async ({ page }) => {
    await open(page);
    const section = contact(page);
    await expect(section).toHaveAttribute("data-contact-section", "");
    await expect(section.getByText("Start your project", { exact: true })).toBeVisible();
    const heading = section.locator("h2");
    await expect(heading).toHaveText("Start Your Projectin India");
    await expectStyles(heading, { fontSize: "54px", lineHeight: "54px", color: WHITE });
    await expectStyles(heading.locator("span"), { color: ORANGE });
    await expect(
      section.getByText(
        "For clients in Kerala, Tamil Nadu, Karnataka and other serviceable locations.",
      ),
    ).toBeVisible();
    await expect(section.locator("dt")).toHaveText(["Email", "Phone", "WhatsApp"]);
    await expect(section.getByRole("link", { name: "Chat with our team" })).toHaveAttribute(
      "href",
      "https://wa.me/10000000000",
    );
    const ptype = section.getByLabel("Project Type");
    const loc = section.getByLabel("Project Location");
    await expect(ptype.locator("option")).toHaveText([
      "Select",
      "Residential",
      "Commercial",
      "Institutional",
      "Hospitality",
    ]);
    await expect(loc.locator("option")).toHaveText([
      "Select",
      "Kochi",
      "Elsewhere in Kerala",
      "Chennai / Tamil Nadu",
      "Bangalore / Karnataka",
      "Other",
    ]);
    // Two columns of 311px: the service select beside phone, the two extras on the third row.
    expect(await box(section.getByLabel("Service Needed"))).toMatchObject({ x: 1043, width: 311 });
    expect(await box(ptype)).toMatchObject({ x: 714, width: 311, height: 46 });
    expect(await box(loc)).toMatchObject({ x: 1043, width: 311 });
    await expect(section.getByRole("button", { name: "Send Enquiry" })).toBeVisible();
    await expect(section.getByText("We typically reply within one business day.")).toBeVisible();
  });

  test("the hero's Start a Project writes the location once", async ({ page }) => {
    await open(page);
    const details = contact(page).getByLabel("Project Details");
    await details.fill("A courtyard villa");
    const start = page.locator("[data-hero]").getByRole("link", { name: "Start a Project" });
    await start.click();
    await expect(contact(page).getByLabel("Full Name")).toBeFocused();
    await expect(details).toHaveValue("Location: India\nA courtyard villa\n");
    await page.evaluate(() => window.scrollTo(0, 0));
    await start.click();
    await expect(details).toHaveValue("Location: India\nA courtyard villa\n");
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("1440 canvas, motion on", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("filtered cards slide to their new place and new ones fade in", async ({ page }) => {
    await open(page, "/locations/india?area=kochi#india-projects");
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kochi"));
    await filter(page, "All").click();
    const animations = await grid(page).evaluate((el) =>
      [...el.querySelectorAll<HTMLElement>(":scope > li")].map((li) => li.getAnimations().length),
    );
    // The three Kochi cards keep their places; the three Kerala cards fade in.
    expect(animations).toEqual([0, 0, 0, 1, 1, 1]);
  });
});

test.describe("1440 canvas, reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("filtering does not animate", async ({ page }) => {
    await open(page);
    await filter(page, "Rest of Kerala").click();
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kerala"));
    const running = await grid(page).evaluate(
      (el) => [...el.querySelectorAll("li")].flatMap((li) => li.getAnimations()).length,
    );
    expect(running).toBe(0);
  });
});

test.describe("1024 (below the canvas)", () => {
  test.use({ viewport: { width: 1024, height: 768 }, reducedMotion: "reduce" });

  test("titles scale (KI-N04) and the grids go to two columns", async ({ page }) => {
    await open(page);
    await expectStyles(section(page, 1).locator("h2"), { fontSize: "46px" });
    await expectStyles(projects(page).locator("h2"), { fontSize: "46px" });
    expect(await box(cards(page).nth(1))).toMatchObject({ x: 524, width: 464 });
    expect((await box(cards(page).first().locator("a > span").first())).height).toBe(300);
    await filter(page, "Kochi").click();
    await expect(cards(page)).toHaveCount(3);
    expect((await box(cards(page).nth(2))).x).toBe(36);
  });

  test("contact: two equal columns", async ({ page }) => {
    await open(page);
    expect(await box(contact(page).getByLabel("Project Type"))).toMatchObject({
      x: 532,
      width: 219,
    });
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("768 (tablet)", () => {
  test.use({ viewport: { width: 768, height: 1024 }, reducedMotion: "reduce" });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("390 (phone)", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("one column, wrapping filters, 11px small text (KI-A10)", async ({ page }) => {
    await open(page);
    const buttons = projects(page).getByRole("group").getByRole("button");
    expect(await box(buttons.first())).toMatchObject({ x: 20, height: 40 });
    expect((await box(cards(page).nth(1))).x).toBe(20);
    expect((await box(cards(page).first().locator("a > span").first())).height).toBe(300);
    await expectStyles(cards(page).first().locator("small"), { fontSize: "11px" });
    await expectStyles(locations(page).locator("span[class*='top-16']").first(), {
      fontSize: "11px",
    });
  });

  test("the filter works on phones", async ({ page }) => {
    await open(page);
    await filter(page, "Rest of Kerala").click();
    await expect.poll(() => visibleSlugs(page)).toEqual(expectedSlugs("kerala"));
    await expect(count(page)).toHaveText("3 projects");
  });

  test("no horizontal overflow", async ({ page }) => {
    await open(page);
    await expectNoHorizontalOverflow(page);
  });
});
