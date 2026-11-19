import { expect, type Page, test } from "@playwright/test";

/**
 * Reduced motion (Phase 10, WCAG 2.3.3 / 2.2.2): with `prefers-reduced-motion: reduce`, every page
 * family is still. Scrolling through the page writes no scroll-linked styles (parallax, pinned
 * scrubs), no CSS animation or transition is left running, reveals and drawings show at once, no
 * video plays and nothing auto-advances. A motion-on control run proves the probe sees motion.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "a11y", "widths are set per test");
});

const FAMILIES = [
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

type MotionReport = {
  /** Elements whose inline style changed while scrolling (scroll-linked motion). */
  readonly styleWrites: string[];
  /** CSS animations and transitions still running after the scroll settled. */
  readonly running: string[];
  readonly hiddenReveals: number;
  readonly playingVideos: number;
};

/** Scrolls through the page, watching inline-style writes, then lists what still moves. */
async function scrollAndWatch(page: Page): Promise<MotionReport> {
  await page.waitForLoadState("load");
  await page.evaluate(() => {
    const writes: string[] = [];
    (window as unknown as { __styleWrites: string[] }).__styleWrites = writes;
    new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target;
        if (!(el instanceof Element) || el === document.documentElement) continue;
        // Title fitting (KI-L31) re-measures when a web font finishes loading: layout, not motion.
        if (el.hasAttribute("data-fit")) continue;
        writes.push(`${el.tagName.toLowerCase()}.${(el.getAttribute("class") ?? "").slice(0, 60)}`);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
  });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  return page.evaluate(() => ({
    styleWrites: [...new Set((window as unknown as { __styleWrites: string[] }).__styleWrites)],
    running: document
      .getAnimations()
      .filter((animation) => animation.playState === "running")
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target;
        const name =
          animation instanceof CSSAnimation
            ? animation.animationName
            : animation instanceof CSSTransition
              ? animation.transitionProperty
              : "script";
        return `${name} on ${target?.tagName.toLowerCase() ?? "?"}.${target?.className.toString().slice(0, 50) ?? ""}`;
      }),
    hiddenReveals: [...document.querySelectorAll("[data-reveal]")].filter(
      (el) => !el.hasAttribute("data-shown") || getComputedStyle(el).opacity !== "1",
    ).length,
    playingVideos: [...document.querySelectorAll("video")].filter((video) => !video.paused).length,
  }));
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test.describe(`reduced motion at ${String(viewport.width)}`, () => {
    test.use({ viewport, reducedMotion: "reduce" });

    for (const path of FAMILIES) {
      test(`${path} is still`, async ({ page }) => {
        await page.goto(path);
        const report = await scrollAndWatch(page);
        expect(report.styleWrites, "scroll-linked style writes").toEqual([]);
        expect(report.running, "running animations").toEqual([]);
        expect(report.hiddenReveals, "reveals not shown").toBe(0);
        expect(report.playingVideos, "playing videos").toBe(0);
        // Nothing auto-advances, so no pause controls are offered.
        await expect(
          page
            .locator("[data-autoplay-control], [data-testid=marquee-toggle]")
            .filter({ visible: true }),
        ).toHaveCount(0);
      });
    }
  });
}

test.describe("reduced motion on home, over time", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("carousels, the explorer and the logo row never advance", async ({ page }) => {
    await page.goto("/");
    const live = page.getByRole("region", { name: "Our divisions" }).locator("[aria-live]");
    await live.scrollIntoViewIfNeeded();
    const selected = page.locator("#home-deliver [role=tab][aria-selected=true]");
    const logos = page.getByTestId("marquee-track").first();
    const before = {
      slide: await live.textContent(),
      tab: await selected.textContent(),
      logos: await logos.evaluate((el) => el.getBoundingClientRect().x),
    };
    // Longer than the 5s carousel interval and the explorer's rotation.
    await page.waitForTimeout(6500);
    expect(await live.textContent()).toBe(before.slide);
    expect(await selected.textContent()).toBe(before.tab);
    expect(await logos.evaluate((el) => el.getBoundingClientRect().x)).toBe(before.logos);
  });
});

test.describe("motion on (control)", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

  test("the same probe sees Home move without the preference", async ({ page }) => {
    await page.goto("/");
    const report = await scrollAndWatch(page);
    expect(report.styleWrites.length + report.running.length).toBeGreaterThan(0);
  });
});
