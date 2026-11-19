/**
 * Pure scroll maths of the two pinned home sections (docs/analysis/01 §5 E20–E22,
 * docs/analysis/02 §1.4–1.5). Every length here is in **canvas px** (the unzoomed 1440 canvas):
 * card offsets, translations and section heights are CSS values inside the zoom root, so they are
 * scaled by the canvas zoom on screen like everything else. Progress values come from
 * `pinProgress` (viewport px), which is zoom-invariant (docs/analysis/06).
 */

/* ---------------------------------------------------------------------------------------------- */
/* Selected Works cover-flow (original `SHOWS` engine: `showLayout` / `showTick`)                  */
/* ---------------------------------------------------------------------------------------------- */

/** Horizontal distance between neighbouring cards (`sp`; the original uses 450 only on `.sig`). */
export const CARD_OFFSET = 640;
/** Cards one step or more away from the centre sit this much lower. */
export const CARD_DROP = 16;
/** Scale lost per step away from the centre … */
export const CARD_SCALE_STEP = 0.07;
/** … counted up to this many steps. */
export const CARD_SCALE_CAP = 1.5;
/** z-index of the centred card; each half step away costs one level. */
export const CARD_Z_BASE = 20;
/** A card closer than this to the centre position is "the" centred card (`.c0`, big shadow). */
export const CARD_CENTRE_RADIUS = 0.5;
/** Extra section height per card beyond the first, in screens. */
export const SHOWCASE_SCREENS_PER_CARD = 0.6;

/** Where one card sits in the cover-flow. */
export type CardPose = {
  /** translateX, canvas px. */
  readonly x: number;
  /** translateY, canvas px. */
  readonly y: number;
  readonly scale: number;
  /** Opacity of the black `.sc-shade` overlay (`--sh`): 0 at the centre, 1 one step away. */
  readonly shade: number;
  readonly zIndex: number;
  /** The centred card (`.c0`). */
  readonly centred: boolean;
};

/** Fractional index of the card at the centre: `p × (n − 1)`. */
export function showcasePosition(progress: number, count: number): number {
  return progress * Math.max(0, count - 1);
}

/** Pose of card `index` when the cover-flow is at `position` (original `showTick`). */
export function coverFlowPose(index: number, position: number, offset = CARD_OFFSET): CardPose {
  const d = index - position;
  const ad = Math.abs(d);
  return {
    x: d * offset,
    y: Math.min(ad, 1) * CARD_DROP,
    scale: 1 - Math.min(ad, CARD_SCALE_CAP) * CARD_SCALE_STEP,
    shade: Math.min(ad, 1),
    zIndex: CARD_Z_BASE - Math.round(ad * 2),
    centred: ad < CARD_CENTRE_RADIUS,
  };
}

/** Index of the centred card, or −1 when the position is exactly between two cards. */
export function centredCard(progress: number, count: number): number {
  const position = showcasePosition(progress, count);
  for (let index = 0; index < count; index++) {
    if (coverFlowPose(index, position).centred) return index;
  }
  return -1;
}

/** Pinned section height in canvas px: `vh × (1 + (n − 1) × 0.6)`, with vh = innerHeight / z. */
export function showcaseHeight(viewportHeight: number, count: number): number {
  return viewportHeight * (1 + Math.max(0, count - 1) * SHOWCASE_SCREENS_PER_CARD);
}

/** Rounds to 3 decimals and drops `-0`, so the CSS values stay short and stable. */
export function px3(value: number): number {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** CSS custom properties a card reads its pose from (see `pinned-showcase-stage.tsx`). */
export function cardPoseVars(pose: CardPose): Record<`--${string}`, string> {
  return {
    "--sc-x": `${String(px3(pose.x))}px`,
    "--sc-y": `${String(px3(pose.y))}px`,
    "--sc-s": String(px3(pose.scale)),
    "--sh": pose.shade.toFixed(3),
    "--sc-z": String(pose.zIndex),
  };
}

/* ---------------------------------------------------------------------------------------------- */
/* Seven stages horizontal strip (original `homeLayout` / `homeTick`)                             */
/* ---------------------------------------------------------------------------------------------- */

/** The row starts this far to the right of its column (`startX`). */
export const STAGE_START_X = 380;
/** Room left after the last stage at the end of the travel. */
export const STAGE_END_GAP = 110;
/** Scroll distance per px of horizontal travel. */
export const STAGE_SCROLL_FACTOR = 1.25;
/** `floor(p × n × 0.999)` keeps the last stage reachable without needing p > 1. */
const STAGE_ACTIVE_SCALE = 0.999;

/** Canvas layout of the strip, used for the server-rendered first paint. */
export const STAGE_WIDTH = 292;
export const STAGE_GAP = 96;
/** `.wrap` width on the 1440 canvas. */
export const STAGE_ROW_WIDTH = 1268;

/** Horizontal travel: `startX + max(0, lastStage.right − row.width + 110)` (canvas px). */
export function stageTravel(lastStageRight: number, rowWidth: number): number {
  return STAGE_START_X + Math.max(0, lastStageRight - rowWidth + STAGE_END_GAP);
}

/** Travel of `count` stages laid out at the canvas defaults (what the server renders). */
export function defaultStageTravel(count: number): number {
  const lastRight = count * STAGE_WIDTH + Math.max(0, count - 1) * STAGE_GAP;
  return stageTravel(lastRight, STAGE_ROW_WIDTH);
}

/** Pinned section height in canvas px: `vh + 1.25 × travel`. */
export function stagesHeight(viewportHeight: number, travel: number): number {
  return viewportHeight + travel * STAGE_SCROLL_FACTOR;
}

/** Row translateX at `progress` (canvas px): `startX − p × travel`. */
export function stageOffset(progress: number, travel: number): number {
  return STAGE_START_X - progress * travel;
}

/** The current stage (`.cur`). */
export function activeStage(progress: number, count: number): number {
  return Math.max(0, Math.min(count - 1, Math.floor(progress * count * STAGE_ACTIVE_SCALE)));
}

/**
 * Stages drawn so far (`.on`): every stage up to one past the furthest stage reached. The original
 * only ever adds the class, so scrolling back keeps the drawings.
 */
export function stageIsDrawn(index: number, furthestActive: number): boolean {
  return index <= furthestActive + 1;
}
