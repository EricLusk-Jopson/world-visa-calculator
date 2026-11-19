---
region: Ireland
lastReviewed: 2026-10-23
links:
  - id: visaNationalityList
    url: https://www.irishimmigration.ie/visa-non-visa-required-nationalities/
    loadBearing: true
    category: interactive
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: comingToVisit
    url: https://www.irishimmigration.ie/coming-to-visit-ireland/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: euFreeMovement
    url: https://www.irishimmigration.ie/at-the-border/entry-for-eu-eea-and-swiss-citizens/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: comingToLive
    url: https://www.irishimmigration.ie/coming-to-live-in-ireland/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: ctaGuidance
    url: https://www.irishimmigration.ie/at-the-border/common-travel-area/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: bivs
    url: https://www.irishimmigration.ie/coming-to-visit-ireland/british-irish-visa-scheme/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: ssvwp
    url: https://www.irishimmigration.ie/coming-to-visit-ireland/short-stay-visa-waiver-programme/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: transitVisa
    url: https://www.irishimmigration.ie/at-the-border/transit-including-transfer-visa-advice/
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: atTheBorder
    url: https://www.irishimmigration.ie/at-the-border/
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: statutoryInstrument
    url: https://www.irishstatutebook.ie/eli/2014/si/473/made/en/print
    loadBearing: true
    category: document
    revisions: separate-amendments
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
    checkedVia: amendmentSearchApi
  - id: amendmentSearch
    url: https://www.irishstatutebook.ie/eli/ResultsTitle.html?q=Immigration+Act
    loadBearing: false
    category: index
    revisions: in-place
    access: script-rendered
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: amendmentSearchApi
    url: https://www.irishstatutebook.ie/solr/all_leg_title/select?q=immigration+act&wt=json&sort=year+desc&rows=20&omitHeader=true
    loadBearing: true
    category: machine-copy
    revisions: separate-amendments
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
---

# Ireland

**Rules:** `src/data/regions/ireland.ts` · **Sources:** `IrelandSources` (7 entries)

Ireland's legal ground truth is **S.I. No. 473 of 2014**, the Immigration Act
2004 (Visas) Order: Schedules 1–5 list the visa, visa-free and transit-visa
nationalities. The Order as made is never updated. Every change comes as a
separate amendment Order, and the INIS nationality table follows those Orders.

**What a human has to do:** the pipeline diffs only the statute-book search
for new amendment Orders. Every irishimmigration.ie page is link-checked
only. Ireland is the region with the most manual work; plan a short check
each cycle.

## Provenance

The passport rules come from the INIS nationality table, extracted from its
Ninja Table AJAX data on 2026-05-27. On top of that:

- The (No. 2) Order 2026 (S.I. 242/2026, in operation 15 June 2026) moved
  Nicaragua, Saint Kitts and Nevis and Saint Lucia to visa-required with a
  transit visa.
- Bahamas and Samoa were added on 2026-10-08; the original extraction missed
  them.

The BIVS, SSVWP, transit and CTA notes come from the INIS pages below.
Ukraine is in the SSVWP list but is visa-free on INIS, so it gets no SSVWP
note.

## visaNationalityList

**Establishes:** every Irish visa-required or visa-free classification, in
practice.

**Machine:** health-checked only. The table is loaded by AJAX from a Ninja
Table, so a plain fetch doesn't see it.

**Human:** open the page and wait for the table. The table is paginated (20
rows a page), and the page also has a cookie table, so a plain
`table tbody tr` grab gets only the first 20 countries plus cookie rows (as
on 2026-10-23). Run this in the devtools console instead:

```js
const ft = window.FooTable && FooTable.get('table.ninja_footable');
const rows = ft
  ? ft.rows.all.map(r => Object.values(r.value).map(v => String(v).replace(/<[^>]+>/g, '').trim()).join('\t'))
  : [...document.querySelectorAll('table.ninja_footable tbody tr')]
      .map(r => [...r.cells].map(c => c.innerText.trim()).join('\t'));
copy(rows.join('\n'));
rows.length; // about 200 means every page came through
```

It reads every row from Ninja Tables' FooTable instance. If that isn't
available, it falls back to the visible page only. In that case set the
table's rows-per-page to the maximum, or page through and paste each page.
Hand the clipboard to Claude for comparison with `ireland.ts`. On 2026-10-23
a full paste came through (206 rows, including UK sub-categories, Hong Kong
Document of Identity and refugee/stateless rows the app doesn't model) and
matched `ireland.ts`.

**Real change vs noise:** not diffed. The table changes after an amendment
Order, which `amendmentSearchApi` flags first.

**Human work:** check periodically, and whenever `amendmentSearchApi` shows a
new Order.

## comingToVisit

**Establishes:** nothing. It's the INIS "coming to visit" menu, the parent of
most pages here.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## euFreeMovement

**Establishes:** free movement for EU/EEA and Swiss citizens.

**Machine:** health-checked only.

**Human:** skim it. It is very unlikely to change.

**Real change vs noise:** not diffed.

**Human work:** a yearly look is enough.

## comingToLive

**Establishes:** nothing. It's the parent of `euFreeMovement`.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## ctaGuidance

**Establishes:** British citizens' free movement under the Common Travel
Area, and the British Protected Persons exception.

**Machine:** health-checked only.

**Human:** skim it.

**Real change vs noise:** not diffed.

**Human work:** a yearly look.

## bivs

**Establishes:** the British-Irish Visa Scheme note for Indian and Chinese
nationals.

**Machine:** health-checked only.

**Human:** check that the scheme still runs and still covers India and China.
The page (last updated 27 June 2024) limits it to Chinese nationals living in
China (including Hong Kong and Macau) and Indian nationals living in India
when they apply. The app's note doesn't mention residence.

**Real change vs noise:** not diffed.

**Human work:** a periodic look.

## ssvwp

**Establishes:** the Short Stay Visa Waiver Programme note, which lists 19
nationalities.

**Machine:** health-checked only.

**Human:** check the list of countries and the programme's end date. The
SSVWP has run on fixed extensions, so an expiry is a rule change. As of
2026-10-23 (page last updated 9 May 2025), the page states no end date. It
lists 22 countries by region: the 19 with the SSVWP note, India and China
(covered by BIVS), and Ukraine (visa-free since 25 February 2022, note 3).
Note 2 says that for Bahrain, Kuwait, Oman, Qatar, Saudi Arabia and Peru
the UK ETA doesn't count; only a UK visa issued before 1 February 2024 does.
That's modelled as a second note on those six (rule-change 11).

**Real change vs noise:** not diffed.

**Human work:** a periodic look, the most important of the INIS pages.

## transitVisa

**Establishes:** the transit-visa notes (Schedule 5 nationalities).

**Machine:** health-checked only.

**Human:** check the list of transit-visa nationalities against the notes in
`ireland.ts`. On 2026-10-23 (page last updated 24 July 2026) it listed 29,
including Zimbabwe, which the app lacked (rule-change 10). Ethiopia is
starred: no transit visa is needed when travelling directly between Ethiopia
and the US or Canada. That exception isn't modelled.

**Real change vs noise:** not diffed.

**Human work:** a periodic look, and on any new amendment Order.

## atTheBorder

**Establishes:** nothing. It's the parent of `transitVisa`.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## statutoryInstrument

**Establishes:** the legal schedules behind the INIS table.

**Machine:** health-checked only. The Order as made never changes; its
amendments are watched through `amendmentSearchApi`.

**Human:** to know the law in force, read this Order plus every later
"Immigration Act 2004 (Visas) (Amendment) Order" listed on `amendmentSearch`.

**Real change vs noise:** see `amendmentSearchApi`.

**Human work:** none unless a new amendment Order appears.

## amendmentSearch

**Establishes:** nothing directly. It's the statute-book title search for
"Immigration Act" instruments, for people to follow.

**Machine:** health-checked only. Results load client-side; see
`amendmentSearchApi`.

**Human:** open it; the newest Orders are listed first.

**Real change vs noise:** not diffed.

**Human work:** none.

## amendmentSearchApi

**Establishes:** the appearance of new amendment Orders, the earliest
machine signal of an Irish visa-list change.

**Machine:** diffed. It's the Solr query behind the search page, newest
first, so a new Order shows up as a new top entry.

**Human:** open the new Order on irishstatutebook.ie and read which schedule
each country moves to. The "in operation" date is the effective date.

**Real change vs noise:**

- **Rule change:** a new "(Visas) (Amendment) Order".
- **Not rule changes:** other new Immigration Act instruments, e.g. on
  fees, registration or permissions. They're unrelated to visas.

**Human work:** read every new visas Order and update `ireland.ts`. This is
the S.I. 242/2026 pattern.

## Open questions

- TODO(human): diff the INIS guidance pages (`ssvwp`, `bivs`, `transitVisa`)? They're plain HTML. Nobody has tried yet; they may simply never have been turned on.
- TODO(human): diff the Ninja Table's AJAX data URL as a machine alternate for `visaNationalityList`.
