# A — GLOBAL LAYER SPEC (design system, shell, behaviour/animation engine)

Source: `reference/original/katic-designs-final.stripped.html` (5307 lines). Line numbers below refer to that file.
Scope: everything shared across the 25 hash-routed "pages". Per-page content/CSS is covered by other agents,
but where the global JS drives a page-specific widget (home pinned showcase, stages, svx, dvx…) it is documented here.

---------------------------------------------------------------------------------------------------
## 0. File anatomy (quick map)

| Lines | What |
|---|---|
| 1–27 | `<head>` meta: title, description, robots, canonical, theme-color `#000000`, geo (IN-KL / Kochi), OG + Twitter (og-image.jpg 1200×630) |
| 28 | JSON-LD `@graph` (Organization, 2× HomeAndConstructionBusiness, WebSite, FAQPage) — see §6.6 |
| 29–2377 | GLOBAL `<style>` (fonts, tokens, shell, components, generated colour overrides, responsive) |
| 2379–2380 | `<body>` + skip link `<a class="skip-link" href="#" data-skip>` |
| 2381–4395 | 25 `<section class="page" id="p-…" data-title data-desc>` blocks. 9 of them carry their own page `<style>` (home 2382–2790, about 2921, services 3116, architecture 3237, works 3605, project 3783, dubai 4098, reviews 4217) |
| 4397 | `window.KATIC_IMG` (key → data-URI, ~146 keys; stripped to comments here) + `window.KATIC_DIM` (key → [w,h]) |
| 4398 | `<script type="text/plain" id="kv-desktop">` / `kv-mobile` — base64 MP4 hero videos (embedded fallback) |
| 4399–5306 | Main `<script>`: IIFE blog (`window.KB`), IIFE icon library (`KATIC_ICON`), then one big IIFE containing templates, router, forms, all effects |

Pages (ids, `p-` prefix stripped): `home, about, services, architecture, interior, factory, construction, turnkey, renovation, exterior, property-care, works, project, div-design, div-interior, div-infrastructure, div-developers, div-care, news, blog, article, india, dubai, reviews, thank-you`.

IMPORTANT correction to the brief: **`data-fx="N"` is NOT a JS effect hook.** No JS reads it (0 references in the script). It is a
section identifier emitted by whatever visual tool generated the page; it is only used by the auto-generated colour-override CSS
(§1.6, §7). 20 sections carry it (15,16,17 about; 19,21,22,23 services; 35 architecture; 45 interior; 53 factory; 61 construction;
82 renovation; 104,106 works; 110,111,114 project; 168,169 dubai; 177 = injected CONTACT template).

---------------------------------------------------------------------------------------------------
## 1. Design tokens

### 1.1 `:root` custom properties (line 39–48, plus 1361, 1649)

| Token | Value | Usage / notes |
|---|---|---|
| `--or` | `#E8622C` | Brand orange. 153 uses. Buttons, kickers, accents, active states |
| `--or2` | `#E86835` | Declared, **unused** |
| `--or-t` | `#C24E1E` | (line 1361) "text orange" for small orange text on light bg (contrast). JS fixer also uses `#AD4517` on light-but-not-white bg |
| `--ink` | `#0B0B0B` | body text colour |
| `--black` | `#050505` | unused directly (home `.stg` uses #050505 literal) |
| `--dark` | `#0B0B0B` | unused |
| `--dark2` | `#141414` | unused |
| `--card` | `#1E1E1E` | unused via var (footer card literal `#1E1E1E`, later overridden to `#000`) |
| `--cream` `--cream2` `--cream3` `--paper` | `#F4F1EA` `#F7F4EF` `#F3F0E9` `#FDFCF8` | Mostly vestigial (site moved to "pure white or pure black only" — line 213). `#F7F4EF` used by `.btn.wh` |
| `--line` | `#DCD8CF` | unused via var; real warm line colours are literals `#e3dfd7`, `#e1ddd5`, `#e8e5df`, `#e3e0da`, `#d9d6cf` |
| `--dline` | `rgba(255,255,255,.14)` | unused via var |
| `--mut` | `#5E5B55` | `.p` paragraph colour on light |
| `--dmut` | `rgba(255,255,255,.62)` | `.dk .p` |
| `--fut` | `'Jost','Futura PT','Futura',system-ui,sans-serif` | display/body font (body default) |
| `--int` | `'Inter',system-ui,-apple-system,'Segoe UI',sans-serif` | UI/secondary font |
| `--W` | `1268px` | container max width |
| `--svh` | `900px` default (line 1649), overwritten by JS: `innerHeight / --z` px | "one screen tall" in design pixels |
| `--z` | set by JS (`clientWidth/1440` when ≥1100, else 1) | page zoom factor (§1.2) |
| `--d` | per element, `min(i,6)*0.09s` | reveal stagger delay (JS) |
| `--w` | per plant `<img style="--w:230px">` | plant width |
| `--sh` | per `.sc-card` 0..1 | showcase card shade opacity (JS) |
| `--sxd`, `--rx`, `--ry` | home-only | sx bar duration (dead), iso tilt (overridden) |

Colour palette actually used (frequency in CSS): `#fff`(179) `#111`(86) `#000`(46) `#ddd` `#555` `#333` `#aaa` `#222` `#bbb` `#eee` `#e3dfd7` `#888`
`#2a2a2a` `#262626` `#1d1d1b` `#ccc` `#777` `#444` `#c0522a` (small orange label text) `#666` `#0b0b0b` `#f7f4ef` `#dcdcdc` `#999` `#eccbb6`
(line-art stroke) `#f0b48e` (lit windows) `#a4633f` (line-art on light) `#8f8984` (step body text) `#6b6b6b` (contrast grey) `#d4521e` (orange hover)
`#f07040` (form send hover) `#ff8a5c` (dropdown "all" hover) `#ffd9c7` (nav hover) `#ffb08a` (sc-more hover) `#fff6f2` (invalid field bg) `#163` (unused `.ok`).

Shadows: header scrolled `0 14px 34px rgba(0,0,0,.28)`; dropdown `0 24px 50px rgba(0,0,0,.45)`; footer card `0 26px 50px rgba(0,0,0,.28)`;
rail button `0 6px 18px rgba(0,0,0,.25)`; mcta `0 8px 24px rgba(0,0,0,.25)`; active showcase card `0 30px 60px rgba(0,0,0,.35)`;
mobile nav `0 18px 40px rgba(0,0,0,.45)`; popup mobile `0 20px 50px rgba(0,0,0,.5)`; lightbox img `0 20px 60px rgba(0,0,0,.5)`;
social btn `0 2px 6px rgba(0,0,0,.08)`; step dot ring `0 0 0 5px rgba(232,98,44,.18)`.

Radii: the design is **square** (inputs explicitly `border-radius:0`). Exceptions: `50%` (dots, `.kfaq .qh i` circle, quote avatars, `.kty .ok`,
home dvx nav buttons 62px circles), `20px` pills (`.chip`, `.sc-pill`), `12px` (home `.wk .fb` on mobile).

Easings: `cubic-bezier(.2,.7,.2,1)` ("ease-out-k", 18 uses — reveals, popup, captions, mcta, sx/dvx) and `cubic-bezier(.3,.7,.2,1)`
("ease-draw", line-art draw-on). Plus `ease`, `linear`, `ease-in-out` (plants).
Durations in use: .2s (hover colour/border), .25s (chevron, opacity swaps), .3s (toast, mcta, header-ish), .35s (header, popup bg, FAQ), .45s/.55s
(popup panel, captions), .8s (card image hover zoom), .9s/1s (image cross-fades, reveals), 1.2s (clip reveal, hero intro), 1.4s (count-up),
1.6s/1.8s (line draw), 5s/6s (carousel auto-advance), 18s (logo marquee).

z-index scale: plants 3 / `-1` inside `.pp-host`; `.rail` (hero) 20; header `.hdr` 50; mobile nav panel 60; burger 70; `.rail.grail` 80;
`.mcta` 150; `.kprog` 300; `.klb` lightbox 400; `.kpop` modal 500; `.toast` 999; `.skip-link` 1000.

### 1.2 The `--z` zoom / scaling mechanism (exact)

```js
// line 4873
function setZoom(){
  const w=document.documentElement.clientWidth, z = w>=1100 ? w/1440 : 1;
  documentElement.style.setProperty('--z', z.toFixed(4));
  documentElement.style.setProperty('--svh', (innerHeight/z).toFixed(1)+'px');
}
setZoom(); addEventListener('resize', ()=>{ setZoom(); homeLayout(); homeTick(); });
```
```css
/* line 194 */
@media (min-width:1100px){ .page{ zoom: var(--z,1) } }
```
- The whole site is **authored at a fixed 1440px-wide desktop canvas in px**. On any viewport ≥1100px (clientWidth, i.e. excluding
  scrollbar) every `.page` (which contains its own header, all sections and the footer) is CSS-`zoom`ed by `width/1440`.
  1100px → z=0.7639; 1280 → 0.8889; 1440 → 1; 1680 → 1.1667; 1920 → 1.3333; 2560 → 1.7778. Text, images, gutters all scale linearly.
- `--svh` = viewport height expressed in **design pixels** (`innerHeight/z`), so `min-height:var(--svh)` after zoom equals exactly one
  real viewport. Used for: hero height `max(var(--svh),720px)`, ctasec `max(var(--svh),680px)`, every section `min-height:var(--svh)`,
  `#home-deliver` height, `#p-blog .hero`, pinned section heights (JS also computes `vh = innerHeight/z`).
- Below 1100px: z=1, no zoom; layout switches to the max-width:1099 / 860 / 420 responsive rules (classic responsive).
- Things **outside** `.page` are not zoomed (rendered at real px): `.rail.grail`, `.mcta`, `.kpop` popup, `.klb` lightbox, `.toast`,
  `.skip-link`, `.kprog`. Must reproduce that split in Next (render those via portal outside the zoom root).
- JS that measures geometry compensates manually: `fit()` divides gBCR heights by z; `#home-deliver .svx-l` padding uses
  `calc((100vw/var(--z,1) - var(--W))/2)`.
- Secondary per-section zoom: `fit()` (§5, E31) sets `style.zoom = f` (0.66 ≤ f < 1) on a section's children when content is taller
  than one screen on desktop.

Next.js recommendation:
- Keep the mechanism for pixel parity: a `<ZoomRoot>` wrapper (header + main + footer) with `@media (min-width:1100px){ zoom:var(--z) }`.
- Set `--z`/`--svh` **before first paint** with a tiny inline script in `app/layout.tsx` (`<script dangerouslySetInnerHTML>` in `<head>`)
  plus a `resize` listener in a client component — otherwise you get a 1440px flash/CLS on hydration.
- Pure-CSS alternative (no JS): `:root{--z:tan(atan2(100vw,1440px))}` + `--svh:calc(100svh / var(--z))` inside the ≥1100 media query.
  Caveat: `100vw` includes the scrollbar (clientWidth does not) → ~1% difference on Windows. Use JS if exact parity matters.
- `zoom` is Baseline (Firefox 126+, May 2024). Chrome 128+ "standardized CSS zoom" changed how `getBoundingClientRect`/offset* report
  inside zoomed subtrees — every scroll-math hook (pinned showcase, stages, parallax, fit) must be verified at z≠1 in Chrome, Safari, Firefox.
- Do NOT try to re-express everything as Tailwind responsive classes for ≥1100 — the desktop design is one fixed composition.
  Author desktop in px (Tailwind arbitrary px or a px-based spacing scale) and let zoom do the scaling.

### 1.3 Breakpoints (desktop-first)

| Query | Count | Meaning |
|---|---|---|
| `(min-width:1100px)` / JS `innerWidth>=1100` | 7 CSS + 3 JS | Desktop: zoom on, fit-to-screen sections, pinned scroll sections, hero = 1 screen |
| `(max-width:1099px)` | 21 | Tablet/laptop-small: no zoom, 2-col grids, wrap = 100%-72px, sections padding 80/80, pinning off |
| `(min-width:861px)` | 3 | ≥ tablet (popup desktop sizing, svx layout) |
| `(max-width:860px)` / JS `innerWidth<=860` | 33 + 6 | Phone: single column, burger menu, mobile hero layout, sticky `.mcta` bar |
| `(max-width:420px)` | 1 | Small phone: hide `.rail.grail`, icon-only call/WA in mcta, footer bottom padding 72 |
| `(max-width: 860px), (orientation: portrait) and (max-width: 1099px)` | JS | hero video mobile cut |
| `(hover:hover)` | JS | (dead .sx) hover-select only on hover devices |
| `(prefers-reduced-motion:reduce)` | 7 CSS + 5 JS | §5 |

Tailwind v4: define `--breakpoint-xs: 421px; --breakpoint-md: 861px; --breakpoint-lg: 1100px;` and author with `max-lg:` / `max-md:` /
`max-xs:` variants (desktop-first) to mirror the source exactly.

### 1.4 Containers / gutters / rhythm

- `.wrap` = `width:min(var(--W)=1268px, calc(100% - 172px)); margin:0 auto; position:relative` → 86px gutters on the 1440 canvas.
- `.wrap.w72` = `min(1296px, calc(100% - 144px))` (72px gutters).
- ≤1099: `.wrap,.wrap.w72{width:calc(100% - 72px)}` (36px). ≤860: `calc(100% - 40px)` (20px).
- Section vertical rhythm (cascade is convoluted — see §7): effective desktop values by specificity:
  - generic `.page>section` (not hero/ctasec/blk/wy/stg/pinsec): **120px / 120px** (line 1640, specificity 0,7,1 beats line 1051's 0,6,3 rule
    `104px/36px`). `.page>.contact`: 104/36 (line 1051 wins there). Home sections: `#p-home>section:not(.pinsec):not(.stg)` **104/36** (home style).
    `.blk`/`.wy`: 104/36. **Verify in a browser with computed styles — the author intended 104/36 everywhere on desktop.**
  - ≥1100: every such section also `min-height:var(--svh); display:flex; flex-direction:column; justify-content:center` (one screen, centred).
  - ≤1099: 80/80. ≤860 contact 80/0 (`.contact{padding:80px 0}`).
- Hero: ≥1100 `height:max(var(--svh),720px) !important; padding-top:max(0px,calc((var(--svh) - 720px)/2))` (content box stays 720 tall,
  centred). ≤1099 `height:auto; min-height:100svh`. ≤860 mobile banner (§3.6). Base `.hero{height:720px}` / home 725px.
- `.ctasec` (image CTA band): ≥1100 `height:max(var(--svh),680px)`.

### 1.5 Proposed Tailwind v4 `@theme`

```css
@import "tailwindcss";
@theme {
  /* colour */
  --color-brand: #E8622C;          /* --or */
  --color-brand-hover: #d4521e;
  --color-brand-soft-hover: #f07040;
  --color-brand-text: #C24E1E;     /* --or-t, small text on white */
  --color-brand-text-alt: #AD4517; /* small text on light non-white */
  --color-brand-label: #c0522a;    /* .kc small, .kpost meta */
  --color-brand-tint: #ffd9c7;     /* nav hover */
  --color-brand-light: #ff8a5c;
  --color-ink: #0B0B0B;
  --color-near-black: #050505;
  --color-panel: #161616;          /* dropdown base */
  --color-card-dark: #0c0c0c;
  --color-line-dark: #262626;
  --color-line-dark-2: #2a2a2a;
  --color-line-warm: #e3dfd7;
  --color-line-warm-2: #e8e5df;
  --color-line-warm-3: #e1ddd5;
  --color-cream: #F4F1EA; --color-cream-2: #F7F4EF; --color-cream-3: #F3F0E9; --color-paper: #FDFCF8;
  --color-mut: #5E5B55;
  --color-art-line: #eccbb6; --color-art-lit: #f0b48e; --color-art-line-light: #a4633f;
  --color-step-text: #8f8984;
  /* grey ramp actually used: 111 222 262626 2a2a2a 333 444 555 666 6b6b6b 777 888 999 aaa bbb ccc ddd eee → use Tailwind arbitrary or define --color-g-111 … */

  /* fonts */
  --font-display: "Jost", "Futura PT", "Futura", system-ui, sans-serif;   /* --fut (body default) */
  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif; /* --int */

  /* layout */
  --container-site: 1268px;  /* .wrap */
  --container-wide: 1296px;  /* .wrap.w72 */
  --breakpoint-xs: 421px; --breakpoint-md: 861px; --breakpoint-lg: 1100px;

  /* motion */
  --ease-out-k: cubic-bezier(.2,.7,.2,1);
  --ease-draw: cubic-bezier(.3,.7,.2,1);
  --animate-marquee: kmarq 18s linear infinite;
  --animate-hero-in: kHeroIn 1.2s var(--ease-out-k) both;
  --animate-bar6: svxbar 6s linear forwards;
  --animate-bar5: dvxbar 5s linear forwards;

  /* shadow */
  --shadow-header: 0 14px 34px rgba(0,0,0,.28);
  --shadow-dropdown: 0 24px 50px rgba(0,0,0,.45);
  --shadow-footer: 0 26px 50px rgba(0,0,0,.28);
  --shadow-rail: 0 6px 18px rgba(0,0,0,.25);
  --shadow-mcta: 0 8px 24px rgba(0,0,0,.25);
  --shadow-card-active: 0 30px 60px rgba(0,0,0,.35);
  --radius-pill: 20px;
}
:root { --svh: 900px; --z: 1; }
```
Plus a `px`-friendly spacing approach: Tailwind v4 spacing is `--spacing: .25rem` multiples; most source values are odd px
(18, 22, 26, 34, 41, 46, 52, 58, 62, 86, 104…). Recommend `--spacing: 1px` (so `p-104` = 104px) or heavy use of arbitrary values.
Tailwind's `zoom` utility does not exist → write `.zoom-root` in plain CSS.

### 1.6 Section theming (white/black only)

Design rule (line 213, 1664): every section is pure `#fff` or pure `#000`. Implemented as **three stacked layers**:
1. Per-page explicit list (lines 1665–1717): e.g. `#p-home>section.ab{background:#fff !important}` … 52 rules.
2. Generated `html body section:is([data-fx="N"],#_q#_r#_s){background-color:#000!important}` + deep `>:nth-child(a)>:nth-child(b)…`
   colour overrides (lines 215–1037, 1400–1481) — ~800 lines, specificity-boosted with fake IDs `#_q#_r#_s` inside `:is()`.
3. Runtime "safety net" JS (§5 E37) that recolours any low-contrast text inline.
Plus `.ks` (white) / `.ks.dk` (black), `.svx.dk`, `.contact` (black, `#000 !important`, except data-fx 177 on home/about = white).

Rebuild: give every section component an explicit `theme: 'light' | 'dark'` prop and author both colourways in the component.
Do not port layers 2 and 3 — use them only as a reference for what the final colours are (screenshot-diff each section).

---------------------------------------------------------------------------------------------------
## 2. Typography

### 2.1 Font files (all `font-display:swap`, all `woff2`, inline base64 in source; extracted to `assets/`)

| File | Family | Weight | Style | Size |
|---|---|---|---|---|
| inline-1.woff2 | Jost | 400 | normal | 9.4 KB |
| inline-2.woff2 | Jost | 500 | normal | 10.5 KB |
| inline-3.woff2 | Jost | 600 | normal | 10.5 KB |
| inline-4.woff2 | Jost | 700 | normal | 10.5 KB |
| inline-5.woff2 | Jost | 800 | normal | 10.5 KB (800 never used) |
| inline-6.woff2 | Inter | 400 | normal | 23.7 KB |
| inline-7.woff2 | Inter | 500 | normal | 24.3 KB |
| inline-8.woff2 | Inter | 600 | normal | 24.5 KB |

No italics: `.kq .c .m` asks for `italic 600 Inter` → faux italic. Inter 300 requested by `.kstats b` (`font:300 50px`) → falls back to
400. The Jost files (~10 KB) are clearly aggressively subset (Latin basic) — glyphs like `₹`, `→`, `↗`, `—`, `’`, `·` may fall back
to system fonts; check. Recommend `next/font/google` (`Jost` weights 400/500/600/700, `Inter` 400/500/600, `subsets:['latin','latin-ext']`,
`display:'swap'`, CSS variables `--font-display`/`--font-sans`) — or `next/font/local` with these exact files for byte-identical metrics.

### 2.2 Global type classes (desktop px on the 1440 canvas)

| Class | Spec | ≤1099 | ≤860 |
|---|---|---|---|
| body | Jost 400, `#0B0B0B`, antialiased | | |
| `.h1` (hero H1) | Jost 700 76px/0.96, ls −.005em, #fff, `.or` span orange | 62px | 44px; hero h1 `clamp(32px,9.6vw,42px)/1.05 ls −.01em` (wins, !important) |
| home hero h1 | 78px/.93 (home style) | | |
| `.kh-hero h1` | 74px/1, margin-top 22 | | |
| `.st` (section title) | Jost 400 58px/1.12 uppercase ls −.005em; `.st.m` 52px; `.st.l` 66px/1.06 | 46px | 34px/1.1 !important |
| home section `h2` | Jost 500 56px/1.02 uppercase ls 0 (home style "one font, one scale") | 46 | 34 |
| `.contact h2` | Jost 700 54px/1.0 ls .005em (home: 500 40px/1.05 uppercase; combo: 44px) | | 38px (home 30) |
| `.kick` (eyebrow) | Jost 500 10.5px ls .22em uppercase orange, `::before` 22×1px orange line, gap 12 | | |
| `.kick.int` | Inter 500 9.5px ls .2em | | |
| `.kick.dot` | before = 5px circle; `.kick.c` centred; `.kick.w` white (forced back to orange by "visibility fixes" line 1213) | | |
| home `.kick` | Jost 500 11px ls .22em | | |
| `.eyebrow` (home hero) | Jost 400 13px #e9e5dd ls .02em, 5px orange dot | | 11px ls .18em |
| `.lead` | Jost 400 15px/1.75 | | 15px |
| `.ks .kh .lead` | Inter 400 16px/1.8 #555 (dark: #bbb), max-w 600 | | |
| `.kh-hero .lead` | Inter 400 17px/1.7 #eee, max-w 640 | | 15px/1.6 |
| `.p` | Inter 400 13px/1.75 `--mut` (dark `--dmut`); in `.ks` 14px/1.9 | | |
| `.tlink` | Jost 500 10px ls .2em uppercase orange, 1px orange underline pb 2 | | |
| `.k-more` | Inter 600 11px ls .12em uppercase, `<b>` orange arrow | | |
| `.chip` | Inter 500 8.5px ls .14em uppercase, 20px tall, 1px #ccc, radius 20 | | |
| `.tag` | Inter 500 8.5px ls .14em uppercase on #1a1a1a, abs 16/16 | | |
| `.ft h3` | Jost 700 40px/1.1 ls .01em | | 30px |
| `.kty h1` | Jost 500 64px/1.05 uppercase | | 34px |
| `.kart h1` | Jost 500 52px/1.08 uppercase | | 34px |
| `.kart .body p` | Inter 400 16.5px/1.9 #333; h2 Jost 500 30px/1.25 uppercase | | |
| `.kfq-h .st` | 46px/1.1 (combo: 40px; ≥1100 combo 36px) | | 34px |
| `.ksteps.k3d .s h3` | Jost 500 30px/1.05 uppercase (dense rows 22px) | | |
| `.kfeat .f h3` | Inter 400 22px/1.3 | | |
| `.kc h3` | Inter 400 23px/1.25; `.kc small` Inter 600 9px ls .16em uppercase | | |
| `.kstats b` | Inter 300 50px (renders 400) | | |
| `.kq q` | Inter 400 18px/1.5 | | |
| `.kfaq .qh` | Inter 400 19px/1.4; `.kfaq-sec .qh` 17px/1.45 | | |
| Inputs | Jost 400 14px (popup 14.5) | | **16px !important** (prevents iOS zoom) |
| Mobile min size | JS `mtext()` forces every text node <11px → 11px !important at ≤860 | | |

Font-family mixing: Jost is the base, but almost every `.k*` component uses Inter. The home page overrides everything back to Jost
(home style, "homepage type system: one font, one scale"). Other pages keep the Jost/Inter mix. Decide per component which family; don't
blindly globalise.

---------------------------------------------------------------------------------------------------
## 3. Shell

### 3.1 Template injection (lines 4685–4705)
Markup placeholders are replaced on load:
- `<div data-tpl="header" data-variant="…">` → `header(pageId)` (one header per page, placed inside each page's hero; on pages without a
  hero (article, thank-you) it sits at the top of the page). **`data-variant` is ignored** — `header()` always uses `V.home`
  (`const c=V.home`). The `V` table (about/works/project/listing/details/reviews/kochi/dubai variants with different items/CTA labels/NE icons)
  is dead.
- `<div data-tpl="rail">` → removed (in-hero rail replaced by the global fixed rail `GR`, appended to `<body>`).
- `<div data-tpl="contact">` → `CONTACT` template (home, about, services). Gets `id` renamed: home → `start`, others → `<page>-contact`.
- `<div data-tpl="footer">` → `FOOTER`.
- Then: **contact + FAQ merge** (line 4691): on any page whose direct children include both `.contact` and `.kfaq-sec`, the FAQ is moved
  into the contact section → `.contact.combo` with `.kc-l` (info + form) and `.kc-r.kfaq-sec` (FAQ heading + accordion; the FAQ intro `p` and
  "Ask us directly" link are deleted, kicker forced `.w`). Applies to: home, architecture, interior, factory, construction, renovation.
  Turnkey, exterior, property-care keep a standalone white `.kfaq-sec`.
- `[data-arw]` elements get an arrow SVG appended (`ARW` →, or `NE` ↗ if `data-arw="ne"`). 47 uses.

Next.js: Header/Footer/ContactRail/MobileCtaBar/StartProjectModal live in `app/layout.tsx` (server components with small client islands);
`<ContactSection faq={…}>` renders the combo layout when a page passes FAQ items.

### 3.2 Header `.hdr.fut` (CSS 66–89, 195–198, 1633–1636, 1721–1725, 1982–1988, 2114–2135, responsive 2140–2370; JS `header()` 4635)

Markup:
```html
<header class="hdr fut">
  <a class="logo" href="#home" aria-label="Katic Designs home"><img data-img="9c88894f7b" alt="Katic Designs"></a>  <!-- 115×65 asset -->
  <nav>
    <div class="ni"><a href="…" class="on?">Label [chev]</a> [<div class="dd [mega]"><div class="ddg"><div class="grp"><small>Group</small><a>…</a></div>…</div><a class="all">All … →</a></div>]</div> …
    <a class="cta" href="#contact" data-go="popup">Start a Project [→ 10×10]</a>
  </nav>
  <button class="burger" aria-label="Menu" aria-expanded="false"><svg class="bm"…hamburger/><svg class="bx"…close/></button>
</header>
```
Geometry/style (desktop, design px): originally `position:absolute`, overridden `position:fixed` (line 1634); `top:18px; left:36px; right:36px;
height:62px; padding:0 18px; z-index:50; display:flex; justify-content:space-between; background:rgba(22,22,22,.86);
border:1px solid rgba(255,255,255,.12); backdrop-filter:blur(10px)`. Logo img height 44px (40 base → 44 line 198).
Nav links: Jost 500 15px #fff, `padding:0 19px`, full header height, gap 6 to chevron (8×8, `.chev` rotates 180° on hover/focus-within, .25s).
Hover colour `#ffd9c7`. Active page link (`.on`) = font-weight 600 (underline `::after` removed by line 2091 "no orange lines on header").
CTA: orange bg, Jost 600 15px, height 44px, padding 0 22px, margin-left 16px, hover `#d4521e`.

Scroll behaviour (`hdrState`, line 5003): `scrollY>40` → `.hdr.scrolled`: `top:10px; background:rgba(14,14,14,.94); box-shadow:0 14px 34px rgba(0,0,0,.28)`;
logo 38px. Transition `top .35s, background .35s, box-shadow .35s, height .35s`. **No hide-on-scroll**, no colour inversion.
Note the header is inside the zoomed page, so on desktop its 18/36px offsets scale with z.

Nav items (always `V.home`): `Home`, `About`, `Services▾`, `Projects▾`, `Divisions▾`, `Reviews`, `Blogs`, `Location▾`; CTA "Start a Project →".
Top-level targets (`T`): Home `#home`, About `#about`, Services `#services`, Projects `#works/works-list`, Divisions `#div-design`,
Blogs `#blog`, Reviews `#reviews`, Location `#india`.
Active map (`ACTIVE`): services/architecture/interior/factory/construction/turnkey/renovation/exterior/property-care → Services; works/project →
Projects; div-* → Divisions; blog/article → Blogs; india/dubai → Location; news → none.

Dropdowns (`DD`):
- **Services** — group "Design": Architectural Design `#architecture`, Interior Design `#interior`, Exterior & Landscape Design `#exterior`;
  group "Construction": Construction & Execution `#construction`, Turnkey Projects `#turnkey`, Renovation & Remodeling `#renovation`,
  Property Care & Maintenance `#property-care`; all-link "All Services →" `#services`.
- **Projects** — "Sectors": Residential/Commercial/Institutional/Hospitality → `#works/works-list/<slug>`; "Disciplines": Architecture
  `/architecture`, Interiors `/interiors`, Villas / Flats `/villas`; all "All Projects →" `#works/works-list/all`.
- **Divisions** — "Divisions": KATIC Design `#div-design`, KATIC Interior `#div-interior`, KATIC Infrastructure `#div-infrastructure`,
  KATIC Developers `#div-developers`, KATIC Care `#div-care`; all "About KATIC →" `#about/about-divisions`.
- **Location** — "Locations": India `#india`, Dubai `#dubai` (no all-link).
- The DD data has a 3rd field (description) per item; **it is never rendered** (`ls.map(([l,h])=>…)`), so the `.dd a em` CSS is dead.
- Note `Factory` (`#factory`) is not in the nav at all (only linked from content).

Dropdown final look (last-wins "compact dropdown", lines 2114–2135): `position:absolute; top:100%; left:0; width:max-content; min-width:270px;
max-width:320px; padding:0; background:rgba(22,22,22,.97); border:1px solid #2c2c2c; box-shadow:0 24px 50px rgba(0,0,0,.45); backdrop blur 10`.
Groups `padding:16px 26px 12px` (first: top 20), separated by `border-top:1px solid #333`; group label `<small>` Jost 600 11px ls .14em
uppercase orange pb 4; links Jost 400 15.5px/1.25 #e6e6e6 `padding:6px 0`, hover #fff + `translateX(4px)` (.2s); `.all` link border-top #333,
`padding:14px 26px 18px`, Jost 600 16px orange, hover `#ff8a5c`. `.mega` 2-column grid is neutralised (`.ddg{display:block}`).
Open/close: pure CSS `display:none → block` on `.ni:hover` / `.ni:focus-within` (no fade). After clicking any nav link `body.nohover`
forces dropdowns hidden until the next `mousemove` (line 4877).

Responsive: ≤1099 links 13px padding 0 11px, CTA padding 0 14px. ≤860 → mobile nav (§3.3), header `left/right:14px; top:12px; height:58px`,
no backdrop blur, bg `rgba(22,22,22,.94)`.

### 3.3 Mobile nav (`.hdr.open`, `body.mnav-open`) — ≤860px
Three overlapping CSS definitions exist; the effective one (all `!important`, lines 1167–1186 + 1507–1512) is a **compact dropdown panel**,
not the full-screen overlay defined later without `!important` (line 2224):
- `nav{position:absolute; top:calc(100% + 8px); right:0; left:auto; width:min(300px, calc(100vw - 28px)); max-height:min(62vh,460px);
  overflow-y:auto; overscroll-behavior:contain; padding:4px 16px 14px; background:#111; border:1px solid #262626;
  box-shadow:0 18px 40px rgba(0,0,0,.45); flex-direction:column; z-index:60}`; hidden (`display:none`) unless `.hdr.open` (`display:flex`).
- Items: full width, `border-bottom:1px solid #222`, link 14px Jost 500 ls .02em `padding:11px 0`, `justify-content:space-between` (chevron right,
  rotates 180° when `.ni.op`, .25s).
- Submenu: hidden until `.ni.op`; group labels hidden; links `padding:6px 0 6px 12px`, 13px, #bbb, `border-left:1px solid #333` (hover #fff +
  orange left border); `.all` orange.
- CTA full width, height 44px, margin-top 12px, 13px.
- Burger: 40×40, hamburger ↔ close icon swap (`.bm`/`.bx`).
Behaviour (JS 5157–5167, 5300–5302, a11y 5274):
- Burger click toggles `.hdr.open` (handler at line 5301) and a capture handler syncs `aria-expanded` + `body.mnav-open` on next tick and
  clears `.op` when closing.
- First tap on a top-level item that has a dropdown opens it (`.ni.op`, closes siblings) and prevents navigation; second tap navigates.
- Click outside `.hdr` closes; any nav link click closes; `hashchange` clears `.op` and `mnav-open`; `Escape` closes and refocuses burger.
- `body.mnav-open` hides `.rail.grail` (opacity 0) and suppresses `.mcta`.
- CTA in mobile nav opens popup and closes the menu.
- No focus trap, no `aria-controls`, nav has no `aria-label`.

### 3.4 Global contact rail `.rail.grail` (CSS 91–97, 1727–1731, responsive; JS `RAIL` 4652, append 4705)
Three square buttons appended to `<body>` (outside zoom):
1. WhatsApp `https://wa.me/10000000000` (orange, WA glyph) — `data-tip="Chat on WhatsApp"`
2. Email `mailto:hello@katicdesigns.com` (`.w` white bg, #111 icon) — "Send an Email"
3. Call `tel:+10000000000` (orange) — "Call Us"
Desktop: `position:fixed; right:22px; top:50%; translateY(-50%); z-index:80; gap:10px`, buttons 48×48 (icons 20×20), shadow
`0 6px 18px rgba(0,0,0,.25)`. Tooltip `::after{content:attr(data-tip)}` left of button (right:58px), #111 bg, Inter 500 12px, padding 8px 12px,
hidden → hover: opacity 1 and `translateX(6px)→0`, .2s.
≤860: `top:auto; bottom:16px; right:12px; transform:none`, 44×44, no tooltip; hidden (opacity 0, .3s) while `body.in-hero`
(scrollY < hero height − 120, JS 5170) and while `mnav-open`. ≤420: `display:none`.
`RAIL_CHAT` (chat-bubble variant for `data-chat="1"`) is never used.

### 3.5 Phone sticky enquiry bar `.mcta` (CSS 1376–1391, JS 5222–5228) — ≤860 only
`<nav class="mcta" aria-label="Quick contact">`: [Call (tel)] [WhatsApp (wa.me)] [Start a Project → (data-go="popup", orange)].
`position:fixed; left:10px; right:10px; bottom:10px; z-index:150; grid auto auto 1fr; gap 6; padding-bottom:env(safe-area-inset-bottom)`;
buttons height 50, Jost 500 12px ls .12em uppercase, shadow. Dark buttons `#111` border `#2a2a2a`. ≤420: Call/WA icon-only 50×50.
Shown (`.on`, `translateY(130%)→none`, .3s ease-out-k) when: width ≤860 AND scrolled past `hero.offsetHeight-140` (or page has no hero)
AND not within 260px of page bottom AND popup closed AND mobile menu closed.

### 3.6 Mobile hero layout (≤860, lines 1189–1210) — applies to every `.page .hero`
`min-height:100svh; display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:40px`; `.wrap.in` padding-top 110,
sides 20; H1 `clamp(32px,9.6vw,42px)/1.05`; kick/eyebrow 11px; lead/p 15px/1.6 mt 16; button groups stacked full-width, buttons 50px tall,
`justify-content:space-between`, 12px; `.plain` link becomes bordered button; decorative bits (`.vl,.bt,.yr,.cur,.scroll,.sc`, extra `.wrap`)
hidden; shade becomes vertical `linear-gradient(0deg, rgba(0,0,0,.82) 0, .5 45%, .28 100%)` (home: 180deg .55/.5/.35).

### 3.7 Footer `.ftw > footer.ft + .fbar` (CSS 167–183, 1545–1548, 1580–1595, 1716; template `FOOTER` 4672)
- `.ftw`: white wrapper `padding:28px 36px 0`. `.ft`: card, bg `#000` (base `#1E1E1E` overridden line 1716), `padding:48px 41px 34px`,
  shadow `0 26px 50px rgba(0,0,0,.28)`.
- Content: logo (28px tall, links `#home`); decorative pot plant `img.plant.pot` (`7987ed3204`, top-right, width 216px, max-h 252, static);
  H3 "Homes designed around<br>how you live." (Jost 700 40/1.1); about para (Jost 14/1.8, 75% white, max-w 345) "Katic Designs is a
  residential and interior design studio offering turnkey architecture, construction, interior design, exterior design, and landscaping
  under one roof."; CTA `.btn.orf` "Start a Project →" (h47, Jost 600 15px) → opens popup (footer `data-go="contact"`/`href="#contact"`
  links are intercepted to open the popup, line 5174).
- 6 columns, grid `1fr 1.25fr 1.1fr .8fr 1fr 1.2fr`, gap 20, mt 42; h4 Jost 600 15px mb 16; links Jost 14/1.45 75% white → #fff:
  - **Explore**: Home `#home`, About `#about`, Projects `#works/works-list`, Client Reviews `#reviews`, Blogs `#blog`, News `#news`
  - **Services**: All Services, Architectural Design, Interior Design, Construction & Execution, Turnkey Projects, Renovation & Remodeling,
    Exterior & Landscape Design, Property Care & Maintenance
  - **Divisions**: KATIC Design / Interior / Infrastructure / Developers / Care
  - **Locations**: India `#india`, Dubai `#dubai`
  - **Address**: "Katic Designs Studio / 14 Ridgeline Road / Countryside District / 400001" → Google Maps search link (placeholder address)
  - **Contact**: hello@katicdesigns.com, `+1 (000) 000-0000` (tel:+10000000000), "Enquire about a project" (→ popup)
- `.fbar` (on white): "© Katic Designs 2026. All Rights Reserved. · crafted@ateliergroupcompany" (link ateliergroupcompany.com), Jost 12.5px #222;
  socials Instagram / Facebook / LinkedIn / X (generic homepages), 36×36 white squares, border #ddd → #111 hover, 12px icons.
- Footer link click behaviour: sets `_navTop` → target page opens at top (anchors ignored, except `home-process`); clicking a link to the
  current page smooth-scrolls to top.
- Responsive: ≤1099 cols 3 (two conflicting rules: 2 then 3 — later wins); plant 189px. ≤860 cols 2, `.ftw` 20px 12px, `.ft` 36px 22px 28px,
  h3 30px with `padding-right:96px`, plant 96px at top-right 14/14 (display:block !important beats the earlier `display:none`), fbar stacked.
  ≤420 bottom padding 72px (room for `.mcta`).

### 3.8 Other floating / global elements
- **Skip link** `.skip-link` (fixed, left 16, top −80 → 16 on focus, white bg, 2px orange border, Jost 500 14px, .2s). JS: focuses the active
  page's hero h1 or first section (adds tabindex −1).
- **Start a Project popup** `.kpop` (§4, §6.4).
- **Lightbox** `.klb` (§5 E43).
- **Toast** `.toast` (fixed bottom 24 centred, #111, Inter 13px; `translateY(120px)→0` .3s; auto-hide 2.6s). Used for validation messages.
- **Scroll progress bar** `.kprog` — created by JS but permanently `display:none !important` (line 2090). Dead.
- **No preloader, no custom cursor, no back-to-top button.** (WhatsApp exists only as rail/mcta/thank-you buttons.)
- **Plants** `.plant` decorative PNG/WebP cut-outs (15 instances, `pp_*` keys) — all animation disabled (§5 E47).

---------------------------------------------------------------------------------------------------
## 4. Reusable component inventory (global CSS) → proposed React components

| Source class | What it is / variants | React component (props) |
|---|---|---|
| `.page` / `.page.active` | route container; `display:none` unless active; zoomed ≥1100 | Next route segment inside `<ZoomRoot>` |
| `.wrap`, `.wrap.w72` | container 1268 / 1296 with 86/72 gutters | `<Container size?: 'site'|'wide'>` |
| `.ks` / `.ks.dk` | standard section shell white / black, `overflow:hidden` | `<Section theme="light|dark" id? fit?: boolean>` |
| `.ks .kh` (+`.top`) | section header grid 646px / 1fr (title left, lead+btn right), align end | `<SectionHeader kicker title lead? cta? align?: 'end'|'start'>` |
| `.ks .ctr` | centred header variant | `<SectionHeader centered>` |
| `.kick` (`.int`,`.w`,`.dot`,`.c`) | eyebrow with 22px line (or dot) | `<Kicker font?: 'display'|'sans' marker?: 'line'|'dot' center?>` |
| `.st` (`.m`, `.l`), `.h1`, `.lead`, `.p` | type primitives | `<Heading as level size?: 'm'|'base'|'l'>`, `<Lead>`, `<Body>` |
| `.btn` + `.wh` `.ol` `.olc` `.dk` `.dko` `.orf` + size `.sm` `.xs` + `.caps` `.fut` `.futcap` | button: 52px h, 0 28px, Inter 500 13.5; `wh` cream→white, `ol` white + #CFCBC3 border→#111, `olc` transparent outline, `dk` #111 + white/28 border→#fff, `dko` transparent white/40, `orf` orange→#d4521e; `sm` 46h/12.5, `xs` 40h/11.5 | `<Button variant="light|outline|outline-clear|dark|dark-outline|primary" size="md|sm|xs" caps? font? icon?: 'arrow'|'ne'|null href|onClick>`; `.ks .btn` overrides to 600 12.5 gap 22 |
| `[data-arw]` | appends → / ↗ | `icon` prop on Button/Link |
| `.tlink`, `.k-more` | text links with orange accent | `<TextLink variant="underline|more">` |
| `.chip`, `.tag`, `.sc-pill` | small pills/labels | `<Chip>`, `<Tag>` |
| `.hero`, `.hero>.bg`, `.shade`, `.in`, `.kh-hero` (`.short`) | full-screen banner w/ image or video bg, 90deg shade, content | `<Hero bg={img|video} shade?="default|kh" eyebrow title lead buttons align?: 'center'|'bottom' short?>` |
| `.ctasec` | full-bleed image CTA band, 90deg .7→.3 overlay, white text, parallax img | `<CtaBand image title text cta parallax>` |
| `.contact` (+`.grid`, `.gt`, `.ci`, `.form`) and `.contact.combo` (`.kc-l`, `.kc-r`) | enquiry block (black; data-fx 177 white on home/about); 2-col 1fr/640px; combo 1fr/1fr gap 96 with FAQ | `<ContactSection theme source prefill?: {svc,loc} faq?: FaqItem[] extraFields?>` |
| `.form` (`.f`, `.sel`, `.full`, `.half`, `.send`, `.note`, `.ok`) | 2-col enquiry form, inputs 46h #F8F7F3, select chevron, orange send button (#111 text!) | `<EnquiryForm source fields? submitLabel>` |
| `.sform` | inline service form (dark, 42h inputs) — **no markup uses it now** | skip / `<InlineEnquiryForm>` if needed |
| `.kpop*` | Start-a-Project modal (§6.4) | `<StartProjectModal>` + `useStartProject()` context (`open({service?})`) |
| `.kc-grid` (`.c2..c5`) + `.kc` (`.im`, `.tg`, `small`, `h3`, `p`, `.k-more`) | image card grid; img heights c2 420 / c3 300 / c4 260 / c5 230 (≥1100 c3 200); hover img scale 1.04 .8s, h3 → orange | `<CardGrid cols>` + `<ImageCard href img tag? label title text more?>` |
| `.krows .r` | numbered rows grid 64/300/1fr/24, 84px min, borders | `<NumberedRows items={{n,title,text,href}}>` |
| `.ksec` | 4-up sector tiles 400px tall, gradient, label bottom | `<SectorTiles items>` |
| `.ksteps` (+`.k3d`, `.lt`, `.dk`) | process steps; JS turns every `.ksteps` into `.k3d` with isometric line-art (`.art3`) | `<ProcessSteps theme steps={{label,title,text}} columns>` (art chosen by keyword) |
| `.kfeat` (+`.f`, `.ic3`, `.lt`, `.grid3`) | feature tiles 1px border → orange hover; JS injects unique isometric icon per tile | `<FeatureTiles theme items cols icon="auto|none">` |
| `.ksplit` (`.rev`, `.im .cap`, `ul`) | 50/50 image + text, 560px image, 2-col bullet list with orange squares | `<Split image caption reverse kicker title lead body bullets cta>` |
| `.kdiv` & `.ks.slim` | divisions strip (pills) → upgraded to full-height list of 46px uppercase links (`section.ks.slim`) | `<DivisionsStrip theme slim>` |
| `.kq .c` | testimonial cards (3-up), big orange quote mark, who row w/ avatar | `<TestimonialGrid items theme>` |
| `.faq .qa .qh .qb` / `.kfaq` / `.kfaq-sec` + `.kfq` `.kfq-h` | accordion; `.kfaq` = circle +/− icon, display toggle; `.kfaq-sec` = minimal white variant with sticky heading (400px col, gap 96), max-height animation | `<Faq items variant="classic|minimal" heading? defaultOpen=0>` and `<FaqSection>` |
| `.kba .pr` | before/after pairs (static side-by-side figures + text column 360px), BEFORE/AFTER badges (after = orange). **No slider** (`#ba` is just this section on renovation) | `<BeforeAfterPairs items>` |
| `.kgal` (`figure.w` span 2) | 3-col gallery 320px | `<Gallery items zoomable>` |
| `.kstats` | 4-up stats (50px numerals, border-bottom) | `<Stats items countUp?>` |
| `.koff` | office block: dl grid 150px/1fr + image | `<OfficeBlock details image>` |
| `.kty` (+`.ok`, `.ref`, `.grid3`, `.btns`, `.ty-fb`) | thank-you page | `<ThankYou lead>` |
| `.kblog-bar`, `.kcats`, `.kposts`, `.kpost`, `.kempty`, `.kmore-wrap` | blog listing (search+sort bar and category chips are **hidden by CSS**) | `<BlogList posts pageSize=6 step=3>` + `<PostCard>` |
| `.kart-cover`, `.kart` (`.crumb`, `.info`, `.body`, `aside` sticky 110) | article page | `<ArticleLayout post latest>` |
| `.kbh` (`.ft-post`, `.list .li`), `.kbh-cats` (hidden) | home blog feature (1 featured + 3 list) | `<BlogFeature posts>` |
| `.knews-grid`, `.knw` (`.big`) | news cards 3-up / big split card | `<NewsGrid items>` / `<NewsCard big?>` |
| `.svx*` (home) | services split showcase, auto-advance | `<ServicesShowcase groups>` (client) |
| `.sc-track` / `.sc-card` / `.sc-ov` / `.sc-shade` / `.pinsec` | pinned card showcase (home works) | `<PinnedShowcase cards spacing=640>` (client) |
| `.klb` + `[data-zoom]` | lightbox | `<Lightbox>` provider + `<ZoomableImage>` |
| `.plant` (`.pot` `.hang` `.pp` `.pp-host` `.tl-c/.tr-c/.bl-c/.br-c`, `.pp-heli`, `.croton`, `.bou`) | decorative plant cut-outs, absolute in a corner, `--w` width (×.58 on ≤860), `.pp-host` gives `isolation` and puts plant at z −1 | `<Plant src corner width hang? flip? className>` (static) |
| `.nico` | numbering replaced by inline SVG icons (home style 2759) | `<NumberIcon icon size>` |
| `.toast` | transient message | `useToast()` |
| `.rail.grail`, `.mcta`, `.skip-link` | §3 | `<ContactRail>`, `<MobileCtaBar>`, `<SkipLink>` |
| `.cover`, `.rel`, `.or`, `.int`, `.fut`, `.hide-scroll`, `.sr-only` | utilities | Tailwind utilities |

---------------------------------------------------------------------------------------------------
## 5. Animation & interaction catalogue (THE engine)

Global reduced-motion handling: CSS (line 1351) `@media (prefers-reduced-motion:reduce){ *,*::before,*::after{animation-duration:.01ms!important;
animation-iteration-count:1!important; transition-duration:.01ms!important; scroll-behavior:auto!important} [data-rv]{opacity:1;transform:none;filter:none} }`
+ JS `const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches` (read once, not live) gates reveals, pinning, parallax, autoplay timers.
Recommendation: one `useReducedMotion()` (Motion's or a tiny hook) and the same global CSS rule.

Legend for recommendations: **CSS** = pure CSS; **IO** = small `useInView`/IntersectionObserver hook; **SCROLL** = custom rAF scroll-progress hook
(`useScrollProgress(ref)` returning 0..1, or Motion `useScroll({target, offset:['start start','end end']})`); **CC** = must be a client component.

| # | Name / location | Visual | Trigger | Timing / values | Desktop vs mobile | Reduced motion | Used on | Next.js recommendation |
|---|---|---|---|---|---|---|---|---|
| E1 | Hover states (buttons, links) | colour/bg/border change | hover | `.btn` .2s; nav links instant; `.kdiv a` .2s; `.kcats` .2s | same | duration ~0 | all | CSS (Tailwind `transition-colors duration-200`) |
| E2 | Card image zoom | img `scale(1.04)` (kc, knw, kpost, kbh) / 1.05 (ksec) / 1.06 (kbh .li) | hover | `transform .8s` (kbh .9s) default ease | desktop hover only effectively | CSS rule | cards everywhere | CSS `group-hover:scale-[1.04] duration-[800ms]` |
| E3 | Card title colour | h3 → orange | hover | instant | | | kc, kpost, kbh, krows | CSS |
| E4 | Border highlight | `.kfeat .f`, `.knw` border → orange | hover | .2s / .25s | | | | CSS |
| E5 | Dropdown menu | display none→block, chevron rotate 180° (.25s), links `translateX(4px)` + white (.2s) | `.ni:hover` / `:focus-within`; `body.nohover` suppresses after click until mousemove | | ≤860 replaced by tap-to-open `.op` | | header | CC `<NavDropdown>`; keep CSS hover + `nohover` state; add `aria-expanded` |
| E6 | Header scrolled | top 18→10, bg .86→.94 alpha, shadow, logo 44→38 | `scrollY>40` (scroll listener, passive) | .35s (top, background, box-shadow, height) | ≤860 same class but different base geometry | transition ~0 | all pages | CC `useScrolled(40)` |
| E7 | Mobile menu | panel show/hide (display, no animation), chevron 180° .25s | burger click, tap | | ≤860 only | | header | CC; optionally add fade |
| E8 | Rail tooltip | `::after` opacity 0→1, translateX 6px→0 | hover | .2s | hidden ≤860 | | `.rail.grail` | CSS |
| E9 | Rail hide in hero (phones) | rail opacity→0 | scroll: `scrollY < hero.offsetHeight-120` & ≤860 → `body.in-hero` | .3s | phones only | | all | CC hook toggling a class on `<body>` or the rail |
| E10 | Sticky enquiry bar | `translateY(130%)→0` | scroll past hero−140, not last 260px, no popup/menu | .3s ease-out-k | ≤860 only | none | all | CC `<MobileCtaBar>` |
| E11 | Popup open/close | backdrop opacity 0→1 (.35s) + blur(4px) bg rgba(0,0,0,.72); panel opacity 0→1 (.35s) & `translateY(26px) scale(.985)`→none (.45s ease-out-k); visibility toggled | click `[data-go="popup"]` (header CTA, footer CTA & "Enquire", mcta, svx quote buttons) | close: ×, backdrop, Esc, hashchange | mobile: panel `max-height:min(80dvh,100dvh-96px)`, scroll inside | transitions none | global | CC; Radix Dialog or native `<dialog>` + CSS transitions (focus trap, scroll lock `body.kpop-lock{overflow:hidden}`) |
| E12 | Toast | slide up `translateY(120px)→0` | validation error | .3s; hides after 2600ms | | | forms | CC tiny toast |
| E13 | Skip link | top −80→16 | focus | .2s | | | | CSS |
| E14 | **Lazy image loader** | (no visual fade) sets `src` from `KATIC_IMG[key]`, sets `width/height` from `KATIC_DIM`, `decoding=async` | IO `rootMargin:'900px 900px'`; eager for `.hdr,.ft,.logos,[class*=marq]` and active-page hero; MutationObserver for injected imgs; `beforeprint` loads all | | | | all `img[data-img]` (433) | `next/image` with static imports / remote loader + intrinsic dims from KATIC_DIM; `priority` on logo + hero/poster; default lazy (browser threshold) is fine |
| E15 | `[data-bg]` | background-image from KATIC_IMG | load | | | | (no markup uses it) | dead |
| E16 | **Home reveal** `[data-rv]` (RV list line 4955) | default: opacity 0 + `translateY(46px)`; `clip`: `translateY(70px) skewY(4deg)` origin 0 0 + `blur(8px)`, 1.2s; `left`: `translateX(-60px)`; `scale`: `scale(.92)` → `.in` = none | IO `rootMargin:'0px 0px -8% 0px', threshold:.12`, once (unobserve) | `opacity 1s, transform 1s cubic-bezier(.2,.7,.2,1)`, delay `--d = min(i,6)*0.09s` (index within each selector group) | same | not applied at all (JS skip) + CSS forces visible | **home only**: `.ab .topline/.kick/.t(clip)/.est/.lead/.pk/.logos/.abtn/.stats>div/.vals .r(left)`, `.sig …`, `.dl …`, `.wk .kick/h2(clip)/.top p/.vap/.fb/.c`, `.cs …`, `.contact .gt/h2(clip)/.lead/.ci`, `.form .f`, `.form .send`. Many selectors (`.sig .tabs`, `.dl …`, `.wk .vap`) no longer match current markup | CC `<Reveal variant="up|clip|left|scale" index>` sharing one IntersectionObserver; or Motion `whileInView` with `viewport={{once:true, amount:.12, margin:'0px 0px -8% 0px'}}` |
| E17 | **Count-up** | `.ab .stats>div b` first text node counts 0→N | when its reveal fires | 1400ms, easeOutCubic `1-(1-k)^3`, `Math.round` | | skipped (reveal never runs) → static | home About stats | CC `<CountUp to duration=1400>` |
| E18 | **Home hero intro** `kHeroIn` | each child of `.hero .in` from `opacity 0, translateY(50px)` | page becomes `.active` (CSS animation; replays on every return to home) | 1.2s ease-out-k both; delays 0 / .15 / .35 / .5s for children 1–4 | same | `animation:none` | home hero (eyebrow, h1, lead, btns) | CSS keyframes on mount (re-trigger via `key` on route change) |
| E19 | **Logo marquee** `kmarq` | `.ab .logos .tr` (track `width:max-content`, gap 16) `translateX(0→-776px)` loop | always | 18s linear infinite; `:hover` pauses (`animation-play-state:paused`) | same (logos 150×72 later override) | CSS global rule → effectively stopped | home About client logos | CSS marquee; duplicate the logo set so −776px (= 4 logos×(178+16)… compute from real widths) loops seamlessly; consider `-50%` with duplicated list |
| E20 | **Pinned card showcase** `SHOWS` (`.pinsec`) | stacked "cover-flow": cards absolutely centred (`left:50%`), each `translate3d(d*640px, min(|d|,1)*16px, 0) scale(1 - min(|d|,1.5)*0.07)`, `--sh`=min(|d|,1) drives `.sc-shade` overlay (rgba(0,0,0,.45) × opacity), `z-index = 20 - round(|d|*2)`, `.c0` (|d|<.5) gets shadow `0 30px 60px rgba(0,0,0,.35)` (transition .3s) | scroll (rAF-throttled `homeTick`) | section height = `vh*(1+(n-1)*0.6)` (vh = innerHeight/z), `.pin` sticky top 0 height vh; `p = clamp(-rect.top / (rect.height - innerHeight), 0, 1)`; `pos = p*(n-1)`; `d = i - pos`; spacing `sp` = 640 (450 if section is `.sig`) | **only ≥1100 & !reduce** (`.pinned` class). Below: native horizontal `scroll-snap-type:x mandatory` track, cards `82vw × 380px`, `scroll-snap-align:center`, shade hidden | not pinned | home `#home-works .wk.pinsec` (Selected Works; card 568×426 centred). Signature section is no longer a pinsec (uses `.sig-grid`, a 4-col static grid) | CC `<PinnedShowcase>`: sticky container + SCROLL hook (Motion `useScroll`+`useTransform` per card, or one rAF hook writing styles). Must use design-px vh under zoom |
| E21 | Works tab filter (inside E20) | `.fb a` tabs filter cards by `data-cat`, replace track children, reset transforms, recompute heights, `scrollTo(section top, instant)`, update `.wk-count` "N projects", eager-load imgs | click (capture, stops router) | instant | | | home works | part of `<PinnedShowcase filters>` |
| E22 | **Pinned horizontal stages** (`#home-process .stg`) | row of 7 stage cards translates horizontally while section is pinned; active stage `.cur` (brighter art bg, line opacity .55→1), `.on` for i ≤ act+1 (line draw-on), counter `[data-stage]` "01"… | scroll | `startX=380`; `travel = 380 + max(0, last.offsetLeft+last.offsetWidth - row.clientWidth + 110)`; section height `vh + travel*1.25`; `.pin` sticky height vh; `p` as E20; `row.transform = translate3d(380 - p*travel px,0,0)`; `act = floor(p*n*0.999)`; draw-on .ln `stroke-dashoffset 1→0` 1.6s cubic-bezier(.3,.7,.2,1) | **≥1100 & !reduce**; below: native overflow-x scroll + snap, `cursor:grab`, all lines drawn; `.bar` hidden ≤1099 | not pinned, all drawn | home "Seven Stages" process | CC `<PinnedStages>` same SCROLL hook; or GSAP ScrollTrigger `pin + scrub` if you prefer (heavier). CSS scroll-driven animations not yet safe (Safari) |
| E23 | Stage/step **isometric line art** `KATIC_ART` (line 4883) | 7 procedurally generated isometric SVG house drawings (stage 0 = ground plane … 6 = finished house with lit windows); each path `pathLength=1`, `stroke-dasharray:1 1; stroke-dashoffset:1 → 0` (draw-on), dashed construction lines `.dsh` fade in, lit windows `.lit` fade in | `.ksteps`: IO `threshold:.25`, then `.drawn` added to each step with `i*220ms` stagger (once). Home stages: via `.on` from E22 | `.ln` 1.8s cubic-bezier(.3,.7,.2,1); `.dsh` opacity 1s delay .8s; `.lit` opacity 1s delay 1.2s; hover: radial glow intensifies (.5s), lines opacity→1 | same | CSS durations ~0 → drawn instantly | **every `.ksteps`** site-wide (about, services, architecture, interior…): step index → drawing chosen by keyword regex `KW` on the h3 (discover/concept/design/engineer/construct/interior/handover…) else proportional `round(i*6/(n-1))` | Port generators (`P`, `box`, `hip`, `rect`…) to a TS module and render SVG **at build time in a server component** (deterministic); client part is only an IO hook toggling `drawn`. Dark variant stroke `#eccbb6`, light (`.lt`, auto when not inside `.dk`/`.pr`/about `.ph`) stroke `#a4633f`; `.onlight` (E32) forces `#111` |
| E24 | Feature-tile **3D icons** `KATIC_ICON` (line 4519) | ~60 isometric icons (house, tower, crane, pipes, sofa, lamp, gantt…) chosen by regex `RULES` on the tile h3, unique per grid (`used` set, `FALLBACK` list); same draw-on technique | IO `threshold:.2`, stagger `i*140ms`, once | `.ln` 1.6s cubic-bezier(.3,.7,.2,1); `.dsh` 1s delay .7s; hover: svg `translateY(-4px)` .5s ease-out-k + glow | | instant | every `.kfeat:not(.grid3)` site-wide; icon box `.ic3` 150px tall (120 for 5-col grids; note line 1085's ≥1100 `height:96px` targets `.art3`, not `.ic3`), tile padding ≥1100 `22px 24px 24px` | Same as E23: build-time SVG + IO; store chosen icon in content data rather than regex at runtime |
| E25 | **Parallax (inner pages)** `pxTick` / `PX` map | image `translate3d(0, c*-24%, 0) scale(1.3)` where `c = (rect.top + rect.height/2 - vh/2)/(vh + rect.height)` of the image's parent | scroll (one rAF per scroll event — not throttled) + hashchange | linear, no smoothing | same (no width gate) | disabled | `#p-about .ph .im img`, `#svc-architecture .big img`, `#p-works .ctasec>img`, `#p-project .ctasec>img`, `#p-reviews .ctasec>img`. Entries for `#p-architecture/.ctasec`, `#p-kochi`, `#p-dubai` match nothing (bug) | CC `<ParallaxImage strength=24 scale=1.3>` using SCROLL hook (or Motion `useScroll`/`useTransform`) |
| E26 | **Signature parallax** (`#home-signature .bg img`) | `translate3d(0, p*11%, 0) scale(1.06)` (7% at ≤860); CSS makes img `height:130%; top:-15%` | scroll/resize (rAF-throttled) | `p = clamp((rect.top+h/2 - vh/2)/(vh/2 + h/2), -1, 1)` | 11% vs 7% | disabled (live `RM.matches`) | home signature | same `<ParallaxImage>` with different formula params |
| E27 | **Services split showcase** `.svx` (home `#home-deliver`) | left list of services grouped ("Design"/"Construction"); right full-bleed image cross-fade (`opacity 0→1` .9s ease + `scale(1.05)→1` 1.6s ease-out-k) with caption block (`opacity`, `translateY(10px)` .45s/.55s, delay .15s); orange progress bar `svxbar` scaleX 0→1 over 6s | auto-advance every **6000ms** while ≥30% visible (IO .3); hover/focus/click selects (`mouseenter` only >860); hovering the whole section holds (pauses timer; bar `animation-play-state:paused`) | 6s linear | ≥861 full-height split (`height:max(var(--svh),720px)`), left col `calc(max(86px,(100%-W)/2)+420px)`; ≤860 stacked, 4:3 image | no autoplay (`reduce`), transitions none | home | CC `<ServicesShowcase>`; timers in `useEffect`, `inert`/`aria-hidden` on hidden captions; `[data-svx-quote]` opens popup with service preselected |
| E28 | **Divisions carousel** `.dvx` (home `#home-divisions`) | image cross-fade (opacity 1s, scale 1.06→1 1.8s), title words slide up from 105% (.9s, word stagger .07s), footer fade/slide (.5/.7s delay .25), progress bar `dvxbar` 5s | auto-advance **5000ms** while ≥35% visible; prev/next buttons; ←/→ keys; touch swipe |dx|>45px; hold on hover only if focus is inside (odd), pause on `visibilitychange` | 5s | | no autoplay; transitions .01s | home | CC `<DivisionsCarousel>`; no library needed (embla optional for swipe) |
| E29 | **Client stories quote rotator** `[data-quotes]` (home `#home-stories`) | blockquote/name/company text + two portrait/project images fade out (opacity .25s), swap from `QUOTES`/`QIMG`, fade in | click `[data-q="-1|1"]` | 250ms out + 250ms in | | | home | CC `<QuoteRotator quotes>`; preload images |
| E30 | **FAQ accordion** `.faq .qa` | single-open (`.open` toggled, others closed). `.kfaq` variant: answer `display:none/block`, circular icon vertical bar rotates 90→0 (.2s). `.kfaq-sec` variant: answer `max-height:0→320px` + padding-bottom 0→26 (.35s ease), "+" icon rotates 45° (.3s) | click `.qh` | | `.kfaq-sec .kfq-h` sticky top 120 (≥1100) | ~0 | all FAQ blocks; first item `.open` by default | CC `<Faq>` (Radix Accordion `type="single" collapsible` or custom); use `grid-template-rows:0fr→1fr` instead of max-height:320 to avoid clipping |
| E31 | **Fit-to-screen** `fit()` (line 5076) | on desktop, if a section's in-flow children (excl. plants/abs/fixed) are taller than `vh - padding`, apply `zoom = avail/need` (only if ≥ 0.66) to each child | load, resize, `document.fonts.ready`, hashchange (+350ms), debounced 120ms | | ≥1100 only; resets below | n/a | every section of the active page except `.hero,.ctasec,.stg,.pinsec,.kart-cover,.kblog-home` | Avoid if possible: design sections to fit 1440×(≥760) and accept scrolling; if parity required, CC `useFitToViewport(ref)` (ResizeObserver) — fragile with zoom |
| E32 | `markLight()` | adds `.onlight` to sections with line art whose computed bg luminance >128 → black strokes | after fit() | | | | sections with `.art3/.iso/.ic3` | replace with explicit `theme` prop |
| E33 | Hero video `video.hv` (home) | muted looping background video, `object-fit:cover`; separate desktop (16:9, `kv-desktop`, poster `poster_desktop` 1280×720) and mobile (9:16, `kv-mobile`, poster 720×1280) cuts | `mq = (max-width:860px), (orientation:portrait) and (max-width:1099px)` picks kind; sets `src = data-desktop/data-mobile` ("katic-banner-desktop.mp4"/"…-mobile.mp4" — files not in bundle); if `file:` protocol or missing, or `readyState<2` after **2500ms**, or `error` → builds Blob URL from embedded base64 `<script id="kv-…">`; `canplay` → play; first `click/touchstart/scroll` → play (autoplay unlock); pause on `document.hidden` and when leaving home (hashchange +60ms) | | mq switch re-picks source live | removes autoplay, pauses, poster only | home hero | CC `<HeroVideo desktopSrc mobileSrc posters>`: render `<video muted loop playsInline autoPlay preload="metadata" poster>`; choose source with `matchMedia` (or `<source media>`); host MP4s in `/public` or CDN (drop base64 fallback); pause via IO when off-screen; add a visible pause control (WCAG 2.2.2) |
| E34 | Lightbox `LB` (`.klb`) | full-screen rgba(0,0,0,.92) overlay, img max 90vw×86vh with shadow, × button 48px | click `img[data-zoom]` (auto-tagged: `#p-project section:not(.ctasec) img`, `#p-services .blk img`, `#p-architecture .sv .ims img`, `#p-architecture .pr .imr img`, `#p-reviews .bb img`, `#p-reviews .tr .im img`, `#p-india .ksplit img`, `#p-dubai section:not(.ctasec) .ims img`, plus 36 explicit `data-zoom` in markup); close on overlay click, Esc, hashchange | instant (display none/flex), no transition | same | | those pages | CC `<Lightbox>` portal (`<dialog>`), focus management, `cursor:zoom-in/out`; no gallery navigation in source |
| E35 | Page-scoped gallery lightbox `[data-gallery]`/`[data-lightbox]` | | | | | | **no markup** | dead |
| E36 | Tabs `[data-tabs]`, carousels `step()` with `[data-track]/[data-prev]/[data-next]/[data-dots]`, `[data-drag]` drag-scroll, `.sx` service explorer (6s timer, mouse-parallax ±18/14px, quick-enquiry pane), `.sform` toggles `[data-sform]` | | | | | | **no markup uses any of these** (verified: 0 occurrences outside JS/CSS) | do not port |
| E37 | **Contrast safety net** `KATIC_VFIX` (`fix`, `aa`, `mtext`, line 5181) | walks every text element of the active page, computes fg vs effective bg contrast; forces `color` inline `!important` (#111/#555 on light, #fff/#bbb on dark; orange → #C24E1E/#AD4517/#E8622C; grey → #666/#a3a3a3 for AA); at ≤860 forces min font-size 11px | load, hashchange, resize (+450ms debounce), scroll-end (+500ms, `aa`+`mtext`) | | mtext ≤860 only | | all pages | **Do not port.** Bake correct colours/sizes into components; use it as a hint that the generated colours had contrast problems |
| E38 | Plant room (phones) (line 5262) | adds padding-top (0.9×plant h) or padding-bottom (0.95×) to each plant's host so plants don't cover text | load/resize/hashchange/img load, ≤860 | | phones | | sections with `img.plant` (not footer, `.bou`, `.croton`) | static per-instance mobile padding classes |
| E39 | Plants sway (`kHang`, `kHangSkew`, `kPot`, `kSoft`, `kWindPot` 10s, `kWindHang` 11s, `kBreath` 3.4/3.8s) | gentle rotate/skew/scale | infinite | | | none | 15 plants | **All disabled** by line 1602 `.plant,…{animation:none!important;transform:none!important;scale:none!important}` → plants are static. Port as static images |
| E40 | `kFloat` stage svg bob | | | | | | home stages | overridden `animation:none` → dead |
| E41 | Scroll progress `.kprog` | | | | | | | `display:none!important` → dead |
| E42 | Smooth scrolling | `html{scroll-behavior:smooth}`; router uses `scrollIntoView({behavior:'smooth'})` for anchors and `scrollTo({behavior:'instant'})` for page changes | | | | `auto` | | Lenis not needed; keep CSS smooth + Next `scroll` handling |
| E43 | Accordion of inline service forms `.sform` (+/−) | | | | | | no markup | dead |
| E44 | Keyboard: ←/→ in dvx, ↑↓←→ in sx, Esc closes popup/lightbox/mobile nav, Tab trap in popup | | | | | | | port where component exists |

Implementation stack recommendation (lightest faithful):
- **No GSAP/Lenis required.** One shared `useScrollProgress` (rAF-throttled, passive scroll + ResizeObserver) covers E20, E22, E25, E26;
  Motion (`motion/react`) is a fine alternative if the team already uses it (`useScroll` + `useTransform` + `useMotionValueEvent`).
- One shared IntersectionObserver hook covers E16, E17, E23, E24, E27/E28 visibility gating.
- CSS keyframes for E18, E19, progress bars (`svxbar`, `dvxbar`), hover states.
- Client components: Header (E5–E7), ContactRail (E9), MobileCtaBar (E10), StartProjectModal (+provider), Toast, Lightbox (+provider),
  HeroVideo, Reveal, CountUp, PinnedShowcase, PinnedStages, ParallaxImage, ServicesShowcase, DivisionsCarousel, QuoteRotator, Faq,
  WorksFilter, BlogList, EnquiryForm, ThankYou (reads lead from sessionStorage), ZoomRoot (resize listener), LineArt draw-on wrapper.
  Everything else (sections, cards, footer markup, SVG generation) = server components.

---------------------------------------------------------------------------------------------------
## 6. Data & logic

### 6.1 Router (`show()`, line 4726; wrapper 4769)
- Hash format: `#<page>[/<anchor>[/<filter>]]`. Unknown page → `home` (no 404). Empty hash → home.
- `#contact` (pg==='contact') → `contact()`: if the **current** page has a `.contact` section → prefill + smooth `scrollIntoView` + focus first
  input after 600ms; else `location.hash='#home/contact-sec'` (rewritten to `#home/start`) and prefill the home form after 60ms.
  Pages with their own contact section: home (`#start`), about (`#about-contact`), services (`#services-contact`), architecture, interior,
  factory, construction, renovation, dubai (`#<page>-contact`). All others jump to home.
- Alias: `kochi` → `india`.
- `article/<slug>` → `KB.article(slug)` (falls back to first post if slug unknown), anchor cleared, forces re-render (`cur=null`).
- `thank-you` → `KB.thanks()` populates from `window.lastLead`.
- On page change: toggles `.active`, updates SEO (below), `scrollTo(0, instant)` unless an anchor is present.
- `blog/<anchor>/<cat-slug>` → `KB.setCat(slug)` (slug = lowercased category with ' & '→'-' and spaces→'-': `architecture`, `interior-design`,
  `materials-finishes`, `construction`, `turnkey-projects`, `renovation-remodeling`, `exterior-landscape`, `real-estate-development`, `property-care`).
- Other pages' 3rd segment → clicks `#p-<pg> [data-filter] [data-f="<flt>"]` (or `all`): works filter slugs `residential, commercial,
  institutional, hospitality, architecture, interiors, villas, all`; india page also has a `[data-filter]`.
- Anchor → `requestAnimationFrame(() => getElementById(anc).scrollIntoView({behavior:'smooth'}))`.
- `_navTop` flag: header links to `#works…` and all footer links (except `home-process`) ignore the anchor and land at page top; footer
  link to current page → smooth scroll to top.
- Global click delegate: `[data-go="contact"]` (not in footer) → `contact()` (+ `data-svc` → `_pf` prefill); `[data-go="popup"]` → popup
  (capture phase); footer `data-go="contact"`/`href="#contact"` → popup; any `a[href^="#"]` → `location.hash = target` (or re-run `show` if
  identical); `data-anchor` attr rewrites target anchor.
- Per-page SEO swap: `document.title = data-title`; sets `meta[name=description]`, `og:title`, `twitter:title`, `og:description`,
  `twitter:description`, `og:url`, `link[rel=canonical]` to `https://www.katicdesigns.com/` + (`#<pg>` unless home).

Proposed Next.js routes (App Router):
`/` home · `/about` · `/services` · `/services/architecture` · `/services/interior` · `/services/furniture-joinery` (factory) ·
`/services/construction` · `/services/turnkey` · `/services/renovation` · `/services/exterior-landscape` · `/services/property-care` ·
`/projects` (works; `?sector=` or `/projects/category/[slug]` for filters) · `/projects/[slug]` (project — currently one project, 82 links all go to `#project`) ·
`/divisions/[slug]` (design, interior, infrastructure, developers, care) · `/news` · `/blog` (+ `/blog/category/[slug]`) · `/blog/[slug]` ·
`/locations/india` (+ redirect `/kochi`) · `/locations/dubai` · `/reviews` · `/thank-you` (noindex).
`#contact` behaviour → a `<ContactLink>` client component: same-page `#…-contact` smooth scroll if the page has a ContactSection, else
`router.push('/#start')`. Add a tiny client script on `/` that maps legacy hash URLs (`#architecture`, `#article/<slug>` …) to new paths.
SEO: `generateMetadata` per route from the `data-title`/`data-desc` strings (all 25 are in the markup); real canonical paths.

### 6.2 Blog `POSTS` (line 4401) — exposed as `window.KB.posts`
9 posts, one per category. Shape:
```ts
type BlogBlock = ['p', string] | ['h', string] | ['ul', string[]] | ['img', imageKey: string, caption: string];
interface Post { s: string /*slug*/; t: string /*title*/; c: Category; d: string /*ISO date*/; v: number /*views → "Most Popular" sort*/;
  i: string /*KATIC_IMG key*/; a: string /*author*/; x: string /*excerpt*/; b: BlogBlock[] }
```
| slug | category | date | views | author |
|---|---|---|---|---|
| designing-for-kerala-monsoon | Architecture | 2026-10-14 | 940 | KATIC Design Studio |
| planning-an-interior-that-lasts | Interior Design | 2026-10-02 | 820 | KATIC Interior |
| choosing-natural-stone | Materials & Finishes | 2026-09-18 | 610 | KATIC Interior |
| construction-quality-checklist | Construction | 2026-09-05 | 1180 | KATIC Infrastructure |
| what-turnkey-really-means | Turnkey Projects | 2026-08-21 | 1320 | KATIC Design Studio |
| renovating-an-older-home | Renovation & Remodeling | 2026-08-07 | 760 | KATIC Design Studio |
| gardens-for-the-tropics | Exterior & Landscape | 2026-07-24 | 880 | KATIC Design Studio |
| design-led-development | Real Estate & Development | 2026-07-10 | 540 | KATIC Developers |
| pre-monsoon-maintenance | Property Care | 2026-06-26 | 1050 | KATIC Care |

`CATS = ['All', …9 categories]`. Date format `en-GB` "14 Oct 2026". Listing: state `{q, cat, sort:'new'|'old'|'pop', shown:6}`, "Load More" +3,
empty state. Search/sort bar and category chips are **hidden by CSS** (`#p-blog .kblog-bar,#p-blog .kcats{display:none!important}`,
`.kbh-cats{display:none!important}`) → effectively only "Load More" is usable. Home `[data-blog-home]`: newest post as featured + next 3 as list;
`[data-blog-latest]` 3 newest cards. Article page: cover, crumb, title, author, date, category, body render, appended CTA paragraph
"Planning a project? Talk to the KATIC team." (`#contact`), aside "Latest articles" (4 newest others), BlogPosting JSON-LD injected as
`#ld-article`. Laravel: `posts` table (slug, title, category_id, published_at, views, cover_image, author, excerpt, body JSON/markdown).

### 6.3 Other JS data
- `QUOTES` (4 × [quote, who, company]) + `QIMG` (4 × [portraitKey, projectKey]) — home client stories rotator.
- `DD`, `T`, `ACTIVE`, `V` (dead), `SOC` (4 socials) — nav/footer config.
- `PREFILL` — page → `{svc}` or `{loc}`: architecture/div-design → "Architectural Design"; interior/div-interior → "Interior Design";
  construction/div-infrastructure → "Construction & Execution"; turnkey → "Turnkey Projects"; renovation → "Renovation & Remodeling";
  exterior → "Exterior & Landscape Design"; property-care/div-care → "Property Care & Maintenance"; india → loc "India" (prepends
  "Location: India" to textarea); dubai → loc "Dubai, UAE".
- `SV` popup service list (7 services + "Not sure yet").
- `RV` (home reveal map), `PX` (parallax map), `KW` (stage keyword→drawing), `RULES`/`FALLBACK`/`ARTS` (icon library).
- `KATIC_IMG` (≈146 keys incl. `pp_*` plants, `poster_*`, `cs_p2..4`, `rv_cta`, `bou_tip`) and `KATIC_DIM` (intrinsic sizes) → become
  static imports / CMS media with width/height.
- Projects/reviews/news/divisions content is **static HTML in the page sections** (not JS arrays) — other agents.

### 6.4 Forms & lead delivery (lines 4777–4835, 5097–5151, 5209–5211)
Forms:
1. **Contact block `.form`** (template + per-page variants): `name`* text "Jane Doe", `email`* "jane@email.com", `phone` tel
   "+1 (000) 000-0000", `service`* select (Architectural Design, Interior Design, Construction & Execution, Turnkey Projects,
   Renovation & Remodeling, Exterior & Landscape Design, Property Care & Maintenance), `details` textarea; per-page forms may add extra
   `.f.half` selects (sent as `key: value` lines). `novalidate`; JS validation: first `[required]` empty or email not `/^\S+@\S+\.\S+$/` →
   inline orange border, focus, toast "Please fill in <Label>." Border reset on input. Submit button "Send Enquiry →" (orange bg, **#111 text**).
2. **Popup `.kpop-f`** (`data-src` = current page): `name`*, `email`*, `phone` ("+91 00000 00000"), `location` select (Kerala / Elsewhere in
   India / Dubai / UAE / Other), `service`* (7 + "Not sure yet"; preselected from PREFILL[current page]), `ptype` radio chips (Home / Villa,
   Apartment, Commercial, Hospitality, Institutional — selected chip black), `timeline` (As soon as possible / Within 3 months / 3–6 months /
   6–12 months / Just exploring), `budget` (Under ₹50 lakh / ₹50 lakh – ₹1 crore / ₹1 – 3 crore / Above ₹3 crore / Prefer to discuss),
   `details`. Invalid → `.bad` (orange border, #fff6f2 bg) + toast "Please fill in <label lowercased>.". Left column: kicker "Start a Project",
   H2 "Let's build something that lasts.", text, 3 ticks (One team… / Clear scope… / Studios in Kochi and Dubai), "Prefer to talk?" phone+email.
   Opens: focus `name` after 350ms; closes → restore focus.
3. `.sform` inline forms — no markup (dead), but `lead()` supports `f.dataset.svc`.
- **Honeypot**: JS appends to every `form.form, form.kpop-f, form.sform` an off-screen `<div aria-hidden>` with
  `<input name="company_website" tabindex="-1" autocomplete="off">`. If filled → silently reset + go to thank-you.

`lead(form, data, service)`:
- `src` = `form.dataset.src || currentPage`; body text: `Name/Email/Phone/Service/Source page/<extra k: v>/\n\n details`.
- Payload JSON: all fields + `service`, `source_page` (page title), `page_url`, `submitted_at` ISO, `_subject` "Project enquiry — <svc> (<page>)".
- `window.lastLead = {src, svc, from, name, body, status}`; analytics: `dataLayer.push({event:'generate_lead', lead_source, lead_service})`,
  `fbq('track','Lead',{content_name, source})` if present.
- If `window.KATIC_FORM_ENDPOINT` is empty (it is, default `''`) → build `mailto:hello@katicdesigns.com?subject=…&body=…`, click it, status
  `mail`, go to `#thank-you`.
- Else: button disabled + `aria-busy` + "Sending…"; `post()` = `fetch(POST JSON)` with 10s AbortController timeout, 2 attempts (1.2s gap);
  success → `sent`; failure → push payload to `localStorage['katic_outbox']`, status `queued`. `flush()` re-sends the outbox on `online` and 4s
  after load.
- Thank-you (`KB.thanks`): Source = page name, Service, "Back to Previous Page" → `#<from>`, WhatsApp button `https://wa.me/<KATIC_WA>?text=`
  "Hi KATIC, here is my enquiry:\n\n<body>"; fallback box (`[data-ty-fb]`) shown for `mail`/`queued` with explanatory copy, "Send by email"
  mailto, "Copy my details" (clipboard → "Copied").
- `window.KATIC_WA` default `'10000000000'`.

Laravel/Next plan: Next route handler or server action → Laravel `POST /api/leads` (validate name/email/service, honeypot, rate-limit,
store + mail). Keep client-side validation UX (toast + orange border), keep `generate_lead` dataLayer event, keep outbox only if offline
support is wanted. Store `lastLead` in `sessionStorage` so `/thank-you` survives reloads; make `/thank-you` `noindex`.

### 6.5 Contact constants
`EMAIL='hello@katicdesigns.com'`, `PHONE='+10000000000'` (displayed "+1 (000) 000-0000"), WhatsApp `10000000000`, address
"14 Ridgeline Road, Countryside District, 400001, Kochi" — **all placeholders**. Put them in one `site.config.ts` / Laravel settings.

### 6.6 JSON-LD (line 28, static on every "page")
`@graph`: Organization `#org` (name, url, logo `/logo.png`, email, telephone placeholder, foundingDate 2013, description, areaServed
[Kerala, South India, Dubai, UAE], department: KATIC Design/Interior/Infrastructure/Developers/Care) · HomeAndConstructionBusiness `#kochi`
(placeholder address, PostalCode 400001, Kochi, Kerala, IN; hours Mon–Sat 09:30–18:30; makesOffer 7 services) · HomeAndConstructionBusiness
`#dubai` (Dubai, AE) · WebSite `#site` · FAQPage (6 Q&A = home FAQ). Article pages add BlogPosting (`#ld-article`, never removed).
Next: render Organization/WebSite/LocalBusiness in root layout; FAQPage only on pages that show that FAQ; BlogPosting in `/blog/[slug]`.

---------------------------------------------------------------------------------------------------
## 7. Bugs, smells, risks (global layer)

Content / config
1. Placeholder contact data everywhere: `+10000000000` / "+1 (000) 000-0000" (JSON-LD, rail tel, footer, contact block, popup, mcta),
   `wa.me/10000000000` (rail, mcta, thank-you), placeholder address "14 Ridgeline Road, Countryside District, 400001" (400001 is a Mumbai PIN)
   in footer + JSON-LD; phone placeholders inconsistent (+1 vs +91). Social links point to platform homepages. Hero copy mentions "houses in
   the mountains" (template copy).
2. `KATIC_FORM_ENDPOINT=''` → every enquiry currently goes out via `mailto:` (lost if the visitor has no mail client); `.form .ok` success
   message never shows (no code adds `.sent`).
3. `post()` retries 4xx once (the `throw` inside `try` is caught by its own `catch`).
4. Source-page naming broken: `PNAME`/`thanks()` strip `/ — Katic Designs$/` but titles end in ` | Katic Designs` → "Source page" is the full SEO
   title; home check `/^Katic Designs.*$/` never matches. `article()` sets `data-title` twice in two formats.
5. Header variants (`data-variant`, `V` table, `.logo .sub/.wm` CSS) ignored; dropdown descriptions in `DD` never rendered; `RAIL_CHAT` /
   `data-chat` unused; `Factory` page missing from nav.
6. Dead JS with no markup: tabs, `step()` carousels, `[data-drag]`, `[data-gallery]`, `.sx` explorer, `.sform`, `[data-bg]`, `.kprog`,
   `homeTick` stubs (hero parallax, deliver drift, works drift, story counter-parallax), unused vars `heroBg, heroIn, sigBg, wkTrack, dlImgs,
   csCards`; many `RV` selectors no longer match. Dead CSS: plant keyframes (all neutralised), `kFloat`, `.kprog`, nav underline, `.mega` grid,
   `.rail` (in-hero) and `.rail.sm`, `.kblog-bar`/`.kcats`/`.kbh-cats` (hidden — blog search/sort/category UI wired in JS but invisible).
7. `PX` parallax map contains selectors that match nothing (`#p-kochi` — page is `p-india`; `#p-architecture .ctasec>img`, `#p-dubai .ctasec>img`
   — no `.ctasec` on those pages).
8. `.plant.pp-heli{transform:scaleX(-1)!important}` (flip) is cancelled by the later `.plant.hang{transform:none!important}` (line 1602) — heliconia
   renders unflipped. Decide intended orientation from the design.
9. FAQ link `<a href="contact" data-go="contact">` (relative href, broken without JS).

CSS architecture
10. Massive `!important` usage and layered overrides: the same thing is defined 2–4 times (mobile nav: full-screen overlay at line 2224 vs
    compact dropdown at 1167/1507 — compact wins via !important; dropdown: 4 successive restyles; footer cols 2 vs 3; footer plant none vs block;
    section padding 120/120 vs 104/36 — the 120 rule wins by specificity (0,7,1) over the "html body" 104/36 rule (0,6,3) on most desktop
    sections, likely contrary to intent). Treat the **computed** result in a browser as the spec, not any single rule.
11. ~800 lines of machine-generated `html body section:is([data-fx="N"],#_q#_r#_s)>:nth-child(a)>:nth-child(b)…{color:…!important}` rules
    with fake-ID specificity boosting — tied to exact DOM positions; any markup change silently breaks colours. Do not port.
12. Runtime contrast/size "safety net" (E37) mutates inline styles with `!important` on load/resize/scroll — expensive (getComputedStyle on
    every element, repeated) and masks real colour bugs. Small orange text on white (#E8622C ≈ 3.3:1) is the main offender; `--or-t #C24E1E`
    exists for that.
13. Body is Jost but most components switch to Inter; home forces Jost with `!important` blanket rules → inconsistent type system across pages.
14. Inline `style="…grid-template-columns:…"` in markup is targeted by attribute-substring selectors (`[style*="repeat(8"]`,
    `[style*="grid-template-columns:760px"]`, `[style*="display:flex;justify-content:space-between"]`) — fragile; replace with props.
15. Non-existent font weights requested (Inter 300, Inter italic); Jost 800 shipped but unused; Jost subsets may lack ₹ → ↗ glyphs.

Layout / behaviour
16. `.rail.grail` (bottom-right, 44px buttons from 16px up) overlaps the `.mcta` bar (bottom 10px, 50px tall, z 150) between 421–860px once the
    user scrolls past the hero — the Call button is covered. Comment says the bar "replaces floating side buttons" but the rail is only hidden ≤420.
17. Zoom-dependent geometry: scroll math mixes `innerHeight` (real px) with heights set in design px (`innerHeight/z`) and `getBoundingClientRect`
    (behaviour under `zoom` changed in Chrome 128+). Pinned sections, parallax and `fit()` need cross-browser verification at z≠1.
18. `fit()` silently zooms section content down to 66% on short viewports (e.g. 1366×650 laptops) — text can become ~10px effective; it also
    fights with the mobile `mtext()` fixer. Rebuild should define explicit short-viewport behaviour instead.
19. `pxTick` schedules a new rAF on every scroll event (no throttle flag) and queries `.page.active [data-px]` each time; header, in-hero, mcta,
    parallax, signature, homeTick, contrast fixer = 7+ scroll listeners. Consolidate into one rAF loop / IO.
20. `reduce` is read once (`matches`), not subscribed — toggling the OS setting needs a reload (signature parallax is the exception).
21. Pinned/reveal logic runs only for the home page (`H`) — inner pages get no reveal animations at all (only line-art draw-on, parallax).
22. Hero video: base64-embedded MP4s (~7 MB as base64) parsed via `atob` into Blobs — huge HTML payload; real file names
    (`katic-banner-desktop.mp4`) are not shipped; video loops forever with no pause control (WCAG 2.2.2) and `preload="auto"`.
23. Entire image library is inlined as base64 data-URIs in `window.KATIC_IMG` (original file is multi-MB) → no caching, no responsive sizes,
    blocks parsing. Use `next/image` with real files/CDN.
24. Logo asset is only 115×65 px but rendered at 44px tall ×z (up to ~59px at 1920, ~78px at 2560) → blurry on HiDPI. Request an SVG logo.
25. Lightbox: no `role="dialog"`, no focus move/trap, `alt=""`, opens via `display` without transition; zoomable images are not keyboard-operable
    (plain `<img>` with click handler).

Accessibility / SEO
26. All 25 `.page` sections get `role="main"` (only one visible at a time, but multiple `main` landmarks in DOM); every page has its own
    duplicated header/footer (25 copies in DOM).
27. Duplicate IDs: every generated stage SVG contains `<linearGradient id="kg">` (7 on home + one per `.ksteps` step site-wide); `#contact-sec`
    is injected 3× before being renamed.
28. Dropdown triggers get `aria-haspopup` but never `aria-expanded`; desktop dropdowns are hover/focus-within only (top link navigates on click).
    Mobile nav lacks focus trap and `aria-controls`. Form labels are associated only at runtime by JS (`enhance()`), placeholders used as
    fallback labels.
29. `.kfaq-sec` answers collapsed by `max-height:0;overflow:hidden` (still in accessibility tree; long answers clipped at 320px).
30. Hash routing = one URL for search engines: canonical/og:url become `https://www.katicdesigns.com/#page`, which Google treats as the home
    page; all page content is in one document. FAQPage JSON-LD is emitted site-wide for content only visible on some pages. BlogPosting
    script persists after leaving an article. `og-image.jpg` / `logo.png` referenced but not part of the bundle.
31. Autoplay carousels (svx 6s, dvx 5s) pause on hover/focus (good) but have no explicit pause button; marquee pauses only on hover.
32. `:focus{outline:none}` globally (relies on `:focus-visible` rule — fine in modern browsers, but keep it).

---------------------------------------------------------------------------------------------------
## 8. Suggested project structure (global layer)

```
app/
  layout.tsx            // fonts (next/font), ZoomRoot script, JSON-LD org/site, <Header/> <Footer/> inside zoom root;
                        // <ContactRail/> <MobileCtaBar/> <StartProjectModal/> <Lightbox/> <Toaster/> outside zoom root
  (site)/page.tsx ... per route (generateMetadata from page data)
components/shell/       Header, NavDropdown, MobileNav, Footer, ContactRail, MobileCtaBar, SkipLink, ZoomRoot
components/ui/          Button, Kicker, Heading, Lead, Container, Section, Chip, Tag, TextLink, Plant, NumberIcon
components/sections/    Hero, CtaBand, ContactSection(+Faq combo), Faq, FaqSection, CardGrid/ImageCard, NumberedRows, SectorTiles,
                        ProcessSteps(+LineArt), FeatureTiles(+Icon3D), Split, DivisionsStrip, TestimonialGrid, BeforeAfterPairs,
                        Gallery, Stats(+CountUp), OfficeBlock, NewsGrid, BlogList, BlogFeature, ArticleLayout, ThankYou
components/motion/      Reveal, useInView, useScrollProgress, ParallaxImage, PinnedShowcase, PinnedStages, HeroVideo,
                        ServicesShowcase, DivisionsCarousel, QuoteRotator
lib/art/                isometric.ts (P, box, hip, rect…), stages.ts (KATIC_ART A[0..6]), icons.ts (ARTS, RULES, pick)
lib/site.ts             EMAIL, PHONE, WA, address, socials, NAV (T/DD/ACTIVE), PREFILL, services list
lib/leads.ts            payload builder, submit (→ Laravel), outbox (optional), analytics events
```
