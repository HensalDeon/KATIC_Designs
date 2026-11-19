# Build guide

The one page to read before working on this codebase. It condenses the plan, decisions and conventions; follow the links only when a task needs the detail.

## What this is

A pixel-perfect Next.js 16 rebuild of the single-file Katic Designs site (`reference/original/`). Every page is built; remaining work is hardening (Phase 10) and Laravel readiness (Phase 11), see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md). The spec is always the original's **rendered** output, measured in a browser, not its source CSS.

## Commands

| Task                   | Command                                                                                                                                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static checks          | `pnpm check` (typecheck, lint with 0 warnings, format, unit tests)                                                                                                                                    |
| Iterate                | `pnpm dev`; one production build for final numbers: `pnpm build && pnpm start --port <yours>` (never 3000: the user's dev server; never 3100: Playwright's default)                                   |
| Your e2e               | `E2E_BASE_URL=http://127.0.0.1:<port> pnpm exec playwright test tests/e2e/<yours>.spec.ts --project=desktop`                                                                                          |
| Everyday e2e           | `pnpm test:e2e:fast` (desktop, mobile, WebKit geometry); accessibility suites: `pnpm test:e2e:a11y`; everything (CI): `pnpm test:e2e`                                                                 |
| Parity, as-is          | `pnpm parity --live --routes <ids> --base http://127.0.0.1:<port> --out .tmp/p` (route ids in `tests/visual/routes.ts`; `--live` captures the original settled, so no stale-baseline offsets)         |
| Parity, fixes reverted | add `--no-fit` (neutralises the original's auto-zoom, KI-L13) and `--css tests/visual/reverts/titles.css` (KI-N04 / KI-L16). Against the live original KI-A10 needs no revert: it renders 11px itself |
| Motion check           | `pnpm parity --motion --no-fit --routes <ids> --base … --out .tmp/m`                                                                                                                                  |
| Measure a style        | `pnpm parity:probe --route <id> --selector "<css>" [--base … --ours "<css>"]`                                                                                                                         |
| Performance            | `pnpm perf` (Lighthouse CI, budgets in `lighthouserc.cjs`)                                                                                                                                            |

Run the full e2e suite only when you change shared code (`src/components/{ui,sections,blocks,shell,overlays,motion}`, `src/lib`, `src/hooks`, shared content); otherwise run your spec plus the specs of pages you touched. The lead runs the full suite at every merge.

## Rules that are not negotiable

- **Canvas:** at ≥1100px the site is a fixed 1440px canvas scaled with CSS `zoom` (D1). Author desktop values in canvas px. Breakpoints are desktop-first: `max-lg:` ≤1099, `max-md:` ≤860, `max-xs:` ≤420. Scroll maths uses viewport px only (P3-01).
- **Theme:** Tailwind with a restricted theme: 1 spacing unit = 1px, colours and type are tokens or exact arbitrary values (P1-01). Tone via `<Section tone>` / `data-tone` and tone-aware tokens; `in-data-[tone=…]:` for exceptions.
- **Deliberate fixes, everywhere:** no `fit()` auto-zoom, sections grow (KI-L13); section titles 58 → 46 → 34px (KI-N04); hero titles 62px at ≤1099 (KI-L16); small text ≥11px at ≤860 (KI-A10); text-safe orange `#C24E1E` on white, brand orange on black (KI-A11); descriptive alts (KI-A13).
- **Content is data:** typed, verbatim, in `src/content/` (Laravel-ready, no JSX). Shared entities are referenced by id and never restated: projects (`projects.ts`, links only via `projectHref`, P7-02), posts, news, testimonials, divisions, services, sectors, process stages, media (`media.ts`). Placeholders are kept and marked `// TODO(content): KI-…`.
- **Code:** server components by default; strict TS (no `any`, no `!`); `cva` + `cn()`; TSDoc naming the original section and lines; no new dependencies without asking.
- **Git:** Conventional Commits, lowercase subject, trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Work on your branch; never push. Don't edit `docs/` unless asked; report instead.
- **Clean up:** throwaway probes, CSS and reports go in `.tmp/` (git-ignored, excluded from lint and format). Delete `.tmp/` and `test-results/` before you report.

## Patterns to reuse (don't reinvent)

| Need                          | Use                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A content page                | `BlockStack` + `ContentBlock` union (`src/components/blocks`, `src/content/blocks`, P8-01): tones by index with overrides, optional `ending` (contact), page-specific blocks via `renderBespoke` |
| A data-driven route           | registry + `generateStaticParams` + `ensureStatic = "navigation"` + real 404 (P6-02); see `src/app/services/[slug]`                                                                              |
| Hero                          | `PageHero` / `BlockHero`; title via `HeroTitle`                                                                                                                                                  |
| Section header, title, kicker | `SectionHeader`, `SectionTitle`, `Kicker` (`src/components/ui`, `sections`)                                                                                                                      |
| Contact                       | `ContactFaq` (with FAQ) or `ContactSection` (without); copy in `src/content/contact.ts`; extra selects and `prefillLocation` via `EnquiryFormConfig`                                             |
| Go to contact / popup         | section CTA `kind: "contact"` (scrolls to the page form, preselects the service) or `kind: "enquiry"` (Start-a-Project popup)                                                                    |
| Filters in the URL            | `src/components/filters/url-param-filter.tsx` + `use-flip-reflow` (P7-03, P8-03)                                                                                                                 |
| Lightbox                      | `ZoomableImage` with a `group` (fits 90vw × 86vh, KI-N13)                                                                                                                                        |
| Parallax, reveal, count-up    | `src/components/motion/*`. Reveal-on-scroll exists on **Home only**, as in the original (D7)                                                                                                     |
| Plants                        | `Plant` + `plant` on a block; phone room via `phonePlantRoom()` (P6-04)                                                                                                                          |
| Legacy hash links             | `src/lib/routes/legacy.ts`                                                                                                                                                                       |

## Proving a page matches the original

1. **Measure** the original's computed styles and rects at 1440 / 1024 / 768 / 390 (`pnpm parity:probe`).
2. **Pixel parity** per section at the four widths: pass ≤1%, review ≤2%. Sections without an original id carry `data-parity="<original first class>"` (P5-01, P6-04). Every non-pass needs a reason: a KNOWN_ISSUES fix (re-measured with the fix reverted, P5-04) or image resampling.
3. **Motion:** compare the reveal inventory with the original (`[data-rv]` vs `[data-reveal]`), then a motion-on diff with each section at the viewport top after 2.5s.
4. **E2E:** metadata, section order / ids / tones, key computed styles (values measured on the original), interactions, no `[data-reveal]` outside Home, no horizontal overflow at the four widths. Links are covered site-wide by `tests/e2e/site-links.spec.ts`.

Report parity in the format of [PARITY.md](./PARITY.md).

## Where things are

`src/app` routes · `src/components/{ui,sections,blocks}` shared building blocks · `src/components/<page>` page-specific parts · `src/content` typed content · `src/lib/{routes,leads,motion,art}` · `tests/e2e` Playwright specs · `tests/visual` parity tooling · `docs/` plan, decisions, known issues, parity ledger, analysis of the original (frozen).
