import { AccentTitleText } from "@/components/blocks/title-text";
import { PageHero } from "@/components/sections/page-hero";
import { mediaDescription } from "@/lib/media/resolve";
import type { BlogListingCopy, Post } from "@/lib/schemas/posts";

import { type BlogCategoryContext, BlogList } from "./blog-list";

type BlogPageProps = {
  readonly copy: BlogListingCopy;
  /** Newest first. */
  readonly posts: readonly Post[];
  /** Set on the category pages (`/blog/category/<slug>`). */
  readonly category?: BlogCategoryContext;
};

/**
 * Blog listing (`#p-blog`, original lines 4054–4065, docs/analysis/04 §5): the full-screen banner
 * (`.hero.kh-hero`) and the white card grid (`#blog-list`), then the layout's footer; the original
 * has no contact section here. The original renders the grid with JavaScript (`KB.list()`); here
 * it is server-rendered, and only "Load more" is a client island. No reveal-on-scroll (D7).
 */
export function BlogPage({ copy, posts, category }: BlogPageProps) {
  const { hero } = copy;
  return (
    <>
      <PageHero
        image={{ src: hero.image, alt: mediaDescription(hero.image) }}
        kicker={hero.kicker}
        title={<AccentTitleText title={hero.title} />}
        lead={hero.lead}
      />
      <BlogList copy={copy} posts={posts} {...(category ? { category } : {})} />
    </>
  );
}
