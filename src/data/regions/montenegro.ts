/**
 * montenegro.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Montenegro's visa rules by passport/nationality.
 *
 * Source: Government of Montenegro, Ministry of Foreign Affairs —
 *   "Embassies and consulates of Montenegro and visa regimes for foreign citizens"
 *   https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro
 * 196 dedicated per-nationality pages under this index. All source URLs live in
 * @/data/sources — MontenegroSources (one entry per ISO code).
 *
 * ── Data provenance and known limitations ──────────────────────────────────────
 *
 * This file was generated from a full scrape + structural extraction of all 196
 * pages (not hand-transcribed), cross-validated against a second independent
 * extraction pass, then classified into rule shapes. Two live pages were
 * directly fetched to confirm the URL pattern and content accuracy (the index
 * page and Canada's page); the remaining 194 directUrls follow the confirmed
 * pattern but were not each individually re-fetched — Tier 2, not Tier 1,
 * confidence for those.
 *
 * KNOWN GAPS AND FLAGGED ASSUMPTIONS (see individual entry comments for detail):
 *   - The core "up to 90 days" rule is encoded as rolling_window(90, 180) — the
 *     source text never states the window mechanic explicitly (it just says
 *     "up to 90 days"), and an earlier version of this file took the "within
 *     180 days from first entry" phrasing at face value as a genuine
 *     reset-on-entry (fixed_window_from_entry) mechanic. That was reverted: a
 *     fixed window anchored to first entry, reset by any gap of windowDays or
 *     more, permits a traveler to stay up to 180 of 182 consecutive days by
 *     timing re-entry just before the anchor rolls — an edge case the source
 *     text does not remotely intend and Montenegro has no statutory language
 *     confirming. Absent that confirmation, rolling_window is the safe default,
 *     consistent with how turkiye.ts already treats the same "from first entry"
 *     wording (see entitled90FromEntryPhrasing() there — Law No. 6458 Art.
 *     11(1) caps every Turkish exemption at 90-in-180 regardless of wording).
 *     fixed_window_from_entry remains supported by the type system and
 *     calculator for a future region where a primary source (treaty text or
 *     consular confirmation) explicitly confirms genuine reset behavior; none
 *     are currently classified as such, Montenegro included.
 *   - 4 countries (DZ, CV, MZ, PK) have NO visa-regime section published on the
 *     source at all — a genuine content gap, defaulted to visa_required.
 *   - 3 countries (AM, EG, UZ) have a seasonal waiver on the source that had
 *     already lapsed (ended Oct 2025) as of the date this file was generated —
 *     deliberately NOT encoded as active. TODO: re-check for a renewed window.
 *   - 6 countries (BY, RU, SA, TR, CN, KZ) have date-bounded waivers using the
 *     DateRangeCondition (see @/types). For 5 of them the source states only an
 *     end date, never a start date — validFrom is a placeholder (see notes on
 *     each entry). These are evaluated against the trip's entry date by
 *     selectEntitlement() in stayCalculator.ts — outside the window, the rule
 *     falls back to visa_required (surfaced to the UI as a temporalException).
 *   - Liberia (LR)'s source page is published only in Montenegrin, not English.
 *   - Holy See entry (VA) covers only the Holy See; the source bundles it with
 *     the "Sovereign Military Order of Malta" in the page title, but the page's
 *     actual visa text never mentions SMOM. SMOM has no standard ISO code and
 *     is not separately encoded.
 *   - Comoros entry (KM) is sourced from a page mistitled "Union of the Comoros
 *     and Swaziland in Eswatini" — the page's actual visa text is only ever
 *     about Comoros. Eswatini (SZ) has its own, correctly titled, separate page.
 *   - National ID-card (~39 countries) and organized-tour-group (CN) conditions
 *     are encoded as StayEntitlement.notes, not formal EntitlementConditions,
 *     per an explicit decision — the app does not need to validate document
 *     type or tour-package specifics.
 *
 * Last verified: 2026-08-30
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  RuleNote,
  SourceDoc,
} from '@/types';
import { MontenegroSources } from '@/data/sources';

// ─── Region-level stay limit ──────────────────────────────────────────────────

/**
 * 90 days in any 180-day rolling window — the same shape as Schengen and
 * Türkiye's standard allowance. See file header: the source's "up to 90
 * days" wording doesn't itself state a mechanic, and a fixed,
 * reset-on-entry window was deliberately rejected as unsafe (it would let a
 * traveler stay up to 180 of 182 consecutive days by timing re-entry against
 * the anchor). Rolling window is the conservative default.
 */
const MONTENEGRO_LIMIT: import('@/types').RollingWindowLimit = {
  type: 'rolling_window',
  days: 90,
  windowDays: 180,
};

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required' };

// ─── Entitlement helper ────────────────────────────────────────────────────────

/**
 * Standard Montenegro entitled rule — 90 days, rolling_window(90,180), no
 * pre-travel authorisation (Montenegro has no ETA/e-Visa scheme referenced
 * anywhere in the source data).
 *
 * Every call cites its own country's source page, even when there is nothing
 * else to say — every PassportRule in this file should be traceable back to
 * its specific gov.me page, not just the region-level parentUrl.
 *
 * Note placement convention (matches schengen.ts): entitlementNotes go on
 * StayEntitlement.notes (context for this specific entitlement — e.g. the
 * ID-card exception). This file does not currently use EntitledRule.notes
 * (rule-level notes) since no Montenegro entry has multiple OR'd entitlements
 * with a meaningful implicit-fallback distinction to explain — China is the
 * one exception and is written out by hand rather than via this helper.
 *
 * @param source        This country's MontenegroSources entry.
 * @param extraNotes    Additional notes appended after the base citation
 *                       (e.g. the ID-card alternate-entry note).
 */
function entitled(source: SourceDoc, extraNotes: RuleNote[] = []): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [MONTENEGRO_LIMIT],
      notes: [
        { text: 'Source: Montenegro Ministry of Foreign Affairs, diplomatic-missions page for this country.', source },
        ...extraNotes,
      ],
    }],
  };
}

// ─── Region definition ────────────────────────────────────────────────────────

export const MONTENEGRO: RegionDefinition = {
  code: 'montenegro',
  name: 'Montenegro',
  memberStates: ['ME'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-08-30',
  sourceUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── Entitled — 90 days in any 180-day rolling window ──────────────────────
    // Standard case: passport-based entry only.
    'AG': entitled(MontenegroSources.AG), // Antigua and Barbuda
    'AR': entitled(MontenegroSources.AR), // Argentina
    'AW': entitled(MontenegroSources.AW), // Aruba
    'BS': entitled(MontenegroSources.BS), // Bahamas
    'BB': entitled(MontenegroSources.BB), // Barbados
    'BR': entitled(MontenegroSources.BR), // Brazil
    'BN': entitled(MontenegroSources.BN), // Brunei
    'CA': entitled(MontenegroSources.CA), // Canada
    'KY': entitled(MontenegroSources.KY), // Cayman Islands
    'CL': entitled(MontenegroSources.CL), // Chile
    'CO': entitled(MontenegroSources.CO), // Colombia
    'CR': entitled(MontenegroSources.CR), // Costa Rica
    'DM': entitled(MontenegroSources.DM), // Dominica
    'SV': entitled(MontenegroSources.SV), // El Salvador
    'GE': entitled(MontenegroSources.GE), // Georgia
    'GD': entitled(MontenegroSources.GD), // Grenada
    'GT': entitled(MontenegroSources.GT), // Guatemala
    'HN': entitled(MontenegroSources.HN), // Honduras
    'IL': entitled(MontenegroSources.IL), // Israel
    'JP': entitled(MontenegroSources.JP), // Japan
    'KI': entitled(MontenegroSources.KI), // Kiribati
    'KR': entitled(MontenegroSources.KR), // Korea, Republic of (South Korea)
    'MY': entitled(MontenegroSources.MY), // Malaysia
    'MH': entitled(MontenegroSources.MH), // Marshall Islands
    'MU': entitled(MontenegroSources.MU), // Mauritius
    'MX': entitled(MontenegroSources.MX), // Mexico
    'FM': entitled(MontenegroSources.FM), // Micronesia
    'MD': entitled(MontenegroSources.MD), // Moldova
    'NR': entitled(MontenegroSources.NR), // Nauru
    'NZ': entitled(MontenegroSources.NZ), // New Zealand
    'NI': entitled(MontenegroSources.NI), // Nicaragua
    'PW': entitled(MontenegroSources.PW), // Palau
    'PA': entitled(MontenegroSources.PA), // Panama
    'PY': entitled(MontenegroSources.PY), // Paraguay
    'PL': entitled(MontenegroSources.PL), // Poland
    'KN': entitled(MontenegroSources.KN), // Saint Kitts and Nevis
    'LC': entitled(MontenegroSources.LC), // Saint Lucia
    'VC': entitled(MontenegroSources.VC), // Saint Vincent and the Grenadines
    'WS': entitled(MontenegroSources.WS), // Samoa
    'SC': entitled(MontenegroSources.SC), // Seychelles
    'SG': entitled(MontenegroSources.SG), // Singapore
    'SB': entitled(MontenegroSources.SB), // Solomon Islands
    'TL': entitled(MontenegroSources.TL), // Timor-Leste
    'TO': entitled(MontenegroSources.TO), // Tonga
    'TT': entitled(MontenegroSources.TT), // Trinidad and Tobago
    'TV': entitled(MontenegroSources.TV), // Tuvalu
    'UA': entitled(MontenegroSources.UA), // Ukraine
    'AE': entitled(MontenegroSources.AE), // United Arab Emirates
    'GB': entitled(MontenegroSources.GB), // United Kingdom of Great Britain and Northern Ireland
    'US': entitled(MontenegroSources.US), // United States of America
    'UY': entitled(MontenegroSources.UY), // Uruguay
    'VE': entitled(MontenegroSources.VE), // Venezuela

    // ── Entitled — as above, PLUS a secondary 30-day national-ID-card entitlement ─
    // (EU/EEA-area nationals only). Encoded as a note per Eric's decision, not a
    // formal EntitlementCondition — the app does not need to validate ID-card use.
    'AL': entitled(MontenegroSources.AL, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.AL }]), // Albania
    'AD': entitled(MontenegroSources.AD, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.AD }]), // Andorra
    'AT': entitled(MontenegroSources.AT, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.AT }]), // Austria
    'BE': entitled(MontenegroSources.BE, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.BE }]), // Belgium
    'BA': entitled(MontenegroSources.BA, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.BA }]), // Bosnia and Herzegovina
    'BG': entitled(MontenegroSources.BG, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.BG }]), // Bulgaria
    'HR': entitled(MontenegroSources.HR, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.HR }]), // Croatia
    'CY': entitled(MontenegroSources.CY, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.CY }]), // Cyprus
    'CZ': entitled(MontenegroSources.CZ, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.CZ }]), // Czech Republic
    'DK': entitled(MontenegroSources.DK, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.DK }]), // Denmark
    'EE': entitled(MontenegroSources.EE, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.EE }]), // Estonia
    'FI': entitled(MontenegroSources.FI, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.FI }]), // Finland
    'FR': entitled(MontenegroSources.FR, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.FR }]), // France
    'DE': entitled(MontenegroSources.DE, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.DE }]), // Germany
    'GR': entitled(MontenegroSources.GR, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.GR }]), // Greece
    'VA': entitled(MontenegroSources.VA, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.VA }]), // Holy See and Sovereign Military Order of Malta
    'HU': entitled(MontenegroSources.HU, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.HU }]), // Hungary
    'IS': entitled(MontenegroSources.IS, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.IS }]), // Iceland
    'IE': entitled(MontenegroSources.IE, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.IE }]), // Ireland
    'IT': entitled(MontenegroSources.IT, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.IT }]), // Italy
    'XK': entitled(MontenegroSources.XK, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.XK }]), // Kosovo
    'LV': entitled(MontenegroSources.LV, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.LV }]), // Latvia
    'LI': entitled(MontenegroSources.LI, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.LI }]), // Liechtenstein
    'LT': entitled(MontenegroSources.LT, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.LT }]), // Lithuania
    'LU': entitled(MontenegroSources.LU, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.LU }]), // Luxembourg
    'MT': entitled(MontenegroSources.MT, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.MT }]), // Malta
    'MC': entitled(MontenegroSources.MC, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.MC }]), // Monaco
    'NL': entitled(MontenegroSources.NL, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.NL }]), // Netherlands
    'MK': entitled(MontenegroSources.MK, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.MK }]), // North Macedonia
    'NO': entitled(MontenegroSources.NO, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.NO }]), // Norway
    'PT': entitled(MontenegroSources.PT, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.PT }]), // Portugal
    'RO': entitled(MontenegroSources.RO, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.RO }]), // Romania
    'SM': entitled(MontenegroSources.SM, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.SM }]), // San Marino
    'RS': entitled(MontenegroSources.RS, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.RS }]), // Serbia
    'SK': entitled(MontenegroSources.SK, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.SK }]), // Slovakia
    'SI': entitled(MontenegroSources.SI, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.SI }]), // Slovenia
    'ES': entitled(MontenegroSources.ES, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.ES }]), // Spain
    'SE': entitled(MontenegroSources.SE, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.SE }]), // Sweden
    'CH': entitled(MontenegroSources.CH, [{ text: 'Nationals may also enter for up to 30 days using a valid national ID card instead of a passport (in lieu of the standard 90-day passport-based entry).', source: MontenegroSources.CH }]), // Switzerland

    // ── Entitled — distinct bilateral-agreement basis (30 days, not the standard 90) ─
    'PE': {
      access: 'entitled',
      entitlements: [{
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
        notes: [{ text: 'Entry is based on a bilateral international agreement on mutual travel, not the standard visa-waiver basis — 30 days (not 90), with a valid travel document.', source: MontenegroSources.PE }],
      }],
    }, // Peru — distinct bilateral-agreement basis, not the standard 90-day rule

    // ── Entitled — time-bounded seasonal/temporary waivers (date_range condition) ──
    'BY': {
      access: 'entitled',
      entitlements: [{
        conditions: [{
          type: 'date_range',
          validFrom: '2026-08-30',
          validUntil: '2026-10-31',
          description: 'Temporary waiver, active until 31 October 2026 (no stated start date — see note)',
        }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
      notes: [{ text: 'Source states only an end date ("until October 31, 2026"), never a start date — validFrom below is a placeholder set to the date we verified this page, not a confirmed scheme start. TODO: verify true start date. No fallback rule is stated on the source outside this window; implicit visa_required fallback applies.', source: MontenegroSources.BY }],
    }, // Belarus
    'CN': {
      access: 'entitled',
      entitlements: [
        {
          conditions: [{
            type: 'date_range',
            validFrom: '2026-08-30',
            validUntil: '2026-10-31',
            description: 'Organized tourist group waiver, active until 31 October 2026 (no stated start date — see note)',
          }],
          limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
          notes: [{ text: 'Organized tourist group only: must enter/stay/leave together, direct charter flight, proof of paid tour arrangement and guaranteed return required.', source: MontenegroSources.CN }],
        },
        {
          conditions: [{
            type: 'date_range',
            validFrom: '2026-08-30',
            validUntil: '2026-10-31',
            description: 'Business passport waiver, active until 31 October 2026 (no stated start date — see note)',
          }],
          limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
          notes: [{ text: 'Business passport holders only: requires an invitation letter per the short-stay (C visa) regulations.', source: MontenegroSources.CN }],
        },
      ],
      notes: [
        { text: 'Outside these windows, nationals require a visa; issued by Montenegrin diplomatic/consular missions.', source: MontenegroSources.CN },
        { text: 'Both date_range entitlements above have a validFrom of the date we verified this page; the source states only an end date ("until October 31, 2026"), never a start date. TODO: verify true start date.' },
      ],
    }, // China
    'KZ': {
      access: 'entitled',
      entitlements: [{
        conditions: [{
          type: 'date_range',
          validFrom: '2026-05-01',
          validUntil: '2026-10-01',
          description: 'Seasonal visa waiver, 1 May – 1 October 2026',
        }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
      // No unconditional fallback entitlement — outside the window, no entitlement
      // matches and evaluation correctly falls through to visa_required.
      notes: [{ text: 'Outside the seasonal waiver, nationals require a visa in advance from a Montenegrin diplomatic/consular post, or the Embassy of Bulgaria in Kazakhstan if none is reachable.', source: MontenegroSources.KZ }],
    }, // Kazakhstan
    'RU': {
      access: 'entitled',
      entitlements: [{
        conditions: [{
          type: 'date_range',
          validFrom: '2026-08-30',
          validUntil: '2026-10-31',
          description: 'Temporary waiver, active until 31 October 2026 (no stated start date — see note)',
        }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
      notes: [{ text: 'Source states only an end date ("until October 31, 2026"), never a start date — validFrom below is a placeholder set to the date we verified this page, not a confirmed scheme start. TODO: verify true start date. No fallback rule is stated on the source outside this window; implicit visa_required fallback applies.', source: MontenegroSources.RU }],
    }, // Russian Federation
    'SA': {
      access: 'entitled',
      entitlements: [{
        conditions: [{
          type: 'date_range',
          validFrom: '2026-08-30',
          validUntil: '2026-10-31',
          description: 'Temporary waiver, active until 31 October 2026 (no stated start date — see note)',
        }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
      notes: [{ text: 'Source states only an end date ("until October 31, 2026"), never a start date — validFrom below is a placeholder set to the date we verified this page, not a confirmed scheme start. TODO: verify true start date. No fallback rule is stated on the source outside this window; implicit visa_required fallback applies.', source: MontenegroSources.SA }],
    }, // Saudi Arabia
    'TR': {
      access: 'entitled',
      entitlements: [{
        conditions: [{
          type: 'date_range',
          validFrom: '2026-08-30',
          validUntil: '2026-10-31',
          description: 'Temporary waiver, active until 31 October 2026 (no stated start date — see note)',
        }],
        limits: [{ type: 'per_visit', value: 30, unit: 'days' }],
      }],
      notes: [{ text: 'Source states only an end date ("until October 31, 2026"), never a start date — validFrom below is a placeholder set to the date we verified this page, not a confirmed scheme start. TODO: verify true start date. No fallback rule is stated on the source outside this window; implicit visa_required fallback applies.', source: MontenegroSources.TR }],
    }, // Turkey

    // ── Visa required ───────────────────────────────────────────────────────────
    'AF': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Afghanistan require a visa to enter.', source: MontenegroSources.AF }] }, // Afghanistan
    'AO': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Angola require a visa to enter.', source: MontenegroSources.AO }] }, // Angola
    'AU': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Australia require a visa to enter.', source: MontenegroSources.AU }] }, // Australia
    'AZ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Azerbaijan require a visa to enter.', source: MontenegroSources.AZ }] }, // Azerbaijan
    'BH': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Bahrain require a visa to enter.', source: MontenegroSources.BH }] }, // Bahrain
    'BD': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Bangladesh require a visa to enter.', source: MontenegroSources.BD }] }, // Bangladesh
    'BZ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Belize require a visa to enter.', source: MontenegroSources.BZ }] }, // Belize
    'BJ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Benin require a visa to enter.', source: MontenegroSources.BJ }] }, // Benin
    'BT': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Bhutan require a visa to enter.', source: MontenegroSources.BT }] }, // Bhutan
    'BO': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Bolivia require a visa to enter.', source: MontenegroSources.BO }] }, // Bolivia
    'BW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Botswana require a visa to enter.', source: MontenegroSources.BW }] }, // Botswana
    'BF': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Burkina Faso require a visa to enter.', source: MontenegroSources.BF }] }, // Burkina Faso
    'BI': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Burundi require a visa to enter.', source: MontenegroSources.BI }] }, // Burundi
    'KH': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Cambodia require a visa to enter.', source: MontenegroSources.KH }] }, // Cambodia
    'CM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Cameroon require a visa to enter.', source: MontenegroSources.CM }] }, // Cameroon
    'CF': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Central African Republic require a visa to enter.', source: MontenegroSources.CF }] }, // Central African Republic
    'TD': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Chad require a visa to enter.', source: MontenegroSources.TD }] }, // Chad
    'CD': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Congo, Democratic Republic of the require a visa to enter.', source: MontenegroSources.CD }] }, // Congo, Democratic Republic of the
    'CG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Congo, Republic require a visa to enter.', source: MontenegroSources.CG }] }, // Congo, Republic
    'CU': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Cuba require a visa to enter.', source: MontenegroSources.CU }] }, // Cuba
    'DJ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Djibouti require a visa to enter.', source: MontenegroSources.DJ }] }, // Djibouti
    'DO': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Dominican Republic require a visa to enter.', source: MontenegroSources.DO }] }, // Dominican Republic
    'EC': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Ecuador require a visa to enter.', source: MontenegroSources.EC }] }, // Ecuador
    'GQ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Equatorial Guinea require a visa to enter.', source: MontenegroSources.GQ }] }, // Equatorial Guinea
    'ER': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Eritrea require a visa to enter.', source: MontenegroSources.ER }] }, // Eritrea
    'ET': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Ethiopia require a visa to enter.', source: MontenegroSources.ET }] }, // Ethiopia
    'FJ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Fiji require a visa to enter.', source: MontenegroSources.FJ }] }, // Fiji
    'GA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Gabon require a visa to enter.', source: MontenegroSources.GA }] }, // Gabon
    'GM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Gambia require a visa to enter.', source: MontenegroSources.GM }] }, // Gambia
    'GH': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Ghana require a visa to enter.', source: MontenegroSources.GH }] }, // Ghana
    'GN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Guinea require a visa to enter.', source: MontenegroSources.GN }] }, // Guinea
    'GW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Guinea-Bissau require a visa to enter.', source: MontenegroSources.GW }] }, // Guinea-Bissau
    'GY': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Guyana require a visa to enter.', source: MontenegroSources.GY }] }, // Guyana
    'HT': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Haiti require a visa to enter.', source: MontenegroSources.HT }] }, // Haiti
    'IN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of India require a visa to enter.', source: MontenegroSources.IN }] }, // India
    'ID': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Indonesia require a visa to enter.', source: MontenegroSources.ID }] }, // Indonesia
    'IR': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Iran require a visa to enter.', source: MontenegroSources.IR }] }, // Iran
    'IQ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Iraq require a visa to enter.', source: MontenegroSources.IQ }] }, // Iraq
    'CI': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Ivory Coast (Côte d\'Ivoire) require a visa to enter.', source: MontenegroSources.CI }] }, // Ivory Coast (Côte d'Ivoire)
    'JM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Jamaica require a visa to enter.', source: MontenegroSources.JM }] }, // Jamaica
    'JO': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Jordan require a visa to enter.', source: MontenegroSources.JO }] }, // Jordan
    'KE': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Kenya require a visa to enter.', source: MontenegroSources.KE }] }, // Kenya
    'KP': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Korea, Democratic People\'s Republic of (North Korea) require a visa to enter.', source: MontenegroSources.KP }] }, // Korea, Democratic People's Republic of (North Korea)
    'KW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Kuwait require a visa to enter.', source: MontenegroSources.KW }] }, // Kuwait
    'KG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Kyrgyzstan require a visa to enter.', source: MontenegroSources.KG }] }, // Kyrgyzstan
    'LA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Laos require a visa to enter.', source: MontenegroSources.LA }] }, // Laos
    'LB': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Lebanon require a visa to enter.', source: MontenegroSources.LB }] }, // Lebanon
    'LS': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Lesotho require a visa to enter.', source: MontenegroSources.LS }] }, // Lesotho
    'LY': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Libya require a visa to enter.', source: MontenegroSources.LY }] }, // Libya
    'MG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Madagascar require a visa to enter.', source: MontenegroSources.MG }] }, // Madagascar
    'MW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Malawi require a visa to enter.', source: MontenegroSources.MW }] }, // Malawi
    'MV': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Maldives require a visa to enter.', source: MontenegroSources.MV }] }, // Maldives
    'ML': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Mali require a visa to enter.', source: MontenegroSources.ML }] }, // Mali
    'MR': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Mauritania require a visa to enter.', source: MontenegroSources.MR }] }, // Mauritania
    'MN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Mongolia require a visa to enter.', source: MontenegroSources.MN }] }, // Mongolia
    'MA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Morocco require a visa to enter.', source: MontenegroSources.MA }] }, // Morocco
    'MM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Myanmar require a visa to enter.', source: MontenegroSources.MM }] }, // Myanmar
    'NA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Namibia require a visa to enter.', source: MontenegroSources.NA }] }, // Namibia
    'NP': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Nepal require a visa to enter.', source: MontenegroSources.NP }] }, // Nepal
    'NE': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Niger require a visa to enter.', source: MontenegroSources.NE }] }, // Niger
    'NG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Nigeria require a visa to enter.', source: MontenegroSources.NG }] }, // Nigeria
    'OM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Oman require a visa to enter.', source: MontenegroSources.OM }] }, // Oman
    'PS': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Palestine require a visa to enter.', source: MontenegroSources.PS }] }, // Palestine
    'PG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Papua New Guinea require a visa to enter.', source: MontenegroSources.PG }] }, // Papua New Guinea
    'PH': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Philippines require a visa to enter.', source: MontenegroSources.PH }] }, // Philippines
    'QA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Qatar require a visa to enter.', source: MontenegroSources.QA }] }, // Qatar
    'RW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Rwanda require a visa to enter.', source: MontenegroSources.RW }] }, // Rwanda
    'ST': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Sao Tome and Principe require a visa to enter.', source: MontenegroSources.ST }] }, // Sao Tome and Principe
    'SN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Senegal require a visa to enter.', source: MontenegroSources.SN }] }, // Senegal
    'SL': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Sierra Leone require a visa to enter.', source: MontenegroSources.SL }] }, // Sierra Leone
    'SO': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Somalia require a visa to enter.', source: MontenegroSources.SO }] }, // Somalia
    'ZA': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of South Africa require a visa to enter.', source: MontenegroSources.ZA }] }, // South Africa
    'LK': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Sri Lanka require a visa to enter.', source: MontenegroSources.LK }] }, // Sri Lanka
    'SD': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Sudan require a visa to enter.', source: MontenegroSources.SD }] }, // Sudan
    'SR': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Suriname require a visa to enter.', source: MontenegroSources.SR }] }, // Suriname
    'SZ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Swaziland (Eswatini) require a visa to enter.', source: MontenegroSources.SZ }] }, // Swaziland (Eswatini)
    'SY': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Syria require a visa to enter.', source: MontenegroSources.SY }] }, // Syria
    'TJ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Tajikistan require a visa to enter.', source: MontenegroSources.TJ }] }, // Tajikistan
    'TZ': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Tanzania require a visa to enter.', source: MontenegroSources.TZ }] }, // Tanzania
    'TH': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Thailand require a visa to enter.', source: MontenegroSources.TH }] }, // Thailand
    'TG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Togo require a visa to enter.', source: MontenegroSources.TG }] }, // Togo
    'TN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Tunisia require a visa to enter.', source: MontenegroSources.TN }] }, // Tunisia
    'TM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Turkmenistan require a visa to enter.', source: MontenegroSources.TM }] }, // Turkmenistan
    'UG': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Uganda require a visa to enter.', source: MontenegroSources.UG }] }, // Uganda
    'KM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Union of the Comoros and Swaziland in Eswatini require a visa to enter.', source: MontenegroSources.KM }] }, // Union of the Comoros and Swaziland in Eswatini
    'VU': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Vanuatu require a visa to enter.', source: MontenegroSources.VU }] }, // Vanuatu
    'VN': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Vietnam require a visa to enter.', source: MontenegroSources.VN }] }, // Vietnam
    'YE': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Yemen require a visa to enter.', source: MontenegroSources.YE }] }, // Yemen
    'ZM': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Zambia require a visa to enter.', source: MontenegroSources.ZM }] }, // Zambia
    'ZW': { access: 'visa_required', notes: [{ text: 'Montenegro\'s diplomatic-missions site states nationals of Zimbabwe require a visa to enter.', source: MontenegroSources.ZW }] }, // Zimbabwe

    // ── Visa required — source describes a now-lapsed seasonal scheme (see notes) ──
    'AM': { access: 'visa_required', notes: [{ text: 'Source page also describes a seasonal 30-day visa waiver (organized tourist group, valid travel document, no visa) that ran 1 March – 29 October 2025. That window has already lapsed as of 2026-08-30 but the source page still displays it as current content — a staleness issue on Montenegro\'s own site, not this scrape. Deliberately NOT encoded as an active entitlement; only the base visa_required rule is encoded here. TODO: confirm with Montenegrin authorities whether this scheme was renewed for a later date range before re-adding it.', source: MontenegroSources.AM }] }, // Armenia — lapsed seasonal scheme deliberately dropped, see note
    'EG': { access: 'visa_required', notes: [{ text: 'Source page also describes a seasonal 30-day visa waiver (organized tourist group, valid travel document, no visa) that ran 1 March – 29 October 2025. That window has already lapsed as of 2026-08-30 but the source page still displays it as current content — a staleness issue on Montenegro\'s own site, not this scrape. Deliberately NOT encoded as an active entitlement; only the base visa_required rule is encoded here. TODO: confirm with Montenegrin authorities whether this scheme was renewed for a later date range before re-adding it.', source: MontenegroSources.EG }] }, // Egypt — lapsed seasonal scheme deliberately dropped, see note
    'UZ': { access: 'visa_required', notes: [{ text: 'Source page also describes a seasonal 30-day visa waiver (organized tourist group, valid travel document, no visa) that ran 1 March – 29 October 2025. That window has already lapsed as of 2026-08-30 but the source page still displays it as current content — a staleness issue on Montenegro\'s own site, not this scrape. Deliberately NOT encoded as an active entitlement; only the base visa_required rule is encoded here. TODO: confirm with Montenegrin authorities whether this scheme was renewed for a later date range before re-adding it.', source: MontenegroSources.UZ }] }, // Uzbekistan — lapsed seasonal scheme deliberately dropped, see note

    // ── Visa required — source page is untranslated (not in English) ──────────────
    'LR': { access: 'visa_required', notes: [{ text: 'Source page for Liberia is published only in Montenegrin, not English (unlike most other entries on this site). Content translates to: nationals of Liberia require a visa to enter Montenegro, obtainable from Montenegrin diplomatic/consular posts, or the nearest Serbian diplomatic/consular post if none is reachable. TODO: confirm translation before relying on this for user-facing copy.', source: MontenegroSources.LR }] }, // Liberia — SOURCE TEXT NOT IN ENGLISH

    // ── Visa required — TRUE CONTENT GAP: no rule published on source at all ───────
    // (Confirmed structurally: page has no Visa regime section; the generic
    // Schengen/US/UK/Ireland-visa-holder banner shown here also appears identically
    // on all other 195 pages and is not specific to these countries.)
    'DZ': { access: 'visa_required', notes: [{ text: 'No country-specific visa-regime information is published on Montenegro\'s diplomatic-missions site for Algeria. Defaulting to visa_required as the conservative assumption. (Note: this page does display a generic, site-wide banner about Schengen/US/UK/Ireland visa holders getting 30 days — that banner appears identically on all 196 country pages and is NOT specific to Algeria; it is not encoded here as it applies independently of passport nationality.)', source: MontenegroSources.DZ }] }, // Algeria — TODO: verify, no rule published on source
    'CV': { access: 'visa_required', notes: [{ text: 'No country-specific visa-regime information is published on Montenegro\'s diplomatic-missions site for Cabo Verde. Defaulting to visa_required as the conservative assumption. (Note: this page does display a generic, site-wide banner about Schengen/US/UK/Ireland visa holders getting 30 days — that banner appears identically on all 196 country pages and is NOT specific to Cabo Verde; it is not encoded here as it applies independently of passport nationality.)', source: MontenegroSources.CV }] }, // Cabo Verde — TODO: verify, no rule published on source
    'MZ': { access: 'visa_required', notes: [{ text: 'No country-specific visa-regime information is published on Montenegro\'s diplomatic-missions site for Mozambique. Defaulting to visa_required as the conservative assumption. (Note: this page does display a generic, site-wide banner about Schengen/US/UK/Ireland visa holders getting 30 days — that banner appears identically on all 196 country pages and is NOT specific to Mozambique; it is not encoded here as it applies independently of passport nationality.)', source: MontenegroSources.MZ }] }, // Mozambique — TODO: verify, no rule published on source
    'PK': { access: 'visa_required', notes: [{ text: 'No country-specific visa-regime information is published on Montenegro\'s diplomatic-missions site for Pakistan. Defaulting to visa_required as the conservative assumption. (Note: this page does display a generic, site-wide banner about Schengen/US/UK/Ireland visa holders getting 30 days — that banner appears identically on all 196 country pages and is NOT specific to Pakistan; it is not encoded here as it applies independently of passport nationality.)', source: MontenegroSources.PK }] }, // Pakistan — TODO: verify, no rule published on source
  },
};

/**
 * Returns the Montenegro passport rule for a given ISO Alpha-2 passport code.
 * Returns the default rule (visa_required) for unknown or null codes.
 */
export function getMontenegroRule(passportCode: string | null): PassportRule {
  if (!passportCode) return MONTENEGRO.defaultRule;
  return MONTENEGRO.passportRules[passportCode] ?? MONTENEGRO.defaultRule;
}
