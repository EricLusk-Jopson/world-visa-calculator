/**
 * schengen.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all Schengen Area visa rules by passport/nationality.
 *
 * Sources:
 *   - EU Regulation (EU) 2018/1806 Annex I (visa-required list) and Annex II (visa-free list)
 *   - Schengen Visa Code (Regulation EC 810/2009) Annex IV (common ATV list)
 *   - Visa Code Handbook Annex 7B (member-state-specific ATV requirements)
 *   - https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
 *
 * Last verified: 2026-04-08
 */

import type { RegionDefinition, PassportRule, SourceDoc } from '@/types';

// ─── Source document references ───────────────────────────────────────────────

/** Schengen Visa Code Annex IV — common (EU-wide) Airport Transit Visa list */
const ATV_COMMON_SOURCE: SourceDoc = {
  directUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629',
  parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
  dateChecked: '2026-04-08',
};

/** Visa Code Handbook Annex 7B — member-state-specific ATV requirements */
const SPECIFIC_ATV_SOURCE: SourceDoc = {
  directUrl: 'https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf',
  parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
  dateChecked: '2026-04-08',
};

/** Regulation (EU) 2018/1806 — third-country visa/exempt lists (consolidated) */
const VISA_LIST_SOURCE: SourceDoc = {
  directUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230',
  parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
  dateChecked: '2026-04-08',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds the standard ATV common-list note text */
const ATV_COMMON_NOTE =
  'Airport transit visa required when transiting the international zone of any Schengen airport, even without entering Schengen territory.';

// ─── ATV Annex 7B helpers ─────────────────────────────────────────────────────

const MS_NAMES: Record<string, string> = {
  AT: 'Austria',      BE: 'Belgium',        CH: 'Switzerland',  CY: 'Cyprus',
  CZ: 'Czech Republic', DK: 'Denmark',      DE: 'Germany',      EE: 'Estonia',
  EL: 'Greece',       ES: 'Spain',          FI: 'Finland',      FR: 'France',
  HR: 'Croatia',      HU: 'Hungary',        IS: 'Iceland',      IT: 'Italy',
  LT: 'Lithuania',    LU: 'Luxembourg',     LV: 'Latvia',       MT: 'Malta',
  NL: 'Netherlands',  NO: 'Norway',         PL: 'Poland',       PT: 'Portugal',
  RO: 'Romania',      SE: 'Sweden',         SI: 'Slovenia',     SK: 'Slovakia',
};

/** Annex 7B column footnote states: exempt service/special passport holders from ATV. */
const SERVICE_SPECIAL_EXEMPT_STATES = new Set(['BE', 'ES', 'NL', 'CH']);

/**
 * Builds the full notes array for a member-state-specific ATV entry, automatically
 * applying the Annex 7B column-level footnote exemptions:
 *   - BE, ES, NL, CH: ATV does not apply to holders of service or special passports.
 *   - FR: ATV applies to holders of ordinary passports only (unless frNote overrides this).
 *
 * @param codes   ISO codes of the member states that require an ATV for this nationality.
 * @param frNote  undefined = standard FR "ordinary only" note (applied if FR is in codes).
 *                null      = suppress the default FR note (provide FR context via extras).
 *                string    = use this custom text as the FR note.
 * @param extras  Additional country-specific footnote notes appended at the end.
 */
function atvNotes(
  codes: string[],
  frNote: string | null | undefined = undefined,
  extras: Array<{ text: string; source: SourceDoc }> = [],
): PassportRule['notes'] {
  const notes: Array<{ text: string; source: SourceDoc }> = [{
    text: `Airport transit visa required at airports in: ${codes.map(c => MS_NAMES[c]).join(', ')}. Not required at other Schengen airports.`,
    source: SPECIFIC_ATV_SOURCE,
  }];

  const exempt = codes.filter(c => SERVICE_SPECIAL_EXEMPT_STATES.has(c));
  if (exempt.length > 0) {
    notes.push({
      text: `${exempt.map(c => MS_NAMES[c]).join(', ')}: ATV requirement does not apply to holders of service or special passports.`,
      source: SPECIFIC_ATV_SOURCE,
    });
  }

  if (codes.includes('FR')) {
    if (frNote === null) {
      // Suppress default — caller is providing FR context via extras.
    } else {
      notes.push({
        text: frNote ?? 'France: ATV applies to holders of ordinary passports only.',
        source: SPECIFIC_ATV_SOURCE,
      });
    }
  }

  notes.push(...extras);
  return notes;
}

// ─── Annex II footnote note builders ─────────────────────────────────────────

/**
 * Footnotes 6 and 10 — biometric passport required.
 * Applies to: Albania (AL), Bosnia and Herzegovina (BA), North Macedonia (MK), Montenegro (ME).
 */
function biometricOnlyNote(): PassportRule['notes'] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports only.',
    source: VISA_LIST_SOURCE,
  }];
}

/**
 * Footnotes 7 and 11 — exemption pending entry into force of an EU visa exemption agreement.
 * Applies to: UAE (AE), Dominica (DM), Micronesia (FM), Grenada (GD), Kiribati (KI),
 * Saint Lucia (LC), Marshall Islands (MH), Nauru (NR), Palau (PW), Peru (PE),
 * Timor-Leste (TL), Tonga (TO), Tuvalu (TV), Saint Vincent and the Grenadines (VC).
 */
function pendingAgreementNote(): PassportRule['notes'] {
  return [{
    text: 'Visa exemption applies from the date of entry into force of a visa exemption agreement to be concluded with the European Union. Verify current status before travel as the agreement may not yet be in force.',
    source: VISA_LIST_SOURCE,
  }];
}

/**
 * Footnote 9 — Moldova biometric ICAO passport required.
 */
function moldovaNote(): PassportRule['notes'] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued by Moldova in line with ICAO standards.',
    source: VISA_LIST_SOURCE,
  }];
}

/**
 * Footnote 12 — Serbia biometric ICAO passport required; Serbian Coordination
 * Directorate passports excluded.
 */
function serbiaNote(): PassportRule['notes'] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued in line with ICAO standards. Does not apply to holders of Serbian passports issued by the Serbian Coordination Directorate (Koordinaciona uprava).',
    source: VISA_LIST_SOURCE,
  }];
}

/**
 * Footnote 13 — Ukraine biometric ICAO passport required.
 */
function ukraineNote(): PassportRule['notes'] {
  return [{
    text: 'Visa exemption applies to holders of biometric passports issued by Ukraine in line with ICAO standards.',
    source: VISA_LIST_SOURCE,
  }];
}

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
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-04-08',
  sourceUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
  defaultRule: { access: 'visa_required' },
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

    // ── Visa-free — 90 days in any 180-day period ─────────────────────────────
    // Source: EU Regulation (EU) 2018/1806 Annex II (consolidated to 2025-12-30).
    // requiresETIAS: true = ETIAS required once launched (expected late 2026).
    // Microstates (AD, MC, SM, VA) are ETIAS-exempt per current EU guidance.
    // Footnoted entries carry conditions documented in the notes array.

    // ── Unconditional visa-free ────────────────────────────────────────────────

    'AD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Andorra (microstate, ETIAS exempt)
    'AG': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Antigua and Barbuda
    'AR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Argentina
    'AU': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Australia
    'BB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Barbados
    'BN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Brunei
    'BR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Brazil
    'BS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Bahamas
    'CA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Canada
    'CL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Chile
    'CO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Colombia
    'CR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Costa Rica
    'GB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // United Kingdom
    'GT': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Guatemala
    'HN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Honduras
    'IL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Israel
    'JP': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Japan
    'KN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Saint Kitts and Nevis
    'KR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // South Korea
    'MC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Monaco (microstate, ETIAS exempt)
    'MU': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Mauritius
    'MX': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Mexico
    'MY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Malaysia
    'NI': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Nicaragua
    'NZ': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // New Zealand
    'PA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Panama
    'PY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Paraguay
    'SB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Solomon Islands
    'SC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Seychelles
    'SG': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Singapore
    'SM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // San Marino (microstate, ETIAS exempt)
    'SV': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // El Salvador
    'TT': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Trinidad and Tobago
    'US': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // United States
    'UY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Uruguay
    'VA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Holy See (microstate, ETIAS exempt)
    'VE': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Venezuela
    'WS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Samoa

    // ── Visa-free — biometric passport required (Annex II footnotes 6 and 10) ─

    // Footnote 6: Exemption applies to holders of biometric passports only.
    'AL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: biometricOnlyNote() }, // Albania
    'BA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: biometricOnlyNote() }, // Bosnia and Herzegovina
    'MK': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: biometricOnlyNote() }, // North Macedonia

    // Footnote 10: Exemption applies to holders of biometric passports only.
    'ME': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: biometricOnlyNote() }, // Montenegro

    // ── Visa-free — biometric ICAO passport required ───────────────────────────

    // Footnote 9: Moldova biometric ICAO passport.
    'MD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: moldovaNote() }, // Moldova

    // Footnote 12: Serbia biometric ICAO passport; Coordination Directorate passports excluded.
    'RS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: serbiaNote() }, // Serbia

    // Footnote 13: Ukraine biometric ICAO passport.
    'UA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true,  notes: ukraineNote() }, // Ukraine

    // ── Visa-free — specific document type required ────────────────────────────

    // Footnote 14: Exemption applies only to holders of a 'Hong Kong Special
    // Administrative Region' passport.
    'HK': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      requiresETIAS: true,
      notes: [{
        text: "Visa exemption applies only to holders of a 'Hong Kong Special Administrative Region' passport.",
        source: VISA_LIST_SOURCE,
      }],
    }, // Hong Kong SAR

    // Footnote 15: Exemption applies only to holders of a 'Região Administrativa
    // Especial de Macau' passport.
    'MO': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      requiresETIAS: true,
      notes: [{
        text: "Visa exemption applies only to holders of a 'Região Administrativa Especial de Macau' passport.",
        source: VISA_LIST_SOURCE,
      }],
    }, // Macao SAR

    // Footnote 17: Exemption applies only to holders of passports issued by Taiwan
    // which include an identity card number.
    'TW': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      requiresETIAS: true,
      notes: [{
        text: 'Visa exemption applies only to holders of passports issued by Taiwan which include an identity card number.',
        source: VISA_LIST_SOURCE,
      }],
    }, // Taiwan

    // ── Visa-free — conditional on entry into force of EU agreement ────────────
    // Footnotes 7 and 11: Exemption applies from the date of entry into force of a
    // visa exemption agreement to be concluded with the EU. Verify status before travel.

    'AE': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // United Arab Emirates (fn 7)
    'DM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Dominica (fn 7)
    'FM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Micronesia (fn 7)
    'GD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Grenada (fn 7)
    'KI': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Kiribati (fn 7)
    'LC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Saint Lucia (fn 7)
    'MH': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Marshall Islands (fn 11)
    'NR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Nauru (fn 11)
    'PE': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Peru (fn 11)
    'PW': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Palau (fn 11)
    'TL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Timor-Leste (fn 11)
    'TO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Tonga (fn 11)
    'TV': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Tuvalu (fn 11)
    'VC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: pendingAgreementNote() }, // Saint Vincent and the Grenadines (fn 11)

    // ── Visa-free — entity not recognised as state ─────────────────────────────

    // Kosovo — footnotes 18, 19, 20.
    // Fn 18: Designation without prejudice to positions on status, in line with UNSCR 1244/1999.
    // Fn 19: Exemption applies to holders of biometric passports issued by Kosovo per ICAO standards.
    // Fn 20: Exemption applies from ETIAS launch date or 1 January 2024, whichever is earlier.
    //        Since 1 January 2024 has passed, Kosovo nationals with biometric passports are currently visa-free.
    'XK': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      requiresETIAS: true,
      notes: [
        {
          text: 'Visa exemption applies to holders of biometric passports issued by Kosovo in line with ICAO standards.',
          source: VISA_LIST_SOURCE,
        },
        {
          text: 'This designation is without prejudice to positions on status, and is in line with UNSCR 1244/1999 and the ICJ Opinion on the Kosovo declaration of independence.',
          source: VISA_LIST_SOURCE,
        },
      ],
    }, // Kosovo

    // ── Suspended ─────────────────────────────────────────────────────────────

    // Georgia — Annex II footnote 8 (biometric ICAO passports required).
    // Ordinary biometric passports remain visa-free. Visa-free access has been
    // suspended for diplomatic, service, and official passport holders only,
    // by EU Council decision, March 2026–March 2027.
    'GE': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      requiresETIAS: true,
      notes: [
        {
          text: 'Visa exemption applies to holders of biometric passports issued by Georgia in line with ICAO standards.',
          source: VISA_LIST_SOURCE,
        },
        {
          text: 'Diplomatic, service, and official passport holders: visa-free access suspended March 2026 to March 2027 by EU Council decision. Ordinary biometric passport holders are unaffected.',
          source: VISA_LIST_SOURCE,
        },
      ],
    }, // Georgia

    // ── Airport Transit Visa — common list (Annex IV, Reg. EC 810/2009) ────────
    // These 12 nationals need an ATV to transit ANY Schengen airport international
    // zone, even without entering Schengen territory.
    'AF': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Afghanistan
    'BD': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Bangladesh
    'CD': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Congo (Dem. Rep.)
    'ER': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Eritrea
    'ET': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Ethiopia
    'GH': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Ghana
    'IR': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Iran
    'IQ': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Iraq
    'NG': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Nigeria
    'PK': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Pakistan
    'SO': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Somalia
    'LK': { access: 'visa_required', requiresATV: true, notes: [{ text: ATV_COMMON_NOTE, source: ATV_COMMON_SOURCE }] }, // Sri Lanka

    // ── Airport Transit Visa — member-state specific (Annex 7B) ───────────────
    // These nationals are NOT on the common list but individual Schengen states
    // have unilaterally imposed ATV requirements at their own airports.
    // Source: Visa Code Handbook Annex 7B (verified against PDF, 2026-04-08).
    //
    // Column-level footnotes from Annex 7B are applied automatically by atvNotes():
    //   BE, ES, NL, CH — ATV does not apply to service or special passport holders.
    //   FR              — ATV applies to ordinary passport holders only (unless overridden).
    // Country-specific cell footnotes are documented inline per entry.

    // Algeria — CZ
    'DZ': { access: 'visa_required', notes: atvNotes(['CZ']) },

    // Angola — FR
    'AO': { access: 'visa_required', notes: atvNotes(['FR']) },

    // Armenia — CZ, PL
    'AM': { access: 'visa_required', notes: atvNotes(['CZ', 'PL']) },

    // Burkina Faso — ES
    'BF': { access: 'visa_required', notes: atvNotes(['ES']) },

    // Bolivia — FR
    'BO': { access: 'visa_required', notes: atvNotes(['FR']) },

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
    // Footnote 6 on FR cell: ATV applies to both ordinary AND service passport holders
    // (exception to the general FR ordinary-passport-only column rule).
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
    // Footnote 7 on BE cell: ordinary passports only — equivalent to the BE column note.
    // Footnote 8 on ES cell: narrows ordinary passport requirement to those issued from
    // 1 September 2021 (additive to the ES column service/special exemption).
    'HT': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'ES', 'FR'],
        undefined,
        [{
          text: 'Spain: for ordinary passports, ATV applies only to those issued from 1 September 2021.',
          source: SPECIFIC_ATV_SOURCE,
        }],
      ),
    },

    // India — CZ, DE, FR, RO
    'IN': { access: 'visa_required', notes: atvNotes(['CZ', 'DE', 'FR', 'RO']) },

    // Jordan — DE
    // Footnote 9 on DE cell: exemption if holder has valid AU/IL/NZ visa + confirmed
    // onward ticket, or is returning to Jordan after an authorised stay in those countries.
    // Onward flight must depart within 12 hours of arrival in Germany.
    'JO': {
      access: 'visa_required',
      notes: atvNotes(
        ['DE'],
        undefined,
        [{
          text: 'Germany exemption: ATV not required for holders of a valid visa for Australia, Israel, or New Zealand with a confirmed onward ticket to that country, or those returning to Jordan after an authorised stay in one of those countries. Onward flight must depart within 12 hours of arrival in Germany.',
          source: SPECIFIC_ATV_SOURCE,
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

    // Morocco — RO
    'MA': { access: 'visa_required', notes: atvNotes(['RO']) },

    // Mauritania — CZ, ES, FR, NL
    'MR': { access: 'visa_required', notes: atvNotes(['CZ', 'ES', 'FR', 'NL']) },

    // Nepal — BE, ES, FR, NL, RO
    'NP': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'FR', 'NL', 'RO']) },

    // Niger — CZ
    'NE': { access: 'visa_required', notes: atvNotes(['CZ']) },

    // Palestinians — BE, CZ, ES, FR, RO
    // Footnote 14 on FR cell: requirement applies to holders of the travel document for
    // Palestinian refugees only — more restrictive than the standard FR ordinary-only rule.
    'PS': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'CZ', 'ES', 'FR', 'RO'],
        null, // suppress default FR note — footnote 14 is more specific
        [{
          text: 'France: ATV applies only to holders of the travel document for Palestinian refugees.',
          source: SPECIFIC_ATV_SOURCE,
        }],
      ),
    },

    // Philippines — FR
    // Footnote 10 on FR cell: sea crew with a seafarer's identity document are exempt.
    'PH': {
      access: 'visa_required',
      notes: atvNotes(
        ['FR'],
        "France: ATV applies to holders of ordinary passports. Sea crew holding a valid seafarer's identity document issued under ILO Conventions No. 108 (1958) or No. 185 (2003) and the FAL Convention are exempt.",
      ),
    },

    // Russia — CZ, ES, FR
    // Footnote 11 on FR cell: FR requirement applies only to Russian nationals departing
    // from airports in Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey,
    // or Egypt.
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

    // Turkey — BE, CZ, DE, ES, FR, CY, NL, NO, CH
    // Footnote 12 on NL cell: additionally, seafarers with a valid seafarer's identity
    // document are exempt at Netherlands (additive to the standard NL service/special exemption).
    'TR': {
      access: 'visa_required',
      notes: atvNotes(
        ['BE', 'CZ', 'DE', 'ES', 'FR', 'CY', 'NL', 'NO', 'CH'],
        undefined,
        [{
          text: "Netherlands: additionally, ATV does not apply to seafarers holding a valid seafarer's identity document issued under ILO Conventions No. 108 (1958) or No. 185 (2003) and the FAL Convention.",
          source: SPECIFIC_ATV_SOURCE,
        }],
      ),
    },

    // Uzbekistan — BE, ES, FR, IT, PT, RO
    'UZ': { access: 'visa_required', notes: atvNotes(['BE', 'ES', 'FR', 'IT', 'PT', 'RO']) },

    // Yemen — BE, CZ, ES, NL, RO
    // Footnote 13 on BE cell: ordinary passports only — equivalent to the BE column note.
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