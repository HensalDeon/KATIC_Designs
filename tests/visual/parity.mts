/**
 * Pixel parity: compares each section of the NEW site (a running production server) with the
 * ORIGINAL, section by section, and writes an HTML diff report.
 *
 * Three modes:
 * - **stored** (default): against the baseline captured once by `pnpm ref:capture`
 *   (reference/baseline). Backwards compatible with every number in docs/PARITY.md.
 * - **`--live`**: against the original served live (own server on a free port), captured exactly
 *   like the new site and only once it has settled: fonts and images loaded, block heights stable
 *   across two checks 500ms apart, and the original's runtime scripts (`fit()`, plant padding,
 *   11px text fixer) brought to their after-load state and frozen (`lib/pages.ts`). Removes the
 *   stale-baseline offsets (KI-N11, KI-N12, P6-03).
 * - **`--motion`** (implies `--live`, defaults to `--viewports desktop`): animations on. Each
 *   section is scrolled to the top of the viewport on both sites, given `--wait` ms (2500) to finish
 *   its reveals, and the two viewports are diffed (videos hidden). Replaces the hand-written
 *   motion audit (docs/PARITY.md "Motion check").
 *
 * Options:
 *   --routes a,b  --viewports desktop,laptop,tablet,mobile  --base http://127.0.0.1:3100
 *   --out dir         report directory (default reference/parity; worktrees: use .tmp/parity)
 *   --threshold 1     pass ≤ 1%, review ≤ 2% (DECISIONS P4-04)
 *   --css a.css,b.css CSS injected into the NEW site, e.g. `tests/visual/reverts/*.css` to revert
 *                     deliberate fixes (P5-04). `<html data-parity-route="<id>">` is set for scoping.
 *   --no-fit          neutralise the original's `fit()` auto-zoom (KI-L13; implies --live)
 *   --no-text-fix     undo the original's 11px small-text fixer at ≤860px (`mtext()`), i.e. compare
 *                     authored sizes; pair with `--css tests/visual/reverts/small-text.css` (KI-A10)
 *   --baseline dir    stored mode: baseline directory (default reference/baseline)
 *
 * Examples:
 *   pnpm parity --routes about --viewports laptop --base http://127.0.0.1:3561 --out .tmp/parity
 *   pnpm parity --live --routes about --base http://127.0.0.1:3561 --out .tmp/parity
 *   pnpm parity --live --no-fit --routes about --base http://127.0.0.1:3561 --out .tmp/parity \
 *     --css tests/visual/reverts/titles.css,tests/visual/reverts/small-text.css
 *   pnpm parity --motion --no-fit --routes about --base http://127.0.0.1:3561 --out .tmp/motion
 *
 * Sections are matched by the original's ids (pages keep them). Blocks without an id: the hero →
 * `[data-hero]`, the footer → `[data-parity=footer]`, any other → `[data-parity="<first class>"]`
 * (e.g. About's `section.i1`); when several blocks share that class (the service pages'
 * `section.ks`), the n-th block matches the n-th element (DECISIONS P5-01).
 * Size differences count as mismatching pixels (both images are padded to the larger size), so a
 * section that grows or shrinks cannot pass. Scroll-scrub sections are compared from their
 * motion-on frames by their own suites and are skipped, except in `--motion`.
 *
 * Output: <out>/report.html, report.json, and per section `<name>.new.png` / `<name>.diff.png`
 * (live: also `<name>.orig.png`; motion: `motion-<name>.*`) under <out>/<viewport>/<route>/.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { type BrowserContext, chromium, type Locator, type Page } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

import {
  blockFileStem,
  blockSelector,
  notMatchedByIdSuffix,
  parityStatus,
  pick,
} from "./lib/options";
import {
  BLOCKS_SELECTOR,
  HIDE_CHROME_CSS,
  HIDE_VIDEO_CSS,
  listOriginalBlocks,
  newParityContext,
  NO_FIT_CSS,
  openSettled,
  readCssList,
  scrollToTop,
} from "./lib/pages";
import {
  PARITY_ROUTES,
  PARITY_VIEWPORTS,
  type ParityRoute,
  type ParityViewportId,
  SCROLL_SCRUB_SECTIONS,
} from "./routes";
import { startOriginalServer } from "./serve-original.mjs";

const ROOT = process.cwd();

type Mode = "stored" | "live" | "motion";
/** An original block to compare: from the stored manifest or listed live. */
type Block = {
  name: string;
  id: string | null;
  className: string;
  /** Index among `.page.active > *` (live modes). */
  domIndex: number;
  /** Stored mode: the baseline PNG. */
  file?: string;
};
type Result = {
  mode: Mode;
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
    /** CSS files (comma list) injected into the new site only (DECISIONS P5-04). */
    css: { type: "string" },
    /** Stored mode: baseline directory (default reference/baseline), e.g. a settled re-capture. */
    baseline: { type: "string", default: "reference/baseline" },
    live: { type: "boolean", default: false },
    "no-fit": { type: "boolean", default: false },
    "no-text-fix": { type: "boolean", default: false },
    motion: { type: "boolean", default: false },
    /** Motion mode: ms to wait after scrolling each section to the top. */
    wait: { type: "string", default: "2500" },
  },
});

const mode: Mode = args.motion
  ? "motion"
  : args.live || args["no-fit"] || args["no-text-fix"]
    ? "live"
    : "stored";
const thresholdPct = Number(args.threshold);
const motionWaitMs = Number(args.wait);
const BASELINE = path.resolve(ROOT, args.baseline);
const EXTRA_CSS = await readCssList(args.css);
const OUT = path.resolve(ROOT, args.out);
const routes = pick(PARITY_ROUTES, args.routes, (r) => r.id, "route");
const viewports = pick(
  Object.keys(PARITY_VIEWPORTS) as ParityViewportId[],
  args.viewports ?? (mode === "motion" ? "desktop" : undefined),
  (v) => v,
  "viewport",
);
const originalCss = [HIDE_CHROME_CSS.original, args["no-fit"] ? NO_FIT_CSS : ""];
const oursCss = [HIDE_CHROME_CSS.ours, EXTRA_CSS];

console.log(
  `Parity: ${mode}${args["no-fit"] ? " · original fit() neutralised" : ""}${args.css ? ` · css ${args.css}` : ""} · ${args.base}`,
);

const server = mode === "stored" ? null : await startOriginalServer(0);
const browser = await chromium.launch();
const results: Result[] = [];
try {
  for (const viewportId of viewports) {
    const context = await newParityContext(browser, viewportId, { motion: mode === "motion" });
    for (const route of routes) {
      try {
        results.push(
          ...(mode === "motion"
            ? await motionRoute(context, route, viewportId)
            : await compareRoute(context, route, viewportId)),
        );
      } catch (error) {
        console.error(
          `✗ ${viewportId} ${route.id}:`,
          error instanceof Error ? error.message : error,
        );
        process.exitCode = 1;
      }
    }
    await context.close();
  }
} finally {
  await browser.close();
  await server?.close();
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

/** Section-by-section capture of the new site against the stored or live original. */
async function compareRoute(
  context: BrowserContext,
  route: ParityRoute,
  viewportId: ParityViewportId,
): Promise<Result[]> {
  const ours = await context.newPage();
  const original = server ? await context.newPage() : null;
  try {
    const dir = path.join(BASELINE, viewportId, route.id);
    let blocks: Block[];
    if (original && server) {
      await openSettled(original, `${server.url}${route.hash}`, "original", {
        css: originalCss,
        textFix: !args["no-text-fix"],
      });
      blocks = (await listOriginalBlocks(original)).map((b, i) => ({
        ...b,
        name: blockFileStem(i, b),
      }));
    } else {
      const manifest = JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8")) as {
        sections: (Omit<Block, "name"> & { file: string })[];
      };
      blocks = manifest.sections.map((s) => ({ ...s, name: s.file.replace(/\.png$/, "") }));
    }
    await openSettled(ours, `${args.base}${route.path}`, "ours", {
      css: oursCss,
      routeId: route.id,
    });

    const outDir = path.join(OUT, viewportId, route.id);
    await mkdir(outDir, { recursive: true });
    const scrub = new Set<string>(
      SCROLL_SCRUB_SECTIONS.filter((s) => s.routeId === route.id).map((s) => s.selector.slice(1)),
    );

    const results: Result[] = [];
    for (const { block, locator } of matchBlocks(ours, blocks)) {
      const base: Result = {
        mode,
        route: route.id,
        viewport: viewportId,
        section: block.name,
        status: "missing",
      };
      if (block.id && scrub.has(block.id)) {
        results.push({ ...base, status: "skipped" });
        continue;
      }
      if (!locator || (await locator.count()) === 0) {
        results.push(base);
        continue;
      }
      const actual = PNG.sync.read(
        await locator.screenshot({ animations: "disabled", caret: "hide", timeout: 60_000 }),
      );
      let expected: PNG;
      let baselineFile: string;
      if (original) {
        expected = PNG.sync.read(
          await original
            .locator(BLOCKS_SELECTOR.original)
            .nth(block.domIndex)
            .screenshot({ animations: "disabled", caret: "hide", timeout: 60_000 }),
        );
        baselineFile = path.join(outDir, `${block.name}.orig.png`);
        await writeFile(baselineFile, PNG.sync.write(expected));
      } else {
        baselineFile = path.join(dir, block.file ?? `${block.name}.png`);
        expected = PNG.sync.read(await readFile(baselineFile));
      }
      results.push(await record(base, expected, actual, outDir, block.name, baselineFile));
    }
    return results;
  } finally {
    await ours.close();
    await original?.close();
  }
}

/** Motion on: each section scrolled to the viewport top on both sites, waited for, diffed. */
async function motionRoute(
  context: BrowserContext,
  route: ParityRoute,
  viewportId: ParityViewportId,
): Promise<Result[]> {
  if (!server) throw new Error("motion mode needs the original server");
  const [original, ours] = [await context.newPage(), await context.newPage()];
  try {
    await Promise.all([
      openSettled(original, `${server.url}${route.hash}`, "original", {
        walk: false,
        motion: true,
        css: [...originalCss, HIDE_VIDEO_CSS],
      }),
      openSettled(ours, `${args.base}${route.path}`, "ours", {
        walk: false,
        css: [...oursCss, HIDE_VIDEO_CSS],
        routeId: route.id,
      }),
    ]);
    const blocks = (await listOriginalBlocks(original)).map((b, i) => ({
      ...b,
      name: blockFileStem(i, b),
    }));
    const outDir = path.join(OUT, viewportId, route.id);
    await mkdir(outDir, { recursive: true });

    const results: Result[] = [];
    for (const { block, selector, occurrence } of matchBlocks(ours, blocks)) {
      const base: Result = {
        mode,
        route: route.id,
        viewport: viewportId,
        section: block.name,
        status: "missing",
      };
      const [foundOriginal, foundOurs] = await Promise.all([
        scrollToTop(original, BLOCKS_SELECTOR.original, block.domIndex),
        selector ? scrollToTop(ours, selector, occurrence) : false,
      ]);
      if (!foundOriginal || !foundOurs) {
        results.push(base);
        continue;
      }
      await new Promise((resolve) => setTimeout(resolve, motionWaitMs));
      const [expectedBuffer, actualBuffer] = await Promise.all([
        original.screenshot({ caret: "hide" }),
        ours.screenshot({ caret: "hide" }),
      ]);
      const name = `motion-${block.name}`;
      const baselineFile = path.join(outDir, `${name}.orig.png`);
      await writeFile(baselineFile, expectedBuffer);
      results.push(
        await record(
          base,
          PNG.sync.read(expectedBuffer),
          PNG.sync.read(actualBuffer),
          outDir,
          name,
          baselineFile,
        ),
      );
    }
    return results;
  } finally {
    await original.close();
    await ours.close();
  }
}

/** Pairs each original block with its new-site locator (n-th block sharing a selector → n-th element). */
function matchBlocks(page: Page, blocks: readonly Block[]) {
  const seen = new Map<string, number>();
  const suffix = notMatchedByIdSuffix(blocks);
  return blocks.map((block) => {
    const selector = blockSelector(block, suffix);
    const occurrence = selector ? (seen.get(selector) ?? 0) : 0;
    if (selector) seen.set(selector, occurrence + 1);
    const locator: Locator | null = selector ? page.locator(selector).nth(occurrence) : null;
    return { block, selector, occurrence, locator };
  });
}

async function record(
  base: Result,
  expected: PNG,
  actual: PNG,
  outDir: string,
  name: string,
  baselineFile: string,
): Promise<Result> {
  const { diff, mismatched, total } = compare(expected, actual);
  const files = {
    baseline: baselineFile,
    actual: path.join(outDir, `${name}.new.png`),
    diff: path.join(outDir, `${name}.diff.png`),
  };
  await writeFile(files.actual, PNG.sync.write(actual));
  await writeFile(files.diff, PNG.sync.write(diff));
  const mismatchPct = (mismatched / total) * 100;
  return {
    ...base,
    status: parityStatus(mismatchPct, thresholdPct),
    mismatchPct,
    baselineSize: [expected.width, expected.height],
    newSize: [actual.width, actual.height],
    files,
  };
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
  const original = mode === "stored" ? "baseline" : "original (live)";
  const options = [mode, args["no-fit"] ? "no-fit" : "", args.css ? `css: ${args.css}` : ""]
    .filter(Boolean)
    .join(" · ");
  return `<!doctype html><meta charset="utf-8"><title>Parity report</title>
<style>body{font:14px system-ui;margin:24px;background:#f4f4f4}section{background:#fff;margin:0 0 16px;padding:12px;border-left:6px solid #999}
.pass{border-color:#2a9d4b}.review{border-color:#e0b000}.fail{border-color:#e8622c}.missing{border-color:#c00}h2{font-size:14px;margin:0 0 8px}small{color:#666;font-weight:400}
.imgs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.imgs img{width:100%;border:1px solid #ddd}</style>
<h1>Parity report (${original} · new · diff)</h1><p>${options}</p>${body}`;
}
