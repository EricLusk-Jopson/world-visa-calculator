/**
 * sources.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Centralised registry of every external URL referenced in the visa data layer.
 *
 * ── Structure ─────────────────────────────────────────────────────────────────
 *
 * One exported object per region. Region files import the relevant object and
 * reference properties by name — no URL string may appear inline in a region
 * file. When a URL changes, update it here; all region files pick it up.
 *
 * ── Cron job usage ────────────────────────────────────────────────────────────
 *
 * import { SchengenSources, UKSources, IrelandSources, TurkiyeSources, MontenegroSources, SerbiaSources, BosniaSources, KosovoSources } from '@/data/sources';
 *
 * const allRegions = { SchengenSources, UKSources, IrelandSources, TurkiyeSources, MontenegroSources, SerbiaSources, BosniaSources, KosovoSources };
 * for (const [regionName, sources] of Object.entries(allRegions)) {
 *   for (const [sourceName, doc] of Object.entries(sources)) {
 *     await checkUrl(doc.directUrl,  `${regionName}.${sourceName}.directUrl`);
 *     await checkUrl(doc.parentUrl,  `${regionName}.${sourceName}.parentUrl`);
 *   }
 * }
 *
 * ── Maintenance ───────────────────────────────────────────────────────────────
 *
 * `dateChecked` records when the content was last verified as accurate, not
 * merely that the URL resolved. Update it when you confirm data is current.
 *
 * The PDF property in SchengenSources (atvSpecific) is higher breakage risk —
 * DG HOME rotates document URLs. The parentUrl is the stable fallback.
 *
 * Last updated: 2026-09-04
 */

import type { SourceDoc } from '@/types';

// ─── Schengen ─────────────────────────────────────────────────────────────────

export const SchengenSources = {

  /**
   * EU Regulation 2018/1806 (consolidated to 2025-12-30).
   * Annex I = visa-required list. Annex II = visa-free list.
   * Primary source for all Schengen passport access categories and footnotes.
   */
  visaList: {
    directUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230',
    parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
    dateChecked: '2026-04-08',
  } satisfies SourceDoc,

  /**
   * Schengen Visa Code (Regulation EC 810/2009) Annex IV.
   * Common (EU-wide) Airport Transit Visa list — nationals require an ATV
   * to transit the international zone of any Schengen airport without entering.
   */
  atvCommon: {
    directUrl: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629',
    parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
    dateChecked: '2026-04-08',
  } satisfies SourceDoc,

  /**
   * Visa Code Handbook Annex 7B (PDF).
   * Member-state-specific ATV requirements — documents which individual
   * Schengen states impose an ATV requirement beyond the common Annex IV list.
   * NOTE: PDF link — DG HOME occasionally rotates document URLs.
   * Use parentUrl as the stable fallback for manual navigation.
   */
  atvSpecific: {
    directUrl: 'https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf',
    parentUrl: 'https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en',
    dateChecked: '2026-04-08',
  } satisfies SourceDoc,


  /**
   * EU ETIAS application portal.
   * End-user application URL for the European Travel Information and
   * Authorisation System. Checked for liveness — content verification
   * is not applicable until ETIAS launches.
   */
  etias: {
    directUrl: 'https://travel-europe.europa.eu/etias_en',
    parentUrl: 'https://travel-europe.europa.eu',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

} as const;

// ─── United Kingdom ───────────────────────────────────────────────────────────

export const UKSources = {

  /**
   * GOV.UK — Standard Visitor route.
   * Canonical source for the 6-month per-visit allowance, permitted activities,
   * and the Appendix V "genuine visitor" test.
   */
  standardVisitor: {
    directUrl: 'https://www.gov.uk/standard-visitor',
    parentUrl: 'https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

  /**
   * UK Immigration Rules — Appendix Visitor: Visa National List.
   * Statutory list of nationalities required to obtain a Standard Visitor
   * Visa before travelling to the UK.
   */
  visaNationalList: {
    directUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list',
    parentUrl: 'https://www.gov.uk/guidance/immigration-rules',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

  /**
   * UK Immigration Rules — Appendix ETA National List.
   * Statutory list of nationalities eligible (and required) to obtain an
   * Electronic Travel Authorisation before travelling to the UK.
   */
  etaNationalList: {
    directUrl: 'https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list',
    parentUrl: 'https://www.gov.uk/eta',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

  /**
   * GOV.UK — UK visa requirements list for international carriers.
   * Accessible HTML version of the carriers PDF — stable URL, updated in place.
   * Lists both visa nationals and DATV nationals.
   */
  carriersList: {
    directUrl: 'https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers',
    parentUrl: 'https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

  /**
   * GOV.UK — Common Travel Area guidance.
   * Confirms Irish citizen rights in the UK and British citizen rights in
   * Ireland under the bilateral CTA arrangement.
   */

  /**
   * GOV.UK — UK ETA application page.
   * End-user application URL for the Electronic Travel Authorisation.
   * Checked for liveness — serves as the applicationUrl in the UK_ETA
   * PreTravelAuth constant in uk.ts.
   */
  etaApplication: {
    directUrl: 'https://www.gov.uk/apply-for-an-electronic-travel-authorisation-eta',
    parentUrl: 'https://www.gov.uk/eta',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

  ctaGuidance: {
    directUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance',
    parentUrl: 'https://www.gov.uk/government/publications/common-travel-area-guidance',
    dateChecked: '2026-04-14',
  } satisfies SourceDoc,

} as const;

// ─── Ireland ──────────────────────────────────────────────────────────────────

export const IrelandSources = {

  /**
   * INIS — Visa/non-visa required nationality table.
   * Primary source for Ireland's visa-required / visa-free classification.
   * Full dataset extracted from Ninja Table ID 19077 (2026-05-27).
   * The AJAX endpoint is a one-time extraction source only; this landing
   * page is the stable canonical reference.
   */
  visaNationalityList: {
    directUrl: 'https://www.irishimmigration.ie/visa-non-visa-required-nationalities/',
    parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * INIS — EU/EEA/Swiss free movement rights in Ireland.
   * Source for EEA free movement basis and the Swiss bilateral agreement.
   */
  euFreeMovement: {
    directUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/i-am-an-eu-eea-swiss-national/',
    parentUrl: 'https://www.irishimmigration.ie/coming-to-live-in-ireland/',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * INIS — Common Travel Area guidance for Ireland.
   * Source for British citizen rights in Ireland under the CTA.
   */
  ctaGuidance: {
    directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/common-travel-area/',
    parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * INIS — British-Irish Visa Scheme (BIVS).
   * Source for the BIVS exception: Indian and Chinese nationals holding a
   * valid BIVS-endorsed UK visa may enter Ireland without a separate Irish
   * visa. The scheme is bidirectional — an Irish C visa also permits UK entry.
   */
  bivs: {
    directUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/',
    parentUrl: 'https://www.irishimmigration.ie/coming-to-visit-ireland/',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * citizensinformation.ie — Visa requirements for entering Ireland.
   * Source for the Short Stay Visa Waiver Programme (SSVWP) country list
   * and the Irish transit visa country list.
   */
  citizensInformation: {
    directUrl: 'https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/visa-requirements-for-entering-ireland/',
    parentUrl: 'https://www.citizensinformation.ie/en/moving-country/visas-for-ireland/',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * Irish Statute Book — S.I. No. 473 of 2014.
   * The statutory instrument defining Ireland's visa category schedules
   * (Schedules 1–5). Legal ground truth underlying the INIS nationality table.
   */
  statutoryInstrument: {
    directUrl: 'https://www.irishstatutebook.ie/eli/2014/si/473/made/en/print',
    parentUrl: 'https://www.irishstatutebook.ie/eli/2014/si/473',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

} as const;

// ─── Türkiye ──────────────────────────────────────────────────────────────────

export const TurkiyeSources = {

  /**
   * Republic of Türkiye Ministry of Foreign Affairs — Visa Information for
   * Foreigners. Full alphabetical per-country entry requirements list.
   * Primary source for all Türkiye passport rules and allowance values.
   */
  mfaVisaInfo: {
    directUrl: 'https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa',
    parentUrl: 'https://www.mfa.gov.tr/consular-info.en.mfa',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  /**
   * Republic of Türkiye e-Visa system — eligible country list.
   * Source for which nationalities may apply for an e-Visa and on what terms
   * (90-day multiple entry, 30-day single entry, or conditional on existing
   * Schengen/US/UK/IE visa or residence permit).
   */

  /**
   * Türkiye e-Visa application portal.
   * End-user application URL for the electronic visa system.
   * Valid for tourism and commercial purposes only.
   */
  eVisaApplication: {
    directUrl: 'https://www.evisa.gov.tr/en/',
    parentUrl: 'https://www.evisa.gov.tr',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

  eVisaEligible: {
    directUrl: 'https://www.evisa.gov.tr/en/info/who-is-eligible-for-e-visa/',
    parentUrl: 'https://www.evisa.gov.tr',
    dateChecked: '2026-05-27',
  } satisfies SourceDoc,

} as const;

// ─── Montenegro ────────────────────────────────────

/**
 * Government of Montenegro — Ministry of Foreign Affairs.
 * "Embassies and consulates of Montenegro and visa regimes for foreign citizens".
 * One entry per nationality's dedicated page on this site, keyed by ISO Alpha-2
 * code. Every entry shares the same parentUrl (the index page); directUrl is the
 * nationality-specific page. Verified live 2026-08-30 (index page + spot-checked
 * CA directly; remaining directUrls follow the confirmed URL pattern but were
 * not each individually fetched — Tier 2, not Tier 1, confidence for the rest).
 *
 * Structural note: unlike the other regions above (a handful of named sources
 * per region, e.g. visaList/atvCommon), this object has 196 entries keyed by
 * ISO code — a deliberate deviation, since Montenegro's data genuinely comes
 * from 196 near-identical per-country pages on one site rather than a handful
 * of distinct legal documents. The generic cron-job health-check pattern in
 * this file's header (`Object.entries(sources)`) still works unchanged.
 */
export const MontenegroSources = {
  AF: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/afghanistan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Afghanistan
  AL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/albania',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Albania
  DZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/algeria',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Algeria
  AD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/andorra',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Andorra
  AO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/angola',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Angola
  AG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/antigua-and-barbuda',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/argentina',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Argentina
  AM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/armenia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Armenia
  AW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/aruba',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Aruba
  AU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/australia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Australia
  AT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/austria',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Austria
  AZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/azerbaijan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahamas',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bahamas
  BH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahrain',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bahrain
  BD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bangladesh',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bangladesh
  BB: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/barbados',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Barbados
  BY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belarus',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Belarus
  BE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belgium',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Belgium
  BZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belize',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Belize
  BJ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/benin',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Benin
  BT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bhutan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bhutan
  BO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bolivia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bolivia
  BA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bosnia-and-herzegovina',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/botswana',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Botswana
  BR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brazil',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Brazil
  BN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brunei',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Brunei
  BG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bulgaria',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Bulgaria
  BF: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burkina-faso',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burundi',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Burundi
  CV: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cabo-verde',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cambodia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cambodia
  CM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cameroon',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cameroon
  CA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/canada',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Canada
  KY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cayman-islands',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cayman Islands
  CF: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/central-african-republic',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Central African Republic
  TD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chad',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Chad
  CL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chile',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Chile
  CN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/china',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // China
  CO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/colombia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Colombia
  CD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-democratic-republic-of-the',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Congo, Democratic Republic of the
  CG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-republic',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/costa-rica',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Costa Rica
  HR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/croatia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Croatia
  CU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cuba',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cuba
  CY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cyprus',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Cyprus
  CZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/czech-republic',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Czech Republic
  DK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/denmark',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Denmark
  DJ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/djibouti',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Djibouti
  DM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominica',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Dominica
  DO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominican-republic',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ecuador',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ecuador
  EG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/egypt',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Egypt
  SV: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/el-salvador',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // El Salvador
  GQ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/equatorial-guinea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/eritrea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Eritrea
  EE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/estonia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Estonia
  ET: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ethiopia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/fiji',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Fiji
  FI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/finland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Finland
  FR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/france',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // France
  GA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gabon',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Gabon
  GM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gambia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Gambia
  GE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/georgia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Georgia
  DE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/germany',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Germany
  GH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ghana',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ghana
  GR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/greece',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Greece
  GD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/grenada',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Grenada
  GT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guatemala',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Guatemala
  GN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Guinea
  GW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea-bissau',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guyana',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Guyana
  HT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/haiti',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Haiti
  VA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/holy-see-and-sovereign-military-order-of-malta',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Holy See and Sovereign Military Order of Malta
  HN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/honduras',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Honduras
  HU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/hungary',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Hungary
  IS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iceland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Iceland
  IN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/india',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // India
  ID: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/indonesia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Indonesia
  IR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iran',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Iran
  IQ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iraq',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Iraq
  IE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ireland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ireland
  IL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/israel',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Israel
  IT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/italy',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Italy
  CI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ivory-coast-cote-divoire',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ivory Coast (Côte d'Ivoire)
  JM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jamaica',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Jamaica
  JP: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/japan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Japan
  JO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jordan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Jordan
  KZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kazakhstan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kenya',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kenya
  KI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kiribati',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kiribati
  KP: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-democratic-peoples-republic-of-north-korea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Korea, Democratic People's Republic of (North Korea)
  KR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-republic-of-south-korea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Korea, Republic of (South Korea)
  XK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kosovo',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kosovo
  KW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kuwait',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kuwait
  KG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kyrgyzstan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Kyrgyzstan
  LA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/laos',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Laos
  LV: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/latvia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Latvia
  LB: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lebanon',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Lebanon
  LS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lesotho',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Lesotho
  LR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liberia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Liberia
  LY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/libya',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Libya
  LI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liechtenstein',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lithuania',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Lithuania
  LU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/luxembourg',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Luxembourg
  MG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/madagascar',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Madagascar
  MW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malawi',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Malawi
  MY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malaysia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Malaysia
  MV: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/maldives',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Maldives
  ML: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mali',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mali
  MT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malta',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Malta
  MH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/marshall-islands',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritania',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mauritania
  MU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritius',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mauritius
  MX: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mexico',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mexico
  FM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/micronesia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Micronesia
  MD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/moldova',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Moldova
  MC: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/monaco',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Monaco
  MN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mongolia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mongolia
  MA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/morocco',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Morocco
  MZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mozambique',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Mozambique
  MM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/myanmar',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Myanmar
  NA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/namibia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Namibia
  NR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nauru',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Nauru
  NP: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nepal',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Nepal
  NL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/netherlands',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Netherlands
  NZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/new-zealand',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // New Zealand
  NI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nicaragua',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Nicaragua
  NE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/niger',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Niger
  NG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nigeria',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Nigeria
  MK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/north-macedonia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // North Macedonia
  NO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/norway',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Norway
  OM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/oman',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Oman
  PK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/pakistan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Pakistan
  PW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palau',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Palau
  PS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palestine',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Palestine
  PA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/panama',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Panama
  PG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/papua-new-guinea',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/paraguay',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Paraguay
  PE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/peru',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Peru
  PH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/philippines',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Philippines
  PL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/poland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Poland
  PT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/portugal',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Portugal
  QA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/qatar',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Qatar
  RO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/romania',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Romania
  RU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/russian-federation',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Russian Federation
  RW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/rwanda',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Rwanda
  KN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-kitts-and-nevis',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-lucia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-vincent-and-the-grenadines',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/samoa',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Samoa
  SM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/san-marino',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // San Marino
  ST: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sao-tome-and-principe-2',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saudi-arabia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/senegal',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Senegal
  RS: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/serbia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Serbia
  SC: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/seychelles',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Seychelles
  SL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sierra-leone',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/singapore',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Singapore
  SK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovakia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Slovakia
  SI: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovenia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Slovenia
  SB: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/solomon-islands',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/somalia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Somalia
  ZA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/south-africa',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // South Africa
  ES: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/spain',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Spain
  LK: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sri-lanka',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sudan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Sudan
  SR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/suriname',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Suriname
  SZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/swaziland-eswatini',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Swaziland (Eswatini)
  SE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sweden',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Sweden
  CH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/switzerland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Switzerland
  SY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/syria',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Syria
  TJ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tajikistan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tanzania',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Tanzania
  TH: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/thailand',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Thailand
  TL: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/timor-leste',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/togo',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Togo
  TO: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tonga',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Tonga
  TT: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/trinidad-and-tobago',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tunisia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Tunisia
  TR: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkey',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Turkey
  TM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkmenistan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tuvalu',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Tuvalu
  UG: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uganda',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Uganda
  UA: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ukraine',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Ukraine
  KM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/union-of-the-comoros-and-swatziland-in-eswatini',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Union of the Comoros and Swaziland in Eswatini
  AE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-arab-emirates',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-kingdom-of-great-britain-and-northern-ireland',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // United Kingdom of Great Britain and Northern Ireland
  US: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-states-of-america',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // United States of America
  UY: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uruguay',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Uruguay
  UZ: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uzbekistan',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vanuatu',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Vanuatu
  VE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/venezuela',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Venezuela
  VN: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vietnam',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Vietnam
  YE: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/yemen',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Yemen
  ZM: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zambia',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Zambia
  ZW: {
    directUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zimbabwe',
    parentUrl: 'https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro',
    dateChecked: '2026-08-30',
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Serbia ───────────────────────────────────────────────

/**
 * Republic of Serbia — Ministry of Foreign Affairs.
 * "Visa regime" — one dedicated page per nationality under this index.
 * Verified live 2026-08-31 (full scrape of 194 country pages).
 * Hong Kong SAR and Macao SAR (HK, MO) have no dedicated page of their own —
 * their figures come from sub-rows on China's (CN) page, so their SourceDoc
 * entries below point at the same CN URL. Taiwan (TW) has no page in the
 * scrape at all — its SourceDoc points at the index page only, as a fallback.
 */
export const SerbiaSources = {
  AF: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/avganistan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Afghanistan
  AL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/albanija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Albania
  DZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/alzir',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Algeria
  AD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/andora',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Andorra
  AO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/angola',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Angola
  AG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/antigva-i-barbuda',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/argentina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Argentina
  AM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jermenija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Armenia
  AU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/australija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Australia
  AT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/austrija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Austria
  AZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/azerbejdzan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahami',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bahamas
  BH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahrein',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bahrain
  BD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/banglades',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bangladesh
  BB: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/barbados',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Barbados
  BY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belorusija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Belarus
  BE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belgija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Belgium
  BZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belize',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Belize
  BJ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/benin',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Benin
  BT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/butan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bhutan
  BO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bolivija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bolivia
  BA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bosna-i-hercegovina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bocvana',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Botswana
  BR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brazil',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Brazil
  BN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brunej-darusalam',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Brunei Darussalam
  BG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bugarska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Bulgaria
  BF: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burkina-faso',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burundi',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Burundi
  CV: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kabo-verde',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kambodza',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cambodia
  CM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kamerun',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cameroon
  CA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kanada',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Canada
  CF: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/centralnoafricka-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Central African Republic
  TD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cad',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Chad
  CL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cile',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Chile
  CN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // China
  CO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kolumbija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Colombia
  CD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-demokratska-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Congo, Democratic Republic
  CG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kostarika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Costa Rica
  CI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kot-d-ivoar',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cote d’Ivoire
  HR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/hrvatska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Croatia
  CU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuba',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cuba
  CY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kipar',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Cyprus
  CZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ceska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Czech Republic
  DK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/danska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Denmark
  DJ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dzibuti',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Djibouti
  DM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Dominica
  DO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominikanska-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvador',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Ecuador
  EG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/egipat',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Egypt
  SV: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/el-salvador',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // El Salvador
  GQ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvatorijalna-gvineja',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/eritreja',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Eritrea
  EE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/estonija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Estonia
  SZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/esvatini',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Eswatini
  ET: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/etiopija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/fidzi',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Fiji
  FI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/finska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Finland
  FR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/francuska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // France
  GA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gabon',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Gabon
  GM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gambija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Gambia
  GE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gruzija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Georgia
  DE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nemacka',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Germany
  GH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gana',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Ghana
  GR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grcka',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Greece
  GD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grenada',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Grenada
  GT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvatemala',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Guatemala
  GN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Guinea
  GW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-bisao',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvajana',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Guyana
  HT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/haiti',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Haiti
  VA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-stolica',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Holy See
  HN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/honduras',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Honduras
  HU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madjarska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Hungary
  IS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/island',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Iceland
  IN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // India
  ID: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indonezija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Indonesia
  IR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/iran',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Iran
  IQ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irak',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Iraq
  IE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Ireland
  IL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/izrael',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Israel
  IT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/italija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Italy
  JM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jamajka',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Jamaica
  JP: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/japan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Japan
  JO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jordan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Jordan
  KZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kazahstan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kenija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Kenya
  KI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kiribati',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Kiribati
  KP: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/korea-dpr',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Korea, DPR
  KR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/koreja-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Korea, Republic
  KW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuvajt',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Kuwait
  KG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kirgiska-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Kyrgyzstan, Republic
  LA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/laos',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Laos
  LV: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/letonija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Latvia
  LB: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liban',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Lebanon
  LS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lesoto',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Lesotho
  LR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liberija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Liberia
  LY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/libija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Libya
  LI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lihtenstajn',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/litvanija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Lithuania
  LU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/luksemburg',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Luxembourg
  MG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Madagascar
  MW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malavi',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Malawi
  MY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malezija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Malaysia
  MV: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maldives',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Maldives
  ML: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mali',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mali
  MT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malta',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Malta
  MH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/marshall-islands',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritania',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mauritania
  MU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritius',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mauritius
  MX: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/meksiko',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mexico
  FM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/micronesia',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Micronesia
  MD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/moldavija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Moldova
  MC: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/monako',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Monaco
  MN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mongolija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mongolia
  ME: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/crna-gora',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Montenegro
  MA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maroko',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Morocco
  MZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mozambik',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Mozambique
  MM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mjanmar',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Myanmar
  NA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/namibija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Namibia
  NR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nauru',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Nauru
  NP: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nepal',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Nepal
  NL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/holandija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Netherlands
  NZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/novi-zeland',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // New Zealand
  NI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nikaragva',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Nicaragua
  NE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/niger',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Niger
  NG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nigerija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Nigeria
  MK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/severna-makedonija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // North Macedonia
  NO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/norveska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Norway
  OM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/oman',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Oman
  PK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/pakistan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Pakistan
  PW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palau',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Palau
  PS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palestina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Palestine
  PA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/panama',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Panama
  PG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/papua-nova-gvineja',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/paragvaj',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Paraguay
  PE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/peru',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Peru
  PH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/filipini',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Philippines
  PL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/poljska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Poland
  PT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/portugalija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Portugal
  QA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/katar',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Qatar
  RO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/rumunija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Romania
  RU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruska-federacija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Russia
  RW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruanda',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Rwanda
  KN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sent-kits-i-nevis',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-lucija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveti-vinsent-i-grenadini',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/samoa',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Samoa
  SM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/san-marino',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // San Marino
  ST: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sao-tome-i-prinsipe',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/saudijska-arabija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/senegal',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Senegal
  SC: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sejseli',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Seychelles
  SL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sijera-leone',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/singapur',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Singapore
  SK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovacka',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Slovakia
  SI: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovenija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Slovenia
  SB: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/solomonova-ostrva',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/somalija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Somalia
  ZA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzna-afrika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // South Africa
  SS: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzni-sudan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // South Sudan
  ES: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/spanija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Spain
  LK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sri-lanka',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sudan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Sudan
  SR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/surinam',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Suriname
  SE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svedska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Sweden
  CH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svajcarska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Switzerland
  SY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sirija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Syria, Arab Republic
  TJ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tadzikistan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tanzanija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Tanzania
  TH: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tajland',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Thailand
  TL: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/istocni-timor',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/togo',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Togo
  TO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tonga',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Tonga
  TT: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/trinidad-i-tobago',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tunis',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Tunisia
  TR: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turska',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Turkiye
  TM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turkmenistan',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tuvalu',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Tuvalu
  UG: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uganda',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Uganda
  UA: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ukrajina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Ukraine
  KM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/unija-komora',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Union of the Comoros
  AE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeni-arapski-emirati',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeno-kraljevstvo',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // United Kingdom
  US: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sjedinjene-americke-drzave',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // United States
  UY: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/urugvaj',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Uruguay
  UZ: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uzbekistan-republika',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vanuatu',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Vanuatu
  VE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/venecuela',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Venezuela
  VN: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vijetnam',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Vietnam
  YE: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jemen',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Yemen
  ZM: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zambija',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Zambia
  ZW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zimbabve',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Zimbabwe
  HK: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Hong Kong SAR — sub-row on China's page, no dedicated page
  MO: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Macao SAR — sub-row on China's page, no dedicated page
  TW: {
    directUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    parentUrl: 'https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime',
    dateChecked: '2026-08-31',
  } satisfies SourceDoc, // Taiwan — no dedicated page in the scrape; index page fallback
} as const;

export const BosniaSources = {
  AD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Andorra
  AE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Afghanistan
  AG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Albania
  AM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Armenia
  AO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Angola
  AR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Argentina
  AT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Austria
  AU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Australia
  AZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Azerbaijan
  BB: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Barbados
  BD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bangladesh
  BE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Belgium
  BF: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bulgaria
  BH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bahrain
  BI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Burundi
  BJ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Benin
  BN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Brunei
  BO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bolivia
  BR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Brazil
  BS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bahamas
  BT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bhutan
  BW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Botswana
  BY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Belarus
  BZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Belize
  CA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Canada
  CD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Congo (Democratic Republic)
  CF: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Central African Republic
  CG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Congo
  CH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Switzerland
  CI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cote d'Ivoire
  CL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Chile
  CM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cameroon
  CN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // China
  CO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Colombia
  CR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Costa Rica
  CU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cuba
  CV: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cabo Verde
  CY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cyprus
  CZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Czech Republic
  DE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Germany
  DJ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Djibouti
  DK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Denmark
  DM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Dominica
  DO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Algeria
  EC: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ecuador
  EE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Estonia
  EG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Egypt
  ER: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Eritrea
  ES: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Spain
  ET: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ethiopia
  FI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Finland
  FJ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Fiji
  FM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Micronesia
  FR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // France
  GA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Gabon
  GB: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United Kingdom
  GD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Grenada
  GE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Georgia
  GH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ghana
  GM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Gambia
  GN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guinea
  GQ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Equatorial Guinea
  GR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Greece
  GT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guatemala
  GW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guyana
  HN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Honduras
  HR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Croatia
  HT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Haiti
  HU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Hungary
  ID: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Indonesia
  IE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ireland
  IL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Israel
  IN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // India
  IQ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Iraq
  IR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Iran
  IS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Iceland
  IT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Italy
  JM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Jamaica
  JO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Jordan
  JP: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Japan
  KE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kenya
  KG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cambodia
  KI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kiribati
  KM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Comoros
  KN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Korea (North)
  KR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Korea (South)
  KW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kuwait
  KZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kazakhstan
  LA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Laos
  LB: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Lebanon
  LC: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Liberia
  LS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Lesotho
  LT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Lithuania
  LU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Luxembourg
  LV: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Latvia
  LY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Libya
  MA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Morocco
  MC: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Monaco
  MD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Moldova
  ME: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Montenegro
  MG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Madagascar
  MH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Marshall Islands
  MK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // North Macedonia
  ML: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mali
  MM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Myanmar
  MN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mongolia
  MR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mauritania
  MT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malta
  MU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mauritius
  MV: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Maldives
  MW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malawi
  MX: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mexico
  MY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malaysia
  MZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mozambique
  NA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Namibia
  NE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Niger
  NG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nigeria
  NI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nicaragua
  NL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Netherlands
  NO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Norway
  NP: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nepal
  NR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nauru
  NZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // New Zealand
  OM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Oman
  PA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Panama
  PE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Peru
  PG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Papua New Guinea
  PH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Philippines
  PK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Pakistan
  PL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Poland
  PS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Palestine
  PT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Portugal
  PW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Palau
  PY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Paraguay
  QA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Qatar
  RO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Romania
  RS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Serbia
  RU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Russia
  RW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Rwanda
  SA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Seychelles
  SD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sudan
  SE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sweden
  SG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Singapore
  SI: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Slovenia
  SK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Slovakia
  SL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // San Marino
  SN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Senegal
  SO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Somalia
  SR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Suriname
  ST: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // El Salvador
  SY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Syria
  SZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Eswatini
  TD: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Chad
  TG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Togo
  TH: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Thailand
  TJ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tajikistan
  TL: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Timor-Leste
  TM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tunisia
  TO: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tonga
  TR: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Turkiye
  TT: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tuvalu
  TW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // TW
  TZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tanzania
  UA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ukraine
  UG: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Uganda
  US: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United States
  UY: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Uruguay
  UZ: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Holy See (Vatican)
  VC: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Venezuela
  VN: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Vietnam
  VU: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Vanuatu
  WS: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Samoa
  XK: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // XK
  YE: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Yemen
  ZA: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // South Africa
  ZM: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Zambia
  ZW: {
    directUrl: 'https://www.mvp.gov.ba/en/vize',
    parentUrl: 'https://www.mvp.gov.ba/en/vize',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Kosovo ───────────────────────────────────────

/**
 * Government of Kosovo — Ministry of Foreign Affairs and Diaspora.
 * "Visa regime for foreign citizens" — single index page listing all
 * visa-exempt nationalities. No stable per-country subpages exist on this
 * site (unlike Montenegro/Serbia), so every entry below cites the same
 * single page for both directUrl and parentUrl — same policy as
 * BosniaSources, adopted here for the same reason (only one page exists).
 * Verified live 2026-09-04.
 */
export const KosovoSources = {
  AD: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Andorra
  AE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United Arab Emirates
  AG: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Albania
  AR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Argentina
  AT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Austria
  AU: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Australia
  BB: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Barbados
  BE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Belgium
  BG: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bulgaria
  BH: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bahrain
  BN: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Brunei
  BR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Brazil
  BS: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Bahamas
  BW: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Botswana
  BZ: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Belize
  CA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Canada
  CH: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Switzerland
  CL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Chile
  CO: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Colombia
  CR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Costa Rica
  CY: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Cyprus
  CZ: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Czech Republic
  DE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Germany
  DK: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Denmark
  DM: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Dominica
  EE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Estonia
  ES: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Spain
  FI: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Finland
  FJ: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Fiji
  FM: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Micronesia
  FR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // France
  GB: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United Kingdom
  GD: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Grenada
  GR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Greece
  GT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guatemala
  GY: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Guyana
  HN: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Honduras
  HR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Croatia
  HU: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Hungary
  IE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Ireland
  IL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Israel
  IS: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Iceland
  IT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Italy
  JO: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Jordan
  JP: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Japan
  KI: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kiribati
  KN: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Korea (South)
  KW: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Kuwait
  LC: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Liechtenstein
  LS: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Lesotho
  LT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Lithuania
  LU: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Luxembourg
  LV: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Latvia
  MC: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Monaco
  ME: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Montenegro
  MH: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Marshall Islands
  MK: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // North Macedonia
  MT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malta
  MU: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mauritius
  MV: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Maldives
  MW: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malawi
  MX: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Mexico
  MY: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Malaysia
  NA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Namibia
  NI: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nicaragua
  NL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Netherlands
  NO: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Norway
  NR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Nauru
  NZ: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // New Zealand
  OM: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Oman
  PA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Panama
  PG: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Papua New Guinea
  PL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Poland
  PT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Portugal
  PW: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Palau
  PY: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Paraguay
  QA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Qatar
  RO: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Romania
  RS: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Serbia
  SA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Seychelles
  SE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sweden
  SK: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Slovakia
  SM: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // San Marino
  ST: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // El Salvador
  SZ: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Eswatini
  TL: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Timor-Leste
  TO: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tonga
  TR: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Turkey
  TT: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Tuvalu
  US: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // United States
  UY: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Uruguay
  VA: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Vatican City
  VC: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Venezuela
  VU: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Vanuatu
  WS: {
    directUrl: 'https://ambasadat.net/visas/',
    parentUrl: 'https://ambasadat.net/visas/',
    dateChecked: '2026-09-04',
  } satisfies SourceDoc, // Samoa
} as const;
