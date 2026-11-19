# Katic Designs: HTML → Next.js Migration Plan

> **Source:** `https://ateliertest.in/works/katic/katic-designs%20final.html` (one 16 MB HTML file).
> **Target:** Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS v4. The front end is built first. A Laravel API replaces the static content layer later.
> **Bar:** pixel-perfect parity with the original in layout, typography, motion and interaction, with the inherited bugs fixed and recorded in [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md).

Supporting specs (written from a line-by-line audit of the source and browser rendering):

| Doc                                                                                                  | Covers                                                                                                                                |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [`analysis/01-global-design-system-and-engine.md`](./analysis/01-global-design-system-and-engine.md) | Tokens, fonts, the `--z` zoom model, header/footer/shell, component inventory, **animation catalogue E1–E44**, router, forms, JSON-LD |
| [`analysis/02-home-about-services.md`](./analysis/02-home-about-services.md)                         | Home, About, Services: section-by-section, computed colours/heights, data types                                                       |
| [`analysis/03-service-pages.md`](./analysis/03-service-pages.md)                                     | 8 service-detail pages, the shared section vocabulary, `ServicePageContent` schema                                                    |
| [`analysis/04-works-divisions-content.md`](./analysis/04-works-divisions-content.md)                 | Works, project, divisions, news, blog, article, India/Dubai, reviews, thank-you, data models, legacy hash map                         |
| [`analysis/05-visual-qa.md`](./analysis/05-visual-qa.md)                                             | Browser-rendered QA: overflow and layout bugs per route and width                                                                     |

Line numbers in those docs refer to `reference/original/katic-designs-final.stripped.html`, a copy of the source with base64 blobs removed. The full original, the extracted assets (136 WebP images, 8 WOFF2 fonts, 2 hero videos) and the reference screenshots live in `reference/`. That folder is git-ignored.

---

## 1. What the original actually is

The site is a **single-document SPA with hash routing.** Each "page" is a `<section class="page" id="p-…">` that is shown or hidden by a ~900-line inline script (`show()`), which also rewrites `<title>`, meta tags and the canonical URL.

**There are 24 page templates and 33 public URLs** once dynamic pages are expanded:

| #     | Original hash                                                                     | Page                                    | New route                            | Template                                    |
| ----- | --------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------ | ------------------------------------------- |
| 1     | `#home`                                                                           | Home                                    | `/`                                  | Bespoke (most complex)                      |
| 2     | `#about`                                                                          | About                                   | `/about`                             | Bespoke                                     |
| 3     | `#services`                                                                       | Services overview                       | `/services`                          | Bespoke                                     |
| 4     | `#architecture`                                                                   | Architectural Design                    | `/services/architecture`             | ServicePage (with architecture-only blocks) |
| 5     | `#interior`                                                                       | Interior Design                         | `/services/interior`                 | ServicePage                                 |
| 6     | `#factory`                                                                        | Furniture & Joinery Factory             | `/services/factory`                  | ServicePage                                 |
| 7     | `#construction`                                                                   | Construction & Execution                | `/services/construction`             | ServicePage                                 |
| 8     | `#turnkey`                                                                        | Turnkey Projects                        | `/services/turnkey`                  | ServicePage                                 |
| 9     | `#renovation`                                                                     | Renovation & Remodeling                 | `/services/renovation`               | ServicePage (+ before/after)                |
| 10    | `#exterior`                                                                       | Exterior & Landscape                    | `/services/exterior`                 | ServicePage                                 |
| 11    | `#property-care`                                                                  | Property Care                           | `/services/property-care`            | ServicePage                                 |
| 12    | `#works`                                                                          | Works / portfolio                       | `/works` (`?category=`)              | Bespoke + filter                            |
| 13    | `#project`                                                                        | Project detail (one hard-coded project) | `/works/[slug]`                      | ProjectPage (dynamic)                       |
| 14–18 | `#div-design` `#div-interior` `#div-infrastructure` `#div-developers` `#div-care` | 5 divisions                             | `/divisions/[slug]`                  | DivisionPage (block-composed)               |
| 19    | `#news`                                                                           | News                                    | `/news`                              | Listing                                     |
| 20    | `#blog` (`/blog-list/<cat>`)                                                      | Blog                                    | `/blog`, `/blog/category/[category]` | Listing (JS-rendered in original)           |
| 21    | `#article/<slug>`                                                                 | Blog article                            | `/blog/[slug]`                       | ArticlePage (9 posts)                       |
| 22    | `#india` (alias `#kochi`)                                                         | India location                          | `/locations/india`                   | LocationPage (block-composed)               |
| 23    | `#dubai`                                                                          | Dubai location                          | `/locations/dubai`                   | LocationPage (+ bespoke hero/office/mosaic) |
| 24    | `#reviews`                                                                        | Reviews                                 | `/reviews`                           | Bespoke                                     |
| 25    | `#thank-you`                                                                      | Form confirmation                       | `/thank-you` (`noindex`)             | Bespoke                                     |

`#contact` is not a page. It scrolls to the current page's contact section, or to the home one if the page has none. We keep that behaviour, and the "Start a project" popup modal is a global overlay.

### Facts that shape the build

1. **Desktop is one fixed 1440px composition, scaled.** At ≥1100px, JS sets `--z = clientWidth / 1440` and CSS applies `zoom: var(--z)` to the page. Below 1100px the site switches to ordinary responsive rules at 1099 / 860 / 420. **We keep this model** (see §3, D1), because it is the only way to get true parity.
2. **What renders is not what the page CSS says.** About 800 lines of generated `data-fx` colour overrides, global `!important` rules and a runtime "contrast fixer" script flip section colours. Every section ends up strictly **pure white or pure black, alternating**. The spec is therefore the **computed output** (captured in the analysis docs and screenshots), not the source CSS. In React this becomes a single `tone` per section, derived from its position.
3. **Desktop sections are one screen tall** (`min-height: 100svh` in design px, content centred), and a `fit()` script shrinks a section's content with `zoom` (down to 0.66) when it overflows.
4. **Motion is concentrated on Home:**
   - two pinned scroll-scrub sections (an 11-card cover-flow works showcase; a 7-stage horizontal process);
   - an auto-advancing services explorer (6s) and divisions carousel (5s);
   - a logo marquee, a quote rotator, a hero video with separate desktop and mobile cuts, reveal-on-scroll, and count-ups.

   Site-wide, there are procedurally generated **isometric SVG line-art drawings** (process stages and about 60 feature icons) that draw themselves in, plus parallax images, a lightbox, an FAQ accordion, the header scroll state and the mobile CTA bar.

5. **About 40% of the shipped CSS/JS is dead code.** That includes old carousels, tabs, drag-scroll and plant sway animations that are disabled by a later `!important`. We port only what renders (catalogue E1–E44 marks each effect live or dead).
6. **All content is hard-coded**, with lots of placeholder copy (phone `+1 (000) 000-0000`, "FOUNDER NAME", designer-brief sentences shown as UI text). Content moves to a typed data layer that Laravel will later serve.

---

## 2. Tech stack

| Concern         | Choice                                                                                                                                                              | Why                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Framework       | **Next.js (latest stable, App Router)**, React Server Components by default                                                                                         | SSG for every page, real URLs, `generateMetadata`, ready for ISR when Laravel arrives                         |
| Language        | **TypeScript `strict`**, plus `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`                                                                           | Content schemas become compile-time contracts with the future API                                             |
| Styling         | **Tailwind CSS v4** (`@theme` tokens in CSS), with `clsx` + `tailwind-merge` (`cn()`) and `cva` for variants                                                        | Matches the token system; variants replace the source's class soup                                            |
| Motion          | **CSS keyframes/transitions + 3 small in-house hooks** (`useInView`, `useScrollProgress`, `useReducedMotion`). `motion` is added only if a specific effect needs it | The audit showed nothing needs GSAP or Lenis; this keeps the client bundle small                              |
| Fonts           | `next/font/google`: **Jost** (400/500/600/700) and **Inter** (400/500/600)                                                                                          | Same families as the source; the inlined source WOFF2s are aggressive subsets that are missing glyphs (₹ → ↗) |
| Images          | `next/image` with the extracted WebPs as static imports from `src/assets/images` (renamed from hash keys to semantic names; typed manifest `src/content/media.ts`)  | Responsive sizes, lazy loading, no 11 MB of base64                                                            |
| Video           | `public/video/hero-{desktop,mobile}.mp4` plus posters; `<HeroVideo>` picks the cut by media query and has a pause control                                           | Parity, plus a WCAG 2.2.2 fix                                                                                 |
| Forms           | React Hook Form + **Zod** (shared schema). Submit goes to a Next route handler `/api/leads`, which forwards to `LEADS_ENDPOINT` (Laravel later)                     | One validation schema on client and server; honeypot and rate limit server-side                               |
| Data            | `lib/data` **repository interface**: `StaticRepository` now (typed content in `src/content`), `LaravelRepository` later (fetch + Zod parse + cache tags)            | Pages never import raw data, so the backend swap touches one file                                             |
| Quality         | ESLint (next, typescript-eslint strict-type-checked, jsx-a11y), Prettier + Tailwind plugin, Husky + lint-staged, commitlint (Conventional Commits)                  | Senior-grade hygiene from commit one                                                                          |
| Testing         | **Playwright**: visual diff against the original, e2e flows, `@axe-core/playwright`. **Vitest**: hooks, scroll maths, legacy-hash mapper, Zod schemas               | Visual parity is proven by numbers, not opinion                                                               |
| Package manager | pnpm, Node 22 LTS (pinned via `.nvmrc` + `packageManager`)                                                                                                          | Reproducible installs                                                                                         |

---

## 3. Architecture decisions

These are my calls. Each is reversible. Flag any you disagree with before Phase 1.

| ID      | Decision                                                                                                                                                                                                                                                                                                           | Rationale                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1**  | **Keep the 1440px canvas + `zoom` model at ≥1100px.** `<ZoomRoot>` wraps header, main and footer. `--z` and `--svh` are set by an inline `<head>` script before first paint, then updated on resize. Overlays (rail, mobile CTA bar, popup, lightbox, toast) render **outside** the zoom root, as in the original. | Pixel parity at every desktop width with one set of px values. A fluid rewrite would never match. Risk: scroll maths under `zoom` differs in Chrome 128+, Safari and Firefox, so it is verified explicitly in Phase 3. |
| **D2**  | **Desktop is authored in px on the 1440 canvas; below 1100px it is desktop-first responsive** using Tailwind breakpoints `max-lg` (≤1099), `max-md` (≤860) and `max-xs` (≤420).                                                                                                                                    | Mirrors the source's media queries 1:1.                                                                                                                                                                                |
| **D3**  | **`tone` replaces the `data-fx` colour system.** `<SectionStack>` assigns `light`/`dark` alternately by index after the hero, with a `toneOverride` escape hatch. All text colours come from the tone.                                                                                                             | Deletes about 800 lines of fragile nth-child overrides and the runtime contrast fixer, with the same visual result.                                                                                                    |
| **D4**  | **Drop `fit()` auto-zoom.** Sections use `min-height` of one screen and simply grow when content is taller.                                                                                                                                                                                                        | `fit()` shrinks text to ~10px on short laptops and misaligns the gutters (visible on About at 1440×900). This is a bug fix, logged in KNOWN_ISSUES.                                                                    |
| **D5**  | **Real URLs and SSG for every page**, plus a `<LegacyHashRedirect>` client component that maps old `#page/anchor/filter` links to new routes (table in analysis/04 §13).                                                                                                                                           | Hash fragments never reach the server, so redirects must run client-side. Each page gets its own canonical URL and real SEO (the original's canonical is always the home page).                                        |
| **D6**  | **Content-first data layer:** every entity (Service, Division, Project, Post, NewsItem, Testimonial, FAQ, ProcessStage, TeamMember, SiteSettings) has one TS type + Zod schema, one source of truth, and is referenced by id/slug.                                                                                 | Fixes the many "same project, different facts on different pages" bugs, and maps 1:1 to Laravel resources later.                                                                                                       |
| **D7**  | **Reveal animations stay home-only** (as in the original). They are built as a reusable `<Reveal>` so they can be switched on per page later if the client asks.                                                                                                                                                   | Parity first; extension is a product decision.                                                                                                                                                                         |
| **D8**  | **Port the isometric line-art generator** (`KATIC_ART`, `KATIC_ICON`) as pure TS functions that render SVG on the server. Only the draw-on trigger is a client island.                                                                                                                                             | It is deterministic, so there is no reason to ship the generator to the browser. Each SVG also gets its own gradient id via `useId()` (fixes the duplicate `id="kg"` bug).                                             |
| **D9**  | **Server Components by default.** Client islands are limited to the list in analysis/01 §5 (Header, overlays, carousels, pinned sections, forms, lightbox, etc.).                                                                                                                                                  | Smallest JS payload and best Core Web Vitals.                                                                                                                                                                          |
| **D10** | **Placeholders become typed "pending" content.** Phone, WhatsApp, address and socials live in `SiteSettings`. Brief-style copy is kept but marked with `// TODO(content)` and listed in KNOWN_ISSUES for the client to supply.                                                                                     | We don't invent content. The site stays shippable and the gaps are visible.                                                                                                                                            |

---

## 4. Project structure

```
katicDesigns/
├── docs/                       # this plan, KNOWN_ISSUES, analysis specs, decision log
├── reference/                  # (git-ignored) original HTML, extracted assets, reference screenshots
├── public/
│   ├── video/hero-desktop.mp4, hero-mobile.mp4
│   └── brand/ (logo.svg once supplied, og-image)
├── src/
│   ├── assets/images/<folder>/<semantic-name>.webp   # static imports (DECISIONS P0-05)
│   ├── app/
│   │   ├── layout.tsx              # fonts, ZoomRoot + zoom bootstrap script, Header/Footer, overlays, JSON-LD Organization
│   │   ├── page.tsx                # Home
│   │   ├── about/ services/ services/[slug]/ works/ works/[slug]/ divisions/[slug]/
│   │   ├── news/ blog/ blog/category/[category]/ blog/[slug]/ locations/[slug]/ reviews/ thank-you/
│   │   ├── api/leads/route.ts      # validated lead intake → LEADS_ENDPOINT
│   │   ├── sitemap.ts robots.ts not-found.tsx opengraph-image.tsx
│   ├── components/
│   │   ├── shell/       Header, NavDropdown, MobileNav, Footer, ContactRail, MobileCtaBar, SkipLink, ZoomRoot, LegacyHashRedirect
│   │   ├── overlays/    StartProjectModal, Lightbox, Toast (+ providers)
│   │   ├── ui/          Button, Container, Kicker, Heading, Lead, Chip, TextLink, ArrowIcon, Plant, Icon
│   │   ├── sections/    PageHero, SectionStack, Section, SectionHeader, SplitFeature, RowList, FeatureGrid, ProcessSteps,
│   │   │                SectorGrid, CardGrid, Gallery, BeforeAfter, DivisionsStrip, Testimonials, ContactFaq, Faq, CtaBand,
│   │   │                Stats, NewsGrid, BlogList, ...
│   │   ├── home/        HeroVideo, PinnedShowcase, PinnedStages, ServicesExplorer, DivisionsCarousel, QuoteRotator, LogoMarquee
│   │   ├── motion/      Reveal, CountUp, ParallaxImage, DrawOn
│   │   ├── art/         IsoStage, IsoIcon (server-rendered SVG)
│   │   └── forms/       EnquiryForm, fields
│   ├── content/         site-settings.ts, navigation.ts, services/*.ts, divisions/*.ts, projects/*.ts, posts/*.ts, testimonials.ts, faqs.ts ...
│   ├── lib/
│   │   ├── data/        repository.ts (interface), static-repository.ts, laravel-repository.ts (Phase 11)
│   │   ├── schemas/     zod schemas = source of TS types (z.infer)
│   │   ├── art/         isometric.ts, stages.ts, icons.ts (ported generators)
│   │   ├── seo.ts, legacy-routes.ts, leads.ts, cn.ts
│   ├── hooks/           useInView, useScrollProgress, useReducedMotion, useScrolled, useMediaQuery
│   └── styles/globals.css  # @theme tokens, base layer, zoom rules, keyframes
├── tests/
│   ├── visual/          parity specs (original vs new) + config
│   ├── e2e/             navigation, forms, filters, overlays, legacy redirects
│   └── unit/            (Vitest) hooks, mappers, schemas
└── .github/workflows/ci.yml   # typecheck, lint, unit, build, e2e + visual + axe
```

---

## 5. Engineering standards (definition of done for every PR)

- **TypeScript:** no `any`, no non-null `!` without a comment, no `@ts-ignore`. Types are inferred from Zod schemas, not hand-duplicated.
- **Components:**
  - Server by default; `"use client"` only on the leaf that needs it.
  - Props are typed and documented, and variants go through `cva`.
  - No inline `style` except dynamic CSS variables (e.g. `--d` for stagger).
  - No magic numbers: design values come from tokens or are named constants next to the formula they feed (e.g. pinned-showcase `CARD_OFFSET = 640`).
- **Styling:** tokens only (colours, fonts, easings, durations). No `!important`. No global descendant selectors outside `globals.css` base and keyframes.
- **Accessibility:** semantic elements (buttons are `<button>`), labelled form controls, visible focus, `aria-expanded` on menus, dialog semantics + focus trap for the modal and lightbox, pause controls on anything that auto-advances, and every animation respects `prefers-reduced-motion` (subscribed live, not read once). axe must report zero serious or critical issues.
- **Performance budgets** (mobile, Lighthouse CI): LCP < 2.5s, CLS < 0.05, TBT < 200ms, first-load JS < 130 kB gz per route. Images always have dimensions and `sizes`.
- **Visual parity:** each page's sections are within the diff threshold against the original at 1440×900, 1024×768, 768×1024 and 390×844 (§7). Intentional differences are listed in KNOWN_ISSUES and masked in the test.
- **Git:** Conventional Commits, one page or feature per branch/PR, CI green before merge. Local git identity is HensalDeon; the remote is added by the repo owner.

---

## 6. Phased execution plan

Effort figures are rough single-developer estimates for planning, not quotes.

### Phase 0: Project setup and reference capture (~0.5 day) ✅ done 2026-11-19

- [x] Scaffold Next.js 16.4 + TS strict + Tailwind v4 with pnpm; add ESLint/Prettier/Husky/commitlint/Vitest/Playwright; CI workflow. Version pins and their reasons are in [DECISIONS.md](./DECISIONS.md) (P0-01…P0-04).
- [x] Write `docs/KNOWN_ISSUES.md` (done during planning; kept updated from here on).
- [x] **Reference tooling:**
  - `pnpm ref:extract` rebuilds `reference/original/` byte-identically;
  - `pnpm ref:serve` serves the original;
  - `pnpm ref:capture` (`tests/visual/capture-original.mts`) screenshots every route × 4 viewports **section by section** (reduced motion, images force-loaded), plus motion-on scrub frames for the two pinned Home sections. This is the parity baseline in `reference/baseline/`, local-only (P0-06).
- [x] Asset pipeline: `scripts/assets/media-map.ts` maps all 136 original keys to semantic ids (131 shipped, 5 unused). `pnpm assets:sync` copies them to `src/assets/images/` and generates the typed `src/content/media.ts` (static imports). Hero videos go to `public/video/`.

**Exit:** `pnpm dev` runs; CI passes on an empty app; baseline screenshots exist.

### Phase 1: Design system foundation (~1.5 days) ✅ done 2026-11-19

- [x] `globals.css` `@theme`, restricted to the design system (DECISIONS P1-01):
  - brand colours (`brand #E8622C`, `brand-text #C24E1E`, hover, ink, cream, lines);
  - tone-aware colours (`fg`, `fg-muted`, `fg-body`, `fg-mut`, `kicker`, `surface`) driven by `[data-tone]`;
  - Jost/Inter, the two easings, elevation tokens, `xs 421 / md 861 / lg 1100` breakpoints, 1268/1296 containers, and a 1px spacing unit.
- [x] Zoom: inline `<head>` script generated from `src/lib/zoom.ts`, a CSS fallback, and `.zoom-root` (P1-02). Unit tests cover the maths and the script itself. Verified at 1440/1920/390 with no console warnings.
- [x] Primitives in `src/components/ui`:
  - `Container`, `Section` (tone, `standard`/`home` rhythm, one-screen min-height, no auto-zoom per D4), `alternatingTone()`;
  - `Kicker`, `SectionTitle`, `HeroTitle`, `Accent`, `Lead`, `Body`;
  - `Button`/`ButtonLink` (7 colour variants × 5 sizes × 2 fonts, hover states), `MoreLink`, `UnderlineLink`, `Chip`, `Tag`, `Plant`;
  - icons: `ArrowIcon`, `ServiceIcon` (all 27 `.nico` icons, verbatim paths).
- [x] Dev-only `/styleguide` (`ENABLE_STYLEGUIDE=1` in production builds, `noindex`).
- [x] Parity proof: `tests/e2e/design-system.spec.ts` checks rendered styles against values measured on the original at 1440, 1024 and 390 (P1-03). It also locks in KI-N04, KI-L16 and KI-A11.

**Exit:** the styleguide matches the original's buttons and type at 1440 and 390, proven by the computed-style suite (10/10 green against a production build).

### Phase 2: Global shell and overlays (~2 days) ✅ done 2026-11-19

- [x] Typed content: `SITE` settings (contact, address, socials; placeholders flagged), `HEADER_NAV` and `FOOTER_COLUMNS`, `SERVICE_OPTIONS` with per-page preselection, and route builders (`src/lib/routes`).
- [x] **Header:**
  - fixed bar, compact after 40px;
  - hover/focus dropdowns with `aria-expanded`/`aria-controls`, Escape, and the original's `nohover` suppression after a click;
  - active item from the URL;
  - phone panel with tap-to-open submenus, Escape and outside-tap close (DECISIONS P2-02).
- [x] **Footer:** every column and link from content, a cached copyright year (P2-05), and an undistorted logo (KI-L07).
- [x] **ContactRail** (server, desktop and tablet) and **MobileCtaBar** (phones; past-hero / near-end logic; yields to the menu and popup). They no longer overlap (KI-L12).
- [x] **StartProjectDialog:**
  - native modal `<dialog>` (P2-03) with the original's layout and motion;
  - page-based service preselection, inline validation (KI-F03), honeypot;
  - `POST /api/leads` with a shared Zod schema (P2-04, pulled forward from Phase 3);
  - lead kept in `sessionStorage` for `/thank-you`.
- [x] **Lightbox** (native dialog, keyboard triggers, gallery navigation, captions), **Toast**, **SkipLink**, and **LegacyHashRedirect** with 41 table tests.
- [x] The base line-height is reset to the original's `normal` (P2-06).
- [x] Parity: computed styles measured on the original (`reference/probes/shell.mts`), side-by-side captures at 1440 and 390 (`reference/probes/shell-shots.mts`), and `tests/e2e/shell.spec.ts` (styles + behaviour).
- [ ] Moved to Phase 3: `#contact` behaviour (scroll to the page's contact section). It needs `ContactSection`.

**Exit:** every header and footer link resolves to its new route (pages arrive in later phases), legacy hashes redirect, and the shell matches the original at 1440 and 390.

### Phase 3: Shared sections and the motion engine (~3 days) ✅ done 2026-11-19

Built once and used across 20+ pages. Every group has a styleguide page (`/styleguide/sections-a|b|c`, `/styleguide/motion`) and a computed-style e2e suite against values measured on the original (`reference/probes/sections.mts`).

- [x] `ContentSection` + `SectionHeader` (`.ks` / `.kh` / `.ctr`), the composition model for all inner pages (DECISIONS P3-02).
- [x] Group A:
  - `PageHero` (service and architecture variants, `data-hero`);
  - `SplitFeature`, `RowList`, `FeatureGrid`, `ProcessSteps`;
  - the shared master-process library (`src/content/process-stages.ts`).
- [x] Group B:
  - `SectorGrid`, `CardGrid` (project/service/product), `Gallery` (lightbox), `BeforeAfter`, `DivisionsStrip`, `Testimonials`, `CtaBand`;
  - global content for sectors, related services, testimonials and divisions.
- [x] Group C:
  - `ContactFaq` with the inline `EnquiryForm` (select or hidden service, page-specific extra selects, shared lead schema);
  - `Faq` / `FaqSection` accordion;
  - `#contact` behaviour (`useContactScroll`, `ContactButton`, `ContactLink`).
- [x] Isometric art engine, ported byte-identically (`@/lib/art`, `IsoArt`, `DrawOn`; P3-03), drawn automatically in feature grids and process rows.
- [x] Motion:
  - `useInView`, `useReducedMotion` (live), and `useScrollProgress` (viewport-px maths per the spike);
  - `Reveal` (P3-04), `CountUp`, and `ParallaxImage` (inner and signature variants).
- [x] Cross-browser zoom spike: **GO** (P3-01, docs/analysis/06), guarded by `tests/e2e/zoom-geometry.spec.ts` in Chromium, WebKit and (CI) Firefox. A real-device Safari/iPad check is tracked as KI-N06.

**Exit:** styleguide parity for every section (computed-style suites green), motion maths unit-tested, zoom spike signed off.

### Phase 4: Home page (~3–4 days, the hardest page) ✅ done 2026-11-19

Built in three parallel groups (hero/teasers, pinned sections, interactive sections), then assembled in `src/app/page.tsx`.

- [x] Hero:
  - `HeroVideo` with desktop/mobile cuts, posters, a pause control and lazy source (P4-02);
  - the `kHeroIn` intro.
- [x] About teaser: `CountUp`, seamless `LogoMarquee` with a pause control (KI-L35), and the values list.
- [x] Signature project with signature parallax; its cards are real links (KI-A15).
- [x] `ServicesExplorer`: tablist, 6s autoplay only while visible, pause on hover, focus or the control.
- [x] `PinnedShowcase` (11 cards, cover-flow maths, filter tabs with a live count) and `PinnedStages` (travel and height formulas, active stage, stage art). Both have reduced-motion grids (KI-L02, KI-L04) and focusable scrollers below 1100px (KI-A08). They match the motion-on frames within 0.05–0.83% at 1440.
- [x] `DivisionsCarousel` (carousel semantics, keys, swipe, pause; KI-L03), `ClientStories` (KI-L01, KI-L29), news and blog teasers, and the home contact + FAQ at home sizes.
- [x] Shared content: `src/content/{projects,posts,news}.ts` (all 9 posts with block bodies, 6 news items, 11 projects).
- [x] Tooling: `pnpm parity` pixel-diff tool (sections vs the original baseline), `docs/PARITY.md` sign-off ledger (P4-04), CSS Modules fixed (P4-03).

**Exit:** met. 35/48 section × width captures are within 1%, and every other one is explained in docs/PARITY.md. The pinned sections are checked from motion-on frames, and all suites (unit, e2e in Chromium and WebKit) are green.

### Phase 5: About and Services overview (~1.5 days)

- About: hero (fix the upside-down vertical labels), who we are, philosophy + approach (fix the `.kh` two-column layout), services grid, divisions grid, founder, experience stats, management team, works mosaic with parallax.
- Services: hero, what we do, what we deliver, 7 alternating service blocks (`.blk`) with lightbox images. Fixes: the 1024 hero type scale, phone `h2` sizing, the text-column gutter, and the image column hidden under the rail.

### Phase 6: Service detail template and 8 pages (~2 days)

- [ ] `ServicePageContent` schema (analysis/03 §4): SEO, hero, typed `sections[]` union, contact-form config, FAQs, plant.
- [ ] `ServicePage` renderer maps section types to Phase 3 components inside a `SectionStack`.
- [ ] Architecture-only blocks: `.ap` intro, `.sv` 9-row services list, `.pr` process + image row (fix the 512px column overflowing on mobile), `.ap2` projects.
- [ ] Content files for all 8 pages from the per-page tables in analysis/03 §2. Shared pools (testimonials, related services, sector tiles, divisions, process stages) are referenced by id.

### Phase 7: Works and Project detail (~1.5 days)

- [ ] `/works`:
  - hero, featured ("The Rain Court House" vs "Courtyard House" is a conflict to resolve with the client), filterable grid;
  - **rebuild the filter layout** so filtered results reflow without gaps or orphans (the original leaves holes);
  - filter state in `?category=` (shareable, back-button friendly), animated reflow, explore section, CTA band.
- [ ] `/works/[slug]` + `generateStaticParams`: overview, design response, brief, materials, gallery (10 images, lightbox with prev/next), related projects, CTA. Courtyard House is the only real project for now; the other cards link to a slug once data exists (until then they link to it, as today, tracked in KNOWN_ISSUES).

### Phase 8: Divisions and Locations (~2 days)

- [ ] `DivisionPage`, block-composed: shared hero, then 6–8 blocks from the vocabulary, then "other divisions". Five content files.
- [ ] `LocationPage`: India (pure blocks with the Kochi / Rest-of-Kerala project filter) and Dubai (bespoke hero with bottom bar, context intro, office block, project mosaic; fixes the 92px cactus rule).

### Phase 9: Blog, Article, News, Reviews, Thank-you (~2 days)

- [ ] `Post` model + 9 seed posts (typed block body).
  - `/blog`: 6 posts, then 3 more per "Load more" (client island over server data).
  - `/blog/category/[category]`: real pages; the hidden search/sort UI is not ported (D-log).
  - `/blog/[slug]`: block renderer, BlogPosting JSON-LD, related posts, real `notFound()` for unknown slugs.
- [ ] `/news`: grid with empty state (detail pages are deferred until there is content).
- [ ] `/reviews`: featured stories, review grid, expertise strip, fixed mobile selectors.
- [ ] `/thank-you`: reads the lead summary from `sessionStorage` (survives refresh), shows correct source/service labels, WhatsApp follow-up. `noindex`, no inline `!important` padding.

### Phase 10: Hardening and parity sign-off (~2–3 days)

- [ ] Full visual-parity suite green at all 4 widths, plus spot checks at 1280, 1920 and 2560 (zoom > 1) and 1366×650 (short laptop).
- [ ] Cross-browser: Chrome, Safari (macOS + iOS), Firefox, Edge; real-device check on iPhone and Android.
- [ ] Accessibility: axe on every route, keyboard-only walkthrough, VoiceOver pass on nav, modal, lightbox, carousels and forms.
- [ ] SEO:
  - per-route metadata (titles and descriptions ported verbatim) and canonical URLs;
  - JSON-LD (Organization + 2× LocalBusiness site-wide; FAQPage only where FAQs render; BlogPosting on articles; BreadcrumbList);
  - `sitemap.xml`, `robots.txt`, OG images.
- [ ] Performance: Lighthouse CI budgets, image `sizes` audit, video `preload="metadata"` + poster, font preloading.
- [ ] Update KNOWN_ISSUES with final statuses; hand off a client content checklist.

### Phase 11: Laravel readiness (~1 day of front-end work; the backend itself is separate)

- [ ] `docs/API_CONTRACT.md`: the REST resources the front end needs (`/settings`, `/navigation`, `/services/{slug}`, `/divisions/{slug}`, `/projects?category=`, `/projects/{slug}`, `/posts?category=&page=`, `/posts/{slug}`, `/news`, `/testimonials`, `/faqs?page=`, `POST /leads`), with JSON examples generated from the Zod schemas.
- [ ] `LaravelRepository` implementing the same interface: `fetch` with `next: { tags }`, Zod parsing at the boundary, typed errors, timeouts.
- [ ] `/api/revalidate` route (signed secret) so Laravel can trigger on-demand ISR when content changes.
- [ ] Switch repositories with `DATA_SOURCE=static|laravel`; `/api/leads` forwards to the Laravel endpoint.

**Total: ~21–25 developer-days** for front-end parity, plus client content turnaround.

---

## 7. How "pixel-perfect" is proven

1. **Baseline:** the original is served locally and captured per route × viewport (1440×900, 1024×768, 768×1024, 390×844) **per section**. Capture uses reduced motion, force-loaded images and fixed fonts.
   **Exception:** the original's Home "Selected Works" and "Seven stages" sections are _broken_ under reduced motion at ≥1100px (KI-L02, KI-L04). Their baselines come from the motion-on frames (`reference/screenshots/motion/<width>/`), captured at fixed scroll progress.
2. **Candidate:** the same capture on the Next build, mapped by route and section id.
3. **Diff:** `pixelmatch` per section; the threshold is ≤1% of pixels differing (anti-aliasing tolerance 0.1). Sections with intentional fixes use a documented mask or a reviewed baseline override, cross-referenced to a KNOWN_ISSUES id.
4. **Motion parity:** each scroll-scrub section is captured at fixed progress values (0, 0.25, 0.5, 0.75, 1). Timed effects are checked against the catalogue values (durations, easings, delays) in analysis/01 §5 using a behaviour checklist per page.
5. **Report:** the parity run writes an HTML diff report. A page counts as "done" only when its report is green. It runs locally until baselines get hosted storage (DECISIONS P0-06), and the report is attached to the page's PR.

---

## 8. Risks and mitigations

| Risk                                                                                 | Impact                                        | Mitigation                                                                                                                                                      |
| ------------------------------------------------------------------------------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS `zoom` + scroll geometry differs between browsers (Chrome 128 standardised zoom) | Pinned sections and parallax drift on desktop | Phase 3 spike before Home; the hook reads geometry in one coordinate space and divides by `--z` where needed; fallback is `transform: scale` on an inner canvas |
| Source cascade is contradictory (rules defined 2–4 times)                            | Easy to port the wrong rule                   | Computed styles and screenshots are the spec, never source CSS                                                                                                  |
| Low-resolution source images (logo 115×65, several heroes < 1000px wide)             | Soft on retina and large screens              | Ship as-is for parity; request originals and an SVG logo (KNOWN_ISSUES)                                                                                         |
| Placeholder content everywhere                                                       | Site cannot go live as-is                     | `SiteSettings` + content TODO list handed to the client early (end of Phase 2)                                                                                  |
| Only one real project detail                                                         | `/works/[slug]` is mostly empty               | Ship with Courtyard House; other cards keep linking to it until data arrives; the dynamic route is ready for Laravel                                            |
| Scope creep: original dead features (blog search, tabs, plant sway)                  | Time                                          | Not ported unless the client asks; recorded in the decision log                                                                                                 |

---

## 9. Information needed from the client (start chasing now)

1. Real phone, WhatsApp, email and office addresses (Kochi and Dubai), and social URLs.
2. Founder name, bio and photo; management team names, roles and photos.
3. Project list with real names, locations, categories and images; resolve Rain Court House vs Courtyard House; Skopje/Macedonia locations look like template leftovers.
4. Approved testimonials; real before/after photography.
5. High-resolution originals of all imagery and hero video; an **SVG logo**.
6. Lead destination (email, CRM, or the Laravel endpoint) and any analytics / tag-manager IDs.
7. Final domain (canonical URLs, sitemap).
8. Whether the hidden blog search/sort and the Factory nav entry should be visible.
