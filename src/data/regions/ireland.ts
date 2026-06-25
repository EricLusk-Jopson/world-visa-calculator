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
 * EU / EEA FREE MOVEMENT
 *   Citizens of EU Member States and EEA countries (Iceland, Liechtenstein,
 *   Norway) have the right to enter and reside in Ireland freely under EU
 *   free movement rules (Directive 2004/38/EC as transposed into Irish law).
 *
 * COMMON TRAVEL AREA (CTA)
 *   Ireland and the United Kingdom share the Common Travel Area. British
 *   citizens may enter and reside in Ireland freely with no visa, no time
 *   limit, and no pre-travel authorisation required.
 *
 *   Exception: British Protected Persons (a residual category under the
 *   British Nationality Act 1981 connected to former protectorates) are
 *   treated as visa-required for Ireland despite sharing the 'GB' passport.
 *
 * SWISS NATIONALS
 *   Switzerland has a bilateral agreement with Ireland. Swiss nationals
 *   are treated equivalently to EEA nationals for entry and short stays.
 *
 * BRITISH-IRISH VISA SCHEME (BIVS)
 *   Indian and Chinese nationals who hold a valid, unexpired short-stay UK
 *   visa endorsed "BIVS" may enter Ireland without a separate Irish visa.
 *   An Irish C visa also permits travel to the UK (bidirectional).
 *   Both nationalities remain visa_required; the exception is a note.
 *
 * SHORT STAY VISA WAIVER PROGRAMME (SSVWP)
 *   Nationals of 19 countries (excluding IN and CN, covered by BIVS) who
 *   hold a valid, unexpired short-stay UK visa may enter Ireland without a
 *   separate Irish visa. One-directional — an Irish visa does not grant
 *   access to the UK under SSVWP.
 *
 *   Note: Ukraine appears in the SSVWP list on citizensinformation.ie but is
 *   classified visa_free in the current INIS nationality table (2026-05-27).
 *   SSVWP note not applied to Ukraine. Monitor for changes.
 *
 * TRANSIT VISAS
 *   Nationals of 25 countries require a valid Irish transit visa when passing
 *   through Ireland in transit. A transit visa does not permit entry.
 *
 * NO ETA / ETIAS
 *   Ireland does not operate an ETA system and will not participate in ETIAS.
 *   No pre-travel electronic authorisation is required for visa-exempt travellers.
 *
 * ── Data source ───────────────────────────────────────────────────────────────
 *   passportRules derived from the INIS visa/non-visa required nationality
 *   table (Ninja Table ID 19077, extracted 2026-05-27).
 *   Free movement, BIVS, SSVWP, and transit annotations use sources in
 *   IrelandSources (@/data/sources).
 *
 *   "Refugee or Stateless" in the INIS table has no ISO Alpha-2 code;
 *   it is omitted and falls through to defaultRule correctly.
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
  PerVisitLimit,
} from '@/types';
import { IrelandSources } from '@/data/sources';

// ─── Stay limit ───────────────────────────────────────────────────────────────

const IRELAND_LIMIT: PerVisitLimit = {
  type: 'per_visit',
  days: 90,
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

const FREE_MOVEMENT: FreeMovementRule = { access: 'free_movement' };
const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

const VISA_REQUIRED_BIVS: VisaRequiredRule = {
  access: 'visa_required',
  notes: [{ text: BIVS_NOTE, source: IrelandSources.bivs }],
};

const VISA_REQUIRED_SSVWP: VisaRequiredRule = {
  access: 'visa_required',
  notes: [{ text: SSVWP_NOTE, source: IrelandSources.citizensInformation }],
};

const VISA_REQUIRED_TRANSIT: VisaRequiredRule = {
  access: 'visa_required',
  notes: [{ text: TRANSIT_VISA_NOTE, source: IrelandSources.citizensInformation }],
};

/**
 * Standard Ireland entitled rule — 90 days per permission, no rolling window,
 * no pre-travel authorisation required.
 *
 * Note placement convention (see schengen.ts entitled() for full documentation):
 *   entitlementNotes → inside StayEntitlement.notes (condition-specific context)
 *   ruleNotes        → on EntitledRule.notes (rule-level context, fallback explanation)
 */
function entitled(
  entitlementNotes?: RuleNote[],
  ruleNotes?: RuleNote[],
): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [IRELAND_LIMIT],
      ...(entitlementNotes !== undefined && entitlementNotes.length > 0 && { notes: entitlementNotes }),
    }],
    ...(ruleNotes !== undefined && ruleNotes.length > 0 && { notes: ruleNotes }),
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const IRELAND: RegionDefinition = {
  code: 'ireland',
  name: 'Ireland',
  memberStates: ['IE'],

  rule: {
    type: 'per_visit',
    allowanceDays: 90,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
    notes: [{
      text:
        'INIS has stated explicitly that it is not possible to remain in Ireland ' +
        'for 90 days and then immediately re-enter for a further 90-day period. ' +
        'Repeat maximum-duration stays are subject to officer discretion and are ' +
        'not calculable by a tool.',
      source: IrelandSources.visaNationalityList,
    }],
  },

  lastVerified: '2026-05-27',
  sourceUrl: IrelandSources.visaNationalityList.parentUrl,
  defaultRule: VISA_REQUIRED,

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
      notes: [{ text: CTA_NOTE, source: IrelandSources.ctaGuidance }],
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
        source: IrelandSources.euFreeMovement,
      }],
    },

    // ── Entitled — up to 90 days per permission ────────────────────────────
    // Source: INIS visa/non-visa required nationality table (extracted 2026-05-27).
    // No ETA or ETIAS required (Ireland does not operate these systems).

    // Americas
    'AG': entitled(), // Antigua and Barbuda
    'AR': entitled(), // Argentina
    'BB': entitled(), // Barbados
    'BZ': entitled(), // Belize
    'BR': entitled(), // Brazil
    'CA': entitled(), // Canada
    'CL': entitled(), // Chile
    'CR': entitled(), // Costa Rica
    'SV': entitled(), // El Salvador
    'GD': entitled(), // Grenada
    'GT': entitled(), // Guatemala
    'GY': entitled(), // Guyana
    'MX': entitled(), // Mexico
    'NI': entitled(), // Nicaragua
    'PA': entitled(), // Panama
    'PY': entitled(), // Paraguay
    'KN': entitled(), // Saint Kitts and Nevis
    'LC': entitled(), // Saint Lucia
    'VC': entitled(), // Saint Vincent and the Grenadines
    'US': entitled(), // United States
    'UY': entitled(), // Uruguay

    // Asia-Pacific
    'AU': entitled(), // Australia
    'BN': entitled(), // Brunei
    'FJ': entitled(), // Fiji
    'HK': entitled(), // Hong Kong SAR
    'IL': entitled(), // Israel
    'JP': entitled(), // Japan
    'KI': entitled(), // Kiribati
    'KR': entitled(), // South Korea
    'MO': entitled(), // Macau SAR
    'MY': entitled(), // Malaysia
    'MV': entitled(), // Maldives
    'NZ': entitled(), // New Zealand
    'SB': entitled(), // Solomon Islands
    'SG': entitled(), // Singapore
    'TW': entitled(), // Taiwan Province of China
    'TO': entitled(), // Tonga
    'TV': entitled(), // Tuvalu

    // Africa / Indian Ocean
    'SC': entitled(), // Seychelles

    // Europe (non-EU/EEA/CH — micro-states)
    'AD': entitled(), // Andorra
    'MC': entitled(), // Monaco
    'SM': entitled(), // San Marino
    'VA': entitled(), // Vatican City (Holy See)

    // Middle East
    'AE': entitled(), // United Arab Emirates

    // Eastern Europe
    // Note: Ukraine appears in the SSVWP list on citizensinformation.ie but is
    // classified visa_free in the current INIS nationality table (2026-05-27).
    // SSVWP note not applied. Monitor for changes.
    'UA': entitled(), // Ukraine

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
