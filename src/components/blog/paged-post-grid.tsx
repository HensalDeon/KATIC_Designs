"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export type PagedItem = {
  readonly key: string;
  /** The server-rendered card. */
  readonly node: ReactNode;
};

type PagedPostGridProps = {
  readonly items: readonly PagedItem[];
  /** Cards shown on arrival (the original's `shown: 6`). */
  readonly pageSize: number;
  /** Cards added per "Load more" click (the original adds 3). */
  readonly step: number;
  readonly loadMoreLabel: string;
  /** Id of the heading that names the list. */
  readonly labelledBy?: string;
};

/**
 * The blog grid with its "Load More Articles" button (`.kposts[data-blog-grid]` + `.kmore-wrap`,
 * the original's `KB.list()`, JS 4463–4472): `pageSize` cards, then `step` more per click; the
 * button disappears once every card shows. Three columns on the canvas, two below 1100px, one on
 * phones.
 *
 * Every card is server-rendered. The extra ones are hidden only when JavaScript runs (`html.js`,
 * set before first paint), so without JavaScript the whole list shows and the button, which could
 * not work, is hidden. After a click, focus moves to the first new card.
 */
export function PagedPostGrid({
  items,
  pageSize,
  step,
  loadMoreLabel,
  labelledBy,
}: PagedPostGridProps) {
  const [shown, setShown] = useState(pageSize);
  const listRef = useRef<HTMLUListElement>(null);
  const firstNew = useRef<number | null>(null);

  useEffect(() => {
    const index = firstNew.current;
    if (index === null) return;
    firstNew.current = null;
    listRef.current?.querySelectorAll<HTMLElement>(":scope > li > a")[index]?.focus();
  }, [shown]);

  const loadMore = () => {
    firstNew.current = shown;
    setShown((count) => count + step);
  };

  return (
    <>
      <ul
        ref={listRef}
        aria-labelledby={labelledBy}
        className="mt-44 grid grid-cols-3 gap-x-24 gap-y-40 max-lg:grid-cols-2 max-md:grid-cols-1"
      >
        {items.map((item, index) => (
          <li
            key={item.key}
            data-paged={index >= shown ? "hidden" : undefined}
            className={cn("flex min-w-0 flex-col", index >= shown && "in-[.js]:hidden")}
          >
            {item.node}
          </li>
        ))}
      </ul>
      {shown < items.length ? (
        <div className="mt-52 hidden text-center in-[.js]:block">
          <Button variant="outline" icon={null} onClick={loadMore}>
            {loadMoreLabel}
          </Button>
        </div>
      ) : null}
    </>
  );
}
