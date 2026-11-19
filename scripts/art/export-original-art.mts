/**
 * Exports the ORIGINAL isometric line art as test fixtures, so the TS port in `src/lib/art` can be
 * proven byte-identical without committing (or reading) the git-ignored `reference/` folder.
 *
 *   pnpm exec tsx scripts/art/export-original-art.mts
 *
 * It slices four scripts verbatim out of reference/original/katic-designs-final.stripped.html and
 * runs them in a `node:vm` sandbox with a minimal fake DOM:
 *   - the icon library IIFE           → window.KATIC_ICON (draw, pick, ARTS)
 *   - the stage wireframes IIFE       → window.KATIC_ART
 *   - the `.ksteps` handler           → stage chosen for every process step
 *   - the `.kfeat` handler            → icon chosen for every feature tile (fresh `used` per grid)
 * The grids and their h3 titles come from the static page markup, in document order.
 *
 * Output: tests/fixtures/art/original-art.json (committed), checked by src/lib/art/art.test.ts.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

import { format, resolveConfig } from "prettier";

const SOURCE = path.join(process.cwd(), "reference/original/katic-designs-final.stripped.html");
const OUT = path.join(process.cwd(), "tests/fixtures/art/original-art.json");

const html = await readFile(SOURCE, "utf8").catch(() => {
  throw new Error("Missing the stripped original. Run `pnpm ref:extract` first.");
});

/* ---------- 1. slice the original scripts ---------- */

/** Source from the line containing `start` up to and including the end of `end`. */
function slice(start: string, end: string): string {
  const a = html.lastIndexOf("\n", html.indexOf(start)) + 1;
  const b = html.indexOf(end, a);
  if (a <= 0 || b < 0) throw new Error(`Marker not found: ${start} … ${end}`);
  return html.slice(a, b + end.length);
}

const iconLib = slice("/* 3D line icon library", "window.KATIC_ICON={draw,pick,ARTS};\n})();");
const stageLib = slice(
  "/* ---------- 3D isometric stage wireframes",
  "window.KATIC_ART=i=>svg(A[Math.max(0,Math.min(A.length-1,i))]);\n})();",
);
const stepsHandler = slice(
  "/* ---------- 3D line art for every process / steps block",
  "    io.observe(g);\n  });\n})();",
);
const featHandler = slice(
  "/* ---------- unique 3D line icons on feature tiles",
  "io.observe(g);});",
);

/* ---------- 2. parse the page markup (just enough of a DOM for the two handlers) ---------- */

type Node = {
  tag: string;
  cls: string[];
  id: string | null;
  parent: Node | null;
  children: Node[];
  /** Offsets of the element's inner HTML in `html`. */
  innerStart: number;
  innerEnd: number;
};

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const RAW = new Set(["script", "style"]);

function parse(from: number, to: number): Node {
  const root: Node = {
    tag: "#root",
    cls: [],
    id: null,
    parent: null,
    children: [],
    innerStart: from,
    innerEnd: to,
  };
  const tagRe = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
  tagRe.lastIndex = from;
  let cur = root;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(html)) && m.index < to) {
    const [whole, close, rawTag, attrs = ""] = m;
    if (!rawTag) continue; // comment
    const tag = rawTag.toLowerCase();
    if (close) {
      // Pop to the matching open element (tolerates unclosed <p>, <li> …).
      let n: Node | null = cur;
      while (n && n.tag !== tag) n = n.parent;
      if (n?.parent) {
        n.innerEnd = m.index;
        cur = n.parent;
      }
      continue;
    }
    const cls = /\sclass="([^"]*)"/.exec(attrs)?.[1]?.split(/\s+/).filter(Boolean) ?? [];
    const id = /\sid="([^"]*)"/.exec(attrs)?.[1] ?? null;
    const node: Node = {
      tag,
      cls,
      id,
      parent: cur,
      children: [],
      innerStart: m.index + whole.length,
      innerEnd: m.index + whole.length,
    };
    cur.children.push(node);
    if (RAW.has(tag)) {
      const endTag = html.indexOf(`</${tag}`, tagRe.lastIndex);
      node.innerEnd = endTag;
      tagRe.lastIndex = html.indexOf(">", endTag) + 1;
    } else if (!VOID.has(tag) && !attrs.trimEnd().endsWith("/")) {
      cur = node;
    }
  }
  return root;
}

const walk = function* (n: Node): Generator<Node> {
  for (const c of n.children) {
    yield c;
    yield* walk(c);
  }
};
const innerHTML = (n: Node) => html.slice(n.innerStart, n.innerEnd);
const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const textContent = (n: Node) =>
  innerHTML(n)
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (e: string, k: string) => {
      if (k.startsWith("#"))
        return String.fromCodePoint(Number(k.startsWith("#x") ? `0x${k.slice(2)}` : k.slice(1)));
      return ENTITIES[k] ?? e;
    });
const pageOf = (n: Node) => {
  for (let p = n.parent; p; p = p.parent) if (p.id?.startsWith("p-")) return p.id.slice(2);
  return null;
};
const hasClass = (n: Node, c: string) => n.cls.includes(c);

const bodyStart = html.indexOf("<body");
const bodyEnd = html.indexOf("<script>", bodyStart);
const doc = parse(bodyStart, bodyEnd);
const all = [...walk(doc)];

/* ---------- 3. fake DOM + sandbox ---------- */

type Inserted = { html: string };
type FakeEl = {
  node: Node;
  inserted: Inserted[];
  dataset: Record<string, string>;
  classList: { add: (c: string) => void; contains: (c: string) => boolean };
  closest: (sel: string) => null;
  querySelector: (sel: string) => { textContent: string; innerHTML: string } | null;
  querySelectorAll: (sel: string) => FakeEl[];
  insertAdjacentHTML: (pos: string, s: string) => void;
};

const fakes = new Map<Node, FakeEl>();
function fake(node: Node): FakeEl {
  const existing = fakes.get(node);
  if (existing) return existing;
  const el: FakeEl = {
    node,
    inserted: [],
    dataset: {},
    classList: { add: () => undefined, contains: (c) => hasClass(node, c) },
    // Only used to decide the light/dark class, which the fixtures don't need.
    closest: () => null,
    querySelector: (sel) => {
      if (sel !== "h3") throw new Error(`Unexpected selector ${sel}`);
      const h3 = [...walk(node)].find((n) => n.tag === "h3");
      return h3 ? { textContent: textContent(h3), innerHTML: innerHTML(h3) } : null;
    },
    querySelectorAll: (sel) => {
      const m = /^:scope>\.([a-z0-9-]+)$/.exec(sel);
      if (!m?.[1]) throw new Error(`Unexpected selector ${sel}`);
      const c = m[1];
      return node.children.filter((n) => hasClass(n, c)).map(fake);
    },
    insertAdjacentHTML: (_pos, s) => el.inserted.push({ html: s }),
  };
  fakes.set(node, el);
  return el;
}

const stepGrids = all.filter((n) => hasClass(n, "ksteps"));
const featGrids = all.filter((n) => hasClass(n, "kfeat") && !hasClass(n, "grid3"));

type IconApi = { draw: (n: string) => string; ARTS: Record<string, unknown> };
type Sandbox = {
  document: { querySelectorAll: (sel: string) => FakeEl[] };
  IntersectionObserver: new () => { observe: () => void; disconnect: () => void };
  setTimeout: () => number;
  window?: Sandbox;
  /** Defined by the original scripts. */
  KATIC_ICON?: IconApi;
  KATIC_ART?: (i: number) => string;
};

const sandbox: Sandbox = {
  document: {
    querySelectorAll: (sel: string) => {
      if (sel === "[data-stage-art]") return [];
      if (sel === ".ksteps") return stepGrids.map(fake);
      if (sel === ".kfeat:not(.grid3)") return featGrids.map(fake);
      throw new Error(`Unexpected selector ${sel}`);
    },
  },
  IntersectionObserver: class {
    observe = () => undefined;
    disconnect = () => undefined;
  },
  setTimeout: () => 0,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const src of [iconLib, stageLib, stepsHandler, featHandler]) vm.runInContext(src, sandbox);

const { KATIC_ICON, KATIC_ART } = sandbox;
if (!KATIC_ICON || !KATIC_ART)
  throw new Error("The original scripts did not define KATIC_ICON/KATIC_ART");

/* ---------- 4. collect ---------- */

type Drawing = {
  viewBox: string;
  preserveAspectRatio: string;
  lit: string[];
  paths: { d: string; dashed: boolean }[];
  /** sha256 of the original's exact SVG markup (the test re-serialises the port and compares). */
  sha256: string;
};

function drawing(svg: string): Drawing {
  const open = /^<svg viewBox="([^"]+)" preserveAspectRatio="([^"]+)"/.exec(svg);
  if (!open?.[1] || !open[2]) throw new Error(`Unexpected svg: ${svg.slice(0, 80)}`);
  return {
    viewBox: open[1],
    preserveAspectRatio: open[2],
    lit: [...svg.matchAll(/<polygon class="lit" points="([^"]*)"\/>/g)].map((m) => m[1] ?? ""),
    paths: [...svg.matchAll(/<path class="ln( dsh)?" pathLength="1" d="([^"]*)"\/>/g)].map((m) => ({
      d: m[2] ?? "",
      dashed: Boolean(m[1]),
    })),
    sha256: createHash("sha256").update(svg).digest("hex"),
  };
}

const stageSvgs = [0, 1, 2, 3, 4, 5, 6].map((i) => KATIC_ART(i));
const iconNames = Object.keys(KATIC_ICON.ARTS);

const unwrap = (s: string, open: string) => {
  if (!s.startsWith(open) || !s.endsWith("</div>"))
    throw new Error(`Unexpected insert: ${s.slice(0, 60)}`);
  return s.slice(open.length, -"</div>".length);
};

const fixture = {
  $comment:
    "Generated by scripts/art/export-original-art.mts from the original site. Do not edit by hand.",
  stages: stageSvgs.map(drawing),
  iconNames,
  icons: Object.fromEntries(iconNames.map((n) => [n, drawing(KATIC_ICON.draw(n))])),
  /** Every `.ksteps` row: step titles (h3 textContent) and the stage drawn for each step. */
  stepGrids: stepGrids.map((g) => {
    const steps = fake(g).querySelectorAll(":scope>.s");
    return {
      page: pageOf(g),
      titles: steps.map((s) => s.querySelector("h3")?.textContent ?? ""),
      stages: steps.map((s) => {
        const svg = unwrap(s.inserted[0]?.html ?? "", '<div class="art3">');
        const k = stageSvgs.indexOf(svg);
        if (k < 0) throw new Error("Step art does not match any stage");
        return k;
      }),
    };
  }),
  /** Every `.kfeat:not(.grid3)` grid: tile titles (h3 innerHTML) and the icon picked for each. */
  featureGrids: featGrids.map((g) => {
    const tiles = fake(g).querySelectorAll(":scope>.f");
    return {
      page: pageOf(g),
      titles: tiles.map((f) => f.querySelector("h3")?.innerHTML ?? ""),
      icons: tiles.map((f) => {
        const icon = f.dataset["icon"];
        if (!icon) throw new Error("Tile without icon");
        if (unwrap(f.inserted[0]?.html ?? "", '<div class="ic3">') !== KATIC_ICON.draw(icon))
          throw new Error(`Inserted art for ${icon} differs from draw()`);
        return icon;
      }),
    };
  }),
};

await mkdir(path.dirname(OUT), { recursive: true });
// Formatted like the rest of the repo so `pnpm format:check` passes on a fresh export.
const json = await format(JSON.stringify(fixture), {
  ...(await resolveConfig(OUT)),
  filepath: OUT,
});
await writeFile(OUT, json);
console.log(
  `Wrote ${path.relative(process.cwd(), OUT)}: ${fixture.stages.length} stages, ${iconNames.length} icons, ` +
    `${fixture.stepGrids.length} step rows, ${fixture.featureGrids.length} feature grids`,
);
