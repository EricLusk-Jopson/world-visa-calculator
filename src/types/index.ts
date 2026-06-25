/**
 * index.ts — types barrel
 * ──────────────────────────────────────────────────────────────────────────────
 * Single import surface for all shared domain types.
 * Region files, calculator utilities, and UI components import from here.
 *
 * ── What changed from the previous version ───────────────────────────────────
 *
 * PassportRule is now a discriminated union (FreeMovementRule | VisaRequiredRule
 * | EntitledRule) replacing the old flat interface with boolean flags.
 *
 * RegionDefinition.rule now uses the RegionRule discriminated union
 * (RollingWindowRule | PerVisitRule | OfficerDiscretionRule) replacing the
 * old flat object.
 *
 * Migration impact:
 *   - Code checking `rule.access === 'visa_free'` → `rule.access === 'entitled'`
 *   - Code reading `rule.allowanceDays / windowDays` → `rule.entitlements[0].limits`
 *   - Code checking `rule.requiresETIAS / requiresETA` → `rule.entitlements[0].preAuth`
 *   - RegionDefinition.rule.allowanceDays / windowDays → rule.allowanceDays / windowDays
 *     on the typed variant (RollingWindowRule, PerVisitRule, etc.)
 */

// ─── Visa Regions ─────────────────────────────────────────────────────────────
//
//! IMPORTANT: Values are used directly as URL indices.
//! Never reorder or remove entries — only ever append new ones.

export const VisaRegion = {
  Schengen: 0,
  Elsewhere: 1,
  Ireland: 2,
  UnitedKingdom: 3,
  Turkiye: 4,
} as const;

export type VisaRegion = (typeof VisaRegion)[keyof typeof VisaRegion];

export const VISA_REGION_LABELS: Record<VisaRegion, string> = {
  [VisaRegion.Schengen]: 'Schengen Zone',
  [VisaRegion.Elsewhere]: 'Elsewhere',
  [VisaRegion.Ireland]: 'Ireland',
  [VisaRegion.UnitedKingdom]: 'United Kingdom',
  [VisaRegion.Turkiye]: 'Türkiye',
};

// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Trip {
  /** Unique ID — required for edit/delete targeting. */
  id: string;
  entryDate: string;  // YYYY-MM-DD
  exitDate?: string;  // YYYY-MM-DD; undefined = ongoing
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

export interface EarliestEntryResult {
  earliestDate: string | null;
  maxDaysAvailable: number;
  canEnterOnSearchDate: boolean;
}

// ─── Source documentation ─────────────────────────────────────────────────────

/**
 * Reference to an authoritative regulatory source.
 * Every RuleNote must carry one, unless the note describes rule mechanics
 * (not a specific legal instrument) in which case source may be omitted.
 * All SourceDoc instances live in @/data/sources — never inline in region files.
 */
export interface SourceDoc {
  /** Direct link to the specific regulation, annex, or document. */
  directUrl: string;
  /** Overview/parent page that links to the document — for human navigation. */
  parentUrl: string;
  /** ISO date (YYYY-MM-DD) when content was last verified against the source. */
  dateChecked: string;
}

/**
 * An advisory note on a PassportRule or RegionRule.
 * source is optional to allow computed default notes that describe rule
 * mechanics rather than citing a specific document.
 */
export interface RuleNote {
  text: string;
  source?: SourceDoc;
}

// ─── Stay limits ──────────────────────────────────────────────────────────────

/**
 * Per-visit limit. Resets on each departure and re-entry.
 * Examples: UK (180 days), Ireland (90 days), Türkiye e-visa entrants.
 */
export interface PerVisitLimit {
  readonly type: 'per_visit';
  days: number;
}

/**
 * Rolling window limit. At any moment, the total days in the destination
 * during the past `windowDays` days must not exceed `days`.
 * Examples: Schengen (90/180), Türkiye standard (90/180).
 */
export interface RollingWindowLimit {
  readonly type: 'rolling_window';
  days: number;
  windowDays: number;
}

/**
 * Fixed window anchored to the date of first entry into the destination.
 * The window resets on each new trip (re-entry after departure).
 * Calculator: total days since most recent entry ≤ days, elapsed time ≤ windowDays.
 * Example: Türkiye — Albania, Jordan, Kosovo, etc. (90 days within 6 months).
 */
export interface FixedWindowFromEntryLimit {
  readonly type: 'fixed_window_from_entry';
  days: number;
  windowDays: number;
}

/**
 * Calendar period limit. Total days within a calendar year must not exceed `days`.
 * The window resets at the start of each calendar year, not rolling.
 * Example: Türkiye — Belarus (30 days per entry, 90 days per calendar year).
 */
export interface CalendarPeriodLimit {
  readonly type: 'calendar_period';
  days: number;
  periodDays: number; // typically 365
}

export type StayLimit =
  | PerVisitLimit
  | RollingWindowLimit
  | FixedWindowFromEntryLimit
  | CalendarPeriodLimit;

// ─── Pre-travel authorisation ─────────────────────────────────────────────────

/**
 * An electronic authorisation that must be obtained before boarding a carrier
 * or presenting at the border. Grants the right to travel; the StayEntitlement
 * limits govern how long the traveller may stay once admitted. These are
 * orthogonal: an ETA may be valid for 2 years while the per-visit stay limit
 * resets on every entry.
 */
export interface PreTravelAuth {
  /**
   * ETA             UK Electronic Travel Authorisation (£20, 2yr, multi-entry)
   * ETIAS           EU/Schengen ETIAS (€7, 3yr, multi-entry, not yet launched)
   * e_visa          Türkiye e-Visa unconditional (per-trip, tourism/commerce only)
   * e_visa_conditional  Türkiye e-Visa requiring Schengen/US/UK/IE visa or RP
   * BIVS            Ireland British-Irish Visa Scheme (requires BIVS-endorsed UK visa)
   * SSVWP           Ireland Short Stay Visa Waiver Programme (requires UK short-stay visa)
   */
  type: 'ETA' | 'ETIAS' | 'e_visa' | 'e_visa_conditional' | 'BIVS' | 'SSVWP';
  /** Display name for the UI. */
  name: string;
  /** Application URL. */
  applicationUrl: string;
  /** Cost. Absent = free. */
  cost?: { amount: number; currency: string };
  /**
   * How long the authorisation itself is valid in days.
   * null = trip-specific (issued per trip, not multi-year).
   */
  authValidityDays: number | null;
  /** Whether the authorisation allows multiple entries within its validity. */
  multiEntry: boolean;
  notes?: RuleNote[];
}

// ─── Entitlement conditions ───────────────────────────────────────────────────

/** Traveller holds a valid visa or residence permit for listed destinations. */
export interface HoldsVisaForCondition {
  readonly type: 'holds_visa_for';
  destinations: Array<string | 'schengen_member'>;
  description: string;
}

/** Traveller is within a specific age bracket (bounds inclusive). */
export interface AgeRangeCondition {
  readonly type: 'age_range';
  min?: number;
  max?: number;
  description: string;
}

/** Entry is restricted to the listed purposes. */
export interface PurposeCondition {
  readonly type: 'purpose';
  allowed: ReadonlyArray<'tourism' | 'commerce' | 'transit' | 'business'>;
}

/** Entitlement applies only to biometric passports issued to ICAO standards. */
export interface BiometricPassportCondition {
  readonly type: 'biometric_passport';
}

/** Entry under this entitlement is only permitted via the listed port types. */
export interface EntryPortCondition {
  readonly type: 'entry_port';
  allowed: ReadonlyArray<'airport' | 'seaport' | 'land_border'>;
}

/** Entry under this entitlement requires travel on the listed carriers. */
export interface CarrierCondition {
  readonly type: 'carrier';
  airlines: string[];
  description: string;
}

/**
 * Entitlement applies only to a specific document variant identified by
 * a characteristic of the travel document (e.g. HKSAR vs BNO passport,
 * Taiwan passport with national ID card number).
 */
export interface PassportIdentifierCondition {
  readonly type: 'passport_identifier';
  description: string;
}

export type EntitlementCondition =
  | HoldsVisaForCondition
  | AgeRangeCondition
  | PurposeCondition
  | BiometricPassportCondition
  | EntryPortCondition
  | CarrierCondition
  | PassportIdentifierCondition;

// ─── Stay entitlement ─────────────────────────────────────────────────────────

/**
 * A single entitlement: what stay limits apply, under what conditions,
 * with what pre-travel authorisation.
 *
 * All limits in the array apply simultaneously — the effective remaining
 * allowance is the minimum across all active limits.
 *
 * All conditions must pass for this entitlement to apply (AND logic).
 * Multiple entitlements in an EntitledRule represent OR'd cases.
 */
export interface StayEntitlement {
  /** At least one limit required. All limits apply simultaneously. */
  limits: [StayLimit, ...StayLimit[]];
  /**
   * All must pass. Absent = unconditional (applies to all holders of
   * this passport code who aren't matched by a prior conditional entitlement).
   */
  conditions?: EntitlementCondition[];
  /** Pre-travel authorisation required before this entitlement is usable. */
  preAuth?: PreTravelAuth;
  notes?: RuleNote[];
}

// ─── Passport rules ───────────────────────────────────────────────────────────

/** Unrestricted entry. No visa, no time limit. EU treaty rights, CTA, etc. */
export interface FreeMovementRule {
  readonly access: 'free_movement';
  notes?: RuleNote[];
}

/**
 * No automatic entitlement. Entry subject to embassy visa in advance,
 * or immigration officer discretion at the border.
 */
export interface VisaRequiredRule {
  readonly access: 'visa_required';
  notes?: RuleNote[];
}

/**
 * The passport holder has a defined entitlement, potentially conditional.
 *
 * Evaluation: iterate entitlements in order; apply the first one whose
 * conditions ALL pass. Unconditional entitlements (no conditions field)
 * should be placed last — they are the catch-all fallback.
 * If no entitlement matches → implicit visa_required.
 */
export interface EntitledRule {
  readonly access: 'entitled';
  entitlements: [StayEntitlement, ...StayEntitlement[]];
  notes?: RuleNote[];
}

export type PassportRule = FreeMovementRule | VisaRequiredRule | EntitledRule;

// ─── Region rule ──────────────────────────────────────────────────────────────

/**
 * Rolling window region rule. The standard Schengen model.
 * Fully calculable from trip history.
 */
export interface RollingWindowRule {
  readonly type: 'rolling_window';
  allowanceDays: number;
  windowDays: number;
  entryCountsAsDay: boolean;
  exitCountsAsDay: boolean;
  notes?: RuleNote[];
}

/**
 * Per-visit region rule. UK and Ireland model.
 * The per-visit cap is calculable; cumulative pattern is officer discretion.
 */
export interface PerVisitRule {
  readonly type: 'per_visit';
  allowanceDays: number;
  entryCountsAsDay: boolean;
  exitCountsAsDay: boolean;
  notes?: RuleNote[];
}

/**
 * No hard limit. Stay duration is at the discretion of the immigration officer.
 * informationalDays may be shown in UI for context but is not a guarantee.
 */
export interface OfficerDiscretionRule {
  readonly type: 'officer_discretion';
  informationalDays?: number;
  notes?: RuleNote[];
}

export type RegionRule = RollingWindowRule | PerVisitRule | OfficerDiscretionRule;

// ─── Region definition ────────────────────────────────────────────────────────

export interface RegionDefinition {
  code: string;
  name: string;
  /** ISO Alpha-2 codes of member countries. */
  memberStates: string[];
  /** The stay calculation model for this destination. */
  rule: RegionRule;
  /** ISO date — used in UI and for audit trail. */
  lastVerified: string;
  /** Canonical official source URL for this region's entry rules. */
  sourceUrl: string;
  passportRules: Record<string, PassportRule>;
  /** Fallback rule for any passport code not in passportRules. */
  defaultRule: PassportRule;
}

// ─── Type guards ──────────────────────────────────────────────────────────────

export function isFreeMovement(rule: PassportRule): rule is FreeMovementRule {
  return rule.access === 'free_movement';
}

export function isVisaRequired(rule: PassportRule): rule is VisaRequiredRule {
  return rule.access === 'visa_required';
}

export function isEntitled(rule: PassportRule): rule is EntitledRule {
  return rule.access === 'entitled';
}

export function isRollingWindow(rule: RegionRule): rule is RollingWindowRule {
  return rule.type === 'rolling_window';
}

export function isPerVisit(rule: RegionRule): rule is PerVisitRule {
  return rule.type === 'per_visit';
}

export function isOfficerDiscretion(rule: RegionRule): rule is OfficerDiscretionRule {
  return rule.type === 'officer_discretion';
}

// ─── Sharing ──────────────────────────────────────────────────────────────────

export interface ShareableState {
  travelers: Traveler[];
}
