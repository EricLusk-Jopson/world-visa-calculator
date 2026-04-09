/**
 * uk.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Visa and entry rules for the United Kingdom (England, Scotland, Wales,
 * Northern Ireland).
 *
 * ── Visa scheme overview ─────────────────────────────────────────────────────
 *
 * STANDARD VISITOR VISA / VISA-FREE ENTRY
 *   Most nationals visit the UK under the "Standard Visitor" route. Those from
 *   visa-required countries must obtain a Standard Visitor Visa in advance.
 *   Visa-exempt nationals may enter for up to SIX MONTHS (180 days) per visit.
 *   Unlike Schengen, the UK does not apply a rolling-window calculation —
 *   the limit is per visit, not an aggregate over a period.
 *
 *   Source (visitor route): https://www.gov.uk/standard-visitor
 *   Source (visa nationals list): https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visa-national
 *
 * ELECTRONIC TRAVEL AUTHORISATION (ETA)
 *   From 2 April 2025, most visa-exempt nationals who are NOT British or Irish
 *   citizens require an ETA before travelling to the UK. An ETA is NOT a visa —
 *   it does not grant entry, it is a pre-clearance linked to the passport.
 *   ETA costs £10 and is valid for 2 years or until the passport expires.
 *   Nationals who already require a visa are unaffected by the ETA scheme.
 *
 *   Source (ETA): https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta
 *   Source (ETA exemptions): https://www.gov.uk/guidance/electronic-travel-authorisation-eta-exemptions
 *
 * COMMON TRAVEL AREA (CTA)
 *   Irish citizens enjoy freedom of movement throughout the UK under the
 *   Common Travel Area — a bilateral arrangement predating both countries'
 *   EU membership. Irish citizens do not require a visa, ETA, or any other
 *   pre-travel authorisation to enter the UK. They may live and work freely.
 *
 *   Source (CTA): https://www.gov.uk/government/publications/common-travel-area-guidance
 *
 * BRITISH NATIONALS OVERSEAS / OTHER BRITISH STATUS
 *   British Nationals (Overseas) (BN(O)) from Hong Kong have a specific visa
 *   route distinct from standard visitor. This file covers Standard Visitor
 *   rules only.
 *
 * ── Coverage note ────────────────────────────────────────────────────────────
 *   This is a first-pass skeleton. The passportRules below cover the most
 *   commonly travelled nationalities. The full UK Appendix Visa National list
 *   runs to ~100 visa-required countries; the remaining majority are visa-free.
 *   TODO: expand to full list against Appendix Visa National (last updated
 *   regularly — check gov.uk for current version).
 *
 * Last verified: 2026-04-09
 */

import type { RegionDefinition, PassportRule, SourceDoc } from '@/types';

// ─── Source document references ───────────────────────────────────────────────

/** UK Immigration Rules — Appendix Visa National (the visa-required list) */
const VISA_NATIONAL_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visa-national',
  parentUrl: 'https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas',
  dateChecked: '2026-04-09',
};

/** UK ETA scheme overview and eligibility guidance */
const ETA_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta',
  parentUrl: 'https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas',
  dateChecked: '2026-04-09',
};

/** Common Travel Area official guidance */
const CTA_SOURCE: SourceDoc = {
  directUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance',
  parentUrl: 'https://www.gov.uk/browse/visas-immigration',
  dateChecked: '2026-04-09',
};

// ─── Shared note text ─────────────────────────────────────────────────────────

const ETA_NOTE =
  'An Electronic Travel Authorisation (ETA) is required before travelling. ' +
  'The ETA costs £10, is linked to your passport, and is valid for 2 years ' +
  'or until the passport expires. Apply at: https://www.gov.uk/apply-electronic-travel-authorisation';

const CTA_NOTE =
  'Irish citizens have unrestricted freedom of movement throughout the UK ' +
  'under the Common Travel Area (CTA). No visa, ETA, or pre-travel ' +
  'authorisation is required.';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function etaRequired(): PassportRule['notes'] {
  return [{ text: ETA_NOTE, source: ETA_SOURCE }];
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const UNITED_KINGDOM: RegionDefinition = {
  code: 'united-kingdom',
  name: 'United Kingdom',
  memberStates: ['GB'],

  // The Standard Visitor route permits up to 6 months (180 days) per visit.
  // IMPORTANT: This is a per-visit limit, NOT a rolling 180-day window like
  // Schengen. Multiple consecutive visits may be scrutinised by Border Force
  // even if each individual visit is under 180 days.
  rule: {
    allowanceDays: 180,
    windowDays: 365,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },

  lastVerified: '2026-04-09',
  sourceUrl: 'https://www.gov.uk/standard-visitor',

  defaultRule: { access: 'visa_required' },

  passportRules: {

    // ── British citizens ───────────────────────────────────────────────────
    'GB': { access: 'free_movement' },

    // ── Common Travel Area — Irish citizens ────────────────────────────────
    // Irish citizens have full freedom of movement in the UK with no limit.
    'IE': {
      access: 'free_movement',
      notes: [{ text: CTA_NOTE, source: CTA_SOURCE }],
    },

    // ── EU / EEA — visa-free, ETA required from April 2025 ────────────────
    // EU and EEA nationals no longer have free movement post-Brexit.
    // They may visit visa-free for up to 6 months but require an ETA.
    'AT': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'BE': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'BG': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'HR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'CY': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'CZ': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'DK': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'EE': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'FI': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'FR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'DE': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'GR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'HU': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'IT': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'LV': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'LT': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'LU': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'MT': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'NL': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'PL': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'PT': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'RO': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'SK': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'SI': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'ES': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'SE': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    // EEA non-EU
    'IS': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'LI': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'NO': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    // Switzerland
    'CH': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },

    // ── Visa-free nationalities (non-EEA) — ETA required ──────────────────
    // Source: gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national
    // These nationalities are NOT on Appendix Visa National and may visit
    // visa-free for up to 6 months. All require ETA from April 2025.
    'US': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'CA': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'AU': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'NZ': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'JP': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'KR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'SG': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'MY': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'BR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'MX': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'AR': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'CL': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },
    'IL': { access: 'visa_free', allowanceDays: 180, windowDays: 365, notes: etaRequired() },

    // ── Visa required — select nationalities ──────────────────────────────
    // TODO: expand to full Appendix Visa National list.
    // Notable visa-required nationalities (non-exhaustive):
    'CN': { access: 'visa_required' },
    'IN': { access: 'visa_required' },
    'RU': { access: 'visa_required' },
    'PK': { access: 'visa_required' },
    'BD': { access: 'visa_required' },
    'NG': { access: 'visa_required' },
    'GH': { access: 'visa_required' },
    'TR': { access: 'visa_required' },

    // ── ETA-exempt visa-free nationals ────────────────────────────────────
    // A small number of nationalities are visa-free AND ETA-exempt (e.g. some
    // British Overseas Territory holders). Check gov.uk/guidance/electronic-
    // travel-authorisation-eta-exemptions for the current list.
    // TODO: populate once ETA exemption list is confirmed.

  },
};

export function getUKRule(passportCode: string | null): PassportRule {
  if (!passportCode) return UNITED_KINGDOM.defaultRule;
  return UNITED_KINGDOM.passportRules[passportCode] ?? UNITED_KINGDOM.defaultRule;
}
