---
id: 1
title: "Türkiye: nine \"90 days from first entry\" entries become the 90/180 rolling window"
recorded: 2026-07-22
backfilled: true
trigger:
  type: manual
  ref: review of Law No. 6458 Art. 11(1) against the MFA's wording
evidence:
  - region: Turkiye
    link: mfaVisaInfo
changes:
  - { region: turkiye, path: passportRules.AL, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 1 note" }
  - { region: turkiye, path: passportRules.EE, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 1 note" }
  - { region: turkiye, path: passportRules.JO, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 2 notes" }
  - { region: turkiye, path: passportRules.XK, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 2 notes" }
  - { region: turkiye, path: passportRules.LB, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 2 notes" }
  - { region: turkiye, path: passportRules.ME, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 1 note" }
  - { region: turkiye, path: passportRules.PY, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 1 note" }
  - { region: turkiye, path: passportRules.QA, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 2 notes" }
  - { region: turkiye, path: passportRules.RS, before: "entitled: 90 days within 180 from entry", after: "entitled: 90/180 rolling · 2 notes" }
---

## What changed and why

Nine Türkiye entries (AL, EE, JO, XK, LB, ME, PY, QA, RS) had been encoded
as a fixed window anchored to first entry, because the MFA page words them
"within 180 days from first entry". Article 11(1) of Law No. 6458 caps
every visa exemption at 90 days in 180 whatever the wording, so the
phrasing is drafting variance, not a reset mechanic. They now use the
standard 90/180 rolling window, which under-promises if anything (the safer
failure for a compliance tool).

The source didn't change. This corrected how it was read.

## Evidence

Law No. 6458 Art. 11(1), and the MFA's per-country paragraphs (`mfaVisaInfo`).
Commit 029f0b9. Announced on /updates for July 31 to August 13, 2026.

## Checked

Backfilled from git history when the log was started.
