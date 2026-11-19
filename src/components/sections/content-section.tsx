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

/** Phones render plants at 58% (`Plant`); the host reserves 95% of that height below content. */
const PHONE_PLANT_SCALE = 0.58;
const PLANT_RESERVE = 0.95;

/**
 * `--plant-reserve`: the extra bottom padding a plant's host gets on phones, so the plant never
 * covers the content (original JS 5285–5293, done statically, KI-X06). Hosts add it with
 * `max-md:pb-[calc(80px+var(--plant-reserve))]`.
 */
export function plantReserveStyle(plant: PlantSpec): CSSProperties {
  const { width, height } = media[plant.asset].image;
  const reserve = plant.width * PHONE_PLANT_SCALE * (height / width) * PLANT_RESERVE;
  return { "--plant-reserve": `${reserve.toFixed(2)}px` } as CSSProperties;
}

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
  return (
    <Section
      tone={tone}
      id={id}
      style={plant ? { ...plantReserveStyle(plant), ...style } : style}
      className={cn(plant && "isolate max-md:pb-[calc(80px+var(--plant-reserve))]", className)}
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
