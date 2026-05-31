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
