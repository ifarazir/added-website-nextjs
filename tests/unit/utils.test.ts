import { describe, expect, it } from "vitest";

import { pad2, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Modular Shelf")).toBe("modular-shelf");
  });

  it("collapses punctuation and runs of separators", () => {
    expect(slugify("Stools  &  Benches")).toBe("stools-benches");
    expect(slugify("St. Table —  2026")).toBe("st-table-2026");
  });

  it("drops leading and trailing separators", () => {
    expect(slugify("  --Donut--  ")).toBe("donut");
  });

  it("returns an empty string when nothing survives", () => {
    // The product form falls back to a placeholder when this happens, so an
    // all-punctuation name must not produce a slug of stray hyphens.
    expect(slugify("!!!")).toBe("");
    expect(slugify("1/4")).toBe("1-4");
  });

  it("stays within the column length", () => {
    expect(slugify("x".repeat(400)).length).toBeLessThanOrEqual(120);
  });
});

describe("pad2", () => {
  it("pads single digits", () => {
    expect(pad2(1)).toBe("01");
    expect(pad2(14)).toBe("14");
  });

  it("leaves longer numbers alone", () => {
    expect(pad2(100)).toBe("100");
  });
});
