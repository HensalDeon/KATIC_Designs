import { expect, type Page, test } from "@playwright/test";

import { articleSeo, blogCategorySeo, POST_CATEGORIES, POSTS } from "@/content/posts";

/**
 * SEO across the whole site (Phase 10): every page reachable from Home has its own title,
 * description, canonical and share image; the JSON-LD parses and carries the types its page family
 * should (FAQPage only where a FAQ renders, KI-S02); the sitemap lists exactly the reachable pages;
 * robots.txt announces it; the thank-you page stays out of the index.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "site-wide checks run once");
});

/** The original's `data-title` of every page it had (`#p-<page>`), by new path. */
const ORIGINAL_TITLES: Readonly<Record<string, string>> = {
  "/": "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
  "/about": "About Katic Designs | Architecture & Interior Design Studio, Kochi",
  "/services": "Architecture, Interior & Construction Services | Katic Designs",
  "/services/architecture":
    "Architects in Kochi, Kerala | Architectural Design Services | Katic Designs",
  "/services/interior": "Interior Designers in Kochi, Kerala | Interior Design | Katic Designs",
  "/services/factory": "Custom Furniture & Joinery Manufacturing in Kerala | Katic Designs",
  "/services/construction":
    "Construction Company in Kochi, Kerala | Construction & Execution | Katic Designs",
  "/services/turnkey": "Turnkey Home & Building Projects in Kerala | Katic Designs",
  "/services/renovation": "Home Renovation & Remodeling in Kochi, Kerala | Katic Designs",
  "/services/exterior": "Landscape & Exterior Design in Kerala | Katic Designs",
  "/services/property-care": "Property Maintenance & Repairs in Kerala | Katic Care",
  "/works": "Architecture & Interior Design Projects | Portfolio | Katic Designs",
  "/works/the-courtyard-house": "The Courtyard House, Kochi | Project by Katic Designs",
  "/divisions/design": "KATIC Design | Architecture & Planning Division",
  "/divisions/interior": "KATIC Interior | Interiors & In-house Manufacturing",
  "/divisions/infrastructure": "KATIC Infrastructure | Construction & Execution Division",
  "/divisions/developers": "KATIC Developers | Design-led Residential & Commercial Developments",
  "/divisions/care": "KATIC Care | Property Maintenance & Care",
  "/news": "News & Updates | Katic Designs",
  "/blog": "Architecture & Interior Design Blog | Katic Designs",
  "/locations/india": "Architects & Interior Designers in Kerala, India | Katic Designs",
  "/locations/dubai": "Architects & Interior Designers in Dubai, UAE | Katic Designs",
  "/reviews": "Client Reviews & Testimonials | Katic Designs",
  "/thank-you": "Thank You | Katic Designs",
  // Articles keep the title the original leaves at runtime (P9-01); categories are new pages.
  ...Object.fromEntries(POSTS.map((post) => [`/blog/${post.slug}`, articleSeo(post).title])),
  ...Object.fromEntries(
    POST_CATEGORIES.map((category) => [
      `/blog/category/${category.slug}`,
      blogCategorySeo(category).title,
    ]),
  ),
};

const SITE_TYPES = ["Organization", "HomeAndConstructionBusiness", "WebSite"];

/** The page-level JSON-LD types a path should carry (on top of the site-wide graph). */
function expectedPageTypes(path: string): string[] {
  if (path === "/") return ["FAQPage"];
  if (path.startsWith("/services/")) return ["BreadcrumbList", "FAQPage"];
  if (path.startsWith("/blog/category/")) return ["BreadcrumbList"];
  if (path.startsWith("/blog/")) return ["BlogPosting", "BreadcrumbList"];
  if (/^\/(divisions|locations|works)\/.+/.test(path)) return ["BreadcrumbList"];
  return [];
}

type Head = {
  title: string;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  ldTypes: string[];
  ldErrors: string[];
  links: string[];
};

async function readHead(page: Page): Promise<Head> {
  return page.evaluate(() => {
    const meta = (selector: string) =>
      document.querySelector<HTMLMetaElement>(selector)?.content ?? null;
    const collect = (attr: "property" | "name", prefix: string) =>
      Object.fromEntries(
        [...document.querySelectorAll<HTMLMetaElement>(`meta[${attr}^="${prefix}"]`)].map((m) => [
          m.getAttribute(attr) ?? "",
          m.content,
        ]),
      );
    const ldTypes: string[] = [];
    const ldErrors: string[] = [];
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const parsed: unknown = JSON.parse(script.textContent);
        const docs = Array.isArray(parsed) ? parsed : [parsed];
        for (const doc of docs as Record<string, unknown>[]) {
          if (doc["@context"] !== "https://schema.org") ldErrors.push("missing @context");
          const nodes = Array.isArray(doc["@graph"]) ? (doc["@graph"] as unknown[]) : [doc];
          for (const node of nodes as Record<string, unknown>[])
            ldTypes.push(String(node["@type"]));
        }
      } catch (error) {
        ldErrors.push(String(error));
      }
    }
    return {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
      robots: meta('meta[name="robots"]'),
      og: { ...collect("property", "og:"), ...collect("property", "article:") },
      twitter: collect("name", "twitter:"),
      ldTypes,
      ldErrors,
      links: [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .map((a) => new URL(a.href, location.href))
        .filter((url) => url.origin === location.origin)
        .map((url) => url.pathname),
    };
  });
}

/** Paths (without query or hash) of every page reachable from Home, with their head. */
async function crawl(page: Page): Promise<Map<string, Head>> {
  const heads = new Map<string, Head>();
  const queue = ["/"];
  while (queue.length > 0) {
    const path = queue.shift() ?? "/";
    if (heads.has(path)) continue;
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    const head = await readHead(page);
    heads.set(path, head);
    for (const link of head.links) {
      if (!heads.has(link) && !queue.includes(link)) queue.push(link);
    }
  }
  return heads;
}

async function sitemapUrls(page: Page): Promise<URL[]> {
  const response = await page.request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc ?? ""));
}

test("every reachable page has its metadata and the JSON-LD of its family", async ({ page }) => {
  test.setTimeout(240_000);
  const heads = await crawl(page);
  const [first] = await sitemapUrls(page);
  const origin = first?.origin ?? "";

  expect(heads.size).toBeGreaterThan(30);
  for (const [path, head] of heads) {
    // Title and description: the original's strings, non-empty everywhere.
    expect(head.title, path).toBe(ORIGINAL_TITLES[path]);
    expect(head.description?.length ?? 0, path).toBeGreaterThan(50);

    // Canonical and Open Graph point at the page itself on the production origin, without
    // filters (`?category=`, `?area=`).
    expect(head.canonical, path).toBe(origin + (path === "/" ? "/" : path));
    // (Next prints the home URL without its trailing slash; the URL is the same.)
    expect(new URL(head.og["og:url"] ?? "").href, path).toBe(head.canonical);
    expect(head.og["og:title"], path).toBe(head.title);
    expect(head.og["og:description"], path).toBe(head.description);
    expect(head.og["og:image"], path).toBe(`${origin}/og-image.jpg`);
    expect(head.og["og:image:alt"], path).toBeTruthy();
    expect(head.og["og:site_name"], path).toBe("Katic Designs");
    expect(head.og["og:type"], path).toBe(
      path.startsWith("/blog/") && !path.includes("/category/") ? "article" : "website",
    );
    expect(head.twitter["twitter:card"], path).toBe("summary_large_image");
    expect(head.twitter["twitter:image"], path).toBe(`${origin}/og-image.jpg`);
    expect(head.robots, path).toBe("index, follow, max-image-preview:large");

    // JSON-LD parses; the site graph is everywhere, page types only where they belong.
    expect(head.ldErrors, path).toEqual([]);
    const pageTypes = head.ldTypes.filter((type) => !SITE_TYPES.includes(type)).sort();
    expect(pageTypes, path).toEqual(expectedPageTypes(path));
    expect(head.ldTypes.filter((type) => SITE_TYPES.includes(type)).sort(), path).toEqual([
      "HomeAndConstructionBusiness",
      "HomeAndConstructionBusiness",
      "Organization",
      "WebSite",
    ]);
  }

  // Articles are Open Graph articles with their date.
  const article = POSTS[0];
  const articleHead = heads.get(`/blog/${article?.slug ?? ""}`);
  expect(articleHead?.og["article:published_time"]).toBe(article?.publishedAt);
});

test("the sitemap lists exactly the reachable pages, each answering 200", async ({ page }) => {
  test.setTimeout(240_000);
  const heads = await crawl(page);
  const urls = await sitemapUrls(page);
  const listed = urls.map((url) => url.pathname);

  expect(new Set(listed).size).toBe(listed.length);
  expect([...listed].sort()).toEqual([...heads.keys()].filter((p) => p !== "/thank-you").sort());
  expect(listed).not.toContain("/thank-you");
  for (const path of listed) {
    expect((await page.request.get(path)).status(), path).toBe(200);
  }
});

test("robots.txt allows crawling, hides the API and announces the sitemap", async ({ page }) => {
  const [first] = await sitemapUrls(page);
  const response = await page.request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const robots = await response.text();
  expect(robots).toMatch(/User-Agent: \*/i);
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /api/");
  expect(robots).toContain(`Sitemap: ${first?.origin ?? ""}/sitemap.xml`);
});

test("the share image is served", async ({ page }) => {
  const response = await page.request.get("/og-image.jpg");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/jpeg");
});

test("the thank-you page is noindex, with no page-level JSON-LD", async ({ page }) => {
  const [first] = await sitemapUrls(page);
  await page.goto("/thank-you");
  const head = await readHead(page);
  expect(head.title).toBe(ORIGINAL_TITLES["/thank-you"]);
  expect(head.robots).toBe("noindex");
  expect(head.canonical).toBe(`${first?.origin ?? ""}/thank-you`);
  expect(head.ldTypes.filter((type) => !SITE_TYPES.includes(type))).toEqual([]);
});
