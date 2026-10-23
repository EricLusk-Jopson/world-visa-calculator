/**
 * Colours for the destinations active in the rolling-window explorer. Trips
 * to different destinations sit side by side on one row, so every pair must
 * stay distinguishable: these four pass the all-pairs colour-vision checks,
 * which caps the explorer at four active destinations. The yellow is
 * deepened from the stock #eda100 so it stays apart from the orange. Red is
 * left out on purpose: the window turns red when a traveler is over.
 */
export const JURISDICTION_PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#d2b000", // yellow
] as const;

/** The first palette colour not already taken, or null when all are. */
export function nextFreeJurisdictionColor(taken: readonly string[]): string | null {
  return JURISDICTION_PALETTE.find((c) => !taken.includes(c)) ?? null;
}
