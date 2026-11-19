import { describe, expect, it } from "vitest";

import { alternatingTone } from "./tone";

describe("alternatingTone", () => {
  it("alternates starting from light by default", () => {
    expect([0, 1, 2, 3].map((i) => alternatingTone(i))).toEqual(["light", "dark", "light", "dark"]);
  });

  it("can start from dark", () => {
    expect([0, 1, 2].map((i) => alternatingTone(i, "dark"))).toEqual(["dark", "light", "dark"]);
  });
});
