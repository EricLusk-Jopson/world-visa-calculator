// Utils
export {
  sanitizeTravelerName,
  isValidTravelerName,
  encodeDate,
  decodeDate,
  encodeTrip,
  decodeTrip,
  encodeTraveler,
  decodeTraveler,
  encodeState,
  decodeState,
  decodeCurrentUrl,
  buildShareableUrl,
} from "./utils/urlEncoding";

export type { DecodeResult } from "./utils/urlEncoding";

// Hook
export { useUrlSync, clearLocalStorage } from "./hooks/useUrlSync";
export type { UseUrlSyncOptions, UseUrlSyncReturn } from "./hooks/useUrlSync";
