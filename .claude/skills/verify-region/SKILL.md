---
name: verify-region
description: Walk through the by-hand checks for a destination's sources (the links the pipeline can't diff or can't reach), using its playbook, and record the result. Use when the user wants to verify a region, do the periodic manual checks, or check a blocked site such as Albania.
---

# Verify a region by hand

Argument: a region (a `SourceRegions` key, or a playbook file name). With
none, go through the **Human checklist** in `docs/sources/OVERVIEW.md` in
order.

## 1. Plan

- Read `docs/sources/<region>.md`. The links to check are those with
  `humanCheck: periodic` or `manual-only`, plus any load-bearing link the
  latest report shows as broken or blocked when it shouldn't be.
- For each link, take its **Human** steps from the playbook.

## 2. Check

You usually can't reach these sites from the cloud sandbox. Hand each check
to the user as numbered steps: the URL, what to click, what to read, and the
playbook's console snippet if there is one. Ask them to paste back the
result, e.g. the snippet's clipboard output or the relevant text.

Then compare what they paste with `src/data/regions/<region>.ts`:

- **Matches:** say so.
- **Differs:** run `/record-rule-change` with trigger
  `manual:periodic check of <link>` and the pasted text as the evidence
  quote.
- **The site behaves differently from what the playbook says:** update the
  playbook. Examples: new blocking, the table has moved, a new console
  snippet is needed.

## 3. Record

- On confirmation, bump `dateChecked` on the checked `SourceDoc`s in
  `src/data/sources.ts`. For a shared link this means every entry citing it.
- Bump the playbook's `lastReviewed`. Bump `lastVerified` in the region file
  only if every rule was checked.
- If any of these changed, run `npm run playbooks:overview`, then `npm test`.
