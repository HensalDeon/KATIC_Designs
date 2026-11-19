/**
 * Captures the pixel-parity baseline from the ORIGINAL site, section by section.
 *
 *   pnpm ref:capture                                   # all routes × all viewports
 *   pnpm ref:capture --routes home,about --viewports desktop,mobile
 *
 * Output (git-ignored): reference/baseline/<viewport>/<route>/
 *   00-first-screen.png     first viewport incl. header
 *   NN-<section>.png        each top-level block of the page, header/overlays hidden
 *   scrub-<name>-<p>.png    scroll-scrub sections captured with motion ON (desktop only)
 *   manifest.json           section metadata (id, classes, position, background)
 *
 * Capture conditions: reduced motion (the original then shows the video poster and disables
 * autoplay/reveals), all images of the active page force-loaded, fonts settled, DPR 1.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { type Browser, chromium, type Page } from "@playwright/test";

import {
  PARITY_ROUTES,
  PARITY_VIEWPORTS,
  type ParityRoute,
  type ParityViewportId,
  SCROLL_SCRUB_SECTIONS,
  SCRUB_PROGRESS_POINTS,
} from "./routes";
import { startOriginalServer } from "./serve-original.mjs";

const OUT_ROOT = path.join(process.cwd(), "reference/baseline");

/** Fixed chrome that would otherwise overlay every section screenshot. */
const HIDE_CHROME_CSS = `
  .hdr, .rail.grail, .mcta, .toast, .skip-link, .kprog { visibility: hidden !important; }
`;

type SectionRecord = {
  readonly file: string;
  readonly domIndex: number;
  readonly tag: string;
  readonly id: string | null;
  readonly className: string;
  readonly top: number;
  readonly height: number;
  readonly background: string;
};

type KaticWindow = Window & { KATIC_LOADIMG?: (img: HTMLImageElement) => void };

const { values: args } = parseArgs({
  options: {
    routes: { type: "string" },
    viewports: { type: "string" },
  },
});

const routes = selectRoutes(args.routes);
const viewports = selectViewports(args.viewports);

const server = await startOriginalServer();
const browser = await chromium.launch();
const started = Date.now();

try {
  await Promise.all(viewports.map((viewportId) => captureViewport(browser, viewportId)));
  console.log(
    `\nBaseline written to ${path.relative(process.cwd(), OUT_ROOT)} in ${Math.round((Date.now() - started) / 1000)}s`,
  );
} finally {
  await browser.close();
  await server.close();
}

async function captureViewport(browser: Browser, viewportId: ParityViewportId): Promise<void> {
  const viewport = PARITY_VIEWPORTS[viewportId];
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.touch,
    hasTouch: viewport.touch,
    reducedMotion: "reduce",
  });

  try {
    for (const route of routes) {
      const page = await context.newPage();
      try {
        const dir = path.join(OUT_ROOT, viewportId, route.id);
        await rm(dir, { recursive: true, force: true });
        await mkdir(dir, { recursive: true });

        await openRoute(page, route);
        const sections = await captureSections(page, dir);
        const scrub =
          viewportId === "desktop" ? await captureScrubSections(browser, route, dir) : [];

        await writeFile(
          path.join(dir, "manifest.json"),
          `${JSON.stringify({ route, viewportId, viewport, sections, scrub }, null, 2)}\n`,
        );
        console.log(
          `✓ ${viewportId.padEnd(7)} ${route.id.padEnd(20)} ${sections.length} sections${scrub.length ? `, ${scrub.length} scrub frames` : ""}`,
        );
      } catch (error) {
        console.error(
          `✗ ${viewportId} ${route.id}:`,
          error instanceof Error ? error.message : error,
        );
        process.exitCode = 1;
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
  }
}

/** Loads a route on the original site and brings it to a stable, fully-loaded state. */
async function openRoute(page: Page, route: ParityRoute): Promise<void> {
  await page.goto(`${server.url}${route.hash}`, { waitUntil: "load", timeout: 120_000 });

  await page.evaluate(async () => {
    await document.fonts.ready;
    const load = (window as KaticWindow).KATIC_LOADIMG;
    document.querySelectorAll<HTMLImageElement>(".page.active img").forEach((img) => {
      img.loading = "eager"; // lazy images inside horizontal scrollers would never load otherwise
      if (img.dataset["img"]) load?.(img);
    });

    // Walk the page so IntersectionObserver-driven content (line-art draw-on etc.) settles.
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo(0, 0);
  });

  await page
    .waitForFunction(
      () =>
        [...document.querySelectorAll<HTMLImageElement>(".page.active img")].every(
          (img) => img.complete,
        ),
      undefined,
      { timeout: 30_000 },
    )
    .catch(() => console.warn(`  ! ${route.id}: some images did not finish loading`));
  await page.waitForTimeout(400);
}

async function captureSections(page: Page, dir: string): Promise<SectionRecord[]> {
  await page.screenshot({
    path: path.join(dir, "00-first-screen.png"),
    animations: "disabled",
    caret: "hide",
  });
  await page.addStyleTag({ content: HIDE_CHROME_CSS });

  const blocks = await page.evaluate(() =>
    [...document.querySelectorAll(".page.active > *")]
      .map((el, domIndex) => {
        const rect = el.getBoundingClientRect();
        return {
          domIndex,
          tag: el.tagName.toLowerCase(),
          id: el.id || null,
          className: typeof el.className === "string" ? el.className : "",
          top: Math.round(rect.top + window.scrollY),
          height: Math.round(rect.height),
          background: getComputedStyle(el).backgroundColor,
        };
      })
      .filter((block) => block.height > 0 && block.tag !== "script" && block.tag !== "style"),
  );

  const records: SectionRecord[] = [];
  for (const [n, block] of blocks.entries()) {
    const label = block.id ?? block.className.split(/\s+/).find(Boolean) ?? block.tag;
    const file = `${String(n + 1).padStart(2, "0")}-${slug(label)}.png`;
    await page
      .locator(".page.active > *")
      .nth(block.domIndex)
      .screenshot({
        path: path.join(dir, file),
        animations: "disabled",
        caret: "hide",
        timeout: 60_000,
      });
    records.push({ file, ...block });
  }
  return records;
}

/** Motion-on frames of the pinned scroll sections at fixed progress points (KI-L02 / KI-L04). */
async function captureScrubSections(
  browser: Browser,
  route: ParityRoute,
  dir: string,
): Promise<string[]> {
  const targets = SCROLL_SCRUB_SECTIONS.filter((s) => s.routeId === route.id);
  if (targets.length === 0) return [];

  const { width, height } = PARITY_VIEWPORTS.desktop;
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const files: string[] = [];

  try {
    await openRoute(page, route);
    await page.addStyleTag({
      content: `${HIDE_CHROME_CSS} video.hv { visibility: hidden !important; }`,
    });

    for (const target of targets) {
      const range = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        return { top, travel: Math.max(0, rect.height - window.innerHeight) };
      }, target.selector);
      if (!range) {
        console.warn(`  ! ${route.id}: scrub section ${target.selector} not found`);
        continue;
      }

      for (const progress of SCRUB_PROGRESS_POINTS) {
        await page.evaluate(
          (y) => window.scrollTo(0, y),
          Math.round(range.top + range.travel * progress),
        );
        await page.waitForTimeout(700); // let the rAF-driven transforms settle
        const file = `scrub-${target.name}-${String(Math.round(progress * 100)).padStart(3, "0")}.png`;
        await page.screenshot({
          path: path.join(dir, file),
          animations: "disabled",
          caret: "hide",
        });
        files.push(file);
      }
    }
  } finally {
    await context.close();
  }
  return files;
}

function selectRoutes(list: string | undefined): readonly ParityRoute[] {
  if (!list) return PARITY_ROUTES;
  const wanted = list.split(",").map((s) => s.trim());
  const unknown = wanted.filter((id) => !PARITY_ROUTES.some((r) => r.id === id));
  if (unknown.length > 0) throw new Error(`Unknown route(s): ${unknown.join(", ")}`);
  return PARITY_ROUTES.filter((r) => wanted.includes(r.id));
}

function selectViewports(list: string | undefined): readonly ParityViewportId[] {
  const all = Object.keys(PARITY_VIEWPORTS) as ParityViewportId[];
  if (!list) return all;
  const wanted = list.split(",").map((s) => s.trim());
  const unknown = wanted.filter((id) => !(id in PARITY_VIEWPORTS));
  if (unknown.length > 0) throw new Error(`Unknown viewport(s): ${unknown.join(", ")}`);
  return all.filter((id) => wanted.includes(id));
}

function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "block"
  );
}
