# Working on world-visa-calculator

An Astro site (`astro/`) with a React calculator (`src/`) that applies each
region's visa rules to a traveller's trips, plus a source-verification
pipeline (`pipeline/`, its own package) that checks the government sources
behind those rules every two weeks.

## Where the rules and their sources live

- `src/data/regions/<region>.ts`: each region's rules (`RegionDefinition`).
  The header comment holds provenance and data quirks.
- `src/data/sources.ts`: every source link, as `SourceDoc`s per region, plus
  the `SourceRegions` registry the pipeline reads. Region files never inline
  a URL.
- `docs/sources/<region>.md`: **the source playbooks**. For each link: is it
  load-bearing, what kind of source it is, how the pipeline checks it, how a
  person reads it, what a real rule change looks like there vs known noise,
  and when a human is needed. `docs/sources/OVERVIEW.md` is the generated
  at-a-glance table and the human checklist.
- `src/data/rule-changes/`: **the rule-change log**. Every change to a
  region's rules is a numbered entry with before/after, trigger and evidence
  (see its README). It's shown publicly on /rule-changes (linked from the footer).

## Rules of the road

- **Changing a source in `sources.ts`:** update that region's playbook in
  the same change. `src/data/sourcePlaybooks.test.ts` fails otherwise. Then
  run `npm run playbooks:overview`.
- **Changing a rule in a region file:** record it with `npm run rules:new`,
  fill in the entry's `TODO(entry)` sections, bump the region's
  `lastVerified` and the `dateChecked` of the sources the changed rules cite. The tests fail on an unrecorded or unfinished change.
- **Triaging a source-check report** (`pipeline/reports/<date>.json`): use the
  `/triage-report` skill. For each flagged diff, read the link's playbook
  section first; its "Real change vs noise" part says how to classify it.
  Never change a rule from a diff alone: confirm against the live source
  (the playbook's "Human" steps), and quote the evidence. Verdicts go in
  `pipeline/triage/<date>.yml`; then run `npm run stats`.
- **A source the pipeline can't read** (blocked, script-rendered, link-only):
  the playbook's `humanCheck` says when to look by hand, and its Human steps
  say how.
- Skills: `/triage-report`, `/record-rule-change`, `/verify-region` (the
  by-hand checks) and `/review-user-reports` (submissions from the app).
- **After checking sources by hand:** `npm run sources:verified -- <Region> <key …|--all>`
  sets their `dateChecked`. The app's "Verified" date is that, carried
  forward by quiet source checks (`pipeline/reports/stability.json`) for
  sources whose load-bearing links are all `humanCheck: on-diff`.
- `docs/RUNBOOK.md` is the maintainer's guide: what to do on quiet weeks,
  noisy weeks, changes found by hand, and user reports.
- `docs/sources/STATS.md` is the observed record: per link, how many diffs
  were rule changes vs noise, and which rule changes no diff caught.
- `TODO(human)` in a playbook marks something only the maintainer can
  decide or confirm.

## Commands

- `npm test` (root, vitest): app and data tests, including the playbook checks.
- `npm run playbooks:overview`: regenerate `docs/sources/OVERVIEW.md`.
- `npm run rules:new -- --title … --trigger <type>:<ref> --evidence Region:link`:
  record a rule change. `npm run rules:check` runs the log's tests.
- `npm run sources:verified -- <Region> <key …|--all> [--date YYYY-MM-DD]`:
  record a by-hand check.
- `npm run stats`: regenerate `docs/sources/STATS.md` and
  `pipeline/reports/stability.json` from the reports, triage records and
  rule-change log.
- `cd pipeline && npm run check`: run the source check (needs network to the
  government sites; the cloud sandbox can't reach most of them).
- `cd pipeline && npm test`: pipeline tests.
