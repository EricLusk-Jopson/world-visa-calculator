---
id: 9
title: "Schengen: Burundi needs an airport transit visa in Belgium"
recorded: 2026-10-23
effective: 2026-08-01
trigger:
  type: manual
  ref: periodic check of atvSpecific
evidence:
  - region: Schengen
    link: atvSpecific
changes:
  - region: schengen
    path: passportRules.BI
    before: "(not listed: default rule)"
    after: visa required · 3 notes
---

## What changed and why

Annex 7b now lists Burundi under Belgium: Burundian nationals need an airport
transit visa (ATV) to pass through the international transit area of Belgian
airports. Its cell footnote says this applies from 1 August 2026 and not to
holders of diplomatic passports. Burundi had no entry in `schengen.ts` and
fell through to the default visa-required rule (it's on Annex I). It now has
an explicit visa-required rule with the standard ATV note (Belgium), the
Belgian column's service/special-passport exemption, and a note on the start
date and the diplomatic exemption.

The Annex 7b file is the one the pipeline has tracked since 7 October 2026.
The rule changed in reality on 1 August 2026 and wasn't picked up when the
rules were transcribed.

## Evidence

Annex 7b (`atvSpecific`), page 1, row "Burundi": an X with footnote 6 under
BE. Footnote 6:

> Applies from 01/08/2026 – not applicable to diplomatic passports holders

Footnote 1 (the BE column):

> The ATV requirement does not apply to holders of service or special
> passports issued by the countries concerned.

## Checked

The maintainer downloaded the current Annex 7b PDF on 2026-10-23. The row
was read from the PDF's word positions and confirmed on a rendered image of
page 1. `lastVerified` in `schengen.ts` was bumped to 2026-10-23, and so was
`dateChecked` on all Schengen sources.
