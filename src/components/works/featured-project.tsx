import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import { TitleLines } from "@/components/home/title-lines";
import { resolveImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { getProject, projectHref } from "@/content/projects";
import { WORKS_FEATURED, type WorksFeaturedContent } from "@/content/works";
import { cn } from "@/lib/cn";

import { WORKS_TITLE_CLASS } from "./works-title";

type FeaturedProjectProps = {
  readonly content?: WorksFeaturedContent;
};

/**
 * "Featured projects" (`#p-works section.ft1`, markup 3706–3721, page `<style>` 3616–3637), a white
 * section: the `.two` header (kicker and title left, paragraph right), then an 820px photo card
 * (tag, name, reference; image zooms to 1.03 on hover) beside the crumb, heading, description,
 * "View Project" and three figures. One column below 1100px.
 *
 * The card and button open the featured project's page (KI-F09); the name printed over the photo is
 * kept as rendered (KI-F10, see `WORKS_FEATURED`). Tiny labels are 11px on phones (KI-A10).
 */
export function FeaturedProject({ content = WORKS_FEATURED }: FeaturedProjectProps) {
  const titleId = "works-featured-title";
  const href = projectHref(getProject(content.project));
  return (
    <Section tone="light" data-parity="ft1" aria-labelledby={titleId}>
      <Container size="wide">
        <div className="grid grid-cols-[660px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Kicker>{content.kicker}</Kicker>
            <SectionTitle id={titleId} className={cn("mt-44 text-ink", WORKS_TITLE_CLASS)}>
              <TitleLines lines={content.title} />
            </SectionTitle>
          </div>
          <p className="mt-44 max-w-600 font-sans text-[13.5px] leading-[1.75] text-mut">
            {content.text}
          </p>
        </div>

        <div className="mt-52 grid grid-cols-[820px_1fr] gap-48 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <Link
            href={href}
            className="group relative block h-612 overflow-hidden after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_65%,rgba(0,0,0,0.55))] after:content-['']"
          >
            <Image
              src={resolveImage(content.image.src)}
              alt={content.image.alt}
              sizes={canvasSizes(820, "calc(100vw - 72px)", "calc(100vw - 40px)")}
              className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.03]"
            />
            <span className="absolute top-26 left-24 bg-panel px-12 py-8 font-sans text-[9px] font-semibold tracking-[0.14em] text-white uppercase max-md:text-[11px]">
              {content.tag}
            </span>
            <h3 className="absolute bottom-22 left-25 z-2 font-sans text-[41px] font-normal text-white">
              {content.name}
            </h3>
            <em className="absolute right-24 bottom-30 z-2 font-sans text-[10px] font-semibold tracking-[0.14em] text-brand not-italic max-md:text-[11px]">
              {content.code}
            </em>
          </Link>

          <div>
            <p className="font-sans text-[9.5px] font-medium tracking-[0.16em] text-[#333] max-md:text-[11px]">
              {content.crumb.map((part, index) => (
                <Fragment key={part}>
                  {index > 0 ? (
                    <i aria-hidden className="mx-8 text-brand not-italic">
                      /
                    </i>
                  ) : null}
                  {part}
                </Fragment>
              ))}
            </p>
            <h4 className="mt-122 font-sans text-[27.5px] leading-[1.25] font-normal text-ink">
              {content.heading}
            </h4>
            <p className="mt-18 font-sans text-[13.5px] leading-[1.95] text-[#666]">
              {content.description}
            </p>
            <ButtonLink
              href={href}
              variant="outline"
              size="sm"
              icon="up-right"
              className="mt-22 font-semibold"
            >
              {content.cta}
            </ButtonLink>
            <ul className="mt-115 flex justify-between border-t border-[#d8d4cc] pt-24 font-sans">
              {content.stats.map((stat) => (
                <li key={stat.label}>
                  <b className="block text-[22px] font-normal text-ink">{stat.value}</b>
                  <span className="mt-8 block text-[8.5px] font-medium tracking-[0.2em] text-[#666] max-md:text-[11px]">
                    {stat.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
