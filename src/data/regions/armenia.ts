/**
 * armenia.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for Armenia's visa rules by passport/nationality.
 *
 * Sources:
 *   unilateral list: https://www.mfa.am/en/visafreelist
 *   bilateral/multilateral list: https://www.mfa.am/en/whoneedvisa
 *   parent (overview): https://www.mfa.am/en/visa/
 *   All live in @/data/sources — ArmeniaSources.
 *
 * Base/default rule is visa_required.
 *
 * ── Scope and shape of the source data ──────────────────────────────────────
 *
 * Two source lists feed this file:
 *
 * 1. The unilateral list (45 countries) — citizens with ANY type of passport
 *    are visa-free, "up to 180 days within any 365 day period." Modeled as
 *    the standard rolling_window(180, 365) StayLimit.
 *
 * 2. The bilateral/multilateral agreements list (67 rows) — visa-free access
 *    that depends on passport type. Per explicit instruction, only rows
 *    marked "All types of passports" are modeled here; rows restricted to
 *    diplomatic, official, and/or service passports grant nothing to an
 *    ordinary-passport traveler and are excluded outright (this is most of
 *    the list — e.g. Austria, Belgium, France, Germany are "Diplomatic
 *    passports only" and so do NOT get a second, redundant entitlement here
 *    beyond whatever the unilateral list already grants them).
 *
 * The bilateral list does not itself state a duration for its "all types of
 * passports" rows. Per explicit instruction, they get the same
 * rolling_window(180, 365) as the unilateral list — this mirrors mfa.am's
 * own stated general policy (citizens under a visa-free regime get "no more
 * than 180 days during one year if no other term is defined by the
 * international agreements of the Republic of Armenia"). With every
 * entitlement in this file resolving to the identical duration, there is
 * only one tier — no per-country bespoke durations, unlike Georgia's file.
 *
 * Countries appearing on BOTH lists (Qatar, United Arab Emirates) simply
 * get the one entitlement — the bilateral row adds nothing beyond what the
 * unilateral list already grants.
 *
 * ── Montenegro's bilateral row is a no-op ───────────────────────────────────
 *
 * Montenegro's bilateral-list row reads "Diplomatic and Service passports
 * only (For ordinary passports from 1 April to 31 October)" — an ordinary
 * Montenegrin passport would only be exempt in that seasonal window. But
 * Montenegro is ALSO on the unilateral list, which grants an unconditional,
 * year-round 180/365 entitlement — strictly better than the seasonal
 * bilateral one. So Montenegro's bilateral row is superseded and not
 * separately modeled; no temporal window is needed for this file.
 *
 * ── Data quirks ──────────────────────────────────────────────────────────────
 *
 * - "Republic of Korea" maps to KR. "Slovak" (bilateral-list heading is
 *   truncated) is Slovakia → SK. "Vatican City State" maps to VA.
 *   "United Kingdom of Great Britain and Northern Ireland" maps to GB.
 *   "United States of America" maps to US. "Kyrgizstan" (bilateral list's
 *   own spelling) maps to KG. "Republic of Moldova" maps to MD.
 *   "Hong Kong (Special Administrative Region of China)" maps to HK;
 *   "Macao (Special Administrative Region of China)" maps to MO — both have
 *   distinct ISO Alpha-2 codes in COUNTRIES (NationalitySelector.tsx),
 *   unlike the territory rows excluded in Georgia's file.
 *
 * Armenia's own member state (AM) is encoded as free_movement — an Armenian
 * national needs no visa to enter Armenia.
 *
 * Last verified: 2026-09-14
 */

import type {
  RegionDefinition,
  PassportRule,
  EntitledRule,
  VisaRequiredRule,
  FreeMovementRule,
  RollingWindowLimit,
} from '@/types';
import { ArmeniaSources } from '@/data/sources';

const FREE_MOVEMENT: FreeMovementRule = { access: 'free_movement' };

// ─── Region-level stay limit ──────────────────────────────────────────────────

const ROLLING_180_365: RollingWindowLimit = { type: 'rolling_window', days: 180, windowDays: 365 };

// ─── Rule helpers ───────────────────────────────────────────────────────────

/** Unilateral list — "up to 180 days within any 365 day period," any passport type. */
function entitledUnilateral(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [ROLLING_180_365],
      source: ArmeniaSources.visaFreeList,
    }],
  };
}

/** Bilateral/multilateral agreement, "All types of passports" row — same duration (see file header). */
function entitledBilateral(): EntitledRule {
  return {
    access: 'entitled',
    entitlements: [{
      limits: [ROLLING_180_365],
      source: ArmeniaSources.bilateralList,
    }],
  };
}

const VISA_REQUIRED: VisaRequiredRule = { access: 'visa_required', source: ArmeniaSources.visaFreeList };

// ─── Region definition ────────────────────────────────────────────────────────

export const ARMENIA: RegionDefinition = {
  code: 'armenia',
  name: 'Armenia',
  memberStates: ['AM'],
  rule: {
    type: 'rolling_window',
    allowanceDays: 180,
    windowDays: 365,
    entryCountsAsDay: true,
    exitCountsAsDay: true,
  },
  lastVerified: '2026-09-14',
  sourceUrl: ArmeniaSources.visaFreeList.parentUrl,
  defaultRule: VISA_REQUIRED,
  passportRules: {

    // ── Armenian citizens ───────────────────────────────────────────────────
    'AM': FREE_MOVEMENT,

    // ── Unilateral list (45 countries) ──────────────────────────────────────
    'AD': entitledUnilateral(), // Andorra
    'AU': entitledUnilateral(), // Australia
    'AT': entitledUnilateral(), // Austria
    'BE': entitledUnilateral(), // Belgium
    'BG': entitledUnilateral(), // Bulgaria
    'HR': entitledUnilateral(), // Croatia
    'CY': entitledUnilateral(), // Cyprus
    'CZ': entitledUnilateral(), // Czech Republic
    'DK': entitledUnilateral(), // Denmark
    'EE': entitledUnilateral(), // Estonia
    'FI': entitledUnilateral(), // Finland
    'FR': entitledUnilateral(), // France
    'DE': entitledUnilateral(), // Germany
    'GR': entitledUnilateral(), // Greece
    'HU': entitledUnilateral(), // Hungary
    'IS': entitledUnilateral(), // Iceland
    'IE': entitledUnilateral(), // Ireland
    'IT': entitledUnilateral(), // Italy
    'JP': entitledUnilateral(), // Japan
    'LV': entitledUnilateral(), // Latvia
    'LI': entitledUnilateral(), // Liechtenstein
    'LT': entitledUnilateral(), // Lithuania
    'LU': entitledUnilateral(), // Luxembourg
    'MT': entitledUnilateral(), // Malta
    'MC': entitledUnilateral(), // Monaco
    'ME': entitledUnilateral(), // Montenegro
    'NL': entitledUnilateral(), // Netherlands
    'NZ': entitledUnilateral(), // New Zealand
    'NO': entitledUnilateral(), // Norway
    'PL': entitledUnilateral(), // Poland
    'PT': entitledUnilateral(), // Portugal
    'QA': entitledUnilateral(), // Qatar
    'KR': entitledUnilateral(), // Republic of Korea
    'RO': entitledUnilateral(), // Romania
    'SM': entitledUnilateral(), // San Marino
    'SG': entitledUnilateral(), // Singapore
    'SK': entitledUnilateral(), // Slovakia
    'SI': entitledUnilateral(), // Slovenia
    'ES': entitledUnilateral(), // Spain
    'SE': entitledUnilateral(), // Sweden
    'CH': entitledUnilateral(), // Switzerland
    'VA': entitledUnilateral(), // Vatican City State
    'AE': entitledUnilateral(), // United Arab Emirates
    'GB': entitledUnilateral(), // United Kingdom of Great Britain and Northern Ireland
    'US': entitledUnilateral(), // United States of America

    // ── Bilateral/multilateral, "All types of passports" only ──────────────
    'AL': entitledBilateral(), // Albania
    'AR': entitledBilateral(), // Argentina
    'BY': entitledBilateral(), // Belarus
    'BR': entitledBilateral(), // Brazil
    'CN': entitledBilateral(), // China
    'GE': entitledBilateral(), // Georgia
    'HK': entitledBilateral(), // Hong Kong (SAR)
    'IR': entitledBilateral(), // Iran
    'KZ': entitledBilateral(), // Kazakhstan
    'KG': entitledBilateral(), // Kyrgyzstan
    'MO': entitledBilateral(), // Macao (SAR)
    'PA': entitledBilateral(), // Panama
    'MD': entitledBilateral(), // Republic of Moldova
    'RU': entitledBilateral(), // Russian Federation
    'RS': entitledBilateral(), // Serbia
    'TJ': entitledBilateral(), // Tajikistan
    'UA': entitledBilateral(), // Ukraine
    'UY': entitledBilateral(), // Uruguay
    'UZ': entitledBilateral(), // Uzbekistan
    'EC': entitledBilateral(), // Ecuador

  },
};

/**
 * Returns the Armenia passport rule for a given ISO Alpha-2 passport code.
 * Falls through to the default rule (visa_required) for any code not
 * present above and for unknown/null codes.
 */
export function getArmeniaRule(passportCode: string | null): PassportRule {
  if (!passportCode) return ARMENIA.defaultRule;
  return ARMENIA.passportRules[passportCode] ?? ARMENIA.defaultRule;
}
