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

import type { SourceDoc, SourceLink, SourceRegion } from "@/types";

// ─── Schengen ─────────────────────────────────────────────────────────────────

/**
 * EU Regulation 2018/1806 (consolidated to 2025-12-30) — the EU visa lists
 * (Annex I visa-required, Annex II visa-free). Defined once and shared by
 * SchengenSources.visaList and CyprusSources.visaList: Cyprus applies the
 * same EU list at its own border. The pipeline fetches and diffs each unique
 * URL once, so both regions report the same Cellar diff for no extra request.
 */
const euVisaListRegulation = {
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
} as const satisfies SourceLink;

export const SchengenSources = {
  /**
   * EU Regulation 2018/1806 (consolidated to 2025-12-30).
   * Annex I = visa-required list. Annex II = visa-free list.
   * Primary source for all Schengen passport access categories and footnotes.
   */
  visaList: {
    direct: euVisaListRegulation,
    parent: {
      url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,

  /**
   * Schengen Visa Code (Regulation EC 810/2009) Annex IV.
   * Common (EU-wide) Airport Transit Visa list — nationals require an ATV
   * to transit the international zone of any Schengen airport without entering.
   */
  atvCommon: {
    direct: {
      url:
        "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02009R0810-20240628",
      type: "direct",
      checkDiff: false, // EUR-Lex page is health-checked; its Cellar copy is diffed
      alternate: {
        url:
          "https://publications.europa.eu/resource/celex/02009R0810-20240628",
        type: "machine",
        checkDiff: true,
      },
    },
    parent: {
      url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,
} as const;

// ─── United Kingdom ───────────────────────────────────────────────────────────

export const UKSources = {
  /**
   * UK Immigration Rules — Appendix V: Visitor.
   * Statutory source for the 6-month per-visit allowance (V 17.2; the
   * appendix's introduction also says a Standard Visitor's stay is "usually
   * six months"), diffed like the other appendices. The GOV.UK Standard
   * Visitor guidance page is the readable parent; it gets copy edits too
   * often to be worth diffing.
   */
  standardVisitor: {
    direct: {
      url:
        "https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-v-visitor",
      type: "direct",
      checkDiff: true,
    },
    parent: {
      url: "https://www.gov.uk/standard-visitor",
      type: "parent",
      checkDiff: false, // guidance, not a statutory rule
    },
    dateChecked: "2026-10-20",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
    dateChecked: "2026-10-23",
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
   * so the Solr search API behind it is diffed as its machine alternate.
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
      // The search page loads its results client-side (the fetched HTML is
      // only page chrome), so it's health-checked and the Solr API it calls
      // is diffed: newest first, so a new amendment Order lands at the top.
      // omitHeader drops Solr's per-request timing; no json.wrf, so plain JSON.
      checkDiff: false,
      alternate: {
        url:
          "https://www.irishstatutebook.ie/solr/all_leg_title/select?q=immigration+act&wt=json&sort=year+desc&rows=20&omitHeader=true",
        type: "machine",
        checkDiff: true,
      },
    },
    dateChecked: "2026-10-08",
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
      checkDiff: true,
    },
    parent: {
      url: "https://www.mfa.gov.tr/consular-info.en.mfa",
      type: "parent",
      checkDiff: true,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,

  /**
   * Türkiye e-Visa application portal.
   * End-user application URL for the electronic visa system, linked from the
   * e-Visa rules (which cite mfaVisaInfo for the tiers). Health-checked only:
   * the country list is script-rendered inside the application form.
   * Valid for tourism and commercial purposes only.
   */
  eVisaApplication: {
    direct: {
      url: "https://evisa.gov.tr/en",
      type: "direct",
      checkDiff: false,
    },
    parent: {
      url: "https://evisa.gov.tr/en",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-05-27",
  } satisfies SourceDoc,
} as const;

// ─── Montenegro ────────────────────────────────────

/**
 * The index of Montenegro's per-nationality visa pages — the parent of every
 * MontenegroSources entry, defined once and shared. It's diffed so a page
 * added, removed or renamed on the index shows up as a link change; the
 * pipeline fetches and diffs each unique URL once, however many entries cite it.
 */
const montenegroIndex = {
  url: "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro",
  type: "parent",
  checkDiff: true,
} as const satisfies SourceLink;

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
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Afghanistan
  AL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/albania",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Albania
  DZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/algeria",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-10-15",
  } satisfies SourceDoc, // Algeria
  AD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/andorra",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Andorra
  AO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/angola",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Angola
  AG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/antigua-and-barbuda",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/argentina",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Argentina
  AM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/armenia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Armenia
  AW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/aruba",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Aruba
  AU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/australia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Australia
  AT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/austria",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Austria
  AZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/azerbaijan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahamas",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bahamas
  BH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bahrain",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bahrain
  BD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bangladesh",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bangladesh
  BB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/barbados",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Barbados
  BY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belarus",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belarus
  BE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belgium",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belgium
  BZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/belize",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Belize
  BJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/benin",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Benin
  BT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bhutan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bhutan
  BO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bolivia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bolivia
  BA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bosnia-and-herzegovina",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/botswana",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Botswana
  BR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brazil",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Brazil
  BN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/brunei",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Brunei
  BG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/bulgaria",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Bulgaria
  BF: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burkina-faso",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/burundi",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Burundi
  CV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cabo-verde",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cambodia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cambodia
  CM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cameroon",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cameroon
  CA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/canada",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Canada
  KY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cayman-islands",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cayman Islands
  CF: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/central-african-republic",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Central African Republic
  TD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chad",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Chad
  CL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/chile",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Chile
  CN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/china",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/colombia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Colombia
  CD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-democratic-republic-of-the",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Congo, Democratic Republic of the
  CG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/congo-republic",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/costa-rica",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Costa Rica
  HR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/croatia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Croatia
  CU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cuba",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/cyprus",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/czech-republic",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Czech Republic
  DK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/denmark",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Denmark
  DJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/djibouti",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Djibouti
  DM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominica",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/dominican-republic",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ecuador",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ecuador
  EG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/egypt",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Egypt
  SV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/el-salvador",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // El Salvador
  GQ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/equatorial-guinea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/eritrea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Eritrea
  EE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/estonia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Estonia
  ET: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ethiopia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/fiji",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Fiji
  FI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/finland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Finland
  FR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/france",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gabon",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Gabon
  GM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/gambia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Gambia
  GE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/georgia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Georgia
  DE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/germany",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Germany
  GH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ghana",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ghana
  GR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/greece",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Greece
  GD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/grenada",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Grenada
  GT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guatemala",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guatemala
  GN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guinea
  GW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guinea-bissau",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/guyana",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Guyana
  HT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/haiti",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Haiti
  VA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/holy-see-and-sovereign-military-order-of-malta",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Holy See and Sovereign Military Order of Malta
  HN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/honduras",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Honduras
  HU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/hungary",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Hungary
  IS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iceland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iceland
  IN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/india",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // India
  ID: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/indonesia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Indonesia
  IR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iran",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iran
  IQ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/iraq",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Iraq
  IE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ireland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/israel",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Israel
  IT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/italy",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Italy
  CI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ivory-coast-cote-divoire",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ivory Coast (Côte d'Ivoire)
  JM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jamaica",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Jamaica
  JP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/japan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Japan
  JO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/jordan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Jordan
  KZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kazakhstan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kenya",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kenya
  KI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kiribati",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kiribati
  KP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-democratic-peoples-republic-of-north-korea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Korea, Democratic People's Republic of (North Korea)
  KR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/korea-republic-of-south-korea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Korea, Republic of (South Korea)
  XK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kosovo",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kosovo
  KW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kuwait",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kuwait
  KG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/kyrgyzstan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Kyrgyzstan
  LA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/laos",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Laos
  LV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/latvia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Latvia
  LB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lebanon",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lebanon
  LS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lesotho",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lesotho
  LR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liberia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Liberia
  LY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/libya",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Libya
  LI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/liechtenstein",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/lithuania",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/luxembourg",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Luxembourg
  MG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/madagascar",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Madagascar
  MW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malawi",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malawi
  MY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malaysia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malaysia
  MV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/maldives",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Maldives
  ML: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mali",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mali
  MT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/malta",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Malta
  MH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/marshall-islands",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritania",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mauritania
  MU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mauritius",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mauritius
  MX: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mexico",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mexico
  FM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/micronesia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Micronesia
  MD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/moldova",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Moldova
  MC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/monaco",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Monaco
  MN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mongolia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mongolia
  MA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/morocco",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Morocco
  MZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/mozambique",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Mozambique
  MM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/myanmar",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Myanmar
  NA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/namibia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Namibia
  NR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nauru",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nauru
  NP: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nepal",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nepal
  NL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/netherlands",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Netherlands
  NZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/new-zealand",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // New Zealand
  NI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nicaragua",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nicaragua
  NE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/niger",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/nigeria",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Nigeria
  MK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/north-macedonia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // North Macedonia
  NO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/norway",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Norway
  OM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/oman",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Oman
  PK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/pakistan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Pakistan
  PW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palau",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Palau
  PS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/palestine",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Palestine
  PA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/panama",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Panama
  PG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/papua-new-guinea",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/paraguay",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Paraguay
  PE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/peru",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/philippines",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Philippines
  PL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/poland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/portugal",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Portugal
  QA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/qatar",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/romania",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Romania
  RU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/russian-federation",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Russian Federation
  RW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/rwanda",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Rwanda
  KN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-kitts-and-nevis",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-lucia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saint-vincent-and-the-grenadines",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/samoa",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Samoa
  SM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/san-marino",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // San Marino
  ST: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sao-tome-and-principe-2",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/saudi-arabia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/senegal",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Senegal
  RS: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/serbia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Serbia
  SC: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/seychelles",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Seychelles
  SL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sierra-leone",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/singapore",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Singapore
  SK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovakia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Slovakia
  SI: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/slovenia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Slovenia
  SB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/solomon-islands",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/somalia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Somalia
  ZA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/south-africa",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // South Africa
  ES: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/spain",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Spain
  LK: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sri-lanka",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sudan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sudan
  SR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/suriname",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Suriname
  SZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/swaziland-eswatini",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Swaziland (Eswatini)
  SE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/sweden",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Sweden
  CH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/switzerland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Switzerland
  SY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/syria",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Syria
  TJ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tajikistan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tanzania",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tanzania
  TH: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/thailand",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Thailand
  TL: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/timor-leste",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/togo",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Togo
  TO: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tonga",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tonga
  TT: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/trinidad-and-tobago",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tunisia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkey",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Turkey
  TM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/turkmenistan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/tuvalu",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Tuvalu
  UG: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uganda",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uganda
  UA: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/ukraine",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Ukraine
  KM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/union-of-the-comoros-and-swatziland-in-eswatini",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Union of the Comoros and Swaziland in Eswatini
  AE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-arab-emirates",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-kingdom-of-great-britain-and-northern-ireland",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United Kingdom of Great Britain and Northern Ireland
  US: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/united-states-of-america",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // United States of America
  UY: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uruguay",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/uzbekistan",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vanuatu",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Vanuatu
  VE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/venezuela",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/vietnam",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Vietnam
  YE: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/yemen",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Yemen
  ZM: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zambia",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url:
        "https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/zimbabwe",
      type: "direct",
      checkDiff: true,
    },
    parent: montenegroIndex,
    dateChecked: "2026-08-30",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Serbia ───────────────────────────────────────────────

/**
 * The index of Serbia's per-nationality "Visa regime" pages — the parent of
 * every SerbiaSources entry, defined once and shared. It's diffed so a page
 * added, removed or renamed on the index shows up as a link change; the
 * pipeline fetches and diffs each unique URL once, however many entries cite it.
 */
const serbiaIndex = {
  url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
  type: "parent",
  checkDiff: true,
} as const satisfies SourceLink;

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
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Afghanistan
  AL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/albanija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Albania
  DZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/alzir",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Algeria
  AD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/andora",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Andorra
  AO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/angola",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Angola
  AG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/antigva-i-barbuda",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Antigua and Barbuda
  AR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/argentina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Argentina
  AM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jermenija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Armenia
  AU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/australija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Australia
  AT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/austrija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Austria
  AZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/azerbejdzan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Azerbaijan
  BS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahami",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bahamas
  BH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bahrein",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bahrain
  BD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/banglades",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bangladesh
  BB: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/barbados",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Barbados
  BY: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belorusija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belarus
  BE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belgija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belgium
  BZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/belize",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Belize
  BJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/benin",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Benin
  BT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/butan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bhutan
  BO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bolivija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bolivia
  BA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bosna-i-hercegovina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bocvana",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Botswana
  BR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brazil",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Brazil
  BN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/brunej-darusalam",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Brunei Darussalam
  BG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/bugarska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Bulgaria
  BF: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burkina-faso",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Burkina Faso
  BI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/burundi",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Burundi
  CV: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kabo-verde",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cabo Verde
  KH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kambodza",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cambodia
  CM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kamerun",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cameroon
  CA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kanada",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Canada
  CF: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/centralnoafricka-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Central African Republic
  TD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cad",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Chad
  CL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/cile",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Chile
  CN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // China
  CO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kolumbija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Colombia
  CD: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-demokratska-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Congo, Democratic Republic
  CG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kongo-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Congo, Republic
  CR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kostarika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Costa Rica
  CI: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kot-d-ivoar",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cote d’Ivoire
  HR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/hrvatska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Croatia
  CU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuba",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kipar",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ceska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Czech Republic
  DK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/danska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Denmark
  DJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dzibuti",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Djibouti
  DM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/dominikanska-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Dominican Republic
  EC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvador",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ecuador
  EG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/egipat",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Egypt
  SV: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/el-salvador",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // El Salvador
  GQ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ekvatorijalna-gvineja",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Equatorial Guinea
  ER: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/eritreja",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Eritrea
  EE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/estonija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Estonia
  SZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/esvatini",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Eswatini
  ET: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/etiopija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ethiopia
  FJ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/fidzi",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Fiji
  FI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/finska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Finland
  FR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/francuska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // France
  GA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gabon",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Gabon
  GM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gambija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Gambia
  GE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gruzija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Georgia
  DE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nemacka",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Germany
  GH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gana",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ghana
  GR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grcka",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Greece
  GD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/grenada",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Grenada
  GT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvatemala",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guatemala
  GN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guinea
  GW: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvineja-bisao",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/gvajana",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Guyana
  HT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/haiti",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Haiti
  VA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-stolica",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Holy See
  HN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/honduras",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Honduras
  HU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madjarska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Hungary
  IS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/island",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iceland
  IN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // India
  ID: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/indonezija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Indonesia
  IR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/iran",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iran
  IQ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irak",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Iraq
  IE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/irska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/izrael",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Israel
  IT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/italija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jamajka",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Jamaica
  JP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/japan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Japan
  JO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jordan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Jordan
  KZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kazahstan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kazakhstan
  KE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kenija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kenya
  KI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kiribati",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kiribati
  KP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/korea-dpr",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Korea, DPR
  KR: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/koreja-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Korea, Republic
  KW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kuvajt",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kuwait
  KG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kirgiska-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Kyrgyzstan, Republic
  LA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/laos",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Laos
  LV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/letonija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Latvia
  LB: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liban",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lebanon
  LS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lesoto",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lesotho
  LR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/liberija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Liberia
  LY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/libija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Libya
  LI: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/lihtenstajn",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Liechtenstein
  LT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/litvanija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/luksemburg",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Luxembourg
  MG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/madagaskar",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Madagascar
  MW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malavi",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malawi
  MY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malezija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malaysia
  MV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maldives",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Maldives
  ML: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mali",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mali
  MT: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/malta",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Malta
  MH: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/marshall-islands",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Marshall Islands
  MR: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritania",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mauritania
  MU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mauritius",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mauritius
  MX: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/meksiko",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mexico
  FM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/micronesia",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Micronesia
  MD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/moldavija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Moldova
  MC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/monako",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Monaco
  MN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mongolija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mongolia
  ME: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/crna-gora",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Montenegro
  MA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/maroko",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Morocco
  MZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mozambik",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Mozambique
  MM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/mjanmar",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Myanmar
  NA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/namibija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Namibia
  NR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nauru",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nauru
  NP: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nepal",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nepal
  NL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/holandija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Netherlands
  NZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/novi-zeland",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // New Zealand
  NI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nikaragva",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nicaragua
  NE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/niger",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/nigerija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Nigeria
  MK: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/severna-makedonija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // North Macedonia
  NO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/norveska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Norway
  OM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/oman",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Oman
  PK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/pakistan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Pakistan
  PW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palau",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Palau
  PS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/palestina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Palestine
  PA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/panama",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Panama
  PG: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/papua-nova-gvineja",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Papua New Guinea
  PY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/paragvaj",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Paraguay
  PE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/peru",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/filipini",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Philippines
  PL: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/poljska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/portugalija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Portugal
  QA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/katar",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/rumunija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Romania
  RU: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruska-federacija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ruanda",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Rwanda
  KN: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sent-kits-i-nevis",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  LC: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveta-lucija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Lucia
  VC: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sveti-vinsent-i-grenadini",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  WS: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/samoa",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Samoa
  SM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/san-marino",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // San Marino
  ST: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sao-tome-i-prinsipe",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sao Tome and Principe
  SA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/saudijska-arabija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Saudi Arabia
  SN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/senegal",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Senegal
  SC: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sejseli",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Seychelles
  SL: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sijera-leone",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sierra Leone
  SG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/singapur",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Singapore
  SK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovacka",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Slovakia
  SI: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/slovenija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Slovenia
  SB: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/solomonova-ostrva",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Solomon Islands
  SO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/somalija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Somalia
  ZA: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzna-afrika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // South Africa
  SS: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/juzni-sudan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // South Sudan
  ES: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/spanija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Spain
  LK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sri-lanka",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sri Lanka
  SD: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sudan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sudan
  SR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/surinam",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Suriname
  SE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svedska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Sweden
  CH: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/svajcarska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Switzerland
  SY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sirija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Syria, Arab Republic
  TJ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tadzikistan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tajikistan
  TZ: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tanzanija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tanzania
  TH: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tajland",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Thailand
  TL: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/istocni-timor",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Timor-Leste
  TG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/togo",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Togo
  TO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tonga",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tonga
  TT: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/trinidad-i-tobago",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Trinidad and Tobago
  TN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tunis",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turska",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Turkiye
  TM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/turkmenistan",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Turkmenistan
  TV: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/tuvalu",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Tuvalu
  UG: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uganda",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uganda
  UA: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ukrajina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Ukraine
  KM: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/unija-komora",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Union of the Comoros
  AE: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeni-arapski-emirati",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United Arab Emirates
  GB: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/ujedinjeno-kraljevstvo",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United Kingdom
  US: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/sjedinjene-americke-drzave",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // United States
  UY: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/urugvaj",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: {
      url:
        "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/uzbekistan-republika",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Uzbekistan
  VU: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vanuatu",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Vanuatu
  VE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/venecuela",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/vijetnam",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Vietnam
  YE: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/jemen",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Yemen
  ZM: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zambija",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/zimbabve",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Zimbabwe
  HK: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Hong Kong SAR — sub-row on China's page, no dedicated page
  MO: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/kina",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Macao SAR — sub-row on China's page, no dedicated page
  TW: {
    direct: {
      url: "https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime",
      type: "direct",
      checkDiff: true,
    },
    parent: serbiaIndex,
    dateChecked: "2026-08-31",
  } satisfies SourceDoc, // Taiwan — no dedicated page in the scrape; index page fallback
} as const;

/**
 * Bosnia and Herzegovina's MFA "Vize" index is the human-facing source for
 * every BosniaSources entry, as both its direct and its parent link (the
 * per-country pages' URLs are not stable enough to cite; see
 * regions/bosnia.ts). The index is diffed once.
 *
 * Each country's actual rule text is diffed through `bosniaSubpageApi`, the
 * site's JSON API for the page the index's country selector opens. Its URL is
 * keyed by a timestamped slug that changes when the page is republished, so
 * the pipeline resolves `{key}` per nationality from the index on every run
 * (pipeline/src/resolvers/mvpGovBa.ts).
 */
const bosniaIndex = {
  url: "https://www.mvp.gov.ba/en/vize",
  type: "parent",
  checkDiff: true,
} as const satisfies SourceLink;

const bosniaSubpageApi = {
  url: "https://www.mvp.gov.ba/api/subpage/{key}?domain=https://www.mvp.gov.ba",
  type: "machine",
  checkDiff: true,
  resolver: "mvp.gov.ba",
} as const satisfies SourceLink;

const bosniaVisaPage = {
  url: bosniaIndex.url,
  type: "direct",
  checkDiff: false,
  alternate: bosniaSubpageApi,
} as const satisfies SourceLink;

export const BosniaSources = {
  AD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Albania
  AM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Azerbaijan
  BB: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burundi
  BJ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei
  BO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bhutan
  BW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo (Democratic Republic)
  CF: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Central African Republic
  CG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cote d'Ivoire
  CL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // China
  CO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cuba
  CV: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cabo Verde
  CY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czech Republic
  DE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DJ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Djibouti
  DK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Micronesia
  FR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Grenada
  GE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ghana
  GM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gambia
  GN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea
  GQ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Equatorial Guinea
  GR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea-Bissau
  GY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // India
  IQ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cambodia
  KI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kiribati
  KM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Comoros
  KN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (North)
  KR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Korea (South)
  KW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kazakhstan
  LA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Laos
  LB: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lebanon
  LC: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Madagascar
  MH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Marshall Islands
  MK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Macedonia
  ML: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mali
  MM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Myanmar
  MN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mongolia
  MR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nepal
  NR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nauru
  NZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Peru
  PG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Papua New Guinea
  PH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palestine
  PT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palau
  PY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Suriname
  ST: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Syria
  SZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eswatini
  TD: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chad
  TG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tajikistan
  TL: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Timor-Leste
  TM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tunisia
  TO: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tonga
  TR: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkiye
  TT: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tuvalu
  TW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // TW
  TZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tanzania
  UA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United States
  UY: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Holy See (Vatican)
  VC: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vietnam
  VU: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vanuatu
  WS: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Samoa
  XK: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // XK
  YE: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: bosniaVisaPage,
    parent: bosniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Kosovo ───────────────────────────────────────

/**
 * Government of Kosovo — Ministry of Foreign Affairs and Diaspora.
 * "Visa regime for foreign citizens" — a single page listing every
 * visa-exempt nationality. No per-country subpages exist on this site
 * (unlike Montenegro/Serbia), so the page is defined once and every Kosovo
 * passport rule cites the one `visaExempt` entry below (see
 * regions/kosovo.ts) rather than a per-nationality copy of it. The page
 * itself is the list, so it's diffed: a nationality added to or removed
 * from it shows up as a text change.
 * Verified live 2026-09-04.
 */
const kosovoVisaPage = {
  url: "https://ambasadat.net/visas/",
  type: "direct",
  checkDiff: true,
} as const satisfies SourceLink;

export const KosovoSources = {
  visaExempt: {
    direct: kosovoVisaPage,
    // Same page — nothing sits above it; it's diffed once via `direct`.
    parent: { ...kosovoVisaPage, type: "parent", checkDiff: false },
    dateChecked: "2026-09-04",
  } satisfies SourceDoc,
} as const;

// ─── North Macedonia ──────────────────────────────────────────────────────────

/**
 * North Macedonia's MFA "Do you need a visa?" page is the human-facing source
 * for every NorthMacedoniaSources entry, as both its direct and its parent
 * link: it has no per-country URLs. The page itself isn't diffed; its country
 * list is, as part of the resolver below.
 *
 * Each country's rule is diffed through `macedoniaVisaCheck`: the page is a
 * Livewire component, and a country's rule only appears when its button's
 * call is POSTed to /livewire/update. The pipeline reads the buttons from
 * each region's page and makes those calls itself on every run, so `{key}` is
 * filled with "<region>/<button id>" (pipeline/src/resolvers/mfaGovMk.ts).
 */
const macedoniaIndex = {
  url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza",
  type: "parent",
  checkDiff: false,
} as const satisfies SourceLink;

const macedoniaVisaCheck = {
  url: "https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza#{key}",
  type: "machine",
  checkDiff: true,
  resolver: "mfa.gov.mk",
} as const satisfies SourceLink;

const macedoniaVisaPage = {
  url: macedoniaIndex.url,
  type: "direct",
  checkDiff: false,
  alternate: macedoniaVisaCheck,
} as const satisfies SourceLink;

export const NorthMacedoniaSources = {
  AD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Antigua and Barbuda
  AL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Albania
  AM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Azerbaijan
  BA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bosnia and Hercegovina
  BB: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahrain
  BI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Burundi
  BJ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brunei Darussalam
  BO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bahamas
  BT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Bhutan
  BW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Canada
  CD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // DR of the Congo
  CF: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Central African Republic
  CG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Côte D'Ivoire
  CL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // China
  CO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cuba
  CV: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cabo Verde
  CY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Czechia
  DE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Germany
  DJ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Djibouti
  DK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Denmark
  DM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominica
  DO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Fiji
  FM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Micronesia - Federated States of
  FR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // France
  GA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Kingdom
  GD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Grenada
  GE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ghana
  GM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Gambia
  GN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea
  GQ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Equatorial Guinea
  GR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guatemala
  GW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guinea Bissau
  GY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Guyana
  HK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hong Kong (SAR)
  HN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // India
  IQ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Cambodia
  KI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kiribati
  KM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Comoros
  KN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // North Korea
  KR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Republic of Korea
  KW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kazakhstan
  LA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lao People’s Democratic Republic
  LB: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lebanon
  LC: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Lucia
  LI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Madagascar
  MH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Marshall Islands
  ML: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mali
  MM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Myanmar
  MN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mongolia
  MO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Macao (SAR)
  MR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Namibia
  NE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Niger
  NG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nepal
  NR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Nauru
  NZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Peru
  PG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Papua New Guinea
  PH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Poland
  PT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Portugal
  PW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Palau
  PY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saudi Arabia
  SB: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Solomon Islands
  SC: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Suriname
  SS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Sudan
  ST: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Syrian Arab Republic
  SZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Eswatini
  TD: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Chad
  TG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tajikistan
  TL: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Timor-Leste
  TM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tunizi
  TO: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tonga
  TR: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Turkey
  TT: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Trinidad and Tobago
  TV: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Tuvalu
  TW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Taiwan
  TZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // United Republic of Tanzania
  UA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // USA
  UY: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vatican City
  VC: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Saint Vincent and the Grenadines
  VE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Venezuela, Bolivarian Republic of
  VN: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vietnam
  VU: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Vanuatu
  WS: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Samoa
  XK: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Kosovo
  YE: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: macedoniaVisaPage,
    parent: macedoniaIndex,
    dateChecked: "2026-09-04",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Albania ──────────────────────────────────────────────────────────────────

/**
 * Albania's MFA publishes no per-country pages: every AlbaniaSources entry
 * cites the same two pages, each defined once here — the per-country table
 * ("Information on the visa regime for foreign citizens") as `direct`, and
 * the visa-regime overview it sits under as `parent`, diffed as a page.
 *
 * The table page isn't diffed as a page: its rules are in an inline script
 * (`countryData`) that fills the table when a country is picked. The
 * pipeline parses that script on every run and diffs each country's entry
 * through `albaniaVisaCheck`, with `{key}` filled with the country's slug on
 * the page (pipeline/src/resolvers/punetejashtmeGovAl.ts).
 */
const albaniaVisaCheck = {
  url: "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/#{key}",
  type: "machine",
  checkDiff: true,
  resolver: "punetejashtme.gov.al",
} as const satisfies SourceLink;

const albaniaVisaTable = {
  url: "https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/",
  type: "direct",
  checkDiff: false,
  alternate: albaniaVisaCheck,
} as const satisfies SourceLink;

const albaniaVisaRegime = {
  url: "https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/",
  type: "parent",
  checkDiff: true,
} as const satisfies SourceLink;

export const AlbaniaSources = {
  AD: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Andorra
  AE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // United Arab Emirates
  AF: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Afghanistan
  AG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Antigua and Barbuda
  AM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Armenia
  AO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Angola
  AR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Argentina
  AT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Austria
  AU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Australia
  AZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Azerbaijan
  BA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bosnia and Herzegovina
  BB: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Barbados
  BD: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bangladesh
  BE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Belgium
  BF: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Burkina Faso
  BG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bulgaria
  BH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bahrain
  BJ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Benin
  BN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Brunei
  BO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bolivia
  BR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Brazil
  BS: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Bahamas
  BW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Botswana
  BY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Belarus
  BZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Belize
  CA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Canada
  CG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Congo
  CH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Switzerland
  CI: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Cote d'Ivoire
  CL: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Chile
  CM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Cameroon
  CN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // China
  CO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Colombia
  CR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Costa Rica
  CU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Cuba
  CY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Cyprus
  CZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Czech Republic
  DE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Germany
  DK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Denmark
  DO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Dominican Republic
  DZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Algeria
  EC: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Ecuador
  EE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Estonia
  EG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Egypt
  ER: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Eritrea
  ES: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Spain
  ET: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Ethiopia
  FI: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Finland
  FJ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Fiji
  FR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // France
  GA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Gabon
  GB: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // United Kingdom
  GE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Georgia
  GH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Ghana
  GN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Guinea
  GR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Greece
  GT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Guatemala
  GY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Guyana
  HK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Hong Kong (SAR)
  HN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Honduras
  HR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Croatia
  HT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Haiti
  HU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Hungary
  ID: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Indonesia
  IE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Ireland
  IL: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Israel
  IN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // India
  IQ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Iraq
  IR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Iran
  IS: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Iceland
  IT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Italy
  JM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Jamaica
  JO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Jordan
  JP: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Japan
  KE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Kenya
  KG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Kyrgyzstan
  KH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Cambodia
  KN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Saint Kitts and Nevis
  KP: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Korea (North)
  KR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Korea (South)
  KW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Kuwait
  KZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Kazakhstan
  LB: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Lebanon
  LI: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Liechtenstein
  LK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Sri Lanka
  LR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Liberia
  LS: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Lesotho
  LT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Lithuania
  LU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Luxembourg
  LV: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Latvia
  LY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Libya
  MA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Morocco
  MC: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Monaco
  MD: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Moldova
  ME: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Montenegro
  MG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Madagascar
  MK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // North Macedonia
  ML: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mali
  MN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mongolia
  MO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Macao (SAR)
  MR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mauritania
  MT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Malta
  MU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mauritius
  MV: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Maldives
  MW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Malawi
  MX: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mexico
  MY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Malaysia
  MZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Mozambique
  NA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Namibia
  NG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Nigeria
  NI: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Nicaragua
  NL: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Netherlands
  NO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Norway
  NP: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Nepal
  NZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // New Zealand
  OM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Oman
  PA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Panama
  PE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Peru
  PH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Philippines
  PK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Pakistan
  PL: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Poland
  PS: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Palestine
  PT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Portugal
  PY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Paraguay
  QA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Qatar
  RO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Romania
  RS: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Serbia
  RU: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Russia
  RW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Rwanda
  SA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Saudi Arabia
  SC: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Seychelles
  SD: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Sudan
  SE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Sweden
  SG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Singapore
  SI: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Slovenia
  SK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Slovakia
  SL: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Sierra Leone
  SM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // San Marino
  SN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Senegal
  SO: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Somalia
  SR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Suriname
  ST: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Sao Tome and Principe
  SV: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // El Salvador
  SY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Syria
  TG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Togo
  TH: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Thailand
  TJ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Tajikistan
  TM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Turkmenistan
  TN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Tunisia
  TR: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Turkey
  TT: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Trinidad and Tobago
  TW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Taiwan
  TZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Tanzania
  UA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Ukraine
  UG: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Uganda
  US: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // United States
  UY: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Uruguay
  UZ: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Uzbekistan
  VA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Vatican City
  VE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Venezuela
  VN: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Vietnam
  XK: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Kosovo
  YE: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Yemen
  ZA: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // South Africa
  ZM: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Zambia
  ZW: {
    direct: albaniaVisaTable,
    parent: albaniaVisaRegime,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc, // Zimbabwe
} as const;

// ─── Cyprus ───────────────────────────────────────────────────────────────────

export const CyprusSources = {
  /**
   * EU Regulation (EU) 2018/1806 Annex I (visa-required) / Annex II
   * (visa-exempt), as implemented by Cyprus for its own external border —
   * Cyprus is an EU member state but not (yet) a Schengen-implementing
   * state, so it applies this same EU-wide list independently rather than
   * via Schengen's common visa. Primary citation is the Regulation itself,
   * shared with SchengenSources.visaList (EUR-Lex page health-checked, its
   * Cellar copy diffed). gov.cy is the Cypriot government's own page on the
   * same policy. It refuses automated clients (HTTP 403), so it's only
   * health-checked (reported "blocked"), not diffed.
   */
  visaList: {
    direct: euVisaListRegulation,
    parent: {
      url: "https://www.gov.cy/en/information/visas/",
      type: "parent",
      checkDiff: false, // HTTP 403 to automated clients; nothing to diff
    },
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,
} as const;

// ─── Belarus ──────────────────────────────────────────────────────────────────

/**
 * The "visa-free travel" index, parent of both the European any-border list
 * and the airport-only list. It is only a menu of subpages, so it is
 * health-checked but not diffed.
 */
const belarusFreeMove = {
  url: "https://mfa.gov.by/en/visa/freemove/",
  type: "parent",
  checkDiff: false,
} as const satisfies SourceLink;

export const BelarusSources = {
  /**
   * General visa-regime page — nationalities requiring a Belarusian visa.
   * Cited as the default/fallback rule's source (see belarus.ts). The page
   * is only a menu of visa subpages, so it is health-checked but not diffed.
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
    dateChecked: "2026-10-23",
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
      checkDiff: true,
    },
    parent: belarusFreeMove,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,

  /**
   * Airport-only visa-free list — the stable, always-applicable fallback
   * (30 days per visit, six named airports only, no yearly cap). Some entries there require another jurisdiction's visa to
   * actually use the exemption; those are modeled as visa_required instead
   * (see belarus.ts header for the product decision). The 76-country list
   * itself is a PDF linked from the page, diffed as the alternate.
   */
  airport: {
    direct: {
      url: "https://mfa.gov.by/en/visa/freemove/airport/",
      type: "direct",
      checkDiff: true,
      alternate: {
        url: "https://mfa.gov.by/kcfinder/upload/files/GKU/21.10.17_List_countries_eng.pdf",
        type: "machine",
        checkDiff: true,
      },
    },
    parent: belarusFreeMove,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,

  /**
   * "Visa-free travel (general information)": a two-column table, Belarusian
   * citizens travelling abroad (left, not modelled) and foreign nationals
   * entering Belarus (right). The right column lists the nationalities that
   * are visa-free under bilateral agreements, with a stay for most of them.
   * Diffed; a change in the left column is noise for this app.
   */
  bilateral: {
    direct: {
      url: "https://mfa.gov.by/en/visa/freemove/general/",
      type: "direct",
      checkDiff: true,
    },
    parent: belarusFreeMove,
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,
} as const;

// ─── Georgia ──────────────────────────────────────────────────────────────────

export const GeorgiaSources = {
  /**
   * Direct: the consulate's list of countries whose citizens, and stateless
   * persons permanently residing there, may enter, stay in, or transit
   * Georgia without a visa. The parent "entering Georgia" overview page is
   * cited as `parent` link. The underlying legislation ("On Approval of the
   * List of Countries Whose Citizens May Enter Georgia without a Visa",
   * matsne.gov.ge/en/document/view/2867361) is cited as a code comment in
   * georgia.ts rather than as a SourceDoc citation, per explicit instruction.
   *
   * geoconsul.gov.ge pages are an empty shell that their scripts fill from
   * the consulate's content API, so the page itself is only health-checked
   * and the API's copy of it is diffed as the alternate. The overview page
   * has no API copy wired up, so it is only health-checked.
   */
  visaList: {
    direct: {
      url: "https://www.geoconsul.gov.ge/en/HtmlPage/html/View?id=25",
      type: "direct",
      checkDiff: false,
      alternate: {
        url: "https://gc-api.mfa.gov.ge/v1/PageContent/custom-html?Id=25",
        type: "machine",
        checkDiff: true,
      },
    },
    parent: {
      url: "https://geoconsul.gov.ge/en/entering-georgia",
      type: "parent",
      checkDiff: false,
    },
    dateChecked: "2026-10-23",
  } satisfies SourceDoc,
} as const;

// ─── Armenia ──────────────────────────────────────────────────────────────────

/**
 * MFA "Visa" index — the parent of both ArmeniaSources entries, defined once
 * and shared. Health-checked only: the two list pages below are what the
 * rules are built from, and those are diffed.
 */
const armeniaVisaIndex = {
  url: "https://www.mfa.am/en/visa/",
  type: "parent",
  checkDiff: false,
} as const satisfies SourceLink;

export const ArmeniaSources = {
  /**
   * List of countries whose citizens with all types of passports are
   * unilaterally exempt from Armenia's visa requirement — 180 days within
   * any 365-day period. Cited as the source for both the 45-country
   * unilateral list and the default/fallback rule (see armenia.ts).
   * Diffed: a country added to or removed from the list is a text change.
   */
  visaFreeList: {
    direct: {
      url: "https://www.mfa.am/en/visafreelist",
      type: "direct",
      checkDiff: true,
    },
    parent: armeniaVisaIndex,
    dateChecked: "2026-09-14",
  } satisfies SourceDoc,

  /**
   * Bilateral/multilateral visa-free agreements list. Only rows marked
   * "All types of passports" are modeled (diplomatic/service/official-only
   * rows grant nothing to an ordinary passport and are excluded — see
   * armenia.ts header). Diffed, like visaFreeList.
   */
  bilateralList: {
    direct: {
      url: "https://www.mfa.am/en/whoneedvisa",
      type: "direct",
      checkDiff: true,
    },
    parent: armeniaVisaIndex,
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
 * the scheduled biweekly workflow always does.
 */
export const SourceRegions = {
  Schengen: { sources: SchengenSources, checkLinks: true },
  UK: { sources: UKSources, checkLinks: true },
  Ireland: { sources: IrelandSources, checkLinks: true },
  Turkiye: { sources: TurkiyeSources, checkLinks: true },
  Montenegro: { sources: MontenegroSources, checkLinks: true },
  Serbia: { sources: SerbiaSources, checkLinks: true },
  Bosnia: { sources: BosniaSources, checkLinks: true },
  Kosovo: { sources: KosovoSources, checkLinks: true },
  NorthMacedonia: { sources: NorthMacedoniaSources, checkLinks: true },
  Albania: { sources: AlbaniaSources, checkLinks: true },
  Cyprus: { sources: CyprusSources, checkLinks: true },
  Belarus: { sources: BelarusSources, checkLinks: true },
  Georgia: { sources: GeorgiaSources, checkLinks: true },
  Armenia: { sources: ArmeniaSources, checkLinks: true },
} satisfies Record<string, SourceRegion>;
