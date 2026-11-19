"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { useId, useState } from "react";

import { StartProjectTrigger } from "@/components/shell/start-project-trigger";
import type { ServiceOption } from "@/content/services";
import { cn } from "@/lib/cn";

import { ContactButton } from "./contact-link";

/**
 * Optional link under an answer. Either a real URL, or an action: `contact` goes to the page's
 * enquiry form, `popup` opens Start-a-Project. Never the original's `href="contact"` (KI-F07).
 */
export type FaqLink =
  | { readonly label: string; readonly href: string }
  | {
      readonly label: string;
      readonly action: "contact" | "popup";
      readonly service?: ServiceOption;
    };

/** A run of answer text, or an inline link inside it (the original's underlined `<a>` in `.qb p`). */
export type FaqAnswerPart = string | { readonly label: string; readonly href: string };

export type FaqItem = {
  readonly question: string;
  /** Plain text, or text with inline links. */
  readonly answer: string | readonly FaqAnswerPart[];
  readonly link?: FaqLink;
};

/**
 * Where the accordion sits:
 * - `combo`: right column of `ContactFaq` (`.contact.combo .kc-r`), light or dark by tone;
 * - `section`: the standalone white FAQ section (`.ks.kfaq-sec`).
 */
export type FaqContext = "combo" | "section";

/** `home` swaps Inter for Jost, as the home page's type system does. */
export type FaqTypography = "standard" | "home";

const itemVariants = cva("border-b first:border-t", {
  variants: {
    context: {
      combo: "border-[#d9d9d9] in-data-[tone=dark]:border-[#262626]",
      section: "border-[#e8e5df]",
    },
  },
});

const questionVariants = cva(
  "flex w-full cursor-pointer items-center justify-between gap-32 text-left font-normal transition-colors duration-200 hover:text-brand",
  {
    variants: {
      context: {
        combo: "py-17 text-[15.5px] leading-[1.45] text-black in-data-[tone=dark]:text-white",
        section: "py-26 text-[17px] leading-[1.45] text-ink-2",
      },
      typography: { standard: "font-sans", home: "font-display" },
    },
    compoundVariants: [
      // Inner pages enlarge the combo questions below 1100px; home keeps the canvas size.
      {
        context: "combo",
        typography: "standard",
        className: "max-lg:py-24 max-lg:text-[16.5px]",
      },
    ],
  },
);

const answerVariants = cva("", {
  variants: {
    context: {
      combo: "text-[#656565] in-data-[tone=dark]:text-[#9a9a9a]",
      section: "text-[#666]",
    },
    typography: {
      standard: "font-sans text-[14px] leading-[1.85]",
      home: "font-display text-[14.5px] leading-[1.7]",
    },
  },
});

const linkVariants = cva(
  "mt-10 inline-block cursor-pointer border-b transition-colors duration-200 hover:border-brand hover:text-brand",
  {
    variants: {
      context: {
        combo:
          "border-[#bbb] text-black in-data-[tone=dark]:border-[#444] in-data-[tone=dark]:text-white",
        section: "border-[#ccc] text-ink-2",
      },
      typography: {
        standard: "font-sans text-[12px] font-medium",
        home: "font-display text-[11.5px] font-medium tracking-[0.14em] uppercase",
      },
    },
  },
);

type FaqProps = {
  readonly items: readonly FaqItem[];
  readonly context?: FaqContext;
  readonly typography?: FaqTypography;
  readonly className?: string;
};

/**
 * FAQ accordion (`.faq.kfaq`): one answer open at a time, the first open initially. Questions are
 * real buttons with `aria-expanded`/`aria-controls`; answers are labelled regions. The panel height
 * animates over .35s via grid rows (no fixed max-height, so long answers never clip), and a
 * collapsed answer is `visibility: hidden` once closed: out of the tab order and the accessibility
 * tree (KI-A09). The "+" turns into "×" by rotating 45° (.3s).
 */
export function Faq({ items, context = "combo", typography = "standard", className }: FaqProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={className}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const buttonId = `${baseId}-q${index}`;
        const panelId = `${baseId}-a${index}`;
        return (
          <div
            key={item.question}
            data-open={open || undefined}
            className={itemVariants({ context })}
          >
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className={questionVariants({ context, typography })}
              >
                {item.question}
                <PlusIcon open={open} />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn(
                "grid transition-[grid-template-rows,visibility] duration-350 ease-[ease]",
                open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="pr-60 pb-26">
                  <p className={answerVariants({ context, typography })}>
                    <AnswerText answer={item.answer} />
                  </p>
                  {item.link ? (
                    <AnswerLink
                      link={item.link}
                      className={linkVariants({ context, typography })}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AnswerText({ answer }: { answer: FaqItem["answer"] }) {
  if (typeof answer === "string") return answer;
  return answer.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <Link
        // Parts are static content; their order never changes.
        key={index}
        href={part.href}
        className="underline transition-colors duration-200 hover:text-brand"
      >
        {part.label}
      </Link>
    ),
  );
}

/** 14px "+" drawn with two 1.2px bars; rotates 45° into "×" when open. */
function PlusIcon({ open }: { open: boolean }) {
  return (
    <i
      aria-hidden
      className={cn(
        "relative size-14 flex-none transition-transform duration-300",
        "before:absolute before:inset-x-0 before:top-[6.5px] before:h-[1.2px] before:bg-current before:content-['']",
        "after:absolute after:inset-x-0 after:top-[6.5px] after:h-[1.2px] after:[transform:rotate(90deg)] after:bg-current after:content-['']",
        open && "[transform:rotate(45deg)]",
      )}
    />
  );
}

function AnswerLink({ link, className }: { link: FaqLink; className: string }) {
  const label = (
    <>
      {link.label} <span aria-hidden>↗</span>
    </>
  );
  if ("href" in link) {
    return (
      <Link href={link.href} className={className}>
        {label}
      </Link>
    );
  }
  const Trigger = link.action === "popup" ? StartProjectTrigger : ContactButton;
  return (
    <Trigger {...(link.service ? { service: link.service } : {})} className={className}>
      {label}
    </Trigger>
  );
}
