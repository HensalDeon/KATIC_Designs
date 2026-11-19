import { ZoomableImage } from "@/components/overlays/lightbox";
import { type ProcessStep, ProcessSteps } from "@/components/sections/process-steps";
import { ActionButton, type SectionAction } from "@/components/sections/section-action";
import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { ARCH_HEADER_COPY, ArchHeader } from "./arch-header";

/** Content of the architecture process (`#p-architecture section.pr`). Plain data. */
export type ArchProcessContent = {
  readonly kicker: string;
  readonly title: readonly string[];
  readonly lead: string;
  /** Small button under the lead ("See Our Process" → the steps). */
  readonly cta: SectionAction;
  /** A 512px photo beside a wider one. */
  readonly images: readonly [SectionImage, SectionImage];
  /** Page-specific steps, one column each on the canvas. */
  readonly steps: readonly ProcessStep[];
  /** Deep-link id of the steps (`process-tl` in the original). */
  readonly stepsId?: string;
};

type ArchProcessProps = {
  readonly content: ArchProcessContent;
  /** Black in the original (index 3 after the hero). */
  readonly tone?: Tone;
  /** `process` in the original (deep link `#architecture/process`). */
  readonly id?: string;
};

/**
 * Architecture process (`#p-architecture section.pr#process`, stripped HTML lines 3361–3369, page
 * `<style>` 3289–3292 and global 2089): the two-column header with a lead and a "See Our Process"
 * button, a row of two zoomable photos (512px + the rest, 333px tall, one lightbox gallery), then
 * the five steps (`.ksteps#process-tl`, `ProcessSteps` with its line-art draw-on) 80px below.
 *
 * Fixes: the photo row stacks on phones instead of keeping its 512px column, which pushed the
 * second photo off the canvas where it was cropped and never loaded (KI-L20); descriptive alts
 * instead of the headline and a step name (KI-A13); the title scales 58 → 46 → 34 (KI-N04); the
 * section grows instead of being zoomed down by `fit()` (KI-L13).
 */
export function ArchProcess({ content, tone = "dark", id = "process" }: ArchProcessProps) {
  const titleId = `${id}-title`;
  const [first, second] = content.images;
  return (
    <Section tone={tone} id={id} aria-labelledby={titleId}>
      <Container>
        <ArchHeader kicker={content.kicker} title={content.title} titleId={titleId}>
          <p className={cn(ARCH_HEADER_COPY, "text-[15.5px] leading-[1.7] max-md:text-[15px]")}>
            {content.lead}
          </p>
          <ActionButton
            action={content.cta}
            className={buttonVariants({
              variant: tone === "dark" ? "light" : "outline",
              size: "sm",
              className: "mt-18",
            })}
          />
        </ArchHeader>

        <div
          data-testid="arch-process-photos"
          className="mt-62 grid grid-cols-[512px_1fr] gap-18 max-md:grid-cols-[minmax(0,1fr)]"
        >
          {[first, second].map((image, index) => (
            <ZoomableImage
              key={image.alt}
              image={resolveImage(image.src)}
              alt={image.alt}
              group={id}
              sizes={index === 0 ? canvasSizes(512, "50vw") : canvasSizes(738, "45vw")}
              className="h-333 w-full object-cover"
            />
          ))}
        </div>

        <ProcessSteps
          id={content.stepsId ?? "process-tl"}
          steps={content.steps}
          // `.pr` step texts are the page's warm grey (#8f8984), not the `.ks.dk` #aaa.
          className="mt-80 [&_p]:in-data-[tone=dark]:text-[#8f8984]"
        />
      </Container>
    </Section>
  );
}
