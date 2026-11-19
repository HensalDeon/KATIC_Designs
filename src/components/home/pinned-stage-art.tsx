import { stageArt, type StageIndex } from "@/lib/art";
import { cn } from "@/lib/cn";

/*
 * The home strip draws the stage art with its own look (`#p-home .stg .s .iso`), not the
 * `.ksteps` one of `IsoArt`: lines #eccbb6 at .55 opacity (1 on the current stage), drawn on
 * (1.6s) when the stage gets `.on`, dashed construction lines appearing with them, lit windows
 * always at .55, and a dim orange glow that brightens on the current stage.
 *
 * States come from the stage `<li>` (`data-current`, `data-on`, set by `StagesTrack`) and only
 * apply while the strip is pinned; unpinned (below 1100px or reduced motion) every drawing is
 * complete, like the original `.stg:not(.pinned)`.
 */

const BOX = cn(
  "relative mt-40 h-200 w-292 overflow-hidden [transition:background_.6s]",
  "bg-[radial-gradient(ellipse_60%_70%_at_50%_72%,rgba(120,45,18,.3),rgba(0,0,0,0)_72%)]",
  "lg:motion-safe:in-data-current:bg-[radial-gradient(ellipse_62%_75%_at_50%_72%,rgba(150,58,22,.55),rgba(0,0,0,0)_72%)]",
);

const LINE = cn(
  "stroke-[#eccbb6] opacity-55 [transition:stroke-dashoffset_1.6s_var(--ease-draw),opacity_.5s]",
  "[stroke-dashoffset:0] lg:motion-safe:[stroke-dashoffset:1] lg:motion-safe:in-data-on:[stroke-dashoffset:0]",
  "lg:motion-safe:in-data-current:opacity-100",
);

const SOLID = "[stroke-dasharray:1_1]";
const DASHED =
  "[stroke-dasharray:.04_.04] lg:motion-safe:[stroke-dasharray:1_1] lg:motion-safe:in-data-on:[stroke-dasharray:.04_.04]";

/** Isometric drawing of one home stage (`.s .art .iso`), rendered on the server. */
export function PinnedStageArt({ stage }: { stage: StageIndex }) {
  const art = stageArt(stage);
  return (
    <div aria-hidden data-stage-art={stage} className={BOX}>
      <svg
        viewBox={art.viewBox}
        preserveAspectRatio={art.preserveAspectRatio}
        aria-hidden
        fill="none"
        strokeWidth={1.1}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="absolute inset-0 size-full"
      >
        {art.lit.map((points) => (
          <polygon key={points} points={points} className="fill-[#f0b48e] opacity-55" />
        ))}
        {art.paths.map((path, index) => (
          <path
            // Paths can repeat (shared edges), so the index is part of the key.
            key={index}
            d={path.d}
            pathLength={1}
            className={cn(LINE, path.dashed ? DASHED : SOLID)}
          />
        ))}
      </svg>
    </div>
  );
}
