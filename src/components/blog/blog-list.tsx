import Link from "next/link";
import { useId } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { fillTemplate } from "@/lib/format/template";
import { routes } from "@/lib/routes";
import type { BlogListingCopy, Post, PostCategory } from "@/lib/schemas/posts";

import { PagedPostGrid } from "./paged-post-grid";
import { PostCard } from "./post-card";

/**
 * `.kcats button` (global 1918–1921) as links: white with a light border, a dark border on hover,
 * orange when current. The current one has black semibold text, as Works' and India's filters
 * (white on orange is 3.4:1 at 12px, KI-A19).
 */
const CATEGORY_LINK = cn(
  "flex h-40 items-center border border-[#ddd] bg-white px-18 font-sans text-[12px] font-medium text-ink-2 transition-colors duration-200 hover:border-ink-2",
  "aria-[current=page]:border-brand aria-[current=page]:bg-brand aria-[current=page]:font-semibold aria-[current=page]:text-black",
);

/**
 * The category links (`.kcats`, the original's `CATS` buttons, JS 4457/4474). The original hides
 * them (global 1098, 1244) yet filters the grid from `#blog/…/<category>` links, with no visible
 * state and no way back (KI-F13). Category pages are real routes here and show these links with
 * the current one marked; the main listing keeps the original's look without them.
 */
function CategoryLinks({
  copy,
  categories,
  current,
}: {
  readonly copy: BlogListingCopy;
  readonly categories: readonly PostCategory[];
  readonly current: PostCategory;
}) {
  return (
    <nav aria-label={copy.categoriesLabel}>
      <ul className="flex flex-wrap gap-10">
        <li>
          <Link href={routes.blog} className={CATEGORY_LINK}>
            {copy.allCategories}
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={routes.blogCategory(category.slug)}
              aria-current={category.slug === current.slug ? "page" : undefined}
              className={CATEGORY_LINK}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A category page's category and every category (its links). */
export type BlogCategoryContext = {
  readonly current: PostCategory;
  readonly all: readonly PostCategory[];
};

type BlogListProps = {
  readonly copy: BlogListingCopy;
  /** Newest first. */
  readonly posts: readonly Post[];
  /** Omitted on the main listing. */
  readonly category?: BlogCategoryContext;
};

/**
 * The listing section (`section.ks#blog-list`, original line 4056): white, the card grid and
 * "Load More Articles". The search and sort bar (`.kblog-bar`) is hidden by the original's CSS and
 * is not ported (KI-F14). The grid gets a visually hidden heading so the outline does not jump
 * from the banner's h1 to the cards' h3s (KI-A14).
 */
export function BlogList({ copy, posts, category }: BlogListProps) {
  const headingId = useId();
  return (
    <Section tone="light" id="blog-list" aria-labelledby={headingId}>
      <Container>
        <h2 id={headingId} className="sr-only">
          {category
            ? fillTemplate(copy.categoryHeading, { category: category.current.name })
            : copy.listHeading}
        </h2>
        {category ? (
          <CategoryLinks copy={copy} categories={category.all} current={category.current} />
        ) : null}
        <PagedPostGrid
          items={posts.map((post) => ({
            key: post.slug,
            node: <PostCard post={post} readMore={copy.readMore} />,
          }))}
          pageSize={copy.pageSize}
          step={copy.pageStep}
          loadMoreLabel={copy.loadMore}
          labelledBy={headingId}
        />
      </Container>
    </Section>
  );
}
