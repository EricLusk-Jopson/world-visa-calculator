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
 * ── Source verification pipeline ──────────────────────────────────────────────
 *
 * `SourceRegions` at the bottom of this file lists every region for the
 * pipeline in pipeline/ (link health + content diffing). Each region has a
 * `checkLinks` flag; each link has `checkDiff`. See pipeline/README.md.
 *
 * ── Maintenance ───────────────────────────────────────────────────────────────
 *
 * `dateChecked` records when the content was last verified as accurate, not
 * merely that the URL resolved. Update it when you confirm data is current.
 *
 * The PDF property in SchengenSources (atvSpecific) is higher breakage risk —
 * DG HOME rotates document URLs. The parent link is the stable fallback.
 *
 * Last updated: 2026-09-04
 */

import type { SourceDoc, SourceRegion } from "@/types";

// ─── Schengen ─────────────────────────────────────────────────────────────────

export const SchengenSources = {
  /**
   * EU Regulation 2018/1806 (consolidated to 2025-12-30).
   * Annex I = visa-required list. Annex II = visa-free list.
   * Primary source for all Schengen passport access categories and footnotes.
   */
  visaList: {
    direct: {
      url:
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230",
      type: "direct",
      checkDiff: false, // EUR-Lex page is health-checked; its Cellar copy is diffed
      alternate: {
        url:
          "https://publications.europa.eu/resource/celex/02018R1806-20251230",
        type: "machine",
        checkDiff: true,
      },
    },
    parent: {
      url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-08",
  } satisfies SourceDoc,

  /**
   * Schengen Visa Code (Regulation EC 810/2009) Annex IV.
   * Common (EU-wide) Airport Transit Visa list — nationals require an ATV
   * to transit the international zone of any Schengen airport without entering.
   */
  atvCommon: {
    direct: {
      url:
        "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629",
      type: "direct",
      checkDiff: false, // EUR-Lex page is health-checked; its Cellar copy is diffed
      alternate: {
        url:
          "https://publications.europa.eu/resource/celex/02009R0810-20200202",
        type: "machine",
        checkDiff: true,
      },
    },
    parent: {
      url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-08",
  } satisfies SourceDoc,

  /**
   * Visa Code Handbook Annex 7B (PDF).
   * Member-state-specific ATV requirements — documents which individual
   * Schengen states impose an ATV requirement beyond the common Annex IV list.
   * NOTE: PDF link — DG HOME occasionally rotates document URLs.
   * Use parent link as the stable fallback for manual navigation.
   */
  atvSpecific: {
    direct: {
      url:
        "https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-08",
  } satisfies SourceDoc,

  /**
   * EU ETIAS application portal.
   * End-user application URL for the European Travel Information and
   * Authorisation System. Checked for liveness — content verification
   * is not applicable until ETIAS launches.
   */
  etias: {
    direct: {
      url: "https://travel-europe.europa.eu/en/etias",
      type: "direct",
      checkDiff: false, // page is rendered client-side; plain fetches get no text
    },
    parent: {
      url: "https://travel-europe.europa.eu/pub",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
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
    direct: {
      url: "https://www.gov.uk/standard-visitor",
      type: "direct",
      checkDiff: false, // content is guidance, not a statutory rule
    },
    parent: {
      url:
        "https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
  } satisfies SourceDoc,

  /**
   * UK Immigration Rules — Appendix Visitor: Visa National List.
   * Statutory list of nationalities required to obtain a Standard Visitor
   * Visa before travelling to the UK.
   */
  visaNationalList: {
    direct: {
      url:
        "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url: "https://www.gov.uk/guidance/immigration-rules",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
  } satisfies SourceDoc,

  /**
   * UK Immigration Rules — Appendix ETA National List.
   * Statutory list of nationalities eligible (and required) to obtain an
   * Electronic Travel Authorisation before travelling to the UK.
   */
  etaNationalList: {
    direct: {
      url:
        "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url: "https://www.gov.uk/eta",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
  } satisfies SourceDoc,

  /**
   * GOV.UK — UK visa requirements list for international carriers.
   * Accessible HTML version of the carriers PDF — stable URL, updated in place.
   * Lists both visa nationals and DATV nationals.
   */
  carriersList: {
    direct: {
      url:
        "https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url:
        "https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
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
    direct: {
      url: "https://www.gov.uk/eta/apply",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url: "https://www.gov.uk/eta",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
  } satisfies SourceDoc,

  ctaGuidance: {
    direct: {
      url:
        "https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url:
        "https://www.gov.uk/government/publications/common-travel-area-guidance",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-04-14",
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
    direct: {
      url:
        "https://www.irishimmigration.ie/visa-non-visa-required-nationalities/",
      type: "direct",
      // The table on this page is filled in by an AJAX call, so a plain
      // fetch can't see it. (The ISD's other nationalities page,
      // /immigration-service-delivery-visa-and-non-visa-required-nationalities/,
      // is password-protected, so it can't stand in.) Needs the AJAX data
      // URL as a machine alternate to be diffed.
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/coming-to-visit-ireland/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  /**
   * INIS — EU/EEA/Swiss free movement rights in Ireland.
   * Source for EEA free movement basis and the Swiss bilateral agreement.
   */
  euFreeMovement: {
    direct: {
      url:
        "https://www.irishimmigration.ie/at-the-border/entry-for-eu-eea-and-swiss-citizens/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/coming-to-live-in-ireland/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  /**
   * INIS — Common Travel Area guidance for Ireland.
   * Source for British citizen rights in Ireland under the CTA.
   */
  ctaGuidance: {
    direct: {
      url: "https://www.irishimmigration.ie/at-the-border/common-travel-area/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/coming-to-visit-ireland/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  /**
   * INIS — British-Irish Visa Scheme (BIVS).
   * Source for the BIVS exception: Indian and Chinese nationals holding a
   * valid BIVS-endorsed UK visa may enter Ireland without a separate Irish
   * visa. The scheme is bidirectional — an Irish C visa also permits UK entry.
   */
  bivs: {
    direct: {
      url:
        "https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/coming-to-visit-ireland/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  /**
   * ISD — Short Stay Visa Waiver Programme (SSVWP).
   * Source for the SSVWP note: holders of a valid UK short-stay visa may
   * enter Ireland without a separate Irish visa. Replaces citizensinformation.ie,
   * which refuses automated clients (HTTP 403) so could never be verified.
   */
  ssvwp: {
    direct: {
      url:
        "https://www.irishimmigration.ie/coming-to-visit-ireland/short-stay-visa-waiver-programme/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/coming-to-visit-ireland/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-10-08",
  } satisfies SourceDoc,

  /**
   * ISD — Transit (including Transfer Visa) Advice.
   * Source for the transit visa note: nationals listed in Schedule 5 of
   * S.I. No. 473 of 2014 need an Irish transit visa to pass through an
   * Irish port. Replaces citizensinformation.ie (see ssvwp).
   */
  transitVisa: {
    direct: {
      url:
        "https://www.irishimmigration.ie/at-the-border/transit-including-transfer-visa-advice/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishimmigration.ie/at-the-border/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-10-08",
  } satisfies SourceDoc,

  /**
   * Irish Statute Book — S.I. No. 473 of 2014.
   * The statutory instrument defining Ireland's visa category schedules
   * (Schedules 1–5). Legal ground truth underlying the INIS nationality table.
   *
   * The direct link is the Order as made in 2014; it is not consolidated, so
   * amendments (e.g. the (No. 2) Order 2026 moving Nicaragua, Saint Kitts and
   * Nevis and Saint Lucia to Schedule 5) never appear there. The parent is a
   * title search that lists each "Immigration Act 2004 (Visas) (Amendment)"
   * Order as it's made, for people to follow. Its results load client-side,
   * so neither link is diffed yet.
   */
  statutoryInstrument: {
    direct: {
      url: "https://www.irishstatutebook.ie/eli/2014/si/473/made/en/print",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.irishstatutebook.ie/eli/ResultsTitle.html?q=Immigration+Act",
      type: "parent",
      // The search results are loaded client-side (the fetched HTML is only
      // page chrome), so this is health-checked only. Diffing it needs the
      // results' AJAX data URL as a machine alternate. (The ISD's
      // /immigration-legislation-and-policy-guidelines/ page was tried and
      // doesn't list S.I. 473/2014 or its amendments.)
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
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
    direct: {
      url: "https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mfa.gov.tr/consular-info.en.mfa",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
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
    direct: {
      url: "https://www.evisa.gov.tr/en/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.evisa.gov.tr",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  eVisaEligible: {
    direct: {
      url: "https://www.evisa.gov.tr/en/info/who-is-eligible-for-e-visa/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.evisa.gov.tr",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,
} as const;

// ─── Montenegro ────────────────────────────────────

/**
 * Government of Montenegro — Ministry of Foreign Affairs.
 * "Embassies and consulates of Montenegro and visa regimes for foreign citizens".
 * One entry per nationality's dedicated page on this site, keyed by ISO Alpha-2
 * code. Every entry shares the same parent link (the index page); direct link is the
 * nationality-specific page. Verified live 2026-08-30 (index page + spot-checked
 * CA directly; remaining direct links follow the confirmed URL pattern but were
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
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/afghanistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Afghanistan
  AL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/albania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Albania
  DZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/algeria",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Algeria
  AD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/andorra",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Andorra
  AO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/angola",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Angola
  AG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/antigua-and-barbuda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/argentina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Argentina
  AM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/armenia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Armenia
  AW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/aruba",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Aruba
  AU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/australia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Australia
  AT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/austria",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Austria
  AZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/azerbaijan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahamas",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bahamas
  BH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahrain",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bahrain
  BD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bangladesh",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bangladesh
  BB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/barbados",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Barbados
  BY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belarus",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belarus
  BE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belgium",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belgium
  BZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belize
  BJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/benin",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Benin
  BT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bhutan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bhutan
  BO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bolivia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bolivia
  BA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bosnia-and-herzegovina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/botswana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Botswana
  BR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brazil",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Brazil
  BN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brunei",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Brunei
  BG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bulgaria",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bulgaria
  BF: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burkina-faso",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burundi",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Burundi
  CV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cabo-verde",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cambodia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cambodia
  CM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cameroon",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cameroon
  CA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/canada",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Canada
  KY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cayman-islands",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cayman Islands
  CF: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/central-african-republic",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Central African Republic
  TD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chad",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Chad
  CL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chile",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Chile
  CN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/china",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/colombia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Colombia
  CD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-democratic-republic-of-the",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Congo, Democratic Republic of the
  CG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-republic",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/costa-rica",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Costa Rica
  HR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/croatia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Croatia
  CU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cuba",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cyprus",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/czech-republic",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Czech Republic
  DK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/denmark",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Denmark
  DJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/djibouti",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Djibouti
  DM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominica",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominican-republic",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ecuador",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ecuador
  EG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/egypt",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Egypt
  SV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/el-salvador",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // El Salvador
  GQ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/equatorial-guinea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/eritrea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Eritrea
  EE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/estonia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Estonia
  ET: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ethiopia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/fiji",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Fiji
  FI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/finland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Finland
  FR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/france",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gabon",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Gabon
  GM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gambia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Gambia
  GE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/georgia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Georgia
  DE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/germany",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Germany
  GH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ghana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ghana
  GR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/greece",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Greece
  GD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/grenada",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Grenada
  GT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guatemala",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guatemala
  GN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guinea
  GW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea-bissau",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guyana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guyana
  HT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/haiti",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Haiti
  VA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/holy-see-and-sovereign-military-order-of-malta",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Holy See and Sovereign Military Order of Malta
  HN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/honduras",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Honduras
  HU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/hungary",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Hungary
  IS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iceland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iceland
  IN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/india",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // India
  ID: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/indonesia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Indonesia
  IR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iran",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iran
  IQ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iraq",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iraq
  IE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ireland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/israel",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Israel
  IT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/italy",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Italy
  CI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ivory-coast-cote-divoire",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ivory Coast (Côte d'Ivoire)
  JM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jamaica",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Jamaica
  JP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/japan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Japan
  JO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jordan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Jordan
  KZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kazakhstan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kenya",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kenya
  KI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kiribati",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kiribati
  KP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-democratic-peoples-republic-of-north-korea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Korea, Democratic People's Republic of (North Korea)
  KR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-republic-of-south-korea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Korea, Republic of (South Korea)
  XK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kosovo",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kosovo
  KW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kuwait",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kuwait
  KG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kyrgyzstan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kyrgyzstan
  LA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/laos",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Laos
  LV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/latvia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Latvia
  LB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lebanon",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lebanon
  LS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lesotho",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lesotho
  LR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liberia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Liberia
  LY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/libya",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Libya
  LI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liechtenstein",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lithuania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/luxembourg",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Luxembourg
  MG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/madagascar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Madagascar
  MW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malawi",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malawi
  MY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malaysia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malaysia
  MV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/maldives",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Maldives
  ML: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mali",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mali
  MT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malta",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malta
  MH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/marshall-islands",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mauritania
  MU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritius",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mauritius
  MX: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mexico",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mexico
  FM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/micronesia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Micronesia
  MD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/moldova",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Moldova
  MC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/monaco",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Monaco
  MN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mongolia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mongolia
  MA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/morocco",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Morocco
  MZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mozambique",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mozambique
  MM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/myanmar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Myanmar
  NA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/namibia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Namibia
  NR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nauru",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nauru
  NP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nepal",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nepal
  NL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/netherlands",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Netherlands
  NZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/new-zealand",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // New Zealand
  NI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nicaragua",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nicaragua
  NE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/niger",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nigeria",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nigeria
  MK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/north-macedonia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // North Macedonia
  NO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/norway",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Norway
  OM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/oman",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Oman
  PK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/pakistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Pakistan
  PW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palau",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Palau
  PS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palestine",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Palestine
  PA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/panama",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Panama
  PG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/papua-new-guinea",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/paraguay",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Paraguay
  PE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/peru",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/philippines",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Philippines
  PL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/poland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/portugal",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Portugal
  QA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/qatar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/romania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Romania
  RU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/russian-federation",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Russian Federation
  RW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/rwanda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Rwanda
  KN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-kitts-and-nevis",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-lucia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-vincent-and-the-grenadines",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/samoa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Samoa
  SM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/san-marino",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // San Marino
  ST: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sao-tome-and-principe-2",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saudi-arabia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/senegal",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Senegal
  RS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/serbia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Serbia
  SC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/seychelles",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Seychelles
  SL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sierra-leone",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/singapore",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Singapore
  SK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovakia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Slovakia
  SI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovenia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Slovenia
  SB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/solomon-islands",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/somalia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Somalia
  ZA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/south-africa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // South Africa
  ES: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/spain",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Spain
  LK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sri-lanka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sudan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sudan
  SR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/suriname",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Suriname
  SZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/swaziland-eswatini",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Swaziland (Eswatini)
  SE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sweden",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sweden
  CH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/switzerland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Switzerland
  SY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/syria",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Syria
  TJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tajikistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tanzania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tanzania
  TH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/thailand",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Thailand
  TL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/timor-leste",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/togo",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Togo
  TO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tonga",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tonga
  TT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/trinidad-and-tobago",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tunisia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkey",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Turkey
  TM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkmenistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tuvalu",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tuvalu
  UG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uganda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uganda
  UA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ukraine",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ukraine
  KM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/union-of-the-comoros-and-swatziland-in-eswatini",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Union of the Comoros and Swaziland in Eswatini
  AE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-arab-emirates",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-kingdom-of-great-britain-and-northern-ireland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United Kingdom of Great Britain and Northern Ireland
  US: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-states-of-america",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United States of America
  UY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uruguay",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uzbekistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vanuatu",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Vanuatu
  VE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/venezuela",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vietnam",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Vietnam
  YE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/yemen",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Yemen
  ZM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zambia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zimbabwe",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-30",
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
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/avganistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Afghanistan
  AL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/albanija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Albania
  DZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/alzir",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Algeria
  AD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/andora",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Andorra
  AO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/angola",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Angola
  AG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/antigva-i-barbuda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/argentina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Argentina
  AM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jermenija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Armenia
  AU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/australija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Australia
  AT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/austrija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Austria
  AZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/azerbejdzan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahami",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bahamas
  BH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahrein",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bahrain
  BD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/banglades",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bangladesh
  BB: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/barbados",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Barbados
  BY: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belorusija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belarus
  BE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belgija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belgium
  BZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belize
  BJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/benin",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Benin
  BT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/butan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bhutan
  BO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bolivija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bolivia
  BA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bosna-i-hercegovina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bocvana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Botswana
  BR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brazil",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Brazil
  BN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brunej-darusalam",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Brunei Darussalam
  BG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bugarska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bulgaria
  BF: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burkina-faso",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burundi",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Burundi
  CV: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kabo-verde",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kambodza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cambodia
  CM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kamerun",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cameroon
  CA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kanada",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Canada
  CF: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/centralnoafricka-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Central African Republic
  TD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cad",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Chad
  CL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cile",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Chile
  CN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kolumbija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Colombia
  CD: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-demokratska-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Congo, Democratic Republic
  CG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kostarika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Costa Rica
  CI: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kot-d-ivoar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cote d’Ivoire
  HR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/hrvatska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Croatia
  CU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuba",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kipar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ceska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Czech Republic
  DK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/danska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Denmark
  DJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dzibuti",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Djibouti
  DM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominikanska-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvador",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ecuador
  EG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/egipat",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Egypt
  SV: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/el-salvador",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // El Salvador
  GQ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvatorijalna-gvineja",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/eritreja",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Eritrea
  EE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/estonija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Estonia
  SZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/esvatini",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Eswatini
  ET: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/etiopija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/fidzi",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Fiji
  FI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/finska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Finland
  FR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/francuska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gabon",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Gabon
  GM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gambija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Gambia
  GE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gruzija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Georgia
  DE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nemacka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Germany
  GH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ghana
  GR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grcka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Greece
  GD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grenada",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Grenada
  GT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvatemala",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guatemala
  GN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guinea
  GW: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-bisao",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvajana",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guyana
  HT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/haiti",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Haiti
  VA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-stolica",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Holy See
  HN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/honduras",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Honduras
  HU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madjarska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Hungary
  IS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/island",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iceland
  IN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // India
  ID: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indonezija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Indonesia
  IR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/iran",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iran
  IQ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irak",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iraq
  IE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/izrael",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Israel
  IT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/italija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jamajka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Jamaica
  JP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/japan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Japan
  JO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jordan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Jordan
  KZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kazahstan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kenija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kenya
  KI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kiribati",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kiribati
  KP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/korea-dpr",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Korea, DPR
  KR: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/koreja-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Korea, Republic
  KW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuvajt",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kuwait
  KG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kirgiska-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kyrgyzstan, Republic
  LA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/laos",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Laos
  LV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/letonija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Latvia
  LB: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liban",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lebanon
  LS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lesoto",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lesotho
  LR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liberija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Liberia
  LY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/libija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Libya
  LI: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lihtenstajn",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/litvanija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/luksemburg",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Luxembourg
  MG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Madagascar
  MW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malavi",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malawi
  MY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malezija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malaysia
  MV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maldives",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Maldives
  ML: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mali",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mali
  MT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malta",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malta
  MH: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/marshall-islands",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritania",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mauritania
  MU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritius",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mauritius
  MX: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/meksiko",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mexico
  FM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/micronesia",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Micronesia
  MD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/moldavija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Moldova
  MC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/monako",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Monaco
  MN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mongolija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mongolia
  ME: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/crna-gora",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Montenegro
  MA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maroko",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Morocco
  MZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mozambik",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mozambique
  MM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mjanmar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Myanmar
  NA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/namibija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Namibia
  NR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nauru",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nauru
  NP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nepal",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nepal
  NL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/holandija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Netherlands
  NZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/novi-zeland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // New Zealand
  NI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nikaragva",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nicaragua
  NE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/niger",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nigerija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nigeria
  MK: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/severna-makedonija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // North Macedonia
  NO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/norveska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Norway
  OM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/oman",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Oman
  PK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/pakistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Pakistan
  PW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palau",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Palau
  PS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palestina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Palestine
  PA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/panama",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Panama
  PG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/papua-nova-gvineja",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/paragvaj",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Paraguay
  PE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/peru",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/filipini",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Philippines
  PL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/poljska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/portugalija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Portugal
  QA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/katar",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/rumunija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Romania
  RU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruska-federacija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruanda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Rwanda
  KN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sent-kits-i-nevis",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-lucija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveti-vinsent-i-grenadini",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/samoa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Samoa
  SM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/san-marino",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // San Marino
  ST: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sao-tome-i-prinsipe",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/saudijska-arabija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/senegal",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Senegal
  SC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sejseli",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Seychelles
  SL: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sijera-leone",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/singapur",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Singapore
  SK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovacka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Slovakia
  SI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovenija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Slovenia
  SB: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/solomonova-ostrva",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/somalija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Somalia
  ZA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzna-afrika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // South Africa
  SS: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzni-sudan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // South Sudan
  ES: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/spanija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Spain
  LK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sri-lanka",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sudan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sudan
  SR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/surinam",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Suriname
  SE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svedska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sweden
  CH: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svajcarska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Switzerland
  SY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sirija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Syria, Arab Republic
  TJ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tadzikistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tanzanija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tanzania
  TH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tajland",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Thailand
  TL: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/istocni-timor",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/togo",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Togo
  TO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tonga",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tonga
  TT: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/trinidad-i-tobago",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tunis",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turska",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Turkiye
  TM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turkmenistan",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tuvalu",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tuvalu
  UG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uganda",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uganda
  UA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ukrajina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ukraine
  KM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/unija-komora",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Union of the Comoros
  AE: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeni-arapski-emirati",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeno-kraljevstvo",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United Kingdom
  US: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sjedinjene-americke-drzave",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United States
  UY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/urugvaj",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uzbekistan-republika",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vanuatu",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Vanuatu
  VE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/venecuela",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vijetnam",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Vietnam
  YE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jemen",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Yemen
  ZM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zambija",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zimbabve",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Zimbabwe
  HK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Hong Kong SAR — sub-row on China's page, no dedicated page
  MO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Macao SAR — sub-row on China's page, no dedicated page
  TW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Taiwan — no dedicated page in the scrape; index page fallback
} as const;

export const BosniaSources = {
  AD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Albania
  AM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Azerbaijan
  BB: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burundi
  BJ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei
  BO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bhutan
  BW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo (Democratic Republic)
  CF: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Central African Republic
  CG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cote d'Ivoire
  CL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cuba
  CV: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cabo Verde
  CY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czech Republic
  DE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DJ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Djibouti
  DK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Micronesia
  FR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Grenada
  GE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ghana
  GM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gambia
  GN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea
  GQ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Equatorial Guinea
  GR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // India
  IQ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cambodia
  KI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kiribati
  KM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Comoros
  KN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (North)
  KR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (South)
  KW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kazakhstan
  LA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Laos
  LB: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lebanon
  LC: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Madagascar
  MH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Marshall Islands
  MK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Macedonia
  ML: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mali
  MM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Myanmar
  MN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mongolia
  MR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nepal
  NR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nauru
  NZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Peru
  PG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Papua New Guinea
  PH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palestine
  PT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palau
  PY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Suriname
  ST: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Syria
  SZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eswatini
  TD: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chad
  TG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tajikistan
  TL: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Timor-Leste
  TM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tunisia
  TO: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tonga
  TR: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkiye
  TT: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tuvalu
  TW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // TW
  TZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tanzania
  UA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United States
  UY: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Holy See (Vatican)
  VC: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vietnam
  VU: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vanuatu
  WS: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Samoa
  XK: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // XK
  YE: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mvp.gov.ba/en/vize",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Kosovo ───────────────────────────────────────

/**
 * Government of Kosovo — Ministry of Foreign Affairs and Diaspora.
 * "Visa regime for foreign citizens" — single index page listing all
 * visa-exempt nationalities. No stable per-country subpages exist on this
 * site (unlike Montenegro/Serbia), so every entry below cites the same
 * single page for both direct link and parent link — same policy as
 * BosniaSources, adopted here for the same reason (only one page exists).
 * Verified live 2026-09-04.
 */
export const KosovoSources = {
  AD: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AG: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Albania
  AR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  BB: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BG: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BN: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei
  BR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BW: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BZ: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CH: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CO: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CY: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czech Republic
  DE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DK: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DM: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominica
  EE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  ES: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  FI: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FM: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Micronesia
  FR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GB: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GD: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Grenada
  GR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GY: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HN: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HU: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  IE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IS: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JO: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KI: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kiribati
  KN: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (South)
  KW: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  LC: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LS: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  MC: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  ME: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MH: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Marshall Islands
  MK: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Macedonia
  MT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  NA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NI: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nauru
  NZ: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PG: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Papua New Guinea
  PL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PW: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palau
  PY: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  SA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SK: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SM: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  ST: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SZ: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eswatini
  TL: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Timor-Leste
  TO: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tonga
  TR: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkey
  TT: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tuvalu
  US: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United States
  UY: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  VA: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vatican City
  VC: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela
  VU: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vanuatu
  WS: {
    direct: {
      url: "https://ambasadat.net/visas/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://ambasadat.net/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Samoa
} as const;

// ─── North Macedonia ──────────────────────────────────────────────────────────

export const NorthMacedoniaSources = {
  AD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Albania
  AM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Azerbaijan
  BA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bosnia and Hercegovina
  BB: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burundi
  BJ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei Darussalam
  BO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bhutan
  BW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // DR of the Congo
  CF: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Central African Republic
  CG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Côte D'Ivoire
  CL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cuba
  CV: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cabo Verde
  CY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czechia
  DE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DJ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Djibouti
  DK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Micronesia - Federated States of
  FR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Grenada
  GE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ghana
  GM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gambia
  GN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea
  GQ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Equatorial Guinea
  GR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea Bissau
  GY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hong Kong (SAR)
  HN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // India
  IQ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cambodia
  KI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kiribati
  KM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Comoros
  KN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Korea
  KR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Republic of Korea
  KW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kazakhstan
  LA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lao People’s Democratic Republic
  LB: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lebanon
  LC: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Madagascar
  MH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Marshall Islands
  ML: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mali
  MM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Myanmar
  MN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mongolia
  MO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Macao (SAR)
  MR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nepal
  NR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nauru
  NZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Peru
  PG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Papua New Guinea
  PH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palau
  PY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Suriname
  SS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Sudan
  ST: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Syrian Arab Republic
  SZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eswatini
  TD: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chad
  TG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tajikistan
  TL: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Timor-Leste
  TM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tunizi
  TO: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tonga
  TR: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkey
  TT: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tuvalu
  TW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Taiwan
  TZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Republic of Tanzania
  UA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // USA
  UY: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vatican City
  VC: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela, Bolivarian Republic of
  VN: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vietnam
  VU: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vanuatu
  WS: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Samoa
  XK: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kosovo
  YE: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Albania ──────────────────────────────────────────────────────────────────

export const AlbaniaSources = {
  AD: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Azerbaijan
  BA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BB: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BJ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei
  BO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cote d'Ivoire
  CL: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czech Republic
  DE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ghana
  GN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea
  GR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hong Kong (SAR)
  HN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // India
  IQ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cambodia
  KN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (North)
  KR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (South)
  KW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kazakhstan
  LB: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lebanon
  LI: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Madagascar
  MK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Macedonia
  ML: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mali
  MN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mongolia
  MO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Macao (SAR)
  MR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nepal
  NZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PS: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palestine
  PT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SC: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Suriname
  ST: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Syria
  TG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tajikistan
  TM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkey
  TT: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Taiwan
  TZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tanzania
  UA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United States
  UY: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vatican City
  VE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vietnam
  XK: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kosovo
  YE: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url:
        "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Cyprus ───────────────────────────────────────────────────────────────────

export const CyprusSources = {
  /**
   * EU Regulation (EU) 2018/1806 Annex I (visa-required) / Annex II
   * (visa-exempt), as implemented by Cyprus for its own external border —
   * Cyprus is an EU member state but not (yet) a Schengen-implementing
   * state, so it applies this same EU-wide list independently rather than
   * via Schengen's common visa. Primary citation is the EU Annex 1 PDF;
   * gov.cy is the Cypriot government's own parent page on the same policy.
   */
  visaList: {
    direct: {
      url:
        "https://home-affairs.ec.europa.eu/document/download/ebd6113d-4d14-4ac2-ac9b-47f2e7976515_en?filename=Annex%201_en.pdf",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.gov.cy/en/information/visas/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-09",
  } satisfies SourceDoc,
} as const;

// ─── Belarus ──────────────────────────────────────────────────────────────────

export const BelarusSources = {
  /**
   * General visa-regime page — nationalities requiring a Belarusian visa.
   * Cited as the default/fallback rule's source (see belarus.ts).
   */
  general: {
    direct: {
      url: "https://mfa.gov.by/en/visa/general/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.by/en/visa/general/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-12",
  } satisfies SourceDoc,

  /**
   * "Visa-free entry through any border" list for 38 European countries —
   * a temporary (through 31 December 2026) any-border override, better
   * than the airport-only fallback below. Most get 30 days per visit;
   * Poland, Latvia, and Lithuania get 90.
   */
  europe: {
    direct: {
      url: "https://mfa.gov.by/en/visa/freemove/europe/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.by/en/visa/freemove/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-12",
  } satisfies SourceDoc,

  /**
   * Airport-only visa-free list — the stable, always-applicable fallback
   * (30 days per visit, six named airports only, max 90 days per calendar
   * year). Some entries there require another jurisdiction's visa to
   * actually use the exemption; those are modeled as visa_required instead
   * (see belarus.ts header for the product decision).
   */
  airport: {
    direct: {
      url: "https://mfa.gov.by/en/visa/freemove/airport/",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://mfa.gov.by/en/visa/freemove/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-12",
  } satisfies SourceDoc,
} as const;

// ─── Georgia ──────────────────────────────────────────────────────────────────

export const GeorgiaSources = {
  /**
   * Direct per-country visa-free duration list. The parent "entering
   * Georgia" overview page is cited as `parent` link. The underlying
   * legislation ("On Approval of the List of Countries Whose Citizens May
   * Enter Georgia without a Visa", matsne.gov.ge/en/document/view/2867361)
   * and the consulate's own list of qualifying citizens/stateless persons
   * (geoconsul.gov.ge/en/HtmlPage/html/View?id=25) are cited as code
   * comments in georgia.ts rather than as SourceDoc citations, per explicit
   * instruction.
   */
  visaList: {
    direct: {
      url: "https://geoconsul.gov.ge/en/entering-georgia-visa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://geoconsul.gov.ge/en/entering-georgia",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-13",
  } satisfies SourceDoc,
} as const;

// ─── Armenia ──────────────────────────────────────────────────────────────────

export const ArmeniaSources = {
  /**
   * List of countries whose citizens with all types of passports are
   * unilaterally exempt from Armenia's visa requirement — 180 days within
   * any 365-day period. Cited as the source for both the 45-country
   * unilateral list and the default/fallback rule (see armenia.ts).
   */
  visaFreeList: {
    direct: {
      url: "https://www.mfa.am/en/visafreelist",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mfa.am/en/visa/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-14",
  } satisfies SourceDoc,

  /**
   * Bilateral/multilateral visa-free agreements list. Only rows marked
   * "All types of passports" are modeled (diplomatic/service/official-only
   * rows grant nothing to an ordinary passport and are excluded — see
   * armenia.ts header).
   */
  bilateralList: {
    direct: {
      url: "https://www.mfa.am/en/whoneedvisa",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://www.mfa.am/en/visa/",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-09-14",
  } satisfies SourceDoc,
} as const;

// ─── Region registry ──────────────────────────────────────────────────────────

/**
 * Every region's sources, as checked by the source verification pipeline
 * (pipeline/). A region exported above must be listed here to be checked.
 *
 * `checkLinks: false` skips the region entirely — no link health, no content
 * diffing — to keep local runs fast while iterating on a subset. Run
 * `npm run check -- --all` in pipeline/ to check every region regardless;
 * the scheduled monthly workflow always does.
 */
export const SourceRegions = {
  Schengen: { sources: SchengenSources, checkLinks: true },
  UK: { sources: UKSources, checkLinks: true },
  Ireland: { sources: IrelandSources, checkLinks: true },
  Turkiye: { sources: TurkiyeSources, checkLinks: false },
  Montenegro: { sources: MontenegroSources, checkLinks: false },
  Serbia: { sources: SerbiaSources, checkLinks: false },
  Bosnia: { sources: BosniaSources, checkLinks: false },
  Kosovo: { sources: KosovoSources, checkLinks: false },
  NorthMacedonia: { sources: NorthMacedoniaSources, checkLinks: false },
  Albania: { sources: AlbaniaSources, checkLinks: false },
  Cyprus: { sources: CyprusSources, checkLinks: false },
  Belarus: { sources: BelarusSources, checkLinks: false },
  Georgia: { sources: GeorgiaSources, checkLinks: false },
  Armenia: { sources: ArmeniaSources, checkLinks: false },
} satisfies Record<string, SourceRegion>;
