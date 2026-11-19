import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { iconArt, stageArt } from "@/lib/art";

import { DrawOn } from "./draw-on";
import { IsoArt } from "./iso-art";

const count = (html: string, re: RegExp) => html.match(re)?.length ?? 0;

describe("IsoArt", () => {
  it("renders every stage path with pathLength=1 and the lit windows", () => {
    const html = renderToStaticMarkup(<IsoArt kind="stage" index={6} />);
    const art = stageArt(6);
    expect(html).toContain('viewBox="0 0 292 200"');
    expect(html).toContain('preserveAspectRatio="xMidYMid slice"');
    expect(count(html, /<path /g)).toBe(art.paths.length);
    expect(count(html, /pathLength="1"/g)).toBe(art.paths.length);
    expect(count(html, /<polygon /g)).toBe(2);
    expect(html).not.toContain("id=");
  });

  it("marks dashed construction lines", () => {
    const html = renderToStaticMarkup(<IsoArt kind="icon" name="lamp" />);
    const dashed = iconArt("lamp").paths.filter((p) => p.dashed).length;
    expect(dashed).toBeGreaterThan(0);
    expect(count(html, /stroke-dasharray:\.035_\.035/g)).toBe(dashed);
    expect(html).toContain('viewBox="0 0 292 180"');
  });

  it("passes order, drawn and className through to the box", () => {
    const html = renderToStaticMarkup(
      <IsoArt kind="icon" name="house" order={3} drawn className="h-120" />,
    );
    expect(html).toMatch(
      /^<div aria-hidden="true" data-iso-art="(icon|stage)" data-drawn="" style="--iso-order:3"/,
    );
    expect(html).toContain("h-120");
    expect(html).not.toContain("h-150");
  });
});

describe("DrawOn", () => {
  it("server-renders undrawn, with the stagger variable", () => {
    const html = renderToStaticMarkup(
      <DrawOn stagger={140} className="grid">
        <span />
      </DrawOn>,
    );
    expect(html).toBe('<div style="--draw-stagger:140ms" class="grid"><span></span></div>');
  });
});
