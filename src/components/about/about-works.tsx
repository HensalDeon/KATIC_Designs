import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { canvasSizes } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/chip";
import { Container } from "@/components/ui/container";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { ABOUT_WORKS, type AboutWorksContent, type AboutWorksTileLayout } from "@/content/about";
import { media } from "@/content/media";
import { getProject, projectHref } from "@/content/projects";
import { cn } from "@/lib/cn";

import { AboutColumns } from "./about-columns";
import { ABOUT_DARK_OUTLINE_BUTTON } from "./about-experience";

/**
 * Mosaic cells on the canvas (410 / 410 / 412px × 460 / 270px rows): `big` spans the first two
 * columns, `tall` the third column over both rows. Below 1100px every tile is 360px tall in two
 * columns (`big` spans both); one column on phones.
 */
const tileVariants = cva("max-lg:h-360", {
  variants: {
    layout: {
      big: "col-span-2 max-md:col-span-1",
      tall: "col-start-3 row-span-2 max-lg:col-start-auto max-lg:row-span-1",
      small: "",
    },
  },
});

const TILE_WIDTH: Record<AboutWorksTileLayout, number> = { big: 838, tall: 412, small: 410 };

type AboutWorksProps = {
  readonly content?: AboutWorksContent;
};

/**
 * Selected works (`#p-about section.sw`, black): kicker and the 60px Jost title beside a line of
 * copy and "View All Projects", then a four-tile project mosaic. Each tile is a link to its
 * project with the image under a bottom gradient, the scope tag, name, location and an orange ↗;
 * hovering zooms the image to 1.04 over .7s. Projects come from `src/content/projects.ts`
 * (KI-D01).
 *
 * Fixes: the section grows instead of being zoomed down to 70% (KI-L13); tags and locations are
 * at least 11px on phones (KI-A10).
 */
export function AboutWorks({ content = ABOUT_WORKS }: AboutWorksProps) {
  const titleId = "about-works-title";
  return (
    <Section tone="dark" data-parity="sw" aria-labelledby={titleId}>
      <Container>
        <AboutColumns
          start={
            <>
              <Kicker className="text-[#a3a3a3]">{content.kicker}</Kicker>
              <h2
                id={titleId}
                className="mt-22 font-display text-[60px] font-medium tracking-[0.005em] text-[#f4f4f4] max-md:text-[34px] max-md:leading-[1.1]"
              >
                {content.title}
              </h2>
            </>
          }
          end={
            <>
              <p className="mt-4 font-sans text-[12.5px] leading-[1.75] text-[#aaa]">
                {content.body}
              </p>
              <ButtonLink
                href={content.cta.href}
                variant="outline"
                size="sm"
                icon="up-right"
                className={cn("mt-20", ABOUT_DARK_OUTLINE_BUTTON)}
              >
                {content.cta.label}
              </ButtonLink>
            </>
          }
        />

        <ul className="mt-70 grid grid-cols-[410px_410px_412px] grid-rows-[460px_270px] gap-x-18 gap-y-17 max-lg:grid-cols-2 max-lg:grid-rows-none max-md:grid-cols-1">
          {content.tiles.map(({ project: slug, layout }) => {
            const project = getProject(slug);
            return (
              <li key={slug} className={tileVariants({ layout })}>
                <Link
                  href={projectHref(project)}
                  className="group relative block size-full overflow-hidden text-white after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.55))] after:content-['']"
                >
                  <Image
                    src={media[project.cover].image}
                    alt={project.coverAlt}
                    sizes={canvasSizes(TILE_WIDTH[layout], "50vw")}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <Tag className="absolute top-22 left-22 z-2">{project.scope}</Tag>
                  <h3 className="absolute bottom-32 left-22 z-2 font-sans text-[26px] font-medium">
                    {project.name}
                  </h3>
                  <p className="absolute bottom-16 left-22 z-2 font-sans text-[9px] tracking-[0.2em] uppercase max-md:text-[11px]">
                    {project.location}
                  </p>
                  <i
                    aria-hidden
                    className="absolute right-22 bottom-18 z-2 font-display text-[12px] text-brand not-italic"
                  >
                    ↗
                  </i>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
