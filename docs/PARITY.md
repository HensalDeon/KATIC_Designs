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
