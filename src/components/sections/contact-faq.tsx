import { cva } from "class-variance-authority";
import { Fragment, type ReactNode } from "react";

import { Reveal, type RevealVariant } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Accent } from "@/components/ui/heading";
import { Kicker } from "@/components/ui/kicker";
import { Plant } from "@/components/ui/plant";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import type { Tone } from "@/lib/tone";

import { CONTACT_CHANNELS, type ContactChannel } from "./contact-channels";
import { ContactButton } from "./contact-link";
import { plantReserveStyle, type PlantSpec } from "./content-section";
import { EnquiryForm, type EnquiryFormConfig } from "./enquiry-form";
import { Faq, type FaqItem, type FaqTypography } from "./faq";

export type { ContactChannel } from "./contact-channels";
export type { EnquiryFormConfig } from "./enquiry-form";
export type { FaqItem, FaqLink } from "./faq";

/** FAQ block content (`.kfq-h` + `.faq`). */
export type FaqContent = {
  readonly kicker: string;
  /** Title lines (the original's `<br>` breaks). */
  readonly titleLines: readonly string[];
  /**
   * Intro copy and "Ask us directly" link. Authored in the original but removed at runtime, so
   * page data omits them for parity; they render when provided (KI-C12).
   */
  readonly intro?: string;
  readonly askLabel?: string;
  readonly items: readonly FaqItem[];
};

export type ContactFaqProps = {
  /** Light when the section above is dark, dark otherwise (the page decides). */
  readonly tone: Tone;
  /** `<slug>-contact` on inner pages, `start` on home (original ids). */
  readonly id: string;
  /** Eyebrow with the orange dot (`.gt`). */
  readonly kicker?: string;
  /** Heading lines; `accent` is an extra orange last line. */
  readonly heading: { readonly lines: readonly string[]; readonly accent?: string };
  readonly lead: string;
  /** Contact info row; home shows email and phone only. */
  readonly channels?: readonly ContactChannel[];
  readonly form: EnquiryFormConfig;
  readonly faq: FaqContent;
  /** Decorative plant behind the content (`.pp-host`). */
  readonly plant?: PlantSpec;
  /**
   * `home` = the home page's type system (Jost 500 uppercase heading, Jost FAQ) and its compact
   * sizes, which home keeps at every width (inner pages enlarge the form and FAQ below 1100px).
   */
  readonly typography?: FaqTypography;
  /** Reveal-on-scroll as on the original home page (`.contact .gt/h2/.lead/.ci`, `.form .f/.send`). */
  readonly reveal?: boolean;
  /** Section rhythm; defaults to `home` (104/36) with home typography, else `standard` (120/80). */
  readonly spacing?: "standard" | "home";
  readonly className?: string;
};

const DEFAULT_CHANNELS: readonly ContactChannel[] = ["email", "phone", "whatsapp"];

const headingVariants = cva("font-display text-black in-data-[tone=dark]:text-white", {
  variants: {
    typography: {
      standard:
        "mt-14 mb-14 text-[44px] leading-none font-bold tracking-[0.005em] max-lg:mt-20 max-lg:mb-22 max-lg:text-[54px] max-md:text-[38px]",
      home: "mt-14 mb-14 text-[40px] leading-[1.05] font-medium uppercase max-md:text-[30px]",
    },
  },
});

const leadVariants = cva(
  "max-w-520 font-display text-[rgba(0,0,0,0.82)] in-data-[tone=dark]:text-[rgba(255,255,255,0.82)]",
  {
    variants: {
      typography: {
        standard: "text-[13.5px] leading-[1.7] max-lg:text-[15px] max-lg:leading-[1.85]",
        home: "text-[15px] leading-[1.75]",
      },
    },
  },
);

const faqKickerVariants = cva("", {
  variants: {
    typography: {
      standard: "text-black in-data-[tone=dark]:text-kicker",
      /** Text-safe orange on white, brand orange on black (KI-A11), like every other kicker. */
      home: "text-kicker",
    },
  },
});

const faqTitleVariants = cva(
  "mt-14 mb-22 font-display text-black uppercase in-data-[tone=dark]:text-white",
  {
    variants: {
      typography: {
        standard:
          "text-[36px] leading-[1.1] font-bold tracking-[0.005em] max-lg:mt-20 max-lg:mb-36 max-lg:text-[40px] max-md:text-[34px]",
        home: "text-[40px] leading-[1.05] font-medium max-md:text-[30px]",
      },
    },
  },
);

/**
 * Contact + FAQ section (`.contact.combo`, the original merges the two at runtime): intro, contact
 * info and the inline `EnquiryForm` on the left, the FAQ accordion on the right. Two equal columns
 * 96px apart on the canvas; one column with a 64px gap below 1100px.
 *
 * Tone: light (white, black type, light-grey fields) when preceded by a dark section, dark (black,
 * white type, warm-white fields) otherwise. Exception: the dark FAQ kicker uses the brand orange
 * instead of the original's #C24E1E, which fails contrast on black, and the home FAQ kicker uses
 * the text-safe orange on white instead of the rendered #E8622C (KI-A11).
 *
 * `typography="home"` also keeps the canvas sizes below 1100px (headings, contact info, form
 * fields and gaps, FAQ questions), as the original's home overrides do, and defaults the rhythm to
 * the home one (104/36 at every width).
 *
 * `[data-contact-section]` makes it the target of "go to contact" (`useContactScroll`).
 */
export function ContactFaq({
  tone,
  id,
  kicker = "Start your project",
  heading,
  lead,
  channels = DEFAULT_CHANNELS,
  form,
  faq,
  plant,
  typography = "standard",
  reveal = false,
  spacing = typography === "home" ? "home" : "standard",
  className,
}: ContactFaqProps) {
  return (
    <Section
      tone={tone}
      id={id}
      spacing={spacing}
      data-contact-section=""
      style={plant ? plantReserveStyle(plant) : undefined}
      className={cn(plant && "isolate max-md:pb-[calc(80px+var(--plant-reserve))]", className)}
    >
      {plant ? <Plant {...plant} behind className="opacity-90" /> : null}
      <Container className="grid grid-cols-2 items-start gap-96 max-lg:grid-cols-1 max-lg:gap-64">
        <div>
          <MaybeReveal enabled={reveal}>
            <p className="flex items-center gap-10 font-display text-[12px] font-normal text-[#222] before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-[''] in-data-[tone=dark]:text-[#ddd]">
              {kicker}
            </p>
          </MaybeReveal>
          <MaybeReveal enabled={reveal} variant="clip">
            <h2 className={headingVariants({ typography })}>
              {heading.lines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
              {heading.accent ? (
                <>
                  <br />
                  <Accent>{heading.accent}</Accent>
                </>
              ) : null}
            </h2>
          </MaybeReveal>
          <MaybeReveal enabled={reveal}>
            <p className={leadVariants({ typography })}>{lead}</p>
          </MaybeReveal>
          <MaybeReveal enabled={reveal}>
            <ContactInfo channels={channels} typography={typography} />
          </MaybeReveal>
          <EnquiryForm {...form} typography={typography} reveal={reveal} />
        </div>

        <div>
          <Kicker
            font={typography === "home" ? "home" : "sans"}
            className={faqKickerVariants({ typography })}
          >
            {faq.kicker}
          </Kicker>
          <MaybeReveal enabled={reveal} variant="clip" index={1}>
            <h2 className={faqTitleVariants({ typography })}>
              {faq.titleLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </Fragment>
              ))}
            </h2>
          </MaybeReveal>
          <FaqIntro faq={faq} className="-mt-8 mb-28" />
          <Faq items={faq.items} context="combo" typography={typography} />
        </div>
      </Container>
    </Section>
  );
}

/**
 * Email / phone / WhatsApp as a definition list. On the canvas the terms and values flow in one
 * wrapping row exactly like the original; on phones they become a two-column list with labels
 * baseline-aligned to their values (KI-L11).
 */
function ContactInfo({
  channels,
  typography,
}: {
  channels: readonly ContactChannel[];
  typography: FaqTypography;
}) {
  return (
    <dl
      className={cn(
        "mt-16 flex flex-wrap gap-40 font-display text-[12px] text-[#333] in-data-[tone=dark]:text-[#ccc]",
        typography === "standard" && "max-lg:mt-28",
        "max-md:grid max-md:grid-cols-[auto_minmax(0,1fr)] max-md:items-baseline max-md:gap-x-20 max-md:gap-y-14",
      )}
    >
      {channels.map((channel) => {
        const { term, href, text, external } = CONTACT_CHANNELS[channel];
        return (
          <div key={channel} className="contents">
            <dt>{term}</dt>
            <dd className="mt-2 text-[15px] font-medium text-black in-data-[tone=dark]:text-white max-md:mt-0">
              <a
                href={href}
                className="text-[14px] transition-colors duration-200 hover:text-brand max-lg:text-[15px]"
                {...(external ? { target: "_blank", rel: "noopener" } : {})}
              >
                {text}
              </a>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function FaqIntro({ faq, className }: { faq: FaqContent; className?: string }) {
  if (!faq.intro && !faq.askLabel) return null;
  return (
    <div className={className}>
      {faq.intro ? (
        <p className="max-w-320 font-sans text-[14px] leading-[1.8] text-[#777] in-data-[tone=dark]:text-[#aaa]">
          {faq.intro}
        </p>
      ) : null}
      {faq.askLabel ? (
        <ContactButton className="mt-18 inline-block cursor-pointer border-b border-current pb-3 font-sans text-[13px] font-medium text-fg transition-colors duration-200 hover:text-brand">
          {faq.askLabel}
        </ContactButton>
      ) : null}
    </div>
  );
}

type FaqSectionProps = {
  readonly faq: FaqContent;
  readonly id?: string;
  readonly className?: string;
};

/**
 * Standalone FAQ section (`.ks.kfaq-sec`, always white): sticky header column (400px) beside the
 * accordion, one column below 1100px. On service pages the original folds it into the contact
 * section (`ContactFaq`); this keeps the block available on its own.
 */
export function FaqSection({ faq, id, className }: FaqSectionProps) {
  return (
    <Section tone="light" id={id} className={className}>
      <Container className="grid grid-cols-[400px_minmax(0,1fr)] items-start gap-96 max-lg:grid-cols-1 max-lg:gap-40">
        <div className="sticky top-120 max-lg:static">
          <Kicker className="max-md:text-[9.5px]">{faq.kicker}</Kicker>
          <h2 className="mt-20 font-display text-[46px] leading-[1.1] font-bold tracking-[0.005em] text-ink-2 uppercase max-md:text-[34px]">
            {faq.titleLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </h2>
          <FaqIntro faq={faq} className="mt-22" />
        </div>
        <Faq items={faq.items} context="section" />
      </Container>
    </Section>
  );
}

/** Wraps children in `Reveal` only when enabled, so inner pages keep their plain markup. */
function MaybeReveal({
  enabled,
  variant,
  index,
  children,
}: {
  enabled: boolean;
  variant?: RevealVariant;
  index?: number;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <Reveal variant={variant} index={index}>
      {children}
    </Reveal>
  );
}
