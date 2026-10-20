---
id: 6
title: "Albania: Saudi Arabia and Qatar visa-free only for the 2026 tourist season"
recorded: 2026-10-20
effective: 2026-04-15
trigger:
  type: manual
  ref: Albania by-hand check
evidence:
  - region: Albania
    link: visaTable
  - region: Albania
    link: visaRegime
changes:
  - region: albania
    path: passportRules.QA
    before: "entitled: 90/180 rolling · 1 note"
    after: "entitled: 90/180 rolling, 1 condition, until 2026-12-31 · 2 notes"
  - region: albania
    path: passportRules.SA
    before: "entitled: 90/180 rolling · 1 note"
    after: "entitled: 90/180 rolling, 1 condition, until 2026-12-31 · 2 notes"
---

## What changed and why

Albania lets Saudi and Qatari nationals in visa-free only for tourism, and
only during a tourist season, 15 April to 31 December 2026. The app treated
both as visa-free all year, for any purpose. Each rule is now one entitlement
with a dated window (from 15 April 2026, until 31 December 2026) and a
tourism purpose condition, plus a note saying so. Outside the season, the
rule falls through to visa required, so trips from 1 January 2027 show a
visa as needed. This corrects how the source was modelled; the source
itself hasn't changed.

## Evidence

Visa table (`visaTable`), A/C application cell for Saudi Arabia and for
Qatar, read with the playbook's console snippet:

> VISA-FREE REGIME ONLY FOR THE TOURIST SEASON 15.04.2026 TO 31.12.2026

Visa-regime overview (`visaRegime`), "Visa-free entry into Albania":

> Nationals of Saudi Arabia and Qatar may travel visa-free, for tourism
> purposes only, from 15 April 2026 to 31 December 2026, upon presentation
> of a valid passport.

## Checked

Both pages read on the live site on 2026-10-20, in the by-hand check
(`nationalC` for both reads WITHOUT VISA during the season). `lastVerified`
in `albania.ts` was already 2026-10-20 from that check, and the SA and QA
sources' `dateChecked` too.
