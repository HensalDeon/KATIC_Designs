import { expect, type Page, test } from "@playwright/test";

/**
 * Global shell: header, dropdowns, phone menu, footer, quick-contact rail and bar, Start-a-Project
 * popup, lightbox, skip link, legacy hash redirects and the leads API.
 * Expected styles are the values measured on the original (reference/probes/shell.mts).
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

const header = (page: Page) => page.locator(".zoom-root > header");

test.describe("desktop 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("header bar, then compact after 40px of scroll", async ({ page }) => {
    await page.goto("/styleguide");
    const bar = header(page);
    await expect(bar).toHaveCSS("top", "18px");
    await expect(bar).toHaveCSS("height", "62px");
    await expect(bar).toHaveCSS("background-color", "rgba(22, 22, 22, 0.86)");
    await expect(bar.locator("img").first()).toHaveCSS("height", "44px");

    const home = bar.getByRole("link", { name: "Home", exact: true });
    await expect(home).toHaveCSS("font-size", "15px");
    await expect(home).toHaveCSS("padding-left", "19px");
    await expect(bar.getByRole("button", { name: "Start a Project" })).toHaveCSS("height", "44px");

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(bar).toHaveCSS("top", "10px");
    await expect(bar).toHaveCSS("background-color", "rgba(14, 14, 14, 0.94)");
    await expect(bar.locator("img").first()).toHaveCSS("height", "38px");
  });

  test("dropdown opens on hover and keyboard focus, closes on Escape", async ({ page }) => {
    await page.goto("/styleguide");
    const services = header(page).getByRole("link", { name: "Services", exact: true });
    const menu = page.locator(`#${await services.getAttribute("aria-controls")}`);

    await expect(menu).toBeHidden();
    await services.hover();
    await expect(menu).toBeVisible();
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await expect(menu).toHaveCSS("min-width", "270px");
    await expect(menu).toHaveCSS("background-color", "rgba(22, 22, 22, 0.97)");
    await expect(menu.getByRole("link")).toHaveCount(8); // 7 services + "All Services →"
    await expect(menu.getByRole("link", { name: "Architectural Design" })).toHaveAttribute(
      "href",
      "/services/architecture",
    );

    await page.mouse.move(700, 800);
    await expect(menu).toBeHidden();

    await services.focus();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("contact rail with tooltips; no phone bar on desktop", async ({ page }) => {
    await page.goto("/styleguide");
    const rail = page.getByRole("navigation", { name: "Quick contact" }).first();
    await expect(rail).toBeVisible();
    await expect(rail).toHaveCSS("right", "22px");
    const whatsapp = rail.getByRole("link", { name: "Chat on WhatsApp" });
    await expect(whatsapp).toHaveCSS("width", "48px");
    await expect(whatsapp).toHaveCSS("background-color", "rgb(232, 98, 44)");
    // Header and footer CTAs only: the phone bar is not displayed on desktop.
    await expect(page.getByRole("button", { name: "Start a Project" })).toHaveCount(2);
  });

  test("footer card, six columns and an undistorted logo (KI-L07)", async ({ page }) => {
    await page.goto("/styleguide");
    const footer = page.locator("footer");
    await expect(footer).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(footer).toHaveCSS("padding-left", "41px");
    await expect(footer.getByRole("heading", { level: 2 })).toHaveCSS("font-size", "40px");
    const columns = await footer
      .locator("div.grid")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(6);

    const logo = footer.locator("img").first();
    const ratio = await logo.evaluate((img: HTMLImageElement) => img.width / img.height);
    expect(ratio).toBeCloseTo(115 / 65, 1);
  });

  test("skip link is the first stop and jumps to main", async ({ page }) => {
    await page.goto("/styleguide");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toHaveCSS("top", "16px");
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
  });

  test("lightbox: open, browse, close", async ({ page }) => {
    await page.goto("/styleguide");
    await page.getByRole("button", { name: /Enlarge image: Shaded courtyard/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toHaveCSS("background-color", "rgba(0, 0, 0, 0.92)");
    await expect(viewer.getByText("1 / 2")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText("2 / 2")).toBeVisible();
    await expect(viewer.getByRole("img")).toHaveAttribute("alt", /Kitchen island/);
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
  });

  test("lightbox: a small source photo is shown as large as the screen allows", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/services");
    // A 326×326 thumbnail of the architecture block.
    await page
      .getByRole("button", { name: /Enlarge image/ })
      .nth(1)
      .click();
    const image = page.getByRole("dialog").getByRole("img");
    await expect(image).toBeVisible();
    // Square image: limited by 86vh (774px), centred.
    await expect.poll(async () => (await image.boundingBox())?.height).toBeCloseTo(774, 0);
    expect((await image.boundingBox())?.width).toBeCloseTo(774, 0);
  });
});

test.describe("Start a Project popup", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("opens from the header, focuses the first field, closes on Escape", async ({ page }) => {
    await page.goto("/styleguide");
    const trigger = header(page).getByRole("button", { name: "Start a Project" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: /Let’s build/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel("Full name")).toBeFocused();
    await expect(dialog.getByLabel("Full name")).toHaveCSS("height", "40px");
    await expect(dialog.getByRole("button", { name: "Send Enquiry" })).toHaveCSS("height", "46px");
    // Page scroll is locked while the popup is open.
    await expect(page.locator("html")).toHaveCSS("overflow", "hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("shows inline errors instead of a toast (KI-F03)", async ({ page }) => {
    await page.goto("/styleguide");
    await header(page).getByRole("button", { name: "Start a Project" }).click();
    const dialog = page.getByRole("dialog", { name: /Let’s build/ });

    await dialog.getByLabel("Email").fill("not-an-email");
    await dialog.getByRole("button", { name: "Send Enquiry" }).click();

    const name = dialog.getByLabel("Full name");
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveCSS("border-top-color", "rgb(232, 98, 44)");
    await expect(dialog.getByText("Please enter your full name.")).toBeVisible();
    await expect(dialog.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(dialog.getByText("Please choose a service.")).toBeVisible();

    await name.fill("Jane");
    await expect(name).not.toHaveAttribute("aria-invalid");
  });

  test("submits to /api/leads and continues to /thank-you", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 202, json: { ok: true, status: "sent" } });
    });

    await page.goto("/styleguide");
    await header(page).getByRole("button", { name: "Start a Project" }).click();
    const dialog = page.getByRole("dialog", { name: /Let’s build/ });
    await dialog.getByLabel("Full name").fill("Jane Doe");
    await dialog.getByLabel("Email").fill("jane@email.com");
    await dialog.getByLabel("Service needed").selectOption("Turnkey Projects");
    await dialog.getByText("Apartment").click();
    await dialog.getByRole("button", { name: "Send Enquiry" }).click();

    await expect(page).toHaveURL(/\/thank-you$/);
    expect(payload).toMatchObject({
      name: "Jane Doe",
      email: "jane@email.com",
      service: "Turnkey Projects",
      projectType: "Apartment",
      source: { form: "popup", path: "/styleguide" },
    });
    const lastLead = await page.evaluate(() => sessionStorage.getItem("katic:last-lead"));
    expect(JSON.parse(lastLead ?? "{}")).toMatchObject({ name: "Jane Doe", status: "sent" });
  });
});

test.describe("phones 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("burger opens the panel; first tap expands a submenu; Escape closes", async ({ page }) => {
    await page.goto("/styleguide");
    const burger = page.getByRole("button", { name: "Menu" });
    await expect(header(page)).toHaveCSS("height", "58px");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

    await burger.tap();
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();
    await expect(nav).toHaveCSS("width", "300px");

    const services = nav.getByRole("link", { name: "Services", exact: true });
    await services.tap();
    await expect(page).toHaveURL(/\/styleguide$/); // first tap does not navigate
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("link", { name: "Turnkey Projects" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("quick-contact bar replaces the rail (KI-L12) and yields to the menu", async ({ page }) => {
    await page.goto("/styleguide");
    await expect(page.getByRole("link", { name: "Chat on WhatsApp" })).toBeHidden();

    const bar = page.locator("nav[aria-label='Quick contact']").last();
    await page.evaluate(() => window.scrollTo(0, 600));
    await expect(bar).toHaveAttribute("aria-hidden", "false");
    await expect(bar).toHaveCSS("bottom", "10px");
    await expect(bar.getByRole("button", { name: "Start a Project" })).toHaveCSS("height", "50px");

    await page.getByRole("button", { name: "Menu" }).tap();
    await expect(bar).toHaveAttribute("aria-hidden", "true");
  });

  test("footer collapses to two columns", async ({ page }) => {
    await page.goto("/styleguide");
    const columns = await page
      .locator("footer div.grid")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    expect(columns).toBe(2);
  });
});

test.describe("legacy hash URLs", () => {
  test("redirect to the new routes", async ({ page }) => {
    await page.goto("/#architecture/process");
    await expect(page).toHaveURL(/\/services\/architecture#process$/);

    await page.goto("/#works/works-list/residential");
    await expect(page).toHaveURL(/\/works\?category=residential#works-list$/);
  });

  test("leave in-page anchors alone", async ({ page }) => {
    await page.goto("/#start");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(/\/#start$/);
  });
});

test.describe("POST /api/leads", () => {
  const lead = {
    name: "Jane Doe",
    email: "jane@email.com",
    service: "Interior Design",
    source: { form: "popup", path: "/", title: "Home" },
  };

  test("rejects invalid input with field errors", async ({ request }) => {
    const response = await request.post("/api/leads", { data: { ...lead, email: "nope" } });
    expect(response.status()).toBe(422);
    expect(await response.json()).toMatchObject({
      status: "invalid",
      errors: { email: "Please enter a valid email address." },
    });
  });

  test("silently accepts honeypot submissions", async ({ request }) => {
    const response = await request.post("/api/leads", {
      data: { ...lead, company_website: "spam.example" },
    });
    expect(response.status()).toBe(202);
  });

  test("reports unavailable in production when no endpoint is configured", async ({ request }) => {
    test.skip(Boolean(process.env["E2E_BASE_URL"]), "dev servers log leads instead");
    const response = await request.post("/api/leads", { data: lead });
    expect(response.status()).toBe(503);
  });
});
