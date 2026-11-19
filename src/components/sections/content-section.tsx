import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { SectionHeader, type SectionHeaderProps } from "./section-header";

export type PlantSpec = {
  readonly asset: Parameters<typeof Plant>[0]["asset"];
  readonly corner: Parameters<typeof Plant>[0]["corner"];
  /** Width on the 1440 canvas (`--w`); phones render 58%. */
  readonly width: number;
};

type ContentSectionProps = {
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
}: ContentSectionProps) {
  return (
    <Section tone={tone} id={id} className={cn(plant && "isolate", className)}>
      {plant ? <Plant {...plant} behind /> : null}
      <Container>
        {header ? <SectionHeader {...header} /> : null}
        {children ? <div className={cn(header && "mt-60", bodyClassName)}>{children}</div> : null}
      </Container>
    </Section>
  );
}
