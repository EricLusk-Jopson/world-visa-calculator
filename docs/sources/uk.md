---
region: UK
lastReviewed: 2026-10-20
links:
  - id: appendixVisitor
    url: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-v-visitor
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: standardVisitor
    url: https://www.gov.uk/standard-visitor
    loadBearing: false
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: visaNationalList
    url: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-visitor-visa-national-list
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: immigrationRules
    url: https://www.gov.uk/guidance/immigration-rules
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: etaNationalList
    url: https://www.gov.uk/guidance/immigration-rules/immigration-rules-appendix-eta-national-list
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: eta
    url: https://www.gov.uk/eta
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: carriersList
    url: https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers/uk-visa-requirements-for-international-carriers
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: carriersPublication
    url: https://www.gov.uk/government/publications/uk-visa-requirements-list-for-carriers
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
  - id: etaApply
    url: https://www.gov.uk/eta/apply
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: high
    humanCheck: on-diff
  - id: ctaGuidance
    url: https://www.gov.uk/government/publications/common-travel-area-guidance/common-travel-area-guidance
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: diff
    diffConfidence: medium
    humanCheck: on-diff
  - id: ctaPublication
    url: https://www.gov.uk/government/publications/common-travel-area-guidance
    loadBearing: false
    category: index
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: on-diff
---

# United Kingdom

**Rules:** `src/data/regions/uk.ts` · **Sources:** `UKSources` (`standardVisitor` → `appendixVisitor`, `visaNationalList`, `etaNationalList`, `carriersList`, `etaApplication`, `ctaGuidance`)

GOV.UK publishes the Immigration Rules appendices as ordinary HTML pages,
edited in place whenever a Statement of Changes takes effect. These are the
easiest sources in the app: the rule text is in the page, and the diff shows
it.

## Provenance

The 180-day limit is from Appendix V: Visitor (cited since 2026-10-20; the
Standard Visitor guidance page before). The lists were transcribed by hand
from Appendix Visitor: Visa National List, Appendix ETA
National List and the carriers' DATV list, 2026-04-14. ETA rollout phases
are in the header of `uk.ts`. Irish citizens are free movement under the
CTA. Stays are 180 days per visit, not a rolling window.

## appendixVisitor

**Establishes:** the 180-days-per-visit limit for visitors (the region rule):
Immigration Rules Appendix V: Visitor, V 17.2 ("Period and conditions of
grant for Visitors").

**Machine:** diffed for text and links. GOV.UK collapses each section, but
the text is in the page's HTML, so the diff sees V 17.2.

**Human:** open the page and expand "Period and conditions of grant for
Visitors" for V 17.2. The introduction also says a Standard Visitor stays
"usually for up to 6 months" and "each stay in the UK must not exceed the
permitted length of stay endorsed on the visit visa (usually six months)".

**Real change vs noise:**

- **Rule change:** the Standard Visitor period of grant in V 17.2 (or the
  introduction's "6 months") changes. It only changes through a Statement of
  Changes, listed on `immigrationRules` with its effective date.
- **Noise:** other visitor types (marriage, transit, DVA, academics),
  permitted-activity cross-references, the DVA opening dates, page chrome.

**Human work:** confirm a flagged change against the Statement of Changes,
then update the region rule in `uk.ts`.

## standardVisitor

**Establishes:** nothing on its own. It's GOV.UK's guidance on the Standard
Visitor route ("up to 6 months"), shown as the readable parent of
`appendixVisitor`. Until Oct 2026 it was the cited source for the 6-month
limit and was checked by hand each quarter.

**Machine:** health-checked only. It's guidance and gets copy edits too
often to be worth diffing.

**Human:** a quick place to read the route in plain English.

**Real change vs noise:** not diffed.

**Human work:** none.

## visaNationalList

**Establishes:** which nationalities need a visa to visit
(`visa_required`).

**Machine:** diffed for text and links.

**Human:** open the page. It's an alphabetical list of nationalities, plus
document categories (e.g. certain passports issued by …).

**Real change vs noise:**

- **Rule change:** a nationality added or removed. GOV.UK also shows
  "Updated: <date>", and the Statement of Changes that did it is listed on
  `immigrationRules`.
- **Noise:** GOV.UK page-chrome changes.

**Human work:** confirm and update `uk.ts`. Additions often come with a
transitional period for existing ETA holders; read the Statement.

## immigrationRules

**Establishes:** nothing directly. It's the index of all appendices.

**Machine:** health-checked only.

**Human:** its "Updates to this page" list names each Statement of Changes.
The quickest way to see what changed and when it takes effect.

**Real change vs noise:** not diffed.

**Human work:** none.

## etaNationalList

**Establishes:** which visa-exempt nationalities need an ETA (`preAuth`).

**Machine:** diffed for text and links.

**Human:** open the page; it's a list of nationalities.

**Real change vs noise:**

- **Rule change:** a nationality added or removed.
- **Noise:** page chrome.

**Human work:** confirm and update the ETA `preAuth` in `uk.ts`.

## eta

**Establishes:** nothing directly. It's the ETA guidance page, the parent of
the ETA list and the application page.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## carriersList

**Establishes:** the Direct Airside Transit Visa (DATV) notes on
visa-required nationalities.

**Machine:** diffed for text and links. It's a long document covering visa
nationals, DATV nationals and document exceptions, so diffs can be wide.

**Human:** open it and read the "Direct Airside Transit Visa" nationality
list and its exemptions.

**Real change vs noise:**

- **Rule change:** a nationality added to or removed from the DATV list.
- **Not modelled:** changes to visa-national lists here; they mirror
  `visaNationalList`.
- **Noise:** carrier-procedure text.

**Human work:** read the DATV section on any diff.

## carriersPublication

**Establishes:** nothing. It's the publication page for `carriersList`.

**Machine:** health-checked only.

**Human:** shows the version date.

**Real change vs noise:** not diffed.

**Human work:** none.

## etaApply

**Establishes:** the ETA's cost, validity and multiple-entry terms (`UK_ETA`
in `uk.ts`).

**Machine:** diffed for text and links.

**Human:** open the page and check the fee, the 2-year validity and the
multiple entries.

**Real change vs noise:**

- **Rule change:** the fee changed (it rose from £10 to £16 in 2025), or the
  validity changed.
- **Noise:** page chrome.

**Human work:** confirm and update `UK_ETA`.

## ctaGuidance

**Establishes:** Irish citizens' free movement under the Common Travel Area.

**Machine:** diffed for text and links.

**Human:** open it and read the section on Irish citizens.

**Real change vs noise:** a change to Irish citizens' entry rights would be
a rule change, though it's very unlikely. Other edits are noise.

**Human work:** skim on any diff.

## ctaPublication

**Establishes:** nothing. It's the publication page for `ctaGuidance`.

**Machine:** health-checked only.

**Human:** navigate from here.

**Real change vs noise:** not diffed.

**Human work:** none.

## Open questions

- None known.
