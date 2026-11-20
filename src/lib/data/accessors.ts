import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import type { ContentRepository, PostFilter, ProjectFilter } from "./repository";
import { StaticRepository } from "./static-repository";
import { ALL_CONTENT_TAG, tags } from "./tags";

/**
 * The data layer's public API: one cached accessor per repository method. Route files (and the few
 * server components that resolve shared references, see `./refs.ts`) call these; nothing else
 * imports `src/content`.
 *
 * Each accessor is a `"use cache"` function: its result is part of the prerendered page (routes stay
 * fully static, `ensureStatic = "navigation"`), and it carries the tags of `./tags.ts` so Laravel
 * can revalidate exactly the pages that show a changed resource (`revalidateTag`). `cacheLife("max")`
 * is only the upper bound: content changes arrive by tag.
 */

let repository: ContentRepository | undefined;

/**
 * The repository behind the accessors. Static content today; Phase 11 adds `LaravelRepository`
 * behind `DATA_SOURCE=laravel`.
 */
export function getRepository(): ContentRepository {
  repository ??= new StaticRepository();
  return repository;
}

/** Common preamble of every cached read. */
function cached(...resourceTags: string[]): void {
  cacheLife("max");
  cacheTag(ALL_CONTENT_TAG, ...resourceTags);
}

// Site shell -------------------------------------------------------------------------------------

export async function getSite() {
  "use cache";
  cached(tags.site);
  return getRepository().getSite();
}

export async function getNavigation() {
  "use cache";
  cached(tags.navigation);
  return getRepository().getNavigation();
}

export async function getMediaLibrary() {
  "use cache";
  cached(tags.media);
  return getRepository().getMediaLibrary();
}

export async function getContactTemplate() {
  "use cache";
  cached(tags.contact);
  return getRepository().getContactTemplate();
}

// Shared entities --------------------------------------------------------------------------------

export async function listProjects(filter: ProjectFilter = {}) {
  "use cache";
  cached(tags.projects);
  return getRepository().listProjects(filter);
}

export async function getProject(slug: string) {
  "use cache";
  cached(tags.projects, tags.project(slug));
  return getRepository().getProject(slug);
}

export async function listTestimonials() {
  "use cache";
  cached(tags.testimonials);
  return getRepository().listTestimonials();
}

export async function listProcessStages() {
  "use cache";
  cached(tags.processStages);
  return getRepository().listProcessStages();
}

export async function listSectors() {
  "use cache";
  cached(tags.sectors);
  return getRepository().listSectors();
}

export async function listDivisions() {
  "use cache";
  cached(tags.divisions);
  return getRepository().listDivisions();
}

export async function listRelatedServices() {
  "use cache";
  cached(tags.relatedServices);
  return getRepository().listRelatedServices();
}

// Services ---------------------------------------------------------------------------------------

export async function listServicePageSlugs() {
  "use cache";
  cached(tags.services);
  return getRepository().listServicePageSlugs();
}

export async function getServicePage(slug: string) {
  "use cache";
  cached(tags.services, tags.service(slug));
  return getRepository().getServicePage(slug);
}

export async function getServicesPage() {
  "use cache";
  cached(tags.page("services"));
  return getRepository().getServicesPage();
}

// Divisions --------------------------------------------------------------------------------------

export async function listDivisionPageSlugs() {
  "use cache";
  cached(tags.divisions);
  return getRepository().listDivisionPageSlugs();
}

export async function getDivisionPage(slug: string) {
  "use cache";
  cached(tags.divisions, tags.division(slug));
  return getRepository().getDivisionPage(slug);
}

// Locations --------------------------------------------------------------------------------------

export async function getIndiaPage() {
  "use cache";
  cached(tags.location("india"));
  return getRepository().getIndiaPage();
}

export async function getDubaiPage() {
  "use cache";
  cached(tags.location("dubai"));
  return getRepository().getDubaiPage();
}

// Works ------------------------------------------------------------------------------------------

export async function listProjectPageSlugs() {
  "use cache";
  cached(tags.projects);
  return getRepository().listProjectPageSlugs();
}

export async function getProjectPage(slug: string) {
  "use cache";
  cached(tags.projects, tags.project(slug));
  return getRepository().getProjectPage(slug);
}

export async function getWorksPage() {
  "use cache";
  cached(tags.page("works"));
  return getRepository().getWorksPage();
}

// Blog and news ----------------------------------------------------------------------------------

export async function listPostCategories() {
  "use cache";
  cached(tags.posts);
  return getRepository().listPostCategories();
}

export async function listPosts(filter: PostFilter = {}) {
  "use cache";
  cached(tags.posts);
  return getRepository().listPosts(filter);
}

export async function getPost(slug: string) {
  "use cache";
  cached(tags.posts, tags.post(slug));
  return getRepository().getPost(slug);
}

export async function getBlogPage() {
  "use cache";
  cached(tags.page("blog"));
  return getRepository().getBlogPage();
}

export async function listNews() {
  "use cache";
  cached(tags.news);
  return getRepository().listNews();
}

export async function getNewsPage() {
  "use cache";
  cached(tags.page("news"));
  return getRepository().getNewsPage();
}

// Pages ------------------------------------------------------------------------------------------

export async function getHomePage() {
  "use cache";
  cached(tags.page("home"));
  return getRepository().getHomePage();
}

export async function getAboutPage() {
  "use cache";
  cached(tags.page("about"));
  return getRepository().getAboutPage();
}

export async function getReviewsPage() {
  "use cache";
  cached(tags.page("reviews"));
  return getRepository().getReviewsPage();
}

export async function getThankYouPage() {
  "use cache";
  cached(tags.page("thank-you"));
  return getRepository().getThankYouPage();
}
