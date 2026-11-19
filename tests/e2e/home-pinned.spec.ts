import { expect, type Page, test } from "@playwright/test";

/**
 * The two pinned home sections (`PinnedShowcase` #home-works, `PinnedStages` #home-process) on
 * the home page, against values measured on the original (docs/analysis/02 §1.4–1.5,
 * coverage probe at 1440×900 and 1920×1080). Engine-agnostic: runs in `desktop`
 * (Chromium), `geometry-webkit` and, in CI, `geometry-firefox`.
 *
 * Geometry is read in viewport px (getBoundingClientRect, innerHeight) and converted with the
 * canvas zoom where a canvas-px spec value is compared (docs/analysis/06).
 */

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; the phone project would only repeat them.
  test.skip(testInfo.project.name === "mobile", "viewports are set per block");
});

const URL = "/";

/** Card / stage counts and canvas constants of the original. */
const CARDS = 11;
const STAGES = 7;
const TRAVEL = 1842; // 380 + 7·292 + 6·96 − 1268 + 110
const START_X = 380;

async function open(page: Page) {
  // The hero video streams for as long as it plays (WebKit never goes network-idle); it is not
  // under test here, so keep it off the wire.
  await page.route("**/video/**", (route) => route.abort());
  await page.goto(URL);
  await page.evaluate(() => document.fonts.ready);
  // Hydrated once the client island has subscribed: the zoom script's --z is set before that.
  await page.waitForLoadState("networkidle");
}

function zoomOf(page: Page) {
  return page.evaluate(() =>
    Number(getComputedStyle(document.documentElement).getPropertyValue("--z")),
  );
}

/** Scrolls `selector` to `fraction` of its pinned travel and waits two frames. */
async function scrollTo(page: Page, selector: string, fraction: number) {
  await page.evaluate(
    ({ selector, fraction }) => {
      const section = document.querySelector(selector);
      if (!section) throw new Error(`${selector} missing`);
      const rect = section.getBoundingClientRect();
      window.scrollTo({
        top: Math.round(window.scrollY + rect.top + (rect.height - window.innerHeight) * fraction),
        behavior: "instant",
      });
    },
    { selector, fraction },
  );
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

type Matrix = { a: number; d: number; e: number; f: number };

function parseMatrix(value: string): Matrix {
  if (value === "none") return { a: 1, d: 1, e: 0, f: 0 };
  const parts = /matrix\(([^)]+)\)/.exec(value)?.[1]?.split(",").map(Number) ?? [];
  const [a = NaN, , , d = NaN, e = NaN, f = NaN] = parts;
  return { a, d, e, f };
}

function cards(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("#home-works [data-card]")].map((card) => ({
      slug: card.dataset["card"],
      centred: card.hasAttribute("data-centred"),
      transform: getComputedStyle(card).transform,
      zIndex: getComputedStyle(card).zIndex,
      shade: getComputedStyle(card.querySelector("span[aria-hidden]") ?? card).opacity,
      shadow: getComputedStyle(card).boxShadow,
    })),
  );
}

function stages(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector("#home-process");
    const row = section?.querySelector<HTMLElement>("[role=region]");
    const items = [...(section?.querySelectorAll<HTMLElement>("li") ?? [])];
    return {
      transform: row ? getComputedStyle(row).transform : "",
      rowLeft: row?.getBoundingClientRect().left ?? NaN,
      containerLeft: row?.parentElement?.getBoundingClientRect().left ?? NaN,
      firstLeft: items[0]?.getBoundingClientRect().left ?? NaN,
      current: items.findIndex((item) => item.hasAttribute("data-current")),
      ariaCurrent: items.findIndex((item) => item.getAttribute("aria-current") === "step"),
      drawn: items.map((item) => item.hasAttribute("data-on")),
    };
  });
}

const DESKTOP = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

for (const viewport of DESKTOP) {
  test.describe(`pinned at ${String(viewport.width)}×${String(viewport.height)}`, () => {
    test.use({ viewport });

    test("showcase pins and runs the cover-flow", async ({ page }) => {
      await open(page);
      const zoom = await zoomOf(page);
      expect(zoom).toBeCloseTo(viewport.width / 1440, 3);

      // Section height: vh·(1 + (n − 1)·0.6) in canvas px = innerHeight·7 on screen.
      const height = await page
        .locator("#home-works")
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.abs(height - viewport.height * (1 + (CARDS - 1) * 0.6))).toBeLessThanOrEqual(2);

      for (const [fraction, centre] of [
        [0, 0],
        [0.5, 5],
        [1, 10],
      ] as const) {
        await scrollTo(page, "#home-works", fraction);
        await expect
          .poll(async () => (await cards(page)).findIndex((card) => card.centred))
          .toBe(centre);

        const pin = await page
          .locator("#home-works > div")
          .evaluate((el) => el.getBoundingClientRect());
        expect(Math.abs(pin.top)).toBeLessThanOrEqual(1);
        expect(Math.abs(pin.height - viewport.height)).toBeLessThanOrEqual(1);

        const list = await cards(page);
        const centred = list[centre];
        const m = parseMatrix(centred?.transform ?? "");
        expect(m.a).toBeCloseTo(1, 3);
        expect(Math.abs(m.e)).toBeLessThanOrEqual(0.5);
        expect(Math.abs(m.f)).toBeLessThanOrEqual(0.05);
        expect(centred?.zIndex).toBe("20");
        // Shadow fades in over .3s.
        await expect
          .poll(async () => (await cards(page))[centre]?.shadow)
          .toBe("rgba(0, 0, 0, 0.35) 0px 30px 60px 0px");

        // Neighbour: 640px right, 16px lower, scale .93, fully shaded, z 18 (canvas px).
        const next = list[centre + 1];
        if (next) {
          const n = parseMatrix(next.transform);
          expect(n.a).toBeCloseTo(0.93, 3);
          expect(n.e).toBeCloseTo(640, 0);
          expect(n.f).toBeCloseTo(16, 0);
          expect(next.zIndex).toBe("18");
          expect(Number(next.shade)).toBeCloseTo(1, 2);
          expect(next.shadow).toBe("none");
        }
      }
    });

    test("tabs filter, update the count and height, and jump to the section start", async ({
      page,
    }) => {
      await open(page);
      await scrollTo(page, "#home-works", 0.5);
      const tab = page.locator("#home-works").getByRole("button", { name: "Residential" });
      await tab.click();

      await expect(tab).toHaveAttribute("aria-pressed", "true");
      await expect(
        page.locator("#home-works").getByRole("button", { name: "All" }),
      ).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator("#home-works").getByRole("status")).toHaveText("5 projects");
      await expect(page.locator("#home-works [data-card]")).toHaveCount(5);

      const rect = await page
        .locator("#home-works")
        .evaluate((el) => el.getBoundingClientRect().toJSON() as DOMRect);
      expect(Math.abs(rect.top)).toBeLessThanOrEqual(1);
      expect(Math.abs(rect.height - viewport.height * (1 + 4 * 0.6))).toBeLessThanOrEqual(2);
      expect((await cards(page)).findIndex((card) => card.centred)).toBe(0);

      await page.locator("#home-works").getByRole("button", { name: "Villas / Flats" }).click();
      await expect(page.locator("#home-works").getByRole("status")).toHaveText("3 projects");
      await page.locator("#home-works").getByRole("button", { name: "All" }).click();
      await expect(page.locator("#home-works").getByRole("status")).toHaveText("11 projects");
      await expect(page.locator("#home-works [data-card]")).toHaveCount(CARDS);
    });

    test("stages row travels startX → startX − travel and the current stage follows", async ({
      page,
    }) => {
      await open(page);
      const zoom = await zoomOf(page);

      const height = await page
        .locator("#home-process")
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(Math.abs(height - (viewport.height + TRAVEL * 1.25 * zoom))).toBeLessThanOrEqual(2);

      for (const [fraction, current] of [
        [0, 0],
        [0.5, 3],
        [1, 6],
      ] as const) {
        await scrollTo(page, "#home-process", fraction);
        await expect.poll(async () => (await stages(page)).current).toBe(current);
        const s = await stages(page);
        const x = START_X - fraction * TRAVEL;
        expect(parseMatrix(s.transform).e).toBeCloseTo(x, 0);
        expect(Math.abs(s.firstLeft - (s.containerLeft + x * zoom))).toBeLessThanOrEqual(1);
        expect(s.ariaCurrent).toBe(current);
        // Drawn: every stage up to one past the current one.
        expect(s.drawn.slice(0, Math.min(STAGES, current + 2)).every(Boolean)).toBe(true);
      }

      // Scrolling back keeps the drawings (the original only ever adds `.on`).
      await scrollTo(page, "#home-process", 0);
      await expect.poll(async () => (await stages(page)).current).toBe(0);
      expect((await stages(page)).drawn.every(Boolean)).toBe(true);
    });

    test("stage titles fit their column (KI-L31)", async ({ page }) => {
      await open(page);
      await page.evaluate(() => document.fonts.ready);
      // Titles are fitted after webfonts swap in, so poll for the settled state.
      await expect
        .poll(() =>
          page
            .locator("#home-process h3")
            .evaluateAll((titles) => titles.every((t) => t.scrollWidth <= t.clientWidth)),
        )
        .toBe(true);
    });
  });
}

for (const viewport of [
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
] as const) {
  test.describe(`scrollers at ${String(viewport.width)}px`, () => {
    test.use({ viewport });

    test("cards and stages sit in focusable, labelled horizontal scrollers (KI-A08)", async ({
      page,
    }) => {
      await open(page);
      for (const [selector, name] of [
        ["#home-works", "Selected Works"],
        ["#home-process", "Seven Stages, One Continuous Build"],
      ] as const) {
        const region = page.locator(selector).getByRole("region", { name });
        await expect(region).toHaveAttribute("tabindex", "0");
        const { scrollWidth, clientWidth, position } = await region.evaluate((el) => ({
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          position: getComputedStyle(el.closest("section")?.firstElementChild ?? el).position,
        }));
        expect(scrollWidth).toBeGreaterThan(clientWidth);
        expect(position).not.toBe("sticky");

        await region.focus();
        await expect(region).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect.poll(() => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
      }
      // Not pinned: the showcase is a normal-height section (997.6px at 1024 on the original).
      const height = await page
        .locator("#home-works")
        .evaluate((el) => el.getBoundingClientRect().height);
      expect(height).toBeLessThan(1200);
    });
  });
}

test.describe("reduced motion at 1440 (KI-L02, KI-L04)", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("every card and stage is laid out in view, nothing pinned or stacked", async ({ page }) => {
    await open(page);
    const layout = await page.evaluate(() => {
      const rects = (selector: string) =>
        [...document.querySelectorAll(selector)].map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, top: r.top + window.scrollY, right: r.right, width: r.width };
        });
      return {
        cards: rects("#home-works [data-card]"),
        stages: rects("#home-process li"),
        pins: [...document.querySelectorAll("#home-works > div, #home-process > div")].map(
          (el) => getComputedStyle(el).position,
        ),
      };
    });
    expect(layout.pins).not.toContain("sticky");

    for (const list of [layout.cards, layout.stages]) {
      const positions = new Set(list.map((r) => `${String(r.left)},${String(r.top)}`));
      expect(positions.size).toBe(list.length);
      for (const r of list) {
        expect(r.left).toBeGreaterThanOrEqual(0);
        expect(r.right).toBeLessThanOrEqual(1440);
      }
    }
    expect(layout.cards).toHaveLength(CARDS);
    expect(layout.stages).toHaveLength(STAGES);

    // Filtering still works without motion.
    await page.locator("#home-works").getByRole("button", { name: "Commercial" }).click();
    await expect(page.locator("#home-works [data-card]")).toHaveCount(5);
  });
});
