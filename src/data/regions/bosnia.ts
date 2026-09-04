/**
 * bosnia.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Bosnia and Herzegovina's visa rules by
 * passport/nationality.
 *
 * Source: Ministry of Foreign Affairs of Bosnia and Herzegovina — visa-regime
 *   pages under https://www.mvp.gov.ba/en
 * 194 dedicated per-nationality pages were scraped into a structured JSON
 * (name, url, officialName, bhTravelerRequirements, citizenExemptionStatements,
 * rawText, fetchedAt — all fetched 2026-09-04).
 *
 * ── Source-link policy — deliberately different from montenegro.ts/serbia.ts ──
 *
 * Every entry below cites only the single parent index page
 * (https://www.mvp.gov.ba/en), never the per-country subpage URL the scrape
 * captured — per explicit instruction, this site's subpage links are
 * considered likely to break, so the stable parent link is used everywhere
 * (both `directUrl` and `parentUrl` on every BosniaSources entry are the same
 * parent URL). This is a per-region policy choice; other regions still cite
 * per-country subpages where those are expected to be stable.
 *
 * ── Data provenance and known limitations ──────────────────────────────────────
 *
 * This file was generated from the full scrape (not hand-transcribed) via a
 * classifier script cross-checked entry-by-entry against the raw statement
 * text, plus explicit hand review of every multi-statement or oddly-worded
 * entry (see below). `rawText` was only consulted as a fallback for the 2
 * entries with empty `citizenExemptionStatements` (Gibraltar, Maldives).
 *
 * KNOWN GAPS AND FLAGGED ASSUMPTIONS:
 *   - Kosovo (XK) and Taiwan (TW) are NOT present in the source scrape at all
 *     (194 entries, neither name appears). Both default to visa_required:
 *     Taiwan per the same true-content-gap convention used in
 *     montenegro.ts/serbia.ts; Kosovo per explicit confirmation that Kosovo
 *     passport holders require a visa to enter or exit Bosnia and Herzegovina.
 *   - Gibraltar has empty `citizenExemptionStatements` AND empty `rawText` —
 *     a genuine content gap with nothing to fall back to. Gibraltar has no
 *     ISO Alpha-2 country code in this app's COUNTRIES list (it isn't a
 *     separately selectable nationality), so it is simply omitted rather than
 *     encoded under a placeholder code.
 *   - Maldives (MV) has empty `citizenExemptionStatements`; `rawText` (and
 *     explicit confirmation) both state Maldivian citizens require a visa to
 *     enter, exit, or transit Bosnia and Herzegovina — encoded as
 *     visa_required. (`bhTravelerRequirements` on this entry describes the
 *     reciprocal, outbound direction — what BH passport holders need to visit
 *     the Maldives — and is not the rule modelled here.)
 *   - The dominant "90 days" wording ("exempted from the visa requirement...
 *     up to 90 days, for a period of six months, starting from the day of
 *     entry") is the same ambiguous "from entry" pattern already resolved for
 *     Montenegro and Serbia: encoded as rolling_window(90, 180), never
 *     fixed_window_from_entry, for the identical abuse-vector reason (a fixed
 *     window anchored to first entry, reset by any gap ≥ windowDays, permits
 *     up to 180-of-182-consecutive-days by timing re-entry).
 *   - Several entries only ever give an exemption statement for diplomatic,
 *     official, or service passports, with no explicit statement covering
 *     ordinary passports at all — Egypt, Indonesia, Israel, Kazakhstan,
 *     Morocco, Thailand. Ordinary passport holders default to visa_required
 *     in these cases (the diplomatic/official carve-out is not modelled, per
 *     the same convention already used elsewhere: this app does not validate
 *     document type).
 *   - Bahrain, Oman, and Saudi Arabia each have a genuine time-bounded waiver
 *     with BOTH a stated start and end date (1 June – 30 September 2026) —
 *     encoded via StayEntitlement.temporalWindows (see @/types and
 *     montenegro.ts's header for the general design). Unlike Montenegro's
 *     temporal entries, these have real, source-confirmed validFrom dates,
 *     not placeholders. The source does not state a day-cap for the waiver
 *     itself, so the standard 90-day allowance (universal elsewhere on this
 *     site) is assumed as the most reasonable default — flagged in each
 *     entry's note as an assumption, not a stated fact.
 *   - Russia: the only visa-free allowance stated is transit-only, up to 3
 *     days, not general entry — encoded as visa_required (general
 *     entry/tourism, which is this app's scope) with a note explaining the
 *     narrower transit exemption.
 *   - Ukraine: "up to 30 days... within two months from the date of the first
 *     entry" — a distinct, smaller window than the standard shape. Encoded as
 *     rolling_window(30, 60) (2 months ≈ 60 days), same "from first entry"
 *     safe-default reasoning as above.
 *   - Brazil's source entry concatenates the reciprocal (BH→Brazil) statement
 *     and the actual Bosnia-inbound statement into a single string with no
 *     separator — extracted by hand; the inbound clause is the standard
 *     90-in-180 shape.
 *   - Barbados's source statement literally reads "Citizens of the Bahrein
 *     [sic] are exempted..." on the page filed under Barbados's name/URL/slug
 *     — an apparent mix-up on the source's own site. Treated as Barbados's
 *     rule (matching the row's identity, not the misprinted country name in
 *     the body text), same precedent as montenegro.ts's mistitled Comoros
 *     page.
 *   - Dominica's source statement has a typo ("up to90) days" — missing a
 *     space/parenthesis) but is otherwise the unambiguous standard shape.
 *   - Palestine (PS) is included per the same precedent as
 *     montenegro.ts/serbia.ts, even though it isn't a selectable nationality
 *     in NationalitySelector's COUNTRIES list.
 *   - National ID-card and other document-type nuances are not modelled, per
 *     the same explicit decision used throughout this codebase.
 *
 * Last verified: 2026-09-04
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  SourceDoc,
} from '@/types';
import { BosniaSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

/**
 * 90 days in any 180-day rolling window — the same shape as Schengen,
 * Türkiye, Montenegro, and Serbia's standard allowance. See file header for
 * why the source's ambiguous "from entry" wording is resolved to
 * rolling_window, never fixed_window_from_entry.
 */
const BOSNIA_LIMIT: import('@/types').RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

// ─── Entitlement helpers ────────────────────────────────────────────────────────

/**
 * Standard Bosnia entitled rule — 90 days, rolling_window(90,180), no
 * pre-travel authorisation referenced anywhere in the source data.
 *
 * Every call cites BosniaSources.<CODE> via `source` — surfaced by the UI as
 * a link on the stay-rule summary, never restated as a "here's the source"
 * note (see montenegro.ts's entitled() helper for the full rationale).
 */
function entitledRolling(source: SourceDoc, extraNotes: RuleNote[] = []): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [BOSNIA_LIMIT],
      source,
      ...(extraNotes.length > 0 && { notes: extraNotes }),
    }],
  };
}

/** Standard Bosnia visa_required rule, citing BosniaSources.<CODE>. */
function visaRequired(source: SourceDoc, extraNotes: RuleNote[] = []): VisaRequiredRule {
  return {
    access: 'visa_required',
    source,
    ...(extraNotes.length > 0 && { notes: extraNotes }),
  };
}

// ─── Region definition ────────────────────────────────────────────────────────

export const BOSNIA: RegionDefinition = {
  code: 'bosnia',
  name: 'Bosnia and Herzegovina',
  memberStates: ['BA'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-04',
  sourceUrl: 'https://www.mvp.gov.ba/en',
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── Entitled — 90 days in any 180-day rolling window (standard case) ─────────
    'AD': entitledRolling(BosniaSources.AD), // Andorra
    'AE': entitledRolling(BosniaSources.AE), // United Arab Emirates
    'AG': entitledRolling(BosniaSources.AG), // Antigua and Barbuda
    'AL': entitledRolling(BosniaSources.AL), // Albania
    'AR': entitledRolling(BosniaSources.AR), // Argentina
    'AT': entitledRolling(BosniaSources.AT), // Austria
    'AU': entitledRolling(BosniaSources.AU), // Australia
    'AZ': entitledRolling(BosniaSources.AZ), // Azerbaijan
    'BE': entitledRolling(BosniaSources.BE), // Belgium
    'BG': entitledRolling(BosniaSources.BG), // Bulgaria
    'BN': entitledRolling(BosniaSources.BN), // Brunei
    'CA': entitledRolling(BosniaSources.CA), // Canada
    'CH': entitledRolling(BosniaSources.CH), // Switzerland
    'CL': entitledRolling(BosniaSources.CL), // Chile
    'CN': entitledRolling(BosniaSources.CN), // China
    'CO': entitledRolling(BosniaSources.CO), // Colombia
    'CR': entitledRolling(BosniaSources.CR), // Costa Rica
    'CY': entitledRolling(BosniaSources.CY), // Cyprus
    'CZ': entitledRolling(BosniaSources.CZ), // Czech Republic
    'DE': entitledRolling(BosniaSources.DE), // Germany
    'DK': entitledRolling(BosniaSources.DK), // Denmark
    'EE': entitledRolling(BosniaSources.EE), // Estonia
    'ES': entitledRolling(BosniaSources.ES), // Spain
    'FI': entitledRolling(BosniaSources.FI), // Finland
    'FM': entitledRolling(BosniaSources.FM), // Micronesia
    'FR': entitledRolling(BosniaSources.FR), // France
    'GB': entitledRolling(BosniaSources.GB), // United Kingdom
    'GD': entitledRolling(BosniaSources.GD), // Grenada
    'GE': entitledRolling(BosniaSources.GE), // Georgia
    'GR': entitledRolling(BosniaSources.GR), // Greece
    'GT': entitledRolling(BosniaSources.GT), // Guatemala
    'HN': entitledRolling(BosniaSources.HN), // Honduras
    'HR': entitledRolling(BosniaSources.HR), // Croatia
    'HU': entitledRolling(BosniaSources.HU), // Hungary
    'IS': entitledRolling(BosniaSources.IS), // Iceland
    'IT': entitledRolling(BosniaSources.IT), // Italy
    'JP': entitledRolling(BosniaSources.JP), // Japan
    'KI': entitledRolling(BosniaSources.KI), // Kiribati
    'KN': entitledRolling(BosniaSources.KN), // Saint Kitts and Nevis
    'KR': entitledRolling(BosniaSources.KR), // Korea (South)
    'KW': entitledRolling(BosniaSources.KW), // Kuwait
    'LC': entitledRolling(BosniaSources.LC), // Saint Lucia
    'LI': entitledRolling(BosniaSources.LI), // Liechtenstein
    'LT': entitledRolling(BosniaSources.LT), // Lithuania
    'LU': entitledRolling(BosniaSources.LU), // Luxembourg
    'LV': entitledRolling(BosniaSources.LV), // Latvia
    'MC': entitledRolling(BosniaSources.MC), // Monaco
    'MD': entitledRolling(BosniaSources.MD), // Moldova
    'ME': entitledRolling(BosniaSources.ME), // Montenegro
    'MH': entitledRolling(BosniaSources.MH), // Marshall Islands
    'MK': entitledRolling(BosniaSources.MK), // North Macedonia
    'MT': entitledRolling(BosniaSources.MT), // Malta
    'MU': entitledRolling(BosniaSources.MU), // Mauritius
    'MX': entitledRolling(BosniaSources.MX), // Mexico
    'MY': entitledRolling(BosniaSources.MY), // Malaysia
    'NI': entitledRolling(BosniaSources.NI), // Nicaragua
    'NL': entitledRolling(BosniaSources.NL), // Netherlands
    'NO': entitledRolling(BosniaSources.NO), // Norway
    'NZ': entitledRolling(BosniaSources.NZ), // New Zealand
    'PA': entitledRolling(BosniaSources.PA), // Panama
    'PE': entitledRolling(BosniaSources.PE), // Peru
    'PL': entitledRolling(BosniaSources.PL), // Poland
    'PT': entitledRolling(BosniaSources.PT), // Portugal
    'PW': entitledRolling(BosniaSources.PW), // Palau
    'PY': entitledRolling(BosniaSources.PY), // Paraguay
    'QA': entitledRolling(BosniaSources.QA), // Qatar
    'RO': entitledRolling(BosniaSources.RO), // Romania
    'RS': entitledRolling(BosniaSources.RS), // Serbia
    'SB': entitledRolling(BosniaSources.SB), // Solomon Islands
    'SC': entitledRolling(BosniaSources.SC), // Seychelles
    'SE': entitledRolling(BosniaSources.SE), // Sweden
    'SG': entitledRolling(BosniaSources.SG), // Singapore
    'SI': entitledRolling(BosniaSources.SI), // Slovenia
    'SK': entitledRolling(BosniaSources.SK), // Slovakia
    'SM': entitledRolling(BosniaSources.SM), // San Marino
    'SV': entitledRolling(BosniaSources.SV), // El Salvador
    'TL': entitledRolling(BosniaSources.TL), // Timor-Leste
    'TO': entitledRolling(BosniaSources.TO), // Tonga
    'TR': entitledRolling(BosniaSources.TR), // Turkiye
    'TT': entitledRolling(BosniaSources.TT), // Trinidad and Tobago
    'TV': entitledRolling(BosniaSources.TV), // Tuvalu
    'US': entitledRolling(BosniaSources.US), // United States
    'UY': entitledRolling(BosniaSources.UY), // Uruguay
    'VA': entitledRolling(BosniaSources.VA), // Holy See (Vatican)
    'VC': entitledRolling(BosniaSources.VC), // Saint Vincent and the Grenadines
    'VE': entitledRolling(BosniaSources.VE), // Venezuela
    'VU': entitledRolling(BosniaSources.VU), // Vanuatu
    'WS': entitledRolling(BosniaSources.WS), // Samoa

    // ── Entitled — standard shape, source text has a notable quirk ────────────────
    'BB': entitledRolling(BosniaSources.BB, [{ text: 'Source text names "Bahrein" rather than Barbados in the rule statement on this page — an apparent mix-up on the source\'s own site. Treated as Barbados\'s rule, matching this page\'s name/URL/slug, not the misprinted country name in the body text.', source: BosniaSources.BB }]), // Barbados
    'BR': entitledRolling(BosniaSources.BR, [{ text: 'Source concatenates the reciprocal BH-to-Brazil statement and the actual Bosnia-inbound statement into a single run-on paragraph with no separator. The inbound clause ("...exempted from the obligation to obtain a visa for entry, exit, transit and stay...for a period not exceeding 90 days, provided that the total length of stay does not exceed 180 days per year, from the first entry") was extracted by hand; it is the standard 90-in-180 shape.', source: BosniaSources.BR }]), // Brazil
    'DM': entitledRolling(BosniaSources.DM), // Dominica — source has a typo ("up to90) days"), otherwise the unambiguous standard shape
    'IE': entitledRolling(BosniaSources.IE), // Ireland

    // ── Visa required ────────────────────────────────────────────
    'AF': visaRequired(BosniaSources.AF), // Afghanistan
    'AM': visaRequired(BosniaSources.AM), // Armenia
    'AO': visaRequired(BosniaSources.AO), // Angola
    'BD': visaRequired(BosniaSources.BD), // Bangladesh
    'BF': visaRequired(BosniaSources.BF), // Burkina Faso
    'BI': visaRequired(BosniaSources.BI), // Burundi
    'BJ': visaRequired(BosniaSources.BJ), // Benin
    'BO': visaRequired(BosniaSources.BO), // Bolivia
    'BS': visaRequired(BosniaSources.BS), // Bahamas
    'BT': visaRequired(BosniaSources.BT), // Bhutan
    'BW': visaRequired(BosniaSources.BW), // Botswana
    'BY': visaRequired(BosniaSources.BY), // Belarus
    'BZ': visaRequired(BosniaSources.BZ), // Belize
    'CD': visaRequired(BosniaSources.CD), // Congo (Democratic Republic)
    'CF': visaRequired(BosniaSources.CF), // Central African Republic
    'CG': visaRequired(BosniaSources.CG), // Congo
    'CI': visaRequired(BosniaSources.CI), // Cote d'Ivoire
    'CM': visaRequired(BosniaSources.CM), // Cameroon
    'CU': visaRequired(BosniaSources.CU), // Cuba
    'CV': visaRequired(BosniaSources.CV), // Cabo Verde
    'DJ': visaRequired(BosniaSources.DJ), // Djibouti
    'DO': visaRequired(BosniaSources.DO), // Dominican Republic
    'DZ': visaRequired(BosniaSources.DZ), // Algeria
    'EC': visaRequired(BosniaSources.EC), // Ecuador
    'ER': visaRequired(BosniaSources.ER), // Eritrea
    'ET': visaRequired(BosniaSources.ET), // Ethiopia
    'FJ': visaRequired(BosniaSources.FJ), // Fiji
    'GA': visaRequired(BosniaSources.GA), // Gabon
    'GH': visaRequired(BosniaSources.GH), // Ghana
    'GM': visaRequired(BosniaSources.GM), // Gambia
    'GN': visaRequired(BosniaSources.GN), // Guinea
    'GQ': visaRequired(BosniaSources.GQ), // Equatorial Guinea
    'GW': visaRequired(BosniaSources.GW), // Guinea-Bissau
    'GY': visaRequired(BosniaSources.GY), // Guyana
    'HT': visaRequired(BosniaSources.HT), // Haiti
    'IN': visaRequired(BosniaSources.IN), // India
    'IQ': visaRequired(BosniaSources.IQ), // Iraq
    'IR': visaRequired(BosniaSources.IR), // Iran
    'JM': visaRequired(BosniaSources.JM), // Jamaica
    'JO': visaRequired(BosniaSources.JO), // Jordan
    'KE': visaRequired(BosniaSources.KE), // Kenya
    'KG': visaRequired(BosniaSources.KG), // Kyrgyzstan
    'KH': visaRequired(BosniaSources.KH), // Cambodia
    'KM': visaRequired(BosniaSources.KM), // Comoros
    'KP': visaRequired(BosniaSources.KP), // Korea (North)
    'LA': visaRequired(BosniaSources.LA), // Laos
    'LB': visaRequired(BosniaSources.LB), // Lebanon
    'LK': visaRequired(BosniaSources.LK), // Sri Lanka
    'LR': visaRequired(BosniaSources.LR), // Liberia
    'LS': visaRequired(BosniaSources.LS), // Lesotho
    'LY': visaRequired(BosniaSources.LY), // Libya
    'MG': visaRequired(BosniaSources.MG), // Madagascar
    'ML': visaRequired(BosniaSources.ML), // Mali
    'MM': visaRequired(BosniaSources.MM), // Myanmar
    'MN': visaRequired(BosniaSources.MN), // Mongolia
    'MR': visaRequired(BosniaSources.MR), // Mauritania
    'MW': visaRequired(BosniaSources.MW), // Malawi
    'MZ': visaRequired(BosniaSources.MZ), // Mozambique
    'NA': visaRequired(BosniaSources.NA), // Namibia
    'NE': visaRequired(BosniaSources.NE), // Niger
    'NG': visaRequired(BosniaSources.NG), // Nigeria
    'NP': visaRequired(BosniaSources.NP), // Nepal
    'NR': visaRequired(BosniaSources.NR), // Nauru
    'PG': visaRequired(BosniaSources.PG), // Papua New Guinea
    'PH': visaRequired(BosniaSources.PH), // Philippines
    'PK': visaRequired(BosniaSources.PK), // Pakistan
    'RW': visaRequired(BosniaSources.RW), // Rwanda
    'SD': visaRequired(BosniaSources.SD), // Sudan
    'SL': visaRequired(BosniaSources.SL), // Sierra Leone
    'SN': visaRequired(BosniaSources.SN), // Senegal
    'SO': visaRequired(BosniaSources.SO), // Somalia
    'SR': visaRequired(BosniaSources.SR), // Suriname
    'ST': visaRequired(BosniaSources.ST), // Sao Tome and Principe
    'SY': visaRequired(BosniaSources.SY), // Syria
    'SZ': visaRequired(BosniaSources.SZ), // Eswatini
    'TD': visaRequired(BosniaSources.TD), // Chad
    'TG': visaRequired(BosniaSources.TG), // Togo
    'TJ': visaRequired(BosniaSources.TJ), // Tajikistan
    'TM': visaRequired(BosniaSources.TM), // Turkmenistan
    'TN': visaRequired(BosniaSources.TN), // Tunisia
    'TZ': visaRequired(BosniaSources.TZ), // Tanzania
    'UG': visaRequired(BosniaSources.UG), // Uganda
    'UZ': visaRequired(BosniaSources.UZ), // Uzbekistan
    'VN': visaRequired(BosniaSources.VN), // Vietnam
    'YE': visaRequired(BosniaSources.YE), // Yemen
    'ZA': visaRequired(BosniaSources.ZA), // South Africa
    'ZM': visaRequired(BosniaSources.ZM), // Zambia
    'ZW': visaRequired(BosniaSources.ZW), // Zimbabwe

    // ── Visa required — source's only exemption statement covers diplomatic/ ──────
    // official/service passports, never ordinary ones. Ordinary passport holders
    // default to visa_required (document-type nuance not modelled elsewhere either).
    'EG': visaRequired(BosniaSources.EG, [{ text: 'Source states nationals of Egypt require visas; a separate exemption is stated only for diplomatic, official, and special passports, not ordinary ones.', source: BosniaSources.EG }]), // Egypt
    'ID': visaRequired(BosniaSources.ID, [{ text: 'Source states nationals of Indonesia require visas; a separate exemption is stated only for diplomatic and official passports, not ordinary ones.', source: BosniaSources.ID }]), // Indonesia
    'IL': visaRequired(BosniaSources.IL, [{ text: 'Source\'s only exemption statement for Israel covers diplomatic and official passports; no statement covers ordinary passports, which default to visa_required.', source: BosniaSources.IL }]), // Israel
    'KZ': visaRequired(BosniaSources.KZ, [{ text: 'Source states nationals of Kazakhstan require visas; a separate exemption is stated only for diplomatic and official passports, not ordinary ones.', source: BosniaSources.KZ }]), // Kazakhstan
    'MA': visaRequired(BosniaSources.MA, [{ text: 'Source states visas are required for regular passports; diplomatic, service, and special passports are exempt (not modelled — this app does not validate document type).', source: BosniaSources.MA }]), // Morocco
    'TH': visaRequired(BosniaSources.TH, [{ text: 'Source states nationals of Thailand require visas; a separate exemption is stated only for diplomatic and official passports, not ordinary ones.', source: BosniaSources.TH }]), // Thailand

    // ── Visa required — narrower exemption than general entry ─────────────────────
    'RU': visaRequired(BosniaSources.RU, [{ text: 'Source states only a transit-only exemption (up to 3 days, on the basis of a valid travel document) — not a general entry or tourism waiver, which remains visa_required.', source: BosniaSources.RU }]), // Russia

    // ── Visa required — Maldives (empty citizenExemptionStatements, rawText fallback) ──
    'MV': visaRequired(BosniaSources.MV, [{ text: 'citizenExemptionStatements was empty for this entry; rawText states "Citizens of the Republic of Maldives are required visas when entering, exiting..." — confirmed by explicit instruction. (bhTravelerRequirements on this page describes the reciprocal outbound direction — what BH passport holders need to visit the Maldives — not the rule modelled here.)', source: BosniaSources.MV }]), // Maldives

    // ── Visa required — Palestine (not in COUNTRIES, included per precedent) ──────
    'PS': visaRequired(BosniaSources.PS), // Palestine

    // ── Visa required — true content gaps: absent from the source scrape entirely ──
    'TW': visaRequired(BosniaSources.TW, [{ text: 'Taiwan has no dedicated page in the scraped dataset this file was generated from (unlike the other 194 nationalities). Defaulting to visa_required as the conservative assumption.' }]), // Taiwan — not present in the source scrape at all
    'XK': visaRequired(BosniaSources.XK, [{ text: 'Kosovo has no dedicated page in the scraped dataset this file was generated from. Per explicit confirmation, Kosovo passport holders require a visa to enter or exit Bosnia and Herzegovina.' }]), // Kosovo — not present in the source scrape at all

    // ── Entitled — time-bounded seasonal waivers (temporalWindows, real dates) ────
    // Bahrain, Oman, and Saudi Arabia each have a genuine source-confirmed
    // validFrom AND validUntil (unlike Montenegro's temporal entries, which never
    // had a stated start date). Base access outside the window is visa_required;
    // the source does not state a day-cap for the waiver itself, so the standard
    // 90-day allowance is assumed (flagged below) since no other figure appears
    // anywhere on the site.
    'BH': {
      access: 'entitled',
      entitlements: [{
        temporalWindows: [{
          validFrom: '2026-06-01',
          validUntil: '2026-09-30',
          description: 'Temporary waiver (ordinary passports)',
          source: BosniaSources.BH,
        }],
        limits: [{ type: 'per_visit', value: 90, unit: 'days' }],
        source: BosniaSources.BH,
        notes: [{ text: 'Source states nationals of Bahrain generally require a visa; ordinary-passport holders are exempt only for the stated window. The source does not state a day-cap for the waiver itself — 90 days is assumed, matching the standard allowance used everywhere else on this site. Outside the window, the general visa requirement applies.', source: BosniaSources.BH }],
      }],
    }, // Bahrain
    'OM': {
      access: 'entitled',
      entitlements: [{
        temporalWindows: [{
          validFrom: '2026-06-01',
          validUntil: '2026-09-30',
          description: 'Temporary waiver (ordinary passports)',
          source: BosniaSources.OM,
        }],
        limits: [{ type: 'per_visit', value: 90, unit: 'days' }],
        source: BosniaSources.OM,
        notes: [{ text: 'Source states nationals of Oman generally require a visa; ordinary-passport holders are exempt only for the stated window. The source does not state a day-cap for the waiver itself — 90 days is assumed, matching the standard allowance used everywhere else on this site. Outside the window, the general visa requirement applies.', source: BosniaSources.OM }],
      }],
    }, // Oman
    'SA': {
      access: 'entitled',
      entitlements: [{
        temporalWindows: [{
          validFrom: '2026-06-01',
          validUntil: '2026-09-30',
          description: 'Temporary waiver (ordinary passports)',
          source: BosniaSources.SA,
        }],
        limits: [{ type: 'per_visit', value: 90, unit: 'days' }],
        source: BosniaSources.SA,
        notes: [{ text: 'Source states nationals of Saudi Arabia generally require a visa; ordinary-passport holders are exempt only for the stated window. The source does not state a day-cap for the waiver itself — 90 days is assumed, matching the standard allowance used everywhere else on this site. Outside the window, the general visa requirement applies.', source: BosniaSources.SA }],
      }],
    }, // Saudi Arabia

    // ── Entitled — distinct shape: 30 days within 2 months from first entry ───────
    'UA': {
      access: 'entitled',
      entitlements: [{
        limits: [{ type: 'rolling_window', days: 30, windowDays: 60 }],
        source: BosniaSources.UA,
        notes: [{ text: 'Source states "up to 30 days...within two months from the date of the first entry" — a distinct, smaller allowance than the standard 90-in-180 shape used elsewhere. Encoded as a 30-day rolling window within a 60-day (2-month) period, same safe-default reasoning as the standard shape\'s "from first entry" wording.', source: BosniaSources.UA }],
      }],
    }, // Ukraine

  },
};

/**
 * Returns the Bosnia and Herzegovina passport rule for a given ISO Alpha-2
 * passport code. Returns the default rule (visa_required) for unknown or
 * null codes.
 */
export function getBosniaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return BOSNIA.defaultRule;
  return BOSNIA.passportRules[passportCode] ?? BOSNIA.defaultRule;
}
