import { routes } from "@/lib/routes";

export type NavLink = { readonly label: string; readonly href: string };

export type NavDropdown = {
  readonly groups: readonly { readonly label: string; readonly links: readonly NavLink[] }[];
  readonly all?: NavLink;
};

export type NavItem = NavLink & {
  readonly key: NavKey;
  readonly dropdown?: NavDropdown;
};

export type NavKey =
  "home" | "about" | "services" | "projects" | "divisions" | "reviews" | "blogs" | "location";

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

/** Header item highlighted for a pathname (original `ACTIVE` map; /news highlights nothing). */
export function activeNavKey(pathname: string): NavKey | undefined {
  const section = pathname.split("/")[1] ?? "";
  switch (section) {
    case "":
      return "home";
    case "about":
      return "about";
    case "services":
      return "services";
    case "works":
      return "projects";
    case "divisions":
      return "divisions";
    case "blog":
      return "blogs";
    case "locations":
      return "location";
    case "reviews":
      return "reviews";
    default:
      return undefined;
  }
}

export type FooterColumn = { readonly title: string; readonly links: readonly NavLink[] };

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
