import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { SectionHeader, type SectionHeaderProps } from "./section-header";

export type PlantSpec = {
  readonly asset: Parameters<typeof Plant>[0]["asset"];
  readonly corner: Parameters<typeof Plant>[0]["corner"];
  /** Width on the 1440 canvas (`--w`); phones render 58%. */
  readonly width: number;
};

type ContentSectionProps = Omit<ComponentPropsWithoutRef<"section">, "children" | "className"> & {
  readonly tone: Tone;
  readonly id?: string;
  /** Omit for sections without the standard `.kh` header. */
  readonly header?: SectionHeaderProps;
  /** Decorative plant behind the content (`.pp-host`). */
  readonly plant?: PlantSpec;
  readonly className?: string;
  /** Classes for the body wrapper (`.kbody`, 60px under the header). */
  readonly bodyClassName?: string;
  readonly children?: ReactNode;
};

/** Phones render plants at 58% (`Plant`). */
const PHONE_PLANT_SCALE = 0.58;

/**
 * Room the original gives a plant on phones (≤860px, JS 5285–5293): the section's padding grows
 * by 95% of the plant's height at a bottom corner, 90% at a top corner, so the plant sits beside
 * the content instead of over it.
 */
export function phonePlantRoom(plant: PlantSpec): { style: CSSProperties; className: string } {
  const { width, height } = media[plant.asset].image;
  const top = plant.corner.startsWith("top");
  const room = plant.width * PHONE_PLANT_SCALE * (height / width) * (top ? 0.9 : 0.95);
  return {
    style: { "--plant-room": `${room.toFixed(2)}px` } as CSSProperties,
    className: top
      ? "max-md:pt-[calc(80px+var(--plant-room))]"
      : "max-md:pb-[calc(80px+var(--plant-room))]",
  };
}

/**
 * The standard content section of inner pages (`.ks`): tone, one-screen rhythm on the canvas,
 * `SectionHeader`, then the body block 60px below. Body blocks (`SplitFeature`, `FeatureGrid`,
 * `CardGrid`, …) render inside `children` and read the tone from `data-tone`.
 */
export function ContentSection({
  tone,
  id,
  header,
  plant,
  className,
  bodyClassName,
  children,
  style,
  ...sectionProps
}: ContentSectionProps) {
  const room = plant ? phonePlantRoom(plant) : undefined;
  return (
    <Section
      tone={tone}
      id={id}
      className={cn(plant && "isolate", room?.className, className)}
      style={room ? { ...room.style, ...style } : style}
      {...sectionProps}
    >
      {plant ? <Plant {...plant} behind /> : null}
      <Container>
        {header ? <SectionHeader {...header} /> : null}
        {children ? <div className={cn(header && "mt-60", bodyClassName)}>{children}</div> : null}
      </Container>
    </Section>
  );
}
