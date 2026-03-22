// Utils
export {
  TRAVELER_NAME_MAX_LENGTH,
  TRAVELER_NAME_PATTERN,
  sanitizeTravelerName,
  isValidTravelerName,
  encodeDate,
  decodeDate,
  encodeState,
  decodeState,
  decodeCurrentUrl,
  buildShareableUrl,
} from "./utils/urlEncoding";

export type { DecodeResult } from "./utils/urlEncoding";

// Hook
export { useUrlSync, clearLocalStorage } from "./hooks/useUrlSync";
export type { UseUrlSyncOptions, UseUrlSyncReturn } from "./hooks/useUrlSync";
