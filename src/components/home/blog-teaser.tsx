import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { MoreArrow, moreLinkVariants } from "@/components/ui/text-link";
import { media } from "@/content/media";
import { formatPostDate, HOME_BLOG_TEASER, latestPosts, type Post } from "@/content/posts";
import { cn } from "@/lib/cn";
import { fixedCanvasSizes } from "@/lib/media/sizes";
import { routes } from "@/lib/routes";

import { HomeSectionHeader } from "./home-section-header";

type BlogTeaserProps = {
  /** Newest first: the first is featured, the next three are listed. Defaults to the four newest posts. */
  readonly posts?: readonly Post[];
};

/** Category and date row (`.kbh .meta`). */
function PostMeta({ post, className }: { readonly post: Post; readonly className?: string }) {
  return (
    <span
      className={cn(
        "flex gap-14 font-display text-[9.5px] font-semibold tracking-[0.16em] uppercase max-md:text-[11px]",
        className,
      )}
    >
      <span className="text-kicker">{post.category}</span>
      <time dateTime={post.publishedAt} className="text-[#999]">
        {formatPostDate(post.publishedAt)}
      </time>
    </span>
  );
}

/**
 * Home blog teaser (`section.ks.dk.kblog-home#home-blog`, `.kbh`): the newest post as a large
 * featured card and the next three as compact rows (1.25fr / 1fr on the canvas, stacked below
 * 1100px). The original's category chips (`.kbh-cats`) are hidden by its CSS, so they are not
 * rendered (KI-F14); the list rows' excerpts are hidden on the home page too.
 */
export function BlogTeaser({ posts = latestPosts(4) }: BlogTeaserProps) {
  const copy = HOME_BLOG_TEASER;
  const [featured, ...rest] = posts;
  return (
    <Section tone="dark" spacing="home" id="home-blog" aria-labelledby="home-blog-title">
      <Container>
        <HomeSectionHeader
          kicker={copy.kicker}
          title={copy.title}
          titleId="home-blog-title"
          lead={copy.lead}
          cta={{ label: copy.cta, href: routes.blog }}
        />
        <div className="mt-26 grid grid-cols-[1.25fr_1fr] gap-40 max-lg:grid-cols-[minmax(0,1fr)]">
          {featured ? (
            <Link href={routes.article(featured.slug)} className="group block">
              <div className="relative h-290 overflow-hidden">
                <Image
                  src={media[featured.cover].image}
                  alt=""
                  sizes="(max-width: 1099px) 100vw, 683px"
                  className="size-full object-cover transition-transform duration-900 group-hover:scale-[1.04]"
                />
                <span className="absolute top-20 left-20 bg-brand px-10 py-7 font-display text-[9px] font-semibold tracking-[0.18em] text-white uppercase max-md:text-[11px]">
                  {copy.featuredLabel}
                </span>
              </div>
              <PostMeta post={featured} className="mt-14" />
              <h3 className="mt-8 font-display text-[28px] leading-[1.1] font-medium text-white uppercase group-hover:text-brand max-md:text-[22px]">
                {featured.title}
              </h3>
              <p className="mt-8 max-w-560 font-display text-[14.5px] leading-[1.7] text-[#a3a3a3]">
                {featured.excerpt}
              </p>
              <span className={cn(moreLinkVariants({ font: "home" }), "mt-10 text-white")}>
                {copy.readMore}
                <MoreArrow className="font-bold" />
              </span>
            </Link>
          ) : null}
          <ul className="flex flex-col">
            {rest.slice(0, 3).map((post) => (
              <li key={post.slug}>
                <Link
                  href={routes.article(post.slug)}
                  className="group grid grid-cols-[130px_minmax(0,1fr)] items-center gap-22 border-b border-[#e8e5df] py-14"
                >
                  <div className="h-88 overflow-hidden">
                    <Image
                      src={media[post.cover].image}
                      alt=""
                      sizes={fixedCanvasSizes(130)}
                      className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.06]"
                    />
                  </div>
                  <div>
                    <PostMeta post={post} className="mt-14" />
                    <h3 className="mt-8 font-display text-[17px] leading-[1.3] font-medium text-white group-hover:text-brand">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
