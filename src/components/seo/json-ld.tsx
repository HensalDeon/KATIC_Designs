import { type JsonLdDocument, serializeJsonLd } from "@/lib/seo/json-ld";

type JsonLdProps = {
  /** One document, or several rendered as one array (each keeps its own `@context`). */
  readonly data: JsonLdDocument | readonly JsonLdDocument[];
};

/**
 * Structured data as a plain `<script type="application/ld+json">` (Next's JSON-LD guide: data,
 * not executable code, so not `next/script`). Server component; the payload is escaped by
 * `serializeJsonLd`.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
