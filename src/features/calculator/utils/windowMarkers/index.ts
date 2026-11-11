// Barrel — timeline markers for every rolling-window destination.
// Consumers import from "@/features/calculator/utils/windowMarkers".

import type { Traveler, VisaRegion } from "@/types";
import { type ReturnMarker, computeReturnMarkers } from "./returnMarkers";
import { type AgingMarker, computeAgingMarkers } from "./agingMarkers";

export type { ReturnMarker, AgingMarker };
export { computeReturnMarkers, computeAgingMarkers };

export type { RollingWindowConfig } from "./rollingLimit";
export {
  resolveRollingWindow,
  effectiveAllowance,
  thresholdsFor,
} from "./rollingLimit";

export {
  returnMarkerCurrentText,
  returnMarkerThresholdText,
  returnMarkerRowText,
  agingMarkerTripLine,
  AGING_MARKER_EXPLANATION,
} from "./markerTooltips";

export { regionMarkerName, assignChipSlots } from "./markerLayout";

export interface WindowMarkers {
  returnMarkers: ReturnMarker[];
  agingMarkers: AgingMarker[];
}

/**
 * Return and aging markers for every destination the traveller has trips to.
 * Destinations where their passport gets no rolling window contribute none.
 */
export function computeWindowMarkers(
  traveler: Traveler,
  timelineStart: Date,
  timelineEnd: Date,
): WindowMarkers {
  const regions = [...new Set(traveler.trips.map((t) => t.region))];
  return {
    returnMarkers: regions.flatMap((r: VisaRegion) =>
      computeReturnMarkers(traveler, r, timelineStart, timelineEnd),
    ),
    agingMarkers: regions.flatMap((r: VisaRegion) =>
      computeAgingMarkers(traveler, r, timelineStart, timelineEnd),
    ),
  };
}
