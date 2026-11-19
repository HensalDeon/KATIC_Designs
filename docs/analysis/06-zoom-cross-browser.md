# F — CSS `zoom` cross-browser spike (decision D1, Phase 3)

Date: 2026-11-19. This spike follows up §1.2 and §7 item 17 of `01-global-design-system-and-engine.md` and the Phase 3
"cross-browser spike" in `MIGRATION_PLAN.md`. The question: are scroll geometry, sticky pinning, fixed elements, IO, anchors and
`--svh` correct inside `.zoom-root { zoom: var(--z) }` in every engine?

**Verdict: GO. Keep CSS `zoom` (D1).** Chromium and WebKit pass every check at every zoom factor, with differences of ≤1 px.
Firefox could not be run on this machine (see §5), so it needs a confirmation run, but nothing here depends on Firefox-specific behaviour.

## 1. Setup

| Item | Value |
|---|---|
| Engines | Playwright 1.65.1: Chromium 159.0.8154.6, WebKit 27.2. Firefox 159 (build 1572) installed but **would not launch** (§5). |
| Viewports | 1440×900 (z=1), 1100×700 (z=0.7639), 1920×1080 (z=1.3333), 2560×1440 (z=1.7778), `deviceScaleFactor: 1` |
| Test page | `reference/spikes/zoom/index.html` uses the app's exact bootstrap script (`ZOOM_BOOTSTRAP_SCRIPT`) and `@media (min-width:1100px){.zoom-root{zoom:var(--z)}}`. Canvas layout: fixed header (`top:18px; left/right:36px; h:62px`) inside the wrapper; `#intro` 1000 px containing a 100×100 box and a `translate(100px,50px)` box; `#tall` 3000 px containing a sticky stage `top:0; height:var(--svh)`; `#gap1` 1200 px containing the IO target (400 px tall at +600); `#anchor` (`scroll-margin-top:90px`); `#gap2` 600 px; `#svh` `min-height:var(--svh)`; `#after` 1500 px. |
| Method | `reference/spikes/zoom/measure.mjs [engines]` reads DOM metrics and also takes a **screenshot** at each step, checking pixel colours as ground truth for what is visible on screen (where the header and stage are, where the anchor lands, `svh` height, transform offset). Served with `python3 -m http.server 8765`. Raw output: `results-chromium-webkit.json`. |
| App smoke | `reference/spikes/zoom/app-smoke.mjs` ran against `ENABLE_STYLEGUIDE=1 pnpm build && pnpm start --port 3300`, `/styleguide`, at 1920×1080 and 1280×800. Output: `app-results-chromium-webkit.json` and dialog screenshots. |

`reference/` is git-ignored, so the scripts and results are not versioned. Copy them out if they need to be kept.

## 2. Results matrix

Chromium and WebKit returned **identical** numbers (to 1 px) for every check below. The few sub-pixel differences are noted.
In the matrix, "canvas px" means unzoomed CSS px and "visual px" means CSS px × z, i.e. viewport px.

| Check | 1440×900 z=1 | 1100×700 z=.7639 | 1920×1080 z=1.3333 | 2560×1440 z=1.7778 | Chromium | WebKit | Firefox |
|---|---|---|---|---|---|---|---|
| `getBoundingClientRect()` of 100×100 box | 100 | 76.38 | 133.33 | 177.77 | **visual px** | **visual px** | n/m |
| `offsetTop` / `offsetHeight` of `#tall` | 1000 / 3000 | 1000 / 3000 | 1000 / 3000 | 1000 / 3000 | **canvas px** | **canvas px**¹ | n/m |
| `getComputedStyle().height` (100px box) | 100px | 99.98px | 99.9986px | 99.99px | canvas px (layout-unit snapping) | same | n/m |
| `.zoom-root.scrollHeight` (canvas total) | 8500 | 8516 (WK 8517) | 8410 | 8410 | **canvas px** | canvas px | n/m |
| `documentElement.scrollHeight` vs canvas×z | 8500 = 8500 | 6506 ≈ 6505.7 | 11213 ≈ 11213.1 | 14951 ≈ 14951.3 | OK, visual | OK, visual | n/m |
| Progress A: rect, `-r.top/(r.height-innerHeight)`, at f=0 / .5 / 1 | 0 / .5 / 1 | .0001 / .5002 / 1.0003 | 0 / .4999 / .9999 | 0 / .5001 / 1 | **OK** | **OK**² | n/m |
| Progress B: raw offset, `(scrollY-offsetTop)/(offsetHeight-innerHeight)` | 0 / .5 / 1 | −.10 / .24 / .59 | .17 / .93 / 1.69 | .50 / 1.75 / 2.99 | **FAIL** at z≠1 | FAIL | n/m |
| Progress C: offset×z, `(scrollY-oT·z)/(oH·z-innerHeight)` | 0 / .5 / 1 | = A | = A | = A | OK | OK | n/m |
| Progress D: rect with canvas vh, `-r.top/(r.height-innerHeight/z)` | 0 / .5 / 1 | 0 / .58 / 1.16 | 0 / .46 / .92 | 0 / .43 / .86 | **FAIL** | FAIL | n/m |
| Sticky stage pinned (visible at rows 0…ih−1 for f∈[0,1]) | OK | OK | OK | OK | OK | OK | n/m |
| Sticky release at f=1.05: stage leaves by exactly 5 % of range | 105 px | 79 px | 146 px | 195 px | OK | OK | n/m |
| Fixed header visual top / height (expected 18z / 62z) | 18 / 62 | 14 / 47 (13.75) | 24 / 83 | 32 / 110 | OK, **offset scaled by z** | same | n/m |
| Fixed header unchanged after scrolling 2000 px | OK | OK | OK | OK | OK | OK | n/m |
| `min-height:var(--svh)` rect height vs innerHeight | 900 / 900 | 700.03 / 700 | 1079.97 / 1080 | 1440.02 / 1440 | OK | OK³ | n/m |
| `transform: translate(100px,50px)` visual offset | 100, 50 | 76.4, 38.2 | 133.3, 66.7 | 177.8, 88.9 | **scaled by z** | scaled by z | n/m |
| IO (`threshold [.12,.3]`, `rootMargin 0 0 -8% 0`): fires at scrollY (expected) for t=.12 | 3820 (3820) | 2908 (2906.6) | 5205 (5203.6) | 6940 (6938.4) | OK⁴ | OK⁴ | n/m |
| … t=.3 | 3892 (3892) | 2962 (2961.6) | 5301 (5299.6) | 7068 (7066.4) | OK | OK | n/m |
| IO `rootBounds.height` (expected 0.92 × innerHeight) | 828 | 644 | 994 | 1325 | % margin resolved vs real viewport | same | n/m |
| `scrollIntoView({block:'start'})`, `scroll-margin-top:90px`: target top lands at | 90 | 68.25 | 120.14 | 159.55 | **margin scaled (90·z)** | same | n/m |
| `location.hash = '#anchor'` lands at | 90 | 68.25 | 120.14 | 159.55 | same as above | same | n/m |
| `el.currentCSSZoom` available | 1 | 0.7639 | 1.3333 | 1.7778 | yes | yes | n/m |

n/m = not measured (§5).
¹ WebKit rounds `offsetWidth/Height` to integers from the snapped layout size: 99 instead of 100 at z=.7639. This is one more reason to avoid offset maths.
² WebKit truncates `scrollY` to an integer (763 for a requested 763.89), so values come out ±0.0006. Clamp it.
³ The 1 px white row at the top in WebKit's `svh` screenshot comes from the same `scrollY` truncation, not from `--svh`.
⁴ The IO sweep stepped 2 px, so a hit 1.4–1.6 px late is within step resolution.

### App smoke test (`/styleguide`, real build)

| Check | Chromium 1920×1080 | Chromium 1280×800 | WebKit 1920×1080 | WebKit 1280×800 | Firefox |
|---|---|---|---|---|---|
| `--z` / expected | 1.3333 / 1.3333 | 0.8889 / 0.8889 | 1.3333 / 1.3333 | 0.8889 / 0.8889 | n/m |
| `--svh` / expected | 810 / 810 | 900 / 900 | 810 / 810 | 900 / 900 | n/m |
| Header visual top (rect, hit-test) vs 18·z | 23.98, 23 vs 24.0 | 16.0, 15.5 vs 16.0 | 23.98, 23 vs 24.0 | 16.0, 15.5 vs 16.0 | n/m |
| Header height vs 62·z | 82.66 vs 82.66 | 55.11 vs 55.11 | same | same | n/m |
| After scrolling 60 px: `data-scrolled`, top vs 10·z | yes, 13.33 vs 13.33 | yes, 8.88 vs 8.89 | yes, 13.33 | yes, 8.88 | n/m |
| Start-a-Project dialog: outside zoom root, panel `currentCSSZoom` | yes, 1 | yes, 1 | yes, 1 | yes, 1 | n/m |
| Dialog panel centre vs viewport centre | 960,540 = 960,540 | 640,400 = 640,400 | same | same | n/m |
| Panel width (880 px, unscaled) | 880 | 880 | 880 | 880 | n/m |

## 3. The model (what the numbers say)

Both engines implement the **standardized** zoom model (Chrome 128+, and WebKit has the same behaviour):

- **Visual (viewport) px:** `getBoundingClientRect()`, IO entry rects and `rootBounds`, `scrollY`, `innerHeight`,
  `documentElement.scrollHeight`, `elementFromPoint`, `scrollTo` arguments.
- **Canvas (unzoomed CSS) px inside the zoom root:** `offsetTop/Left/Width/Height`, `clientWidth/Height`, `scrollHeight` of a
  zoomed element, `getComputedStyle()` lengths, and every CSS length you author (`top`, `translate`, `scroll-margin`, `height`).
  These are all multiplied by z on screen, including `position:fixed` offsets and transforms.
- Convert with z (`--z`, or `el.currentCSSZoom`, which also includes any nested `style.zoom` such as the original's `fit()`):
  visual = canvas × z.

The single rule: **never mix the two families in one expression without ×z or ÷z.** Every failure in the matrix (B, D) comes
from mixing them. The original site already follows this rule: its tick functions use rects with `vh = innerHeight`, and its
layout functions set CSS heights with `vh = innerHeight / z`.

## 4. Recommendations

### 4.1 `useScrollProgress`: use the rect-based formula (A)

It reads only visual-px values (`getBoundingClientRect`, `innerHeight`), so it never needs z, doesn't depend on the
`offsetParent` chain or integer rounding of offset*, and gives the right answer even when nested zoom is present.

```ts
// src/hooks/use-scroll-progress.ts (proposed)
import { type RefObject, useEffect, useState } from "react";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** 0 when the section's top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function sectionProgress(el: Element): number {
  const r = el.getBoundingClientRect(); // visual px in every engine, zoom already applied
  const vh = window.innerHeight; // visual px — NOT innerHeight / z
  return clamp01(-r.top / Math.max(1, r.height - vh));
}

/** Parallax centre offset: 0 when the box is centred, ±~0.5 at the edges (original pxTick). */
export function centerOffset(el: Element): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return (r.top + r.height / 2 - vh / 2) / (vh + r.height);
}

export function useScrollProgress(ref: RefObject<Element | null>, measure = sectionProgress) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      setP(measure(el));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, measure]);
  return p;
}
```

- **Section heights** are CSS values inside the zoom root, so they are in canvas px: `vhCanvas = innerHeight / z` (or simply
  `var(--svh)` in CSS). Showcase: `height: calc(var(--svh) * (1 + (n - 1) * 0.6))`. Stages: `vhCanvas + 1.25 * travel`, where
  `travel` comes from `offsetLeft/offsetWidth/clientWidth`. Those are all canvas px, which is consistent, and `translate3d(... px)`
  is canvas px too, so this mirrors the original as is. Recompute on resize, because `--z` changes.
- For hot paths, writing styles directly from the rAF callback (refs / CSS custom properties) is preferable to `setState` per
  frame. The formula is unchanged.
- If an offset-based variant is ever needed, use C: `(scrollY − offsetTopAbs·z) / (offsetHeight·z − innerHeight)`.

### 4.2 Sticky pinning inside zoom: safe

`position: sticky; top: 0; height: var(--svh)` pinned for the whole range and released at the correct point in both engines at
every z. No fallback is needed. Keep the original's existing non-pinned mode (≤1099 or `prefers-reduced-motion`) as the only
alternative path.

### 4.3 IntersectionObserver

- Thresholds are ratios, so they are zoom-invariant. `rootMargin` percentages resolve against the **real** viewport
  (`rootBounds.height = 0.92 × innerHeight`), so `'0px 0px -8% 0px'` triggers at exactly the same visual position as at z=1. Keep the
  original values (.12–.3, −8 %).
- Pixel `rootMargin` values are in viewport px and **not** scaled by z (by spec; not swept here). Prefer % margins. If px are
  unavoidable, compute `${Math.round(px * z)}px`.

### 4.4 Anchors / `scroll-margin-top` / programmatic scrolling

- `scroll-margin-top` authored inside the zoom root is scaled by z (90 → 68.25 / 120 / 160), exactly like the fixed header's
  `top` and height. So author it in **canvas px** against the canvas-px header: 18 + 62 + gap. It then stays correct at every z.
  No JS correction is needed for `scrollIntoView`, `location.hash` or `<Link href="#id">`.
- For a manual `scrollTo`, compute in visual px: `top = el.getBoundingClientRect().top + scrollY − offsetCanvas * z`.
  `html { scroll-behavior: smooth }` is on in the app, so pass `behavior: "instant"` when you need the result synchronously.
- For a document progress bar, use `scrollY / (documentElement.scrollHeight − innerHeight)`, which is all visual. Do **not** use
  `.zoom-root.scrollHeight`, which is in canvas px.

### 4.5 Fallbacks

- Chromium and WebKit need none.
- Firefox ≥126 should match (it shipped `zoom` against the same spec model), but this is **unverified here**. The rect-based
  formula and CSS-only pinning do not rely on any engine-specific offset behaviour, so the risk is low. If a Firefox run shows
  sticky or rect problems, the proposed fallback is to drop that engine to the non-pinned layout: gate the `pinned` behaviour
  in JS on a one-time probe (sticky stage rect at z≠1), not on UA sniffing. Do **not** switch to a `transform: scale()` canvas:
  a transformed ancestor breaks `position: fixed` (the header) and changes sticky containment, and it would need its own spike.
- Browsers without `zoom` (Firefox <126, effectively gone by 2026: ESR 128+ has it) would show the 1440 canvas unscaled.
  An optional guard is `@supports not (zoom: 1) { .zoom-root { max-width: 1440px; margin-inline: auto } }`.

## 5. Gaps and caveats

**Firefox was not measured.** The Playwright Firefox build (1572, Firefox 159) exits immediately on this Mac (macOS 27.0.1) with
`Could not find profile folder.` This happens both via Playwright and when run directly, with the sandbox off, with a `-profile`
dir in the scratchpad, and with `XRE_PROFILE_PATH` / `HOME` overrides. It looks like a build/OS incompatibility, not a project
problem. Stock Firefox over WebDriver BiDi (`_bidiFirefox`, channel `moz-firefox`) needs `/Applications/Firefox.app`, which is
not installed, and downloading it was not permitted in this session. To close the gap, use any one of:
- run `node reference/spikes/zoom/measure.mjs firefox` (with the page served on :8765) on Linux CI or a machine where Playwright
  Firefox launches;
- install Firefox.app and launch it with `require("@playwright/test")._bidiFirefox.launch({ channel: "moz-firefox" })`;
- open `reference/spikes/zoom/index.html` manually in Firefox at 1100 and 1920 wide and repeat the sticky, anchor and header
  checks visually.

Better still, turn the spike into a permanent e2e test (`tests/e2e/zoom-geometry.spec.ts`, with a Firefox project in
`playwright.config.ts`) so CI covers all three engines.

**Playwright WebKit ≠ Safari.** It is the WebKit engine without Safari's scrolling and compositing layer, and it ran headless
with no momentum scrolling and no overlay scrollbars. Re-check on real devices:
- macOS Safari (current and previous major) at 1440 and 1920 wide: trackpad momentum and rubber-band at the top/bottom (negative
  `scrollY` and sticky during bounce), pinned showcase and stages smoothness, parallax jitter.
- Safari page zoom (⌘+ / ⌘−) on top of CSS `zoom`: `clientWidth` changes and so does `--z`. Make sure the canvas re-fits and
  sticky sections recompute their height.
- **iPad Safari in landscape** (1180×820, 1366×1024 → z ≈ 0.82–0.95): this is the one touch device that gets the zoomed
  desktop canvas. Check touch momentum with pinning, URL-bar/toolbar resize events changing `innerHeight` (and `--svh`
  mid-scroll, which resizes pinned sections and can jump the scroll position), pinch-zoom (`visualViewport.scale ≠ 1`), and
  sticky header plus `backdrop-filter` rendering.
- iOS iPhone stays below 1100 px (z=1), so it is outside the zoom risk. Still sanity-check anchors and the dialog.
- IO timing during fast momentum scroll (reveals firing late), and scroll restoration on back/forward navigation with zoomed
  sections.

**Not covered:** nested `style.zoom` (the original's `fit()` E31 per-section zoom). Rect-based maths covers it automatically, and
`el.currentCSSZoom` gives the effective factor if conversion is needed. A one-line check during the `fit()` port is enough.
