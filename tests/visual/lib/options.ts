/**
 * Pure helpers shared by the parity tools (`parity.mts`, `probe.mts`, `capture-original.mts`):
 * argument lists, the original-block → new-site selector mapping and the settle check. No
 * Playwright here, so everything is unit-tested (`options.test.ts`).
 */

/** `"a, b,,c"` → `["a", "b", "c"]`; `undefined` → `[]`. */
export function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * The items of `all` named in a comma list (in `all`'s order), or every item when the list is
 * empty. Unknown names throw, so a typo never silently runs nothing.
 */
export function pick<T>(
  all: readonly T[],
  list: string | undefined,
  key: (item: T) => string,
  label = "item",
): readonly T[] {
  const wanted = splitList(list);
  if (wanted.length === 0) return all;
  const unknown = wanted.filter((w) => !all.some((item) => key(item) === w));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown ${label}(s): ${unknown.join(", ")}. Known: ${all.map(key).join(", ")}`,
    );
  }
  return all.filter((item) => wanted.includes(key(item)));
}

/**
 * True when two layout measurements (e.g. every top-level block's height plus the document
 * height) agree within `tolerancePx`. Used to wait until the original's runtime scripts (`fit()`
 * zoom, plant padding, the 11px text fixer) stop changing the page (KI-N11, KI-N12).
 */
export function heightsStable(
  previous: readonly number[] | null,
  next: readonly number[],
  tolerancePx = 0.5,
): boolean {
  if (previous?.length !== next.length) return false;
  return previous.every((value, i) => Math.abs(value - (next[i] ?? Number.NaN)) <= tolerancePx);
}

export type ParityStatus = "pass" | "review" | "fail";

/** DECISIONS P4-04: pass ≤ threshold, review ≤ 2 × threshold, fail otherwise. */
export function parityStatus(mismatchPct: number, thresholdPct: number): ParityStatus {
  if (mismatchPct <= thresholdPct) return "pass";
  return mismatchPct <= thresholdPct * 2 ? "review" : "fail";
}

/** A top-level block of the original page (`.page.active > *`), as listed in a manifest. */
export type OriginalBlock = {
  readonly id: string | null;
  readonly className: string;
};

/**
 * `:not(#a):not(#b)…` for every block the original gives an id. Blocks matched by id must not also
 * take an occurrence of their class (renovation's `section.ks#ba` renders as `[data-parity=ks]#ba`).
 */
export function notMatchedByIdSuffix(blocks: readonly OriginalBlock[]): string {
  return blocks.flatMap((block) => (block.id ? [`:not(#${block.id})`] : [])).join("");
}

/**
 * The new-site selector for an original block (DECISIONS P5-01): its id; the hero → `[data-hero]`;
 * the footer → `[data-parity=footer]`; otherwise `[data-parity="<first class>"]` (the n-th block
 * sharing a class matches the n-th element, see `parity.mts`). Null for a block with neither.
 */
export function blockSelector(block: OriginalBlock, notMatchedById = ""): string | null {
  if (block.id) return `#${block.id}`;
  if (/\bhero\b/.test(block.className)) return "[data-hero]";
  if (/\bftw\b/.test(block.className)) return "[data-parity=footer]";
  const first = block.className.split(/\s+/).find(Boolean);
  return first ? `[data-parity="${first}"]${notMatchedById}` : null;
}

/** File-name stem of the n-th (0-based) captured block: `03-home-about`. */
export function blockFileStem(index: number, block: OriginalBlock & { readonly tag: string }) {
  const label = block.id ?? block.className.split(/\s+/).find(Boolean) ?? block.tag;
  return `${String(index + 1).padStart(2, "0")}-${slug(label)}`;
}

export function slug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "block"
  );
}

/** Computed-style properties as camelCase keys: `font-size, lineHeight` → `fontSize, lineHeight`. */
export function parseProps(list: string | undefined, fallback: readonly string[]): string[] {
  const props = splitList(list).map((prop) =>
    prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
  );
  return props.length > 0 ? props : [...fallback];
}

/** `{a: 1, b: 2}` vs `{a: 1, b: 3}` → `{b: [2, 3]}`: the properties whose values differ. */
export function diffRecords(
  left: Readonly<Record<string, unknown>>,
  right: Readonly<Record<string, unknown>>,
): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {};
  for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
    if (JSON.stringify(left[key]) !== JSON.stringify(right[key]))
      out[key] = [left[key], right[key]];
  }
  return out;
}
