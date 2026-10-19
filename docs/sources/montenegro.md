---
region: Montenegro
lastReviewed: 2026-10-19
links:
  - id: index
    url: https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: countryPages
    urlPrefix: https://www.gov.me/en/diplomatic-missions/embassies-and-consulates-of-montenegro/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
---

# Montenegro

**Rules:** `src/data/regions/montenegro.ts` · **Sources:** `MontenegroSources` (196 entries, one page per nationality)

Each nationality has a page under "Embassies and consulates of Montenegro
and visa regimes for foreign citizens". It combines the mission's contact
details with a "Visas" section.

## Provenance

In 2026-08, the 196 pages were scraped and extracted twice, independently,
then classified. Decisions are in the header of `montenegro.ts`:

- "Up to 90 days" is modelled as a rolling 90/180.
- CV, MZ and PK have no Visas section and default to visa-required.
- AM, EG and UZ had a seasonal waiver that lapsed in October 2025, so it is
  not encoded.
- BY, RU, SA, TR, CN and KZ have dated waivers, modelled as append-only
  TemporalWindows.
- Liberia's page is in Montenegrin only.

**A recorded true positive:** the 2026-10-15 source check flagged Algeria's
page gaining a "Visas" section saying a visa is required. The rule was
updated from that diff.

## index

**Establishes:** no rule. It lists the country pages.

**Machine:** diffed for text and links. A country page added, removed or
renamed shows up as a link change.

**Human:** browse to a country's page from here.

**Real change vs noise:**

- **Worth a look:** a new or removed country link. Update
  `MontenegroSources`; a removed page means that `direct` link breaks.
- **Noise:** menu and footer changes.

**Human work:** update URLs when pages move.

## countryPages

**Establishes:** each nationality's rule (`MontenegroSources.<ISO>.direct`).

**Machine:** each page is diffed for text and links.

**Human:** open the country's page and scroll to the "Visas" section. Read
the ordinary-passport rule and any dated waiver ("until 31 October …").

**Real change vs noise:**

- **Rule change:**
  - the Visas section appears, disappears, or changes visa required ↔ not
    required (as with Algeria);
  - the day count changes;
  - a dated waiver gets a new end date. Append a new TemporalWindow; never
    edit the old one.
- **Noise (most of the page):** the mission's address, phone, email, head of
  mission and working hours.

**Human work:** read the Visas section when the diff touches it. Most diffs
on these pages will be contact-detail churn.

## Open questions

- AM, EG and UZ: their seasonal waivers ended in October 2025. Watch their pages for a renewal.
- TODO(human): consider stripping the mission contact block from snapshots, as North Macedonia's resolver does, to cut noise.
