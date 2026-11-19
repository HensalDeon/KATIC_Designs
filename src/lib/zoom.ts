/**
 * Desktop canvas scaling (decision D1).
 *
 * The original site is authored on a fixed 1440px canvas. From 1100px up, the whole page is
 * scaled with CSS `zoom` by `clientWidth / 1440`, and `--svh` expresses one viewport height in
 * canvas pixels so "one screen tall" sections stay exactly one screen after zooming.
 *
 * The same maths runs in three places, kept in sync by this module:
 *  - `computeZoom` / `computeSvh` (tests, client code that needs the factor),
 *  - `ZOOM_BOOTSTRAP_SCRIPT` (inline in <head>, runs before first paint),
 *  - the CSS fallback in globals.css (keep `ZOOM_MIN_WIDTH` = `--breakpoint-lg`).
 */

/** Width of the design canvas in px. */
export const DESIGN_WIDTH = 1440;

/** Viewport width (px) from which the canvas is zoomed. Matches `--breakpoint-lg`. */
export const ZOOM_MIN_WIDTH = 1100;

/** Zoom factor for a viewport `clientWidth` (scrollbar excluded), rounded like the original (4 dp). */
export function computeZoom(clientWidth: number): number {
  if (clientWidth < ZOOM_MIN_WIDTH) return 1;
  return Number((clientWidth / DESIGN_WIDTH).toFixed(4));
}

/** One viewport height expressed in canvas px (1 dp), for `min-height: var(--svh)`. */
export function computeSvh(innerHeight: number, zoom: number): number {
  return Number((innerHeight / zoom).toFixed(1));
}

/**
 * Inline <head> script. Sets `--z` and `--svh` on <html> before first paint and keeps them in sync
 * on resize and when a scrollbar appears or disappears (ResizeObserver on the root element).
 * Plain ES5 with no dependencies, so it can be inlined verbatim.
 */
export const ZOOM_BOOTSTRAP_SCRIPT = `(function(){var d=document.documentElement;function s(){var w=d.clientWidth,z=w>=${ZOOM_MIN_WIDTH}?+(w/${DESIGN_WIDTH}).toFixed(4):1;d.style.setProperty("--z",String(z));d.style.setProperty("--svh",(innerHeight/z).toFixed(1)+"px")}s();addEventListener("resize",s);if(window.ResizeObserver)new ResizeObserver(s).observe(d)})();`;
