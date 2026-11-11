/**
 * How timeline markers are labelled and kept from overprinting each other.
 *
 * Each chip names its destination in plain text ("Türkiye 90d") — green/amber
 * is the only colour a chip carries, and it means how long a stay is possible.
 */

import { VISA_REGION_LABELS, VisaRegion } from "@/types";

/** Names short enough for a marker chip; everything else uses its label. */
const SHORT_NAMES: Partial<Record<VisaRegion, string>> = {
  [VisaRegion.Schengen]: "Schengen",
  [VisaRegion.Bosnia]: "Bosnia",
  [VisaRegion.NorthMacedonia]: "N. Macedonia",
  [VisaRegion.UnitedKingdom]: "UK",
};

/** Destination name as it reads on a chip and mid-sentence ("a 45d Schengen trip"). */
export function regionMarkerName(region: VisaRegion): string {
  return SHORT_NAMES[region] ?? VISA_REGION_LABELS[region];
}

/**
 * Horizontal slots for chips that would otherwise sit on top of each other
 * (two destinations' markers on nearby dates). Greedy: each chip, in top
 * order, takes the lowest slot whose previous chip is at least `minGap`
 * pixels above it. Returns one slot index per input, in input order.
 */
export function assignChipSlots(tops: number[], minGap: number): number[] {
  const order = tops.map((top, i) => ({ top, i })).sort((a, b) => a.top - b.top);
  const lastTopBySlot: number[] = [];
  const slots = new Array<number>(tops.length);
  for (const { top, i } of order) {
    let slot = lastTopBySlot.findIndex((last) => top - last >= minGap);
    if (slot === -1) slot = lastTopBySlot.length;
    lastTopBySlot[slot] = top;
    slots[i] = slot;
  }
  return slots;
}
