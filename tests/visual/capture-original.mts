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
 * autoplay/reveals), all images of the active page force-loaded, fonts loaded, DPR 1, and the
 * layout settled (block heights stable across two checks 500ms apart) with the original's runtime
 * scripts in their after-load state (`lib/pages.ts`).
 *
 *   --out dir   output root (default reference/baseline), e.g. a settled re-capture of a few
 *               routes for `pnpm parity --baseline <dir>` (P6-03). `pnpm parity --live` compares
 *               against the live original directly and usually makes this unnecessary.
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { type Browser, chromium, type Page } from "@playwright/test";

import { blockFileStem, pick } from "./lib/options";
import {
  BLOCKS_SELECTOR,
  HIDE_CHROME_CSS as HIDE_CHROME,
  listOriginalBlocks,
  newParityContext,
  openSettled,
  type OriginalBlockRecord,
} from "./lib/pages";
import {
  PARITY_ROUTES,
  PARITY_VIEWPORTS,
  type ParityRoute,
  type ParityViewportId,
  SCROLL_SCRUB_SECTIONS,
  SCRUB_PROGRESS_POINTS,
} from "./routes";
import { startOriginalServer } from "./serve-original.mjs";

/** Fixed chrome that would otherwise overlay every section screenshot. */
const HIDE_CHROME_CSS = HIDE_CHROME.original;

type SectionRecord = OriginalBlockRecord & { readonly file: string };

const { values: args } = parseArgs({
  options: {
    routes: { type: "string" },
    viewports: { type: "string" },
    out: { type: "string", default: "reference/baseline" },
  },
});

const OUT_ROOT = path.resolve(process.cwd(), args.out);
const routes = pick(PARITY_ROUTES, args.routes, (r) => r.id, "route");
const viewports = pick(
  Object.keys(PARITY_VIEWPORTS) as ParityViewportId[],
  args.viewports,
  (v) => v,
  "viewport",
);

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
  const context = await newParityContext(browser, viewportId);

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

/** Loads a route on the original site and brings it to a settled, fully-loaded state. */
async function openRoute(page: Page, route: ParityRoute): Promise<void> {
  await openSettled(page, `${server.url}${route.hash}`, "original");
}

async function captureSections(page: Page, dir: string): Promise<SectionRecord[]> {
  await page.screenshot({
    path: path.join(dir, "00-first-screen.png"),
    animations: "disabled",
    caret: "hide",
  });
  await page.addStyleTag({ content: HIDE_CHROME_CSS });

  const blocks = await listOriginalBlocks(page);

  const records: SectionRecord[] = [];
  for (const [n, block] of blocks.entries()) {
    const file = `${blockFileStem(n, block)}.png`;
    await page
      .locator(BLOCKS_SELECTOR.original)
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
