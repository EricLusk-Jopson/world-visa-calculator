/**
 * serbia.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Serbia's visa rules by passport/nationality.
 *
 * Source: Republic of Serbia, Ministry of Foreign Affairs — "Visa regime"
 *   https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime
 * One dedicated page per nationality under this index. All source URLs live in
 * @/data/sources — SerbiaSources (one entry per ISO code).
 *
 * ── Data provenance and known decisions ────────────────────────────────────────
 *
 * Generated from a full scrape of 194 country pages (name, source URL, an
 * "ordinaryPassport" value, and a "diplomaticOfficial" value), not
 * hand-transcribed. Every entry's shape below was classified from the actual
 * `ordinaryPassport` text, not a blanket assumption — the exact wording varies
 * meaningfully across entries (see the shape sections below).
 *
 * DIPLOMATIC / OFFICIAL PASSPORTS
 *   The source gives a separate, often more generous, value for diplomatic and
 *   official passport holders on every single entry. This is deliberately NOT
 *   modeled anywhere in this file — the app has no notion of diplomatic status,
 *   so this data is out of scope for every entry, not selectively noted. Every
 *   rule below reflects the `ordinaryPassport` value only.
 *
 * ROLLING WINDOW, NOT FIXED WINDOW FROM ENTRY
 *   The dominant ordinary-passport phrasing ("no visa required for up to 90 days
 *   in a 6-month period starting from the date of first entry") is the same
 *   ambiguous "from first entry" wording used — and then deliberately reverted
 *   away from `fixed_window_from_entry` — for Montenegro in this codebase. A
 *   fixed window anchored to first entry and reset by any windowDays-or-more gap
 *   permits a traveler to stay up to 180 of 182 consecutive days by timing
 *   re-entry against the anchor; no source encountered so far actually intends
 *   that. Every entitled entry in this file uses `rolling_window`, never
 *   `fixed_window_from_entry`, regardless of "from first entry" wording.
 *
 * STACKED LIMITS FOR BARE "UP TO N DAYS" ENTRIES
 *   A handful of entries (Belarus, China, Hong Kong SAR, Macao SAR, Holy See,
 *   Kazakhstan, Korea Republic, Montenegro, Russia, Suriname) state only a bare
 *   day count with no window language at all. These are modeled as STACKED
 *   limits — `[per_visit(N), rolling_window(90, 180)]` — not `per_visit(N)`
 *   alone: Serbia's underlying 90/180 rolling-window cap is stated explicitly on
 *   nearly every other entry, so a country-specific page that only announces a
 *   shorter N-day allowance is read as layering a tighter per-visit cap on top
 *   of that standing cap, not replacing it — the same stacked-limits shape this
 *   codebase already uses for Indonesia/Belarus under Türkiye. Confirmed by
 *   explicit decision for every entry in this bucket, not just Kazakhstan.
 *
 * KNOWN GAPS AND SPECIAL CASES (see individual entry comments for detail):
 *   - Marshall Islands (MH): no visa-regime section published on the source at
 *     all — a genuine content gap, defaulted to visa_required.
 *   - Taiwan (TW): not present anywhere in the 194-page scrape this file was
 *     generated from (unlike every other ISO code this file covers) — defaulted
 *     to visa_required with a note explaining the gap, pending direct
 *     verification.
 *   - China (CN) / Hong Kong SAR (HK) / Macao SAR (MO): the source's single
 *     "China" page gives distinct figures for mainland ordinary passports (30
 *     days, stacked), Hong Kong SAR passports (14 days, stacked), and Macao SAR
 *     passports (90 days, stacked) — encoded as three separate entries under
 *     their own ISO codes (CN/HK/MO), not folded into one. HK and MO have no
 *     dedicated source page of their own; their SourceDoc entries cite the same
 *     China page.
 *   - Moldova (MD): visa exemption is conditional on a biometric passport,
 *     mirroring the exact `biometric_passport` condition pattern already
 *     established in schengen.ts for the same country.
 *   - Israel (IL): the source also distinguishes two Israeli travel-document
 *     sub-types beyond the ordinary passport; folded into a note, not modeled
 *     as a formal condition (this file doesn't model document sub-types).
 *   - Palestine (PS): included per the source (visa required), using the
 *     standard ISO code — not currently selectable via NationalitySelector's
 *     passport picker, mirroring montenegro.ts's own PS entry.
 *
 * Last verified: 2026-08-31
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  SourceDoc,
} from '@/types';
import { SerbiaSources } from '@/data/sources';

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

// ─── Entitlement helpers ───────────────────────────────────────────────────────

/**
 * visaRequired — cites this country's source page, even when there is nothing
 * else to say, so every entry in this file is traceable back to its specific
 * gov.rs page, not just the region-level parentUrl.
 */
function visaRequired(source: SourceDoc, extraNotes: RuleNote[] = []): VisaRequiredRule {
  return {
    access: 'visa_required',
    notes: [
      { text: "Serbia's Ministry of Foreign Affairs states this nationality requires a visa to enter.", source },
      ...extraNotes,
    ],
  };
}

function idCardNote(source: SourceDoc): RuleNote {
  return { text: 'Nationals may also enter using a valid national ID card instead of a passport.', source };
}

/** Standard entitled rule — N days in any windowDays-day rolling window. */
function entitledRolling(days: number, windowDays: number, source: SourceDoc, extraNotes: RuleNote[] = []): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [{ type: 'rolling_window', days, windowDays }],
      notes: [
        { text: 'Source: Republic of Serbia Ministry of Foreign Affairs, visa-regime page for this country.', source },
        ...extraNotes,
      ],
    }],
  };
}

/**
 * Stacked entitled rule for sources that state only a bare "up to N days" with
 * no window language — N governs per visit, Serbia's standard 90-in-180 cap
 * governs cumulative presence. See file header for the rationale.
 */
function entitledStacked(perVisitDays: number, source: SourceDoc, extraNotes: RuleNote[] = []): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [
        { type: 'per_visit', value: perVisitDays, unit: 'days' },
        { type: 'rolling_window', days: 90, windowDays: 180 },
      ],
      notes: [
        {
          text: `Source states only a ${perVisitDays}-day allowance with no window language. Serbia's standard 90-day-in-180-day cap is treated as still applying on top of it: the ${perVisitDays}-day figure governs any single visit, the rolling window governs cumulative presence across visits.`,
          source,
        },
        ...extraNotes,
      ],
    }],
  };
}

// ─── Region definition ──────────────────────────────────────────────────────────

export const SERBIA: RegionDefinition = {
  code: 'serbia',
  name: 'Serbia',
  memberStates: ['RS'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-08-31',
  sourceUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
  defaultRule: VISA_REQUIRED,
  passportRules: {
    // ── Visa required ──────────────────────────────────────────────────────
    'AF': visaRequired(SerbiaSources.AF), // Afghanistan
    'AO': visaRequired(SerbiaSources.AO), // Angola
    'BD': visaRequired(SerbiaSources.BD), // Bangladesh
    'BF': visaRequired(SerbiaSources.BF), // Burkina Faso
    'BI': visaRequired(SerbiaSources.BI), // Burundi
    'BJ': visaRequired(SerbiaSources.BJ), // Benin
    'BN': visaRequired(SerbiaSources.BN), // Brunei Darussalam
    'BO': visaRequired(SerbiaSources.BO), // Bolivia
    'BT': visaRequired(SerbiaSources.BT), // Bhutan
    'BW': visaRequired(SerbiaSources.BW), // Botswana
    'BZ': visaRequired(SerbiaSources.BZ), // Belize
    'CD': visaRequired(SerbiaSources.CD), // Congo, Democratic Republic
    'CF': visaRequired(SerbiaSources.CF), // Central African Republic
    'CG': visaRequired(SerbiaSources.CG), // Congo, Republic
    'CI': visaRequired(SerbiaSources.CI), // Cote d’Ivoire
    'CM': visaRequired(SerbiaSources.CM), // Cameroon
    'CU': visaRequired(SerbiaSources.CU), // Cuba
    'CV': visaRequired(SerbiaSources.CV), // Cabo Verde
    'DJ': visaRequired(SerbiaSources.DJ), // Djibouti
    'DO': visaRequired(SerbiaSources.DO), // Dominican Republic
    'DZ': visaRequired(SerbiaSources.DZ), // Algeria
    'EC': visaRequired(SerbiaSources.EC), // Ecuador
    'EG': visaRequired(SerbiaSources.EG), // Egypt
    'ER': visaRequired(SerbiaSources.ER), // Eritrea
    'ET': visaRequired(SerbiaSources.ET), // Ethiopia
    'FJ': visaRequired(SerbiaSources.FJ), // Fiji
    'FM': visaRequired(SerbiaSources.FM), // Micronesia
    'GA': visaRequired(SerbiaSources.GA), // Gabon
    'GH': visaRequired(SerbiaSources.GH), // Ghana
    'GM': visaRequired(SerbiaSources.GM), // Gambia
    'GN': visaRequired(SerbiaSources.GN), // Guinea
    'GQ': visaRequired(SerbiaSources.GQ), // Equatorial Guinea
    'GT': visaRequired(SerbiaSources.GT), // Guatemala
    'GW': visaRequired(SerbiaSources.GW), // Guinea-Bissau
    'GY': visaRequired(SerbiaSources.GY), // Guyana
    'HN': visaRequired(SerbiaSources.HN), // Honduras
    'HT': visaRequired(SerbiaSources.HT), // Haiti
    'IN': visaRequired(SerbiaSources.IN), // India
    'IQ': visaRequired(SerbiaSources.IQ), // Iraq
    'IR': visaRequired(SerbiaSources.IR), // Iran
    'JO': visaRequired(SerbiaSources.JO), // Jordan
    'KE': visaRequired(SerbiaSources.KE), // Kenya
    'KH': visaRequired(SerbiaSources.KH), // Cambodia
    'KI': visaRequired(SerbiaSources.KI), // Kiribati
    'KM': visaRequired(SerbiaSources.KM), // Union of the Comoros
    'KP': visaRequired(SerbiaSources.KP), // Korea, DPR
    'KW': visaRequired(SerbiaSources.KW), // Kuwait
    'LA': visaRequired(SerbiaSources.LA), // Laos
    'LB': visaRequired(SerbiaSources.LB), // Lebanon
    'LK': visaRequired(SerbiaSources.LK), // Sri Lanka
    'LR': visaRequired(SerbiaSources.LR), // Liberia
    'LS': visaRequired(SerbiaSources.LS), // Lesotho
    'LY': visaRequired(SerbiaSources.LY), // Libya
    'MA': visaRequired(SerbiaSources.MA), // Morocco
    'MG': visaRequired(SerbiaSources.MG), // Madagascar
    'ML': visaRequired(SerbiaSources.ML), // Mali
    'MM': visaRequired(SerbiaSources.MM), // Myanmar
    'MN': visaRequired(SerbiaSources.MN), // Mongolia
    'MR': visaRequired(SerbiaSources.MR), // Mauritania
    'MU': visaRequired(SerbiaSources.MU), // Mauritius
    'MV': visaRequired(SerbiaSources.MV), // Maldives
    'MW': visaRequired(SerbiaSources.MW), // Malawi
    'MY': visaRequired(SerbiaSources.MY), // Malaysia
    'MZ': visaRequired(SerbiaSources.MZ), // Mozambique
    'NA': visaRequired(SerbiaSources.NA), // Namibia
    'NE': visaRequired(SerbiaSources.NE), // Niger
    'NG': visaRequired(SerbiaSources.NG), // Nigeria
    'NI': visaRequired(SerbiaSources.NI), // Nicaragua
    'NP': visaRequired(SerbiaSources.NP), // Nepal
    'NR': visaRequired(SerbiaSources.NR), // Nauru
    'OM': visaRequired(SerbiaSources.OM), // Oman
    'PG': visaRequired(SerbiaSources.PG), // Papua New Guinea
    'PH': visaRequired(SerbiaSources.PH), // Philippines
    'PK': visaRequired(SerbiaSources.PK), // Pakistan
    'PS': visaRequired(SerbiaSources.PS), // Palestine
    'QA': visaRequired(SerbiaSources.QA), // Qatar
    'RW': visaRequired(SerbiaSources.RW), // Rwanda
    'SA': visaRequired(SerbiaSources.SA), // Saudi Arabia
    'SB': visaRequired(SerbiaSources.SB), // Solomon Islands
    'SD': visaRequired(SerbiaSources.SD), // Sudan
    'SL': visaRequired(SerbiaSources.SL), // Sierra Leone
    'SN': visaRequired(SerbiaSources.SN), // Senegal
    'SO': visaRequired(SerbiaSources.SO), // Somalia
    'SS': visaRequired(SerbiaSources.SS), // South Sudan
    'ST': visaRequired(SerbiaSources.ST), // Sao Tome and Principe
    'SV': visaRequired(SerbiaSources.SV), // El Salvador
    'SY': visaRequired(SerbiaSources.SY), // Syria, Arab Republic
    'SZ': visaRequired(SerbiaSources.SZ), // Eswatini
    'TD': visaRequired(SerbiaSources.TD), // Chad
    'TG': visaRequired(SerbiaSources.TG), // Togo
    'TH': visaRequired(SerbiaSources.TH), // Thailand
    'TJ': visaRequired(SerbiaSources.TJ), // Tajikistan
    'TL': visaRequired(SerbiaSources.TL), // Timor-Leste
    'TM': visaRequired(SerbiaSources.TM), // Turkmenistan
    'TN': visaRequired(SerbiaSources.TN), // Tunisia
    'TO': visaRequired(SerbiaSources.TO), // Tonga
    'TZ': visaRequired(SerbiaSources.TZ), // Tanzania
    'UG': visaRequired(SerbiaSources.UG), // Uganda
    'UZ': visaRequired(SerbiaSources.UZ), // Uzbekistan
    'VN': visaRequired(SerbiaSources.VN), // Vietnam
    'VU': visaRequired(SerbiaSources.VU), // Vanuatu
    'WS': visaRequired(SerbiaSources.WS), // Samoa
    'YE': visaRequired(SerbiaSources.YE), // Yemen
    'ZA': visaRequired(SerbiaSources.ZA), // South Africa
    'ZM': visaRequired(SerbiaSources.ZM), // Zambia
    'ZW': visaRequired(SerbiaSources.ZW), // Zimbabwe

    // ── Entitled — rolling_window(90, 180) ───────────────────────────────────
    'AD': entitledRolling(90, 180, SerbiaSources.AD), // Andorra
    'AE': entitledRolling(90, 180, SerbiaSources.AE), // United Arab Emirates
    'AG': entitledRolling(90, 180, SerbiaSources.AG), // Antigua and Barbuda
    'AL': entitledRolling(90, 180, SerbiaSources.AL, [idCardNote(SerbiaSources.AL)]), // Albania
    'AM': entitledRolling(90, 180, SerbiaSources.AM), // Armenia
    'AR': entitledRolling(90, 180, SerbiaSources.AR), // Argentina
    'AT': entitledRolling(90, 180, SerbiaSources.AT, [idCardNote(SerbiaSources.AT)]), // Austria
    'AU': entitledRolling(90, 180, SerbiaSources.AU), // Australia
    'AZ': entitledRolling(90, 180, SerbiaSources.AZ), // Azerbaijan
    'BA': entitledRolling(90, 180, SerbiaSources.BA, [idCardNote(SerbiaSources.BA)]), // Bosnia and Herzegovina
    'BE': entitledRolling(90, 180, SerbiaSources.BE, [idCardNote(SerbiaSources.BE)]), // Belgium
    'BG': entitledRolling(90, 180, SerbiaSources.BG, [idCardNote(SerbiaSources.BG)]), // Bulgaria
    'BH': entitledRolling(90, 180, SerbiaSources.BH), // Bahrain
    'BR': entitledRolling(90, 180, SerbiaSources.BR), // Brazil
    'CA': entitledRolling(90, 180, SerbiaSources.CA), // Canada
    'CH': entitledRolling(90, 180, SerbiaSources.CH, [idCardNote(SerbiaSources.CH)]), // Switzerland
    'CL': entitledRolling(90, 180, SerbiaSources.CL), // Chile
    'CR': entitledRolling(90, 180, SerbiaSources.CR), // Costa Rica
    'CY': entitledRolling(90, 180, SerbiaSources.CY, [idCardNote(SerbiaSources.CY)]), // Cyprus
    'CZ': entitledRolling(90, 180, SerbiaSources.CZ, [idCardNote(SerbiaSources.CZ)]), // Czech Republic
    'DE': entitledRolling(90, 180, SerbiaSources.DE, [idCardNote(SerbiaSources.DE)]), // Germany
    'DK': entitledRolling(90, 180, SerbiaSources.DK, [idCardNote(SerbiaSources.DK)]), // Denmark
    'DM': entitledRolling(90, 180, SerbiaSources.DM), // Dominica
    'EE': entitledRolling(90, 180, SerbiaSources.EE, [idCardNote(SerbiaSources.EE)]), // Estonia
    'ES': entitledRolling(90, 180, SerbiaSources.ES, [idCardNote(SerbiaSources.ES)]), // Spain
    'FI': entitledRolling(90, 180, SerbiaSources.FI, [idCardNote(SerbiaSources.FI)]), // Finland
    'FR': entitledRolling(90, 180, SerbiaSources.FR, [idCardNote(SerbiaSources.FR)]), // France
    'GB': entitledRolling(90, 180, SerbiaSources.GB), // United Kingdom
    'GD': entitledRolling(90, 180, SerbiaSources.GD), // Grenada
    'GE': entitledRolling(90, 180, SerbiaSources.GE), // Georgia
    'GR': entitledRolling(90, 180, SerbiaSources.GR, [idCardNote(SerbiaSources.GR)]), // Greece
    'HR': entitledRolling(90, 180, SerbiaSources.HR), // Croatia
    'HU': entitledRolling(90, 180, SerbiaSources.HU, [idCardNote(SerbiaSources.HU)]), // Hungary
    'IE': entitledRolling(90, 180, SerbiaSources.IE, [idCardNote(SerbiaSources.IE)]), // Ireland
    'IS': entitledRolling(90, 180, SerbiaSources.IS, [idCardNote(SerbiaSources.IS)]), // Iceland
    'IT': entitledRolling(90, 180, SerbiaSources.IT, [idCardNote(SerbiaSources.IT)]), // Italy
    'JP': entitledRolling(90, 180, SerbiaSources.JP), // Japan
    'KG': entitledRolling(90, 180, SerbiaSources.KG), // Kyrgyzstan, Republic
    'KN': entitledRolling(90, 180, SerbiaSources.KN), // Saint Kitts and Nevis
    'LC': entitledRolling(90, 180, SerbiaSources.LC), // Saint Lucia
    'LI': entitledRolling(90, 180, SerbiaSources.LI), // Liechtenstein
    'LT': entitledRolling(90, 180, SerbiaSources.LT, [idCardNote(SerbiaSources.LT)]), // Lithuania
    'LU': entitledRolling(90, 180, SerbiaSources.LU, [idCardNote(SerbiaSources.LU)]), // Luxembourg
    'LV': entitledRolling(90, 180, SerbiaSources.LV, [idCardNote(SerbiaSources.LV)]), // Latvia
    'MC': entitledRolling(90, 180, SerbiaSources.MC), // Monaco
    'MK': entitledRolling(90, 180, SerbiaSources.MK, [idCardNote(SerbiaSources.MK)]), // North Macedonia
    'MT': entitledRolling(90, 180, SerbiaSources.MT, [idCardNote(SerbiaSources.MT)]), // Malta
    'MX': entitledRolling(90, 180, SerbiaSources.MX), // Mexico
    'NL': entitledRolling(90, 180, SerbiaSources.NL, [idCardNote(SerbiaSources.NL)]), // Netherlands
    'NO': entitledRolling(90, 180, SerbiaSources.NO, [idCardNote(SerbiaSources.NO)]), // Norway
    'NZ': entitledRolling(90, 180, SerbiaSources.NZ), // New Zealand
    'PA': entitledRolling(90, 180, SerbiaSources.PA), // Panama
    'PE': entitledRolling(90, 180, SerbiaSources.PE), // Peru
    'PL': entitledRolling(90, 180, SerbiaSources.PL, [idCardNote(SerbiaSources.PL)]), // Poland
    'PT': entitledRolling(90, 180, SerbiaSources.PT, [idCardNote(SerbiaSources.PT)]), // Portugal
    'PW': entitledRolling(90, 180, SerbiaSources.PW), // Palau
    'RO': entitledRolling(90, 180, SerbiaSources.RO, [idCardNote(SerbiaSources.RO)]), // Romania
    'SC': entitledRolling(90, 180, SerbiaSources.SC), // Seychelles
    'SE': entitledRolling(90, 180, SerbiaSources.SE, [idCardNote(SerbiaSources.SE)]), // Sweden
    'SG': entitledRolling(90, 180, SerbiaSources.SG), // Singapore
    'SI': entitledRolling(90, 180, SerbiaSources.SI, [idCardNote(SerbiaSources.SI)]), // Slovenia
    'SK': entitledRolling(90, 180, SerbiaSources.SK, [idCardNote(SerbiaSources.SK)]), // Slovakia
    'SM': entitledRolling(90, 180, SerbiaSources.SM), // San Marino
    'TR': entitledRolling(90, 180, SerbiaSources.TR), // Turkiye
    'TT': entitledRolling(90, 180, SerbiaSources.TT), // Trinidad and Tobago
    'TV': entitledRolling(90, 180, SerbiaSources.TV), // Tuvalu
    'UA': entitledRolling(90, 180, SerbiaSources.UA), // Ukraine
    'US': entitledRolling(90, 180, SerbiaSources.US), // United States
    'UY': entitledRolling(90, 180, SerbiaSources.UY), // Uruguay
    'VE': entitledRolling(90, 180, SerbiaSources.VE), // Venezuela

    // ── Entitled — rolling_window(30, 365) ───────────────────────────────────
    'BB': entitledRolling(30, 365, SerbiaSources.BB), // Barbados
    'BS': entitledRolling(30, 365, SerbiaSources.BS), // Bahamas
    'CO': entitledRolling(30, 365, SerbiaSources.CO), // Colombia
    'ID': entitledRolling(30, 365, SerbiaSources.ID), // Indonesia
    'JM': entitledRolling(30, 365, SerbiaSources.JM), // Jamaica
    'PY': entitledRolling(30, 365, SerbiaSources.PY), // Paraguay
    'VC': entitledRolling(30, 365, SerbiaSources.VC), // Saint Vincent and the Grenadines

    // ── Entitled — stacked [per_visit(N), rolling_window(90,180)] ───────────
    'BY': entitledStacked(30, SerbiaSources.BY), // Belarus
    'KR': entitledStacked(90, SerbiaSources.KR), // Korea, Republic
    'KZ': entitledStacked(30, SerbiaSources.KZ), // Kazakhstan
    'ME': entitledStacked(90, SerbiaSources.ME, [{ text: 'Citizens of Montenegro may also enter using an ID card or other document proving identity and citizenship, instead of a passport.', source: SerbiaSources.ME }]), // Montenegro
    'RU': entitledStacked(30, SerbiaSources.RU), // Russia
    'SR': entitledStacked(30, SerbiaSources.SR), // Suriname
    'VA': entitledStacked(90, SerbiaSources.VA), // Holy See

    // ── Visa required — true content gaps ────────────────────────────────────
    'MH': visaRequired(SerbiaSources.MH, [{ text: 'No visa-regime information is published on Serbia\'s Ministry of Foreign Affairs site for Marshall Islands (the page returns no rows). Defaulting to visa_required as the conservative assumption.', source: SerbiaSources.MH }]), // Marshall Islands — TODO: verify, no rule published on source
    'TW': visaRequired(SerbiaSources.TW, [{ text: 'Taiwan has no dedicated page in the scraped dataset this file was generated from (unlike the other ~194 nationalities). Defaulting to visa_required as the conservative assumption. TODO: verify directly against the MFA site.' }]), // Taiwan — TODO: verify, not present in the source scrape at all

    // ── Entitled — special multi-tier / condition cases ──────────────────────
    'CN': entitledStacked(30, SerbiaSources.CN, [
      { text: 'Ordinary-passport figure. Business passport holders travelling "on business" and holders of diplomatic/official passports are visa-free with no stated day limit per the source. Hong Kong SAR (HK) and Macao SAR (MO) passports are NOT mainland Chinese passports and have their own distinct entries in this file (14 days and 90 days respectively) — see those entries, not this one.', source: SerbiaSources.CN },
    ]), // China (mainland, ordinary passports)
    'HK': entitledStacked(14, SerbiaSources.HK, [
      { text: 'Hong Kong SAR passport — distinct from mainland China (CN) and Macao SAR (MO), each with their own figures on the same source page.', source: SerbiaSources.HK },
    ]), // Hong Kong SAR
    'MO': entitledStacked(90, SerbiaSources.MO, [
      { text: 'Macao SAR passport — distinct from mainland China (CN) and Hong Kong SAR (HK), each with their own figures on the same source page.', source: SerbiaSources.MO },
    ]), // Macao SAR
    'IL': entitledRolling(90, 180, SerbiaSources.IL, [
      { text: 'Ordinary-passport figure. Holders of an Israeli "Travel Document in Lieu of National Passport" get the same 90-day allowance; holders of an Israeli "Travel Document" (a more limited document) require a visa. This file does not model travel-document sub-types.', source: SerbiaSources.IL },
    ]), // Israel
    'MD': {
      access: 'entitled',
      entitlements: [{
        limits: [{ type: 'rolling_window', days: 90, windowDays: 180 }],
        conditions: [{ type: 'biometric_passport' }],
        notes: [
          { text: 'Visa exemption applies to holders of biometric passports issued by Moldova in line with ICAO standards.', source: SerbiaSources.MD },
        ],
      }],
    }, // Moldova — biometric passports only
  },
};

/**
 * Returns the Serbia passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes.
 */
export function getSerbiaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return SERBIA.defaultRule;
  return SERBIA.passportRules[passportCode] ?? SERBIA.defaultRule;
}
