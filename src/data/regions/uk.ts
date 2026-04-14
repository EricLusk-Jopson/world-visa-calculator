/**
 * uk.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Visa and entry rules for the United Kingdom (England, Scotland, Wales,
 * Northern Ireland).
 *
 * ── Visa scheme overview ─────────────────────────────────────────────────────
 *
 * STANDARD VISITOR VISA / VISA-FREE ENTRY
 *   Most nationals visit the UK under the "Standard Visitor" route. Those from
 *   visa-required countries must obtain a Standard Visitor Visa in advance.
 *   Visa-exempt nationals may enter for up to SIX MONTHS (180 days) per visit.
 *   Unlike Schengen, the UK does not apply a rolling-window calculation —
 *   the limit is per visit, not an aggregate over a period.
 *
 *   Source (visitor route): https://www.gov.uk/standard-visitor
 *   Source (visa nationals list): https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list
 *
 * ELECTRONIC TRAVEL AUTHORISATION (ETA)
 *   The ETA scheme rolled out in phases:
 *     Phase 1 — 15 Nov 2023: Qatar
 *     Phase 2 — 22 Feb 2024: Bahrain, Kuwait, Oman, UAE, Saudi Arabia
 *     Phase 3 — 08 Jan 2025: ~60 nationalities (Anglosphere, Americas,
 *                             East/South-East Asia, Pacific, Middle East)
 *     Phase 4 — 02 Apr 2025: EU/EEA countries + Monaco, San Marino, Vatican,
 *                             Switzerland, Liechtenstein, Andorra
 *   An ETA is NOT a visa — it is a pre-travel electronic clearance linked to
 *   the passport. It costs £10 and is valid for 2 years or until passport
 *   expiry. Nationals who already require a visa are unaffected.
 *   Irish citizens are permanently exempt (CTA).
 *
 *   Source (ETA): https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta
 *   Source (ETA national list): https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list
 *
 * DIRECT AIRSIDE TRANSIT VISA (DATV)
 *   Certain visa-required nationals also need a DATV to pass through the
 *   international (airside) zone of a UK airport without passing through
 *   immigration. This is in addition to, not instead of, a visitor visa for
 *   actual entry to the UK.
 *
 *   Source (carriers list): https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers
 *
 * COMMON TRAVEL AREA (CTA)
 *   Irish citizens enjoy freedom of movement throughout the UK under the
 *   Common Travel Area — a bilateral arrangement predating both countries'
 *   EU membership. Irish citizens do not require a visa, ETA, or any other
 *   pre-travel authorisation to enter the UK. They may live and work freely.
 *
 *   Source (CTA): https://www.gov.uk/government/publications/common-travel-area-guidance
 *
 * ── Coverage note ────────────────────────────────────────────────────────────
 *   This file covers all nationalities listed in:
 *   - Appendix ETA National List (ETA required)
 *   - Appendix Visitor Visa National List (visa required)
 *   - Carriers' DATV list (airside transit visa required)
 *   The defaultRule is visa_required for any nationality not explicitly listed.
 *
 * Last verified: 2026-04-14
 */

import type { RegionDefinition, PassportRule, SourceDoc } from '@/types';

// ─── Source document references ───────────────────────────────────────────────

/** UK Immigration Rules — Appendix ETA National List */
const ETA_LIST_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list',
  parentUrl: 'https://www.gov.uk/eta',
  dateChecked: '2026-04-14',
};

/** UK Immigration Rules — Appendix Visitor Visa National List */
const VNL_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list',
  parentUrl: 'https://www.gov.uk/guidance/immigration-rules',
  dateChecked: '2026-04-14',
};

/** UK carriers DATV requirement list */
const DATV_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers',
  parentUrl: 'https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers',
  dateChecked: '2026-04-14',
};

/** Common Travel Area — official guidance */
const CTA_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance',
  parentUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance',
  dateChecked: '2026-04-14',
};

// ─── Shared note text ─────────────────────────────────────────────────────────

const ETA_NOTE =
  'An Electronic Travel Authorisation (ETA) is required before travelling. ' +
  'The ETA costs £10, is linked to your passport, and is valid for 2 years ' +
  'or until the passport expires. Apply at: https://www.gov.uk/apply-electronic-travel-authorisation';

const DATV_NOTE =
  'A Direct Airside Transit Visa (DATV) is required to transit through a UK ' +
  'airport without passing through immigration (airside only). This is separate ' +
  'from the Standard Visitor Visa required for entry to the UK.';

const CTA_NOTE =
  'Irish citizens have unrestricted freedom of movement throughout the UK ' +
  'under the Common Travel Area (CTA). No visa, ETA, or pre-travel ' +
  'authorisation is required.';

// ─── Shared rule constants ────────────────────────────────────────────────────

const ETA_RULE: PassportRule = {
  access: 'visa_free',
  allowanceDays: 180,
  windowDays: 365,
  requiresETA: true,
  notes: [{ text: ETA_NOTE, source: ETA_LIST_SOURCE }],
};

const DATV_RULE: PassportRule = {
  access: 'visa_required',
  requiresDATV: true,
  notes: [{ text: DATV_NOTE, source: DATV_SOURCE }],
};

const VISA_REQUIRED: PassportRule = {
  access: 'visa_required',
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const UNITED_KINGDOM: RegionDefinition = {
  code: 'united-kingdom',
  name: 'United Kingdom',
  memberStates: ['GB'],

  // The Standard Visitor route permits up to 6 months (180 days) per visit.
  // IMPORTANT: This is a per-visit limit, NOT a rolling 180-day window like
  // Schengen. Multiple consecutive visits may be scrutinised by Border Force
  // even if each individual visit is under 180 days.
  rule: {
    allowanceDays: 180,
    windowDays: 365,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },

  lastVerified: '2026-04-14',
  sourceUrl: 'https://www.gov.uk/standard-visitor',

  defaultRule: { access: 'visa_required' },

  passportRules: {

    // ── British citizens ───────────────────────────────────────────────────
    'GB': { access: 'free_movement' },

    // ── Common Travel Area — Irish citizens ────────────────────────────────
    'IE': {
      access: 'free_movement',
      notes: [{ text: CTA_NOTE, source: CTA_SOURCE }],
    },

    // ── ETA required — Phase 1 (15 Nov 2023) ─────────────────────────────
    'QA': ETA_RULE,

    // ── ETA required — Phase 2 (22 Feb 2024) ─────────────────────────────
    'BH': ETA_RULE,
    'KW': ETA_RULE,
    'OM': ETA_RULE,
    'AE': ETA_RULE,
    'SA': ETA_RULE,

    // ── ETA required — Phase 3 (8 Jan 2025) ──────────────────────────────
    // Anglosphere + Caribbean Commonwealth
    'AG': ETA_RULE,
    'AU': ETA_RULE,
    'BB': ETA_RULE,
    'BZ': ETA_RULE,
    'BS': ETA_RULE,
    'CA': ETA_RULE,
    'GD': ETA_RULE,
    'KN': ETA_RULE,
    'LC': ETA_RULE,
    'NZ': ETA_RULE,
    'VC': ETA_RULE,
    // Americas
    'AR': ETA_RULE,
    'BR': ETA_RULE,
    'CL': ETA_RULE,
    'CR': ETA_RULE,
    'GT': ETA_RULE,
    'GY': ETA_RULE,
    'MX': ETA_RULE,
    'PA': ETA_RULE,
    'PY': ETA_RULE,
    'PE': ETA_RULE,
    'UY': ETA_RULE,
    // East / South-East Asia
    'BN': ETA_RULE,
    'HK': ETA_RULE,
    'JP': ETA_RULE,
    'KR': ETA_RULE,
    'MO': ETA_RULE,
    'MY': ETA_RULE,
    'SG': ETA_RULE,
    // Pacific
    'KI': ETA_RULE,
    'MH': ETA_RULE,
    'FM': ETA_RULE,
    'NR': ETA_RULE,
    'PW': ETA_RULE,
    'PG': ETA_RULE,
    'WS': ETA_RULE,
    'SB': ETA_RULE,
    'TO': ETA_RULE,
    'TV': ETA_RULE,
    'VU': ETA_RULE,
    // Other
    'IL': ETA_RULE,
    'MV': ETA_RULE,
    'MU': ETA_RULE,
    'SC': ETA_RULE,
    'US': ETA_RULE,

    // ── ETA required — Phase 4 (2 Apr 2025) ──────────────────────────────
    // EU member states (post-Brexit — no longer free movement)
    'AT': ETA_RULE,
    'BE': ETA_RULE,
    'BG': ETA_RULE,
    'HR': ETA_RULE,
    'CY': ETA_RULE,
    'CZ': ETA_RULE,
    'DK': ETA_RULE,
    'EE': ETA_RULE,
    'FI': ETA_RULE,
    'FR': ETA_RULE,
    'DE': ETA_RULE,
    'GR': ETA_RULE,
    'HU': ETA_RULE,
    'IT': ETA_RULE,
    'LV': ETA_RULE,
    'LT': ETA_RULE,
    'LU': ETA_RULE,
    'MT': ETA_RULE,
    'NL': ETA_RULE,
    'PL': ETA_RULE,
    'PT': ETA_RULE,
    'RO': ETA_RULE,
    'SK': ETA_RULE,
    'SI': ETA_RULE,
    'ES': ETA_RULE,
    'SE': ETA_RULE,
    // EEA non-EU
    'IS': ETA_RULE,
    'LI': ETA_RULE,
    'NO': ETA_RULE,
    // Switzerland + micro-states
    'CH': ETA_RULE,
    'AD': ETA_RULE,
    'MC': ETA_RULE,
    'SM': ETA_RULE,
    'VA': ETA_RULE,

    // ── Taiwan — visa required, but ETA-eligible for certain passports ────
    // Taiwan is on the Visitor Visa National List. However, holders of a
    // Taiwan passport that includes a national identity card number are
    // eligible for an ETA instead of a visa. Classify as visa_required with
    // explanatory note.
    'TW': {
      access: 'visa_required',
      notes: [{
        text:
          'Taiwan passport holders whose passport includes a national identity ' +
          'card number are eligible to apply for an ETA (£10) rather than a ' +
          'Standard Visitor Visa. Check the UKVI ETA guidance to confirm eligibility.',
        source: ETA_LIST_SOURCE,
      }],
    },

    // ── China — visa required + DATV for airside transit ─────────────────
    // China mainland passports require a DATV for airside transit.
    // Exception: Hong Kong SAR (HK) and Macao SAR (MO) passport holders
    // are in the ETA scheme (see above).
    'CN': {
      access: 'visa_required',
      requiresDATV: true,
      notes: [
        { text: DATV_NOTE, source: DATV_SOURCE },
        {
          text:
            'Holders of Hong Kong SAR or Macao SAR passports are NOT subject ' +
            'to this requirement and may apply for an ETA instead.',
          source: ETA_LIST_SOURCE,
        },
      ],
    },

    // ── Venezuela — DATV for non-biometric passport holders ───────────────
    // Biometric VE passport holders are visa-required (no DATV).
    // Non-biometric VE passport holders require a DATV for airside transit.
    'VE': {
      access: 'visa_required',
      requiresDATV: true,
      notes: [
        { text: DATV_NOTE, source: DATV_SOURCE },
        {
          text:
            'Holders of a biometric Venezuelan passport do NOT require a DATV ' +
            'for airside transit, but still require a Standard Visitor Visa to ' +
            'enter the UK.',
          source: DATV_SOURCE,
        },
      ],
    },

    // ── Visa required + DATV (airside transit visa required) ─────────────
    // These nationalities require both a visitor visa to enter the UK AND
    // a DATV to transit UK airports airside.
    // Source: UK visa requirements for international carriers (carriers list).
    'AF': DATV_RULE,
    'AL': DATV_RULE,
    'DZ': DATV_RULE,
    'AO': DATV_RULE,
    'BD': DATV_RULE,
    'BY': DATV_RULE,
    'BW': DATV_RULE,
    'BI': DATV_RULE,
    'CM': DATV_RULE,
    'CO': DATV_RULE,
    'CG': DATV_RULE,
    'CD': DATV_RULE,
    'DM': DATV_RULE,
    'EG': DATV_RULE,
    'SV': DATV_RULE,
    'ER': DATV_RULE,
    'SZ': DATV_RULE,
    'ET': DATV_RULE,
    'GM': DATV_RULE,
    'GE': DATV_RULE,
    'GH': DATV_RULE,
    'GN': DATV_RULE,
    'GW': DATV_RULE,
    'HN': DATV_RULE,
    'IN': DATV_RULE,
    'IR': DATV_RULE,
    'IQ': DATV_RULE,
    'JM': DATV_RULE,
    'JO': DATV_RULE,
    'KE': DATV_RULE,
    'XK': DATV_RULE,  // Kosovo (XK = user-assigned ISO code)
    'LB': DATV_RULE,
    'LS': DATV_RULE,
    'LR': DATV_RULE,
    'LY': DATV_RULE,
    'MW': DATV_RULE,
    'MD': DATV_RULE,
    'MN': DATV_RULE,
    'MM': DATV_RULE,
    'NA': DATV_RULE,
    'NP': DATV_RULE,
    'NI': DATV_RULE,
    'NG': DATV_RULE,
    'MK': DATV_RULE,  // North Macedonia
    'PK': DATV_RULE,
    'PS': DATV_RULE,
    'RU': DATV_RULE,
    'RW': DATV_RULE,
    'SN': DATV_RULE,
    'RS': DATV_RULE,
    'SL': DATV_RULE,
    'SO': DATV_RULE,
    'ZA': DATV_RULE,
    'SS': DATV_RULE,
    'LK': DATV_RULE,
    'SD': DATV_RULE,
    'SY': DATV_RULE,
    'TZ': DATV_RULE,
    'TL': DATV_RULE,
    'TT': DATV_RULE,
    'TR': DATV_RULE,
    'UG': DATV_RULE,
    'VN': DATV_RULE,
    'YE': DATV_RULE,
    'ZW': DATV_RULE,

    // ── Visa required only (no DATV) ─────────────────────────────────────
    // These nationalities require a Standard Visitor Visa but do NOT need
    // a DATV for airside transit.
    'AM': VISA_REQUIRED,
    'AZ': VISA_REQUIRED,
    'BJ': VISA_REQUIRED,
    'BT': VISA_REQUIRED,
    'BO': VISA_REQUIRED,
    'BA': VISA_REQUIRED,
    'BF': VISA_REQUIRED,
    'KH': VISA_REQUIRED,
    'CV': VISA_REQUIRED,
    'CF': VISA_REQUIRED,
    'TD': VISA_REQUIRED,
    'KM': VISA_REQUIRED,
    'CU': VISA_REQUIRED,
    'DJ': VISA_REQUIRED,
    'DO': VISA_REQUIRED,
    'EC': VISA_REQUIRED,
    'GQ': VISA_REQUIRED,
    'FJ': VISA_REQUIRED,
    'GA': VISA_REQUIRED,
    'HT': VISA_REQUIRED,
    'ID': VISA_REQUIRED,
    'KZ': VISA_REQUIRED,
    'KP': VISA_REQUIRED,
    'KG': VISA_REQUIRED,
    'LA': VISA_REQUIRED,
    'MG': VISA_REQUIRED,
    'ML': VISA_REQUIRED,
    'MR': VISA_REQUIRED,
    'ME': VISA_REQUIRED,
    'MA': VISA_REQUIRED,
    'MZ': VISA_REQUIRED,
    'NE': VISA_REQUIRED,
    'PH': VISA_REQUIRED,
    'ST': VISA_REQUIRED,
    'SR': VISA_REQUIRED,
    'TJ': VISA_REQUIRED,
    'TH': VISA_REQUIRED,
    'TG': VISA_REQUIRED,
    'TN': VISA_REQUIRED,
    'TM': VISA_REQUIRED,
    'UA': VISA_REQUIRED,
    'UZ': VISA_REQUIRED,
    'ZM': VISA_REQUIRED,

  },
};

export function getUKRule(passportCode: string | null): PassportRule {
  if (!passportCode) return UNITED_KINGDOM.defaultRule;
  return UNITED_KINGDOM.passportRules[passportCode] ?? UNITED_KINGDOM.defaultRule;
}
