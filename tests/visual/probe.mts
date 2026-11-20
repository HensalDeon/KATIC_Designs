/**
 * Computed-style probe: prints the ORIGINAL's computed styles and rects for the elements matching a
 * selector at each viewport (JSON), optionally side by side with the NEW site. Generalises the
 * hand-written `reference/probes/sections.mts`. Both sites are opened and settled exactly as
 * `pnpm parity` captures them (reduced motion, fonts and images loaded, layout stable).
 *
 *   pnpm parity:probe --route about --selector ".i1 .st"
 *   pnpm parity:probe --route about --selector ".i1 .st" --viewports laptop,tablet \
 *     --props fontSize,lineHeight,marginTop --base http://127.0.0.1:3561 --ours ".i1 h2"
 *   pnpm parity:probe --route works --selector ".fp .kick" --pseudo before --no-fit --out .tmp/kick.json
 *
 * Options:
 *   --route id          one route of tests/visual/routes.ts (required)
 *   --selector css      original selector, matched inside `.page.active` (required)
 *   --viewports a,b     desktop,laptop,tablet,mobile (default all four); spot checks: hd,
 *                       short-laptop, fhd, qhd (tests/visual/routes.ts SPOT_VIEWPORTS)
 *   --props a,b         computed-style properties, camelCase or kebab-case (default: box + type)
 *   --pseudo before     read `::before` / `::after` instead of the element
 *   --limit 10          max elements per site (visible elements only)
 *   --base URL          also probe the new site (a running server)
 *   --ours css          new-site selector (default: --selector)
 *   --css a.css,b.css   CSS injected into the new site (e.g. tests/visual/reverts/*.css)
 *   --no-fit            neutralise the original's `fit()` auto-zoom first (KI-L13)
 *   --no-text-fix       undo the original's 11px small-text fixer (authored sizes, KI-A10)
 *   --motion            animations on (default reduced motion, like `pnpm parity`)
 *   --out file          also write the JSON to a file
 *
 * Output per viewport: `original` and `ours` arrays of `{ text, rect: [x, y, w, h], styles }`
 * (rect in CSS px of the page; y includes the scroll offset) and, with --base, `diff`: per element
 * index, the properties whose values differ (`{ prop: [original, ours] }`, rect included).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { chromium, type Page } from "@playwright/test";

import { diffRecords, parseProps, pick } from "./lib/options";
import { newParityContext, NO_FIT_CSS, openSettled, readCssList } from "./lib/pages";
import { PARITY_ROUTES, viewportIds } from "./routes";
import { startOriginalServer } from "./serve-original.mjs";

const DEFAULT_PROPS = [
  "display",
  "position",
  "width",
  "height",
  "marginTop",
  "marginBottom",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "color",
  "backgroundColor",
  "zoom",
] as const;

type Probed = {
  text: string;
  rect: [number, number, number, number];
  styles: Record<string, string>;
};

const { values: args } = parseArgs({
  options: {
    route: { type: "string" },
    selector: { type: "string" },
    viewports: { type: "string" },
    props: { type: "string" },
    pseudo: { type: "string" },
    limit: { type: "string", default: "10" },
    base: { type: "string" },
    ours: { type: "string" },
    css: { type: "string" },
    "no-fit": { type: "boolean", default: false },
    "no-text-fix": { type: "boolean", default: false },
    motion: { type: "boolean", default: false },
    out: { type: "string" },
  },
});

if (!args.route || !args.selector) {
  console.error(
    'Usage: pnpm parity:probe --route <id> --selector "<css>" [--viewports …] [--props …]',
  );
  process.exit(2);
}
const [route] = pick(PARITY_ROUTES, args.route, (r) => r.id, "route");
if (!route) throw new Error(`Unknown route ${args.route}`);
const viewports = viewportIds(args.viewports);
const props = parseProps(args.props, DEFAULT_PROPS);
const pseudo = args.pseudo ? `::${args.pseudo.replace(/^:+/, "")}` : null;
const limit = Number(args.limit);
const oursSelector = args.ours ?? args.selector;
const oursCss = await readCssList(args.css);

const server = await startOriginalServer(0);
const browser = await chromium.launch();
const output: Record<string, unknown> = {
  route: route.id,
  selector: args.selector,
  ...(args.base ? { ours: oursSelector } : {}),
  pseudo,
  noFit: args["no-fit"],
  viewports: {},
};
try {
  for (const viewportId of viewports) {
    const context = await newParityContext(browser, viewportId, { motion: args.motion });
    const original = await context.newPage();
    await openSettled(original, `${server.url}${route.hash}`, "original", {
      css: [args["no-fit"] ? NO_FIT_CSS : ""],
      motion: args.motion,
      textFix: !args["no-text-fix"],
    });
    const entry: Record<string, unknown> = {
      original: await probe(original, ".page.active", args.selector),
    };
    if (args.base) {
      const ours = await context.newPage();
      await openSettled(ours, `${args.base}${route.path}`, "ours", {
        routeId: route.id,
        css: [oursCss],
      });
      entry["ours"] = await probe(ours, null, oursSelector);
      entry["diff"] = (entry["original"] as Probed[]).map((left, i) => {
        const right = (entry["ours"] as Probed[])[i];
        return right
          ? diffRecords({ rect: left.rect, ...left.styles }, { rect: right.rect, ...right.styles })
          : "missing";
      });
    }
    (output["viewports"] as Record<string, unknown>)[viewportId] = entry;
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

// Pretty-printed, but arrays of scalars (rects, diff pairs) stay on one line.
const json = JSON.stringify(output, null, 2).replace(
  /\[\s+([^[\]{}]*?)\s+\]/g,
  (_, items: string) => `[${items.split(/,\s+/).join(", ")}]`,
);
console.log(json);
if (args.out) {
  await mkdir(path.dirname(path.resolve(args.out)), { recursive: true });
  await writeFile(path.resolve(args.out), `${json}\n`);
}

function probe(page: Page, scope: string | null, selector: string): Promise<Probed[]> {
  return page.evaluate(
    ({ scope, selector, props, pseudo, limit }) => {
      const root = scope ? document.querySelector(scope) : document;
      if (!root) return [];
      // No named helpers in here: tsx would wrap them in `__name()`, which the page lacks.
      return [...root.querySelectorAll<HTMLElement>(selector)]
        .filter((el) => el.getClientRects().length > 0)
        .slice(0, limit)
        .map((el) => {
          const style = getComputedStyle(el, pseudo);
          const r = el.getBoundingClientRect();
          return {
            text: el.textContent.trim().replace(/\s+/g, " ").slice(0, 40),
            rect: [r.left + window.scrollX, r.top + window.scrollY, r.width, r.height].map(
              (n) => Math.round(n * 10) / 10,
            ),
            styles: Object.fromEntries(
              props.map((p) => [
                p,
                style.getPropertyValue(p.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)),
              ]),
            ),
          };
        });
    },
    { scope, selector, props, pseudo, limit },
  ) as Promise<Probed[]>;
}
