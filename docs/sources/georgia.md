---
region: Georgia
lastReviewed: 2026-10-19
links:
  - id: visaList
    url: https://www.geoconsul.gov.ge/en/HtmlPage/html/View?id=25
    loadBearing: true
    category: html-page
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
    checkedVia: visaListApi
  - id: visaListApi
    url: https://gc-api.mfa.gov.ge/v1/PageContent/custom-html?Id=25
    loadBearing: true
    category: machine-copy
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: enteringGeorgia
    url: https://geoconsul.gov.ge/en/entering-georgia
    loadBearing: false
    category: index
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# Georgia

**Rules:** `src/data/regions/georgia.ts` · **Sources:** `GeorgiaSources.visaList` (one entry)

The consulate's list of countries whose citizens may enter Georgia without a
visa, with a stay duration per country (mostly one year). geoconsul.gov.ge
pages are an empty shell that scripts fill from the consulate's content API,
so the API is what gets diffed.

## Provenance

The rules were transcribed from the duration table at
`geoconsul.gov.ge/en/entering-georgia-visa`. That page was replaced as the
cited source by `HtmlPage …?id=25` on 2026-10-15. Quirks are in the header of
`georgia.ts`:

- One year is modelled as 365 days and two years as 730.
- Chile and North Macedonia get a rolling 90/180.
- Iran gets 45 days and Uruguay 90 days per visit.
- In the pasted table, North Macedonia's and Russia's rows were swapped;
  this was corrected with the user.
- Territory rows are excluded.

The underlying law is matsne.gov.ge document 2867361 ("On Approval of the
List of Countries Whose Citizens May Enter Georgia without a Visa"). It's
cited as a comment in `georgia.ts`, not as a source.

## visaList

**Establishes:** every Georgia rule: which countries, and for how long.

**Machine:** health-checked only. The HTML is an empty shell; see
`visaListApi`.

**Human:** open the page in a browser and wait for the table to render. Each
row is a country and its maximum stay. An asterisk means EU citizens may use
an ID card; that doesn't affect the stay.

**Real change vs noise:** see `visaListApi`.

**Human work:** none unless `visaListApi` flags something.

## visaListApi

**Establishes:** the same content, as the JSON the page is built from.

**Machine:** diffed. The JSON's HTML values are extracted as text and links
(`HTML_IN_JSON_HOSTS` in `pipeline/src/contentCheck.ts`).

**Human:** open the URL in a browser to see the raw JSON. The table is
inside an HTML string.

**Real change vs noise:**

- **Rule change:** a country added or removed, or a duration changed (e.g.
  "Full 1 (one) year" → "90 days").
- **Noise:** styling attributes and image data inside the HTML string, which
  are mostly dropped.

**Human work:** confirm on the rendered page and update `georgia.ts`.

## enteringGeorgia

**Establishes:** nothing directly. It's the consulate's overview of entry
rules, cited for people to navigate from.

**Machine:** health-checked only. It's script-rendered, and no API copy is
wired up.

**Human:** browse from here to the visa-free list.

**Real change vs noise:** not diffed.

**Human work:** none.

## Open questions

- TODO(human): should the matsne.gov.ge law be diffed too, as a second signal for list changes? Amendments would appear as new consolidated publications there.
