import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/**
 * Construction & Execution (`#p-construction`, reference/original/katic-designs-final.stripped.html
 * 3467–3491; docs/analysis/03 §2.4). Copy verbatim from the original.
 *
 * The only page that breaks the canonical order: the services grid comes first and the intro split
 * second. Its tones still follow the alternation from the services grid (white) on, which makes the
 * split black, as the original renders it, so no section overrides its tone.
 */
export const CONSTRUCTION_PAGE = {
  slug: "construction",
  seo: {
    title: "Construction Company in Kochi, Kerala | Construction & Execution | Katic Designs",
    description:
      "Residential and commercial construction built to the drawing, with site management, MEP coordination and stage-wise quality checks across Kerala.",
  },
  hero: {
    // TODO(content): KI-S06. The source image is only 837×675, soft at full bleed.
    image: {
      src: "photos/site-review-timber-screen",
      alt: "Architect and client reviewing drawings beside a timber lattice on site",
    },
    kicker: "Construction & Execution",
    title: { lines: ["Built Exactly", "to the"], accent: "Drawing" },
    lead: "Residential and commercial construction, project coordination and finishing — delivered by our own site teams.",
    primaryCta: {
      kind: "contact",
      label: "Request a Build Quote",
      service: "Construction & Execution",
    },
    secondaryCta: { kind: "link", label: "View Projects", href: `${routes.works}#works-list` },
  },
  sections: [
    {
      type: "features",
      header: {
        kicker: "Construction capabilities",
        title: ["What we", "build"],
        lead: "Residential and commercial construction, project coordination and finishing.",
      },
      columns: 3,
      items: [
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
      ],
    },
    {
      type: "split",
      plant: { asset: "plants/boxwood", corner: "bottom-right", width: 340 },
      image: {
        src: "photos/house-under-construction",
        alt: "House under construction in a forest clearing",
      },
      caption: "On site · Kerala",
      kicker: "Our approach",
      title: ["Planning, people", "and quality"],
      lead: "A build is only as good as its coordination. Every site is planned, staffed and checked to the same standard.",
      body: "Each project has a dedicated site lead, a written programme and regular quality inspections, with progress shared with you at agreed milestones.",
      bullets: [
        "Detailed programme",
        "Dedicated site lead",
        "Skilled workmanship",
        "Stage-wise QC checks",
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Built by", "our teams"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "Project type, scope and supporting imagery.",
        cta: { label: "View All Projects", href: `${routes.works}#works-list` },
      },
      columns: 3,
      items: [
        {
          project: "house-of-three-courts",
          meta: "Residential · Construction · Kottayam, Kerala",
        },
        { project: "al-quoz-atelier", meta: "Commercial · Architecture + Build · Dubai, UAE" },
        {
          project: "community-health-pavilion",
          meta: "Institutional · Construction · Aluva, Kerala",
        },
      ],
    },
    {
      type: "related",
      header: {
        kicker: "Related services",
        title: ["Services that work", "alongside construction"],
      },
      columns: 3,
      services: ["architecture", "interior", "turnkey"],
    },
    { type: "divisions", divisions: ["infrastructure", "design", "developers", "care"] },
    { type: "testimonials", testimonials: ["thrissur", "alappuzha", "home-kochi"] },
  ],
  contact: {
    heading: { lines: ["Ready to"], accent: "Build?" },
    lead: "Tell us about your site, scope and construction requirements. We’ll arrange a site visit and quote.",
    form: {
      service: { mode: "select", defaultService: "Construction & Execution" },
      extraFields: [
        {
          name: "stage",
          label: "Stage",
          options: ["Drawings ready", "Need drawings", "Mid-construction"],
        },
        {
          // KI-C13: the original posts it as `area`, the name exterior uses for site scope.
          name: "builtUpArea",
          label: "Built-up area",
          options: ["Under 2,000 sq ft", "2,000–4,000 sq ft", "4,000+ sq ft"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "What is included in your construction scope?",
          answer:
            "Civil and structural works, MEP coordination, finishing and site management — or any agreed part of these.",
        },
        {
          question: "How do you coordinate a project?",
          answer:
            "A dedicated site lead manages the programme, trades and procurement, and reports progress at agreed milestones.",
        },
        {
          question: "How long does construction take?",
          answer:
            "A typical 3,000 sq ft home takes 12–18 months depending on design, approvals and finishes.",
        },
        {
          question: "How do you control quality?",
          answer:
            "Through stage-wise inspections, material checks and sign-offs before each next stage begins.",
        },
        {
          question: "How is the budget planned?",
          answer:
            "We prepare a detailed estimate from the drawings and track costs against it throughout construction.",
          // KI-F07: the original's `href="contact"` (no `#`) only worked through JS interception.
          link: {
            label: "Request a build quote",
            action: "contact",
            service: "Construction & Execution",
          },
        },
      ],
    },
  },
} as const satisfies ServicePageContent;
