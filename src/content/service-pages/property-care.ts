import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/**
 * Deep link of the services grid (`#property-care/pc-services`). The original puts it on an empty
 * `<div>` between two sections (analysis/03 §5.32); here it is the section's own id.
 */
const SERVICES_ID = "pc-services";

/**
 * Property Care & Maintenance (`#p-property-care`,
 * reference/original/katic-designs-final.stripped.html 3577–3602; docs/analysis/03 §2.8). Copy
 * verbatim from the original. No projects block; four related services; the contact stays dark.
 */
export const PROPERTY_CARE_PAGE = {
  slug: "property-care",
  seo: {
    // The original's brand suffix differs from every other page ("Katic Care").
    title: "Property Maintenance & Repairs in Kerala | Katic Care",
    description:
      "Planned maintenance, repairs, pre-monsoon inspections and priority support for homes and commercial properties in Kerala and the UAE.",
  },
  hero: {
    // TODO(content): KI-S06. The source photo is 987×795, soft when stretched full-bleed.
    image: {
      src: "photos/homeowners-walkthrough",
      alt: "Two homeowners walking through a finished interior with timber shelving",
    },
    kicker: "Property Care & Maintenance",
    title: { lines: ["Care That Keeps", "Spaces"], accent: "at Their Best" },
    lead: "Property maintenance, repairs and ongoing support from the team that knows how buildings are made.",
    primaryCta: {
      kind: "contact",
      label: "Request Support",
      service: "Property Care & Maintenance",
    },
    secondaryCta: { kind: "link", label: "Our Services", href: `#${SERVICES_ID}` },
  },
  sections: [
    {
      type: "split",
      image: {
        src: "photos/bathroom-kota-stone",
        alt: "Bathroom with Kota stone and a courtyard view",
      },
      caption: "Stone & timber · cared for",
      kicker: "Complete property care",
      title: ["Protect what", "you’ve built"],
      lead: "Regular maintenance preserves condition, usability, appearance and value.",
      body: "Small issues found early stay small. Our care plans keep homes and buildings working, looking good and holding their value year after year.",
      bullets: ["Condition", "Usability", "Appearance", "Long-term value"],
      plant: { asset: "plants/fern", corner: "bottom-right", width: 170 },
    },
    {
      type: "features",
      id: SERVICES_ID,
      header: {
        kicker: "Our maintenance services",
        title: ["What we", "look after"],
        lead: "Property maintenance, repairs and ongoing support.",
      },
      columns: 3,
      items: [
        {
          icon: "shield",
          title: "Routine maintenance",
          text: "Scheduled visits for plumbing, electrical and general upkeep.",
        },
        {
          icon: "tools",
          title: "Repairs & restoration",
          text: "Fixing leaks, cracks, damp and wear.",
        },
        {
          icon: "shield",
          title: "Interior maintenance",
          text: "Joinery, finishes, fittings and furniture care.",
        },
        {
          icon: "crane",
          title: "Civil & building",
          text: "Roofs, waterproofing, facades and drainage.",
        },
        { icon: "leaf", title: "Landscape upkeep", text: "Gardens, irrigation and outdoor areas." },
        {
          icon: "shield",
          title: "Emergency support",
          text: "Priority response for urgent issues.",
        },
      ],
    },
    {
      type: "sectors",
      header: {
        kicker: "Properties we maintain",
        title: ["Properties", "in our care"],
        lead: "Residential, commercial, institutional and hospitality properties.",
      },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
    },
    {
      type: "process",
      header: {
        kicker: "Our maintenance approach",
        title: ["Assess. Plan.", "Repair. Check."],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "Assessment, planning, repair coordination and quality checks.",
      },
      steps: [
        {
          icon: "search",
          title: "Assessment",
          text: "A full property inspection with a written condition report.",
        },
        {
          icon: "compass",
          title: "Planning",
          text: "A maintenance plan with priorities, schedule and cost.",
        },
        {
          icon: "tools",
          title: "Repair coordination",
          text: "Our teams and trusted trades carry out the work.",
        },
        { icon: "target", title: "Quality check", text: "Every job is inspected and signed off." },
        {
          icon: "shield",
          title: "Ongoing support",
          text: "Scheduled visits and a single number to call.",
        },
      ],
    },
    {
      type: "related",
      header: {
        kicker: "Related services",
        title: ["Services that work", "alongside property care"],
      },
      columns: 4,
      services: ["construction", "renovation", "interior", "turnkey"],
    },
    { type: "divisions", divisions: ["care", "infrastructure", "interior", "developers"] },
    { type: "testimonials", testimonials: ["thrissur", "home-kochi", "alappuzha"] },
  ],
  contact: {
    heading: { lines: ["Property Care"], accent: "Enquiry" },
    lead: "For property owners and businesses. Tell us about the property and the support you need.",
    form: {
      service: { mode: "select", defaultService: "Property Care & Maintenance" },
      extraFields: [
        {
          name: "ptype",
          label: "Project Type",
          options: ["Residential", "Commercial", "Institutional", "Hospitality"],
        },
        {
          name: "need",
          label: "Support needed",
          options: ["Maintenance plan", "One-off repair", "Emergency", "Inspection"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "What is included in a maintenance plan?",
          answer:
            "Scheduled inspections, routine maintenance and priority repairs, tailored to your property.",
        },
        {
          question: "How often are inspections carried out?",
          answer: "Usually quarterly, with additional visits before and after the monsoon.",
        },
        {
          question: "Do you handle repairs for buildings you did not build?",
          answer:
            "Yes. We maintain any residential, commercial, institutional or hospitality property.",
        },
        {
          question: "Which areas do you cover?",
          answer:
            "Kochi and surrounding districts in Kerala, with expanding coverage in South India.",
          link: { label: "See our locations", href: routes.location("india") },
        },
        {
          question: "How fast do you respond?",
          answer:
            "Emergency requests are answered the same day; routine requests within two business days.",
          // KI-F07: the original's `href="contact"` (no `#`) only worked through JS interception.
          link: {
            label: "Request support",
            action: "contact",
            service: "Property Care & Maintenance",
          },
        },
      ],
    },
  },
} as const satisfies ServicePageContent;
