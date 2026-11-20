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
<!-- api-contract:generated:end -->
