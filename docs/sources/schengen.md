---
region: Schengen
lastReviewed: 2026-10-19
links:
  - id: visaList
    url: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
    checkedVia: visaListCellar
  - id: visaListCellar
    url: https://publications.europa.eu/resource/celex/02018R1806-20251230
    loadBearing: true
    category: machine-copy
    revisions: consolidated-versions
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
  - id: visaPolicy
    url: https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: atvCommon
    url: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
    checkedVia: atvCommonCellar
  - id: atvCommonCellar
    url: https://publications.europa.eu/resource/celex/02009R0810-20200202
    loadBearing: true
    category: machine-copy
    revisions: consolidated-versions
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
  - id: atvSpecific
    url: https://home-affairs.ec.europa.eu/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf
    loadBearing: true
    category: document
    revisions: replaced-file
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
  - id: etias
    url: https://travel-europe.europa.eu/en/etias
    loadBearing: true
    category: html-page
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: travelEurope
    url: https://travel-europe.europa.eu/pub
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# Schengen

**Rules:** `src/data/regions/schengen.ts` · **Sources:** `SchengenSources` (`visaList`, `atvCommon`, `atvSpecific`, `etias`)

The rules come from EU legal texts:

- **Regulation 2018/1806**, Annex I (visa required) and Annex II
  (visa-free). Also cited by Cyprus.
- **The Visa Code** (Regulation 810/2009), Annex IV: the common
  airport-transit list.
- **The Visa Code Handbook's Annex 7b**: member-state-specific transit
  lists.

**The key thing to know:** the EUR-Lex and Cellar links are pinned to one
consolidated version (`-20251230`, `-20200202`). An amendment never changes
that version. It produces a new consolidated version with a new date, so
**no diff will flag it**. Checking for a newer consolidation by hand is the
main human task here.

## Provenance

The rules were transcribed from the Annex I/II and Annex IV lists, with
footnotes encoded as conditions and notes. Examples: biometric-passport
conditions for BA, MK, MD and others; Georgia's suspension note; Serbia's
Coordination Directorate carve-out. Last verified 2026-04-08. `cyprus.ts`
copies the Annex I/II logic.

## visaList

**Establishes:** every Schengen visa-required or visa-free classification
(Annex I/II), and Cyprus's too.

**Machine:** health-checked only. The Cellar copy is diffed.

**Human:** open the EUR-Lex link. At the top, EUR-Lex shows "Current
consolidated version: DD/MM/YYYY". If that's later than 30/12/2025:

1. Open the newer version's "Document information" to see which amending
   act changed what.
2. Update `euVisaListRegulation` in `sources.ts` to the new CELEX (both URLs
   and the Cellar alternate; Schengen and Cyprus share it).
3. Update `schengen.ts` and `cyprus.ts` for any moved country.

The next run then reports a first-run baseline for the new version.

**Real change vs noise:** see `visaListCellar`.

**Human work:** the consolidation check, monthly. Also watch the news for
EU visa suspension decisions (the suspension mechanism, e.g. Vanuatu, Georgia).

## visaListCellar

**Establishes:** the same text, as Cellar's copy.

**Machine:** diffed. It's pinned to one consolidation, so it should never
change. A diff means a corrigendum, a re-publication or a Cellar format
change. Cellar redirects to the document; that's expected and reported live.

**Human:** as for `visaList`.

**Real change vs noise:** read any diff, but expect format noise more often
than law.

**Human work:** the periodic consolidation check (see `visaList`).

## visaPolicy

**Establishes:** nothing directly. It's the Commission's visa-policy page,
cited as the parent.

**Machine:** health-checked only.

**Human:** a good place to spot news: new visa waivers, suspensions, and
"amended list of third countries" announcements. Skim it during the
consolidation check.

**Real change vs noise:** not diffed.

**Human work:** skim periodically.

## atvCommon

**Establishes:** the airport-transit-visa (ATV) list common to all
Schengen states (Visa Code Annex IV), shown as ATV notes.

**Machine:** health-checked only. The Cellar copy is diffed.

**Human:** as for `visaList`, checking for a consolidation of 810/2009 later
than 02/02/2020.

**Real change vs noise:** see `atvCommonCellar`.

**Human work:** the consolidation check. TODO(human): confirm 2020-02-02 is
still the current consolidation; it's old.

## atvCommonCellar

**Establishes:** the same text, as Cellar's copy.

**Machine:** diffed, pinned like `visaListCellar`.

**Human:** as for `atvCommon`.

**Real change vs noise:** as for `visaListCellar`.

**Human work:** the periodic consolidation check.

## atvSpecific

**Establishes:** member-state-specific ATV requirements (Visa Code Handbook
Annex 7b), shown as ATV notes.

**Machine:** diffed by hash only (it's a PDF). A change says that the file
changed, not what. When the Commission publishes a new Annex 7b, it usually
gets a new download URL, and this one breaks or goes stale. See "The
Schengen doc-vault case" in `pipeline/README.md`.

**Human:** open the PDF and compare each member state's list with the ATV
notes in `schengen.ts`. To find a newer version, search the Commission's
Visa Code Handbook page for "Annex 7b".

**Real change vs noise:**

- **Read it:** a hash change. It means a new file.
- **Read it:** a broken link. The file was replaced; find the new one.

**Human work:** a periodic look for a newer Annex 7b, and a full read on any
change.

## etias

**Establishes:** the ETIAS pre-travel authorisation details on visa-free
entries (start date, cost, validity).

**Machine:** health-checked only. The page renders client-side.

**Human:** open the page and check the start date, fee and validity against
the `preAuth` details in `schengen.ts`.

**Real change vs noise:** not diffed.

**Human work:** check every cycle until ETIAS launches. The launch date has
slipped several times.

## travelEurope

**Establishes:** nothing. It's the parent of the ETIAS page.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## Open questions

- TODO(human): add a machine check for "newer consolidated version exists". EUR-Lex lists all consolidations of a CELEX number, and diffing that list would turn the manual check into a flagged diff.
