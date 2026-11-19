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
import { divisions } from "@/content/divisions";
import { PROCESS_STAGES } from "@/content/process-stages";
import { getProject, projectHref } from "@/content/projects";
import { relatedServices } from "@/content/related-services";
import { SECTORS } from "@/content/sectors";
import type {
  ProductCardContent,
  ProjectCardContent,
  SectionHeaderContent,
  ServiceSection,
} from "@/content/service-pages";
import { TESTIMONIALS_HEADER } from "@/content/service-pages/shared";
import { testimonials } from "@/content/testimonials";
import type { Tone } from "@/lib/tone";

import { ARCH_TITLE } from "./arch/arch-header";
import { ArchIntro } from "./arch/arch-intro";
import { ArchProcess } from "./arch/arch-process";
import { ArchProjects } from "./arch/arch-projects";
import { ArchServices } from "./arch/arch-services";
import { withContactTarget } from "./page-plan";
import { LineBreaks } from "./title-text";

/**
 * The original's first class of every standard block (`section.ks`, `section.ks.slim`). The
 * blocks have no ids, so the parity tool matches them by this class and their order (P5-01).
 */
const PARITY_CLASS = "ks";

type ServiceSectionViewProps = {
  readonly section: ServiceSection;
  readonly tone: Tone;
  /** Id of the page's contact section, the no-JavaScript target of "go to contact" CTAs. */
  readonly contactId: string;
  /** The page's section-title line height (`ServicePageContent.sectionTitleLeading`). */
  readonly titleLeading?: "standard" | "relaxed";
};

/** Title classes per page leading; `relaxed` is architecture's `#p-architecture .st` (1.14). */
const TITLE_LEADING = { standard: undefined, relaxed: ARCH_TITLE } as const;

/**
 * Renders one section of a service page with the shared section library (Phase 3): a
 * `ContentSection` (tone, rhythm, `.kh` header, plant) around the body component of its type.
 * Shared entities referenced by id are resolved here.
 *
 * The switch is exhaustive: adding a member to `ServiceSection` fails the build until it has a
 * case here.
 */
export function ServiceSectionView({
  section,
  tone,
  contactId,
  titleLeading = "standard",
}: ServiceSectionViewProps) {
  const headerProps = (header: SectionHeaderContent) =>
    toHeaderProps(header, TITLE_LEADING[titleLeading]);
  const base = { tone, "data-parity": PARITY_CLASS, ...(section.id ? { id: section.id } : {}) };
  const shell = {
    ...base,
    ...(section.type !== "divisions" && section.plant ? { plant: section.plant } : {}),
  };

  switch (section.type) {
    case "split":
      return (
        <ContentSection {...shell}>
          <SplitFeature
            image={section.image}
            kicker={section.kicker}
            title={<LineBreaks lines={section.title} />}
            {...(section.caption ? { caption: section.caption } : {})}
            {...(section.lead ? { lead: section.lead } : {})}
            {...(section.body ? { body: section.body } : {})}
            {...(section.bullets ? { bullets: section.bullets } : {})}
            {...(section.cta
              ? { cta: { ...section.cta, ...withContactTarget(section.cta, contactId) } }
              : {})}
            {...(section.reverse ? { reverse: true } : {})}
          />
        </ContentSection>
      );
    case "rows":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <RowList items={section.items} />
        </ContentSection>
      );
    case "features":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <FeatureGrid columns={section.columns} items={section.items} />
        </ContentSection>
      );
    case "process":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <ProcessSteps
            steps={section.steps.map((step) =>
              typeof step === "string" ? PROCESS_STAGES[step] : step,
            )}
          />
        </ContentSection>
      );
    case "sectors":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <SectorGrid
            sectors={section.sectors.map((key) => SECTORS[key])}
            {...(section.extra ? { extra: section.extra } : {})}
          />
        </ContentSection>
      );
    case "projects":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <CardGrid
            variant="project"
            columns={section.columns}
            items={section.items.map(projectCard)}
          />
        </ContentSection>
      );
    case "products":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <CardGrid
            variant="product"
            columns={section.columns}
            items={section.items.map(productCard)}
          />
        </ContentSection>
      );
    case "gallery":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <Gallery items={section.items} />
        </ContentSection>
      );
    case "beforeAfter":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <BeforeAfter pairs={section.pairs} />
        </ContentSection>
      );
    case "related":
      return (
        <ContentSection {...shell} header={headerProps(section.header)}>
          <CardGrid
            variant="service"
            columns={section.columns}
            items={relatedServices(section.services)}
          />
        </ContentSection>
      );
    case "divisions":
      return <DivisionsStrip {...base} items={divisions(section.divisions)} />;
    case "testimonials":
      return (
        <ContentSection {...shell} header={headerProps(section.header ?? TESTIMONIALS_HEADER)}>
          <Testimonials items={testimonials(section.testimonials)} />
        </ContentSection>
      );
    case "archIntro":
      return <ArchIntro content={section} tone={tone} {...idProps(section)} data-parity="ap" />;
    case "archServices":
      return (
        <ArchServices
          content={section}
          tone={tone}
          {...idProps(section)}
          contactHref={`#${contactId}`}
        />
      );
    case "archProcess":
      return <ArchProcess content={section} tone={tone} {...idProps(section)} />;
    case "archProjects":
      return <ArchProjects content={section} tone={tone} {...idProps(section)} />;
    default:
      return assertNever(section);
  }
}

/** The section's own id, when the content gives one (the arch blocks default to the original's). */
function idProps({ id }: Pick<ServiceSection, "id">): { id?: string } {
  return id ? { id } : {};
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

function projectCard({ project: slug, meta, image }: ProjectCardContent): CardItem {
  const project = getProject(slug);
  return {
    href: projectHref(project),
    image: image?.src ?? project.cover,
    alt: image?.alt ?? project.coverAlt,
    title: project.name,
    meta,
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
  throw new Error(`Unhandled service section: ${JSON.stringify(value)}`);
}
