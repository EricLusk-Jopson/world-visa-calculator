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

/** Standard note text for the common (EU-wide) ATV list */
const ATV_COMMON_NOTE =
  'Airport transit visa required when transiting the international zone of any Schengen airport, even without entering Schengen territory.';

/** Builds a specific-ATV note with custom text (Annex 7B per-member-state requirements) */
function specificATVNote(text: string): PassportRule['notes'] {
  return [{ text, source: SPECIFIC_ATV_SOURCE }];
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
    // Source: EU Annex II Regulation (EU) 2018/1806
    // requiresETIAS: true = ETIAS required once launched (expected late 2026)
    // Microstates (AD, MC, SM, VA) are ETIAS-exempt per current EU guidance

    'AL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Albania
    'AD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Andorra (microstate, ETIAS exempt)
    'AG': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Antigua and Barbuda
    'AR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Argentina
    'AU': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Australia
    'BS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Bahamas
    'BB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Barbados
    'BR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Brazil
    'BN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Brunei
    'CA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Canada
    'CL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Chile
    'CO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Colombia
    'CR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Costa Rica
    'DM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Dominica
    'DO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: [{ text: 'Airport transit visa required when transiting Belgium (ordinary passports; service and special passports exempt) or France (ordinary passports), even though Dominican Republic passport holders are otherwise visa-free for entry.', source: SPECIFIC_ATV_SOURCE }] },  // Dominican Republic
    'GD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Grenada
    'GT': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Guatemala
    'GY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Guyana
    'HN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Honduras
    'HK': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Hong Kong (SAR)
    'IL': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Israel
    'JP': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Japan
    'KI': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Kiribati
    'MO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Macao (SAR)
    'MY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Malaysia
    'MH': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Marshall Islands
    'MU': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Mauritius
    'MX': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Mexico
    'MC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Monaco (microstate, ETIAS exempt)
    'ME': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Montenegro
    'MK': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // North Macedonia
    'FM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Micronesia
    'MD': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Moldova
    'NZ': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // New Zealand
    'NI': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Nicaragua
    'PA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Panama
    'PW': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Palau
    'PE': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Peru
    'PH': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: [{ text: 'Airport transit visa required when transiting France (ordinary passports), even though Philippine passport holders are otherwise visa-free for entry. Sea crew holding an ILO seafarer\'s identity document are exempt.', source: SPECIFIC_ATV_SOURCE }] },  // Philippines
    'KN': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Saint Kitts and Nevis
    'LC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Saint Lucia
    'VC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Saint Vincent and the Grenadines
    'WS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Samoa
    'SM': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // San Marino (microstate, ETIAS exempt)
    'RS': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Serbia
    'SC': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Seychelles
    'SG': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Singapore
    'SB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Solomon Islands
    'ZA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // South Africa
    'KR': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // South Korea
    'TW': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Taiwan
    'TT': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Trinidad and Tobago
    'TV': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Tuvalu
    'UA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Ukraine
    'GB': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // United Kingdom
    'US': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // United States
    'UY': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Uruguay
    'VA': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: false }, // Vatican (microstate, ETIAS exempt)
    'VU': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Vanuatu

    // ── Airport Transit Visa — common list (Annex IV, Reg. EC 810/2009) ────────
    // These 12 nationals need an ATV to transit ANY Schengen airport international
    // zone, even without entering Schengen territory.
    // Note: Iraq (IQ) is on the EU official list but was absent from the original
    // project brief — included here per the authoritative source.
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
    // Nationals not on the common list but where individual Schengen states have
    // imposed ATV requirements at their own airports.
    // Source: Visa Code Handbook Annex 7B (last verified 2026-04-08).
    // Column order: BE BG CZ DK DE EE GR ES FR HR IT CY LV LT LU HU MT NL AT PL PT RO SI SK FI SE IS NO CH
    //
    // Footnotes embedded in note text:
    //   BE/ES/NL/CH: ATV does not apply to service or special passports
    //   FR: Applies to ordinary passports unless otherwise noted
    //   GN/FR: Also applies to Guinean service passports
    //   HT/BE: Ordinary passports only; HT/AT: Ordinary passports from 1 Sep 2021
    //   JO/DE: Exempt if holding valid AU/IL/NZ visa, confirmed onward ticket, within 12h
    //   PH/FR: Sea crew holding ILO seafarer's ID are exempt
    //   RU/FR: Only from airports in Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt
    //   TR/NL: Sea crew exempt; YE/BE: Ordinary passports only
    //   PS/FR: Applies to Palestinian travel document holders

    // Algeria — CZ
    'DZ': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic. Not required at other Schengen airports.') },
    // Angola — FR
    'AO': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: France (ordinary passports). Not required at other Schengen airports.') },
    // Armenia — CZ, PL
    'AM': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Poland. Not required at other Schengen airports.') },
    // Burkina Faso — ES
    'BF': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt). Not required at other Schengen airports.') },
    // Bolivia — FR
    'BO': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: France (ordinary passports). Not required at other Schengen airports.') },
    // Cameroon — GR, ES, FR, CY
    'CM': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Greece, Spain (ordinary passports; service and special passports exempt), France (ordinary passports), Cyprus. Not required at other Schengen airports.') },
    // Central African Republic — ES, FR, NL
    'CF': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain, France (ordinary passports), Netherlands. Service and special passports are exempt in Spain and Netherlands. Not required at other Schengen airports.') },
    // Chad — CZ, ES, FR, NL
    'TD': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Spain, France (ordinary passports), Netherlands. Service and special passports are exempt in Spain and Netherlands. Not required at other Schengen airports.') },
    // Congo (Republic) — GR, ES, FR
    'CG': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Greece, Spain (ordinary passports; service and special passports exempt), France (ordinary passports). Not required at other Schengen airports.') },
    // Côte d'Ivoire — ES, FR
    'CI': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt), France (ordinary passports). Not required at other Schengen airports.') },
    // Cuba — CZ, DE, ES, FR, NL, PL, CH
    'CU': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Germany, Spain, France (ordinary passports), Netherlands, Poland, Switzerland. Service and special passports are exempt in Spain, Netherlands, and Switzerland. Not required at other Schengen airports.') },
    // Djibouti — ES
    'DJ': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt). Not required at other Schengen airports.') },
    // Egypt — CZ, ES, PL, RO
    'EG': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Spain (ordinary passports; service and special passports exempt), Poland, Romania. Not required at other Schengen airports.') },
    // Gambia — ES
    'GM': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt). Not required at other Schengen airports.') },
    // Guinea — BE, ES, FR (incl. service passports), NL, PT
    'GN': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Spain, France (including service passport holders), Netherlands, Portugal. Service and special passports are exempt in Belgium, Spain, and Netherlands. Not required at other Schengen airports.') },
    // Guinea-Bissau — BE, ES, NL
    'GW': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Spain, Netherlands. Service and special passports are exempt. Not required at other Schengen airports.') },
    // Haiti — BE (ordinary), FR, AT (ordinary from 1 Sep 2021)
    'HT': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium (ordinary passports only), France (ordinary passports), Austria (ordinary passports issued from 1 September 2021). Not required at other Schengen airports.') },
    // India — CZ, DE, FR, RO
    'IN': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Germany, France (ordinary passports), Romania. Not required at other Schengen airports.') },
    // Jordan — DE (exempt with AU/IL/NZ visa)
    'JO': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Germany. Exempt if holding a valid Australian, Israeli, or New Zealand visa with a confirmed onward flight ticket and transit within 12 hours. Not required at other Schengen airports.') },
    // Kenya — ES
    'KE': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt). Not required at other Schengen airports.') },
    // Lebanon — CZ, DE, RO
    'LB': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Germany, Romania. Not required at other Schengen airports.') },
    // Liberia — ES
    'LR': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt). Not required at other Schengen airports.') },
    // Libya — CZ
    'LY': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic. Not required at other Schengen airports.') },
    // Mali — CZ, DE, ES, FR
    'ML': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Germany, Spain (ordinary passports; service and special passports exempt), France (ordinary passports). Not required at other Schengen airports.') },
    // Morocco — RO
    'MA': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Romania. Not required at other Schengen airports.') },
    // Mauritania — CZ, ES, FR, NL
    'MR': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Spain (ordinary passports; service and special passports exempt), France (ordinary passports), Netherlands. Not required at other Schengen airports.') },
    // Nepal — BE, ES, FR, NL, RO
    'NP': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Spain, France (ordinary passports), Netherlands, Romania. Service and special passports are exempt in Belgium, Spain, and Netherlands. Not required at other Schengen airports.') },
    // Niger — CZ
    'NE': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic. Not required at other Schengen airports.') },
    // Palestinians — BE, CZ, ES, FR (travel doc holders), RO
    'PS': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Czech Republic, Spain, France (applies to Palestinian travel document holders), Romania. Service and special passports are exempt in Belgium and Spain. Not required at other Schengen airports.') },
    // Russia — CZ, ES, FR (specific origin airports)
    'RU': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Czech Republic, Spain, France (only for travellers arriving from airports in Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt). Not required at other Schengen airports.') },
    // Senegal — ES, FR, IT, NL, PT, RO
    'SN': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt), France (ordinary passports), Italy, Netherlands, Portugal, Romania. Not required at other Schengen airports.') },
    // Sierra Leone — ES, FR, NL
    'SL': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt), France (ordinary passports), Netherlands. Not required at other Schengen airports.') },
    // South Sudan — BE, CZ, DE, FR, NL
    'SS': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Czech Republic, Germany, France (ordinary passports), Netherlands. Service and special passports are exempt in Belgium and Netherlands. Not required at other Schengen airports.') },
    // Sudan — BE, CZ, DE, GR, ES, FR, CY, NL
    'SD': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Czech Republic, Germany, Greece, Spain, France (ordinary passports), Cyprus, Netherlands. Service and special passports are exempt in Belgium, Spain, and Netherlands. Not required at other Schengen airports.') },
    // Syria — BE, CZ, DK, DE, GR, ES, FR, IT, NL, AT, RO, NO, CH
    'SY': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Czech Republic, Denmark, Germany, Greece, Spain, France (ordinary passports), Italy, Netherlands, Austria, Romania, Norway, Switzerland. Service and special passports are exempt in Belgium, Spain, Netherlands, and Switzerland. Not required at other Schengen airports.') },
    // Tajikistan — BE, ES, IT, RO
    'TJ': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Spain (ordinary passports; service and special passports exempt), Italy, Romania. Not required at other Schengen airports.') },
    // Togo — ES, FR
    'TG': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Spain (ordinary passports; service and special passports exempt), France (ordinary passports). Not required at other Schengen airports.') },
    // Tunisia — RO
    'TN': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Romania. Not required at other Schengen airports.') },
    // Turkey — BE, CZ, DE, ES, FR, CY, NL, NO, CH (NL: sea crew exempt)
    'TR': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Czech Republic, Germany, Spain, France (ordinary passports), Cyprus, Netherlands, Norway, Switzerland. Service and special passports are exempt in Belgium, Spain, and Switzerland. Sea crew are exempt in Netherlands. Not required at other Schengen airports.') },
    // Uzbekistan — BE, ES, FR, IT, PT, RO
    'UZ': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium, Spain (ordinary passports; service and special passports exempt), France (ordinary passports), Italy, Portugal, Romania. Not required at other Schengen airports.') },
    // Yemen — BE (ordinary), CZ, ES, NL, RO
    'YE': { access: 'visa_required', notes: specificATVNote('Airport transit visa required at airports in: Belgium (ordinary passports only), Czech Republic, Spain (ordinary passports; service and special passports exempt), Netherlands, Romania. Not required at other Schengen airports.') },

    // ── Suspended ─────────────────────────────────────────────────────────────
    'GE': {
      access: 'suspended',
      notes: [{
        text: 'Visa-free access suspended March 2026 to March 2027. Applies to diplomatic, service, and official passport holders only; ordinary Georgian passports remain visa-free.',
        source: VISA_LIST_SOURCE,
      }],
    },
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
