---
id: 3
title: "Ireland: add Bahamas and Samoa as visa-free"
recorded: 2026-10-08
backfilled: true
trigger:
  type: manual
  ref: re-check of the INIS table against S.I. 473/2014 Schedule 1
evidence:
  - region: Ireland
    link: visaNationalityList
changes:
  - { region: ireland, path: passportRules.BS, before: "(not listed: default rule)", after: "entitled: 90 days per visit" }
  - { region: ireland, path: passportRules.WS, before: "(not listed: default rule)", after: "entitled: 90 days per visit" }
---

## What changed and why

Bahamas and Samoa are in Schedule 1 (visa-free) and visa-free on the INIS
table, but the original extraction missed them, so they fell through to the
visa-required default. This was an extraction error, not a change at the
source.

## Evidence

INIS visa/non-visa required nationalities table (`visaNationalityList`).
Commit eb19baa.

## Checked

Backfilled from git history when the log was started.
