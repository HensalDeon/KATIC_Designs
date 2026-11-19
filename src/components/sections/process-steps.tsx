import type { ComponentPropsWithoutRef, CSSProperties } from "react";

import { DrawOn } from "@/components/art/draw-on";
import { IsoArt } from "@/components/art/iso-art";
import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { pickStages, type StageIndex } from "@/lib/art";
import { cn } from "@/lib/cn";

export type ProcessStep = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
  /**
   * Isometric stage drawing (`.art3`, 0 = site … 6 = finished house). Picked from the title and
   * position like the original; set this only to override the pick.
   */
  readonly artStage?: StageIndex;
};

export type ProcessStepsProps = Omit<ComponentPropsWithoutRef<"ol">, "children"> & {
  readonly steps: readonly ProcessStep[];
  /** Grid columns on the canvas; defaults to the number of steps (the original uses 3–8). */
  readonly columns?: number;
};

/**
 * Process timeline (`.ksteps.k3d`) rendered inside a `ContentSection`: one column per step on the
 * canvas, each with an isometric stage drawing (`IsoArt`, drawn on with a 220ms stagger once 25%
 * of the row is visible), a small orange line icon, an uppercase Jost title and a short
 * text. Rows of 6 or more steps are dense (22px titles, 120px art). 2 columns below 1100px and 1
 * on phones, always 28px apart (the original's 44px row-gap rule is out-specified by `.k3d`, so
 * it never renders). Headings are #111 and texts #666 on white (the original's `.lt`).
 * `className` and the remaining props (e.g. `id` for deep links) go to the list; steps carry
 * `data-step`.
 */
export function ProcessSteps({ steps, columns, className, style, ...props }: ProcessStepsProps) {
  const count = columns ?? steps.length;
  const dense = count >= 6;
  const picked = pickStages(steps.map((step) => step.title));

  return (
    <DrawOn threshold={0.25} stagger={220}>
      <ol
        className={cn(
          "grid grid-cols-[repeat(var(--steps),1fr)] gap-28 max-lg:grid-cols-[repeat(2,minmax(0,1fr))] max-md:grid-cols-[minmax(0,1fr)]",
          className,
        )}
        style={{ ...style, "--steps": count } as CSSProperties}
        {...props}
      >
        {steps.map((step, index) => (
          <li key={step.title} data-step className="group/step group/iso-tile relative">
            <IsoArt
              kind="stage"
              index={step.artStage ?? picked[index] ?? 0}
              order={index}
              className={dense ? "h-120" : undefined}
            />
            <span className="block h-34 text-brand">
              <ServiceIcon name={step.icon} size={28} />
            </span>
            <h3
              className={cn(
                // Size before leading: tailwind-merge drops a leading-* that precedes a text-* size.
                dense ? "text-[22px]" : "text-[30px]",
                "mt-10 font-display leading-[1.05] font-medium tracking-[0.005em] text-fg uppercase",
              )}
            >
              {step.title}
            </h3>
            <p className="mt-10 font-display text-[14px] leading-[1.7] text-fg-body in-data-[tone=light]:text-[#666]">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </DrawOn>
  );
}
