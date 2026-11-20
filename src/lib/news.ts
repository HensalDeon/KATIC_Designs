import type { NewsItem } from "@/lib/schemas/news";

/**
 * The `/news` listing: the lead card (`.knw.big`) is the newest item flagged `featured` (the newest
 * item when none is), followed by every other item, newest first.
 */
export function newsListing(items: readonly NewsItem[]): {
  readonly featured: NewsItem | undefined;
  readonly rest: readonly NewsItem[];
} {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const featured = sorted.find((item) => item.featured) ?? sorted[0];
  return { featured, rest: sorted.filter((item) => item !== featured) };
}
