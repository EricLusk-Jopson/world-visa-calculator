// Sizes and colours for the marker gutter chips (see GutterMarkers.tsx).

import { tokens } from "@/styles/theme";
import { thresholdsFor } from "@/features/calculator/utils/windowMarkers";

/** Rendered heights, for stacking chips in the gutter. */
export const RETURN_CHIP_HEIGHT = 16;
export const AGING_CHIP_HEIGHT = 26;
export const AGING_CHIP_FIRST_ROW = 14;
export const GUTTER_CHIP_GAP = 3;

/**
 * Green once a third of the allowance is reachable (30d of 90), amber below.
 * Every other milestone (30/60/90 of 90) is drawn stronger than the ones
 * between.
 */
export function returnMarkerColors(days: number, allowance: number) {
  const isGenerous = days >= allowance / 3;
  const isMajor = thresholdsFor(allowance).indexOf(days) % 2 === 1;
  return {
    lineBase: isGenerous ? tokens.green : tokens.amber,
    textColor: isGenerous ? tokens.greenText : tokens.amberText,
    bgColor: isGenerous ? tokens.greenBg : tokens.amberBg,
    lineOpacity: isMajor ? 0.35 : 0.18,
    pillOpacity: isMajor ? 1 : 0.7,
  };
}
