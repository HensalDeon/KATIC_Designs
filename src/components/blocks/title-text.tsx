import { Fragment } from "react";

import { Accent } from "@/components/ui/heading";
import type { AccentTitle, TitleLines } from "@/content/blocks";

/** Authored title lines separated by `<br />` (the original's `<br>`). */
export function LineBreaks({ lines }: { readonly lines: TitleLines }) {
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

/**
 * A title whose orange accent (`.or`) ends the last line after a space, or forms its own line:
 * `Interiors Made<br>for <span class="or">Everyday Life</span>`.
 */
export function AccentTitleText({ title }: { readonly title: AccentTitle }) {
  const { lines, accent, accentOnNewLine = false } = title;
  const separator = lines.length === 0 ? null : accentOnNewLine ? <br /> : " ";
  return (
    <>
      <LineBreaks lines={lines} />
      {separator}
      <Accent>{accent}</Accent>
    </>
  );
}
