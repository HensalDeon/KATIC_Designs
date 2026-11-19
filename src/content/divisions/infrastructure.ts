import { routes } from "@/lib/routes";

import { divisionHero } from "./shared";
import type { DivisionPageContent } from "./types";

/**
 * KATIC Infrastructure (`#p-div-infrastructure`, reference/original/katic-designs-final.stripped.html
 * 4005–4018; docs/analysis/04 §3). Copy verbatim from the original; alts describe the photos
 * (KI-A13).
 */
export const INFRASTRUCTURE_DIVISION_PAGE = {
  slug: "infrastructure",
  seo: {
    title: "KATIC Infrastructure | Construction & Execution Division",
    description:
      "KATIC Infrastructure builds homes, workplaces, institutions and hospitality projects to the drawing and on programme.",
  },
  hero: divisionHero("infrastructure", {
    image: {
      src: "photos/house-under-construction",
      alt: "House under construction in a forest clearing",
    },
    lead: "Construction and execution for residential, commercial, institutional and hospitality projects.",
  }),
  blocks: [
    {
      type: "split",
      image: {
        src: "photos/construction-team-drawings",
        alt: "Construction team reviewing drawings on site",
      },
      kicker: "About Infrastructure",
      title: ["Where drawings", "become buildings"],
      lead: "KATIC Infrastructure is the construction and execution division of KATIC.",
      body: "Our site teams, engineers and project managers build to the drawing, on programme and to a consistent quality standard.",
    },
    {
      type: "features",
      header: { kicker: "Construction capabilities", title: ["What we", "build"] },
      columns: 3,
      items: [
        { icon: "crane", title: "Residential construction", text: "Homes, villas and apartments." },
        { icon: "crane", title: "Commercial construction", text: "Offices, retail and mixed-use." },
        {
          icon: "office",
          title: "Institutional & hospitality",
          text: "Schools, healthcare, hotels and wellness.",
        },
        {
          icon: "crane",
          title: "Structural & civil works",
          text: "Foundations, frames and civil works.",
        },
        { icon: "clock", title: "Project management", text: "Programme, trades and procurement." },
        {
          icon: "crane",
          title: "Construction finishing",
          text: "Plaster, flooring, paint and fit-out.",
        },
      ],
    },
    {
      type: "process",
      header: { kicker: "Execution process", title: ["How we", "execute"] },
      steps: [
        {
          icon: "compass",
          title: "Planning & preparation",
          text: "Programme, budget and procurement.",
        },
        { icon: "search", title: "Site mobilisation", text: "Site set-up, safety and teams." },
        {
          icon: "crane",
          title: "Construction & coordination",
          text: "Structure, services and trades in sequence.",
        },
        {
          icon: "shield",
          title: "Finishing & inspection",
          text: "Finishes, snagging and quality checks.",
        },
        { icon: "key", title: "Handover", text: "Documentation, walkthrough and keys." },
      ],
    },
    {
      type: "features",
      header: { kicker: "Site & quality control", title: ["Managed every", "day on site"] },
      columns: 5,
      items: [
        {
          icon: "clock",
          title: "Scheduling",
          text: "Weekly programmes tracked against milestones.",
        },
        {
          icon: "team",
          title: "Workforce coordination",
          text: "Skilled teams and trades in the right sequence.",
        },
        {
          icon: "clock",
          title: "Material management",
          text: "Approved materials, stored and checked.",
        },
        {
          icon: "eye",
          title: "Progress monitoring",
          text: "Regular site reports and photo updates.",
        },
        {
          icon: "shield",
          title: "Quality inspections",
          text: "Stage-wise inspections and sign-offs.",
        },
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Built by", "KATIC"],
        cta: { label: "View All Projects", href: `${routes.works}#works-list` },
      },
      columns: 3,
      items: [
        {
          project: "house-of-three-courts",
          meta: "Residential · Construction · Kottayam, Kerala",
        },
        {
          project: "community-health-pavilion",
          meta: "Institutional · Construction · Aluva, Kerala",
        },
        { project: "al-quoz-atelier", meta: "Commercial · Architecture + Build · Dubai, UAE" },
      ],
    },
    {
      type: "split",
      plant: { asset: "plants/bird-of-paradise-flower", corner: "bottom-right", width: 270 },
      image: {
        src: "photos/site-review-timber-screen",
        alt: "Architect and client reviewing drawings beside a timber lattice on site",
      },
      kicker: "Integrated delivery",
      title: ["Coordinated from", "design to site"],
      lead: "KATIC Infrastructure works directly with KATIC Design and KATIC Interior from design through execution.",
      body: "Shared drawings and one programme mean fewer clashes on site and a building that matches the design.",
      cta: {
        kind: "enquiry",
        label: "Request a Build Quote",
        service: "Construction & Execution",
        variant: "primary",
      },
    },
  ],
} as const satisfies DivisionPageContent;
