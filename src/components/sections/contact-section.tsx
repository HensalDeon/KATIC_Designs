import { Fragment } from "react";

import { Container } from "@/components/ui/container";
import { Accent } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/cn";
import { getContactTemplate, getSite } from "@/lib/data";
import type { Tone } from "@/lib/tone";

import { type ContactChannel, contactChannels } from "./contact-channels";
import { EnquiryForm, type EnquiryFormConfig } from "./enquiry-form";

/** Copy of the CONTACT template (plain data: will come from Laravel). */
export type ContactSectionContent = {
  /** Eyebrow with the orange dot (`.gt`). */
  readonly kicker: string;
  /**
   * Heading lines (the original's `<br>` breaks); `accent` is an orange last line (`.or`), e.g.
   * India's "in India" and Dubai's "in Dubai or India".
   */
  readonly heading: { readonly lines: readonly string[]; readonly accent?: string };
  readonly lead: string;
  readonly channels: readonly ContactChannel[];
  readonly form: EnquiryFormConfig;
};

/**
 * Text colours on white. `template` = the CONTACT template (About); `local` = a page's own
 * `section.contact` markup as the original renders it on white (Dubai, `data-fx=169`): a darker
 * eyebrow, lead and channel labels, and the light Send label. Black sections share one palette.
 */
export type ContactSectionColors = "template" | "local";

const LIGHT_COLORS = {
  template: { kicker: "text-black", lead: "text-[#555]", channels: "text-[#666]" },
  local: { kicker: "text-[#222]", lead: "text-[rgba(0,0,0,0.82)]", channels: "text-[#333]" },
} as const satisfies Record<ContactSectionColors, Record<string, string>>;

type ContactSectionProps = {
  /** `<page>-contact` (original ids: `about-contact`, `services-contact`, …). */
  readonly id: string;
  /** The original renders it white on About and black on Services (analysis/02 §0). */
  readonly tone: Tone;
  /** Defaults to the shared CONTACT template (`getContactTemplate()`). */
  readonly content?: ContactSectionContent;
  readonly colors?: ContactSectionColors;
};

/**
 * The original's CONTACT template on pages without a FAQ (`section.contact`; pages with a FAQ use
 * `ContactFaq`), and the page-local contact sections built on the same markup (Dubai). Intro, 54px
 * heading, lead and the channel list on the left; the inline `EnquiryForm` in a 640px column on
 * the right; two equal columns below 1100px, one on phones.
 *
 * `[data-contact-section]` makes it the target of "go to contact" on its page (`useContactScroll`).
 * The channels' addresses come from the site settings.
 */
export async function ContactSection({
  id,
  tone,
  content,
  colors = "template",
}: ContactSectionProps) {
  const [template, site] = await Promise.all([content ?? getContactTemplate(), getSite()]);
  return <ContactSectionView id={id} tone={tone} content={template} colors={colors} site={site} />;
}

function ContactSectionView({
  id,
  tone,
  content,
  colors,
  site,
}: Required<ContactSectionProps> & { readonly site: Parameters<typeof contactChannels>[0] }) {
  const channelEntries = contactChannels(site);
  const titleId = `${id}-title`;
  const light = LIGHT_COLORS[colors];
  return (
    <Section tone={tone} id={id} data-contact-section="" aria-labelledby={titleId}>
      <Container className="grid grid-cols-[minmax(0,1fr)_640px] gap-40 max-lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-md:grid-cols-[minmax(0,1fr)]">
        <div>
          <p
            className={cn(
              "flex items-center gap-10 font-display text-[12px] before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-[''] in-data-[tone=dark]:text-[#ddd]",
              light.kicker,
            )}
          >
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
            {content.heading.accent ? (
              <>
                <br />
                <Accent>{content.heading.accent}</Accent>
              </>
            ) : null}
          </h2>
          <p
            className={cn(
              "max-w-430 font-display text-[15px] leading-[1.85] in-data-[tone=dark]:text-[rgba(255,255,255,0.82)]",
              light.lead,
            )}
          >
            {content.lead}
          </p>
          <dl
            className={cn(
              "mt-66 font-display text-[12px] in-data-[tone=dark]:text-[#ccc]",
              light.channels,
            )}
          >
            {content.channels.map((channel) => {
              const { term, href, text, external } = channelEntries[channel];
              return (
                <Fragment key={channel}>
                  <dt>{term}</dt>
                  <dd className="mt-2 mb-18 text-[15px] font-medium text-black in-data-[tone=dark]:text-white">
                    <a
                      href={href}
                      className="transition-colors duration-200 hover:text-kicker"
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
        <EnquiryForm {...content.form} typography={colors === "local" ? "local" : "plain"} />
      </Container>
    </Section>
  );
}
