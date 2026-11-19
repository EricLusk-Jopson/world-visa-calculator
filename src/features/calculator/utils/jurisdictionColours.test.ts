import { describe, it, expect } from "vitest";
import {
  JURISDICTION_PALETTE,
  nextFreeJurisdictionColor,
} from "./jurisdictionColours";

describe("nextFreeJurisdictionColor", () => {
  it("hands out colours in palette order, reusing freed ones", () => {
    expect(nextFreeJurisdictionColor([])).toBe(JURISDICTION_PALETTE[0]);
    expect(nextFreeJurisdictionColor([JURISDICTION_PALETTE[0], JURISDICTION_PALETTE[2]])).toBe(
      JURISDICTION_PALETTE[1],
    );
  });

  it("allows four destinations, then none", () => {
    expect(JURISDICTION_PALETTE).toHaveLength(4);
    expect(nextFreeJurisdictionColor([...JURISDICTION_PALETTE])).toBeNull();
  });
});

