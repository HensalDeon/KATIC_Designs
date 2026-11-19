import { divisionHero } from "./shared";
import type { DivisionPageContent } from "./types";

/**
 * KATIC Care (`#p-div-care`, reference/original/katic-designs-final.stripped.html 4034–4047;
 * docs/analysis/04 §3). Copy verbatim from the original; alts describe the photos (KI-A13).
 */
export const CARE_DIVISION_PAGE = {
  slug: "care",
  seo: {
    title: "KATIC Care | Property Maintenance & Care",
    description:
      "Maintenance, repairs and inspections that protect your property’s value long after handover.",
  },
  hero: divisionHero("care", {
    image: { src: "photos/lakeside-house-dusk", alt: "Lakeside house lit at dusk" },
    lead: "Ongoing property support that keeps buildings at their best.",
  }),
  blocks: [
    {
      type: "split",
      image: {
        src: "photos/homeowners-walkthrough",
        alt: "Two homeowners walking through a finished interior with timber shelving",
      },
      kicker: "About KATIC Care",
      title: ["Support long", "after handover"],
      lead: "KATIC Care looks after homes and buildings once they are complete.",
      body: "From routine upkeep to repairs and restoration, our team protects condition, comfort and value.",
    },
    {
      type: "features",
      header: { kicker: "Our care services", title: ["Care", "services"] },
      columns: 5,
      items: [
        { icon: "shield", title: "Routine maintenance", text: "Scheduled upkeep visits." },
        { icon: "tools", title: "Repair & restoration", text: "Leaks, cracks, damp and wear." },
        { icon: "shield", title: "Interior maintenance", text: "Joinery, finishes and fittings." },
        {
          icon: "shield",
          title: "Civil & building maintenance",
          text: "Roofs, facades and drainage.",
        },
        { icon: "shield", title: "General upkeep", text: "Gardens, cleaning and checks." },
      ],
    },
    {
      type: "sectors",
      header: { kicker: "Properties we care for", title: ["Properties", "in our care"] },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
    },
    {
      type: "process",
      header: { kicker: "Maintenance process", title: ["Care, step", "by step"] },
      steps: [
        { icon: "search", title: "Assessment", text: "A full property condition review." },
        { icon: "compass", title: "Planning", text: "Priorities, schedule and cost." },
        { icon: "clock", title: "Scheduling", text: "Visits booked around you." },
        { icon: "crane", title: "Execution", text: "Work by our own teams." },
        { icon: "clock", title: "Follow-up", text: "Inspection and reporting." },
      ],
    },
    {
      type: "split",
      image: { src: "photos/teak-stair-handrail", alt: "Teak stair handrail detail" },
      kicker: "Preventive maintenance",
      title: ["Fix it before", "it breaks"],
      lead: "Scheduled inspections, preventive maintenance and ongoing support.",
      body: "Quarterly inspections and pre-monsoon checks catch problems early, when they are cheaper and quicker to fix.",
      bullets: [
        "Quarterly inspections",
        "Pre-monsoon checks",
        "Service records",
        "Priority support",
      ],
      cta: {
        kind: "enquiry",
        label: "Request Support",
        service: "Property Care & Maintenance",
        variant: "primary",
      },
    },
    {
      type: "divisionCards",
      header: {
        kicker: "Integrated expertise",
        title: ["Backed by the", "team that builds"],
        lead: "KATIC Design, Interior and Infrastructure expertise supports every care visit.",
      },
      columns: 3,
      divisions: ["design", "interior", "infrastructure"],
    },
  ],
} as const satisfies DivisionPageContent;
