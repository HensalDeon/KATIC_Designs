import { ServiceIcon } from "@/components/icons/service-icon";
import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { ProjectDesignResponseContent } from "@/content/project-details";

import { ProjectHeading, ProjectImage, ProjectStatement, ProjectTwo } from "./project-ui";

/**
 * Design response (`#p-project section.dr`, original lines 3887–3905), black as rendered (the
 * original's `data-fx=110` inverts the authored cream): heading beside two paragraphs, a 760px
 * photo beside the planning note and a second photo, three principles with line icons (two columns
 * below 1100px, one on phones), and the closing statement with "Our Process".
 *
 * Colours are the original's rendered ones, including the black label on the orange button.
 */
export function ProjectDesignResponse({
  content,
}: {
  readonly content: ProjectDesignResponseContent;
}) {
  const titleId = "project-design-response-title";
  const { planning } = content;
  return (
    <Section tone="dark" data-parity="dr" aria-labelledby={titleId} className="text-[#f4f4f4]">
      <Container>
        <ProjectTwo>
          <ProjectHeading heading={content} id={titleId} titleClassName="mt-58 text-[#f4f4f4]" />
          <div>
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "mt-76 font-sans text-[14.5px] leading-[1.9] text-[#a1a4aa]"
                    : "mt-22 font-sans text-[14.5px] leading-[1.9] text-[#a1a4aa]"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </ProjectTwo>

        <div className="mt-66 grid grid-cols-[760px_1fr] items-start gap-58 max-lg:grid-cols-1 max-lg:gap-36">
          <ProjectImage
            image={content.mainImage}
            className="h-680 max-md:h-340"
            sizes={canvasSizes(760, "100vw")}
          />
          <div>
            <Kicker className="mt-56">{planning.kicker}</Kicker>
            <h3 className="mt-20 font-sans text-[28px] leading-[1.3] font-normal">
              {planning.title}
            </h3>
            <p className="mt-22 font-sans text-[13.5px] leading-[1.95] text-[#999]">
              {planning.text}
            </p>
            <ProjectImage
              image={planning.image}
              className="h-251"
              buttonClassName="mt-62"
              sizes={canvasSizes(450, "100vw")}
            />
          </div>
        </div>

        <ul className="mt-70 grid grid-cols-3 gap-58 border-t border-[#222] pt-24 max-lg:grid-cols-2 max-md:grid-cols-1">
          {content.points.map((point) => (
            <li key={point.title}>
              {/* The original's inline-grid icon sits in a 34px line box. */}
              <span className="block h-34 text-brand">
                <ServiceIcon name={point.icon} />
              </span>
              <h3 className="mt-18 font-sans text-[23px] font-normal">{point.title}</h3>
              <p className="mt-14 font-sans text-[11.5px] leading-[1.85] text-[#aaa]">
                {point.text}
              </p>
            </li>
          ))}
        </ul>

        <ProjectStatement
          text={content.statement}
          link={content.cta}
          variant="primary"
          className="mt-84"
          textClassName="text-[22.5px] leading-[1.4]"
          // Black on the brand orange (6.2:1) as the original renders it; no darker fill needed.
          buttonClassName="bg-brand text-black hover:bg-brand-hover"
        />
      </Container>
    </Section>
  );
}
