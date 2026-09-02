import { VisaRegion } from '@/types';
import type { PassportRule, RegionDefinition } from '@/types';
import { SCHENGEN, getSchengenRule } from './schengen';
import { UNITED_KINGDOM, getUKRule } from './uk';
import { IRELAND, getIrelandRule } from './ireland';
import { TURKIYE, getTurkiyeRule } from './turkiye';
import { MONTENEGRO, getMontenegroRule } from './montenegro';
import { SERBIA, getSerbiaRule } from './serbia';

export { SCHENGEN, getSchengenRule };
export { UNITED_KINGDOM, getUKRule };
export { IRELAND, getIrelandRule };
export { TURKIYE, getTurkiyeRule };
export { MONTENEGRO, getMontenegroRule };
export { SERBIA, getSerbiaRule };

const VISA_REQUIRED_DEFAULT: PassportRule = { access: 'visa_required' };

export function getPassportRule(
  region: VisaRegion,
  passportCode: string | null,
): PassportRule {
  switch (region) {
    case VisaRegion.Schengen:      return getSchengenRule(passportCode);
    case VisaRegion.UnitedKingdom: return getUKRule(passportCode);
    case VisaRegion.Ireland:       return getIrelandRule(passportCode);
    case VisaRegion.Turkiye:       return getTurkiyeRule(passportCode);
    case VisaRegion.Montenegro:    return getMontenegroRule(passportCode);
    case VisaRegion.Serbia:        return getSerbiaRule(passportCode);
    default:                       return VISA_REQUIRED_DEFAULT;
  }
}

export function getRegionDefinition(region: VisaRegion): RegionDefinition | null {
  switch (region) {
    case VisaRegion.Schengen:      return SCHENGEN;
    case VisaRegion.UnitedKingdom: return UNITED_KINGDOM;
    case VisaRegion.Ireland:       return IRELAND;
    case VisaRegion.Turkiye:       return TURKIYE;
    case VisaRegion.Montenegro:    return MONTENEGRO;
    case VisaRegion.Serbia:        return SERBIA;
    default:                       return null;
  }
}
