import { routes } from "@/lib/routes";
import type { FooterColumn, Navigation, NavItem } from "@/lib/schemas/navigation";

export type { FooterColumn, NavDropdown, NavItem, NavKey, NavLink } from "@/lib/schemas/navigation";

/** Header navigation (the original's `V.home` config; other header variants were never used). */
export const HEADER_NAV: readonly NavItem[] = [
  { key: "home", label: "Home", href: routes.home },
  { key: "about", label: "About", href: routes.about },
  {
    key: "services",
    label: "Services",
    href: routes.services,
    dropdown: {
      groups: [
        {
          label: "Design",
          links: [
            { label: "Architectural Design", href: routes.service("architecture") },
            { label: "Interior Design", href: routes.service("interior") },
            { label: "Exterior & Landscape Design", href: routes.service("exterior") },
          ],
        },
        {
          label: "Construction",
          links: [
            { label: "Construction & Execution", href: routes.service("construction") },
            { label: "Turnkey Projects", href: routes.service("turnkey") },
            { label: "Renovation & Remodeling", href: routes.service("renovation") },
            { label: "Property Care & Maintenance", href: routes.service("property-care") },
          ],
        },
      ],
      all: { label: "All Services →", href: routes.services },
    },
  },
  {
    key: "projects",
    label: "Projects",
    href: `${routes.works}#works-list`,
    dropdown: {
      groups: [
        {
          label: "Sectors",
          links: [
            { label: "Residential", href: routes.worksCategory("residential") },
            { label: "Commercial", href: routes.worksCategory("commercial") },
            { label: "Institutional", href: routes.worksCategory("institutional") },
            { label: "Hospitality", href: routes.worksCategory("hospitality") },
          ],
        },
        {
          label: "Disciplines",
          links: [
            { label: "Architecture", href: routes.worksCategory("architecture") },
            { label: "Interiors", href: routes.worksCategory("interiors") },
            { label: "Villas / Flats", href: routes.worksCategory("villas") },
          ],
        },
      ],
      all: { label: "All Projects →", href: `${routes.works}#works-list` },
    },
  },
  {
    key: "divisions",
    label: "Divisions",
    href: routes.division("design"),
    dropdown: {
      groups: [
        {
          label: "Divisions",
          links: [
            { label: "KATIC Design", href: routes.division("design") },
            { label: "KATIC Interior", href: routes.division("interior") },
            { label: "KATIC Infrastructure", href: routes.division("infrastructure") },
            { label: "KATIC Developers", href: routes.division("developers") },
            { label: "KATIC Care", href: routes.division("care") },
          ],
        },
      ],
      all: { label: "About KATIC →", href: `${routes.about}#about-divisions` },
    },
  },
  { key: "reviews", label: "Reviews", href: routes.reviews },
  { key: "blogs", label: "Blogs", href: routes.blog },
  {
    key: "location",
    label: "Location",
    href: routes.location("india"),
    dropdown: {
      groups: [
        {
          label: "Locations",
          links: [
            { label: "India", href: routes.location("india") },
            { label: "Dubai", href: routes.location("dubai") },
          ],
        },
      ],
    },
  },
];

/** Footer link columns (Address and Contact columns are built from SITE settings). */
export const FOOTER_COLUMNS: readonly FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: routes.home },
      { label: "About", href: routes.about },
      { label: "Projects", href: routes.works },
      { label: "Client Reviews", href: routes.reviews },
      { label: "Blogs", href: routes.blog },
      { label: "News", href: routes.news },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All Services", href: routes.services },
      { label: "Architectural Design", href: routes.service("architecture") },
      { label: "Interior Design", href: routes.service("interior") },
      { label: "Construction & Execution", href: routes.service("construction") },
      { label: "Turnkey Projects", href: routes.service("turnkey") },
      { label: "Renovation & Remodeling", href: routes.service("renovation") },
      { label: "Exterior & Landscape Design", href: routes.service("exterior") },
      { label: "Property Care & Maintenance", href: routes.service("property-care") },
    ],
  },
  {
    title: "Divisions",
    links: [
      { label: "KATIC Design", href: routes.division("design") },
      { label: "KATIC Interior", href: routes.division("interior") },
      { label: "KATIC Infrastructure", href: routes.division("infrastructure") },
      { label: "KATIC Developers", href: routes.division("developers") },
      { label: "KATIC Care", href: routes.division("care") },
    ],
  },
  {
    title: "Locations",
    links: [
      { label: "India", href: routes.location("india") },
      { label: "Dubai", href: routes.location("dubai") },
    ],
  },
];

/** The `/navigation` resource as the static repository serves it. */
export const NAVIGATION = { header: HEADER_NAV, footer: FOOTER_COLUMNS } satisfies Navigation;
