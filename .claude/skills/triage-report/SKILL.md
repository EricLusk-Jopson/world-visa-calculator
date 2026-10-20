---
name: triage-report
description: Triage a source-check report. For every diff it flagged, decide (using the source playbooks) whether it is a rule change, noise, or unclear, write the verdicts to pipeline/triage/<date>.yml, draft any rule changes, and refresh the stats. Use when the user says "triage the report", "look at the latest report", or names a report date.
---

# Triage a source-check report

Argument: a report date (`YYYY-MM-DD`). With none, use the newest
`pipeline/reports/YYYY-MM-DD.json`.

## 1. Gather

- Read `pipeline/reports/<date>.json`. The flagged diffs are the
  `ruleChecks` with status `text-changed`, `links-changed` or
  `both-changed`. Each has `region`, `url`, `keys`, `textDiffPreview` and
  `linkChanges`.
- Note link-health problems too (`broken`, `redirected`, and `blocked`
  where the playbook doesn't expect it). They aren't triage items, but tell
  the user about them.
- If `pipeline/triage/<date>.yml` already exists, only do the items it
  lacks or marks `unclear`.
- For the full diff of a snapshot, compare the snapshot files the report's
  commit changed: `git log -1 --format=%H -- pipeline/reports/<date>.json`,
  then `git show <commit> -- pipeline/data/snapshots/`.

## 2. Classify each flagged diff

1. Find its playbook link. The region's playbook is
   `docs/sources/<region>.md`. Match the URL:
   - an exact `url`;
   - a `urlPrefix`;
   - a resolver template's text before `{key}`;
   - the URL without its `#fragment`.

   `entryForReportUrl` in `src/data/playbooks.ts` does exactly this.
2. Read that link's **Real change vs noise** section, and compare the diff
   against it.
3. Decide:
   - **`no-rule-change`**: the diff matches a known noise pattern, or
     touches only something the app doesn't model. Pick the `noise` kind:
     `layout | contact-info | date-stamp | url-format | wording |
     not-modelled | pipeline | other`.
   - **`rule-change`**: the diff changes what a rule in
     `src/data/regions/<region>.ts` says (access, days, window, conditions,
     a dated waiver). **Never decide this from the diff alone.** Confirm it
     against the live source using the playbook's **Human** steps. If you
     can't reach the site (the cloud sandbox can't reach most government
     sites), mark it `unclear`, and tell the user exactly what to check
     and how.
   - **`unclear`**: anything you can't settle. Say in `notes` what would
     settle it.
4. For each confirmed rule change, run the `/record-rule-change` flow
   (trigger `report:<date>`). Then put the new entry's id in the item's
   `ruleChange`.

## 3. Write it down

- Write `pipeline/triage/<date>.yml` (format in `pipeline/triage/README.md`):
  one item per flagged diff, `by: ai-assisted`, with a short `notes` line
  quoting the decisive text.
- If a diff revealed new noise, or a site behaving differently, add it to
  the link's playbook section and bump `lastReviewed`. That's how the
  playbooks learn.
- Run `npm run stats` to refresh `docs/sources/STATS.md`, then `npm test`.

## 4. Report back

Give the user a short table: region, link, verdict, why. Lead with anything
they must do by hand: unclear items, blocked load-bearing links, and the
OVERVIEW.md human checklist items due this cycle.
