---
id: 14
title: "Belarus: 22 nationalities visa-free under bilateral agreements, with stated stays"
recorded: 2026-10-23
trigger:
  type: manual
  ref: periodic check of bilateral
evidence:
  - region: Belarus
    link: bilateral
changes:
  - region: belarus
    path: passportRules.AE
    before: "(not listed: default rule)"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.AL
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit + 90 days per 365-day calendar period · 1 note"
  - region: belarus
    path: passportRules.AR
    before: "(not listed: default rule)"
    after: "entitled: 90 days per 365-day calendar period · 1 note"
  - region: belarus
    path: passportRules.BR
    before: "(not listed: default rule)"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.CN
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit + 90 days per 365-day calendar period · 1 note"
  - region: belarus
    path: passportRules.CO
    before: "(not listed: default rule)"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.CU
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.HK
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.IL
    before: "(not listed: default rule)"
    after: "entitled: 90/180 rolling · 1 note"
  - region: belarus
    path: passportRules.KN
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.LA
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.ME
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.MM
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.MN
    before: "(not listed: default rule)"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.MO
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit + 90 days per 365-day calendar period · 1 note"
  - region: belarus
    path: passportRules.NI
    before: "entitled: 30 days per visit · 2 notes"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.OM
    before: "entitled: 30 days per visit · 2 notes"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.QA
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.RS
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.TR
    before: "(not listed: default rule)"
    after: "entitled: 30 days per visit · 1 note"
  - region: belarus
    path: passportRules.VE
    before: "(not listed: default rule)"
    after: "entitled: 90 days per visit · 1 note"
  - region: belarus
    path: passportRules.VN
    before: visa required · 1 note
    after: "entitled: 30 days per visit · 1 note"
---

## What changed and why

The Belarus MFA's general visa-free page lists 22 nationalities as visa-free
under bilateral agreements, each with a stated stay. Before this change, 19
of them fell through to visa required, and three were modelled from other
pages. All 22 are now visa-free through any border, with the page's stay:

- **90 days per visit:** Brazil, Colombia, Mongolia, Nicaragua, Venezuela,
  United Arab Emirates (from the date of entry).
- **30 days per visit:** Cuba, Hong Kong (per period of stay), Laos,
  Montenegro, Myanmar, Oman, Qatar, Saint Kitts and Nevis, Serbia, Türkiye,
  Vietnam.
- **30 days per visit, at most 90 per calendar year:** Albania, China,
  Macao.
- **90 days in any 180:** Israel.
- **90 days within the calendar year:** Argentina. The page says "up to 90
  days — consecutive days from the date of their first entry within a
  current year". It's modelled as a 90-day calendar-year total. The
  "consecutive from first entry" detail isn't modelled.

The three that were already modelled:

- **Nicaragua:** was airport-only, 30 days. Now 90 days through any border.
- **Oman:** was airport-only, 30 days. Still 30 days, but through any
  border.
- **Vietnam:** was visa-required. The airport list marks Vietnam as needing
  an EU/Schengen visa to use the airport scheme, but the bilateral page
  lists it as visa-free for up to 30 days with no such condition. Now 30
  days visa-free through any border. The tier-3 conditional list drops to
  11.

## Evidence

"Visa-free travel (general information)" (`bilateral`,
https://mfa.gov.by/en/visa/freemove/general/), right-hand column, "Foreign
nationals with ordinary passports to the Republic of Belarus**:", as printed
to PDF by the maintainer on 2026-10-23:

> Albania (up to 30 days from the date of entry, up to 90 days within a
> current year) · Argentina (up to 90 days— consecutive days from the date
> of their first entry within a current year) · Brazil (up to 90 days) ·
> Сolоmbia (up to 90 days) · Cuba (up to 30 days) · Israel (up to 90 days
> in each period of 180 days) · Laos (up to 30 days) · Mongolia (up to 90
> days) · Montenegro (up to 30 days) · Myanmar (up to 30 days) · Nicaragua
> (up to 90 days) · Oman (up to 30 days) · People's Republic of China (30
> days but no longer than 90 days within one calendar year) · Hong Kong
> Special Administrative Region of the People's Republic of China – up to
> 30 days in each period of stay · Macao Special Administrative Region of
> the People's Republic of China – up to 30 days but no longer than 90 days
> within one calendar year · Qatar (up to 30 days) · Saint Kitts and Nevis
> (up to 30 days) · Serbia (up to 30 days) · Türkiye (up to 30 days) ·
> United Arab Emirates (up to 90 days from the date of entry) · Venezuela
> (up to 90 days) · Vietnam (up to 30 days)

## Checked

The maintainer printed the live page to PDF on 2026-10-23. The right-hand
column was read from the PDF's layout text, which keeps the two columns
apart, and matched the playbook's reconstruction from the earlier paste.
`lastVerified` in `belarus.ts` was already 2026-10-23 from this check, and
so was `dateChecked` on `BelarusSources.bilateral`.
