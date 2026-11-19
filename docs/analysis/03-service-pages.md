# C — Service-detail pages (8): template analysis

Source: `reference/original/katic-designs-final.stripped.html` lines **3236–3602**.
Pages: `#p-architecture` 3236–3412 (own `<style>` 3237–3313), `#p-interior` 3413–3439, `#p-factory` 3441–3465,
`#p-construction` 3467–3491, `#p-turnkey` 3493–3520, `#p-renovation` 3522–3548, `#p-exterior` 3550–3575,
`#p-property-care` 3577–3602.
Images: `data-img="<key>"` → `reference/original/assets/img-<key>.webp`. All 56 keys used in this range exist (checked).

---

## 0. TL;DR

* **Seven of the eight pages use one template**: the `.ks` block system (global CSS 1737–1884, 1991–2013, 2040–2112). The exception is **architecture**. It keeps the same skeleton (hero → … → related → divisions → testimonials → contact+FAQ) but replaces 4 blocks with page-scoped bespoke sections (`.ap`, `.sv`, `.pr`, `.ap2`) styled in its own `<style>` (3237–3313).
* **Backgrounds strictly alternate** white/black after the hero on every page, so a section's tone can be derived from its index. It doesn't need to be stored. The contact+FAQ block is always last. It is **light** (forced by a `data-fx` override) when the section before it is dark, and dark otherwise.
* **At runtime the contact section and the FAQ section are merged** into one `.contact.combo` section (JS 4692–4703). FAQ sub-copy and the "Ask us directly →" link are **deleted** by the merge. Build this as one `<ContactFaq>` component.
* The **page-specific parts** are: the hero copy and image, which blocks appear (and in what order), the content of each block, the related-services subset, the divisions subset, the 3 testimonials picked, the contact-form extra fields, and the FAQ. Renovation adds **BeforeAfter**. Factory adds **Gallery** and has no related or testimonials blocks. Construction/exterior have no process block. Property-care has no projects block.
* JS enhancements that apply to these pages:
  * a 3D line-art draw-on for every `.ksteps` (4911–4924) and every `.kfeat` (4926–4929)
  * light/dark line-art detection (`onlight`, 5088)
  * fit-to-one-screen zoom at ≥1100px (5085–5104)
  * a lightbox on `[data-zoom]` (5296–5298)
  * the FAQ accordion (4856)
  * contact prefill via `data-svc` and `PREFILL[src]` (4749–4763)
  * plant sway (CSS 1037–1048) plus phone padding (5285–5293)
  * deep-link anchors `#page/anchor` (router 4726–4747, contact-id rename 4776–4778)

---

## 1. Section-type vocabulary

Common atoms (global, not catalogued here, but used everywhere):

* `.wrap`: width `min(1268px, 100% - 172px)`; at <1100 it is `100% - 72px` (2138).
* `.kick.int`: kicker with a 22px orange rule. `.w` makes it white, but on light `.ks` sections `.kick` is forced to `--or-t #C24E1E` (1363), so the stray `w` there is harmless.
* `.st`: 58px Futura uppercase section title. 46px at <1100 (2147); 34px at ≤860 (2201).
* `.lead`, `.p`, and `.btn` with `.wh/.ol/.dk/.dko/.sm`.
* `.nico`: inline SVG icon. Rules live in the **home page** style block, 2759–2767, not in the global sheet: 28px by default, 20px inside `.r`.
* `.or`: orange accent span.

Section rhythm (global):

* **≥1100px**: every `.page>section` except hero is `min-height:var(--svh)` with flex column and centred content, and padding `104px 0 36px !important` (1052, 1650–1654). JS `fit()` (5085–5104) then applies CSS `zoom` (min 0.66) to the section's children if the content is taller than one screen. Page `zoom:var(--z)` also applies (194). In React this is a global `useFitToScreen` hook. The global agent should own it.
* **<1100px**: padding `80px 0 80px !important` (2297); hero `height:auto; min-height:100svh` (2296, 2300).
* **≤860px**: hero becomes a bottom-aligned flex column, h1 is `clamp(32px,9.6vw,42px)`, and `.hbtns` stack full-width at 50px (1189–1203).

### 1.1 `SectionHeader` — `.kh` (inside every `.ks` block)
```html
<div class="kh"><div><div class="kick int [w]">Kicker</div><h2 class="st">Line<br>Line</h2></div>
  <div><p class="lead">…</p>[<a class="btn ol|dk|dko">CTA <svg NE/></a>]</div></div>
<div class="… kbody">…</div>
```
* Grid `646px 1fr`, `align-items:end` (1739). The lead is 16px/1.8 `#555`, or `#bbb` on dark (1741–1742). `.kbody` has `margin-top:60px` (1745).
* At <1100 it becomes 1 column with a 28px gap (2314).
* The right `<div>` is sometimes **empty** (Related services, the turnkey "Why", and a few others). Keep the column even when it's empty so the left column width doesn't change. Rendering `<div/>` is enough.
* Props: `kicker`, `title` (lines array), `lead?`, `cta?: {label, href, variant:'ol'|'dk'|'dko'}`.
* Title line-breaks are authored with `<br>`, so store titles as `string[]` lines.

### 1.2 `ServiceHero` — `.hero.kh-hero` (7 pages) / `.hero` (architecture)
Standard (e.g. 3414–3416):
```html
<div class="hero kh-hero"><div class="bg"><img data-img="KEY" alt="Banner photo: …"></div><div class="shade"></div>
<div data-tpl="header"></div>
<div class="wrap in"><div class="kick int w">Kicker</div><h1 class="h1">Line<br>Line <span class="or">Accent</span></h1>
<p class="lead">…</p><div class="hbtns"><a class="btn wh" href="#contact" data-go="contact" data-svc="…">Primary <svg NE/></a><a class="btn dko" href="…">Secondary <svg NE/></a></div></div></div>
```
* Desktop:
  * height `max(var(--svh),720px)` (1651)
  * shade `linear-gradient(90deg,.74,.42 55%,.25)` (1751)
  * `.in` `padding-top:190px` (1752)
  * h1 74px/1 with `margin-top:22px` (1753)
  * lead 17px/1.7 `#eee`, max 640px (1754)
  * `.hbtns` flex with a 16px gap; buttons are 54px tall with 0 26px padding and 12.5px/600 type (1755–1756)
* Mobile: see 1189–1203. The shade turns vertical (0deg .82→.28), buttons go full width, and `.hero>.wrap:not(.in)` and `.bt` are hidden.
* **Architecture variant** (3314–3325, CSS 3238–3244):
  * not `.kh-hero`
  * h1 76px/.99 with `margin-top:20px`
  * lighter shade (.62/.3/.15)
  * lead 660px `#f2f2f2`, `margin-top:26px`
  * **one** button (`btn wh`, `data-arw="ne"`, so JS appends the NE arrow at 4704), 20px top margin
  * a bottom caption `<span class="bt">PRIVATE RESIDENCE · KOCHI</span>` (10px, .24em tracking, `#ccc`, `bottom:34px`) inside an inline-styled absolute `.wrap`
  * `data-variant="details"` on the header placeholder and a `.rail` placeholder. **Both are no-ops**: `header()` always uses `V.home` (4640–4648) and rails are removed (4688).
  * Model it as `variant:'architecture'` (single CTA + caption, alternative sizes).
* Props: `image`, `imageAlt`, `kicker`, `title: {lines, accent}`, `lead`, `primaryCta: {label, service}`, `secondaryCta?: {label, href}`, `caption?`, `variant`.
* Both CTAs use the NE arrow `M3 9 9 3M4 3h5v5` (4612).

### 1.3 `SplitFeature` — `.ksplit` (`.rev` mirrors)
```html
<section class="[pp-host] ks [dk]"><img class="plant pot pp br-c" …>?<div class="wrap"><div class="ksplit [rev]">
 <div class="im"><img data-img="KEY" alt="…" data-zoom><span class="cap">Caption</span></div>
 <div class="tx"><div class="kick int">…</div><h2 class="st">…</h2><p class="lead">…</p><p class="p">…</p><ul><li>…×4</li></ul>[<a class="btn ol">…</a>]</div></div></div></section>
```
* Layout:
  * Grid `1fr 1fr`, 64px gap, `align-items:center` (1815).
  * `.im` 560px tall; `.cap` is a dark chip at bottom-left (1817–1819).
  * Lead 18px/1.65, `margin-top:28px`; `.p` `#555` (`#aaa` on dark).
  * Bullets: a 2-column grid; each item has an orange 6px square and a bottom rule (1824–1827).
  * `.btn` `margin-top:30px`.
* `<1100`: 1 column, and `.rev` resets the order to 0 (image first) (2314–2315). `≤860`: `.im` 320px, bullets in 1 column (2326–2327).
* Interaction: `data-zoom` opens the image in the lightbox (`.klb`, CSS 1976–1980, JS 5296–5298).
* Props: `image`, `imageAlt`, `caption`, `kicker`, `title`, `lead`, `body?`, `bullets?: string[]`, `cta?`, `reverse?`, `plant?`.

### 1.4 `RowList` — `.krows` (services list)
```html
<div class="krows kbody"><a class="r" href="#factory"> | <div class="r">
  <span class="n nico"><svg/></span><b>Title</b><span>Text</span><i>↗ | (empty)</i></…>
```
* Rows are a grid `64px 300px 1fr 24px`, `min-height:84px`, with a top rule `#e1ddd5` (or `rgba(255,255,255,.18)` on dark) (1777–1785). The title is 22px; `a.r:hover b` turns orange.
* `<1100`: `44px 1fr 20px`, and the text drops into column 2 (2316–2317).
* Items can be **links or not**. Interior mixes them: only the "Furniture & joinery" row links to `#factory`. Turnkey's rows are all links. Exterior's rows are all non-links. Non-link rows render an empty `<i></i>`.
* Props: `items: {icon, title, text, href?}[]`.

### 1.5 `FeatureGrid` — `.kfeat`
```html
<div class="kfeat kbody" style="grid-template-columns:repeat(3|4,1fr)"><div class="f"><small class="nico"><svg/></small><h3>…</h3><p>…</p></div>…
```
* Cards: 1px border `#e3dfd7` (dark: `#0c0c0c` background, `#262626` border). The border turns orange on hover (1806–1813).
* Desktop overrides (1084–1087): 14px gap, `22px 24px 24px` padding.
* **JS**: inserts `<div class="ic3">` with a unique isometric 3D line icon chosen from the h3 text (`KATIC_ICON.pick`, 4926–4929). It adds `.lt` when the grid is not inside `.dk`. It stagger-draws the icons with `.drawn` at 140ms steps once the grid is 20% visible.
  * CSS 2097–2112: stroke-dashoffset animation over 1.6s; the radial glow strengthens on hover; the SVG lifts 4px.
  * `.ic3` is 150px tall, but **96px at ≥1100** (1086).
  * The small `.nico` icon is still rendered underneath (`.kfeat .f small{display:block}` 2111), so each card shows **3D art + small icon + h3 + p**.
* The `style` grid-template-columns is load-bearing: 3 columns on factory/construction/renovation/property-care, 4 on turnkey "Why". `[style*="repeat(5"]` hooks exist (2112) but nothing on these pages uses them.
* Breakpoints: 2 columns at <1100 (2312), 1 column at ≤860 (2324).
* Props: `columns: 3|4`, `items: {icon, title, text}[]`. The 3D icon is derived from the title in JS; port `KATIC_ICON` as a util (global agent).

### 1.6 `ProcessSteps` — `.ksteps`
```html
<div class="ksteps kbody" [id="process-tl"] style="grid-template-columns:repeat(N,1fr)"><div class="s"><small class="nico"><svg/></small><h3>…</h3><p>…</p></div>…
```
* Base CSS has a horizontal orange line and dots (1797–1804). **JS always adds `.k3d`** (4915), which hides the line and dots (2060–2062). It then:
  * prepends `.art3`, an isometric scene. The scene index (0–6) comes from keyword regexes on the h3 (`KW`, 4912). The fallback is the step position scaled to 0–6, and the keyword pick is overridden if it is more than 2 away from that position.
  * stagger-adds `.drawn` at 220ms steps when the grid is 25% visible (4921)
  * adds `.lt` when the grid is not inside `.dk`/`.pr` (4916): dark strokes and #111 headings
  * marks light sections with `.onlight` (5088, CSS 1076–1081)
* k3d typography (2074–2077):
  * `small` is 12px Futura orange
  * h3 is 30px/1.05 Futura uppercase, **22px when N is 6 or 8** (2087)
  * p is 14px/1.7 `#8f8984`
  * `.art3` is 170px tall, or 120px when N is 6 or 8 (2063, 2088)
* N used: 5 (architecture, interior, factory, property-care), 6 (renovation), 8 (turnkey).
* Breakpoints: 2 columns with a 44px row gap at <1100 (2313), 1 column at ≤860 (2324).
* Props: `columns` (= number of steps), `items: {icon, title, text}[]`, `id?`.
* Step copy is drawn from a **shared "master process" library**. The same 8 stage texts are reused verbatim by interior, turnkey and renovation: Discovery, Concept, Design, Engineering, Construction, Completion, Handover, Aftercare. Store them once and reference them by key.

### 1.7 `SectorGrid` — `.ksec`
```html
<div class="ksec kbody" style="grid-template-columns:repeat(4|5,1fr)"><a href="#works/works-list/residential"><img data-img><div class="lb"><small>SECTOR</small><b>Residential</b><span>…</span></div></a>…[<div class="t">…ENVIRONMENT…</div>]
```
* Tiles are 400px tall with an image, a bottom gradient (`.05→.75`), and the label at bottom-left. Hover scales the image to 1.05 (1787–1795).
* Breakpoints: 2 columns at <1100, 1 column at ≤860.
* The **4 sector tiles are identical on every page that uses them**: same images (`bae1754840`, `01aabb2353`, `32404913f1`, `0e599c0712`), same copy, same links. Exterior adds a 5th **non-link** tile `div.t` (`96147274e0`, "ENVIRONMENT / Outdoor environments") and uses `repeat(5,1fr)`.
* Props: `sectors: SectorKey[]`, `extra?: {image, small, title, text}`. The sector data is global.

### 1.8 `CardGrid` — `.kc-grid.c3|c4` (`.kc`): three flavours
* **Project card** (featured projects): `<a class="kc" href="#project"><div class="im"><img></div><small>Type · Scope · Location</small><h3>Name</h3><span class="k-more">View Project <b>→</b></span></a>`
* **Service card** (related services): `…<div class="im"><img></div><h3>Service</h3><p>Desc</p><span class="k-more">Explore Service <b>→</b></span></a>`
* **Product card** (factory "Finished products"): image, h3, p, then "View Project →". There is no `small`.
* CSS 1759–1775:
  * `.im` is 300px by default, c4 260px, and **c3 200px at ≥1100** (1088)
  * `small` is 9px orange `#c0522a` (`#E8622C` on dark, 1365)
  * h3 is 23px; hover scales the image to 1.04 and turns the h3 orange
  * `.k-more` sits at `margin-top:auto`
* Breakpoints: 2 columns at <1100, 1 column at ≤860.
* Related-service cards are **global data**: same image/title/desc for each service everywhere. The page only chooses which ones appear and in what order. For example, Architectural Design always uses `987e492e7a` with "Consultation, planning, architecture, elevations and spatial design."
* Props: `variant:'project'|'service'|'product'`, `columns:3|4`, `items`.

### 1.9 `Gallery` — `.kgal` (factory only, 3448)
* `figure` (320px, 3 columns); `figure.w` spans 2 columns. Figcaption is white uppercase at bottom-left with a text shadow. Images carry `data-zoom` (1880–1884).
* Factory has 5 figures with the last one wide, so the grid fills as 3+2.
* Breakpoints: ≤860 gives 1 column, and `.w` stops spanning (2324–2325). **<1100 has no rule**, so the gallery stays at 3 columns on tablets.
* There is an empty `class=""` on 4 figures. That is harmless.

### 1.10 `BeforeAfter` — `.kba` (renovation only, 3530, `id="ba"`)
```html
<div class="kba kbody"><div class="pr"><figure><img data-zoom><span>BEFORE</span></figure><figure class="af"><img data-zoom><span>AFTER</span></figure>
<div class="tx"><h3>…</h3><small>Commercial · Aluva</small><p>…</p></div></div>…
```
* Layout:
  * Each pair is a grid `1fr 1fr 360px`, `align-items:end`.
  * Figures are 380px tall, **250px at ≥1100** (1092).
  * The BEFORE chip is `#111`; the AFTER chip is orange.
  * Pairs are separated by a 56px gap (28px at ≥1100).
  * CSS 1870–1878.
* <1100: one column (2314).
* **This is static side-by-side, not a slider.**
* Props: `pairs: {before, after, title, meta, text}[]`.

### 1.11 `DivisionsStrip` — `.ks.slim` (`.kdiv`)
```html
<section class="ks slim [dk]"><div class="wrap"><div class="kdiv"><small>Explore our divisions</small><a href="#div-design">KATIC Design <i>↗</i></a>…
```
* The base is pill buttons (1831–1836), but the `.page>section.ks.slim` overrides (1065–1073) turn it into a **full-height list**:
  * Each link is 46px Futura uppercase, full width, with rules `#ddd` (light) or `#2a2a2a` (dark) and a 28px arrow.
  * At ≤860 the links are 26px with 16px padding.
  * The section is a full-screen-height block with almost nothing in it. That's intentional, but visually sparse.
* Props: `divisions: DivisionKey[]` (2–5 items).

### 1.12 `Testimonials` — `.kq`
* Header with lead "Selected feedback … Representative copy — replace with approved client testimonials." (a **placeholder** visible in the UI) and `btn dk` "Read All Client Reviews" → `#reviews`.
* 3 cards, each: `“` mark, a 18px/1.5 `q`, and a `.who` row (40px round avatar, name, 9px uppercase meta) (1838–1847). Light variant: `.ks:not(.dk) .kq .c` is white with border `#e3dfd7` (1840).
* Breakpoints: 2 columns at <1100 (3+0 on the second row, so it looks orphaned), 1 column at ≤860.
* The quotes come from a **global pool of 6**; each page picks 3 (table in §2).
* Props: `items: TestimonialKey[]`.

### 1.13 `ContactFaq` — `.contact` + `.ks.kfaq-sec` → merged `.contact.combo`
Authored as two sections:
```html
<section [data-fx="NN"] class="[pp-host] contact" data-src="slug"><img plant?><div class="wrap grid">
 <div><div class="gt">Start your project</div><h2>Line<br><span class="or">Accent</span></h2><p class="lead">…</p>
 <div class="ci">Email<b><a mailto></b>Phone<b><a tel></b>WhatsApp<b><a wa.me></b></div></div>
 <form class="form" novalidate data-src="slug"> name*, email*, phone, [select service* preselected | hidden service], 2–3 extra selects, textarea details, button.send, .note </form></div></section>
<section class="ks kfaq-sec [fq]"><div class="wrap"><div class="kfq"><div class="kfq-h"><kick/><h2 class="st"/><p/><a class="kfq-ask"/></div>
 <div class="faq kfaq"><div class="qa open"><button class="qh">Q<i></i></button><div class="qb"><p>A</p>[<a>link ↗</a>]</div></div>×5</div></div></div></section>
```
**Runtime merge (JS 4692–4703)**:
* Builds `.wrap.grid > .kc-l(info+form) + .kc-r.kfaq-sec(.kfq-h + .faq)`.
* **Removes `.kfq-ask` and `p` from `.kfq-h`**, so all "Can't find what you're looking for?…", "Ask us directly →" and the architecture "Ask an architect →" copy is never shown. It adds `.w` to the kicker, moves FAQ plants into the contact section, adds `.combo`, and deletes the FAQ section.
* The contact `id` is renamed to `<slug>-contact` (4776). Route `#<slug>/contact-sec` maps to it (4778).

Layout:
* combo grid `1fr 1fr`, gap 96px (2042)
* ≥1100 compaction (1053–1062): h2 44px, lead 13.5px, inputs 42px, textarea 76px, FAQ title 36px, `.qh` 15.5px
* <1100: 1 column with a 64px gap (2340)
* the form is 2 columns, collapsing to 1 at ≤860 (2210)
* `.form` CSS 151–165

FAQ:
* Accordion (4856): one open at a time, and the first item starts `.open`.
* `.qb` animates `max-height 0→320px` over .35s (2008–2009). The `+` icon rotates 45° (2003–2007).
* ARIA is wired by JS (5256): `aria-controls`, `aria-expanded`, `role=region`.

**Tone**:
* The base `.page section.contact` is `#000 !important` (214).
* Contacts carrying `data-fx` (architecture 35, interior 45, factory 53, construction 61, renovation 82) get a generated **light** override. It uses the `:is([data-fx],#_q#_r#_s)` specificity hack with nth-child chains that target the *post-merge* DOM (446–545 and following):
  * white background
  * `#222` gt, black h2, `rgba(0,0,0,.82)` lead
  * **form fields `#07080C` background with `#eee` text**
  * FAQ text black, rules `#d9d9d9`, answers `#656565`, links underlined `#bbb`
* turnkey, exterior and property-care have no `data-fx`, so they stay **dark**.
* This is exactly the alternation rule. Implement it as `tone` on `ContactFaq` and drop `data-fx`.

Submit/prefill:
* Submit (4817–4823): validate required fields, then `lead()` (4798–4815), which builds a mailto or POSTs to `KATIC_FORM_ENDPOINT`. Payload includes `source_page`; extras are serialised as `key: value`.
* `data-go="contact"` buttons scroll to the page's own `.contact` and call `prefill(form, src)` with `PREFILL[slug]` (4749) merged with `data-svc` (click handler 4763).

Props: `tone`, `heading: {lines, accent}`, `lead`, `form: {serviceField: 'select'|'hidden', service, extraFields: SelectField[]}`, `faq: {kicker, title, items: {q, a, link?}[]}`, `plant?`.

### 1.14 Plant decoration — `.pp-host` + `img.plant.pot.pp.(br-c|bl-c)`
* Inline style: `--w:<px>; animation-duration:<wind>s,<breath>s; animation-delay:…`.
* CSS:
  * `.pp-host{position:relative;isolation:isolate}`, plant `z-index:-1`, `width:var(--w)` (1037–1040)
  * animation `kWindPot 10s` + `kBreath 3.4s`, with per-instance overrides (1041–1046)
  * ≤860: width ×0.58 (1047)
  * reduced motion: none (1048)
  * corners: `.br-c`/`.bl-c` = bottom-right/left (211)
* JS (5285–5293): on phones, adds bottom padding of 0.95 × plant height to the host so the plant doesn't cover content.
* The comment says "one per page". Usage:

| page | host section | key | corner | --w | durations | delays |
|---|---|---|---|---|---|---|
| interior | contact (3425) | `pp_schefflera` | br-c | 230 | 8.6s, 2.8s | -3.5s, -1.8s |
| factory | intro split (3445) | `pp_coleus` | br-c | 300 | 8.8s, 2.8s | -0.7s, -0.3s |
| construction | approach split **dk** (3472) | `pp_boxwood` | br-c | 340 | 10.2s, 3.3s | -6.6s, -3.3s |
| turnkey | contact (3506) | `pp_bopterra` | br-c | 220 | 9.0s, 2.9s | -1.8s, -0.9s |
| renovation | intro split (3526) | `pp_windowbox` | **bl-c** | 320 | 11.0s, 3.5s | -7.6s, -3.8s |
| exterior | testimonials (3560) | `pp_ageratum` | **bl-c** | 222 | 10.8s, 3.5s | -3.2s, -1.6s |
| property-care | intro split (3581) | `10513b5c57` (fern, 176×179, **not a `pp_` key**) | br-c | 170 | 12.4s, 4.0s | -0.4s, -0.2s |
| architecture | — | none | | | | |

* React: `<Plant src w corner wind breath delays />`. The host section takes `plant?: PlantSpec`.

### 1.15 Architecture-only sections (page `<style>` 3237–3313; global overrides 1659–1661, 1697–1702, 2089, 2149, 2169–2173, 2249, 2264–2270)

**`.ap` Intro + stats** (3327–3336, white):
* Layout:
  * Grid `1fr 700px`, 60px gap.
  * Left column: kicker, `.st` "Architecture That Responds" (inline `margin-top:22px`), lead (max 500px), `btn ol sm` "Our Process" → `#architecture/process`.
  * Stats grid `265px 1fr`: **12+ YEARS DESIGNING**, **2 REGIONS SERVED** (26px numbers, 9.5px .2em labels).
  * Right column: image `5aadd606b7`, 523px tall (inline `padding-top:38px`), with caption row "SITE, CLIMATE AND CONTEXT | Kochi, Kerala".
  * A `.spacer{height:230px}` sits empty at the bottom. It's a leftover; see bugs.
* `<1100`: 1 column (2149); ≤860 image is 320px (2265).
* Background `#F6F4EF` in page CSS, but forced `#fff !important` by 1697.

**`.sv` Services list + images** (3338–3358, black `#050505`, forced `#000`, 1698):
* Layout:
  * `.two` header (`646px 1fr`): kicker "What we deliver", `.st` "Our Architecture Services" (inline `margin-top:44px`), and a `.p` listing all 9 services as one "·"-joined string (14.5px/1.8 `#ddd`, `margin-top:58px`).
  * Body grid `600px 1fr`, gap 64.
  * Left: `.list` of **9 rows**. Each row is a grid `56px 1fr 20px`, 61px tall, with a bottom rule at .2 white; icon (`small.nico`), 20px title, `↗`. All rows link to `#contact` with `data-go="contact" data-svc="Architectural Design"`, and hover turns the title orange.
  * Then `btn dk` "View Architecture Works" (data-arw) → `#works/works-list/architecture`, with `margin-top:88px`.
  * Right `.ims`: a 2-column grid with one wide image (`85a9c3398a`, 290px) and two tall images (`61b5cef4ba`, `bc369010e0`, 362px). All have `alt=""`; JS adds `data-zoom` (5297).
* `<1100`: 1 column; ≤860 tall images are 220px (2266).

**Sectors**: a standard `SectorGrid` (3360). Kicker "Project types", title "Architecture for every sector", lead "Residential, commercial, institutional and hospitality."

**`.pr` Process** (3361–3369, id `process`, black `#0B0B0B`, forced `#000`, 1700):
* `.two` header: kicker "Our design process", title "From Site to Structure", lead (**placeholder**: "Explain how Katic takes an architectural project from first brief to built space."), `btn wh sm` "See Our Process" → `#architecture/process-tl`.
* `.imr`: 2 images (`596a914967`, `129d81a52a`) in a grid `512px 1fr`, 333px tall, gap 18. JS adds `data-zoom`.
* Then `.ksteps#process-tl` with 5 steps: Understand / Concept / Develop / Document / Execute, each with short one-line copy. `margin-top:80px` (2089). It is not `.lt` (inside `.pr`), so it gets the dark 3D art.
* **No responsive rule for `.imr`**: the 512px column overflows at ≤860. See bugs.

**`.ap2` Featured projects** (3371–3383, white, id `arch-projects`):
* `.two` header: kicker "Featured projects", title "Architecture Projects", `.p` (**placeholder**: "Selected architecture projects with location, type and a short description. Each opens its project page.").
* Then a hero card `a.pc` (image 563px inline, `margin-top:56px`) followed by `.pgrid` (2 columns, gap 56/55) with 4 cards (images 420px inline).
* `.pc` card: image zooms to 1.03 on hover (0.8s); `.meta` is a flex row with left `small` (8.5px orange uppercase), h3 (30px, 26px in grid), p (12px/1.75, max 470px) and right "View Project ↗" (underlined).
* ≤860: `.pgrid` goes to 1 column (2249) and `.pc .meta` stacks (2270).
* Cards:

| card | key | name | meta |
|---|---|---|---|
| big | `987e492e7a` | The Courtyard House | Kochi, Kerala · Residential Architecture |
| grid | `22c6045680` | Palm Ridge Villa | Kakkanad, Kerala · Villa Design |
| grid | `05d43ba02d` | Nila Workspace | Dubai, UAE · Commercial Architecture |
| grid | `181d7cb449` | House of Monsoon | Thrissur, Kerala · Residential Architecture |
| grid | `df57ba68fe` | The Old Mill Renewal | Aluva, Kerala · Renovation |

**Dead CSS in the architecture `<style>`**: there is no markup for any of these:
* `.tl .line/.dot/.card/.stem` (an old horizontal timeline; also hidden at 2169)
* `.wy` (a "why" split; also referenced at 1659–1661, 1701, 2170–2172)
* `.ctasec` (CTA band, 3305–3312)
* `.fq .pl1/.pl2` (FAQ plants, 3303–3304, 2267)
* `.ap .shelf` (3260, 2264)
* `.sv .list a:first-child{border-top:0}`
* `#p-architecture>section.fq` background (1702), because the `.fq` FAQ section is removed by the merge
* `#p-architecture .faq .qh/.qb` mobile overrides (2268–2269) still match because the FAQ lives on inside the combo

So a CTA band, a "why" split and a timeline were designed and then removed. Don't build them.

---

## 2. Per-page content

Legend: **L** = white `#fff`, **D** = black `#000` (`.ks.dk` is `#000`). "×N" = item count. `[fx]` = forced-light contact.

### 2.1 `#p-architecture` → `/architecture` (deep links `#process`, `#process-tl`, `#services-list`, `#arch-projects`)
* title: `Architects in Kochi, Kerala | Architectural Design Services | Katic Designs`
* desc: `Climate-responsive architectural design for homes, villas and commercial buildings in Kerala and Dubai — from site study and concept to approval drawings.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero (arch variant) | img `9c495f3ea4` | kick "Architectural Design · Kerala & UAE"; h1 "Architecture / Designed Around / **Place & People**"; lead "Katic Designs is an architecture practice in Kochi creating residential and commercial spaces across Kerala and the UAE."; CTA "Discuss Your Project" (svc Architectural Design); caption "PRIVATE RESIDENCE · KOCHI" |
| 1 | ArchIntro `.ap` | L | §1.15; stats 12+ / 2 |
| 2 | ArchServices `.sv#services-list` | D | 9 services: Residential Architecture, Villa Design, Commercial Architecture, Renovation, Concept Design, Detailed Design, 3D Visualisation, Working Drawings, Execution Coordination; 3 images |
| 3 | SectorGrid ×4 | L | "Project types" / "Architecture for every sector" |
| 4 | ArchProcess `.pr#process` | D | 2 images + 5 steps (`#process-tl`) |
| 5 | ArchProjects `.ap2#arch-projects` | L | 1 + 4 cards |
| 6 | CardGrid service c3 ×**6** | D | "Related services" / "Services that work alongside architecture": Exterior & Landscape (`96147274e0`), Interior (`335d18a20f`), Turnkey (`392c9415ec`), Construction (`465ad48711`), Renovation (`df57ba68fe`), Property Care (`113b954da6`) |
| 7 | Divisions | L | Design, Infrastructure, Developers |
| 8 | Testimonials | D | T-arch, T-home-kochi, T-thrissur |
| 9 | ContactFaq `[fx35]` | L | "Planning a / **New Space?**"; lead "Tell us about your site, requirements and vision. Our architects will get back to you within one business day."; extras: **Project Type** `ptype` (Residence, Villa, Commercial, Institutional, Hospitality), **Plot** `plot` (I have a plot, Buying one, Existing building). FAQ "Architecture / FAQ" ×5: cost, timeline, approvals, drawings, locations (inline links to `#india`, `#dubai`) |

### 2.2 `#p-interior` → `/interior`
* title: `Interior Designers in Kochi, Kerala | Interior Design | Katic Designs`
* desc: `Interior design with in-house joinery and furniture: space planning, materials, lighting and installation for homes, apartments and offices in Kerala and Dubai.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `445f233e70` | "Interior Design · Kerala & UAE"; "Interiors Made / for **Everyday Life**"; lead "Interior planning, materials, furniture and execution — designed, made and installed by one team."; "Discuss Your Interior" / "View Interior Projects" → `#works/works-list/interiors` |
| 1 | SplitFeature | L | img `934be61600`, cap "Dining room · teak joinery"; "Philosophy" / "Beauty that works hard"; 4 bullets: Functional planning, Natural, durable materials, Integrated joinery, Layered lighting |
| 2 | RowList ×5 | D | "Our interior services" / "Our interior services" (kicker = title, see bugs); Interior planning, Materials & finishes, **Furniture & joinery → #factory**, Lighting design, Execution & installation |
| 3 | SplitFeature **rev** + btn | L | `34fbd87695`, cap "Kitchen · teak & stone"; "Factory & manufacturing" / "Made in our own workshop"; 4 bullets; `btn ol` "Visit the Factory" → `#factory` |
| 4 | ProcessSteps ×5 | D | "Interior design process" / "How we take a room from idea to finish" (3 lines); Discovery, Concept, Design, Completion, Handover (master texts) |
| 5 | CardGrid project **c4** | L | "Featured projects" / "Interiors across every sector"; btn ol "View All Interiors"; Cinder House `6a759310a5`, Serein Wellness Club `0e599c0712`, DIFC Gallery Office `67ca9cb4fe`, Harbour Loft `67fde5f298` |
| 6 | CardGrid service c3 | D | "…alongside interiors": Architecture, Construction, Turnkey |
| 7 | Divisions | L | Interior, Design, Infrastructure |
| 8 | Testimonials | D | T-ernakulam, T-kozhikode, T-alappuzha |
| 9 | ContactFaq `[fx45]` + plant `pp_schefflera` | L | "Planning an / **Interior?**"; lead "Share your space, style and timeline. We'll respond within one business day with next steps."; extras **Space** `space` (Full home, Apartment, Office, Hospitality, A few rooms), **Possession** `possession` (Ready now, Under construction); FAQ ×5 |

### 2.3 `#p-factory` → `/factory` (sub-page of Interior: absent from `PREFILL` 4749 and from the header Services dropdown; `ACTIVE` maps it to 'Services', 4638)
* title: `Custom Furniture & Joinery Manufacturing in Kerala | Katic Designs`
* desc: `Kitchens, wardrobes, panelling, doors and custom furniture made in the Katic Designs workshop and installed by our own teams.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `934be61600` | "Interior Design · Factory & Manufacturing"; "Crafted In-House. / **Finished by Hand.**" (both lines; the second line is all accent); CTA "Enquire About Manufacturing" (svc Interior Design) / "Back to Interior Design" → `#interior` |
| 1 | SplitFeature + plant `pp_coleus` | L | `113b954da6`, cap "Handrail detail · teak & steel"; "Factory overview" / "Where design meets the bench"; **no bullets** |
| 2 | FeatureGrid 3 ×6 | D | "Manufacturing capabilities" / "What we make": Kitchens, Wardrobes & storage, Wall panelling & screens, Loose furniture, Doors & frames, Custom details |
| 3 | ProcessSteps ×5 | **L** (`.lt`) | "Craftsmanship & quality control" / "Every piece checked twice": Material selection, Precision cutting, Assembly & detailing, Finishing, Quality inspection (factory-specific copy) |
| 4 | **Gallery** ×5 | D | "Factory gallery" / "Inside the workshop": `596a914967` Model & mock-ups, `10c3a14757` Timber screens, `113b954da6` Handrail detail, `03553b5ed8` Teak screen, `934be61600` Joinery in place (`.w`) |
| 5 | CardGrid **product** c3 | L | "Finished products" / "Made here. Lived in there.": Kitchen island & cabinetry `34fbd87695`, Bedroom screen & wardrobe `03553b5ed8`, Dining joinery `934be61600` (all → `#project`) |
| 6 | Divisions **dk** | D | Interior, Infrastructure |
| 7 | ContactFaq `[fx53]` | L | "Enquire About / **Manufacturing**"; **hidden** `service=Interior Design` (no select); extras **Product** `product` (Kitchen, Wardrobes & storage, Panelling & screens, Loose furniture, Commercial fit-out, Other), **Quantity** `qty` (Single piece, Full home, Multiple units / project); FAQ ×5 |

No Related services and no Testimonials. The hero image, the gallery's last image and a product card all reuse `934be61600`.

### 2.4 `#p-construction` → `/construction`
* title: `Construction Company in Kochi, Kerala | Construction & Execution | Katic Designs`
* desc: `Residential and commercial construction built to the drawing, with site management, MEP coordination and stage-wise quality checks across Kerala.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `f1c16f4f12` (only 837×675: soft at full-bleed) | "Construction & Execution"; "Built Exactly / to the **Drawing**"; "Request a Build Quote" / "View Projects" → `#works/works-list` |
| 1 | **FeatureGrid 3 ×6** (comes first, before the split) | L | "Construction capabilities" / "What we build": Residential construction, Commercial construction, Structural & civil works, Project coordination, MEP coordination, Finishing |
| 2 | SplitFeature **dk** + plant `pp_boxwood` | D | `129d81a52a`, cap "On site · Kerala"; "Our approach" / "Planning, people and quality"; bullets ×4 |
| 3 | CardGrid project c3 | L | "Featured projects" / "Built by our teams"; btn "View All Projects"; House of Three Courts `8d5ca34a10`, Al Quoz Atelier `01aabb2353`, Community Health Pavilion `85a9c3398a` |
| 4 | CardGrid service c3 | D | Architecture, Interior, Turnkey |
| 5 | Divisions ×4 | L | Infrastructure, Design, Developers, Care |
| 6 | Testimonials | D | T-thrissur, T-alappuzha, T-home-kochi |
| 7 | ContactFaq `[fx61]` | L | "Ready to / **Build?**"; extras **Stage** `stage` (Drawings ready, Need drawings, Mid-construction), **Built-up area** `area` (Under 2,000 sq ft, 2,000–4,000 sq ft, 4,000+ sq ft); FAQ ×5 |

No process steps and no sectors. This is the only page whose intro split is dark and not first.

### 2.5 `#p-turnkey` → `/turnkey` (the richest of the standard pages)
* title: `Turnkey Home & Building Projects in Kerala | Katic Designs`
* desc: `One team and one contract for design, approvals, construction, interiors and handover. Turnkey villas, homes and commercial projects in Kerala and the UAE.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `1a2f69cee0` | "Turnkey Projects"; "One Team. / Planning to **Handover.**"; "Get a Turnkey Plan" / "See Turnkey Projects" → `#works/works-list` |
| 1 | SplitFeature | L | `94825e8aa6`, cap "Courtyard facade · Kochi"; "What is turnkey?" / "You hand us / the brief. We hand / you the keys."; bullets: Single point of contact, One agreed budget, One programme, Clear accountability |
| 2 | SectorGrid ×4 | D | "Turnkey solutions across sectors" / "Turnkey for every sector" |
| 3 | RowList ×5 (all links) | L | "What we deliver" / "Complete project delivery": Architecture & approvals → #architecture, Construction → #construction, Interiors & furniture → #interior, Exterior & landscape → #exterior, Handover & aftercare → #property-care |
| 4 | ProcessSteps **×8** | D | "Our turnkey process" / "Eight stages. One team." (all 8 master stages) |
| 5 | CardGrid project c3 | L | "Featured projects" / "Integrated projects"; Nila Apartments `2dfb41f894`, Desert Edge Villa `f87d8c74d7`, Palm Veil Residence `5ae2cb8637` |
| 6 | **FeatureGrid 4 ×4** ("Why") | D | "Why choose KATIC?" / "Why one team works better": One coordinated team, Clear accountability, A streamlined journey, Design intent protected (empty kh right column) |
| 7 | CardGrid service c3 | **L** | "Related services" / "Explore the disciplines": Architecture, Interior, Construction |
| 8 | Divisions ×5 | D | Developers, Design, Interior, Infrastructure, Care |
| 9 | Testimonials | **L** | T-thrissur, T-alappuzha, T-arch |
| 10 | ContactFaq (no fx: **dark**) + plant `pp_bopterra` | D | "Start a Turnkey / **Project**"; extras **Project Type** `ptype` (Residential, Commercial, Institutional, Hospitality), **Budget Range** `budget` (Under ₹50 lakh, ₹50 lakh – ₹1.5 crore, ₹1.5 crore +, Not sure yet), **Timeline** `timeline` (Within 3 months, 3–6 months, 6–12 months, Just exploring); FAQ ×5 |

### 2.6 `#p-renovation` → `/renovation` (deep link `#ba`)
* title: `Home Renovation & Remodeling in Kochi, Kerala | Katic Designs`
* desc: `Renovate and remodel homes and buildings with better light, layouts, kitchens, bathrooms and facades while keeping the character worth saving.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `0e599c0712` | "Renovation & Remodeling"; "New Life for / **Existing Spaces**"; "Plan a Renovation" / "See Transformations" → `#renovation/ba` |
| 1 | SplitFeature + plant `pp_windowbox` (bl-c) | L | `df57ba68fe`, cap "The Old Mill Renewal · Aluva"; "Rethinking existing spaces" / "Better, not just newer"; no bullets |
| 2 | FeatureGrid 3 ×6 | D | "Services" / "Renovation services": Home renovation, Layout remodeling, Kitchen & bath upgrades, Facade refresh, Adaptive reuse, Structural repairs |
| 3 | SectorGrid ×4 | L | "Project types" / "Properties we renovate" |
| 4 | ProcessSteps ×6 | D | "Our renovation process" / "From survey to handover": Discovery, Design, Engineering, Construction, Completion, Handover |
| 5 | **BeforeAfter** ×2 `#ba` | L | "Before & after" / "Transformations"; lead includes the placeholder note; pair 1 `129d81a52a`→`df57ba68fe` The Old Mill Renewal (Commercial · Aluva); pair 2 `5aadd606b7`→`8d5ca34a10` Kottayam Family Home (Residential · Kottayam) |
| 6 | CardGrid service c3 | D | Interior, Construction, Turnkey |
| 7 | Divisions ×4 | L | Infrastructure, Interior, Design, Care |
| 8 | Testimonials | D | T-ernakulam, T-arch, T-thrissur |
| 9 | ContactFaq `[fx82]` | L | "Tell Us About / **Your Space**"; extras **Project Type** `ptype` (4), **Occupancy** `occ` (Occupied during work, Vacant); FAQ ×5 |

No featured projects block; BeforeAfter takes its place.

### 2.7 `#p-exterior` → `/exterior`
* title: `Landscape & Exterior Design in Kerala | Katic Designs`
* desc: `Facade, garden, courtyard and outdoor living design planned together with the building, for homes, campuses and commercial sites.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `1cd19eb609` | "Exterior & Landscape Design"; "Designing Beyond / the **Building**"; "Discuss Your Outdoor Space" / "View Projects" |
| 1 | SplitFeature | L | `9f6d8d2f6c`, cap "Planted courtyard · Kochi"; "Designing beyond the building" / "Inside and outside as one"; bullets: Facade & elevation, Courtyards & gardens, Outdoor living, Public landscapes |
| 2 | RowList ×5 (no links) | D | "Our design services" / "Exterior & landscape services": Facade & elevation design, Landscape planning, Outdoor living, Parks & public spaces, Hardscape & lighting |
| 3 | SectorGrid **×5** (+ Outdoor environments tile) | L | "Project types" / "Where we work outdoors" |
| 4 | CardGrid project c3 | **D** | "Featured exterior & landscape projects" / "Outdoor spaces we've shaped"; `btn dko`; Canopy House `316380ce3f`, Jumeirah Courtyard House `fe0aeb97f8`, River Edge Villa `1ffea5f189` (the 1st and 3rd source images are portrait 380×472, shown at a 200px-tall crop) |
| 5 | CardGrid service c3 | L | "…alongside landscape": Architecture, Interior, Construction |
| 6 | Divisions ×4 | D | Design, Infrastructure, Developers, Care |
| 7 | Testimonials + plant `pp_ageratum` (bl-c) | L | T-arch, T-home-kochi, T-thrissur |
| 8 | ContactFaq (**dark**) | D | "Plan Your / **Outdoor Space**"; extras **Scope** `scope` (Facade makeover, New elevation, Garden / landscape, Outdoor living, Large grounds), **Area** `area` (Garden, Courtyard, Terrace, Large grounds); FAQ ×5 |

No process steps.

### 2.8 `#p-property-care` → `/property-care` (deep link `#pc-services`)
* title: `Property Maintenance & Repairs in Kerala | Katic Care` (the brand suffix differs from every other page)
* desc: `Planned maintenance, repairs, pre-monsoon inspections and priority support for homes and commercial properties in Kerala and the UAE.`

| # | type | tone | content |
|---|---|---|---|
| 0 | Hero | `c409203399` (987×795) | "Property Care & Maintenance"; "Care That Keeps / Spaces **at Their Best**"; "Request Support" / "Our Services" → `#property-care/pc-services` |
| 1 | SplitFeature + plant `10513b5c57` | L | `67932608a0`, cap "Stone & timber · cared for"; "Complete property care" / "Protect what you've built"; bullets: Condition, Usability, Appearance, Long-term value |
| — | `<div id="pc-services"></div>` | | empty anchor div *between* sections (3582). It becomes a `.page` child, which is harmless, but in React put `id` on the next section |
| 2 | FeatureGrid 3 ×6 | D | "Our maintenance services" / "What we look after": Routine maintenance, Repairs & restoration, Interior maintenance, Civil & building, Landscape upkeep, Emergency support |
| 3 | SectorGrid ×4 | L | "Properties we maintain" / "Properties in our care" |
| 4 | ProcessSteps ×5 | D | "Our maintenance approach" / "Assess. Plan. Repair. Check.": Assessment, Planning, Repair coordination, Quality check, Ongoing support |
| 5 | CardGrid service **c4** | L | Construction, Renovation, Interior, Turnkey |
| 6 | Divisions ×4 | D | Care, Infrastructure, Interior, Developers |
| 7 | Testimonials | L | T-thrissur, T-home-kochi, T-alappuzha |
| 8 | ContactFaq (**dark**) | D | "Property Care / **Enquiry**"; extras **Project Type** `ptype` (4), **Support needed** `need` (Maintenance plan, One-off repair, Emergency, Inspection); FAQ ×5 (link `#india`) |

No projects block.

### 2.9 Testimonial pool (global, used 3 at a time)
| key | quote (start) | name | meta | avatar |
|---|---|---|---|---|
| T-arch | "The architecture responds to the site in a way that feels natural…" | Homeowner | New-Build Villa · Kottayam | `f6b5f27cab` (64px) |
| T-home-kochi | "Katic understood what we wanted from the beginning…" | Homeowner | Residential Project · Kochi | `9e3a0ae4bf` |
| T-thrissur | "From early planning through site execution, communication stayed clear…" | Property Owner | Turnkey Residence · Thrissur | `883910d93f` |
| T-ernakulam | "The team brought order to a complex process…" | Private Client | Interior Renovation · Ernakulam | `b8b2804bc2` (64px) |
| T-kozhikode | "They listened closely, challenged the brief where it mattered…" | Business Client | Commercial Interior · Kozhikode | `f0e113ce0b` (64px) |
| T-alappuzha | "Having one team coordinate design, materials and construction…" | Private Client | Design & Build Project · Alappuzha | `3075cc02c0` |

These are presumably the same records as the home and reviews pages: share them with that agent's data model.

### 2.10 Related-service card pool (global)
| service | href | img | desc |
|---|---|---|---|
| Architectural Design | `#architecture` | `987e492e7a` | Consultation, planning, architecture, elevations and spatial design. |
| Interior Design | `#interior` | `335d18a20f` | Interior planning, materials, furniture and execution. |
| Construction & Execution | `#construction` | `465ad48711` | Residential and commercial construction, project coordination and finishing. |
| Turnkey Projects | `#turnkey` | `392c9415ec` | Complete project delivery for residential, commercial and hospitality spaces. |
| Renovation & Remodeling | `#renovation` | `df57ba68fe` | Transforming existing spaces through renovation and redesign. |
| Exterior & Landscape Design | `#exterior` | `96147274e0` | Outdoor spaces, parks, facades and landscape planning. |
| Property Care & Maintenance | `#property-care` | `113b954da6` | Property maintenance, repairs and ongoing support. |

The hero lead or `.kh .lead` of several pages reuses these descriptions verbatim (turnkey, renovation, exterior, property-care). That's handy: one `summary` field per service.

### 2.11 Section order matrix (desktop)
| slot | arch | interior | factory | constr. | turnkey | renov. | exterior | p-care |
|---|---|---|---|---|---|---|---|---|
| Intro split | `.ap`¹ | 1 | 1 (plant) | **2 (dk, plant)** | 1 | 1 (plant) | 1 | 1 (plant) |
| Services (rows/grid) | `.sv`¹ (rows) | 2 rows | 2 grid | **1 grid** | 3 rows(links) | 2 grid | 2 rows | 2 grid |
| 2nd split | – | 3 (rev) | – | – | – | – | – | – |
| Sectors | 3 | – | – | – | 2 | 3 | 3 (×5) | 3 |
| Process steps | 4 (`.pr`¹, 5) | 4 (5) | 3 (5, light) | – | 4 (8) | 4 (6) | – | 4 (5) |
| Showcase | 5 (`.ap2`¹) | 5 proj c4 | 4 gallery + 5 products | 3 proj | 5 proj | 5 before/after | 4 proj (dk) | – |
| Why grid | – | – | – | – | 6 | – | – | – |
| Related services | 6 (×6) | 6 | – | 4 | 7 | 6 | 5 | 5 (c4) |
| Divisions | 7 | 7 | 6 | 5 | 8 | 7 | 6 | 6 |
| Testimonials | 8 | 8 | – | 6 | 9 | 8 | 7 (plant) | 7 |
| Contact+FAQ | 9 L | 9 L (plant) | 7 L | 7 L | 10 D (plant) | 9 L | 8 D | 8 D |

¹ = architecture bespoke variant.

**Canonical order** (every page is an ordered subset of it): Hero → Intro split → Services → [Secondary split] → Sectors → Process → Showcase (projects | gallery | before-after | products) → Why → Related → Divisions → Testimonials → Contact+FAQ. Construction is the only page that breaks it (Services before Intro).

---

## 3. Proposed React components

```
components/service/
  ServicePage.tsx          // maps page.sections[] → components; computes tone by index (alternate L/D after hero)
  ServiceHero.tsx          // variant 'standard' | 'architecture'
  SectionShell.tsx         // <section class=ks [dk] [pp-host]> + .wrap + optional Plant + optional id
  SectionHeader.tsx        // .kh
  SplitFeature.tsx
  RowList.tsx
  FeatureGrid.tsx          // uses <IsoIcon pick={title}/> + IntersectionObserver stagger 140ms
  ProcessSteps.tsx         // uses <IsoArt index/> + stagger 220ms; light/dark via tone
  SectorGrid.tsx
  CardGrid.tsx             // variant project|service|product
  Gallery.tsx
  BeforeAfter.tsx
  DivisionsStrip.tsx
  Testimonials.tsx
  ContactFaq.tsx           // client component: form (react-hook-form/zod), prefill from ?service= or context, accordion
  Plant.tsx
  arch/ArchIntro.tsx, arch/ArchServices.tsx, arch/ArchProcess.tsx, arch/ArchProjects.tsx
```

Implementation notes:
* Pass **tone** as a prop and avoid descendant `.dk` selectors. With Tailwind, use `data-tone="dark"` on the section and `group-data-[tone=dark]:` variants.
* Replace inline `grid-template-columns` with a `columns` prop. Watch out: global CSS keys off `[style*="repeat(8"]` (2087–2088, 2112), so use `data-cols` instead.
* `data-go="contact"` buttons: `onClick` → `scrollIntoView` the page's ContactFaq and set the service select. Use a context (`useContactPrefill`), or `/architecture#architecture-contact?service=…`.
* Deep links: `#architecture/process` → `/architecture#process`. Keep the ids `process`, `process-tl`, `services-list`, `arch-projects`, `ba`, `pc-services` and `<slug>-contact`.
* The FAQ header in the combo shows only kicker + title. Don't render the `p`/`kfq-ask` that the source deletes. Or decide deliberately to restore them.
* Lightbox: a shared `<Zoomable>` wrapper or a global listener for `[data-zoom]`.

---

## 4. TypeScript content schema (Laravel-ready)

```ts
type ImageRef = { key: string; alt: string; width?: number; height?: number }; // key -> /img/<key>.webp (later: Laravel media id/url)
type Lines = string[];                          // title lines (was <br>)
type AccentTitle = { lines: string[]; accent: string; accentOnNewLine?: boolean };
// e.g. {lines:['Interiors Made','for'], accent:'Everyday Life'}  -> "Interiors Made<br>for <span.or>Everyday Life</span>"
type IconKey =
  | 'house' | 'office' | 'tools' | 'compass' | 'target' | 'eye' | 'crane' | 'search' | 'badge-check'
  | 'sofa' | 'layers' | 'wardrobe' | 'bulb' | 'check-circle' | 'key' | 'kitchen' | 'door' | 'shield'
  | 'team' | 'facade' | 'leaf' | 'star';      // the 22 distinct .nico SVGs found (see §6)
type Link = { label: string; href: string };   // internal hrefs as route paths: '/factory', '/works?filter=interiors'
type ServiceKey = 'architecture'|'interior'|'construction'|'turnkey'|'renovation'|'exterior'|'property-care';
type DivisionKey = 'design'|'interior'|'infrastructure'|'developers'|'care';
type SectorKey = 'residential'|'commercial'|'institutional'|'hospitality';

interface PlantSpec { image: string; corner: 'bl'|'br'; width: number; wind: number; breath: number; delays: [number, number] }

interface HeaderBlock { kicker: string; title: Lines; lead?: string; cta?: Link & { variant: 'ol'|'dk'|'dko' } }

type Section =
  | ({ type: 'split'; image: ImageRef; caption: string; lead: string; body?: string; bullets?: string[];
       cta?: Link; reverse?: boolean } & Omit<HeaderBlock,'lead'|'cta'>)
  | ({ type: 'rows';     items: { icon: IconKey; title: string; text: string; href?: string }[] } & HeaderBlock)
  | ({ type: 'features'; columns: 3|4; items: { icon: IconKey; title: string; text: string }[] } & HeaderBlock)
  | ({ type: 'process';  items: ({ stage: MasterStageKey } | { icon: IconKey; title: string; text: string })[] } & HeaderBlock)
  | ({ type: 'sectors';  sectors: SectorKey[]; extra?: { image: ImageRef; label: string; title: string; text: string } } & HeaderBlock)
  | ({ type: 'projects'; columns: 3|4; items: { projectSlug?: string; image: ImageRef; meta: string; title: string; href: string }[] } & HeaderBlock)
  | ({ type: 'products'; items: { image: ImageRef; title: string; text: string; href: string }[] } & HeaderBlock)
  | ({ type: 'gallery';  items: { image: ImageRef; caption: string; wide?: boolean }[] } & HeaderBlock)
  | ({ type: 'beforeAfter'; pairs: { before: ImageRef; after: ImageRef; title: string; meta: string; text: string }[] } & HeaderBlock)
  | ({ type: 'related';  columns: 3|4; services: ServiceKey[] } & HeaderBlock)       // header lead always empty
  | { type: 'divisions'; divisions: DivisionKey[] }
  | ({ type: 'testimonials'; ids: string[] } & HeaderBlock)
  // architecture bespoke
  | { type: 'archIntro'; kicker: string; title: Lines; lead: string; cta: Link; stats: { value: string; label: string }[]; image: ImageRef; captionLeft: string; captionRight: string }
  | { type: 'archServices'; kicker: string; title: Lines; summary: string; items: { icon: IconKey; title: string }[]; cta: Link; images: [ImageRef, ImageRef, ImageRef] }
  | { type: 'archProcess'; kicker: string; title: Lines; lead: string; cta: Link; images: [ImageRef, ImageRef]; steps: { icon: IconKey; title: string; text: string }[] }
  | { type: 'archProjects'; kicker: string; title: Lines; lead: string; featured: ArchProject; grid: ArchProject[] };
type ArchProject = { image: ImageRef; meta: string; title: string; text: string; href: string };

type SectionWithMeta = Section & { id?: string; plant?: PlantSpec; toneOverride?: 'light'|'dark' };

interface SelectField { name: string; label: string; options: string[]; required?: boolean }
interface ContactFaqBlock {
  heading: AccentTitle;                // "Planning a" / "New Space?"
  lead: string;
  service: { mode: 'select' | 'hidden'; value: string };  // preselected option / hidden input (factory)
  extraFields: SelectField[];          // 2–3 per page (see §2)
  faq: { kicker: string; title: Lines; items: { q: string; a: string /* may contain inline links */; link?: Link }[] };
  plant?: PlantSpec;
}

interface ServicePageContent {
  slug: 'architecture'|'interior'|'factory'|'construction'|'turnkey'|'renovation'|'exterior'|'property-care';
  seo: { title: string; description: string; canonical?: string };
  formSource: string;                  // data-src (== slug)
  hero: {
    variant: 'standard' | 'architecture';
    image: ImageRef; kicker: string; title: AccentTitle; lead: string;
    primaryCta: { label: string; service: string };           // data-svc
    secondaryCta?: Link;                                      // standard only
    caption?: string;                                         // architecture only
  };
  sections: SectionWithMeta[];         // ordered; tone alternates L,D,L… unless toneOverride
  contact: ContactFaqBlock;            // always last; tone = opposite of last section
}

// Global (shared) collections — not per page:
//   services: Record<ServiceKey, {title, href, cardImage, summary}>           (§2.10)
//   sectors: Record<SectorKey, {image, label:'SECTOR', title, text, href}>   (identical everywhere)
//   divisions: Record<DivisionKey, {title:'KATIC Design', href}>
//   testimonials: Record<id, {quote, name, meta, avatar}>                    (§2.9)
//   masterStages: Record<MasterStageKey, {icon, title, text}>                (§1.6)
//   contactInfo: {email, phone, whatsapp}                                    (placeholder today)
//   serviceOptions: string[]  (the 7 "Service Needed" options, identical in every form)
//   testimonialsHeader / relatedHeader templates ("In our clients' words", "Services that work alongside X")
type MasterStageKey = 'discovery'|'concept'|'design'|'engineering'|'construction'|'completion'|'handover'|'aftercare';
```

### Identical across pages vs per-page
* **Identical (global data or components)**:
  * hero mechanics, section shell and rhythm
  * the sector tiles
  * the related-service cards
  * the division links
  * the testimonial records, testimonials header copy and "Read All Client Reviews" button
  * contact info block (email, phone, WhatsApp), "Start your project" label, `.note`, submit label, the 7 service options, and the name/email/phone/details fields with their placeholders (including the textarea placeholder "Tell us about your site, timeline, and budget range.", used even on factory and property-care)
  * FAQ section kicker "Questions, answered"
  * master process stage texts
  * the "View Project →" / "Explore Service →" labels
* **Per page**:
  * SEO, hero copy, image and CTAs
  * the ordered list of sections and their copy, images and items
  * the subset and order of related services, divisions and testimonials
  * contact heading, lead and extra select fields
  * FAQ title (only architecture says "Architecture FAQ"; everyone else says "Frequently asked questions") and the 5 Q&As
  * the plant

---

## 5. Bugs, inconsistencies, placeholders

### Functional
1. **Factory hero CTA throws.** "Enquire About Manufacturing" has `data-go="contact" data-svc="Interior Design"`. `contact()` → `prefill()` runs `form.querySelector('select[name=service]')`, which is `null` on factory because the form uses `<input type="hidden" name="service">` (3458). It then does `[...sel.options]`, which throws a TypeError. `scrollIntoView` is never reached (4750–4757), so **the button does nothing**. The rebuild should guard this (hidden-service mode).
2. **Broken FAQ links `href="contact"`** (no `#`): interior 3437 "Ask for a quote", factory 3463 "Discuss your order", construction 3489 "Request a build quote", renovation 3546 "Book a site assessment", property-care 3600 "Request support". They only work because of `data-go="contact"` interception. Fix them to proper anchors/buttons.
3. Interior FAQ "See our interior services ↗" → `#interior` is a self-link and does nothing (`show()` skips when `cur===pg`).
4. All project cards link to the generic `#project` (a single static project page). In Laravel they need real `projectSlug`s.
5. Architecture `.sv` service rows: all 9 go to `#contact` with the same service. They aren't real links; arguably buttons.
6. The forms have **no honeypot field**, though `lead()` checks `company_website` (4802). Labels lack `for`/ids; JS patches them up at 5246–5250. Make them proper `<label htmlFor>` in React.

### Visual / layout
7. **Odd field counts leave an empty grid cell** in the 2-column form before the full-width textarea: turnkey (3 inputs + 4 selects = 7 half-width fields) and factory (3 + 2 = 5). The other pages have 6.
8. Architecture `.pr .imr{grid-template-columns:512px 1fr}` has **no mobile override**, so it overflows horizontally at ≤860. It is masked only by `.page{overflow-x:clip}` (2290), which crops the image.
9. Architecture `.ap .spacer{height:230px}` is an empty block left over from the removed "shelf" plant. It adds dead space and pushes `fit()` to zoom the section down. Drop it.
10. Architecture `.ap` background `#F6F4EF` and `.sv` `#050505` / `.pr` `#0B0B0B` are overridden to pure `#fff`/`#000` by 1697–1700. Use pure white/black.
11. `.kgal` has no <1100 rule (it stays at 3 columns on tablet), and testimonials at <1100 leave a 2+1 orphan.
12. Construction hero image `f1c16f4f12` is only 837×675 and property-care `c409203399` is 987×795. Both are stretched full-bleed at ≥1440 and look soft. Exterior project images `316380ce3f` and `1ffea5f189` are 380×472.
13. Interior: kicker "Our interior services" is repeated as the title "Our interior services" (3418).
14. Exterior title uses a raw `&` ("Exterior &<br>landscape services", 3555) where every other title uses `&amp;`. It renders the same.
15. Stray `w` (white) kicker classes on light sections (turnkey, exterior, property-care, and every FAQ header). They are neutralised by 1363's `!important`. Don't port them.
16. Trailing-space class attributes `class="ks "` / `class="ks dk "` (turnkey, exterior, property-care) look templated, while the other pages were hand-edited. Harmless.
17. Architecture's related-services grid has **6 cards** (2 full rows) while the others have 3 (property-care has 4 in c4). Interior's featured projects are c4 while the others are c3.
18. Architecture hero CTA uses `data-arw` (JS-appended arrow), while the other heroes have the SVG inlined. Testimonials buttons inline the same SVG. One `<ArrowNE/>` component covers both.
19. Inconsistent ordering: construction puts Services before Intro, and its intro split is dark. Factory's steps are on a light section (`.lt` art); the others are dark. Exterior's projects are dark; the others are light. All of this follows from strict alternation plus differing section counts, so tone is index-derived (a `toneOverride` exists in the schema if the client wants consistency).
20. Featured-project meta formats differ: "Residential · Interiors · Dubai, UAE" (type · scope · place) vs architecture "Kochi, Kerala · Residential Architecture" (place · type).

### Placeholder / content
21. **Designer-brief copy shipped as UI text**:
    * arch `.pr` lead "Explain how Katic takes an architectural project from first brief to built space." (3364)
    * arch `.ap2` "Selected architecture projects with location, type and a short description. Each opens its project page." (3372)
    * construction "Project type, scope and supporting imagery." (3473)
    * exterior "Selected projects with images and case-study links." (3557)
    * factory "The facility, the team and production in progress." (3448) and "Material handling, detailing, finishing standards and quality checks at each stage." (3447)
    * turnkey "Scope and outcomes from complete design-and-build commissions." (3501)
    * interior/renovation "The stages of our master process that apply to …" (3420, 3529)
    * property-care "Assessment, planning, repair coordination and quality checks." (3584)
    * every testimonials lead: "Representative copy — replace with approved client testimonials."
    * renovation BA: "Representative images — replace with real before-and-after photography." (3530)
22. Placeholder contact details on every page: `tel:+10000000000`, "+1 (000) 000-0000", `wa.me/10000000000` (also `KATIC_WA`, 4794). These should come from settings.
23. Before/after pairs use unrelated stock: pair 2's "before" (`5aadd606b7`) is the architecture intro image. Alts are wrong: pair-1 before alt "Transformations", pair-2 before alt "The Old Mill Renewal".
24. Image reuse makes pages feel repetitive. `934be61600` appears 3× on factory (hero, gallery, product), `df57ba68fe` on renovation (intro, BA after, and the related-card image elsewhere), and `0e599c0712` is both the renovation hero and the hospitality sector tile.
25. Testimonial avatars `f6b5f27cab`, `b8b2804bc2` and `f0e113ce0b` are 64×64, displayed at 40px. That's OK on 1×, soft on retina.
26. Arch `.sv .ims` images have `alt=""` even though they're content images (zoomable).
27. Duplicate option "Large grounds" appears in both exterior selects (Scope and Area). Exterior's "Area" select is `name="area"`, the same as construction's "Built-up area". Fine per page, but the CRM sees two meanings of `area`.
28. Factory hero kicker "Interior Design · Factory & Manufacturing", with the service sent as "Interior Design": a factory lead is indistinguishable from an interior lead except for `source_page`.
29. Property-care plant uses a hash key `10513b5c57` instead of a `pp_*` key (an inconsistent asset naming scheme).
30. FAQ copy removed at runtime (the `.kfq-h p` and `.kfq-ask`, including the architecture "Ask an architect →" CTA with `data-svc`). It's authored content that never shows; confirm with the client whether to drop it.

### IDs / structure
31. No duplicate ids within these pages. `process`, `process-tl`, `services-list`, `arch-projects`, `ba` and `pc-services` are each unique site-wide. `process` and `ba` are generic, so namespace them in React if pages ever co-render.
32. `<div id="pc-services"></div>` is an empty anchor element sitting between sections (3582). Put the id on the section.
33. Architecture header placeholder `data-variant="details"` and the `.rail[data-chat]` are ignored (4687–4688). There is no per-page header variant.
34. The `data-fx` "generated" colour overrides (446–885) are brittle nth-child chains tied to the post-merge DOM. In the interior one the plant shifts the indices (`>:nth-child(2)`). Replace them entirely with `tone`.

---

## 6. Icon inventory (`.nico` inline SVGs, 24×24, stroke 1.5, `currentColor`)
| id | paths | used for |
|---|---|---|
| house | `M3 11 12 4l9 7` + `M5 10v10h14V10M10 20v-5h4v5` | Residential Architecture, Villa Design, Develop |
| office | rect 5,3 14×18 + window ticks | Commercial Architecture |
| tools | `m14 7-9.5 9.5a2 2 0 0 0 3 3L17 10` + `m12 5 4-2 5 5-2 4-2-2-3 1-2-2 1-3z` | Renovation, Home renovation, Layout remodeling, Adaptive reuse, Structural repairs, Repairs & restoration, Repair coordination |
| compass | circle cx12 cy5 r2 + `m11 7-6 14M13 7l6 14M7.5 15h9` | Concept Design, Working Drawings (dup), Concept, Design, Parks & public spaces, Planning |
| target | 3 concentric circles | Detailed Design, Custom details, Precision cutting, Assembly & detailing, Quality check |
| eye | eye + circle | 3D Visualisation |
| crane | `M6 21V4l12 3H6M6 7l6-3` + `M15 7v5M13 12h4v3h-4zM3 21h8` | Execution Coordination, Execute, Execution & installation, Residential/Commercial construction, Structural & civil works, Construction, Engineering, Civil & building |
| search | circle r6 + handle | Understand, Discovery, Assessment |
| badge-check | rosette + check | Document |
| sofa | sofa paths | Interior planning |
| layers | `m12 3 9 5-9 5-9-5z` + `m3 13 9 5 9-5` | Materials & finishes, Material selection, Finishing |
| wardrobe | rect 4,3 16×18 rx1 + `M12 3v18M10 11v2M14 11v2` | Furniture & joinery, Wardrobes & storage, Wall panelling & screens, Loose furniture, Interiors & furniture |
| bulb | bulb | Lighting design, Hardscape & lighting |
| check-circle | circle r8 + check | Completion |
| key | circle cx8 cy15 r4 + key bit | Handover, Handover & aftercare |
| kitchen | rect 3,10 18×10 + top | Kitchens, Kitchen & bath upgrades |
| door | `M6 21V3h12v18M3 21h18` + knob | Doors & frames, Outdoor living (odd) |
| shield | shield + check | Quality inspection, Aftercare, Design intent protected, Routine/Interior maintenance, Emergency support, Ongoing support |
| team | two people | Project coordination, MEP coordination, One coordinated team, Clear accountability |
| facade | `M3 21h18M5 21V9l7-5 7 5v12` + door/windows | Architecture & approvals, Facade refresh, Facade & elevation design |
| leaf | leaf | Exterior & landscape, Landscape planning, Landscape upkeep |
| star | star | A streamlined journey |

Get the exact `d` strings from the source (e.g. `sed -n '3339,3358p'`). Store them as a `ServiceIcon` map. The separate 3D `.ic3` and `.art3` illustrations come from the global `KATIC_ICON` / `KATIC_ART` (≈4560–4612, 4900–4910) and are derived from titles.
