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

import { withContactTarget } from "./page-plan";
import { LineBreaks } from "./title-text";

/**
 * The original's first class of every standard block (`section.ks`, `section.ks.slim`, and
 * `section.pp-host.ks` when it hosts a plant). The blocks have no ids, so the parity tool matches
 * them by this class and their order (P5-01).
 */
function parityClass(section: ServiceSection): "ks" | "pp-host" {
  return section.type !== "divisions" && section.plant ? "pp-host" : "ks";
}

type ServiceSectionViewProps = {
  readonly section: ServiceSection;
  readonly tone: Tone;
  /** Id of the page's contact section, the no-JavaScript target of "go to contact" CTAs. */
  readonly contactId: string;
};

/**
 * Renders one section of a service page with the shared section library (Phase 3): a
 * `ContentSection` (tone, rhythm, `.kh` header, plant) around the body component of its type.
 * Shared entities referenced by id are resolved here.
 *
 * The switch is exhaustive: adding a member to `ServiceSection` fails the build until it has a
 * case here.
 */
export function ServiceSectionView({ section, tone, contactId }: ServiceSectionViewProps) {
  const base = {
    tone,
    "data-parity": parityClass(section),
    ...(section.id ? { id: section.id } : {}),
  };
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
    default:
      return assertNever(section);
  }
}

function headerProps({ kicker, title, lead, cta }: SectionHeaderContent): SectionHeaderProps {
  return {
    kicker,
    title: <LineBreaks lines={title} />,
    ...(lead ? { lead } : {}),
    ...(cta ? { cta } : {}),
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
