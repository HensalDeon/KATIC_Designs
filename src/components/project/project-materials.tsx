import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ProjectMaterialsContent } from "@/content/project-details";

import { ProjectHeading, ProjectImage, ProjectStatement, ProjectTwo } from "./project-ui";

/** Column width of each photo on the canvas (`.mt .imr{grid-template-columns:790px 1fr}`). */
const PHOTO_WIDTHS = [790, 454] as const;

/**
 * Architecture, interiors and materials (`#p-project section.mt`, original lines 3918–3934), black:
 * heading beside two paragraphs, two bottom-aligned captioned photos (790px and the rest), the
 * four-material palette with colour swatches (two columns below 1100px, one on phones) and the
 * closing statement with a dark "Explore Service".
 *
 * Fixes: photo labels and material notes are 11px on phones (KI-A10), and the photos are 340px tall
 * there instead of their 636/478px canvas heights (KI-L24).
 */
export function ProjectMaterials({ content }: { readonly content: ProjectMaterialsContent }) {
  const titleId = "project-materials-title";
  return (
    <Section tone="dark" data-parity="mt" aria-labelledby={titleId}>
      <Container>
        <ProjectTwo>
          <ProjectHeading heading={content} id={titleId} titleClassName="mt-44 text-white" />
          <div className="pt-78">
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "font-sans text-[14px] leading-[1.9] text-[#bbb]"
                    : "mt-20 font-sans text-[14px] leading-[1.9] text-[#bbb]"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </ProjectTwo>

        <div className="mt-70 grid grid-cols-[790px_1fr] items-end gap-24 max-lg:grid-cols-1 max-lg:gap-36">
          {content.images.map((photo, index) => (
            <figure key={photo.image.alt}>
              <ProjectImage
                image={photo.image}
                height={photo.height}
                className="h-(--h) max-md:h-340"
                sizes={canvasSizes(PHOTO_WIDTHS[index] ?? 790, "100vw")}
                {...(photo.caption ? { caption: photo.caption } : {})}
              />
              {photo.caption ? (
                <figcaption className="mt-18 font-sans text-[9px] font-medium tracking-[0.2em] text-[#999] max-md:text-[11px]">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>

        <ul className="mt-96 grid grid-cols-4 gap-58 border-y border-[rgba(255,255,255,0.12)] py-28 max-lg:grid-cols-2 max-md:grid-cols-1">
          {content.materials.map((material) => (
            <li key={material.name}>
              <i
                aria-hidden
                className="block size-22"
                style={{ backgroundColor: material.swatch }}
              />
              <h3 className="mt-14 font-sans text-[18px] font-medium">{material.name}</h3>
              <p className="mt-22 font-sans text-[10.5px] leading-[1.75] text-[#aaa] max-md:text-[11px]">
                {material.text}
              </p>
            </li>
          ))}
        </ul>

        <ProjectStatement
          text={content.statement}
          link={content.cta}
          variant="dark"
          className="mt-76"
          textClassName="text-[23px] leading-[1.4] text-white"
        />
      </Container>
    </Section>
  );
}
