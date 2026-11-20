import { z } from "zod";

import { hrefSchema, list, serviceIconSchema, titleLinesSchema } from "./primitives";

/**
 * The thank-you page (`GET /pages/thank-you`, `#p-thank-you`): where the enquiry form and the
 * Start-a-Project popup continue after sending. The labels that depend on the enquiry just sent
 * are filled in from the remembered lead (`src/lib/leads/thank-you.ts`).
 */

/** A "next steps" tile (`.kfeat.grid3`, no 3D icons). */
export const thankYouStepSchema = z.object({
  icon: serviceIconSchema,
  title: z.string(),
  text: z.string(),
});
export type ThankYouStep = z.infer<typeof thankYouStepSchema>;

export const thankYouContentSchema = z.object({
  title: titleLinesSchema,
  lead: z.string(),
  sourceLabel: z.string(),
  serviceLabel: z.string(),
  steps: list(thankYouStepSchema),
  /**
   * Shown when the enquiry could not be delivered (`/api/leads` failed or is not configured).
   */
  fallback: z.object({
    message: z.string(),
    email: z.string(),
    copy: z.string(),
    copied: z.string(),
  }),
  whatsapp: z.string(),
  back: z.string(),
  projects: z.object({ label: z.string(), href: hrefSchema }),
});
export type ThankYouContent = z.infer<typeof thankYouContentSchema>;

/** The `/pages/thank-you` resource: the copy and its `data-title` / `data-desc`. */
export const thankYouPageSchema = thankYouContentSchema.extend({
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type ThankYouPage = z.infer<typeof thankYouPageSchema>;
