import Link from "next/link";

import { ServiceIcon, type ServiceIconName } from "@/components/icons/service-icon";
import { cn } from "@/lib/cn";

export type RowListItem = {
  readonly icon: ServiceIconName;
  readonly title: string;
  readonly text: string;
  /** Makes the whole row a link, marked with ↗; its title turns orange on hover. */
  readonly href?: string;
};

type RowListProps = {
  readonly items: readonly RowListItem[];
  readonly className?: string;
  readonly "data-testid"?: string;
};

const ROW =
  "group grid min-h-84 grid-cols-[64px_300px_1fr_24px] items-center border-t border-[#e1ddd5] py-14 text-fg last:border-b in-data-[tone=dark]:border-[rgba(255,255,255,0.18)] max-lg:grid-cols-[44px_minmax(0,1fr)_20px]";

/**
 * Numbered-style service rows (`.krows`) rendered inside a `ContentSection`: icon, title, text and
 * an ↗ marker for rows that link somewhere (`a.r`). Below 1100px the text drops under the title.
 * Rules and the icon colour follow the section tone (the original greys the icon on black).
 */
export function RowList({ items, className, "data-testid": testId }: RowListProps) {
  return (
    <div data-testid={testId} className={className}>
      {items.map((item) => {
        const content = (
          <>
            <span className="grid place-items-center text-brand in-data-[tone=dark]:text-[#aaa]">
              <ServiceIcon name={item.icon} size={20} />
            </span>
            <b
              className={cn(
                "font-sans text-[22px] font-normal",
                item.href && "group-hover:text-brand",
              )}
            >
              {item.title}
            </b>
            <span className="font-sans text-[13.5px] leading-[1.7] text-fg-body max-lg:col-[2]">
              {item.text}
            </span>
            <i className="font-display text-brand not-italic" aria-hidden>
              {item.href ? "↗" : null}
            </i>
          </>
        );

        return item.href ? (
          <Link key={item.title} href={item.href} className={ROW}>
            {content}
          </Link>
        ) : (
          <div key={item.title} className={ROW}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
