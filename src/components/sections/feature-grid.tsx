import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { cn } from "@/lib/cn";

export type FeatureGridItem = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
  /**
   * Isometric 3D line icon for this tile (the original's `.ic3`), e.g. a server-rendered SVG from
   * the art engine. It is stretched over the slot; the slot is rendered even when this is empty.
   */
  readonly art?: ReactNode;
};

/** The original sets `grid-template-columns: repeat(N, 1fr)` inline; 5 is used by divisions. */
const gridVariants = cva(
  "grid gap-14 max-lg:grid-cols-[repeat(2,minmax(0,1fr))] max-lg:gap-18 max-md:grid-cols-[minmax(0,1fr)]",
  {
    variants: {
      columns: {
        3: "grid-cols-[repeat(3,1fr)]",
        4: "grid-cols-[repeat(4,1fr)]",
        5: "grid-cols-[repeat(5,1fr)]",
      },
    },
  },
);

/**
 * Art slot (`.kfeat .ic3`): 150px tall (120px in 5-column grids), bleeding 10px past the tile
 * padding, with the warm glow behind the drawing. On black the glow strengthens and the drawing
 * lifts on hover; on white the glow stays put (the original's `.onlight` rule wins there).
 */
const artSlotVariants = cva(
  [
    "relative -mx-10 -mt-8 mb-14",
    "bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(232,98,44,0.08),rgba(255,255,255,0)_72%)]",
    "in-data-[tone=dark]:bg-[radial-gradient(ellipse_55%_70%_at_50%_70%,rgba(150,58,22,0.38),rgba(0,0,0,0)_72%)]",
    "in-data-[tone=dark]:group-hover/feature:bg-[radial-gradient(ellipse_60%_76%_at_50%_70%,rgba(200,76,28,0.62),rgba(0,0,0,0)_74%)]",
    "transition-[background] duration-500",
    "*:absolute *:inset-0 *:size-full *:transition-transform *:duration-500 *:ease-out-k group-hover/feature:*:-translate-y-4",
  ],
  {
    variants: {
      columns: { 3: "h-150", 4: "h-150", 5: "h-120" },
    },
  },
);

export type FeatureGridProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  readonly columns: 3 | 4 | 5;
  readonly items: readonly FeatureGridItem[];
  /** Extra classes for each tile (e.g. draw-on state hooks). */
  readonly itemClassName?: string;
};

/**
 * Feature tiles (`.kfeat`) rendered inside a `ContentSection`: bordered cards with a 3D art slot,
 * a small orange line icon, a title and a short text. 3, 4 or 5 columns on the canvas, 2 below
 * 1100px, 1 on phones. The border turns orange on hover. `className` and the remaining props go
 * to the grid root, so a client wrapper can add the draw-on behaviour; tiles carry
 * `data-feature`, art slots `data-art-slot`.
 */
export function FeatureGrid({
  columns,
  items,
  className,
  itemClassName,
  ...props
}: FeatureGridProps) {
  return (
    <div className={cn(gridVariants({ columns }), className)} {...props}>
      {items.map((item) => (
        <div
          key={item.title}
          data-feature
          className={cn(
            "group/feature relative overflow-hidden border border-[#e3dfd7] bg-surface px-24 pt-22 pb-24 transition-[border-color] duration-200 hover:border-brand",
            "in-data-[tone=dark]:border-[#262626] in-data-[tone=dark]:bg-[#0c0c0c]",
            "max-lg:px-28 max-lg:pt-30 max-lg:pb-32",
            itemClassName,
          )}
        >
          <div data-art-slot className={artSlotVariants({ columns })}>
            {item.art}
          </div>
          <span className="block h-34 text-brand">
            <ServiceIcon name={item.icon} size={28} />
          </span>
          <h3 className="mt-10 font-sans text-[22px] leading-[1.3] font-normal max-lg:mt-16">
            {item.title}
          </h3>
          <p className="mt-12 font-sans text-[13px] leading-[1.75] text-fg-body">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
