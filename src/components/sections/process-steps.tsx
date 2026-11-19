import { cva } from "class-variance-authority";
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { cn } from "@/lib/cn";

export type ProcessStep = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
  /**
   * Isometric stage drawing for this step (the original's `.art3`), e.g. a server-rendered SVG
   * from the art engine. It is stretched over the slot; the slot is rendered even when empty.
   */
  readonly art?: ReactNode;
};

/**
 * Art slot (`.ksteps.k3d .art3`): 170px tall, 120px in dense rows, with the warm glow that
 * strengthens on hover. White sections get the paler glow of the original's `.lt`/`.onlight`.
 */
const artSlotVariants = cva(
  [
    "relative mb-20 overflow-hidden transition-[background] duration-500",
    "bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(232,98,44,0.1),rgba(255,255,255,0)_72%)]",
    "group-hover/step:bg-[radial-gradient(ellipse_66%_78%_at_50%_72%,rgba(232,98,44,0.18),rgba(255,255,255,0)_74%)]",
    "in-data-[tone=dark]:bg-[radial-gradient(ellipse_62%_72%_at_50%_72%,rgba(150,58,22,0.42),rgba(0,0,0,0)_72%)]",
    "in-data-[tone=dark]:group-hover/step:bg-[radial-gradient(ellipse_66%_78%_at_50%_72%,rgba(190,72,26,0.6),rgba(0,0,0,0)_74%)]",
    "*:absolute *:inset-0 *:size-full",
  ],
  { variants: { dense: { true: "h-120", false: "h-170" } } },
);

export type ProcessStepsProps = Omit<ComponentPropsWithoutRef<"ol">, "children"> & {
  readonly steps: readonly ProcessStep[];
  /** Grid columns on the canvas; defaults to the number of steps (the original uses 3–8). */
  readonly columns?: number;
};

/**
 * Process timeline (`.ksteps.k3d`) rendered inside a `ContentSection`: one column per step on the
 * canvas, each with an art slot, a small orange line icon, an uppercase Jost title and a short
 * text. Rows of 6 or more steps are dense (22px titles, 120px art). 2 columns with a 44px row gap
 * below 1100px, 1 on phones. Headings are #111 and texts #666 on white (the original's `.lt`).
 * `className` and the remaining props (e.g. `id` for deep links) go to the list; steps carry
 * `data-step`, art slots `data-art-slot` for the draw-on behaviour.
 */
export function ProcessSteps({ steps, columns, className, style, ...props }: ProcessStepsProps) {
  const count = columns ?? steps.length;
  const dense = count >= 6;

  return (
    <ol
      className={cn(
        "grid grid-cols-[repeat(var(--steps),1fr)] gap-28 max-lg:grid-cols-[repeat(2,minmax(0,1fr))] max-lg:gap-y-44 max-md:grid-cols-[minmax(0,1fr)]",
        className,
      )}
      style={{ ...style, "--steps": count } as CSSProperties}
      {...props}
    >
      {steps.map((step) => (
        <li key={step.title} data-step className="group/step relative">
          <div data-art-slot className={artSlotVariants({ dense })}>
            {step.art}
          </div>
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
  );
}
