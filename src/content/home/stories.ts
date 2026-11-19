import { routes } from "@/lib/routes";

import type { MediaId } from "../media";

/**
 * Home client stories (`section.cs#home-stories`): copy verbatim from the original markup
 * (reference/original, lines 2895–2910) and its `QUOTES` / `QIMG` arrays (lines 4841–4845).
 */
export type ClientStory = {
  readonly quote: string;
  /** Who said it (`.who`); also the caption on the portrait. */
  readonly name: string;
  /** Project or company (`.co`); also the caption on the project photo. */
  readonly company: string;
  readonly portrait: MediaId;
  readonly project: MediaId;
};

export type ClientStoriesContent = {
  readonly kicker: string;
  readonly titleLines: readonly string[];
  /** Intro lines (the original's `<br>`). */
  readonly introLines: readonly string[];
  /** Pill on the portrait card. */
  readonly pill: string;
  readonly cta: { readonly label: string; readonly href: string };
  readonly stories: readonly ClientStory[];
};

export const HOME_STORIES: ClientStoriesContent = {
  kicker: "Client Stories",
  titleLines: ["From Brief", "To Built"],
  introLines: ["Direct feedback from the people we’ve built for —", "in their own words."],
  pill: "CLIENT STORY",
  cta: { label: "VIEW ALL STORIES", href: routes.reviews },
  stories: [
    {
      quote:
        "Budget discipline without design compromise. That balance is rarer than it should be in this industry.",
      // TODO(content): KI-C06. Template leftover name and client; replace with an approved story.
      name: "K. Dimitrov",
      company: "Riverline Offices",
      portrait: "people/client-story-01",
      project: "photos/white-bathroom-checker-floor-small",
    },
    {
      quote:
        "Katic understood what we wanted from the beginning and translated it into a home that feels completely our own.",
      name: "Homeowner",
      company: "Residential Project · Kochi",
      portrait: "people/client-story-02",
      project: "photos/sofa-jali-detail",
    },
    {
      quote:
        "The team brought order to a complex process. Every choice felt considered, and the final spaces work beautifully for our day-to-day life.",
      name: "Private Client",
      company: "Interior Renovation · Ernakulam",
      portrait: "people/client-story-03",
      project: "photos/timber-lounge-chair",
    },
    {
      quote:
        "From early planning through site execution, communication stayed clear and the level of care never changed.",
      name: "Property Owner",
      company: "Turnkey Residence · Thrissur",
      portrait: "people/client-story-04",
      project: "photos/garden-veranda-chairs",
    },
  ],
};
