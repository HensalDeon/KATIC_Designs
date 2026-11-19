import { routes } from "@/lib/routes";

import {
  ARCH_INTRO,
  ARCH_PROCESS,
  ARCH_PROCESS_ID,
  ARCH_PROJECTS,
  ARCH_SERVICES,
} from "./architecture-blocks";
import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/** Deep-link id of the services list (`#architecture/services-list`). */
const SERVICES_ID = "services-list";

/**
 * Architectural Design (`#p-architecture`, reference/original/katic-designs-final.stripped.html
 * 3236–3412; docs/analysis/03 §2.1). Copy verbatim from the original. Four blocks are the page's
 * own (`architecture-blocks.ts`); the rest are the standard service-page blocks.
 */
export const ARCHITECTURE_PAGE = {
  slug: "architecture",
  seo: {
    title: "Architects in Kochi, Kerala | Architectural Design Services | Katic Designs",
    description:
      "Climate-responsive architectural design for homes, villas and commercial buildings in Kerala and Dubai — from site study and concept to approval drawings.",
  },
  sectionTitleLeading: "relaxed",
  hero: {
    variant: "architecture",
    image: {
      src: "photos/lakeside-pavilion-dusk",
      alt: "Low pavilion house reflected in water at dusk",
    },
    kicker: "Architectural Design · Kerala & UAE",
    title: {
      lines: ["Architecture", "Designed Around"],
      accent: "Place & People",
      accentOnNewLine: true,
    },
    lead: "Katic Designs is an architecture practice in Kochi creating residential and commercial spaces across Kerala and the UAE.",
    primaryCta: { kind: "contact", label: "Discuss Your Project", service: "Architectural Design" },
    caption: "PRIVATE RESIDENCE · KOCHI",
  },
  sections: [
    { type: "archIntro", ...ARCH_INTRO },
    { type: "archServices", id: SERVICES_ID, ...ARCH_SERVICES },
    {
      type: "sectors",
      header: {
        kicker: "Project types",
        title: ["Architecture for", "every sector"],
        lead: "Residential, commercial, institutional and hospitality.",
      },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
    },
    { type: "archProcess", id: ARCH_PROCESS_ID, ...ARCH_PROCESS },
    { type: "archProjects", id: "arch-projects", ...ARCH_PROJECTS },
    {
      type: "related",
      header: {
        kicker: "Related services",
        title: ["Services that work", "alongside architecture"],
      },
      columns: 3,
      services: ["exterior", "interior", "turnkey", "construction", "renovation", "property-care"],
    },
    { type: "divisions", divisions: ["design", "infrastructure", "developers"] },
    { type: "testimonials", testimonials: ["arch", "home-kochi", "thrissur"] },
  ],
  contact: {
    heading: { lines: ["Planning a"], accent: "New Space?" },
    lead: "Tell us about your site, requirements and vision. Our architects will get back to you within one business day.",
    form: {
      service: { mode: "select", defaultService: "Architectural Design" },
      extraFields: [
        {
          name: "ptype",
          label: "Project Type",
          options: ["Residence", "Villa", "Commercial", "Institutional", "Hospitality"],
        },
        {
          name: "plot",
          label: "Plot",
          options: ["I have a plot", "Buying one", "Existing building"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      titleLines: ["Architecture", "FAQ"],
      items: [
        {
          question: "How much does an architecture project cost?",
          answer:
            "Fees depend on the project scale, scope, complexity and level of service. After an initial consultation, we share a clear proposal aligned with your requirements.",
          link: {
            label: "Ask for a fee proposal",
            action: "contact",
            service: "Architectural Design",
          },
        },
        {
          question: "How long does design and construction take?",
          answer:
            "Timelines depend on the size of the building, approvals and the level of detail required. We share a phased programme after the first consultation and site visit.",
          link: { label: "See how we work", href: `#${ARCH_PROCESS_ID}` },
        },
        {
          question: "Can Katic support local authority approvals?",
          answer:
            "Yes. We prepare the drawings and documentation needed for permits and coordinate with the relevant local authorities in Kerala and the UAE.",
          link: { label: "From approvals to construction", href: routes.service("construction") },
        },
        {
          question: "What drawings will I receive?",
          answer:
            "Concept drawings, detailed design drawings, 3D visualisations and full working drawings, as agreed in your scope of service.",
          link: { label: "See our architecture services", href: `#${SERVICES_ID}` },
        },
        {
          question: "Where does Katic take architecture projects?",
          answer: [
            "We work across Kerala — from our studio in ",
            { label: "Kochi", href: routes.location("india") },
            " — and across the UAE, including ",
            { label: "Dubai", href: routes.location("dubai") },
            ".",
          ],
          link: {
            label: "View architecture projects",
            href: routes.worksCategory("architecture"),
          },
        },
      ],
    },
  },
} as const satisfies ServicePageContent;
