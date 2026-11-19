# Visual Parity Sign-off

This file shows, page by page, how closely the rebuild matches the original. Each section was captured the same way on both sites (`pnpm parity`) and compared pixel by pixel:

- **pass:** ≤ 1% of pixels differ;
- **review:** ≤ 2% differ, usually anti-aliasing or sub-pixel noise; checked by eye;
- **fail:** more than 2% differ, or the size differs.

The methodology is in [MIGRATION_PLAN.md §7](./MIGRATION_PLAN.md#7-how-pixel-perfect-is-proven). A section that differs only because of a deliberate fix links to its `KNOWN_ISSUES` id. The pinned scroll sections are compared from motion-on frames by their own e2e suites (`tests/e2e/home-h2.spec.ts`).

---

## Home (`/`): Phase 4, 2026-11-19

All 11 sections are built. 35 of 48 section × width captures are within 1%; every remaining difference is explained below.

| Section                 | 1440        | 1024      | 768    | 390   | Notes                                                                                                                 |
| ----------------------- | ----------- | --------- | ------ | ----- | --------------------------------------------------------------------------------------------------------------------- |
| Hero                    | 0.02%       | 0.03%     | 0.02%  | 0.05% | Video replaced by its poster in both captures (reduced motion)                                                        |
| About                   | 0.07%       | 0.09%     | 3.58%  | 4.60% | Tablet/phone: tiny meta text raised to 11px (KI-A10), so +2px height                                                  |
| Signature               | 0.12%       | 0.23%     | 5.97%  | 0.37% | Tablet: layout measured identical; the full-bleed photo is resampled by `next/image`                                  |
| Services explorer       | 0.18%       | 3.00%     | 0.74%  | 0.13% | 1024: the caption grows upwards so its links stay inside the section (the original's overflow off the bottom)         |
| Selected works (pinned) | 0.05–0.83%* | ✓         | ✓      | ✓     | *vs motion-on frames at 5 scroll points; reduced motion shows a grid instead of the original's stacked cards (KI-L02) |
| Seven stages (pinned)   | ✓*          | ✓         | ✓      | ✓     | *same; "CONSTRUCTION" title fitted to its column (KI-L31)                                                             |
| Divisions carousel      | 2.39%       | 0.95%     | 10.62% | 0.62% | 1440: photo re-encoding noise only (text identical). Tablet: empty card area removed (KI-L30), 142px shorter          |
| News                    | 1.43%       | 0.07%     | 3.31%  | 0.14% | Tablet: 11px meta (KI-A10)                                                                                            |
| Client stories          | 0.78%       | 17.39%    | 14.92% | 0.88% | 1024/768: the grid now collapses instead of overflowing the page sideways (KI-L01, KI-L29)                            |
| Blog                    | 2.81%       | 0.03%     | 3.48%  | 0.40% | 1440: excerpt colour from the original's runtime contrast fix; tablet: 11px meta (KI-A10)                             |
| Contact + FAQ           | 1.43%       | ✓ (exact) | 9.84%  | 9.41% | Tablet/phone: email and phone are a two-row list (KI-L11), so 30px shorter and the content below shifts               |
| Footer                  | 0.84%       | 0.86%     | 0.82%  | 0.57% | Logo keeps its proportions (KI-L07)                                                                                   |

**Motion check (animations on, 1440):** each section was scrolled to the top of the viewport on both sites, given 2.5s to finish its reveals, and diffed. All sections are within 1.1%: about 1.00% (marquee position) and divisions 1.10% (carousel timing). The reveal inventory per section (count and variant) matches the original exactly and is enforced by `tests/e2e/home-reveals.spec.ts` (KI-N09).

Deliberate additions not present in the original: pause controls on the hero video, the logo marquee, the services explorer and the divisions carousel (KI-A01).

---

## About (`/about`): Phase 5, 2026-11-19

All 11 blocks are built. Many sections change height because of deliberate fixes, and a height change makes everything below it mismatch. So each was also measured with the fix reverted or the shift compensated (P5-04); those numbers are in brackets.

| Section            | 1440   | 1024   | 768    | 390    | Notes                                                                                                                                                                |
| ------------------ | ------ | ------ | ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero               | 0.06%  | 7.82%  | 0.03%  | 0.06%  | 1024: title scales to 62px (KI-L16). Labels read vertically instead of upside down (KI-L15), a few pixels only                                                       |
| Who we are (`.i1`) | 33.79% | 20.53% | 13.57% | 14.56% | 1440: no auto-zoom (KI-L13), +84px [3.93%: the plant keeps its proportions, KI-L08]. 1024: 46px titles (KI-N04). 768/390: 11px kicker and tags (KI-A10) [390: 1.61%] |
| Philosophy         | 33.61% | 18.90% | 12.85% | 13.44% | The approach header is two columns (KI-L14): 203px shorter at 1440 [1.85% after both shifts: photo and line art]                                                     |
| Services           | 0.32%  | 30.36% | 0.11%  | 3.29%  | 1024: 46px title (KI-N04), −27px; copy identical once shifted. 390: 11px meta (KI-A10)                                                                               |
| Divisions          | 1.55%  | 28.32% | 11.85% | 11.20% | 1440: photo resampling. 1024: KI-N04. 768/390: KI-A10                                                                                                                |
| Founder            | 0.02%  | 0.01%  | 6.60%  | 21.49% | 768/390: 11px kicker (KI-A10); at 390 it wraps to two lines (+17px)                                                                                                  |
| Experience (`.ex`) | 0.05%  | 5.75%  | 0.02%  | 3.54%  | 1024: KI-N04. 390: KI-A10                                                                                                                                            |
| Team (`.ld`)       | 21.57% | 14.47% | 0.00%  | 11.89% | 1440: no auto-zoom (KI-L13) [0.04%]. 1024: KI-N04. 390: 11px roles (KI-A10)                                                                                          |
| Works (`.sw`)      | 61.10% | 1.65%  | 1.33%  | 15.06% | 1440: the original shrinks the mosaic to 70% (KI-L13) [1.11%]. 390: KI-A10 [1.89%]                                                                                   |
| Contact            | 0.30%  | 1.52%  | 0.46%  | 1.80%  | Email and phone are visible (the original turns them white on white after scrolling, KI-N10)                                                                         |
| Footer             | 0.24%  | 0.61%  | 0.14%  | 1.59%  | 390: sub-pixel offset from the sections above                                                                                                                        |

**Motion check (animations on, 1440):** the original has no reveal-on-scroll on About (`[data-rv]` count 0) and neither has the rebuild (asserted in `tests/e2e/about.spec.ts`). With each section at the top of the viewport after 2.5s (the original's auto-zoom neutralised): hero 0.06%, who we are 3.83% (plant, KI-L08), philosophy with its parallax 1.50%, approach line-art draw-on 0.06%, services 0.39%, divisions 1.89%, founder 0.08%, experience 0.05%, team 0.04%, works 1.63%, contact 0.30%. The parallax and the works tile hover zoom are covered by e2e tests.

---

## Services (`/services`): Phase 5, 2026-11-19

All 12 blocks are built. Bracketed numbers were measured with the fixes reverted by injected CSS (P5-04).

| Section                 | 1440   | 1024  | 768    | 390    | Notes                                                                                                                                                                        |
| ----------------------- | ------ | ----- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hero                    | 0.00%  | 9.18% | 0.16%  | 0.49%  | 1024: title scales to 62px (KI-L16) [0.06%]                                                                                                                                  |
| What we do (`.pp-host`) | 0.01%  | 0.04% | 0.03%  | 0.06%  | Plant clipped by the section (KI-L32)                                                                                                                                        |
| What we deliver (`.fd`) | 0.01%  | 0.02% | 1.13%  | 0.28%  | Kept as the original renders it (KI-L19, pending client copy)                                                                                                                |
| Architecture            | 15.94% | 0.30% | 41.70% | 53.10% | 1440: text on the 86px gutter, photos clear of the contact rail (KI-L18) [0.23–0.50% for the four light blocks]. 768/390: 34px titles (KI-L17); 390: 2×2 thumbnails (KI-L09) |
| Interior                | 0.33%  | 0.55% | 36.51% | 48.20% | 768/390: KI-L17, KI-L09                                                                                                                                                      |
| Construction            | 20.22% | 0.83% | 40.78% | 54.95% | Same as architecture                                                                                                                                                         |
| Turnkey                 | 1.08%  | 0.40% | 44.01% | 55.24% | 1440: photo resampling only. 768/390: KI-L17, KI-L09                                                                                                                         |
| Renovation              | 18.16% | 0.65% | 40.41% | 53.34% | Same as architecture                                                                                                                                                         |
| Exterior                | 0.12%  | 0.19% | 41.46% | 51.09% | 768/390: KI-L17, KI-L09                                                                                                                                                      |
| Property care           | 20.51% | 0.72% | 41.89% | 50.72% | Same as architecture                                                                                                                                                         |
| Contact                 | 0.01%  | 0.01% | 1.40%  | 0.69%  | 768: sub-pixel offset from the shorter blocks above                                                                                                                          |
| Footer                  | 0.12%  | 0.14% | 0.60%  | 1.38%  | 390: same offset                                                                                                                                                             |

With the fixes reverted, every block passes at 1440 and 1024 (turnkey 1.08%, review), and 12 of 14 blocks are within 1.55% at 768 and 390; two 768 blocks stay at 4.8% and 5.7% from a 1px rasterisation shift.

**Motion check (animations on, 1440):** no `[data-rv]` on the original and no `[data-reveal]` in the rebuild. Each section at the top of the viewport after 2.5s: hero, what we do and what we deliver 0.00–0.01%, interior 0.33%, turnkey 1.08%, exterior 0.12%, contact 0.01%; the four other blocks 14.9–20.5% from the KI-L18 fix (0.23–0.51% with it reverted). The architecture parallax matches the original to 0.0006px. Thumbnail hover (scale 1.06 over 0.6s) and the lightbox gallery per block are covered by `tests/e2e/services-page.spec.ts`.

On touch devices the original has no `text-size-adjust`, so Chrome enlarges its 8.5–9.5px block taglines and photo labels to about 11px; the rebuild sets them to 11px on phones, which matches what it renders and KI-A10.

---

## Service pages (`/services/<slug>`): Phase 6, 2026-11-19

All 8 pages are built from one template (P6-01). The 1440 column is the lead's re-run on the merged build; the other widths come from each page's own run. Bracketed numbers are with the fix reverted (`--css`) or the height shift compensated; at 768/390 they use a settled re-capture of the original (P6-03, KI-N12).

### What is the same on every page

| Section                             | 1440                | 1024              | 768 / 390         | Reason for non-pass                                                                                                              |
| ----------------------------------- | ------------------- | ----------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Hero                                | 0.00–0.01%          | 5.4–9.4% [≤0.11%] | ≤0.73% / ≤2.46%   | 1024: title scales to 62px (KI-L16)                                                                                              |
| Standard blocks that fit one screen | 0.00–1.16%          | ≤0.55%            | 2–18% [≤1.0%]     | 768/390: kickers, captions and meta raised to 11px (KI-A10), a few px taller each                                                |
| Blocks the original shrinks to fit  | 13–69% [0.48–3.10%] | see below         | see below         | The original zooms them to one screen; the rebuild lets them grow (KI-L13)                                                       |
| Testimonials                        | ≤1.47%              | 3.2–4.5% [≤0.34%] | 3.6–6.3%          | 1024: the last card spans instead of leaving an orphan (KI-L23); 390: 11px meta wraps (KI-A10)                                   |
| Contact + FAQ                       | 13–28% [0.01–0.92%] | ≤1.30%            | 11–53% [0.5–4.3%] | 1440: no auto-zoom (KI-L13), 62–141px taller. 768/390: email and phone as a two-row list (KI-L11)                                |
| Footer                              | 0.12–1.59%          | 0.14%             | ≤1.6% (settled)   | Sub-pixel offsets from the sections above. The stored phone captures are offset by the original's growing plant padding (KI-N11) |

### Page-specific notes (1440 unless stated)

| Page          | Notable sections                                                                                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture  | `.ap` 26.95% [0.04%], `.sv` services list 42.41% [0.08%] (KI-L13); process 0.82%; projects 1.14% (photo resampling). 1024 bespoke blocks ≤1.56% reverted (KI-N04 titles). 768/390: process photos stack (KI-L20) [≤0.21%]    |
| Interior      | Everything ≤0.65% except the contact (17.25% [0.13%])                                                                                                                                                                        |
| Factory       | "What we make" 28.25% and gallery 69.25% [3.10%] (KI-L13: the original zooms both and offsets them from the gutter); 1024 gallery is two columns (KI-L23); 768/390 gallery and product photos use the documented phone sizes |
| Construction  | Feature grid 23.77% [0.82%] (KI-L13). The footer's 48.16% is a broken stored capture; 1.46% against the settled one                                                                                                          |
| Turnkey       | Sectors 1.16% (photo resampling); contact 28.27% [0.72%]                                                                                                                                                                     |
| Renovation    | Feature grid 20.03% [0.48%]; sectors 3.26% and process 1.83% (photo and anti-aliasing noise); before/after 5.19% (layout probed identical, photo resampling; ≤860: 63.6% / 56.3% from the documented 300px phone figures)    |
| Exterior      | Sectors ×5 2.05% (`next/image` serves a 256w rendition of the 240px tiles; text identical); contact 19.03% [0.01%]. 390: dark projects 42.62% [0.06%], the 11px card meta wraps                                              |
| Property care | `#pc-services` 26.75% [0.92%] (KI-L13); sectors 47.42% is the stored baseline offset by exactly that section's 222px [1.15% settled]; contact 22.44% [0.11%]                                                                 |

**Motion check (animations on, 1440):** none of the eight original pages has `[data-rv]` and the rebuild has no `[data-reveal]` (asserted per page in `tests/e2e/service-pages.spec.ts`). With each section at the top of the viewport after 2.5s and the original's `fit()` zoom reverted, every section is within 1.47% (most ≤0.5%); as-is, the differences are the KI-L13 sections listed above. Feature and process line art draws on; the FAQ accordion, lightbox galleries, hover states, hero/row/FAQ contact buttons with service preselection, the factory's hidden service field and the plants (static in both, KI-L39) are covered by e2e.

Known shared deviation, not fixed in P6: the "SECTOR" label in `SectorGrid` sits 2px lower than the original (within the passing figures).

---

## Works (`/works`): Phase 7, 2026-11-19

Bracketed numbers are with the fix reverted (`--css`); † = against a settled re-capture of the original (P6-03).

| Section      | 1440           | 1024           | 768             | 390             | Notes                                                                                                                                      |
| ------------ | -------------- | -------------- | --------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Hero         | 0.00%          | 4.04% [0.07%]  | 0.17%           | 0.51%           | 1024: 62px title (KI-L16)                                                                                                                  |
| Featured     | 46.52% [0.07%] | 25.85% [0.00%] | 8.20% [0.14%]   | 8.98% [0.89%]   | The original zooms it to 0.719 (KI-L13); 46px titles at 1024 (KI-N04); 11px meta (KI-A10)                                                  |
| Sectors      | 0.40%          | 33.32% [0.40%] | 0.16%           | 0.45%           | 1024: KI-N04                                                                                                                               |
| Portfolio    | 0.33%          | 78.86% [0.86%] | 34.52% [0.35%]  | 36.81% [0.46%]  | 1024: two columns instead of overflowing (KI-L28); the repeated sentence shown once (KI-C09); 11px meta (KI-A10)                           |
| Case study   | 3.11% [1.26%]  | 8.28% [0.41%]  | 26.82% [0.82%]  | 27.50% [1.42%]  | Sub-pixel offset from the taller section above; 768/390 compared over the content rows because the original's plant padding grows (KI-N11) |
| Capabilities | 38.05% [0.04%] | 51.29% [0.01%] | 49.92% [1.31%†] | 58.79% [1.43%]  | The original zooms it to 0.833 (KI-L13); KI-N04; the sentence repeated three times shown once (KI-C09, −100px on phones)                   |
| Divisions    | 1.53%          | 28.92% [0.31%] | 45.73% [2.40%†] | 12.43% [1.23%†] | 1440: photo resampling; KI-N04; 11px kicker                                                                                                |
| CTA band     | 0.07%          | 26.62% [0.05%] | 0.04%           | 0.77%           | 1024: the shared `CtaBand`'s 80px bottom padding below 1100px                                                                              |
| Footer       | 0.15%          | 1.02%          | 0.36%           | 0.95%           |                                                                                                                                            |

Each filter state's grid was compared with the original's: the only difference is the original's holes and empty rows (KI-L05).

**Motion check (animations on, 1440):** no `[data-rv]` on the original Works page and no `[data-reveal]` in the rebuild. With the original's `fit()` zoom neutralised, every section is within 1.76% (as-is, featured and capabilities read 32% and 29% from KI-L13). The CTA parallax matches to 0.003px. The filter reflow animation is new (KI-F15) and is off under reduced motion.

---

## Project (`/works/the-courtyard-house`): Phase 7, 2026-11-19

| Section         | 1440           | 1024           | 768            | 390            | Notes                                                                                |
| --------------- | -------------- | -------------- | -------------- | -------------- | ------------------------------------------------------------------------------------ |
| Hero            | 0.01%          | 3.05% [0.13%]  | 0.19%          | 0.39%          | 1024: KI-L16                                                                         |
| Overview        | 0.12%          | 30.49% [0.04%] | 19.58% [0.11%] | 22.75% [0.37%] | KI-N04 / KI-A10                                                                      |
| Design response | 0.17%          | 30.34% [0.00%] | 8.01% [0.08%]  | 9.43% [0.04%]  | Same; the repeated paragraph shown once (KI-C09)                                     |
| Brief           | 52.80% [0.07%] | 40.72% [0.01%] | 48.94% [0.09%] | 47.60% [0.52%] | 1440: the original zooms it to 0.70 (KI-L13); phones: 340px photos (KI-L24) + KI-A10 |
| Materials       | 0.12%          | 21.49% [0.05%] | 44.31% [0.13%] | 38.40% [0.41%] | KI-N04 / KI-L24 + KI-A10                                                             |
| Gallery         | 1.17% [0.08%]  | 48.70% [0.46%] | 0.50%          | 0.12%          | 1440: sub-pixel offset from the taller brief                                         |
| Related         | 0.14%          | 42.60% [0.04%] | 25.69% [0.01%] | 27.19% [0.01%] | KI-N04 / KI-A10; the repeated sentence shown once (KI-C09)                           |
| CTA             | 0.10%          | 49.24% [0.07%] | 0.26%          | 0.22%          | 1024: `CtaBand`'s 80px bottom padding                                                |
| Footer          | 0.60%          | 0.24%          | 0.90%          | 0.24%          |                                                                                      |

**Motion check (animations on, 1440):** no `[data-rv]` on the original and no `[data-reveal]` in the rebuild. Each section within 0.30% except brief and related, which the original zooms (KI-L13): 0.07% and 0.04% with that reverted. The CTA parallax matches to 0.05px; the 10 gallery photos open as one lightbox group at full-screen size (KI-N13).
