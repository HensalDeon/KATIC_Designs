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

type TestimonialsProps = {
  readonly items: readonly TestimonialItem[];
  readonly className?: string;
};

/**
 * Testimonial cards (`.kq`): three bordered cards (white on light sections, `#0c0c0c` on dark) with
 * an orange quote mark, the quote at 18/1.5 and a `.who` row (40px round avatar, name, meta).
 *
 * Fixes: the quote mark is decorative and hidden from assistive tech (KI-A16). Below 1100px the
 * last card of an odd count spans both columns instead of leaving a 2 + 1 orphan (KI-L23).
 */
export function Testimonials({ items, className }: TestimonialsProps) {
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
          <figure className="flex w-full flex-col border border-[#e3dfd7] bg-white px-30 pt-28 pb-24 text-fg in-data-[tone=dark]:border-[#2a2a2a] in-data-[tone=dark]:bg-[#0c0c0c]">
            <span
              className="font-sans text-[26px] leading-none font-semibold text-brand italic"
              aria-hidden
            >
              “
            </span>
            <blockquote className="mt-24 flex-1 font-sans text-[18px] leading-[1.5]">
              <p>{item.quote}</p>
            </blockquote>
            <figcaption className="mt-24 flex items-center gap-14 border-t border-[#e3dfd7] pt-16 in-data-[tone=dark]:border-[#2a2a2a]">
              {/* The name sits next to the portrait, so the image is decorative. */}
              <Image
                src={resolveImage(item.avatar)}
                alt=""
                sizes="40px"
                className="size-40 shrink-0 rounded-[50%] object-cover"
              />
              <span className="font-sans">
                <b className="block text-[11.5px] font-semibold">{item.name}</b>
                <span className="mt-3 block text-[9px] tracking-[0.16em] text-[#666] uppercase in-data-[tone=dark]:text-[#999] max-md:text-[11px]">
                  {item.meta}
                </span>
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
