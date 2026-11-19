import type { MediaId } from "../media";

/** One authored line of a display title; `{ accent }` lines render orange (`.or`). */
export type TitleLine = string | { readonly accent: string };

/** A paragraph with optional bold runs (`<b>` in the original). */
export type RichText = readonly (string | { readonly strong: string })[];

export type HeroVideo = {
  /** Landscape cut, served from `public/`. */
  readonly desktopSrc: `/${string}`;
  /** Portrait cut for phones and portrait tablets. */
  readonly mobileSrc: `/${string}`;
  readonly desktopPoster: MediaId;
  readonly mobilePoster: MediaId;
};

export type HomeHeroContent = {
  readonly eyebrow: string;
  readonly title: readonly TitleLine[];
  readonly lead: string;
  /** Opens the Start-a-Project popup. */
  readonly primaryCta: string;
  /** Links to the works page. */
  readonly secondaryCta: string;
  readonly video: HeroVideo;
};

/** Home hero (`#p-home .hero`, markup 2792–2802), copy verbatim. */
export const HOME_HERO = {
  eyebrow: "Residential & Interior Design Studio",
  title: ["Homes designed", "around how you", { accent: "actually live" }],
  // TODO(content): KI-C10. "Houses in the mountains" is template copy for a Kerala/Dubai studio;
  // kept verbatim until the client confirms the wording.
  lead: "From first sketch to final walkthrough, we shape houses in the mountains and beyond into spaces that feel considered, warm, and entirely yours.",
  primaryCta: "Start a Project",
  secondaryCta: "View Our Projects",
  video: {
    desktopSrc: "/video/hero-desktop.mp4",
    mobileSrc: "/video/hero-mobile.mp4",
    desktopPoster: "video/hero-poster-desktop",
    mobilePoster: "video/hero-poster-mobile",
  },
} as const satisfies HomeHeroContent;
