import type { ContactSectionContent } from "@/components/sections/contact-section";
import type {
  AboutApproachContent,
  AboutCardsContent,
  AboutExperienceContent,
  AboutFounderContent,
  AboutHeroContent,
  AboutIntroContent,
  AboutPhilosophyContent,
  AboutSeo,
  AboutTeamContent,
  AboutWorksContent,
} from "@/content/about";
import type { HomeAboutContent } from "@/content/home/about";
import type { HomeContactContent } from "@/content/home/contact";
import type { DivisionsCarouselContent } from "@/content/home/divisions";
import type { ExplorerContent } from "@/content/home/explorer";
import type { HomeHeroContent } from "@/content/home/hero";
import type { HomeProcessContent } from "@/content/home/process";
import type { HomeSignatureContent } from "@/content/home/signature";
import type { ClientStoriesContent } from "@/content/home/stories";
import type { HomeWorksContent } from "@/content/home/works";
import type { RelatedServiceSlug } from "@/content/related-services";
import type { ServicePageContent } from "@/content/service-pages";
import type { DivisionSlug, ServiceSlug, WorksCategory } from "@/lib/routes";
import type { BlockDefaults } from "@/lib/schemas/blocks";
import type { DivisionPage } from "@/lib/schemas/divisions";
import type {
  Division,
  ProcessStage,
  Project,
  RelatedService,
  Sector,
  Testimonial,
} from "@/lib/schemas/entities";
import type { DubaiPageContent, IndiaPageContent } from "@/lib/schemas/locations";
import type { MediaLibrary } from "@/lib/schemas/media";
import type { Navigation } from "@/lib/schemas/navigation";
import type { NewsItem, NewsPage } from "@/lib/schemas/news";
import type { BlogPage, Post, PostCategory } from "@/lib/schemas/posts";
import type { ProjectDetail } from "@/lib/schemas/project-details";
import type { ReviewsPageContent } from "@/lib/schemas/reviews";
import type { ServicesPage } from "@/lib/schemas/services-page";
import type { SiteSettings } from "@/lib/schemas/site";
import type { ThankYouPage } from "@/lib/schemas/thank-you";
import type { WorksPageContent } from "@/lib/schemas/works";

/**
 * The one way pages get content (D6, MIGRATION_PLAN Phase 11). Every method is an async read of one
 * REST resource of the Laravel API, shaped exactly like the resource, so swapping the static
 * content for Laravel means writing one class (`LaravelRepository`) and changing `getRepository()`.
 *
 * - **Server-only.** Route files read through the cached accessors of `@/lib/data` (which wrap
 *   these methods with `"use cache"` and the tags of `./tags.ts`), never a repository directly, and
 *   never `src/content`.
 * - **`undefined` = 404.** `get…(slug)` resolves to `undefined` for an unknown slug; the route
 *   calls `notFound()`.
 * - **Lists are ordered** as the site shows them; filters are optional.
 * - **References stay ids.** Pages carry `MediaId`s and entity slugs; the shared collections
 *   (`listProjects`, `listTestimonials`, …) and the media library resolve them (`getRefs()`).
 *
 * Resource map: one REST resource per method, defined once in `./laravel/endpoints.ts` (path,
 * schema, cache tags) and documented in docs/API_CONTRACT.md (`pnpm api:contract`). Leads are not
 * here: `src/app/api/leads` forwards them to LEADS_ENDPOINT.
 */
export type ContentRepository = {
  // Site shell -----------------------------------------------------------------------------------
  getSite(): Promise<SiteSettings>;
  getNavigation(): Promise<Navigation>;
  getMediaLibrary(): Promise<MediaLibrary>;
  /** The CONTACT template shared by every page's contact section. */
  getContactTemplate(): Promise<ContactSectionContent>;
  /** Copy blocks show unless the page overrides it (the testimonials header). */
  getBlockDefaults(): Promise<BlockDefaults>;

  // Shared entities ------------------------------------------------------------------------------
  listProjects(filter?: ProjectFilter): Promise<readonly Project[]>;
  getProject(slug: string): Promise<Project | undefined>;
  listTestimonials(): Promise<readonly Testimonial[]>;
  listProcessStages(): Promise<readonly ProcessStage[]>;
  listSectors(): Promise<readonly Sector[]>;
  listDivisions(): Promise<readonly Division[]>;
  listRelatedServices(): Promise<readonly RelatedService[]>;

  // Services -------------------------------------------------------------------------------------
  /** Slugs of the built service pages, in the site's service order. */
  listServicePageSlugs(): Promise<readonly ServiceSlug[]>;
  getServicePage(slug: string): Promise<ServicePageContent | undefined>;
  getServicesPage(): Promise<ServicesPage>;

  // Divisions ------------------------------------------------------------------------------------
  listDivisionPageSlugs(): Promise<readonly DivisionSlug[]>;
  getDivisionPage(slug: string): Promise<DivisionPage | undefined>;

  // Locations ------------------------------------------------------------------------------------
  getIndiaPage(): Promise<IndiaPage>;
  getDubaiPage(): Promise<DubaiPage>;

  // Works ----------------------------------------------------------------------------------------
  /** Slugs of the projects with a detail page (`/works/[slug]`). */
  listProjectPageSlugs(): Promise<readonly string[]>;
  getProjectPage(slug: string): Promise<ProjectDetail | undefined>;
  getWorksPage(): Promise<WorksPage>;

  // Blog and news --------------------------------------------------------------------------------
  listPostCategories(): Promise<readonly PostCategory[]>;
  /** Posts newest first; `category` is a category slug. */
  listPosts(filter?: PostFilter): Promise<readonly Post[]>;
  getPost(slug: string): Promise<Post | undefined>;
  getBlogPage(): Promise<BlogPage>;
  /** News newest first. */
  listNews(): Promise<readonly NewsItem[]>;
  getNewsPage(): Promise<NewsPage>;

  // Pages ----------------------------------------------------------------------------------------
  getHomePage(): Promise<HomePage>;
  getAboutPage(): Promise<AboutPage>;
  getReviewsPage(): Promise<ReviewsPage>;
  getThankYouPage(): Promise<ThankYouPage>;
};

export type ProjectFilter = { readonly category?: WorksCategory };
export type PostFilter = { readonly category?: string };

/** `data-title` / `data-desc` of a page (titles already end in the brand). */
export type PageSeoCopy = { readonly title: string; readonly description: string };

// Page resources ----------------------------------------------------------------------------------
// One per static page. Their sections keep the content types of the components that render them.

export type HomePage = {
  readonly seo: PageSeoCopy;
  readonly hero: HomeHeroContent;
  readonly about: HomeAboutContent;
  readonly works: HomeWorksContent;
  readonly explorer: ExplorerContent;
  readonly process: HomeProcessContent;
  readonly signature: HomeSignatureContent;
  readonly divisions: DivisionsCarouselContent;
  readonly stories: ClientStoriesContent;
  readonly blogTeaser: BlogTeaserCopy;
  readonly newsTeaser: NewsTeaserCopy;
  readonly contact: HomeContactContent;
};

export type BlogTeaserCopy = {
  readonly kicker: string;
  readonly title: readonly string[];
  readonly lead: string;
  readonly cta: string;
  readonly featuredLabel: string;
  readonly readMore: string;
};

export type NewsTeaserCopy = {
  readonly kicker: string;
  readonly title: readonly string[];
  readonly lead: string;
  readonly cta: string;
  readonly readMore: string;
};

export type AboutPage = {
  readonly seo: AboutSeo;
  readonly hero: AboutHeroContent;
  readonly intro: AboutIntroContent;
  readonly philosophy: AboutPhilosophyContent;
  readonly approach: AboutApproachContent;
  readonly services: AboutCardsContent<RelatedServiceSlug>;
  readonly divisions: AboutCardsContent<DivisionSlug>;
  readonly founder: AboutFounderContent;
  readonly experience: AboutExperienceContent;
  readonly team: AboutTeamContent;
  readonly works: AboutWorksContent;
};

export type { BlogPage, NewsPage, ServicesPage, ThankYouPage };

export type WorksPage = WorksPageContent;

export type IndiaPage = IndiaPageContent;

export type DubaiPage = DubaiPageContent;

export type ReviewsPage = ReviewsPageContent;
