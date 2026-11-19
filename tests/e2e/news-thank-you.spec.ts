import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * `/news` (original `#p-news`, lines 4048–4053) and `/thank-you` (`#p-thank-you`, 4380–4395),
 * docs/analysis/04 §4 and §10. Expected values are the ORIGINAL's rendered output (probed at
 * 1440/1024/768/390); deliberate deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const WHITE = "rgb(255, 255, 255)";
const ORANGE = "rgb(232, 98, 44)";
const ORANGE_TEXT = "rgb(194, 78, 30)";
const LAST_LEAD = "katic:last-lead";

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

const columns = (locator: Locator) =>
  locator.evaluate((el) =>
    getComputedStyle(el)
      .gridTemplateColumns.split(" ")
      .map((value) => Math.round(parseFloat(value) * 10) / 10),
  );

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
}

const sections = (page: Page) => page.locator("main > section");
const newsList = (page: Page) => page.locator("#news-list");
const thankYou = (page: Page) => page.locator("main > section[data-parity=ks]");
const chips = (page: Page) => page.getByTestId("lead-references");
const fallback = (page: Page) => page.getByTestId("lead-fallback");
const action = (page: Page, name: string) => thankYou(page).getByRole("link", { name });

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("/news", () => {
  test.describe("1440 canvas", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("metadata is the original's data-title / data-desc; the page is indexable", async ({
      page,
    }) => {
      await open(page, "/news");
      await expect(page).toHaveTitle("News & Updates | Katic Designs");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "Studio announcements, completed projects and updates from Katic Designs and its divisions.",
      );
      // The original's site-wide robots meta (only /thank-you is noindex).
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "index, follow, max-image-preview:large",
      );
    });

    test("hero then the white news list; no reveals; no active nav item", async ({ page }) => {
      await open(page, "/news");
      await expect(sections(page)).toHaveCount(2);
      const hero = sections(page).first();
      await expect(hero).toHaveAttribute("data-hero");
      await expect(hero).toHaveAttribute("data-tone", "dark");
      await expectStyles(hero, { height: "900px" });
      await expect(hero.getByRole("heading", { level: 1 })).toHaveText("News from KATIC");
      await expectStyles(hero.locator("h1 span"), { color: ORANGE });
      await expect(hero.getByRole("link")).toHaveCount(0);
      await expect(hero.locator("img")).toHaveAttribute(
        "alt",
        "Modern house on a rain-soaked evening",
      );

      await expect(sections(page).nth(1)).toHaveAttribute("id", "news-list");
      await expect(newsList(page)).toHaveAttribute("data-tone", "light");
      await expect(page.locator("main [data-reveal]")).toHaveCount(0);
      await expect(page.locator('.zoom-root > header [aria-current="page"]')).toHaveCount(0);
    });

    test("list header, lead card and grid match the original", async ({ page }) => {
      await open(page, "/news");
      const list = newsList(page);
      await expectStyles(list, {
        paddingTop: "120px",
        paddingBottom: "120px",
        backgroundColor: WHITE,
        height: "1836.28px",
      });
      const header = list.locator(".grid").first();
      expect(await columns(header)).toEqual([646, 622]);
      await expect(list.getByRole("heading", { level: 2 })).toHaveText("What’s newat KATIC");
      await expectStyles(list.locator("h2"), { fontSize: "58px", lineHeight: "64.96px" });
      const mail = list.getByRole("link", { name: "hello@katicdesigns.com" });
      await expect(mail).toHaveAttribute("href", "mailto:hello@katicdesigns.com");

      const featured = list.locator("article");
      await expect(featured).toHaveAttribute("id", "dubai-design-studio");
      await expectStyles(featured, { marginTop: "60px" });
      const big = featured.getByRole("link", { name: "KATIC opens its Dubai design studio" });
      expect(await columns(big)).toEqual([703.3, 562.7]);
      await expectStyles(big, { height: "422px", borderTopColor: "rgb(227, 227, 227)" });
      await expectStyles(big.locator("img"), { height: "420px", objectFit: "cover" });
      await expect(big.locator("img")).toHaveAttribute(
        "alt",
        "Brick courtyard house lit at dusk around a planted courtyard",
      );
      await expectStyles(big.locator("h3"), { fontSize: "34px", lineHeight: "37.4px" });
      await expectStyles(big.locator("p"), { fontSize: "15.5px", color: "rgb(102, 102, 102)" });
      await expectStyles(big.locator("time"), { fontSize: "10.5px", color: "rgb(107, 107, 107)" });
      await expectStyles(big.getByText("Studio", { exact: true }), { color: ORANGE_TEXT });

      const grid = list.locator("ul");
      expect(await columns(grid)).toEqual([406.7, 406.7, 406.7]);
      await expectStyles(grid, { marginTop: "28px", columnGap: "24px" });
      const cards = grid.getByRole("link");
      await expect(cards).toHaveText([
        /Courtyard House, Kochi handed over/,
        /In-house joinery workshop expands/,
        /KATIC Care launches annual maintenance plans/,
        /New material partnerships for 2026–27/,
        /KATIC Developers announces first villa community/,
      ]);
      await expectStyles(cards.first(), { height: "449.688px", backgroundColor: WHITE });
      await expectStyles(cards.first().locator("img"), { height: "230px" });
      await expectStyles(cards.first().locator("h3"), { fontSize: "21px", lineHeight: "26.25px" });
      await expect(cards.first().locator("time")).toHaveText("14 Oct 2026");
      await expect(cards.first().locator("time")).toHaveAttribute("datetime", "2026-10-14");
    });

    test("every card links to its own permalink on /news (no detail pages, never a 404)", async ({
      page,
      request,
    }) => {
      await open(page, "/news");
      const links = newsList(page).getByRole("link", { name: /./ });
      const hrefs = await links.evaluateAll((els) =>
        els.map((el) => el.getAttribute("href") ?? ""),
      );
      const cardHrefs = hrefs.filter((href) => href.startsWith("/"));
      expect(cardHrefs).toHaveLength(6);
      for (const href of cardHrefs) {
        const [path = "", slug = ""] = href.split("#");
        expect(path).toBe("/news");
        await expect(page.locator(`[id="${slug}"]`)).toHaveCount(1);
        expect((await request.get(path)).status()).toBe(200);
      }

      await newsList(page).getByRole("link", { name: "In-house joinery workshop expands" }).click();
      await expect(page).toHaveURL(/\/news#joinery-workshop-expands$/);
      await expect(page.locator("#joinery-workshop-expands")).toBeInViewport();
    });

    test("the home teaser and the legacy #news hash lead here", async ({ page }) => {
      await open(page, "/");
      await page.locator("#home-news").getByRole("link", { name: "View All News" }).click();
      await expect(page).toHaveURL(/\/news$/);
      await page.goto("/#news/news-list");
      await expect(page).toHaveURL(/\/news$/);
    });
  });

  test.describe("1024", () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test("two columns, stacked lead card, 46px title (KI-N04)", async ({ page }) => {
      await open(page, "/news");
      const list = newsList(page);
      await expectStyles(list, { paddingTop: "80px", paddingBottom: "80px" });
      await expectStyles(list.locator("h2"), { fontSize: "46px" });
      const big = list.locator("article a");
      expect(await columns(big)).toEqual([950]);
      await expectStyles(big.locator("img"), { height: "300px" });
      expect(await columns(list.locator("ul"))).toEqual([464, 464]);
      await expectStyles(list.locator("ul a").first(), { height: "423.438px" });
    });
  });

  test.describe("390 phones", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test("one column, 210px photos, 24px lead title, 11px meta (KI-A10)", async ({ page }) => {
      await open(page, "/news");
      const list = newsList(page);
      await expectStyles(list.locator("h2"), { fontSize: "34px" });
      const big = list.locator("article a");
      await expectStyles(big.locator("img"), { height: "300px" });
      await expectStyles(big.locator("h3"), { fontSize: "24px" });
      await expectStyles(big.locator(":scope > div").last(), { paddingTop: "24px" });
      expect(await columns(list.locator("ul"))).toEqual([350]);
      await expectStyles(list.locator("ul img").first(), { height: "210px" });
      await expectStyles(list.locator("time").first(), { fontSize: "11px" });
      await expectStyles(list.locator("p").first(), { fontSize: "11px" });
    });
  });
});

/** A lead as the forms remember it (`toLastLead`). */
const STORED_LEAD = {
  name: "Jane Doe",
  email: "jane@email.com",
  service: "Interior Design",
  sourceTitle: "Architects & Interior Designers in Dubai, UAE | Katic Designs",
  sourcePath: "/locations/dubai",
  status: "unsent",
  form: "contact",
  details: "Two bedrooms.",
} as const;

/** Sum of the layout-shift scores since navigation. */
const layoutShift = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let total = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            total += (entry as unknown as { value: number }).value;
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => {
          observer.disconnect();
          resolve(total);
        }, 500);
      }),
  );

test.describe("/thank-you", () => {
  test.describe("1440 canvas", () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test("metadata is the original's; the page is noindex", async ({ page }) => {
      await open(page, "/thank-you");
      await expect(page).toHaveTitle("Thank You | Katic Designs");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "Thank you for your enquiry. A member of the Katic Designs team will be in touch within one business day.",
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    });

    test("one white section, 200px from the top; no reveals; matches the original", async ({
      page,
    }) => {
      await open(page, "/thank-you");
      await expect(sections(page)).toHaveCount(1);
      await expect(page.locator("[data-hero]")).toHaveCount(0);
      const section = thankYou(page);
      await expect(section).toHaveAttribute("data-tone", "light");
      // No fit() auto-zoom (KI-L13): 200 + content + 36 instead of one 900px screen.
      await expectStyles(section, {
        paddingTop: "200px",
        paddingBottom: "36px",
        backgroundColor: WHITE,
        height: "1065.5px",
      });
      await expect(page.locator("main [data-reveal]")).toHaveCount(0);

      const column = section.locator(":scope > div");
      await expectStyles(column, { width: "760px", textAlign: "center" });
      await expectStyles(column.locator(":scope > div").first(), {
        width: "84px",
        height: "84px",
        backgroundColor: ORANGE,
        borderTopLeftRadius: "50%",
      });
      const title = section.getByRole("heading", { level: 1 });
      await expect(title).toHaveText("Thank you.We’ve receivedyour enquiry.");
      await expectStyles(title, {
        marginTop: "34px",
        fontSize: "64px",
        lineHeight: "67.2px",
        fontWeight: "500",
        textTransform: "uppercase",
        height: "201.562px",
      });
      await expectStyles(section.locator("h1 + p"), {
        marginTop: "22px",
        fontSize: "17px",
        lineHeight: "29.75px",
        color: "rgb(85, 85, 85)",
      });
      await expectStyles(chips(page), { marginTop: "22px", columnGap: "10px", height: "32px" });
      await expectStyles(chips(page).locator("span").first(), {
        fontSize: "11px",
        borderTopColor: "rgb(221, 221, 221)",
      });

      const tiles = section.locator("[data-feature]");
      await expect(tiles.locator("h3")).toHaveText([
        "What happens next",
        "Response time",
        "Talk sooner",
      ]);
      await expect(tiles.locator("svg")).toHaveCount(3);
      expect(await columns(tiles.first().locator(".."))).toEqual([244, 244, 244]);
      await expectStyles(tiles.first().locator(".."), { marginTop: "56px", textAlign: "left" });
      await expectStyles(tiles.first(), {
        paddingTop: "22px",
        borderTopColor: "rgb(227, 223, 215)",
      });

      const whatsapp = action(page, "Continue on WhatsApp");
      await expectStyles(whatsapp, {
        height: "52px",
        backgroundColor: "rgb(197, 83, 37)",
        color: WHITE,
      });
      await expectStyles(action(page, "Explore Projects"), {
        height: "52px",
        backgroundColor: WHITE,
        borderTopColor: "rgb(207, 203, 195)",
      });
      await expect(action(page, "Explore Projects")).toHaveAttribute("href", "/works#works-list");
    });

    test("a direct visit shows the generic labels and links", async ({ page }) => {
      await open(page, "/thank-you");
      await expect(chips(page)).toHaveText("Source: WebsiteService: General enquiry");
      await expectStyles(chips(page).locator("b").first(), { color: ORANGE_TEXT });
      await expect(fallback(page)).toBeHidden();
      await expect(action(page, "Back to Previous Page")).toHaveAttribute("href", "/");
      await expect(action(page, "Continue on WhatsApp")).toHaveAttribute(
        "href",
        `https://wa.me/10000000000?text=${encodeURIComponent("Hi KATIC, I just sent an enquiry about a project.")}`,
      );
      await expect(action(page, "Continue on WhatsApp")).toHaveAttribute("target", "_blank");
    });

    test("personalised after the page's enquiry form", async ({ page }) => {
      await page.route("**/api/leads", (route) =>
        route.fulfill({ status: 202, json: { ok: true, status: "sent" } }),
      );
      await open(page, "/services/interior");
      const form = page.locator("#interior-contact form");
      await form.getByLabel("Full Name").fill("Jane Doe");
      await form.getByLabel("Email").fill("jane@email.com");
      await form.getByLabel("Project Details").fill("Two bedrooms.");
      await form.getByRole("button", { name: "Send Enquiry" }).click();

      await expect(page).toHaveURL(/\/thank-you$/);
      await expect(chips(page)).toHaveText(
        "Source: Interior Designers in Kochi, KeralaService: Interior Design",
      );
      await expect(fallback(page)).toBeHidden();
      await expect(action(page, "Back to Previous Page")).toHaveAttribute(
        "href",
        "/services/interior",
      );
      const whatsapp = new URL(
        (await action(page, "Continue on WhatsApp").getAttribute("href")) ?? "",
      );
      expect(whatsapp.searchParams.get("text")).toBe(
        [
          "Hi KATIC, here is my enquiry:",
          "",
          "Name: Jane Doe",
          "Email: jane@email.com",
          "Service: Interior Design",
          "Source page: Interior Designers in Kochi, Kerala",
          "",
          "Two bedrooms.",
        ].join("\n"),
      );

      // A refresh keeps the personalisation (KI-F06).
      await page.reload();
      await expect(chips(page)).toHaveText(
        "Source: Interior Designers in Kochi, KeralaService: Interior Design",
      );
    });

    test("personalised after the Start-a-Project popup", async ({ page }) => {
      await page.route("**/api/leads", (route) =>
        route.fulfill({ status: 202, json: { ok: true, status: "sent" } }),
      );
      await open(page, "/about");
      await page
        .locator(".zoom-root > header")
        .getByRole("button", { name: "Start a Project" })
        .click();
      const dialog = page.getByRole("dialog", { name: /Let’s build/ });
      await dialog.getByLabel("Full name").fill("Jane Doe");
      await dialog.getByLabel("Email").fill("jane@email.com");
      await dialog.getByLabel("Service needed").selectOption("Turnkey Projects");
      await dialog.getByText("Apartment").click();
      await dialog.getByRole("button", { name: "Send Enquiry" }).click();

      await expect(page).toHaveURL(/\/thank-you$/);
      await expect(chips(page)).toHaveText("Source: About Katic DesignsService: Turnkey Projects");
      await expect(action(page, "Back to Previous Page")).toHaveAttribute("href", "/about");
      const whatsapp = new URL(
        (await action(page, "Continue on WhatsApp").getAttribute("href")) ?? "",
      );
      expect(whatsapp.searchParams.get("text")).toContain("Project type: Apartment");
    });

    test("a failed delivery shows the email / copy fallback", async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await page.route("**/api/leads", (route) =>
        route.fulfill({ status: 503, json: { ok: false, status: "unavailable" } }),
      );
      await open(page, "/services/interior");
      const form = page.locator("#interior-contact form");
      await form.getByLabel("Full Name").fill("Jane Doe");
      await form.getByLabel("Email").fill("jane@email.com");
      await form.getByRole("button", { name: "Send Enquiry" }).click();

      await expect(page).toHaveURL(/\/thank-you$/);
      await expect(fallback(page)).toBeVisible();
      await expect(fallback(page)).toContainText("We couldn’t reach our server just now");
      await expectStyles(fallback(page), {
        marginTop: "28px",
        paddingTop: "20px",
        paddingLeft: "22px",
        backgroundColor: "rgb(250, 249, 246)",
      });
      const mail = new URL(
        (await fallback(page).getByRole("link", { name: "Send by email" }).getAttribute("href")) ??
          "",
      );
      expect(mail.pathname).toBe("hello@katicdesigns.com");
      expect(mail.searchParams.get("subject")).toBe("Project enquiry — Interior Design");
      expect(mail.searchParams.get("body")).toContain("Email: jane@email.com");

      const copy = fallback(page).getByRole("button", { name: "Copy my details" });
      await expectStyles(copy, { height: "52px" });
      await copy.click();
      await expect(fallback(page).getByRole("button", { name: "Copied" })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Name: Jane Doe");
    });

    test("a reload paints the remembered lead with no layout shift or hydration error", async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.addInitScript(([key, lead]) => sessionStorage.setItem(key, JSON.stringify(lead)), [
        LAST_LEAD,
        STORED_LEAD,
      ] as const);
      await open(page, "/thank-you");
      await expect(chips(page)).toHaveText(
        "Source: Architects & Interior Designers in Dubai, UAEService: Interior Design",
      );
      await expect(fallback(page)).toBeVisible();
      await expect(action(page, "Back to Previous Page")).toHaveAttribute(
        "href",
        "/locations/dubai",
      );
      expect(await layoutShift(page)).toBe(0);
      expect(errors.filter((text) => /hydrat|React error/i.test(text))).toEqual([]);

      // The pre-paint flag does not outlive the page.
      await page.getByRole("link", { name: "Explore Projects" }).click();
      await expect(page).toHaveURL(/\/works/);
      await expect(page.locator("html")).not.toHaveAttribute("data-lead-status");
    });
  });

  test.describe("1024", () => {
    test.use({ viewport: { width: 1024, height: 768 } });

    test("two tile columns; 80px bottom padding", async ({ page }) => {
      await open(page, "/thank-you");
      await expectStyles(thankYou(page), { paddingBottom: "80px", height: "1275.5px" });
      const grid = thankYou(page).locator("[data-feature]").first().locator("..");
      expect(await columns(grid)).toEqual([371, 371]);
      await expectStyles(thankYou(page).locator("[data-feature]").first(), { paddingTop: "30px" });
    });
  });

  test.describe("390 phones", () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test("34px title, one tile column, wrapped buttons", async ({ page }) => {
      await open(page, "/thank-you");
      await expectStyles(thankYou(page), { paddingTop: "200px", height: "1550.34px" });
      await expectStyles(thankYou(page).locator("h1"), { fontSize: "34px", lineHeight: "35.7px" });
      await expectStyles(thankYou(page).locator("h1 + p"), { fontSize: "15px" });
      const grid = thankYou(page).locator("[data-feature]").first().locator("..");
      expect(await columns(grid)).toEqual([350]);
      await expectStyles(action(page, "Continue on WhatsApp").locator(".."), { height: "184px" });
    });
  });
});

for (const [width, height] of [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
] as const) {
  test.describe(`${width} overflow`, () => {
    test.use({ viewport: { width, height } });

    test("no horizontal overflow on /news and /thank-you", async ({ page }) => {
      for (const path of ["/news", "/thank-you"]) {
        await open(page, path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, path).toBe(0);
      }
    });
  });
}
