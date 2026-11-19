import { FAQ_HEADER } from "./shared";
import type { ServicePageContent } from "./types";

/** Deep link of the before/after block (the original `#renovation/ba`). */
const BEFORE_AFTER_ID = "ba";

/**
 * Renovation & Remodeling (`#p-renovation`, reference/original/katic-designs-final.stripped.html
 * 3522–3548; docs/analysis/03 §2.6). Copy verbatim from the original. The before/after pairs take
 * the place of featured projects.
 */
export const RENOVATION_PAGE = {
  slug: "renovation",
  seo: {
    title: "Home Renovation & Remodeling in Kochi, Kerala | Katic Designs",
    description:
      "Renovate and remodel homes and buildings with better light, layouts, kitchens, bathrooms and facades while keeping the character worth saving.",
  },
  hero: {
    image: { src: "photos/garden-veranda-chairs", alt: "Garden veranda with cane chairs" },
    kicker: "Renovation & Remodeling",
    title: { lines: ["New Life for"], accent: "Existing Spaces", accentOnNewLine: true },
    lead: "Transforming existing homes and buildings through careful renovation and redesign.",
    primaryCta: {
      kind: "contact",
      label: "Plan a Renovation",
      service: "Renovation & Remodeling",
    },
    secondaryCta: { kind: "link", label: "See Transformations", href: `#${BEFORE_AFTER_ID}` },
  },
  sections: [
    {
      type: "split",
      plant: { asset: "plants/window-box-flowers", corner: "bottom-left", width: 320 },
      image: {
        src: "photos/brick-house-arched-windows-night",
        alt: "Brick house with arched windows lit at night",
      },
      caption: "The Old Mill Renewal · Aluva",
      kicker: "Rethinking existing spaces",
      title: ["Better, not", "just newer"],
      lead: "Buildings outlive the needs they were designed for. Renovation adapts them for how people live and work today.",
      body: "We study what works, what doesn’t and what the structure allows — then improve light, layout, services and finishes without losing the character worth keeping.",
    },
    {
      type: "features",
      header: {
        kicker: "Services",
        title: ["Renovation", "services"],
        lead: "Transforming existing spaces through renovation and redesign.",
      },
      columns: 3,
      items: [
        { icon: "tools", title: "Home renovation", text: "Room-by-room or whole-home upgrades." },
        { icon: "tools", title: "Layout remodeling", text: "Opening up and re-planning spaces." },
        {
          icon: "kitchen",
          title: "Kitchen & bath upgrades",
          text: "New kitchens, bathrooms and services.",
        },
        { icon: "facade", title: "Facade refresh", text: "New elevations, cladding and glazing." },
        { icon: "tools", title: "Adaptive reuse", text: "Converting buildings to new uses." },
        { icon: "tools", title: "Structural repairs", text: "Strengthening and waterproofing." },
      ],
    },
    {
      type: "sectors",
      header: {
        kicker: "Project types",
        title: ["Properties we", "renovate"],
        lead: "Residential, commercial, institutional and hospitality properties.",
      },
      sectors: ["residential", "commercial", "institutional", "hospitality"],
    },
    {
      type: "process",
      header: {
        kicker: "Our renovation process",
        title: ["From survey", "to handover"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "The stages of our master process that apply to renovation.",
      },
      steps: ["discovery", "design", "engineering", "construction", "completion", "handover"],
    },
    {
      type: "beforeAfter",
      id: BEFORE_AFTER_ID,
      header: {
        kicker: "Before & after",
        title: ["Transformations"],
        // TODO(content): KI-C08. Placeholder note shown verbatim by the original.
        lead: "Paired photographs and short descriptions of completed renovations. Representative images — replace with real before-and-after photography.",
      },
      // TODO(content): KI-C11. Unrelated stock images; the client supplies real pairs. Alts say
      // which side and describe the photo (KI-A13: the original's were swapped and repeated).
      pairs: [
        {
          before: {
            image: "photos/house-under-construction",
            alt: "Before: house under construction in a forest clearing",
          },
          after: {
            image: "photos/brick-house-arched-windows-night",
            alt: "After: brick house with arched windows lit at night",
          },
          title: "The Old Mill Renewal",
          meta: "Commercial · Aluva",
          text: "An industrial shell retained and opened up for a new public use, with new glazing, services and finishes.",
        },
        {
          before: {
            image: "photos/architect-site-drawings",
            alt: "Before: architect reviewing drawings on a forested site",
          },
          after: {
            image: "photos/kerala-house-pond",
            alt: "After: traditional Kerala house with tiled roofs around a pond",
          },
          title: "Kottayam Family Home",
          meta: "Residential · Kottayam",
          text: "A tired 1990s house re-planned around a new courtyard, with a new roof, kitchen and bedrooms.",
        },
      ],
    },
    {
      type: "related",
      header: {
        kicker: "Related services",
        title: ["Services that work", "alongside renovation"],
      },
      columns: 3,
      services: ["interior", "construction", "turnkey"],
    },
    { type: "divisions", divisions: ["infrastructure", "interior", "design", "care"] },
    { type: "testimonials", testimonials: ["ernakulam", "arch", "thrissur"] },
  ],
  contact: {
    heading: { lines: ["Tell Us About"], accent: "Your Space" },
    lead: "Explain your space and the changes you have in mind. We’ll arrange a site assessment.",
    form: {
      service: { mode: "select", defaultService: "Renovation & Remodeling" },
      extraFields: [
        {
          name: "ptype",
          label: "Project Type",
          options: ["Residential", "Commercial", "Institutional", "Hospitality"],
        },
        { name: "occupancy", label: "Occupancy", options: ["Occupied during work", "Vacant"] },
      ],
    },
    faq: {
      ...FAQ_HEADER,
      items: [
        {
          question: "What is included in a renovation?",
          answer:
            "Anything from a single room to a whole building: layout changes, services, structure, finishes and facade.",
        },
        {
          question: "Do you assess the site first?",
          answer:
            "Yes. A site assessment checks structure, services and moisture before we design anything.",
          // KI-F07: the original's `href="contact"` (no `#`) only worked through JS interception.
          link: {
            label: "Book a site assessment",
            action: "contact",
            service: "Renovation & Remodeling",
          },
        },
        {
          question: "How long does a renovation take?",
          answer: "Most home renovations take 2–6 months depending on scope and occupancy.",
        },
        {
          question: "Can we live in the property during the work?",
          answer: "Often yes. We phase the work and protect occupied areas to keep disruption low.",
        },
        {
          question: "How do you plan costs for older buildings?",
          answer:
            "We include a contingency for unknowns and update costs as soon as hidden conditions are found.",
        },
      ],
    },
  },
} as const satisfies ServicePageContent;
