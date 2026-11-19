/**
 * Content schema of the project detail pages (`/works/[slug]`, original `#p-project`,
 * docs/analysis/04 §2). One `ProjectDetail` per built page, rendered by
 * `src/components/project/project-page.tsx`.
 *
 * Plain, serialisable data (no JSX), so Laravel can serve the same shape later (a `Project`
 * resource with its detail). The detail never restates what the shared `Project` entity
 * (`src/content/projects.ts`) already holds: the name, cover, type and related projects' cards come
 * from there by slug. What lives here is the page's own copy and photography.
 *
 * ## Page anatomy (fixed order, tones as rendered by the original)
 *
 * hero (dark) → overview (light) → design response (dark) → brief (light) → materials (dark) →
 * gallery (light, `#project-gallery`) → related projects (dark) → call to action (dark band).
 */
import type { ServiceIconName } from "@/components/icons/service-icon";
import type { SectionImage } from "@/components/sections/section-image";
import type { ProjectSlug } from "@/content/projects";

/** Title lines as authored (the original's `<br>` breaks). */
export type TitleLines = readonly string[];

/** A plain internal link rendered as a button (`.btn.cap`). */
export type ProjectLink = {
  readonly label: string;
  readonly href: string;
};

/** Kicker and title of a section's left column (`.two > div:first-child`). */
export type ProjectSectionHeading = {
  readonly kicker: string;
  readonly title: TitleLines;
};

/** Banner (`#p-project .hero`). The title is the project's name, split for its orange last word. */
export type ProjectHeroContent = {
  readonly image: SectionImage;
  /** CSS `object-position` of the banner photo (the original's inline `center 60%`). */
  readonly objectPosition?: string;
  /** The name as printed: plain lines, then the orange accent on its own line. */
  readonly title: { readonly lines: TitleLines; readonly accent: string };
  /** `.loc` under the title. Page-specific (KI-D01, see `ProjectDetail`). */
  readonly location: string;
  /** "VIEW GALLERY": scrolls to the gallery section. */
  readonly galleryLabel: string;
  /** `.yr` at the bottom centre ("RESIDENTIAL ARCHITECTURE · 2025"). */
  readonly sectorLine: string;
};

/** One fact of the overview's five-column strip (`.facts`). */
export type ProjectFact = {
  readonly label: string;
  readonly value: string;
};

/** `section.ov`: overview with facts, two photos and a service link. */
export type ProjectOverviewContent = ProjectSectionHeading & {
  readonly intro: string;
  readonly facts: readonly ProjectFact[];
  /** Large photo (`.a`, 820px column) and small photo (`.b`, beside it). */
  readonly images: readonly [SectionImage, SectionImage];
  /** Short line beside the button (`.cap span`). */
  readonly caption: string;
  readonly cta: ProjectLink;
};

/** One of the three principles under the design response (`.pts`). */
export type ProjectPoint = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
};

/** `section.dr`: design response. */
export type ProjectDesignResponseContent = ProjectSectionHeading & {
  readonly paragraphs: readonly string[];
  /** Tall photo on the left of the plan block (`.g .a`). */
  readonly mainImage: SectionImage;
  /** Planning block beside it: kicker, h3, paragraph and a small photo. */
  readonly planning: {
    readonly kicker: string;
    readonly title: string;
    readonly text: string;
    readonly image: SectionImage;
  };
  readonly points: readonly ProjectPoint[];
  /** Closing statement (`.stm p`) beside its button. */
  readonly statement: string;
  readonly cta: ProjectLink;
};

/** A photo with its height on the 1440 canvas (the original's inline `height`). */
export type ProjectPhoto = {
  readonly image: SectionImage;
  readonly height: number;
  /** Uppercase label under the photo, if any. */
  readonly caption?: string;
};

/** `section.br`: the brief. */
export type ProjectBriefContent = ProjectSectionHeading & {
  readonly paragraphs: readonly string[];
  /** The bold closing line (`.bold`). */
  readonly objective: string;
  readonly images: readonly [ProjectPhoto, ProjectPhoto];
};

/** One material of the palette strip (`.mats`). */
export type ProjectMaterial = {
  readonly name: string;
  /** Swatch colour (CSS colour). */
  readonly swatch: string;
  readonly text: string;
};

/** `section.mt`: architecture, interiors and materials. */
export type ProjectMaterialsContent = ProjectSectionHeading & {
  readonly paragraphs: readonly string[];
  readonly images: readonly [ProjectPhoto, ProjectPhoto];
  readonly materials: readonly ProjectMaterial[];
  readonly statement: string;
  readonly cta: ProjectLink;
};

/**
 * Column layout of a gallery row, as the original's inline `grid-template-columns`:
 * `full` = `1fr`, `wide-narrow` = `760px 1fr`, `narrow-wide` = `488px 1fr`, `thirds` = `repeat(3,1fr)`.
 */
export type ProjectGalleryRowLayout = "full" | "wide-narrow" | "narrow-wide" | "thirds";

export type ProjectGalleryRow = {
  readonly layout: ProjectGalleryRowLayout;
  /** Every photo has a caption (`figcaption`). */
  readonly photos: readonly (ProjectPhoto & { readonly caption: string })[];
};

/** `section.gl#project-gallery`. */
export type ProjectGalleryContent = ProjectSectionHeading & {
  /** `.vw` at the bottom right of the header ("10 VIEWS · KAKKANAD, KOCHI"). */
  readonly viewsLabel: string;
  readonly rows: readonly ProjectGalleryRow[];
};

/**
 * A related project card. The card's name, photo and link come from the `Project`; `meta` is the
 * label the original prints on this page's card ("RESIDENTIAL · THRIPPUNITHURA"), which mixes the
 * type, the scope and a short location and so cannot be derived consistently.
 */
export type ProjectRelatedCard = {
  readonly project: ProjectSlug;
  readonly meta: string;
};

/** `section.rl`: related projects. */
export type ProjectRelatedContent = ProjectSectionHeading & {
  readonly lead: string;
  readonly projects: readonly ProjectRelatedCard[];
  /** Label of each card's link line ("VIEW PROJECT"). */
  readonly moreLabel: string;
};

/** `section.ctasec`: the closing call to action. */
export type ProjectCtaContent = {
  readonly image: SectionImage;
  readonly kicker: string;
  readonly title: TitleLines;
  readonly text: string;
  /** Goes to the enquiry form (the original `data-go="contact"`). */
  readonly label: string;
};

/**
 * A project detail page. Facts printed on the page that disagree with the shared `Project`
 * (e.g. The Courtyard House's location, KI-D01) are page copy here and do not change the `Project`.
 */
export type ProjectDetail = {
  /** The project this page describes (name and cards come from `src/content/projects.ts`). */
  readonly slug: ProjectSlug;
  /** The original's `data-title` / `data-desc`. */
  readonly seo: { readonly title: string; readonly description: string };
  readonly hero: ProjectHeroContent;
  readonly overview: ProjectOverviewContent;
  readonly designResponse: ProjectDesignResponseContent;
  readonly brief: ProjectBriefContent;
  readonly materials: ProjectMaterialsContent;
  readonly gallery: ProjectGalleryContent;
  readonly related: ProjectRelatedContent;
  readonly cta: ProjectCtaContent;
};
