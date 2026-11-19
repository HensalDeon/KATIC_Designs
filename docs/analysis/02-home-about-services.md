# B — HOME / ABOUT / SERVICES (source: reference/original/katic-designs-final.stripped.html, lines 2381–3235)

Method: I read the markup and the per-page `<style>` blocks, cross-referenced the global CSS (29–2377) and JS (4399–5307),
then **rendered the live site** (`qa/index.html` via the local server on :8765, Playwright) at 1440×900, 1024×768 and 390×844
to resolve the final computed styles (the global CSS has many `!important` / `data-fx` overrides, so the source CSS alone is misleading).
Screenshots: `reference/screenshots/B/v-<page>-<width>-<nn>-<section>-<k>.jpg` (per section) + full-page `home-1440.png` etc.
Computed dump: `reference/screenshots/B/probe.json`. Probe scripts: `reference/qa-scripts/probeB*.js`.

Exact page boundaries (authoritative, from grep):

| page | `<section class="page">` | `<style>` | hero | contact tpl | footer tpl | end |
|---|---|---|---|---|---|---|
| home | 2381 | 2382–2790 | 2792 | 2912 | 2917 | 2918 |
| about | 2920 | 2921–3006 | 3007 | 3111 | 3112 | 3113 |
| services | 3115 | 3116–3166 | 3167 | 3232 | 3233 | 3234 |

> Line numbers below are exact for markup/JS. CSS lines are given where useful; selectors are always quoted.

---------------------------------------------------------------------------------------------------

## 0. Cross-cutting facts that matter for all three pages (global engine, only as it affects these pages)

1. **Desktop scaling** (`setZoom`, JS 4867): at viewport ≥1100 px the whole layout is designed at 1440 and scaled by `--z = width/1440`; `--svh = innerHeight/z`. All the px numbers below are "1440-design px". Below 1100 → `--z:1`, real responsive CSS.
2. **One-screen sections** (CSS 1050–1053 & 1649–1662, `@media (min-width:1100px)`): every `.page>section` except `.hero/.ctasec/.stg/.pinsec` (and `.contact`) gets `min-height:var(--svh); padding:104px 0 36px !important; display:flex; flex-direction:column; justify-content:center`. Hero: `height:max(var(--svh),720px)`. So at 1440×900 every normal section is **exactly 900px tall** and vertically centred (confirmed in probe: all = 900).
   Below 1100: the "standard rhythm" rule (CSS 1641) gives `padding:120px 0` → in practice 80px at ≤1099 (computed) and the page-level home override `#p-home>section:not(.pinsec):not(.stg){padding-top:104px!important;padding-bottom:36px!important}` (2581) keeps home at 104/36 at all widths.
3. **Fit-to-screen zoom** (JS 5085–5106): on ≥1100, if a section's content is taller than one screen, JS sets `style.zoom = avail/need` (only if ≥0.66) on its children. At 1440×900 this **shrinks** About `.i1` (zoom .888), About `.ld` (.924), About `.sw` (.704). Visible side-effect: those sections' content is narrower and indented (e.g. `.sw` content starts at x=274 instead of 86) → misaligned with the rest of the page. On shorter viewports more sections get zoomed. Skipped: `.hero,.ctasec,.stg,.pinsec,.kart-cover,.kblog-home`. **Rebuild recommendation:** don't replicate; size the content to fit 900 (or let sections grow) and accept height variance.
4. **`data-fx="N"` colour freeze rules** (CSS 216–445, 1400–1504): machine-generated rules like `html body section:is([data-fx="21"],#_q#_r#_s) …>:nth-child(k) {color:…!important}` with 3-ID specificity. They **override page CSS and inline styles**. They decide the *final* light/dark alternation:
   - About `.ex` (fx15) → **black** bg (page CSS says #fff), `.ld` (fx16) → **white** with #F1F1F1 cards (page CSS says #080808), `.sw` (fx17) → **black** (page CSS says #F3F0E9).
   - Services `.fd` (fx19) → black; `#svc-interior` (fx21, class `c rev`) → **black**; `#svc-construction` (fx22, class `d` = "dark") → **white** (its inline `style="color:#fff"` on h2 is overridden to black); `#svc-turnkey` (fx23) → black.
   - `data-fx="177"` = the CONTACT template (JS 4654); rules at 1400–1481/1502–1504 force it **white** on home & about only; services contact stays **black** (`#p-services>.contact{background:#000!important}` 1696).
   - Also the plain "section backgrounds" list 1665–1696 (`#p-about>section.fd{background:#fff!important}` etc.).
   → **The rebuild must use the computed final colours (table per page below), not the per-page CSS.**
5. **Kicker colour**: global 1213/1363/1364 → `--or` (#E8622C) on dark sections, `--or-t` (#C24E1E) on light; home type system (2772) forces `var(--or)` everywhere on home.
6. **Templates**: `data-tpl="header"` → `header(pageId)` (JS 4685–4689). **`data-variant` is ignored** (only the page id is used). `data-tpl="rail"` is removed. `data-tpl="contact"` → `CONTACT` (JS 4654) and its id is rewritten per page (JS 4775–4776: home → `#start`, others → `#<page>-contact`). Footer → `FOOTER`.
7. **Arrow icons**: every `[data-arw]` gets an inline SVG appended (JS 4704; `ne` = ↗ diagonal arrow, else →). In React: `<Button arrow="ne">`.
8. **Lazy images**: `img[data-img]` resolved from `window.KATIC_IMG` (JS 4705–4717); width/height from `KATIC_DIM`; hero / `.logos` / marquee eager, rest lazy with 900px rootMargin. In Next: `next/image` with the DIM table as intrinsic sizes.
9. **Plants**: `.plant` decorative PNG/WebP cut-outs. **All plant animations are disabled** by `.plant,.plant.pp,.plant.pot,.plant.hang{animation:none!important;transform:none!important}` (CSS 1603) — so `kHangSkew` / `kWindHang` etc. never run. On phones, JS 5285–5292 pads the host section so the plant doesn't overlap text (skips `.bou`, `.croton`).
10. **`.nico` icon numbering** (CSS 2758–2767) — declared inside the HOME `<style>` but **unscoped and used on all pages** (about/services `.ksteps small.nico`, services `.hd small.nico`). Must live in global CSS in Next.
11. **`.sc-*` showcase card rules** (2532–2543) are also unscoped inside the home `<style>` → global.
12. **ksteps 3-D line art** (JS 4910–4923): every `.ksteps` gets `.k3d`, light-theme `.lt` unless inside `.dk`/`.pr`/`#p-about .ph`; each step gets an `<div class="art3">` SVG from `KATIC_ART(k)` (k chosen by keyword regex on the h3, fallback to proportional index); IntersectionObserver (threshold .25) adds `.drawn` to steps staggered 220ms → stroke-dashoffset line-draw (CSS 2069–2082). `markLight()` (JS 5088) adds `.onlight` to light sections → dark strokes (CSS 1076–1080).
13. **Reduced motion**: reveal, pinning, parallax, autoplay, video all disabled under `prefers-reduced-motion` (checked in each JS block / CSS 1357, 1628–1630, 2738).
14. **Mobile sticky CTA bar** `.mcta` (JS 5229–5234) appears on ≤860 after the hero (call / WhatsApp / Start a Project) — global, but visible on all three pages.

---------------------------------------------------------------------------------------------------

## 1. HOME — `#p-home` (2381–2918)

- **Route**: `#home` (also default/fallback for unknown hashes). Next.js: `app/page.tsx` (`/`).
  Deep links used site-wide: `#home/home-process` (About page + FAQ), `#home/contact-sec` → rewritten to `#home/start` (JS 4777).
- **SEO** (`data-title`/`data-desc` on 2381; copied into `<title>`, description, OG/Twitter, canonical by the router JS 4733–4736):
  - title: `Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs`
  - description: `Katic Designs is an architecture, interior design and construction studio in Kochi, Kerala and Dubai. Design, build, turnkey homes and property care under one roof.`
  - canonical `https://www.katicdesigns.com/`; JSON-LD Organization in `<head>` (line 28 — global agent).
- **Page-only chrome**: `.kprog` scroll-progress bar (JS 4933, CSS 1616–1617): fixed 3px orange bar at top, `scaleX(scrollY/docH)`, shown only when `body.on-home`.

### Final section order & computed look @1440×900

| # | element | id | final bg | height @1440 | h2 (computed) |
|---|---|---|---|---|---|
| 0 | `div.hero` | – | video | 900 | h1 78/72.5 Jost 700 |
| 1 | `section.ab` | home-about | #fff | 900 | "We Build / Spaces / That Endure." 56px |
| 2 | `section.sig` | home-signature | #000 + photo | 900 | "Signature / Project" 56px |
| 3 | `section.svx.dk` | home-deliver | #000 split | 900 | "Services" 56px (52 in svx rule but type-system wins) |
| 4 | `section.wk.pinsec` | home-works | #fff | **6300** (pinned) | "Selected / Works" |
| 5 | `section.stg` | home-process | #000 | **3203** (pinned) | "Seven Stages, / One Continuous Build" |
| 6 | `section.ks.dvs.dvx` | home-divisions | #fff | 900 | "One vision. / Five divisions." |
| 7 | `section.ks.dk.knews-home` | home-news | #000 | 900 | "Latest from / KATIC" |
| 8 | `section.cs` | home-stories | #fff | 900 | "From Brief / To Built" |
| 9 | `section.ks.dk.kblog-home` | home-blog | #000 | 900 | "Ideas on / building well" |
| 10 | `section.contact.combo` (CONTACT tpl + FAQ merged) | **start** | #fff | 900 | "Have a Project in / Mind?" 40px |
| 11 | `div.ftw` footer | – | #fff | 785 | – |

Typography system for home is **forced** by the last block of the home `<style>` (2768–2789, all `html body #p-home … !important`): one font (Jost `--fut`), kicker 500 11px .22em orange; section h2 56/1.02 500 uppercase (46 @≤1099, 34 @≤860); contact h2 40 (30 @≤860); feature h3 42 (36/30); card h3 28 (22 @≤860); body 15/1.75 intro, 14.5/1.7 in cards; buttons 12px 500 .16em uppercase; text links 11.5px .14em uppercase. **Use these as the design tokens for home** — everything earlier in the block is overridden.

### 1.0 Hero (2792–2802)
- Content: eyebrow `Residential & Interior Design Studio` (orange 5px dot ::before), h1 `Homes designed<br>around how you<br><span class="or">actually live</span>`, lead `From first sketch to final walkthrough, we shape houses in the mountains and beyond into spaces that feel considered, warm, and entirely yours.`, buttons: `.btn.wh` "Start a Project →" (`href="#contact" data-go="contact"` → JS scrolls to the home contact section `#start`, focuses first input, JS 4750–4763) and `.plain` "View Our Projects" (`#works/works-list`).
- Background: `<video class="hv" muted loop playsinline autoplay preload="auto" data-desktop="katic-banner-desktop.mp4" data-mobile="katic-banner-mobile.mp4" aria-hidden>` (2793). JS 5049–5073: picks desktop/mobile cut via `matchMedia('(max-width:860px), (orientation:portrait) and (max-width:1099px)')`, sets poster from `KATIC_IMG.poster_desktop|poster_mobile` (1280×720 / 720×1280), falls back after 2.5 s or on error to the base64-embedded `#kv-desktop/#kv-mobile` (already extracted: `reference/original/assets/kv-desktop.mp4`, `kv-mobile.mp4`); pauses when tab hidden / when leaving home; retries play on first click/touch/scroll; no autoplay with reduced motion.
- Layout (final): `html body #p-home .hero{display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:64px}` (2740) → content anchored to the bottom-left; height = one screen (900). Shade: final = `linear-gradient(0deg,.78→.45@38%→.12@70%→.25) + linear-gradient(90deg,.35→transparent 60%)` (2742, !important). The earlier rules `.hero{height:725px}` (2383), `.hero .shade` (2384), `.hero .in{padding-top:176px}` (2385) are **dead/overridden**.
- Type: h1 78px/0.93 (2388); 62px @≤1099 (global 2145); 37.44px @≤860 (computed). Lead 17px/1.6 #eee max-w 610. Buttons row gap 28px; on ≤860 the global hero rule (1197–1199) stacks buttons full-width 50px tall, `.plain` gets a 1px white border.
- Animation: `#p-home.active .hero .in>*{animation:kHeroIn 1.2s cubic-bezier(.2,.7,.2,1) both}` staggered 0/.15/.35/.5s (CSS 1610–1613) on each page activation.
- Mobile: shade becomes vertical `180deg .55→.5→.35` (2370), padding-bottom 44px (2743).

### 1.1 About teaser `section.ab#home-about` (2804–2840)
- Decorative: `img.bou.plant.hang.tr-c` (`bou_tip`, 326×498) bougainvillea hanging top-right; final size `height:200px;width:auto;mask none` (1579), mobile 120→**260px behind content `z-index:-1`** (1580/1598, the later rule wins) .
- Left column: `.topline` hairline; kick `About Katic Designs`; h2.t `We Build<br><span class="or">Spaces</span><br>That Endure.`; `.est` `EST. 2013 · KOCHI, KERALA` + `.estline` (**inline style** `margin-top:12px;max-width:610px`, line 2813); 2 `.lead` paragraphs (first has `<b>eco-conscious design that performs as beautifully as it looks.</b>`); kick `.pk` `General Partners`; **logo marquee** `.logos>.tr` 8 imgs (Jaquar `a40f911b6e`, Asian Paints `1ca13ce586`, Kajaria `3e41c94783`, Hettich `f93435a3cb`, then the same 4 repeated for looping; all 284×142); button `.btn.abtn` "ABOUT US →" (`#about`).
- Right column: `.stats` 4 items: **200+** Projects Delivered · **11yrs** In Practice · **500+** Families Housed · **Eco** Design Philosophy (suffix in `<em>` orange). `.vals` 5 rows (icon `.nico`, `.h`, `.d`): Precision, Innovation, Light, Space, Craftsmanship (copy verbatim in markup 2826–2834).
- Layout: `.g{grid-template-columns:608px 1fr;gap:36px}`. Final stats (global 1551–1556): **4 columns in one row**, top border #111, dividers #e3e0da, numbers 32px; `.vals` rows `44px 255px 1fr`, padding 14/12 (2602). ≤1099: `.g` single column (2149), logos width 100%. ≤860: stats 2×2 (1559–1563), `.vals .r` = `34px 1fr` with description under title (2217–2218).
- Animations: **marquee** `@keyframes kmarq{to{transform:translateX(-776px)}}` (2409) on `.tr` 18s linear infinite (2407), paused on hover (2410). **Reveal** (home-only system, JS 4934–4945): each of `.ab .topline/.kick/.est/.lead/.pk/.logos/.abtn/.stats>div` = fade-up 46px, `.ab .t` = "clip" (translateY 70 + skewY 4° + blur 8px → none, 1.2s), `.vals .r` = from left −60px; stagger `--d = min(i,6)*0.09s`; IO rootMargin −8% bottom, threshold .12 (CSS 1605–1609). **Count-up** on stats when revealed (JS 4947–4948: 1.4s easeOutCubic on the leading integer; "Eco" skipped).

### 1.2 Signature project `section.sig#home-signature` (2842–2852)
- Content: bg image `b787004451` ("Villa exterior with private pool", 1440×960); kick `Step Inside`; h2 `Signature<br>Project`; `.btn.vp` "View Project" (`#project`); paragraph `From the entrance to the last detail, each space is designed to work as one — kitchen, living, dining, and leisure areas sharing a single architectural language.`; **4 cards** `article.sc-card` (Kitchen `131598c44a`, Games Room `a77a8c7e94`, Living Room `a16247ad87`, Reception `0b700c1719`), each with pill "Signature Project", h3, p "Katic Home — Interior".
- Layout: `.top{grid 640px 1fr}`; `.sc-track.sig-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}` cards 320px tall (2681–2684), gradient overlay `::after` 35%→.72. `.sig .bg::after` dark gradient .62→#000 (2426).
- ≤1099: `.sig-grid{display:flex}` + global `.sc-track{overflow-x:auto;scroll-snap-type:x mandatory}` → horizontal snap carousel, cards 72vw × 300px (2352/2369, 2344–2346). ≤860 `.top` single column.
- Effects: **background parallax** (JS 5275–5284): `translate3d(0, p*11%, 0) scale(1.06)` (7% on ≤860), p∈[−1,1] from section centre; image is `height:130%;top:-15%` (1584). Reveal on `.sig .kick/h2(clip)/.top p/.vp` (other RV entries `.tabs/.cards .c/.pg` target markup that no longer exists).
- Note `.pin` wrapper exists but `.sig` is not `.pinsec`, `#p-home .sig .pin{position:static}` (2686). `sc-shade` elements unused (hidden 2683).

### 1.3 Services explorer `section.svx.dk#home-deliver` (2854–2859)  *(id says "deliver", class `svx`)*
- Content: left `.svx-l`: kick `Our Services`, h2 `Services`, lead `One studio for every stage of your project — design, build, finish and care.`; **2 groups**: "Design · 03 services" (Architectural Design, Interior Design, Exterior & Landscape Design) and "Construction · 04 services" (Construction & Execution, Turnkey Projects, Renovation & Remodeling, Property Care & Maintenance) — 7 `button.svx-it[data-i]` with a square bullet `.sq` and → arrow; bottom link `.svx-link.svx-all` "Explore all services" (`#services`).
  Right `.svx-r`: `.svx-media` 7 stacked imgs (`987e492e7a, 445f233e70, 9f6d8d2f6c, 129d81a52a, 1a2f69cee0, 0e599c0712, c409203399`) + progress bar `.svx-bar>b`; `.svx-caps` 7 captions `.svx-cap[data-i]` each: category label, h3 name, p description, 4 bullet `li`, links "View service" (`#architecture`, `#interior`, `#exterior`, `#construction`, `#turnkey`, `#renovation`, `#property-care`) and `button[data-svx-quote]` "Get a quote".
- Layout (all in GLOBAL CSS 1252–1343, 1484–1499): desktop ≥861: full-bleed, `height:max(var(--svh),720px)`, grid `calc(max(86px,(100% − 1268px)/2) + 420px) 1fr` (506/934 @1440); left column padded to align with the 86px gutter, right border #262626; media absolutely fills the right column with bottom gradient; captions overlay bottom-left of the photo (`left:56px;right:104px;bottom:48px`), white text, 2-col (1.2fr 1fr) with bullet list 2×2. ≤1099: left col 320px, caption single column. ≤860: single column, media `aspect-ratio:4/3`, captions stacked under image, dark colours.
- Interaction (JS 5216–5224): auto-advance every **6 s** while ≥30% visible (`.run` → `svxbar` 6s linear progress bar); hovering the section **holds** (pauses); hovering an item (if width>860) / click / focus selects it; captions cross-fade (opacity .45s + translateY 10px, delay .15s) and images cross-fade (opacity .9s, scale 1.05→1 1.6s); inactive captions get `inert` + `aria-hidden`; items get `aria-current="true|false"`. "Get a quote" opens the Start-a-Project popup `KATIC_POPUP()` and preselects the service. Focus-in pauses (a11y helper JS 5269–5270).

### 1.4 Selected works `section.wk.pinsec#home-works` (2861–2867)
- Content: kick `Selected Works`; h2 `Selected<br>Works`; p `A selection of residential, commercial, and civic commissions delivered across Kerala and beyond — each built to our founding principle of eco-conscious design.`; `.btn.vap` "View All Projects" (`#works/works-list`); **filter bar** `.fb` 6 `<a>`: All / Residential / Commercial / Architecture / Interiors / Villas / Flats (`href="#works/works-list/<slug>"`); **11 project cards** `article.sc-card[data-cat]` in `.sc-track[data-showcase]`:

  | title | location — type | pill | data-cat | img |
  |---|---|---|---|---|
  | Obsidian Lounge | Skopje, MK — Interior | Interiors | commercial interiors | 86a8b11cf8 |
  | Velvet Suite Penthouse | Skopje, MK — Interior | Interiors | residential interiors villas | 34b5952fa7 |
  | Galičica Retreat | Galičica, MK — Hospitality | Commercial | commercial hospitality | ff597a7d41 |
  | Palm Veil Residence | Thrissur, Kerala — Architecture | Villa | residential villas architecture | 5ae2cb8637 |
  | Cinder House | Dubai, UAE — Interiors | Residential | residential interiors | 6a759310a5 |
  | Nila Apartments | Kozhikode, Kerala — Turnkey | Apartments | residential villas | 2dfb41f894 |
  | Serein Wellness Club | Abu Dhabi, UAE — Interior Design | Commercial | hospitality interiors | 0e599c0712 |
  | House of Three Courts | Kottayam, Kerala — Construction | Residential | residential architecture | 8d5ca34a10 |
  | Al Quoz Atelier | Dubai, UAE — Architecture + Build | Commercial | commercial architecture | 01aabb2353 |
  | Greenfield School Campus | Kottayam, Kerala — Institutional / Architecture | Institutional | institutional architecture | 32404913f1 |
  | DIFC Gallery Office | DIFC, Dubai — Commercial / Interiors | Commercial | commercial interiors | 67ca9cb4fe |

  every card: pill, h3, p, `a.sc-more` "View Project →" (all `#project` — generic).
- Layout desktop: `.top{grid 546px 1fr auto;gap:40px;align-items:center}` (2549); filters = square 35px chips, active = orange fill (2555–2557); `.sc-track` 430px, cards absolutely centred 568×426.
- **Pinned scroll-scrub "cover-flow"** (JS 4954, 4968–4974; CSS 2529–2531): ≥1100 & no reduced motion → section gets `.pinned`, height = `vh × (1 + (n−1)×0.6)` (6300px for 11 cards), `.pin` is `position:sticky;top:0;height:100vh`. Progress p = −rect.top/(height−vh) → `pos = p×(n−1)`; each card `translate3d((i−pos)×640px, min(|d|,1)×16px, 0) scale(1 − min(|d|,1.5)×0.07)`, `--sh` shade overlay opacity = min(|d|,1)×.45, z-index by distance, `.c0` (centre) gets big shadow.
- **Filter** (JS 4955–4966): click (capture, preventDefault) → toggles `.on` + `aria-pressed`, `role=button`; replaces the track children with matching cards (`data-cat` token match), recalculates pinned height, scrolls to the section top instantly, lazy-loads images.
- ≤1099: no pin; `.top` single column, filters wrap; `.sc-track` → horizontal scroll-snap carousel (cards 82vw × 380, `scroll-snap-align:center`, shade hidden) (2343–2350).
- Hover: `.sc-more:hover{color:#ffb08a}`; chip hover border #111.

### 1.5 Process `section.stg#home-process` (2869–2883)
- Content: kick `How A Landmark Gets Made`; h2 `Seven Stages,<br>One Continuous Build`; `.row.hide-scroll` with **7 stages** `.s`: Discovery, Concept, Design, Engineering, Construction, Interiors, Handover — each `.art>.iso[data-stage-art=i]` (SVG generated by JS 4870–4908: isometric house build-up, gradient `#kg`, 292×200 viewBox), icon `.nm.nico`, h3, p (copy in 2874–2880).
- Look: bg #050505 + vertical hairline grid `repeating-linear-gradient(90deg, rgba(255,255,255,.028) 0 1px, transparent 1px 73px)` (2560); stage width 292, gap 96; art has radial orange glow, stronger on `.cur`; strokes #eccbb6 at .55 opacity (1 on `.cur`); h3 46px.
- **Pinned horizontal scroll** (JS 4975–4987, 4988–5003; CSS 1619–1626): ≥1100 → `.pinned`, `.pin` sticky 100vh; `travel = 380 + max(0, last.right − row.width + 110)`, section height = `vh + travel×1.25` (3203 @1440); row `translate3d(380 − p×travel, 0, 0)`; active stage `floor(p×7)` gets `.cur`, stages ≤ act+1 get `.on` → SVG line-draw (`stroke-dasharray:1 1; dashoffset 1→0` 1.6s, 2502–2503). Unpinned (<1100 or reduced motion): all lines drawn, `padding:120px 0` (1646), row is native horizontal scroll with `scroll-snap-type:x mandatory; cursor:grab` (but **no drag handler** — `[data-drag]` absent), gap 40 @≤860, h3 32.
- Dead: `.stg .bar/.cnt/.cntr` styles, `[data-stage]` counter (JS looks for it, markup absent).

### 1.6 Divisions carousel `section.ks.dvs.dvx#home-divisions` (2885–2893)
- Content: `.kh` header: kick `Our Divisions`, h2 `One vision.<br>Five divisions.`, lead `Specialist teams for design, interiors, construction, development and care — working together on every KATIC project.`, `.btn.dko` "About Our Divisions ↗" (`#about/about-divisions`).
  `.dvx-row`: left `.dvx-media` 5 imgs (`dd00000001…05`); right `.dvx-card` 5 slides `.dvx-s` each: tag `.dvx-k` (orange icon box + black label "KATIC Design / Interior / Infrastructure / Developers / Care"), 3-line h3 (each line `<span><i>` for masked slide-up), `.dvx-ft` paragraph + `.dvx-go` "Explore Division ↗" (`#div-design`, `#div-interior`, `#div-infrastructure`, `#div-developers`, `#div-care`); `.dvx-nav` prev/next 62px round buttons + `.dvx-bar` progress.
  Headlines: "Buildings shaped / by site, climate / and purpose." · "Rooms designed, / made and installed / by one team." · "Where drawings / become / buildings." · "Homes built / from land / to handover." · "Spaces kept at / their very best, / year after year."
- Layout: 2 equal columns gap 12, height fills the rest of the screen (`@media(min-width:1100px)` flex:1, min 480; 572 @1440); card white with 1px #e3e3e3 border, padding 40/44; h3 56→42 (type system) /1.06 −.035em.
  ≤1099 h3 44 (36 forced), ≤860 single column: media `aspect-ratio:4/3.2`, card `height:clamp(440px,118vw,540px)`, nav bottom-left (2737).
- Interaction (JS 5075–5083): autoplay **5 s** when ≥35% visible (`.run` → `dvxbar` 5s); prev/next; ArrowLeft/Right on section; touch swipe >45px; slides toggle `.on`, `aria-hidden`, `inert`; image cross-fade (opacity 1s, scale 1.06→1 1.8s); h3 lines slide up from 105% (0.9s, staggered .07/.14s); tag fades in from −10px; footer fades up with .25s delay. Hold on hover **only if the section already has focus-within** (JS 5079) — i.e. mouse hover alone does *not* pause; focus does (5269–5270). Section has `aria-roledescription="carousel" aria-label="Our divisions"`.

### 1.7 News teaser `section.ks.dk.knews-home#home-news` (2894)
- Content: kick `In the news`; h2 `Latest from<br>KATIC`; lead `Studio updates, completed projects and announcements from across our divisions.`; `.btn.ol` "View All News ↗" (`#news`); `.knews-grid` **3 cards** `a.knw` (all `href="#news"`): image, meta (category span + `<time>`), h3, p, "Read more ↗":
  1. Studio · 28 Oct 2026 · "KATIC opens its Dubai design studio" (`987e492e7a`)
  2. Project · 14 Oct 2026 · "Courtyard House, Kochi handed over" (`5ae2cb8637`)
  3. Manufacturing · 30 Sep 2026 · "In-house joinery workshop expands" (`6a759310a5`)
- Layout (global 1218–1242): 3 cols gap 24 (2 @≤1099, 1 @≤860); dark card #0b0b0b border #262626; image 200px @≥1100 (1240) / 230 / 210 mobile; h3 21px no uppercase (1239). Hover: border orange, img scale 1.04 (.8s), "Read more" orange.

### 1.8 Client stories `section.cs#home-stories` (2895–2910)
- Content: kick `Client Stories`; h2 `From Brief<br>To Built`; right-aligned p `Direct feedback from the people we’ve built for —<br>in their own words.`; 3-col `.g` (346px / 1fr / 346px): left `.card` portrait (`11014e3f02`, pill "CLIENT STORY", name), centre `.q[data-quotes]`: orange “ mark, `<blockquote>` (29px/1.22, min-height 105px), `.who`, `.co`, prev/next `button.a[data-q=±1]` 44×44, `.btn` "VIEW ALL STORIES" (`#reviews`); right `.card.r` (`8a8fdf2483`, project name).
- Data: **4 quotes hard-coded in JS** `QUOTES` (4841–4844) + image pairs `QIMG` (4845: `['11014e3f02','8a8fdf2483'],['cs_p2','445f233e70'],['cs_p3','934be61600'],['cs_p4','0e599c0712']`). Initial markup duplicates quote #1.
- Interaction (JS 4846–4854): prev/next → fade out (opacity .25s) blockquote, both images and labels, swap text/src/alt, fade in. No autoplay, no swipe. Cards have `box-shadow:0 18px 38px rgba(0,0,0,.22)`.
- Responsive: ≤860 `.top` column + left-aligned text, `.g` single column, card 360px, **right card hidden**, quote padding 40px 0 (2231–2237). **Bug: 1024 overflow** (see bugs).

### 1.9 Blog teaser `section.ks.dk.kblog-home#home-blog` (2911)
- Content: kick `Latest from the blog`; h2 `Ideas on<br>building well`; lead `Notes on architecture, interiors, materials, construction and caring for the spaces we live in.`; `.btn.ol` "View All Articles ↗" (`#blog`); `.kbh-cats` 9 category links (`#blog/blog-list/<slug>`) — **hidden globally** (`.kbh-cats{display:none!important}` 1244); `.kbh[data-blog-home]` empty, filled by JS 4480–4483 from `POSTS` (defined 4401): newest post as `a.ft-post` (image 290px with "Featured" tag, meta category+date, h3, excerpt, "Read Article →"), next 3 as `a.li` rows (image 130×88, meta, h4; excerpt `em` hidden on home).
- Layout: `.kbh` grid ≈ 682 / 546 gap 40 (1.25fr 1fr); list rows separated by borders. Excluded from fit-zoom.

### 1.10 Contact + FAQ combo `section.contact.combo#start` (2912 tpl + FAQ 2913)
- Markup: `<div data-tpl="contact">` → CONTACT template (JS 4654; owned by the global/contact agent) and a separate `section.ks.kfaq-sec` (2913) containing `.kfq-h` (kick `Questions, answered`, h2 `Frequently asked<br>questions`, p, "Ask us directly →") + `.faq.kfaq` with **6 Q&As**:
  1. What services does KATIC offer? → link "Explore all services ↗" `#services` (open by default)
  2. Where do you work? → "See our locations ↗" `#india`
  3. How does a project start? → "Start a project ↗" `href="contact" data-go="contact"`
  4. Can one team handle design and construction? → `#turnkey`
  5. How long does a typical home take? → `#home/home-process`
  6. Do you support clients after handover? → `#div-care`
- JS 4692–4703 merges them: `.contact .wrap.grid` becomes `.kc-l` (info + form) | `.kc-r.kfaq-sec` (FAQ header without its `p`/"Ask us directly" + list); FAQ section removed; `.contact.combo` added. Final 2 cols 586/586 @1440, single column ≤1099 gap 64 (2340). Home overrides 2607–2616 (h2 44→40 by type system, inputs 42px, textarea 76px, FAQ question 15.5px, padding 17px).
- FAQ accordion (JS 4855–4856): single-open; a11y helper adds `aria-controls/aria-expanded/role=region` (5251–5252) and keeps `aria-expanded` synced (5259).

### Home page-specific CSS — what it overrides / fights
- **Layering by history**: the block has 3 generations stacked: original (2383–2527) → "reference-matched showcase" (2528–2579) → "standard one-screen" (2580–2634) → later feature blocks (2635–2767) → final "type system" (2768–2789, 30+ `!important` `html body #p-home…` rules). Many properties are declared 2–4 times (e.g. `.wk h2` at 2468 & 2551, `.wk .fb` 2471 & 2554, `.wk .top` 2466 & 2549, `.sig .top p` 2429 & 2545, `.stg .s` widths 2488 & 2565, `.stg h2` …). Only the last wins → port only final values.
- **69 `!important`** in this block (about/services blocks: 0). Fights: `#p-home .wk{background:#fff!important}`, `#p-home .stg{background…!important}`, `.stg .s .iso{transform:none!important}`, `.stg .s .iso .ln{stroke:#eccbb6!important…}`, `.stg .s{opacity:1!important}`, `#p-home>section:not(.pinsec):not(.stg),#p-home>.contact{padding…!important}` (fights global 1641/1652), hero `padding-top:0!important`/shade `!important` (fights global 1201/2370), the whole type system (fights `.ks .kh .st`, `.knw h3`, `.svx-cap h3 !important` in global 1283/1321/1343 — note global *also* uses !important there → specificity war; final computed svx cap h3 = 32px from 1343).
- **Dead CSS (no matching markup)**: entire `.dl` "deliver" block (2447–2464, 2593–2606) + global 1667/1973–1974/2150–2151/2224; entire `.sx` "service explorer" (2635–2679, 2745–2757) + global 2355–2366/2375 + **dead JS 5026–5048** and inline-enquiry JS 5019–5025; `.sig .tabs/.cards/.pg` (2432–2443, global 2140, 2220–2223); `.wk .cards/.c/.im/.loc/.vp` (2476–2484, global 1718, 2227–2228); `.stg .bar/.cnt/.cntr`; `.stg .s .art::before` & `.iso` 3-D tilt + kFloat (2491–2499 then disabled 2569–2571); `.hero .eyebrow` sizing ok but `.hero .in` padding dead. ~45% of the home `<style>` is dead.
- **Unscoped rules inside a page style** (leak globally): `.sc-*` (2532–2543), `.nico…` (2758–2767), `@keyframes kmarq/kFloat/sxBar/dvxbar`.

### Home — images used (keys; dims from KATIC_DIM)
bou_tip 326×498 · logos a40f911b6e/1ca13ce586/3e41c94783/f93435a3cb 284×142 · sig bg b787004451 1440×960 · sig cards 131598c44a 478², a77a8c7e94 478², a16247ad87 1600×1066, 0b700c1719 1400×1136 · svx 987e492e7a 1440×611, 445f233e70 1600×1066, 9f6d8d2f6c 950×709, 129d81a52a 972×413, 1a2f69cee0 1440×611, 0e599c0712 1600×1067, c409203399 987×795 · works 86a8b11cf8, 34b5952fa7, ff597a7d41, 5ae2cb8637, 6a759310a5, 2dfb41f894, 0e599c0712, 8d5ca34a10, 01aabb2353, 32404913f1, 67ca9cb4fe · divisions dd00000001–05 · news 987e492e7a, 5ae2cb8637, 6a759310a5 · stories 11014e3f02 560×700, 8a8fdf2483 430×644 (+ JS: cs_p2/cs_p3/cs_p4 560×700, 445f233e70, 934be61600, 0e599c0712) · blog from POSTS · video kv-desktop.mp4 / kv-mobile.mp4 + poster_desktop/poster_mobile.
Note: `987e492e7a` is reused as "Architectural Design", "KATIC Design" and a news story; `0e599c0712` as "Renovation", "Serein Wellness Club" and a client story — real content needed.

---------------------------------------------------------------------------------------------------

## 2. ABOUT — `#p-about` (2920–3113)

- **Route**: `#about`; anchors `#about/about-approach`, `#about/about-founder`, `#about/about-divisions` (+ `#about-philosophy`, `#about-services` ids). Next: `app/about/page.tsx` with section ids preserved for `/about#approach` style links.
- **SEO**: title `About Katic Designs | Architecture & Interior Design Studio, Kochi`; description `Founded in 2013 in Kochi, Katic Designs brings architects, interior designers and site teams together to design and build eco-conscious homes and buildings.`
- Note: no `data-nav` attribute on this page section (home has `data-nav="home"`) — check header active-state logic (global agent).

### Final section order & computed look @1440×900

| # | element | id | final bg | h @1440 | heading (computed) |
|---|---|---|---|---|---|
| 0 | `div.hero` | – | photo | 900 | h1 76/.98 Jost 700 |
| 1 | `section.i1` | – | #fff | 900 (zoom .888) | h2.st "Architecture With / Purpose" 58px/1.12 **400** |
| 2 | `section.ph` (+ nested `div.ip`) | about-philosophy (+ about-approach) | #000 | 1723 | "Designed Around You" / "From Vision / to Reality" |
| 3 | `section.ks` | about-services | #fff | 1414 | "Everything your project / needs. Under one roof." |
| 4 | `section.ks.dk` | about-divisions | #000 | 900 | "One vision. / Five divisions." |
| 5 | `section.fd` | about-founder | #fff | 900 | "FOUNDER NAME" 56px **Inter** 500 |
| 6 | `section.ex[data-fx=15]` | – | **#000** (fx) | 900 | "Built on / Experience" |
| 7 | `section.ld[data-fx=16]` | – | **#fff** (fx), cards #F1F1F1 | 900 (zoom .924) | "The People Behind / the Vision" |
| 8 | `section.sw[data-fx=17]` | – | **#000** (fx) | 900 (zoom .704) | "OUR WORK SPEAKS" 60px Jost 500, no `.st` |
| 9 | CONTACT tpl | about-contact | #fff (fx177) | 900 | "Have a Project in / Mind?" 54px 700 |
| 10 | footer | | #fff | 785 | |

About/Services use the **generic `.st` style** (Jost 400, 58px/1.12 uppercase; 46 @≤1099, 34 @≤860) — lighter weight than home's 500. Body copy uses `--int` (Inter) in many places (leads, `.p`, tags, stats) whereas home is Jost-only.

### 2.0 Hero (3007–3017)
- bg `cea9d2b8ef` (1440×959) alt "Banner photo: Designing Spaces. Shaping Experiences."; kick `.k` `Katic Designs · Kerala & UAE` (22px orange line ::before); h1 `Designing Spaces.<br>Shaping<br><span class="or">Experiences.</span>`; lead `Katic Designs is an architecture, interior design and construction practice creating thoughtful spaces across Kerala and the UAE.`; buttons `.btn.wh` "Explore Our Approach ↗" (`#about/about-approach`) and `.btn.dko` "View Our Projects ↗" (`#works/works-list`).
- Two decorative labels `span.vl` "ABOUT \ 01" (inline `left:36px`) and "OUR STORY ↓" (inline `right:58px`), `transform:rotate(180deg)` (2931) → render **upside-down** (bug); hidden ≤860 (1200).
- Page CSS: `.hero{height:715px}` (overridden to one screen), shade 90deg .72/.45/.35, `.in{padding-top:168px}` (global ≥1100 centres the hero with `padding-top:max(0,(svh−720)/2)` = 90), h1 76/.98, lead 16/1.75 max 640, buttons 50px Inter 13px.
- Responsive: **h1 stays 76px at 1024** (page rule `#p-about .hero h1` beats global `html body .page .hero h1{font-size:62px}`), 37.44 on ≤860 (forced mobile rule); buttons stack full-width on ≤860.

### 2.1 Who we are `section.i1` (3019–3034)
- `.two` (646px 1fr): left kick `Who we are` + h2 `Architecture With<br>Purpose`; right (inline `padding-top:6px`) lead `We believe good design begins with understanding people, place and how a space will be experienced.`, `.p` paragraph (KATIC brings architecture…made to last.), `.btn.ol.sm` "Meet the Founder ↗" (`#about/about-founder`).
- `.imr` grid 340/641/238 gap 24: `img.a` `131598c44a` 287px tall, `img.b` `0b700c1719` 391px tall, `.s` card (#F4F2ED, "STUDIO", `One team. One vision. Every detail connected.`, `Kochi · Kannur · Dubai`).
- Plant: `img.croton.plant.pot.br-c` `68cd41927b` (295×302) 200px bottom-right (bottom −4px); ≤860: 118px tall `z-index:3`, right 6px (1600) — but **also `display:none` at 2243 and `display:block!important` at 1591** → shown (later/important wins).
- Responsive: ≤1099 `.two` single column, `.imr` 2 cols with `.s` full-width; ≤860 `.imr` 1 col.
- No reveal animations on About (home-only RV system).

### 2.2 Philosophy + Approach `section.ph#about-philosophy` (3036–3051)
- Philosophy: kick `Our Philosophy`; h2 `Designed Around You` (inline `margin-top:28px`); `.g` 760/1fr gap 52: `.im` image `a16247ad87` 450px with overlay caption `Light · Material · Proportion`; right: lead `Our design philosophy balances functionality, character, comfort, context and timeless design.`, `.p`, `.tags` 5 outline chips FUNCTIONALITY / CHARACTER / COMFORT / CONTEXT / TIMELESSNESS, `.btn.dk` "Our Approach ↗" (`#about/about-approach`, margin-top 122px).
  **Parallax**: `#p-about .ph .im img` is in `PX` (JS 5008–5011): `translate3d(0, c×−24%, 0) scale(1.3)` by section position.
- Approach (nested `div.ip#about-approach`, padding 120/120 via global 1641/1643): `.kh` (kick `Our approach`, h2 `From Vision<br>to Reality`, lead, `.btn.dk` "See the Full Process ↗" → `#home/home-process`) then `div.ks.dk` (inline `background:transparent`) > `.ksteps.kbody` (inline `grid-template-columns:repeat(5,1fr)`) **5 steps**: Understand / Plan / Design / Execute / Support (icon + h3 + p) with JS 3-D line art (see §0.12; not `.lt` because inside `#p-about .ph`).
  **Layout bug**: `.kh` is styled only as `.ks .kh` (grid 646/1fr, global 1739); here `.kh` is *not* inside `.ks` → computed `display:block`, so the lead runs full-width under the h2 and the button sits after a large gap (see `v-about-1440-02-about-philosophy-2.jpg`). The intended look is the 2-col `.kh` header used everywhere else.
- Responsive: ≤1099 `.ph .g` single col; ksteps → 2 cols @1024, 1 col @≤860 (global ksteps rules).
- Dead page CSS: `.ip .rt .lead`, `.ip .g2`, `.svl …` (old service list), `.ipim …` (2957–2967 area) — old approach design.

### 2.3 Services grid `section.ks#about-services` (3053)
- `.kh`: kick `Our services`, h2 `Everything your project<br>needs. Under one roof.`, lead `Seven services, one team and one point of responsibility.`, `.btn.ol` "Explore All Services ↗" (`#services`).
- `.kc-grid.c4` **7 `a.kc` cards** (image 260px, h3 Inter 23px, p, "Explore Service →"): Architectural Design `987e492e7a` · Interior Design `335d18a20f` · Construction & Execution `465ad48711` · Turnkey Projects `392c9415ec` · Renovation & Remodeling `df57ba68fe` · Exterior & Landscape Design `96147274e0` · Property Care & Maintenance `113b954da6` → links `#architecture … #property-care`. 4+3 layout leaves an empty 4th cell in row 2.
- Global hover `a.kc:hover .im img{transform:scale(1.04)}` (1766). Grid → 2 cols ≤1099, 1 col ≤860 (global).

### 2.4 Divisions grid `section.ks.dk#about-divisions` (3054)
- `.kh`: kick `Our divisions`, h2 `One vision.<br>Five divisions.`, lead `Specialist divisions that work together on every KATIC project.` (no button).
- `.kc-grid.c5` **5 cards** (image 230px): KATIC Design `987e492e7a` · KATIC Interior `6a759310a5` · KATIC Infrastructure `129d81a52a` · KATIC Developers `9d73962e97` · KATIC Care `4a45368b5a` → `#div-*`; "Explore Division →".
- Same division data as home `dvx` but different copy/images → one data source with `summary` + `headline` fields.

### 2.5 Founder `section.fd#about-founder` (3055–3065)
- kick `Founder’s note · The vision behind KATIC`; `.g` (1fr 696px, gap 60, align center): h2 **`FOUNDER NAME`** (placeholder, Inter 56px), `.sub` `FOUNDER & PRINCIPAL ARCHITECT`, 2 paragraphs (second inline `margin-top:0`), quote paragraph (inline `margin-top:0;color:#111;font-weight:500`) `“Our vision is simple: one team that designs, builds and cares for spaces people are proud to live and work in.”`; image `1d975d9f45` (870×870) 520px tall, alt "Founder".
- ≤1099 single col; ≤860 image 360px.

### 2.6 Experience stats `section.ex[data-fx=15]` (3067–3080)
- `.two`: kick `Built on experience` + h2 `Built on<br>Experience` (redundant kicker), lead `Experience across residential, commercial and interior projects in Kerala and UAE.`, `.btn.ol.sm` "View Projects ↗" (inline `margin-top:22px`, `#works/works-list`).
- `.sts` 4 stats: **11+** Years of practice / "A decade of design and delivery." · **200+** Spaces delivered / "Homes, workplaces and hospitality." · **2** Regions / "Kerala and the United Arab Emirates." · **6** Disciplines / "One integrated creative vision."
- Final look (global 1566–1572 + fx15): black bg, 4 columns separated by #2a2a2a verticals, white top rule, numbers Inter 300 50px. ≤1099 2×2, ≤860 1 col with horizontal rules. **No count-up** here (home only).

### 2.7 Management team `section.ld[data-fx=16]` (3082–3095)
- `.two`: kick `Management team`, h2 `The People Behind<br>the Vision` (inline `margin-top:16px`), `.p` `The people guiding strategy, design direction and delivery across Kerala and the UAE.`
- `.cards` `repeat(4,290px)` gap 24: 4 `.c` (img 242×222, h3, small role orange, p): **Manager Name 01** DESIGN DIRECTOR (`a3e18e7517`) · **Manager Name 02** OPERATIONS LEAD (`1fea329563`) · **Manager Name 03** CLIENT PARTNER (`53ddbeae35`) · **Manager Name 04** STUDIO MANAGER (`3bb98cc013`) — all 375×375. Placeholders.
- Final: white section, cards #F1F1F1 (fx16), hover border #444 (2985). Cards are not links. ≤1099 2 cols, ≤860 1 col, img full width.

### 2.8 Selected works mosaic `section.sw[data-fx=17]` (3097–3109)
- `.two`: kick `Selected works`, h2 `OUR WORK SPEAKS` (inline `margin-top:22px`, no `.st` class → 60px Jost 500 not uppercase-transformed but typed uppercase), `.p` + `.btn.ol.sm` "View All Projects ↗" (inline `margin-top:20px`).
- `.grid` 410/410/412 × rows 460/270, gap 17/18: `a.t.big` (col 1–2) Obsidian Lounge — Residential Interior — KOCHI, KERALA (`a16247ad87`); `a.t.tall` (col 3, rows 1–2) Villa Noor — Turnkey Residence — ABU DHABI, UAE (`a77a8c7e94`); `a.t` The Courtyard House — Architecture — THRISSUR, KERALA (`0b700c1719`); `a.t` Canvas Kitchen — Interior Design — DUBAI, UAE (`131598c44a`). All `href="#project"`; each has `.tag`, h3, small, `<i>↗</i>`; gradient overlay; hover img scale 1.04 (.7s).
- Final black bg (fx17); content zoomed .704 at 1440×900 (fit JS) → the mosaic is visibly narrower/centred. ≤1099: 2 cols, all tiles 360px, big spans both; ≤860 1 col.

### About page-specific CSS — overrides & fights
- Background/colour declarations for `.ex` (#fff), `.ld` (#080808), `.sw` (#F3F0E9), `.fd` (#F3F0E9), `.ph` (#080808) are all overridden by global 1672–1678 and fx15–17 → final alternation white/black as in the table.
- `.i1{padding:120px 0 0}`, `.ph{padding:118px 0 0}`, `.ip{padding:220px 0 115px}`, `.fd/.ex/.ld/.sw` paddings → overridden by global one-screen (104/36) and rhythm rules (120/120).
- `.hero{height:715px}`, `.hero .in{padding-top:168px}` → overridden.
- Global specific to about: 1368 `#p-about .g>div:nth-child(2)>.p{color:#9a958e}`, 1566–1572 stats, 1578/1591/1599–1600/2243 croton (conflicting), 2153–2158 & 2238–2242 responsive.
- Dead: `.svl`, `.ipim`, `.ip .rt`, `.ip .g2`.
- 0 `!important` in the page block, 12 inline `style=""` attributes (3016×2, 3023, 3039, 3049×2, 3061×2, 3071, 3085, 3100, 3101).

---------------------------------------------------------------------------------------------------

## 3. SERVICES — `#p-services` (3115–3234)

- **Route**: `#services`; section ids `svc-architecture … svc-property-care`. Next: `app/services/page.tsx`; individual service pages (`#architecture` etc.) are other agents' pages → `/services/[slug]`.
- **SEO**: title `Architecture, Interior & Construction Services | Katic Designs`; description `Architectural design, interior design, construction, turnkey projects, renovation, landscape and property care for homes and commercial spaces in Kerala and the UAE.`
- Header: `data-variant="listing"` (ignored by JS).

### Final section order & computed look @1440×900

| # | element | id | final bg | h | heading |
|---|---|---|---|---|---|
| 0 | `div.hero` | – | photo | 900 | h1 76px 4 lines |
| 1 | `section.pp-host.wd2` | – | #fff (`.onlight`) | 900 | "What We Do" |
| 2 | `section.fd[data-fx=19]` | – | **#000** | 900 | "Seven services. / One point of / responsibility." |
| 3 | `section.blk.w` | svc-architecture | #fff | 900 | "Architectural Design" 46px Jost 500 (no uppercase) |
| 4 | `section.blk.c.rev[fx21]` | svc-interior | **#000** | 900 | "Interior Design" |
| 5 | `section.blk.d[fx22]` | svc-construction | **#fff** (class says dark!) | 900 | "Construction & Execution" |
| 6 | `section.blk.w.rev[fx23]` | svc-turnkey | **#000** | 900 | "Turnkey Projects" |
| 7 | `section.blk.c` | svc-renovation | #fff | 900 | "Renovation & Remodeling" |
| 8 | `section.blk.d.rev` | svc-exterior | #000 | 900 | "Exterior & Landscape Design" |
| 9 | `section.blk.w` | svc-property-care | #fff | 900 | "Property Care & Maintenance" |
| 10 | CONTACT tpl | services-contact | **#000** | 900 | 54px |
| 11 | footer | | #fff | | |

→ Final: strict white/black alternation, image side alternates (right, left, right, left, right, left, right).

### 3.0 Hero (3167–3177)
- bg `72dc2b2afd` (1440×810); kick `Integrated design and build`; h1 `Architecture,<br>Interiors &amp;<br>Construction —<br><span class="or">Under One Vision</span>`; lead `Katic Designs brings architecture, interior design, construction and related services together to create complete spaces across Kerala and the UAE.`; `.btn.wh` "Explore Our Work ↗" (`#works`).
- `.wd` side index (absolute right:0 top:160, 270px, top border): "OUR SERVICES" + 7 links (`#architecture`, `#interior`, `#construction`, `#turnkey`, `#renovation`, `#exterior`, `#property-care`), hover orange. Hidden ≤1099 (2181).
- h1 stays 76px at 1024 (same bug as About); 37.44 @≤860.

### 3.1 What we do `section.pp-host.wd2` (3179–3187)
- Plant `img.plant.hang.pp.pp-heli` `pp_heli` (380×992), inline `--w:110px`, top-left, mirrored `scaleX(-1)` (1575) — but `transform:none!important` (1603) cancels the mirror too. On ≤860 width ×.58 and the section gets extra top padding (229.9px computed) from the plant-room JS.
- `.two`: kick `Integrated practice`, h2 `What We Do` (inline margin), `.sub` `One studio. One standard. One continuous line from first sketch to final handover.` (Inter 26px); right (inline `padding-top:18px`) lead, `.p`, `.btn.ol.sm` "Our Process ↗" (`#architecture/process`, inline margin).
- `.ksteps.kbody.lt` (inline `grid-template-columns:repeat(4,1fr)`) **4 steps**: Concept "Brief, site and possibility." · Design "Architecture and interiors." · Build "Coordination and execution." · Complete "Details, handover and care." — light-theme 3-D line art (`.onlight`).
- Dead page CSS: `.steps …` (old step cards, 3135–3144) + global 2162/2249.

### 3.2 What we deliver `section.fd[data-fx=19]` (3189–3194)
- `.wrap.two`: kick `What we deliver`, h2 `Seven services.<br>One point of<br>responsibility.` (inline margin), lead (inline `padding-top:22px`) `Every KATIC service on one page. Open any service for its full page, process, projects and enquiry form.`
- Page CSS says #F3F0E9; final **black** (fx19). Mostly empty one-screen section at desktop (lots of whitespace — consider shortening; at 1024 it's 433px).

### 3.3–3.9 Service blocks `section.blk` × 7 (3197–3231)
Structure (identical each): `.tx` (text column) = `.hd` (icon `small.nico` + tagline, bottom border 2px) → h2 → p → `.btn.ol` "Explore …" (`data-arw="ne"`, pinned to the bottom via `margin-top:auto`); `.ims` = `.big` (main image + `.lab` tagline label) + `.th` 4 thumbnails each with `.lab`.

| id | tagline | h2 | p | button → | big | thumbs (labels) |
|---|---|---|---|---|---|---|
| svc-architecture | SITE · CLIMATE · FORM | Architectural Design | Consultation, planning, architecture, elevations and spatial design. | Explore Architectural Design → #architecture | 04fda5757e | df701a74eb VILLA 01, 780b890e52 VILLA 02, 4aac3e510a VILLA 03, 8172bce988 VILLA 04 |
| svc-interior (rev) | MATERIAL · MOOD · FUNCTION | Interior Design | Interior planning, materials, furniture and execution. | Explore Interior Design → #interior | 445f233e70 | 335d18a20f LIVING, fd6e5156e5 LOUNGE, 34fbd87695 KITCHEN, 03553b5ed8 BEDROOM |
| svc-construction | PLAN · BUILD · INSPECT | Construction &amp; Execution | Residential and commercial construction, project coordination and finishing. | Explore Construction → #construction | 129d81a52a | 465ad48711 SITE 01, f1c16f4f12 SITE 02, 596a914967 MODEL, 5aadd606b7 SURVEY |
| svc-turnkey (rev) | BRIEF TO HANDOVER | Turnkey Projects | Complete project delivery for residential, commercial and hospitality spaces. | Explore Turnkey Projects → #turnkey | 1a2f69cee0 | 94825e8aa6 FACADE, 392c9415ec DINING, 9f6d8d2f6c COURTYARD, 54f1a3ee2e RESIDENCE |
| svc-renovation | RETHINK · RESTORE · RENEW | Renovation &amp; Remodeling | Transforming existing spaces through renovation and redesign. | Explore Renovation → #renovation | df57ba68fe | 8d5ca34a10 HOME, 0e599c0712 WELLNESS, 01aabb2353 ATELIER, 181d7cb449 MONSOON |
| svc-exterior (rev) | FACADE · GARDEN · OUTDOOR | Exterior &amp; Landscape Design | Outdoor spaces, parks, facades and landscape planning. | Explore Exterior &amp; Landscape → #exterior | 9f6d8d2f6c | 96147274e0 RAIN GARDEN, e8a04ff192 COURTYARD, 67fde5f298 TERRACE, fe0aeb97f8 VILLA |
| svc-property-care | INSPECT · MAINTAIN · SUPPORT | Property Care &amp; Maintenance | Property maintenance, repairs and ongoing support. | Explore Property Care → #property-care | c409203399 | 113b954da6 DETAIL, 67932608a0 BATH, 10c3a14757 SCREENS, 316380ce3f HOME |

Icons (`.nico` SVGs): leaf, layers, shield-check, key, hammer/wrench, building, shield-check (construction & property care share the shield).
- Layout desktop (page CSS 3145–3166 + global 1656–1658): **not inside `.wrap`** — full-bleed grid `560px 1fr` (`rev`: `1fr 576px`, text `order:2`); `min-height:var(--svh)`, `.ims{grid-template-rows:minmax(245px,1fr) 204px;padding:52px 16px}`, `.th` 4 cols gap 16; text padding `52px 80px 0 70px` (rev `52px 64px 0 86px`). Note the text left edge is 70px (not the 86px gutter used elsewhere) and the image grid runs to x≈1424 (under the fixed side rail).
- `.lab` = black 82% chip, 8.5px Inter .2em, bottom-right of each image.
- ≤1099: single column, text first (`order:0`), padding 48/36, button margin 28px 0 0 (2159–2161). ≤860: `.ims` rows 220/120 padding 24/0, thumbs gap 8 (2287–2288). **h2 stays 46px on phones** (no responsive rule) — 2-line "Architectural / Design" with `line-height:normal`.
- Effects: thumbs hover `scale(1.06)` .6s; **every image opens the lightbox** (`data-zoom` added by JS 5296 for `#p-services .blk img`; click → `.klb` overlay, Esc/click closes); **parallax** on `#svc-architecture .big img` only (PX map JS 5008).
- Dark variant styles `.blk.d` (3161–3165) + global 1716 `#p-services .blk.d .tx{background:#000!important}` — but fx22 makes `#svc-construction` white, so the `.d` styling only actually applies to `#svc-exterior`.

### Services page-specific CSS — overrides & fights
- `.blk.c{background:#F3F0E9}` → overridden to #fff (1692/1695) or #000 (fx21). `.fd{background:#F3F0E9}` → black (fx19). `.wd2` padding → one-screen rule.
- `.blk{height:566px;overflow:hidden}` → `height:auto!important;min-height:var(--svh)` at ≥1100 (1656).
- `.hero .in{padding-top:118px}`, `.hero{height:715px}` overridden.
- Inline `style="color:#fff"` on 2 h2s (3208, 3223) — one is overridden by fx22 (→ black), the other redundant.
- 0 `!important` in the block; 10 inline style attributes (3179, 3182, 3183×2, 3185, 3191, 3192, 3208, 3223 + `--w`).

---------------------------------------------------------------------------------------------------

## 4. Components — shared vs unique, proposed React API

### Shared (used on these pages AND others — build once)
| Component | Source classes | Used by | Props |
|---|---|---|---|
| `SiteHeader` | `data-tpl=header` | all | `active: RouteKey; overlay?: boolean` (hero-overlay vs scrolled) |
| `SiteFooter` | `data-tpl=footer` / `.ftw` | all | – |
| `PageHero` | `.hero .bg .shade .wrap.in .h1 .lead .btns` | all inner pages | `kicker: string; kickerStyle?: 'line'|'dot'; title: ReactNode` (with `<Accent>` for `.or`); `lead: string; image?: ImageKey; video?: {desktop, mobile, posterDesktop, posterMobile}; actions: CTA[]; align?: 'center'|'bottom'; aside?: ReactNode` (services `.wd` index, about `.vl` labels) |
| `Section` | `.ks`, `.ks.dk`, one-screen wrapper | all | `id?; tone: 'light'|'dark'; fullHeight?: boolean; className?` |
| `SectionHeader` | `.kh` (2-col: kick+h2 | lead+button) and `.two` | all | `kicker; title: ReactNode; lead?; action?: CTA; layout?: 'split'|'stacked'` |
| `Kicker` | `.kick(.int)(.w)` | all | `children; tone?` |
| `Button` | `.btn` `.wh/.dko/.ol/.dk/.sm`, `data-arw` | all | `href; variant: 'light'|'darkOutline'|'outline'|'dark'; size?: 'sm'|'md'; arrow?: 'right'|'ne'|false; onClick?` |
| `CardGrid` + `LinkCard` | `.kc-grid.c4/.c5 .kc .im h3 p .k-more` | about (services, divisions) + service/division pages | `columns: 2|3|4|5; items: {href, image, title, text, more}[]` |
| `ProcessSteps` | `.ksteps.k3d .s .art3` + `KATIC_ART` | about approach, services, service pages | `steps: {title, text, icon?, artIndex?}[]; tone; columns` — port the iso-SVG generator (JS 4870–4908) to a `IsoArt` component with `stage: 0..6`, `drawn` driven by IntersectionObserver |
| `ShowcaseCard` | `.sc-card .sc-ov .sc-pill .sc-more` | home sig + works (and works page?) | `image; pill; title; subtitle; href?` |
| `ContactSection` (+ `faq` slot) | CONTACT tpl, `.contact.combo` | all pages | `id; tone; prefillService?; faq?: FaqItem[]` — when `faq` present render the combo 2-col layout |
| `FaqAccordion` | `.faq.kfaq .qa .qh .qb` | home + service/division pages | `items: FaqItem[]; defaultOpen?: number; single?: true` |
| `NewsCard` / `NewsGrid` | `.knews-grid .knw` | home + news page | `items: NewsItem[]` |
| `BlogTeaser` | `.kbh .ft-post .li` | home (+ blog latest) | `posts: BlogPost[]` (featured = newest, list = next 3) |
| `DivisionsCarousel` | `.dvx` | home (maybe division pages) | `divisions: Division[]; autoplayMs=5000` |
| `Plant` | `img.plant.*` | many | `src; position: 'tr'|'br'|'tl'; width; mirror?` (static — animations are disabled) |
| `Lightbox` | `.klb`, `data-zoom` | services, project, etc. | context provider + `ZoomableImage` |
| `Parallax` hook | PX map JS 5008, sig parallax | about, services, home | `useParallax(ref,{amount:24, scale:1.3})` |

### Page-unique
- Home: `HomeHero` (video variant of PageHero), `AboutTeaser` (`.ab`: `stats: Stat[]`, `values: Value[]`, `partners: Partner[]` marquee, counters), `LogoMarquee` (`logos; speedSec=18; pauseOnHover`), `SignatureProject` (`project: {bg, title, text, href, rooms: ShowcaseCard[]}` + bg parallax), `ServicesExplorer` (`.svx`: `groups: ServiceGroup[]; autoplayMs=6000; onQuote(service)`), `WorksCoverflow` (`.wk.pinsec`: `projects: Project[]; filters: Filter[]`, sticky scroll-scrub ≥1100, snap carousel <1100), `ProcessHorizontal` (`.stg`: `stages: Stage[]`, sticky horizontal scrub), `TestimonialsSlider` (`.cs`: `testimonials: Testimonial[]`), `ScrollProgressBar`.
- About: `IntroWithImages` (`.i1` imr mosaic), `PhilosophySection` (`.ph` image+tags), `FounderNote`, `StatsBand` (`.ex` — could share with home stats with `variant`), `TeamGrid` (`members: TeamMember[]`), `WorkMosaic` (`.sw`: exactly 4 projects; layout big/tall/small/small).
- Services: `ServicesIndexAside` (hero `.wd`), `ServiceBlock` (`.blk`: `service: Service; reverse: boolean; tone: 'light'|'dark'`).

---------------------------------------------------------------------------------------------------

## 5. Data that should come from Laravel (proposed TS types)

```ts
type ImageRef = { key: string; src: string; width: number; height: number; alt: string };

// Services (7) — used by home .svx, about #about-services, services .blk, hero .wd, FAQ, contact <select>, PREFILL map
interface Service {
  slug: 'architecture'|'interior'|'construction'|'turnkey'|'renovation'|'exterior'|'property-care' | string;
  name: string;                    // "Architectural Design"
  category: 'Design' | 'Construction';
  order: number;                   // NB home order ≠ about/services order today
  tagline: string;                 // "SITE · CLIMATE · FORM"
  shortDescription: string;        // about card / services .blk p
  teaser: string;                  // home .svx-cap p
  highlights: string[];            // 4 bullets (home)
  icon: string;                    // nico icon id
  heroImage: ImageRef;             // .blk .big / home media
  cardImage: ImageRef;             // about .kc
  gallery: (ImageRef & { label: string })[]; // 4 thumbs + .lab
}

interface Division {
  slug: 'design'|'interior'|'infrastructure'|'developers'|'care';
  name: string;                    // "KATIC Design"
  icon: string;
  headline: [string, string, string]; // 3-line dvx h3
  summary: string;                 // about card p
  description: string;             // home dvx-ft p
  image: ImageRef;                 // dvx media (dd0000000x)
  cardImage: ImageRef;             // about card
}

interface Project {
  slug: string; title: string;
  location: string;                // "Thrissur, Kerala"
  discipline: string;              // "Architecture", "Interiors" (text after the em-dash)
  pill: string;                    // display tag
  categories: ('residential'|'commercial'|'architecture'|'interiors'|'villas'|'hospitality'|'institutional')[];
  cover: ImageRef;
  featured?: { signature?: boolean; homeWorks?: boolean; aboutMosaic?: 'big'|'tall'|'small' };
  rooms?: { title: string; subtitle: string; image: ImageRef }[]; // signature project cards
}
interface ProjectFilter { slug: string; label: string } // All, Residential, Commercial, Architecture, Interiors, Villas / Flats

interface Testimonial { quote: string; author: string; company: string; portrait: ImageRef; projectImage: ImageRef; projectSlug?: string }

interface NewsItem { slug: string; title: string; excerpt: string; category: string; date: string /*ISO*/; image: ImageRef }

interface BlogPost { slug: string; title: string; category: string; categorySlug: string; date: string; excerpt: string; image: ImageRef; author: string; readTimeWords?: number; body?: unknown } // mirrors POSTS {s,t,c,d,v,i,a,x,b}

interface FaqItem { question: string; answer: string; link?: { label: string; href: string } }

interface ProcessStage { title: string; text: string; icon: string; artIndex: 0|1|2|3|4|5|6 }

interface Stat { value: number | string; suffix?: string; label: string; caption?: string } // home: 200+/11yrs/500+/Eco ; about: 11+/200+/2/6

interface CompanyValue { title: string; text: string; icon: string } // Precision…Craftsmanship
interface Partner { name: string; logo: ImageRef; url?: string }
interface TeamMember { name: string; role: string; bio: string; photo: ImageRef }
interface Founder { name: string; title: string; paragraphs: string[]; quote: string; photo: ImageRef }
interface PageSeo { title: string; description: string; canonical: string; ogImage?: string }
```
Static (fine in code/CMS singletons): hero copy, section headings/leads, philosophy tags, "what we do" steps.

---------------------------------------------------------------------------------------------------

## 6. Bugs, inconsistencies, placeholders, a11y

### Visual / layout
1. **Home @1024: horizontal overflow (scrollWidth 1057)** — `#p-home .cs .g{grid-template-columns:346px 1fr 346px}` (page CSS 2513; mobile collapse only in global 2233) only collapses at ≤860; right card spills 33px past the viewport (`v-home-1024-08-home-stories-0.jpg`).
2. **About approach header not laid out**: `.kh` outside `.ks` → `display:block` (§2.2).
3. **Fit-to-screen zoom** makes About `.i1/.ld/.sw` content narrower & misaligned with the 86px gutter (zoom .888/.924/.704) — and the result depends on viewport height.
4. **Logo marquee jump**: keyframe `translateX(-776px)` (2409) was computed for 178px logos + 16 gap; logos were later shrunk to 150px (2588) → one loop = 664px → visible jump each cycle. Use `-50%` of a duplicated track.
5. **About hero `.vl` labels upside-down** (`rotate(180deg)` without `writing-mode:vertical-rl`).
6. About/Services **hero h1 not scaled at 1024** (76px) while Home is 62px (specificity: `#p-about .hero h1` > global `html body .page .hero h1`).
7. Services `.blk h2` 46px with `line-height:normal` on phones — oversized; no ≤860 rule.
8. Services `.blk` text column starts at 70px instead of the 86px gutter; image column reaches x≈1424 and is covered by the fixed side contact rail; `.lab` on big image partially hidden.
9. `#svc-construction` has class `d` (dark) and inline white h2 but renders white-on-white→black text due to fx22: the class names lie. Same for `#svc-interior` (`c` = cream) rendering black.
10. `.fd` "What we deliver" on services is a near-empty full-screen black section at desktop.
11. Home `.stg .row` on <1100 has `cursor:grab` but no drag handler; scroll region not keyboard-focusable.
12. About services grid c4 with 7 cards leaves an empty slot; home `.svx` order (Exterior 3rd) differs from about/services order (Exterior 6th).
13. Duplicate icons: home process Concept=Design (compass), Engineering=Construction (crane); home values Innovation=Light (bulb); about approach Plan=Design; services Construction=Property Care (shield).
14. Croton plant rules conflict (`display:none` 2243 vs `display:block!important` 1591 on ≤860).
15. `.pp-heli` mirror `scaleX(-1)` is cancelled by the global `transform:none!important` (1603) — plant faces the wrong way vs intent; all plant sway animations dead.

### Content / data
16. **Placeholders**: "FOUNDER NAME", "Founder Name leads…", "Manager Name 01–04", contact phone "+1 (000) 000-0000", WhatsApp `10000000000`, all project links `#project`, all news links `#news` (no per-article pages), signature "View Project" `#project`.
17. **Template leftovers**: works cards located in **Skopje, MK / Galičica, MK** (Macedonia) — not plausible for a Kerala/UAE studio; client "K. Dimitrov / Riverline Offices".
18. Inconsistent facts: "EST. 2013" + "11yrs" (2013→2026 = 13); about "11+ years", "6 Disciplines" vs "Seven services"/"Five divisions"; "Projects Delivered 200+" vs "Spaces delivered 200+"; hero says "houses in the mountains" (Kerala/Dubai coastal).
19. Same project name with different data: "Obsidian Lounge" = Skopje commercial interior (home, img 86a8b11cf8) vs Kochi residential interior (about, img a16247ad87). Same images reused for unrelated items (987e492e7a, 0e599c0712, 131598c44a…).
20. Filter/category mismatches: "Serein Wellness Club" pill "Commercial" but `data-cat` lacks `commercial` (absent under Commercial filter); `hospitality`/`institutional` have no tab; "Nila Apartments" tagged `villas`.
21. Home blog category chips (9 links) hidden globally — dead markup.
22. Duplicate partner logos have wrong alt text: `alt="We Build Spaces That Endure."` ×3 and `alt="200 +"` (2823) — should be `alt=""`/`aria-hidden` on the clone set.
23. Stories initial alts `alt="From Brief To Built"` on both cards (meaningless); JS later sets "<name> — client portrait".
24. Services image alts repeat the service name 5× per block; About `.imr .b` alt is a slogan.

### Markup / code
25. FAQ "Start a project" link `href="contact"` (missing `#`; relies on `data-go`).
26. `data-variant` on header placeholders ignored; `data-tpl="rail"` removed — dead attributes.
27. Runtime **duplicate SVG id `kg`** (gradient) — every stage/step SVG defines `<linearGradient id="kg">` (JS 4900) → 7 on home + one per ksteps step site-wide. Use `useId()`.
28. Dead CSS/JS (≈45% of home style): `.dl`, `.sx`, `.sig .tabs/.cards/.pg`, `.wk .cards/.c`, `.stg .bar/.cnt`, about `.svl/.ipim/.ip .rt/.ip .g2`, services `.steps`; JS `.sx` explorer (5026–5048), `.sform` inline enquiry (5019–5025), RV entries for `.dl/.wk .c/.sig .tabs…`, `[data-stage]` counter.
29. Unscoped global rules living in the home page `<style>` (`.nico`, `.sc-*`, keyframes) — must be moved to global CSS or other pages break when home CSS is code-split.
30. 69 `!important` in home style; `data-fx` 3-ID-specificity colour rules override page CSS and inline styles (the true design is only visible in computed output).
31. Inline styles: home 1, about 12, services 10 (listed above).
32. `.svx-it` uses `aria-current="true|false"` on buttons (should be a tablist: `role=tab`/`aria-selected`, captions `role=tabpanel`, or `aria-pressed`).

### Accessibility
33. **Auto-advancing content without a pause control** (WCAG 2.2.2): hero video (loop, no controls), logo marquee (only hover-pause), services explorer (6s; pauses on hover/focus), divisions carousel (5s; mouse hover doesn't pause unless focus-within). Add visible pause buttons.
34. Divisions carousel: has `aria-roledescription="carousel"` but slides lack `role="group" aria-roledescription="slide" aria-label="n of 5"`, no live region; prev/next buttons lack `type="button"` (harmless outside forms).
35. Testimonial slider: no `aria-live="polite"` on the quote; generic "Previous"/"Next" labels; images swap with no announcement.
36. Works filters are `<a href>` with JS-added `role=button` + `aria-pressed` and prevented navigation — use `<button>`s (keep `href` semantics only if they should deep-link).
37. Signature cards are `<article>` with no link/action although they look clickable.
38. Lightbox triggers on `<img>` click only (not focusable, no keyboard access, no dialog role/focus trap).
39. Hero `.vl` text upside-down (also odd for screen readers: "ABOUT \ 01" is read).
40. Heading order OK overall (one h1 per page, h2 per section, h3 in cards); exceptions: About `.imr .s` slogan is `<b>`, home quote has no heading (fine). Kickers duplicate h2 text in About `.ex` ("Built on experience" / "Built on Experience").
41. Low-contrast text: `.lab` 8.5px, About `.ld .c small` 9.5px, `.sw .t small` 9px letters, hero `.vl` 9px #bbb — tiny type below legible size.
42. Horizontal scrollers (`.stg .row`, `.sc-track` on tablet/mobile) aren't keyboard-focusable (`tabindex="0"` + label needed).

---------------------------------------------------------------------------------------------------

## 7. Rebuild notes / recommendations (Next.js + Tailwind)
- Treat the **computed** values (tables above + screenshots) as the spec; the cascade in the source is not portable. Encode tokens: `--or #E8622C`, `--or-t #C24E1E`, fonts Jost (`--fut`) / Inter (`--int`), container 1268 + 86px gutter, one-screen section (`min-h-[var(--svh)]`, `pt-[104px] pb-9`, flex centre) at ≥1100, desktop scale by `--z` (decide with the global agent whether to keep the zoom-to-1440 approach or go fluid).
- Implement the two sticky scroll-scrub sections (`WorksCoverflow`, `ProcessHorizontal`) with `position:sticky` + a scroll-progress hook (or Framer Motion `useScroll`), matching the formulas in §1.4/§1.5 (section height = vh·(1+(n−1)·0.6); travel = 380 + overflow + 110; height = vh + 1.25·travel).
- Reveal system: replicate `data-rv` variants (`fade-up 46px 1s`, `clip` = translateY 70 + skewY 4° + blur 8 1.2s, `left` −60px, `scale` .92) with 0.09s stagger capped at 6 — home only in the original; decide whether to extend to other pages.
- Prefer real `<button>`/`role="tablist"` semantics for explorer/carousels and add pause controls.
- Move every project/service/division/testimonial/news/FAQ item into the data layer (§5) so the same entity renders identically on all pages (fixes bugs 17–20).
