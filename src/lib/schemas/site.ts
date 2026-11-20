import { z } from "zod";

import { hrefSchema, list } from "./primitives";

/**
 * Site settings (`GET /settings`): contact channels, address, socials, the two offices and the
 * site-wide SEO defaults. One resource, cached under the `site` tag.
 *
 * PLACEHOLDERS: phone, WhatsApp, address and social URLs are still the original's placeholders
 * (KI-C01, KI-C02, KI-C03); offices omit unconfirmed street addresses (KI-C04).
 */

export const socialNetworkSchema = z.enum(["instagram", "facebook", "linkedin", "x"]);
export type SocialNetwork = z.infer<typeof socialNetworkSchema>;

export const weekdaySchema = z.enum([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);
export type Weekday = z.infer<typeof weekdaySchema>;

/** 24-hour local time, e.g. `09:30`. */
const clockTime = z.string().regex(/^\d{2}:\d{2}$/);

/** One office as structured data (the original's `HomeAndConstructionBusiness` JSON-LD). */
export const officeSchema = z.object({
  id: z.enum(["kochi", "dubai"]),
  name: z.string(),
  email: z.email(),
  address: z.object({
    locality: z.string(),
    region: z.string().exactOptional(),
    country: z.enum(["IN", "AE"]),
  }),
  /** Opening hours as the site displays them, 24-hour local time. */
  hours: z.object({ days: list(weekdaySchema), opens: clockTime, closes: clockTime }),
});
export type Office = z.infer<typeof officeSchema>;
export type OfficeId = Office["id"];

/** Site-wide SEO defaults (the original's `<head>`) and the default share image. */
export const siteSeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  locale: z.string(),
  language: z.string(),
  /** `meta[name=geo.*]` of the original. */
  geo: z.object({ region: z.string(), placename: z.string() }),
  foundingDate: z.string(),
  areaServed: list(z.string()),
  ogImage: z.object({
    path: z.string().startsWith("/"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string(),
  }),
});
export type SiteSeo = z.infer<typeof siteSeoSchema>;

/** Contact channels, address, socials and footer credit (`SITE`). */
export const siteContactSchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.object({
    display: z.string(),
    href: z.templateLiteral(["tel:", z.string()]),
  }),
  whatsapp: z.object({ number: z.string().regex(/^\d+$/) }),
  address: z.object({ lines: list(z.string()), mapsUrl: z.url() }),
  socials: list(z.object({ network: socialNetworkSchema, label: z.string(), url: z.url() })),
  credit: z.object({ label: z.string(), url: hrefSchema }),
});
export type SiteContact = z.infer<typeof siteContactSchema>;

/** The whole `/settings` resource. */
export const siteSettingsSchema = siteContactSchema.extend({
  seo: siteSeoSchema,
  offices: z.object({ kochi: officeSchema, dubai: officeSchema }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

/** The contact part of the settings (what the shell and client islands need). */
export function siteContact(site: SiteSettings): SiteContact {
  const { name, email, phone, whatsapp, address, socials, credit } = site;
  return { name, email, phone, whatsapp, address, socials, credit };
}
