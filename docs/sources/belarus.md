---
region: Belarus
lastReviewed: 2026-10-19
links:
  - id: general
    url: https://mfa.gov.by/en/visa/general/
    loadBearing: true
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: freemove
    url: https://mfa.gov.by/en/visa/freemove/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: europe
    url: https://mfa.gov.by/en/visa/freemove/europe/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: airport
    url: https://mfa.gov.by/en/visa/freemove/airport/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: airportPdf
    url: https://mfa.gov.by/kcfinder/upload/files/GKU/21.10.17_List_countries_eng.pdf
    loadBearing: true
    category: document
    revisions: replaced-file
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: periodic
---

# Belarus

**Rules:** `src/data/regions/belarus.ts` · **Sources:** `BelarusSources` (`general`, `europe`, `airport`)

Belarus's rules come in three tiers (see the header of `belarus.ts`):

1. **European any-border override:** 38 countries, 30 days per visit (90 for
   Poland, Latvia and Lithuania). Valid until 31 December 2026, modelled as a
   TemporalWindow.
2. **Airport-only fallback:** for every visa-free nationality. 30 days per
   visit through six named airports, and at most 90 days per calendar year.
3. **Conditional entries:** 12 nationalities need an EU/Schengen visa, so
   they are modelled as visa-required with a note.

## Provenance

Transcribed by hand from the three MFA pages and the airport PDF, 2026-09-12.

## general

**Establishes:** the visa-required default (`defaultRule.source`).

**Machine:** health-checked only. It's a menu of visa subpages, so there's
nothing useful to diff.

**Human:** open it and follow "Visa-free travel" to confirm the overall
structure (airport-only regime, European override) still holds.

**Real change vs noise:** not diffed.

**Human work:** a quick periodic look. A new visa-free scheme would appear
as a new subpage.

## freemove

**Establishes:** nothing. It's the menu linking `europe` and `airport`.

**Machine:** health-checked only.

**Human:** navigate from here. A new entry in this menu means a new scheme.

**Real change vs noise:** not diffed.

**Human work:** none.

## europe

**Establishes:** tier 1, the 38-country override and its end date.

**Machine:** diffed. The sidebar and footer are cut off at "Belarusian
Diplomatic Missions abroad" (`SITE_CONTENT_END` in
`pipeline/src/contentCheck.ts`).

**Human:** open the page. Read the country list, the days per visit, and
the "up to and including 31 December 2026" date.

**Real change vs noise:**

- **Rule change:** the end date extended. Append a new TemporalWindow; don't
  edit the old one.
- **Rule change:** a country added or removed, or the days changed.
- **Noise:** news items in the page body, if any.

**Human work:** confirm and update `belarus.ts`.

## airport

**Establishes:** tier 2 (the airport list and terms) and tier 3 (the
conditional nationalities).

**Machine:** diffed. Same sidebar cut as `europe`.

**Human:** open the page. Read the airports, the 30 days per visit and the
90-days-per-calendar-year terms, and the conditions for the 12 nationalities
that need an EU/Schengen visa.

**Real change vs noise:**

- **Rule change:** an airport added, the terms changed, or the conditional
  list changed.
- **Noise:** layout changes.

**Human work:** confirm and update `belarus.ts`.

## airportPdf

**Establishes:** the visa-free country list itself, which lives in this PDF.

**Machine:** diffed by hash only. A change says that the file changed, not
what changed. If the MFA publishes a new list under a new filename, this
link breaks or goes stale; the filename is dated `21.10.17`.

**Human:** open the PDF and compare its list with the `airportOnly()`
entries in `belarus.ts`.

**Real change vs noise:** any hash change is worth reading. Also watch
`airport` for a link to a newer PDF.

**Human work:** a periodic look for a newer list. A full read whenever the
hash changes.

## Open questions

- The European override ends on 31 December 2026. Check the `europe` page in December for an extension.
