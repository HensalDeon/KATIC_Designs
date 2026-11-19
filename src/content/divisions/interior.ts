import { routes } from "@/lib/routes";

import { divisionHero } from "./shared";
import type { DivisionPageContent } from "./types";

/**
 * KATIC Interior (`#p-div-interior`, reference/original/katic-designs-final.stripped.html
 * 3991–4004; docs/analysis/04 §3). Copy verbatim from the original; alts describe the photos
 * (KI-A13).
 */
export const INTERIOR_DIVISION_PAGE = {
  slug: "interior",
  seo: {
    title: "KATIC Interior | Interiors & In-house Manufacturing",
    description:
      "KATIC Interior designs, manufactures and installs interiors, furniture and joinery under one team.",
  },
  hero: divisionHero("interior", {
    image: {
      src: "photos/city-view-living-room",
      alt: "Modern living room with a curved sofa and floor-to-ceiling city views",
    },
    lead: "Interiors designed, manufactured and installed by one team.",
  }),
  blocks: [
    {
      type: "split",
      plant: { asset: "plants/bird-of-paradise-flower", corner: "bottom-right", width: 230 },
      image: {
        src: "photos/sofa-jali-detail",
        alt: "Sofa with cushions in front of a jali screen",
      },
      kicker: "About KATIC Interior",
      title: ["Aesthetics with", "everyday function"],
      lead: "KATIC Interior brings together interior design, furniture and in-house manufacturing.",
      body: "Our approach balances aesthetics, functionality, material choices and detailing — interiors that look calm and work hard.",
    },
    {
      type: "features",
      header: { kicker: "Our interior capabilities", title: ["Interior", "capabilities"] },
      columns: 3,
      items: [
        {
          icon: "sofa",
          title: "Interior design",
          text: "Concepts, mood and complete interior schemes.",
        },
        { icon: "compass", title: "Space planning", text: "Layouts and furniture zoning." },
        {
          icon: "layers",
          title: "Material selection",
          text: "Stone, timber, fabric and metal palettes.",
        },
        { icon: "wardrobe", title: "Furniture", text: "Bespoke and curated furniture." },
        { icon: "bulb", title: "Lighting", text: "Ambient, task and accent lighting." },
        { icon: "crane", title: "Execution", text: "Installation and finishing on site." },
      ],
    },
    {
      type: "split",
      reverse: true,
      image: { src: "photos/bedroom-teak-screen", alt: "Bedroom with a teak screen and wardrobe" },
      kicker: "Materials & craftsmanship",
      title: ["Detail you", "can feel"],
      lead: "Material knowledge, detailing standards and finish quality are what make an interior last.",
      body: "Every junction, edge and finish is drawn, sampled and checked before it is made.",
      bullets: ["Material sampling", "Detail drawings", "Finish standards", "Mock-ups"],
    },
    {
      type: "gallery",
      header: {
        kicker: "Factory & manufacturing",
        title: ["Our own", "factory"],
        // TODO(content): KI-C07. Designer-brief copy shown verbatim by the original.
        lead: "The factory’s role, its actual capabilities and craftsmanship.",
        cta: { label: "Visit the Factory", href: routes.service("factory"), variant: "dark" },
      },
      items: [
        {
          image: "photos/kitchen-island-teak",
          alt: "Kitchen island with teak and stone",
          caption: "Kitchens",
        },
        {
          image: "photos/teak-stair-handrail",
          alt: "Teak stair handrail detail",
          caption: "Details",
        },
        {
          image: "photos/timber-lounge-chair",
          alt: "Timber lounge chair by a curtained window",
          caption: "Joinery",
        },
      ],
    },
    {
      type: "projects",
      header: {
        kicker: "Featured projects",
        title: ["Interiors across", "sectors"],
        lead: "Residential, commercial, institutional and hospitality interiors.",
        cta: { label: "View Interior Projects", href: routes.worksCategory("interiors") },
      },
      columns: 3,
      items: [
        { project: "cinder-house", meta: "Residential · Interiors · Dubai, UAE" },
        // KI-D01: Works labels the same project Commercial (it is both, see projects.ts).
        { project: "serein-wellness-club", meta: "Hospitality · Interiors · Abu Dhabi, UAE" },
        { project: "mattancherry-studio", meta: "Commercial · Interiors · Mattancherry, Kochi" },
      ],
    },
    {
      type: "process",
      header: { kicker: "Our integrated approach", title: ["Design, make,", "install"] },
      steps: [
        {
          icon: "compass",
          title: "Design",
          text: "Interior design and detailed drawings by KATIC Interior.",
        },
        {
          icon: "wardrobe",
          title: "Manufacture",
          text: "Furniture and joinery made in our factory.",
        },
        {
          icon: "crane",
          title: "Execute",
          text: "Installed and finished on site with KATIC Infrastructure.",
        },
      ],
    },
  ],
} as const satisfies DivisionPageContent;
