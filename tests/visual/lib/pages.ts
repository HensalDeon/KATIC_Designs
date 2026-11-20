/**
 * Playwright helpers shared by the parity tools, so the ORIGINAL and the NEW site are opened,
 * settled and captured the same way.
 *
 * "Settled" means: fonts loaded, every image of the page loaded and decoded, and the heights of the
 * page's top-level blocks (and of the document) unchanged across two checks 500ms apart.
 *
 * The original keeps adjusting itself after `load`, and the capture itself re-triggers those
 * adjustments, which is why the stored baseline is partly stale (KI-N11, KI-N12). So the original
 * is brought to one defined state, the one a visitor sees once the page has loaded:
 *
 * - `fit()` (≥1100px auto-zoom, KI-L13) and the runtime text fixers (`KATIC_VFIX`: contrast
 *   colours everywhere and, at ≤860px, `mtext()` raising every text below 11px to 11px) re-run on
 *   `resize`, and the fixers also 500ms after every scroll. Each run first resets what the last
 *   one did, then measures; but the reset starts a CSS transition from the applied value (zoom,
 *   font size), so the measurement still sees it and the run concludes nothing is needed. Every
 *   run therefore toggles: which state a section shows depends on how many scrolls and resizes
 *   (the walk, each element screenshot) preceded it, and `fit()`'s first run on `load` measures
 *   before lazy images and fonts have settled. So once the page has settled, both are run exactly
 *   once more with transitions off: the state a visitor gets after load, on the final content.
 * - Element screenshots taller than the viewport make Chromium re-layout the page, which fires
 *   `resize` (and `scroll`). After settling, the original's own listeners for both events are
 *   switched off (`freezeEvents`). Motion captures keep `scroll` (parallax needs it).
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

import { type Browser, type BrowserContext, type Page } from "@playwright/test";

import { ALL_VIEWPORTS, type ParityViewportId } from "../routes";
import { heightsStable, splitList } from "./options";

export type Site = "original" | "ours";

/** The original's top-level blocks; the new site's equivalents (page sections, then the footer). */
export const BLOCKS_SELECTOR: Readonly<Record<Site, string>> = {
  original: ".page.active > *",
  ours: "#main > *, .zoom-root > footer",
};

/** Fixed chrome hidden in section captures, per site (the baseline hides the original's). */
export const HIDE_CHROME_CSS: Readonly<Record<Site, string>> = {
  original: `.hdr, .rail.grail, .mcta, .toast, .skip-link, .kprog { visibility: hidden !important; }`,
  ours: `.zoom-root > header, nav[aria-label="Quick contact"], [role="status"], a[href="#main"] {
    visibility: hidden !important;
  }`,
};

/**
 * Motion captures also hide the hero videos (their frame depends on playback time), and the
 * rebuild's server-rendered poster `<picture>` under ours: the original has no poster element
 * there, so with its video hidden it shows black.
 */
export const HIDE_VIDEO_CSS = `video, [data-hero] picture { visibility: hidden !important; }`;

/**
 * Neutralises the original's `fit()` auto-zoom (KI-L13). At ≥1100px, `fit()` sets an inline
 * `style.zoom` (0.66–1) on the in-flow children of each `.page.active > section` / `.contact` whose
 * content is taller than one screen; it re-runs on load, resize, font load and hash change. An
 * `!important` stylesheet rule beats those inline values every time it re-runs. The original's
 * stylesheet sets no `zoom` on these elements (only `.page` itself is zoomed by `--z`).
 */
export const NO_FIT_CSS = `.page.active > section > *, .page.active > .contact > * { zoom: 1 !important; }`;

/** The original's `resize` / `scroll` listeners, recorded by `EVENT_GATE_SCRIPT`. */
type GatedWindow = Window & {
  __parityFrozen?: readonly string[];
  __parityListeners?: { type: string; listener: (event: Event) => void }[];
};

type KaticWindow = Window & {
  KATIC_LOADIMG?: (img: HTMLImageElement) => void;
  KATIC_VFIX?: () => void;
};

export function newParityContext(
  browser: Browser,
  viewportId: ParityViewportId,
  options: { motion?: boolean } = {},
): Promise<BrowserContext> {
  const viewport = ALL_VIEWPORTS[viewportId];
  return browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.touch,
    hasTouch: viewport.touch,
    reducedMotion: options.motion ? "no-preference" : "reduce",
  });
}

export type OpenOptions = {
  /**
   * Scroll through the page once so IntersectionObserver-driven content (lazy images, line-art
   * draw-on) settles. Off for motion captures, where each section must reveal when scrolled to.
   */
  readonly walk?: boolean;
  /** Extra stylesheets added after load (chrome hiding, `NO_FIT_CSS`, fix reverts). */
  readonly css?: readonly string[];
  /** Exposed as `<html data-parity-route>` so revert stylesheets can scope rules to a page. */
  readonly routeId?: string;
  /** Animations on: the original keeps its `scroll` listeners (parallax) and its fixers as-is. */
  readonly motion?: boolean;
  /**
   * Original only, `false`: undo its 11px small-text fixer (`mtext()`) instead of applying it, so
   * text keeps its authored 8.5–10.5px at ≤860px (pairs with `tests/visual/reverts/small-text.css`).
   */
  readonly textFix?: boolean;
};

/** Opens a page of either site and waits until it is settled (see the module comment). */
export async function openSettled(
  page: Page,
  url: string,
  site: Site,
  options: OpenOptions = {},
): Promise<void> {
  if (site === "original") await page.addInitScript(EVENT_GATE_SCRIPT);
  await page.goto(url, { waitUntil: "load", timeout: 120_000 });
  const scope = site === "original" ? ".page.active img" : "img";

  await page.evaluate(
    async ({ scope, walk }) => {
      await document.fonts.ready;
      const load = (window as KaticWindow).KATIC_LOADIMG;
      document.querySelectorAll<HTMLImageElement>(scope).forEach((img) => {
        img.loading = "eager"; // lazy images inside horizontal scrollers would never load otherwise
        if (img.dataset["img"]) load?.(img); // the original's own lazy loader
      });
      if (walk) {
        const step = Math.round(window.innerHeight * 0.6);
        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo({ top: y, behavior: "instant" });
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    },
    { scope, walk: options.walk ?? true },
  );

  await page
    .waitForFunction(
      (scope) => [...document.querySelectorAll<HTMLImageElement>(scope)].every((i) => i.complete),
      scope,
      { timeout: 30_000 },
    )
    .catch(() => console.warn(`  ! ${url}: some images did not finish loading`));
  await page.evaluate(
    (scope) =>
      Promise.all(
        [...document.querySelectorAll<HTMLImageElement>(scope)].map((img) =>
          img.decode().catch(() => undefined),
        ),
      ),
    scope,
  );

  if (options.routeId) {
    await page.evaluate((id) => {
      document.documentElement.dataset["parityRoute"] = id;
    }, options.routeId);
  }
  for (const content of options.css ?? []) {
    if (content) await page.addStyleTag({ content });
  }
  await waitForStableLayout(page, site);
  if (site === "original") {
    await settleOriginal(page, options.motion ?? false, options.textFix ?? true);
  }
}

/** Brings the loaded original to its after-load state and freezes it (see the module comment). */
async function settleOriginal(page: Page, motion: boolean, textFix: boolean): Promise<void> {
  await freezeEvents(page, motion ? ["resize"] : ["resize", "scroll"]);
  await page.evaluate(
    ({ motion, textFix }) => {
      const style = document.createElement("style");
      style.id = "parity-no-transitions";
      style.textContent = "*, *::before, *::after { transition: none !important; }";
      document.head.append(style);
      if (!motion) (window as KaticWindow).KATIC_VFIX?.(); // text fixers, applied once
      if (!textFix) {
        document.querySelectorAll<HTMLElement>("[data-mfs]").forEach((el) => {
          el.style.removeProperty("font-size");
          delete el.dataset["mfs"];
        });
      }
      // fit() alone, through its own resize listener (debounced 120ms; a no-op below 1100px).
      for (const { type, listener } of (window as GatedWindow).__parityListeners ?? []) {
        if (type === "resize" && String(listener).includes("setTimeout(fit")) {
          listener(new Event(type));
        }
      }
    },
    { motion, textFix },
  );
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.body.getBoundingClientRect(); // flush styles before transitions come back
    document.getElementById("parity-no-transitions")?.remove();
  });
  await waitForStableLayout(page, "original");
}

/**
 * Init script for the original: wraps every `resize` / `scroll` listener the page adds to `window`
 * or `document` so that it can be switched off later (`freezeEvents`). Stopping the events
 * themselves is not reliable: listeners on the target run in registration order in Chromium.
 * Plain JS in a string: tsx would wrap named functions in `__name()`, which the page lacks.
 */
const EVENT_GATE_SCRIPT = `(() => {
  const gated = { resize: new WeakMap(), scroll: new WeakMap() };
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  const wrap = (target, type, listener) => {
    if ((target !== window && target !== document) || !gated[type] || typeof listener !== "function") return listener;
    let wrapper = gated[type].get(listener);
    if (!wrapper) {
      wrapper = function (event) {
        if ((window.__parityFrozen || []).includes(type)) return undefined;
        return listener.call(this, event);
      };
      gated[type].set(listener, wrapper);
      (window.__parityListeners ||= []).push({ type, listener });
    }
    return wrapper;
  };
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    return add.call(this, type, wrap(this, type, listener), options);
  };
  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    return remove.call(this, type, wrap(this, type, listener), options);
  };
})();`;

/**
 * Switches off the original's own listeners for the given events (`fit()`, plant room, text
 * fixers, parallax), via the gate installed by `openSettled`.
 */
export function freezeEvents(page: Page, types: readonly string[]): Promise<void> {
  return page.evaluate((types) => {
    (window as GatedWindow).__parityFrozen = types;
  }, types);
}

/**
 * Resolves once the heights of the site's top-level blocks and of the document are unchanged
 * across two checks `intervalMs` apart (or warns after `timeoutMs` and carries on).
 */
export async function waitForStableLayout(
  page: Page,
  site: Site,
  { intervalMs = 500, timeoutMs = 15_000 } = {},
): Promise<void> {
  const measure = () =>
    page.evaluate(
      (selector) => [
        document.documentElement.scrollHeight,
        ...[...document.querySelectorAll(selector)].map((el) => el.getBoundingClientRect().height),
      ],
      BLOCKS_SELECTOR[site],
    );
  const deadline = Date.now() + timeoutMs;
  let previous: number[] | null = null;
  for (;;) {
    await page.waitForTimeout(intervalMs);
    const next = await measure();
    if (heightsStable(previous, next)) return;
    if (Date.now() > deadline) {
      console.warn(`  ! ${page.url()}: layout still changing after ${timeoutMs}ms`);
      return;
    }
    previous = next;
  }
}

/** A top-level block of the original page, in capture order (`.page.active > *`, in flow). */
export type OriginalBlockRecord = {
  readonly domIndex: number;
  readonly tag: string;
  readonly id: string | null;
  readonly className: string;
  readonly top: number;
  readonly height: number;
  readonly background: string;
};

/**
 * The original's in-flow, visible top-level blocks. Fixed or hidden blocks (e.g. the header on
 * pages without a hero) are not page flow and are skipped, like scripts and styles.
 */
export function listOriginalBlocks(page: Page): Promise<OriginalBlockRecord[]> {
  return page.evaluate((selector) => {
    const blocks: OriginalBlockRecord[] = [];
    document.querySelectorAll(selector).forEach((el, domIndex) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const inFlow =
        style.position !== "fixed" && style.visibility !== "hidden" && style.display !== "none";
      if (!inFlow || rect.height <= 0 || tag === "script" || tag === "style") return;
      blocks.push({
        domIndex,
        tag,
        id: el.id || null,
        className: typeof el.className === "string" ? el.className : "",
        top: Math.round(rect.top + window.scrollY),
        height: Math.round(rect.height),
        background: style.backgroundColor,
      });
    });
    return blocks;
  }, BLOCKS_SELECTOR.original);
}

/** Reads a comma-separated list of CSS files (relative to the cwd) into one stylesheet. */
export async function readCssList(list: string | undefined): Promise<string> {
  const files = splitList(list);
  const sheets = await Promise.all(
    files.map(async (file) => `/* ${file} */\n${await readFile(path.resolve(file), "utf8")}`),
  );
  return sheets.join("\n");
}

/** Scrolls an element's top to the top of the viewport (instantly, bypassing smooth scrolling). */
export async function scrollToTop(page: Page, selector: string, nth: number): Promise<boolean> {
  return page.evaluate(
    ({ selector, nth }) => {
      const el = document.querySelectorAll(selector)[nth];
      if (!el) return false;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
      return true;
    },
    { selector, nth },
  );
}
