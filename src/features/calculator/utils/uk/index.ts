export type { StayVariant, UKStayAssessment, UKReentryRisk } from "./calculator";
export {
  UK_MAX_CALENDAR_MONTHS,
  UK_CAUTION_DAYS,
  calculateUKMaxExitDate,
  assessUKStay,
  detectUKReentryRisk,
} from "./calculator";
export {
  CHIP_TOOLTIP_UK_ETA,
  CHIP_TOOLTIP_UK_DATV,
  CHIP_TOOLTIP_UK_STAY_CAUTION,
  CHIP_TOOLTIP_UK_STAY_DANGER,
  CHIP_TOOLTIP_UK_REENTRY_DANGER,
  CHIP_TOOLTIP_UK_REENTRY_CAUTION,
  CHIP_TOOLTIP_UK_REENTRY_SAFE,
} from "./chipTooltips";
