import type { MediaId } from "../media";
import type { TitleLine } from "./hero";

/** A room card of the signature project (`article.sc-card`). */
export type SignatureRoom = {
  readonly title: string;
  readonly subtitle: string;
  /** Decorative inside the card link, which the title names. */
  readonly image: MediaId;
};

export type HomeSignatureContent = {
  readonly kicker: string;
  readonly title: readonly TitleLine[];
  readonly text: string;
  readonly cta: string;
  /** Project the button and room cards open (`/works/[slug]`). */
  readonly projectSlug: string;
  readonly background: { readonly image: MediaId; readonly alt: string };
  /** Pill on every room card (`.sc-pill`). */
  readonly pill: string;
  readonly rooms: readonly SignatureRoom[];
};

/**
 * Home signature project (`section.sig#home-signature`, markup 2842–2852), copy verbatim.
 * The original's "View Project" points at its only project page (`#project`, The Courtyard House).
 */
export const HOME_SIGNATURE = {
  kicker: "Step Inside",
  title: ["Signature", "Project"],
  text: "From the entrance to the last detail, each space is designed to work as one — kitchen, living, dining, and leisure areas sharing a single architectural language.",
  cta: "View Project",
  projectSlug: "the-courtyard-house",
  background: { image: "photos/villa-pool-mountains", alt: "Villa exterior with private pool" },
  pill: "Signature Project",
  rooms: [
    {
      title: "Kitchen",
      subtitle: "Katic Home — Interior",
      image: "photos/granite-kitchen",
    },
    {
      title: "Games Room",
      subtitle: "Katic Home — Interior",
      image: "photos/games-room-billiards",
    },
    {
      title: "Living Room",
      subtitle: "Katic Home — Interior",
      image: "photos/open-pavilion-lounge-night",
    },
    {
      title: "Reception",
      subtitle: "Katic Home — Interior",
      image: "photos/arched-courtyard-terrace",
    },
  ],
} as const satisfies HomeSignatureContent;
