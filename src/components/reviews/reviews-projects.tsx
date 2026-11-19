import Image from "next/image";
import Link from "next/link";

import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import { getProjects, projectHref } from "@/content/projects";
import { REVIEWS_PROJECTS, type ReviewsProjectsContent } from "@/content/reviews";

import { ReviewsHeading, SplitHeader } from "./reviews-ui";

/**
 * "See the spaces. Meet the stories." (`#p-reviews section.sp`, markup 4353–4366, page `<style>`
 * 4269–4276): header row (heading and a 13/1.75 paragraph, "Explore Our Work"), then six project
 * cards from the shared project list (photo, 22.5px name, uppercase scope and town). Photos zoom
 * to 1.04 on hover (.8s). Three columns; two below 1100px; one on phones. Like the original's
 * `#project` links, cards open the project page through `projectHref` (KI-F09). White.
 *
 * Fixes: card names are headings (h3); alts describe the photos (KI-A13); the scope line is 11px
 * on phones (KI-A10).
 */
export function ReviewsProjects({
  content = REVIEWS_PROJECTS,
}: {
  readonly content?: ReviewsProjectsContent;
}) {
  return (
    <Section tone="light" data-parity="sp">
      <Container>
        <SplitHeader
          align="end"
          aside={
            <ButtonLink
              href={content.cta.href}
              variant="outline"
              size="sm"
              icon="up-right"
              className="mb-52"
            >
              {content.cta.label}
            </ButtonLink>
          }
        >
          <ReviewsHeading kicker={content.kicker} title={content.title} />
          <p className="mt-22 font-sans text-[13px] leading-[1.75] text-fg-mut">{content.text}</p>
        </SplitHeader>

        <ul className="mt-50 grid grid-cols-3 gap-x-28 gap-y-50 max-lg:grid-cols-2 max-md:grid-cols-1">
          {getProjects(content.projects).map((project) => (
            <li key={project.slug}>
              <Link href={projectHref(project)} className="group block">
                <div className="relative h-240 overflow-hidden max-lg:h-330">
                  <Image
                    src={media[project.cover].image}
                    alt={project.coverAlt}
                    fill
                    sizes={canvasSizes(404, "calc(50vw - 50px)", "calc(100vw - 40px)")}
                    className="object-cover transition-transform duration-800 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-22 font-sans text-[22.5px] font-normal">{project.name}</h3>
                <p className="mt-10 flex justify-between font-sans text-[8.5px] tracking-[0.16em] text-[#555] uppercase max-md:text-[11px]">
                  <span>{project.scope}</span>
                  <span>{project.location}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
