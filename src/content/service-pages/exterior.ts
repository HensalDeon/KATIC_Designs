import { OUTDOOR_ENVIRONMENTS_TILE } from "@/content/sectors";
import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/**
 * Exterior & Landscape Design (`#p-exterior`, reference/original/katic-designs-final.stripped.html
 * 3550–3575; docs/analysis/03 §2.7). Copy verbatim from the original. No process block; the
 * projects block lands on a dark section and the contact stays dark, both by the alternation.
 */
export const EXTERIOR_PAGE = {
  slug: "exterior",
  seo: {
    title: "Landscape & Exterior Design in Kerala | Katic Designs",
    description:
      "Facade, garden, courtyard and outdoor living design planned together with the building, for homes, campuses and commercial sites.",
  },
  hero: {
    image: { src: "photos/veranda-night-forest", alt: "Veranda at night facing a forest" },
    kicker: "Exterior & Landscape Design",
    title: { lines: ["Designing Beyond", "the"], accent: "Building" },
    lead: "Outdoor spaces, parks, facades and landscape planning, composed together with the architecture.",
    primaryCta: {
      kind: "contact",
      label: "Discuss Your Outdoor Space",
      service: "Exterior & Landscape Design",
    },
    secondaryCta: { kind: "link", label: "View Projects", href: `${routes.works}#works-list` },
  },
  sections: [
    {
      type: "split",
      image: {
        src: "photos/courtyard-tree-timber-balconies",
        alt: "Planted courtyard with a tree and timber balconies",
      },
      caption: "Planted courtyard · Kochi",
      kicker: "Designing beyond the building",
      title: ["Inside and", "outside as one"],
      lead: "Buildings, landscapes and outdoor environments work best when they are designed together.",
      body: "We shape facades, courtyards, gardens and public spaces so that light, shade, planting and movement extend the architecture outwards.",
      bullets: [
        "Facade & elevation",
        "Courtyards & gardens",
        "Outdoor living",
        "Public landscapes",
      ],
    },
    {
      type: "rows",
      header: {
        kicker: "Our design services",
        title: ["Exterior &", "landscape services"],
        lead: "Outdoor spaces, parks, facades and landscape planning.",
      },
      items: [
        {
          icon: "facade",
          title: "Facade & elevation design",
          text: "New elevations and facade makeovers with proportion and purpose.",
        },
        {
          icon: "leaf",
          title: "Landscape planning",
          text: "Master plans for gardens, campuses and grounds.",
        },
        {
          icon: "door",
          title: "Outdoor living",
          text: "Terraces, decks, pools and outdoor rooms.",
        },
        {
          icon: "compass",
          title: "Parks & public spaces",
          text: "Planting, paths and shade for communities.",
        },
        {
          icon: "bulb",
          title: "Hardscape & lighting",
          text: "Paving, walls, water features and exterior lighting.",
        },
      ],
    },
    {
      type: "sectors",
      header: {
        kicker: "Project types",
        title: ["Where we", "work outdoors"],
        lead: "Residential, commercial, institutional, hospitality and outdoor environments.",
      },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
      extra: OUTDOOR_ENVIRONMENTS_TILE,
    },
    {
      type: "projects",
      header: {
        kicker: "Featured exterior & landscape projects",
        title: ["Outdoor spaces", "we’ve shaped"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "Selected projects with images and case-study links.",
        cta: {
          label: "View All Projects",
          href: `${routes.works}#works-list`,
          variant: "outline-light",
        },
      },
      columns: 3,
      items: [
        // TODO(content): KI-S06. The Canopy House and River Edge Villa photos are 380×472.
        { project: "canopy-house", meta: "Residential · Architecture · Thrippunithura, Kochi" },
        {
          project: "jumeirah-courtyard-house",
          meta: "Residential · Architecture · Jumeirah, Dubai",
        },
        { project: "river-edge-villa", meta: "Residential · Villa · Aluva, Kerala" },
      ],
    },
    {
      type: "related",
      header: { kicker: "Related services", title: ["Services that work", "alongside landscape"] },
      columns: 3,
      services: ["architecture", "interior", "construction"],
    },
    { type: "divisions", divisions: ["design", "infrastructure", "developers", "care"] },
    {
      type: "testimonials",
      testimonials: ["arch", "home-kochi", "thrissur"],
      plant: { asset: "plants/ageratum", corner: "bottom-left", width: 222 },
    },
  ],
  contact: {
    heading: { lines: ["Plan Your"], accent: "Outdoor Space" },
    lead: "Share your exterior, facade or landscape requirements and we’ll suggest a next step.",
    form: {
      service: { mode: "select", defaultService: "Exterior & Landscape Design" },
      extraFields: [
        {
          name: "scope",
          label: "Scope",
          options: [
            "Facade makeover",
            "New elevation",
            "Garden / landscape",
            "Outdoor living",
            "Large grounds",
          ],
        },
        // TODO(content): KI-C13. "Large grounds" is offered under both Scope and Area.
        {
          name: "area",
          label: "Area",
          options: ["Garden", "Courtyard", "Terrace", "Large grounds"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "Can you redesign the facade of an existing building?",
          answer:
            "Yes. Facade makeovers can change cladding, openings, shading and colour without rebuilding.",
        },
        {
          question: "Do you plan large landscapes?",
          answer: "Yes, from private gardens to campus and park master plans.",
        },
        {
          question: "Which outdoor materials do you recommend?",
          answer:
            "Materials that suit the climate: laterite, granite, treated timber and porous paving that handles monsoon rain.",
        },
        {
          question: "Do you design for low maintenance?",
          answer:
            "Yes. Native planting and drip irrigation keep upkeep low, and KATIC Care can maintain it.",
          link: { label: "About property care", href: routes.service("property-care") },
        },
        {
          question: "How long does a landscape project take?",
          answer:
            "Gardens typically take 6–12 weeks to build after design approval, depending on season.",
        },
      ],
    },
  },
} as const satisfies ServicePageContent;
