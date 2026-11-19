import type { ContactSectionContent } from "@/components/sections/contact-section";
import type {
  BlockBase,
  ContentBlock,
  PageHeroContent,
  SectionHeaderContent,
} from "@/content/blocks";
import type { ProjectSlug } from "@/content/projects";
import { SITE } from "@/content/site";
import { DIVISION_SLUGS, INDIA_PROJECTS_ID, type IndiaArea, routes } from "@/lib/routes";

/**
 * The India location page (`/locations/india`, original `#p-india`, lines 4071–4096,
 * docs/analysis/04 §7): a banner, seven blocks and the contact section. Copy verbatim. Plain,
 * serialisable data, so Laravel can serve the same shape later (`Location` resource). Shared
 * entities are referenced by slug: services (`related-services.ts`), divisions and projects.
 *
 * The blocks are the shared vocabulary (`ContentBlock`) plus one page-specific block, the
 * filterable project grid (`indiaProjects`). Tones alternate from white after the hero, as the
 * original renders them, and the contact takes the opposite of the last block (black).
 */

/** A project card of the filterable grid: the project by slug, its card meta and its area. */
export type IndiaProjectCard = {
  readonly project: ProjectSlug;
  /** The small orange line, verbatim ("Residential · Architecture · Panampilly Nagar, Kochi"). */
  readonly meta: string;
  /**
   * Kochi or the rest of Kerala (the original's `data-cat`). Page data rather than a project field:
   * it is how this page groups its cards, and `projects.ts` already has `region` and `location`;
   * a unit test keeps the two consistent (india.test.ts).
   */
  readonly area: IndiaArea;
};

/** A filter button (`.kcats button`, `data-f`). */
export type IndiaFilter = { readonly value: IndiaArea | "all"; readonly label: string };

/** `#india-projects` (`section.ks` with `.kcats[data-filter="india"]`): page-specific block. */
export type IndiaProjectsBlock = BlockBase & {
  readonly type: "indiaProjects";
  readonly id: string;
  readonly header: SectionHeaderContent;
  /** Accessible name of the filter group. */
  readonly filtersLabel: string;
  readonly filters: readonly IndiaFilter[];
  readonly items: readonly IndiaProjectCard[];
};

export type IndiaBlock = ContentBlock | IndiaProjectsBlock;

export type IndiaPageContent = {
  /** The original's `data-title` (already ends in the brand) and `data-desc`. */
  readonly seo: { readonly title: string; readonly description: string };
  readonly hero: PageHeroContent;
  readonly blocks: readonly IndiaBlock[];
  /** The CONTACT template with India's copy and extra selects (`section.contact[data-src=india]`). */
  readonly contact: ContactSectionContent & { readonly id: string };
};

/** India's contact section id (the original renames it `india-contact` at runtime, JS 4776). */
export const INDIA_CONTACT_ID = "india-contact";
const CONTACT_HREF = `#${INDIA_CONTACT_ID}`;

export const INDIA_PAGE = {
  seo: {
    title: "Architects & Interior Designers in Kerala, India | Katic Designs",
    description:
      "Katic Designs serves clients across Kochi, Kerala and South India with architecture, interiors, construction and property care.",
  },
  hero: {
    image: {
      src: "photos/pond-house-dusk",
      alt: "House beside a pond at dusk",
    },
    kicker: "KATIC · India",
    title: {
      lines: ["Designing Spaces."],
      accent: "Building Possibilities.",
      accentOnNewLine: true,
    },
    lead: "Architecture, interiors, construction and property care across Kerala and South India.",
    primaryCta: { kind: "link", label: "Explore Our Projects", href: `${routes.works}#works-list` },
    secondaryCta: { kind: "contact", label: "Start a Project" },
  },
  blocks: [
    // 2. White.
    {
      type: "split",
      image: {
        src: "photos/brick-veranda-garden",
        alt: "Brick veranda overlooking a tropical garden",
      },
      caption: "Courtyard light · Kochi",
      kicker: "KATIC in South India",
      title: ["Rooted in Kochi.", "Growing across", "the south."],
      lead: "Our established office in Kochi serves clients across Kerala, and we are expanding into Chennai and Bangalore.",
      body: "Regional service coverage is shown separately from our physical offices — we take on projects across Kerala, Tamil Nadu, Karnataka and other serviceable locations.",
    },
    // 3. Black: our locations. Kochi is the office (a "go to contact" card, `a.kc href="#contact"`);
    // Chennai and Bangalore are expanding locations without a link (`div.kc`, analysis/04 §14.28).
    {
      type: "cards",
      header: {
        kicker: "Our locations",
        title: ["Where to", "find us"],
        lead: "Kochi is our existing office. Chennai and Bangalore are expanding locations.",
      },
      columns: 3,
      items: [
        {
          href: CONTACT_HREF,
          contact: true,
          image: "photos/backwaters-aerial",
          alt: "Aerial view of the Kochi backwaters at sunrise",
          tag: "Office",
          meta: "Kerala",
          title: "Kochi",
          // TODO(content): KI-C02 placeholder address (a Mumbai PIN); the client supplies the studio's.
          text: `${SITE.address.lines.join(", ")} · ${SITE.email}`,
          moreLabel: "Contact the Kochi office",
        },
        {
          image: "photos/hillside-house-greenery",
          alt: "House set into a green hillside under monsoon clouds",
          tag: "Expanding",
          meta: "Tamil Nadu",
          title: "Chennai",
          text: "Serving projects in and around Chennai. Office details coming soon.",
        },
        {
          image: "photos/urban-street-houses",
          alt: "Street of urban houses after rain",
          tag: "Expanding",
          meta: "Karnataka",
          title: "Bangalore",
          text: "Serving projects in and around Bangalore. Office details coming soon.",
        },
      ],
    },
    // 4. White, hanging pothos top right (`.pp-host`): the seven service cards (4 + 3).
    {
      type: "related",
      header: {
        kicker: "Our services",
        title: ["Everything under", "one roof"],
        cta: { label: "All Services", href: routes.services },
      },
      columns: 4,
      services: [
        "architecture",
        "interior",
        "construction",
        "turnkey",
        "renovation",
        "exterior",
        "property-care",
      ],
      plant: { asset: "plants/hanging-pothos", corner: "top-right", width: 150 },
    },
    // 5. Black: all five divisions.
    {
      type: "divisionCards",
      header: { kicker: "Our divisions", title: ["One vision.", "Five divisions."] },
      columns: 5,
      divisions: DIVISION_SLUGS,
    },
    // 6. White: the filterable project grid.
    {
      type: "indiaProjects",
      id: INDIA_PROJECTS_ID,
      header: {
        kicker: "Our projects",
        title: ["Selected work", "in India"],
        // TODO(content): KI-C07 designer-brief copy shown as the lead; the client supplies the real one.
        lead: "Project type and location, with location filters.",
      },
      filtersLabel: "Filter projects by location",
      filters: [
        { value: "all", label: "All" },
        { value: "kochi", label: "Kochi" },
        { value: "kerala", label: "Rest of Kerala" },
      ],
      items: [
        {
          project: "canal-house",
          meta: "Residential · Architecture · Panampilly Nagar, Kochi",
          area: "kochi",
        },
        {
          project: "harbour-loft",
          meta: "Residential · Interiors · Marine Drive, Kochi",
          area: "kochi",
        },
        {
          project: "mattancherry-studio",
          meta: "Commercial · Interiors · Mattancherry, Kochi",
          area: "kochi",
        },
        {
          project: "palm-veil-residence",
          meta: "Residential · Villa · Thrissur, Kerala",
          area: "kerala",
        },
        {
          project: "house-of-three-courts",
          meta: "Residential · Construction · Kottayam, Kerala",
          area: "kerala",
        },
        {
          project: "greenfield-school-campus",
          meta: "Institutional · Architecture · Kottayam, Kerala",
          area: "kerala",
        },
      ],
    },
    // 7. Black.
    {
      type: "features",
      header: { kicker: "Why KATIC", title: ["Why clients", "choose us"] },
      columns: 4,
      items: [
        {
          icon: "team",
          title: "Integrated capabilities",
          text: "Design, interiors, construction and care in one team.",
        },
        {
          icon: "compass",
          title: "Design expertise",
          text: "Architecture shaped by climate and context.",
        },
        { icon: "crane", title: "Coordinated execution", text: "Our own site teams and factory." },
        {
          icon: "clock",
          title: "Project management",
          text: "One programme, one point of contact.",
        },
      ],
    },
    // 8. White.
    {
      type: "process",
      header: { kicker: "Our approach", title: ["From first call", "to handover"] },
      steps: [
        {
          icon: "search",
          title: "Consultation",
          text: "Understanding your site, needs and budget.",
        },
        { icon: "compass", title: "Design", text: "Architecture and interiors resolved together." },
        { icon: "crane", title: "Execution", text: "Built by our teams with regular updates." },
        { icon: "key", title: "Handover", text: "Walkthrough, documentation and aftercare." },
      ],
    },
  ],
  contact: {
    id: INDIA_CONTACT_ID,
    kicker: "Start your project",
    heading: { lines: ["Start Your Project"], accent: "in India" },
    lead: "For clients in Kerala, Tamil Nadu, Karnataka and other serviceable locations.",
    // TODO(content): KI-C04 the phone and WhatsApp number are the original's placeholders (SITE).
    channels: ["email", "phone", "whatsapp"],
    form: {
      service: { mode: "select" },
      extraFields: [
        {
          name: "ptype",
          label: "Project Type",
          options: ["Residential", "Commercial", "Institutional", "Hospitality"],
        },
        {
          name: "loc",
          label: "Project Location",
          options: [
            "Kochi",
            "Elsewhere in Kerala",
            "Chennai / Tamil Nadu",
            "Bangalore / Karnataka",
            "Other",
          ],
        },
      ],
      // The original's PREFILL `india: { loc: "India" }`.
      prefillLocation: "India",
    },
  },
} as const satisfies IndiaPageContent;
