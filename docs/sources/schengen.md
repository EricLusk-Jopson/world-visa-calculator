---
region: Schengen
lastReviewed: 2026-10-23
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
    url: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02009R0810-20240628
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
    checkedVia: atvCommonCellar
    formerUrls:
      - https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02009R0810-20200202&qid=1700746099626#tocId629
  - id: atvCommonCellar
    url: https://publications.europa.eu/resource/celex/02009R0810-20240628
    loadBearing: true
    category: machine-copy
    revisions: consolidated-versions
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
    formerUrls:
      - https://publications.europa.eu/resource/celex/02009R0810-20200202
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
  - id: eesRegulation
    url: https://eur-lex.europa.eu/eli/reg/2017/2226/oj
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: bot-protected
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: eesProgressiveStart
    url: https://eur-lex.europa.eu/eli/reg/2025/1534/oj
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: bot-protected
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: bordersCode
    url: https://eur-lex.europa.eu/eli/reg/2016/399/oj
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: bot-protected
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: eesChecker
    url: https://travel-europe.europa.eu/ees/check-how-long-you-can-stay_en
    loadBearing: false
    category: interactive
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: eesDataRights
    url: https://travel-europe.europa.eu/ees/data-held-by-ees
    loadBearing: true
    category: html-page
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
---

# Schengen

**Rules:** `src/data/regions/schengen.ts` · **Sources:** `SchengenSources` (`visaList`, `atvCommon`, `atvSpecific`, `etias`; and for the EES Record Fixer, `eesRegulation`, `eesProgressiveStart`, `bordersCode`, `eesChecker`)

The rules come from EU legal texts:

- **Regulation 2018/1806**, Annex I (visa required) and Annex II
  (visa-free). Also cited by Cyprus.
- **The Visa Code** (Regulation 810/2009), Annex IV: the common
  airport-transit list.
- **The Visa Code Handbook's Annex 7b**: member-state-specific transit
  lists.

**The key thing to know:** the EUR-Lex and Cellar links are pinned to one
consolidated version (`-20251230`, `-20240628`). An amendment never changes
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

**Machine:** health-checked only. The Cellar copy is diffed. Since the
2026-10-20 run, EUR-Lex answers the pipeline with HTTP 202 and a
bot-protection challenge instead of the page, so both EUR-Lex links show as
🚫 blocked. That's expected and harmless: the Cellar copies, which carry the
diff, still load. A blocked Cellar link would be news.

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
On 2026-10-23 the current consolidation was still 30/12/2025. A EUR-Lex
search for the regulation also returned Commission Implementing Regulation
(EU) 2026/496 of 6 March 2026, which suspends the visa exemption for
Georgian diplomatic, service and official passports. That's already in the
`GE` note and isn't a new change.

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
than 28/06/2024. Annex IV is near the end of the text; compare its list with
the `ATV_COMMON_RULE` entries in `schengen.ts`.

**Real change vs noise:** see `atvCommonCellar`.

**Human work:** the consolidation check. On 2026-10-20 the current
consolidation was 28/06/2024 (moved from 02/02/2020); its Annex IV lists the
same 12 nationalities as before.

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
change. To compare every row at once, have Claude parse the PDF:
`pdftotext -bbox` gives each word's position, so each X can be matched to
its member-state column. Check any differences on a rendered page image.
On 2026-10-23 (file sha256 `9201757c…`, unchanged since 2026-10-07) this
found two transcription gaps: India only under CZ and RO (rule-change 8),
and Burundi under BE from 1 August 2026 (rule-change 9). The other 42 rows
matched. Cell footnotes are renumbered whenever a row is added (e.g.
Guinea's service-passport note moved from 6 to 7), so match footnotes by
their text, not their number.

## etias

**Establishes:** the ETIAS pre-travel authorisation details on visa-free
entries (start date, cost, validity).

**Machine:** health-checked only. The page renders client-side.

**Human:** open the page and check the start date, fee and validity against
the `preAuth` details in `schengen.ts`.

**Real change vs noise:** not diffed.

**Human work:** check every cycle until ETIAS launches. The launch date has
slipped several times. On 2026-10-23 the page said: "ETIAS is currently not
in operation and no applications for travel authorisations are collected at
this point. The European Union will inform about the specific date for the
start of ETIAS several months prior to its launch." It gave no fee or
validity to check against `schengen.ts`.

## travelEurope

**Establishes:** nothing. It's the parent of the ETIAS page.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## EES Record Fixer links

The last five links serve the EES Record Fixer (`/ees-record-fixer` and the
fixer in `/app`, code in `src/features/eesFixer/`), not a rule in
`schengen.ts`. They're here so the pipeline health-checks every link the
fixer shows. What they establish is the fixer's constants
(`src/features/eesFixer/constants.ts`) and the citations in its letters
(`src/features/eesFixer/citations.ts`). A change to them changes a letter or
a date, not a visa rule, so it isn't a rule-change log entry.

## eesRegulation

**Establishes:** the traveller's rights the fixer's letters invoke:
Art. 52(1) access and the 45-day reply deadline, Art. 52(2) requests sent
to another country, Art. 52(3) and Art. 35 correction, Art. 52(4) and (5)
reasoned refusals, Art. 52(6) minimum identification, Arts. 53 and 54
supervisory help and remedies. Constant: `REPLY_DEADLINE_DAYS`.

**Machine:** health-checked only. EUR-Lex answers the pipeline with a bot
challenge, so expect 🚫 blocked.

**Human:** open the link. Read Articles 35 and 52 to 54 and compare each
with its summary in `citations.ts`. Check whether EUR-Lex lists a
consolidated version that amends those articles.

**Real change vs noise:** not diffed.

**Human work:** a check before launch, then periodic. TODO(human): the
summaries in `citations.ts` and the Art. 35 overstayer-list and five-working-day
erasure wording haven't yet been checked against EUR-Lex (spec open
question "Article 35 details"; v3 only).

## eesProgressiveStart

**Establishes:** the progressive start of EES operations, 12 October 2025 to
9 April 2026. Constants: `EES_START`, `EES_FULL`.

**Machine:** health-checked only (EUR-Lex bot challenge).

**Human:** confirm the start date and the length of the progressive start
in the regulation's operative articles.

**Real change vs noise:** not diffed.

**Human work:** periodic. A change here would only come from an amending
regulation, which gets its own ELI, so also watch for one.

## bordersCode

**Establishes:** the 90 days in any 180-day period (Art. 6(1)) the fixer
recounts. Constants: `SHORT_STAY_DAYS`, `SHORT_STAY_WINDOW`.

**Machine:** health-checked only (EUR-Lex bot challenge).

**Human:** confirm Art. 6(1) still reads 90 days in any 180-day period.

**Real change vs noise:** not diffed.

**Human work:** periodic, and only on news of an amendment.

## eesChecker

**Establishes:** nothing. It's the EU checker whose result the fixer
explains, linked from the fixer and the landing page.

**Machine:** health-checked only. It's an interactive form.

**Human:** run a date through it when the fixer's assumptions need
checking, e.g. whether it counts the arrival day (spec open question
"Window boundary": `remainingOnArrival` in `engine.ts` assumes it doesn't).

**Real change vs noise:** not diffed.

**Human work:** none routinely. TODO(human): settle the window boundary with
a test date.

## eesDataRights

**Establishes:** where a traveller sends an EES request. It's the EES page
on a traveller's data and rights, which the fixer links in place of the
EU's list of national EES contacts.

**Machine:** health-checked only.

**Human:** open it and check it still lists each country's EES authority
and contact details (the EES blog post relies on that list too).

**Real change vs noise:** not diffed.

**Human work:** periodic. TODO(human): the spec names a separate "Contact
details of European countries using the EES" page on travel-europe.europa.eu,
which returned an error on 2026-11-21. When it's live and populated, add it
to `SchengenSources.eesChecker` (or its own entry) and point the fixer at it.
These links were taken from the EES blog post (2026-11-19). The maintainer
opened all five on 2026-11-23 and they loaded; link-status.json records them
as live from that check until the next pipeline run replaces it.

## Open questions

- TODO(human): add a machine check for "newer consolidated version exists". EUR-Lex lists all consolidations of a CELEX number, and diffing that list would turn the manual check into a flagged diff.
