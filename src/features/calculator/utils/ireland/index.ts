export type {
  StayVariant,
  IrelandStayAssessment,
  IrelandReentryRisk,
} from "./calculator";
export {
  IRELAND_MAX_DAYS,
  IRELAND_CAUTION_DAYS,
  calculateIrelandMaxExitDate,
  assessIrelandStay,
  detectIrelandReentryRisk,
} from "./calculator";
export {
  CHIP_TOOLTIP_IRELAND_STAY_CAUTION,
  CHIP_TOOLTIP_IRELAND_STAY_DANGER,
  CHIP_TOOLTIP_IRELAND_REENTRY_DANGER,
  CHIP_TOOLTIP_IRELAND_REENTRY_CAUTION,
  CHIP_TOOLTIP_IRELAND_REENTRY_SAFE,
} from "./chipTooltips";
