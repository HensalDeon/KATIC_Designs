import { routes } from "@/lib/routes";

import { divisionHero } from "./shared";
import type { DivisionPageContent } from "./types";

/**
 * KATIC Design (`#p-div-design`, reference/original/katic-designs-final.stripped.html 3978–3990;
 * docs/analysis/04 §3). Copy verbatim from the original; alts describe the photos (KI-A13).
 */
export const DESIGN_DIVISION_PAGE = {
  slug: "design",
  seo: {
    title: "KATIC Design | Architecture & Planning Division",
    description:
      "KATIC Design delivers architecture, planning and facade design shaped by site, climate and purpose.",
  },
  hero: divisionHero("design", {
    image: {
      src: "photos/brick-courtyard-house-dusk",
      alt: "Brick courtyard house lit at dusk around a planted courtyard",
    },
    lead: "Architecture and design that start with the site, the climate and the way people live.",
  }),
  blocks: [
    {
      type: "split",
      image: {
        src: "photos/architect-site-drawings",
        alt: "Architect reviewing drawings on a forested site",
      },
      caption: "Site study · Kochi",
      kicker: "About KATIC Design",
      title: ["Design that", "belongs to its place"],
      lead: "KATIC Design is the architecture and design studio at the heart of KATIC.",
      body: "Our architects lead projects from brief and site study to approved drawings, and stay involved through construction so the design is built as intended.",
    },
    {
      type: "features",
      plant: { asset: "plants/bird-of-paradise-flower", corner: "bottom-right", width: 220 },
      header: { kicker: "Our design capabilities", title: ["Design", "capabilities"] },
      columns: 3,
      items: [
        {
          icon: "facade",
          title: "Architectural design",
          text: "Homes, workplaces and public buildings.",
        },
        {
          icon: "facade",
          title: "Architectural planning",
          text: "Site planning, zoning and approvals.",
        },
        {
          icon: "compass",
          title: "Spatial planning",
          text: "Layouts shaped around how spaces are used.",
        },
        {
          icon: "crane",
          title: "Building design",
          text: "Structure, envelope and services integrated.",
        },
        {
          icon: "facade",
          title: "Elevation & facade design",
          text: "Facades with proportion and purpose.",
        },
        {
          icon: "compass",
          title: "Design consultation",
          text: "Feasibility, reviews and expert advice.",
        },
      ],
    },
    {
      type: "process",
      header: { kicker: "Our design approach", title: ["From brief to", "design development"] },
      steps: [
        {
          icon: "search",
          title: "Brief & site",
          text: "Understanding needs, budget, site and climate.",
        },
        { icon: "compass", title: "Planning", text: "Zoning, adjacencies and regulations." },
        { icon: "compass", title: "Concept", text: "Massing, light and spatial ideas." },
        {
          icon: "house",
          title: "Design development",
          text: "Materials, details and resolved drawings.",
        },
        { icon: "badge-check", title: "Documentation", text: "Working drawings and approvals." },
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Architecture", "projects"],
        cta: {
          label: "View Architecture Projects",
          href: routes.worksCategory("architecture"),
          variant: "dark",
        },
      },
      columns: 3,
      items: [
        {
          project: "the-courtyard-house",
          meta: "Residential · Architecture + Interiors · Kakkanad, Kochi",
          // KI-D01: this card shows another photo of the house than its cover.
          image: {
            src: "photos/brick-courtyard-house-dusk",
            alt: "Brick courtyard house lit at dusk around a planted courtyard",
          },
        },
        { project: "palm-ridge-villa", meta: "Residential · Villa · Kakkanad, Kerala" },
        { project: "nila-workspace", meta: "Commercial · Architecture · Dubai, UAE" },
      ],
    },
    {
      type: "split",
      reverse: true,
      image: {
        src: "photos/pavilion-fins-facade",
        alt: "Pavilion building with vertical fins and a garden",
      },
      kicker: "Integrated capabilities",
      title: ["Designed to be", "built"],
      lead: "Architecture at KATIC connects directly with interior design and construction execution.",
      body: "Working alongside KATIC Interior and KATIC Infrastructure means drawings are coordinated, buildable and carried through without loss of intent.",
      cta: {
        kind: "enquiry",
        label: "Start a Design Brief",
        service: "Architectural Design",
        variant: "primary",
      },
    },
  ],
} as const satisfies DivisionPageContent;
