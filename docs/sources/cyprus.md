---
region: Cyprus
lastReviewed: 2026-10-20
links:
  - id: euVisaList
    url: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230
    loadBearing: true
    category: document
    revisions: consolidated-versions
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
    checkedVia: euVisaListCellar
  - id: euVisaListCellar
    url: https://publications.europa.eu/resource/celex/02018R1806-20251230
    loadBearing: true
    category: machine-copy
    revisions: consolidated-versions
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
  - id: govCy
    url: https://www.gov.cy/en/information/visas/
    loadBearing: false
    category: html-page
    revisions: in-place
    access: bot-protected
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# Cyprus

**Rules:** `src/data/regions/cyprus.ts` · **Sources:** `CyprusSources.visaList` (one entry)

Cyprus is in the EU but not Schengen. It applies the same EU visa list,
Regulation (EU) 2018/1806 Annex I and II, at its own border. `cyprus.ts`
copies Schengen's Annex I/II logic without ETIAS and without the
airport-transit notes. Its playbook therefore follows Schengen's for the
regulation (see `schengen.md`, `visaList`).

## Provenance

Copied from `schengen.ts` on purpose, as a product decision, and re-sourced
to `CyprusSources`. Vanuatu deliberately mirrors Schengen's missing `VU`
entry. A change to Schengen's Annex I/II entries almost certainly needs the
same change here.

## euVisaList

**Establishes:** every Cyprus rule.

**Machine:** health-checked only. The Cellar copy is diffed instead.

**Human:** as for Schengen's `visaList`: open the EUR-Lex page, then check
the "Current consolidated version" date against the `-20251230` in the URL.

**Real change vs noise:** see Schengen.

**Human work:** the periodic consolidation check, shared with Schengen. Do
both regions together.

## euVisaListCellar

**Establishes:** the same, as a machine copy.

**Machine:** diffed. It's pinned to the 2025-12-30 consolidation, which
never changes, so a later amendment appears as a new CELEX version, not a
diff here. Confidence is low for that reason.

**Human:** as above.

**Real change vs noise:** a diff here is rare and is likely a corrigendum or
a Cellar format change. Read it.

**Human work:** the periodic consolidation check.

## govCy

**Establishes:** nothing. It's the Cypriot government's own visa page, cited
for people to read.

**Machine:** health-checked. It answers 403 to automated clients, so the
report always shows it as 🚫 blocked. That's expected.

**Human:** open it in a browser for Cyprus-specific practice that the EU
list doesn't cover.

**Real change vs noise:** not diffed.

**Human work:** none. "Blocked" is its normal state.

## Open questions

- TODO(human): Cyprus unilaterally accepts valid Schengen visas for short stays (Decision 565/2014/EU). Should the app note this on visa-required nationalities, as Ireland's SSVWP note does? Confirm on gov.cy first.
