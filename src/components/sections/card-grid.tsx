import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { MoreLabel } from "@/components/ui/text-link";
import { cn } from "@/lib/cn";

import { ContactLink } from "./contact-link";
import { canvasSizes, type ImageInput, resolveImage } from "./section-media";

export type CardItem = {
  /** Omit for a non-link card (no hover effects, no "more" label). */
  readonly href?: string;
  /**
   * The card is a "go to contact" (the original's `a.kc href="#contact"`, India's Kochi office): a
   * click scrolls to the page's enquiry form and applies its prefill; `href` (`#<page>-contact`)
   * is the target without JavaScript.
   */
  readonly contact?: boolean;
  readonly image: ImageInput;
  readonly alt: string;
  readonly title: string;
  /** Small orange line above the title, e.g. "Residential · Interiors · Dubai, UAE" (project cards). */
  readonly meta?: string;
  /** Description under the title (service and product cards). */
  readonly text?: string;
  /** Status chip over the image's top-left corner (`.kc .tg`): "Office", "Expanding", "Completed". */
  readonly tag?: string;
  /** Overrides the grid's link label for this card (e.g. "Contact the Kochi office"). */
  readonly moreLabel?: string;
};

export type CardGridVariant = "project" | "service" | "product";
export type CardGridColumns = 2 | 3 | 4 | 5;

const DEFAULT_MORE_LABEL: Record<CardGridVariant, string> = {
  project: "View Project",
  service: "Explore Service",
  product: "View Project",
};

/** The grid (`.kc-grid.cN`): N columns on the canvas, two below 1100px, one on phones. */
export const cardGridVariants = cva("grid gap-24 max-lg:grid-cols-2 max-md:grid-cols-1", {
  variants: {
    columns: {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
    },
  },
});

/** Image heights (`.kc .im`): 300px by default, c2 420, c4 260, c5 230, and c3 200 on the canvas. */
const imageVariants = cva("relative overflow-hidden bg-[#eee] in-data-[tone=dark]:bg-ink-2", {
  variants: {
    columns: {
      2: "h-420",
      3: "h-200 max-lg:h-300",
      4: "h-260",
      5: "h-230",
    },
  },
});

/** Card width on the 1268px canvas with 24px gaps, for `sizes`. */
function canvasCardWidth(columns: CardGridColumns): number {
  return (1268 - 24 * (columns - 1)) / columns;
}

/** `sizes` of a card image in a grid of `columns`. */
export function cardGridSizes(columns: CardGridColumns): string {
  return canvasSizes(canvasCardWidth(columns), "50vw");
}

/** The link label of a grid's cards ("View Project", "Explore Service", or the override). */
export function cardMoreLabel(variant: CardGridVariant, override?: string): string {
  return override ?? DEFAULT_MORE_LABEL[variant];
}

type CardGridProps = {
  /** `project`: meta + title; `service`: title + description; `product`: title + description. */
  readonly variant: CardGridVariant;
  readonly columns: CardGridColumns;
  readonly items: readonly CardItem[];
  /** Overrides the variant's link label ("View Project", "Explore Service", e.g. "Explore Division"). */
  readonly moreLabel?: string;
  readonly className?: string;
};

/**
 * Image cards (`.kc-grid.c2|c3|c4|c5` of `.kc`): project, related-service and product cards, plus
 * division cards with a custom `moreLabel` and location cards with a status `tag`. Hovering a
 * linked card scales its image to 1.04 over .8s and turns the title orange. Two columns below
 * 1100px, one on phones. Renders inside `ContentSection` (`.kbody`).
 */
export function CardGrid({ variant, columns, items, moreLabel, className }: CardGridProps) {
  const label = cardMoreLabel(variant, moreLabel);
  const sizes = cardGridSizes(columns);

  return (
    <ul className={cn(cardGridVariants({ columns }), className)}>
      {items.map((item) => (
        <li key={`${item.title}-${item.href ?? ""}`} className="flex">
          <Card item={item} columns={columns} sizes={sizes} moreLabel={label} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One card of a `CardGrid` (`.kc`), for grids that place their cards themselves (India's filtered
 * projects). Render it inside an `<li className="flex">` of a `cardGridVariants` list.
 */
export function Card({
  item,
  columns,
  sizes,
  moreLabel,
}: {
  readonly item: CardItem;
  readonly columns: CardGridColumns;
  /** `cardGridSizes(columns)`. */
  readonly sizes: string;
  /** `cardMoreLabel(variant)`; `item.moreLabel` overrides it. */
  readonly moreLabel: string;
}) {
  const content = (
    <>
      <span className={cn("block", imageVariants({ columns }))}>
        <Image
          src={resolveImage(item.image)}
          alt={item.alt}
          sizes={sizes}
          className="size-full object-cover transition-transform duration-800 group-hover:scale-[1.04]"
        />
        {item.tag ? (
          <span className="absolute top-16 left-16 flex h-24 items-center bg-ink-2 px-10 font-sans text-[8.5px] font-semibold tracking-[0.16em] text-white uppercase max-md:text-[11px]">
            {item.tag}
          </span>
        ) : null}
      </span>
      {item.meta ? (
        <small className="mt-20 block font-sans text-[9px] font-semibold tracking-[0.16em] text-[#c0522a] uppercase in-data-[tone=dark]:text-brand max-md:text-[11px]">
          {item.meta}
        </small>
      ) : null}
      <h3
        className={cn(
          "mt-14 font-sans text-[23px] leading-[1.25] font-normal group-hover:text-brand",
          item.meta ? "max-lg:mt-8" : "max-lg:mt-20",
        )}
      >
        {item.title}
      </h3>
      {item.text ? (
        <p className="mt-6 font-sans text-[13px] leading-[1.75] text-fg-body max-lg:mt-10">
          {item.text}
        </p>
      ) : null}
      {item.href ? (
        <MoreLabel className="mt-auto flex pt-16">{item.moreLabel ?? moreLabel}</MoreLabel>
      ) : null}
    </>
  );
  const cardClass = "flex w-full flex-col text-fg";

  if (item.href && item.contact) {
    return (
      <ContactLink href={item.href} className={cn("group", cardClass)}>
        {content}
      </ContactLink>
    );
  }
  return item.href ? (
    <Link href={item.href} className={cn("group", cardClass)}>
      {content}
    </Link>
  ) : (
    <div className={cardClass}>{content}</div>
  );
}
