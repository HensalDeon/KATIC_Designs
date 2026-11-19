import { routes } from "@/lib/routes";

import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/**
 * Factory & Manufacturing (`#p-factory`, reference/original/katic-designs-final.stripped.html
 * 3441–3465; docs/analysis/03 §2.3), a sub-page of Interior. Copy verbatim from the original.
 *
 * No related services and no testimonials. The form files every lead under Interior Design with a
 * hidden service field (KI-C14 tracks giving factory leads their own option); the hero CTA scrolls
 * to it, where the original's `prefill()` threw on the missing select (KI-F01).
 */
export const FACTORY_PAGE = {
  slug: "factory",
  seo: {
    title: "Custom Furniture & Joinery Manufacturing in Kerala | Katic Designs",
    description:
      "Kitchens, wardrobes, panelling, doors and custom furniture made in the Katic Designs workshop and installed by our own teams.",
  },
  hero: {
    image: {
      src: "photos/timber-lounge-chair",
      alt: "Timber lounge chair by a curtained window",
    },
    kicker: "Interior Design · Factory & Manufacturing",
    title: { lines: ["Crafted In-House."], accent: "Finished by Hand.", accentOnNewLine: true },
    lead: "Our factory produces the furniture, joinery and interior components that complete KATIC interiors.",
    primaryCta: {
      kind: "contact",
      label: "Enquire About Manufacturing",
      service: "Interior Design",
    },
    secondaryCta: {
      kind: "link",
      label: "Back to Interior Design",
      href: routes.service("interior"),
    },
  },
  sections: [
    {
      type: "split",
      plant: { asset: "plants/coleus", corner: "bottom-right", width: 300 },
      image: { src: "photos/teak-stair-handrail", alt: "Teak stair handrail detail" },
      caption: "Handrail detail · teak & steel",
      kicker: "Factory overview",
      title: ["Where design", "meets the bench"],
      lead: "The factory is the link between our drawings and the finished room. Designs move straight from our interior team to the workshop floor.",
      body: "Making in-house means tighter tolerances, consistent finishes and fewer hand-offs — and it lets us adjust details quickly when site conditions change.",
    },
    {
      type: "features",
      header: {
        kicker: "Manufacturing capabilities",
        title: ["What we", "make"],
        lead: "Furniture, joinery and interior components produced for KATIC projects.",
      },
      columns: 3,
      items: [
        {
          icon: "kitchen",
          title: "Kitchens",
          text: "Modular and bespoke kitchens with stone, laminate, veneer and lacquer finishes.",
        },
        {
          icon: "wardrobe",
          title: "Wardrobes & storage",
          text: "Built-in wardrobes, walk-ins and storage walls made to fit.",
        },
        {
          icon: "wardrobe",
          title: "Wall panelling & screens",
          text: "Timber panelling, fluted surfaces, jaalis and room dividers.",
        },
        {
          icon: "wardrobe",
          title: "Loose furniture",
          text: "Dining tables, beds, consoles and seating in solid wood and veneer.",
        },
        {
          icon: "door",
          title: "Doors & frames",
          text: "Internal doors, frames and architraves finished to match.",
        },
        {
          icon: "target",
          title: "Custom details",
          text: "Reception desks, display units and one-off pieces for commercial spaces.",
        },
      ],
    },
    {
      type: "process",
      header: {
        kicker: "Craftsmanship & quality control",
        title: ["Every piece", "checked twice"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "Material handling, detailing, finishing standards and quality checks at each stage.",
      },
      steps: [
        {
          icon: "layers",
          title: "Material selection",
          text: "Seasoned timber and certified boards, checked for moisture and grade.",
        },
        {
          icon: "target",
          title: "Precision cutting",
          text: "CNC and panel saws cut to drawing tolerances.",
        },
        {
          icon: "target",
          title: "Assembly & detailing",
          text: "Joinery assembled and hardware fitted by skilled craftspeople.",
        },
        {
          icon: "layers",
          title: "Finishing",
          text: "Sanding, polishing, lacquer and veneer finishes in a controlled area.",
        },
        {
          icon: "shield",
          title: "Quality inspection",
          text: "Each piece is inspected, protected and labelled before dispatch.",
        },
      ],
    },
    {
      type: "gallery",
      header: {
        kicker: "Factory gallery",
        title: ["Inside the", "workshop"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "The facility, the team and production in progress.",
      },
      // TODO(content): KI-D05. Stock images; the client supplies workshop photography.
      items: [
        {
          image: "photos/massing-model",
          alt: "White massing model on a dark background",
          caption: "Model & mock-ups",
        },
        {
          image: "photos/timber-screen-atrium",
          alt: "Atrium with timber screens, a steel handrail and planting",
          caption: "Timber screens",
        },
        {
          image: "photos/teak-stair-handrail",
          alt: "Close-up of a teak stair handrail",
          caption: "Handrail detail",
        },
        {
          image: "photos/bedroom-teak-screen",
          alt: "Bedroom with a teak screen and wardrobe",
          caption: "Teak screen",
        },
        {
          image: "photos/timber-lounge-chair",
          alt: "Timber lounge chair by a curtained window",
          caption: "Joinery in place",
          wide: true,
        },
      ],
    },
    {
      type: "products",
      header: {
        kicker: "Finished products",
        title: ["Made here.", "Lived in there."],
        lead: "How factory-made pieces come together in completed KATIC interiors.",
      },
      columns: 3,
      // The original links every card to its one static project page, The Courtyard House.
      items: [
        {
          title: "Kitchen island & cabinetry",
          text: "Teak and honed stone kitchen for The Courtyard House.",
          image: "photos/kitchen-island-teak",
          alt: "Kitchen island with teak and stone",
          project: "the-courtyard-house",
        },
        {
          title: "Bedroom screen & wardrobe",
          text: "Teak screen and full-height storage in the main bedroom.",
          image: "photos/bedroom-teak-screen",
          alt: "Bedroom with a teak screen and wardrobe",
          project: "the-courtyard-house",
        },
        {
          title: "Dining joinery",
          text: "Built-in sideboard and dining wall along the courtyard edge.",
          image: "photos/timber-lounge-chair",
          alt: "Timber lounge chair by a curtained window",
          project: "the-courtyard-house",
        },
      ],
    },
    { type: "divisions", divisions: ["interior", "infrastructure"] },
  ],
  contact: {
    heading: { lines: ["Enquire About"], accent: "Manufacturing" },
    lead: "Tell us what you need made — quantities, finishes and timelines — and our factory team will get back to you.",
    form: {
      // TODO(content): KI-C14. Factory leads are filed as Interior Design, as in the original.
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
          name: "quantity",
          label: "Quantity",
          options: ["Single piece", "Full home", "Multiple units / project"],
        },
      ],
    },
    faq: {
      ...FAQ_HEADER,
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
          answer:
            "No fixed minimum. We take on single bespoke pieces as well as multi-unit orders.",
          // KI-F07: the original's `href="contact"` (no `#`) only worked through JS interception.
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
    },
  },
} as const satisfies ServicePageContent;
