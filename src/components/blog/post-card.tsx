import Image from "next/image";
import Link from "next/link";

import { canvasSizes } from "@/components/sections/section-media";
import { MoreLabel } from "@/components/ui/text-link";
import { media } from "@/content/media";
import { BLOG_PAGE, formatPostDate, type Post } from "@/content/posts";
import { routes } from "@/lib/routes";

/** Card width on the 1268px canvas: three columns with 24px gaps. */
const CARD_SIZES = canvasSizes((1268 - 2 * 24) / 3, "50vw");

/**
 * A blog listing card (`a.kpost`, rendered by the original's `KB` `card()`, JS 4461; styles global
 * 1922–1933): 260px photo that zooms to 1.04 on hover, category and date row, Inter title that
 * turns orange on hover, excerpt and the "Read Article →" label. The meta row is 9px on the
 * canvas and 11px on phones and tablets (KI-A10); the photo's alt describes the photo (KI-A13).
 */
export function PostCard({ post }: { readonly post: Post }) {
  const cover = media[post.cover];
  return (
    <Link href={routes.article(post.slug)} className="group flex flex-col text-fg">
      <span className="block h-260 overflow-hidden">
        <Image
          src={cover.image}
          alt={cover.description}
          sizes={CARD_SIZES}
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
        />
      </span>
      <span className="mt-18 flex justify-between font-sans text-[9px] font-semibold tracking-[0.16em] uppercase max-md:text-[11px]">
        <span className="text-[#c0522a]">{post.category}</span>
        <time dateTime={post.publishedAt} className="text-[#888]">
          {formatPostDate(post.publishedAt)}
        </time>
      </span>
      <h3 className="mt-12 font-sans text-[22px] leading-[1.3] font-normal group-hover:text-brand">
        {post.title}
      </h3>
      <p className="mt-10 font-sans text-[13px] leading-[1.75] text-fg-body">{post.excerpt}</p>
      <MoreLabel className="mt-16 flex">{BLOG_PAGE.readMore}</MoreLabel>
    </Link>
  );
}
