/** Phones render plants at 58% of their canvas width (`Plant`). */
export const PHONE_PLANT_SCALE = 0.58;

/** Share of a top-anchored plant's height the original reserves above the content on phones. */
export const TOP_PLANT_ROOM = 0.9;

/** Browsers lay out in 1/64px units; the original measured the plant's rendered height. */
const LAYOUT_UNIT = 64;

/** Floors to whole layout units (the epsilon absorbs float noise such as 200 × 0.58 = 115.999…). */
const toLayoutUnits = (px: number) => Math.floor(px * LAYOUT_UNIT + 1e-6) / LAYOUT_UNIT;

/**
 * Extra top padding (px) a section gives a plant hanging from its top edge on phones, so the
 * plant never covers the text: 90% of the plant's rendered height (original JS 5285–5293).
 * `size` is the plant image's intrinsic size, `canvasWidth` its width on the 1440 canvas.
 */
export function plantRoom(
  size: { readonly width: number; readonly height: number },
  canvasWidth: number,
): number {
  const width = toLayoutUnits(canvasWidth * PHONE_PLANT_SCALE);
  const height = toLayoutUnits(width * (size.height / size.width));
  return Math.round(height * TOP_PLANT_ROOM * 1000) / 1000;
}
