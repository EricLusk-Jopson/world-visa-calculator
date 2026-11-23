---
id: 16
title: "Türkiye: Bhutan, Solomon Islands and Vanuatu can get the conditional e-Visa"
recorded: 2026-11-23
trigger:
  type: report
  ref: 2026-11-20
evidence:
  - region: Turkiye
    link: mfaVisaInfo
changes:
  - region: turkiye
    path: passportRules.BT
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: turkiye
    path: passportRules.SB
    before: visa required · 1 note
    after: visa required · 2 notes
  - region: turkiye
    path: passportRules.VU
    before: visa required · 1 note
    after: visa required · 2 notes
---

## What changed and why

Türkiye's MFA rewrote the Bhutan, Solomon Islands and Vanuatu paragraphs.
They no longer offer "15 day period visas" from Turkish representations
abroad. Instead, ordinary and official passport holders get their visas
from Turkish diplomatic or consular representations, and ordinary passport
holders with a valid Schengen, US, UK or Irish visa or residence permit
can get an e-Visa. That's the conditional e-Visa the app already models for
16 other nationalities. All three move to `eVisaConditional`: still visa
required, now with the conditional e-Visa note. The 15-day note is replaced
by the new wording. Guyana and Nauru keep the 15-day note; their
paragraphs didn't change.

## Evidence

Source-check report 2026-11-20, `mfaVisaInfo` diff. The MFA's "Visa
Information for Foreigners" page, identical for all three:

> Bhutan: Ordinary and official passport holders are required to have visa
> to enter Türkiye. Ordinary and official passport holders can get their
> visas from Turkish diplomatic or consular representations abroad.
> Ordinary passport holders who hold a valid Schengen members or USA, UK,
> Ireland visa or residence permit may get their visas via the website
> www.evisa.gov.tr provided that they meet certain conditions.

## Checked

All three paragraphs read on the live MFA page and pasted by the
maintainer on 2026-11-23. `lastChanged` and `lastVerified` in `turkiye.ts`,
and `mfaVisaInfo`'s `dateChecked`, set to 2026-11-23.
