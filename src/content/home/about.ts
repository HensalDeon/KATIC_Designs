import type { MediaId } from "../media";
import type { RichText, TitleLine } from "./hero";

/** A headline figure (`.stats > div`). Numeric values count up on the home page. */
export type HomeStat = {
  /** A number counts up from 0; text (e.g. "Eco") is shown as is. */
  readonly value: number | string;
  /** Orange suffix after the value (`<em>`). */
  readonly suffix?: string;
  readonly label: string;
};

/** Icons of the values list (the original's inline `.nico` drawings). */
export type HomeValueIcon = "target" | "bulb" | "compass" | "hand";

/** A company value row (`.vals .r`). */
export type HomeValue = {
  readonly title: string;
  readonly text: string;
  readonly icon: HomeValueIcon;
};

/** A partner logo in the marquee (`.logos img`). */
export type Partner = {
  readonly name: string;
  readonly logo: MediaId;
};

export type HomeAboutContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly established: string;
  readonly paragraphs: readonly RichText[];
  readonly partnersKicker: string;
  readonly partners: readonly Partner[];
  readonly cta: string;
  readonly stats: readonly HomeStat[];
  readonly values: readonly HomeValue[];
};

/**
 * Home about teaser (`section.ab#home-about`, markup 2804–2840), copy verbatim.
 *
 * TODO(content): KI-C10. "EST. 2013" and "11yrs" disagree (2013 → 2026 is 13 years), and
 * "Projects Delivered 200+" differs from About's "Spaces delivered 200+". Confirm with the client.
 */
export const HOME_ABOUT = {
  kicker: "About Katic Designs",
  title: ["We Build", { accent: "Spaces" }, "That Endure."],
  established: "EST. 2013 · KOCHI, KERALA",
  paragraphs: [
    [
      "Founded in 2013 and headquartered in Kochi, Katic Designs is an architecture, interior design, and construction consultancy with a singular focus: ",
      { strong: "eco-conscious design that performs as beautifully as it looks." },
    ],
    [
      "Every project begins with the same discipline — understand the site, harness natural light, and let the land speak first.",
    ],
  ],
  partnersKicker: "General Partners",
  partners: [
    { name: "Jaquar", logo: "partners/jaquar" },
    { name: "Asian Paints", logo: "partners/asian-paints" },
    { name: "Kajaria", logo: "partners/kajaria" },
    { name: "Hettich", logo: "partners/hettich" },
  ],
  cta: "About Us",
  stats: [
    { value: 200, suffix: "+", label: "Projects Delivered" },
    { value: 11, suffix: "yrs", label: "In Practice" },
    { value: 500, suffix: "+", label: "Families Housed" },
    { value: "Eco", label: "Design Philosophy" },
  ],
  values: [
    {
      title: "Precision",
      text: "Every dimension, material, and detail is considered — nothing is arbitrary, everything earns its place.",
      icon: "target",
    },
    {
      title: "Innovation",
      text: "We bring fresh thinking to every brief — blending contemporary methods with time-tested building wisdom.",
      icon: "bulb",
    },
    {
      title: "Light",
      text: "Natural light is our first material. We sculpt it, direct it, and let it define the character of each space.",
      icon: "bulb",
    },
    {
      title: "Space",
      text: "We design how people move, breathe, and feel — not just what they see. Volume, proportion, and flow come first.",
      icon: "compass",
    },
    {
      title: "Craftsmanship",
      text: "Built to last a generation. We work with skilled artisans and trusted craftspeople who share our standard.",
      icon: "hand",
    },
  ],
} as const satisfies HomeAboutContent;
