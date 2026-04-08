/**
 * schengen.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Single source of truth for all Schengen Area visa rules by passport/nationality.
 *
 * Sources:
 *   - EU Commission Annex II of Regulation (EU) 2018/1806 (visa-free list)
 *   - https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
 *   - Schengen member states as of 2026 (29 countries)
 *
 * Last verified: 2026-04-07
 */

import type { RegionDefinition, PassportRule } from '@/types';

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
  lastVerified: '2026-04-07',
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

    // ── Airport Transit Visa (ATV) required — Annex IV Reg. (EU) 2018/1806 ──
    // These nationals need an ATV even to transit the international zone of a
    // Schengen airport (i.e. without formally entering Schengen territory).
    // All 12 are also visa_required for entry; ATV is an additional layer.
    // Verified against: https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
    // Note: Iraq (IQ) appears on the EU official list but was omitted from the
    // original brief — it has been added here per the authoritative source.
    'AF': { access: 'visa_required', requiresATV: true },  // Afghanistan
    'BD': { access: 'visa_required', requiresATV: true },  // Bangladesh
    'CD': { access: 'visa_required', requiresATV: true },  // Congo (Democratic Republic)
    'ER': { access: 'visa_required', requiresATV: true },  // Eritrea
    'ET': { access: 'visa_required', requiresATV: true },  // Ethiopia
    'GH': { access: 'visa_required', requiresATV: true },  // Ghana
    'IR': { access: 'visa_required', requiresATV: true },  // Iran
    'IQ': { access: 'visa_required', requiresATV: true },  // Iraq (on EU list; not in original brief)
    'NG': { access: 'visa_required', requiresATV: true },  // Nigeria
    'PK': { access: 'visa_required', requiresATV: true },  // Pakistan
    'SO': { access: 'visa_required', requiresATV: true },  // Somalia
    'LK': { access: 'visa_required', requiresATV: true },  // Sri Lanka

    // ── Suspended ─────────────────────────────────────────────────────────────
    'GE': {
      access: 'suspended',
      suspensionNote:
        'Visa-free access suspended March 2026 to March 2027 for holders of diplomatic, service, and official passports only. Ordinary Georgian passports remain visa-free.',
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
