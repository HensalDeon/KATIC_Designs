/**
 * Isometric line art: the seven stage drawings (`.ksteps .art3`) and the feature-tile icons
 * (`.kfeat .ic3`) of the original site, rendered on the server from `@/lib/art` (decision D8).
 *
 * Usage
 * ```tsx
 * // Process row: one stage drawing per step, picked from the titles like the original.
 * const stages = pickStages(steps.map((s) => s.title));
 * <DrawOn threshold={0.25} stagger={220} className="grid …">
 *   {steps.map((s, i) => (
 *     <div key={s.title} className="group/iso-tile">
 *       <IsoArt kind="stage" index={stages[i] ?? 0} order={i} />
 *       <h3>{s.title}</h3>
 *     </div>
 *   ))}
 * </DrawOn>
 *
 * // Feature grid: unique icon per tile (fresh `used` set per grid).
 * const icons = pickIcons(tiles.map((t) => t.title));
 * <DrawOn threshold={0.2} stagger={140} className="grid …">
 *   {tiles.map((t, i) => (
 *     <div key={t.title} className="group/iso-tile relative overflow-hidden …">
 *       <IsoArt kind="icon" name={icons[i] ?? "layers"} order={i} />
 *       …
 *     </div>
 *   ))}
 * </DrawOn>
 * ```
 *
 * Contract with the section
 * - Tone: colours follow the nearest `data-tone` ancestor (`<Section tone>` sets it). Dark is the
 *   default; `light` switches to the original's `.onlight` look (black #111 lines at 90%, dashed
 *   construction lines visible from the start, orange lit windows), which, like the original's
 *   `!important` rules, also cancels the hover brightening. Opposite tones nested inside each other
 *   are not supported (every section is pure white or black, D3).
 * - Draw-on: lines are hidden (`stroke-dasharray:1 1; stroke-dashoffset:1`) until any ancestor
 *   has `data-drawn` (`<DrawOn>` sets it once it is in view), or pass `drawn` to render the
 *   finished drawing. Timings are the original's: stage lines 1.8s / icon lines 1.6s
 *   `--ease-draw`; dashed lines fade 1s after .8s (stages) / .7s (icons); lit windows fade 1s
 *   after 1.2s.
 * - Stagger: `order={i}` × `DrawOn stagger` (ms) delays this drawing, reproducing the original's
 *   per-tile `setTimeout(i*220)` (steps) and `i*140` (feature tiles).
 * - Hover: give the tile (`.s` / `.f`) the class `group/iso-tile`. Hovering it intensifies the glow
 *   and brings the solid lines to full opacity (dark tone); icons also lift 4px
 *   (`.kfeat .f:hover .ic3 svg`).
 * - Size: the box defaults to the original's `.art3` (170px tall, 20px below) and `.ic3` (150px,
 *   `margin:-8px -10px 14px`). Override with `className`, e.g. `h-120` for rows of 6+ steps
 *   (`repeat(6|8`) and 5-column feature grids.
 *
 * Differences from the original
 * - The never-visible `<defs><linearGradient id="kg">` and `.sh` shadow ellipse are not rendered
 *   (every rule that styles the lines overrides `url(#kg)`, and `.sh` is `display:none`), which
 *   removes the duplicate `id="kg"` (KI-A18).
 * - Tone comes from `data-tone` instead of the runtime luminance check `markLight()` (E32).
 * - Under `prefers-reduced-motion` the drawing appears at once (no transition delays either).
 */
import type { CSSProperties } from "react";

import { type ArtDrawing, iconArt, type IconName, stageArt } from "@/lib/art";
import { cn } from "@/lib/cn";

type IsoArtSource = { kind: "stage"; index: number } | { kind: "icon"; name: IconName };

export type IsoArtProps = IsoArtSource & {
  /** Classes for the art box (size, margins). */
  className?: string | undefined;
  /** Position of the tile in its `DrawOn` group; multiplies `DrawOn`'s `stagger`. */
  order?: number | undefined;
  /** Render fully drawn, without waiting for a `DrawOn` ancestor. */
  drawn?: boolean | undefined;
};

/* The light-tone overrides are `!important`, mirroring the original's `.onlight` rules. */

const BOX = {
  stage: cn(
    "relative mb-20 h-170 overflow-hidden transition-[background] duration-500",
    "bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(150,58,22,.42),rgba(0,0,0,0)_72%)]",
    "group-hover/iso-tile:bg-[radial-gradient(ellipse_66%_78%_at_50%_72%,rgba(190,72,26,.6),rgba(0,0,0,0)_74%)]",
    "in-data-[tone=light]:bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(232,98,44,.1),rgba(255,255,255,0)_72%)]!",
    "in-data-[tone=light]:group-hover/iso-tile:bg-[radial-gradient(ellipse_66%_78%_at_50%_72%,rgba(232,98,44,.18),rgba(255,255,255,0)_74%)]!",
  ),
  icon: cn(
    "relative -mx-10 -mt-8 mb-14 h-150 transition-[background] duration-500",
    "bg-[radial-gradient(ellipse_55%_70%_at_50%_70%,rgba(150,58,22,.38),rgba(0,0,0,0)_72%)]",
    "group-hover/iso-tile:bg-[radial-gradient(ellipse_60%_76%_at_50%_70%,rgba(200,76,28,.62),rgba(0,0,0,0)_74%)]",
    "in-data-[tone=light]:bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(232,98,44,.08),rgba(255,255,255,0)_72%)]!",
  ),
} as const;

const SVG = {
  stage: "absolute inset-0 size-full",
  icon: "absolute inset-0 size-full transition-transform duration-500 ease-out-k group-hover/iso-tile:-translate-y-4",
} as const;

const STROKE_WIDTH = { stage: 1.1, icon: 1.05 } as const;

/** Shared by every line: colour per tone, reduced motion. */
const LINE =
  "stroke-[#eccbb6] in-data-[tone=light]:stroke-ink-2! motion-reduce:[transition-delay:0s]";

/**
 * `.ln` (solid, drawn on) and `.ln.dsh` (dashed, faded in) per kind. Hover brightens the solid
 * lines only: in the original the drawn dashed lines keep their opacity (their `.drawn` rule is
 * more specific than the hover rule).
 */
const PATH = {
  stage: {
    solid: `${LINE} opacity-85 group-hover/iso-tile:opacity-100 [stroke-dasharray:1_1] [stroke-dashoffset:1] [transition:stroke-dashoffset_1.8s_var(--ease-draw)_var(--iso-delay,0s),opacity_.4s] in-data-drawn:[stroke-dashoffset:0] in-data-[tone=light]:opacity-90!`,
    dashed: `${LINE} opacity-0 [stroke-dasharray:.04_.04] [transition:opacity_1s_calc(.8s_+_var(--iso-delay,0s))] in-data-drawn:opacity-85 in-data-[tone=light]:opacity-55!`,
  },
  icon: {
    solid: `${LINE} opacity-80 group-hover/iso-tile:opacity-100 [stroke-dasharray:1_1] [stroke-dashoffset:1] [transition:stroke-dashoffset_1.6s_var(--ease-draw)_var(--iso-delay,0s),opacity_.4s] in-data-drawn:[stroke-dashoffset:0] in-data-[tone=light]:opacity-90!`,
    dashed: `${LINE} opacity-0 [stroke-dasharray:.035_.035] [transition:opacity_1s_calc(.7s_+_var(--iso-delay,0s))] in-data-drawn:opacity-70 in-data-[tone=light]:opacity-90!`,
  },
} as const;

/** `.lit` window polygons (stages only). */
const LIT =
  "fill-[#f0b48e] opacity-0 [transition:opacity_1s_calc(1.2s_+_var(--iso-delay,0s))] in-data-drawn:opacity-55 in-data-[tone=light]:fill-brand! in-data-[tone=light]:in-data-drawn:opacity-25! motion-reduce:[transition-delay:0s]";

function drawingFor(source: IsoArtSource): ArtDrawing {
  return source.kind === "stage" ? stageArt(source.index) : iconArt(source.name);
}

/** Server-rendered isometric line drawing (stage or feature icon). See the file header. */
export function IsoArt({ className, order, drawn = false, ...source }: IsoArtProps) {
  const { kind } = source;
  const art = drawingFor(source);
  const style = order === undefined ? undefined : ({ "--iso-order": order } as CSSProperties);

  return (
    <div
      aria-hidden
      data-iso-art={kind}
      data-drawn={drawn ? "" : undefined}
      style={style}
      className={cn(
        "[--iso-delay:calc(var(--iso-order,0)*var(--draw-stagger,0ms))]",
        BOX[kind],
        className,
      )}
    >
      <svg
        viewBox={art.viewBox}
        preserveAspectRatio={art.preserveAspectRatio}
        aria-hidden
        fill="none"
        strokeWidth={STROKE_WIDTH[kind]}
        strokeLinejoin="round"
        strokeLinecap="round"
        className={SVG[kind]}
      >
        {art.lit.map((points) => (
          <polygon key={points} points={points} className={LIT} />
        ))}
        {art.paths.map((p, i) => (
          <path
            // Paths can repeat (e.g. shared edges), so the index is part of the key.
            key={i}
            d={p.d}
            pathLength={1}
            className={p.dashed ? PATH[kind].dashed : PATH[kind].solid}
          />
        ))}
      </svg>
    </div>
  );
}
