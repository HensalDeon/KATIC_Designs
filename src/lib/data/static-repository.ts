// The repository contract is async (Laravel fetches); the static implementation has nothing to await.
/* eslint-disable @typescript-eslint/require-await */
import type { z } from "zod";

import {
  ABOUT_APPROACH,
  ABOUT_DIVISIONS,
  ABOUT_EXPERIENCE,
  ABOUT_FOUNDER,
  ABOUT_HERO,
  ABOUT_INTRO,
  ABOUT_PHILOSOPHY,
  ABOUT_SEO,
  ABOUT_SERVICES,
  ABOUT_TEAM,
  ABOUT_WORKS,
} from "@/content/about";
import { CONTACT_TEMPLATE } from "@/content/contact";
import { DIVISIONS } from "@/content/divisions";
import { builtDivisionSlugs, getDivisionPage } from "@/content/divisions/pages";
import { HOME_ABOUT } from "@/content/home/about";
import { HOME_CONTACT } from "@/content/home/contact";
import { HOME_DIVISIONS } from "@/content/home/divisions";
import { HOME_EXPLORER } from "@/content/home/explorer";
import { HOME_HERO } from "@/content/home/hero";
import { HOME_PROCESS } from "@/content/home/process";
import { HOME_SIGNATURE } from "@/content/home/signature";
import { HOME_STORIES } from "@/content/home/stories";
import { HOME_WORKS } from "@/content/home/works";
import { DUBAI_BLOCKS, DUBAI_CONTACT, DUBAI_HERO, DUBAI_SEO } from "@/content/locations/dubai";
import { INDIA_PAGE } from "@/content/locations/india";
import { media, type MediaId } from "@/content/media";
import { NAVIGATION } from "@/content/navigation";
import { HOME_NEWS_TEASER, NEWS, NEWS_PAGE, NEWS_SEO } from "@/content/news";
import {
  ARTICLE_PAGE,
  BLOG_PAGE,
  HOME_BLOG_TEASER,
  POST_CATEGORIES,
  postCategorySlug,
  POSTS,
  postsByDate,
} from "@/content/posts";
import { PROCESS_STAGES } from "@/content/process-stages";
import { builtProjectSlugs, getProjectDetail } from "@/content/project-details";
import { inCategory, PROJECTS } from "@/content/projects";
import { RELATED_SERVICES } from "@/content/related-services";
import {
  REVIEWS_CLIENTS,
  REVIEWS_CTA,
  REVIEWS_EXPERTISE,
  REVIEWS_HERO,
  REVIEWS_PROJECTS,
  REVIEWS_SEO,
  REVIEWS_STORY,
  REVIEWS_TRUST,
} from "@/content/reviews";
import { SECTOR_KEYS, SECTORS } from "@/content/sectors";
import { builtServiceSlugs, getServicePage } from "@/content/service-pages";
import {
  SERVICE_BLOCKS,
  SERVICES_HERO,
  SERVICES_PAGE_SEO,
  WHAT_WE_DELIVER,
  WHAT_WE_DO,
} from "@/content/services-page";
import { SITE_SEO, SITE_SETTINGS } from "@/content/site";
import { TESTIMONIAL_IDS, TESTIMONIALS } from "@/content/testimonials";
import { THANK_YOU, THANK_YOU_SEO } from "@/content/thank-you";
import {
  WORKS_CAPABILITIES,
  WORKS_CASE_STUDY,
  WORKS_CTA,
  WORKS_DIVISIONS,
  WORKS_FEATURED,
  WORKS_HERO,
  WORKS_PORTFOLIO,
  WORKS_SECTORS,
  WORKS_SEO,
} from "@/content/works";
import { DIVISION_SLUGS } from "@/lib/routes";
import { aboutPageSchema } from "@/lib/schemas/about";
import { contactTemplateSchema } from "@/lib/schemas/blocks";
import {
  divisionSchema,
  processStageSchema,
  projectSchema,
  relatedServiceSchema,
  sectorSchema,
  testimonialSchema,
} from "@/lib/schemas/entities";
import { homePageSchema } from "@/lib/schemas/home";
import { type MediaLibrary, mediaLibrarySchema } from "@/lib/schemas/media";
import { navigationSchema } from "@/lib/schemas/navigation";
import { servicePageSchema } from "@/lib/schemas/service-pages";
import { siteSettingsSchema } from "@/lib/schemas/site";

import type {
  AboutPage,
  BlogPage,
  ContentRepository,
  DubaiPage,
  HomePage,
  NewsPage,
  ReviewsPage,
  ServicesPage,
  ThankYouPage,
  WorksPage,
} from "./repository";

/**
 * Serves the typed content of `src/content` through the repository interface.
 *
 * Outside production builds every resource that has a schema is parsed on the way out, so content
 * that drifts from its schema fails in `pnpm dev` and in the unit tests (`static-repository.test.ts`
 * parses every resource) rather than in Laravel later. Production returns the modules as they are:
 * they are type-checked at build time and parsing them again would only cost build time.
 */
export class StaticRepository implements ContentRepository {
  readonly #validate: boolean;

  constructor({ validate = process.env.NODE_ENV !== "production" } = {}) {
    this.#validate = validate;
  }

  /** `value` checked against `schema` (when validating), typed as the repository promises. */
  #check<T>(schema: z.ZodType, value: T): T {
    if (this.#validate) schema.parse(value);
    return value;
  }

  // Site shell -----------------------------------------------------------------------------------

  async getSite() {
    return this.#check(siteSettingsSchema, SITE_SETTINGS);
  }

  async getNavigation() {
    return this.#check(navigationSchema, NAVIGATION);
  }

  async getMediaLibrary() {
    return this.#check(mediaLibrarySchema, staticMediaLibrary());
  }

  async getContactTemplate() {
    return this.#check(contactTemplateSchema, CONTACT_TEMPLATE);
  }

  // Shared entities ------------------------------------------------------------------------------

  async listProjects(filter: { readonly category?: Parameters<typeof inCategory>[1] } = {}) {
    const projects = PROJECTS.filter((project) => inCategory(project, filter.category ?? "all"));
    return projects.map((project) => this.#check(projectSchema, project));
  }

  async getProject(slug: string) {
    const project = PROJECTS.find((entry) => entry.slug === slug);
    return project && this.#check(projectSchema, project);
  }

  async listTestimonials() {
    return TESTIMONIAL_IDS.map((id) => this.#check(testimonialSchema, TESTIMONIALS[id]));
  }

  async listProcessStages() {
    return Object.values(PROCESS_STAGES).map((stage) => this.#check(processStageSchema, stage));
  }

  async listSectors() {
    return SECTOR_KEYS.map((key) => this.#check(sectorSchema, { key, ...SECTORS[key] }));
  }

  async listDivisions() {
    return DIVISION_SLUGS.map((slug) => this.#check(divisionSchema, DIVISIONS[slug]));
  }

  async listRelatedServices() {
    return Object.values(RELATED_SERVICES).map((service) =>
      this.#check(relatedServiceSchema, service),
    );
  }

  // Services -------------------------------------------------------------------------------------

  async listServicePageSlugs() {
    return builtServiceSlugs();
  }

  async getServicePage(slug: string) {
    const page = getServicePage(slug);
    return page && this.#check(servicePageSchema, page);
  }

  async getServicesPage(): Promise<ServicesPage> {
    return {
      seo: SERVICES_PAGE_SEO,
      hero: SERVICES_HERO,
      whatWeDo: WHAT_WE_DO,
      blocks: SERVICE_BLOCKS,
      whatWeDeliver: WHAT_WE_DELIVER,
    };
  }

  // Divisions ------------------------------------------------------------------------------------

  async listDivisionPageSlugs() {
    return builtDivisionSlugs();
  }

  async getDivisionPage(slug: string) {
    return getDivisionPage(slug);
  }

  // Locations ------------------------------------------------------------------------------------

  async getIndiaPage() {
    return INDIA_PAGE;
  }

  async getDubaiPage(): Promise<DubaiPage> {
    return { seo: DUBAI_SEO, hero: DUBAI_HERO, blocks: DUBAI_BLOCKS, contact: DUBAI_CONTACT };
  }

  // Works ----------------------------------------------------------------------------------------

  async listProjectPageSlugs() {
    return builtProjectSlugs();
  }

  async getProjectPage(slug: string) {
    return getProjectDetail(slug);
  }

  async getWorksPage(): Promise<WorksPage> {
    return {
      seo: WORKS_SEO,
      hero: WORKS_HERO,
      featured: WORKS_FEATURED,
      sectors: WORKS_SECTORS,
      portfolio: WORKS_PORTFOLIO,
      caseStudy: WORKS_CASE_STUDY,
      capabilities: WORKS_CAPABILITIES,
      divisions: WORKS_DIVISIONS,
      cta: WORKS_CTA,
    };
  }

  // Blog and news --------------------------------------------------------------------------------

  async listPostCategories() {
    return POST_CATEGORIES;
  }

  async listPosts(filter: { readonly category?: string } = {}) {
    const { category } = filter;
    return postsByDate(
      category === undefined
        ? POSTS
        : POSTS.filter((post) => postCategorySlug(post.category) === category),
    );
  }

  async getPost(slug: string) {
    return POSTS.find((post) => post.slug === slug);
  }

  async getBlogPage(): Promise<BlogPage> {
    const { categoryHeading: _function, ...page } = BLOG_PAGE;
    return { page, article: ARTICLE_PAGE };
  }

  async listNews() {
    return [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  }

  async getNewsPage(): Promise<NewsPage> {
    return { ...NEWS_PAGE, seo: NEWS_SEO };
  }

  // Pages ----------------------------------------------------------------------------------------

  async getHomePage(): Promise<HomePage> {
    return this.#check(homePageSchema, {
      seo: { title: SITE_SEO.title, description: SITE_SEO.description },
      hero: HOME_HERO,
      about: HOME_ABOUT,
      works: HOME_WORKS,
      explorer: HOME_EXPLORER,
      process: HOME_PROCESS,
      signature: HOME_SIGNATURE,
      divisions: HOME_DIVISIONS,
      stories: HOME_STORIES,
      blogTeaser: HOME_BLOG_TEASER,
      newsTeaser: HOME_NEWS_TEASER,
      contact: HOME_CONTACT,
    });
  }

  async getAboutPage(): Promise<AboutPage> {
    return this.#check(aboutPageSchema, {
      seo: ABOUT_SEO,
      hero: ABOUT_HERO,
      intro: ABOUT_INTRO,
      philosophy: ABOUT_PHILOSOPHY,
      approach: ABOUT_APPROACH,
      services: ABOUT_SERVICES,
      divisions: ABOUT_DIVISIONS,
      founder: ABOUT_FOUNDER,
      experience: ABOUT_EXPERIENCE,
      team: ABOUT_TEAM,
      works: ABOUT_WORKS,
    });
  }

  async getReviewsPage(): Promise<ReviewsPage> {
    return {
      seo: REVIEWS_SEO,
      hero: REVIEWS_HERO,
      trust: REVIEWS_TRUST,
      clients: REVIEWS_CLIENTS,
      expertise: REVIEWS_EXPERTISE,
      story: REVIEWS_STORY,
      projects: REVIEWS_PROJECTS,
      cta: REVIEWS_CTA,
    };
  }

  async getThankYouPage(): Promise<ThankYouPage> {
    return { ...THANK_YOU, seo: THANK_YOU_SEO };
  }
}

/**
 * The bundled assets as a media library: what Laravel's `/media` returns for the same ids. URLs are
 * the hashed `/_next/static/media/…` paths of the static imports.
 */
function staticMediaLibrary(): MediaLibrary {
  return (Object.keys(media) as MediaId[]).map((id) => {
    const { image, description } = media[id];
    return {
      id,
      url: image.src,
      width: image.width,
      height: image.height,
      alt: description,
      ...(image.blurDataURL ? { blurDataURL: image.blurDataURL } : {}),
    };
  });
}
