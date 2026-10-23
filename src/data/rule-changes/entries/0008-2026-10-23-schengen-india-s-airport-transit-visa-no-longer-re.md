---
id: 8
title: "Schengen: India's airport transit visa corrected to Czechia and Romania only"
recorded: 2026-10-23
trigger:
  type: manual
  ref: periodic check of atvSpecific
evidence:
  - region: Schengen
    link: atvSpecific
changes:
  - region: schengen
    path: passportRules.IN
    before: visa required · 2 notes
    after: visa required · 1 note
---

## What changed and why

The app said Indian nationals need an airport transit visa (ATV) at airports
in Czechia, Germany, France and Romania. The current Annex 7b (Visa Code
Handbook list of member-state ATV requirements) lists India only under
Czechia and Romania. The rule's ATV note now names just those two, and the
"France: ordinary passports only" note goes with France.

This corrects the transcription. The Annex 7b file is byte-identical to the
one the pipeline has tracked since 7 October 2026 (sha256 `9201757c…`), so
the source didn't change during that time. The rules were transcribed in
April 2026, so the entries were either wrong then or came from an earlier
version of the file. The source gives no date for the change.

## Evidence

Annex 7b (`atvSpecific`), "List of third countries whose nationals are
required to be in possession of an airport transit visa when passing through
the international transit area of airports situated on the territory of
one/some Member States", page 2, row "India":

> India — X under CZ, X under RO (the DE and FR cells are empty)

## Checked

The maintainer downloaded the current Annex 7b PDF on 2026-10-23. Its rows
were extracted from the PDF's word positions and checked against a rendered
image of page 2. Every other row (43 countries) matches `schengen.ts`.
`lastVerified` in `schengen.ts` was bumped to 2026-10-23, and so was
`dateChecked` on all Schengen sources.
