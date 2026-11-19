import type { ServiceOption } from "@/content/services";
import type { ServiceSlug } from "@/lib/routes";

import type { MediaId } from "../media";

/**
 * Home "Services" explorer (`section.svx#home-deliver`): copy verbatim from the original
 * (reference/original, line 2854–2859).
 *
 * Order: the home page lists the seven services in its own order (Exterior 3rd, inside "Design"),
 * while About and Services list Exterior 6th. The home order is kept here for parity; KI-D03
 * tracks agreeing one order with the client.
 */
export type ExplorerGroup = "Design" | "Construction";

export type ExplorerService = {
  readonly slug: ServiceSlug;
  /** Visible name; also the service preselected by "Get a quote". */
  readonly name: ServiceOption;
  readonly group: ExplorerGroup;
  readonly description: string;
  /** Four highlights shown as a 2 × 2 list. */
  readonly highlights: readonly [string, string, string, string];
  readonly image: MediaId;
};

export type ExplorerContent = {
  readonly kicker: string;
  readonly title: string;
  readonly lead: string;
  readonly allLabel: string;
  readonly viewLabel: string;
  readonly quoteLabel: string;
  readonly services: readonly ExplorerService[];
};

export const HOME_EXPLORER = {
  kicker: "Our Services",
  title: "Services",
  lead: "One studio for every stage of your project — design, build, finish and care.",
  allLabel: "Explore all services",
  viewLabel: "View service",
  quoteLabel: "Get a quote",
  services: [
    {
      slug: "architecture",
      name: "Architectural Design",
      group: "Design",
      description:
        "Homes and buildings planned around your site, climate and the way you live — from the first sketch to approved drawings.",
      highlights: ["Site study", "Concept & planning", "Elevations", "Approval drawings"],
      image: "photos/brick-courtyard-house-dusk",
    },
    {
      slug: "interior",
      name: "Interior Design",
      group: "Design",
      description:
        "Calm, practical interiors with materials, furniture and lighting chosen together — made in our own workshop.",
      highlights: ["Space planning", "Materials & finishes", "Custom furniture", "Lighting"],
      image: "photos/sofa-jali-detail",
    },
    {
      slug: "exterior",
      name: "Exterior & Landscape Design",
      group: "Design",
      description:
        "Facades, gardens and outdoor rooms designed with the building, so inside and outside feel like one place.",
      highlights: [
        "Facade design",
        "Gardens & courtyards",
        "Outdoor living",
        "Hardscape & lighting",
      ],
      image: "photos/courtyard-tree-timber-balconies",
    },
    {
      slug: "construction",
      name: "Construction & Execution",
      group: "Construction",
      description:
        "Our own site teams build exactly to the drawing, with clear schedules and quality checks at every stage.",
      highlights: ["Civil & structure", "MEP coordination", "Site management", "Finishing"],
      image: "photos/house-under-construction",
    },
    {
      slug: "turnkey",
      name: "Turnkey Projects",
      group: "Construction",
      description:
        "One team and one contract, from design and approvals to construction, interiors and handover.",
      highlights: [
        "Single point of contact",
        "Fixed scope & budget",
        "Design + build",
        "Ready-to-move handover",
      ],
      image: "photos/two-storey-house-lawn",
    },
    {
      slug: "renovation",
      name: "Renovation & Remodeling",
      group: "Construction",
      description:
        "Give an existing home or building new life — better light, better layout and modern services, keeping the character worth saving.",
      highlights: ["Condition survey", "Re-planning", "Kitchens & baths", "Facade upgrade"],
      image: "photos/garden-veranda-chairs",
    },
    {
      slug: "property-care",
      name: "Property Care & Maintenance",
      group: "Construction",
      description:
        "Planned maintenance and quick repairs that keep your property looking good and working well, year after year.",
      highlights: ["Routine inspections", "Repairs", "Pre-monsoon checks", "Priority support"],
      image: "photos/homeowners-walkthrough",
    },
  ],
} as const satisfies ExplorerContent;
