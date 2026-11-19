import Image from "next/image";

import { ContactLink } from "@/components/sections/contact-link";
import { canvasSizes } from "@/components/sections/section-media";
import { media } from "@/content/media";
import { ARTICLE_PAGE, type PostBlock } from "@/content/posts";

/** Body column width on the canvas (7fr of 1268 − 64). */
const FIGURE_SIZES = canvasSizes(843, "100vw");

const PARAGRAPH = "mt-18 font-sans text-[16.5px] leading-[1.9] text-[#333]";

function Block({ block }: { readonly block: PostBlock }) {
  switch (block.type) {
    case "p":
      return <p className={PARAGRAPH}>{block.text}</p>;
    case "h":
      return (
        <h2 className="mt-44 font-display text-[30px] leading-[1.25] font-medium uppercase">
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul className="mt-18 ml-20 list-disc">
          {block.items.map((item) => (
            <li key={item} className="mt-6 font-sans text-[16px] leading-[1.85] text-[#333]">
              {item}
            </li>
          ))}
        </ul>
      );
    case "img": {
      const asset = media[block.image];
      return (
        <figure className="mt-30">
          <Image
            src={asset.image}
            alt={asset.description}
            sizes={FIGURE_SIZES}
            className="h-420 w-full object-cover max-md:h-300"
          />
          <figcaption className="mt-10 font-sans text-[12px] text-[#888]">
            {block.caption}
          </figcaption>
        </figure>
      );
    }
  }
}

/**
 * Article body (`.kart .body[data-art-body]`, rendered by `KB.article`, JS 4494; styles global
 * 1949–1957): paragraphs, Jost uppercase subheadings (h2), bullet lists and captioned photos, then
 * the closing "Planning a project? Talk to the KATIC team." line, whose link goes to the enquiry
 * form (home's, as the original's `data-go="contact"`). Photos carry a description of the photo as
 * alt text, not the caption (KI-A13). The link uses the text-safe orange (KI-A11).
 */
export function ArticleBody({ blocks }: { readonly blocks: readonly PostBlock[] }) {
  const { closing } = ARTICLE_PAGE;
  return (
    <div className="mt-32">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
      <p className={PARAGRAPH}>
        {closing.prompt} <ContactLink className="text-kicker underline">{closing.link}</ContactLink>
        .
      </p>
    </div>
  );
}
