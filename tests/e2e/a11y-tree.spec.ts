import { expect, type Page, test } from "@playwright/test";

/**
 * Screen-reader view (Phase 10). No screen reader runs in CI, so this checks what one would be
 * given: Playwright aria snapshots for the structure (roles, names, states) of the nav, dialogs,
 * lightbox, carousels and forms, and Chromium's own accessibility tree (CDP) for what is actually
 * exposed, which also honours `inert` and modal dialogs. A manual VoiceOver pass still checks
 * announcements and reading order (see the Phase 10 report).
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Chromium accessibility tree, widths per test");
});

type AxNode = {
  readonly ignored: boolean;
  readonly role?: { readonly value?: string };
  readonly name?: { readonly value?: string };
};

/**
 * Names of the nodes with `role` that Chromium exposes to assistive tech (not ignored), lower-cased:
 * Chromium applies CSS `text-transform` to computed names.
 */
async function exposed(page: Page, role: string): Promise<string[]> {
  const cdp = await page.context().newCDPSession(page);
  const { nodes } = (await cdp.send("Accessibility.getFullAXTree")) as { nodes: AxNode[] };
  await cdp.detach();
  return nodes
    .filter((node) => !node.ignored && node.role?.value === role)
    .map((node) => (node.name?.value ?? "").toLowerCase());
}

test.describe("at 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("header: one banner, the main nav, dropdown state", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("header")).toMatchAriaSnapshot(`
      - banner:
        - link "Katic Designs home"
        - navigation "Main":
          - link "Home"
          - link "About"
          - link "Services"
          - link "Projects"
          - link "Divisions"
          - link "Reviews"
          - link "Blogs"
          - link "Location"
          - button "Start a Project"
    `);
    expect(await exposed(page, "banner")).toHaveLength(1);
    expect(await exposed(page, "main")).toHaveLength(1);
    expect(await exposed(page, "contentinfo")).toHaveLength(1);
    // The current page is marked.
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");

    const services = page.locator("header").getByRole("link", { name: "Services", exact: true });
    await services.focus();
    await expect(page.getByRole("navigation", { name: "Main" })).toMatchAriaSnapshot(`
      - navigation "Main":
        - link "Services" [expanded]
        - link "Architectural Design"
        - link "Interior Design"
        - link /All Services/
    `);
  });

  test("Start-a-Project popup: a named modal dialog with labelled fields", async ({ page }) => {
    await page.goto("/about");
    await page.locator("header").getByRole("button", { name: "Start a Project" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toMatchAriaSnapshot(`
      - dialog "Let’s build something that lasts.":
        - button "Close"
        - heading "Let’s build something that lasts." [level=2]
        - textbox "Full name *"
        - textbox "Email *"
        - textbox "Phone"
        - combobox "Project location"
        - combobox "Service needed *"
        - group "Project type":
          - radio "Home / Villa"
        - combobox "Timeline"
        - combobox "Budget range"
        - textbox "Project details"
        - button "Send Enquiry"
    `);
    // Modal: the page behind is out of the accessibility tree.
    expect(await exposed(page, "banner")).toEqual([]);
    expect(await exposed(page, "dialog")).toEqual(["let’s build something that lasts."]);

    await dialog.getByRole("button", { name: "Send Enquiry" }).click();
    await expect(dialog.getByRole("textbox", { name: "Full name *" })).toHaveAccessibleDescription(
      /name/i,
    );
    await expect(dialog.getByRole("textbox", { name: "Email *" })).toHaveAccessibleDescription(
      /email/i,
    );
  });

  test("lightbox: a dialog named by the photo, one close control, browse buttons", async ({
    page,
  }) => {
    await page.goto("/services");
    await page.getByRole("button", { name: /Enlarge image: Sofa with cushions/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toMatchAriaSnapshot(`
      - dialog /Sofa with cushions/:
        - button "Close"
        - figure:
          - img /Sofa with cushions/
          - text: /1 \\/ 5/
        - button "Previous image"
        - button "Next image"
    `);
    expect(await exposed(page, "button")).toEqual(["close", "previous image", "next image"]);
    await page.keyboard.press("ArrowRight");
    await expect(viewer).toHaveAccessibleName(/Living room with a timber TV wall/);
  });

  test("home carousels and tabs expose only the current slide", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Our divisions" })).toMatchAriaSnapshot(`
      - region "Our divisions":
        - group "1 of 5":
          - heading [level=3]
          - link "Explore Division"
        - button "Previous division"
        - button "Next division"
        - paragraph: KATIC Design, 1 of 5
    `);
    await expect(page.locator("#home-deliver")).toMatchAriaSnapshot(`
      - tablist "Design":
        - tab "Architectural Design" [selected]
        - tab "Interior Design"
        - tab "Exterior & Landscape Design"
      - tablist "Construction":
        - tab "Construction & Execution"
      - tabpanel "Architectural Design":
        - heading "Architectural Design" [level=3]
    `);
    // Hidden slides and panels are inert: Chromium exposes only the current one.
    expect(await exposed(page, "tabpanel")).toEqual(["architectural design"]);
    expect((await exposed(page, "group")).filter((name) => name.endsWith(" of 5"))).toEqual([
      "1 of 5",
    ]);
    await expect(page.locator("#home-stories")).toMatchAriaSnapshot(`
      - blockquote
      - button "Previous story"
      - button "Next story"
    `);
  });

  test("inline enquiry form and FAQ", async ({ page }) => {
    await page.goto("/services/architecture");
    const form = page.locator("main form").first();
    await expect(form).toMatchAriaSnapshot(`
      - textbox /Name/
      - textbox "Email"
      - textbox "Phone"
      - combobox /Service/
      - textbox /Details/
      - button "Send Enquiry"
    `);
    await form.getByRole("button", { name: "Send Enquiry" }).click();
    for (const field of await form.locator("[aria-invalid=true]").all()) {
      await expect(field).toHaveAccessibleDescription(/.+/);
    }

    const faq = page.locator("main h3 > button[aria-expanded]").first();
    const question = ((await faq.textContent()) ?? "").toLowerCase();
    await expect(faq).toHaveAttribute("aria-expanded", "true");
    expect(await exposed(page, "region")).toContain(question);
    await faq.click();
    await expect.poll(() => exposed(page, "region")).not.toContain(question);
  });
});

test.describe("at 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

  test("phone menu: the burger names and controls the panel", async ({ page }) => {
    await page.goto("/about");
    expect(await exposed(page, "navigation")).not.toContain("main");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator("header")).toMatchAriaSnapshot(`
      - banner:
        - link "Katic Designs home"
        - button "Close menu" [expanded]
        - navigation "Main":
          - link "Home"
          - link "Services"
          - button "Start a Project"
    `);
    expect(await exposed(page, "navigation")).toContain("main");
  });
});
