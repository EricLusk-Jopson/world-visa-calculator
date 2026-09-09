/**
 * cyprus.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Cyprus's visa rules by passport/nationality.
 *
 * Sources:
 *   - EU Regulation (EU) 2018/1806 Annex I (visa-required) and Annex II (visa-free)
 *   All source URLs live in @/data/sources — CyprusSources.
 *
 * ── Why this file mirrors schengen.ts ───────────────────────────────────────
 *
 * Cyprus is an EU member state but not (yet) a Schengen-implementing state.
 * For entry-visa purposes it applies the same underlying EU list — Reg.
 * 2018/1806 Annex I/II — that already underlies schengen.ts's own visa
 * determination in this codebase. Per explicit product decision, this file
 * copies schengen.ts's Annex I/II logic (access category, conditions, and
 * footnote notes) verbatim rather than re-deriving it from the source PDF by
 * hand, re-sourced to CyprusSources.visaList.
 *
 * This deliberately sidesteps a real ambiguity in the source PDF's text:
 * Bosnia, North Macedonia, and Georgia are all superscripted "³" on the page
 * they appear on, but the footnote 3 text shown on the following page is
 * actually Serbia's distinct "Coordination Directorate" carve-out — a
 * mismatch that looks like a page-local footnote-renumbering artifact in the
 * PDF, not real regulation text. schengen.ts already resolves this correctly
 * (BA/MK get a plain biometric-passport condition; GE gets biometric passport
 * plus its own distinct suspension note; only RS gets the Coordination
 * Directorate text), so copying it sidesteps re-solving an ambiguity that's
 * already been correctly resolved upstream.
 *
 * ── What is deliberately NOT copied from schengen.ts ────────────────────────
 *
 * - ETIAS pre-travel authorisation: Schengen-specific; Cyprus does not
 *   participate in ETIAS since it isn't a Schengen-implementing state. No
 *   entitled entry below carries a `preAuth` field.
 * - Airport Transit Visa (ATV) notes/rules, both the 12-country common list
 *   and the member-state-specific list: these govern transiting *Schengen*
 *   airports specifically and are irrelevant to entering Cyprus. Every
 *   ATV-tagged country in schengen.ts is independently confirmed present in
 *   the source PDF's own Annex I (visa-required) list, so stripping the ATV
 *   note just leaves the correct underlying determination — plain
 *   `visa_required`, same as any other Annex I country.
 * - Vanuatu: the source PDF's own footnote says the visa-exemption
 *   suspension ran Feb 2023–Aug 2024 (now expired), which would make
 *   Vanuatu currently visa-exempt again — but schengen.ts has no `VU` entry
 *   at all (an apparent unpatched gap, falling through to `visa_required`
 *   via the default rule). Per explicit decision, this file mirrors
 *   Schengen's current behavior rather than independently correcting it: no
 *   `VU` entry here either, same visa_required-via-fallback outcome on both
 *   regions.
 *
 * Cyprus's own member state (CY) is intentionally not included as a
 * passport-rule entry, matching every other region file in this codebase.
 *
 * Last verified: 2026-09-09
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  EntitlementCondition,
  RollingWindowLimit,
} from '@/types';
import { CyprusSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

const CYPRUS_LIMIT: RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

// ─── Shared conditions ────────────────────────────────────────────────────────

/**
 * Annex II footnotes 6, 9, 10, 12, 13, 19 — biometric passport required.
 * Used as a condition on entitlements where the visa exemption applies only
 * to holders of biometric passports (with or without ICAO qualification).
 */
function biometricCondition(): EntitlementCondition[] {
  return [{ type: 'biometric_passport' }];
}

// ─── Shared note builders (Annex II footnotes) ────────────────────────────────

/**
 * Moldova (fn 9) — biometric ICAO passport note.
 * Condition is biometricCondition(); this note adds the ICAO qualification.
 */
function moldovaNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued by Moldova in line with ICAO standards.',
    source: CyprusSources.visaList,
  }];
}

/**
 * Serbia (fn 12) — biometric ICAO passport; Coordination Directorate excluded.
 */
function serbiaNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued in line with ICAO standards. Does not apply to holders of Serbian passports issued by the Serbian Coordination Directorate (Koordinaciona uprava).',
    source: CyprusSources.visaList,
  }];
}

/**
 * Ukraine (fn 13) — biometric ICAO passport note.
 */
function ukraineNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued by Ukraine in line with ICAO standards.',
    source: CyprusSources.visaList,
  }];
}

/**
 * Footnotes 7 and 11 — exemption pending entry into force of an EU agreement.
 * Verify current status before travel.
 */
function pendingAgreementNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies from the date of entry into force of a visa exemption agreement to be concluded with the European Union. Verify current status before travel as the agreement may not yet be in force.',
    source: CyprusSources.visaList,
  }];
}

// ─── Entitlement helper ────────────────────────────────────────────────────────

/**
 * Standard Cyprus entitled rule — 90 days in any 180-day rolling window.
 * No `preAuth` — unlike schengen.ts's equivalent helper, this never carries
 * ETIAS, since ETIAS does not apply to entering Cyprus (see file header).
 *
 * Note placement convention (matches schengen.ts):
 *   entitlementNotes  → placed inside StayEntitlement.notes
 *   conditions        → placed on the entitlement (e.g. biometricCondition())
 *   ruleNotes         → placed on EntitledRule.notes (rule-level context)
 */
function entitled(
  entitlementNotes?: RuleNote[],
  conditions?: EntitlementCondition[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [CYPRUS_LIMIT],
      source: CyprusSources.visaList,
      ...(conditions !== undefined && { conditions }),
      ...(entitlementNotes !== undefined && entitlementNotes.length > 0 && { notes: entitlementNotes }),
    }],
    ...(ruleNotes !== undefined && ruleNotes.length > 0 && { notes: ruleNotes }),
  };
}

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required', source: CyprusSources.visaList };

// ─── Region definition ────────────────────────────────────────────────────────

export const CYPRUS: RegionDefinition = {
  code: 'cyprus',
  name: 'Cyprus',
  memberStates: ['CY'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-09',
  sourceUrl: CyprusSources.visaList.parentUrl,
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── EU member states (excluding Cyprus itself) — free movement ───────────
    'AT': { access: 'free_movement' }, // Austria
    'BE': { access: 'free_movement' }, // Belgium
    'BG': { access: 'free_movement' }, // Bulgaria
    'HR': { access: 'free_movement' }, // Croatia
    'CZ': { access: 'free_movement' }, // Czech Republic
    'DK': { access: 'free_movement' }, // Denmark
    'EE': { access: 'free_movement' }, // Estonia
    'FI': { access: 'free_movement' }, // Finland
    'FR': { access: 'free_movement' }, // France
    'DE': { access: 'free_movement' }, // Germany
    'GR': { access: 'free_movement' }, // Greece
    'HU': { access: 'free_movement' }, // Hungary
    'IE': { access: 'free_movement' }, // Ireland (EU, non-Schengen — same free-movement precedent applies to Cyprus itself)
    'IT': { access: 'free_movement' }, // Italy
    'LV': { access: 'free_movement' }, // Latvia
    'LT': { access: 'free_movement' }, // Lithuania
    'LU': { access: 'free_movement' }, // Luxembourg
    'MT': { access: 'free_movement' }, // Malta
    'NL': { access: 'free_movement' }, // Netherlands
    'PL': { access: 'free_movement' }, // Poland
    'PT': { access: 'free_movement' }, // Portugal
    'RO': { access: 'free_movement' }, // Romania
    'SK': { access: 'free_movement' }, // Slovakia
    'SI': { access: 'free_movement' }, // Slovenia
    'ES': { access: 'free_movement' }, // Spain
    'SE': { access: 'free_movement' }, // Sweden

    // ── EEA + Switzerland — free movement ─────────────────────────────────────
    'IS': { access: 'free_movement' }, // Iceland
    'LI': { access: 'free_movement' }, // Liechtenstein
    'NO': { access: 'free_movement' }, // Norway
    'CH': { access: 'free_movement' }, // Switzerland

    // ── Entitled — 90 days in any 180-day period ──────────────────────────────
    // Source: EU Regulation (EU) 2018/1806 Annex II. No preAuth (ETIAS does
    // not apply to Cyprus — see file header), so the "unconditional" and
    // "ETIAS-exempt microstate" buckets from schengen.ts collapse into one
    // group here — both are just plain entitled() with no preAuth.

    'AG': entitled(), // Antigua and Barbuda
    'AR': entitled(), // Argentina
    'AU': entitled(), // Australia
    'BB': entitled(), // Barbados
    'BN': entitled(), // Brunei
    'BR': entitled(), // Brazil
    'BS': entitled(), // Bahamas
    'CA': entitled(), // Canada
    'CL': entitled(), // Chile
    'CO': entitled(), // Colombia
    'CR': entitled(), // Costa Rica
    'GB': entitled(), // United Kingdom
    'GT': entitled(), // Guatemala
    'HN': entitled(), // Honduras
    'IL': entitled(), // Israel
    'JP': entitled(), // Japan
    'KN': entitled(), // Saint Kitts and Nevis
    'KR': entitled(), // South Korea
    'MU': entitled(), // Mauritius
    'MX': entitled(), // Mexico
    'MY': entitled(), // Malaysia
    'NI': entitled(), // Nicaragua
    'NZ': entitled(), // New Zealand
    'PA': entitled(), // Panama
    'PY': entitled(), // Paraguay
    'SB': entitled(), // Solomon Islands
    'SC': entitled(), // Seychelles
    'SG': entitled(), // Singapore
    'SV': entitled(), // El Salvador
    'TT': entitled(), // Trinidad and Tobago
    'US': entitled(), // United States
    'UY': entitled(), // Uruguay
    'VE': entitled(), // Venezuela
    'WS': entitled(), // Samoa
    'AD': entitled(), // Andorra
    'MC': entitled(), // Monaco
    'SM': entitled(), // San Marino
    'VA': entitled(), // Holy See

    // ── Biometric passport required (Annex II footnotes 6 and 10) ─────────────
    // Exemption applies to holders of biometric passports only.

    'AL': entitled(undefined, biometricCondition()), // Albania (fn 6)
    'BA': entitled(undefined, biometricCondition()), // Bosnia and Herzegovina (fn 6)
    'MK': entitled(undefined, biometricCondition()), // North Macedonia (fn 6)
    'ME': entitled(undefined, biometricCondition()), // Montenegro (fn 10)

    // ── Biometric ICAO passport required ─────────────────────────────────────

    // Footnote 9 — Moldova biometric ICAO passport.
    'MD': entitled(moldovaNote(), biometricCondition()),

    // Footnote 12 — Serbia biometric ICAO passport; Coordination Directorate excluded.
    'RS': entitled(serbiaNote(), biometricCondition()),

    // Footnote 13 — Ukraine biometric ICAO passport.
    'UA': entitled(ukraineNote(), biometricCondition()),

    // ── Specific document type required ───────────────────────────────────────

    // Footnote 14 — HKSAR passport only.
    'HK': entitled(undefined, [{
      type: 'passport_identifier',
      description: "Applies only to holders of a 'Hong Kong Special Administrative Region' passport.",
    }]),

    // Footnote 15 — Macau SAR passport only.
    'MO': entitled(undefined, [{
      type: 'passport_identifier',
      description: "Applies only to holders of a 'Região Administrativa Especial de Macau' passport.",
    }]),

    // Footnote 17 — Taiwan passport including identity card number.
    'TW': entitled(undefined, [{
      type: 'passport_identifier',
      description: 'Applies only to holders of passports issued by Taiwan which include a national identity card number.',
    }]),

    // ── Entity not recognised as state ────────────────────────────────────────

    // Kosovo — footnotes 18, 19, 20.
    // Fn 18: Designation without prejudice to positions on status (UNSCR 1244/1999).
    // Fn 19: Biometric ICAO passport required.
    // Fn 20: Visa-free since 1 January 2024.
    'XK': entitled(
      [{
        text: 'This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence.',
        source: CyprusSources.visaList,
      }],
      biometricCondition(),
    ),

    // ── Partially suspended ───────────────────────────────────────────────────

    // Georgia — Annex II footnote 8.
    // Ordinary biometric passports remain visa-free. Visa-free access suspended
    // for diplomatic, service, and official passport holders by EU Council
    // decision, March 2026 – March 2027.
    'GE': entitled(
      [{
        text: 'Diplomatic, service, and official passport holders: visa-free access suspended March 2026 to March 2027 by EU Council decision. Ordinary biometric passport holders are unaffected.',
        source: CyprusSources.visaList,
      }],
      biometricCondition(),
    ),

    // ── Pending EU visa exemption agreement (Annex II footnotes 7 and 11) ─────
    // Verify current status before travel — the agreement may not yet be in force.

    'AE': entitled(pendingAgreementNote()), // United Arab Emirates (fn 7)
    'DM': entitled(pendingAgreementNote()), // Dominica (fn 7)
    'FM': entitled(pendingAgreementNote()), // Micronesia (fn 7)
    'GD': entitled(pendingAgreementNote()), // Grenada (fn 7)
    'KI': entitled(pendingAgreementNote()), // Kiribati (fn 7)
    'LC': entitled(pendingAgreementNote()), // Saint Lucia (fn 7)
    'MH': entitled(pendingAgreementNote()), // Marshall Islands (fn 11)
    'NR': entitled(pendingAgreementNote()), // Nauru (fn 11)
    'PE': entitled(pendingAgreementNote()), // Peru (fn 11)
    'PW': entitled(pendingAgreementNote()), // Palau (fn 11)
    'TL': entitled(pendingAgreementNote()), // Timor-Leste (fn 11)
    'TO': entitled(pendingAgreementNote()), // Tonga (fn 11)
    'TV': entitled(pendingAgreementNote()), // Tuvalu (fn 11)
    'VC': entitled(pendingAgreementNote()), // Saint Vincent and the Grenadines (fn 11)

    // ── Visa required — Annex I ───────────────────────────────────────────────
    // Includes every nationality schengen.ts tags with an Airport Transit
    // Visa note (both the 12-country common list and the member-state-
    // specific list) — ATV governs transiting Schengen airports specifically
    // and does not apply to Cyprus, so these are plain visa_required here,
    // with no ATV note (see file header).

    'AF': VISA_REQUIRED, // Afghanistan
    'BD': VISA_REQUIRED, // Bangladesh
    'CD': VISA_REQUIRED, // Congo (Dem. Rep.)
    'ER': VISA_REQUIRED, // Eritrea
    'ET': VISA_REQUIRED, // Ethiopia
    'GH': VISA_REQUIRED, // Ghana
    'IR': VISA_REQUIRED, // Iran
    'IQ': VISA_REQUIRED, // Iraq
    'NG': VISA_REQUIRED, // Nigeria
    'PK': VISA_REQUIRED, // Pakistan
    'SO': VISA_REQUIRED, // Somalia
    'LK': VISA_REQUIRED, // Sri Lanka

    'DZ': VISA_REQUIRED, // Algeria
    'AO': VISA_REQUIRED, // Angola
    'AM': VISA_REQUIRED, // Armenia
    'BO': VISA_REQUIRED, // Bolivia
    'BF': VISA_REQUIRED, // Burkina Faso
    'CM': VISA_REQUIRED, // Cameroon
    'CF': VISA_REQUIRED, // Central African Republic
    'TD': VISA_REQUIRED, // Chad
    'CG': VISA_REQUIRED, // Congo (Republic of)
    'CI': VISA_REQUIRED, // Côte d'Ivoire
    'CU': VISA_REQUIRED, // Cuba
    'DJ': VISA_REQUIRED, // Djibouti
    'DO': VISA_REQUIRED, // Dominican Republic
    'EG': VISA_REQUIRED, // Egypt
    'GM': VISA_REQUIRED, // Gambia
    'GN': VISA_REQUIRED, // Guinea
    'GW': VISA_REQUIRED, // Guinea-Bissau
    'HT': VISA_REQUIRED, // Haiti
    'IN': VISA_REQUIRED, // India
    'JO': VISA_REQUIRED, // Jordan
    'KE': VISA_REQUIRED, // Kenya
    'LB': VISA_REQUIRED, // Lebanon
    'LR': VISA_REQUIRED, // Liberia
    'LY': VISA_REQUIRED, // Libya
    'ML': VISA_REQUIRED, // Mali
    'MR': VISA_REQUIRED, // Mauritania
    'MA': VISA_REQUIRED, // Morocco
    'NP': VISA_REQUIRED, // Nepal
    'NE': VISA_REQUIRED, // Niger
    'PS': VISA_REQUIRED, // Palestinian Authority
    'PH': VISA_REQUIRED, // Philippines
    'RU': VISA_REQUIRED, // Russia
    'SN': VISA_REQUIRED, // Senegal
    'SL': VISA_REQUIRED, // Sierra Leone
    'SS': VISA_REQUIRED, // South Sudan
    'SD': VISA_REQUIRED, // Sudan
    'SY': VISA_REQUIRED, // Syria
    'TJ': VISA_REQUIRED, // Tajikistan
    'TG': VISA_REQUIRED, // Togo
    'TN': VISA_REQUIRED, // Tunisia
    'TR': VISA_REQUIRED, // Türkiye
    'UZ': VISA_REQUIRED, // Uzbekistan
    'YE': VISA_REQUIRED, // Yemen

  },
};

/**
 * Returns the Cyprus passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes —
 * this also covers Vanuatu (VU), deliberately absent (see file header).
 */
export function getCyprusRule(passportCode: string | null): PassportRule {
  if (!passportCode) return CYPRUS.defaultRule;
  return CYPRUS.passportRules[passportCode] ?? CYPRUS.defaultRule;
}
