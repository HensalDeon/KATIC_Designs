import { z } from "zod";

import { hrefSchema, list } from "./primitives";

/**
 * Navigation (`GET /navigation`): the header menu with its dropdowns and the footer link columns.
 * The footer's Address and Contact columns come from the site settings.
 */

export const navLinkSchema = z.object({ label: z.string(), href: hrefSchema });
export type NavLink = z.infer<typeof navLinkSchema>;

/** Header item keys; the active item is derived from the pathname (`activeNavKey`). */
export const navKeySchema = z.enum([
  "home",
  "about",
  "services",
  "projects",
  "divisions",
  "reviews",
  "blogs",
  "location",
]);
export type NavKey = z.infer<typeof navKeySchema>;

export const navDropdownSchema = z.object({
  groups: list(z.object({ label: z.string(), links: list(navLinkSchema) })),
  all: navLinkSchema.exactOptional(),
});
export type NavDropdown = z.infer<typeof navDropdownSchema>;

export const navItemSchema = navLinkSchema.extend({
  key: navKeySchema,
  dropdown: navDropdownSchema.exactOptional(),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const footerColumnSchema = z.object({ title: z.string(), links: list(navLinkSchema) });
export type FooterColumn = z.infer<typeof footerColumnSchema>;

export const navigationSchema = z.object({
  header: list(navItemSchema),
  footer: list(footerColumnSchema),
});
export type Navigation = z.infer<typeof navigationSchema>;
