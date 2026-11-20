import type { ProjectDetail } from "@/lib/schemas/project-details";

import { ProjectBrief } from "./project-brief";
import { ProjectCta } from "./project-cta";
import { ProjectDesignResponse } from "./project-design-response";
import { ProjectGallery } from "./project-gallery";
import { ProjectHero } from "./project-hero";
import { ProjectMaterials } from "./project-materials";
import { ProjectOverview } from "./project-overview";
import { ProjectRelated } from "./project-related";

/** The gallery keeps the original's id, so `#project/project-gallery` deep links still land on it. */
export const PROJECT_GALLERY_ID = "project-gallery";

/**
 * A project detail page (`#p-project`, original lines 3782–3977; docs/analysis/04 §2). Fixed
 * section order; tones as rendered by the original (white and black alternate after the hero).
 * No reveal-on-scroll: the original runs it on Home only (D7). The footer comes from the layout.
 */
export function ProjectPage({ detail }: { readonly detail: ProjectDetail }) {
  return (
    <>
      <ProjectHero content={detail.hero} galleryId={PROJECT_GALLERY_ID} />
      <ProjectOverview content={detail.overview} />
      <ProjectDesignResponse content={detail.designResponse} />
      <ProjectBrief content={detail.brief} />
      <ProjectMaterials content={detail.materials} />
      <ProjectGallery content={detail.gallery} id={PROJECT_GALLERY_ID} />
      <ProjectRelated content={detail.related} />
      <ProjectCta content={detail.cta} />
    </>
  );
}
