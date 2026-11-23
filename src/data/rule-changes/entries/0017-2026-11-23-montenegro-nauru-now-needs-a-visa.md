---
id: 17
title: "Montenegro: Nauru now needs a visa"
recorded: 2026-11-23
trigger:
  type: report
  ref: 2026-11-20
evidence:
  - region: Montenegro
    link: countryPages
changes:
  - region: montenegro
    path: passportRules.NR
    before: "entitled: 90/180 rolling"
    after: visa required
---

## What changed and why

Montenegro's page for Nauru changed from visa-free entry for up to 90 days
to visa required. Nauru moves from the standard 90/180 entitlement to
visa required.

## Evidence

Source-check report 2026-11-20, the Nauru page's "Visa regime" section
(`countryPages`). Before:

> Citizens of Nauru may enter, transit through, and stay in Montenegro for
> up to 90 days with a valid travel document, without a visa.

After:

> Citizens of Nauru must possess a visa to enter Montenegro.

## Checked

Not confirmed on the live page: www.gov.me was unreachable on 2026-11-23,
both from the pipeline's sandbox and for the maintainer. The maintainer
decided to act on the diff, whose meaning is unambiguous. Re-read the page
when the site is back. `lastChanged`, `lastVerified` and the NR source's
`dateChecked` set to 2026-11-23.
