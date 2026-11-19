import Image from "next/image";
import Link from "next/link";

import { ArrowIcon } from "@/components/icons/arrow-icon";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { media } from "@/content/media";
import { formatNewsDate, HOME_NEWS_TEASER, latestNews, type NewsItem } from "@/content/news";
import { routes } from "@/lib/routes";

import { HomeSectionHeader } from "./home-section-header";

type NewsTeaserProps = {
  /** Cards to show; defaults to the three newest items. */
  readonly items?: readonly NewsItem[];
};

/**
 * Home news teaser (`section.ks.dk.knews-home#home-news`): the `.kh` header and three `.knw`
 * cards (3 columns, 2 below 1100px, 1 on phones). Cards link to the news page because there are
 * no news detail pages yet (KI-F11; the original linked each card to itself).
 */
export function NewsTeaser({ items = latestNews(3) }: NewsTeaserProps) {
  const copy = HOME_NEWS_TEASER;
  return (
    <Section tone="dark" spacing="home" id="home-news" aria-labelledby="home-news-title">
      <Container>
        <HomeSectionHeader
          kicker={copy.kicker}
          title={copy.title}
          titleId="home-news-title"
          lead={copy.lead}
          cta={{ label: copy.cta, href: routes.news }}
        />
        <ul className="mt-60 grid grid-cols-3 gap-24 max-lg:grid-cols-2 max-md:grid-cols-1">
          {items.map((item) => (
            <li key={item.slug} className="flex">
              <NewsCard item={item} readMore={copy.readMore} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** One `.knw` card on a dark section. */
function NewsCard({ item, readMore }: { readonly item: NewsItem; readonly readMore: string }) {
  return (
    <Link
      href={routes.news}
      className="group flex w-full flex-col border border-[#262626] bg-ink transition-[border-color] duration-250 hover:border-brand"
    >
      <div className="h-200 overflow-hidden max-lg:h-230 max-md:h-210">
        <Image
          src={media[item.image].image}
          alt=""
          sizes="(max-width: 860px) 100vw, (max-width: 1099px) 50vw, 405px"
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col px-24 pt-22 pb-24">
        <span className="flex justify-between font-display text-[10.5px] font-medium tracking-[0.18em] uppercase max-md:text-[11px]">
          <span className="text-kicker">{item.category}</span>
          <time dateTime={item.date} className="text-[#a3a3a3]">
            {formatNewsDate(item.date)}
          </time>
        </span>
        <h3 className="mt-14 font-display text-[21px] leading-[1.25] font-medium text-white">
          {item.title}
        </h3>
        <p className="mt-10 font-display text-[14px] leading-[1.65] text-[#aaa]">{item.excerpt}</p>
        <span className="mt-auto flex items-center gap-10 pt-18 font-display text-[11.5px] font-medium tracking-[0.14em] text-white uppercase group-hover:text-brand">
          {readMore}
          <ArrowIcon direction="up-right" width={10} height={10} />
        </span>
      </div>
    </Link>
  );
}
