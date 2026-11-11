---
region: NorthMacedonia
lastReviewed: 2026-10-23
links:
  - id: visaPage
    url: https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza
    loadBearing: true
    category: interactive
    revisions: regenerated
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
    checkedVia: countryButtons
  - id: countryButtons
    url: https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza#{key}
    loadBearing: true
    category: machine-copy
    revisions: regenerated
    access: open
    machineCheck: resolver
    diffConfidence: high
    humanCheck: on-diff
---

# North Macedonia

**Rules:** `src/data/regions/macedonia.ts` · **Sources:** `NorthMacedoniaSources` (197 entries, all citing the same two links)

The MFA's "Do you need a visa?" page is a Laravel Livewire component.
Countries are grouped by region tab. Clicking a country's button re-renders a
side panel that says "Visa for foreign citizens: Needed" or "Not needed".
There are no per-country URLs.

## Provenance

A Playwright script clicked every country button and recorded NEEDED or NOT
NEEDED. The source gives no durations, so NOT NEEDED gets the standard
90/180, with a note on every entry saying so. Quirks are in the header of
`macedonia.ts`:

- "Tunizi" is mapped to TN.
- Sudan's panel text reads "South Sudan".
- Hong Kong and Macao have no button, so they default to visa-required.

## visaPage

**Establishes:** every North Macedonia rule, through the country buttons.

**Machine:** health-checked only. Its content is covered by `countryButtons`.

**Human:** open the page, choose the region tab (Africa, Asia, Europe, …),
click the country, and read "Visa for foreign citizens:" in the panel.

**Real change vs noise:** see `countryButtons`.

**Human work:** none unless `countryButtons` flags something.

## countryButtons

**Establishes:** each nationality's rule, one snapshot per ISO code.

**Machine:** the `mfa.gov.mk` resolver (`pipeline/src/resolvers/mfaGovMk.ts`):

1. GETs every region tab with the session cookies.
2. Reads the component's `wire:snapshot`, the CSRF token and the country
   buttons.
3. POSTs each button's `changeHardcodedRecord(id)` call to
   `/livewire/update`, 400 ms apart.
4. Diffs the rule panel from the response's `effects.html`.

Names are mapped with Intl plus `ALIASES`. The country list is diffed as
`…#countries`.

**Real change vs noise:**

- **Rule change:** the panel's "Visa for foreign citizens:" value flips, or
  a new conditions or notes paragraph appears.
- **Noise:** the embassy contact block (phone, address, head of mission) is
  stripped by `withoutContactBlock`, so it shouldn't show at all. If contact
  details leak through, the heading changed; fix the regex rather than
  triaging each one.
- **Bad response:** a 419 response means the session or CSRF token was
  rejected (a pipeline problem, not a change).
- **Unrecognised name:** reported as a note. Add it to `ALIASES`.
- **Site down:** the whole check fails as a `fetch-error` on `…#countries`
  ("Could not read the country buttons: fetch failed") and `visaPage` reports
  broken with `UND_ERR_CONNECT_TIMEOUT`. On 2026-10-23 this was an MFA site
  outage, confirmed by the maintainer in a browser. It isn't a diff, so there's
  nothing to triage. Keep the rules as they are. If the next run fails the same
  way, check the page by hand.

**Human work:** click the country on the live page when its snapshot changes.

## Open questions

- None known.
