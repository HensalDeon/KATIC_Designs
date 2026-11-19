import { Fragment } from "react";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CONTACT_TEMPLATE } from "@/content/contact";
import type { Tone } from "@/lib/tone";

import { CONTACT_CHANNELS, type ContactChannel } from "./contact-channels";
import { EnquiryForm, type EnquiryFormConfig } from "./enquiry-form";

/** Copy of the CONTACT template (plain data: will come from Laravel). */
export type ContactSectionContent = {
  /** Eyebrow with the orange dot (`.gt`). */
  readonly kicker: string;
  /** Heading lines (the original's `<br>` breaks). */
  readonly heading: { readonly lines: readonly string[] };
  readonly lead: string;
  readonly channels: readonly ContactChannel[];
  readonly form: EnquiryFormConfig;
};

type ContactSectionProps = {
  /** `<page>-contact` (original ids: `about-contact`, `services-contact`, …). */
  readonly id: string;
  /** The original renders it white on About and black on Services (analysis/02 §0). */
  readonly tone: Tone;
  readonly content?: ContactSectionContent;
};

/**
 * The original's CONTACT template on pages without a FAQ (`section.contact`; pages with a FAQ use
 * `ContactFaq`). Intro, 54px heading, lead and the email / phone list on the left; the inline
 * `EnquiryForm` in a 640px column on the right; two equal columns below 1100px, one on phones.
 *
 * `[data-contact-section]` makes it the target of "go to contact" on its page (`useContactScroll`).
 */
export function ContactSection({ id, tone, content = CONTACT_TEMPLATE }: ContactSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section tone={tone} id={id} data-contact-section="" aria-labelledby={titleId}>
      <Container className="grid grid-cols-[minmax(0,1fr)_640px] gap-40 max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-md:grid-cols-[minmax(0,1fr)]">
        <div>
          <p className="flex items-center gap-10 font-display text-[12px] text-black before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-[''] in-data-[tone=dark]:text-[#ddd]">
            {content.kicker}
          </p>
          <h2
            id={titleId}
            className="mt-22 mb-28 font-display text-[54px] leading-none font-bold tracking-[0.005em] text-black in-data-[tone=dark]:text-white max-md:text-[38px]"
          >
            {content.heading.lines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </h2>
          <p className="max-w-430 font-display text-[15px] leading-[1.85] text-[#555] in-data-[tone=dark]:text-[rgba(255,255,255,0.82)]">
            {content.lead}
          </p>
          <dl className="mt-66 font-display text-[12px] text-[#666] in-data-[tone=dark]:text-[#ccc]">
            {content.channels.map((channel) => {
              const { term, href, text, external } = CONTACT_CHANNELS[channel];
              return (
                <Fragment key={channel}>
                  <dt>{term}</dt>
                  <dd className="mt-2 mb-18 text-[15px] font-medium text-black in-data-[tone=dark]:text-white">
                    <a
                      href={href}
                      className="transition-colors duration-200 hover:text-brand"
                      {...(external ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      {text}
                    </a>
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </div>
        <EnquiryForm {...content.form} typography="plain" />
      </Container>
    </Section>
  );
}
