/**
 * ireland.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Visa and entry rules for the Republic of Ireland.
 *
 * ── Visa scheme overview ─────────────────────────────────────────────────────
 *
 * SHORT-STAY / TOURIST ENTRY
 *   Ireland is NOT part of the Schengen Area. It operates its own immigration
 *   policy independently. Non-visa-required nationals may enter Ireland for
 *   up to 90 days per permission granted at the border. This is a per-visit
 *   cap — Ireland does NOT use a rolling window calculation equivalent to the
 *   Schengen 90/180 rule.
 *
 *   The Irish Naturalisation and Immigration Service (INIS) has explicitly
 *   stated that it is not possible to remain in Ireland for 90 days and then
 *   immediately re-enter for a further 90-day period. Repeat maximum-duration
 *   stays are subject to officer discretion, not a calculable formula.
 *
 *   Source (entry requirements): https://www.irishimmigration.ie/coming-to-visit-ireland/
 *   Source (visa required list): https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland/can-i-visit-ireland-without-a-visa/
 *   Source (statutory instrument): https://www.irishstatutebook.ie/eli/2014/si/473/made/en/print
 *
 * EU / EEA FREE MOVEMENT
 *   Citizens of EU Member States and EEA countries (Iceland, Liechtenstein,
 *   Norway) have the right to enter and reside in Ireland freely under EU
 *   free movement rules (Directive 2004/38/EC as transposed into Irish law).
 *   There is no day limit for EU/EEA nationals.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/
 *
 * COMMON TRAVEL AREA (CTA)
 *   Ireland and the United Kingdom share the Common Travel Area. British
 *   citizens may enter and reside in Ireland freely with no visa, no time
 *   limit, and no pre-travel authorisation required. This arrangement predates
 *   both countries' EU membership and was unaffected by Brexit.
 *
 *   Exception: British Protected Persons (a residual category under the
 *   British Nationality Act 1981 connected to former protectorates) are
 *   treated as visa-required for Ireland despite sharing the 'GB' passport.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/
 *
 * SWISS NATIONALS
 *   Switzerland has a bilateral agreement with Ireland. Swiss nationals
 *   are treated equivalently to EEA nationals for entry and short stays.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/
 *
 * BRITISH-IRISH VISA SCHEME (BIVS)
 *   Indian and Chinese nationals who hold a valid, unexpired short-stay UK
 *   visa endorsed "BIVS" may enter Ireland without a separate Irish visa.
 *   Uniquely, an Irish C visa also permits travel to the UK under this scheme
 *   (bidirectional). Both nationalities remain visa_required; the BIVS
 *   exception is documented as a note.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/
 *
 * SHORT STAY VISA WAIVER PROGRAMME (SSVWP)
 *   Nationals of 22 countries who hold a valid, unexpired short-stay UK visa
 *   may enter Ireland without a separate Irish visa. Unlike BIVS, this is
 *   one-directional — an Irish visa does not give access to the UK under SSVWP.
 *   Affected nationalities remain visa_required; the exception is noted.
 *
 *   Citizens of India and China are covered by BIVS (above) rather than SSVWP,
 *   despite China appearing in both schemes — BIVS is the more specific and
 *   more favourable arrangement for those two nationalities.
 *
 *   Note: Ukraine appears in the SSVWP list on citizensinformation.ie but is
 *   classified visa_free in the current INIS nationality table (verified
 *   2026-05-27). The SSVWP note is therefore not applied to Ukraine here.
 *   Monitor for changes.
 *
 *   Source: https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/visa-requirements-for-entering-ireland/
 *
 * TRANSIT VISAS
 *   Nationals of 25 countries require a valid Irish transit visa when passing
 *   through Ireland on the way to another destination. A transit visa does not
 *   permit the holder to leave the port or airport.
 *
 *   Source: https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/visa-requirements-for-entering-ireland/
 *
 * NO ETA / ETIAS REQUIREMENT
 *   Ireland does not operate an ETA system and will not participate in ETIAS
 *   (the EU's Electronic Travel Information and Authorisation System, expected
 *   late 2026). No pre-travel electronic authorisation is required for
 *   visa-exempt travellers to Ireland.
 *
 * ── Data source ───────────────────────────────────────────────────────────────
 *   The passportRules below are derived from the INIS visa/non-visa required
 *   nationality table, extracted in full from:
 *     https://www.irishimmigration.ie/visa-non-visa-required-nationalities/
 *   (Ninja Table ID 19077, extracted 2026-05-27)
 *
 *   Free movement status for EU/EEA/Swiss/British nationals is layered on top
 *   of that data using the sources listed above. SSVWP, BIVS, and transit visa
 *   annotations use citizensinformation.ie and INIS-specific pages as sources.
 *
 *   The "Refugee or Stateless" entry in the INIS table (visa_required) cannot
 *   be represented as an ISO Alpha-2 code and is omitted from passportRules;
 *   it falls through to defaultRule correctly.
 *
 * Last verified: 2026-05-27
 */

import type { RegionDefinition, PassportRule, SourceDoc } from '@/types';

// ─── Source document references ───────────────────────────────────────────────

/** INIS — visa/non-visa required nationality table */
const INIS_VISA_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/visa-non-visa-required-nationalities/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
  dateChecked: '2026-05-27',
};

/** INIS — EU/EEA/Swiss free movement in Ireland */
const EU_FREE_MOVEMENT_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/',
  dateChecked: '2026-05-27',
};

/** INIS — Common Travel Area guidance */
const CTA_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
  dateChecked: '2026-05-27',
};

/** INIS — British-Irish Visa Scheme */
const BIVS_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
  dateChecked: '2026-05-27',
};

/**
 * citizensinformation.ie — visa requirements overview.
 * Source for Short Stay Visa Waiver Programme and transit visa country lists.
 */
const CITIZENSINFORMATION_SOURCE: SourceDoc = {
  directUrl: 'https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/visa-requirements-for-entering-ireland/',
  parentUrl: 'https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/',
  dateChecked: '2026-05-27',
};

// ─── Shared note text ─────────────────────────────────────────────────────────

const CTA_NOTE =
  'British citizens have unrestricted freedom of movement throughout Ireland ' +
  'under the Common Travel Area (CTA). No visa or pre-travel authorisation is ' +
  'required. Note: British Protected Persons are an exception and require a visa.';

const BIVS_NOTE =
  'Visa required. Exception: holders of a valid, unexpired short-stay UK visa ' +
  'endorsed "BIVS" may enter Ireland without a separate Irish visa under the ' +
  'British-Irish Visa Scheme (BIVS). An Irish C visa similarly permits travel ' +
  'to the UK under this scheme (bidirectional).';

const SSVWP_NOTE =
  'Visa required. Exception: holders of a valid, unexpired short-stay UK visa ' +
  'may enter Ireland without a separate Irish visa under the Short Stay Visa ' +
  'Waiver Programme (SSVWP). The UK visa must remain valid for the intended ' +
  'period of stay. Note: this is one-directional — an Irish visa does not ' +
  'grant access to the UK under SSVWP.';

const TRANSIT_VISA_NOTE =
  'A valid Irish transit visa is required when passing through Ireland in ' +
  'transit to another country. A transit visa does not permit the holder to ' +
  'leave the port or airport or otherwise enter Ireland.';

// ─── Shared rule constants ────────────────────────────────────────────────────

const FREE_MOVEMENT: PassportRule = { access: 'free_movement' };

const VISA_REQUIRED: PassportRule = { access: 'visa_required' };

const VISA_REQUIRED_BIVS: PassportRule = {
  access: 'visa_required',
  notes: [{ text: BIVS_NOTE, source: BIVS_SOURCE }],
};

const VISA_REQUIRED_SSVWP: PassportRule = {
  access: 'visa_required',
  notes: [{ text: SSVWP_NOTE, source: CITIZENSINFORMATION_SOURCE }],
};

const VISA_REQUIRED_TRANSIT: PassportRule = {
  access: 'visa_required',
  notes: [{ text: TRANSIT_VISA_NOTE, source: CITIZENSINFORMATION_SOURCE }],
};

// Standard 90-day visa-free entry. Per permission, not a rolling window.
function visaFree(): PassportRule {
  return {
    access: 'visa_free',
    allowanceDays: 90,
    // windowDays is set structurally for type compatibility but Ireland does NOT
    // operate a rolling window. The 90-day limit is per permission granted at
    // the border. Repeat maximum-duration visits are subject to officer
    // discretion; there is no calculable aggregate counter.
    windowDays: 365,
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const IRELAND: RegionDefinition = {
  code: 'ireland',
  name: 'Ireland',
  memberStates: ['IE'],

  // Per-visit limit — NOT a rolling window. See header comment.
  rule: {
    allowanceDays: 90,
    windowDays: 365,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },

  lastVerified: '2026-05-27',
  sourceUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',

  defaultRule: { access: 'visa_required' },

  passportRules: {

    // ── Irish citizens ─────────────────────────────────────────────────────
    'IE': FREE_MOVEMENT,

    // ── Common Travel Area — British citizens ──────────────────────────────
    // British Protected Persons are the sole British nationality category
    // requiring a visa for Ireland. All other GB passport types are
    // free_movement under the CTA. Since passportRules is keyed by ISO code
    // and GB covers all British passport types, this exception is documented
    // in the note rather than as a separate rule.
    'GB': {
      access: 'free_movement',
      notes: [{ text: CTA_NOTE, source: CTA_SOURCE }],
    },

    // ── EU member states — free movement ──────────────────────────────────
    'AT': FREE_MOVEMENT, // Austria
    'BE': FREE_MOVEMENT, // Belgium
    'BG': FREE_MOVEMENT, // Bulgaria
    'HR': FREE_MOVEMENT, // Croatia
    'CY': FREE_MOVEMENT, // Cyprus
    'CZ': FREE_MOVEMENT, // Czech Republic
    'DK': FREE_MOVEMENT, // Denmark
    'EE': FREE_MOVEMENT, // Estonia
    'FI': FREE_MOVEMENT, // Finland
    'FR': FREE_MOVEMENT, // France
    'DE': FREE_MOVEMENT, // Germany
    'GR': FREE_MOVEMENT, // Greece
    'HU': FREE_MOVEMENT, // Hungary
    'IT': FREE_MOVEMENT, // Italy
    'LV': FREE_MOVEMENT, // Latvia
    'LT': FREE_MOVEMENT, // Lithuania
    'LU': FREE_MOVEMENT, // Luxembourg
    'MT': FREE_MOVEMENT, // Malta
    'NL': FREE_MOVEMENT, // Netherlands
    'PL': FREE_MOVEMENT, // Poland
    'PT': FREE_MOVEMENT, // Portugal
    'RO': FREE_MOVEMENT, // Romania
    'SK': FREE_MOVEMENT, // Slovakia
    'SI': FREE_MOVEMENT, // Slovenia
    'ES': FREE_MOVEMENT, // Spain
    'SE': FREE_MOVEMENT, // Sweden

    // ── EEA non-EU ────────────────────────────────────────────────────────
    'IS': FREE_MOVEMENT, // Iceland
    'LI': FREE_MOVEMENT, // Liechtenstein
    'NO': FREE_MOVEMENT, // Norway

    // ── Switzerland — bilateral agreement, equivalent to EEA ──────────────
    'CH': {
      access: 'free_movement',
      notes: [{
        text: 'Swiss nationals are treated equivalently to EEA nationals for entry and short stays under a bilateral agreement with Ireland.',
        source: EU_FREE_MOVEMENT_SOURCE,
      }],
    },

    // ── Visa-free — up to 90 days per permission ───────────────────────────
    // Source: INIS visa/non-visa required nationality table (extracted 2026-05-27).
    // No ETA or ETIAS required (Ireland does not operate these systems).

    // Americas
    'AG': visaFree(), // Antigua and Barbuda
    'AR': visaFree(), // Argentina
    'BB': visaFree(), // Barbados
    'BZ': visaFree(), // Belize
    'BR': visaFree(), // Brazil
    'CA': visaFree(), // Canada
    'CL': visaFree(), // Chile
    'CR': visaFree(), // Costa Rica
    'SV': visaFree(), // El Salvador
    'GD': visaFree(), // Grenada
    'GT': visaFree(), // Guatemala
    'GY': visaFree(), // Guyana
    'MX': visaFree(), // Mexico
    'NI': visaFree(), // Nicaragua
    'PA': visaFree(), // Panama
    'PY': visaFree(), // Paraguay
    'KN': visaFree(), // Saint Kitts and Nevis
    'LC': visaFree(), // Saint Lucia
    'VC': visaFree(), // Saint Vincent and the Grenadines
    'US': visaFree(), // United States
    'UY': visaFree(), // Uruguay

    // Asia-Pacific
    'AU': visaFree(), // Australia
    'BN': visaFree(), // Brunei
    'FJ': visaFree(), // Fiji
    'HK': visaFree(), // Hong Kong SAR
    'IL': visaFree(), // Israel
    'JP': visaFree(), // Japan
    'KI': visaFree(), // Kiribati
    'KR': visaFree(), // South Korea
    'MO': visaFree(), // Macau SAR
    'MY': visaFree(), // Malaysia
    'MV': visaFree(), // Maldives
    'NZ': visaFree(), // New Zealand
    'SB': visaFree(), // Solomon Islands
    'SG': visaFree(), // Singapore
    'TW': visaFree(), // Taiwan Province of China
    'TO': visaFree(), // Tonga
    'TV': visaFree(), // Tuvalu

    // Africa / Indian Ocean
    'SC': visaFree(), // Seychelles

    // Europe (non-EU/EEA/CH — micro-states)
    'AD': visaFree(), // Andorra
    'MC': visaFree(), // Monaco
    'SM': visaFree(), // San Marino
    'VA': visaFree(), // Vatican City (Holy See)

    // Middle East
    'AE': visaFree(), // United Arab Emirates

    // Eastern Europe
    // Note: Ukraine appears in the SSVWP list on citizensinformation.ie but is
    // classified visa_free in the current INIS nationality table (2026-05-27).
    // SSVWP note is therefore not applied. Monitor for changes.
    'UA': visaFree(), // Ukraine

    // ── Visa required — BIVS (British-Irish Visa Scheme) ──────────────────
    // India and China: holders of a valid BIVS-endorsed UK short-stay visa
    // may enter Ireland without a separate Irish visa. Bidirectional.
    'CN': VISA_REQUIRED_BIVS, // China (People's Republic of)
    'IN': VISA_REQUIRED_BIVS, // India

    // ── Visa required — SSVWP (Short Stay Visa Waiver Programme) ──────────
    // Holders of a valid UK short-stay visa may enter Ireland without a
    // separate Irish visa. One-directional (does not grant UK access).
    'BH': VISA_REQUIRED_SSVWP, // Bahrain
    'BA': VISA_REQUIRED_SSVWP, // Bosnia and Herzegovina
    'CO': VISA_REQUIRED_SSVWP, // Colombia
    'ID': VISA_REQUIRED_SSVWP, // Indonesia
    'KZ': VISA_REQUIRED_SSVWP, // Kazakhstan
    'XK': VISA_REQUIRED_SSVWP, // Kosovo
    'KW': VISA_REQUIRED_SSVWP, // Kuwait
    'ME': VISA_REQUIRED_SSVWP, // Montenegro
    'MK': VISA_REQUIRED_SSVWP, // North Macedonia
    'OM': VISA_REQUIRED_SSVWP, // Oman
    'PE': VISA_REQUIRED_SSVWP, // Peru
    'PH': VISA_REQUIRED_SSVWP, // Philippines
    'QA': VISA_REQUIRED_SSVWP, // Qatar
    'SA': VISA_REQUIRED_SSVWP, // Saudi Arabia
    'RS': VISA_REQUIRED_SSVWP, // Serbia
    'TH': VISA_REQUIRED_SSVWP, // Thailand
    'TR': VISA_REQUIRED_SSVWP, // Türkiye
    'UZ': VISA_REQUIRED_SSVWP, // Uzbekistan
    'VN': VISA_REQUIRED_SSVWP, // Vietnam

    // ── Visa required — transit visa also required ─────────────────────────
    // These nationals require a transit visa when passing through Ireland in
    // transit to another country, even without entering Irish territory.
    // Source: citizensinformation.ie (verified 2026-05-27).
    'AF': VISA_REQUIRED_TRANSIT, // Afghanistan
    'AL': VISA_REQUIRED_TRANSIT, // Albania
    'BO': VISA_REQUIRED_TRANSIT, // Bolivia
    'BW': VISA_REQUIRED_TRANSIT, // Botswana
    'CU': VISA_REQUIRED_TRANSIT, // Cuba
    'CD': VISA_REQUIRED_TRANSIT, // Congo (Democratic Republic of)
    'DM': VISA_REQUIRED_TRANSIT, // Dominica
    'ER': VISA_REQUIRED_TRANSIT, // Eritrea
    'SZ': VISA_REQUIRED_TRANSIT, // Eswatini
    'ET': VISA_REQUIRED_TRANSIT, // Ethiopia
    'GE': VISA_REQUIRED_TRANSIT, // Georgia
    'GH': VISA_REQUIRED_TRANSIT, // Ghana
    'HN': VISA_REQUIRED_TRANSIT, // Honduras
    'IR': VISA_REQUIRED_TRANSIT, // Iran
    'IQ': VISA_REQUIRED_TRANSIT, // Iraq
    'LB': VISA_REQUIRED_TRANSIT, // Lebanon
    'LS': VISA_REQUIRED_TRANSIT, // Lesotho
    'MD': VISA_REQUIRED_TRANSIT, // Moldova
    'NR': VISA_REQUIRED_TRANSIT, // Nauru
    'NG': VISA_REQUIRED_TRANSIT, // Nigeria
    'SO': VISA_REQUIRED_TRANSIT, // Somalia
    'ZA': VISA_REQUIRED_TRANSIT, // South Africa
    'LK': VISA_REQUIRED_TRANSIT, // Sri Lanka
    'TT': VISA_REQUIRED_TRANSIT, // Trinidad and Tobago
    'VU': VISA_REQUIRED_TRANSIT, // Vanuatu

    // ── Visa required — no additional scheme ──────────────────────────────
    'DZ': VISA_REQUIRED, // Algeria
    'AO': VISA_REQUIRED, // Angola
    'AM': VISA_REQUIRED, // Armenia
    'AZ': VISA_REQUIRED, // Azerbaijan
    'BD': VISA_REQUIRED, // Bangladesh
    'BY': VISA_REQUIRED, // Belarus
    'BJ': VISA_REQUIRED, // Benin
    'BT': VISA_REQUIRED, // Bhutan
    'BF': VISA_REQUIRED, // Burkina Faso
    'BI': VISA_REQUIRED, // Burundi
    'KH': VISA_REQUIRED, // Cambodia
    'CM': VISA_REQUIRED, // Cameroon
    'CV': VISA_REQUIRED, // Cape Verde
    'CF': VISA_REQUIRED, // Central African Republic
    'TD': VISA_REQUIRED, // Chad
    'KM': VISA_REQUIRED, // Comoros
    'CG': VISA_REQUIRED, // Congo (Brazzaville)
    'CI': VISA_REQUIRED, // Côte d'Ivoire (Ivory Coast)
    'DJ': VISA_REQUIRED, // Djibouti
    'DO': VISA_REQUIRED, // Dominican Republic
    'EC': VISA_REQUIRED, // Ecuador
    'EG': VISA_REQUIRED, // Egypt
    'GQ': VISA_REQUIRED, // Equatorial Guinea
    'GA': VISA_REQUIRED, // Gabon
    'GM': VISA_REQUIRED, // Gambia
    'GN': VISA_REQUIRED, // Guinea
    'GW': VISA_REQUIRED, // Guinea-Bissau
    'HT': VISA_REQUIRED, // Haiti
    'JM': VISA_REQUIRED, // Jamaica
    'JO': VISA_REQUIRED, // Jordan
    'KE': VISA_REQUIRED, // Kenya
    'KP': VISA_REQUIRED, // Korea (North)
    'KG': VISA_REQUIRED, // Kyrgyzstan
    'LA': VISA_REQUIRED, // Laos
    'LR': VISA_REQUIRED, // Liberia
    'LY': VISA_REQUIRED, // Libya
    'MG': VISA_REQUIRED, // Madagascar
    'MW': VISA_REQUIRED, // Malawi
    'ML': VISA_REQUIRED, // Mali
    'MR': VISA_REQUIRED, // Mauritania
    'MH': VISA_REQUIRED, // Marshall Islands
    'MU': VISA_REQUIRED, // Mauritius
    'FM': VISA_REQUIRED, // Micronesia
    'MN': VISA_REQUIRED, // Mongolia
    'MA': VISA_REQUIRED, // Morocco
    'MZ': VISA_REQUIRED, // Mozambique
    'MM': VISA_REQUIRED, // Myanmar
    'NA': VISA_REQUIRED, // Namibia
    'NP': VISA_REQUIRED, // Nepal
    'NE': VISA_REQUIRED, // Niger
    'PK': VISA_REQUIRED, // Pakistan
    'PG': VISA_REQUIRED, // Papua New Guinea
    'PS': VISA_REQUIRED, // Palestinian National Authority
    'RU': VISA_REQUIRED, // Russian Federation
    'RW': VISA_REQUIRED, // Rwanda
    'ST': VISA_REQUIRED, // Sao Tome and Principe
    'SN': VISA_REQUIRED, // Senegal
    'SL': VISA_REQUIRED, // Sierra Leone
    'SS': VISA_REQUIRED, // South Sudan
    'SD': VISA_REQUIRED, // Sudan
    'SR': VISA_REQUIRED, // Suriname
    'SY': VISA_REQUIRED, // Syrian Arab Republic
    'TJ': VISA_REQUIRED, // Tajikistan
    'TZ': VISA_REQUIRED, // Tanzania
    'TG': VISA_REQUIRED, // Togo
    'TN': VISA_REQUIRED, // Tunisia
    'TM': VISA_REQUIRED, // Turkmenistan
    'UG': VISA_REQUIRED, // Uganda
    'VE': VISA_REQUIRED, // Venezuela
    'YE': VISA_REQUIRED, // Yemen
    'ZM': VISA_REQUIRED, // Zambia
    'ZW': VISA_REQUIRED, // Zimbabwe
    'TL': VISA_REQUIRED, // Timor-Leste
    'PW': VISA_REQUIRED, // Palau

  },
};

/**
 * Returns the Ireland passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes.
 */
export function getIrelandRule(passportCode: string | null): PassportRule {
  if (!passportCode) return IRELAND.defaultRule;
  return IRELAND.passportRules[passportCode] ?? IRELAND.defaultRule;
}
