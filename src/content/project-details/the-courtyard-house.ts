import { routes } from "@/lib/routes";

import type { ProjectDetail } from "./types";

/**
 * The Courtyard House (`#p-project`, original lines 3782–3977; docs/analysis/04 §2). Copy is
 * verbatim. Photos are the original's; alt texts describe each photo (KI-A13: the original used the
 * section headline as the alt of most of them). Gallery captions are the original's figcaptions.
 */
export const THE_COURTYARD_HOUSE: ProjectDetail = {
  slug: "the-courtyard-house",
  seo: {
    title: "The Courtyard House, Kochi | Project by Katic Designs",
    description:
      "A multi-generational family home in Kochi organised around a planted courtyard, designed and built by Katic Designs.",
  },
  hero: {
    image: {
      src: "photos/courtyard-house-reflection-dusk",
      alt: "The Courtyard House reflected in its pool at dusk",
    },
    objectPosition: "center 60%",
    title: { lines: ["The Courtyard"], accent: "House" },
    // TODO(content): KI-D01 this page says Kakkanad, Kochi; About's card (`projects.ts`) says
    // Thrissur, Kerala. The client confirms the project's location.
    location: "Kakkanad, Kochi, Kerala",
    galleryLabel: "VIEW GALLERY",
    sectorLine: "RESIDENTIAL ARCHITECTURE · 2025",
  },
  overview: {
    kicker: "Project overview",
    title: ["A calm home", "shaped around", "light, rain and a", "living courtyard."],
    intro:
      "The Courtyard House is a 4,850 sq ft contemporary residence in Kakkanad, Kochi, designed for a multi-generational family. Architecture and interiors are organised around a planted central court, creating privacy from the street while drawing daylight, cross-ventilation and Kerala’s lush landscape deep into everyday rooms.",
    facts: [
      { label: "LOCATION", value: "Kakkanad, Kochi" },
      { label: "PROJECT TYPE", value: "Private residence" },
      { label: "AREA", value: "4,850 sq ft" },
      { label: "YEAR", value: "2025" },
      { label: "SERVICES", value: "Architecture · Interiors" },
    ],
    images: [
      {
        src: "photos/courtyard-living-skylight",
        alt: "Living room around an open planted courtyard under a skylight",
      },
      { src: "photos/timber-gate-brick-wall", alt: "Timber gate in a brick wall" },
    ],
    caption: "Architecture grounded in climate, context and daily life.",
    cta: { label: "Explore Service", href: routes.service("architecture") },
  },
  designResponse: {
    kicker: "Design response",
    title: ["An inward-", "looking plan,", "opened deliberately", "to sky and breeze."],
    paragraphs: [
      "Rather than place rooms along a corridor, the plan wraps daily life around the planted court. Each threshold—street to veranda, living room to garden, stair to bridge—gradually moves from public to private.",
      // TODO(content): KI-C09 the original prints this paragraph twice; the client supplies the
      // second paragraph or confirms it should go.
      "Rather than place rooms along a corridor, the plan wraps daily life around the planted court. Each threshold—street to veranda, living room to garden, stair to bridge—gradually moves from public to private.",
    ],
    mainImage: {
      src: "photos/double-height-living-stair",
      alt: "Double-height living room with an open stair",
    },
    planning: {
      kicker: "Planning + climate",
      title:
        "Living and dining occupy the breezy south edge; service rooms buffer heat to the west.",
      text: "Bedrooms sit above the quieter garden side. A bridge across the courtyard makes every movement through the house an encounter with greenery, changing weather and natural light.",
      image: {
        src: "photos/timber-screen-atrium",
        alt: "Atrium with timber screens, a steel handrail and planting",
      },
    },
    points: [
      {
        icon: "leaf",
        title: "A shaded courtyard",
        text: "The central void becomes the home’s quiet compass, linking living, dining and family spaces without sacrificing privacy.",
      },
      {
        icon: "compass",
        title: "A porous plan",
        text: "Aligned openings pull prevailing south-westerly breezes across the court and through the principal rooms.",
      },
      {
        icon: "shield",
        title: "A protective edge",
        text: "Deep overhangs, recessed glazing and operable teak screens soften western sun and monsoon rain.",
      },
    ],
    statement: "From climate study and adjacency mapping to material mock-ups and site detailing.",
    cta: { label: "Our Process", href: `${routes.service("architecture")}#process` },
  },
  brief: {
    kicker: "The brief",
    title: ["A private family", "home that still", "feels open to the", "landscape."],
    paragraphs: [
      "The clients asked for a durable, low-maintenance home for three generations: generous shared rooms for weekend gatherings, two quiet workspaces, an accessible ground-floor suite for parents, and bedrooms that could retreat from the activity below.",
      "The 14-cent site sits on a busy residential road and falls gently toward the south. Close neighbours, strong western heat and seasonal monsoon rain made privacy, drainage and shade primary design conditions—not afterthoughts.",
    ],
    objective:
      "The objective was simple: make a house that feels sheltered from the city, yet never closed off from air, trees and changing light.",
    images: [
      {
        image: {
          src: "photos/house-timber-screen-porch",
          alt: "House with a timber screen entrance porch",
        },
        height: 430,
      },
      {
        image: {
          src: "photos/glass-courtyard-garden",
          alt: "Glazed courtyard garden at the centre of a house",
        },
        height: 560,
      },
    ],
  },
  materials: {
    kicker: "Architecture, interiors & materials",
    title: ["Quiet materials.", "Precise junctions.", "Rooms made for", "Kochi’s climate."],
    paragraphs: [
      "The exterior is composed as a series of shaded volumes rather than a single object. Pale mineral plaster reflects heat, deep charcoal roof edges contain rain, and a permeable teak veil gives the bedrooms privacy without blocking air.",
      "Inside, the palette becomes warmer and more tactile. Kota stone runs through the ground floor, lime-plastered walls hold shifting light, and custom teak cabinetry keeps storage integrated and calm. Blackened steel is used sparingly for stairs, rails and slender glazing frames.",
    ],
    images: [
      {
        image: {
          src: "photos/timber-lounge-chair",
          alt: "Timber lounge chair by a curtained window",
        },
        height: 636,
        caption: "DINING ROOM · TEAK JOINERY · COURTYARD EDGE",
      },
      {
        image: { src: "photos/lime-plaster-stair-detail", alt: "Lime plaster stair detail" },
        height: 478,
        caption: "STAIR DETAIL · STONE · BLACKENED STEEL",
      },
    ],
    materials: [
      {
        name: "Lime plaster",
        swatch: "#E4DCCB",
        text: "Soft mineral walls temper glare and age with a gentle, hand-finished variation.",
      },
      {
        name: "Kota stone",
        swatch: "#7C8B75",
        text: "Cool underfoot and quietly tonal, honed stone carries from the veranda into shared rooms.",
      },
      {
        name: "Plantation teak",
        swatch: "#9A5A3C",
        text: "Screens, ceilings and joinery add warmth where the hand meets the architecture.",
      },
      {
        name: "Blackened steel",
        swatch: "#262626",
        text: "Fine frames and stair details provide a precise counterpoint to tactile natural surfaces.",
      },
    ],
    statement:
      "A single design language carried from the building envelope to the smallest fitted detail.",
    cta: { label: "Explore Service", href: routes.service("architecture") },
  },
  gallery: {
    kicker: "Project gallery",
    title: ["The Courtyard House,", "from morning light", "to evening glow."],
    viewsLabel: "10 VIEWS · KAKKANAD, KOCHI",
    rows: [
      {
        layout: "full",
        photos: [
          {
            image: {
              src: "photos/two-storey-house-lawn",
              alt: "Two-storey house with deep overhangs above a lawn",
            },
            height: 620,
            caption: "Courtyard house south garden elevation with deep overhangs in Kakkanad Kochi",
          },
        ],
      },
      {
        layout: "wide-narrow",
        photos: [
          {
            image: {
              src: "photos/sofa-jali-detail",
              alt: "Sofa with cushions in front of a jali screen",
            },
            height: 567,
            caption: "Courtyard house open-plan living and dining room facing the central garden",
          },
          {
            image: {
              src: "photos/house-rain-garden",
              alt: "Two-storey house with a rain garden and textured walls",
            },
            height: 430,
            caption: "Courtyard house rain garden and textured entrance wall during monsoon",
          },
        ],
      },
      {
        layout: "narrow-wide",
        photos: [
          {
            image: { src: "photos/kitchen-island-teak", alt: "Kitchen island with teak and stone" },
            height: 562,
            caption: "Courtyard house kitchen island with teak and honed stone finishes",
          },
          {
            image: {
              src: "photos/courtyard-tree-timber-balconies",
              alt: "Planted courtyard with a tree and timber balconies",
            },
            height: 562,
            caption: "Courtyard house planted central courtyard and upper-level bridge",
          },
        ],
      },
      {
        layout: "thirds",
        photos: [
          {
            image: {
              src: "photos/bedroom-teak-screen",
              alt: "Bedroom with a teak screen and wardrobe",
            },
            height: 400,
            caption: "Courtyard house main bedroom with teak screen and garden light",
          },
          {
            image: {
              src: "photos/bathroom-kota-stone",
              alt: "Bathroom with Kota stone and a courtyard view",
            },
            height: 400,
            caption: "Courtyard house bathroom with Kota stone and courtyard planting",
          },
          {
            image: { src: "photos/teak-stair-handrail", alt: "Teak stair handrail detail" },
            height: 400,
            caption: "Courtyard house custom teak handrail and black steel balustrade detail",
          },
        ],
      },
      {
        layout: "wide-narrow",
        photos: [
          {
            image: {
              src: "photos/family-lounge-garden-view",
              alt: "Family lounge opening to a shaded garden",
            },
            height: 520,
            caption: "Courtyard house family lounge opening to a shaded terrace at sunset",
          },
          {
            image: { src: "photos/courtyard-facade-night", alt: "Courtyard facade lit at night" },
            height: 520,
            caption: "Courtyard house illuminated courtyard facade at blue hour in Kochi",
          },
        ],
      },
    ],
  },
  related: {
    kicker: "Related projects",
    title: ["Homes shaped by", "climate, privacy", "and place."],
    // TODO(content): KI-C09 the original repeats this sentence; the client confirms the lead.
    lead: "Explore residential architecture and interior projects across Kochi and its surrounding neighbourhoods. Explore residential architecture and interior projects across Kochi and its surrounding neighbourhoods.",
    projects: [
      { project: "canopy-house", meta: "RESIDENTIAL · THRIPPUNITHURA" },
      { project: "river-edge-villa", meta: "RESIDENTIAL · ALUVA" },
      { project: "linear-courtyard-home", meta: "ARCHITECTURE · EDAPPALLY" },
      { project: "garden-fold-house", meta: "ARCHITECTURE + INTERIORS · KOCHI" },
    ],
    moreLabel: "VIEW PROJECT",
  },
  cta: {
    image: {
      src: "photos/brick-courtyard-house-dusk-panorama",
      alt: "Brick courtyard house and lit garden at dusk",
    },
    kicker: "Begin a conversation",
    title: ["Planning a Similar", "Project?"],
    text: "Tell us about your site, the way your family lives, and what you hope the project can become. We’ll help define a clear first step.",
    label: "Discuss Your Project",
  },
};
