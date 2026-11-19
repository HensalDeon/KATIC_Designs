import { ServiceIcon } from "@/components/icons/service-icon";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { HOME_PROCESS, type HomeProcessContent } from "@/content/home/process";

import { PinnedStageArt } from "./pinned-stage-art";
import { StagesTrack } from "./pinned-stages-track";

export type PinnedStagesProps = {
  /** Kicker, title and stages (default: the home page's seven). */
  readonly content?: HomeProcessContent;
  /** Section id (deep links such as `/#home-process` from About and the FAQ). */
  readonly id?: string;
};

/**
 * Home "Seven stages" (`section.stg#home-process`; original `homeLayout` / `homeTick`,
 * docs/analysis/01 E22–E23, docs/analysis/02 §1.5). Always a black section.
 *
 * - **≥1100px, motion allowed:** the section is `vh + 1.25 × travel` tall and its stage sticks.
 *   The row of 292px stages (96px apart) translates from `+380px` to `380 − travel`, where
 *   `travel = 380 + max(0, lastStage.right − row.width + 110)` is measured in canvas px (1842 on
 *   the canvas). The current stage `floor(p × n × 0.999)` gets the brighter glow and full-opacity
 *   lines; stages up to one past the furthest reached draw on (1.6s) and stay drawn.
 * - **≥1100px, reduced motion:** a 4 + 3 grid with every drawing complete (KI-L04).
 * - **≤1099px:** a horizontal scroll-snap row (gap 96, 40 on phones), focusable and labelled
 *   (KI-A08), every drawing complete.
 * - Titles that would overflow their column are scaled down to fit (KI-L31).
 * - The original's `[data-stage]` "01"… counter has no markup, so nothing is rendered for it.
 *
 * Server component; the scroll-driven row is the client island `StagesTrack`.
 */
export function PinnedStages({ content = HOME_PROCESS, id = "home-process" }: PinnedStagesProps) {
  return (
    <StagesTrack
      id={id}
      label={content.title.join(" ")}
      header={
        <>
          <Kicker font="home" className="before:bg-[#d79f7c]">
            {content.kicker}
          </Kicker>
          <SectionTitle scale="home" className="mt-28">
            {content.title.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </SectionTitle>
        </>
      }
      stages={content.stages.map((stage) => ({
        key: stage.title,
        content: (
          <>
            <PinnedStageArt stage={stage.art} />
            <span className="mt-16 inline-grid size-34 place-items-center text-brand">
              <ServiceIcon name={stage.icon} size={34} className="block" />
            </span>
            <h3
              data-fit=""
              className="mt-12 font-display text-[42px] leading-[1.05] font-medium whitespace-nowrap text-fg uppercase max-lg:text-[36px] max-md:text-[30px]"
            >
              {stage.title}
            </h3>
            <p className="mt-12 max-w-300 font-display text-[14.5px] leading-[1.7] text-[#8f8984]">
              {stage.text}
            </p>
          </>
        ),
      }))}
    />
  );
}
