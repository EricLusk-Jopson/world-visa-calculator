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
 * import { SchengenSources, UKSources, IrelandSources, TurkiyeSources } from '@/data/sources';
 *
 * const allRegions = { SchengenSources, UKSources, IrelandSources, TurkiyeSources };
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
 * Last updated: 2026-05-27
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
