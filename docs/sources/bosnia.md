---
region: Bosnia
lastReviewed: 2026-10-19
links:
  - id: vize
    url: https://www.mvp.gov.ba/en/vize
    loadBearing: true
    category: interactive
    revisions: regenerated
    access: open
    machineCheck: diff
    diffConfidence: low
    humanCheck: on-diff
  - id: subpages
    url: https://www.mvp.gov.ba/api/subpage/{key}?domain=https://www.mvp.gov.ba
    loadBearing: true
    category: machine-copy
    revisions: regenerated
    access: open
    machineCheck: resolver
    diffConfidence: high
    humanCheck: on-diff
---

# Bosnia and Herzegovina

**Rules:** `src/data/regions/bosnia.ts` · **Sources:** `BosniaSources` (195 entries, all citing the same two links)

The MFA's `/en/vize` page has a country selector. Picking a country opens
that country's subpage. The subpage URLs change when a page is republished,
so every entry cites the index as both `direct` and `parent`. The pipeline
diffs each country through the site's subpage API.

## Provenance

In 2026-09, 194 per-country pages were scraped into JSON (`officialName`,
`citizenExemptionStatements`, `rawText`, …) and classified by script, with
the odd entries reviewed by hand. Known gaps are in the header of
`bosnia.ts`:

- Kosovo and Taiwan have no page. They default to visa-required.
- Gibraltar is omitted.
- Maldives is read from `rawText`.
- Egypt, Indonesia, Israel, Kazakhstan, Morocco and Thailand exempt only
  diplomatic and official passports.
- Bahrain, Oman and Saudi Arabia have a 1 June – 30 September 2026 waiver,
  modelled as a temporal window.

## vize

**Establishes:** every Bosnia rule, through the country pages its selector
opens.

**Machine:** diffed once, as the `parent` link. The selector's options
aren't in the server-rendered page, so this diff sees only the page text
around it. The countries themselves are covered by `subpages`, and the
country list by its `#subpages` snapshot.

**Human:** open https://www.mvp.gov.ba/en/vize and pick the country in the
selector. Read the exemption statement for ordinary passports, e.g.
"Citizens of … are exempted from the visa requirement … up to 90 days". The
statement on BiH travellers abroad describes the reverse direction; ignore it.

**Real change vs noise:**

- **Worth a look:** a new notice in the page text, e.g. a general visa
  announcement.
- **Rule changes:** these come through `subpages`.

**Human work:** none unless something is flagged.

## subpages

**Establishes:** each nationality's rule, one snapshot per ISO code.

**Machine:** the `mvp.gov.ba` resolver (`pipeline/src/resolvers/mvpGovBa.ts`;
details in `pipeline/README.md`, "Resolver links"):

1. Reads the selector's `"subpages"` list from the page's Next.js RSC payload.
2. Maps the site's names to ISO codes with `NAME_TO_ISO`.
3. Fetches each country's `/api/subpage/<slug>` and diffs its title, content
   and attached files.
4. Diffs the country list itself as `…/en/vize#subpages`.

The site turns away non-browser clients, so a browser-style User-Agent is
sent. Its server sends an incomplete certificate chain, which
`pipeline/src/tlsChain.ts` completes.

**Real change vs noise:**

- **Rule change:** the ordinary-passport exemption sentence changes (days,
  "exempted" ↔ "required"), or a dated waiver appears or ends. Seasonal
  windows like the Gulf states' are announced here.
- **Republished page:** shows on `#subpages` as a new slug and "page dated".
  Not a rule change by itself, but read the country's own diff in the same
  report.
- **Noise:** wording and typo edits, attachment re-uploads with the same
  content, and changes only to the BiH-travellers-abroad section.
- **Unrecognised country name:** reported as a note. Add it to `NAME_TO_ISO`.

**Human work:** read the country's page when its snapshot changes.

## Open questions

- The Bahrain, Oman and Saudi Arabia waiver ended on 30 September 2026. Watch for a renewal and append a new TemporalWindow if one comes.
