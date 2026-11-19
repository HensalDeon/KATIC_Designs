import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Contact + FAQ section of the service pages: ContactFaq light (/services/interior) and dark
 * (/services/turnkey), the FAQ accordion, EnquiryForm (validation, submission, hidden-service mode
 * on /services/factory) and "go to contact".
 *
 * Expected styles are the original's computed values (reference/probes/sections.json, summarised
 * with `python3 reference/probes/summarize-sections.py contact,faq,plant`). The original shrinks
 * the 1440 combo with `fit()` (dropped by D4), so canvas values are compared, not rendered boxes.
 * Deliberate deviations carry their KNOWN_ISSUES id.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before") {
  const keys = Object.keys(expected);
  const actual = await locator.evaluate(
    (el, { props, pseudoElt }) => {
      const style = getComputedStyle(el, pseudoElt ?? null);
      return props.map((prop) => style.getPropertyValue(prop));
    },
    { props: keys.map(kebab), pseudoElt: pseudo },
  );
  expect(Object.fromEntries(keys.map((key, i) => [key, actual[i]]))).toEqual(expected);
}

const JOST = /^(__Jost|Jost)/;
const INTER = /^(__Inter|Inter)/;

async function expectFont(locator: Locator, family: RegExp) {
  expect(await locator.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(family);
}

type Slug = "interior" | "turnkey" | "factory";

async function open(page: Page, slug: Slug) {
  await page.goto(`/services/${slug}`);
  await page.evaluate(() => document.fonts.ready);
}

/** Parts of a service page's contact + FAQ section, by structure (the components take no test ids). */
function combo(page: Page, slug: Slug) {
  const section = page.locator(`#${slug}-contact`);
  const grid = section.locator(":scope > div");
  const left = grid.locator(":scope > div").first();
  const right = grid.locator(":scope > div").last();
  const faq = right.locator(":scope > div").last();
  return {
    section,
    grid,
    faq,
    eyebrow: left.locator(":scope > p").first(),
    heading: left.locator(":scope > h2"),
    accent: left.locator(":scope > h2 > span"),
    lead: left.locator(":scope > h2 + p"),
    info: left.locator("dl"),
    infoTerm: left.locator("dt").first(),
    infoValue: left.locator("dd").first(),
    infoLink: left.locator("dd a").first(),
    form: left.locator("form"),
    label: left.locator("form label").first(),
    send: left.getByRole("button", { name: "Send Enquiry" }),
    note: left.locator("form > p").last(),
    faqKicker: right.locator(":scope > p").first(),
    faqTitle: right.locator(":scope > h2"),
    faqItem: faq.locator(":scope > div").first(),
    question: faq.getByRole("button").first(),
    icon: faq.locator("button i").first(),
    answer: faq.locator("[role=region] p").first(),
    answerLink: faq.locator("[role=region] a").first(),
    plant: section.locator(":scope > img"),
    field: (label: string | RegExp) => left.getByLabel(label),
  };
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("light combo (interior): layout, intro and contact info", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expect(c.section).toHaveAttribute("id", "interior-contact");
    await expect(c.section).toHaveAttribute("data-contact-section", "");
    await expectStyles(c.section, {
      backgroundColor: "rgb(255, 255, 255)",
      paddingTop: "120px",
      paddingBottom: "120px",
      minHeight: "900px",
    });
    await expectStyles(c.grid, { gridTemplateColumns: "586px 586px", columnGap: "96px" });

    await expectFont(c.eyebrow, JOST);
    await expectStyles(c.eyebrow, {
      fontSize: "12px",
      fontWeight: "400",
      color: "rgb(34, 34, 34)",
      columnGap: "10px",
    });
    await expectStyles(
      c.eyebrow,
      { width: "5px", height: "5px", backgroundColor: "rgb(232, 98, 44)" },
      "::before",
    );
    await expectStyles(c.heading, {
      fontSize: "44px",
      fontWeight: "700",
      lineHeight: "44px",
      letterSpacing: "0.22px",
      marginTop: "14px",
      marginBottom: "14px",
      color: "rgb(0, 0, 0)",
      textTransform: "none",
    });
    await expect(c.accent).toHaveText("Interior?");
    await expect(c.accent).toHaveCSS("color", "rgb(232, 98, 44)");
    await expectStyles(c.lead, {
      fontSize: "13.5px",
      lineHeight: "22.95px",
      maxWidth: "520px",
      color: "rgba(0, 0, 0, 0.82)",
    });
    await expectStyles(c.info, {
      display: "flex",
      flexWrap: "wrap",
      rowGap: "40px",
      columnGap: "40px",
      marginTop: "16px",
      fontSize: "12px",
      color: "rgb(51, 51, 51)",
    });
    await expectStyles(c.infoValue, {
      marginTop: "2px",
      fontSize: "15px",
      fontWeight: "500",
      color: "rgb(0, 0, 0)",
    });
    await expect(c.infoLink).toHaveCSS("font-size", "14px");
    await expect(c.infoTerm).toHaveText("Email");
    await expect(c.info.locator("dt")).toHaveText(["Email", "Phone", "WhatsApp"]);
  });

  test("light combo: form fields, button and note", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expectStyles(c.form, {
      marginTop: "24px",
      rowGap: "14px",
      columnGap: "16px",
      gridTemplateColumns: "285px 285px",
    });
    await expectFont(c.label, JOST);
    await expectStyles(c.label, {
      fontSize: "12px",
      fontWeight: "500",
      marginBottom: "6px",
      color: "rgb(68, 68, 68)",
    });
    const input = c.field("Full Name");
    await expectStyles(input, {
      height: "42px",
      paddingLeft: "16px",
      paddingRight: "16px",
      fontSize: "14px",
      fontWeight: "400",
      color: "rgb(17, 17, 17)",
      backgroundColor: "rgb(245, 245, 245)",
      borderTopColor: "rgb(220, 220, 220)",
      borderTopWidth: "1px",
    });
    await expectStyles(c.field("Service Needed"), {
      height: "42px",
      fontWeight: "500",
      backgroundColor: "rgb(245, 245, 245)",
    });
    await expectStyles(c.field("Project Details"), {
      height: "76px",
      paddingTop: "14px",
      paddingBottom: "14px",
    });
    await expectStyles(c.send, {
      height: "50px",
      marginTop: "4px",
      fontSize: "14px",
      fontWeight: "600",
      color: "rgb(238, 238, 238)",
      backgroundColor: "rgb(232, 98, 44)",
      columnGap: "12px",
    });
    await expectStyles(c.note, {
      fontSize: "10.5px",
      marginTop: "-6px",
      color: "rgb(51, 51, 51)",
    });
    // Interior's page selects.
    await expect(c.field("Space")).toHaveValue("");
    await expect(c.field("Possession").locator("option")).toHaveText([
      "Select",
      "Ready now",
      "Under construction",
    ]);
    await expect(c.field("Service Needed")).toHaveValue("Interior Design");
  });

  test("light combo: FAQ column and plant", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expectFont(c.faqKicker, INTER);
    await expectStyles(c.faqKicker, {
      fontSize: "9.5px",
      letterSpacing: "1.9px",
      textTransform: "uppercase",
      color: "rgb(0, 0, 0)",
    });
    await expectStyles(c.faqTitle, {
      fontSize: "36px",
      fontWeight: "700",
      lineHeight: "39.6px",
      letterSpacing: "0.18px",
      textTransform: "uppercase",
      marginTop: "14px",
      marginBottom: "22px",
      color: "rgb(0, 0, 0)",
    });
    await expectStyles(c.faqItem, {
      borderTopColor: "rgb(217, 217, 217)",
      borderBottomColor: "rgb(217, 217, 217)",
      borderBottomWidth: "1px",
    });
    await expectFont(c.question, INTER);
    await expectStyles(c.question, {
      paddingTop: "17px",
      paddingBottom: "17px",
      fontSize: "15.5px",
      lineHeight: "22.475px",
      columnGap: "32px",
      color: "rgb(0, 0, 0)",
    });
    await expectStyles(c.icon, { width: "14px", height: "14px" });
    await expectStyles(c.answer, {
      fontSize: "14px",
      lineHeight: "25.9px",
      color: "rgb(101, 101, 101)",
    });
    await expectStyles(c.answerLink, {
      marginTop: "10px",
      fontSize: "12px",
      fontWeight: "500",
      color: "rgb(0, 0, 0)",
      borderBottomColor: "rgb(187, 187, 187)",
    });
    // KI-F08: the original links to the page itself (`#interior`); the rebuild to its services.
    await expect(c.answerLink).toHaveAttribute("href", "#interior-services");
    await expectStyles(c.plant, { width: "230px", opacity: "0.9", zIndex: "-1" });
  });

  test("dark combo (turnkey): tone colours", async ({ page }) => {
    await open(page, "turnkey");
    const c = combo(page, "turnkey");
    await expect(c.section).toHaveAttribute("id", "turnkey-contact");
    await expect(c.section).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(c.eyebrow).toHaveCSS("color", "rgb(221, 221, 221)");
    await expect(c.heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(c.lead).toHaveCSS("color", "rgba(255, 255, 255, 0.82)");
    await expect(c.info).toHaveCSS("color", "rgb(204, 204, 204)");
    await expect(c.infoValue).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(c.label).toHaveCSS("color", "rgb(238, 238, 238)");
    await expectStyles(c.field("Full Name"), {
      backgroundColor: "rgb(248, 247, 243)",
      borderTopColor: "rgb(255, 255, 255)",
      color: "rgb(17, 17, 17)",
    });
    await expect(c.send).toHaveCSS("color", "rgb(17, 17, 17)");
    await expect(c.note).toHaveCSS("color", "rgb(204, 204, 204)");
    // KI-A11: brand orange instead of the original's #C24E1E (4.4:1 on black).
    await expect(c.faqKicker).toHaveCSS("color", "rgb(232, 98, 44)");
    await expect(c.faqTitle).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(c.faqItem).toHaveCSS("border-bottom-color", "rgb(38, 38, 38)");
    await expect(c.question).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(c.answer).toHaveCSS("color", "rgb(154, 154, 154)");
    await expect(c.plant).toHaveCSS("width", "220px");
  });

  test("an odd number of half fields never leaves an empty cell (KI-L22)", async ({ page }) => {
    await open(page, "turnkey");
    // Turnkey: name, email, phone, service + 3 selects = 7, so Timeline spans both columns.
    const turnkey = combo(page, "turnkey");
    await expect(turnkey.field("Timeline")).toHaveCSS("width", "586px");
    await expect(turnkey.field("Budget Range")).toHaveCSS("width", "285px");
    // Interior: 6 half fields, all half width.
    await open(page, "interior");
    await expect(combo(page, "interior").field("Possession")).toHaveCSS("width", "285px");
  });
});

test.describe("1024 (single column)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("stacks the columns and uses the uncompacted sizes", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expectStyles(c.section, { paddingTop: "80px", paddingBottom: "80px" });
    await expectStyles(c.grid, { gridTemplateColumns: "952px", rowGap: "64px" });
    await expectStyles(c.heading, {
      fontSize: "54px",
      lineHeight: "54px",
      marginTop: "20px",
      marginBottom: "22px",
    });
    await expectStyles(c.lead, { fontSize: "15px", lineHeight: "27.75px" });
    await expectStyles(c.info, { marginTop: "28px", height: "24px" });
    await expect(c.infoLink).toHaveCSS("font-size", "15px");
    await expectStyles(c.form, {
      marginTop: "40px",
      rowGap: "20px",
      columnGap: "18px",
      gridTemplateColumns: "467px 467px",
    });
    await expect(c.label).toHaveCSS("margin-bottom", "9px");
    await expect(c.field("Full Name")).toHaveCSS("height", "46px");
    await expect(c.field("Project Details")).toHaveCSS("height", "108px");
    await expectStyles(c.faqTitle, {
      fontSize: "40px",
      lineHeight: "44px",
      marginTop: "20px",
      marginBottom: "36px",
    });
    await expectStyles(c.question, {
      paddingTop: "24px",
      fontSize: "16.5px",
      lineHeight: "23.925px",
    });
    // Same overall height as the original (1663px), so nothing drifts.
    expect((await c.section.boundingBox())?.height).toBeCloseTo(1663, 0);
  });
});

test.describe("phones 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("one-column form, phone type sizes and the plant reserve", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expect(c.grid).toHaveCSS("grid-template-columns", "350px");
    await expect(c.heading).toHaveCSS("font-size", "38px");
    await expect(c.form).toHaveCSS("grid-template-columns", "350px");
    await expect(c.field("Full Name")).toHaveCSS("font-size", "16px");
    await expect(c.field("Service Needed")).toHaveCSS("font-size", "16px");
    await expectStyles(c.faqTitle, { fontSize: "34px", lineHeight: "37.4px" });
    // The original's runtime fixer raises it to 11px on phones; the rebuild sets it (KI-A10).
    await expect(c.faqKicker).toHaveCSS("font-size", "11px");
    // Bottom padding reserves 95% of the 58%-size plant (original: 263.07px).
    const padding = await c.section.evaluate((el) =>
      parseFloat(getComputedStyle(el).paddingBottom),
    );
    expect(padding).toBeCloseTo(263.07, 0);
  });

  test("contact info is a two-column definition list (KI-L11)", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expect(c.info).toHaveCSS("display", "grid");
    const rows = await c.info.evaluate((dl) =>
      [...dl.querySelectorAll("dt")].map((dt) => {
        const dd = dt.nextElementSibling;
        if (!dd) throw new Error("dt without dd");
        const t = dt.getBoundingClientRect();
        const d = dd.getBoundingClientRect();
        return { termLeft: t.left, valueLeft: d.left, sameRow: Math.abs(t.bottom - d.bottom) < 4 };
      }),
    );
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row.sameRow).toBe(true);
      expect(row.valueLeft).toBe(rows[0]?.valueLeft);
    }
  });
});

test.describe("FAQ accordion", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("single-open with button headers, regions and a rotating icon (KI-A09)", async ({
    page,
  }) => {
    await open(page, "interior");
    const faq = combo(page, "interior").faq;
    const questions = faq.getByRole("button", { expanded: true });
    await expect(questions).toHaveCount(1);

    const first = faq.getByRole("button", {
      name: "What does an interior design project include?",
    });
    const second = faq.getByRole("button", { name: "Do you manufacture furniture and joinery?" });
    const firstPanel = page.locator(`#${await first.getAttribute("aria-controls")}`);
    const secondPanel = page.locator(`#${await second.getAttribute("aria-controls")}`);

    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expect(firstPanel).toHaveAttribute("role", "region");
    await expect(firstPanel).toHaveAttribute(
      "aria-labelledby",
      (await first.getAttribute("id")) ?? "",
    );
    await expect(firstPanel).toBeVisible();
    await expect(secondPanel).toBeHidden();
    await expect(
      page.getByRole("region", { name: "Do you manufacture furniture and joinery?" }),
    ).toHaveCount(0);
    await expect(first.locator("i")).toHaveCSS(
      "transform",
      "matrix(0.707107, 0.707107, -0.707107, 0.707107, 0, 0)",
    );
    await expect(first.locator("i")).toHaveCSS("transition-duration", "0.3s");
    await expect(firstPanel).toHaveCSS("transition-duration", "0.35s");

    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(secondPanel).toBeVisible();
    await expect(firstPanel).toBeHidden();
    await expect(first.locator("i")).toHaveCSS("transform", "none");

    // The whole answer is shown: no fixed max-height clipping.
    await page.waitForTimeout(450);
    const clipped = await secondPanel.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(clipped).toBeLessThanOrEqual(1);

    // Clicking the open question closes it.
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "false");
    await expect(secondPanel).toBeHidden();
    await expect(questions).toHaveCount(0);
  });

  test("answer links are real links or buttons (KI-F07)", async ({ page }) => {
    await open(page, "interior");
    const faq = combo(page, "interior").faq;
    await faq.getByRole("button", { name: "How do you plan the budget?" }).click();
    const quote = faq.getByRole("button", { name: /Ask for a quote/ });
    await expect(quote).toBeVisible();
    await expect(faq.locator("a[href='contact']")).toHaveCount(0);
    await quote.click();
    await expect(combo(page, "interior").field("Full Name")).toBeFocused();
  });
});

test.describe("enquiry form", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("labels every field and shows inline errors (KI-A03, KI-F03)", async ({ page }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    for (const label of [
      "Full Name",
      "Email",
      "Phone",
      "Service Needed",
      "Space",
      "Possession",
      "Project Details",
    ]) {
      await expect(c.field(label)).toHaveCount(1);
    }
    await c.field("Service Needed").selectOption("");
    await c.field("Email").fill("not-an-email");
    await c.send.click();

    const name = c.field("Full Name");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveCSS("border-top-color", "rgb(232, 98, 44)");
    const nameError = c.form.getByText("Please enter your full name.");
    await expect(nameError).toBeVisible();
    await expect(name).toHaveAttribute(
      "aria-describedby",
      (await nameError.getAttribute("id")) ?? "",
    );
    await expect(c.form.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(c.form.getByText("Please choose a service.")).toBeVisible();

    await name.fill("Jane");
    await expect(name).not.toHaveAttribute("aria-invalid");
    await expect(nameError).toHaveCount(0);
  });

  test("submits with the page selects in `extra` and continues to /thank-you", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 202, json: { ok: true, status: "sent" } });
    });
    await open(page, "interior");
    const c = combo(page, "interior");
    await c.field("Full Name").fill("Jane Doe");
    await c.field("Email").fill("jane@email.com");
    await c.field("Space").selectOption("Apartment");
    await c.field("Project Details").fill("Two bedrooms.");
    await c.send.click();

    await expect(page).toHaveURL(/\/thank-you$/);
    expect(payload).toMatchObject({
      name: "Jane Doe",
      email: "jane@email.com",
      service: "Interior Design",
      details: "Two bedrooms.",
      extra: { Space: "Apartment" },
      source: { form: "contact", path: "/services/interior" },
    });
    expect(payload).not.toHaveProperty("budget");
    const lastLead = await page.evaluate(() => sessionStorage.getItem("katic:last-lead"));
    expect(JSON.parse(lastLead ?? "{}")).toMatchObject({
      name: "Jane Doe",
      service: "Interior Design",
      status: "sent",
      form: "contact",
      extra: { Space: "Apartment" },
    });
  });

  test("turnkey's own budget select does not collide with the popup's budget field", async ({
    page,
  }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 202, json: { ok: true, status: "sent" } });
    });
    await open(page, "turnkey");
    const c = combo(page, "turnkey");
    await c.field("Full Name").fill("Jane Doe");
    await c.field("Email").fill("jane@email.com");
    await c.field("Budget Range").selectOption("₹1.5 crore +");
    await c.field("Timeline").selectOption("Just exploring");
    await c.send.click();
    await expect(page).toHaveURL(/\/thank-you$/);
    expect(payload).toMatchObject({
      service: "Turnkey Projects",
      extra: { "Budget Range": "₹1.5 crore +", Timeline: "Just exploring" },
    });
    expect(payload).not.toHaveProperty("budget");
    expect(payload).not.toHaveProperty("timeline");
  });

  test("hidden-service mode files Factory leads under Interior Design (KI-F01)", async ({
    page,
  }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 202, json: { ok: true, status: "sent" } });
    });
    await open(page, "factory");
    const c = combo(page, "factory");
    await expect(c.field("Service Needed")).toHaveCount(0);
    await expect(c.form.locator("input[type=hidden][name=service]")).toHaveValue("Interior Design");
    // 5 half fields: Quantity spans both columns (KI-L22).
    await expect(c.field("Quantity")).toHaveCSS("width", "586px");

    await c.field("Full Name").fill("Jane Doe");
    await c.field("Email").fill("jane@email.com");
    await c.field("Product").selectOption("Kitchen");
    await c.send.click();
    await expect(page).toHaveURL(/\/thank-you$/);
    expect(payload).toMatchObject({
      service: "Interior Design",
      extra: { Product: "Kitchen" },
      source: { form: "contact" },
    });
  });

  test("rate-limited submissions show a toast and stay on the page", async ({ page }) => {
    await page.route("**/api/leads", (route) =>
      route.fulfill({ status: 429, json: { ok: false, status: "rate-limited" } }),
    );
    await open(page, "interior");
    const c = combo(page, "interior");
    await c.field("Full Name").fill("Jane Doe");
    await c.field("Email").fill("jane@email.com");
    await c.send.click();
    await expect(page.getByRole("status")).toHaveText(/Too many enquiries/);
    await expect(page).toHaveURL(/\/services\/interior$/);
  });
});

/** The hero's "Discuss Your Interior": a "go to contact" link preselecting Interior Design. */
const heroContact = (page: Page) =>
  page.locator("[data-hero]").getByRole("link", { name: "Discuss Your Interior" });

test.describe("go to contact", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("scrolls to the page's form, preselects the service and focuses the first field", async ({
    page,
  }) => {
    await open(page, "interior");
    const c = combo(page, "interior");
    await expect(c.field("Service Needed")).toHaveValue("Interior Design");
    // The visitor's own choice, which the request overrides.
    await c.field("Service Needed").selectOption("Turnkey Projects");
    await page.evaluate(() => window.scrollTo(0, 0));
    await heroContact(page).click();

    await expect(c.field("Full Name")).toBeFocused();
    await expect(c.field("Service Needed")).toHaveValue("Interior Design");
    // The scroll from the hero outlasts the 1s focus fallback, so wait for it to land.
    await expect
      .poll(() => c.section.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(4);

    // A later request overrides the visitor's own choice again.
    await c.field("Service Needed").selectOption("Construction & Execution");
    await page.evaluate(() => window.scrollTo(0, 0));
    await heroContact(page).click();
    await expect(c.field("Service Needed")).toHaveValue("Interior Design");
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("jumps instantly and focuses", async ({ page }) => {
      await open(page, "interior");
      await heroContact(page).click();
      await expect(combo(page, "interior").field("Full Name")).toBeFocused();
    });
  });

  // Every page with a "go to contact" trigger has its own contact section, so the fallback is
  // exercised by removing the marker.
  test("goes to the home contact section when the page has none", async ({ page }) => {
    await open(page, "interior");
    await page.evaluate(() => {
      document.querySelectorAll("[data-contact-section]").forEach((el) => {
        el.removeAttribute("data-contact-section");
      });
    });
    await heroContact(page).click();
    await expect(page).toHaveURL(/\/#start$/);
  });
});
