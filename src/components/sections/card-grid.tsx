import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

import { canvasSizes, type ImageInput, resolveImage } from "./section-media";

export type CardItem = {
  /** Omit for a non-link card (no hover effects, no "more" label). */
  readonly href?: string;
  readonly image: ImageInput;
  readonly alt: string;
  readonly title: string;
  /** Small orange line above the title, e.g. "Residential · Interiors · Dubai, UAE" (project cards). */
  readonly meta?: string;
  /** Description under the title (service and product cards). */
  readonly text?: string;
};

export type CardGridVariant = "project" | "service" | "product";
export type CardGridColumns = 2 | 3 | 4 | 5;

const DEFAULT_MORE_LABEL: Record<CardGridVariant, string> = {
  project: "View Project",
  service: "Explore Service",
  product: "View Project",
};

const gridVariants = cva("grid gap-24 max-lg:grid-cols-2 max-md:grid-cols-1", {
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
 * division cards with a custom `moreLabel`. Hovering a linked card scales its image to 1.04 over
 * .8s and turns the title orange. Two columns below 1100px, one on phones. Renders inside
 * `ContentSection` (`.kbody`).
 */
export function CardGrid({ variant, columns, items, moreLabel, className }: CardGridProps) {
  const label = moreLabel ?? DEFAULT_MORE_LABEL[variant];
  const sizes = canvasSizes(canvasCardWidth(columns), "50vw");

  return (
    <ul className={cn(gridVariants({ columns }), className)}>
      {items.map((item) => (
        <li key={`${item.title}-${item.href ?? ""}`} className="flex">
          <Card item={item} columns={columns} sizes={sizes} moreLabel={label} />
        </li>
      ))}
    </ul>
  );
}

function Card({
  item,
  columns,
  sizes,
  moreLabel,
}: {
  item: CardItem;
  columns: CardGridColumns;
  sizes: string;
  moreLabel: string;
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
        <span className="mt-auto flex items-center gap-10 pt-16 font-sans text-[11px] font-semibold tracking-[0.12em] text-fg uppercase">
          {moreLabel}
          <b className="font-black text-brand-text in-data-[tone=dark]:text-brand" aria-hidden>
            →
          </b>
        </span>
      ) : null}
    </>
  );
  const cardClass = "flex w-full flex-col text-fg";

  return item.href ? (
    <Link href={item.href} className={cn("group", cardClass)}>
      {content}
    </Link>
  ) : (
    <div className={cardClass}>{content}</div>
  );
}
