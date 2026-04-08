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
  parentUrl: 'https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf',
  dateChecked: '2026-04-08',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Builds the standard ATV common-list note text */
const ATV_COMMON_NOTE =
  'Airport transit visa required when transiting the international zone of any Schengen airport, even without entering Schengen territory.';

/** Builds a specific-ATV note listing the member states that require it */
function specificATVNote(memberStates: string): PassportRule['notes'] {
  return [{
    text: `Airport transit visa required at airports in: ${memberStates}. Not required at other Schengen airports.`,
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
    'DO': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Dominican Republic
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
    'PH': { access: 'visa_free', allowanceDays: 90, windowDays: 180, requiresETIAS: true },  // Philippines
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
    // These nationals are NOT on the common list but individual Schengen states
    // have unilaterally imposed ATV requirements at their own airports.
    // Source: Visa Code Handbook Annex 7B (last verified 2026-04-08).
    //
    // Member state abbreviations used in comments:
    //   AT=Austria  BE=Belgium   CH=Switzerland  CY=Cyprus    DE=Germany
    //   DK=Denmark  ES=Spain     FI=Finland      FR=France    HR=Croatia
    //   HU=Hungary  IT=Italy     LT=Lithuania    LU=Luxembourg LV=Latvia
    //   NL=Netherlands  NO=Norway  PL=Poland  PT=Portugal  RO=Romania
    //   SE=Sweden   SI=Slovenia  SK=Slovakia

    // Algeria — BE
    'DZ': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Angola — BE
    'AO': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Armenia — BE, FR
    'AM': { access: 'visa_required', notes: specificATVNote('Belgium, France') },
    // Burkina Faso — BE
    'BF': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Bolivia — BE (ordinary passports; service/special exempt)
    'BO': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Cameroon — BE, DE, FR, FI, AT
    'CM': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Finland, Austria') },
    // Central African Republic — BE, DE, AT
    'CF': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, Austria') },
    // Chad — BE, DE, FR, AT
    'TD': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Congo (Republic) — BE, DE, FR, AT
    'CG': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Côte d'Ivoire — BE, DE
    'CI': { access: 'visa_required', notes: specificATVNote('Belgium, Germany') },
    // Cuba — BE, DE, ES, FR, LT, HU, RO
    'CU': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, Spain, France, Lithuania, Hungary, Romania') },
    // Djibouti — BE
    'DJ': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Egypt — BE, DE, FR, AT
    'EG': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Gambia — BE
    'GM': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Guinea — BE, DE, FR, AT (service passport holders also included)
    'GN': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Guinea-Bissau — BE, DE, FR
    'GW': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France') },
    // Haiti — BE, FR (ordinary), AT (ordinary, from Sep 2021), SI
    'HT': { access: 'visa_required', notes: specificATVNote('Belgium, France, Austria, Slovenia') },
    // India — BE, DE, FR, AT
    'IN': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Jordan — BE, AT
    'JO': { access: 'visa_required', notes: specificATVNote('Belgium, Austria') },
    // Kenya — BE
    'KE': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Lebanon — BE, DE, FR
    'LB': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France') },
    // Liberia — BE
    'LR': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Libya — BE
    'LY': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Mali — BE, DE, FR, AT
    'ML': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Morocco — BE
    'MA': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Mauritania — BE, DE, FR, AT
    'MR': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Nepal — BE, DE, FR, AT, NL, SI
    'NP': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria, Netherlands, Slovenia') },
    // Niger — BE
    'NE': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Palestinians — BE, DE, FR, AT, CH
    'PS': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria, Switzerland') },
    // Russia — BE, DE, FR, CH (from specific third-country airports)
    'RU': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Switzerland') },
    // Senegal — BE, DE, FR, AT, NL, SI
    'SN': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria, Netherlands, Slovenia') },
    // Sierra Leone — BE, DE, FR
    'SL': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France') },
    // South Sudan — BE, DE, FR, AT, SI
    'SS': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria, Slovenia') },
    // Sudan — BE, DE, FR, CY, NL, AT, PL, RO, FI
    'SD': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Cyprus, Netherlands, Austria, Poland, Romania, Finland') },
    // Syria — BE, DK, DE, ES, FR, IT, CY, LV, LT, NL, AT, PL, RO, SI, FI
    'SY': { access: 'visa_required', notes: specificATVNote('Belgium, Denmark, Germany, Spain, France, Italy, Cyprus, Latvia, Lithuania, Netherlands, Austria, Poland, Romania, Slovenia, Finland') },
    // Tajikistan — BE, DE, FR, AT
    'TJ': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria') },
    // Togo — BE, DE, FR
    'TG': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France') },
    // Tunisia — BE
    'TN': { access: 'visa_required', notes: specificATVNote('Belgium') },
    // Turkey — BE, DE, FR, CY, NL, AT, RO
    'TR': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Cyprus, Netherlands, Austria, Romania') },
    // Uzbekistan — BE, DE, FR, AT, RO, SI
    'UZ': { access: 'visa_required', notes: specificATVNote('Belgium, Germany, France, Austria, Romania, Slovenia') },
    // Yemen — BE, AT (ordinary), RO, SI, FI
    'YE': { access: 'visa_required', notes: specificATVNote('Belgium, Austria, Romania, Slovenia, Finland') },

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
