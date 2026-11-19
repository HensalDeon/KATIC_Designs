import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/** Id given to the services rows so the FAQ's "See our interior services" lands on them (KI-F08). */
const SERVICES_ID = "interior-services";

/**
 * Interior Design (`#p-interior`, reference/original/katic-designs-final.stripped.html 3413–3439;
 * docs/analysis/03 §2.2). Copy verbatim from the original.
 */
export const INTERIOR_PAGE = {
  slug: "interior",
  seo: {
    title: "Interior Designers in Kochi, Kerala | Interior Design | Katic Designs",
    description:
      "Interior design with in-house joinery and furniture: space planning, materials, lighting and installation for homes, apartments and offices in Kerala and Dubai.",
  },
  hero: {
    image: {
      src: "photos/sofa-jali-detail",
      alt: "Sofa with cushions in front of a jali screen",
    },
    kicker: "Interior Design · Kerala & UAE",
    title: { lines: ["Interiors Made", "for"], accent: "Everyday Life" },
    lead: "Interior planning, materials, furniture and execution — designed, made and installed by one team.",
    primaryCta: { kind: "contact", label: "Discuss Your Interior", service: "Interior Design" },
    secondaryCta: {
      kind: "link",
      label: "View Interior Projects",
      href: routes.worksCategory("interiors"),
    },
  },
  sections: [
    {
      type: "split",
      image: {
        src: "photos/timber-lounge-chair",
        alt: "Timber lounge chair by a curtained window",
      },
      caption: "Dining room · teak joinery",
      kicker: "Philosophy",
      title: ["Beauty that", "works hard"],
      lead: "We design interiors that look considered and live easily — balancing aesthetics with function, durable materials and precise detailing.",
      body: "Every room starts with how it will be used: the light at different hours, the way people gather, what needs to be stored and what deserves to be seen. Materials are chosen for how they age, not only how they photograph.",
      bullets: [
        "Functional planning",
        "Natural, durable materials",
        "Integrated joinery",
        "Layered lighting",
      ],
    },
    {
      type: "rows",
      id: SERVICES_ID,
      header: {
        // TODO(content): the original repeats the title as the kicker (analysis/03 §5.13).
        kicker: "Our interior services",
        title: ["Our interior", "services"],
        lead: "From the first space plan to the last cabinet handle, every interior discipline sits under one roof.",
      },
      items: [
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
      ],
    },
    {
      type: "split",
      reverse: true,
      image: { src: "photos/kitchen-island-teak", alt: "Kitchen island with teak and stone" },
      caption: "Kitchen · teak & stone",
      kicker: "Factory & manufacturing",
      title: ["Made in our", "own workshop"],
      lead: "Our factory produces the joinery, furniture and interior components we specify — so quality, finish and timelines stay in our hands.",
      body: "Kitchens, wardrobes, panelling, loose furniture and custom details are fabricated in-house and installed by the same team that designed them.",
      bullets: [
        "Modular kitchens & wardrobes",
        "Wall panelling & screens",
        "Loose & built-in furniture",
        "Finishing & QC",
      ],
      cta: { kind: "link", label: "Visit the Factory", href: routes.service("factory") },
    },
    {
      type: "process",
      header: {
        kicker: "Interior design process",
        title: ["How we take", "a room from idea", "to finish"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "The stages of our master process that apply to interiors.",
      },
      steps: ["discovery", "concept", "design", "completion", "handover"],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Interiors across", "every sector"],
        lead: "Residential, commercial, institutional and hospitality interiors.",
        cta: { label: "View All Interiors", href: routes.worksCategory("interiors") },
      },
      columns: 4,
      items: [
        { project: "cinder-house", meta: "Residential · Interiors · Dubai, UAE" },
        { project: "serein-wellness-club", meta: "Hospitality · Interiors · Abu Dhabi, UAE" },
        { project: "difc-gallery-office", meta: "Commercial · Interiors · DIFC, Dubai" },
        { project: "harbour-loft", meta: "Residential · Interiors · Marine Drive, Kochi" },
      ],
    },
    {
      type: "related",
      header: { kicker: "Related services", title: ["Services that work", "alongside interiors"] },
      columns: 3,
      services: ["architecture", "construction", "turnkey"],
    },
    { type: "divisions", divisions: ["interior", "design", "infrastructure"] },
    { type: "testimonials", testimonials: ["ernakulam", "kozhikode", "alappuzha"] },
  ],
  contact: {
    heading: { lines: ["Planning an"], accent: "Interior?" },
    lead: "Share your space, style and timeline. We’ll respond within one business day with next steps.",
    form: {
      service: { mode: "select", defaultService: "Interior Design" },
      extraFields: [
        {
          name: "space",
          label: "Space",
          options: ["Full home", "Apartment", "Office", "Hospitality", "A few rooms"],
        },
        { name: "possession", label: "Possession", options: ["Ready now", "Under construction"] },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "What does an interior design project include?",
          answer:
            "Space planning, material and finish selection, furniture and joinery design, lighting, and on-site execution through to handover.",
          // KI-F08: the original links to the page itself (`#interior`), which does nothing.
          link: { label: "See our interior services", href: `#${SERVICES_ID}` },
        },
        {
          question: "Do you manufacture furniture and joinery?",
          answer:
            "Yes. Kitchens, wardrobes, panelling and bespoke furniture are made in our own factory and installed by our team.",
          link: { label: "Visit the factory", href: routes.service("factory") },
        },
        {
          question: "How long does an interior project take?",
          answer:
            "A typical home interior takes 3–6 months from design approval, depending on scope and the amount of custom joinery.",
        },
        {
          question: "How do you plan the budget?",
          answer:
            "We agree a target budget at the start and share material options at different price points so decisions stay within it.",
          // KI-F07: the original's `href="contact"` (no `#`) only worked through JS interception.
          link: { label: "Ask for a quote", action: "contact", service: "Interior Design" },
        },
        {
          question: "Can you work on an apartment that is still under construction?",
          answer:
            "Yes — starting early lets us coordinate electrical, plumbing and ceiling layouts before they are fixed.",
        },
      ],
    },
    plant: { asset: "plants/schefflera", corner: "bottom-right", width: 230 },
  },
} as const satisfies ServicePageContent;
