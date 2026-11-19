import Image from "next/image";
import Link from "next/link";

import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import type { ProjectRelatedContent } from "@/content/project-details";
import { getProject, projectHref } from "@/content/projects";

import { ProjectHeading, ProjectTwo } from "./project-ui";

/**
 * Related projects (`#p-project section.rl`, original lines 3953–3964), black as rendered
 * (`data-fx=114`): heading beside the lead, then four project cards (two columns below 1100px, one
 * on phones) with a 350px photo that zooms to 1.04 on hover (0.7s), the name, an orange meta line
 * and "View project →".
 *
 * Names, photos and links come from the shared `Project` (`projectHref`: a project without its own
 * page links to The Courtyard House, as every card of the original does, KI-F09). Alt texts
 * describe the photo (KI-A13; the original repeated the name). Fixes: on the canvas the original
 * shrinks this section to fit one screen (`fit()` zoom 0.92, KI-L13); here it grows. Meta and link
 * lines are 11px on phones (KI-A10).
 */
export function ProjectRelated({ content }: { readonly content: ProjectRelatedContent }) {
  const titleId = "project-related-title";
  return (
    <Section tone="dark" data-parity="rl" aria-labelledby={titleId} className="text-[#f4f4f4]">
      <Container>
        <ProjectTwo>
          <ProjectHeading heading={content} id={titleId} titleClassName="mt-22 text-[#f4f4f4]" />
          <p className="font-sans text-[13.5px] leading-[1.8] text-[#a1a4aa]">{content.lead}</p>
        </ProjectTwo>

        <ul className="mt-40 grid grid-cols-4 gap-18 max-lg:grid-cols-2 max-lg:gap-y-28 max-md:grid-cols-1">
          {content.projects.map(({ project: slug, meta }) => {
            const project = getProject(slug);
            return (
              <li key={slug}>
                <Link href={projectHref(project)} className="group block">
                  <div className="overflow-hidden">
                    <Image
                      src={media[project.cover].image}
                      alt={project.coverAlt}
                      sizes={canvasSizes(304, "50vw")}
                      className="h-350 w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-20 font-sans text-[20.5px] font-normal">{project.name}</h3>
                  <p className="mt-8 font-sans text-[8.5px] font-semibold tracking-[0.16em] text-[#c0522a] max-md:text-[11px]">
                    {meta}
                  </p>
                  <span className="mt-18 inline-block font-sans text-[10.5px] font-semibold tracking-[0.12em] max-md:text-[11px]">
                    {content.moreLabel}{" "}
                    <span aria-hidden className="ml-8 text-[12px] font-normal text-brand">
                      →
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
