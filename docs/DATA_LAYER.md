# Data layer

How pages get their content, and what the Laravel backend has to serve. Decision D6 and MIGRATION_PLAN Phase 11 explain why. The code is the reference; this page is the map.

## Shape

```
src/lib/schemas/   Zod schema per resource (the API contract); entity types are z.infer of them
src/lib/data/
  repository.ts         ContentRepository: one async method per REST resource
  static-repository.ts  StaticRepository: serves src/content (parses with the schemas in dev and tests)
  accessors.ts          the public API: cached, tagged reads ("use cache" + cacheTag) + getRepository()
  tags.ts               cache tag scheme (what /api/revalidate invalidates)
  refs.ts               getRefs(): the shared collections with id lookups
  labels.ts             getTrailLabels(): names for breadcrumb trails
src/lib/media/resolve.ts   resolveMedia(): MediaId → next/image source (server-only)
```

Everything under `src/lib/data` and `src/lib/media/resolve.ts` is `server-only`. A client island that imports it fails `next build`.

## Rules

1. **Route files** import from `@/lib/data` only. They await their page resource (`getServicePage(slug)`, `getHomePage()`, …) and pass the sections down as props. `generateStaticParams` comes from `list…Slugs()`, and `ensureStatic = "navigation"` stays where it was used. Metadata is `pageMetadata(seo, await getSite())`.
2. **Shared references** (project, testimonial, process stage, sector, division and service ids in page content) are resolved by the server component that renders them, through `const refs = await getRefs()`. Page content keeps the ids (D6).
3. **Site settings**: server components call `await getSite()`. Client islands call `useSite()`, which the root layout feeds through `ShellProvider`.
4. **Client components** receive plain, already resolved data: images as `ImageSource`, never a `MediaId` or the media manifest (P10-03).
5. **Nothing outside `src/lib/data`** imports values from `src/content`. Importing types from it is fine, and so are the pure formatting helpers that still live there (`formatPostDate`, `projectLocationLine`, `projectCountLabel`).

## Resources (API → repository)

| API                          | Method                                                                                                                                              | Schema                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `GET /settings`              | `getSite()`                                                                                                                                         | `siteSettingsSchema` (offices, SEO incl.) |
| `GET /navigation`            | `getNavigation()`                                                                                                                                   | `navigationSchema`                        |
| `GET /media`                 | `getMediaLibrary()`                                                                                                                                 | `mediaLibrarySchema`                      |
| `GET /contact`               | `getContactTemplate()`                                                                                                                              | `contactTemplateSchema`                   |
| `GET /projects?category=`    | `listProjects({ category })`                                                                                                                        | `projectSchema`                           |
| `GET /projects/{slug}`       | `getProject(slug)`, `getProjectPage(slug)`                                                                                                          | `projectSchema`, project page: to do      |
| `GET /testimonials`          | `listTestimonials()`                                                                                                                                | `testimonialSchema`                       |
| `GET /process-stages`        | `listProcessStages()`                                                                                                                               | `processStageSchema`                      |
| `GET /sectors`               | `listSectors()`                                                                                                                                     | `sectorSchema`                            |
| `GET /divisions`             | `listDivisions()`                                                                                                                                   | `divisionSchema`                          |
| `GET /related-services`      | `listRelatedServices()`                                                                                                                             | `relatedServiceSchema`                    |
| `GET /services/{slug}`       | `listServicePageSlugs()`, `getServicePage(slug)`                                                                                                    | `servicePageSchema` (blocks + FAQ)        |
| `GET /divisions/{slug}`      | `listDivisionPageSlugs()`, `getDivisionPage(slug)`                                                                                                  | `contentBlockSchema` (page: to do)        |
| `GET /locations/{slug}`      | `getIndiaPage()`, `getDubaiPage()`                                                                                                                  | to do                                     |
| `GET /posts?category=&page=` | `listPosts({ category })` (Laravel merges the pages)                                                                                                | to do                                     |
| `GET /posts/{slug}`          | `getPost(slug)`; `listPostCategories()`                                                                                                             | to do                                     |
| `GET /news`                  | `listNews()`                                                                                                                                        | to do                                     |
| `GET /faqs?page=`            | embedded in page resources (`contact.faq`), `faqSchema`                                                                                             | `faqSchema`                               |
| `GET /pages/{page}`          | `getHomePage()`, `getAboutPage()`, `getServicesPage()`, `getWorksPage()`, `getReviewsPage()`, `getBlogPage()`, `getNewsPage()`, `getThankYouPage()` | home, about done; others to do            |
| `POST /leads`                | not part of the repository: `src/app/api/leads` → `LEADS_ENDPOINT`                                                                                  | `src/lib/leads/schema.ts`                 |

A `get…(slug)` that finds nothing resolves to `undefined`, and the route answers 404. JSON examples for `docs/API_CONTRACT.md` can be generated from these schemas (`z.toJSONSchema`).

## Schemas

- Optional keys are **omitted**, never `null`. Schemas use `.exactOptional()`.
- **Entity types** (`Project`, `Testimonial`, `SiteSettings`, `NavItem`, …) are `z.infer` of the schema. **Block and section types** belong to the component that renders them, and their schema is checked against that type with `shaped<T>()`, so changing a component's props without the schema fails `tsc`.
- `static-repository.test.ts` parses every static resource and requires the output to **equal** the input, so a field the schema forgets fails the test instead of being stripped silently.
- **Ids are closed enums** generated from the static content (`MediaId`, `ProjectSlug`, `TestimonialId`, …). Every reference in `src/content` is compile-checked. When the CMS owns a collection, change its id schema to `z.string()`; the lookups in `getRefs()` already throw on unknown ids. **Decision for the lead.**

## Media

Content references images by `MediaId` (`photos/bright-living-room`). Laravel keeps **the same ids** for every asset the site ships today, so those ids keep resolving to the bundled static imports (hashed URL, size, blur placeholder). `/media` lists `{ id, url, width, height, alt?, blurDataURL? }`. `StaticRepository.getMediaLibrary()` returns that shape from the manifest.

A new upload with an id the bundle does not know: `LaravelRepository` replaces it **before parsing** with an inline remote image `{ src, width, height, blurDataURL? }` taken from `/media`. Every image field accepts `MediaId | RemoteImage` (`mediaRefSchema`), and `resolveMedia()` passes remote images through unchanged. Remote hosts have to be added to `images.remotePatterns`.

## Caching and revalidation

Every accessor is `"use cache"` with `cacheLife("max")` and the tags from `tags.ts`, so pages stay fully static and change only when a tag is invalidated:

`content` (everything) · `site` · `navigation` · `media` · `contact` · `projects` · `project:<slug>` · `testimonials` · `process-stages` · `sectors` · `divisions` · `division:<slug>` · `related-services` · `services` · `service:<slug>` · `location:<india|dubai>` · `posts` · `post:<slug>` · `news` · `page:<home|about|services|works|blog|news|reviews|thank-you>`

When Laravel saves a record it sends the affected tags to `/api/revalidate`. Example: a project edit sends `projects` and `project:<slug>`. A settings edit sends `site`.

## Swapping in Laravel

1. Implement `ContentRepository` in `laravel-repository.ts`: `fetch`, inline unknown media ids, `schema.parse`, typed errors and timeouts. Caching stays in `accessors.ts`.
2. Return it from `getRepository()` when `DATA_SOURCE=laravel`.
3. Nothing else changes. Routes, components and tags stay as they are.
