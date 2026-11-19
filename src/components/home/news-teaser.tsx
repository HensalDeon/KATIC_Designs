import { NewsCard } from "@/components/news/news-card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { HOME_NEWS_TEASER, latestNews, type NewsItem } from "@/content/news";
import { routes } from "@/lib/routes";

import { HomeSectionHeader } from "./home-section-header";

type NewsTeaserProps = {
  /** Cards to show; defaults to the three newest items. */
  readonly items?: readonly NewsItem[];
};

/**
 * Home news teaser (`section.ks.dk.knews-home#home-news`): the `.kh` header and three `.knw`
 * cards (3 columns, 2 below 1100px, 1 on phones; 200px photos on the canvas). Cards link to the
 * news page because there are no news detail pages yet (KI-F11; the original linked each card to
 * itself).
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
              <NewsCard
                item={item}
                href={routes.news}
                readMore={copy.readMore}
                imageClassName="lg:h-200"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
