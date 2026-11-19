import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BeforeAfter } from "@/components/sections/before-after";
import { CardGrid } from "@/components/sections/card-grid";
import { ContentSection } from "@/components/sections/content-section";
import { CtaBand } from "@/components/sections/cta-band";
import { DivisionsStrip } from "@/components/sections/divisions-strip";
import { Gallery } from "@/components/sections/gallery";
import { SectorGrid } from "@/components/sections/sector-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { Container } from "@/components/ui/container";
import { HeroTitle } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Section } from "@/components/ui/section";
import { divisions } from "@/content/divisions";
import { relatedServices } from "@/content/related-services";
import { OUTDOOR_ENVIRONMENTS_TILE, SECTOR_TILES } from "@/content/sectors";
import { testimonials } from "@/content/testimonials";
import { routes } from "@/lib/routes";

/**
 * Dev-only catalogue of the shared body sections (sectors, cards, gallery, before/after,
 * divisions strip, testimonials, CTA band) with real content from the original pages named in each
 * header comment. Used by tests/e2e/sections-b.spec.ts. Disabled in production unless
 * ENABLE_STYLEGUIDE=1.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide: sections B",
  robots: { index: false, follow: false },
};

// TODO(content): KI-C08. Placeholder lead shown verbatim by the original's testimonial sections.
const TESTIMONIALS_LEAD =
  "Selected feedback from people we’ve designed and built for. Representative copy — replace with approved client testimonials.";

const testimonialsHeader = {
  kicker: "Client testimonials",
  title: (
    <>
      In our clients’
      <br />
      words
    </>
  ),
  lead: TESTIMONIALS_LEAD,
  cta: { label: "Read All Client Reviews", href: routes.reviews, variant: "dark" },
} as const;

/** Every featured-project card links to the one project page that exists for now (KI-F09). */
const PROJECT = routes.project("courtyard-house");

export default function SectionsBStyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      <Section tone="dark" spacing="none" fullHeight={false} className="pt-160 pb-80">
        <Container>
          <Kicker>Design system</Kicker>
          <HeroTitle className="mt-22">Sections B</HeroTitle>
        </Container>
      </Section>

      {/* Turnkey: sectors (dark). */}
      <ContentSection
        tone="dark"
        header={{
          kicker: "Turnkey solutions across sectors",
          title: (
            <>
              Turnkey for
              <br />
              every sector
            </>
          ),
          lead: "Residential, commercial, institutional and hospitality projects.",
        }}
      >
        <div data-testid="sectors-dark">
          <SectorGrid sectors={SECTOR_TILES} />
        </div>
      </ContentSection>

      {/* Exterior: sectors + the non-link "Outdoor environments" tile (light). */}
      <ContentSection
        tone="light"
        header={{
          kicker: "Project types",
          title: (
            <>
              Where we
              <br />
              work outdoors
            </>
          ),
          lead: "Residential, commercial, institutional, hospitality and outdoor environments.",
        }}
      >
        <div data-testid="sectors-light">
          <SectorGrid sectors={SECTOR_TILES} extra={OUTDOOR_ENVIRONMENTS_TILE} />
        </div>
      </ContentSection>

      {/* Interior: featured projects, c4 (light). */}
      <ContentSection
        tone="light"
        header={{
          kicker: "Featured projects",
          title: (
            <>
              Interiors across
              <br />
              every sector
            </>
          ),
          lead: "Residential, commercial, institutional and hospitality interiors.",
          cta: { label: "View All Interiors", href: routes.worksCategory("interiors") },
        }}
      >
        <div data-testid="cards-project-c4">
          <CardGrid
            variant="project"
            columns={4}
            items={[
              {
                href: PROJECT,
                image: "photos/city-view-living-room",
                alt: "Cinder House",
                meta: "Residential · Interiors · Dubai, UAE",
                title: "Cinder House",
              },
              {
                href: PROJECT,
                image: "photos/garden-veranda-chairs",
                alt: "Serein Wellness Club",
                meta: "Hospitality · Interiors · Abu Dhabi, UAE",
                title: "Serein Wellness Club",
              },
              {
                href: PROJECT,
                image: "photos/office-reception",
                alt: "DIFC Gallery Office",
                meta: "Commercial · Interiors · DIFC, Dubai",
                title: "DIFC Gallery Office",
              },
              {
                href: PROJECT,
                image: "photos/apartment-living-sea-view",
                alt: "Harbour Loft",
                meta: "Residential · Interiors · Marine Drive, Kochi",
                title: "Harbour Loft",
              },
            ]}
          />
        </div>
      </ContentSection>

      {/* Interior: related services, c3 (dark). */}
      <ContentSection
        tone="dark"
        header={{
          kicker: "Related services",
          title: (
            <>
              Services that work
              <br />
              alongside interiors
            </>
          ),
        }}
      >
        <div data-testid="cards-service-dark">
          <CardGrid
            variant="service"
            columns={3}
            items={relatedServices(["architecture", "construction", "turnkey"])}
          />
        </div>
      </ContentSection>

      {/* Turnkey: related services, c3 (light). */}
      <ContentSection
        tone="light"
        header={{
          kicker: "Related services",
          title: (
            <>
              Explore the
              <br />
              disciplines
            </>
          ),
        }}
      >
        <div data-testid="cards-service-light">
          <CardGrid
            variant="service"
            columns={3}
            items={relatedServices(["architecture", "interior", "construction"])}
          />
        </div>
      </ContentSection>

      {/* Exterior: featured projects, c3 (dark). */}
      <ContentSection
        tone="dark"
        header={{
          kicker: "Featured exterior & landscape projects",
          title: (
            <>
              Outdoor spaces
              <br />
              we’ve shaped
            </>
          ),
          // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
          lead: "Selected projects with images and case-study links.",
          cta: { label: "View All Projects", href: routes.works, variant: "outline-light" },
        }}
      >
        <div data-testid="cards-project-dark">
          <CardGrid
            variant="project"
            columns={3}
            items={[
              {
                href: PROJECT,
                image: "photos/brick-house-garden-path",
                alt: "Canopy House",
                meta: "Residential · Architecture · Thrippunithura, Kochi",
                title: "Canopy House",
              },
              {
                href: PROJECT,
                image: "photos/contemporary-villa-entrance",
                alt: "Jumeirah Courtyard House",
                meta: "Residential · Architecture · Jumeirah, Dubai",
                title: "Jumeirah Courtyard House",
              },
              {
                href: PROJECT,
                image: "photos/riverside-house-night",
                alt: "River Edge Villa",
                meta: "Residential · Villa · Aluva, Kerala",
                title: "River Edge Villa",
              },
            ]}
          />
        </div>
      </ContentSection>

      {/* Factory: gallery (dark). */}
      <ContentSection
        tone="dark"
        header={{
          kicker: "Factory gallery",
          title: (
            <>
              Inside the
              <br />
              workshop
            </>
          ),
          lead: "The facility, the team and production in progress.",
        }}
      >
        <div data-testid="gallery">
          <Gallery
            items={[
              {
                image: "photos/massing-model",
                alt: "Model & mock-ups",
                caption: "Model & mock-ups",
              },
              {
                image: "photos/timber-screen-atrium",
                alt: "Timber screens",
                caption: "Timber screens",
              },
              {
                image: "photos/teak-stair-handrail",
                alt: "Handrail detail",
                caption: "Handrail detail",
              },
              { image: "photos/bedroom-teak-screen", alt: "Teak screen", caption: "Teak screen" },
              {
                image: "photos/timber-lounge-chair",
                alt: "Joinery in place",
                caption: "Joinery in place",
                wide: true,
              },
            ]}
          />
        </div>
      </ContentSection>

      {/* Factory: finished products, c3 (light). */}
      <ContentSection
        tone="light"
        header={{
          kicker: "Finished products",
          title: (
            <>
              Made here.
              <br />
              Lived in there.
            </>
          ),
          lead: "How factory-made pieces come together in completed KATIC interiors.",
        }}
      >
        <div data-testid="cards-product">
          <CardGrid
            variant="product"
            columns={3}
            items={[
              {
                href: PROJECT,
                image: "photos/kitchen-island-teak",
                alt: "Kitchen island & cabinetry",
                title: "Kitchen island & cabinetry",
                text: "Teak and honed stone kitchen for The Courtyard House.",
              },
              {
                href: PROJECT,
                image: "photos/bedroom-teak-screen",
                alt: "Bedroom screen & wardrobe",
                title: "Bedroom screen & wardrobe",
                text: "Teak screen and full-height storage in the main bedroom.",
              },
              {
                href: PROJECT,
                image: "photos/timber-lounge-chair",
                alt: "Dining joinery",
                title: "Dining joinery",
                text: "Built-in sideboard and dining wall along the courtyard edge.",
              },
            ]}
          />
        </div>
      </ContentSection>

      {/* Renovation: before & after (light). */}
      <ContentSection
        tone="light"
        id="ba"
        header={{
          kicker: "Before & after",
          title: "Transformations",
          // TODO(content): KI-C08, KI-C11. Placeholder note and stock pairs from the original.
          lead: "Paired photographs and short descriptions of completed renovations. Representative images — replace with real before-and-after photography.",
        }}
      >
        <div data-testid="before-after">
          <BeforeAfter
            pairs={[
              {
                before: {
                  image: "photos/house-under-construction",
                  alt: "The Old Mill Renewal before renovation",
                },
                after: {
                  image: "photos/brick-house-arched-windows-night",
                  alt: "The Old Mill Renewal after renovation",
                },
                title: "The Old Mill Renewal",
                meta: "Commercial · Aluva",
                text: "An industrial shell retained and opened up for a new public use, with new glazing, services and finishes.",
              },
              {
                before: {
                  image: "photos/architect-site-drawings",
                  alt: "Kottayam Family Home before renovation",
                },
                after: {
                  image: "photos/kerala-house-pond",
                  alt: "Kottayam Family Home after renovation",
                },
                title: "Kottayam Family Home",
                meta: "Residential · Kottayam",
                text: "A tired 1990s house re-planned around a new courtyard, with a new roof, kitchen and bedrooms.",
              },
            ]}
          />
        </div>
      </ContentSection>

      {/* Works: division cards, c5 (dark). */}
      <ContentSection
        tone="dark"
        header={{
          kicker: "Explore divisions",
          title: (
            <>
              One vision.
              <br />
              Five divisions.
            </>
          ),
        }}
      >
        <div data-testid="cards-division">
          <CardGrid
            variant="service"
            columns={5}
            moreLabel="Explore Division"
            items={divisions(["design", "interior", "infrastructure", "developers", "care"]).map(
              (division) => ({
                href: division.href,
                image: division.image,
                alt: division.alt,
                title: division.name,
                text: division.description,
              }),
            )}
          />
        </div>
      </ContentSection>

      {/* Interior: divisions strip (light); turnkey: all five (dark). */}
      <div data-testid="divisions-light">
        <DivisionsStrip tone="light" items={divisions(["interior", "design", "infrastructure"])} />
      </div>
      <div data-testid="divisions-dark">
        <DivisionsStrip
          tone="dark"
          items={divisions(["developers", "design", "interior", "infrastructure", "care"])}
        />
      </div>

      {/* Interior: testimonials (dark); turnkey: testimonials (light). */}
      <ContentSection tone="dark" header={testimonialsHeader}>
        <div data-testid="testimonials-dark">
          <Testimonials items={testimonials(["ernakulam", "kozhikode", "alappuzha"])} />
        </div>
      </ContentSection>
      <ContentSection tone="light" header={testimonialsHeader}>
        <div data-testid="testimonials-light">
          <Testimonials items={testimonials(["thrissur", "alappuzha", "arch"])} />
        </div>
      </ContentSection>

      {/* Works, project and reviews CTA bands. */}
      <CtaBand
        variant="works"
        data-testid="cta-works"
        image="photos/pavilion-house-night"
        alt="Your project could be next."
        kicker="Start a project"
        title={
          <>
            Your project could be
            <br />
            next.
          </>
        }
        text="Tell us what you want to build, where you are, and what matters most. We’ll bring the right disciplines to the table."
        cta={{ label: "Start Your Project", href: "#contact" }}
        call={{
          label: "PREFER TO CALL?",
          phone: { display: "+91 8086 000 600", href: "tel:+918086000600" },
          hours: "Mon—Sat · 9:30 AM—6:30 PM IST",
        }}
      />
      <CtaBand
        variant="project"
        data-testid="cta-project"
        image="photos/brick-courtyard-house-dusk-panorama"
        alt="Planning a Similar Project?"
        kicker="Begin a conversation"
        title={
          <>
            Planning a Similar
            <br />
            Project?
          </>
        }
        text="Tell us about your site, the way your family lives, and what you hope the project can become. We’ll help define a clear first step."
        cta={{ label: "Discuss Your Project", href: "#contact" }}
      />
      <CtaBand
        variant="reviews"
        data-testid="cta-reviews"
        image="photos/garden-room-window-seat"
        alt="Garden room with tall timber windows, built-in seating and tropical planting"
        kicker="Begin a conversation"
        title={
          <>
            Ready to Create Your
            <br />
            Own Space?
          </>
        }
        text="Tell us about your project and let’s start a conversation."
        cta={{ label: "Start Your Project", href: "#contact" }}
      />
    </>
  );
}
