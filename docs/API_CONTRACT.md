# Laravel API contract

What the Next.js site expects from the Laravel back end (Phase 11), and what it sends to it. The site is the client: it reads content over a small read-only REST API, posts enquiries to one endpoint, and is told by a signed webhook when content changes.

The **resource reference** below (paths, cache tags, examples, JSON Schemas) is generated from the site's Zod schemas and its current static content by `pnpm api:contract`, so it cannot drift from what the site parses. Everything outside the generated block is written by hand.

Local stand-in: `pnpm mock:laravel` serves exactly this contract from the static content on `http://127.0.0.1:3651/api/v1` (see [Running against the mock](#running-against-the-mock)).

## Conventions

| Topic         | Rule                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base URL      | `LARAVEL_API_URL` on the site, e.g. `https://cms.katicdesigns.com/api/v1`. Every path below is relative to it.                                                                                                                           |
| Auth (reads)  | `Authorization: Bearer <LARAVEL_API_TOKEN>`: a Sanctum personal access token with read-only abilities. Every content request carries it; answer `401` without it.                                                                        |
| Format        | `Accept: application/json`. Responses are JSON, UTF-8.                                                                                                                                                                                   |
| Envelope      | Every `200` body is `{ "data": <resource> }` (Laravel API Resources' default wrapping). Lists are `{ "data": [ … ] }` with **every item** in the site's display order; no pagination is read (a `page` query parameter is ignored).      |
| Optional keys | An optional field is **omitted**, never `null`. Unknown extra keys are ignored by the site, so adding fields is backwards compatible.                                                                                                    |
| Copy          | Text is sent verbatim, as editors typed it. Fields typed as lists of lines (titles) keep their line breaks as array items.                                                                                                               |
| References    | Entities refer to each other by **id/slug** (`MediaId`, project slug, service slug), never by embedding. Media ids name an entry of `GET /media`.                                                                                        |
| Not found     | `404` with `{ "message": "Not found." }` for an unknown slug; the site renders its 404 page.                                                                                                                                             |
| Errors        | Laravel's default JSON errors: `{ "message": "…" }`, plus `"errors": { field: [messages] }` on `422`. The site treats `5xx` and timeouts as transient (one retry), any other non-2xx as a hard failure.                                  |
| Timeouts      | The site waits `LARAVEL_API_TIMEOUT_MS` (default 8 s) per request, retries once on network errors and `5xx`, then fails. A failure at build time fails the build; at run time the previously cached page keeps being served.             |
| Caching       | The site caches every read indefinitely under the **cache tags** listed per resource and re-renders only when Laravel names a tag in the [revalidation webhook](#post-apirevalidate-laravel--site). Laravel needs no HTTP cache headers. |
| Rate limits   | Reads happen at build time and on revalidation only (tens of requests per content change), never per visitor.                                                                                                                            |

## Media

`GET /media` is the media library: `{ id, url, width, height, alt?, blurDataURL? }` per asset.

- **Ids are stable and path-like** (`photos/kitchen-joinery`). Laravel keeps the ids of the assets the site ships today; the site resolves those to its bundled, pre-optimised copies and only uses `url` for ids it does not bundle (new uploads).
- `url` is absolute, on `LARAVEL_MEDIA_URL` if set (a CDN or bucket, with a path prefix) or on the API's own origin. `next/image` optimises only that host and prefix (`images.remotePatterns` is derived from the same variables), so a URL anywhere else fails to render.
- `width` and `height` are the intrinsic pixel size of the original (required: they prevent layout shift). `alt` is the default description of what the image depicts. `blurDataURL` is an optional tiny base64 placeholder.
- Media URLs should be immutable (a new file gets a new URL, e.g. Spatie Media Library's `/storage/{id}/{file}` with conversions) so the optimiser's cache stays correct.

## `POST /leads` (site → Laravel)

Every validated enquiry from the site's contact forms and the Start-a-Project popup. The site's own endpoint `/api/leads` validates, drops spam and rate-limits, then forwards here (`LEADS_ENDPOINT`, normally `${LARAVEL_API_URL}/leads`).

**Request**

```http
POST /api/v1/leads
Authorization: Bearer <LEADS_API_TOKEN>
Content-Type: application/json
Accept: application/json
Idempotency-Key: 6f1c2a4e-3c1d-4d5e-9b2a-0c8f7e6d5a41
```

The JSON body is generated below (`lead` example and schema). Field notes:

| Field                                           | Notes                                                                              |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `name`, `email`                                 | Required, trimmed, already validated (email format, ≤120 characters for the name). |
| `service`                                       | One of the site's service names or `Not sure yet`.                                 |
| `phone`, `details`                              | Optional free text (≤40, ≤4000).                                                   |
| `location`, `projectType`, `timeline`, `budget` | Optional answers of the popup's selects (closed lists, see the schema).            |
| `extra`                                         | Optional answers of page-specific selects, as label → value.                       |
| `source`                                        | `{ form: "popup" \| "contact", path, title }`: which form on which page.           |
| `submittedAt`                                   | ISO 8601 timestamp set by the site.                                                |
| `subject`                                       | Ready-made subject line for notification emails.                                   |
| `userAgent`                                     | The visitor's browser, when known.                                                 |

**Idempotency.** The site sends one `Idempotency-Key` (a UUID) per submission and reuses it on its single retry (after a timeout or `5xx`). Laravel must store the key with the lead and, when it sees the same key again, answer the original success **without creating a second lead**. `409` ("a request with this key is in progress") is also accepted as delivered.

**Responses and what the visitor sees**

| Laravel answers                  | Site's `/api/leads` answers        | Visitor                                                                                  |
| -------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `201` / `200` / `202` / `409`    | `202 { ok: true, status: "sent" }` | `/thank-you`, personalised                                                               |
| `429`                            | `429 { status: "rate-limited" }`   | stays on the form, "try again in a few minutes" toast                                    |
| `401`, `403`, `422`, other `4xx` | `502 { status: "failed" }`         | `/thank-you` with the email / WhatsApp / copy fallback (P9-03); logged as a server error |
| `5xx`, timeout (10 s), twice     | `502 { status: "failed" }`         | same fallback                                                                            |

Suggested success body: `{ "data": { "id": 123, "status": "received" } }` (the site does not read it). A `422` means the two validators drifted apart; Laravel should validate the same rules as the schema below and nothing stricter.

Spam and abuse: the honeypot never reaches Laravel (the site answers bots with a fake success); the site's per-IP limit (5 per 10 minutes) is best-effort and per instance, so Laravel should enforce its own limit per token and per `email`.

## `POST /api/revalidate` (Laravel → site)

Laravel calls this on the **site** whenever content changes (model `saved` / `deleted` events, media replaced, menu edited), naming the cache tags of what changed. The site marks those tags stale and re-renders the pages that read them.

```http
POST https://www.katicdesigns.com/api/revalidate
Content-Type: application/json
X-Katic-Timestamp: 1763640000
X-Katic-Signature: sha256=<hex>

{"tags":["projects","project:the-courtyard-house"]}
```

- **Signature**: `X-Katic-Signature` is `sha256=` + the lowercase hex HMAC-SHA256 of `"<timestamp>.<raw body>"` keyed with `REVALIDATE_SECRET` (shared, ≥16 characters; generate with `openssl rand -hex 32`). `X-Katic-Timestamp` is the current Unix time in seconds; requests more than **300 s** from the site's clock are refused (replay protection). Sign the exact bytes you send.

  ```php
  $body = json_encode(['tags' => $tags], JSON_UNESCAPED_SLASHES);
  $ts = time();
  Http::withHeaders([
      'X-Katic-Timestamp' => $ts,
      'X-Katic-Signature' => 'sha256='.hash_hmac('sha256', $ts.'.'.$body, config('services.site.revalidate_secret')),
  ])->withBody($body, 'application/json')->timeout(10)->retry(3, 2000)->post(config('services.site.url').'/api/revalidate');
  ```

- **Body**: `{ "tags": string[], "immediate"?: boolean }`, no other keys. 1–100 tags, each matching `^[A-Za-z0-9][A-Za-z0-9:._/-]{0,127}$`; duplicates are ignored. Tags are listed per resource below; the tag `content` revalidates everything.
- **`immediate`**: `false` (default) is stale-while-revalidate: the next visitor still gets the old page once while the new one renders in the background (`revalidateTag(tag, "max")`). `true` expires the pages so the next visitor waits for fresh content (`{ expire: 0 }`); use it for corrections that must never be shown again.
- **Responses** (JSON):

  | Status | Body                                                                                                | Meaning                                                       |
  | ------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
  | `200`  | `{ "ok": true, "revalidated": ["projects", …], "immediate": false, "now": 1763640000123 }`          | done                                                          |
  | `400`  | `{ "ok": false, "error": "bad-request" }` or `{ "ok": false, "error": "invalid", "issues": [ … ] }` | not JSON / not a valid tag list; do not retry                 |
  | `401`  | `{ "ok": false, "error": "unauthorized" }`                                                          | missing, stale or wrong signature; check the secret and clock |
  | `405`  | (empty)                                                                                             | any method but `POST`                                         |
  | `413`  | `{ "ok": false, "error": "too-large" }`                                                             | body over 16 KB                                               |
  | `503`  | `{ "ok": false, "error": "not-configured" }`                                                        | the site has no `REVALIDATE_SECRET`; retry later              |

- **Delivery**: queue the call, retry on network errors and `5xx`, and send one call with all tags of a save (a project save: `projects`, `project:<slug>`). Revalidation is cheap; when unsure, include the collection tag.
- Several site instances: `revalidateTag` acts on the instance that receives the call. A multi-instance deployment needs a shared cache handler (`cacheHandlers`) or one call per instance.

## Running against the mock

```sh
pnpm mock:laravel                                    # http://127.0.0.1:3651/api/v1
DATA_SOURCE=laravel LARAVEL_API_URL=http://127.0.0.1:3651/api/v1 LARAVEL_API_TOKEN=dev \
  REVALIDATE_SECRET=dev-revalidate-secret-0123 LEADS_ENDPOINT=http://127.0.0.1:3651/api/v1/leads \
  pnpm build && pnpm start --port 3621
```

The mock serves every resource below from `src/content`, the media files from `src/assets/images`, and records `POST /leads` (idempotent by key). Test controls under `/__mock` (not part of the contract): `GET|DELETE /__mock/leads`, `PUT /__mock/leads/mode {"status": 201|422|429|500|"timeout"}`, `PUT /__mock/override?path=/api/v1/…` (serve a given JSON body for a path) and `DELETE /__mock/override`. `MOCK_LARAVEL_TOKEN` / `MOCK_LEADS_TOKEN` make it require those bearer tokens.

<!-- api-contract:generated:start -->

## Resource reference (generated)

Generated by `pnpm api:contract` from `src/lib/data/laravel/endpoints.ts`, the Zod schemas and the static content. Every resource is `GET`, needs the bearer token, answers `200 { "data": … }` (`401` without a valid token), and is cached by the site under the listed tags. Full examples are in [docs/api-contract/examples](./api-contract/examples) and JSON Schemas (draft 2020-12, of `data`) in [docs/api-contract/schemas](./api-contract/schemas). Media URLs in the examples use the placeholder origin `https://cms.katicdesigns.com`.

| Method | Path                    | Repository method       | Cache tags                     | 404          | Schema                                                         |
| ------ | ----------------------- | ----------------------- | ------------------------------ | ------------ | -------------------------------------------------------------- |
| GET    | `/settings`             | `getSite`               | `site`                         | —            | [schema](./api-contract/schemas/get-site.json)                 |
| GET    | `/navigation`           | `getNavigation`         | `navigation`                   | —            | [schema](./api-contract/schemas/get-navigation.json)           |
| GET    | `/media`                | `getMediaLibrary`       | `media`                        | —            | [schema](./api-contract/schemas/get-media-library.json)        |
| GET    | `/contact`              | `getContactTemplate`    | `contact`                      | —            | [schema](./api-contract/schemas/get-contact-template.json)     |
| GET    | `/projects?category=`   | `listProjects`          | `projects`                     | —            | [schema](./api-contract/schemas/list-projects.json)            |
| GET    | `/projects/{slug}`      | `getProject`            | `projects`, `project:{slug}`   | unknown slug | [schema](./api-contract/schemas/get-project.json)              |
| GET    | `/testimonials`         | `listTestimonials`      | `testimonials`                 | —            | [schema](./api-contract/schemas/list-testimonials.json)        |
| GET    | `/process-stages`       | `listProcessStages`     | `process-stages`               | —            | [schema](./api-contract/schemas/list-process-stages.json)      |
| GET    | `/sectors`              | `listSectors`           | `sectors`                      | —            | [schema](./api-contract/schemas/list-sectors.json)             |
| GET    | `/divisions`            | `listDivisions`         | `divisions`                    | —            | [schema](./api-contract/schemas/list-divisions.json)           |
| GET    | `/related-services`     | `listRelatedServices`   | `related-services`             | —            | [schema](./api-contract/schemas/list-related-services.json)    |
| GET    | `/services`             | `listServicePageSlugs`  | `services`                     | —            | [schema](./api-contract/schemas/list-service-page-slugs.json)  |
| GET    | `/services/{slug}`      | `getServicePage`        | `services`, `service:{slug}`   | unknown slug | [schema](./api-contract/schemas/get-service-page.json)         |
| GET    | `/pages/services`       | `getServicesPage`       | `page:services`                | —            | pending (passed through)                                       |
| GET    | `/division-pages`       | `listDivisionPageSlugs` | `divisions`                    | —            | [schema](./api-contract/schemas/list-division-page-slugs.json) |
| GET    | `/divisions/{slug}`     | `getDivisionPage`       | `divisions`, `division:{slug}` | unknown slug | pending (passed through)                                       |
| GET    | `/locations/india`      | `getIndiaPage`          | `location:india`               | —            | pending (passed through)                                       |
| GET    | `/locations/dubai`      | `getDubaiPage`          | `location:dubai`               | —            | pending (passed through)                                       |
| GET    | `/project-pages`        | `listProjectPageSlugs`  | `projects`                     | —            | [schema](./api-contract/schemas/list-project-page-slugs.json)  |
| GET    | `/projects/{slug}/page` | `getProjectPage`        | `projects`, `project:{slug}`   | unknown slug | pending (passed through)                                       |
| GET    | `/pages/works`          | `getWorksPage`          | `page:works`                   | —            | pending (passed through)                                       |
| GET    | `/post-categories`      | `listPostCategories`    | `posts`                        | —            | pending (passed through)                                       |
| GET    | `/posts?category=`      | `listPosts`             | `posts`                        | —            | pending (passed through)                                       |
| GET    | `/posts/{slug}`         | `getPost`               | `posts`, `post:{slug}`         | unknown slug | pending (passed through)                                       |
| GET    | `/pages/blog`           | `getBlogPage`           | `page:blog`                    | —            | pending (passed through)                                       |
| GET    | `/news`                 | `listNews`              | `news`                         | —            | pending (passed through)                                       |
| GET    | `/pages/news`           | `getNewsPage`           | `page:news`                    | —            | pending (passed through)                                       |
| GET    | `/pages/home`           | `getHomePage`           | `page:home`                    | —            | pending (passed through)                                       |
| GET    | `/pages/about`          | `getAboutPage`          | `page:about`                   | —            | pending (passed through)                                       |
| GET    | `/pages/reviews`        | `getReviewsPage`        | `page:reviews`                 | —            | pending (passed through)                                       |
| GET    | `/pages/thank-you`      | `getThankYouPage`       | `page:thank-you`               | —            | pending (passed through)                                       |

Resources without a schema yet (their JSON is passed through as the static content's types until the page schemas land): `getServicesPage`, `getDivisionPage`, `getIndiaPage`, `getDubaiPage`, `getProjectPage`, `getWorksPage`, `listPostCategories`, `listPosts`, `getPost`, `getBlogPage`, `listNews`, `getNewsPage`, `getHomePage`, `getAboutPage`, `getReviewsPage`, `getThankYouPage`.

### `POST /leads` body

[Schema](./api-contract/schemas/post-leads.json) · [example](./api-contract/examples/post-leads.json)

```json
{
  "name": "Jane Doe",
  "email": "jane@email.com",
  "phone": "+91 98470 00000",
  "service": "Interior Design",
  "location": "Kerala",
  "timeline": "3–6 months",
  "details": "A three-bedroom apartment in Kochi.",
  "source": {
    "form": "popup",
    "path": "/services/interior",
    "title": "Interior Designers in Kochi, Kerala"
  },
  "submittedAt": "2026-11-20T12:00:00.000Z",
  "subject": "Project enquiry — Interior Design (Interior Designers in Kochi, Kerala)",
  "userAgent": "Mozilla/5.0 …"
}
```

### `POST /api/revalidate` body (site)

[Schema](./api-contract/schemas/post-revalidate.json)

### `GET /settings`

Site settings: contact channels, offices, social links, default SEO. Repository: `getSite()`. Example: `GET /settings` ([full response](./api-contract/examples/get-site.json), [schema](./api-contract/schemas/get-site.json)).

```json
{
  "data": {
    "name": "Katic Designs",
    "email": "hello@katicdesigns.com",
    "phone": {
      "display": "+1 (000) 000-0000",
      "href": "tel:+10000000000"
    },
    "whatsapp": {
      "number": "10000000000"
    },
    "address": {
      "lines": ["Katic Designs Studio", "14 Ridgeline Road", "… 2 more"],
      "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Katic+Designs+Kochi"
    },
    "socials": [
      {
        "network": "instagram",
        "label": "Instagram",
        "url": "https://www.instagram.com/"
      },
      {
        "network": "facebook",
        "label": "Facebook",
        "url": "https://www.facebook.com/"
      },
      "… 2 more"
    ],
    "credit": {
      "label": "crafted@ateliergroupcompany",
      "url": "https://ateliergroupcompany.com/"
    },
    "seo": {
      "title": "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
      "description": "Katic Designs is an architecture, interior design and construction studio in Kochi, Ker…",
      "locale": "en_IN",
      "language": "en",
      "geo": {
        "region": "IN-KL",
        "placename": "Kochi"
      },
      "foundingDate": "2013",
      "areaServed": ["Kerala", "South India", "… 2 more"],
      "ogImage": {
        "path": "/og-image.jpg",
        "width": 1200,
        "height": 630,
        "alt": "Courtyard home designed and built by Katic Designs in Kochi, Kerala"
      }
    },
    "offices": {
      "kochi": {
        "id": "kochi",
        "name": "Katic Designs — Kochi",
        "email": "hello@katicdesigns.com",
        "address": "{…}",
        "hours": "{…}"
      },
      "dubai": {
        "id": "dubai",
        "name": "Katic Designs — Dubai",
        "email": "dubai@katicdesigns.com",
        "address": "{…}",
        "hours": "{…}"
      }
    }
  }
}
```

### `GET /navigation`

Header menu (with dropdowns) and footer columns. Repository: `getNavigation()`. Example: `GET /navigation` ([full response](./api-contract/examples/get-navigation.json), [schema](./api-contract/schemas/get-navigation.json)).

```json
{
  "data": {
    "header": [
      {
        "key": "home",
        "label": "Home",
        "href": "/"
      },
      {
        "key": "about",
        "label": "About",
        "href": "/about"
      },
      "… 6 more"
    ],
    "footer": [
      {
        "title": "Explore",
        "links": ["{…}", "{…}", "… 4 more"]
      },
      {
        "title": "Services",
        "links": ["{…}", "{…}", "… 6 more"]
      },
      "… 2 more"
    ]
  }
}
```

### `GET /media`

Every image content can reference by id (see Media). Repository: `getMediaLibrary()`. Example: `GET /media` ([full response](./api-contract/examples/get-media-library.json), [schema](./api-contract/schemas/get-media-library.json)).

```json
{
  "data": [
    {
      "id": "brand/logo",
      "url": "https://cms.katicdesigns.com/media/brand/logo.webp",
      "width": 115,
      "height": 65,
      "alt": "Katic Designs"
    },
    {
      "id": "partners/asian-paints",
      "url": "https://cms.katicdesigns.com/media/partners/asian-paints.webp",
      "width": 284,
      "height": 142,
      "alt": "Asian Paints"
    },
    "… 129 more"
  ]
}
```

### `GET /contact`

The contact section shared by every page (form copy, channels). Repository: `getContactTemplate()`. Example: `GET /contact` ([full response](./api-contract/examples/get-contact-template.json), [schema](./api-contract/schemas/get-contact-template.json)).

```json
{
  "data": {
    "kicker": "Get in Touch",
    "heading": {
      "lines": ["Have a Project in", "Mind?"]
    },
    "lead": "Tell us a little about your site, timeline, and the service you need — we’ll get back t…",
    "channels": ["email", "phone"],
    "form": {
      "service": {
        "mode": "select"
      }
    }
  }
}
```

### `GET /projects?category=`

All projects in display order; `?category=` filters to a works category. Repository: `listProjects()`. Example: `GET /projects` ([full response](./api-contract/examples/list-projects.json), [schema](./api-contract/schemas/list-projects.json)).

```json
{
  "data": [
    {
      "slug": "obsidian-lounge",
      "name": "Obsidian Lounge",
      "location": "Skopje, MK",
      "region": "north-macedonia",
      "categories": ["commercial", "interiors"],
      "type": "Interiors",
      "scope": "Interior",
      "cover": "photos/bright-living-room",
      "coverAlt": "Bright living room with a grey sofa"
    },
    {
      "slug": "velvet-suite-penthouse",
      "name": "Velvet Suite Penthouse",
      "location": "Skopje, MK",
      "region": "north-macedonia",
      "categories": ["residential", "interiors", "… 1 more"],
      "type": "Interiors",
      "scope": "Interior",
      "cover": "photos/minimal-interior-yellow-armchair",
      "coverAlt": "Minimal interior with a yellow armchair"
    },
    "… 35 more"
  ]
}
```

### `GET /projects/{slug}`

One project (card facts). Repository: `getProject()`. Example: `GET /projects/the-courtyard-house` ([full response](./api-contract/examples/get-project.json), [schema](./api-contract/schemas/get-project.json)).

```json
{
  "data": {
    "slug": "the-courtyard-house",
    "name": "The Courtyard House",
    "location": "Thrissur, Kerala",
    "region": "kerala",
    "categories": ["residential", "architecture"],
    "type": "Residential",
    "scope": "Architecture",
    "cover": "photos/arched-courtyard-terrace",
    "coverAlt": "Courtyard terrace with arches and patterned tiles"
  }
}
```

### `GET /testimonials`

The testimonial pool, in display order. Repository: `listTestimonials()`. Example: `GET /testimonials` ([full response](./api-contract/examples/list-testimonials.json), [schema](./api-contract/schemas/list-testimonials.json)).

```json
{
  "data": [
    {
      "id": "arch",
      "quote": "The architecture responds to the site in a way that feels natural. Light, privacy and m…",
      "name": "Homeowner",
      "meta": "New-Build Villa · Kottayam",
      "avatar": "people/client-avatar-05"
    },
    {
      "id": "home-kochi",
      "quote": "Katic understood what we wanted from the beginning and translated it into a home that f…",
      "name": "Homeowner",
      "meta": "Residential Project · Kochi",
      "avatar": "people/client-avatar-01"
    },
    "… 4 more"
  ]
}
```

### `GET /process-stages`

The master design-and-build process. Repository: `listProcessStages()`. Example: `GET /process-stages` ([full response](./api-contract/examples/list-process-stages.json), [schema](./api-contract/schemas/list-process-stages.json)).

```json
{
  "data": [
    {
      "id": "discovery",
      "title": "Discovery",
      "text": "Site visit, brief, constraints and budget — the questions that shape everything after.",
      "icon": "search"
    },
    {
      "id": "concept",
      "title": "Concept",
      "text": "First massing studies and spatial ideas, tested against light, view and site logic.",
      "icon": "compass"
    },
    "… 6 more"
  ]
}
```

### `GET /sectors`

Sector tiles (residential, commercial, …). Repository: `listSectors()`. Example: `GET /sectors` ([full response](./api-contract/examples/list-sectors.json), [schema](./api-contract/schemas/list-sectors.json)).

```json
{
  "data": [
    {
      "key": "residential",
      "label": "SECTOR",
      "title": "Residential",
      "text": "Homes, villas and apartments shaped around daily life.",
      "image": "photos/canal-house-sunset",
      "alt": "House beside a canal at sunset",
      "category": "residential"
    },
    {
      "key": "commercial",
      "label": "SECTOR",
      "title": "Commercial",
      "text": "Workplaces, retail and mixed-use spaces built for business.",
      "image": "photos/commercial-facade-dusk",
      "alt": "Industrial-style commercial building lit at dusk",
      "category": "commercial"
    },
    "… 2 more"
  ]
}
```

### `GET /divisions`

The divisions (cards, strips, menus). Repository: `listDivisions()`. Example: `GET /divisions` ([full response](./api-contract/examples/list-divisions.json), [schema](./api-contract/schemas/list-divisions.json)).

```json
{
  "data": [
    {
      "slug": "design",
      "href": "/divisions/design",
      "name": "KATIC Design",
      "accent": "Design",
      "description": "Architecture, planning and facade design shaped by site, climate and purpose.",
      "image": "photos/brick-courtyard-house-dusk",
      "alt": "KATIC Design"
    },
    {
      "slug": "interior",
      "href": "/divisions/interior",
      "name": "KATIC Interior",
      "accent": "Interior",
      "description": "Interiors, furniture and in-house manufacturing, from concept to finish.",
      "image": "photos/city-view-living-room",
      "alt": "KATIC Interior"
    },
    "… 3 more"
  ]
}
```

### `GET /related-services`

Service cards shown across pages. Repository: `listRelatedServices()`. Example: `GET /related-services` ([full response](./api-contract/examples/list-related-services.json), [schema](./api-contract/schemas/list-related-services.json)).

```json
{
  "data": [
    {
      "slug": "architecture",
      "href": "/services/architecture",
      "title": "Architectural Design",
      "text": "Consultation, planning, architecture, elevations and spatial design.",
      "image": "photos/brick-courtyard-house-dusk",
      "alt": "Brick courtyard house lit at dusk around a planted courtyard"
    },
    {
      "slug": "interior",
      "href": "/services/interior",
      "title": "Interior Design",
      "text": "Interior planning, materials, furniture and execution.",
      "image": "photos/living-room-tv-wall",
      "alt": "Living room with a timber TV wall"
    },
    "… 5 more"
  ]
}
```

### `GET /services`

Slugs of the service pages that exist, in the site's order. Repository: `listServicePageSlugs()`. Example: `GET /services` ([full response](./api-contract/examples/list-service-page-slugs.json), [schema](./api-contract/schemas/list-service-page-slugs.json)).

```json
{
  "data": ["architecture", "interior", "… 6 more"]
}
```

### `GET /services/{slug}`

One service page: hero, sections (blocks), FAQ and contact. Repository: `getServicePage()`. Example: `GET /services/interior` ([full response](./api-contract/examples/get-service-page.json), [schema](./api-contract/schemas/get-service-page.json)).

```json
{
  "data": {
    "slug": "interior",
    "seo": {
      "title": "Interior Designers in Kochi, Kerala | Interior Design | Katic Designs",
      "description": "Interior design with in-house joinery and furniture: space planning, materials, lightin…"
    },
    "hero": {
      "image": {
        "src": "photos/sofa-jali-detail",
        "alt": "Sofa with cushions in front of a jali screen"
      },
      "kicker": "Interior Design · Kerala & UAE",
      "title": {
        "lines": ["Interiors Made", "for"],
        "accent": "Everyday Life"
      },
      "lead": "Interior planning, materials, furniture and execution — designed, made and installed by…",
      "primaryCta": {
        "kind": "contact",
        "label": "Discuss Your Interior",
        "service": "Interior Design"
      },
      "secondaryCta": {
        "kind": "link",
        "label": "View Interior Projects",
        "href": "/works?category=interiors#works-list"
      }
    },
    "sections": [
      {
        "type": "split",
        "image": "{…}",
        "caption": "Dining room · teak joinery",
        "kicker": "Philosophy",
        "title": ["Beauty that", "works hard"],
        "lead": "We design interiors that look considered and live easily — balancing aesthetics with fu…",
        "body": "Every room starts with how it will be used: the light at different hours, the way peopl…",
        "bullets": ["Functional planning", "Natural, durable materials", "… 2 more"]
      },
      {
        "type": "rows",
        "id": "interior-services",
        "header": "{…}",
        "items": ["{…}", "{…}", "… 3 more"]
      },
      "… 6 more"
    ],
    "contact": {
      "heading": {
        "lines": ["Planning an"],
        "accent": "Interior?"
      },
      "lead": "Share your space, style and timeline. We’ll respond within one business day with next s…",
      "form": {
        "service": "{…}",
        "extraFields": ["{…}", "{…}"]
      },
      "faq": {
        "kicker": "Questions, answered",
        "titleLines": ["Frequently asked", "questions"],
        "items": ["{…}", "{…}", "… 3 more"]
      },
      "plant": {
        "asset": "plants/schefflera",
        "corner": "bottom-right",
        "width": 230
      }
    }
  }
}
```

### `GET /pages/services`

The /services overview page. Repository: `getServicesPage()`. Example: `GET /pages/services` ([full response](./api-contract/examples/get-services-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Architecture, Interior & Construction Services | Katic Designs",
      "description": "Architectural design, interior design, construction, turnkey projects, renovation, land…"
    },
    "hero": {
      "image": {
        "src": "photos/dark-lounge-interior",
        "alt": ""
      },
      "kicker": "Integrated design and build",
      "titleLines": ["Architecture,", "Interiors &", "… 1 more"],
      "accent": "Under One Vision",
      "lead": "Katic Designs brings architecture, interior design, construction and related services t…",
      "cta": {
        "label": "Explore Our Work",
        "href": "/works"
      },
      "indexLabel": "OUR SERVICES"
    },
    "whatWeDo": {
      "kicker": "Integrated practice",
      "title": "What We Do",
      "statement": "One studio. One standard. One continuous line from first sketch to final handover.",
      "lead": "KATIC is an integrated practice: architecture, interiors, construction and care deliver…",
      "body": "Our architects, interior designers and site teams work as one, aligning ideas, material…",
      "cta": {
        "label": "Our Process",
        "href": "/services/architecture#process"
      },
      "steps": ["{…}", "{…}", "… 2 more"]
    },
    "blocks": [
      {
        "slug": "architecture",
        "tone": "light",
        "contrast": "standard",
        "reverse": false,
        "icon": "leaf",
        "tagline": "SITE · CLIMATE · FORM",
        "ctaLabel": "Explore Architectural Design",
        "image": "{…}",
        "thumbnails": ["{…}", "{…}", "… 2 more"]
      },
      {
        "slug": "interior",
        "tone": "dark",
        "contrast": "standard",
        "reverse": true,
        "icon": "layers",
        "tagline": "MATERIAL · MOOD · FUNCTION",
        "ctaLabel": "Explore Interior Design",
        "image": "{…}",
        "thumbnails": ["{…}", "{…}", "… 2 more"]
      },
      "… 5 more"
    ],
    "whatWeDeliver": {
      "kicker": "What we deliver",
      "titleLines": ["Seven services.", "One point of", "… 1 more"],
      "lead": "Every KATIC service on one page. Open any service for its full page, process, projects …"
    }
  }
}
```

### `GET /division-pages`

Slugs of the divisions that have a page. Repository: `listDivisionPageSlugs()`. Example: `GET /division-pages` ([full response](./api-contract/examples/list-division-page-slugs.json), [schema](./api-contract/schemas/list-division-page-slugs.json)).

```json
{
  "data": ["design", "interior", "… 3 more"]
}
```

### `GET /divisions/{slug}`

One division page. Repository: `getDivisionPage()`. Example: `GET /divisions/interior` ([full response](./api-contract/examples/get-division-page.json)).

```json
{
  "data": {
    "slug": "interior",
    "seo": {
      "title": "KATIC Interior | Interiors & In-house Manufacturing",
      "description": "KATIC Interior designs, manufactures and installs interiors, furniture and joinery unde…"
    },
    "hero": {
      "image": {
        "src": "photos/city-view-living-room",
        "alt": "Modern living room with a curved sofa and floor-to-ceiling city views"
      },
      "kicker": "KATIC Divisions · KATIC Interior",
      "title": {
        "lines": ["KATIC"],
        "accent": "Interior"
      },
      "lead": "Interiors designed, manufactured and installed by one team.",
      "primaryCta": {
        "kind": "enquiry",
        "label": "Start a Project",
        "service": "Interior Design"
      },
      "secondaryCta": {
        "kind": "link",
        "label": "View Projects",
        "href": "/works#works-list"
      }
    },
    "blocks": [
      {
        "type": "split",
        "plant": "{…}",
        "image": "{…}",
        "kicker": "About KATIC Interior",
        "title": ["Aesthetics with", "everyday function"],
        "lead": "KATIC Interior brings together interior design, furniture and in-house manufacturing.",
        "body": "Our approach balances aesthetics, functionality, material choices and detailing — inter…"
      },
      {
        "type": "features",
        "header": "{…}",
        "columns": 3,
        "items": ["{…}", "{…}", "… 4 more"]
      },
      "… 4 more"
    ]
  }
}
```

### `GET /locations/india`

The India location page. Repository: `getIndiaPage()`. Example: `GET /locations/india` ([full response](./api-contract/examples/get-india-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Architects & Interior Designers in Kerala, India | Katic Designs",
      "description": "Katic Designs serves clients across Kochi, Kerala and South India with architecture, in…"
    },
    "hero": {
      "image": {
        "src": "photos/pond-house-dusk",
        "alt": "House beside a pond at dusk"
      },
      "kicker": "KATIC · India",
      "title": {
        "lines": ["Designing Spaces."],
        "accent": "Building Possibilities.",
        "accentOnNewLine": true
      },
      "lead": "Architecture, interiors, construction and property care across Kerala and South India.",
      "primaryCta": {
        "kind": "link",
        "label": "Explore Our Projects",
        "href": "/works#works-list"
      },
      "secondaryCta": {
        "kind": "contact",
        "label": "Start a Project"
      }
    },
    "blocks": [
      {
        "type": "split",
        "image": "{…}",
        "caption": "Courtyard light · Kochi",
        "kicker": "KATIC in South India",
        "title": ["Rooted in Kochi.", "Growing across", "… 1 more"],
        "lead": "Our established office in Kochi serves clients across Kerala, and we are expanding into…",
        "body": "Regional service coverage is shown separately from our physical offices — we take on pr…"
      },
      {
        "type": "cards",
        "header": "{…}",
        "columns": 3,
        "items": ["{…}", "{…}", "… 1 more"]
      },
      "… 5 more"
    ],
    "contact": {
      "id": "india-contact",
      "kicker": "Start your project",
      "heading": {
        "lines": ["Start Your Project"],
        "accent": "in India"
      },
      "lead": "For clients in Kerala, Tamil Nadu, Karnataka and other serviceable locations.",
      "channels": ["email", "phone", "… 1 more"],
      "form": {
        "service": "{…}",
        "extraFields": ["{…}", "{…}"],
        "prefillLocation": "India"
      }
    }
  }
}
```

### `GET /locations/dubai`

The Dubai location page. Repository: `getDubaiPage()`. Example: `GET /locations/dubai` ([full response](./api-contract/examples/get-dubai-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Architects & Interior Designers in Dubai, UAE | Katic Designs",
      "description": "Architecture, interior design, construction and turnkey projects for residential and co…"
    },
    "hero": {
      "image": {
        "src": "photos/villa-pool-skyline-dusk",
        "alt": "Modern villa and infinity pool with the Dubai skyline at dusk"
      },
      "kicker": "Katic Designs · Dubai",
      "title": {
        "lines": ["Architecture &", "Interior Design in"],
        "accent": "Dubai.",
        "accentOnNewLine": true
      },
      "lead": "Katic Designs creates residential and commercial spaces in Dubai through architecture, …",
      "primaryCta": {
        "kind": "contact",
        "label": "Start a Project",
        "href": "#dubai-contact"
      },
      "secondaryCta": {
        "kind": "link",
        "label": "Explore Our Services",
        "href": "/services"
      },
      "bar": {
        "label": "UAE · RESIDENTIAL · COMMERCIAL",
        "scroll": "{…}"
      }
    },
    "blocks": [
      {
        "type": "dubaiContext",
        "id": "dubai-context",
        "image": "{…}",
        "caption": ["CLIMATE-AWARE LIVING", "Dubai, UAE"],
        "kicker": "KATIC in Dubai",
        "title": ["KATIC in", "Dubai."],
        "body": "KATIC brings its integrated design-and-build practice to Dubai, with a local presence a…",
        "cta": "{…}"
      },
      {
        "type": "related",
        "header": "{…}",
        "columns": 4,
        "services": ["architecture", "interior", "… 5 more"]
      },
      "… 6 more"
    ],
    "contact": {
      "kicker": "Start your project",
      "heading": {
        "lines": ["Start Your Project"],
        "accent": "in Dubai or India"
      },
      "lead": "For projects in Dubai and the UAE, and for Dubai-based clients building across India.",
      "channels": ["email", "phone", "… 1 more"],
      "form": {
        "service": "{…}",
        "extraFields": ["{…}", "{…}"],
        "prefillLocation": "Dubai, UAE"
      }
    }
  }
}
```

### `GET /project-pages`

Slugs of the projects that have a detail page (/works/{slug}). Repository: `listProjectPageSlugs()`. Example: `GET /project-pages` ([full response](./api-contract/examples/list-project-page-slugs.json), [schema](./api-contract/schemas/list-project-page-slugs.json)).

```json
{
  "data": ["the-courtyard-house"]
}
```

### `GET /projects/{slug}/page`

A project's detail page (case study). Repository: `getProjectPage()`. Example: `GET /projects/the-courtyard-house/page` ([full response](./api-contract/examples/get-project-page.json)).

```json
{
  "data": {
    "slug": "the-courtyard-house",
    "seo": {
      "title": "The Courtyard House, Kochi | Project by Katic Designs",
      "description": "A multi-generational family home in Kochi organised around a planted courtyard, designe…"
    },
    "hero": {
      "image": {
        "src": "photos/courtyard-house-reflection-dusk",
        "alt": "The Courtyard House reflected in its pool at dusk"
      },
      "objectPosition": "center 60%",
      "title": {
        "lines": ["The Courtyard"],
        "accent": "House"
      },
      "location": "Kakkanad, Kochi, Kerala",
      "galleryLabel": "VIEW GALLERY",
      "sectorLine": "RESIDENTIAL ARCHITECTURE · 2025"
    },
    "overview": {
      "kicker": "Project overview",
      "title": ["A calm home", "shaped around", "… 2 more"],
      "intro": "The Courtyard House is a 4,850 sq ft contemporary residence in Kakkanad, Kochi, designe…",
      "facts": ["{…}", "{…}", "… 3 more"],
      "images": ["{…}", "{…}"],
      "caption": "Architecture grounded in climate, context and daily life.",
      "cta": {
        "label": "Explore Service",
        "href": "/services/architecture"
      }
    },
    "designResponse": {
      "kicker": "Design response",
      "title": ["An inward-", "looking plan,", "… 2 more"],
      "paragraphs": [
        "Rather than place rooms along a corridor, the plan wraps daily life around the planted …"
      ],
      "mainImage": {
        "src": "photos/double-height-living-stair",
        "alt": "Double-height living room with an open stair"
      },
      "planning": {
        "kicker": "Planning + climate",
        "title": "Living and dining occupy the breezy south edge; service rooms buffer heat to the west.",
        "text": "Bedrooms sit above the quieter garden side. A bridge across the courtyard makes every m…",
        "image": "{…}"
      },
      "points": ["{…}", "{…}", "… 1 more"],
      "statement": "From climate study and adjacency mapping to material mock-ups and site detailing.",
      "cta": {
        "label": "Our Process",
        "href": "/services/architecture#process"
      }
    },
    "brief": {
      "kicker": "The brief",
      "title": ["A private family", "home that still", "… 2 more"],
      "paragraphs": [
        "The clients asked for a durable, low-maintenance home for three generations: generous s…",
        "The 14-cent site sits on a busy residential road and falls gently toward the south. Clo…"
      ],
      "objective": "The objective was simple: make a house that feels sheltered from the city, yet never cl…",
      "images": ["{…}", "{…}"]
    },
    "materials": {
      "kicker": "Architecture, interiors & materials",
      "title": ["Quiet materials.", "Precise junctions.", "… 2 more"],
      "paragraphs": [
        "The exterior is composed as a series of shaded volumes rather than a single object. Pal…",
        "Inside, the palette becomes warmer and more tactile. Kota stone runs through the ground…"
      ],
      "images": ["{…}", "{…}"],
      "materials": ["{…}", "{…}", "… 2 more"],
      "statement": "A single design language carried from the building envelope to the smallest fitted detail.",
      "cta": {
        "label": "Explore Service",
        "href": "/services/architecture"
      }
    },
    "gallery": {
      "kicker": "Project gallery",
      "title": ["The Courtyard House,", "from morning light", "… 1 more"],
      "viewsLabel": "10 VIEWS · KAKKANAD, KOCHI",
      "rows": ["{…}", "{…}", "… 3 more"]
    },
    "related": {
      "kicker": "Related projects",
      "title": ["Homes shaped by", "climate, privacy", "… 1 more"],
      "lead": "Explore residential architecture and interior projects across Kochi and its surrounding…",
      "projects": ["{…}", "{…}", "… 2 more"],
      "moreLabel": "VIEW PROJECT"
    },
    "cta": {
      "image": {
        "src": "photos/brick-courtyard-house-dusk-panorama",
        "alt": "Brick courtyard house and lit garden at dusk"
      },
      "kicker": "Begin a conversation",
      "title": ["Planning a Similar", "Project?"],
      "text": "Tell us about your site, the way your family lives, and what you hope the project can b…",
      "label": "Discuss Your Project"
    }
  }
}
```

### `GET /pages/works`

The /works page. Repository: `getWorksPage()`. Example: `GET /pages/works` ([full response](./api-contract/examples/get-works-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Architecture & Interior Design Projects | Portfolio | Katic Designs",
      "description": "Residential, commercial, institutional and hospitality projects by Katic Designs across…"
    },
    "hero": {
      "image": {
        "src": "photos/dark-lounge-interior",
        "alt": "Dark lounge interior with artwork"
      },
      "kicker": "KATIC Projects · Kerala & UAE",
      "title": ["Built Ideas.", "{…}"],
      "lead": "Explore architecture, interiors and construction projects across Kerala and UAE.",
      "cta": {
        "label": "Explore Projects",
        "href": "/works#works-list"
      },
      "current": {
        "project": "the-courtyard-house",
        "label": "Courtyard House",
        "meta": "Kochi, Kerala · 2025"
      }
    },
    "featured": {
      "kicker": "Featured projects",
      "title": ["A home shaped by", "light, shade and", "… 1 more"],
      "text": "Our featured work pairs rigorous architecture with tactile interiors—designed as one co…",
      "project": "the-courtyard-house",
      "name": "The Rain Court House",
      "image": {
        "src": "photos/house-reflecting-pool-garden",
        "alt": "House with a long reflecting pool through the garden"
      },
      "tag": "Signature Residence · 2025",
      "code": "KD / 024",
      "crumb": ["KOCHI", "RESIDENTIAL", "… 1 more"],
      "heading": "Quiet rooms gather around a living courtyard.",
      "description": "Designed for a multi-generational family, the residence turns inward to a rain garden t…",
      "cta": "View Project",
      "stats": ["{…}", "{…}", "… 1 more"]
    },
    "sectors": {
      "kicker": "Project categories",
      "title": ["Four sectors.", "One standard."],
      "lead": "Browse our work by sector — each opens a filtered portfolio.",
      "sectors": ["residential", "commercial", "… 2 more"]
    },
    "portfolio": {
      "kicker": "Portfolio · Filter & explore",
      "title": ["Places with", "purpose. Details", "… 2 more"],
      "text": "Browse a considered portfolio of residences, workplaces and hospitality spaces across K…",
      "filters": ["{…}", "{…}", "… 6 more"],
      "filtersLabel": "Filter projects by category",
      "projects": ["palm-veil-residence", "cinder-house", "… 6 more"],
      "cardLinkLabel": "View Project"
    },
    "caseStudy": {
      "project": "the-courtyard-house",
      "image": {
        "src": "photos/brick-courtyard-house-dusk",
        "alt": "Brick courtyard house lit at dusk around a planted courtyard"
      },
      "caption": "Kakkanad · Kochi",
      "kicker": "Selected case study",
      "title": ["The Courtyard", "House"],
      "lead": "Concept: a calm family home organised around a planted courtyard that draws light, rain…",
      "body": [
        "{…}",
        " a narrow, busy-road site with close neighbours, strong western heat and heavy monsoon …",
        "… 2 more"
      ],
      "facts": ["Kakkanad, Kochi", "4,850 sq ft", "… 2 more"],
      "cta": "View Case Study"
    },
    "capabilities": {
      "kicker": "Our capabilities",
      "title": ["Architecture,", "interior design,", "… 2 more"],
      "text": "One integrated practice. Four disciplines working together to keep the original idea in…",
      "cards": ["{…}", "{…}", "… 2 more"],
      "cardLinkLabel": "Explore Service"
    },
    "divisions": {
      "kicker": "Explore divisions",
      "title": ["One vision.", "Five divisions."],
      "divisions": ["design", "interior", "… 3 more"]
    },
    "cta": {
      "image": {
        "src": "photos/pavilion-house-night",
        "alt": "Glass pavilion house glowing at night"
      },
      "kicker": "Start a project",
      "title": ["Your project could be", "next."],
      "text": "Tell us what you want to build, where you are, and what matters most. We’ll bring the r…",
      "cta": {
        "label": "Start Your Project",
        "href": "/#start"
      },
      "call": {
        "label": "PREFER TO CALL?",
        "phone": "{…}",
        "hours": "Mon—Sat · 9:30 AM—6:30 PM IST"
      }
    }
  }
}
```

### `GET /post-categories`

Blog categories (name and slug). Repository: `listPostCategories()`. Example: `GET /post-categories` ([full response](./api-contract/examples/list-post-categories.json)).

```json
{
  "data": [
    {
      "name": "Architecture",
      "slug": "architecture"
    },
    {
      "name": "Interior Design",
      "slug": "interior-design"
    },
    "… 7 more"
  ]
}
```

### `GET /posts?category=`

Posts newest first; `?category=` is a category slug. Repository: `listPosts()`. Example: `GET /posts` ([full response](./api-contract/examples/list-posts.json)).

```json
{
  "data": [
    {
      "slug": "designing-for-kerala-monsoon",
      "title": "Designing Homes for the Kerala Monsoon",
      "category": "Architecture",
      "publishedAt": "2026-10-14",
      "views": 940,
      "cover": "photos/house-rain-garden",
      "author": "KATIC Design Studio",
      "excerpt": "Deep eaves, raised plinths and planted courtyards: how architecture can welcome the rai…",
      "body": ["{…}", "{…}", "… 6 more"]
    },
    {
      "slug": "planning-an-interior-that-lasts",
      "title": "Planning an Interior That Lasts",
      "category": "Interior Design",
      "publishedAt": "2026-10-02",
      "views": 820,
      "cover": "photos/sofa-jali-detail",
      "author": "KATIC Interior",
      "excerpt": "Five decisions that make the difference between an interior that dates quickly and one …",
      "body": ["{…}", "{…}", "… 6 more"]
    },
    "… 7 more"
  ]
}
```

### `GET /posts/{slug}`

One article. Repository: `getPost()`. Example: `GET /posts/designing-for-kerala-monsoon` ([full response](./api-contract/examples/get-post.json)).

```json
{
  "data": {
    "slug": "designing-for-kerala-monsoon",
    "title": "Designing Homes for the Kerala Monsoon",
    "category": "Architecture",
    "publishedAt": "2026-10-14",
    "views": 940,
    "cover": "photos/house-rain-garden",
    "author": "KATIC Design Studio",
    "excerpt": "Deep eaves, raised plinths and planted courtyards: how architecture can welcome the rai…",
    "body": [
      {
        "type": "p",
        "text": "For four months a year, Kerala homes live with heavy rain, high humidity and soft, diff…"
      },
      {
        "type": "h",
        "text": "Start with the roof"
      },
      "… 6 more"
    ]
  }
}
```

### `GET /pages/blog`

Copy of the blog listing and article templates. Repository: `getBlogPage()`. Example: `GET /pages/blog` ([full response](./api-contract/examples/get-blog-page.json)).

```json
{
  "data": {
    "page": {
      "seo": {
        "title": "Architecture & Interior Design Blog | Katic Designs",
        "description": "Ideas on architecture, interiors, materials, construction and caring for homes in Keral…"
      },
      "hero": {
        "image": "photos/brick-courtyard-house-dusk-panorama",
        "kicker": "Journal",
        "title": "{…}",
        "lead": "Notes on architecture, interiors, materials, construction and caring for the spaces we …"
      },
      "listHeading": "Articles",
      "categoriesLabel": "Blog categories",
      "allCategories": "All",
      "readMore": "Read Article",
      "loadMore": "Load More Articles",
      "pageSize": 6,
      "pageStep": 3
    },
    "article": {
      "breadcrumb": "Blog",
      "byline": "By",
      "latestHeading": "Latest articles",
      "latestCount": 4,
      "allArticles": "All Articles",
      "closing": {
        "prompt": "Planning a project?",
        "link": "Talk to the KATIC team"
      }
    }
  }
}
```

### `GET /news`

News items newest first. Repository: `listNews()`. Example: `GET /news` ([full response](./api-contract/examples/list-news.json)).

```json
{
  "data": [
    {
      "slug": "dubai-design-studio",
      "title": "KATIC opens its Dubai design studio",
      "excerpt": "A dedicated team in Dubai now supports clients across the UAE, backed by our design and…",
      "category": "Studio",
      "date": "2026-10-28",
      "image": "photos/brick-courtyard-house-dusk",
      "featured": true
    },
    {
      "slug": "courtyard-house-kochi-handed-over",
      "title": "Courtyard House, Kochi handed over",
      "excerpt": "A three-generation family home organised around a planted courtyard is complete and occ…",
      "category": "Project",
      "date": "2026-10-14",
      "image": "photos/modern-house-rain-dusk"
    },
    "… 4 more"
  ]
}
```

### `GET /pages/news`

The /news page. Repository: `getNewsPage()`. Example: `GET /pages/news` ([full response](./api-contract/examples/get-news-page.json)).

```json
{
  "data": {
    "hero": {
      "image": {
        "src": "photos/modern-house-rain-dusk",
        "alt": "Modern house on a rain-soaked evening"
      },
      "kicker": "News & updates",
      "title": {
        "lines": ["News from"],
        "accent": "KATIC"
      },
      "lead": "Studio announcements, completed projects and updates from our design, interiors, constr…"
    },
    "list": {
      "id": "news-list",
      "kicker": "Latest",
      "title": ["What’s new", "at KATIC"],
      "lead": {
        "before": "For press and media enquiries, write to us at ",
        "after": "."
      },
      "readMore": "Read more",
      "empty": "There is no news to share yet. Please check back soon."
    },
    "seo": {
      "title": "News & Updates | Katic Designs",
      "description": "Studio announcements, completed projects and updates from Katic Designs and its divisions."
    }
  }
}
```

### `GET /pages/home`

The home page sections. Repository: `getHomePage()`. Example: `GET /pages/home` ([full response](./api-contract/examples/get-home-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
      "description": "Katic Designs is an architecture, interior design and construction studio in Kochi, Ker…"
    },
    "hero": {
      "eyebrow": "Residential & Interior Design Studio",
      "title": ["Homes designed", "around how you", "… 1 more"],
      "lead": "From first sketch to final walkthrough, we shape houses in the mountains and beyond int…",
      "primaryCta": "Start a Project",
      "secondaryCta": "View Our Projects",
      "video": {
        "desktopSrc": "/video/hero-desktop.mp4",
        "mobileSrc": "/video/hero-mobile.mp4",
        "desktopPoster": "video/hero-poster-desktop",
        "mobilePoster": "video/hero-poster-mobile"
      }
    },
    "about": {
      "kicker": "About Katic Designs",
      "title": ["We Build", "{…}", "… 1 more"],
      "established": "EST. 2013 · KOCHI, KERALA",
      "paragraphs": [
        [
          "Founded in 2013 and headquartered in Kochi, Katic Designs is an architecture, interior …",
          "{…}"
        ],
        ["Every project begins with the same discipline — understand the site, harness natural li…"]
      ],
      "partnersKicker": "General Partners",
      "partners": ["{…}", "{…}", "… 2 more"],
      "cta": "About Us",
      "stats": ["{…}", "{…}", "… 2 more"],
      "values": ["{…}", "{…}", "… 3 more"]
    },
    "works": {
      "kicker": "Selected Works",
      "title": ["Selected", "Works"],
      "lead": "A selection of residential, commercial, and civic commissions delivered across Kerala a…",
      "cta": {
        "label": "View All Projects",
        "href": "/works"
      },
      "filters": ["{…}", "{…}", "… 4 more"],
      "projects": ["obsidian-lounge", "velvet-suite-penthouse", "… 9 more"],
      "cardLinkLabel": "View Project"
    },
    "explorer": {
      "kicker": "Our Services",
      "title": "Services",
      "lead": "One studio for every stage of your project — design, build, finish and care.",
      "allLabel": "Explore all services",
      "viewLabel": "View service",
      "quoteLabel": "Get a quote",
      "services": ["{…}", "{…}", "… 5 more"]
    },
    "process": {
      "kicker": "How A Landmark Gets Made",
      "title": ["Seven Stages,", "One Continuous Build"],
      "stages": ["{…}", "{…}", "… 5 more"]
    },
    "signature": {
      "kicker": "Step Inside",
      "title": ["Signature", "Project"],
      "text": "From the entrance to the last detail, each space is designed to work as one — kitchen, …",
      "cta": "View Project",
      "projectSlug": "the-courtyard-house",
      "background": {
        "image": "photos/villa-pool-mountains",
        "alt": "Villa exterior with private pool"
      },
      "pill": "Signature Project",
      "rooms": ["{…}", "{…}", "… 2 more"]
    },
    "divisions": {
      "kicker": "Our Divisions",
      "titleLines": ["One vision.", "Five divisions."],
      "lead": "Specialist teams for design, interiors, construction, development and care — working to…",
      "cta": {
        "label": "About Our Divisions",
        "href": "/about#about-divisions"
      },
      "exploreLabel": "Explore Division",
      "label": "Our divisions",
      "slides": ["{…}", "{…}", "… 3 more"]
    },
    "stories": {
      "kicker": "Client Stories",
      "titleLines": ["From Brief", "To Built"],
      "introLines": ["Direct feedback from the people we’ve built for —", "in their own words."],
      "pill": "CLIENT STORY",
      "cta": {
        "label": "VIEW ALL STORIES",
        "href": "/reviews"
      },
      "stories": ["{…}", "{…}", "… 2 more"]
    },
    "blogTeaser": {
      "kicker": "Latest from the blog",
      "title": ["Ideas on", "building well"],
      "lead": "Notes on architecture, interiors, materials, construction and caring for the spaces we …",
      "cta": "View All Articles",
      "featuredLabel": "Featured",
      "readMore": "Read Article"
    },
    "newsTeaser": {
      "kicker": "In the news",
      "title": ["Latest from", "KATIC"],
      "lead": "Studio updates, completed projects and announcements from across our divisions.",
      "cta": "View All News",
      "readMore": "Read more"
    },
    "contact": {
      "kicker": "Get in Touch",
      "heading": {
        "lines": ["Have a Project in", "Mind?"]
      },
      "lead": "Tell us a little about your site, timeline, and the service you need — we’ll get back t…",
      "channels": ["email", "phone"],
      "form": {
        "service": "{…}"
      },
      "faq": {
        "kicker": "Questions, answered",
        "titleLines": ["Frequently asked", "questions"],
        "items": ["{…}", "{…}", "… 4 more"]
      }
    }
  }
}
```

### `GET /pages/about`

The /about page sections. Repository: `getAboutPage()`. Example: `GET /pages/about` ([full response](./api-contract/examples/get-about-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "About Katic Designs | Architecture & Interior Design Studio, Kochi",
      "description": "Founded in 2013 in Kochi, Katic Designs brings architects, interior designers and site …"
    },
    "hero": {
      "image": {
        "src": "photos/design-studio-3d-model",
        "alt": "Design workstation showing a 3D building model"
      },
      "kicker": "Katic Designs · Kerala & UAE",
      "title": ["Designing Spaces.", "Shaping", "… 1 more"],
      "lead": "Katic Designs is an architecture, interior design and construction practice creating th…",
      "primaryCta": {
        "label": "Explore Our Approach",
        "href": "/about#about-approach"
      },
      "secondaryCta": {
        "label": "View Our Projects",
        "href": "/works#works-list"
      },
      "labels": ["ABOUT \\ 01", "OUR STORY ↓"]
    },
    "intro": {
      "kicker": "Who we are",
      "title": ["Architecture With", "Purpose"],
      "lead": "We believe good design begins with understanding people, place and how a space will be …",
      "body": "KATIC brings architecture, interiors, construction, development and property care toget…",
      "cta": {
        "label": "Meet the Founder",
        "href": "/about#about-founder"
      },
      "images": ["{…}", "{…}"],
      "studio": {
        "label": "STUDIO",
        "text": "One team. One vision. Every detail connected.",
        "places": "Kochi · Kannur · Dubai"
      }
    },
    "philosophy": {
      "kicker": "Our Philosophy",
      "title": "Designed Around You",
      "image": {
        "src": "photos/open-pavilion-lounge-night",
        "alt": "Open timber pavilion lounge at night"
      },
      "caption": "Light · Material · Proportion",
      "lead": "Our design philosophy balances functionality, character, comfort, context and timeless …",
      "body": "Every plan is tested against daily life: how morning light enters, how people move, whe…",
      "tags": ["FUNCTIONALITY", "CHARACTER", "… 3 more"],
      "cta": {
        "label": "Our Approach",
        "href": "/about#about-approach"
      }
    },
    "approach": {
      "kicker": "Our approach",
      "title": ["From Vision", "to Reality"],
      "lead": "Our master process summarised in five stages — the same discipline on every project, wh…",
      "cta": {
        "label": "See the Full Process",
        "href": "/#home-process",
        "variant": "dark"
      },
      "steps": ["{…}", "{…}", "… 3 more"]
    },
    "services": {
      "kicker": "Our services",
      "title": ["Everything your project", "needs. Under one roof."],
      "lead": "Seven services, one team and one point of responsibility.",
      "cta": {
        "label": "Explore All Services",
        "href": "/services",
        "variant": "outline"
      },
      "items": ["architecture", "interior", "… 5 more"]
    },
    "divisions": {
      "kicker": "Our divisions",
      "title": ["One vision.", "Five divisions."],
      "lead": "Specialist divisions that work together on every KATIC project.",
      "items": ["design", "interior", "… 3 more"]
    },
    "founder": {
      "kicker": "Founder’s note · The vision behind KATIC",
      "name": "FOUNDER NAME",
      "role": "FOUNDER & PRINCIPAL ARCHITECT",
      "paragraphs": [
        "Founder Name leads Katic Designs with a people-, place-, and detail-focused approach ac…",
        "The practice is built around listening, site sensitivity, and a calm, consistent archit…"
      ],
      "quote": "“Our vision is simple: one team that designs, builds and cares for spaces people are pr…",
      "photo": {
        "src": "people/founder",
        "alt": "Portrait of the founder in the studio"
      }
    },
    "experience": {
      "kicker": "Built on experience",
      "title": ["Built on", "Experience"],
      "lead": "Experience across residential, commercial and interior projects in Kerala and UAE.",
      "cta": {
        "label": "View Projects",
        "href": "/works#works-list"
      },
      "stats": ["{…}", "{…}", "… 2 more"]
    },
    "team": {
      "kicker": "Management team",
      "title": ["The People Behind", "the Vision"],
      "body": "The people guiding strategy, design direction and delivery across Kerala and the UAE.",
      "members": ["{…}", "{…}", "… 2 more"]
    },
    "works": {
      "kicker": "Selected works",
      "title": "OUR WORK SPEAKS",
      "body": "Homes, workplaces and interiors united by clarity, craft and the way people truly live.",
      "cta": {
        "label": "View All Projects",
        "href": "/works#works-list"
      },
      "tiles": ["{…}", "{…}", "… 2 more"]
    }
  }
}
```

### `GET /pages/reviews`

The /reviews page sections. Repository: `getReviewsPage()`. Example: `GET /pages/reviews` ([full response](./api-contract/examples/get-reviews-page.json)).

```json
{
  "data": {
    "seo": {
      "title": "Client Reviews & Testimonials | Katic Designs",
      "description": "What homeowners and businesses say about working with Katic Designs on design and build…"
    },
    "hero": {
      "image": {
        "src": "photos/dark-lounge-interior",
        "alt": "Dark lounge interior with artwork"
      },
      "kicker": "Client experiences",
      "title": {
        "lines": ["Spaces That Speak", "for"],
        "accent": "Themselves."
      },
      "lead": "Hear from clients who worked with Katic Designs across architecture, interiors and cons…",
      "cta": {
        "label": "Start Your Project",
        "href": "/#start"
      }
    },
    "trust": {
      "kicker": "A considered way of working",
      "title": ["Built on trust.", "Defined by", "… 1 more"],
      "text": "Every project is a collaboration. From the first conversation to the final detail, we w…",
      "cta": {
        "label": "About Katic",
        "href": "/about"
      },
      "image": {
        "src": "photos/open-pavilion-lounge-night",
        "alt": "Open timber pavilion lounge at night"
      },
      "caption": {
        "label": "SPACES MADE PERSONAL",
        "text": "A warm, lived-in interior shaped around everyday rituals."
      }
    },
    "clients": {
      "kicker": "Representative client experiences • copy pending approval",
      "title": ["What our clients", "say"],
      "text": "Thoughtful partnerships, described through anonymized representative experiences across…",
      "testimonials": ["home-kochi", "ernakulam", "… 4 more"],
      "note": "Representative testimonials — replace with approved client copy before publication.",
      "cta": {
        "label": "View Our Work",
        "href": "/works#works-list"
      }
    },
    "expertise": {
      "kicker": "Reviews by expertise",
      "title": ["Experience across", "every discipline"],
      "cta": {
        "label": "Explore Services",
        "href": "/services"
      },
      "cards": ["{…}", "{…}", "… 2 more"]
    },
    "story": {
      "kicker": "Featured representative story • pending client approval",
      "title": ["From brief to built"],
      "facts": ["PRIVATE FAMILY RESIDENCE", "ARCHITECTURE + INTERIORS", "… 1 more"],
      "images": ["{…}", "{…}", "… 2 more"],
      "quote": "“We wanted a home that could feel calm every day, welcome our extended family, and stil…",
      "attribution": "— Homeowner · Representative testimonial pending approval",
      "rows": ["{…}", "{…}", "… 1 more"],
      "cta": {
        "label": "View Project",
        "href": "/works/the-courtyard-house"
      }
    },
    "projects": {
      "kicker": "Projects behind the reviews",
      "title": ["See the spaces. Meet", "the stories."],
      "text": "A selection of completed spaces connected to the representative experiences shared above.",
      "cta": {
        "label": "Explore Our Work",
        "href": "/works#works-list"
      },
      "projects": ["courtyard-residence", "garden-house", "… 4 more"]
    },
    "cta": {
      "image": {
        "src": "photos/garden-room-window-seat",
        "alt": "Garden room with tall timber windows, built-in seating and tropical planting"
      },
      "kicker": "Begin a conversation",
      "title": ["Ready to Create Your", "Own Space?"],
      "text": "Tell us about your project and let’s start a conversation.",
      "cta": {
        "label": "Start Your Project",
        "href": "/#start"
      }
    }
  }
}
```

### `GET /pages/thank-you`

The /thank-you page copy. Repository: `getThankYouPage()`. Example: `GET /pages/thank-you` ([full response](./api-contract/examples/get-thank-you-page.json)).

```json
{
  "data": {
    "title": ["Thank you.", "We’ve received", "… 1 more"],
    "lead": "Your message has reached the KATIC team.",
    "sourceLabel": "Source:",
    "serviceLabel": "Service:",
    "steps": [
      {
        "icon": "message",
        "title": "What happens next",
        "text": "A member of our team reviews your enquiry and calls or emails you to arrange a first co…"
      },
      {
        "icon": "clock",
        "title": "Response time",
        "text": "We reply within one business day (Mon–Sat, 9:30 AM–6:30 PM IST)."
      },
      "… 1 more"
    ],
    "fallback": {
      "message": "We couldn’t reach our server just now, so your enquiry may not have reached us. To be s…",
      "email": "Send by email",
      "copy": "Copy my details",
      "copied": "Copied"
    },
    "whatsapp": "Continue on WhatsApp",
    "back": "Back to Previous Page",
    "projects": {
      "label": "Explore Projects",
      "href": "/works#works-list"
    },
    "seo": {
      "title": "Thank You | Katic Designs",
      "description": "Thank you for your enquiry. A member of the Katic Designs team will be in touch within …"
    }
  }
}
```

<!-- api-contract:generated:end -->
