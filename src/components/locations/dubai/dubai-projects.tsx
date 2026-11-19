import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { LineBreaks } from "@/components/blocks/title-text";
import { canvasSizes, resolveImage } from "@/components/sections/section-media";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import type { TitleLines } from "@/content/blocks";
import { getProject, projectHref, type ProjectSlug } from "@/content/projects";
import { cn } from "@/lib/cn";

import type { DubaiBlockProps } from "./dubai-block-props";
import { DUBAI_TITLE } from "./dubai-title";

/**
 * A mosaic card: the project by slug (name, location, cover and link come from `projects.ts`), with
 * the card's own two labels. Cards describe the same project differently across pages (KI-D01:
 * "TURNKEY PROJECT" here, "Turnkey" elsewhere), so the labels are verbatim per card, not derived.
 */
export type MosaicCard = {
  readonly project: ProjectSlug;
  /** Small caps line over the photo, e.g. "RESIDENTIAL VILLA". */
  readonly label: string;
  /** Right end of the caption under the photo, e.g. "ARCHITECTURE". */
  readonly scope: string;
};

/**
 * Row layouts of the mosaic (`.g1`, `.g2`): `wide-first` = 765px + rest, 475px photos;
 * `narrow-first` = 528px + rest, 445px photos.
 */
export type MosaicRowLayout = "wide-first" | "narrow-first";

export type MosaicRow = {
  readonly layout: MosaicRowLayout;
  readonly cards: readonly [MosaicCard, MosaicCard];
};

/** Copy of the projects block (plain data: will come from Laravel). */
export type DubaiProjectsContent = {
  readonly kicker: string;
  readonly title: TitleLines;
  readonly body: string;
  readonly rows: readonly MosaicRow[];
  readonly cta: { readonly label: string; readonly href: string };
};

/** One column below 1100px (36px apart); the photo heights hold until phones (320px). */
const rowVariants = cva("grid gap-24 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36", {
  variants: {
    layout: {
      "wide-first": "mt-62 grid-cols-[765px_1fr]",
      "narrow-first": "mt-30 grid-cols-[528px_1fr]",
    },
  },
});

const photoVariants = cva("relative overflow-hidden max-md:h-320", {
  variants: {
    layout: { "wide-first": "h-475", "narrow-first": "h-445" },
  },
});

/** Canvas width of each card per layout, for `sizes`. */
const CARD_WIDTHS: Record<MosaicRowLayout, readonly [number, number]> = {
  "wide-first": [765, 479],
  "narrow-first": [528, 716],
};

/**
 * "Our Dubai Projects." (`#p-dubai section.s5`, original lines 4186–4200, page `<style>` 4140–4148,
 * rendered black by `data-fx=168`): a `.two` header (kicker and title in 646px, the paragraph
 * 46px down on the right), two rows of two project cards (765px + rest, then 528px + rest), and a
 * centred "View Our Work" button. Each card is a photo with a bottom gradient, the label and the
 * project name over it, and a location / scope caption below; hovering scales the photo to 1.04
 * over .8s. One column below 1100px; 320px photos on phones. Its greys are the ones the original
 * renders on black (the page places it on black).
 *
 * Fixes: the label and name sit in one bottom-anchored column, so a name that wraps on phones no
 * longer covers the label (KI-L10); labels and captions are 11px on phones (KI-A10); the kicker on
 * black is brand orange (KI-A11); the title scales 58 → 46 → 34 (KI-N04). Cards link through
 * `projectHref` (P7-02).
 */
export function DubaiProjects({ content, tone, id }: DubaiBlockProps<DubaiProjectsContent>) {
  const titleId = "dubai-projects-title";
  return (
    <Section tone={tone} id={id} data-parity="s5" aria-labelledby={titleId}>
      <Container>
        <div className="grid grid-cols-[646px_1fr] max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-36">
          <div>
            <Kicker>{content.kicker}</Kicker>
            <SectionTitle id={titleId} className={cn("mt-22 text-[#f4f4f4]", DUBAI_TITLE)}>
              <LineBreaks lines={content.title} />
            </SectionTitle>
          </div>
          <p className="mt-46 font-sans text-[14.5px] leading-[1.8] text-[#a1a4aa]">
            {content.body}
          </p>
        </div>

        {content.rows.map((row) => (
          <ul key={row.cards.map((card) => card.project).join()} className={rowVariants(row)}>
            {row.cards.map((card, index) => (
              <li key={card.project}>
                <ProjectTile
                  card={card}
                  layout={row.layout}
                  width={CARD_WIDTHS[row.layout][index]}
                />
              </li>
            ))}
          </ul>
        ))}

        <div className="mt-62 text-center">
          <ButtonLink
            href={content.cta.href}
            variant="dark"
            size="base"
            icon="up-right"
            className="h-54 border-[#30343c] bg-black text-mist"
          >
            {content.cta.label}
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}

function ProjectTile({
  card,
  layout,
  width = 0,
}: {
  card: MosaicCard;
  layout: MosaicRowLayout;
  width: number | undefined;
}) {
  const project = getProject(card.project);
  return (
    <Link href={projectHref(project)} className="group block text-white">
      <span
        className={cn(
          photoVariants({ layout }),
          "block after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent_60%,rgba(0,0,0,0.6))] after:content-['']",
        )}
      >
        <Image
          src={resolveImage(project.cover)}
          alt={project.coverAlt}
          sizes={canvasSizes(width, "calc(100vw - 72px)", "calc(100vw - 40px)")}
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
        />
        <span className="absolute right-0 bottom-18 left-22 z-2 flex flex-col gap-1 font-sans">
          <small className="text-[9px] font-medium tracking-[0.2em] max-md:text-[11px]">
            {card.label}
          </small>
          <b className="text-[26px] font-normal">{project.name}</b>
        </span>
      </span>
      <span className="mt-12 flex justify-between font-sans text-[9.5px] tracking-[0.2em] text-[#aaa] max-md:text-[11px]">
        <span className="text-[10.5px] tracking-normal max-md:text-[11px]">{project.location}</span>
        <span>{card.scope}</span>
      </span>
    </Link>
  );
}
