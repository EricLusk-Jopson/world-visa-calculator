// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Trip {
  /** ISO date string: YYYY-MM-DD */
  entryDate: string;
  /** ISO date string: YYYY-MM-DD — absent means the trip is ongoing */
  exitDate?: string;
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
