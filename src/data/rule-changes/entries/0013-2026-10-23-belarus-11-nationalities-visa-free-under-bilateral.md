---
id: 13
title: "Belarus: 11 nationalities visa-free under bilateral agreements"
recorded: 2026-10-23
trigger:
  type: manual
  ref: periodic check of bilateral
evidence:
  - region: Belarus
    link: bilateral
changes:
  - region: belarus
    path: passportRules.AM
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.AZ
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.EC
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.GE
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.KG
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.KZ
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.MD
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.RU
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.TJ
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.UA
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.UZ
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
---

## What changed and why

The Belarus MFA's general visa-free page lists nationalities that can enter
Belarus without a visa under bilateral agreements. The app didn't cite that
page, so all of them fell through to visa required. This adds the 11 that
the page lists with no stay: Armenia, Azerbaijan, Ecuador, Georgia,
Kazakhstan, Kyrgyzstan, Moldova, Russia, Tajikistan, Ukraine and
Uzbekistan. They're now visa-free through any border.

The page gives no maximum stay for them; the limits are in each agreement.
As in `kosovo.ts` and `bosnia.ts`, the standard 90 days in any 180-day
period is applied as an assumption. Each entry's note says the MFA states no
maximum stay and that the figure isn't from the source. The page is now
cited as `BelarusSources.bilateral` and diffed.

The page's other 22 bilateral nationalities do have a stated stay. They're
listed in the playbook (`docs/sources/belarus.md`, `bilateral`) and not yet
modelled.

## Evidence

"Visa-free travel (general information)" (`bilateral`,
https://mfa.gov.by/en/visa/freemove/general/), right-hand column, "Foreign
nationals with ordinary passports to the Republic of Belarus**:". These
entries appear with no stay given:

> Armenia · Azerbaijan · Ecuador · Georgia · Kazakhstan · Kyrgyzstan ·
> Moldova · Russia · Tajikistan · Ukraine · Uzbekistan

The page's own footnote `**` points to the State Border Committee's site
for border-crossing rules.

## Checked

The maintainer pasted the live page on 2026-10-23. The paste interleaves the
two columns row by row; the right column was separated out using the
alphabetical order of both columns (the reconstruction is in the playbook).
The maintainer approved adding these 11 as visa-free with a note about the
missing duration. `lastVerified` in `belarus.ts` was already 2026-10-23 from
this check, and `BelarusSources.bilateral` was added with a `dateChecked` of
2026-10-23.
