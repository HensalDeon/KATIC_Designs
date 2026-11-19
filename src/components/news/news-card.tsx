import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { media } from "@/content/media";
import { formatNewsDate, type NewsItem } from "@/content/news";
import { cn } from "@/lib/cn";

/**
 * `.knw` (original CSS 1218–1242): a bordered card, white on light sections and near-black on
 * dark ones, whose border turns orange and photo zooms on hover. `featured` is the `/news` lead
 * card (`.knw.big`): photo and text side by side on the canvas, stacked below 1100px.
 */
const cardVariants = cva(
  "group w-full border border-[#e3e3e3] bg-surface transition-[border-color] duration-250 hover:border-brand in-data-[tone=dark]:border-[#262626] in-data-[tone=dark]:bg-ink",
  {
    variants: {
      featured: {
        true: "grid grid-cols-[1.25fr_1fr] max-lg:grid-cols-1",
        false: "flex flex-col",
      },
    },
  },
);

const imageVariants = cva("overflow-hidden", {
  variants: {
    featured: {
      true: "h-420 max-lg:h-300",
      false: "h-230 max-md:h-210",
    },
  },
});

const textVariants = cva("flex flex-col", {
  variants: {
    featured: {
      true: "justify-center p-44 max-md:p-24",
      false: "flex-1 px-24 pt-22 pb-24",
    },
  },
});

type NewsCardProps = {
  readonly item: NewsItem;
  readonly href: string;
  readonly readMore: string;
  readonly featured?: boolean;
  /** Overrides the photo box height (the home teaser's 200px photos on the canvas). */
  readonly imageClassName?: string;
};

/**
 * One news card (`a.knw`). The whole card is the link, named by its content as the blog cards
 * are: naming it by the headline alone hid the visible category, date and excerpt from the name
 * (WCAG 2.5.3, axe `label-content-name-mismatch`). The photo carries a descriptive alt from the media library (KI-A13; the original repeated the
 * headline). Category and date are 11px on phones (KI-A10).
 */
export function NewsCard({
  item,
  href,
  readMore,
  featured = false,
  imageClassName,
}: NewsCardProps) {
  const titleId = `news-${item.slug}-title`;
  const photo = media[item.image];
  return (
    <Link href={href} className={cardVariants({ featured })}>
      <div className={cn(imageVariants({ featured }), imageClassName)}>
        <Image
          src={photo.image}
          alt={photo.description}
          sizes={
            featured
              ? "(max-width: 1099px) 100vw, 704px"
              : "(max-width: 860px) 100vw, (max-width: 1099px) 50vw, 405px"
          }
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
        />
      </div>
      <div className={textVariants({ featured })}>
        <span className="flex justify-between font-display text-[10.5px] font-medium tracking-[0.18em] uppercase max-md:text-[11px]">
          <span className="text-kicker">{item.category}</span>
          <time dateTime={item.date} className="text-[#6b6b6b] in-data-[tone=dark]:text-[#a3a3a3]">
            {formatNewsDate(item.date)}
          </time>
        </span>
        <h3
          id={titleId}
          className={cn(
            "mt-14 font-display font-medium text-fg",
            featured
              ? "text-[34px] leading-[1.1] max-md:text-[24px]"
              : "text-[21px] leading-[1.25]",
          )}
        >
          {item.title}
        </h3>
        <p
          className={cn(
            "mt-10 font-display leading-[1.65] text-[#666] in-data-[tone=dark]:text-[#aaa]",
            featured ? "text-[15.5px]" : "text-[14px]",
          )}
        >
          {item.excerpt}
        </p>
        <span
          className={cn(
            "flex items-center gap-10 pt-18 font-display text-[11.5px] font-medium tracking-[0.14em] text-fg uppercase group-hover:text-kicker",
            featured ? "mt-28" : "mt-auto",
          )}
        >
          {readMore}
          <ArrowIcon direction="up-right" width={10} height={10} />
        </span>
      </div>
    </Link>
  );
}
