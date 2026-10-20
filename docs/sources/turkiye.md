---
region: Turkiye
lastReviewed: 2026-10-20
links:
  - id: mfaVisaInfo
    url: https://www.mfa.gov.tr/visa-information-for-foreigners.en.mfa
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: consularInfo
    url: https://www.mfa.gov.tr/consular-info.en.mfa
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: on-diff
  - id: eVisa
    url: https://evisa.gov.tr/en
    loadBearing: false
    category: interactive
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# Türkiye

**Rules:** `src/data/regions/turkiye.ts` · **Sources:** `TurkiyeSources` (`mfaVisaInfo`, `eVisaApplication`)

One long MFA page lists every nationality's entry terms alphabetically,
e-Visa tiers included, and every rule cites it. The e-Visa portal is only
the "apply here" link on the e-Visa rules (`applicationUrl`).

## Provenance

Transcribed by hand from the MFA page, 2026-05-27. The main decisions are in
the header of `turkiye.ts`:

- "Within 180 days from first entry" is modelled as a rolling 90/180 (Law
  No. 6458 Art. 11(1)).
- Stacked limits for Indonesia and Belarus.
- Three e-Visa tiers.
- Republic of Cyprus passports need an e-Visa, since border issuance ended on
  2 January 2026.
- Nine nationalities were reclassified from a fixed six-month window to
  90/180; see /updates.

## mfaVisaInfo

**Establishes:** every Türkiye stay rule.

**Machine:** diffed for text and links. It's one long page, so a diff shows
which country's paragraph moved.

**Human:** open the page and find the country's paragraph (alphabetical).
Read the ordinary-passport terms; diplomatic and official terms are
noted only.

**Real change vs noise:**

- **Rule change:** a country's paragraph changes its days, its window ("in
  180 days"), or visa-exempt ↔ e-Visa ↔ visa.
- **Wording-only:** rewording that keeps the meaning, e.g. "within six
  months" ↔ "within 180 days". The app models both the same way.
- **Noise:** the diplomatic and official passport sentences, and site
  template changes.

**Human work:** read the country's paragraph on any diff in it.

## consularInfo

**Establishes:** nothing. It's the consular-information menu above
`mfaVisaInfo`.

**Machine:** diffed, mainly so a renamed or moved visa page shows up as a
link change.

**Human:** navigate from here.

**Real change vs noise:** link changes matter; text changes are noise.

**Human work:** update `TurkiyeSources` if the visa page moves.

## eVisa

**Establishes:** nothing on its own. It's the e-Visa application portal,
linked from the e-Visa rules as where to apply. Which nationalities get an
e-Visa, and on what terms (90-day multiple entry, 30-day single entry, or
conditional on a Schengen/US/UK/IE visa or residence permit), comes from
`mfaVisaInfo`, which every rule cites. Until Oct 2026 the portal was marked
load-bearing and spot-checked by hand each quarter.

**Machine:** health-checked only. The country list sits inside the
application form's stepper, which is filled in by script.

**Human:** go to https://evisa.gov.tr/en → Apply → choose the country of
travel document. The site states the eligibility, validity, stay and
conditions for that nationality, with no account needed.

**Real change vs noise:** not diffed.

**Human work:** only when an `mfaVisaInfo` diff mentions the e-Visa: check
the affected nationalities here.
