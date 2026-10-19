---
region: Armenia
lastReviewed: 2026-10-19
links:
  - id: visaFreeList
    url: https://www.mfa.am/en/visafreelist
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: bilateralList
    url: https://www.mfa.am/en/whoneedvisa
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: visaIndex
    url: https://www.mfa.am/en/visa/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# Armenia

**Rules:** `src/data/regions/armenia.ts` · **Sources:** `ArmeniaSources` (two entries)

Two MFA lists:

- **Unilateral list:** about 45 countries whose citizens, on any passport,
  are visa-free for 180 days in any 365.
- **Bilateral/multilateral list:** about 67 rows, each restricted by
  passport type.

## Provenance

Both lists were transcribed by hand. From the bilateral list, only rows
marked "All types of passports" were modelled. They get the same 180/365,
per the MFA's stated general policy. Montenegro's seasonal bilateral row is
superseded by its unilateral entry. Quirks are in the header of
`armenia.ts`, e.g. "Kyrgizstan" is KG and "Slovak" is SK.

## visaFreeList

**Establishes:** the 45 unilateral entries and the visa-required default
(`defaultRule.source`).

**Machine:** diffed for text and links.

**Human:** open the page and read the country list under "citizens … with
all types of passports".

**Real change vs noise:**

- **Rule change:** a country added or removed, or the 180/365 term changed.
- **Noise:** site template changes.

**Human work:** confirm and update `armenia.ts`.

## bilateralList

**Establishes:** the "all types of passports" bilateral entries.

**Machine:** diffed for text and links.

**Human:** open the page. The table lists each country with the passport
types its agreement covers.

**Real change vs noise:**

- **Rule change:** a row added, or its passport types changed to or from
  "All types of passports".
- **Not modelled:** rows for diplomatic, official or service passports only.
  Changes to these don't affect the app.
- **Seasonal:** seasonal notes, like Montenegro's April–October ordinary
  passports. These only matter if the country isn't also on the unilateral
  list.

**Human work:** confirm the row's passport types on any diff.

## visaIndex

**Establishes:** nothing. It's the menu that links both lists.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## Open questions

- None known.
