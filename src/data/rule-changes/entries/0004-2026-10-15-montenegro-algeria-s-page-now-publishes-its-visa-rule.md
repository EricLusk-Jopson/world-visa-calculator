---
id: 4
title: "Montenegro: Algeria's page now publishes its visa rule"
recorded: 2026-10-15
backfilled: true
trigger:
  type: report
  ref: 2026-10-15
evidence:
  - region: Montenegro
    link: countryPages
changes:
  - { region: montenegro, path: passportRules.DZ, before: "visa required · 1 note", after: "visa required" }
---

## What changed and why

Algeria was one of four content-gap countries with no visa section on its
gov.me page, so the app showed a caveat note saying no rule was published.
The first Montenegro source check found the page now has a "Visas" section.
The outcome (visa required) is unchanged; the caveat note goes.

This is the first rule change found by the source check (a true positive for
Montenegro's `countryPages`).

## Evidence

> The citizens of Algeria must own a visa to be able to enter and stay in Montenegro.

From gov.me's Algeria page, flagged as a text change in the 2026-10-15 report.
Commit 77b9ebc.

## Checked

Backfilled from git history when the log was started.
