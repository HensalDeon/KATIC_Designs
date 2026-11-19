import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { canvasSizes } from "@/components/sections/section-media";
import { media } from "@/content/media";
import { type Project, projectHref, type ProjectType } from "@/content/projects";

import { cardMetaParts } from "./portfolio-layout";

/** The `.n` icon of each card type (house for homes, office for workplaces, leaf for institutions). */
const TYPE_ICON = {
  Residential: "house",
  Villa: "house",
  Apartments: "house",
  Commercial: "office",
  Hospitality: "office",
  Interiors: "sofa",
  Institutional: "leaf",
} as const satisfies Record<ProjectType, ServiceIconName>;

/** Widest slot is 790px on the canvas; two columns on tablets, one on phones. */
const IMAGE_SIZES = canvasSizes(790, "50vw");

type ProjectCardProps = {
  readonly project: Project;
  readonly linkLabel: string;
};

/**
 * A portfolio card (`#p-works a.pj`, page `<style>` 3632–3646): photo with the type icon, the type
 * label and an orange ↗ square, then the 29px name, the meta line and "View Project →". Every fact
 * comes from the `Project` entity and the card opens its page (KI-F09, `projectHref`). The photo
 * zooms to 1.03 on hover (.8s).
 *
 * The photo's height comes from its grid slot (`--im-h`, set by `PortfolioGrid`): the original's
 * per-row heights on the canvas, 400px on tablets and 320px on phones (where the original draws a
 * 300px image in the 320px frame). Small labels are 11px on phones (KI-A10).
 */
export function ProjectCard({ project, linkLabel }: ProjectCardProps) {
  return (
    <Link href={projectHref(project)} className="group block">
      <span className="relative block h-(--im-h) overflow-hidden max-lg:h-400 max-md:h-320">
        <Image
          src={media[project.cover].image}
          alt={project.coverAlt}
          sizes={IMAGE_SIZES}
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.03] max-md:h-300"
        />
        <ServiceIcon
          name={TYPE_ICON[project.type]}
          size={20}
          className="absolute top-20 left-20 text-white"
        />
        <span className="absolute bottom-20 left-20 font-sans text-[8.5px] font-semibold tracking-[0.2em] text-white uppercase max-md:text-[11px]">
          {project.type}
        </span>
        <span className="absolute right-20 bottom-20 grid size-42 place-items-center bg-brand text-white">
          <ArrowIcon direction="up-right" width={10} height={10} />
        </span>
      </span>
      <h3 className="mt-20 font-sans text-[29px] font-normal text-black">{project.name}</h3>
      <p className="mt-10 font-sans text-[9.5px] font-medium tracking-[0.16em] text-[#444] uppercase max-md:text-[11px]">
        {cardMetaParts(project).map((part, index) => (
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
      <span className="mt-12 inline-flex items-center gap-10 font-sans text-[11.5px] font-semibold text-black">
        {linkLabel}
        <b aria-hidden className="font-black text-brand">
          →
        </b>
      </span>
    </Link>
  );
}
