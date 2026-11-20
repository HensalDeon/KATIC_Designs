/**
 * Display dates as the original prints them. Both take an ISO `YYYY-MM-DD` date and format it in
 * UTC, so the output never depends on the server's or the visitor's time zone.
 */

const POST_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Blog dates (`en-GB` `toLocaleDateString`, e.g. "14 Oct 2026", "18 Sept 2026"). */
export function formatPostDate(isoDate: string): string {
  return POST_DATE.format(new Date(`${isoDate}T00:00:00Z`));
}

const NEWS_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * News dates as the original's markup writes them: two-digit day and a three-letter month
 * ("05 Aug 2026", "30 Sep 2026"). Unlike blog dates these were typed by hand, so "Sept" is
 * normalised to "Sep".
 */
export function formatNewsDate(isoDate: string): string {
  return NEWS_DATE.format(new Date(`${isoDate}T00:00:00Z`)).replace("Sept", "Sep");
}
