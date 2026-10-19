---
region: UK
lastReviewed: 2026-10-19
links:
  - id: standardVisitor
    url: https://www.gov.uk/standard-visitor
    loadBearing: true
    category: html-page
    revisions: in-place
    access: open
    machineCheck: link-only
    diffConfidence: none
    humanCheck: periodic
  - id: shortStayVisas
    url: https://www.gov.uk/browse/visas-immigration/tourist-short-stay-visas
    loadBearing: false
    category: index
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

**Rules:** `src/data/regions/uk.ts` · **Sources:** `UKSources` (`standardVisitor`, `visaNationalList`, `etaNationalList`, `carriersList`, `etaApplication`, `ctaGuidance`)

GOV.UK publishes the Immigration Rules appendices as ordinary HTML pages,
edited in place whenever a Statement of Changes takes effect. These are the
easiest sources in the app: the rule text is in the page, and the diff shows
it.

## Provenance

Transcribed by hand from Appendix Visitor: Visa National List, Appendix ETA
National List and the carriers' DATV list, 2026-04-14. ETA rollout phases
are in the header of `uk.ts`. Irish citizens are free movement under the
CTA. Stays are 180 days per visit, not a rolling window.

## standardVisitor

**Establishes:** the 180-days-per-visit limit for visa-exempt visitors (the
region rule).

**Machine:** health-checked only. It's guidance, not a statutory rule, and
gets copy edits too often to be worth diffing.

**Human:** open the page and confirm "up to 6 months" per visit.

**Real change vs noise:** not diffed.

**Human work:** a quick periodic look, e.g. quarterly.

## shortStayVisas

**Establishes:** nothing. It's the browse page above `standardVisitor`.

**Machine:** health-checked only.

**Human:** navigate from here.

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
