import Image from "next/image";
import Link from "next/link";
import { useId } from "react";

import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import {
  ARTICLE_PAGE,
  formatPostDate,
  otherLatestPosts,
  type Post,
  postCategorySlug,
} from "@/content/posts";
import { routes } from "@/lib/routes";

import { ArticleBody } from "./article-body";

/** Phone tap area of the breadcrumb links (`html body #p-article .crumb a`, ≤860px). */
const CRUMB_LINK =
  "hover:text-brand max-md:-mx-4 max-md:-my-10 max-md:inline-block max-md:px-4 max-md:py-10";

/**
 * The cover photo (`div.kart-cover`): 520px, 300px on phones, under a top-down darkening so the
 * fixed header stays legible. The article has no banner, so the photo starts under the header.
 */
function ArticleCover({ post }: { readonly post: Post }) {
  const cover = media[post.cover];
  return (
    <div
      data-parity="kart-cover"
      className="relative h-520 overflow-hidden after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(0,0,0,0.45),rgba(0,0,0,0.1)_40%,rgba(0,0,0,0.2))] max-md:h-300"
    >
      <Image
        src={cover.image}
        alt={cover.description}
        preload
        sizes="100vw"
        className="size-full object-cover"
      />
    </div>
  );
}

/**
 * "Latest articles" (`.kart aside`): the four newest other posts as thumbnail rows and the
 * "All Articles" button.
 *
 * - The heading is an h2 styled as the original's h4, so the outline does not jump (KI-A14), in
 *   the text-safe orange (KI-A11) and 11px on phones and tablets (KI-A10).
 * - On the canvas the original's `position: sticky; top: 110px` never sticks: the section's
 *   `overflow: hidden` makes the section its scroll container, which also leaves the box 110px
 *   lower than the article. The box keeps that resting place and sticks as intended (the section
 *   clips with `overflow: clip`, which is not a scroll container).
 * - The original's button inherits the rows' `aside a` grid and loses its bottom border; here it is
 *   a normal full-width outline button with the label centred.
 */
function LatestArticles({ post }: { readonly post: Post }) {
  const headingId = useId();
  const latest = otherLatestPosts(post.slug, ARTICLE_PAGE.latestCount);
  return (
    <aside
      aria-labelledby={headingId}
      className="border border-[#e3dfd7] p-26 lg:sticky lg:top-110 lg:mt-110"
    >
      <h2
        id={headingId}
        className="font-sans text-[10px] font-semibold tracking-[0.2em] text-kicker uppercase max-md:text-[11px]"
      >
        {ARTICLE_PAGE.latestHeading}
      </h2>
      <ul>
        {latest.map((other) => (
          <li key={other.slug} className="border-b border-[#eee] last:border-b-0">
            <Link
              href={routes.article(other.slug)}
              className="group grid grid-cols-[84px_minmax(0,1fr)] items-center gap-14 py-16"
            >
              <Image
                src={media[other.cover].image}
                alt=""
                sizes="84px"
                className="h-64 w-84 object-cover"
              />
              <span>
                <span className="block font-sans text-[13.5px] leading-[1.4] font-medium group-hover:text-brand">
                  {other.title}
                </span>
                <time
                  dateTime={other.publishedAt}
                  className="mt-4 block font-sans text-[11px] text-[#888]"
                >
                  {formatPostDate(other.publishedAt)}
                </time>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ButtonLink
        href={routes.blog}
        variant="outline"
        icon="up-right"
        className="mt-18 flex w-full justify-center"
      >
        {ARTICLE_PAGE.allArticles}
      </ButtonLink>
    </aside>
  );
}

/**
 * Article (`#p-article`, original lines 4066–4070, filled by `KB.article`, JS 4487–4499;
 * docs/analysis/04 §6): the cover photo, then one white section (`section.ks > .wrap.kart`, 7fr/3fr
 * with a 64px gap, one column below 1100px) with the breadcrumb, the Jost title, the byline row,
 * the body and the "Latest articles" aside; the layout's footer follows. No reveal-on-scroll (D7).
 */
export function ArticlePage({ post }: { readonly post: Post }) {
  const titleId = useId();
  return (
    <>
      <ArticleCover post={post} />
      <Section tone="light" data-parity="ks" className="overflow-clip">
        <Container className="grid grid-cols-[7fr_3fr] items-start gap-64 max-lg:grid-cols-[minmax(0,1fr)] max-lg:gap-28">
          <article aria-labelledby={titleId} className="min-w-0">
            <nav aria-label="Breadcrumb" className="font-sans text-[11px] font-medium text-[#888]">
              <Link href={routes.blog} className={CRUMB_LINK}>
                {ARTICLE_PAGE.breadcrumb}
              </Link>
              {" / "}
              <Link
                href={routes.blogCategory(postCategorySlug(post.category))}
                className={CRUMB_LINK}
              >
                {post.category}
              </Link>
            </nav>
            <h1
              id={titleId}
              className="mt-18 font-display text-[52px] leading-[1.08] font-medium text-fg uppercase max-md:text-[34px]"
            >
              {post.title}
            </h1>
            <p className="mt-22 flex flex-wrap gap-22 border-b border-[#e3dfd7] pb-26 font-sans text-[12px] font-medium text-[#555]">
              <span>
                {ARTICLE_PAGE.byline} <b className="font-semibold text-fg">{post.author}</b>
              </span>
              <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              <span className="text-[10.5px] font-semibold tracking-[0.12em] text-[#c0522a] uppercase max-md:text-[11px]">
                {post.category}
              </span>
            </p>
            <ArticleBody blocks={post.body} />
          </article>
          <LatestArticles post={post} />
        </Container>
      </Section>
      {/* TODO(phase-10): BlogPosting JSON-LD (headline, excerpt, date, author as Organization,
          canonical URL) once the site-wide Organization graph and canonical base URL exist (KI-S02). */}
    </>
  );
}
