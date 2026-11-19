import { expect, type Locator, type Page, test } from "@playwright/test";

/**
 * Home sections 0, 1, 2, 7 and 9 (hero, about teaser, signature project, news and blog teasers)
 * on the home page, pinned to the computed styles measured on the ORIGINAL `#p-home`
 * (coverage/probe-home.mts → reference values below, written as the browser reports them).
 * Also covers behaviour: the hero video cut and pause control, reduced motion, the seamless
 * marquee, count-up values, reveal wiring and link targets.
 *
 * Deliberate deviations: orange text uses the tone-aware kicker colour and small grey/orange text
 * the colours the original's runtime contrast fixer applies (KI-A11); tiny text is 11px on phones
 * (KI-A10); room cards are links (KI-A15); news cards link to /news (KI-F11).
 */

type Expected = Partial<Record<keyof CSSStyleDeclaration & string, string>>;

const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

async function expectStyles(locator: Locator, expected: Expected, pseudo?: "::before" | "::after") {
  const actual = await locator.evaluate(
    (el, { keys, pseudoElt }) => {
      const style = getComputedStyle(el, pseudoElt ?? null);
      return Object.fromEntries(keys.map((key) => [key, style.getPropertyValue(key)]));
    },
    { keys: Object.keys(expected).map(kebab), pseudoElt: pseudo },
  );
  const normalised = Object.fromEntries(
    Object.keys(expected).map((key) => [key, actual[kebab(key)]]),
  );
  expect(normalised).toEqual(expected);
}

/** Computed grid columns rounded to 0.1px. */
async function columns(locator: Locator): Promise<number[]> {
  const value = await locator.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  return value.split(" ").map((px) => Math.round(parseFloat(px) * 10) / 10);
}

async function open(page: Page) {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
}

/** Brings every reveal into view in turn (so each one and the count-ups fire), then lets them settle. */
async function scrollThrough(page: Page) {
  for (const element of await page.locator("[data-reveal]").all()) {
    await element.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    await expect(element).toHaveAttribute("data-shown", "");
  }
  await page.waitForTimeout(1600);
}

const WHITE = "rgb(255, 255, 255)";
const BRAND = "rgb(232, 98, 44)";
const hero = (page: Page) => page.locator("[data-hero]");
const about = (page: Page) => page.locator("#home-about");
const signature = (page: Page) => page.locator("#home-signature");
const news = (page: Page) => page.locator("#home-news");
const blog = (page: Page) => page.locator("#home-blog");
const video = (page: Page) => page.getByTestId("hero-video");
const videoToggle = (page: Page) => page.getByTestId("hero-video-toggle");
const track = (page: Page) => page.getByTestId("marquee-track");

test.beforeEach(({}, testInfo) => {
  // Viewports are set per block below; one browser project is enough.
  test.skip(testInfo.project.name !== "desktop", "viewport-specific suite runs once");
});

test.describe("1440 canvas (zoom 1)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("hero type, layout and shade", async ({ page }) => {
    await open(page);
    // Let the kHeroIn intro finish so boxes are measured without its translateY.
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && a.animationName === "home-hero-in")
          .map((a) => a.finished),
      ),
    );
    await expectStyles(hero(page), {
      height: "900px",
      display: "flex",
      justifyContent: "flow-end", // as the original reports it
      paddingBottom: "64px",
      backgroundColor: "rgb(17, 17, 17)",
    });
    await expectStyles(hero(page).locator(":scope > div[aria-hidden]"), {
      // The original's `0deg` gradient (.78 → .45 at 38% → .12 at 70% → .25), as the CSS minifier rewrites it.
      backgroundImage:
        "linear-gradient(rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.12) 30%, rgba(0, 0, 0, 0.45) 62%, rgba(0, 0, 0, 0.78) 100%), linear-gradient(90deg, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0) 60%)",
    });
    const eyebrow = hero(page).locator("p").first();
    await expectStyles(eyebrow, {
      fontSize: "13px",
      letterSpacing: "0.26px",
      color: "rgb(233, 229, 221)",
      columnGap: "12px",
    });
    await expectStyles(
      eyebrow,
      { width: "5px", height: "5px", backgroundColor: BRAND },
      "::before",
    );
    const h1 = hero(page).locator("h1");
    await expectStyles(h1, {
      marginTop: "22px",
      fontSize: "78px",
      fontWeight: "700",
      lineHeight: "72.54px",
      letterSpacing: "-0.39px",
      color: WHITE,
    });
    await expectStyles(h1.locator("span"), { color: BRAND });
    await expectStyles(hero(page).locator("h1 + p"), {
      marginTop: "30px",
      maxWidth: "610px",
      fontSize: "17px",
      lineHeight: "27.2px",
      color: "rgb(238, 238, 238)",
    });
    const primary = hero(page).getByRole("button", { name: "Start a Project" });
    await expectStyles(primary, {
      height: "52px",
      paddingLeft: "28px",
      fontSize: "12px",
      fontWeight: "500",
      letterSpacing: "1.92px",
      textTransform: "uppercase",
      backgroundColor: "rgb(247, 244, 239)",
      color: "rgb(17, 17, 17)",
    });
    expect((await primary.boundingBox())?.width).toBeCloseTo(206.4, 0);
    const box = await h1.boundingBox();
    expect(box?.x).toBe(86);
    // Content sits on the bottom padding: buttons end 64px above the hero's bottom edge.
    const buttons = await primary.boundingBox();
    expect((buttons?.y ?? 0) + (buttons?.height ?? 0)).toBeCloseTo(836, 0);
  });

  test("hero intro animation (kHeroIn)", async ({ page }) => {
    await open(page);
    const children = hero(page).locator(".home-hero-intro > *");
    await expect(children).toHaveCount(4);
    const animations = await children.evaluateAll((els) =>
      els.map((el) => {
        const style = getComputedStyle(el);
        return [style.animationName, style.animationDuration, style.animationDelay].join(" ");
      }),
    );
    expect(animations).toEqual([
      "home-hero-in 1.2s 0s",
      "home-hero-in 1.2s 0.15s",
      "home-hero-in 1.2s 0.35s",
      "home-hero-in 1.2s 0.5s",
    ]);
    await expect(children.last()).toHaveCSS("opacity", "1", { timeout: 4000 });
  });

  test("hero video: desktop cut, pause control", async ({ page }) => {
    await open(page);
    await expect(video(page)).toHaveAttribute("data-cut", "desktop");
    await expect(video(page)).toHaveAttribute("src", "/video/hero-desktop.mp4");
    await expect(video(page)).toHaveAttribute("preload", "metadata");
    expect(await video(page).evaluate((el: HTMLVideoElement) => [el.muted, el.loop])).toEqual([
      true,
      true,
    ]);
    await expect(video(page)).toHaveAttribute("data-state", "playing");
    await expect(videoToggle(page)).toHaveAccessibleName("Pause background video");

    await videoToggle(page).click();
    await expect(video(page)).toHaveAttribute("data-state", "paused");
    await expect(videoToggle(page)).toHaveAccessibleName("Play background video");
    expect(await video(page).evaluate((el: HTMLVideoElement) => el.paused)).toBe(true);

    await videoToggle(page).click();
    await expect(video(page)).toHaveAttribute("data-state", "playing");
  });

  test("hero actions", async ({ page }) => {
    await open(page);
    await expect(hero(page).getByRole("link", { name: "View Our Projects" })).toHaveAttribute(
      "href",
      "/works",
    );
    await expectStyles(hero(page).getByRole("link", { name: "View Our Projects" }), {
      fontSize: "12px",
      letterSpacing: "1.92px",
      color: WHITE,
    });
    await hero(page).getByRole("button", { name: "Start a Project" }).click();
    await expect(page.locator("dialog[open]")).toBeVisible();
  });

  test("about teaser layout and type", async ({ page }) => {
    await open(page);
    await expectStyles(about(page), {
      height: "900px",
      paddingTop: "104px",
      paddingBottom: "36px",
      backgroundColor: WHITE,
    });
    const grid = about(page).locator(".grid").first();
    expect(await columns(grid)).toEqual([608, 624]);
    await expectStyles(grid, { columnGap: "36px" });
    await expectStyles(about(page).locator("h2"), {
      marginTop: "22px",
      fontSize: "56px",
      fontWeight: "500",
      lineHeight: "57.12px",
      textTransform: "uppercase",
      color: "rgb(11, 11, 11)",
    });
    await expectStyles(about(page).getByText("EST. 2013 · KOCHI, KERALA"), {
      marginTop: "30px",
      fontSize: "9.5px",
      letterSpacing: "3.04px",
      color: "rgb(34, 34, 34)",
    });
    const lead = about(page).locator("p").filter({ hasText: "Founded in 2013" });
    await expectStyles(lead, {
      maxWidth: "520px",
      fontSize: "15px",
      lineHeight: "26.25px",
      color: "rgb(58, 56, 51)",
    });
    await expectStyles(lead.locator("b"), { fontWeight: "500", color: "rgb(17, 17, 17)" });

    const stats = about(page).locator("ul").filter({ hasText: "Projects Delivered" });
    expect(await columns(stats)).toEqual([156, 156, 156, 156]);
    await expectStyles(stats, {
      marginTop: "40px",
      borderTopColor: "rgb(17, 17, 17)",
      borderBottomColor: "rgb(217, 214, 207)",
    });
    await expectStyles(stats.locator("li").nth(1), {
      height: "94px",
      paddingLeft: "16px",
      borderLeftWidth: "1px",
      borderLeftColor: "rgb(227, 224, 218)",
    });
    await expectStyles(stats.locator("b").first(), { fontSize: "32px", lineHeight: "32px" });
    await expectStyles(stats.locator("em").first(), { color: BRAND, fontStyle: "normal" });
    await expectStyles(stats.locator("li span").last(), {
      marginTop: "10px",
      fontSize: "9.5px",
      letterSpacing: "1.14px",
      color: "rgb(85, 85, 85)",
    });

    const value = about(page).locator("ul").last().locator("li").first();
    expect(await columns(value)).toEqual([44, 255, 325]);
    await expectStyles(value.locator("h3"), {
      fontSize: "19px",
      fontWeight: "400",
      letterSpacing: "0.76px",
    });
    await expectStyles(value.locator("p"), {
      fontSize: "11px",
      lineHeight: "18.15px",
      color: "rgb(51, 51, 51)",
    });
    await expectStyles(value.locator("span svg"), { width: "20px", color: BRAND });

    const cta = about(page).getByRole("link", { name: "About Us" });
    await expect(cta).toHaveAttribute("href", "/about");
    await expectStyles(cta, {
      height: "46px",
      marginTop: "20px",
      borderTopColor: "rgb(187, 187, 187)",
      backgroundColor: WHITE,
    });
    await expectStyles(about(page).locator("img[src*='bougainvillea']"), {
      height: "200px",
      top: "0px",
      right: "0px",
    });
  });

  test("count-up ends on the original's figures", async ({ page }) => {
    await open(page);
    await scrollThrough(page);
    const values = await about(page)
      .locator("ul")
      .filter({ hasText: "Projects Delivered" })
      .locator("b")
      .allTextContents();
    expect(values).toEqual(["200+", "11yrs", "500+", "Eco"]);
  });

  test("logo marquee loops seamlessly and pauses", async ({ page }) => {
    await open(page);
    const strip = track(page);
    const geometry = await strip.evaluate((el) => {
      const sets = [...el.querySelectorAll(":scope > ul")];
      const setWidth = sets[0]?.getBoundingClientRect().width ?? 0;
      const effect = el.getAnimations()[0]?.effect as KeyframeEffect | null | undefined;
      const frames: ComputedKeyframe[] = effect?.getKeyframes() ?? [];
      return {
        sets: sets.length,
        setWidth,
        trackWidth: el.getBoundingClientRect().width,
        lastTransform: String(frames.at(-1)?.["transform"] ?? ""),
      };
    });
    expect(geometry.setWidth).toBe(4 * (150 + 16));
    expect(geometry.trackWidth).toBe(geometry.sets * geometry.setWidth);
    expect(geometry.lastTransform).toMatch(/^translateX?\(-50%\)$/);
    // −50% of the track is a whole number of sets, so the loop has no jump (KI-L35).
    expect((geometry.trackWidth / 2) % geometry.setWidth).toBe(0);
    await expectStyles(strip, {
      animationName: "logo-marquee",
      animationDuration: "36s",
      animationTimingFunction: "linear",
      animationPlayState: "running",
    });
    await expectStyles(strip.locator("img").first(), {
      width: "150px",
      height: "72px",
      borderTopColor: "rgb(238, 238, 238)",
    });
    // Only the first set is announced; the clones are hidden with empty alts (KI-A13).
    await expect(strip.locator("ul:not([aria-hidden])")).toHaveCount(1);
    await expect(strip.locator("ul[aria-hidden] img[alt='']")).toHaveCount(12);
    await expect(strip.getByRole("img", { name: "Jaquar" })).toHaveCount(1);

    // Wait for the strip to finish revealing (it moves 46px) before hovering it.
    const viewport = page.locator(".logo-marquee-viewport");
    await viewport.scrollIntoViewIfNeeded();
    await expect(viewport).toHaveAttribute("data-shown", "");
    await expect(viewport).toHaveCSS("transform", "none");
    await viewport.hover();
    await expect(strip).toHaveCSS("animation-play-state", "paused");
    await page.mouse.move(0, 0);
    await page.getByRole("button", { name: "Pause partner logos" }).click();
    await expect(strip).toHaveCSS("animation-play-state", "paused");
    await page.getByRole("button", { name: "Play partner logos" }).click();
    await expect(strip).toHaveCSS("animation-play-state", "running");
  });

  test("reveal wiring matches the original's RV list", async ({ page }) => {
    await open(page);
    const variants = (section: Locator) =>
      section
        .locator("[data-reveal]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-reveal")));
    expect(await variants(about(page))).toEqual([
      ...["fade-up", "fade-up", "clip", "fade-up", "fade-up", "fade-up"],
      ...["fade-up", "fade-up", "fade-up"],
      ...Array<string>(4).fill("fade-up"),
      ...Array<string>(5).fill("left"),
    ]);
    expect(await variants(signature(page))).toEqual(["fade-up", "clip", "fade-up", "fade-up"]);
    await expect(hero(page).locator("[data-reveal]")).toHaveCount(0);
    await expect(news(page).locator("[data-reveal]")).toHaveCount(0);
    await expect(blog(page).locator("[data-reveal]")).toHaveCount(0);

    const delays = await about(page)
      .locator("ul")
      .last()
      .locator("[data-reveal]")
      .evaluateAll((els) =>
        els.map((el) => (el as HTMLElement).style.getPropertyValue("--reveal-delay")),
      );
    expect(delays).toEqual(["0s", "0.09s", "0.18s", "0.27s", "0.36s"]);

    await expect(about(page).locator("[data-reveal]:not([data-shown])").first()).toBeAttached();
    await scrollThrough(page);
    await expect(page.locator("[data-reveal]:not([data-shown])")).toHaveCount(0);
  });

  test("signature project", async ({ page }) => {
    await open(page);
    await expectStyles(signature(page), { height: "900px", backgroundColor: "rgb(0, 0, 0)" });
    const top = signature(page).locator(".grid").first();
    expect(await columns(top)).toEqual([640, 624]);
    await expectStyles(signature(page).locator("h2"), {
      marginTop: "14px",
      fontSize: "56px",
      lineHeight: "57.12px",
      color: WHITE,
    });
    await expectStyles(signature(page).getByText("From the entrance"), {
      marginTop: "34px",
      maxWidth: "560px",
      fontSize: "15px",
      lineHeight: "26.25px",
      color: "rgb(241, 241, 241)",
    });
    const cta = signature(page).getByRole("link", { name: "View Project" });
    await expect(cta).toHaveAttribute("href", "/works/the-courtyard-house");
    await expectStyles(cta, {
      height: "50px",
      paddingLeft: "32px",
      backgroundColor: "rgb(17, 17, 17)",
      borderTopColor: "rgba(255, 255, 255, 0.18)",
    });
    const cards = signature(page).locator("ul").first();
    expect(await columns(cards)).toEqual([302, 302, 302, 302]);
    await expectStyles(cards, { marginTop: "44px", columnGap: "20px" });
    const card = cards.getByRole("link").first();
    await expect(cards.getByRole("link")).toHaveCount(4);
    await expect(card).toHaveAttribute("href", "/works/the-courtyard-house");
    await expectStyles(card, { height: "320px", backgroundColor: "rgb(17, 17, 17)" });
    await expectStyles(
      card,
      { backgroundImage: "linear-gradient(rgba(0, 0, 0, 0) 35%, rgba(0, 0, 0, 0.72) 100%)" },
      "::after",
    );
    await expectStyles(card.locator("span").first(), {
      height: "22px",
      fontSize: "10px",
      letterSpacing: "2px",
      borderRadius: "20px",
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      borderTopColor: "rgba(255, 255, 255, 0.35)",
    });
    await expectStyles(card.locator("h3"), {
      marginTop: "14px",
      fontSize: "28px",
      lineHeight: "30.8px",
    });
    await expectStyles(card.locator("p"), { fontSize: "13px", color: "rgb(238, 238, 238)" });
    // Parallax background: taller than the section, offset by 15%.
    const background = signature(page).locator("img").first();
    await expectStyles(background, { height: "1170px", top: "-135px" });
    await expectStyles(
      signature(page).locator(":scope > div").first(),
      {
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.62) 0%, rgba(0, 0, 0, 0.72) 45%, rgba(0, 0, 0, 0.9) 80%, rgb(0, 0, 0) 100%)",
      },
      "::after",
    );
    await signature(page).scrollIntoViewIfNeeded();
    await expect
      .poll(() => background.evaluate((el) => (el as HTMLElement).style.transform))
      .toMatch(/^translate3d\(0px, -?[\d.]+%, 0px\) scale\(1\.06\)$/);
  });

  test("news teaser", async ({ page }) => {
    await open(page);
    await expectStyles(news(page), { height: "900px", backgroundColor: "rgb(0, 0, 0)" });
    const header = news(page).locator(".grid").first();
    expect(await columns(header)).toEqual([646, 622]);
    await expectStyles(news(page).locator("h2"), { fontSize: "56px" });
    await expectStyles(header.locator("p").last(), {
      fontSize: "15px",
      lineHeight: "26.25px",
      color: "rgb(187, 187, 187)",
    });
    const cta = news(page).getByRole("link", { name: "View All News" });
    await expect(cta).toHaveAttribute("href", "/news");
    await expectStyles(cta, {
      height: "52px",
      marginTop: "22px",
      paddingLeft: "24px",
      columnGap: "22px",
      backgroundColor: WHITE,
      borderTopColor: "rgb(207, 203, 195)",
    });
    const grid = news(page).locator("ul");
    expect(await columns(grid)).toEqual([406.7, 406.7, 406.7]);
    await expectStyles(grid, { marginTop: "60px", columnGap: "24px" });
    const card = grid.getByRole("link").first();
    await expect(grid.getByRole("link")).toHaveCount(3);
    for (const link of await grid.getByRole("link").all()) {
      await expect(link).toHaveAttribute("href", "/news");
    }
    await expectStyles(card, {
      height: "393.438px",
      backgroundColor: "rgb(11, 11, 11)",
      borderTopColor: "rgb(38, 38, 38)",
    });
    await expectStyles(card.locator("img"), { height: "200px", objectFit: "cover" });
    await expectStyles(card.locator("time"), {
      fontSize: "10.5px",
      letterSpacing: "1.89px",
      color: "rgb(163, 163, 163)",
    });
    await expect(card.locator("time")).toHaveText("28 Oct 2026");
    await expectStyles(card.locator("h3"), {
      marginTop: "14px",
      fontSize: "21px",
      lineHeight: "26.25px",
      textTransform: "none",
    });
    await expectStyles(card.locator("p"), {
      fontSize: "14px",
      lineHeight: "23.1px",
      color: "rgb(170, 170, 170)",
    });
    await card.hover();
    await expect(card).toHaveCSS("border-top-color", BRAND);
  });

  test("blog teaser", async ({ page }) => {
    await open(page);
    await expectStyles(blog(page), { height: "900px" });
    await expect(blog(page).getByRole("link", { name: "View All Articles" })).toHaveAttribute(
      "href",
      "/blog",
    );
    const body = blog(page).locator(".grid").nth(1);
    expect(await columns(body)).toEqual([682.2, 545.8]);
    await expectStyles(body, { marginTop: "26px", columnGap: "40px" });
    const featured = body.getByRole("link").first();
    await expect(featured).toHaveAttribute("href", "/blog/designing-for-kerala-monsoon");
    await expectStyles(featured.locator("div").first(), { height: "290px" });
    await expectStyles(featured.getByText("Featured"), {
      top: "20px",
      left: "20px",
      fontSize: "9px",
      backgroundColor: BRAND,
    });
    await expectStyles(featured.locator("h3"), {
      marginTop: "8px",
      fontSize: "28px",
      lineHeight: "30.8px",
      textTransform: "uppercase",
    });
    await expectStyles(featured.locator("p"), {
      maxWidth: "560px",
      fontSize: "14.5px",
      lineHeight: "24.65px",
      color: "rgb(163, 163, 163)",
    });
    const rows = body.locator("ul").getByRole("link");
    await expect(rows).toHaveCount(3);
    expect(await rows.evaluateAll((els) => els.map((el) => el.getAttribute("href")))).toEqual([
      "/blog/planning-an-interior-that-lasts",
      "/blog/choosing-natural-stone",
      "/blog/construction-quality-checklist",
    ]);
    const row = rows.first();
    expect(await columns(row)).toEqual([130, 393.8]);
    await expectStyles(row, {
      height: "117px",
      paddingTop: "14px",
      borderBottomColor: "rgb(232, 229, 223)",
    });
    await expectStyles(row.locator("img"), { height: "88px" });
    await expectStyles(row.locator("time"), { fontSize: "9.5px", color: "rgb(153, 153, 153)" });
    await expect(row.locator("time")).toHaveText("2 Oct 2026");
    await expectStyles(row.locator("h3"), { fontSize: "17px", lineHeight: "22.1px" });
    // The original hides its category chips (KI-F14): none are rendered.
    await expect(blog(page).locator("a[href^='/blog/category']")).toHaveCount(0);
  });
});

test.describe("1024 tablet (unzoomed)", () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test("layout below 1100px", async ({ page }) => {
    await open(page);
    await expectStyles(hero(page).locator("h1"), { fontSize: "62px", lineHeight: "57.66px" });
    expect((await hero(page).boundingBox())?.height).toBe(768);
    await expect(video(page)).toHaveAttribute("data-cut", "desktop");

    expect(await columns(about(page).locator(".grid").first())).toEqual([952]);
    expect(
      await columns(about(page).locator("ul").filter({ hasText: "Projects Delivered" })),
    ).toEqual([238, 238, 238, 238]);
    expect(await columns(about(page).locator("ul").last().locator("li").first())).toEqual([
      44, 255, 653,
    ]);
    await expectStyles(about(page).locator("h2"), { fontSize: "46px" });

    const cards = signature(page).locator("ul").first();
    await expectStyles(cards, {
      display: "flex",
      overflowX: "auto",
      scrollSnapType: "x mandatory",
      marginLeft: "-20px",
      paddingLeft: "20px",
    });
    expect((await cards.locator("li").first().boundingBox())?.width).toBeCloseTo(737.3, 0);

    expect(await columns(news(page).locator("ul"))).toEqual([464, 464]);
    await expectStyles(news(page).locator("ul img").first(), { height: "230px" });
    expect(await columns(news(page).locator(".grid").first())).toEqual([952]);
    await expectStyles(news(page).locator(".grid").first(), { rowGap: "28px" });

    expect(await columns(blog(page).locator(".grid").nth(1))).toEqual([952]);
  });
});

test.describe("390 phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero on phones: mobile cut and stacked buttons", async ({ page }) => {
    await open(page);
    await expect(video(page)).toHaveAttribute("data-cut", "mobile");
    await expect(video(page)).toHaveAttribute("src", "/video/hero-mobile.mp4");
    await expectStyles(hero(page), { height: "844px", paddingBottom: "40px" });
    await expectStyles(hero(page).locator("h1"), {
      marginTop: "14px",
      fontSize: "37.44px",
      lineHeight: "39.312px",
      letterSpacing: "-0.3744px",
    });
    await expectStyles(hero(page).locator("p").first(), {
      fontSize: "11px",
      letterSpacing: "1.98px",
    });
    await expectStyles(hero(page).locator("h1 + p"), {
      marginTop: "16px",
      fontSize: "15px",
      lineHeight: "24px",
    });
    const primary = hero(page).getByRole("button", { name: "Start a Project" });
    const secondary = hero(page).getByRole("link", { name: "View Our Projects" });
    await expectStyles(primary, {
      width: "350px",
      height: "50px",
      justifyContent: "space-between",
    });
    await expectStyles(secondary, {
      width: "350px",
      height: "50px",
      borderTopColor: "rgba(255, 255, 255, 0.45)",
    });
    // The pause control sits below the header, clear of the stacked buttons.
    const toggle = await videoToggle(page).boundingBox();
    expect(toggle?.y).toBe(86);
  });

  test("sections on phones", async ({ page }) => {
    await open(page);
    await expectStyles(about(page).locator("h2"), { fontSize: "34px", lineHeight: "34.68px" });
    await expectStyles(about(page).getByText("EST. 2013 · KOCHI, KERALA"), { fontSize: "11px" });
    const stats = about(page).locator("ul").filter({ hasText: "Projects Delivered" });
    expect(await columns(stats)).toEqual([175, 175]);
    await expectStyles(stats.locator("li").nth(2), {
      paddingLeft: "0px",
      borderLeftWidth: "0px",
      borderTopWidth: "1px",
    });
    await expectStyles(stats.locator("li").nth(3), {
      borderLeftWidth: "1px",
      borderTopWidth: "1px",
    });
    expect(await columns(about(page).locator("ul").last().locator("li").first())).toEqual([
      34, 316,
    ]);
    await expectStyles(about(page).locator("img[src*='bougainvillea']"), {
      height: "260px",
      zIndex: "-1",
    });

    const card = signature(page).locator("ul li").first();
    expect((await card.boundingBox())?.width).toBeCloseTo(280.8, 0);
    await expectStyles(card.locator("h3"), { fontSize: "22px" });

    expect(await columns(news(page).locator("ul"))).toEqual([350]);
    await expectStyles(news(page).locator("ul img").first(), { height: "210px" });
    await expectStyles(news(page).locator("time").first(), { fontSize: "11px" });

    const row = blog(page).locator(".grid").nth(1).locator("ul a").first();
    expect(await columns(row)).toEqual([130, 198]);
    await expectStyles(blog(page).locator("h3").first(), { fontSize: "22px" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, contextOptions: { reducedMotion: "reduce" } });

  test("poster only, nothing auto-moves, content visible", async ({ page }) => {
    await open(page);
    await expect(videoToggle(page)).toHaveAccessibleName("Play background video");
    await expect(video(page)).not.toHaveAttribute("src", /.+/);
    await expect(video(page)).toHaveAttribute("data-state", "paused");
    await expect(hero(page).locator("picture img")).toBeVisible();
    await expectStyles(hero(page).locator("h1"), { animationName: "none", opacity: "1" });
    await expectStyles(track(page), { animationName: "none" });
    await expect(page.getByRole("button", { name: /partner logos/ })).toBeHidden();
    await expect(page.locator("[data-reveal]:not([data-shown])")).toHaveCount(0);
    expect(
      await about(page)
        .locator("ul")
        .filter({ hasText: "Projects Delivered" })
        .locator("b")
        .allTextContents(),
    ).toEqual(["200+", "11yrs", "500+", "Eco"]);

    // The visitor can still opt in to the video.
    await videoToggle(page).click();
    await expect(video(page)).toHaveAttribute("src", "/video/hero-desktop.mp4");
    await expect(video(page)).toHaveAttribute("data-state", "playing");
  });
});

test.describe("save-data", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("hero video downloads nothing until the visitor asks for it", async ({ page }) => {
    // Data Saver on (`navigator.connection.saveData`), as Chromium exposes it.
    await page.addInitScript(() => {
      const connection = Object.assign(new EventTarget(), { saveData: true });
      Object.defineProperty(navigator, "connection", { get: () => connection });
    });
    const videoRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/video/")) videoRequests.push(request.url());
    });
    await open(page);
    await expect(videoToggle(page)).toHaveAccessibleName("Play background video");
    await expect(video(page)).not.toHaveAttribute("src", /.+/);
    await expect(hero(page).locator("picture img")).toBeVisible();
    expect(videoRequests).toEqual([]);

    await videoToggle(page).click();
    await expect(video(page)).toHaveAttribute("src", "/video/hero-desktop.mp4");
    await expect(video(page)).toHaveAttribute("data-state", "playing");
  });
});
