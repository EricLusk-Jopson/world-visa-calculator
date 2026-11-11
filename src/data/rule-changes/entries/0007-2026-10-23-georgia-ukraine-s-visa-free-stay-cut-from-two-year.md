---
id: 7
title: "Georgia: Ukraine's visa-free stay cut from two years to one"
recorded: 2026-10-23
trigger:
  type: report
  ref: 2026-10-23
evidence:
  - region: Georgia
    link: visaList
  - region: Georgia
    link: visaListApi
changes:
  - region: georgia
    path: passportRules.UA
    before: "entitled: 730 days per visit"
    after: "entitled: 365 days per visit"
---

## What changed and why

Georgia's visa-free list now gives Ukraine "Full 1 (one) year", the same as
almost every other country on it. Before, Ukraine was the only country with
"Full 2 (two) years". The app modelled that as 730 days per visit and now
uses 365, like the other one-year entries. The two-year tier is no longer
used, so it was removed from `georgia.ts`. The source gives no effective
date.

## Evidence

Content API copy of the list (`visaListApi`), in the 2026-10-23 source-check
diff for Ukraine's row:

> \- Full 2 (two) years
> \+ Full 1 (one) year

Rendered visa-free list (`visaList`,
https://www.geoconsul.gov.ge/en/HtmlPage/html/View?id=25), Ukraine's
"The maximum period of stay without visa" cell:

> Full 1 (one) year

## Checked

The maintainer confirmed the row on the live rendered page on 2026-10-23,
following the playbook's Human steps for `visaList`. `lastVerified` in
`georgia.ts` was bumped to 2026-10-23, and so was `dateChecked` on
`GeorgiaSources.visaList`.
