import { cva } from "class-variance-authority";
import Image from "next/image";

import { cn } from "@/lib/cn";

import { type ImageInput, resolveImage } from "./section-media";

export type TestimonialItem = {
  readonly quote: string;
  readonly name: string;
  /** Project type and place, e.g. "Turnkey Residence · Thrissur". */
  readonly meta: string;
  readonly avatar: ImageInput;
};

/**
 * `service`: the service pages' `.kq` cards. `reviews`: the Reviews page's `#p-reviews .cl .c`
 * cards (page `<style>` 4237–4244), always on black: `#111` card, `#2a2a2a` border, 24px mark,
 * quote 18.5/1.45, smaller `.who` text.
 */
export type TestimonialsVariant = "service" | "reviews";

const cardVariants = cva("flex w-full flex-col border text-fg", {
  variants: {
    variant: {
      service:
        "border-[#e3dfd7] bg-white px-30 pt-28 pb-24 in-data-[tone=dark]:border-[#2a2a2a] in-data-[tone=dark]:bg-[#0c0c0c]",
      reviews: "border-[#2a2a2a] bg-ink-2 px-30 pt-26 pb-22",
    },
  },
});

const markVariants = cva("font-sans leading-none font-semibold text-brand italic", {
  variants: { variant: { service: "text-[26px]", reviews: "text-[24px]" } },
});

const quoteVariants = cva("flex-1 font-sans", {
  variants: {
    variant: {
      service: "mt-24 text-[18px] leading-[1.5]",
      reviews: "mt-30 text-[18.5px] leading-[1.45]",
    },
  },
});

const whoVariants = cva("flex items-center gap-14 border-t pt-16", {
  variants: {
    variant: {
      service: "mt-24 border-[#e3dfd7] in-data-[tone=dark]:border-[#2a2a2a]",
      reviews: "mt-22 border-[#333]",
    },
  },
});

const nameVariants = cva("block font-semibold", {
  variants: { variant: { service: "text-[11.5px]", reviews: "text-[11px]" } },
});

const metaVariants = cva("mt-3 block tracking-[0.16em] uppercase max-md:text-[11px]", {
  variants: {
    variant: {
      service: "text-[9px] text-[#666] in-data-[tone=dark]:text-[#999]",
      reviews: "text-[8.5px] text-[#bbb]",
    },
  },
});

type TestimonialsProps = {
  readonly items: readonly TestimonialItem[];
  readonly variant?: TestimonialsVariant;
  readonly className?: string;
};

/**
 * Testimonial cards (`.kq`): three bordered cards (white on light sections, `#0c0c0c` on dark) with
 * an orange quote mark, the quote at 18/1.5 and a `.who` row (40px round avatar, name, meta). The
 * `reviews` variant is the Reviews page's grid of six (`#p-reviews .cl .cards`).
 *
 * Fixes: the quote mark is decorative and hidden from assistive tech (KI-A16). Below 1100px the
 * last card of an odd count spans both columns instead of leaving a 2 + 1 orphan (KI-L23). The
 * meta line is 11px on phones (KI-A10).
 */
export function Testimonials({ items, variant = "service", className }: TestimonialsProps) {
  const lastSpans = items.length % 2 === 1;

  return (
    <ul className={cn("grid grid-cols-3 gap-18 max-lg:grid-cols-2 max-md:grid-cols-1", className)}>
      {items.map((item, index) => (
        <li
          key={`${item.name}-${item.meta}`}
          className={cn(
            "flex",
            lastSpans && index === items.length - 1 && "max-lg:col-span-2 max-md:col-span-1",
          )}
        >
          <figure className={cardVariants({ variant })}>
            <span className={markVariants({ variant })} aria-hidden>
              “
            </span>
            <blockquote className={quoteVariants({ variant })}>
              <p>{item.quote}</p>
            </blockquote>
            <figcaption className={whoVariants({ variant })}>
              {/* The name sits next to the portrait, so the image is decorative. */}
              <Image
                src={resolveImage(item.avatar)}
                alt=""
                sizes="40px"
                className="size-40 shrink-0 rounded-[50%] object-cover"
              />
              <span className="font-sans">
                <b className={nameVariants({ variant })}>{item.name}</b>
                <span className={metaVariants({ variant })}>{item.meta}</span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
