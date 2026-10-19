---
region: Serbia
lastReviewed: 2026-10-19
links:
  - id: index
    url: https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: countryPages
    urlPrefix: https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
---

# Serbia

**Rules:** `src/data/regions/serbia.ts` · **Sources:** `SerbiaSources` (197 entries; 194 country pages plus the index)

One "Visa regime" page per nationality under an index, each giving an
ordinary-passport value and a diplomatic/official value. Only the ordinary
value is modelled.

## Provenance

In 2026-08, the 194 country pages were scraped (name, URL,
`ordinaryPassport`, `diplomaticOfficial`), and each entry's shape was
classified from the ordinary-passport text. Decisions are in the header of
`serbia.ts`:

- "90 days in 6 months from first entry" is modelled as a rolling 90/180.
- Bare "up to N days" entries are stacked as per-visit N plus 90/180.
- China's page gives separate CN, HK and MO figures; HK and MO cite the CN page.
- Taiwan has no page. It cites the index and defaults to visa-required.
- Marshall Islands is a content gap.

## index

**Establishes:** no rule directly. It lists the country pages, and Taiwan's
entry falls back to it.

**Machine:** diffed for text and links. A country page added, removed or
renamed shows up as a link change.

**Human:** open it to find a country's page.

**Real change vs noise:**

- **Worth a look:** a new link (a country page added, possibly Taiwan) or a
  removed one (a page moved, so the country's `direct` URL will break next).
- **Noise:** the site writes the same link as `/index%2ephp/en/…` or
  `/en/…` at different times. `canonicalHref` treats these as equal, and
  they only show up as rewritten snapshot files, not as changes.

**Human work:** when a link changes, update the matching `SerbiaSources` URL.

## countryPages

**Establishes:** each nationality's rule (`SerbiaSources.<ISO>.direct`).

**Machine:** each page is diffed for text and links.

**Human:** open the country's page and read the ordinary-passport line, e.g.
"no visa required for up to 90 days in a 6-month period starting from the
date of first entry".

**Real change vs noise:**

- **Rule change:** the ordinary-passport line changes (visa required ↔ not
  required, or the day count).
- **Noise, not modelled:** the diplomatic and official line.
- **Noise:** embassy and consulate links, and the "Bilateral relations" /
  "Visas and Travel Advice" link block, including its index.php rewrites.

**Human work:** read the page when its diff touches the ordinary-passport
line.

## Open questions

- TODO(human): Taiwan has no page. Confirm its rule directly with the MFA, or keep the visa-required default.
