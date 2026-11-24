---
id: 18
title: "Albania: Hong Kong, Macau and Taiwan visa-free through the Schengen rule, not the table"
recorded: 2026-11-23
trigger:
  type: report
  ref: 2026-11-20
evidence:
  - region: Albania
    link: visaRegime
  - region: Albania
    link: visaTable
changes:
  - region: albania
    path: passportRules.HK
    before: "entitled: 90/180 rolling · 1 note"
    after: "entitled: 90/180 rolling · 2 notes"
  - region: albania
    path: passportRules.MO
    before: "entitled: 90/180 rolling · 1 note"
    after: "entitled: 90/180 rolling · 2 notes"
  - region: albania
    path: passportRules.TW
    before: "entitled: 90/180 rolling · 1 note"
    after: "entitled: 90/180 rolling · 2 notes"
---

## What changed and why

Albania's visa table dropped Hong Kong, Macau and Taiwan from its country
selector (their entries are still in the page's `countryData`), so the app
can no longer point users to a table row for them. They remain visa-free:
Albania's visa-regime overview grants visa-free entry to nationals of
countries visa-free in the Schengen Area, and all three are (Annex II;
see `schengen.ts`). Access and the 90/180 limit are unchanged. Each rule
now cites the overview page as its direct source and carries a note
explaining the Schengen basis. They also leave the table's per-country
checks, which could no longer read them.

## Evidence

Source-check report 2026-11-20: the table's country list lists "HONG KONG
(not in the selector)", "MAKAO (not in the selector)" and "TAJVAN (not in
the selector)", where it used to list "HONG KONG (CHINA)", "MACAU (CHINA)"
and "TAIWAN (CHINA)".

Visa-regime overview (`visaRegime`), "Visa-free entry into Albania":

> Nationals of countries that are permitted to enter and stay visa-free in
> Schengen Area countries.

## Checked

The maintainer confirmed on 2026-11-23 that all three are gone from the
live table's selector. The overview clause was read on the live page in the
by-hand check of 2026-10-20. `lastChanged` and `lastVerified` in
`albania.ts`, and the three sources' `dateChecked`, set to 2026-11-23.
