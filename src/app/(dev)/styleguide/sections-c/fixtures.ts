import type { ContactFaqProps, FaqContent } from "@/components/sections/contact-faq";
import { routes } from "@/lib/routes";

/**
 * Contact + FAQ content of three service pages, verbatim from the original
 * (reference/original, lines 3425–3437, 3451–3463, 3506–3518). The FAQ intro copy and "Ask us
 * directly" link are omitted, as the original removes them at runtime (KI-C12).
 */
const FAQ_KICKER = "Questions, answered";
const FAQ_TITLE = ["Frequently asked", "questions"];

export const INTERIOR_FAQ: FaqContent = {
  kicker: FAQ_KICKER,
  titleLines: FAQ_TITLE,
  items: [
    {
      question: "What does an interior design project include?",
      answer:
        "Space planning, material and finish selection, furniture and joinery design, lighting, and on-site execution through to handover.",
      link: { label: "See our interior services", href: routes.service("interior") },
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
      link: { label: "Ask for a quote", action: "contact" },
    },
    {
      question: "Can you work on an apartment that is still under construction?",
      answer:
        "Yes — starting early lets us coordinate electrical, plumbing and ceiling layouts before they are fixed.",
    },
  ],
};

export const TURNKEY_FAQ: FaqContent = {
  kicker: FAQ_KICKER,
  titleLines: FAQ_TITLE,
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
};

export const FACTORY_FAQ: FaqContent = {
  kicker: FAQ_KICKER,
  titleLines: FAQ_TITLE,
  items: [
    {
      question: "Can you manufacture to our own designs?",
      answer:
        "Yes. We can produce from your drawings or develop shop drawings with you before production.",
    },
    {
      question: "What materials and finishes do you work with?",
      answer:
        "Solid timber, veneers, plywood and MDF, laminates, lacquer, stone and metal accents, with samples available before production.",
    },
    {
      question: "Is there a minimum order?",
      answer: "No fixed minimum. We take on single bespoke pieces as well as multi-unit orders.",
      link: { label: "Discuss your order", action: "contact" },
    },
    {
      question: "How long does production take?",
      answer: "Most orders take 4–8 weeks after drawings and finishes are approved.",
    },
    {
      question: "Do you install outside KATIC interior projects?",
      answer:
        "Yes. Our team can deliver and install for other projects, coordinated with your site schedule.",
    },
  ],
};

export const INTERIOR_CONTACT = {
  tone: "light",
  id: "interior-contact",
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
  faq: INTERIOR_FAQ,
  plant: { asset: "plants/schefflera", corner: "bottom-right", width: 230 },
} as const satisfies ContactFaqProps;

export const TURNKEY_CONTACT = {
  tone: "dark",
  id: "turnkey-contact",
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
  faq: TURNKEY_FAQ,
  plant: { asset: "plants/bird-of-paradise-terracotta", corner: "bottom-right", width: 220 },
} as const satisfies ContactFaqProps;

export const FACTORY_CONTACT = {
  tone: "light",
  id: "factory-contact",
  heading: { lines: ["Enquire About"], accent: "Manufacturing" },
  lead: "Tell us what you need made — quantities, finishes and timelines — and our factory team will get back to you.",
  form: {
    service: { mode: "hidden", service: "Interior Design" },
    extraFields: [
      {
        name: "product",
        label: "Product",
        options: [
          "Kitchen",
          "Wardrobes & storage",
          "Panelling & screens",
          "Loose furniture",
          "Commercial fit-out",
          "Other",
        ],
      },
      {
        name: "qty",
        label: "Quantity",
        options: ["Single piece", "Full home", "Multiple units / project"],
      },
    ],
  },
  faq: FACTORY_FAQ,
} as const satisfies ContactFaqProps;
