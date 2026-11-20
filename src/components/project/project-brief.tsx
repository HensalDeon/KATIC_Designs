import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ProjectBriefContent } from "@/lib/schemas/project-details";

import { ProjectHeading, ProjectImage, ProjectTwo } from "./project-ui";

/**
 * The brief (`#p-project section.br`, original lines 3908–3916), white as rendered (`data-fx=111`
 * inverts the authored black): heading beside two paragraphs and the bold objective, then two
 * bottom-aligned photos (470px and the rest).
 *
 * Fixes: on the canvas the original shrinks this section to fit one screen (`fit()` zoom 0.70,
 * KI-L13); here it grows. On phones the photos are 340px tall, the original's own phone height for
 * this page's large photos, instead of keeping their 430/560px canvas heights (KI-L24).
 */
export function ProjectBrief({ content }: { readonly content: ProjectBriefContent }) {
  const titleId = "project-brief-title";
  const [first, second] = content.images;
  return (
    <Section tone="light" data-parity="br" aria-labelledby={titleId} className="text-ink-2">
      <Container>
        <ProjectTwo>
          <ProjectHeading heading={content} id={titleId} titleClassName="mt-44 text-black" />
          <div className="pt-62">
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "font-sans text-[14px] leading-[1.9] text-[#444]"
                    : "mt-16 font-sans text-[14px] leading-[1.9] text-[#444]"
                }
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-16 font-sans text-[17.5px] leading-[1.6] font-medium text-black">
              {content.objective}
            </p>
          </div>
        </ProjectTwo>

        <div className="mt-62 grid grid-cols-[470px_1fr] items-end gap-24 max-lg:grid-cols-1 max-lg:gap-36">
          <ProjectImage
            image={first.image}
            className="h-(--h) max-md:h-340"
            sizes={canvasSizes(470, "100vw")}
            height={first.height}
          />
          <ProjectImage
            image={second.image}
            className="h-(--h) max-md:h-340"
            sizes={canvasSizes(774, "100vw")}
            height={second.height}
          />
        </div>
      </Container>
    </Section>
  );
}
