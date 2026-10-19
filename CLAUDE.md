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

## Rules of the road

- **Changing a source in `sources.ts`:** update that region's playbook in
  the same change. `src/data/sourcePlaybooks.test.ts` fails otherwise. Then
  run `npm run playbooks:overview`.
- **Triaging a source-check report** (`pipeline/reports/latest.md`): for each
  flagged diff, read the link's playbook section first. Its "Real change vs
  noise" part says how to classify it. Never change a rule from a diff alone:
  confirm against the live source (the playbook's "Human" steps), and quote
  the evidence.
- **A source the pipeline can't read** (blocked, script-rendered, link-only):
  the playbook's `humanCheck` says when to look by hand, and its Human steps
  say how.
- `TODO(human)` in a playbook marks something only the maintainer can
  decide or confirm.

## Commands

- `npm test` (root, vitest): app and data tests, including the playbook checks.
- `npm run playbooks:overview`: regenerate `docs/sources/OVERVIEW.md`.
- `cd pipeline && npm run check`: run the source check (needs network to the
  government sites; the cloud sandbox can't reach most of them).
- `cd pipeline && npm test`: pipeline tests.
