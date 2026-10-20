---
region: Albania
lastReviewed: 2026-10-20
links:
  - id: visaTable
    url: https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/
    loadBearing: true
    category: interactive
    revisions: in-place
    access: bot-protected
    machineCheck: link-only
    diffConfidence: none
    humanCheck: manual-only
    checkedVia: visaTableCountries
  - id: visaTableCountries
    url: https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/#{key}
    loadBearing: true
    category: machine-copy
    revisions: in-place
    access: bot-protected
    machineCheck: resolver
    diffConfidence: high
    humanCheck: manual-only
  - id: visaRegime
    url: https://punetejashtme.gov.al/en/regjimi-i-vizave-per-te-huajt/
    loadBearing: false
    category: html-page
    revisions: in-place
    access: bot-protected
    machineCheck: diff
    diffConfidence: low
    humanCheck: manual-only
---

# Albania

**Rules:** `src/data/regions/albania.ts` · **Sources:** `AlbaniaSources` (166 entries, all citing the same three links)

The Albanian MFA has no per-country pages. One page holds a country table
filled in by script from an inline `countryData` object. Everything rests on
that page.

**Status (Oct 2026):** the whole site sits behind Imperva Incapsula. It
blocks the pipeline's HTTP client and a headless browser, so both pages show
as 🚫 blocked in every report. Nothing here is machine-checked in practice.
Albania needs a **manual check each cycle** (steps below; it takes about
five minutes).

## Provenance

The rules were extracted by an earlier Playwright script that evaluated
`countryData` with `currentLanguage = "en"`. It mapped `visaC.kombetare`
(national passport, short-stay C visa) to visa-required when it read
"WITH VISA" and to visa-free otherwise. "Visa Free" got the standard 90/180
allowance, since the source gives no duration. Data quirks are listed in the
header of `albania.ts`:

- Gibraltar is excluded.
- "Kongo" is mapped to CG.
- South Sudan is a content gap.

## visaTable

**Establishes:** every Albania rule. The national-passport short-stay
status is in the A/C visa row, under the NATIONAL PASSPORT column.

**Machine:** health-checked only. The table isn't in the page text; see
`visaTableCountries`.

**Human:** open the page in a normal browser. If you get an "Incapsula
incident" page, wait and retry later. Pick a country in the dropdown. The
"A-AIRPORT VISA / C-SHORT TERM VISA" row's NATIONAL PASSPORT cell is the
rule: WITH VISA means visa required, WITHOUT VISA means visa-free. To check
every country at once, paste this into the devtools console on the English
page:

```js
const names = Object.fromEntries([...document.querySelectorAll('#country option[value]')]
  .map(o => [o.value, o.textContent.trim()]));
const rows = Object.entries(countryData).map(([slug, c]) => ({
  country: names[slug] ?? slug, slug,
  nationalC: c.visaC.kombetare, nationalD: c.visaD.kombetare,
  note: (c.visaAC.aplikimVisaAC || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
}));
console.table(rows);
copy(JSON.stringify(rows, null, 1)); // on the clipboard, to hand to Claude for comparison with albania.ts
```

`countryData` is a top-level `const` in the page's inline script, so the
console can see it. The English page has already resolved the
`currentLanguage` choices, so the values are in English.

**Real change vs noise:** a real change is a `nationalC` value flipping
between WITH VISA and WITHOUT VISA, or a new note in the A/C application cell.

- Seasonal visa-free windows appear only as note text, e.g. Saudi Arabia and
  Qatar: "VISA-FREE REGIME ONLY FOR THE TOURIST SEASON 15.04.2026 TO
  31.12.2026", while their `nationalC` reads WITHOUT VISA. When a season
  ends, `nationalC` flips back. `albania.ts` models the season as a
  TemporalWindow (tourism only), so a flip back at the season's end is
  expected, not a change. A new season (new dates in the note) is a rule
  change: append a new window.
- Bahrain still shows a stale 2024 season note under WITH VISA. That's
  noise.
- Changes to fees, D-visa rows or "where to apply" are not rules this app
  models.

**Human work:** manual check each cycle while the site blocks the pipeline.

## visaTableCountries

**Establishes:** the same rules, one snapshot per nationality.

**Machine:** the `punetejashtme.gov.al` resolver
(`pipeline/src/resolvers/punetejashtmeGovAl.ts`). It parses `countryData` as
data and never runs it. It maps the selector's English names to ISO codes,
using `ALIASES` for "R0MANIA", "SLLOVENIA", "PHILIPPINE" and similar. Each
country's entry is diffed as labelled lines, keyed by nationality, and the
country list itself is diffed as `…#countries`. It is tested against a saved
copy of the page (`pipeline/fixtures/punetejashtme-gov-al/table.html`). On
that copy, every country's national C status matched `albania.ts`.

**Human:** as for `visaTable`.

**Real change vs noise:** if a run ever gets through, a line reading
`A/C (short-stay) visa, national passport: WITH VISA` → `WITHOUT VISA` (or
the reverse) is a rule change. Fee, D-visa, children's and "where to apply"
lines are not. A name the resolver doesn't recognise shows up as a note on
the country list; add it to `ALIASES`.

**Human work:** none while it works; it's blocked as of Oct 2026.

## visaRegime

**Establishes:** nothing directly. It's the general visa-regime overview
(entry conditions, links to the table), cited as the parent.

**Machine:** diffed as a page, but blocked like the rest of the site.

**Human:** open it and skim for announcements of new visa-free regimes or
seasonal waivers. These are sometimes announced here before the table
changes.

**Real change vs noise:** a new announcement paragraph is worth a look.
Layout and date-stamp changes are noise.

**Human work:** skim during the manual check.

## Open questions

- Could a non-headless browser on the maintainer's machine get past Incapsula? Deferred by choice (Oct 2026).
