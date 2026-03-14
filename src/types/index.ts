// ─── Visa Regions ─────────────────────────────────────────────────────────────
//
//! IMPORTANT: Values are used directly as URL indices.
//! Never reorder or remove entries — only ever append new ones.

export const VisaRegion = {
  Schengen: 0,
  Elsewhere: 1,
  // Ireland: 2,
  // UnitedKingdom: 3,
  // Turkiye: 4,
} as const;

export type VisaRegion = (typeof VisaRegion)[keyof typeof VisaRegion];

export const VISA_REGION_LABELS: Record<VisaRegion, string> = {
  [VisaRegion.Schengen]: "Schengen Zone",
  [VisaRegion.Elsewhere]: "Elsewhere",
};

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Trip {
  /** ISO date string: YYYY-MM-DD */
  entryDate: string;
  /** ISO date string: YYYY-MM-DD — absent means the trip is ongoing */
  exitDate?: string;
  region: VisaRegion;
}

export interface Traveler {
  /** Stable client-generated ID */
  id: string;
  /** Alphabetical characters only, 1–30 chars */
  name: string;
  trips: Trip[];
}

// ─── Sharing ─────────────────────────────────────────────────────────────────

export interface ShareableState {
  travelers: Traveler[];
}
