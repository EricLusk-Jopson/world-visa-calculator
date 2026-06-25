/**
 * uk.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Visa and entry rules for the United Kingdom (England, Scotland, Wales,
 * Northern Ireland).
 *
 * ── Visa scheme overview ─────────────────────────────────────────────────────
 *
 * STANDARD VISITOR VISA / VISA-FREE ENTRY
 *   Most nationals visit the UK under the "Standard Visitor" route. Visa-exempt
 *   nationals may enter for up to 180 days per visit. Unlike Schengen, the UK
 *   does not apply a rolling-window calculation — the limit is per visit.
 *   Repeated maximum-duration stays with short gaps may attract Border Force
 *   scrutiny under Appendix V ("genuine visitor" test) even when each individual
 *   visit is within the limit.
 *
 * ELECTRONIC TRAVEL AUTHORISATION (ETA)
 *   The ETA scheme rolled out in phases:
 *     Phase 1 — 15 Nov 2023: Qatar
 *     Phase 2 — 22 Feb 2024: Bahrain, Kuwait, Oman, UAE, Saudi Arabia
 *     Phase 3 — 08 Jan 2025: ~60 nationalities (Anglosphere, Americas,
 *                             East/South-East Asia, Pacific, Middle East)
 *     Phase 4 — 02 Apr 2025: EU/EEA + Monaco, San Marino, Vatican,
 *                             Switzerland, Liechtenstein, Andorra
 *   An ETA is NOT a visa. It is valid for 2 years or until passport expiry
 *   and permits multiple entries. Visa nationals are unaffected.
 *   Irish citizens are permanently exempt under the CTA.
 *
 * DIRECT AIRSIDE TRANSIT VISA (DATV)
 *   Certain visa-required nationals also need a DATV to transit through a UK
 *   airport airside without passing through immigration. This is tracked as a
 *   note on the relevant visa_required rules — it is a transit requirement,
 *   not a stay entitlement, so it does not affect calculator logic.
 *
 * COMMON TRAVEL AREA (CTA)
 *   Irish citizens have unrestricted freedom of movement throughout the UK
 *   under the CTA — a bilateral arrangement predating both countries' EU
 *   membership. No visa, ETA, or pre-travel authorisation required.
 *
 * ── Coverage ─────────────────────────────────────────────────────────────────
 *   All nationalities in Appendix ETA National List, Appendix Visitor Visa
 *   National List, and the carriers' DATV list are explicitly encoded.
 *   The defaultRule (visa_required) covers any code not listed.
 *
 * All source URLs are in UKSources (@/data/sources).
 *
 * Last verified: 2026-04-14
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  PreTravelAuth,
  PerVisitLimit,
} from '@/types';
import { UKSources } from '@/data/sources';

// ─── Stay limit ───────────────────────────────────────────────────────────────

const UK_LIMIT: PerVisitLimit = {
  type: 'per_visit',
  days: 180,
};

// ─── Pre-travel authorisation ─────────────────────────────────────────────────

const UK_ETA: PreTravelAuth = {
  type: 'ETA',
  name: 'UK Electronic Travel Authorisation',
  applicationUrl: UKSources.etaApplication.directUrl,
  cost: { amount: 20, currency: 'GBP' },
  authValidityDays: 730, // 2 years or passport expiry, whichever sooner
  multiEntry: true,
};

// ─── Shared rule constants ────────────────────────────────────────────────────

/**
 * Standard ETA rule — 180 days per visit with UK ETA pre-travel authorisation.
 * Covers all 85 ETA-scheme nationalities across all four rollout phases.
 */
const ETA_RULE: EntitledRule = {
  access: 'entitled',
  entitlements: [{
    limits: [UK_LIMIT],
    preAuth: UK_ETA,
  }],
};

const DATV_NOTE =
  'A Direct Airside Transit Visa (DATV) is required to transit through a UK ' +
  'airport without passing through immigration (airside only). This is separate ' +
  'from the Standard Visitor Visa required for entry to the UK.';

/**
 * Visa required + DATV for airside transit.
 * Used for nationalities that require both a visitor visa and a DATV.
 */
const VISA_REQUIRED_DATV: VisaRequiredRule = {
  access: 'visa_required',
  notes: [{ text: DATV_NOTE, source: UKSources.carriersList }],
};

const VISA_REQUIRED: VisaRequiredRule = {
  access: 'visa_required',
};

// ─── Main export ──────────────────────────────────────────────────────────────

export const UNITED_KINGDOM: RegionDefinition = {
  code: 'united-kingdom',
  name: 'United Kingdom',
  memberStates: ['GB'],

  rule: {
    type: 'per_visit',
    allowanceDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
    notes: [{
      text:
        'Repeated maximum-duration stays with short gaps between them may lead ' +
        'Border Force to conclude that you are using the visitor route as de facto ' +
        'residence, even when each individual visit is within the 180-day limit. ' +
        'This is assessed holistically under Appendix V of the Immigration Rules ' +
        'and is not calculable by a tool.',
      source: UKSources.standardVisitor,
    }],
  },

  lastVerified: '2026-04-14',
  sourceUrl: UKSources.standardVisitor.directUrl,
  defaultRule: VISA_REQUIRED,

  passportRules: {

    // ── Note placement convention (applies across all region files) ─────────
    //   EntitledRule.notes        → rule-level context, especially fallback explanation
    //   StayEntitlement.notes     → condition-specific context
    // See schengen.ts entitled() for full documentation.

    // ── British citizens ───────────────────────────────────────────────────
    'GB': { access: 'free_movement' },

    // ── Common Travel Area — Irish citizens ────────────────────────────────
    'IE': {
      access: 'free_movement',
      notes: [{
        text:
          'Irish citizens have unrestricted freedom of movement throughout the UK ' +
          'under the Common Travel Area (CTA). No visa, ETA, or pre-travel ' +
          'authorisation is required.',
        source: UKSources.ctaGuidance,
      }],
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
    // EU member states (post-Brexit — no longer free movement in the UK)
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

    // ── Taiwan — ETA-eligible for specific passport variant ────────────────
    // Taiwan is on the Visitor Visa National List. However, holders of a Taiwan
    // passport that includes a national identity card number are eligible for an
    // ETA rather than a Standard Visitor Visa.
    'TW': {
      access: 'entitled',
      entitlements: [{
        limits: [UK_LIMIT],
        preAuth: UK_ETA,
        conditions: [{
          type: 'passport_identifier',
          description: 'Applies only to holders of passports issued by Taiwan which include a national identity card number.',
        }],
      }],
      notes: [{
        text:
          'Only Taiwan passport holders whose passport includes a national identity ' +
          'card number are eligible for an ETA. All other Taiwan passport holders ' +
          'require a Standard Visitor Visa.',
        source: UKSources.etaNationalList,
      }],
    },

    // ── China — visa required + DATV for airside transit ──────────────────
    // China mainland passports require a DATV for airside transit.
    // HK SAR and Macao SAR passport holders are in the ETA scheme (see above).
    'CN': {
      access: 'visa_required',
      notes: [
        { text: DATV_NOTE, source: UKSources.carriersList },
        {
          text:
            'Holders of Hong Kong SAR or Macao SAR passports are NOT subject ' +
            'to this requirement and may apply for an ETA instead.',
          source: UKSources.etaNationalList,
        },
      ],
    },

    // ── Venezuela — DATV for non-biometric passport holders ───────────────
    // Biometric VE passport holders: visa required, no DATV.
    // Non-biometric VE passport holders: visa required + DATV.
    'VE': {
      access: 'visa_required',
      notes: [
        { text: DATV_NOTE, source: UKSources.carriersList },
        {
          text:
            'Holders of a biometric Venezuelan passport do NOT require a DATV ' +
            'for airside transit, but still require a Standard Visitor Visa to ' +
            'enter the UK.',
          source: UKSources.carriersList,
        },
      ],
    },

    // ── Visa required + DATV ──────────────────────────────────────────────
    // These nationalities require both a Standard Visitor Visa to enter the UK
    // and a DATV to transit UK airports airside.
    'AF': VISA_REQUIRED_DATV,
    'AL': VISA_REQUIRED_DATV,
    'DZ': VISA_REQUIRED_DATV,
    'AO': VISA_REQUIRED_DATV,
    'BD': VISA_REQUIRED_DATV,
    'BY': VISA_REQUIRED_DATV,
    'BW': VISA_REQUIRED_DATV,
    'BI': VISA_REQUIRED_DATV,
    'CM': VISA_REQUIRED_DATV,
    'CO': VISA_REQUIRED_DATV,
    'CG': VISA_REQUIRED_DATV,
    'CD': VISA_REQUIRED_DATV,
    'DM': VISA_REQUIRED_DATV,
    'EG': VISA_REQUIRED_DATV,
    'SV': VISA_REQUIRED_DATV,
    'ER': VISA_REQUIRED_DATV,
    'SZ': VISA_REQUIRED_DATV,
    'ET': VISA_REQUIRED_DATV,
    'GM': VISA_REQUIRED_DATV,
    'GE': VISA_REQUIRED_DATV,
    'GH': VISA_REQUIRED_DATV,
    'GN': VISA_REQUIRED_DATV,
    'GW': VISA_REQUIRED_DATV,
    'HN': VISA_REQUIRED_DATV,
    'IN': VISA_REQUIRED_DATV,
    'IR': VISA_REQUIRED_DATV,
    'IQ': VISA_REQUIRED_DATV,
    'JM': VISA_REQUIRED_DATV,
    'JO': VISA_REQUIRED_DATV,
    'KE': VISA_REQUIRED_DATV,
    'XK': VISA_REQUIRED_DATV, // Kosovo (XK = user-assigned ISO code)
    'LB': VISA_REQUIRED_DATV,
    'LS': VISA_REQUIRED_DATV,
    'LR': VISA_REQUIRED_DATV,
    'LY': VISA_REQUIRED_DATV,
    'MW': VISA_REQUIRED_DATV,
    'MD': VISA_REQUIRED_DATV,
    'MN': VISA_REQUIRED_DATV,
    'MM': VISA_REQUIRED_DATV,
    'NA': VISA_REQUIRED_DATV,
    'NP': VISA_REQUIRED_DATV,
    'NI': VISA_REQUIRED_DATV,
    'NG': VISA_REQUIRED_DATV,
    'MK': VISA_REQUIRED_DATV, // North Macedonia
    'PK': VISA_REQUIRED_DATV,
    'PS': VISA_REQUIRED_DATV,
    'RU': VISA_REQUIRED_DATV,
    'RW': VISA_REQUIRED_DATV,
    'SN': VISA_REQUIRED_DATV,
    'RS': VISA_REQUIRED_DATV,
    'SL': VISA_REQUIRED_DATV,
    'SO': VISA_REQUIRED_DATV,
    'ZA': VISA_REQUIRED_DATV,
    'SS': VISA_REQUIRED_DATV,
    'LK': VISA_REQUIRED_DATV,
    'SD': VISA_REQUIRED_DATV,
    'SY': VISA_REQUIRED_DATV,
    'TZ': VISA_REQUIRED_DATV,
    'TL': VISA_REQUIRED_DATV,
    'TT': VISA_REQUIRED_DATV,
    'TR': VISA_REQUIRED_DATV,
    'UG': VISA_REQUIRED_DATV,
    'VN': VISA_REQUIRED_DATV,
    'YE': VISA_REQUIRED_DATV,
    'ZW': VISA_REQUIRED_DATV,

    // ── Visa required only (no DATV) ──────────────────────────────────────
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
