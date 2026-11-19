import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef } from "react";

import { DrawOn } from "@/components/art/draw-on";
import { IsoArt } from "@/components/art/iso-art";
import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { type IconName, pickIcons } from "@/lib/art";
import { cn } from "@/lib/cn";

export type FeatureGridItem = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
  /**
   * Isometric 3D line icon (`.ic3`). Picked from the title like the original (unique per grid);
   * set this only to override the pick.
   */
  readonly artIcon?: IconName;
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

export type FeatureGridProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  readonly columns: 3 | 4 | 5;
  readonly items: readonly FeatureGridItem[];
  /** Extra classes for each tile. */
  readonly itemClassName?: string;
};

/**
 * Feature tiles (`.kfeat`) rendered inside a `ContentSection`: bordered cards with an isometric
 * 3D icon (`IsoArt`, drawn on with a 140ms stagger once 20% of the grid is visible), a small
 * orange line icon, a title and a short text. 3, 4 or 5 columns on the canvas, 2 below 1100px, 1
 * on phones. The border turns orange and the 3D icon lifts on hover. `className` and the
 * remaining props go to the grid root; tiles carry `data-feature`.
 */
export function FeatureGrid({
  columns,
  items,
  className,
  itemClassName,
  ...props
}: FeatureGridProps) {
  const picked = pickIcons(items.map((item) => item.title));

  return (
    <DrawOn
      threshold={0.2}
      stagger={140}
      className={cn(gridVariants({ columns }), className)}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={item.title}
          data-feature
          className={cn(
            "group/feature group/iso-tile relative overflow-hidden border border-[#e3dfd7] bg-surface px-24 pt-22 pb-24 transition-[border-color] duration-200 hover:border-brand",
            "in-data-[tone=dark]:border-[#262626] in-data-[tone=dark]:bg-[#0c0c0c]",
            "max-lg:px-28 max-lg:pt-30 max-lg:pb-32",
            itemClassName,
          )}
        >
          <IsoArt
            kind="icon"
            name={item.artIcon ?? picked[index] ?? "layers"}
            order={index}
            className={columns === 5 ? "h-120" : undefined}
          />
          <span className="block h-34 text-brand">
            <ServiceIcon name={item.icon} size={28} />
          </span>
          <h3 className="mt-10 font-sans text-[22px] leading-[1.3] font-normal max-lg:mt-16">
            {item.title}
          </h3>
          <p className="mt-12 font-sans text-[13px] leading-[1.75] text-fg-body">{item.text}</p>
        </div>
      ))}
    </DrawOn>
  );
}
