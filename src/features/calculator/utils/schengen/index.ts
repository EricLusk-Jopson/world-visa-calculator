// Barrel — re-exports everything Schengen-specific from one import path.
// Consumers import from "@/features/calculator/utils/schengen".

export {
  SCHENGEN_MAX_DAYS,
  SCHENGEN_WINDOW_SIZE,
  getDaysUsedOnDate,
  calculateMaxStay,
  calculateEarliestEntry,
} from "./calculator";

export {
  AVAILABLE_DAYS_DESCRIPTION,
  MAX_STAY_DESCRIPTION,
  SCHENGEN_COUNTRIES_TOOLTIP,
} from "./constants";

export type { ReturnMarker } from "./returnMarkers";
export { computeReturnMarkers } from "./returnMarkers";

export type { AgingMarker } from "./agingMarkers";
export { computeAgingMarkers } from "./agingMarkers";

export {
  returnMarkerCurrentText,
  returnMarkerThresholdText,
  returnMarkerRowText,
  agingMarkerTripLine,
  AGING_MARKER_EXPLANATION,
} from "./markerTooltips";

export {
  CHIP_TOOLTIP_SCHENGEN_AVAIL,
  CHIP_TOOLTIP_REENTRY_DATE,
  CHIP_TOOLTIP_NO_REENTRY,
  CHIP_TOOLTIP_OVERSTAY,
  CHIP_TOOLTIP_VISA_REQUIRED,
  CHIP_TOOLTIP_TRANSIT_VISA,
  CHIP_TOOLTIP_ETIAS,
  CHIP_TOOLTIP_SUSPENDED,
} from "./chipTooltips";
