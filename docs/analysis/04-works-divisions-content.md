# D — Works / Project / Divisions / News / Blog / Article / India / Dubai / Reviews / Thank-you

Source: `reference/original/katic-designs-final.stripped.html` (line numbers are absolute in that file). Images: `data-img="<key>"` maps to `reference/original/assets/img-<key>.webp`. I checked every key used on these pages and in `POSTS`, and all of them exist (146 files in assets).

---

## 0. Global facts that change how these pages actually render (read first)

These come from the global layer. They are listed here because they override the page-local `<style>` blocks, so copying the local CSS alone will not match the live render.

1. **`data-fx` sections swap their theme.** Rules of the form `html body section:is([data-fx="N"],#_q#_r#_s){background-color:…!important}` (selector specificity 3 ids, plus `!important`) beat both the page `<style>` and the "white or black only" block at 1677-1720. In practice:
   | section | authored bg (page style) | **rendered** | rules |
   |---|---|---|---|
   | `#p-works .sw#works-list` `data-fx=104` | #0B0B0B dark | **#fff, text #000/#444, filter buttons #222 text + rgba(0,0,0,.22) borders, row rule rgba(0,0,0,.14)** | 890-935 |
   | `#p-works .xp` `data-fx=106` | #111 dark | **#fff**, card rule rgba(0,0,0,.18) | 935-960 |
   | `#p-project .dr` `data-fx=110` | #FDFCF8 light | **#000**, text #f4f4f4/#a1a4aa/#aaa, `.pts` top border #222 | 250-277 |
   | `#p-project .br` `data-fx=111` | #0B0B0B dark | **#fff**, text #000/#444 | 277-288 |
   | `#p-project .rl` `data-fx=114` | #FDFCF8 light | **#000**, text #f4f4f4 | 288-305 |
   | `#p-dubai .s5` `data-fx=168` | #fff | **#000**, captions #aaa, "View Our Work" btn bg #000 text #eee border #30343c | 960-981 |
   | `#p-dubai .contact` `data-fx=169` | (contact default dark) | **#fff**, inputs bg rgb(7,8,12) text #eee | 981-1040 |
   Result: every page alternates strictly between white and black. In React, give each section a `tone: 'light' | 'dark'` prop and drop the `data-fx` hack.
2. **Section backgrounds are forced to pure white or black** (1677-1720). For example, `#p-works>section.ft1{background:#fff}` overrides the authored `#F4F1EA`, `#p-project>section.mt` becomes #000, and `#p-dubai>section.s1` becomes #fff. None of the beige tones (#F4F1EA, #FAF8F4, #F7F4EF, #F3F0E9, #FDFCF8) are visible anywhere.
3. **Desktop (≥1100px)** (1051-1052, 1650-1656):
   - `.page .hero{height:max(var(--svh),720px)!important}`, so the per-page `height:715px/720px` is dead.
   - `.page .ctasec{height:max(var(--svh),680px)!important}`.
   - Every other direct `section` child of `.page` gets `min-height:var(--svh); padding:104px 0 36px !important; display:flex; flex-direction:column; justify-content:center`. Exceptions are `.hero`, `.ctasec`, `.stg`, `.pinsec` and `.kart-cover`. Every content section is therefore at least one screen tall with its content vertically centred, and the page-local `padding:…` values are dead.
   - The JS `fit()` (5085-5100) then applies CSS `zoom` (no lower than 0.66) to a section's children whenever they overflow one screen. `SKIP` = `.hero,.ctasec,.stg,.pinsec,.kart-cover,.kblog-home`.
4. **Kicker colour.** `html body .page .kick, .kick.w, .kick.int {color:var(--or)!important}` (1213) plus 1362-1364 make the `w` modifier irrelevant. The division pages use `kick int w` and `kick int` inconsistently, and both render identically.
5. **Header variants are ignored.** `header(pg)` (4639) always uses `V.home`. The `data-variant="works|project|dubai|reviews"` attributes and the `V.works/project/listing/details/reviews/dubai` configs are dead code. The only thing that varies is the active nav item, via `ACTIVE` (4638): works and project highlight "Projects", every `div-*` highlights "Divisions", blog and article highlight "Blogs", india and dubai highlight "Location", reviews highlights "Reviews", and news highlights nothing.
6. **Mobile hero (≤860)** (1193-1209): `min-height:100svh`, content bottom-aligned, h1 `clamp(32px,9.6vw,42px)`, `.hbtns` and `.btn` stacked full width at 50px. `.yr`, `.cur`, `.bt` and `.hero>.wrap:not(.in)` are hidden, which hides the Project year line, the Works "current project" card and the Dubai bottom bar.
7. **Generic responsive rules that matter here:**
   - ≤1099 (2138-2185):
     - `.wrap` becomes `calc(100% - 72px)`.
     - `.page .two` collapses to one column.
     - `#p-works .ft1 .g, .r1, .r2, .r3` and `#p-project .ov .imr, .dr .g, .br .imr, .mt .imr` collapse to one column with a 36px gap (2149).
     - `#p-works .xp .cards`, `#p-project .rl .cards` and `.facts` go to 2 columns (2174). `#p-project .mats` and `.pts` go to 2 columns (2175).
     - Inline `[style*="grid-template-columns:760px"]` and `[style*="488px"]` become two equal columns (2184).
     - `#p-works .hero .cur` is hidden (2181).
   - ≤1099 (2311-2321): `.kc-grid.c3/c4/c5, .kfeat, .ksec, .kposts, .kty .grid3` go to 2 columns `!important`, which beats the inline `repeat(N,1fr)`. `.ksteps` goes to 2 columns with a 44px row gap. `.ks .kh, .ksplit, .koff, .kart` go to one column with a 28px gap. `.ksplit.rev .im{order:0}`. `.kart aside{position:static}`.
   - ≤860 (2186-2290, 2323-2331):
     - `.wrap` becomes `calc(100% - 40px)`. `.st` is 34px.
     - **All inline `grid-template-columns` collapse to one column** (2256). The `kc-grid`, `kfeat`, `ksec`, `kposts`, `ksteps` and `kgal` grids also go to one column (2324).
     - `.ksplit .im` is 320px. `.kart-cover` is 300px and `.kart h1` / `.kty h1` are 34px.
     - Sections get `padding:80px 0 !important` (2297).

---

## 1. `#p-works`: Portfolio landing and listing (3604-3781, `<style>` 3605-3693)

- **Route:** `/works`
- **SEO:** title "Architecture & Interior Design Projects | Portfolio | Katic Designs". Description "Residential, commercial, institutional and hospitality projects by Katic Designs across Kerala, South India and Dubai."

**Sections in order (rendered tone in brackets):**

1. **`.hero`** (3694-3704). Background image `72dc2b2afd`. Shade is a 90° gradient .72→.42→.3.
   - Kick "KATIC Projects · Kerala & UAE".
   - h1 "Built Ideas.<br><span.or>Real Places.</span>" at 78px.
   - Lead "Explore architecture, interiors and construction projects across Kerala and UAE."
   - `.btn.wh` "Explore Projects" links to `#works/works-list` (`data-arw=ne` makes JS append a ↗ svg).
   - `a.cur` is absolutely positioned at right:0, top:252px, 255px wide. It links to `#project` with leaf icon, "Courtyard House", "Kochi, Kerala · 2025". It is hidden at ≤1099 and ≤860.
2. **`section.ft1`** [white] (3706-3721). Kick "Featured projects". h2 `.st` "A home shaped by<br>light, shade and<br>the monsoon." (inline `margin-top:44px`). The paragraph has inline `margin-top:44px`.
   - `.g` is a grid of 820px and 1fr.
   - Left: `a.im` (height 612) linking to `#project`. Image `54f1a3ee2e`, tag "Signature Residence · 2025", h3 "The Rain Court House", em "KD / 024". Hover scales the image to 1.03 over .8s.
   - Right: crumb "KOCHI / RESIDENTIAL / ARCHITECTURE + INTERIORS". h4 "Quiet rooms gather around a living courtyard." Description paragraph. `.btn.ol` "View Project". Stats: 6,800 SQ. FT. · 18 mo BUILD TIME · A+ ENERGY GRADE.
3. **`section.ks.dk`** [black] (3723). Uses the global k-template. Kick "Project categories", h2 "Four sectors.<br>One standard.", lead "Browse our work by sector — each opens a filtered portfolio."
   - `.ksec` with inline `repeat(4,1fr)` holds 4 sector tiles (400px tall, hover scale 1.05).
   - Residential `bae1754840` → `#works/works-list/residential`
   - Commercial `01aabb2353` → `…/commercial`
   - Institutional `32404913f1` → `…/institutional`
   - Hospitality `0e599c0712` → `…/hospitality`
   - Each tile has small "SECTOR", b title and a span description.
4. **`section.sw#works-list` `data-fx=104`** [white] (3724-3751). This is the filterable portfolio.
   - Kick "Portfolio · Filter & explore". h2 "Places with<br>purpose. Details<br>with staying<br>power." The paragraph has inline `margin-top:110px` and **its sentence is duplicated**.
   - **Filter bar** `.fl[data-filter="wl"]` has 8 buttons:
     | button | data-f |
     |---|---|
     | All | all |
     | Residential | residential |
     | Commercial | commercial |
     | Institutional | institutional |
     | Hospitality | hospitality |
     | Architecture | architecture |
     | Interiors | interiors |
     | Villas / Flats | villas |
   - **Grid** `[data-filter-target="wl"]` holds 8 `a.pj` cards (all `href="#project"`, each with `data-cat` as a space-separated list) arranged in 4 hand-tuned rows:
     | # | row (cols) | title | img | img h (inline) | icon | `.c` label | `.m` meta | data-cat |
     |---|---|---|---|---|---|---|---|---|
     |1|r1 790px/1fr|Palm Veil Residence|5ae2cb8637|570|house|Villa|Thrissur, Kerala / Villa / Architecture|residential villas architecture|
     |2|r1|Cinder House|6a759310a5|570|house|Residential|Dubai, UAE / Residential / Interiors|residential interiors|
     |3|r2 472px/1fr align-end|Nila Apartments|2dfb41f894|430|house|Apartments|Kozhikode, Kerala / Apartments / Turnkey|residential villas|
     |4|r2|Serein Wellness Club|0e599c0712|560|building|Commercial|Abu Dhabi, UAE / Commercial / Interior Design|hospitality interiors|
     |5|r3 632px/1fr|House of Three Courts|8d5ca34a10|509|house|Residential|Kottayam, Kerala / Residential / Construction|residential architecture|
     |6|r3|Al Quoz Atelier|01aabb2353|509|building|Commercial|Dubai, UAE / Commercial / Architecture + Build|commercial architecture|
     |7|r1 inline `1fr 790px`, mt 80|Greenfield School Campus|32404913f1|470|leaf|Institutional|Kottayam, Kerala / Institutional / Architecture|institutional architecture|
     |8|r1 inline|DIFC Gallery Office|67ca9cb4fe|570|building|Commercial|DIFC, Dubai / Commercial / Interiors|commercial interiors|
   - Card anatomy: `.im` (relative, overflow hidden, hover scales the image 1.03), `.n` icon at the top left, `.c` category at the bottom left, `.go` (42px orange square with a ↗) at the bottom right, h3 at 29px, `.m` uppercase meta with orange `<i>/</i>` separators, and `.v` "View Project →".
   - Filter counts: all 8, residential 4, commercial 2, institutional 1, hospitality 1, architecture 4, interiors 3, villas 2.
5. **`section.pp-host.ks.dk`** [black] (3753). This is the case-study split.
   - Plant `img.plant.pot.pp.br-c` (`50c8de3991`, `--w:141px`, custom animation durations).
   - `.ksplit` image `987e492e7a` (`data-zoom`, opens the lightbox) with cap "Kakkanad · Kochi".
   - Kick "Selected case study", h2 "The Courtyard<br>House", lead (Concept…), paragraph with **Challenge**/**Outcome**.
   - ul with 4 items: Kakkanad, Kochi · 4,850 sq ft · Architecture + Interiors · Completed 2025.
   - `.btn.orf` "View Case Study" → `#project`.
6. **`section.xp` `data-fx=106`** [white] (3754-3767). Kick "Our capabilities", h2 "Architecture,<br>interior design,<br>construction and<br>turnkey projects." **The copy is the same sentence repeated three times.**
   - `.cards` is 4 columns, each an `a.c` with a 258px image:
     - Architecture `b669bc97c3` → `#architecture`
     - Interior Design `335d18a20f` → `#interior`
     - Construction `465ad48711` → `#construction`
     - Turnkey Projects `392c9415ec` → `#turnkey`
   - Each card has an icon, a "+", h3, p and "Explore Service →". Hover scales the image 1.05.
7. **`section.ks.dk`** [black] (3768). Kick "Explore divisions", h2 "One vision.<br>Five divisions.", `.kc-grid.c5` with all 5 division cards (component `DivisionCards`, see §11).
8. **`section.ctasec`** (3769-3778). Image `0fcc63092f`. Kick "Start a project", h2 "Your project could be<br>next." (58px Futura, uppercase), paragraph, `.btn.orf` "Start Your Project" (`#contact`, `data-go=contact`).
   - `.call` sits absolutely at the bottom right: "PREFER TO CALL?", `tel:+918086000600` "+91 8086 000 600", "Mon—Sat · 9:30 AM—6:30 PM IST".
   - **This is the only real phone number in my range.** Every other number is a +1 000 placeholder.
9. `data-tpl="footer"`.

**Layout and responsive:**
- ≤1099: `.two`, `.ft1 .g`, `.r1-.r3` stack (2149). `.xp .cards` goes to 2 columns (2174).
- ≤860:
  - `.fl` gets `overflow-x:auto` and `flex:none` (2244-2245), but 1243 then forces `flex-wrap:wrap !important; overflow:visible !important`, so **the buttons wrap**.
  - `.pj .im` is `height:320px !important` (2246).
  - `.xp .cards` goes to 1 column (2249).
  - `.ctasec .call` becomes static (2250).
  - `.ksec` goes to 1 column.

**Interactions:**
- Filter (4837-4839). A click on any `[data-filter]` button toggles `.on` and sets `style.display='none'` on the target `[data-cat]` cards. There is no animation or transition, and filtering does not update the URL.
- Deep link `#works/works-list/<f>`: the router (4744) scrolls to `#works-list` and calls `.click()` on the `[data-f=<f>]` button. An unknown filter falls back to "all".
- Lightbox on the case-study image.
- Hover scale on images.
- Plant sway and breath animation (1042-1043: `kWindPot` 10s and `kBreath` 3.4s, both disabled under reduced-motion at 1048 and 1603).

**Dead CSS:** `#p-works .rc …` (3657-3668, the "recognition cards" section does not exist).

---

## 2. `#p-project`: Project detail, "The Courtyard House" (3782-3977, `<style>` 3783-3861)

- **Route:** `/works/[slug]`, here `/works/the-courtyard-house`.
- **SEO:** title "The Courtyard House, Kochi | Project by Katic Designs". Description "A multi-generational family home in Kochi organised around a planted courtyard, designed and built by Katic Designs."
- The page is completely hard-coded. Every one of the 45 `href="#project"` links in my range opens this same page.

**Sections in order:**

1. **`.hero`** (3862-3870). Background image `c5fba6976f` (inline `object-position:center 60%`). Shade is two gradients.
   - h1 "The Courtyard<br><span.or>House</span>" at 78px, line-height 1.
   - `.loc` "Kakkanad, Kochi, Kerala".
   - `a.btn.dko.vg` "VIEW GALLERY" → `#project/project-gallery` (absolutely positioned at right:0, top:370; static at ≤860 per 2258).
   - `.yr` "RESIDENTIAL ARCHITECTURE · 2025", centred at bottom:72px with an orange 26px rule before it. Hidden at ≤860.
2. **`section.ov`** [white] (3873-3885). Kick "Project overview", h2 "A calm home<br>shaped around<br>light, rain and a<br>living courtyard.", intro paragraph.
   - `.facts` is a 5-column grid: LOCATION Kakkanad, Kochi · PROJECT TYPE Private residence · AREA 4,850 sq ft · YEAR 2025 · SERVICES Architecture · Interiors.
   - `.imr` is 820px and 1fr. Image `197c9068a1` (.a, 502px). Image `1c963cd473` (.b, 260px, mt 111).
   - Caption "Architecture grounded in climate, context and daily life." with `.btn.orf.cap` "Explore Service" → `#architecture`.
3. **`section.dr` `data-fx=110`** [black] (3887-3905). Kick "Design response", h2 "An inward-<br>looking plan,<br>opened deliberately<br>to sky and breeze." **The same paragraph appears twice.**
   - `.g` is 760px and 1fr. Image `50278a947d` (.a, 680px). Kick "Planning + climate" (inline `padding-left:0`), h3, paragraph, image `10c3a14757` (.b, 251px).
   - `.pts` is 3 columns: "A shaded courtyard", "A porous plan", "A protective edge" (icon + b + p).
   - `.stm`: "From climate study and adjacency mapping to material mock-ups and site detailing." with `.btn.orf.cap` "Our Process" → `#architecture/process`.
4. **`section.br` `data-fx=111`** [white] (3908-3916). Kick "The brief", h2 "A private family<br>home that still<br>feels open to the<br>landscape.". Two paragraphs plus a `.bold` objective line.
   - `.imr` is 470px and 1fr, aligned to the end. Image `537da62309` (inline h430) and image `823b5c3dd2` (inline h560).
5. **`section.mt`** [black via 1686] (3918-3934). Kick "Architecture, interiors & materials", h2 "Quiet materials.<br>Precise junctions.<br>Rooms made for<br>Kochi's climate.", two paragraphs.
   - `.imr` is 790px and 1fr. Image `934be61600` (h636) captioned "DINING ROOM · TEAK JOINERY · COURTYARD EDGE". Image `fa4b13923b` (h478) captioned "STAIR DETAIL · STONE · BLACKENED STEEL".
   - `.mats` is 4 columns, each a colour swatch `<i style="background:…">` plus b and p:
     - Lime plaster #E4DCCB
     - Kota stone #7C8B75
     - Plantation teak #9A5A3C
     - Blackened steel #262626
   - `.stm` (inline mt 76) with `.btn.dk.cap` "Explore Service" → `#architecture`.
6. **`section.gl#project-gallery`** [white] (3937-3951). Kick "Project gallery", h2 "The Courtyard House,<br>from morning light<br>to evening glow.", `.vw` "10 VIEWS · KAKKANAD, KOCHI" (absolutely positioned at the bottom right; static at ≤860).
   - **10 `figure`s** in 5 `.row`s, each row's columns set inline:
     | row cols | images (inline height) |
     |---|---|
     | `1fr` | `1a2f69cee0` (620) |
     | `760px 1fr` | `445f233e70` (567), `96147274e0` (430) |
     | `488px 1fr` | `34fbd87695`, `9f6d8d2f6c` (562) |
     | `repeat(3,1fr)` | `03553b5ed8`, `67932608a0`, `113b954da6` (400) |
     | `760px 1fr` | `b61d53c882`, `94825e8aa6` (520) |
   - Every figure has a figcaption (uppercase 8.5px) that repeats its alt text.
7. **`section.rl` `data-fx=114`** [black] (3953-3964). Kick "Related projects", h2 "Homes shaped by<br>climate, privacy<br>and place.", paragraph with **a duplicated sentence**.
   - 4 cards, each linking to `#project`, with a 350px image, b title, small meta and "VIEW PROJECT →":
     - Canopy House `316380ce3f`, RESIDENTIAL · THRIPPUNITHURA
     - River Edge Villa `1ffea5f189`, RESIDENTIAL · ALUVA
     - Linear Courtyard Home `f902f81fdd`, ARCHITECTURE · EDAPPALLY
     - Garden Fold House `8a2d35ec44`, ARCHITECTURE + INTERIORS · KOCHI
8. **`section.ctasec`** (3966-3974). Image `cd1407031f`. Kick "Begin a conversation", h2 "Planning a Similar<br>Project?" (66px Inter), paragraph, `.btn.orf.cap` "Discuss Your Project" (inline margin-top 12).

**Responsive:**
- ≤1099: `.ov .imr`, `.dr .g`, `.br .imr` and `.mt .imr` stack (2149). `.facts` and `.rl .cards` go to 2 columns. `.mats` and `.pts` go to 2 columns. Gallery rows `760px` and `488px` become two equal columns (2184).
- ≤860:
  - `.facts`, `.mats`, `.pts` and `.rl .cards` go to 1 column (2249).
  - `.stm` stacks (2259). `.ov .imr .b` loses its margin-top. `.ov .imr .a` and `.dr .g .a` drop to 340px (2260-2261).
  - All gallery rows go to 1 column (2256). **The inline image heights (400-636px) are kept on phones**, which gives very tall images. Decide whether to keep this.

**Interactions:**
- Lightbox (5296-5299). JS adds `data-zoom` to `#p-project section:not(.ctasec) img` that are not inside an `<a>`, which covers every image in ov, dr, br, mt and gl. The related-project cards are links and are excluded.
- The global `.klb` overlay (1976-1980) is a single image with a close button. It closes on click, Esc or hashchange. **There is no prev/next and no counter.**
- The page-local `#p-project .lb` styles (3842-3844) and `.gl .pothos` (3836) are dead. No `.lb` or pothos element exists, and the `[data-gallery]/[data-lightbox]` code at 4862 is not wired to this page.
- `.gl figure{cursor:zoom-in}`.
- The VIEW GALLERY link is an in-page anchor (the router smooth-scrolls to `#project-gallery`).
- Hover scale on related cards. Section reveal on desktop comes from the global fit/zoom only.

**Leaked global rule:** `.btn.cap{…}` at 3804 is not scoped to `#p-project`. It is declared inside the page style but applies site-wide.

---

## 3. Division pages: one shared template (confirmed)

| page | lines | route | hero img | SEO title | SEO description |
|---|---|---|---|---|---|
| `#p-div-design` | 3978-3990 | `/divisions/design` | 987e492e7a | KATIC Design \| Architecture & Planning Division | KATIC Design delivers architecture, planning and facade design shaped by site, climate and purpose. |
| `#p-div-interior` | 3991-4004 | `/divisions/interior` | 6a759310a5 | KATIC Interior \| Interiors & In-house Manufacturing | KATIC Interior designs, manufactures and installs interiors, furniture and joinery under one team. |
| `#p-div-infrastructure` | 4005-4018 | `/divisions/infrastructure` | 129d81a52a | KATIC Infrastructure \| Construction & Execution Division | KATIC Infrastructure builds homes, workplaces, institutions and hospitality projects to the drawing and on programme. |
| `#p-div-developers` | 4019-4033 | `/divisions/developers` | 9d73962e97 | KATIC Developers \| Design-led Residential & Commercial Developments | Design-led villas, apartments and commercial developments in Kerala, from land to handover. |
| `#p-div-care` | 4034-4047 | `/divisions/care` | 4a45368b5a | KATIC Care \| Property Maintenance & Care | Maintenance, repairs and inspections that protect your property's value long after handover. |

**What every division page shares:**
- No page `<style>`. Everything comes from the global k-classes (1737-1898). There is no `data-fx`.
- `div.hero.kh-hero` (`.in` padding-top 190, h1 74px, lead 17px, `.hbtns`; shade 90° .74/.42/.25 at 1751-1757). It contains:
  - Kick "KATIC Divisions · KATIC {X}"
  - h1 "KATIC <span.or>{X}</span>"
  - a lead
  - `.btn.wh` "Start a Project ↗" (`#contact`, `data-go=contact`)
  - `.btn.dko` "View Projects ↗" (`#works/works-list`)
- Then 6 to 8 `section.ks` blocks that alternate light and dark, always starting light (design is the exception: its second block is `pp-host ks dk`).
- They always end with a "Explore our divisions" `kc-grid.c4` listing **the other 4 divisions**, then the footer.

**Block sequence per page** (L = light, D = dark):

| # | design | interior | infrastructure | developers | care |
|---|---|---|---|---|---|
|1| L split "About KATIC Design" / "Design that<br>belongs to its place" img 5aadd606b7, cap "Site study · Kochi" | L split (pp-host, plant pp_bopflower --w:230px) "About KATIC Interior" / "Aesthetics with<br>everyday function" img 445f233e70 | L split "About Infrastructure" / "Where drawings<br>become buildings" img 465ad48711 | L split "About Developers" / "Developing with<br>design in mind" img 2dfb41f894 | L split "About KATIC Care" / "Support long<br>after handover" img c409203399 |
|2| D (pp-host, plant pp_bopflower --w:220px) kfeat 3-col ×6 "Our design capabilities" / "Design<br>capabilities" | D kfeat 3×6 "Our interior capabilities" / "Interior<br>capabilities" | D kfeat 3×6 "Construction capabilities" / "What we<br>build" | D kc-grid c4 ×4 **non-link** div.kc "Development focus" / "What we<br>develop" (imgs 5ae2cb8637, f87d8c74d7, 2dfb41f894, 01aabb2353) | D kfeat 5×5 "Our care services" / "Care<br>services" |
|3| L ksteps 5 "Our design approach" / "From brief to<br>design development" | L split.rev "Materials & craftsmanship" / "Detail you<br>can feel" img 03553b5ed8 + ul×4 (Material sampling, Detail drawings, Finish standards, Mock-ups) | L ksteps 5 "Execution process" / "How we<br>execute" | L ksteps 5 "Development approach" / "From opportunity<br>to delivery" | L ksec 4 sector tiles "Properties we care for" / "Properties<br>in our care" (same 4 as works) |
|4| D kc-grid c3 projects "Featured projects" / "Architecture<br>projects" + btn "View Architecture Projects" → `#works/works-list/architecture` | D kgal ×3 figures (Kitchens 34fbd87695, Details 113b954da6, Joinery 934be61600; all data-zoom) "Factory & manufacturing" / "Our own<br>factory" + lead + btn "Visit the Factory" → `#factory` | D kfeat 5×5 "Site & quality control" / "Managed every<br>day on site" | D kc-grid c3 with `.tg` status badges "Featured developments" / "Completed, ongoing<br>and upcoming" | D ksteps 5 "Maintenance process" / "Care, step<br>by step" |
|5| L split.rev "Integrated capabilities" / "Designed to be<br>built" img 85a9c3398a + btn.orf "Start a Design Brief" `data-svc="Architectural Design"` | L kc-grid c3 projects "Featured projects" / "Interiors across<br>sectors" + btn "View Interior Projects" → `…/interiors` | L kc-grid c3 projects "Featured projects" / "Built by<br>KATIC" + btn "View All Projects" | L split.rev "Design-led development" / "Design decides<br>value" img 85a9c3398a (no CTA) | L split "Preventive maintenance" / "Fix it before<br>it breaks" img 113b954da6 + ul×4 + btn "Request Support" `data-svc="Property Care & Maintenance"` |
|6| D other divisions c4 | D ksteps 3 "Our integrated approach" / "Design, make,<br>install" | D split (pp-host, plant --w:270px) "Integrated delivery" / "Coordinated from<br>design to site" img f1c16f4f12 + btn "Request a Build Quote" `data-svc="Construction & Execution"` | D kfeat 3×3 "Partnerships" / "Build with us" (Landowners / Investors / Collaborations) | D kc-grid c3 "Integrated expertise" / "Backed by the<br>team that builds" (3 division cards) |
|7| | L other divisions c4 | L other divisions c4 | L kc-grid c3 "Integrated capabilities" / "Backed by three<br>divisions" | L other divisions c4 |
|8| | | | D other divisions c4 | |

**Featured project cards (kc-grid c3, `a.kc` → `#project`, `small` meta, h3, "View Project →"):**
- **design:** The Courtyard House (987e492e7a, "Residential · Architecture + Interiors · Kakkanad, Kochi"), Palm Ridge Villa (22c6045680, "Residential · Villa · Kakkanad, Kerala"), Nila Workspace (05d43ba02d, "Commercial · Architecture · Dubai, UAE")
- **interior:** Cinder House (6a759310a5), Serein Wellness Club (0e599c0712, "Hospitality · Interiors · Abu Dhabi"; on /works the same project is labelled Commercial), Mattancherry Studio (2aa9c85f4e)
- **infrastructure:** House of Three Courts (8d5ca34a10), Community Health Pavilion (85a9c3398a, "Institutional · Construction · Aluva, Kerala"), Al Quoz Atelier (01aabb2353)
- **developers:** Nila Apartments `.tg` Completed ("Apartments · Kozhikode"), Desert Edge Villas `.tg` Ongoing (f87d8c74d7, "Villas · Dubai"), Hillside Commons `.tg` Upcoming (32404913f1, "Mixed-use · Kerala")

**Feature and step contents (verbatim h3 and p):**
- **design kfeat:** Architectural design / Homes, workplaces and public buildings. · Architectural planning / Site planning, zoning and approvals. · Spatial planning / Layouts shaped around how spaces are used. · Building design / Structure, envelope and services integrated. · Elevation & facade design / Facades with proportion and purpose. · Design consultation / Feasibility, reviews and expert advice.
- **design ksteps:** Brief & site / Understanding needs, budget, site and climate. · Planning / Zoning, adjacencies and regulations. · Concept / Massing, light and spatial ideas. · Design development / Materials, details and resolved drawings. · Documentation / Working drawings and approvals.
- **interior kfeat:** Interior design · Space planning · Material selection · Furniture · Lighting · Execution.
- **interior ksteps(3):** Design · Manufacture · Execute.
- **infra kfeat A:** Residential construction · Commercial construction · Institutional & hospitality · Structural & civil works · Project management · Construction finishing.
- **infra ksteps:** Planning & preparation · Site mobilisation · Construction & coordination · Finishing & inspection · Handover.
- **infra kfeat B(5):** Scheduling · Workforce coordination · Material management · Progress monitoring · Quality inspections.
- **developers ksteps:** Opportunity · Feasibility & planning · Design · Construction · Delivery.
- **care kfeat(5):** Routine maintenance · Repair & restoration · Interior maintenance · Civil & building maintenance · General upkeep.
- **care ksteps:** Assessment · Planning · Scheduling · Execution · Follow-up.
- **care ul:** Quarterly inspections · Pre-monsoon checks · Service records · Priority support.

Each `.f` and `.s` also has a `small.nico` inline SVG icon in the markup.

**JS behaviours on these blocks (global, but they define how the template looks):**
- `.ksteps` (4911-4922) gets the class `k3d`, plus `lt` when it is not inside `.dk`.
  - An isometric line-art `<div class="art3">` (170px) is injected per step. The art index is chosen from the h3 text by a keyword regex (KW) or from the step's position.
  - On intersect at 25%, each step gets `.drawn` in turn (220ms stagger), which animates `stroke-dashoffset` over 1.8s (2060-2088).
  - The k3d styles override the h3: Futura 30px uppercase, or 22px when there are 6 or more columns.
  - Hover intensifies the glow.
- `.kfeat:not(.grid3)` (4926-4929) gets a unique 3D icon `<div class="ic3">` (150px) per tile, picked by h3 through `KATIC_ICON.pick`.
  - `.drawn` is staggered at 140ms.
  - Hover lifts the svg 4px and intensifies the glow. Tile border turns orange on hover (`.kfeat .f:hover`).
- `markLight()` (5088) adds `.onlight` to light sections that contain art, which recolours the strokes to #111 and orange.
- `a.kc:hover`: image scales to 1.04 and the h3 turns orange (1765-1775).
- `.ksplit img[data-zoom]` opens the lightbox.
- `pp-host` plants sway (CSS `kWindPot` / `kBreath`). On phones, the JS at 5285-5293 pads the host section so the plant gets its own room.
- PREFILL (4747) sets the contact service by source page:
  | source | service |
  |---|---|
  | div-design | Architectural Design |
  | div-interior | Interior Design |
  | div-infrastructure | Construction & Execution |
  | div-care | Property Care & Maintenance |
  | div-developers | none |
  CTAs also carry `data-svc`.

**Responsive** (2311-2331):
- ≤1099: kfeat, ksteps and kc grids go to 2 columns. `.kh` and `.ksplit` go to one column, and `.rev` image order resets.
- ≤860: everything is one column, `.ksplit .im` is 320px, and the ksplit ul is one column.

**Proposed component:**
```tsx
<DivisionPage division={Division} />  // app/divisions/[slug]/page.tsx, generateStaticParams over 5 slugs
// Division.blocks: Block[] rendered by <KBlock/> switch; tone alternates automatically (or explicit)
```

---

## 4. `#p-news` (4048-4053)

- **Route:** `/news`
- **SEO:** "News & Updates | Katic Designs" / "Studio announcements, completed projects and updates from Katic Designs and its divisions."

**Sections:**
1. `kh-hero`. Background image `5ae2cb8637`. Kick "News & updates", h1 "News from <span.or>KATIC</span>", lead. There are no buttons.
2. `section.ks.knews-page#news-list` [white]. Kick "Latest", h2 "What's new<br>at KATIC", lead "For press and media enquiries, write to us at hello@katicdesigns.com." (plain text, not a mailto link).
   - `.knews-feat > a.knw.big`: grid of 1.25fr and 1fr, 420px image, h3 34px. Content: "KATIC opens its Dubai design studio" · Studio · 28 Oct 2026 · 987e492e7a.
   - `.knews-grid` (inline mt 28, 3 columns) with 5 `a.knw`:
     | title | category | date | img |
     |---|---|---|---|
     | Courtyard House, Kochi handed over | Project | 14 Oct 2026 | 5ae2cb8637 |
     | In-house joinery workshop expands | Manufacturing | 30 Sep 2026 | 6a759310a5 |
     | KATIC Care launches annual maintenance plans | Services | 12 Sep 2026 | 4a45368b5a |
     | New material partnerships for 2026–27 | Partners | 22 Aug 2026 | 129d81a52a |
     | KATIC Developers announces first villa community | Developers | 05 Aug 2026 | 9d73962e97 |
   - Card anatomy: `.im` 230px, `.tx` with `.mt` (category in orange, `<time>` in grey), h3 21px Futura, p, `.go` "Read more ↗". Hover gives an orange border, image scale 1.04 and orange `.go` (1218-1240).
   - All 6 link to `#news` (the page itself). **There is no news detail page.**

**Responsive:** ≤1099 the grid is 2 columns, `.big` is one column with a 300px image (1241). ≤860 everything is one column with 210px images and `.big .tx` padding 24 (1242).

News is static HTML, not in `POSTS`. It needs its own `NewsItem` model.

---

## 5. `#p-blog` (4054-4065): JS-rendered listing

- **Route:** `/blog`
- **SEO:** "Architecture & Interior Design Blog | Katic Designs" / "Ideas on architecture, interiors, materials, construction and caring for homes in Kerala's climate."

**Hero:** `kh-hero`, image `cd1407031f`, `.in` inline `padding-bottom:90px`. Kick "Journal", h1 "Ideas on <span.or>Building Well</span>", lead. Height is `max(var(--svh,100svh),720px)!important` (1099); at ≤1099 it becomes `auto` with `min-height:100svh` (1100).

**`section.ks#blog-list`** (inline `min-height:0`, which the desktop rule at 1052 overrides with `!important`). It contains:
- `.kblog-bar`: `input[type=search][data-blog-q]` ("Search articles by title or keyword") and `select#kb-sort[data-blog-sort]` with Latest / Oldest / Most Popular. **It is hidden by `#p-blog .kblog-bar{display:none!important}` (1098).**
- `.kcats[data-blog-cats]`, a container JS fills with 10 buttons. **It is hidden by 1098 and 1244.**
- `.kposts[data-blog-grid]` (3 columns, gap 40/24).
- `.kempty[data-blog-empty]` "No articles match your search."
- `.kmore-wrap > button.btn.ol[data-blog-more]` "Load More Articles".

**Rendering logic, `KB` IIFE (4400-4516):**
- State `st={q:'',cat:'All',sort:'new',shown:6}`.
- `list()` does the following:
  1. Filters by `cat` (an exact match on `p.c`) and by `q` (case-insensitive substring of title + excerpt + category).
  2. Sorts: `new` is date descending, `old` is ascending, `pop` is by `v` descending.
  3. Renders `slice(0,shown)` with `card()`.
  4. Toggles the empty state and hides "Load More" when `r.length <= shown`.
- Load More adds 3. With 9 posts, the page shows 6 and then 9 after one click, after which the button disappears.
- Typing or changing category resets `shown` to 6.
- `card(p)`:
  ```html
  <a class="kpost" href="#article/{slug}">
    <div class="im"><img src="{IM[p.i]}" alt="{title}" loading="lazy"></div>
    <div class="meta"><span>{category}</span><span>{fmt(date)}</span></div>
    <h3>{title}</h3><p>{excerpt}</p>
    <span class="k-more">Read Article <b>→</b></span>
  </a>
  ```
  - Images are 260px with hover scale 1.04, and the h3 turns orange on hover (1922-1933).
  - `fmt` is `en-GB` `{day:'numeric',month:'short',year:'numeric'}`, for example "14 Oct 2026".
- `KB.init()` (called at 5295) also fills two home-page widgets:
  - `[data-blog-home]`: the newest post as `.ft-post` with a "Featured" badge, plus the next 3 as `.li` rows.
  - `[data-blog-latest]`: the top 3 cards.
  - The Post model therefore feeds the home page as well.
- `KB.setCat(slug)` (4514): the router calls it for `#blog/<anchor>/<cat>` (4743).
  - It slugifies with `c.toLowerCase().replace(' & ','-').replace(/ /g,'-')`. An unknown slug gives All. It also resets `q`.
  - Because the category UI is hidden, **a category deep link filters the grid with no visible indication and no way to reset it** except navigating to plain `#blog`. Even then, `setCat` is not called and the state persists. This is a bug.

**Categories, in `CATS` order (4457), with their slugs:**

| Category | Slug |
|---|---|
| All | `all` |
| Architecture | `architecture` |
| Interior Design | `interior-design` |
| Materials & Finishes | `materials-finishes` |
| Construction | `construction` |
| Turnkey Projects | `turnkey-projects` |
| Renovation & Remodeling | `renovation-remodeling` |
| Exterior & Landscape | `exterior-landscape` |
| Real Estate & Development | `real-estate-development` |
| Property Care | `property-care` |

Every category has exactly one post.

**`POSTS` (4401-4456): 9 posts.** Each has `{s, t, c, d, v, i, a, x, b}`:

| s (slug) | t | c | d | v | i | a |
|---|---|---|---|---|---|---|
| designing-for-kerala-monsoon | Designing Homes for the Kerala Monsoon | Architecture | 2026-10-14 | 940 | 96147274e0 | KATIC Design Studio |
| planning-an-interior-that-lasts | Planning an Interior That Lasts | Interior Design | 2026-10-02 | 820 | 445f233e70 | KATIC Interior |
| choosing-natural-stone | Choosing Natural Stone for Kerala Homes | Materials & Finishes | 2026-09-18 | 610 | 67932608a0 | KATIC Interior |
| construction-quality-checklist | A Construction Quality Checklist for Homeowners | Construction | 2026-09-05 | 1180 | 129d81a52a | KATIC Infrastructure |
| what-turnkey-really-means | What "Turnkey" Really Means | Turnkey Projects | 2026-08-21 | 1320 | 1a2f69cee0 | KATIC Design Studio |
| renovating-an-older-home | Renovating an Older Home Without Losing Its Character | Renovation & Remodeling | 2026-08-07 | 760 | df57ba68fe | KATIC Design Studio |
| gardens-for-the-tropics | Low-Maintenance Gardens for the Tropics | Exterior & Landscape | 2026-07-24 | 880 | 9f6d8d2f6c | KATIC Design Studio |
| design-led-development | Why Design Leads Value in Real Estate | Real Estate & Development | 2026-07-10 | 540 | 2dfb41f894 | KATIC Developers |
| pre-monsoon-maintenance | A Pre-Monsoon Maintenance Checklist | Property Care | 2026-06-26 | 1050 | 113b954da6 | KATIC Care |

- `x` is the excerpt.
- `b` is the body as a tuple array, with 30 `['p',text]`, 19 `['h',text]`, 3 `['ul',[items]]` and 3 `['img',key,caption]`. Inline images are `1a2f69cee0`, `934be61600` and `94825e8aa6`.
- Body text is plain and escaped. There is no inline markup.

**Responsive:** `.kposts` is 2 columns at ≤1099 and 1 column at ≤860. `.kblog-bar` wraps at ≤860.

---

## 6. `#p-article` (4066-4070): JS-filled template

- **Route:** `/blog/[slug]`
- **Default SEO** "Article | Katic Designs Blog" / "Insights on architecture…". JS overrides it.

**Markup:**
- The header template, then `div.kart-cover > img[data-art-cover]` (520px with a gradient overlay; 300px at ≤860). There is no `.hero`.
- `section.ks` (inline `min-height:0`) containing `div.wrap.kart` (grid 7fr 3fr, gap 64):
  - `article`: `.crumb` (`<a href="#blog">Blog</a> / <span data-art-cat>`), `h1[data-art-title]` (52px Futura uppercase), `.info` ("By <b data-art-author>", `[data-art-date]`, `.cat[data-art-cat2]`), `.body[data-art-body]`.
  - `aside` (sticky at top:110, 1px border, padding 26): h4 "Latest articles", `[data-art-latest]`, `.btn.ol` "All Articles ↗" → `#blog`.

**`KB.article(slug)`** (4487-4499), called by the router for `#article/<slug>` (4731):
- Finds the post by slug. **If none matches, it falls back to `POSTS[0]` instead of showing a 404.**
- Sets the cover src and alt, the title, the category (twice), the author and `fmt(date)`.
- Renders the body: `p` becomes `<p>`, `h` becomes `<h2>` (30px Futura uppercase), `ul` becomes `<ul><li>`, and `img` becomes `<figure><img><figcaption>` (420px cover). Body links are orange and underlined.
- Appends a closing paragraph: `<p>Planning a project? <a href="#contact" data-go="contact">Talk to the KATIC team</a>.</p>`.
- Injects JSON-LD `script#ld-article` of type `BlogPosting`: headline, description = x, datePublished = d, author Person = a, `publisher {'@id':'https://www.katicdesigns.com/#org'}`, `mainEntityOfPage`. Note that the author is typed as a Person but the values are organisations.
- Fills the aside with 4 other posts by date desc: `<a><img 84×64><div><b>title</b><span>date</span></div></a>`.
- **The title is set twice.** First `p.t+' | Katic Designs Blog'` (4491), then it is overwritten with `p.t+' — Katic Designs'` (4498). The description is `p.x`.

**Responsive:** `.kart` is one column at ≤1099 and the aside becomes static. h1 is 34px at ≤860.

---

## 7. `#p-india`: location page (4071-4096), pure k-template

- **Route:** `/locations/india`. The legacy `#kochi` is aliased to india by the router (4730).
- **SEO:** "Architects & Interior Designers in Kerala, India | Katic Designs" / "Katic Designs serves clients across Kochi, Kerala and South India with architecture, interiors, construction and property care."

**Sections:**
1. `kh-hero`, image `ac79e79288`. Kick "KATIC · India", h1 "Designing Spaces.<br><span.or>Building Possibilities.</span>", lead. Buttons: `.btn.wh` "Explore Our Projects" → `#works/works-list`; `.btn.dko` "Start a Project" → contact.
2. L `ksplit`, image `88dbc326d3` (data-zoom), cap "Courtyard light · Kochi". Kick "KATIC in South India", h2 "Rooted in Kochi.<br>Growing across<br>the south.", lead, p.
3. D kc-grid c3 "Our locations" / "Where to<br>find us", lead "Kochi is our existing office. Chennai and Bangalore are expanding locations." Three cards:
   - `a.kc` Kochi (1cf5d313d4), tg "Office", small "Kerala". Placeholder address "Katic Designs Studio, 14 Ridgeline Road, Countryside District, 400001 · hello@katicdesigns.com". "Contact the Kochi office →" → `#contact`.
   - `div.kc` Chennai (32404913f1), tg "Expanding", "Tamil Nadu", "…Office details coming soon."
   - `div.kc` Bangalore (aff52b8951), tg "Expanding", "Karnataka".
4. L `pp-host` (hanging plant `7d4aa783e5` tr-c --w:150px). kc-grid c4 with **7** service cards, so the grid is 4 + 3. "Our services" / "Everything under<br>one roof", `.btn.ol` "All Services" → `#services`. Cards:
   - Architectural Design 987e492e7a
   - Interior Design 335d18a20f
   - Construction & Execution 465ad48711
   - Turnkey Projects 392c9415ec
   - Renovation & Remodeling df57ba68fe
   - Exterior & Landscape Design 96147274e0
   - Property Care & Maintenance 113b954da6
5. D kc-grid c5: all 5 divisions.
6. L `#india-projects`. "Our projects" / "Selected work<br>in India". **Lead is placeholder brief copy: "Project type and location, with location filters."**
   - Filter `.kcats[data-filter="india"]` (inline mt 36): All / Kochi / Rest of Kerala, with data-f `all`, `kochi`, `kerala`. This `.kcats` is visible; only the blog and article versions are hidden.
   - kc-grid c3 `[data-filter-target="india"]` holds 6 cards:
     | title | img | meta | data-cat |
     |---|---|---|---|
     | Canal House | bae1754840 | Residential · Architecture · Panampilly Nagar | kochi |
     | Harbour Loft | 67fde5f298 | Marine Drive | kochi |
     | Mattancherry Studio | 2aa9c85f4e | | kochi |
     | Palm Veil Residence | 5ae2cb8637 | | kerala |
     | House of Three Courts | 8d5ca34a10 | | kerala |
     | Greenfield School Campus | 32404913f1 | | kerala |
   - Deep link `#india/india-projects/kochi` works through the generic router filter.
7. D kfeat 4 "Why KATIC" / "Why clients<br>choose us": Integrated capabilities · Design expertise · Coordinated execution · Project management.
8. L ksteps 4 "Our approach" / "From first call<br>to handover": Consultation · Design · Execution · Handover.
9. `section.contact[data-src=india]` (global contact styling, dark).
   - h2 "Start Your Project<br><span.or>in India</span>", lead.
   - `.ci`: Email hello@katicdesigns.com, **Phone +1 (000) 000-0000 (placeholder)**, WhatsApp `wa.me/10000000000` (placeholder).
   - Form fields: name*, email*, phone, service* (7 options), ptype (Residential / Commercial / Institutional / Hospitality), loc (Kochi / Elsewhere in Kerala / Chennai / Tamil Nadu / Bangalore / Karnataka / Other), details.
   - Submit "Send Enquiry" and the note "We typically reply within one business day."
   - PREFILL india gives `{loc:'India'}`, which writes "Location: India" into the textarea.
   - On success the form sets `window.lastLead` and navigates to `#thank-you` (4806-4810).

---

## 8. `#p-dubai`: location page (4097-4215, `<style>` 4098-4156), part bespoke

- **Route:** `/locations/dubai`
- **SEO:** "Architects & Interior Designers in Dubai, UAE | Katic Designs" / "Architecture, interior design, construction and turnkey projects for residential and commercial clients in Dubai and the UAE."

**Sections:**
1. **Bespoke `.hero`** (4157-4167). Image `4a57a91a8f`. Shade 90° .62/.25/.1. `.in` padding-top 152.
   - Kick "Katic Designs · Dubai", h1 "Architecture &<br>Interior Design in<br><span.or>Dubai.</span>" (76px, line-height .98), lead.
   - Buttons in an inline `display:flex;gap:16px` div:
     - `.btn.wh` "Start a Project"
     - `.btn.dko` "Explore Our Services" → `#services`, with an **inline style that duplicates `.hero .btn`**
   - Bottom bar `div.wrap` (inline `position:absolute;inset:auto 0 0 0;height:80px`) holds `span.bt` "UAE · RESIDENTIAL · COMMERCIAL" and `a.bt` "SCROLL TO EXPLORE" → `#dubai/dubai-context`. Hidden at ≤860.
2. **`section.s1#dubai-context`** [white] (4169-4178). Grid 663px and 1fr, gap 74.
   - Image `1029896879` (inline `height:614px`, which becomes 340 at ≤860 per 2284), lightbox enabled by JS. `.cpt` "CLIMATE-AWARE LIVING · Dubai, UAE".
   - `.tx` (inline pt 20): `.hdl` (kick "KATIC in Dubai" plus a `.num` 46px pin-icon box), h2 "KATIC in<br>Dubai." (inline mt 30), `.hr` rule, paragraph (inline mt 62), `.btn.ol` "Our Process" → `#architecture/process`.
   - Decorative cactus `img.cac.plant.pot.d1` (`cac0000001`, inline `right:190px;width:327px`), anchored at the bottom.
3. D kc-grid c4 ×7 services "Services in Dubai" / "Our services<br>in Dubai", lead plus `.btn.dk` "All Services". Same data as India.
4. L kc-grid c5 divisions.
5. D `ksplit` (image 4a57a91a8f data-zoom, cap "Dubai → India"). "Cross-border project collaboration" / "Living in Dubai.<br>Building in India.", lead, ul×6:
   - Team coordination
   - Design & technical coordination
   - Construction support
   - Procurement & vendors
   - Agreed progress reporting
   - Site visits on your behalf

   Button "Discuss a Cross-Border Project".
6. L ksteps 5 "India + Dubai connectivity" / "How it works<br>in practice": Coordination · Communication · Progress updates · Milestone reviews · Clear responsibilities.
7. D kfeat 4 "Why KATIC" / "Why clients in<br>Dubai choose us": Integrated capabilities · Local presence · Cross-border connectivity · Clear responsibilities.
8. L `#dubai-office` `.koff` (grid 1fr 1fr). "Dubai office & contact" / "Visit or call<br>our Dubai team" (inline mt 22).
   - `dl` (150px and 1fr; becomes `minmax(0,auto) minmax(0,1fr)` at 1396):
     - Office: "KATIC Designs, Business Bay, Dubai, UAE" plus an inline-styled grey **"Address placeholder — replace with the confirmed office address."**
     - Telephone **+971 0 000 0000** (placeholder)
     - Email dubai@katicdesigns.com
     - Hours Mon–Fri · 9:00 AM–6:00 PM GST
   - `.btn.ol` "Get Directions" → Google Maps search "Business Bay Dubai" (inline mt 34).
   - `.im` with image `1029896879`, min-height 460.
9. **`section.s5` `data-fx=168`** [black] (4186-4200). "Our work" / "Our Dubai<br>Projects.", paragraph.
   - `.g1` is 765px and 1fr: Jumeirah Courtyard House (fe0aeb97f8, h475 inline, "RESIDENTIAL VILLA", "Jumeirah, Dubai · ARCHITECTURE") and Palm Residence (20cfdabf34, "PRIVATE RESIDENCE", "Palm Jumeirah · INTERIOR DESIGN").
   - `.g2` is 528px and 1fr: Desert Edge Villa (f87d8c74d7, h445, "NEW BUILD", "Al Khawaneej · TURNKEY PROJECT") and DIFC Gallery Office (67ca9cb4fe, "COMMERCIAL WORKSPACE", "DIFC · INTERIOR DESIGN").
   - `.dc` card: image with gradient overlay, small and b over the image, `.cpt` below. Hover scales to 1.04.
   - Centred `.btn.ol` "View Our Work" (inline wrapper `text-align:center;margin-top:62px`, inline btn `height:54px`).
10. **`section.contact` `data-fx=169`** [white]. h2 "Start Your Project<br><span.or>in Dubai or India</span>". Same placeholders as India. loc options: Dubai / UAE · Kerala, India · Elsewhere in India. Note that the **select order is loc before ptype**, the reverse of India. PREFILL gives `{loc:'Dubai, UAE'}`.

**Dead CSS in the Dubai `<style>`:**
- `.s2`, `.s3`, `.s4` (and `.s2/.s3/.s4 .ims`, `.th`, `.cpt` width): those sections do not exist.
- `#p-dubai .ctasec …`: there is no ctasec.
- `.sec .kd`.
- `.hero .btn` height 56: the dko duplicates it inline.

**Responsive:**
- ≤1099: `.s1` gets `height:auto;padding-bottom:300px` and `.sec` becomes one column (2166-2167). `.s5 .g1/.g2` become one column (2149).
- ≤860:
  - `.s1` padding-bottom 260.
  - Cactus rules conflict (2281-2283): `.cac:first-of-type{left:10px!important;width:240px!important}` and `.cac:last-of-type{right:20px;width:92px!important}` both match the **single** cactus, so it gets left 10, right 20 and width 92 (the last rule wins). This is a likely visual bug.
  - `.cac` gets max-height 220 and `object-fit:contain` (1592).
  - `.sec .ims img` 340, `.dc .im` 320, `.s2/.s4 .ims` one column.

**Verdict on a "location template":** partly shared.
- India is 100% k-blocks.
- Dubai reuses the k-blocks: services ×7, divisions c5, ksplit, ksteps, kfeat, contact form, plus the new `.koff` office block.
- Dubai is bespoke in its hero (bottom bar), its `s1` intro (image + numbered header + cactus) and its `s5` project mosaic.
- Recommendation: a block-composed `LocationPage` with block types `Hero` (variant `kh` | `split-bar`), `IntroSplit`, `CardGrid`, `Split`, `Steps`, `Features`, `OfficeContact`, `ProjectMosaic`, `FilterableProjects`, `ContactForm`. Static data per location.

---

## 9. `#p-reviews` (4216-4379, `<style>` 4217-4285)

- **Route:** `/reviews`
- **SEO:** "Client Reviews & Testimonials | Katic Designs" / "What homeowners and businesses say about working with Katic Designs on design and build projects."

**Sections** (no `data-fx`; backgrounds come from 1703-1707):
1. `.hero`. Image `72dc2b2afd`, the **same hero image as /works**. Kick "Client experiences", h1 "Spaces That Speak<br>for <span.or>Themselves.</span>" (76px), lead, `.btn.wh` "Start Your Project".
2. **`section.tr`** [white] (4297-4307). `min-height:max(830px,var(--svh))`. `.wrap` has inline `height:100%`.
   - Kick "A considered way of working", h2 "Built on trust.<br>Defined by<br>experience.", paragraph, `.btn.ol.sm` "About Katic" (inline mt 46).
   - `.im` is absolutely positioned at right:0, top:0, 678×571, image `a16247ad87` (lightbox via JS). `.bx` overlay box: "SPACES MADE PERSONAL" / "A warm, lived-in interior shaped around everyday rituals."
   - Dead CSS: `.ch` and `.fern` (two empty lines 4305-4306 where the plants were removed).
   - ≤1099: `.tr` gets height auto and padding-bottom 520, and `.im` becomes relative at full width (2177-2178). ≤860: padding-bottom 240.
3. **`section.cl`** [black] (4309-4323).
   - Kick **"Representative client experiences • copy pending approval"** (placeholder visible to users), h2 "What our clients<br>say", paragraph.
   - `.cards` is 3 columns with **6** testimonial cards. Each card has an orange "“" mark, a `<q>` (18.5px), and `.who` (40px round avatar, b name, span "Project · Location"):
     | name | project · location | avatar |
     |---|---|---|
     | Homeowner | Residential Project · Kochi | 9e3a0ae4bf |
     | Private Client | Interior Renovation · Ernakulam | b8b2804bc2 |
     | Property Owner | Turnkey Residence · Thrissur | 883910d93f |
     | Business Client | Commercial Interior · Kozhikode | f0e113ce0b |
     | Homeowner | New-Build Villa · Kottayam | f6b5f27cab |
     | Private Client | Design & Build Project · Alappuzha | 3075cc02c0 |
   - `.ft2`: small **"Representative testimonials — replace with approved client copy before publication."** plus `.btn.dk.sm` "View Our Work".
   - The first 3 quotes also appear in the JS `QUOTES` array (4841-4844, used by the home-page quote switcher). That array also holds a 4th quote, "K. Dimitrov, Riverline Offices".
   - ≤1099 the cards are 2 columns; ≤860 they are 1 column.
4. **`section.xp`** [white] (4324-4334). Header row is an inline flex (`display:flex;justify-content:space-between;align-items:flex-end`; stacked at ≤860 by 2276). "Reviews by expertise" / "Experience across<br>every discipline", `.btn.ol.sm` "Explore Services" (inline mb 6).
   - 4 `a.c` cards (292px image, icon square, h3 with an orange ↗, p):
     - Architecture `0b700c1719` → `#architecture`
     - Interior Design `a16247ad87` → `#interior`
     - Construction `131598c44a` → `#construction`
     - Turnkey Projects `a77a8c7e94` → `#turnkey`
   - **The alt texts include the "↗" glyph.**
5. **`section.pp-host.bb`** [black] (4336-4352). Plant `pp_chair` bl-c --w:155px.
   - Header (inline flex): kick **"Featured representative story • pending client approval"**, h2 "From brief to built", `.rt` right-aligned 3 lines: "PRIVATE FAMILY RESIDENCE / ARCHITECTURE + INTERIORS / CENTRAL KERALA".
   - `.g` is 720px and 1fr. Left: `.big` 430px image `72dc2b2afd`, then `.th` 3 thumbnails (131598c44a, a77a8c7e94, a16247ad87) at 215px. All are lightbox-enabled, and all 4 alts are "From brief to built".
   - Right: blockquote (29px), `.att` "— Homeowner · Representative testimonial pending approval", then 3 `.rw` rows (icon + b + p): The requirement · The design journey · The outcome. `.btn.orf.sm` "View Project" → `#project`.
   - ≤860: blockquote is 22px.
6. **`section.sp`** [white] (4353-4366). Header inline flex. "Projects behind the reviews" / "See the spaces. Meet<br>the stories.", paragraph, `.btn.ol.sm` "Explore Our Work" (inline mb 52).
   - `.grid` is 3 columns with 6 `a.c` (330px image, b, small with two spans):
     | title | img | services | location |
     |---|---|---|---|
     | Courtyard Residence | 72dc2b2afd | ARCHITECTURE + INTERIORS | KOCHI |
     | Garden House | a16247ad87 | RESIDENTIAL INTERIORS | THRISSUR |
     | The Social Kitchen | 131598c44a | TURNKEY RESIDENCE | KOTTAYAM |
     | Quiet Play House | a77a8c7e94 | INTERIOR DESIGN | ERNAKULAM |
     | Monsoon Court | 3f54968ce6 | RESIDENTIAL ARCHITECTURE | ALAPPUZHA |
     | Studio Commons | dae4b0339e | COMMERCIAL INTERIOR | KOZHIKODE |
   - Dead CSS: `.sp .pothos`.
7. `section.ctasec`. Image `rv_cta` (object-position center 40%). Kick "Begin a conversation", h2 "Ready to Create Your<br>Own Space?" (62px), paragraph, `.btn.orf` (margin-top 80).

**Bug:** the selector at 2276 is `html body #p-reviews .page [style*=…]`, and `#p-reviews .page` matches nothing. Only the second, generic half of that selector list works.

---

## 10. `#p-thank-you` (4380-4395)

- **Route:** `/thank-you` (make it `noindex`).
- **SEO:** "Thank You | Katic Designs" / "Thank you for your enquiry. A member of the Katic Designs team will be in touch within one business day."

**Markup:** header, then `section.ks` with **inline `style="padding-top:200px!important"`**, which beats the desktop 104px and mobile 80px `!important` rules at every width. Inside is `div.wrap.kty` (centred, max-width 760):
- `.ok`: an 84px orange circle with a white check svg.
- h1 "Thank you.<br>We've received<br>your enquiry." (64px Futura uppercase; 34px at ≤860).
- Lead "Your message has reached the KATIC team."
- `.ref`: "Source: <b data-ty-src>Website</b>" and "Service: <b data-ty-svc>General enquiry</b>".
- `div.kfeat.grid3` (inline `repeat(3,1fr)`; the `grid3` class excludes it from 3D icons). Tiles: What happens next · Response time ("We reply within one business day (Mon–Sat, 9:30 AM–6:30 PM IST).") · Talk sooner.
- `.ty-fb[data-ty-fb][hidden]`: fallback message plus `a[data-ty-mail]` "Send by email" and `button[data-ty-copy]` "Copy my details".
- `.btns`:
  - `a.btn.orf[data-ty-wa]` "Continue on WhatsApp" (placeholder wa.me/10000000000)
  - `a.btn.ol[data-ty-back]` "Back to Previous Page" (#home)
  - `a.btn.ol` "Explore Projects" → `#works/works-list`

**`KB.thanks()`** (4501-4513), run on every `#thank-you` route:
- Reads `window.lastLead = {src, svc, from, name, body, status}`.
- Source label: the source page's `data-title` with `/ — Katic Designs$/` stripped. **Every page title in this file uses "| Katic Designs", so the label shows the full SEO title**, for example "Architects & Interior Designers in Dubai, UAE | Katic Designs".
- `svc` defaults to "General enquiry".
- `back` href is `'#'+from`.
- WhatsApp link is `wa.me/{KATIC_WA||'10000000000'}?text=` with the enquiry body.
- When status is `mail` or `queued`, the fallback box is shown with a message, a mailto (subject "Project enquiry — {svc}") and copy-to-clipboard (the button text changes to "Copied").
- `lastLead` lives in memory only, so a refresh loses it. In Next.js, persist it in `sessionStorage` and render with a client component.

---

## 11. Shared templates and proposed React components

**Listing and cards:**
- `SectionHeader {kicker, title: ReactNode /* keeps <br> */, lead?, action?: Cta, align?:'end'|'top'}`. This is the `.ks .kh` 646px/1fr pattern; the bespoke pages use `.two`.
- `KSection {tone:'light'|'dark', id?, plant?:PlantProps, className?}`. This is the `section.ks[.dk]` wrapper and also the `pp-host` wrapper.
- `Plant {img, pos:'tl-c'|'tr-c'|'bl-c'|'br-c', kind:'pot'|'hang', width, duration?, delay?}`.
- `KCard` (`.kc`): `{href?, img, title, meta?, text?, badge?, moreLabel?:'View Project'|'Explore Division'|'Explore Service'|…}`. When `href` is absent it renders a `div` (developers focus, India Chennai/Bangalore).
- `CardGrid {cols:2|3|4|5, items}`. `DivisionCards {exclude?: DivisionSlug, cols}`, used on works, india, dubai and all 5 division pages. `ServiceCards`, used on india and dubai (7 items, identical data).
- `SectorTiles` (`.ksec`), used on works and care: 4 items linking to `/works?category=`.
- `SplitBlock {img, cap?, zoom?, reverse?, kicker, title, lead, body?, bullets?, cta?}` (`.ksplit`).
- `FeatureGrid {cols, items:[{icon, title, text}]}` (`.kfeat`, with the 3D icon client component). `StepsRow {cols, items}` (`.ksteps.k3d`, with the line-art client component plus IntersectionObserver).
- `Gallery3 {items:[{img, caption}]}` (`.kgal`).
- `OfficeBlock` (`.koff`).
- `ContactSection {source, heading, lead, locationOptions, fieldOrder}`. Shared with other pages; another agent covers the form engine.
- `CtaBand` (`.ctasec`) `{img, kicker, title, text, cta, aside?}` (the works `.call` box).
- `Lightbox` provider: a single-image overlay. Wire it to `img[data-zoom]` equivalents through a `<Zoomable>` wrapper.

**Page templates:**
- **Division template:** `DivisionPage {division}` = `KHero` followed by `division.blocks.map(KBlock)`. Block union: `split | features | steps | projects | sectors | gallery | cards | divisions`.
- **Location template:** `LocationPage {location}`, same block engine plus the `heroBar`, `introSplit`, `office`, `projectMosaic`, `filterableProjects` and `contact` blocks.
- **Works listing:**
  - `WorksHero`
  - `FeaturedProject {project}` (`.ft1`)
  - `SectorTiles`
  - `PortfolioGrid {projects, filters, layout: 'editorial'}` (`.sw`). The 4 hand-tuned rows are a fixed editorial layout. Encode it as `layout: {row:'r1'|'r2'|'r3'|'r1rev', imgHeight}` per item, or switch to masonry. See the bugs section on what happens to the layout when filtering.
  - `CaseStudySplit`
  - `CapabilityCards` (`.xp`)
  - `DivisionCards`
  - `CtaBand`
- **Project detail:**
  - `ProjectHero {title, titleAccent, location, sectorLine, heroImg}`
  - `ProjectOverview {intro, facts[5], images[2], caption, cta}`
  - `ProjectNarrative` (`.dr`): `{title, paras, mainImg, sub:{kicker, title, text, img}, points[3], strap, cta}`
  - `ProjectBrief` (`.br`)
  - `ProjectMaterials` (`.mt`): `{paras, images[2] w/ captions, materials[4]{name, swatch, text}}`
  - `ProjectGallery {rows: {cols:string, items:{img, alt, h}[]}[]}`
  - `RelatedProjects`
  - `CtaBand`
- **Blog:** `BlogHero`, `BlogList` (client: search, sort, categories, load-more; or server with searchParams), `PostCard`, `ArticleLayout`, `ArticleBody {blocks}`, `LatestAside`.
- **News:** `NewsFeatured`, `NewsCard`, `NewsGrid`.
- **Reviews:** `TrustIntro`, `TestimonialGrid`, `ExpertiseCards`, `FeaturedStory`, `ReviewProjects`, `CtaBand`.
- **Thank-you:** `ThankYou` (client; reads the lead from sessionStorage).

---

## 12. Data models (TypeScript)

```ts
type ImageKey = string;                       // -> /assets/img-<key>.webp (move to next/image with width/height from KATIC_DIM)
type Sector = 'residential'|'commercial'|'institutional'|'hospitality';
type Discipline = 'architecture'|'interiors'|'construction'|'turnkey';
type WorksFilter = 'all'|Sector|'architecture'|'interiors'|'villas';   // the 8 buttons on /works

interface ProjectSummary {                    // list/card shape (works grid, kc cards, rl cards, dubai dc, reviews sp)
  slug: string; title: string;
  location: { area?: string; city: string; region?: string; country: 'IN'|'AE' };  // "Kakkanad, Kochi" / "Dubai, UAE"
  locationGroup?: 'kochi'|'kerala'|'dubai'|'uae';   // india filter uses kochi|kerala
  sectors: Sector[]; tags: WorksFilter[];            // data-cat
  typeLabel: string;                                  // ".c" e.g. "Villa", "Apartments"
  services: string[];                                 // "Architecture + Interiors", "Turnkey"
  year?: number; status?: 'completed'|'ongoing'|'upcoming';  // developers .tg
  cover: ImageKey; coverAlt: string;
  icon?: 'house'|'building'|'leaf';
  code?: string;                                      // "KD / 024"
  featured?: boolean; division?: DivisionSlug[];
}
interface ProjectDetail extends ProjectSummary {
  seo: { title: string; description: string };
  hero: { image: ImageKey; objectPosition?: string; titleLines: string[]; accent: string; sectorLine: string };
  overview: { title: string; intro: string; facts: {label:string; value:string}[]; images: [ImageKey, ImageKey]; caption: string };
  stats?: {value:string; label:string}[];             // ft1: 6,800 SQ. FT. / 18 mo / A+
  designResponse: { title: string; paragraphs: string[]; mainImage: ImageKey; sub: {kicker:string; title:string; text:string; image:ImageKey}; points: {icon:string; title:string; text:string}[]; strap: string };
  brief: { title: string; paragraphs: string[]; objective: string; images: {key:ImageKey; h:number}[] };
  materials: { title: string; paragraphs: string[]; images: {key:ImageKey; h:number; caption:string}[]; items: {name:string; swatch:string; text:string}[]; strap: string };
  caseStudy?: { concept: string; challenge: string; outcome: string; areaSqft: number };
  gallery: { title: string; rows: { cols: string; items: { image: ImageKey; alt: string; height: number }[] }[] };
  related: string[];                                   // slugs
}
type DivisionSlug = 'design'|'interior'|'infrastructure'|'developers'|'care';
interface Division {
  slug: DivisionSlug; name: string /* "KATIC Design" */; short: string /* "Design" */;
  cardText: string; cardImage: ImageKey; seo: {title:string; description:string};
  hero: { image: ImageKey; lead: string };
  prefillService?: string;                             // contact PREFILL
  blocks: KBlock[];
}
type KBlock =
 | { type:'split'; tone:Tone; kicker:string; title:string; lead:string; body?:string; image:ImageKey; cap?:string; reverse?:boolean; bullets?:string[]; cta?:Cta; plant?:Plant }
 | { type:'features'; tone:Tone; kicker:string; title:string; lead?:string; cols:3|4|5; items:{title:string; text:string; icon?:string}[]; plant?:Plant }
 | { type:'steps'; tone:Tone; kicker:string; title:string; lead?:string; cols:3|4|5; items:{title:string; text:string}[] }
 | { type:'projects'; tone:Tone; kicker:string; title:string; lead?:string; cta?:Cta; projects:string[] /* slugs */; showStatus?:boolean }
 | { type:'cards'; tone:Tone; kicker:string; title:string; lead?:string; cols:3|4|5; items:KCardData[] }
 | { type:'sectors'; tone:Tone; kicker:string; title:string }
 | { type:'gallery'; tone:Tone; kicker:string; title:string; lead?:string; cta?:Cta; items:{image:ImageKey; caption:string}[] }
 | { type:'divisions'; tone:Tone; kicker:string; title:string; exclude?:DivisionSlug; only?:DivisionSlug[]; cols:3|4|5 };
type Tone = 'light'|'dark';
interface Cta { label:string; href:string; variant:'wh'|'dko'|'ol'|'orf'|'dk'; arrow?:'ne'|'right'; prefillService?:string }

type PostCategory = 'Architecture'|'Interior Design'|'Materials & Finishes'|'Construction'|'Turnkey Projects'|'Renovation & Remodeling'|'Exterior & Landscape'|'Real Estate & Development'|'Property Care';
interface Post {
  slug: string; title: string; category: PostCategory; categorySlug: string; // slugify: lower, ' & '->'-', ' '->'-'
  publishedAt: string /* ISO date */; views: number; cover: ImageKey; author: string; excerpt: string;
  body: ( {type:'p'; text:string} | {type:'h'; text:string} | {type:'ul'; items:string[]} | {type:'img'; image:ImageKey; caption:string} )[];
}
interface NewsItem { slug: string; title: string; category: 'Studio'|'Project'|'Manufacturing'|'Services'|'Partners'|'Developers'; date: string; image: ImageKey; excerpt: string; featured?: boolean; body?: Post['body'] }
interface Testimonial { quote: string; author: string /* role or anonymised name */; project: string; location: string; avatar?: ImageKey; approved: boolean; projectSlug?: string }
interface FeaturedStory { quote: string; attribution: string; meta: string[]; images: ImageKey[]; rows: {title:string; text:string; icon:string}[]; projectSlug: string }
interface Location {
  slug: 'india'|'dubai'; seo: {title:string; description:string}; hero: {...}; blocks: (KBlock | LocationBlock)[];
  offices: { city:string; region:string; status:'office'|'expanding'; address?:string; phone?:string; email?:string; hours?:string; mapUrl?:string; image:ImageKey }[];
  contact: { heading:string; accent:string; lead:string; locationOptions:string[]; prefillLocation:string };
}
interface Lead { src:string; svc?:string; from:string; name?:string; body?:string; status:'pending'|'sent'|'mail'|'queued' }
```

**Counts:**
- Projects: about 30 distinct names across pages, and only 1 has full detail content.
  - Courtyard House
  - Rain Court House
  - Palm Veil Residence
  - Cinder House
  - Nila Apartments
  - Serein Wellness Club
  - House of Three Courts
  - Al Quoz Atelier
  - Greenfield School Campus
  - DIFC Gallery Office
  - Canopy House
  - River Edge Villa
  - Linear Courtyard Home
  - Garden Fold House
  - Palm Ridge Villa
  - Nila Workspace
  - Mattancherry Studio
  - Community Health Pavilion
  - Desert Edge Villa(s)
  - Hillside Commons
  - Canal House
  - Harbour Loft
  - Jumeirah Courtyard House
  - Palm Residence
  - Courtyard Residence
  - Garden House
  - The Social Kitchen
  - Quiet Play House
  - Monsoon Court
  - Studio Commons
- Divisions: 5. Posts: 9. Post categories: 9 (plus All). News: 6. Testimonials: 6 on /reviews (plus 1 extra in `QUOTES`) and 1 featured story. Locations: 2 (plus Kochi, Chennai and Bangalore as offices). Services: 7 (shared list).

**Static now vs Laravel later:**
- **Static in the repo** (typed TS config or MDX): Divisions and their blocks, Locations, the services list, sector tiles, works filters, CMS-less page copy (works, reviews intro), the PREFILL map.
- **Laravel API later:** Projects (list + detail + gallery), Posts (with categories, view counts for "popular", search), News, Testimonials (with an `approved` flag that gates publishing), Leads (POST from contact forms; thank-you reads back `lead.id`), office contact details.
- **Getting there:** seed the Laravel tables from the arrays above. Fetch at build time with ISR (`revalidate`), and use `generateStaticParams` for slugs.

---

## 13. Proposed Next.js routes and legacy hash mapping

| New route | Source | Notes |
|---|---|---|
| `/works` | `#works` | `?category=<WorksFilter>` filters client-side; canonical stays `/works`. Alternative for SEO: `/works/category/[cat]` static pages. |
| `/works/[slug]` | `#project` | generateStaticParams; only `the-courtyard-house` has data now, others 404 or fall back to a "coming soon" summary page. |
| `/divisions/[slug]` | `#div-{design,interior,infrastructure,developers,care}` | 5 static params |
| `/news` | `#news` | (optional `/news/[slug]` later; cards currently go nowhere) |
| `/blog` | `#blog` | |
| `/blog/category/[cat]` | `#blog/blog-list/<cat>` | 9 categories, slugs as in §5 |
| `/blog/[slug]` | `#article/<slug>` | real 404 for unknown slug (`notFound()`) |
| `/locations/india` | `#india`, `#kochi` | (or flat `/india`; nav label "Location") |
| `/locations/dubai` | `#dubai` | |
| `/reviews` | `#reviews` | |
| `/thank-you` | `#thank-you` | `robots: noindex` |

**Hash redirects.** Fragments never reach the server, so neither middleware nor `next.config` redirects can see them. Add a tiny client component in the root layout (or on `/`) that reads `location.hash` on mount and calls `router.replace(map(hash))`. The router format is `#<page>/<anchor>/<filter>`.

| legacy hash | new URL |
|---|---|
| `#works` | `/works` |
| `#works/works-list` | `/works#works-list` |
| `#works/works-list/all` | `/works#works-list` |
| `#works/works-list/<f>` | `/works?category=<f>#works-list` (`f` ∈ residential, commercial, institutional, hospitality, architecture, interiors, villas) |
| `#project` | `/works/the-courtyard-house` |
| `#project/project-gallery` | `/works/the-courtyard-house#gallery` |
| `#div-<x>` | `/divisions/<x>` |
| `#blog` | `/blog` |
| `#blog/blog-list` | `/blog` |
| `#blog/<any>/<cat>` | `/blog/category/<cat>` (the `all` category maps to `/blog`) |
| `#article/<slug>` | `/blog/<slug>` |
| `#news` | `/news` |
| `#news/news-list` | `/news` |
| `#india` | `/locations/india` |
| `#kochi` | `/locations/india` |
| `#india/india-projects/<kochi\|kerala>` | `/locations/india?area=<x>#projects` |
| `#dubai` | `/locations/dubai` |
| `#dubai/dubai-context` | `/locations/dubai#context` |
| `#dubai/dubai-office` | `/locations/dubai#office` |
| `#reviews` | `/reviews` |
| `#thank-you` | `/thank-you` |
| `#contact` | stay on the current page, scroll to its contact section (or `/contact`); keep the `data-svc` prefill as `?service=` |
| other links from my pages | `#architecture/process`, `#factory`, `#services`, `#architecture`, `#interior`, `#construction`, `#turnkey`, `#renovation`, `#exterior`, `#property-care`, `#about`: owned by other agents' route map |

Canonical URLs and OG URLs are currently `https://www.katicdesigns.com/#<page>` (router 4733-4741). Replace them with real paths via `generateMetadata`.

---

## 14. Bugs, inconsistencies and placeholders

**Data and content**
1. Every project card site-wide (45 `href="#project"` links in this range) opens the same Courtyard House page.
2. The works page features "The Rain Court House" (6,800 sq ft, KD/024), but its link opens "The Courtyard House" (4,850 sq ft). The hero `.cur` and the case study also say Courtyard House. These are conflicting facts.
3. The same project carries different images on different pages:
   - Courtyard House uses `987e492e7a` on div-design and works ksplit, `c5fba6976f` on its own hero, and `72dc2b2afd` as "Courtyard Residence" on reviews.
   - Desert Edge Villas (developers) and Desert Edge Villa (dubai) have inconsistent names.
4. Serein Wellness Club is labelled "Commercial" in `.c`/`.m` but `data-cat` is "hospitality interiors", and div-interior calls it Hospitality. Clicking "Commercial" hides it.
5. On cards 7-8 of the works grid, the `.m` meta uses a literal " / " instead of `<i>/</i>`, so the separators are not orange there (3745-3746).
6. Duplicated filler copy:
   - works `.sw` paragraph (3727)
   - works `.xp` paragraph (same sentence 3×, 3757-3758)
   - project `.dr` paragraph twice (3890-3891)
   - project `.rl` paragraph (3956)
7. Placeholders visible to users:
   - India lead "Project type and location, with location filters." (4079)
   - Developers lead "Representative developments — replace with current KATIC Developers projects." (4026)
   - Interior lead "The factory's role, its actual capabilities and craftsmanship." (3998)
   - Kochi address "14 Ridgeline Road, Countryside District, 400001"
   - Dubai "Address placeholder — replace…" and "+971 0 000 0000"
   - Phone "+1 (000) 000-0000" and `wa.me/10000000000` (India and Dubai contact, thank-you, `KATIC_WA` fallback)
   - Reviews kickers and notes: "copy pending approval", "pending client approval", "Representative testimonials — replace…"
   - Only the works CTA phone (+91 8086 000 600) looks real.
8. News cards all link to `#news` (themselves). There is no news detail page, and the email address in the lead is not a link.
9. News and blog dates are in 2026 (fine as seed data).

**Blog and article logic**
10. The blog search, sort and category UI exists but is hidden by CSS (1098, 1244), leaving only "Load More". A `#blog/…/<cat>` deep link silently filters with no UI and the filter is never reset (`setCat` only runs when a filter segment is present). Decide whether to show the bar or remove the feature.
11. An unknown `#article/<slug>` silently renders `POSTS[0]`, so there is no 404.
12. The article cover `alt` is hard-coded to "KATIC Developers announces first villa community" until JS runs (4067).
13. The article document title is set twice with different suffixes (4491 vs 4498), so it is inconsistent with the other pages.
14. The JSON-LD author `@type: Person` has organisation names.
15. `KB.thanks()` source label strips " — Katic Designs", but titles use " | Katic Designs", so the "Source:" line shows a full SEO title (4502).
16. `window.lastLead` is lost on refresh or direct visit, so `/thank-you` shows the defaults ("Website", "General enquiry", back = #home).

**CSS and layout**
17. The `data-fx` theme inversion means the authored page CSS colours for `.sw`, `.xp`, `.dr`, `.br`, `.rl`, `.s5` and the Dubai contact are not what renders (see §0). The same goes for all beige backgrounds (forced to #fff or #000).
18. Dead page CSS:
    - `#p-works .rc*` (3657-3668)
    - `#p-project .lb*` (3842-3844), `.gl .pothos` (3832)
    - `#p-dubai .s2/.s3/.s4` (4123-4139), `.ctasec` (4149-4155) and `.sec .kd` (4114)
    - `#p-reviews .tr .ch/.fern`, `.sp .pothos`
    - Several blank lines show where plant elements were removed (3938, 3945, 4305-4306, 4354).
19. `.btn.cap` (3804) is declared in the project page `<style>` but is unscoped, so it is global.
20. The header `data-variant` values are dead (§0.5).
21. Many inline styles (118 in this range):
    - gallery row grids and image heights (project)
    - `.pj .im` heights (works)
    - `margin-top:44px` on h2/p
    - Dubai hero dko button duplicating CSS
    - Dubai `.ims img` height 614
    - reviews flex headers
    - thank-you `padding-top:200px!important`
    - blog `.in` `padding-bottom:90px`
    - `min-height:0` on blog and article (overridden on desktop anyway)
    - `kfeat`/`ksteps` `grid-template-columns:repeat(N,1fr)`

    The responsive layer depends on attribute selectors such as `[style*="grid-template-columns:760px"]` (2184) and `[style*="grid-template-columns"]` (2256). Convert all of these to props or classes.
22. Inline image heights on project gallery, brief and materials images are kept on phones (400-636px tall). Only `.ov`/`.dr` main images are reduced. This looks unintended.
23. Works filtering hides cards inside fixed two-column rows (`r1 790/1fr`, `r2 472/1fr`, …).
    - A remaining single card lands in whichever column comes first. For example, "Hospitality" leaves Serein alone in the 472px column of r2, and "Institutional" leaves Greenfield in the `1fr` column.
    - Empty rows keep their `margin-top:80px`, so the filtered grid has gaps and awkward widths.
    - There is no animation and the URL is not updated.
24. The mobile filter bar has contradictory rules: `overflow-x:auto` (2244) vs `flex-wrap:wrap; overflow:visible !important` (1243). Wrapping wins.
25. Dubai cactus at ≤860: the `:first-of-type` and `:last-of-type` rules both match the one cactus (2282-2283), producing width 92px with left 10 and right 20.
26. Reviews mobile selector `#p-reviews .page […]` never matches (2276, first half).
27. Desktop page heights such as 715px and 720px are dead because the global `max(var(--svh),720px)!important` replaces them.
28. The Kochi office card is the only `a.kc` among the location cards. Chennai and Bangalore are `div.kc`, so hover affordances differ (intentional).

**Accessibility**
29. Contact form `<label>`s have no `for` and the inputs have no `id` (14 labels in India and Dubai). The inputs are not wrapped by their labels, so they are unlabelled for assistive tech.
30. Alt text problems:
    - Reviews expertise alts contain "↗".
    - The 4 featured-story images all share the alt "From brief to built".
    - Division card images repeat alts.
    - Project images use the section headline as alt (for example "A private family home that still feels open to the landscape." twice).
    - Gallery figcaption duplicates the alt, so screen readers read it twice.
31. Non-semantic interactive elements:
    - Lightbox triggers are bare `img` elements with no button role, focus or keyboard activation. Only Esc closes the lightbox.
    - The overlay has no focus trap or `aria-modal`, and its image `alt=""`.
    - Filter buttons have no `aria-pressed`.
    - The hidden blog filter `<label for="kb-sort">` is fine.
32. Heading levels:
    - The project gallery and works sections jump from h2 to h4 (`.ft1 h4`).
    - The article aside uses h4.
    - The thank-you page has an h1 inside a section with no landmark.
    - Card titles are h3 inside links (fine).
33. `<q>` testimonials use `quotes:none` and a decorative "“" span that is not `aria-hidden`.
34. The colour-contrast "safety net" JS (5170-5210) rewrites text colours at runtime. The rebuild should set correct colours statically.

**Empty and broken states**
35. Blog empty state exists but cannot be reached in the UI (search is hidden).
36. Developers division has no contact prefill (no PREFILL entry or `data-svc`).
37. News has no empty or pagination state.
38. India filter "Rest of Kerala" uses `data-f="kerala"`. There is no Dubai filter.
