import { divisionHero } from "./shared";
import type { DivisionPageContent } from "./types";

/**
 * KATIC Developers (`#p-div-developers`, reference/original/katic-designs-final.stripped.html
 * 4019–4033; docs/analysis/04 §3). Copy verbatim from the original; alts describe the photos
 * (KI-A13). The original has no contact prefill for this division (no `PREFILL` entry).
 */
export const DEVELOPERS_DIVISION_PAGE = {
  slug: "developers",
  seo: {
    title: "KATIC Developers | Design-led Residential & Commercial Developments",
    description:
      "Design-led villas, apartments and commercial developments in Kerala, from land to handover.",
  },
  hero: divisionHero("developers", {
    image: {
      src: "photos/villa-pool-city-skyline",
      alt: "Villa with a pool and a city skyline at dusk",
    },
    lead: "Design-led residential and commercial developments.",
  }),
  blocks: [
    {
      type: "split",
      image: {
        src: "photos/apartment-tower",
        alt: "Mid-rise apartment tower with planted balconies",
      },
      kicker: "About Developers",
      title: ["Developing with", "design in mind"],
      lead: "KATIC Developers creates residential and commercial developments shaped by design thinking.",
      body: "With design, interiors and construction in-house, every development is planned for long-term quality and value.",
    },
    {
      type: "cards",
      header: { kicker: "Development focus", title: ["What we", "develop"] },
      columns: 4,
      items: [
        {
          image: "photos/modern-house-rain-dusk",
          alt: "Modern house on a rain-soaked evening",
          title: "Residential developments",
          text: "Considered homes in well-connected locations.",
        },
        {
          image: "photos/desert-villa-sunset",
          alt: "Desert villa with an infinity pool at sunset",
          title: "Villas",
          text: "Private villas and villa communities.",
        },
        {
          image: "photos/apartment-tower",
          alt: "Mid-rise apartment tower with planted balconies",
          title: "Apartments",
          text: "Apartments planned around light and air.",
        },
        {
          image: "photos/commercial-facade-dusk",
          alt: "Industrial-style commercial building lit at dusk",
          title: "Commercial developments",
          text: "Offices and mixed-use buildings.",
        },
      ],
    },
    {
      type: "process",
      header: { kicker: "Development approach", title: ["From opportunity", "to delivery"] },
      steps: [
        { icon: "pin", title: "Opportunity", text: "Identifying land and market potential." },
        {
          icon: "compass",
          title: "Feasibility & planning",
          text: "Financial, legal and planning studies.",
        },
        {
          icon: "compass",
          title: "Design",
          text: "Design-led master planning and architecture.",
        },
        { icon: "crane", title: "Construction", text: "Built by KATIC Infrastructure." },
        { icon: "truck", title: "Delivery", text: "Handover, sales support and aftercare." },
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured developments",
        title: ["Completed, ongoing", "and upcoming"],
        // TODO(content): KI-C07. Placeholder note shown verbatim by the original.
        lead: "Representative developments — replace with current KATIC Developers projects.",
      },
      columns: 3,
      items: [
        { project: "nila-apartments", meta: "Apartments · Kozhikode", tag: "Completed" },
        // KI-D01: the original card calls it "Desert Edge Villas"; projects.ts keeps one name.
        { project: "desert-edge-villa", meta: "Villas · Dubai", tag: "Ongoing" },
        { project: "hillside-commons", meta: "Mixed-use · Kerala", tag: "Upcoming" },
      ],
    },
    {
      type: "split",
      reverse: true,
      image: {
        src: "photos/pavilion-fins-facade",
        alt: "Pavilion building with vertical fins and a garden",
      },
      kicker: "Design-led development",
      title: ["Design decides", "value"],
      lead: "Design thinking and integrated capabilities inform every development decision — from site layout to specification.",
      body: "Better light, better plans and better materials make places people want to live and work in for longer.",
    },
    {
      type: "features",
      header: {
        kicker: "Partnerships",
        title: ["Build with us"],
        lead: "Landowner opportunities and development collaborations.",
      },
      columns: 3,
      items: [
        {
          icon: "pin",
          title: "Landowners",
          text: "Joint development of land with transparent terms.",
        },
        { icon: "coin", title: "Investors", text: "Co-investment in design-led projects." },
        {
          icon: "team",
          title: "Collaborations",
          text: "Partnerships with operators and institutions.",
        },
      ],
    },
    {
      type: "divisionCards",
      header: { kicker: "Integrated capabilities", title: ["Backed by three", "divisions"] },
      columns: 3,
      divisions: ["design", "interior", "infrastructure"],
    },
  ],
} as const satisfies DivisionPageContent;
