import type { Office, SiteContact, SiteSeo, SiteSettings } from "@/lib/schemas/site";

/**
 * Site-wide settings. Served as one resource (`GET /settings`, `ContentRepository.getSite()`); the
 * types are the schemas' (`src/lib/schemas/site.ts`).
 *
 * PLACEHOLDERS: phone, WhatsApp, address and social URLs are the original site's placeholders
 * (KI-C01, KI-C02, KI-C03). Replace them here once the client confirms the real values.
 */
export const SITE = {
  name: "Katic Designs",
  email: "hello@katicdesigns.com",
  phone: { display: "+1 (000) 000-0000", href: "tel:+10000000000" },
  whatsapp: { number: "10000000000" },
  address: {
    lines: ["Katic Designs Studio", "14 Ridgeline Road", "Countryside District", "400001"],
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Katic+Designs+Kochi",
  },
  socials: [
    { network: "instagram", label: "Instagram", url: "https://www.instagram.com/" },
    { network: "facebook", label: "Facebook", url: "https://www.facebook.com/" },
    { network: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { network: "x", label: "X", url: "https://x.com/" },
  ],
  credit: { label: "crafted@ateliergroupcompany", url: "https://ateliergroupcompany.com/" },
} as const satisfies SiteContact;

/**
 * Home page SEO (the original's `<head>` and `#p-home` `data-title` / `data-desc`) and the site's
 * default share image. The original referenced `/og-image.jpg` but never shipped it (KI-S03); the
 * file is now a 1200×630 crop of The Courtyard House hero, under the original's alt text.
 */
export const SITE_SEO = {
  title: "Architects, Interior Designers & Builders in Kochi, Kerala | Katic Designs",
  description:
    "Katic Designs is an architecture, interior design and construction studio in Kochi, Kerala and Dubai. Design, build, turnkey homes and property care under one roof.",
  locale: "en_IN",
  language: "en",
  /** `meta[name=geo.*]` of the original. */
  geo: { region: "IN-KL", placename: "Kochi" },
  /** The original's Organization JSON-LD; About says "Founded in 2013 in Kochi". */
  foundingDate: "2013",
  /** `areaServed` of the original's Organization JSON-LD. */
  areaServed: ["Kerala", "South India", "Dubai", "United Arab Emirates"],
  ogImage: {
    path: "/og-image.jpg",
    width: 1200,
    height: 630,
    alt: "Courtyard home designed and built by Katic Designs in Kochi, Kerala",
  },
} as const satisfies SiteSeo;

const MON_FRI = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

/**
 * The two offices as structured data (the original's `HomeAndConstructionBusiness` JSON-LD). Only
 * confirmed facts: street addresses and phone numbers are still placeholders (KI-C01, KI-C02,
 * KI-C04), so they are left out rather than published to search engines.
 */
export const OFFICES = {
  // TODO(content): KI-C02 street address and postcode, KI-C01 phone; add them once confirmed.
  kochi: {
    id: "kochi",
    name: "Katic Designs — Kochi",
    email: SITE.email,
    address: { locality: "Kochi", region: "Kerala", country: "IN" },
    // "Mon–Sat, 9:30 AM–6:30 PM IST" (thank-you, works CTA; the original's JSON-LD).
    hours: { days: [...MON_FRI, "Saturday"], opens: "09:30", closes: "18:30" },
  },
  // TODO(content): KI-C04 street address ("Business Bay" is shown as a placeholder) and phone.
  dubai: {
    id: "dubai",
    name: "Katic Designs — Dubai",
    email: "dubai@katicdesigns.com",
    address: { locality: "Dubai", country: "AE" },
    // "Mon–Fri · 9:00 AM–6:00 PM GST" (Dubai office block).
    hours: { days: MON_FRI, opens: "09:00", closes: "18:00" },
  },
} as const satisfies { readonly [K in Office["id"]]: Office & { readonly id: K } };

/** The `/settings` resource as the static repository serves it. */
export const SITE_SETTINGS = {
  ...SITE,
  seo: SITE_SEO,
  offices: OFFICES,
} as const satisfies SiteSettings;
