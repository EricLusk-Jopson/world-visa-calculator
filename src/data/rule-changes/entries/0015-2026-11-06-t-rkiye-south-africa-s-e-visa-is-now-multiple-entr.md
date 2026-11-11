---
id: 15
title: "Türkiye: South Africa's e-Visa is now multiple-entry, via dtvgroup.com.tr"
recorded: 2026-11-06
trigger:
  type: report
  ref: 2026-11-06
evidence:
  - region: Turkiye
    link: mfaVisaInfo
changes:
  - region: turkiye
    path: passportRules.ZA
    before: "entitled: 30 days per visit, 1 condition, e_visa · 1 note"
    after: "entitled: 30 days per visit, 1 condition, e_visa · 1 note (details changed)"
---

## What changed and why

Türkiye changed how South African ordinary passport holders get the e-Visa.
It used to be "one month period single entry visas via the website
www.evisa.gov.tr"; it is now "multiple entry e-visas that allow a 30-day
stay via the website https://dtvgroup.com.tr". The stay allowed is the same,
30 days per visit, so the limit didn't change. The rule's e-Visa is now
multiple-entry, its application link points to dtvgroup.com.tr (cited as
the new `eVisaSouthAfrica` source), and its note quotes the new terms,
including the 90-day multiple-entry sticker visa from Turkish
representations abroad.

## Evidence

Source-check report 2026-11-06, `mfaVisaInfo` diff. The MFA's "Visa
Information for Foreigners" page, South Africa paragraph:

> South Africa: Ordinary passport holders are required to have visa to
> enter Türkiye. They can obtain multiple entry sticker visas that allow a
> 90-day stay from Turkish representations abroad or multiple entry e-visas
> that allow a 30-day stay via the website https://dtvgroup.com.tr.
> Official passport holders are exempted from visa for their stays of up to
> 30 days.

## Checked

The paragraph was read on the live MFA page on 2026-11-06 and matches the
diff. `lastChanged` and `lastVerified` in `turkiye.ts`, and `mfaVisaInfo`'s
`dateChecked`, set to 2026-11-06.
