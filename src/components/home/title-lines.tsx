import { Fragment } from "react";

import { Accent } from "@/components/ui/heading";
import type { RichText, TitleLine } from "@/content/home/hero";

/** Renders authored title lines separated by `<br />`, accent lines in orange (`.or`). */
export function TitleLines({ lines }: { readonly lines: readonly TitleLine[] }) {
  return lines.map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {typeof line === "string" ? line : <Accent>{line.accent}</Accent>}
    </Fragment>
  ));
}

/** Renders a paragraph's runs, bold runs as `<b>` with the given classes. */
export function RichTextRuns({
  runs,
  strongClassName,
}: {
  readonly runs: RichText;
  readonly strongClassName?: string;
}) {
  return runs.map((run, index) =>
    typeof run === "string" ? (
      <Fragment key={index}>{run}</Fragment>
    ) : (
      <b key={index} className={strongClassName}>
        {run.strong}
      </b>
    ),
  );
}
