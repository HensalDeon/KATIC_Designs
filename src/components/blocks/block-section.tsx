import { BeforeAfter } from "@/components/sections/before-after";
import { CardGrid, type CardItem } from "@/components/sections/card-grid";
import { ContentSection } from "@/components/sections/content-section";
import { DivisionsStrip } from "@/components/sections/divisions-strip";
import { FeatureGrid } from "@/components/sections/feature-grid";
import { Gallery } from "@/components/sections/gallery";
import { ProcessSteps } from "@/components/sections/process-steps";
import { RowList } from "@/components/sections/row-list";
import type { SectionHeaderProps } from "@/components/sections/section-header";
import { SectorGrid } from "@/components/sections/sector-grid";
import { SplitFeature } from "@/components/sections/split-feature";
import { Testimonials } from "@/components/sections/testimonials";
import {
  type ContentBlock,
  type ProductCardContent,
  type ProjectCardContent,
  type SectionHeaderContent,
  TESTIMONIALS_HEADER,
} from "@/content/blocks";
import { divisions } from "@/content/divisions";
import { PROCESS_STAGES } from "@/content/process-stages";
import { getProject, projectHref } from "@/content/projects";
import { relatedServices } from "@/content/related-services";
import { SECTORS } from "@/content/sectors";
import { testimonials } from "@/content/testimonials";
import type { Tone } from "@/lib/tone";

import { withContactTarget } from "./block-plan";
import { LineBreaks } from "./title-text";

/** Page-level settings every block of a page shares. */
export type BlockContext = {
  /**
   * `#<id>` of the page's own enquiry form: the no-JavaScript target of "go to contact" CTAs.
   * Omit on pages without one (their CTAs open Start-a-Project or go to home's form).
   */
  readonly contactHref?: string;
  /** Page-level section-title classes (P1-04), e.g. architecture's 1.14 line height. */
  readonly titleClassName?: string;
};

/**
 * The original's first class of a block (`section.ks`, `section.ks.slim`, and `section.pp-host.ks`
 * when it carries a plant). Blocks without an id are matched by this class and their order in the
 * parity tool (P5-01).
 */
export function blockParityClass(block: ContentBlock): "ks" | "pp-host" {
  return block.type !== "divisions" && block.plant ? "pp-host" : "ks";
}

/** "Explore Division" cards (`.kc` division flavour), as on About, Works and the division pages. */
export const DIVISION_MORE_LABEL = "Explore Division";

type BlockSectionProps = {
  readonly block: ContentBlock;
  readonly tone: Tone;
  readonly context?: BlockContext;
};

/**
 * Renders one generic content block (`section.ks`, docs/analysis/03 §1, 04 §3) with the shared
 * section library (Phase 3): a `ContentSection` (tone, rhythm, `.kh` header, plant) around the
 * body component of its type. Shared entities referenced by id are resolved here.
 *
 * The switch is exhaustive: adding a member to `ContentBlock` fails the build until it has a case.
 */
export function BlockSection({ block, tone, context = {} }: BlockSectionProps) {
  const headerProps = (header: SectionHeaderContent) =>
    toHeaderProps(header, context.titleClassName);
  const base = {
    tone,
    "data-parity": blockParityClass(block),
    ...(block.id ? { id: block.id } : {}),
  };
  const shell = {
    ...base,
    ...(block.type !== "divisions" && block.plant ? { plant: block.plant } : {}),
  };

  switch (block.type) {
    case "split":
      return (
        <ContentSection {...shell}>
          <SplitFeature
            image={block.image}
            kicker={block.kicker}
            title={<LineBreaks lines={block.title} />}
            {...(context.titleClassName ? { titleClassName: context.titleClassName } : {})}
            {...(block.caption ? { caption: block.caption } : {})}
            {...(block.lead ? { lead: block.lead } : {})}
            {...(block.body ? { body: block.body } : {})}
            {...(block.bullets ? { bullets: block.bullets } : {})}
            {...(block.cta
              ? { cta: { ...block.cta, ...withContactTarget(block.cta, context.contactHref) } }
              : {})}
            {...(block.reverse ? { reverse: true } : {})}
          />
        </ContentSection>
      );
    case "rows":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <RowList items={block.items} />
        </ContentSection>
      );
    case "features":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <FeatureGrid columns={block.columns} items={block.items} />
        </ContentSection>
      );
    case "process":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <ProcessSteps
            steps={block.steps.map((step) =>
              typeof step === "string" ? PROCESS_STAGES[step] : step,
            )}
          />
        </ContentSection>
      );
    case "sectors":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <SectorGrid
            sectors={block.sectors.map((key) => SECTORS[key])}
            {...(block.extra ? { extra: block.extra } : {})}
          />
        </ContentSection>
      );
    case "projects":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <CardGrid
            variant="project"
            columns={block.columns}
            items={block.items.map(projectCard)}
          />
        </ContentSection>
      );
    case "products":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <CardGrid
            variant="product"
            columns={block.columns}
            items={block.items.map(productCard)}
          />
        </ContentSection>
      );
    case "cards":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <CardGrid
            variant="project"
            columns={block.columns}
            items={block.items}
            {...(block.moreLabel ? { moreLabel: block.moreLabel } : {})}
          />
        </ContentSection>
      );
    case "gallery":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <Gallery items={block.items} />
        </ContentSection>
      );
    case "beforeAfter":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <BeforeAfter pairs={block.pairs} />
        </ContentSection>
      );
    case "related":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <CardGrid
            variant="service"
            columns={block.columns}
            items={relatedServices(block.services)}
          />
        </ContentSection>
      );
    case "divisionCards":
      return (
        <ContentSection {...shell} header={headerProps(block.header)}>
          <CardGrid
            variant="service"
            columns={block.columns}
            moreLabel={DIVISION_MORE_LABEL}
            items={divisions(block.divisions).map((division) => ({
              href: division.href,
              image: division.image,
              alt: division.alt,
              title: division.name,
              text: division.description,
            }))}
          />
        </ContentSection>
      );
    case "divisions":
      return <DivisionsStrip {...base} items={divisions(block.divisions)} />;
    case "testimonials":
      return (
        <ContentSection {...shell} header={headerProps(block.header ?? TESTIMONIALS_HEADER)}>
          <Testimonials items={testimonials(block.testimonials)} />
        </ContentSection>
      );
    default:
      return assertNever(block);
  }
}

function toHeaderProps(
  { kicker, title, lead, cta }: SectionHeaderContent,
  titleClassName: string | undefined,
): SectionHeaderProps {
  return {
    kicker,
    title: <LineBreaks lines={title} />,
    ...(lead ? { lead } : {}),
    ...(cta ? { cta } : {}),
    ...(titleClassName ? { titleClassName } : {}),
  };
}

function projectCard({ project: slug, meta, image, tag }: ProjectCardContent): CardItem {
  const project = getProject(slug);
  return {
    href: projectHref(project),
    image: image?.src ?? project.cover,
    alt: image?.alt ?? project.coverAlt,
    title: project.name,
    meta,
    ...(tag ? { tag } : {}),
  };
}

function productCard({ title, text, image, alt, project }: ProductCardContent): CardItem {
  return {
    image,
    alt,
    title,
    text,
    ...(project ? { href: projectHref(getProject(project)) } : {}),
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled content block: ${JSON.stringify(value)}`);
}
