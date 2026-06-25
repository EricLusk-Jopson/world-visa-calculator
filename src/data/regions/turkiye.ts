/**
 * turkiye.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Visa and entry rules for the Republic of Türkiye.
 *
 * ── Visa scheme overview ─────────────────────────────────────────────────────
 *
 * STAY RULE
 *   The standard allowance is 90 days in any 180-day rolling window — identical
 *   in structure to the Schengen rule. This is fully calculable.
 *
 *   Several nationalities have shorter or differently-structured allowances:
 *   - "Within 6 months from first entry" (9 nationalities): encoded as
 *     fixed_window_from_entry — anchored to each trip's first entry date,
 *     resets on re-entry. See entitledFromFirstEntry().
 *   - Russia (ordinary): 60-day rolling window.
 *   - Indonesia: 30 days per entry, max 90 in any 180 — stacked limits.
 *   - Belarus: 30 days per entry, max 90 within 1 calendar year — stacked limits.
 *   - Brunei, Costa Rica, Macau SAR, Mongolia, Thailand: 30 days per visit.
 *
 * ELECTRONIC VISA (e-Visa)
 *   Türkiye operates an e-Visa system at www.evisa.gov.tr for tourism and
 *   commercial purposes only. Three tiers:
 *     1. Unconditional 90-day multiple entry (entitledEVisa90)
 *     2. Unconditional 30-day single entry (entitledEVisa30)
 *     3. Conditional 30-day single entry: requires a valid visa or RP from a
 *        Schengen member state, the US, the UK, or Ireland — encoded as
 *        visa_required with a note (same pattern as Ireland SSVWP).
 *
 * PASSPORT TYPE
 *   Rules below apply to ORDINARY passport holders. Diplomatic/official passport
 *   divergences are documented in notes on the relevant entries.
 *
 * PASSPORT VALIDITY
 *   Foreigners must hold a passport valid for at least 60 days beyond their
 *   intended stay. National identity card holders and official passport holders
 *   are exempt. Noted on the region rule.
 *
 * NORTHERN CYPRUS (TRNC)
 *   TRNC citizens have unlimited stay. No ISO code — falls through correctly.
 *
 * GREEK CYPRIOT ADMINISTRATION (CY)
 *   Republic of Cyprus passports require a 30-day e-Visa. Border gate issuance
 *   terminated 2 January 2026 — must apply online or via Turkish missions.
 *
 * All source URLs are in TurkiyeSources (@/data/sources).
 *
 * Last verified: 2026-05-27
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  FreeMovementRule,
  VisaRequiredRule,
  RuleNote,
  PreTravelAuth,
  RollingWindowLimit,
  PerVisitLimit,
  FixedWindowFromEntryLimit,
  CalendarPeriodLimit,
  EntitlementCondition,
} from '@/types';
import { TurkiyeSources } from '@/data/sources';

// ─── Stay limits ──────────────────────────────────────────────────────────────

const TR_ROLLING_90: RollingWindowLimit = { type: 'rolling_window', days: 90,  windowDays: 180 };
const TR_ROLLING_60: RollingWindowLimit = { type: 'rolling_window', days: 60,  windowDays: 180 };
const TR_PER_VISIT_30: PerVisitLimit    = { type: 'per_visit',       days: 30 };
const TR_FROM_ENTRY_90: FixedWindowFromEntryLimit = {
  type: 'fixed_window_from_entry',
  days: 90,
  windowDays: 180, // ≈ 6 months
};
const TR_CALENDAR_90: CalendarPeriodLimit = { type: 'calendar_period', days: 90, periodDays: 365 };

// ─── Pre-travel authorisation ─────────────────────────────────────────────────

/** Unconditional 90-day multiple-entry e-Visa. */
const EVISA_90: PreTravelAuth = {
  type: 'e_visa',
  name: 'Türkiye e-Visa (90 days, multiple entry)',
  applicationUrl: TurkiyeSources.eVisaApplication.directUrl,
  authValidityDays: null, // trip-specific, not multi-year
  multiEntry: true,
};

/** Unconditional 30-day single-entry e-Visa. */
const EVISA_30: PreTravelAuth = {
  type: 'e_visa',
  name: 'Türkiye e-Visa (30 days, single entry)',
  applicationUrl: TurkiyeSources.eVisaApplication.directUrl,
  authValidityDays: null,
  multiEntry: false,
};

// ─── Shared conditions ────────────────────────────────────────────────────────

/** Tourism and commerce purposes only — applies to all e-Visa entitlements. */
const EVISA_PURPOSE: EntitlementCondition = {
  type: 'purpose',
  allowed: ['tourism', 'commerce'],
};

/** Touristic purposes and transit only. */
const TOURISTIC_PURPOSE: EntitlementCondition = {
  type: 'purpose',
  allowed: ['tourism', 'transit'],
};

// ─── Shared note text ─────────────────────────────────────────────────────────

const CONDITIONAL_EVISA_NOTE =
  'Visa required. Exception: ordinary passport holders may apply for a ' +
  'single-entry e-Visa valid for 30 days via www.evisa.gov.tr, provided ' +
  'they hold a valid visa or residence permit from a Schengen member state, ' +
  'the United States, the United Kingdom, or Ireland, and hold a return ticket ' +
  'and hotel reservation, and have at least USD 50 per day of stay. Travel must ' +
  'be for tourism or commerce, and entry must be via an airport only.';

const FROM_FIRST_ENTRY_NOTE =
  'The 90-day allowance is measured within six months from the date of first ' +
  'entry into Türkiye, not as a continuously rolling 180-day window. The ' +
  'period resets on each new trip. This functions similarly to a per-visit ' +
  'cap rather than a pure rolling window.';

const OFFICIAL_PASSPORT_VISA_NOTE =
  'Holders of official (diplomatic, service, special) passports are required ' +
  'to obtain a visa in advance from a Turkish diplomatic mission.';

// ─── Shared rule constants ────────────────────────────────────────────────────

const FREE_MOVEMENT: FreeMovementRule = { access: 'free_movement' };
const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

// ─── Entitlement helpers ──────────────────────────────────────────────────────

// Note placement convention (applies across all region files):
//   entitlementNotes → inside StayEntitlement.notes (condition-specific context)
//   ruleNotes        → on EntitledRule.notes (rule-level context, fallback explanation)
// See schengen.ts entitled() for full documentation.

/** Standard 90 days in any 180-day rolling window. No pre-travel auth. */
function entitled90(
  entitlementNotes?: RuleNote[],
  conditions?: EntitlementCondition[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [TR_ROLLING_90],
      ...(conditions?.length && { conditions }),
      ...(entitlementNotes?.length && { notes: entitlementNotes }),
    }],
    ...(ruleNotes?.length && { notes: ruleNotes }),
  };
}

/**
 * 90 days within 6 months from the date of first entry.
 * fixed_window_from_entry — anchored to trip start, resets on re-entry.
 */
function entitledFromFirstEntry(
  entitlementNotes?: RuleNote[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [TR_FROM_ENTRY_90],
      notes: [
        { text: FROM_FIRST_ENTRY_NOTE, source: TurkiyeSources.mfaVisaInfo },
        ...(entitlementNotes ?? []),
      ],
    }],
    ...(ruleNotes?.length && { notes: ruleNotes }),
  };
}

/** Unconditional e-Visa, 90 days, multiple entry. Tourism/commerce only. */
function entitledEVisa90(
  entitlementNotes?: RuleNote[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [TR_ROLLING_90],
      preAuth: EVISA_90,
      conditions: [EVISA_PURPOSE],
      ...(entitlementNotes?.length && { notes: entitlementNotes }),
    }],
    ...(ruleNotes?.length && { notes: ruleNotes }),
  };
}

/** Unconditional e-Visa, 30 days, single entry. Tourism/commerce only. */
function entitledEVisa30(
  entitlementNotes?: RuleNote[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [TR_PER_VISIT_30],
      preAuth: EVISA_30,
      conditions: [EVISA_PURPOSE],
      ...(entitlementNotes?.length && { notes: entitlementNotes }),
    }],
    ...(ruleNotes?.length && { notes: ruleNotes }),
  };
}

/**
 * Conditional e-Visa — visa_required with note.
 * Ordinary passport holders may apply for a 30-day e-Visa only if they hold
 * a valid Schengen/US/UK/IE visa or RP. Encoded as visa_required with a note,
 * consistent with Ireland's SSVWP pattern. Future: migrate to EntitledRule
 * with HoldsVisaForCondition when building the trip validator.
 */
function eVisaConditional(extraNotes?: RuleNote[]): VisaRequiredRule {
  return {
    access: 'visa_required',
    notes: [
      { text: CONDITIONAL_EVISA_NOTE, source: TurkiyeSources.eVisaEligible },
      ...(extraNotes ?? []),
    ],
  };
}

function visaRequired(notes: RuleNote[]): VisaRequiredRule {
  return { access: 'visa_required', notes };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const TURKIYE: RegionDefinition = {
  code: 'turkiye',
  name: 'Türkiye',
  memberStates: ['TR'],

  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
    notes: [{
      text:
        'The standard allowance is 90 days in any 180-day rolling window. ' +
        'Several nationalities have shorter allowances (30 or 60 days) or ' +
        'differently-structured windows — see your passport rule for details. ' +
        'Passports must be valid for at least 60 days beyond the intended ' +
        'duration of stay.',
      source: TurkiyeSources.mfaVisaInfo,
    }],
  },

  lastVerified: '2026-05-27',
  sourceUrl: TurkiyeSources.mfaVisaInfo.directUrl,
  defaultRule: VISA_REQUIRED,

  passportRules: {

    // ── Turkish citizens ───────────────────────────────────────────────────
    'TR': FREE_MOVEMENT,

    // ── Entitled — 90 days in any 180-day rolling window ──────────────────

    // Standard — no additional conditions
    'AD': entitled90(), // Andorra
    'AR': entitled90(), // Argentina
    'AT': entitled90(), // Austria
    'AZ': entitled90(), // Azerbaijan
    'BE': entitled90(), // Belgium
    'BZ': entitled90(), // Belize
    'BO': entitled90(), // Bolivia
    'BA': entitled90(), // Bosnia and Herzegovina
    'BR': entitled90(), // Brazil
    'BG': entitled90(), // Bulgaria (ID card also accepted)
    'CL': entitled90(), // Chile
    'CO': entitled90(), // Colombia
    'HR': entitled90(), // Croatia
    'CZ': entitled90(), // Czech Republic
    'DK': entitled90(), // Denmark
    'EC': entitled90(), // Ecuador
    'SV': entitled90(), // El Salvador
    'FI': entitled90(), // Finland
    'FR': entitled90(), // France
    'GE': entitled90(), // Georgia
    'DE': entitled90(), // Germany (ID card also accepted)
    'GR': entitled90(), // Greece (ID card also accepted)
    'GT': entitled90(), // Guatemala
    'HN': entitled90(), // Honduras
    'HU': entitled90(), // Hungary (ID card also accepted)
    'IS': entitled90(), // Iceland
    'IR': entitled90(), // Iran
    'IL': entitled90(), // Israel
    'IT': entitled90(), // Italy (ID card also accepted)
    'JP': entitled90(), // Japan
    'KZ': entitled90(), // Kazakhstan
    'KW': entitled90(), // Kuwait
    'KG': entitled90(), // Kyrgyzstan
    'LV': entitled90(), // Latvia
    'LI': entitled90(), // Liechtenstein
    'LT': entitled90(), // Lithuania
    'LU': entitled90(), // Luxembourg (ID card also accepted)
    'MY': entitled90(), // Malaysia
    'MT': entitled90(), // Malta (ID card also accepted)
    'MD': entitled90(), // Moldova (ID card also accepted)
    'MC': entitled90(), // Monaco
    'MA': entitled90(), // Morocco
    'MK': entitled90(), // North Macedonia (all passport types incl. travel document)
    'NL': entitled90(), // Netherlands (ID card also accepted)
    'NZ': entitled90(), // New Zealand
    'NI': entitled90(), // Nicaragua
    'NO': entitled90(), // Norway
    'OM': entitled90(), // Oman
    'PA': entitled90(), // Panama
    'PE': entitled90(), // Peru
    'PL': entitled90(), // Poland (ID card also accepted)
    'PT': entitled90(), // Portugal (ID card also accepted)
    'RO': entitled90(), // Romania (ID card also accepted)
    'SA': entitled90(), // Saudi Arabia
    'SM': entitled90(), // San Marino
    'SC': entitled90(), // Seychelles
    'SG': entitled90(), // Singapore
    'SK': entitled90(), // Slovakia
    'SI': entitled90(), // Slovenia
    'KR': entitled90(), // South Korea
    'ES': entitled90(), // Spain (ID card also accepted)
    'SE': entitled90(), // Sweden
    'CH': entitled90(), // Switzerland (ID card also accepted)
    'TT': entitled90(), // Trinidad and Tobago
    'TN': entitled90(), // Tunisia
    'AE': entitled90(), // United Arab Emirates
    'VA': entitled90(), // Vatican City (Holy See)
    'UY': entitled90(), // Uruguay

    // Standard 90/180 — ordinary passport only; official requires visa
    'AU': entitled90([{ text: 'Ordinary passport holders are visa-free for touristic visits and transit. ' + OFFICIAL_PASSPORT_VISA_NOTE, source: TurkiyeSources.mfaVisaInfo }]),
    'CA': entitled90([{ text: 'Ordinary passport holders are visa-free. ' + OFFICIAL_PASSPORT_VISA_NOTE, source: TurkiyeSources.mfaVisaInfo }]),
    'IE': entitled90([{ text: 'Ordinary and diplomatic passport holders are visa-free. Service, special, and other official passport holders require a visa (exception: members of ministerial delegations are exempt).', source: TurkiyeSources.mfaVisaInfo }]),
    'US': entitled90([{ text: 'Ordinary passport holders are visa-free. ' + OFFICIAL_PASSPORT_VISA_NOTE, source: TurkiyeSources.mfaVisaInfo }]),
    'UZ': entitled90([{ text: 'Diplomatic and ordinary passport holders are visa-free. Other official passport holders (service, special) require a visa.', source: TurkiyeSources.mfaVisaInfo }]),
    'UA': entitled90([{ text: 'All passport types are visa-free. Biometric identity cards are accepted for direct travel from Ukraine to Türkiye.', source: TurkiyeSources.mfaVisaInfo }]),

    // Standard 90/180 — with touristic purpose restriction
    'GB': entitled90(
      [
        { text: 'Diplomatic and official passport holders require a visa. British National Overseas (BNO), British Subject, and British Protected Person passport holders require a visa and may only obtain it from a Turkish diplomatic or consular mission abroad.', source: TurkiyeSources.mfaVisaInfo },
      ],
      [TOURISTIC_PURPOSE],
    ),

    // Standard 90/180 — with additional conditions or notes
    'BH': entitled90([{ text: 'Ordinary passport holders are visa-free for 90 days in any 180. Official passport holders require a visa; official passport holders may obtain a visa for up to 15 days at Turkish border crossings.', source: TurkiyeSources.mfaVisaInfo }]),
    'CN': entitled90([{ text: 'Ordinary passport holders are visa-free as of 2 January 2026. Holders of official passports are visa-free for up to 30 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'HK': entitled90([{ text: "Applies to holders of 'Hong Kong Special Administrative Region of the People's Republic of China' passports only. Holders of British National (Overseas) — BNO — passports are required to obtain a 3-month multiple-entry e-Visa via www.evisa.gov.tr. Holders of 'Document of Identity for Visa Purposes (Hong Kong)' must obtain a visa from Turkish diplomatic or consular missions abroad.", source: TurkiyeSources.mfaVisaInfo }]),
    'VE': entitled90([{ text: 'The 90-day allowance applies within each six-month period. Official passport holders are visa-free for up to 30 days.', source: TurkiyeSources.mfaVisaInfo }]),

    // ── Entitled — 90 days within 6 months from date of first entry ────────
    // fixed_window_from_entry: anchored to trip start, resets on re-entry.

    'AL': entitledFromFirstEntry(),
    'EE': entitledFromFirstEntry(),
    'JO': entitledFromFirstEntry([{ text: 'Touristic purposes and transit only.', source: TurkiyeSources.mfaVisaInfo }]),
    'XK': entitledFromFirstEntry([{ text: 'Touristic purposes and transit only.', source: TurkiyeSources.mfaVisaInfo }]),
    'LB': entitledFromFirstEntry([{ text: 'Touristic purposes and transit only.', source: TurkiyeSources.mfaVisaInfo }]),
    'ME': entitledFromFirstEntry(),
    'PY': entitledFromFirstEntry(),
    'QA': entitledFromFirstEntry([{ text: 'Applies to all passport types including service, special, and official passports.', source: TurkiyeSources.mfaVisaInfo }]),
    'RS': entitledFromFirstEntry([{ text: 'Applies to all passport types including travel documents. Touristic purposes and transit only.', source: TurkiyeSources.mfaVisaInfo }]),

    // ── Entitled — 60-day rolling window ──────────────────────────────────

    // Russia: ordinary = 60 days/180; service = 30 days max 90/180; diplomatic = 90 days.
    'RU': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_ROLLING_60],
        notes: [{
          text: 'Ordinary passport holders are visa-free for up to 60 days. Service passport holders are visa-free for up to 30 days with a maximum of 90 days within any 180-day period. Diplomatic passport holders are visa-free for up to 90 days.',
          source: TurkiyeSources.mfaVisaInfo,
        }],
      }],
    },

    // ── Entitled — stacked limits ──────────────────────────────────────────

    // Indonesia: 30 days per entry AND max 90 in any 180-day rolling window.
    'ID': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30, TR_ROLLING_90],
        notes: [{
          text: 'Each entry permits a stay of up to 30 days. The total number of days across multiple entries must not exceed 90 days in any 180-day period.',
          source: TurkiyeSources.mfaVisaInfo,
        }],
      }],
    },

    // Belarus: 30 days per entry AND max 90 days within 1 calendar year.
    'BY': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30, TR_CALENDAR_90],
        notes: [{
          text: 'Ordinary and official passport holders are visa-free for stays of up to 30 days per entry. The total stay must not exceed 90 days within any one calendar year. This is not a rolling 180-day window.',
          source: TurkiyeSources.mfaVisaInfo,
        }],
      }],
    },

    // ── Entitled — 30 days per visit ──────────────────────────────────────

    'BN': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30],
        notes: [{ text: 'Applies to all passport types (diplomatic, official, ordinary). Stay not to exceed 30 days.', source: TurkiyeSources.mfaVisaInfo }],
      }],
    }, // Brunei

    'CR': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30],
        notes: [{ text: 'Applies to all passport types (ordinary and official). Stay not to exceed 30 days.', source: TurkiyeSources.mfaVisaInfo }],
      }],
    }, // Costa Rica

    'MO': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30],
        notes: [{ text: "Applies to holders of 'Região Administrativa Especial de Macau da República Popular da China' passports only. Stay not to exceed 30 days.", source: TurkiyeSources.mfaVisaInfo }],
      }],
    }, // Macau SAR

    'MN': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30],
        conditions: [TOURISTIC_PURPOSE],
        notes: [{ text: 'Visa exemption applies for touristic visits only. Stay not to exceed 30 days.', source: TurkiyeSources.mfaVisaInfo }],
      }],
    }, // Mongolia

    'TH': {
      access: 'entitled',
      entitlements: [{
        limits: [TR_PER_VISIT_30],
        notes: [{ text: 'Ordinary passport holders are visa-free for up to 30 days. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }],
      }],
    }, // Thailand

    // ── Entitled — unconditional e-Visa, 90 days, multiple entry ──────────

    'AG': entitledEVisa90([{ text: 'Also available as a visa on arrival at Turkish ports of entry.', source: TurkiyeSources.mfaVisaInfo }]), // Antigua and Barbuda
    'AM': entitledEVisa90(), // Armenia
    'BS': entitledEVisa90(), // Bahamas
    'BB': entitledEVisa90(), // Barbados
    'DO': entitledEVisa90([{ text: 'Also available as a visa on arrival at Turkish ports of entry.', source: TurkiyeSources.mfaVisaInfo }]), // Dominican Republic
    'GD': entitledEVisa90([{ text: 'Also available as a visa on arrival at Turkish ports of entry.', source: TurkiyeSources.mfaVisaInfo }]), // Grenada
    'JM': entitledEVisa90(), // Jamaica
    'MV': entitledEVisa90(), // Maldives
    'LC': entitledEVisa90(), // Saint Lucia
    'VC': entitledEVisa90([{ text: 'Also available as a visa on arrival at Turkish ports of entry.', source: TurkiyeSources.mfaVisaInfo }]), // Saint Vincent and the Grenadines

    // ── Entitled — unconditional e-Visa, 30 days, single entry ────────────

    // Greek Cypriot Administration — politically distinct from EU membership.
    // Border gate issuance terminated 2 January 2026; must apply online.
    'CY': entitledEVisa30(
      [{
        text: 'Applies to holders of Greek Cypriot Administration (Republic of Cyprus) passports. As of 2 January 2026, visa issuance at Turkish border gates is no longer available. The e-Visa must be obtained online or from Turkish diplomatic or consular missions abroad before travel.',
        source: TurkiyeSources.mfaVisaInfo,
      }],
    ),

    'TL': entitledEVisa30(), // East Timor (Timor-Leste)
    'FJ': entitledEVisa30([{ text: 'A 30-day single-entry e-Visa is available via www.evisa.gov.tr. Alternatively, a 90-day multiple-entry visa may be obtained from Turkish diplomatic missions abroad. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'MU': entitledEVisa30([{ text: 'A 1-month multiple-entry e-Visa is available via www.evisa.gov.tr. Alternatively, a 3-month multiple-entry visa may be obtained from Turkish diplomatic missions abroad. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'MX': entitledEVisa30([{ text: 'A 30-day single-entry e-Visa is available via www.evisa.gov.tr. Alternatively, a 90-day multiple-entry visa may be obtained from Turkish diplomatic missions abroad. Diplomatic passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'NA': entitledEVisa30([{ text: 'e-Visa available via www.evisa.gov.tr as of 5 May 2025. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'ZA': entitledEVisa30([{ text: 'A 1-month single-entry e-Visa is available via www.evisa.gov.tr. Alternatively, a 3-month multiple-entry visa may be obtained from Turkish diplomatic missions abroad. Official passport holders are visa-free for up to 30 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'SR': entitledEVisa30([{ text: 'Diplomatic and service passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'VN': entitledEVisa30([{ text: 'Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),

    // ── Visa required — conditional e-Visa available ───────────────────────
    // Ordinary passport holders may apply for a 30-day e-Visa only if they
    // hold a valid Schengen/US/UK/IE visa or RP. Entry via airport only.
    // Encoded as visa_required with note — same pattern as Ireland SSVWP.
    // Future: migrate to EntitledRule with HoldsVisaForCondition.

    'AF': eVisaConditional([{ text: 'Diplomatic, ordinary, special, and service passport holders all require a visa. The conditional e-Visa option applies to ordinary, special, and service passport holders only.', source: TurkiyeSources.mfaVisaInfo }]),
    'BD': eVisaConditional([{ text: 'Diplomatic and official/service passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'CV': eVisaConditional(),
    'GQ': eVisaConditional([{ text: 'Diplomatic, official, and service passport holders are visa-free for up to 90 days in any 180-day period.', source: TurkiyeSources.mfaVisaInfo }]),
    'IN': eVisaConditional([{ text: 'Diplomatic passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'NP': eVisaConditional([{ text: 'Official passport holders may obtain a 1-month visa from Turkish diplomatic missions abroad.', source: TurkiyeSources.mfaVisaInfo }]),
    'PK': eVisaConditional([{ text: 'Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'PS': eVisaConditional([{ text: 'Diplomatic passport holders are visa-free for up to 90 days in any 180-day period. Other official passport holders require a visa.', source: TurkiyeSources.mfaVisaInfo }]),
    'PH': eVisaConditional([{ text: 'Diplomatic, official, and service passport holders are visa-free for up to 30 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'SN': eVisaConditional([{ text: 'Diplomatic passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'LK': eVisaConditional([{ text: 'The conditional e-Visa applies to both ordinary and official passport holders.', source: TurkiyeSources.mfaVisaInfo }]),
    'TW': eVisaConditional([{ text: 'The conditional e-Visa requirement is for ordinary and official passport holders.', source: TurkiyeSources.mfaVisaInfo }]),
    'YE': eVisaConditional([{ text: 'Official passport holders are visa-free for up to 30 days.', source: TurkiyeSources.mfaVisaInfo }]),

    // ── Visa required — age/partial conditional ────────────────────────────
    // Complex age-bracket rules encoded as visa_required (most common working-age
    // traveller). Age-based exemptions documented in notes.
    // Future: migrate to multiple conditional EntitledRule entitlements.

    'DZ': visaRequired([{ text: 'Ordinary passport holders aged 18–35 require a visa with no e-Visa option. Ordinary passport holders aged 15–18 and 35–65 may apply for a conditional 30-day single-entry e-Visa if they hold a valid Schengen/US/UK/Ireland visa or residence permit. Ordinary passport holders under 15 or over 65 are visa-free for 90 days in any 180-day period. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'EG': eVisaConditional([{ text: 'The conditional e-Visa requirement applies to ordinary passport holders aged 15–45 and additionally requires travel to Türkiye with Turkish Airlines, AJet, Pegasus, EgyptAir, or Air Cairo. Ordinary passport holders under 15 or over 45 may apply for an unconditional e-Visa without these conditions. Official passport holders are visa-free for up to 90 days.', source: TurkiyeSources.mfaVisaInfo }]),
    'IQ': eVisaConditional([{ text: 'The conditional e-Visa requirement applies to ordinary passport holders aged 15–50. Ordinary passport holders under 15 or over 50 are visa-free for 90 days in any 180-day period. Official passport holders are visa-free for up to 90 days in any 180-day period.', source: TurkiyeSources.mfaVisaInfo }]),
    'LY': eVisaConditional([{ text: 'The conditional e-Visa requirement applies to ordinary passport holders aged 16–45. Ordinary passport holders under 16 or over 45 are visa-free for 90 days in any 180-day period. Diplomatic and official passport holders are visa-free for up to 90 days within 6 months from first entry date.', source: TurkiyeSources.mfaVisaInfo }]),

    // ── Visa required — no e-Visa route ───────────────────────────────────
    'AO': VISA_REQUIRED,
    'BJ': VISA_REQUIRED,
    'BT': visaRequired([{ text: 'Ordinary passport holders may obtain a 15-day visa from Turkish diplomatic missions abroad.', source: TurkiyeSources.mfaVisaInfo }]),
    'BW': VISA_REQUIRED,
    'BF': VISA_REQUIRED,
    'BI': VISA_REQUIRED,
    'KH': VISA_REQUIRED,
    'CM': VISA_REQUIRED,
    'CF': VISA_REQUIRED,
    'TD': VISA_REQUIRED,
    'KM': VISA_REQUIRED,
    'CG': VISA_REQUIRED,
    'CD': VISA_REQUIRED,
    'CI': VISA_REQUIRED,
    'CU': VISA_REQUIRED,
    'DJ': VISA_REQUIRED,
    'DM': VISA_REQUIRED,
    'ER': VISA_REQUIRED,
    'SZ': VISA_REQUIRED,
    'ET': VISA_REQUIRED,
    'GA': VISA_REQUIRED,
    'GM': VISA_REQUIRED,
    'GH': VISA_REQUIRED,
    'GN': VISA_REQUIRED,
    'GW': VISA_REQUIRED,
    'GY': visaRequired([{ text: 'Ordinary passport holders may obtain a 15-day visa from Turkish diplomatic missions abroad. Official passport holders are visa-free for up to 90 days in any 180-day period.', source: TurkiyeSources.mfaVisaInfo }]),
    'HT': VISA_REQUIRED,
    'KE': VISA_REQUIRED,
    'KI': VISA_REQUIRED,
    'KN': VISA_REQUIRED,
    'LA': VISA_REQUIRED,
    'LS': VISA_REQUIRED,
    'LR': VISA_REQUIRED,
    'MG': VISA_REQUIRED,
    'MW': VISA_REQUIRED,
    'ML': VISA_REQUIRED,
    'MH': VISA_REQUIRED,
    'MR': VISA_REQUIRED,
    'FM': VISA_REQUIRED,
    'MP': VISA_REQUIRED,
    'MZ': VISA_REQUIRED,
    'MM': VISA_REQUIRED,
    'NR': visaRequired([{ text: 'Ordinary passport holders may obtain a 15-day visa from Turkish diplomatic missions abroad.', source: TurkiyeSources.mfaVisaInfo }]),
    'NE': VISA_REQUIRED,
    'NG': VISA_REQUIRED,
    'KP': VISA_REQUIRED,
    'PW': VISA_REQUIRED,
    'PG': VISA_REQUIRED,
    'RW': VISA_REQUIRED,
    'ST': VISA_REQUIRED,
    'SL': VISA_REQUIRED,
    'SB': visaRequired([{ text: 'Ordinary passport holders may obtain a 15-day visa from Turkish diplomatic missions abroad.', source: TurkiyeSources.mfaVisaInfo }]),
    'SO': VISA_REQUIRED,
    'SS': VISA_REQUIRED,
    'SD': VISA_REQUIRED,
    'SY': VISA_REQUIRED,
    'TJ': VISA_REQUIRED,
    'TZ': VISA_REQUIRED,
    'TG': VISA_REQUIRED,
    'TO': VISA_REQUIRED,
    'TM': VISA_REQUIRED,
    'TV': VISA_REQUIRED,
    'UG': VISA_REQUIRED,
    'VU': visaRequired([{ text: 'Ordinary passport holders may obtain a 15-day visa from Turkish diplomatic missions abroad.', source: TurkiyeSources.mfaVisaInfo }]),
    'WS': VISA_REQUIRED,
    'ZM': VISA_REQUIRED,
    'ZW': VISA_REQUIRED,

  },
};

/**
 * Returns the Türkiye passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes.
 */
export function getTurkiyeRule(passportCode: string | null): PassportRule {
  if (!passportCode) return TURKIYE.defaultRule;
  return TURKIYE.passportRules[passportCode] ?? TURKIYE.defaultRule;
}
