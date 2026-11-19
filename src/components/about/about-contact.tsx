import { Fragment } from "react";

import type { ContactChannel } from "@/components/sections/contact-faq";
import { EnquiryForm } from "@/components/sections/enquiry-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ABOUT_CONTACT, type AboutContactContent } from "@/content/about";
import { SITE, whatsappUrl } from "@/content/site";

/**
 * Field sizes of the plain contact form on the canvas (46px fields, 108px message, 9px under the
 * labels, 20 / 18px gaps, dark "Send Enquiry" label). The shared `EnquiryForm` is sized for the
 * contact + FAQ combo; it already uses these sizes below 1100px.
 */
const PLAIN_FORM =
  "mt-0 gap-x-18 gap-y-20 max-lg:mt-0 [&_input]:h-46 [&_label]:mb-9 [&_select]:h-46 [&_textarea]:h-108 [&>p:last-child]:text-[#666] [&_button[type=submit]]:text-ink-2";

type AboutContactProps = {
  readonly content?: AboutContactContent;
};

/**
 * About contact (`section.contact#about-contact`): the original's CONTACT template without a FAQ
 * (only pages with a FAQ get the `.contact.combo` layout, `ContactFaq`). White. The intro, a 54px
 * heading, the lead and the email / phone list on the left, the inline `EnquiryForm` in a 640px
 * column on the right; two equal columns below 1100px and one on phones.
 *
 * `[data-contact-section]` makes it the target of "go to contact" on this page.
 */
export function AboutContact({ content = ABOUT_CONTACT }: AboutContactProps) {
  const titleId = "about-contact-title";
  const channels: Record<ContactChannel, { term: string; href: string; text: string }> = {
    email: { term: "Email", href: `mailto:${SITE.email}`, text: SITE.email },
    phone: { term: "Phone", href: SITE.phone.href, text: SITE.phone.display },
    whatsapp: { term: "WhatsApp", href: whatsappUrl(), text: "Chat with our team" },
  };
  return (
    <Section tone="light" id="about-contact" data-contact-section="" aria-labelledby={titleId}>
      <Container className="grid grid-cols-[1fr_640px] gap-40 max-lg:grid-cols-2 max-md:grid-cols-1">
        <div>
          <p className="flex items-center gap-10 font-display text-[12px] text-black before:size-5 before:flex-none before:rounded-full before:bg-brand before:content-['']">
            {content.kicker}
          </p>
          <h2
            id={titleId}
            className="mt-22 mb-28 font-display text-[54px] leading-none font-bold tracking-[0.005em] text-black max-md:text-[38px]"
          >
            {content.heading.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </h2>
          <p className="max-w-430 font-display text-[15px] leading-[1.85] text-[#555]">
            {content.lead}
          </p>
          <dl className="mt-66 font-display text-[12px] text-[#666]">
            {content.channels.map((channel) => {
              const { term, href, text } = channels[channel];
              return (
                <Fragment key={channel}>
                  <dt>{term}</dt>
                  <dd className="mt-2 mb-18 text-[15px] font-medium">
                    <a
                      href={href}
                      className="transition-colors duration-200 hover:text-brand"
                      {...(channel === "whatsapp" ? { target: "_blank", rel: "noopener" } : {})}
                    >
                      {text}
                    </a>
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </div>
        <EnquiryForm {...content.form} className={PLAIN_FORM} />
      </Container>
    </Section>
  );
}
