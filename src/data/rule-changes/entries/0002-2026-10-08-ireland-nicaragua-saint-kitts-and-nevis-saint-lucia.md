---
id: 2
title: "Ireland: Nicaragua, Saint Kitts and Nevis and Saint Lucia now need visas (S.I. No. 242 of 2026)"
recorded: 2026-10-08
effective: 2026-06-15
backfilled: true
trigger:
  type: external
  ref: https://www.irishstatutebook.ie/ (S.I. No. 242 of 2026, Immigration Act 2004 (Visas) (Amendment) (No. 2) Order 2026)
evidence:
  - region: Ireland
    link: statutoryInstrument
  - region: Ireland
    link: amendmentSearchApi
changes:
  - { region: ireland, path: passportRules.NI, before: "entitled: 90 days per visit", after: "visa required · 1 note" }
  - { region: ireland, path: passportRules.KN, before: "entitled: 90 days per visit", after: "visa required · 1 note" }
  - { region: ireland, path: passportRules.LC, before: "entitled: 90 days per visit", after: "visa required · 1 note" }
---

## What changed and why

The Immigration Act 2004 (Visas) (Amendment) (No. 2) Order 2026 (S.I. No. 242
of 2026, in operation 15 June 2026) moved Nicaragua, Saint Kitts and Nevis and
Saint Lucia from visa-free to visa-required, with a transit visa (Schedule 5).
The app had them visa-free from the INIS table extracted on 2026-05-27, before
the Order took effect.

This is the kind of change the playbook calls `separate-amendments`. The
statute book's amendment search (`amendmentSearchApi`) is now diffed so a
future Order is flagged.

## Evidence

S.I. No. 242 of 2026 on irishstatutebook.ie. Commits 4f9730f and 914a7f0.

## Checked

Backfilled from git history when the log was started.
