import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/**
 * Turnkey Projects (`#p-turnkey`, reference/original/katic-designs-final.stripped.html 3493–3520;
 * docs/analysis/03 §2.5). Copy verbatim from the original.
 */
export const TURNKEY_PAGE = {
  slug: "turnkey",
  seo: {
    title: "Turnkey Home & Building Projects in Kerala | Katic Designs",
    description:
      "One team and one contract for design, approvals, construction, interiors and handover. Turnkey villas, homes and commercial projects in Kerala and the UAE.",
  },
  hero: {
    image: {
      src: "photos/two-storey-house-lawn",
      alt: "Two-storey house with deep overhangs above a lawn",
    },
    kicker: "Turnkey Projects",
    title: { lines: ["One Team.", "Planning to"], accent: "Handover." },
    lead: "KATIC as your coordinated delivery partner — design, construction, interiors and handover managed under one contract.",
    primaryCta: { kind: "contact", label: "Get a Turnkey Plan", service: "Turnkey Projects" },
    secondaryCta: {
      kind: "link",
      label: "See Turnkey Projects",
      href: `${routes.works}#works-list`,
    },
  },
  sections: [
    {
      type: "split",
      image: { src: "photos/courtyard-facade-night", alt: "Courtyard facade lit at night" },
      caption: "Courtyard facade · Kochi",
      kicker: "What is turnkey?",
      title: ["You hand us", "the brief. We hand", "you the keys."],
      lead: "In a turnkey project one team takes responsibility for design, approvals, construction, interiors and handover.",
      body: "You get one point of contact, one programme and one budget — and the original design intent stays intact from first sketch to final detail.",
      bullets: [
        "Single point of contact",
        "One agreed budget",
        "One programme",
        "Clear accountability",
      ],
    },
    {
      type: "sectors",
      header: {
        kicker: "Turnkey solutions across sectors",
        title: ["Turnkey for", "every sector"],
        lead: "Residential, commercial, institutional and hospitality projects.",
      },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
    },
    {
      type: "rows",
      header: {
        kicker: "What we deliver",
        title: ["Complete project", "delivery"],
        lead: "Complete project delivery for residential, commercial and hospitality spaces.",
      },
      items: [
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
      ],
    },
    {
      type: "process",
      header: {
        kicker: "Our turnkey process",
        title: ["Eight stages.", "One team."],
        lead: "Every stage of our master process, delivered end to end.",
      },
      steps: [
        "discovery",
        "concept",
        "design",
        "engineering",
        "construction",
        "completion",
        "handover",
        "aftercare",
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Integrated", "projects"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "Scope and outcomes from complete design-and-build commissions.",
        cta: { label: "View All Projects", href: `${routes.works}#works-list` },
      },
      columns: 3,
      items: [
        { project: "nila-apartments", meta: "Residential · Turnkey · Kozhikode, Kerala" },
        { project: "desert-edge-villa", meta: "Residential · Turnkey · Al Khawaneej, Dubai" },
        { project: "palm-veil-residence", meta: "Residential · Villa · Thrissur, Kerala" },
      ],
    },
    {
      type: "features",
      header: { kicker: "Why choose KATIC?", title: ["Why one team", "works better"] },
      columns: 4,
      items: [
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
      ],
    },
    {
      type: "related",
      header: { kicker: "Related services", title: ["Explore the", "disciplines"] },
      columns: 3,
      services: ["architecture", "interior", "construction"],
    },
    {
      type: "divisions",
      divisions: ["developers", "design", "interior", "infrastructure", "care"],
    },
    { type: "testimonials", testimonials: ["thrissur", "alappuzha", "arch"] },
  ],
  contact: {
    heading: { lines: ["Start a Turnkey"], accent: "Project" },
    lead: "Share your goals, requirements, budget and timeline. We’ll come back with a turnkey plan.",
    form: {
      service: { mode: "select", defaultService: "Turnkey Projects" },
      extraFields: [
        {
          name: "ptype",
          label: "Project Type",
          options: ["Residential", "Commercial", "Institutional", "Hospitality"],
        },
        {
          name: "budget",
          label: "Budget Range",
          options: ["Under ₹50 lakh", "₹50 lakh – ₹1.5 crore", "₹1.5 crore +", "Not sure yet"],
        },
        {
          name: "timeline",
          label: "Timeline",
          options: ["Within 3 months", "3–6 months", "6–12 months", "Just exploring"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "What does turnkey include?",
          answer:
            "Design, approvals, construction, interiors, landscaping and handover — or any agreed combination — under one contract.",
        },
        {
          question: "Who is responsible for what?",
          answer:
            "KATIC takes responsibility for design, coordination and delivery. You approve the brief, budget and key design decisions.",
        },
        {
          question: "How is the budget managed?",
          answer:
            "We agree a budget at the outset and report against it at each milestone, flagging changes before they happen.",
        },
        {
          question: "How does procurement work?",
          answer:
            "We procure materials and furniture through our supplier network and factory, with approvals at each stage.",
        },
        {
          question: "What happens at handover?",
          answer:
            "A guided walkthrough, snag list, documentation and warranties, followed by aftercare support.",
          link: { label: "About aftercare", href: routes.service("property-care") },
        },
      ],
    },
    plant: { asset: "plants/bird-of-paradise-terracotta", corner: "bottom-right", width: 220 },
  },
} as const satisfies ServicePageContent;
