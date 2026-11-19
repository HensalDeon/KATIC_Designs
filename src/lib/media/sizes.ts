/**
 * `sizes` helpers for `next/image`. Free of the media manifest, so client islands can use them
 * without shipping it.
 */

const CANVAS_WIDTH = 1440;

/** Viewport width (vw, rounded up) of something `canvasPx` wide on the zoomed 1440 canvas (D1). */
function canvasVw(canvasPx: number): string {
  return `${String(Math.ceil((canvasPx / CANVAS_WIDTH) * 100))}vw`;
}

/**
 * `sizes` for an image that is `canvasPx` wide on the 1440 desktop canvas (which scales with the
 * viewport at ≥1100px), `tablet` wide at ≤1099px and `phone` wide at ≤860px.
 */
export function canvasSizes(canvasPx: number, tablet: string, phone = "100vw"): string {
  return `(max-width: 860px) ${phone}, (max-width: 1099px) ${tablet}, ${canvasVw(canvasPx)}`;
}

/**
 * `sizes` for an image with a fixed width in canvas px: that width below 1100px (`phonePx` on
 * phones, when it differs) and the zoomed equivalent on the desktop canvas.
 */
export function fixedCanvasSizes(canvasPx: number, phonePx = canvasPx): string {
  const tablet = `${String(canvasPx)}px`;
  return phonePx === canvasPx
    ? `(max-width: 1099px) ${tablet}, ${canvasVw(canvasPx)}`
    : `(max-width: 860px) ${String(Math.ceil(phonePx))}px, (max-width: 1099px) ${tablet}, ${canvasVw(canvasPx)}`;
}
