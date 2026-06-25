/**
 * schengen.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all Schengen Area visa rules by passport/nationality.
 *
 * Sources:
 *   - EU Regulation (EU) 2018/1806 Annex I (visa-required) and Annex II (visa-free)
 *   - Schengen Visa Code (Regulation EC 810/2009) Annex IV (common ATV list)
 *   - Visa Code Handbook Annex 7B (member-state-specific ATV requirements)
 *   All source URLs live in @/data/sources — SchengenSources.
 *
 * Last verified: 2026-04-08
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  PreTravelAuth,
  EntitlementCondition,
  RollingWindowLimit,
} from '@/types';
import { SchengenSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

const SCHENGEN_LIMIT: RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

// ─── Pre-travel authorisation ─────────────────────────────────────────────────

/**
 * ETIAS — European Travel Information and Authorisation System.
 * Required for all Annex II (visa-free) nationals except:
 *   - EU/EEA/Swiss nationals (free_movement)
 *   - Microstates (AD, MC, SM, VA) — explicitly ETIAS-exempt per EU guidance
 * Expected to launch late 2026. Until launch, no pre-travel auth required.
 */
const ETIAS: PreTravelAuth = {
  type: 'ETIAS',
  name: 'European Travel Information and Authorisation System',
  applicationUrl: SchengenSources.etias.directUrl,
  cost: { amount: 7, currency: 'EUR' },
  authValidityDays: 1095, // 3 years
  multiEntry: true,
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
    source: SchengenSources.visaList,
  }];
}

/**
 * Serbia (fn 12) — biometric ICAO passport; Coordination Directorate excluded.
 */
function serbiaNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued in line with ICAO standards. Does not apply to holders of Serbian passports issued by the Serbian Coordination Directorate (Koordinaciona uprava).',
    source: SchengenSources.visaList,
  }];
}

/**
 * Ukraine (fn 13) — biometric ICAO passport note.
 */
function ukraineNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued by Ukraine in line with ICAO standards.',
    source: SchengenSources.visaList,
  }];
}

/**
 * Footnotes 7 and 11 — exemption pending entry into force of an EU agreement.
 * Verify current status before travel.
 */
function pendingAgreementNote(): RuleNote[] {
  return [{
    text: 'Visa exemption applies from the date of entry into force of a visa exemption agreement to be concluded with the European Union. Verify current status before travel as the agreement may not yet be in force.',
    source: SchengenSources.visaList,
  }];
}

// ─── Entitlement helpers ──────────────────────────────────────────────────────

/**
 * Standard Schengen entitled rule — 90 days in any 180-day rolling window,
 * with ETIAS pre-travel authorisation required (once launched).
 *
 * Note placement convention (applies across all region files):
 *   entitlementNotes  → placed inside StayEntitlement.notes
 *                        Use for context about a specific entitlement condition:
 *                        e.g. "UNSCR 1244/1999 status note for Kosovo",
 *                        "diplomatic passport suspension for Georgia".
 *   ruleNotes         → placed on EntitledRule.notes
 *                        Use for context about the rule as a whole, especially
 *                        to clarify the implicit visa_required fallback when
 *                        conditions do not match.
 *
 * @param entitlementNotes  Notes placed inside entitlements[0].notes.
 * @param conditions        Conditions placed on the entitlement.
 * @param ruleNotes         Notes placed on the EntitledRule itself.
 */
function entitled(
  entitlementNotes?: RuleNote[],
  conditions?: EntitlementCondition[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [SCHENGEN_LIMIT],
      preAuth: ETIAS,
      ...(conditions !== undefined && { conditions }),
      ...(entitlementNotes !== undefined && entitlementNotes.length > 0 && { notes: entitlementNotes }),
    }],
    ...(ruleNotes !== undefined && ruleNotes.length > 0 && { notes: ruleNotes }),
  };
}

// ─── ATV helpers ──────────────────────────────────────────────────────────────

/** Note text for the common (Annex IV) ATV list. */
const ATV_COMMON_NOTE =
  'Airport transit visa required when transiting the international zone of any Schengen airport, even without entering Schengen territory.';

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

/**
 * Shared rule for the 12 Annex IV common-list ATV nationals.
 * All require an ATV to transit any Schengen airport airside.
 */
const ATV_COMMON_RULE: VisaRequiredRule = {
  access: 'visa_required',
  notes: [{ text: ATV_COMMON_NOTE, source: SchengenSources.atvCommon }],
};

const MS_NAMES: Record<string, string> = {
  AT: 'Austria',      BE: 'Belgium',        CH: 'Switzerland',  CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark',      DE: 'Germany',      EE: 'Estonia',
  EL: 'Greece',       ES: 'Spain',          FI: 'Finland',      FR: 'France',
  HR: 'Croatia',      HU: 'Hungary',        IS: 'Iceland',      IT: 'Italy',
  LT: 'Lithuania',    LU: 'Luxembourg',     LV: 'Latvia',       MT: 'Malta',
  NL: 'Netherlands',  NO: 'Norway',         PL: 'Poland',       PT: 'Portugal',
  RO: 'Romania',      SE: 'Sweden',         SI: 'Slovenia',     SK: 'Slovakia',
};

/** Annex 7B column footnote states: ATV does not apply to service/special passport holders. */
const SERVICE_SPECIAL_EXEMPT_STATES = new Set(['BE', 'ES', 'NL', 'CH']);

/**
 * Builds the notes array for a member-state-specific ATV entry (Annex 7B).
 * Automatically applies column-level exemption footnotes:
 *   - BE, ES, NL, CH: ATV does not apply to service or special passport holders.
 *   - FR: ATV applies to ordinary passport holders only (unless frNote overrides).
 *
 * @param codes   ISO codes of member states requiring an ATV for this nationality.
 * @param frNote  undefined = standard FR "ordinary only" note.
 *                null      = suppress the default FR note (provide via extras).
 *                string    = use this custom text for the FR note.
 * @param extras  Additional cell-level footnote notes appended at the end.
 */
function atvNotes(
  codes: string[],
  frNote: string | null | undefined = undefined,
  extras: RuleNote[] = [],
): RuleNote[] {
  const notes: RuleNote[] = [{
    text: `Airport transit visa required at airports in: ${codes.map(c => MS_NAMES[c]).join(', ')}. Not required at other Schengen airports.`,
    source: SchengenSources.atvSpecific,
  }];

  const exempt = codes.filter(c => SERVICE_SPECIAL_EXEMPT_STATES.has(c));
  if (exempt.length > 0) {
    notes.push({
      text: `${exempt.map(c => MS_NAMES[c]).join(', ')}: ATV requirement does not apply to holders of service or special passports.`,
      source: SchengenSources.atvSpecific,
    });
  }

  if (codes.includes('FR')) {
    if (frNote !== null) {
      notes.push({
        text: frNote ?? 'France: ATV applies to holders of ordinary passports only.',
        source: SchengenSources.atvSpecific,
      });
    }
  }

  notes.push(...extras);
  return notes;
}

// ─── Region definition ────────────────────────────────────────────────────────

export const SCHENGEN: RegionDefinition = {
  code: 'schengen',
  name: 'Schengen Area',
  memberStates: [
    'AT', 'BE', 'BG', 'HR', 'CZ', 'DK', 'EE', 'FI',
    'FR', 'DE', 'GR', 'HU', 'IS', 'IT', 'LV', 'LI',
    'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO',
    'SK', 'SI', 'ES', 'SE', 'CH',
  ],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-04-08',
  sourceUrl: SchengenSources.visaList.parentUrl,
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── EU member states — free movement ──────────────────────────────────────
    'AT': { access: 'free_movement' }, // Austria
    'BE': { access: 'free_movement' }, // Belgium
    'BG': { access: 'free_movement' }, // Bulgaria
    'HR': { access: 'free_movement' }, // Croatia
    'CY': { access: 'free_movement' }, // Cyprus
    'CZ': { access: 'free_movement' }, // Czech Republic
    'DK': { access: 'free_movement' }, // Denmark
    'EE': { access: 'free_movement' }, // Estonia
    'FI': { access: 'free_movement' }, // Finland
    'FR': { access: 'free_movement' }, // France
    'DE': { access: 'free_movement' }, // Germany
    'GR': { access: 'free_movement' }, // Greece
    'HU': { access: 'free_movement' }, // Hungary
    'IE': { access: 'free_movement' }, // Ireland
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
    // Source: EU Regulation (EU) 2018/1806 Annex II (consolidated to 2025-12-30).
    // All entitled nationals require ETIAS once launched (expected late 2026),
    // except microstates (AD, MC, SM, VA) which are explicitly ETIAS-exempt.

    // ── Unconditional — with ETIAS ────────────────────────────────────────────

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

    // ── ETIAS-exempt microstates ──────────────────────────────────────────────
    // AD, MC, SM, VA are exempt from ETIAS per current EU guidance.
    // No preAuth required.

    'AD': { access: 'entitled', entitlements: [{ limits: [SCHENGEN_LIMIT] }] }, // Andorra
    'MC': { access: 'entitled', entitlements: [{ limits: [SCHENGEN_LIMIT] }] }, // Monaco
    'SM': { access: 'entitled', entitlements: [{ limits: [SCHENGEN_LIMIT] }] }, // San Marino
    'VA': { access: 'entitled', entitlements: [{ limits: [SCHENGEN_LIMIT] }] }, // Holy See

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
    // Fn 20: Visa-free since 1 January 2024 (whichever of ETIAS launch / Jan 2024 was earlier).
    'XK': entitled(
      [{
        text: 'This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence.',
        source: SchengenSources.visaList,
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
        source: SchengenSources.visaList,
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

    // ── Airport Transit Visa — common list (Annex IV, Reg. EC 810/2009) ────────
    // These 12 nationals require an ATV to transit ANY Schengen airport airside,
    // even without entering Schengen territory.

    'AF': ATV_COMMON_RULE, // Afghanistan
    'BD': ATV_COMMON_RULE, // Bangladesh
    'CD': ATV_COMMON_RULE, // Congo (Dem. Rep.)
    'ER': ATV_COMMON_RULE, // Eritrea
    'ET': ATV_COMMON_RULE, // Ethiopia
    'GH': ATV_COMMON_RULE, // Ghana
    'IR': ATV_COMMON_RULE, // Iran
    'IQ': ATV_COMMON_RULE, // Iraq
    'NG': ATV_COMMON_RULE, // Nigeria
    'PK': ATV_COMMON_RULE, // Pakistan
    'SO': ATV_COMMON_RULE, // Somalia
    'LK': ATV_COMMON_RULE, // Sri Lanka

    // ── Airport Transit Visa — member-state specific (Annex 7B) ───────────────
    // Individual Schengen states have imposed ATV requirements beyond the common
    // list. Column-level exemptions (BE, ES, NL, CH: service/special passports;
    // FR: ordinary passports only) are applied automatically by atvNotes().
    // Cell-level footnotes are documented inline.

    // Algeria — CZ
    'DZ': { access: 'visa_required', notes: atvNotes(['CZ']) },

    // Angola — FR
    'AO': { access: 'visa_required', notes: atvNotes(['FR']) },

    // Armenia — CZ, PL
    'AM': { access: 'visa_required', notes: atvNotes(['CZ', 'PL']) },

    // Bolivia — FR
    'BO': { access: 'visa_required', notes: atvNotes(['FR']) },

    // Burkina Faso — ES
    'BF': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Cameroon — EL, ES, FR, CY
    'CM': { access: 'visa_required', notes: atvNotes(['EL', 'ES', 'FR', 'CY']) },

    // Central African Republic — ES, FR, NL
    'CF': { access: 'visa_required', notes: atvNotes(['ES', 'FR', 'NL']) },

    // Chad — CZ, ES, FR, NL
    'TD': { access: 'visa_required', notes: atvNotes(['CZ', 'ES', 'FR', 'NL']) },

    // Congo (Republic of) — EL, ES, FR
    'CG': { access: 'visa_required', notes: atvNotes(['EL', 'ES', 'FR']) },

    // Côte d'Ivoire — ES, FR
    'CI': { access: 'visa_required', notes: atvNotes(['ES', 'FR']) },

    // Cuba — CZ, DE, ES, FR, NL, PL, CH
    'CU': { access: 'visa_required', notes: atvNotes(['CZ', 'DE', 'ES', 'FR', 'NL', 'PL', 'CH']) },

    // Djibouti — ES
    'DJ': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Dominican Republic — BE, FR
    'DO': { access: 'visa_required', notes: atvNotes(['BE', 'FR']) },

    // Egypt — CZ, ES, PL, RO
    'EG': { access: 'visa_required', notes: atvNotes(['CZ', 'ES', 'PL', 'RO']) },

    // Gambia — ES
    'GM': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Guinea — BE, ES, FR, NL, PT
    // Cell fn 6 on FR: ATV applies to both ordinary AND service passport holders.
    'GN': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'ES', 'FR', 'NL', 'PT'],
        'France: ATV applies to both ordinary and service passport holders (unlike most entries where France requires ATV for ordinary passports only).',
      ),
    },

    // Guinea-Bissau — BE, ES, NL
    'GW': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'NL']) },

    // Haiti — BE, ES, FR
    // Cell fn 8 on ES: ordinary passports issued from 1 September 2021 only.
    'HT': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'ES', 'FR'],
        undefined,
        [{ text: 'Spain: for ordinary passports, ATV applies only to those issued from 1 September 2021.', source: SchengenSources.atvSpecific }],
      ),
    },

    // India — CZ, DE, FR, RO
    'IN': { access: 'visa_required', notes: atvNotes(['CZ', 'DE', 'FR', 'RO']) },

    // Jordan — DE
    // Cell fn 9 on DE: exempt if holder has valid AU/IL/NZ visa + onward ticket,
    // or returning to Jordan after authorised stay. Onward flight within 12 hours.
    'JO': {
      access: 'visa_required',
      notes: atvNotes(
        ['DE'],
        undefined,
        [{
          text: 'Germany exemption: ATV not required for holders of a valid visa for Australia, Israel, or New Zealand with a confirmed onward ticket to that country, or those returning to Jordan after an authorised stay in one of those countries. Onward flight must depart within 12 hours of arrival in Germany.',
          source: SchengenSources.atvSpecific,
        }],
      ),
    },

    // Kenya — ES
    'KE': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Lebanon — CZ, DE, RO
    'LB': { access: 'visa_required', notes: atvNotes(['CZ', 'DE', 'RO']) },

    // Liberia — ES
    'LR': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Libya — CZ
    'LY': { access: 'visa_required', notes: atvNotes(['CZ']) },

    // Mali — CZ, DE, ES, FR
    'ML': { access: 'visa_required', notes: atvNotes(['CZ', 'DE', 'ES', 'FR']) },

    // Mauritania — CZ, ES, FR, NL
    'MR': { access: 'visa_required', notes: atvNotes(['CZ', 'ES', 'FR', 'NL']) },

    // Morocco — RO
    'MA': { access: 'visa_required', notes: atvNotes(['RO']) },

    // Nepal — BE, ES, FR, NL, RO
    'NP': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'FR', 'NL', 'RO']) },

    // Niger — CZ
    'NE': { access: 'visa_required', notes: atvNotes(['CZ']) },

    // Palestinians — BE, CZ, ES, FR, RO
    // Cell fn 14 on FR: applies to travel document for Palestinian refugees only.
    'PS': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'CZ', 'ES', 'FR', 'RO'],
        null, // suppress default FR note — fn 14 is more specific
        [{ text: 'France: ATV applies only to holders of the travel document for Palestinian refugees.', source: SchengenSources.atvSpecific }],
      ),
    },

    // Philippines — FR
    // Cell fn 10 on FR: sea crew with seafarer's identity document are exempt.
    'PH': {
      access: 'visa_required',
      notes: atvNotes(
        ['FR'],
        "France: ATV applies to holders of ordinary passports. Sea crew holding a valid seafarer's identity document issued under ILO Conventions No. 108 (1958) or No. 185 (2003) and the FAL Convention are exempt.",
      ),
    },

    // Russia — CZ, ES, FR
    // Cell fn 11 on FR: applies only to nationals departing from airports in
    // Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt.
    'RU': {
      access: 'visa_required',
      notes: atvNotes(
        ['CZ', 'ES', 'FR'],
        'France: ATV applies to ordinary passports only, and only for Russian nationals departing from airports in Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt.',
      ),
    },

    // Senegal — ES, FR, IT, NL, PT
    'SN': { access: 'visa_required', notes: atvNotes(['ES', 'FR', 'IT', 'NL', 'PT']) },

    // Sierra Leone — ES, FR, NL
    'SL': { access: 'visa_required', notes: atvNotes(['ES', 'FR', 'NL']) },

    // South Sudan — BE, CZ, DE, FR, NL
    'SS': { access: 'visa_required', notes: atvNotes(['BE', 'CZ', 'DE', 'FR', 'NL']) },

    // Sudan — BE, CZ, DE, EL, ES, FR, CY, NL
    'SD': { access: 'visa_required', notes: atvNotes(['BE', 'CZ', 'DE', 'EL', 'ES', 'FR', 'CY', 'NL']) },

    // Syria — BE, CZ, DK, DE, EL, ES, FR, IT, NL, AT, RO, NO, CH
    'SY': { access: 'visa_required', notes: atvNotes(['BE', 'CZ', 'DK', 'DE', 'EL', 'ES', 'FR', 'IT', 'NL', 'AT', 'RO', 'NO', 'CH']) },

    // Tajikistan — BE, ES, IT, RO
    'TJ': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'IT', 'RO']) },

    // Togo — ES, FR
    'TG': { access: 'visa_required', notes: atvNotes(['ES', 'FR']) },

    // Tunisia — RO
    'TN': { access: 'visa_required', notes: atvNotes(['RO']) },

    // Türkiye — BE, CZ, DE, ES, FR, CY, NL, NO, CH
    // Cell fn 12 on NL: seafarers with valid seafarer's identity document also exempt.
    'TR': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'CZ', 'DE', 'ES', 'FR', 'CY', 'NL', 'NO', 'CH'],
        undefined,
        [{
          text: "Netherlands: additionally, ATV does not apply to seafarers holding a valid seafarer's identity document issued under ILO Conventions No. 108 (1958) or No. 185 (2003) and the FAL Convention.",
          source: SchengenSources.atvSpecific,
        }],
      ),
    },

    // Uzbekistan — BE, ES, FR, IT, PT, RO
    'UZ': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'FR', 'IT', 'PT', 'RO']) },

    // Yemen — BE, CZ, ES, NL, RO
    'YE': { access: 'visa_required', notes: atvNotes(['BE', 'CZ', 'ES', 'NL', 'RO']) },

  },
};

/**
 * Returns the Schengen passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes.
 */
export function getSchengenRule(passportCode: string | null): PassportRule {
  if (!passportCode) return SCHENGEN.defaultRule;
  return SCHENGEN.passportRules[passportCode] ?? SCHENGEN.defaultRule;
}
