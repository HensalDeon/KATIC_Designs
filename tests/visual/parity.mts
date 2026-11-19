/**
 * Pixel parity: compares each section of the NEW site with the ORIGINAL's baseline
 * (reference/baseline, captured by `pnpm ref:capture`) and writes an HTML diff report.
 *
 *   pnpm parity --routes home --viewports desktop,mobile [--base http://127.0.0.1:3100] [--out dir]
 *     [--css file]   (extra CSS injected into the new site, e.g. to revert a deliberate fix, P5-04)
 *     [--baseline dir] (default reference/baseline)
 *
 * Sections are matched by the original's ids (pages keep them). Blocks without an id in the
 * original: the hero (matched to `[data-hero]`), the footer (matched to `[data-parity=footer]`) and
 * any other block, matched to `[data-parity="<its first class>"]` (e.g. About's `section.i1`); when
 * several blocks share that class (the service pages' `section.ks`), the n-th block matches the
 * n-th element.
 * Size differences count as mismatching pixels (both images are padded to the larger size), so a
 * section that grows or shrinks cannot pass. Scroll-scrub sections are compared from their
 * motion-on frames by their own suites and are skipped here.
 *
 * Output (git-ignored): reference/parity/report.html, report.json, and per-section
 * `<name>.new.png` / `<name>.diff.png` next to each other under reference/parity/<viewport>/<route>/.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { chromium, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  PARITY_ROUTES,
  PARITY_VIEWPORTS,
  type ParityRoute,
  type ParityViewportId,
  SCROLL_SCRUB_SECTIONS,
} from "./routes";

const ROOT = process.cwd();

/** Fixed chrome hidden in both captures (the baseline hides the original's equivalents). */
const HIDE_CHROME_CSS = `
  .zoom-root > header, nav[aria-label="Quick contact"], [role="status"], a[href="#main"] {
    visibility: hidden !important;
  }
`;

type BaselineSection = { file: string; id: string | null; className: string; height: number };
type Result = {
  route: string;
  viewport: ParityViewportId;
  section: string;
  /** pass ≤ threshold; review ≤ 2 × threshold (typically sub-pixel/anti-aliasing: eyeball the diff). */
  status: "pass" | "review" | "fail" | "missing" | "skipped";
  mismatchPct?: number;
  baselineSize?: [number, number];
  newSize?: [number, number];
  files?: { baseline: string; actual: string; diff: string };
};

const { values: args } = parseArgs({
  options: {
    routes: { type: "string" },
    viewports: { type: "string" },
    base: { type: "string", default: "http://127.0.0.1:3100" },
    /** Report directory (worktrees cannot write into the symlinked reference/ folder). */
    out: { type: "string", default: "reference/parity" },
    threshold: { type: "string", default: "1" },
    /** CSS injected into the new site only (measure with a deliberate fix reverted, DECISIONS P5-04). */
    css: { type: "string" },
    /** Baseline directory (default reference/baseline), e.g. a re-capture of selected routes. */
    baseline: { type: "string", default: "reference/baseline" },
  },
});
const thresholdPct = Number(args.threshold);
const BASELINE = path.resolve(ROOT, args.baseline);
const EXTRA_CSS = args.css ? await readFile(path.resolve(process.cwd(), args.css), "utf8") : "";
const OUT = path.resolve(ROOT, args.out);
const routes = pick(PARITY_ROUTES, args.routes, (r) => r.id);
const viewports = pick(
  Object.keys(PARITY_VIEWPORTS) as ParityViewportId[],
  args.viewports,
  (v) => v,
);

const browser = await chromium.launch();
const results: Result[] = [];
try {
  for (const viewportId of viewports) {
    const viewport = PARITY_VIEWPORTS[viewportId];
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      isMobile: viewport.touch,
      hasTouch: viewport.touch,
      reducedMotion: "reduce",
    });
    for (const route of routes) {
      const page = await context.newPage();
      try {
        results.push(...(await compareRoute(page, route, viewportId)));
      } finally {
        await page.close();
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
}

await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(results, null, 2)}\n`);
await writeFile(path.join(OUT, "report.html"), renderReport(results));

const failed = results.filter((r) => r.status === "fail" || r.status === "missing");
for (const r of results) {
  const pct = r.mismatchPct === undefined ? "" : `${r.mismatchPct.toFixed(2)}%`;
  console.log(
    `${r.status.padEnd(7)} ${r.viewport.padEnd(7)} ${r.route.padEnd(14)} ${r.section.padEnd(28)} ${pct}`,
  );
}
console.log(
  `\n${results.length - failed.length}/${results.length} ok (threshold ${thresholdPct}%). Report: ${path.relative(ROOT, path.join(OUT, "report.html"))}`,
);
if (failed.length > 0) process.exitCode = 1;

async function compareRoute(
  page: Page,
  route: ParityRoute,
  viewportId: ParityViewportId,
): Promise<Result[]> {
  const dir = path.join(BASELINE, viewportId, route.id);
  const manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8")) as {
    sections: BaselineSection[];
  };

  await page.goto(`${args.base}${route.path}`, { waitUntil: "load" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
    });
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
  });
  await page.addStyleTag({ content: HIDE_CHROME_CSS });
  if (EXTRA_CSS) await page.addStyleTag({ content: EXTRA_CSS });
  await page.waitForTimeout(400);

  const outDir = path.join(OUT, viewportId, route.id);
  await mkdir(outDir, { recursive: true });
  const scrub = new Set<string>(
    SCROLL_SCRUB_SECTIONS.filter((s) => s.routeId === route.id).map((s) => s.selector.slice(1)),
  );

  const results: Result[] = [];
  // Blocks sharing a parity class (e.g. the service pages' `section.ks`) match by occurrence.
  const seen = new Map<string, number>();
  for (const section of manifest.sections) {
    const name = section.file.replace(/\.png$/, "");
    const base: Result = {
      route: route.id,
      viewport: viewportId,
      section: name,
      status: "missing",
    };
    if (section.id && scrub.has(section.id)) {
      results.push({ ...base, status: "skipped" });
      continue;
    }
    const selector = section.id
      ? `#${section.id}`
      : /\bhero\b/.test(section.className)
        ? "[data-hero]"
        : /\bftw\b/.test(section.className)
          ? "[data-parity=footer]"
          : parityClassSelector(section.className);
    const occurrence = selector ? (seen.get(selector) ?? 0) : 0;
    if (selector) seen.set(selector, occurrence + 1);
    const locator = selector ? page.locator(selector).nth(occurrence) : null;
    if (!locator || (await locator.count()) === 0) {
      results.push(base);
      continue;
    }

    const actual = PNG.sync.read(
      await locator.screenshot({ animations: "disabled", caret: "hide", timeout: 60_000 }),
    );
    const expected = PNG.sync.read(await readFile(path.join(dir, section.file)));
    const { diff, mismatched, total } = compare(expected, actual);
    const files = {
      baseline: path.join(dir, section.file),
      actual: path.join(outDir, `${name}.new.png`),
      diff: path.join(outDir, `${name}.diff.png`),
    };
    await writeFile(files.actual, PNG.sync.write(actual));
    await writeFile(files.diff, PNG.sync.write(diff));
    const mismatchPct = (mismatched / total) * 100;
    results.push({
      ...base,
      status:
        mismatchPct <= thresholdPct ? "pass" : mismatchPct <= thresholdPct * 2 ? "review" : "fail",
      mismatchPct,
      baselineSize: [expected.width, expected.height],
      newSize: [actual.width, actual.height],
      files,
    });
  }
  return results;
}

/** `[data-parity="<first class>"]` for a baseline block without an id, or null. */
function parityClassSelector(className: string): string | null {
  const first = className.split(/\s+/).find(Boolean);
  return first ? `[data-parity="${first}"]` : null;
}

/** Pads both images to the larger size (padding = magenta, so it always mismatches) and diffs them. */
function compare(expected: PNG, actual: PNG) {
  const width = Math.max(expected.width, actual.width);
  const height = Math.max(expected.height, actual.height);
  const pad = (image: PNG) => {
    if (image.width === width && image.height === height) return image;
    const padded = new PNG({ width, height });
    for (let i = 0; i < padded.data.length; i += 4) padded.data.set([255, 0, 255, 255], i);
    PNG.bitblt(image, padded, 0, 0, image.width, image.height, 0, 0);
    return padded;
  };
  const diff = new PNG({ width, height });
  const mismatched = pixelmatch(pad(expected).data, pad(actual).data, diff.data, width, height, {
    threshold: 0.1,
  });
  return { diff, mismatched, total: width * height };
}

function renderReport(rows: Result[]): string {
  const rel = (file: string) => path.relative(OUT, file);
  const body = rows
    .map((r) => {
      const pct = r.mismatchPct === undefined ? "—" : `${r.mismatchPct.toFixed(2)}%`;
      const size =
        r.baselineSize && r.newSize ? `${r.baselineSize.join("×")} → ${r.newSize.join("×")}` : "";
      const images = r.files
        ? `<div class="imgs">${[r.files.baseline, r.files.actual, r.files.diff].map((f) => `<img loading="lazy" src="${rel(f)}">`).join("")}</div>`
        : "";
      return `<section class="${r.status}"><h2>${r.status.toUpperCase()} · ${r.viewport} · ${r.route} · ${r.section} · ${pct} <small>${size}</small></h2>${images}</section>`;
    })
    .join("\n");
  return `<!doctype html><meta charset="utf-8"><title>Parity report</title>
<style>body{font:14px system-ui;margin:24px;background:#f4f4f4}section{background:#fff;margin:0 0 16px;padding:12px;border-left:6px solid #999}
.pass{border-color:#2a9d4b}.review{border-color:#e0b000}.fail{border-color:#e8622c}.missing{border-color:#c00}h2{font-size:14px;margin:0 0 8px}small{color:#666;font-weight:400}
.imgs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.imgs img{width:100%;border:1px solid #ddd}</style>
<h1>Parity report (baseline · new · diff)</h1>${body}`;
}

function pick<T>(
  all: readonly T[],
  list: string | undefined,
  key: (item: T) => string,
): readonly T[] {
  if (!list) return all;
  const wanted = list.split(",").map((s) => s.trim());
  const unknown = wanted.filter((w) => !all.some((item) => key(item) === w));
  if (unknown.length > 0) throw new Error(`Unknown: ${unknown.join(", ")}`);
  return all.filter((item) => wanted.includes(key(item)));
}
