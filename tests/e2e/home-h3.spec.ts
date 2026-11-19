import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Home sections of Phase 4 group H3 (/styleguide/home-h3): services explorer (E27), divisions
 * carousel (E28), client stories (E29) and contact + FAQ.
 *
 * Expected styles are the original's computed values at 1440, 1024 and 390, measured on #home
 * (probe: coverage/h3/probe.mjs against `pnpm ref:serve`). Deliberate deviations carry their
 * KNOWN_ISSUES id. Timed behaviour runs on Playwright's fake clock.
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before" | "::after") {
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

/** Box relative to `root`, in canvas px (divides out the desktop zoom). */
async function box(locator: Locator, root: Locator) {
  const rootHandle = await root.elementHandle();
  return locator.evaluate((el, r) => {
    const zoom = parseFloat(getComputedStyle(document.querySelector(".zoom-root") ?? el).zoom) || 1;
    const a = el.getBoundingClientRect();
    const b = (r as Element).getBoundingClientRect();
    const round = (n: number) => Math.round((n / zoom) * 10) / 10;
    return {
      x: round(a.left - b.left),
      y: round(a.top - b.top),
      w: round(a.width),
      h: round(a.height),
    };
  }, rootHandle);
}

async function open(page: Page) {
  await page.goto("/styleguide/home-h3");
  await page.evaluate(() => document.fonts.ready);
}

function explorer(page: Page) {
  const section = page.locator("#home-deliver");
  const panel = section.locator("[role=tabpanel]:not([inert])");
  return {
    section,
    grid: section.locator("[data-part=grid]"),
    left: section.locator("[data-part=left]"),
    title: section.locator("h2"),
    lead: section.locator("[data-part=lead]"),
    tabs: section.getByRole("tab"),
    selected: section.locator("[role=tab][aria-selected=true]"),
    panel,
    panelTitle: panel.locator("h3"),
    media: section.locator("[data-part=media]"),
    bar: section.locator("[data-part=bar] > b"),
    toggle: section.getByRole("button", { name: /(Pause|Play) services slideshow/ }),
  };
}

function carousel(page: Page) {
  const section = page.locator("#home-divisions");
  const region = section.getByRole("region", { name: "Our divisions" });
  const active = region.locator("[aria-roledescription=slide]:not([inert])");
  return {
    section,
    region,
    header: section.locator("[data-part=kh]"),
    card: region.locator("[data-part=card]"),
    slides: region.locator("[aria-roledescription=slide]"),
    active,
    title: active.locator("h3"),
    ft: active.locator("[data-part=ft]"),
    nav: region.locator("[data-part=nav]"),
    prev: region.getByRole("button", { name: "Previous division" }),
    next: region.getByRole("button", { name: "Next division" }),
    live: region.locator("[data-part=live]"),
    bar: region.locator("[data-part=bar] > b"),
    toggle: region.getByRole("button", { name: /(Pause|Play) divisions slideshow/ }),
  };
}

function stories(page: Page) {
  const section = page.locator("#home-stories");
  return {
    section,
    grid: section.locator("[data-part=grid]"),
    portrait: section.locator("[data-part=portrait]"),
    project: section.locator("[data-part=project]"),
    quote: section.locator("blockquote"),
    story: section.locator("[data-part=story]"),
    who: section.locator("[data-part=who]"),
    prev: section.locator("[data-q='-1']"),
    next: section.locator("[data-q='1']"),
    cta: section.getByRole("link", { name: "VIEW ALL STORIES" }),
  };
}

function contact(page: Page) {
  const section = page.locator("#start");
  const left = section.locator(":scope > div > div").first();
  const right = section.locator(":scope > div > div").last();
  return {
    section,
    heading: left.locator(":scope > h2"),
    info: left.locator("dl"),
    form: left.locator("form"),
    label: left.locator("form label").first(),
    send: left.getByRole("button", { name: "Send Enquiry" }),
    faqKicker: right.locator(":scope > p").first(),
    faqTitle: right.locator(":scope > h2"),
    question: right.getByRole("button").first(),
    field: (label: string) => left.getByLabel(label, { exact: true }),
  };
}

/** Fake timers that only move with `clock.runFor` (no natural flow), installed before load. */
async function freezeClock(page: Page) {
  await page.clock.install();
  await page.clock.pauseAt(Date.now() + 1_000);
}

/** Parks the pointer at the bottom-left of the viewport (outside a section scrolled half out). */
async function park(page: Page) {
  await page.mouse.move(2, 890);
}

/**
 * Scrolls `section` (one screen tall on the canvas) half out of view at the top, so it stays over
 * the 30–35% visibility thresholds while the pointer can rest below it, then waits for autoplay.
 */
async function startAutoplay(page: Page, section: Locator, bar: Locator) {
  // Retried: the router may still restore the scroll position right after hydration.
  await expect(async () => {
    await section.evaluate((el) => {
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 450);
    });
    await park(page);
    await expect(bar).toHaveAttribute("data-run", "true", { timeout: 1_000 });
    expect(await section.evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(-450);
  }).toPass();
}

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("services explorer: full-bleed split, list and caption styles", async ({ page }) => {
    await open(page);
    const e = explorer(page);
    await expectStyles(e.section, {
      backgroundColor: "rgb(0, 0, 0)",
      height: "900px",
      paddingTop: "0px",
    });
    await expectStyles(e.grid, { gridTemplateColumns: "506px 934px" });
    await expectStyles(e.left, {
      paddingTop: "104px",
      paddingLeft: "86px",
      paddingRight: "48px",
      borderRightColor: "rgb(38, 38, 38)",
    });
    await expectStyles(e.title, { fontSize: "56px", fontWeight: "500", marginTop: "14px" });
    await expectStyles(e.lead, {
      fontSize: "14.5px",
      lineHeight: "24.65px",
      color: "rgb(170, 170, 170)",
      maxWidth: "330px",
    });
    await expectStyles(e.selected, {
      height: "44px",
      fontSize: "13px",
      fontWeight: "500",
      letterSpacing: "1.04px",
      textTransform: "uppercase",
      color: "rgb(255, 255, 255)",
      borderBottomColor: "rgb(34, 34, 34)",
    });
    await expectStyles(e.tabs.nth(1), { color: "rgb(143, 143, 143)" });
    expect(await box(e.tabs.first(), e.section)).toEqual({ x: 86, y: 303.4, w: 371, h: 44 });
    expect(await box(e.media, e.section)).toEqual({ x: 506, y: 0, w: 934, h: 900 });
    await expectStyles(
      e.media,
      {
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.45) 72%, rgba(0, 0, 0, 0.82) 100%)",
      },
      "::after",
    );
    expect(await box(e.panel, e.section)).toMatchObject({ x: 562, y: 702, w: 774 });
    await expectStyles(e.panel, { gridTemplateColumns: "402.531px 335.453px", columnGap: "36px" });
    await expectStyles(e.panelTitle, {
      fontSize: "32px",
      lineHeight: "35.2px",
      color: "rgb(255, 255, 255)",
    });
    await expectStyles(e.bar.locator(".."), {
      height: "3px",
      backgroundColor: "rgba(255, 255, 255, 0.35)",
    });
  });

  test("services explorer: tablist semantics and keyboard (KI-A06)", async ({ page }) => {
    await open(page);
    const e = explorer(page);
    await expect(e.section.getByRole("tablist")).toHaveCount(2);
    await expect(e.section.getByRole("tablist", { name: "Design" }).getByRole("tab")).toHaveCount(
      3,
    );
    await expect(
      e.section.getByRole("tablist", { name: "Construction" }).getByRole("tab"),
    ).toHaveCount(4);
    await expect(e.tabs).toHaveCount(7);
    await expect(e.selected).toHaveText("Architectural Design");
    await expect(e.section.locator("[role=tabpanel]")).toHaveCount(7);
    await expect(e.section.locator("[role=tabpanel][inert]")).toHaveCount(6);
    const controls = await e.selected.getAttribute("aria-controls");
    await expect(e.panel).toHaveAttribute("id", controls ?? "");
    await expect(e.panel).toHaveAccessibleName("Architectural Design");
    await expect(e.tabs.nth(1)).toHaveAttribute("tabindex", "-1");

    await e.selected.focus();
    await page.keyboard.press("ArrowDown");
    await expect(e.tabs.nth(1)).toBeFocused();
    await expect(e.tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(e.panelTitle).toHaveText("Interior Design");
    await page.keyboard.press("End");
    await expect(e.selected).toHaveText("Property Care & Maintenance");
    await page.keyboard.press("ArrowRight");
    await expect(e.selected).toHaveText("Architectural Design");
    await page.keyboard.press("ArrowUp");
    await expect(e.selected).toHaveText("Property Care & Maintenance");
    await page.keyboard.press("Home");
    await expect(e.tabs.first()).toBeFocused();

    // Hovering a tab selects it on the canvas.
    await e.tabs.nth(3).hover();
    await expect(e.selected).toHaveText("Construction & Execution");
  });

  test("services explorer: advances every 6s while in view", async ({ page }) => {
    await freezeClock(page);
    await open(page);
    const e = explorer(page);
    await startAutoplay(page, e.section, e.bar);
    await expectStyles(e.bar, { animationDuration: "6s", animationTimingFunction: "linear" });
    await page.clock.runFor(5_000);
    await expect(e.selected).toHaveText("Architectural Design");
    await page.clock.runFor(1_100);
    await expect(e.selected).toHaveText("Interior Design");
    await page.clock.runFor(6_100);
    await expect(e.selected).toHaveText("Exterior & Landscape Design");
  });

  test("services explorer: holds on hover, focus and the pause control (KI-A01)", async ({
    page,
  }) => {
    await freezeClock(page);
    await open(page);
    const e = explorer(page);
    await startAutoplay(page, e.section, e.bar);

    await e.panelTitle.hover();
    await page.clock.runFor(13_000);
    await expect(e.selected).toHaveText("Architectural Design");
    await expect(e.bar).not.toHaveAttribute("data-run");
    await park(page);
    await expect(e.section.locator("[data-autoplay]")).toHaveAttribute("data-autoplay", "running");
    await expect(e.bar).toHaveAttribute("data-run", "true");
    await page.clock.runFor(6_100);
    await expect(e.selected).toHaveText("Interior Design");

    // Keyboard-style focus without scrolling the section out of position.
    await e.selected.evaluate((el) => {
      (el as HTMLElement).focus({ preventScroll: true });
    });
    await expect(e.bar).not.toHaveAttribute("data-run");
    await page.clock.runFor(13_000);
    await expect(e.selected).toHaveText("Interior Design");
    await e.selected.blur();
    await expect(e.bar).toHaveAttribute("data-run", "true");
    await page.clock.runFor(6_100);
    await expect(e.selected).toHaveText("Exterior & Landscape Design");

    await e.toggle.click();
    await expect(e.toggle).toHaveAccessibleName("Play services slideshow");
    await park(page);
    await page.clock.runFor(13_000);
    await expect(e.selected).toHaveText("Exterior & Landscape Design");
    await e.toggle.click();
    await expect(e.toggle).toHaveAccessibleName("Pause services slideshow");
    // Focus stays on the control, which does not hold the rotation it controls.
    await startAutoplay(page, e.section, e.bar);
    await expect(e.toggle).toBeFocused();
    await page.clock.runFor(6_100);
    await expect(e.selected).toHaveText("Construction & Execution");
  });

  test("services explorer: holds while the tab is hidden", async ({ page }) => {
    await freezeClock(page);
    await open(page);
    const e = explorer(page);
    await startAutoplay(page, e.section, e.bar);
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await page.clock.runFor(13_000);
    await expect(e.selected).toHaveText("Architectural Design");
  });

  test("services explorer: no autoplay or pause control under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await freezeClock(page);
    await open(page);
    const e = explorer(page);
    await park(page);
    await e.section.scrollIntoViewIfNeeded();
    await page.clock.runFor(20_000);
    await expect(e.selected).toHaveText("Architectural Design");
    await expect(e.bar).not.toHaveAttribute("data-run");
    await expect(e.toggle).toBeHidden();
  });

  test("services explorer: links and the quote popup with the service preselected", async ({
    page,
  }) => {
    await open(page);
    const e = explorer(page);
    await e.tabs.nth(1).click();
    await expect(e.panel.getByRole("link", { name: "View service" })).toHaveAttribute(
      "href",
      "/services/interior",
    );
    await expect(e.section.getByRole("link", { name: "Explore all services" })).toHaveAttribute(
      "href",
      "/services",
    );
    await e.panel.getByRole("button", { name: "Get a quote" }).click();
    const dialog = page.getByRole("dialog", { name: /Let’s build/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("select[name=service]")).toHaveValue("Interior Design");
  });

  test("divisions carousel: header, card and slide styles", async ({ page }) => {
    await open(page);
    const c = carousel(page);
    await expectStyles(c.section, {
      backgroundColor: "rgb(255, 255, 255)",
      paddingTop: "104px",
      paddingBottom: "36px",
      height: "900px",
    });
    await expectStyles(c.header, { gridTemplateColumns: "646px 622px" });
    await expectStyles(c.section.locator("h2"), {
      fontSize: "56px",
      lineHeight: "57.12px",
      marginTop: "22px",
    });
    const cta = c.section.getByRole("link", { name: "About Our Divisions" });
    await expect(cta).toHaveAttribute("href", "/about#about-divisions");
    await expectStyles(cta, {
      height: "52px",
      fontSize: "12px",
      letterSpacing: "1.92px",
      color: "rgb(17, 17, 17)",
      borderTopColor: "rgb(17, 17, 17)",
      marginTop: "22px",
    });
    await expectStyles(c.region, { gridTemplateColumns: "628px 628px", columnGap: "12px" });
    expect(await box(c.region, c.section)).toEqual({ x: 86, y: 292.2, w: 1268, h: 571.8 });
    await expectStyles(c.card, { borderTopColor: "rgb(227, 227, 227)" });
    await expectStyles(c.active, {
      paddingTop: "40px",
      paddingLeft: "44px",
    });
    await expectStyles(c.active.locator("[data-part=tag]"), {
      fontSize: "17px",
      fontWeight: "600",
      letterSpacing: "1.7px",
      backgroundColor: "rgb(17, 17, 17)",
    });
    await expectStyles(c.title, {
      fontSize: "42px",
      lineHeight: "44.1px",
      fontWeight: "500",
      textTransform: "uppercase",
      color: "rgb(29, 29, 27)",
      marginTop: "22px",
    });
    expect(await box(c.ft, c.section)).toEqual({ x: 969, y: 736.7, w: 340, h: 86.3 });
    expect(await box(c.prev, c.section)).toEqual({ x: 771, y: 753, w: 62, h: 62 });
    await expectStyles(c.prev, { borderRadius: "50%", borderTopColor: "rgb(29, 29, 27)" });
  });

  test("divisions carousel: slide semantics, prev/next and the live region (KI-A05)", async ({
    page,
  }) => {
    await open(page);
    const c = carousel(page);
    await expect(c.region).toHaveAttribute("aria-roledescription", "carousel");
    await expect(c.slides).toHaveCount(5);
    await expect(c.slides.first()).toHaveAttribute("role", "group");
    await expect(c.active).toHaveAttribute("aria-label", "1 of 5");
    await expect(c.region.locator("[aria-roledescription=slide][inert]")).toHaveCount(4);

    await c.next.click();
    await expect(c.active).toHaveAttribute("aria-label", "2 of 5");
    await expect(c.title).toHaveText(/Rooms designed,\s*made and installed\s*by one team\./);
    await expect(c.live).toHaveAttribute("aria-live", "polite");
    await expect(c.live).toHaveText("KATIC Interior, 2 of 5");
    await c.prev.click();
    await c.prev.click();
    await expect(c.active).toHaveAttribute("aria-label", "5 of 5");
    await expect(c.live).toHaveText("KATIC Care, 5 of 5");
    await expect(c.active.getByRole("link", { name: /Explore Division/ })).toHaveAttribute(
      "href",
      "/divisions/care",
    );

    // ←/→ from any control inside the carousel.
    await page.keyboard.press("ArrowRight");
    await expect(c.active).toHaveAttribute("aria-label", "1 of 5");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(c.active).toHaveAttribute("aria-label", "4 of 5");
  });

  test("divisions carousel: horizontal swipes over 45px change slides", async ({ page }) => {
    await open(page);
    const c = carousel(page);
    const swipe = (dx: number) =>
      c.region.evaluate((el, delta) => {
        const touch = (x: number) =>
          new Touch({ identifier: 1, target: el, clientX: x, clientY: 400 });
        const start = touch(600);
        const end = touch(600 + delta);
        el.dispatchEvent(
          new TouchEvent("touchstart", {
            bubbles: true,
            touches: [start],
            changedTouches: [start],
          }),
        );
        el.dispatchEvent(
          new TouchEvent("touchend", { bubbles: true, touches: [], changedTouches: [end] }),
        );
      }, dx);
    await swipe(-80);
    await expect(c.active).toHaveAttribute("aria-label", "2 of 5");
    await swipe(-30);
    await expect(c.active).toHaveAttribute("aria-label", "2 of 5");
    await swipe(60);
    await expect(c.active).toHaveAttribute("aria-label", "1 of 5");
  });

  test("divisions carousel: advances every 5s; holds on hover, focus and pause", async ({
    page,
  }) => {
    await freezeClock(page);
    await open(page);
    const c = carousel(page);
    await startAutoplay(page, c.section, c.bar);
    await expect(c.live).toHaveAttribute("aria-live", "off");
    await expectStyles(c.bar, { animationDuration: "5s" });
    await page.clock.runFor(4_000);
    await expect(c.active).toHaveAttribute("aria-label", "1 of 5");
    await page.clock.runFor(1_100);
    await expect(c.active).toHaveAttribute("aria-label", "2 of 5");

    await c.card.hover();
    await expect(c.bar).toHaveAttribute("data-hold", "true");
    await page.clock.runFor(11_000);
    await expect(c.active).toHaveAttribute("aria-label", "2 of 5");
    await park(page);
    await expect(c.bar).not.toHaveAttribute("data-hold");
    await page.clock.runFor(5_100);
    await expect(c.active).toHaveAttribute("aria-label", "3 of 5");

    await c.next.focus();
    await expect(c.bar).toHaveAttribute("data-hold", "true");
    await page.clock.runFor(11_000);
    await expect(c.active).toHaveAttribute("aria-label", "3 of 5");
    await c.next.blur();

    await c.toggle.click();
    await park(page);
    await page.clock.runFor(11_000);
    await expect(c.active).toHaveAttribute("aria-label", "3 of 5");
    await expect(c.toggle).toHaveAccessibleName("Play divisions slideshow");
  });

  test("divisions carousel: no autoplay under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await freezeClock(page);
    await open(page);
    const c = carousel(page);
    await park(page);
    await c.section.scrollIntoViewIfNeeded();
    await page.clock.runFor(16_000);
    await expect(c.active).toHaveAttribute("aria-label", "1 of 5");
    await expect(c.toggle).toBeHidden();
  });

  test("client stories: layout and type", async ({ page }) => {
    await open(page);
    const s = stories(page);
    await expectStyles(s.section, { paddingTop: "104px", height: "900px" });
    await expectStyles(s.grid, { gridTemplateColumns: "346px 576px 346px", marginTop: "14px" });
    await expectStyles(s.portrait, {
      height: "432px",
      boxShadow: "rgba(0, 0, 0, 0.22) 0px 18px 38px 0px",
    });
    await expectStyles(s.quote, {
      fontSize: "29px",
      lineHeight: "35.38px",
      maxWidth: "440px",
      minHeight: "105px",
      color: "rgb(17, 17, 17)",
    });
    await expectStyles(s.who, { fontSize: "10.5px", letterSpacing: "1.47px", marginTop: "22px" });
    await expectStyles(s.next, {
      width: "44px",
      height: "44px",
      borderTopColor: "rgb(204, 204, 204)",
    });
    await expectStyles(s.cta, { height: "52px", fontSize: "12px", paddingLeft: "30px" });
    await expect(s.cta).toHaveAttribute("href", "/reviews");
    expect(await box(s.grid, s.section)).toEqual({ x: 86, y: 348.1, w: 1268, h: 432 });
  });

  test("client stories: prev/next rotate the story with a fade and announce it (E29)", async ({
    page,
  }) => {
    await freezeClock(page);
    await open(page);
    const s = stories(page);
    await expect(s.story).toHaveAttribute("aria-live", "polite");
    // Every story's photos are rendered up front (preloaded).
    await expect(s.portrait.locator("img")).toHaveCount(4);
    await expect(s.project.locator("img")).toHaveCount(4);
    await expect(s.quote).toHaveText(/^Budget discipline/);

    await expectStyles(s.quote, { transitionProperty: "opacity", transitionDuration: "0.25s" });
    // Time is frozen: the swap happens exactly when the 250ms fade-out has elapsed.

    await s.next.click();
    await expect(s.quote).toHaveClass(/\bopacity-0\b/);
    await expect(s.quote).toHaveText(/^Budget discipline/);
    await page.clock.runFor(200);
    await expect(s.quote).toHaveText(/^Budget discipline/);
    await page.clock.runFor(100);
    await expect(s.quote).toHaveText(/^Katic understood/);
    await expect(s.quote).toHaveClass(/\bopacity-100\b/);
    await expect(s.who).toHaveText("Homeowner");
    await expect(s.portrait.locator("figcaption")).toHaveText("Homeowner");
    await expect(s.project.locator("figcaption")).toHaveText("Residential Project · Kochi");

    await s.prev.click();
    await page.clock.runFor(300);
    await s.prev.click();
    await page.clock.runFor(300);
    await expect(s.quote).toHaveText(/^From early planning/);
    await expect(s.who).toHaveText("Property Owner");
  });

  test("contact: home typography and form submission (source.form = contact)", async ({ page }) => {
    let payload: Record<string, unknown> | undefined;
    await page.route("**/api/leads", async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 202, json: { ok: true, status: "sent" } });
    });
    await open(page);
    const section = page.locator("#start");
    await expect(section).toHaveAttribute("data-contact-section", "");
    await expectStyles(section, {
      backgroundColor: "rgb(255, 255, 255)",
      paddingTop: "104px",
      paddingBottom: "36px",
      height: "900px",
    });
    const heading = section.getByRole("heading", { name: /Have a Project in/i });
    await expectStyles(heading, {
      fontSize: "40px",
      fontWeight: "500",
      lineHeight: "42px",
      textTransform: "uppercase",
    });
    await expect(section.locator("dl dt")).toHaveText(["Email", "Phone"]);
    const c = contact(page);
    // Every kicker on white uses the text-safe orange (KI-A11).
    await expect(c.faqKicker).toHaveCSS("color", "rgb(194, 78, 30)");
    // The original's Send arrow is → (ARW), not ↗.
    await expect(c.send.locator("svg path")).toHaveAttribute("d", "M1 6h9M6.5 2.5 10 6l-3.5 3.5");
    await expectStyles(c.field("Service Needed"), { height: "42px", paddingRight: "16px" });
    await expect(section.getByRole("button", { name: /\?$/ })).toHaveCount(6);
    // Collapsed answers are hidden from the accessibility tree; check the link in the DOM.
    await expect(section.locator("a", { hasText: "See our process" })).toHaveAttribute(
      "href",
      "/#home-process",
    );

    await section.getByLabel("Full Name").fill("Jane Doe");
    await section.getByLabel("Email", { exact: true }).fill("jane@email.com");
    await section.getByLabel("Service Needed").selectOption("Turnkey Projects");
    await section.getByRole("button", { name: "Send Enquiry" }).click();
    await expect(page).toHaveURL(/\/thank-you$/);
    expect(payload).toMatchObject({
      name: "Jane Doe",
      email: "jane@email.com",
      service: "Turnkey Projects",
      source: { form: "contact", path: "/styleguide/home-h3" },
    });
  });
});

test.describe("1024 (861–1099)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("contact: keeps the home sizes, same height as the original", async ({ page }) => {
    await open(page);
    const c = contact(page);
    await expectStyles(c.section, { paddingTop: "104px", paddingBottom: "36px" });
    await expectStyles(c.heading, { fontSize: "40px", marginTop: "14px", marginBottom: "14px" });
    await expectStyles(c.info, { marginTop: "16px" });
    await expectStyles(c.form, {
      marginTop: "24px",
      rowGap: "14px",
      columnGap: "16px",
      gridTemplateColumns: "468px 468px",
    });
    await expectStyles(c.label, { marginBottom: "6px" });
    await expectStyles(c.field("Full Name"), { height: "42px" });
    await expectStyles(c.field("Service Needed"), { height: "42px", paddingRight: "16px" });
    await expectStyles(c.field("Project Details"), { height: "76px" });
    await expectStyles(c.faqTitle, { marginTop: "14px", marginBottom: "22px" });
    await expectStyles(c.question, {
      fontSize: "15.5px",
      paddingTop: "17px",
      paddingBottom: "17px",
    });
    expect(await box(c.section, c.section)).toMatchObject({ h: 1392.6 });
  });

  test("no horizontal overflow; stories grid stays inside the container (KI-L01)", async ({
    page,
  }) => {
    await open(page);
    const s = stories(page);
    await s.section.scrollIntoViewIfNeeded();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
    const grid = await box(s.grid, s.section);
    expect(grid.x + grid.w).toBeLessThanOrEqual(988);
    const project = await box(s.project, s.section);
    expect(project.x + project.w).toBeLessThanOrEqual(988);
    // Focusing the last control never scrolls the page sideways.
    await s.cta.focus();
    expect(await page.evaluate(() => window.scrollX)).toBe(0);
  });

  test("divisions: the description no longer sits under the prev/next buttons (KI-L03)", async ({
    page,
  }) => {
    await open(page);
    const c = carousel(page);
    await expectStyles(c.title, { fontSize: "36px" });
    const ft = await box(c.ft, c.section);
    const nav = await box(c.nav, c.section);
    expect(ft.y + ft.h).toBeLessThanOrEqual(nav.y);
    expect(await box(c.card, c.section)).toMatchObject({ h: 560 });
  });

  test("explorer: the caption stays inside the section", async ({ page }) => {
    await open(page);
    const e = explorer(page);
    await expectStyles(e.grid, { gridTemplateColumns: "506px 518px" });
    await expectStyles(e.section, { height: "768px" });
    const panel = await box(e.panel, e.section);
    expect(panel.y + panel.h).toBeLessThanOrEqual(768);
    await expectStyles(e.panel, { gridTemplateColumns: "358px" });
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("explorer stacks: list, 4:3 photo, caption below", async ({ page }) => {
    await open(page);
    const e = explorer(page);
    await expectStyles(e.section, { paddingTop: "104px", paddingBottom: "36px" });
    await expectStyles(e.title, { fontSize: "34px", marginTop: "16px" });
    await expectStyles(e.selected, { height: "52px", fontSize: "14px" });
    expect(await box(e.media, e.section)).toEqual({ x: 20, y: 777.7, w: 350, h: 262.5 });
    await expectStyles(e.panelTitle, { fontSize: "28px" });
    await expectStyles(e.panel.locator("p"), { color: "rgb(187, 187, 187)" });
    expect(await box(e.section, e.section)).toMatchObject({ h: 1377.5 });
  });

  test("divisions: stacked photo and card", async ({ page }) => {
    await open(page);
    const c = carousel(page);
    await expectStyles(c.title, { fontSize: "30px", marginTop: "18px" });
    expect(await box(c.region.locator("[data-part=media]"), c.section)).toEqual({
      x: 20,
      y: 420.1,
      w: 350,
      h: 280,
    });
    expect(await box(c.card, c.section)).toEqual({ x: 20, y: 710.1, w: 350, h: 460.2 });
    expect(await box(c.prev, c.section)).toMatchObject({ x: 45, w: 58, h: 58 });
  });

  test("stories: one column, portrait only", async ({ page }) => {
    await open(page);
    const s = stories(page);
    await expectStyles(s.portrait, { height: "360px" });
    await expect(s.project).toBeHidden();
    await expectStyles(s.section.locator("[data-part=quote]"), {
      paddingTop: "40px",
      paddingBottom: "40px",
    });
    expect(await box(s.section, s.section)).toMatchObject({ h: 1087.3 });
  });

  test("contact: home sizes kept on phones", async ({ page }) => {
    await open(page);
    const c = contact(page);
    await expectStyles(c.section, { paddingTop: "104px", paddingBottom: "36px" });
    await expectStyles(c.heading, { fontSize: "30px", marginTop: "14px", marginBottom: "14px" });
    await expectStyles(c.form, { marginTop: "24px", rowGap: "14px" });
    await expectStyles(c.field("Full Name"), { height: "42px", fontSize: "16px" });
    await expectStyles(c.field("Project Details"), { height: "76px" });
    await expectStyles(c.question, { fontSize: "15.5px", paddingTop: "17px" });
    // Original 1672.6px; the contact info is a two-row list instead of a wrapped row (KI-L11).
    expect(await box(c.section, c.section)).toMatchObject({ h: 1642.6 });
  });
});
