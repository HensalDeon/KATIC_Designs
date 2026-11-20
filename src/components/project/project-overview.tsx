import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ProjectOverviewContent } from "@/lib/schemas/project-details";

import { CapButton, ProjectHeading, ProjectImage, ProjectTwo } from "./project-ui";

/**
 * Project overview (`#p-project section.ov`, original lines 3873–3885): heading beside the intro,
 * the five-column facts strip (two columns below 1100px, one on phones), then an 820px photo
 * beside a smaller one with a short line and "Explore Service".
 *
 * The button also matches the original's `.ov .imr .cap` rule (it shares the `cap` class), so it
 * sits 76px lower than the line beside it; reproduced as rendered. Fact labels are 11px on phones
 * (KI-A10).
 */
export function ProjectOverview({ content }: { readonly content: ProjectOverviewContent }) {
  const titleId = "project-overview-title";
  const [large, small] = content.images;
  return (
    <Section tone="light" data-parity="ov" aria-labelledby={titleId}>
      <Container>
        <ProjectTwo>
          <ProjectHeading heading={content} id={titleId} titleClassName="mt-44 text-ink" />
          <p className="mt-58 font-sans text-[14px] leading-[1.85] text-mut">{content.intro}</p>
        </ProjectTwo>

        <dl className="mt-62 grid grid-cols-5 border-t border-b-2 border-t-[#d9d5cd] border-b-[#dcd8d0] pt-26 pb-40 max-lg:grid-cols-2 max-lg:gap-y-28 max-md:grid-cols-1">
          {content.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="font-sans text-[8.5px] font-semibold tracking-[0.18em] text-[#c0522a] max-md:text-[11px]">
                {fact.label}
              </dt>
              <dd className="mt-12 font-sans text-[14px] font-medium text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-58 grid grid-cols-[820px_1fr] items-start gap-48 max-lg:grid-cols-1 max-lg:gap-36">
          <ProjectImage
            image={large}
            className="h-502 max-md:h-340"
            sizes={canvasSizes(820, "100vw")}
          />
          <div>
            <ProjectImage
              image={small}
              className="h-260"
              buttonClassName="mt-111 max-md:mt-0"
              sizes={canvasSizes(400, "100vw")}
            />
            <div className="mt-76 flex items-center justify-between">
              <p className="max-w-200 font-sans text-[11px] leading-[1.6] text-[#666]">
                {content.caption}
              </p>
              <CapButton link={content.cta} variant="primary" className="mt-76" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
