/**
 * Cache tags of the content (`cacheTag` in `./index.ts`). Laravel names the tags of what changed
 * and `/api/revalidate` calls `revalidateTag(tag)` for each, so the pages that read it re-render.
 *
 * | Tag                    | Covers                                                    |
 * | ---------------------- | --------------------------------------------------------- |
 * | `content`              | everything (every cached read carries it)                 |
 * | `site`                 | settings: channels, address, socials, offices, SEO        |
 * | `navigation`           | header and footer menus                                   |
 * | `media`                | the media library                                         |
 * | `contact`              | the contact template                                      |
 * | `block-defaults`       | copy blocks show unless overridden (testimonials header)  |
 * | `projects`             | the project list (cards, filters, showcases)              |
 * | `project:<slug>`       | one project and its detail page                           |
 * | `testimonials`         | the testimonial pool                                      |
 * | `process-stages`       | the master process                                        |
 * | `sectors`              | the sector tiles                                          |
 * | `divisions`            | the division list (cards, strips, menus)                  |
 * | `division:<slug>`      | one division page                                         |
 * | `related-services`     | the service cards                                         |
 * | `services`             | which service pages exist                                 |
 * | `service:<slug>`       | one service page (with its FAQ)                           |
 * | `location:<slug>`      | `india`, `dubai`                                          |
 * | `posts`                | post lists, categories and every article's "latest" aside |
 * | `post:<slug>`          | one article                                               |
 * | `news`                 | the news list                                             |
 * | `page:<page>`          | a static page's own copy: `home`, `about`, `services`,    |
 * |                        | `works`, `blog`, `news`, `reviews`, `thank-you`           |
 *
 * Collection tags also cover their items' references: saving a project revalidates
 * `projects` and `project:<slug>`.
 */
export const ALL_CONTENT_TAG = "content";

export type StaticPageKey =
  "home" | "about" | "services" | "works" | "blog" | "news" | "reviews" | "thank-you";

export const tags = {
  site: "site",
  navigation: "navigation",
  media: "media",
  contact: "contact",
  blockDefaults: "block-defaults",
  projects: "projects",
  project: (slug: string) => `project:${slug}`,
  testimonials: "testimonials",
  processStages: "process-stages",
  sectors: "sectors",
  divisions: "divisions",
  division: (slug: string) => `division:${slug}`,
  relatedServices: "related-services",
  services: "services",
  service: (slug: string) => `service:${slug}`,
  location: (slug: string) => `location:${slug}`,
  posts: "posts",
  post: (slug: string) => `post:${slug}`,
  news: "news",
  page: (page: StaticPageKey) => `page:${page}`,
} as const;
