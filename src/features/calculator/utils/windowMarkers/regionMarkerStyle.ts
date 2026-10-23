/**
 * How a marker says which destination it belongs to.
 *
 * A marker chip already uses colour for meaning: green/amber for how long a
 * stay is possible, grey for an aging-out trip. So the destination is carried
 * by a separate tag inside the chip — a small filled badge holding the
 * country code ("TR", "ME", "AL") in the destination's colour. The code is
 * what identifies the destination; the colour lets the eye group chips of
 * the same destination down the timeline.
 *
 * Twelve-odd destinations can't each get a hue that stays distinct, so
 * colours are handed out per view: the destinations that actually have
 * markers on screen, in canonical order (SUPPORTED_DESTINATIONS), take the
 * palette in turn. Schengen is always first in that order, so it keeps the
 * same blue whenever it appears. The palette avoids the semantic green,
 * amber and red the chips already use.
 */

import {
  SUPPORTED_DESTINATIONS,
  VISA_REGION_LABELS,
  VisaRegion,
} from "@/types";

/** Short destination codes for marker tags (ISO alpha-2 where one exists). */
const REGION_CODES: Partial<Record<VisaRegion, string>> = {
  [VisaRegion.Schengen]: "SCH",
  [VisaRegion.UnitedKingdom]: "UK",
  [VisaRegion.Ireland]: "IE",
  [VisaRegion.Turkiye]: "TR",
  [VisaRegion.Montenegro]: "ME",
  [VisaRegion.Serbia]: "RS",
  [VisaRegion.Bosnia]: "BA",
  [VisaRegion.Kosovo]: "XK",
  [VisaRegion.NorthMacedonia]: "MK",
  [VisaRegion.Albania]: "AL",
  [VisaRegion.Cyprus]: "CY",
  [VisaRegion.Belarus]: "BY",
  [VisaRegion.Georgia]: "GE",
  [VisaRegion.Armenia]: "AM",
};

export const REGION_MARKER_PALETTE = [
  "#2563EB", // blue
  "#EA580C", // orange
  "#7C3AED", // violet
  "#0891B2", // cyan
  "#DB2777", // pink
  "#8B5E3C", // brown
  "#475569", // slate
  "#4338CA", // indigo
] as const;

export function regionMarkerCode(region: VisaRegion): string {
  return REGION_CODES[region] ?? VISA_REGION_LABELS[region].slice(0, 2).toUpperCase();
}

/** Destination name as it reads mid-sentence ("a 45d Schengen trip"). */
export function regionMarkerName(region: VisaRegion): string {
  return region === VisaRegion.Schengen ? "Schengen" : VISA_REGION_LABELS[region];
}

/**
 * Colour per destination for one view, given every destination that has
 * markers in it. Same input set → same colours, whatever order it came in.
 */
export function assignRegionMarkerColours(
  regions: Iterable<VisaRegion>,
): Map<VisaRegion, string> {
  const present = new Set(regions);
  const ordered = SUPPORTED_DESTINATIONS.map((d) => d.region).filter((r) =>
    present.has(r),
  );
  return new Map(
    ordered.map((r, i) => [
      r,
      REGION_MARKER_PALETTE[i % REGION_MARKER_PALETTE.length],
    ]),
  );
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
