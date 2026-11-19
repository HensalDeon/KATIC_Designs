import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Keyboard-only walkthrough (Phase 10): every interactive pattern operated with the keyboard alone
 * (skip link, header and phone menu, popup, lightbox, carousels and tabs, filters, FAQ, forms),
 * and a visible focus indicator on every element Tab reaches, on one page per family at 1440 and
 * 390. Desktop project only: widths are set per test.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "widths are set per test");
});

const DESKTOP = { width: 1440, height: 900 } as const;
const PHONE = { width: 390, height: 844 } as const;

type FocusInfo = {
  /** Short description: tag, accessible label or text. */
  readonly name: string;
  readonly inDialog: boolean;
  readonly isBody: boolean;
};

async function focused(page: Page): Promise<FocusInfo> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || el === document.body) {
      return { name: "body", inDialog: false, isBody: true };
    }
    const label = el.getAttribute("aria-label") ?? el.textContent.trim().slice(0, 40);
    return {
      name: `${el.tagName.toLowerCase()} ${label}`,
      inDialog: el.closest("dialog[open]") !== null,
      isBody: false,
    };
  });
}

/** Presses Tab until `target` has focus (at most `limit` times). */
async function tabTo(page: Page, target: Locator, limit = 60) {
  for (let i = 0; i < limit; i += 1) {
    if (await target.evaluate((el) => el === document.activeElement)) return;
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
}

test.describe("at 1440", () => {
  test.use({ viewport: DESKTOP });

  test("skip link: first Tab stop, visible, moves focus into main", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    expect((await skip.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.activeElement?.closest("main") !== null)).toBe(true);
  });

  test("header: Tab walks the nav, focus opens a dropdown, Escape returns to its trigger", async ({
    page,
  }) => {
    await page.goto("/about");
    const header = page.locator("header");
    const services = header.getByRole("link", { name: "Services", exact: true });
    await tabTo(page, services);
    await expect(services).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator(`#${(await services.getAttribute("aria-controls")) ?? ""}`);
    await expect(menu).toBeVisible();

    // Tab continues into the open dropdown.
    await page.keyboard.press("Tab");
    await expect(menu.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(menu.getByRole("link").nth(1)).toBeFocused();

    // Escape closes it and puts focus back on the trigger, not on the page.
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(services).toBeFocused();
    await expect(services).toHaveAttribute("aria-expanded", "false");

    // With the dropdown closed, Tab skips its links to the next item.
    await page.keyboard.press("Tab");
    await expect(header.getByRole("link", { name: "Projects", exact: true })).toBeFocused();

    // The rest of the bar ends on the Start-a-Project button, every item reachable.
    const start = header.getByRole("button", { name: "Start a Project" });
    await tabTo(page, start, 40);
  });

  test("popup: opens from the keyboard, keeps focus inside, Escape returns focus", async ({
    page,
  }) => {
    await page.goto("/about");
    const trigger = page.locator("header").getByRole("button", { name: "Start a Project" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: /Full name/ })).toBeFocused();

    // Tab cycles through the dialog only; the page behind is inert. (Past the last control the
    // browser may move focus to its own UI, reported as <body>.)
    const stops = new Set<string>();
    for (let i = 0; i < 40; i += 1) {
      await page.keyboard.press("Tab");
      const info = await focused(page);
      expect(info.inDialog || info.isBody, `focus escaped the popup to ${info.name}`).toBe(true);
      stops.add(info.name);
    }
    expect(stops.size).toBeGreaterThan(10);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("popup: submitting empty focuses the first invalid field and describes the error", async ({
    page,
  }) => {
    await page.goto("/about");
    await page.locator("header").getByRole("button", { name: "Start a Project" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Send Enquiry" }).focus();
    await page.keyboard.press("Enter");
    const name = dialog.getByRole("textbox", { name: /Full name/ });
    await expect(name).toBeFocused();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toHaveAccessibleDescription(/.+/);

    await name.fill("Jane Doe");
    await dialog.getByRole("button", { name: "Send Enquiry" }).focus();
    await page.keyboard.press("Enter");
    const email = dialog.getByRole("textbox", { name: /Email/ });
    await expect(email).toBeFocused();
    await expect(email).toHaveAccessibleDescription(/.+/);
    // The fixed field is no longer marked invalid.
    await expect(name).not.toHaveAttribute("aria-invalid", "true");
  });

  test("lightbox: Enter opens, arrows browse, Escape returns focus to the photo", async ({
    page,
  }) => {
    await page.goto("/services");
    const photo = page.getByRole("button", { name: /Enlarge image: Sofa with cushions/ });
    await photo.focus();
    await page.keyboard.press("Enter");
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    // Initial focus is the Close button, the only "close" control in the tab order.
    await expect(viewer.getByRole("button", { name: "Close" })).toBeFocused();
    await expect(viewer.getByRole("button", { name: /close/i })).toHaveCount(1);
    await expect(viewer.getByText("1 / 5")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByText("2 / 5")).toBeVisible();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(viewer.getByText("5 / 5")).toBeVisible();
    // The previous/next buttons work from the keyboard too.
    await viewer.getByRole("button", { name: "Next image" }).focus();
    await page.keyboard.press("Enter");
    await expect(viewer.getByText("1 / 5")).toBeVisible();
    for (let i = 0; i < 6; i += 1) {
      await page.keyboard.press("Tab");
      const info = await focused(page);
      expect(info.inDialog || info.isBody, `focus escaped the viewer to ${info.name}`).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(viewer).toBeHidden();
    await expect(photo).toBeFocused();
  });

  test.describe("with motion", () => {
    test.use({ reducedMotion: "no-preference" });

    test("home carousels: pause controls and arrow keys", async ({ page }) => {
      await page.goto("/");

      const video = page.getByRole("button", { name: "Pause background video" });
      await video.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("button", { name: "Play background video" })).toBeFocused();

      const logos = page.getByRole("button", { name: "Pause partner logos" });
      await logos.focus();
      await page.keyboard.press(" ");
      await expect(page.getByRole("button", { name: "Play partner logos" })).toBeFocused();

      // Services explorer: an APG tablist (arrows, Home, End move focus and selection).
      const explorer = page.locator("#home-deliver");
      const tabs = explorer.getByRole("tab");
      await tabs.first().focus();
      await page.keyboard.press("ArrowDown");
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("End");
      await expect(tabs.last()).toBeFocused();
      await page.keyboard.press("Home");
      await expect(tabs.first()).toBeFocused();
      await expect(explorer.getByRole("tabpanel", { name: "Architectural Design" })).toBeVisible();
      const explorerPause = explorer.getByRole("button", { name: "Pause services slideshow" });
      await explorerPause.focus();
      await page.keyboard.press("Enter");
      await expect(explorer.getByRole("button", { name: "Play services slideshow" })).toBeFocused();

      // Divisions carousel: buttons and ←/→ inside the region, announced by a live region.
      const carousel = page.getByRole("region", { name: "Our divisions" });
      const live = carousel.locator("[aria-live]");
      const pause = carousel.getByRole("button", { name: "Pause divisions slideshow" });
      await pause.focus();
      await page.keyboard.press("Enter");
      await expect(
        carousel.getByRole("button", { name: "Play divisions slideshow" }),
      ).toBeFocused();
      await expect(live).toHaveText(/1 of 5/);
      await carousel.getByRole("button", { name: "Next division" }).focus();
      await page.keyboard.press("Enter");
      await expect(live).toHaveText(/2 of 5/);
      await expect(live).toHaveAttribute("aria-live", "polite");
      await page.keyboard.press("ArrowRight");
      await expect(live).toHaveText(/3 of 5/);
      await page.keyboard.press("ArrowLeft");
      await expect(live).toHaveText(/2 of 5/);
      // Only the current slide is reachable.
      await expect(carousel.getByRole("group", { name: "2 of 5" })).not.toHaveAttribute(
        "inert",
        /.*/,
      );
      await expect(carousel.locator("[role=group]:not([inert]) a")).toHaveCount(1);

      // Client stories: previous/next buttons, a polite live region.
      const stories = page.locator("#home-stories");
      const quote = stories.locator("blockquote").first();
      const before = await quote.textContent();
      await stories.getByRole("button", { name: "Next story" }).focus();
      await page.keyboard.press("Enter");
      await expect(quote).not.toHaveText(before ?? "");
    });
  });

  test("filters toggle with Enter and Space", async ({ page }) => {
    await page.goto("/works");
    const works = page.locator("main [role=group][aria-label] button[aria-pressed]");
    await works.nth(1).focus();
    await page.keyboard.press("Enter");
    await expect(works.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(page).toHaveURL(/category=/);
    await works.nth(2).focus();
    await page.keyboard.press(" ");
    await expect(works.nth(2)).toHaveAttribute("aria-pressed", "true");
    await expect(works.nth(1)).toHaveAttribute("aria-pressed", "false");

    await page.goto("/locations/india");
    const india = page.locator("#india-projects").getByRole("group").getByRole("button");
    await india.nth(1).focus();
    await page.keyboard.press(" ");
    await expect(india.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(india.first()).toHaveAttribute("aria-pressed", "false");
  });

  test("blog load-more moves focus to the first new card", async ({ page }) => {
    await page.goto("/blog");
    const more = page.getByRole("button", { name: /Load More/i });
    const firstHidden = await page
      .locator("main li[data-paged=hidden] a")
      .first()
      .getAttribute("href");
    await more.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(`main li a[href="${firstHidden ?? ""}"]`)).toBeFocused();
  });

  test("FAQ: questions toggle with Enter and Space; closed answers leave the tab order", async ({
    page,
  }) => {
    await page.goto("/services/architecture");
    const questions = page.locator("main h3 > button[aria-expanded]");
    const first = questions.first();
    const second = questions.nth(1);
    const firstPanel = page.locator(`#${(await first.getAttribute("aria-controls")) ?? ""}`);
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "false");
    await expect(firstPanel).toBeHidden();
    // Tab goes straight from one question to the next: nothing focusable in a closed answer.
    await page.keyboard.press("Tab");
    await expect(second).toBeFocused();
    await page.keyboard.press(" ");
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByRole("region", { name: (await second.textContent()) ?? "" }),
    ).toBeVisible();
  });

  test("inline form: errors focus the first invalid field and are described", async ({ page }) => {
    await page.goto("/services/architecture");
    const form = page.locator("main form").first();
    await form.getByRole("button", { name: "Send Enquiry" }).focus();
    await page.keyboard.press("Enter");
    const invalid = form.locator("[aria-invalid=true]");
    await expect(invalid.first()).toBeFocused();
    for (const field of await invalid.all()) {
      await expect(field).toHaveAccessibleDescription(/.+/);
    }
    // Fixing a field clears its error.
    await page.keyboard.type("Jane Doe");
    await expect(invalid.first()).not.toBeFocused();
  });
});

test.describe("at 390", () => {
  test.use({ viewport: PHONE });

  test("phone menu: burger, Tab into the panel, submenu, Escape back to the burger", async ({
    page,
  }) => {
    await page.goto("/about");
    const burger = page.getByRole("button", { name: "Menu" });
    await tabTo(page, burger, 5);
    await page.keyboard.press("Enter");
    await expect(burger).toHaveAttribute("aria-expanded", "true");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav).toBeVisible();

    // The panel follows the burger in the tab order.
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toBeFocused();

    // First activation of an item with a submenu expands it instead of navigating.
    const services = nav.getByRole("link", { name: "Services", exact: true });
    await tabTo(page, services, 5);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about$/);
    await expect(services).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Architectural Design" })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(nav).toBeHidden();
    await expect(page.getByRole("button", { name: "Menu" })).toBeFocused();
  });

  test("skip link and popup from the phone CTA bar", async ({ page }) => {
    await page.goto("/about");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
    await page.evaluate(() => window.scrollTo(0, 1400));
    const bar = page.getByRole("navigation", { name: "Quick contact" }).last();
    const start = bar.getByRole("button", { name: "Start a Project" });
    await expect(start).toBeVisible();
    await start.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});

/** One page per family; every Tab stop must show a focus indicator. */
const FOCUS_PAGES = [
  "/",
  "/about",
  "/services",
  "/services/architecture",
  "/works",
  "/works/the-courtyard-house",
  "/divisions/design",
  "/blog",
  "/blog/designing-for-kerala-monsoon",
  "/news",
  "/reviews",
  "/locations/india",
  "/locations/dubai",
  "/thank-you",
];

type Stop = {
  readonly name: string;
  readonly visible: boolean;
  readonly indicator: boolean;
  readonly hiddenFromAt: boolean;
};

for (const viewport of [DESKTOP, PHONE]) {
  test.describe(`visible focus at ${viewport.width}`, () => {
    test.use({ viewport, reducedMotion: "no-preference" });

    for (const path of FOCUS_PAGES) {
      test(`every Tab stop on ${path} shows a focus indicator`, async ({ page }) => {
        test.setTimeout(120_000);
        await page.goto(path);
        await page.waitForLoadState("load");
        const failures: string[] = [];
        let first: string | null = null;
        let stops = 0;
        for (let i = 0; i < 400; i += 1) {
          await page.keyboard.press("Tab");
          const stop = await page.evaluate((): Stop | null => {
            const el = document.activeElement;
            if (!(el instanceof HTMLElement) || el === document.body) return null;
            const style = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
            const ring = style.boxShadow !== "none";
            const label = el.getAttribute("aria-label") ?? el.textContent.trim().slice(0, 30);
            const href = el.getAttribute("href");
            return {
              name: `${el.tagName.toLowerCase()} "${label}"${href ? ` ${href}` : ""} #${String(rect.top | 0)}`,
              visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden",
              indicator: outline || ring,
              hiddenFromAt: el.closest("[aria-hidden=true]") !== null,
            };
          });
          if (!stop) break; // focus left the document: the walk is complete
          const key = stop.name.replace(/ #-?\d+$/, "");
          if (first === null) first = key;
          else if (key === first) break;
          stops += 1;
          if (!stop.indicator) failures.push(`no focus indicator: ${stop.name}`);
          if (!stop.visible) failures.push(`invisible Tab stop: ${stop.name}`);
          if (stop.hiddenFromAt) failures.push(`focusable inside aria-hidden: ${stop.name}`);
        }
        expect(failures).toEqual([]);
        // The walk really covered the page (header, content, footer).
        expect(stops).toBeGreaterThan(20);
      });
    }
  });
}
