import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentSection } from "@/components/sections/content-section";
import { FeatureGrid, type FeatureGridItem } from "@/components/sections/feature-grid";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessSteps } from "@/components/sections/process-steps";
import { RowList, type RowListItem } from "@/components/sections/row-list";
import { SplitFeature } from "@/components/sections/split-feature";
import { Accent } from "@/components/ui/heading";
import { media } from "@/content/media";
import { processStages } from "@/content/process-stages";
import { routes } from "@/lib/routes";

/**
 * Dev-only catalogue of the shared page sections built in Phase 3 (group A: hero, split, rows,
 * feature grid, process steps), filled with real content from the original pages. Used for visual
 * review against the original and by tests/e2e/sections-a.spec.ts. Disabled in production unless
 * ENABLE_STYLEGUIDE=1.
 */
const ENABLED = process.env.NODE_ENV !== "production" || process.env["ENABLE_STYLEGUIDE"] === "1";

export const metadata: Metadata = {
  title: "Styleguide: sections A",
  robots: { index: false, follow: false },
};

/** Interior "Our interior services" (dark): only the joinery row links (to the factory page). */
const INTERIOR_ROWS: readonly RowListItem[] = [
  {
    icon: "sofa",
    title: "Interior planning",
    text: "Space planning, layouts and furniture zoning around daily routines.",
  },
  {
    icon: "layers",
    title: "Materials & finishes",
    text: "Curated palettes of stone, timber, fabric and metal, sampled on site.",
  },
  {
    icon: "wardrobe",
    title: "Furniture & joinery",
    text: "Bespoke furniture and joinery made in our own factory.",
    href: routes.service("factory"),
  },
  {
    icon: "bulb",
    title: "Lighting design",
    text: "Ambient, task and accent lighting planned with the architecture.",
  },
  {
    icon: "crane",
    title: "Execution & installation",
    text: "Coordinated site execution, installation and finishing.",
  },
];

/** Turnkey "What we deliver" (light): every row links to its service page. */
const TURNKEY_ROWS: readonly RowListItem[] = [
  {
    icon: "facade",
    title: "Architecture & approvals",
    text: "Design, drawings and local authority approvals.",
    href: routes.service("architecture"),
  },
  {
    icon: "crane",
    title: "Construction",
    text: "Civil, structural and MEP works by our own teams.",
    href: routes.service("construction"),
  },
  {
    icon: "wardrobe",
    title: "Interiors & furniture",
    text: "Interior design, joinery and furniture from our factory.",
    href: routes.service("interior"),
  },
  {
    icon: "leaf",
    title: "Exterior & landscape",
    text: "Facades, gardens and outdoor living spaces.",
    href: routes.service("exterior"),
  },
  {
    icon: "key",
    title: "Handover & aftercare",
    text: "Snagging, documentation and ongoing care.",
    href: routes.service("property-care"),
  },
];

/** Factory "What we make" (dark, 3 columns). */
const FACTORY_FEATURES: readonly FeatureGridItem[] = [
  {
    icon: "kitchen",
    title: "Kitchens",
    text: "Modular and bespoke kitchens with stone, laminate, veneer and lacquer finishes.",
  },
  {
    icon: "wardrobe",
    title: "Wardrobes & storage",
    text: "Built-in wardrobes, walk-ins and storage walls made to fit.",
  },
  {
    icon: "wardrobe",
    title: "Wall panelling & screens",
    text: "Timber panelling, fluted surfaces, jaalis and room dividers.",
  },
  {
    icon: "wardrobe",
    title: "Loose furniture",
    text: "Dining tables, beds, consoles and seating in solid wood and veneer.",
  },
  {
    icon: "door",
    title: "Doors & frames",
    text: "Internal doors, frames and architraves finished to match.",
  },
  {
    icon: "target",
    title: "Custom details",
    text: "Reception desks, display units and one-off pieces for commercial spaces.",
  },
];

/** Construction "What we build" (light, 3 columns). */
const CONSTRUCTION_FEATURES: readonly FeatureGridItem[] = [
  {
    icon: "crane",
    title: "Residential construction",
    text: "Homes, villas and apartments, from foundations to finishes.",
  },
  {
    icon: "crane",
    title: "Commercial construction",
    text: "Offices, retail and mixed-use buildings built to programme.",
  },
  {
    icon: "crane",
    title: "Structural & civil works",
    text: "Foundations, frames, masonry and civil works to engineered drawings.",
  },
  {
    icon: "team",
    title: "Project coordination",
    text: "Scheduling, trades, procurement and site management under one lead.",
  },
  {
    icon: "team",
    title: "MEP coordination",
    text: "Electrical, plumbing and services installed in sequence.",
  },
  {
    icon: "layers",
    title: "Finishing",
    text: "Flooring, plaster, paint, joinery and fit-out to specification.",
  },
];

/** Turnkey "Why one team works better" (dark, 4 columns). */
const TURNKEY_WHY: readonly FeatureGridItem[] = [
  {
    icon: "team",
    title: "One coordinated team",
    text: "Architects, interior designers and site teams work from the same drawings.",
  },
  {
    icon: "team",
    title: "Clear accountability",
    text: "One contract and one point of contact for every decision.",
  },
  {
    icon: "star",
    title: "A streamlined journey",
    text: "Fewer hand-offs, faster decisions and no gaps between trades.",
  },
  {
    icon: "shield",
    title: "Design intent protected",
    text: "The people who designed it oversee how it is built.",
  },
];

/** Factory "Every piece checked twice" (light): factory-specific steps, not master stages. */
const FACTORY_STEPS = [
  {
    icon: "layers",
    title: "Material selection",
    text: "Seasoned timber and certified boards, checked for moisture and grade.",
  },
  {
    icon: "target",
    title: "Precision cutting",
    text: "CNC and panel saws cut to drawing tolerances.",
  },
  {
    icon: "target",
    title: "Assembly & detailing",
    text: "Joinery assembled and hardware fitted by skilled craftspeople.",
  },
  {
    icon: "layers",
    title: "Finishing",
    text: "Sanding, polishing, lacquer and veneer finishes in a controlled area.",
  },
  {
    icon: "shield",
    title: "Quality inspection",
    text: "Each piece is inspected, protected and labelled before dispatch.",
  },
] as const;

export default function SectionsAStyleguidePage() {
  if (!ENABLED) notFound();

  return (
    <>
      {/* Interior hero: popup CTA with the page's service + link. */}
      <PageHero
        data-testid="hero-service"
        image={{
          src: "photos/sofa-jali-detail",
          alt: media["photos/sofa-jali-detail"].description,
        }}
        kicker="Interior Design · Kerala & UAE"
        title={
          <>
            Interiors Made
            <br />
            for <Accent>Everyday Life</Accent>
          </>
        }
        lead="Interior planning, materials, furniture and execution — designed, made and installed by one team."
        primaryCta={{ kind: "enquiry", label: "Discuss Your Interior", service: "Interior Design" }}
        secondaryCta={{
          kind: "link",
          label: "View Interior Projects",
          href: routes.worksCategory("interiors"),
        }}
      />

      {/* Philosophy split (light), image left, bullets. */}
      <ContentSection tone="light" id="split-light">
        <SplitFeature
          data-testid="split-light"
          image={{
            src: "photos/timber-lounge-chair",
            alt: media["photos/timber-lounge-chair"].description,
          }}
          caption="Dining room · teak joinery"
          kicker="Philosophy"
          title={
            <>
              Beauty that
              <br />
              works hard
            </>
          }
          lead="We design interiors that look considered and live easily — balancing aesthetics with function, durable materials and precise detailing."
          body="Every room starts with how it will be used: the light at different hours, the way people gather, what needs to be stored and what deserves to be seen. Materials are chosen for how they age, not only how they photograph."
          bullets={[
            "Functional planning",
            "Natural, durable materials",
            "Integrated joinery",
            "Layered lighting",
          ]}
          lightboxGroup="sections-a"
        />
      </ContentSection>

      {/* Interior services rows (dark). */}
      <ContentSection
        tone="dark"
        id="rows-dark"
        header={{
          kicker: "Our interior services",
          title: (
            <>
              Our interior
              <br />
              services
            </>
          ),
          lead: "From the first space plan to the last cabinet handle, every interior discipline sits under one roof.",
        }}
      >
        <RowList data-testid="rows-dark" items={INTERIOR_ROWS} />
      </ContentSection>

      {/* Factory split (light), reversed, with CTA. */}
      <ContentSection tone="light" id="split-reverse">
        <SplitFeature
          data-testid="split-reverse"
          reverse
          image={{
            src: "photos/kitchen-island-teak",
            alt: media["photos/kitchen-island-teak"].description,
          }}
          caption="Kitchen · teak & stone"
          kicker="Factory & manufacturing"
          title={
            <>
              Made in our
              <br />
              own workshop
            </>
          }
          lead="Our factory produces the joinery, furniture and interior components we specify — so quality, finish and timelines stay in our hands."
          body="Kitchens, wardrobes, panelling, loose furniture and custom details are fabricated in-house and installed by the same team that designed them."
          bullets={[
            "Modular kitchens & wardrobes",
            "Wall panelling & screens",
            "Loose & built-in furniture",
            "Finishing & QC",
          ]}
          cta={{ kind: "link", label: "Visit the Factory", href: routes.service("factory") }}
          lightboxGroup="sections-a"
        />
      </ContentSection>

      {/* Interior 5-step process (dark). */}
      <ContentSection
        tone="dark"
        id="steps-5"
        header={{
          kicker: "Interior design process",
          title: (
            <>
              How we take
              <br />
              a room from idea
              <br />
              to finish
            </>
          ),
          lead: "The stages of our master process that apply to interiors.",
        }}
      >
        <ProcessSteps
          data-testid="steps-5"
          steps={processStages(["discovery", "concept", "design", "completion", "handover"])}
        />
      </ContentSection>

      {/* Construction capabilities (light, 3 columns). */}
      <ContentSection
        tone="light"
        id="feat-light"
        header={{
          kicker: "Construction capabilities",
          title: (
            <>
              What we
              <br />
              build
            </>
          ),
          lead: "Residential and commercial construction, project coordination and finishing.",
        }}
      >
        <FeatureGrid data-testid="feat-light" columns={3} items={CONSTRUCTION_FEATURES} />
      </ContentSection>

      {/* Construction approach split (dark) with a plant. */}
      <ContentSection
        tone="dark"
        id="split-dark"
        plant={{ asset: "plants/boxwood", corner: "bottom-right", width: 340 }}
      >
        <SplitFeature
          data-testid="split-dark"
          image={{
            src: "photos/house-under-construction",
            alt: media["photos/house-under-construction"].description,
          }}
          caption="On site · Kerala"
          kicker="Our approach"
          title={
            <>
              Planning, people
              <br />
              and quality
            </>
          }
          lead="A build is only as good as its coordination. Every site is planned, staffed and checked to the same standard."
          body="Each project has a dedicated site lead, a written programme and regular quality inspections, with progress shared with you at agreed milestones."
          bullets={[
            "Detailed programme",
            "Dedicated site lead",
            "Skilled workmanship",
            "Stage-wise QC checks",
          ]}
          lightboxGroup="sections-a"
        />
      </ContentSection>

      {/* Turnkey delivery rows (light, all links). */}
      <ContentSection
        tone="light"
        id="rows-light"
        header={{
          kicker: "What we deliver",
          title: (
            <>
              Complete project
              <br />
              delivery
            </>
          ),
          lead: "Complete project delivery for residential, commercial and hospitality spaces.",
        }}
      >
        <RowList data-testid="rows-light" items={TURNKEY_ROWS} />
      </ContentSection>

      {/* Turnkey 8-step process (dark, dense). */}
      <ContentSection
        tone="dark"
        id="steps-8"
        header={{
          kicker: "Our turnkey process",
          title: (
            <>
              Eight stages.
              <br />
              One team.
            </>
          ),
          lead: "Every stage of our master process, delivered end to end.",
        }}
      >
        <ProcessSteps
          data-testid="steps-8"
          steps={processStages([
            "discovery",
            "concept",
            "design",
            "engineering",
            "construction",
            "completion",
            "handover",
            "aftercare",
          ])}
        />
      </ContentSection>

      {/* Factory quality steps (light: dark headings, #666 text). */}
      <ContentSection
        tone="light"
        id="steps-light"
        header={{
          kicker: "Craftsmanship & quality control",
          title: (
            <>
              Every piece
              <br />
              checked twice
            </>
          ),
          lead: "Material handling, detailing, finishing standards and quality checks at each stage.",
        }}
      >
        <ProcessSteps data-testid="steps-light" steps={FACTORY_STEPS} />
      </ContentSection>

      {/* Factory capabilities (dark, 3 columns). */}
      <ContentSection
        tone="dark"
        id="feat-dark"
        header={{
          kicker: "Manufacturing capabilities",
          title: (
            <>
              What we
              <br />
              make
            </>
          ),
          lead: "Furniture, joinery and interior components produced for KATIC projects.",
        }}
      >
        <FeatureGrid data-testid="feat-dark" columns={3} items={FACTORY_FEATURES} />
      </ContentSection>

      {/* Renovation 6-step process (light here; dark on the page) — dense row. */}
      <ContentSection
        tone="light"
        id="steps-6"
        header={{
          kicker: "Our renovation process",
          title: (
            <>
              From survey
              <br />
              to handover
            </>
          ),
          lead: "The stages of our master process that apply to renovation.",
        }}
      >
        <ProcessSteps
          data-testid="steps-6"
          steps={processStages([
            "discovery",
            "design",
            "engineering",
            "construction",
            "completion",
            "handover",
          ])}
        />
      </ContentSection>

      {/* Turnkey "Why" (dark, 4 columns, empty header lead). */}
      <ContentSection
        tone="dark"
        id="feat-4"
        header={{
          kicker: "Why choose KATIC?",
          title: (
            <>
              Why one team
              <br />
              works better
            </>
          ),
        }}
      >
        <FeatureGrid data-testid="feat-4" columns={4} items={TURNKEY_WHY} />
      </ContentSection>

      {/* Architecture hero: single CTA + bottom caption, lighter shade. */}
      <PageHero
        data-testid="hero-architecture"
        variant="architecture"
        image={{
          src: "photos/lakeside-pavilion-dusk",
          alt: media["photos/lakeside-pavilion-dusk"].description,
        }}
        kicker="Architectural Design · Kerala & UAE"
        title={
          <>
            Architecture
            <br />
            Designed Around
            <br />
            <Accent>Place &amp; People</Accent>
          </>
        }
        lead="Katic Designs is an architecture practice in Kochi creating residential and commercial spaces across Kerala and the UAE."
        primaryCta={{
          kind: "enquiry",
          label: "Discuss Your Project",
          service: "Architectural Design",
        }}
        caption="Private residence · Kochi"
      />

      {/* India location hero: link first, popup second (no preselected service). */}
      <PageHero
        data-testid="hero-location"
        image={{ src: "photos/pond-house-dusk", alt: media["photos/pond-house-dusk"].description }}
        kicker="KATIC · India"
        title={
          <>
            Designing Spaces.
            <br />
            <Accent>Building Possibilities.</Accent>
          </>
        }
        lead="Architecture, interiors, construction and property care across Kerala and South India."
        primaryCta={{
          kind: "link",
          label: "Explore Our Projects",
          href: `${routes.works}#works-list`,
        }}
        secondaryCta={{ kind: "enquiry", label: "Start a Project" }}
      />
    </>
  );
}
