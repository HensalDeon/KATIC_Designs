import { SITE, whatsappUrl } from "@/content/site";

export type ContactChannel = "email" | "phone" | "whatsapp";

export type ContactChannelEntry = {
  readonly term: string;
  readonly href: string;
  readonly text: string;
  /** Opens in a new tab (WhatsApp). */
  readonly external: boolean;
};

/** Label, link and text of each contact channel listed by the contact sections (`.ci`). */
export const CONTACT_CHANNELS: Readonly<Record<ContactChannel, ContactChannelEntry>> = {
  email: { term: "Email", href: `mailto:${SITE.email}`, text: SITE.email, external: false },
  phone: { term: "Phone", href: SITE.phone.href, text: SITE.phone.display, external: false },
  whatsapp: { term: "WhatsApp", href: whatsappUrl(), text: "Chat with our team", external: true },
};
