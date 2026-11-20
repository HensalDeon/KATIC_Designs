import { cva } from "class-variance-authority";

import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ProjectGalleryContent, ProjectGalleryRowLayout } from "@/lib/schemas/project-details";

import { ProjectHeading, ProjectImage } from "./project-ui";

/** Lightbox group of the gallery: its ten photos browse with previous/next. */
export const PROJECT_GALLERY_GROUP = "project-gallery";

/**
 * Row columns (the original's inline `grid-template-columns`). Below 1100px the 760px and 488px
 * rows become two equal columns (original line 2184); on phones every row is one column (2256).
 */
const rowVariants = cva("mt-52 grid items-end gap-20 max-md:grid-cols-1", {
  variants: {
    layout: {
      full: "grid-cols-1",
      "wide-narrow": "grid-cols-[760px_1fr] max-lg:grid-cols-2",
      "narrow-wide": "grid-cols-[488px_1fr] max-lg:grid-cols-2",
      thirds: "grid-cols-3",
    },
  },
});

/** Canvas width of each column, for `sizes`. */
const COLUMN_WIDTHS: Record<ProjectGalleryRowLayout, readonly number[]> = {
  full: [1268],
  "wide-narrow": [760, 488],
  "narrow-wide": [488, 760],
  thirds: [410, 410, 410],
};

/**
 * Project gallery (`#p-project section.gl#project-gallery`, original lines 3937–3951): heading with
 * the "10 views" label at its bottom right, then the photos in five editorial rows, each with its
 * caption underneath. Every photo opens the lightbox as one group (previous/next, caption and
 * counter), which the original lacked (KI-F16).
 *
 * Phones: one column of 300px photos, as the original renders them; captions and the views label
 * are 11px (KI-A10).
 */
export function ProjectGallery({
  content,
  id,
}: {
  readonly content: ProjectGalleryContent;
  readonly id: string;
}) {
  const titleId = "project-gallery-title";
  return (
    <Section tone="light" id={id} aria-labelledby={titleId}>
      <Container>
        <ProjectHeading heading={content} id={titleId} titleClassName="mt-22 text-ink" />
        <p className="absolute right-0 bottom-16 font-sans text-[9.5px] font-semibold tracking-[0.2em] text-[#c0522a] max-md:static max-md:mt-14 max-md:text-[11px]">
          {content.viewsLabel}
        </p>
      </Container>
      <Container>
        {content.rows.map((row, rowIndex) => (
          <div key={rowIndex} className={rowVariants({ layout: row.layout })}>
            {row.photos.map((photo, index) => (
              <figure key={photo.caption}>
                <ProjectImage
                  image={photo.image}
                  height={photo.height}
                  caption={photo.caption}
                  group={PROJECT_GALLERY_GROUP}
                  className="h-(--h) max-md:h-300"
                  sizes={canvasSizes(
                    COLUMN_WIDTHS[row.layout][index] ?? 1268,
                    row.layout === "full" ? "100vw" : "50vw",
                  )}
                />
                <figcaption className="mt-14 font-sans text-[8.5px] leading-[1.4] font-medium tracking-[0.14em] text-[#555] uppercase max-md:text-[11px]">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </Container>
    </Section>
  );
}
