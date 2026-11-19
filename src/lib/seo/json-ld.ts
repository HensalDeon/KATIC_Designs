import type { FaqAnswerPart, FaqItem } from "@/components/sections/faq";
import { DIVISIONS } from "@/content/divisions";
import type { Post } from "@/content/posts";
import { SERVICE_OPTIONS } from "@/content/services";
import { type Office, OFFICES, SITE, SITE_SEO } from "@/content/site";
import { DIVISION_SLUGS, routes } from "@/lib/routes";

import { absoluteUrl } from "./site-url";

/**
 * Structured data (schema.org JSON-LD), built in one place from the same content the pages render.
 *
 * The original emitted one static `@graph` on every page (Organization, two
 * HomeAndConstructionBusiness, WebSite and a FAQPage whose questions only showed on Home) and
 * injected a BlogPosting that stayed after leaving the article (KI-S02). Here the site-wide graph
 * sits in the root layout, and each page adds only what it actually shows: FAQPage where a FAQ
 * renders, BlogPosting on articles, BreadcrumbList on pages with a hierarchy.
 */

type Typed<T extends string> = { readonly "@type": T; readonly "@id"?: string };
type Ref = { readonly "@id": string };

export type OrganizationLd = Typed<"Organization"> & {
  readonly name: string;
  readonly url: string;
  readonly email?: string;
  readonly image?: string;
  readonly description?: string;
  readonly foundingDate?: string;
  readonly areaServed?: readonly string[];
  readonly department?: readonly OrganizationLd[];
};

export type PostalAddressLd = Typed<"PostalAddress"> & {
  readonly addressLocality: string;
  readonly addressRegion?: string;
  readonly addressCountry: string;
};

export type OpeningHoursLd = Typed<"OpeningHoursSpecification"> & {
  readonly dayOfWeek: readonly string[];
  readonly opens: string;
  readonly closes: string;
};

export type OfferLd = Typed<"Offer"> & {
  readonly itemOffered: Typed<"Service"> & { readonly name: string };
};

export type LocalBusinessLd = Typed<"HomeAndConstructionBusiness"> & {
  readonly name: string;
  readonly parentOrganization: Ref;
  readonly url: string;
  readonly image: string;
  readonly email: string;
  readonly address: PostalAddressLd;
  readonly openingHoursSpecification: readonly OpeningHoursLd[];
  readonly makesOffer?: readonly OfferLd[];
};

export type WebSiteLd = Typed<"WebSite"> & {
  readonly url: string;
  readonly name: string;
  readonly publisher: Ref;
  readonly inLanguage: string;
};

export type QuestionLd = Typed<"Question"> & {
  readonly name: string;
  readonly acceptedAnswer: Typed<"Answer"> & { readonly text: string };
};

export type FaqPageLd = Typed<"FAQPage"> & {
  readonly url: string;
  readonly mainEntity: readonly QuestionLd[];
};

export type BlogPostingLd = Typed<"BlogPosting"> & {
  readonly headline: string;
  readonly description: string;
  readonly datePublished: string;
  readonly dateModified: string;
  readonly image?: string;
  readonly articleSection: string;
  readonly inLanguage: string;
  readonly url: string;
  readonly mainEntityOfPage: string;
  readonly author: Typed<"Organization"> & { readonly name: string };
  readonly publisher: Ref & Typed<"Organization"> & { readonly name: string };
};

export type BreadcrumbListLd = Typed<"BreadcrumbList"> & {
  readonly itemListElement: readonly (Typed<"ListItem"> & {
    readonly position: number;
    readonly name: string;
    readonly item: string;
  })[];
};

export type JsonLdNode =
  OrganizationLd | LocalBusinessLd | WebSiteLd | FaqPageLd | BlogPostingLd | BreadcrumbListLd;

export type JsonLdDocument =
  | (JsonLdNode & { readonly "@context": "https://schema.org" })
  | { readonly "@context": "https://schema.org"; readonly "@graph": readonly JsonLdNode[] };

const CONTEXT = "https://schema.org" as const;

/** Node ids, as in the original (`https://www.katicdesigns.com/#org`, `#kochi`, `#dubai`, `#site`). */
export const LD_IDS = {
  organization: absoluteUrl("/#org"),
  website: absoluteUrl("/#site"),
  office: (id: Office["id"]) => absoluteUrl(`/#${id}`),
} as const;

const DEFAULT_IMAGE = absoluteUrl(SITE_SEO.ogImage.path);

/** The studio. Telephone and logo are left out: the phone is a placeholder (KI-C01) and the only
 * logo is a 115×65 raster, below Google's 112×112 minimum (KI-S03, KI-S06). */
export function organizationLd(): OrganizationLd {
  return {
    "@type": "Organization",
    "@id": LD_IDS.organization,
    name: SITE.name,
    url: absoluteUrl("/"),
    email: SITE.email,
    image: DEFAULT_IMAGE,
    description: SITE_SEO.description,
    foundingDate: SITE_SEO.foundingDate,
    areaServed: SITE_SEO.areaServed,
    department: DIVISION_SLUGS.map((slug) => ({
      "@type": "Organization",
      name: DIVISIONS[slug].name,
      url: absoluteUrl(DIVISIONS[slug].href),
    })),
  };
}

const OFFICE_PAGE = {
  kochi: routes.location("india"),
  dubai: routes.location("dubai"),
} as const satisfies Record<Office["id"], string>;

/** One office as a local business, with only its confirmed facts (see `OFFICES`). */
export function localBusinessLd(office: Office): LocalBusinessLd {
  const { locality, region, country } = office.address;
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": LD_IDS.office(office.id),
    name: office.name,
    parentOrganization: { "@id": LD_IDS.organization },
    url: absoluteUrl(OFFICE_PAGE[office.id]),
    image: DEFAULT_IMAGE,
    email: office.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(region ? { addressRegion: region } : {}),
      addressCountry: country,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: office.hours.days,
        opens: office.hours.opens,
        closes: office.hours.closes,
      },
    ],
    // The original lists the seven services on the Kochi studio only.
    ...(office.id === "kochi"
      ? {
          makesOffer: SERVICE_OPTIONS.map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        }
      : {}),
  };
}

export function websiteLd(): WebSiteLd {
  return {
    "@type": "WebSite",
    "@id": LD_IDS.website,
    url: absoluteUrl("/"),
    name: SITE.name,
    publisher: { "@id": LD_IDS.organization },
    inLanguage: SITE_SEO.language,
  };
}

/** Site-wide graph for the root layout: Organization, both offices and the WebSite. */
export function siteJsonLd(): JsonLdDocument {
  return {
    "@context": CONTEXT,
    "@graph": [
      organizationLd(),
      localBusinessLd(OFFICES.kochi),
      localBusinessLd(OFFICES.dubai),
      websiteLd(),
    ],
  };
}

/** Plain text of an answer (inline links contribute their label). */
export function faqAnswerText(answer: FaqItem["answer"]): string {
  if (typeof answer === "string") return answer;
  return answer
    .map((part: FaqAnswerPart) => (typeof part === "string" ? part : part.label))
    .join("");
}

/** FAQPage from the FAQ items the page renders; `path` is the page that shows them. */
export function faqPageLd(items: readonly FaqItem[], path: string): JsonLdDocument {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    url: absoluteUrl(path),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: faqAnswerText(item.answer) },
    })),
  };
}

/**
 * BlogPosting of an article. The authors are teams ("KATIC Interior"), so they are Organizations,
 * not the original's `Person` (KI-S02). `image` is the cover's URL (site path or absolute).
 */
export function blogPostingLd(post: Post, image?: string): JsonLdDocument {
  const url = absoluteUrl(routes.article(post.slug));
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    ...(image ? { image: image.startsWith("/") ? absoluteUrl(image) : image } : {}),
    articleSection: post.category,
    inLanguage: SITE_SEO.language,
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", "@id": LD_IDS.organization, name: SITE.name },
  };
}

/** One step of a breadcrumb trail: a page's name and path. */
export type Crumb = { readonly name: string; readonly path: string };

export function breadcrumbLd(trail: readonly Crumb[]): JsonLdDocument {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Serialises JSON-LD for a `<script type="application/ld+json">`. `<` is escaped (Next's JSON-LD
 * guide) so content can never close the script element; `>` and `&` for good measure.
 */
export function serializeJsonLd(data: JsonLdDocument | readonly JsonLdDocument[]): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
