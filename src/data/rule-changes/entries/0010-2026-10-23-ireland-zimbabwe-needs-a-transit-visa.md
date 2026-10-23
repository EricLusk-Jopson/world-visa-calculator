---
id: 10
title: "Ireland: Zimbabwe needs a transit visa"
recorded: 2026-10-23
trigger:
  type: manual
  ref: periodic check of transitVisa
evidence:
  - region: Ireland
    link: transitVisa
changes:
  - region: ireland
    path: passportRules.ZW
    before: visa required
    after: visa required · 1 note
---

## What changed and why

The INIS transit-visa page lists 29 nationalities that need an Irish transit
visa to pass through an Irish airport or seaport. The app had 28: Zimbabwe
was visa-required but had no transit-visa note. It now uses the same
visa-required-with-transit-visa rule as the other 28. Zimbabwean nationals
needed a visa to enter Ireland before this change and still do; only the
transit note is new.

The page was last updated on 24 July 2026, after the transit list was
transcribed. So either Zimbabwe was added then, or the original extraction
missed it. The page gives no date, and the statute-book snapshot shows no
amendment Order newer than S.I. 242/2026. To date it, check S.I. 17/2026
and S.I. 242/2026 on irishstatutebook.ie for a Schedule 5 entry for
Zimbabwe.

## Evidence

INIS "Transit (including Transfer Visa) Advice" (`transitVisa`), section
"Transit Visa Required Countries", the last entry of the list:

> Zimbabwe

The same page:

> This page was last updated on July 24, 2026

## Checked

The maintainer read the live page on 2026-10-23 and pasted it here. Every
other name on the list matches `ireland.ts`. The maintainer also pasted the full INIS nationality table (206 rows) the same day. Every row's visa-required status matches `ireland.ts`, including these countries (all "Yes"). `lastVerified` in `ireland.ts`
was bumped to 2026-10-23, and so was `dateChecked` on the transit-visa
source.
