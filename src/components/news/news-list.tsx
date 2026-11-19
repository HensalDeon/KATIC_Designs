import Link from "next/link";

import { LineBreaks } from "@/components/blocks/title-text";
import { SectionHeader } from "@/components/sections/section-header";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { NEWS, NEWS_PAGE, type NewsItem, newsListing } from "@/content/news";
import { SITE } from "@/content/site";
import { routes } from "@/lib/routes";

import { NewsCard } from "./news-card";

type NewsListProps = {
  readonly items?: readonly NewsItem[];
};

/** Below the fixed header when a permalink (`/news#<slug>`) scrolls a card into view. */
const PERMALINK_OFFSET = "scroll-mt-100";

/**
 * `section.ks.knews-page#news-list` (original lines 4050–4052), white: the `.kh` header, the lead
 * card (`.knews-feat`, 60px below the header) and the other items in a 3-column grid (2 below
 * 1100px, 1 on phones). Every card carries its slug as id, so `/news#<slug>` is its permalink.
 * Without news it shows an empty state instead of the cards.
 */
export function NewsList({ items = NEWS }: NewsListProps) {
  const copy = NEWS_PAGE.list;
  const { featured, rest } = newsListing(items);

  return (
    <Section tone="light" id={copy.id} aria-labelledby="news-list-title">
      <Container>
        <SectionHeader
          kicker={copy.kicker}
          title={
            <span id="news-list-title">
              <LineBreaks lines={copy.title} />
            </span>
          }
          lead={
            <>
              {copy.lead.before}
              <Link
                href={`mailto:${SITE.email}`}
                className="underline decoration-[#bbb] underline-offset-3 hover:text-fg"
              >
                {SITE.email}
              </Link>
              {copy.lead.after}
            </>
          }
        />
        {featured ? (
          <article id={featured.slug} className={`mt-60 flex ${PERMALINK_OFFSET}`}>
            <NewsCard
              item={featured}
              href={routes.newsItem(featured.slug)}
              readMore={copy.readMore}
              featured
            />
          </article>
        ) : (
          <p className="mt-60 font-sans text-[16px] leading-[1.8] text-fg-muted">{copy.empty}</p>
        )}
        {rest.length > 0 ? (
          <ul className="mt-28 grid grid-cols-3 gap-24 max-lg:grid-cols-2 max-md:grid-cols-1">
            {rest.map((item) => (
              <li key={item.slug} id={item.slug} className={`flex ${PERMALINK_OFFSET}`}>
                <NewsCard item={item} href={routes.newsItem(item.slug)} readMore={copy.readMore} />
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </Section>
  );
}
