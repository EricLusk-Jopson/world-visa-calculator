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
 *   up to 90 days for tourism, transit, or business purposes.
 *
 *   Source (entry requirements): https://www.irishimmigration.ie/coming-to-visit-ireland/
 *   Source (visa required list): https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland/can-i-visit-ireland-without-a-visa/
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
 *   Ireland and the United Kingdom share the Common Travel Area, a bilateral
 *   arrangement that predates both countries' EU membership. British citizens
 *   may enter and reside in Ireland freely with no visa, no time limit, and
 *   no pre-travel authorisation required.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/
 *   Source (official joint statement): https://www.gov.uk/government/publications/common-travel-area-guidance
 *
 * SWISS NATIONALS
 *   Switzerland has a bilateral agreement with Ireland granting Swiss nationals
 *   rights broadly equivalent to EEA nationals for entry and short stays.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/
 *
 * VISA POLICY
 *   Nationals of countries on the Irish short-stay visa required list must
 *   obtain a "C" (short-stay) visa before travelling. Visa applications are
 *   made through the Irish Naturalisation and Immigration Service (INIS).
 *   Ireland does NOT participate in any Schengen visa reciprocity arrangement —
 *   a Schengen visa does not grant entry to Ireland, and vice versa.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland/how-to-apply-for-a-short-stay-c-visa/
 *
 * UK PERMISSION HOLDERS
 *   Certain non-EEA nationals with valid UK immigration permission (e.g. UK
 *   residence permit, UK visa) may transit or enter Ireland without an Irish
 *   visa under a specific arrangement. This applies to transit scenarios and
 *   is distinct from tourist entry. See INIS guidance for current eligibility.
 *
 *   Source: https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland/can-i-visit-ireland-without-a-visa/
 *
 * NO ETA / ETIAS REQUIREMENT
 *   Ireland does not operate an ETA system and does not participate in ETIAS
 *   (the EU's upcoming Electronic Travel Information and Authorisation System).
 *   As of April 2026 no pre-travel electronic authorisation is required for
 *   visa-exempt travellers.
 *
 * ── Coverage note ────────────────────────────────────────────────────────────
 *   This is a first-pass skeleton. The passportRules below cover the most
 *   commonly travelled nationalities. The full INIS visa-required list should
 *   be consulted for complete coverage.
 *   TODO: expand to full list against the INIS "Can I visit without a visa?"
 *   page and associated statutory instrument (S.I. No. 473 of 2004 and
 *   subsequent amendments).
 *
 * Last verified: 2026-04-09
 */

import type { RegionDefinition, PassportRule, SourceDoc } from '@/types';

// ─── Source document references ───────────────────────────────────────────────

/** INIS — "Can I visit Ireland without a visa?" master page */
const INIS_VISA_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/visit-ireland/can-i-visit-ireland-without-a-visa/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
  dateChecked: '2026-04-09',
};

/** INIS — EU/EEA/Swiss free movement in Ireland */
const EU_FREE_MOVEMENT_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/',
  dateChecked: '2026-04-09',
};

/** Common Travel Area — INIS guidance */
const CTA_SOURCE: SourceDoc = {
  directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/',
  parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
  dateChecked: '2026-04-09',
};

// ─── Shared note text ─────────────────────────────────────────────────────────

const CTA_NOTE =
  'British citizens have unrestricted freedom of movement throughout Ireland ' +
  'under the Common Travel Area (CTA). No visa or pre-travel authorisation is required.';

const NOT_SCHENGEN_NOTE =
  'Ireland is not part of the Schengen Area. A Schengen visa does not grant ' +
  'entry to Ireland. Separate permission is required for each jurisdiction.';

// ─── Main export ──────────────────────────────────────────────────────────────

export const IRELAND: RegionDefinition = {
  code: 'ireland',
  name: 'Ireland',
  memberStates: ['IE'],

  // Visa-exempt nationals may stay up to 90 days (the standard tourist
  // permission stamped at the border). This mirrors the common short-stay
  // limit but is NOT governed by the Schengen 90/180 rolling-window rule.
  rule: {
    allowanceDays: 90,
    windowDays: 180,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },

  lastVerified: '2026-04-09',
  sourceUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',

  defaultRule: { access: 'visa_required' },

  passportRules: {

    // ── Irish citizens ─────────────────────────────────────────────────────
    'IE': { access: 'free_movement' },

    // ── Common Travel Area — British citizens ──────────────────────────────
    'GB': {
      access: 'free_movement',
      notes: [{ text: CTA_NOTE, source: CTA_SOURCE }],
    },

    // ── EU member states — free movement ──────────────────────────────────
    'AT': { access: 'free_movement' },
    'BE': { access: 'free_movement' },
    'BG': { access: 'free_movement' },
    'HR': { access: 'free_movement' },
    'CY': { access: 'free_movement' },
    'CZ': { access: 'free_movement' },
    'DK': { access: 'free_movement' },
    'EE': { access: 'free_movement' },
    'FI': { access: 'free_movement' },
    'FR': { access: 'free_movement' },
    'DE': { access: 'free_movement' },
    'GR': { access: 'free_movement' },
    'HU': { access: 'free_movement' },
    'IT': { access: 'free_movement' },
    'LV': { access: 'free_movement' },
    'LT': { access: 'free_movement' },
    'LU': { access: 'free_movement' },
    'MT': { access: 'free_movement' },
    'NL': { access: 'free_movement' },
    'PL': { access: 'free_movement' },
    'PT': { access: 'free_movement' },
    'RO': { access: 'free_movement' },
    'SK': { access: 'free_movement' },
    'SI': { access: 'free_movement' },
    'ES': { access: 'free_movement' },
    'SE': { access: 'free_movement' },
    // EEA non-EU
    'IS': { access: 'free_movement' },
    'LI': { access: 'free_movement' },
    'NO': { access: 'free_movement' },
    // Switzerland (bilateral agreement — equivalent to EEA for entry purposes)
    'CH': { access: 'free_movement' },

    // ── Visa-free — up to 90 days ──────────────────────────────────────────
    // Source: INIS visa-exempt list. No ETA required (as of April 2026).
    'US': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      notes: [{ text: NOT_SCHENGEN_NOTE, source: INIS_VISA_SOURCE }],
    },
    'CA': {
      access: 'visa_free',
      allowanceDays: 90,
      windowDays: 180,
      notes: [{ text: NOT_SCHENGEN_NOTE, source: INIS_VISA_SOURCE }],
    },
    'AU': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'NZ': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'JP': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'KR': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'SG': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'MY': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'BR': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'MX': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'AR': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'CL': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },
    'IL': { access: 'visa_free', allowanceDays: 90, windowDays: 180 },

    // ── Visa required — select nationalities ──────────────────────────────
    // TODO: expand against the full INIS short-stay visa required list.
    'CN': { access: 'visa_required' },
    'IN': { access: 'visa_required' },
    'RU': { access: 'visa_required' },
    'PK': { access: 'visa_required' },
    'BD': { access: 'visa_required' },
    'NG': { access: 'visa_required' },
    'GH': { access: 'visa_required' },
    'TR': { access: 'visa_required' },

  },
};

export function getIrelandRule(passportCode: string | null): PassportRule {
  if (!passportCode) return IRELAND.defaultRule;
  return IRELAND.passportRules[passportCode] ?? IRELAND.defaultRule;
}
