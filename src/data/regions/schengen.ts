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
import { getCountryName } from '@/data/countries';

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

/**
 * Builds a standard member-state-specific ATV note from ISO Alpha-2 codes.
 * Pass the codes of the Schengen states that impose the requirement;
 * names are resolved from the shared countries master list.
 */
function specificATVNote(memberStateCodes: string[]): PassportRule['notes'] {
  const names = memberStateCodes.map(getCountryName).join(', ');
  return [{
    text: `Airport transit visa required at airports in: ${names}. Not required at other Schengen airports.`,
    source: SPECIFIC_ATV_SOURCE,
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
    // Dominican Republic — visa-free for entry, but Annex 7B imposes an ATV requirement
    // at Belgium and France airports for transit without entering Schengen territory.
    'DO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: specificATVNote(['BE', 'FR']) },  // Dominican Republic
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
    // Philippines — visa-free for entry, but Annex 7B imposes an ATV requirement at
    // France airports for transit. Exception: seafarers with a valid ILO identity document
    // (Convention No. 108 or No. 185) are exempt.
    'PH': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true, notes: [{ text: 'Airport transit visa required at airports in: France. Exception: does not apply to sea crew holding a seafarer\'s identity document issued under ILO Conventions No. 108 or No. 185. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },  // Philippines
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
    // Source: Visa Code Handbook Annex 7B — third countries whose nationals
    // require an ATV when transiting airports of one or more member states.
    // These nationals are NOT on the common list (Annex IV); individual Schengen
    // states have unilaterally imposed the requirement at their own airports.
    // Last verified: 2026-04-08.
    //
    // Member state ISO codes used below:
    //   AT=Austria   BE=Belgium   CH=Switzerland  CY=Cyprus   CZ=Czech Republic
    //   DE=Germany   DK=Denmark   ES=Spain        FR=France   GR=Greece
    //   HU=Hungary   IS=Iceland   IT=Italy        NL=Netherlands  NO=Norway
    //   PL=Poland    PT=Portugal  RO=Romania      SE=Sweden   SI=Slovenia
    //
    // Footnotes from the official table that qualify specific state requirements:
    //   BE,ES,NL,CH — ATV does not apply to holders of service/special passports.
    //   FR           — ATV applies to holders of ordinary passports unless noted.

    // Algeria — CZ
    'DZ': { access: 'visa_required', notes: specificATVNote(['CZ']) },
    // Angola — FR
    'AO': { access: 'visa_required', notes: specificATVNote(['FR']) },
    // Armenia — CZ, AT
    'AM': { access: 'visa_required', notes: specificATVNote(['CZ', 'AT']) },
    // Burkina Faso — ES
    'BF': { access: 'visa_required', notes: specificATVNote(['ES']) },
    // Bolivia — FR
    'BO': { access: 'visa_required', notes: specificATVNote(['FR']) },
    // Cameroon — GR, ES, FR, CY
    'CM': { access: 'visa_required', notes: specificATVNote(['GR', 'ES', 'FR', 'CY']) },
    // Central African Republic — ES, FR, NL
    'CF': { access: 'visa_required', notes: specificATVNote(['ES', 'FR', 'NL']) },
    // Chad — CZ, ES, FR, NL
    'TD': { access: 'visa_required', notes: specificATVNote(['CZ', 'ES', 'FR', 'NL']) },
    // Congo (Republic of) — GR, ES, FR
    'CG': { access: 'visa_required', notes: specificATVNote(['GR', 'ES', 'FR']) },
    // Côte d'Ivoire — ES, FR
    'CI': { access: 'visa_required', notes: specificATVNote(['ES', 'FR']) },
    // Cuba — CZ, DE, ES, FR, HU, NL, PL, CH
    'CU': { access: 'visa_required', notes: specificATVNote(['CZ', 'DE', 'ES', 'FR', 'HU', 'NL', 'PL', 'CH']) },
    // Djibouti — ES
    'DJ': { access: 'visa_required', notes: specificATVNote(['ES']) },
    // Egypt — CZ, ES, AT, RO
    'EG': { access: 'visa_required', notes: specificATVNote(['CZ', 'ES', 'AT', 'RO']) },
    // Gambia — ES
    'GM': { access: 'visa_required', notes: specificATVNote(['ES']) },
    // Guinea — BE, ES, NL, PT; FR also required (including service passport holders)
    'GN': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Belgium, Spain, France (including service passport holders), Netherlands, Portugal. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // Guinea-Bissau — BE, ES, NL
    'GW': { access: 'visa_required', notes: specificATVNote(['BE', 'ES', 'NL']) },
    // Haiti — BE (ordinary passports only), AT (ordinary passports from 1 Sep 2021), FR
    'HT': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Belgium (ordinary passports only), Austria (ordinary passports issued from 1 September 2021), France. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // India — CZ, DE, FR, RO
    'IN': { access: 'visa_required', notes: specificATVNote(['CZ', 'DE', 'FR', 'RO']) },
    // Jordan — DE only; does not apply to holders of valid visa for Australia, Israel, or
    //          New Zealand with a confirmed onward ticket to that country (departing within 12h)
    'JO': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Germany. Exception: does not apply to holders of a valid visa for Australia, Israel, or New Zealand with a confirmed onward ticket to that country, provided the onward flight departs within 12 hours of arrival. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // Kenya — ES
    'KE': { access: 'visa_required', notes: specificATVNote(['ES']) },
    // Lebanon — CZ, DE, RO
    'LB': { access: 'visa_required', notes: specificATVNote(['CZ', 'DE', 'RO']) },
    // Liberia — ES
    'LR': { access: 'visa_required', notes: specificATVNote(['ES']) },
    // Libya — CZ
    'LY': { access: 'visa_required', notes: specificATVNote(['CZ']) },
    // Mali — CZ, DE, ES, FR
    'ML': { access: 'visa_required', notes: specificATVNote(['CZ', 'DE', 'ES', 'FR']) },
    // Morocco — RO
    'MA': { access: 'visa_required', notes: specificATVNote(['RO']) },
    // Mauritania — CZ, ES, FR, NL
    'MR': { access: 'visa_required', notes: specificATVNote(['CZ', 'ES', 'FR', 'NL']) },
    // Nepal — BE, ES, FR, NL, RO
    'NP': { access: 'visa_required', notes: specificATVNote(['BE', 'ES', 'FR', 'NL', 'RO']) },
    // Niger — CZ
    'NE': { access: 'visa_required', notes: specificATVNote(['CZ']) },
    // Palestinians — BE, CZ, ES, FR (travel document holders), RO
    'PS': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Belgium, Czech Republic, Spain, France (applies to holders of the travel document for Palestinian refugees), Romania. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // Russia — CZ, ES, FR (applies when travelling from airports in Armenia, Azerbaijan,
    //          Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt)
    'RU': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Czech Republic, Spain, France. For France: applies to Russian nationals travelling from an airport in Armenia, Azerbaijan, Georgia, Ukraine, Belarus, Moldova, Turkey, or Egypt. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // Senegal — ES, FR, IT, NL, RO
    'SN': { access: 'visa_required', notes: specificATVNote(['ES', 'FR', 'IT', 'NL', 'RO']) },
    // Sierra Leone — ES, FR, NL
    'SL': { access: 'visa_required', notes: specificATVNote(['ES', 'FR', 'NL']) },
    // South Sudan — BE, CZ, DE, FR, NL
    'SS': { access: 'visa_required', notes: specificATVNote(['BE', 'CZ', 'DE', 'FR', 'NL']) },
    // Sudan — BE, CZ, DE, GR, ES, FR, CY, NL
    'SD': { access: 'visa_required', notes: specificATVNote(['BE', 'CZ', 'DE', 'GR', 'ES', 'FR', 'CY', 'NL']) },
    // Syria — BE, CZ, DK, DE, GR, ES, FR, IT, NL, AT, RO, NO, CH
    'SY': { access: 'visa_required', notes: specificATVNote(['BE', 'CZ', 'DK', 'DE', 'GR', 'ES', 'FR', 'IT', 'NL', 'AT', 'RO', 'NO', 'CH']) },
    // Tajikistan — BE, ES, CY, RO
    'TJ': { access: 'visa_required', notes: specificATVNote(['BE', 'ES', 'CY', 'RO']) },
    // Togo — ES, FR
    'TG': { access: 'visa_required', notes: specificATVNote(['ES', 'FR']) },
    // Tunisia — RO
    'TN': { access: 'visa_required', notes: specificATVNote(['RO']) },
    // Turkey — BE, CZ, DE, ES, FR, CY, NL (seafarers with ILO document exempt), NO, CH
    'TR': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Belgium, Czech Republic, Germany, Spain, France, Cyprus, Netherlands, Norway, Switzerland. For Netherlands: does not apply to seafarers holding a valid seafarer\'s identity document under ILO Conventions No. 108 or No. 185. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },
    // Uzbekistan — BE, ES, FR, IT, PT, RO
    'UZ': { access: 'visa_required', notes: specificATVNote(['BE', 'ES', 'FR', 'IT', 'PT', 'RO']) },
    // Yemen — BE (ordinary passports only), CZ, ES, NL, RO
    'YE': { access: 'visa_required', notes: [{ text: 'Airport transit visa required at airports in: Belgium (ordinary passports only), Czech Republic, Spain, Netherlands, Romania. Not required at other Schengen airports.', source: SPECIFIC_ATV_SOURCE }] },

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
