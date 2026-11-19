import type { MediaId } from "./media";

/**
 * Blog posts: the original's `POSTS` array (JS line 4401, docs/analysis/04 §5–6), copy verbatim.
 * Feeds the home blog teaser and the blog listing, category and article pages (`src/components/blog`); in
 * Phase 11 the same shape comes from Laravel (`posts` table with a JSON block body).
 */

/** The nine categories in the original's `CATS` order (without "All"). */
export const POST_CATEGORIES = [
  { name: "Architecture", slug: "architecture" },
  { name: "Interior Design", slug: "interior-design" },
  { name: "Materials & Finishes", slug: "materials-finishes" },
  { name: "Construction", slug: "construction" },
  { name: "Turnkey Projects", slug: "turnkey-projects" },
  { name: "Renovation & Remodeling", slug: "renovation-remodeling" },
  { name: "Exterior & Landscape", slug: "exterior-landscape" },
  { name: "Real Estate & Development", slug: "real-estate-development" },
  { name: "Property Care", slug: "property-care" },
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
export type PostCategoryName = PostCategory["name"];
export type PostCategorySlug = PostCategory["slug"];

/** One block of an article body (original tuples `['p'|'h'|'ul'|'img', …]`). Plain text, no inline markup. */
export type PostBlock =
  | { readonly type: "p"; readonly text: string }
  | { readonly type: "h"; readonly text: string }
  | { readonly type: "ul"; readonly items: readonly string[] }
  | { readonly type: "img"; readonly image: MediaId; readonly caption: string };

export type Post = {
  /** URL slug (`s`). */
  readonly slug: string;
  /** Title (`t`). */
  readonly title: string;
  /** Category (`c`). */
  readonly category: PostCategoryName;
  /** Publication date, ISO `YYYY-MM-DD` (`d`). */
  readonly publishedAt: string;
  /** View count (`v`); the listing's "Most Popular" sort. */
  readonly views: number;
  /** Cover image (`i`). */
  readonly cover: MediaId;
  /** Author (`a`). The original's authors are teams, not people (KI-S02). */
  readonly author: string;
  /** Excerpt (`x`); also the article's meta description. */
  readonly excerpt: string;
  /** Body blocks (`b`). */
  readonly body: readonly PostBlock[];
};

const p = (text: string): PostBlock => ({ type: "p", text });
const h = (text: string): PostBlock => ({ type: "h", text });
const ul = (...items: string[]): PostBlock => ({ type: "ul", items });
const img = (image: MediaId, caption: string): PostBlock => ({ type: "img", image, caption });

/** In the original's order (newest first). */
export const POSTS: readonly Post[] = [
  {
    slug: "designing-for-kerala-monsoon",
    title: "Designing Homes for the Kerala Monsoon",
    category: "Architecture",
    publishedAt: "2026-10-14",
    views: 940,
    cover: "photos/house-rain-garden",
    author: "KATIC Design Studio",
    excerpt:
      "Deep eaves, raised plinths and planted courtyards: how architecture can welcome the rain instead of fighting it.",
    body: [
      p(
        "For four months a year, Kerala homes live with heavy rain, high humidity and soft, diffused light. The best houses here don’t resist the monsoon — they are designed around it.",
      ),
      h("Start with the roof"),
      p(
        "Generous overhangs protect walls and openings from driving rain and keep rooms cool through the rest of the year. Sloped roofs with well-sized gutters move water away quickly, and a raised plinth keeps the floor dry during heavy downpours.",
      ),
      img("photos/two-storey-house-lawn", "Deep overhangs shading the south garden elevation."),
      h("Let the air move"),
      p(
        "Aligned openings, courtyards and high-level vents keep air moving and help with humidity. Cross-ventilated rooms dry out faster, smell fresher and need less mechanical cooling.",
      ),
      ul(
        "Overhangs of at least 900 mm on exposed elevations",
        "Courtyards with drainage designed for peak rainfall",
        "Breathable finishes such as lime plaster on external walls",
        "Covered transitions between indoor and outdoor spaces",
      ),
      p(
        "Designed this way, the monsoon becomes part of daily life: the sound of rain in the courtyard, soft light in the living room and a home that stays comfortable all year.",
      ),
    ],
  },
  {
    slug: "planning-an-interior-that-lasts",
    title: "Planning an Interior That Lasts",
    category: "Interior Design",
    publishedAt: "2026-10-02",
    views: 820,
    cover: "photos/sofa-jali-detail",
    author: "KATIC Interior",
    excerpt:
      "Five decisions that make the difference between an interior that dates quickly and one that ages well.",
    body: [
      p(
        "Interiors that last are planned around routines, not trends. Before choosing colours or furniture, map how each room will actually be used at different times of day.",
      ),
      h("Plan storage first"),
      p(
        "Most clutter is a storage problem. Built-in storage designed at the start keeps rooms calm and saves floor space.",
      ),
      h("Choose fewer, better materials"),
      p(
        "A tight palette of durable materials — stone, timber, lime and metal — reads as calm and ages well. Sample everything in the actual room light before you decide.",
      ),
      img("photos/timber-lounge-chair", "Teak joinery along the courtyard edge."),
      h("Layer the lighting"),
      p(
        "Combine ambient, task and accent lighting so each room works for reading, cooking, gathering and resting.",
      ),
    ],
  },
  {
    slug: "choosing-natural-stone",
    title: "Choosing Natural Stone for Kerala Homes",
    category: "Materials & Finishes",
    publishedAt: "2026-09-18",
    views: 610,
    cover: "photos/bathroom-kota-stone",
    author: "KATIC Interior",
    excerpt:
      "Kota, granite, laterite and limestone compared for durability, comfort underfoot and maintenance in a humid climate.",
    body: [
      p(
        "Stone is one of the most durable materials you can choose, but not every stone suits every room or climate.",
      ),
      h("Kota stone"),
      p(
        "Cool underfoot, quietly tonal and very hard wearing — ideal for verandas and living areas. A honed finish reduces slipperiness in wet weather.",
      ),
      h("Granite"),
      p(
        "Dense and stain-resistant, granite is a reliable choice for kitchen counters and external steps.",
      ),
      h("Laterite"),
      p(
        "Kerala’s traditional building stone gives walls warmth and texture, and breathes well in humid conditions.",
      ),
      p("Whatever you choose, ask for large samples and see them wet and dry before deciding."),
    ],
  },
  {
    slug: "construction-quality-checklist",
    title: "A Construction Quality Checklist for Homeowners",
    category: "Construction",
    publishedAt: "2026-09-05",
    views: 1180,
    cover: "photos/house-under-construction",
    author: "KATIC Infrastructure",
    excerpt:
      "What to check at each stage of construction — from foundations to finishing — to make sure your home is built as drawn.",
    body: [
      p(
        "Quality on site is the result of many small checks made at the right time. Here is what we inspect at each stage.",
      ),
      h("Foundations and structure"),
      ul(
        "Excavation depth and soil bearing confirmed",
        "Reinforcement size, spacing and cover checked before every pour",
        "Concrete cube tests recorded for each pour",
      ),
      h("Services"),
      p(
        "Electrical and plumbing routes are checked against the drawings before walls are closed, and pressure tests are carried out on all water lines.",
      ),
      h("Finishing"),
      p(
        "Plaster lines, floor levels, tile joints and paint coats are inspected room by room, and a snag list is shared before handover.",
      ),
    ],
  },
  {
    slug: "what-turnkey-really-means",
    title: "What “Turnkey” Really Means",
    category: "Turnkey Projects",
    publishedAt: "2026-08-21",
    views: 1320,
    cover: "photos/two-storey-house-lawn",
    author: "KATIC Design Studio",
    excerpt:
      "One team, one contract, one programme. How turnkey delivery works and when it is the right choice for your project.",
    body: [
      p(
        "In a turnkey project, one team takes responsibility for design, approvals, construction, interiors and handover. You approve the brief, the budget and key decisions — we coordinate everything else.",
      ),
      h("Why it works"),
      p(
        "Fewer hand-offs mean fewer gaps between trades, faster decisions and a design that is built as intended.",
      ),
      h("When to choose it"),
      p(
        "Turnkey suits clients who want a single point of accountability and limited time to manage consultants and contractors.",
      ),
      img("photos/courtyard-facade-night", "A turnkey residence at handover."),
    ],
  },
  {
    slug: "renovating-an-older-home",
    title: "Renovating an Older Home Without Losing Its Character",
    category: "Renovation & Remodeling",
    publishedAt: "2026-08-07",
    views: 760,
    cover: "photos/brick-house-arched-windows-night",
    author: "KATIC Design Studio",
    excerpt:
      "How to decide what to keep, what to change and what to fix first when you renovate an older building.",
    body: [
      p(
        "Older buildings often have qualities that are hard to recreate: thick walls, high ceilings, mature trees. Good renovation keeps these and fixes what no longer works.",
      ),
      h("Survey before you design"),
      p(
        "A structural and services survey reveals damp, cracks and outdated wiring before they become expensive surprises.",
      ),
      h("Fix the envelope first"),
      p(
        "Roof, waterproofing and drainage come before finishes. A dry building is the foundation of every other improvement.",
      ),
    ],
  },
  {
    slug: "gardens-for-the-tropics",
    title: "Low-Maintenance Gardens for the Tropics",
    category: "Exterior & Landscape",
    publishedAt: "2026-07-24",
    views: 880,
    cover: "photos/courtyard-tree-timber-balconies",
    author: "KATIC Design Studio",
    excerpt:
      "Native planting, shade and smart drainage for gardens that look good all year with little upkeep.",
    body: [
      p(
        "A tropical garden can be lush without being demanding. The key is choosing plants and materials that suit the climate.",
      ),
      h("Plant native"),
      p(
        "Native species cope with heavy rain and dry spells, attract birds and insects, and need far less care.",
      ),
      h("Design for water"),
      p(
        "Permeable paving, swales and rain gardens let water soak in instead of flooding paths and foundations.",
      ),
    ],
  },
  {
    slug: "design-led-development",
    title: "Why Design Leads Value in Real Estate",
    category: "Real Estate & Development",
    publishedAt: "2026-07-10",
    views: 540,
    cover: "photos/apartment-tower",
    author: "KATIC Developers",
    excerpt:
      "Better light, better plans and better materials: why design-led developments hold their value for longer.",
    body: [
      p(
        "Buyers notice light, air and good planning, even when they can’t name them. Developments designed around these qualities sell faster and age better.",
      ),
      h("Plan for daily life"),
      p(
        "Well-proportioned rooms, cross-ventilation and usable balconies matter more over time than headline amenities.",
      ),
      h("Specify for the long term"),
      p(
        "Durable materials reduce maintenance costs for owners and keep buildings looking good for longer.",
      ),
    ],
  },
  {
    slug: "pre-monsoon-maintenance",
    title: "A Pre-Monsoon Maintenance Checklist",
    category: "Property Care",
    publishedAt: "2026-06-26",
    views: 1050,
    cover: "photos/teak-stair-handrail",
    author: "KATIC Care",
    excerpt: "Ten checks to make before the rains arrive, from roof gutters to garden drainage.",
    body: [
      p("A few hours of inspection before the monsoon can prevent months of damp and repairs."),
      ul(
        "Clear gutters, downpipes and drains",
        "Check roof tiles and sheets for cracks",
        "Inspect terrace waterproofing and parapet joints",
        "Re-seal window and door frames",
        "Trim trees near the roof",
        "Test sump pumps and outdoor electrical points",
        "Clean garden drains and swales",
        "Check for damp patches on walls",
        "Service exterior timber with oil or sealant",
        "Store outdoor furniture",
      ),
      p("KATIC Care offers pre-monsoon inspections as part of every maintenance plan."),
    ],
  },
];

/** The post with this slug, or `undefined` (the original fell back to the first post; pages should 404). */
export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

/** The category with this URL slug (`/blog/category/[slug]`), or `undefined`. */
export function getPostCategory(slug: string): PostCategory | undefined {
  return POST_CATEGORIES.find((category) => category.slug === slug);
}

/** URL slug of a category name (original `setCat`: lower case, " & " → "-", spaces → "-"). */
export function postCategorySlug(name: PostCategoryName): PostCategorySlug {
  const category = POST_CATEGORIES.find((entry) => entry.name === name);
  if (!category) throw new Error(`Unknown post category: ${name}`);
  return category.slug;
}

/** Posts sorted newest first (ISO dates compare as strings, like the original). */
export function postsByDate(posts: readonly Post[] = POSTS): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** The `count` newest posts. */
export function latestPosts(count: number): Post[] {
  return postsByDate().slice(0, count);
}

/**
 * The `count` newest posts other than `slug`: the article aside's "Latest articles" (original
 * `KB.article`, JS 4497: every other post, newest first, four of them).
 */
export function otherLatestPosts(slug: string, count: number): Post[] {
  return postsByDate()
    .filter((post) => post.slug !== slug)
    .slice(0, count);
}

/** Posts in a category, newest first; every post for `"all"` (the original's "All" chip). */
export function postsByCategory(slug: PostCategorySlug | "all"): Post[] {
  if (slug === "all") return postsByDate();
  return postsByDate(POSTS.filter((post) => postCategorySlug(post.category) === slug));
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Display date as the original renders it (`en-GB`, e.g. "14 Oct 2026", "18 Sept 2026"). */
export function formatPostDate(isoDate: string): string {
  return DATE_FORMAT.format(new Date(`${isoDate}T00:00:00Z`));
}

/**
 * The blog listing (`#p-blog`, original lines 4054–4065, docs/analysis/04 §5): SEO (`data-title` /
 * `data-desc`), the banner, and the grid's paging (`KB` state: 6 cards, then 3 more per click).
 */
export const BLOG_PAGE = {
  seo: {
    title: "Architecture & Interior Design Blog | Katic Designs",
    description:
      "Ideas on architecture, interiors, materials, construction and caring for homes in Kerala's climate.",
  },
  hero: {
    image: "photos/brick-courtyard-house-dusk-panorama" satisfies MediaId,
    kicker: "Journal",
    title: { lines: ["Ideas on"], accent: "Building Well" },
    lead: "Notes on architecture, interiors, materials, construction and caring for the spaces we live in.",
  },
  /** Accessible name of the grid (the original has no heading between the h1 and the card h3s, KI-A14). */
  listHeading: "Articles",
  categoryHeading: (name: PostCategoryName) => `${name} articles`,
  /** Label of the category links (`.kcats`), shown on the category pages (KI-F13). */
  categoriesLabel: "Blog categories",
  allCategories: "All",
  readMore: "Read Article",
  loadMore: "Load More Articles",
  pageSize: 6,
  pageStep: 3,
} as const;

/** SEO of a category page (`/blog/category/<slug>`); the original has no per-category title. */
export function blogCategorySeo(category: PostCategory): {
  title: string;
  description: string;
} {
  return {
    title: `${category.name} Articles | Katic Designs Blog`,
    description: BLOG_PAGE.seo.description,
  };
}

/**
 * The article page (`#p-article`, original lines 4066–4070, `KB.article` JS 4487–4499): aside and
 * closing-line copy.
 */
export const ARTICLE_PAGE = {
  breadcrumb: "Blog",
  byline: "By",
  latestHeading: "Latest articles",
  latestCount: 4,
  allArticles: "All Articles",
  /** Appended after every body (`<p>Planning a project? <a data-go="contact">…</a>.</p>`). */
  closing: { prompt: "Planning a project?", link: "Talk to the KATIC team" },
} as const;

/**
 * Document title of an article as the original leaves it at runtime: `KB.article` sets
 * "<title> | Katic Designs Blog" and then overwrites it with "<title> — Katic Designs" (JS 4498,
 * KI-S02); the description is the excerpt.
 */
export function articleSeo(post: Post): { title: string; description: string } {
  return { title: `${post.title} — Katic Designs`, description: post.excerpt };
}

/** Copy of the home page's blog teaser (`#home-blog`). */
export const HOME_BLOG_TEASER = {
  kicker: "Latest from the blog",
  title: ["Ideas on", "building well"],
  lead: "Notes on architecture, interiors, materials, construction and caring for the spaces we live in.",
  cta: "View All Articles",
  featuredLabel: "Featured",
  readMore: "Read Article",
} as const;
