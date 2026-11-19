import { TitleLines } from "@/components/home/title-lines";
import { CardGrid } from "@/components/sections/card-grid";
import { ContentSection } from "@/components/sections/content-section";
import { ABOUT_DIVISIONS, ABOUT_SERVICES, type AboutCardsContent } from "@/content/about";
import { divisions } from "@/content/divisions";
import { relatedServices, type RelatedServiceSlug } from "@/content/related-services";
import type { DivisionSlug } from "@/lib/routes";

/** `#p-about .st` keeps a 1.12 line height on phones (the shared header uses 1.1). */
const HEADER_CLASS = "max-md:[&_h2]:leading-[1.12]";

/**
 * "Our services" (`#p-about section.ks#about-services`): the standard `.kh` header with "Explore
 * All Services", then the seven service cards in four columns (`.kc-grid.c4`; the 4 + 3 layout
 * leaves the original's empty slot). Card copy and images come from the shared service list.
 */
export function AboutServices({
  content = ABOUT_SERVICES,
}: {
  readonly content?: AboutCardsContent<RelatedServiceSlug>;
}) {
  return (
    <ContentSection
      tone="light"
      id="about-services"
      header={{
        kicker: content.kicker,
        title: <TitleLines lines={content.title} />,
        lead: content.lead,
        ...(content.cta ? { cta: content.cta } : {}),
        className: HEADER_CLASS,
      }}
    >
      <CardGrid variant="service" columns={4} items={relatedServices(content.items)} />
    </ContentSection>
  );
}

/**
 * "Our divisions" (`#p-about section.ks.dk#about-divisions`): header without an action, then the
 * five division cards (`.kc-grid.c5`, "Explore Division"). Data from the shared divisions list.
 */
export function AboutDivisions({
  content = ABOUT_DIVISIONS,
}: {
  readonly content?: AboutCardsContent<DivisionSlug>;
}) {
  return (
    <ContentSection
      tone="dark"
      id="about-divisions"
      header={{
        kicker: content.kicker,
        title: <TitleLines lines={content.title} />,
        lead: content.lead,
        className: HEADER_CLASS,
      }}
    >
      <CardGrid
        variant="service"
        columns={5}
        moreLabel="Explore Division"
        items={divisions(content.items).map((division) => ({
          href: division.href,
          image: division.image,
          alt: division.alt,
          title: division.name,
          text: division.description,
        }))}
      />
    </ContentSection>
  );
}
