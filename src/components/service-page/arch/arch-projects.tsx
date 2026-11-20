import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { resolveImage, type SectionImage } from "@/components/sections/section-image";
import { canvasSizes } from "@/components/sections/section-media";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import type { ProjectSlug } from "@/content/projects";
import { cn } from "@/lib/cn";
import { type ContentRefs, getRefs } from "@/lib/data";
import type { Tone } from "@/lib/tone";

import { ARCH_HEADER_COPY, ArchHeader } from "./arch-header";

/** A featured project card: the project by slug (name and link), with this page's copy. */
export type ArchProjectCard = {
  readonly project: ProjectSlug;
  /**
   * The small orange line, verbatim ("Kochi, Kerala · Residential Architecture"). Cards describe
   * the same project differently across pages (KI-D01), so it is not derived.
   */
  readonly meta: string;
  /** One-sentence description under the name. */
  readonly text: string;
  /** Overrides the project's cover image (and its alt). */
  readonly image?: SectionImage;
};

/** Content of the architecture projects (`#p-architecture section.ap2`). Plain data. */
export type ArchProjectsContent = {
  readonly kicker: string;
  readonly title: readonly string[];
  readonly lead: string;
  /** Full-width card. */
  readonly featured: ArchProjectCard;
  /** Two-column grid under it. */
  readonly grid: readonly ArchProjectCard[];
};

type ArchProjectsProps = {
  readonly content: ArchProjectsContent;
  /** White in the original (index 4 after the hero). */
  readonly tone?: Tone;
  /** `arch-projects` in the original. */
  readonly id?: string;
};

/**
 * Architecture projects (`#p-architecture section.ap2#arch-projects`, stripped HTML lines
 * 3371–3383, page `<style>` 3275–3288 and global 2249, 2270): the two-column header, a full-width
 * project card (563px photo) and four more in two columns (420px photos). Each card links to its
 * project and shows the photo (zooming to 1.03 over .8s on hover), an orange meta line, the name,
 * a sentence and an underlined "View Project ↗" on the right; the meta stacks under the text on
 * phones, where the grid is one column. Projects come from the data layer (`getRefs()`, KI-D01).
 *
 * Fixes: cards link to their own project instead of the generic `#project`; the meta line is
 * 11px on phones (KI-A10); the title scales 58 → 46 → 34 (KI-N04).
 */
export async function ArchProjects({
  content,
  tone = "light",
  id = "arch-projects",
}: ArchProjectsProps) {
  const refs = await getRefs();
  const titleId = `${id}-title`;
  return (
    <Section tone={tone} id={id} aria-labelledby={titleId}>
      <Container>
        <ArchHeader kicker={content.kicker} title={content.title} titleId={titleId}>
          <p className={cn(ARCH_HEADER_COPY, "text-[14.5px] leading-[1.8]")}>{content.lead}</p>
        </ArchHeader>
        {/* One list: the featured card spans both columns, then the 2-column grid (56px apart). */}
        <ul className="mt-56 grid grid-cols-2 gap-x-55 gap-y-56 max-md:grid-cols-1">
          <li className="col-span-2 max-md:col-span-1">
            <ProjectCard card={content.featured} size="featured" refs={refs} />
          </li>
          {content.grid.map((card) => (
            <li key={card.project}>
              <ProjectCard card={card} size="grid" refs={refs} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

type CardSize = "featured" | "grid";

const photoVariants = cva("block overflow-hidden", {
  variants: { size: { featured: "h-563", grid: "h-420" } },
});
const nameVariants = cva("mt-6 font-sans text-fg", {
  variants: { size: { featured: "text-[30px]", grid: "text-[26px]" } },
});
const PHOTO_SIZES: Record<CardSize, string> = {
  featured: canvasSizes(1268, "100vw"),
  grid: canvasSizes(607, "50vw"),
};

type ProjectCardProps = {
  readonly card: ArchProjectCard;
  readonly size: CardSize;
  readonly refs: ContentRefs;
};

/** `a.pc`: photo, then the meta row (text left, "View Project ↗" right). */
function ProjectCard({ card, size, refs }: ProjectCardProps) {
  const project = refs.project(card.project);
  return (
    <Link href={refs.projectHref(project)} className="group block">
      <span className={photoVariants({ size })}>
        <Image
          src={resolveImage(card.image?.src ?? project.cover)}
          alt={card.image?.alt ?? project.coverAlt}
          sizes={PHOTO_SIZES[size]}
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.03]"
        />
      </span>
      <div className="mt-18 flex items-start justify-between max-md:flex-col">
        {/* The meta sits on a 16px Jost line box, as the original's inline `<small>`. */}
        <div className="font-display text-[16px]">
          <span className="font-sans text-[8.5px] font-medium tracking-[0.14em] text-[#c0522a] uppercase max-md:text-[11px]">
            {card.meta}
          </span>
          <h3 className={nameVariants({ size })}>{project.name}</h3>
          <p className="mt-10 max-w-470 font-sans text-[12px] leading-[1.75] text-[#555] in-data-[tone=dark]:text-[#aaa]">
            {card.text}
          </p>
        </div>
        <span className="mt-22 font-sans text-[11px] font-medium whitespace-nowrap text-fg underline">
          View Project
          <b aria-hidden className="ml-12 inline-block text-brand no-underline">
            ↗
          </b>
        </span>
      </div>
    </Link>
  );
}
