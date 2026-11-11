/**
 * How markers are labelled and placed in the timeline's marker gutter.
 *
 * Markers live in a dedicated gutter beside the trip cards, so a chip or an
 * age-out label is never drawn underneath a card. Each chip names its
 * destination in plain text ("Türkiye 90d") — green/amber is the only colour
 * a chip carries, and it means how long a stay is possible.
 */

import { VISA_REGION_LABELS, VisaRegion } from "@/types";

/** Names short enough for a gutter chip; everything else uses its label. */
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

export interface GutterItem {
  /** Where the item's first row should be centred: its date's pixel offset. */
  anchor: number;
  /** Rendered height of the item, in px. */
  height: number;
  /** Height of its first row — the row centred on the anchor. */
  firstRowHeight: number;
}

/**
 * Top edge for each gutter item, in input order. Items are placed at their
 * date where possible; one that would overlap the item above it is pushed
 * down just far enough to clear it (by `gap` px), so items on nearby dates
 * stack instead of printing over each other.
 */
export function stackGutterItems(items: GutterItem[], gap: number): number[] {
  const order = items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => a.item.anchor - b.item.anchor);
  const tops = new Array<number>(items.length);
  let nextFree = -Infinity;
  for (const { item, i } of order) {
    const top = Math.max(item.anchor - item.firstRowHeight / 2, nextFree);
    tops[i] = top;
    nextFree = top + item.height + gap;
  }
  return tops;
}
