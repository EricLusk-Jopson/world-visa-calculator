// ─── Visa Regions ─────────────────────────────────────────────────────────────
//
//! IMPORTANT: Values are used directly as URL indices.
//! Never reorder or remove entries — only ever append new ones.

export const VisaRegion = {
  Schengen: 0,
  Elsewhere: 1,
  Ireland: 2,
  UnitedKingdom: 3,
  // Turkiye: 4,
} as const;

export type VisaRegion = (typeof VisaRegion)[keyof typeof VisaRegion];

export const VISA_REGION_LABELS: Record<VisaRegion, string> = {
  [VisaRegion.Schengen]: "Schengen Zone",
  [VisaRegion.Elsewhere]: "Elsewhere",
  [VisaRegion.Ireland]: "Ireland",
  [VisaRegion.UnitedKingdom]: "United Kingdom",
};

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Trip {
  /** Unique ID — required for edit/delete targeting. */
  id: string;
  entryDate: string; // YYYY-MM-DD
  exitDate?: string; // YYYY-MM-DD; undefined = ongoing
  region: VisaRegion;
  /** Optional human label shown on trip cards (e.g. "Paris & Barcelona"). */
  destination?: string;
}

export interface Traveler {
  /** Stable client-generated ID */
  id: string;
  /** Alphabetical characters only, 1–30 chars */
  name: string;
  /** ISO Alpha-2 passport code; null = not yet selected */
  passportCode: string | null;
  trips: Trip[];
}

export interface MaxStayResult {
  /** The proposed entry date this result was calculated against. */
  entryDate: string;
  /** Whether entry is possible on the given date. */
  canEnter: boolean;
  /** The last legal exit date. Null when canEnter is false. */
  maxExitDate: string | null;
  /** Total days available, entry and exit inclusive. Zero when canEnter is false. */
  maxDays: number;
}

/**
 * Result of an earliest-entry search.
 * Answers: "given my history, when is the first day I can start a new trip?"
 */
export interface EarliestEntryResult {
  /**
   * ISO date string of the earliest date the traveler can enter Schengen.
   * Null if no valid date was found within the search window (very unusual).
   */
  earliestDate: string | null;
  /**
   * Maximum stay available if entering on earliestDate (days).
   * Zero when earliestDate is null.
   */
  maxDaysAvailable: number;
  /**
   * True when the search start date itself is a valid entry date —
   * i.e. the traveler can enter today (or on the requested search-from date).
   */
  canEnterOnSearchDate: boolean;
}

// ─── Passport / Nationality ───────────────────────────────────────────────────

export type SchengenAccess =
  | 'free_movement'  // EU/EEA/Swiss — no 90/180 limit applies
  | 'visa_free'      // 90 days in any 180-day period
  | 'visa_required'  // Must apply for a Schengen visa
  | 'suspended';     // Visa-free access temporarily suspended

/**
 * Reference to an authoritative regulatory source.
 * Every PassportNote must carry one of these.
 */
export interface SourceDoc {
  /** Direct link to the specific regulation, annex, or document */
  directUrl: string;
  /** Overview/parent page that links to the document — for human navigation */
  parentUrl: string;
  /** ISO date (YYYY-MM-DD) when this data was last verified against the source */
  dateChecked: string;
}

/**
 * An advisory note attached to a PassportRule — e.g. suspension details,
 * specific-member-state ATV requirements, or other per-nationality caveats.
 */
export interface PassportNote {
  text: string;
  source: SourceDoc;
}

export interface PassportRule {
  access: SchengenAccess;
  /** Present for visa_free only */
  allowanceDays?: number;
  /** Present for visa_free only */
  windowDays?: number;
  /** Present for visa_free — ETIAS launching late 2026 */
  requiresETIAS?: boolean;
  /**
   * Airport Transit Visa required at ALL Schengen airports — nationals must hold
   * an ATV even to transit the international zone without entering.
   * Source: EU Regulation (EU) 2018/1806 Annex IV (common list).
   * For member-state-specific ATV requirements see notes.
   */
  requiresATV?: boolean;
  /**
   * Advisory notes with regulatory sources — e.g. suspension reasons,
   * specific-member-state ATV requirements (Visa Code Handbook Annex 7B),
   * or other per-nationality caveats.
   */
  notes?: PassportNote[];
}

export interface RegionDefinition {
  code: string;
  name: string;
  /** ISO Alpha-2 codes of member countries */
  memberStates: string[];
  rule: {
    allowanceDays: number;
    windowDays: number;
    entryCountsAsDay: boolean;
    exitCountsAsDay: boolean;
  };
  /** ISO date — used in UI and for audit trail */
  lastVerified: string;
  /** Official government source */
  sourceUrl: string;
  passportRules: Record<string, PassportRule>;
  /** Fallback for any code not in passportRules */
  defaultRule: PassportRule;
}

// ─── Sharing ─────────────────────────────────────────────────────────────────

export interface ShareableState {
  travelers: Traveler[];
}
