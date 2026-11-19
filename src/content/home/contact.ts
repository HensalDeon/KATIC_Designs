import type { ContactFaqProps } from "@/components/sections/contact-faq";
import { routes } from "@/lib/routes";

import { CONTACT_TEMPLATE } from "../contact";

/**
 * Home contact + FAQ (`section.contact.combo#start`): the original's CONTACT template (JS 4654, as
 * rendered on home: email and phone only) merged with the home FAQ section (line 2913). Copy is
 * verbatim. The FAQ intro and "Ask us directly" link are removed at runtime in the original, so
 * they are omitted (KI-C12).
 */
export type HomeContactContent = Pick<
  ContactFaqProps,
  "kicker" | "heading" | "lead" | "channels" | "form" | "faq"
>;

export const HOME_CONTACT = {
  ...CONTACT_TEMPLATE,
  faq: {
    kicker: "Questions, answered",
    titleLines: ["Frequently asked", "questions"],
    items: [
      {
        question: "What services does KATIC offer?",
        answer:
          "Architectural design, interior design, construction and execution, turnkey projects, renovation, exterior and landscape design, and property care — all under one roof.",
        link: { label: "Explore all services", href: routes.services },
      },
      {
        question: "Where do you work?",
        answer: "Across Kerala and South India from our Kochi office, and in Dubai and the UAE.",
        link: { label: "See our locations", href: routes.location("india") },
      },
      {
        question: "How does a project start?",
        answer:
          "With a conversation about your site, needs and budget, followed by a site visit and a proposal.",
        // The original's `href="contact"` goes to this page's own enquiry form (KI-F07).
        link: { label: "Start a project", action: "contact" },
      },
      {
        question: "Can one team handle design and construction?",
        answer:
          "Yes. Our turnkey service covers design, approvals, construction, interiors and handover under one contract.",
        link: { label: "About turnkey projects", href: routes.service("turnkey") },
      },
      {
        question: "How long does a typical home take?",
        answer:
          "Design usually takes 2–4 months and construction 12–18 months, depending on size and finishes.",
        link: { label: "See our process", href: `${routes.home}#home-process` },
      },
      {
        question: "Do you support clients after handover?",
        answer: "Yes. KATIC Care provides maintenance plans, repairs and ongoing support.",
        link: { label: "About KATIC Care", href: routes.division("care") },
      },
    ],
  },
} as const satisfies HomeContactContent;
