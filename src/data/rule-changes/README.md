# Rule-change log

Every change to a destination's rules (`src/data/regions/*.ts`) is recorded
here, the way a database records migrations. It answers, for any rule:

- **What changed:** before and after, per passport.
- **When:** when the app changed (`recorded`), and when the rule changed in
  reality (`effective`).
- **Why:** the `trigger`, which is a source-check report, your own review, a
  user's report, or an official publication.
- **On what evidence:** the playbook links in `docs/sources/`, plus a quote
  in the entry's body.

The log is listed publicly under "Rule changes" on /updates.

## How it's enforced

- `state/<region>.json` is the recorded state of each region's rules,
  normalised by `normalize.ts`. It drops `lastVerified` and `sourceUrl`, and
  reduces each source to its key, so fixing a link isn't a rule change.
- `ruleChanges.test.ts` fails when:
  - the rules in `src/data/regions/` differ from `state/`, meaning they
    changed without an entry;
  - an entry is malformed or still has `TODO(entry)` placeholders;
  - a report trigger names a report that doesn't exist in
    `pipeline/reports/`;
  - an evidence link isn't in the region's playbook;
  - a changed region's `lastVerified` is older than its latest entry.

## Recording a change

1. Edit the region file (`src/data/regions/<region>.ts`).
2. Run:

   ```bash
   npm run rules:new -- --title "Albania: Saudi Arabia's visa-free season ends" \
     --trigger report:2026-11-06 \
     --evidence Albania:visaTable \
     --effective 2026-12-31
   ```

   - `--trigger` is `<type>:<ref>`:
     - `report:<date of pipeline/reports/<date>.json>`
     - `manual:<what you were checking>`
     - `user-report:<sheet row or date>`
     - `external:<URL or citation>`
   - `--evidence` is `<SourceRegions key>:<playbook link id>`, and can be
     repeated.

   It writes the next numbered entry in `entries/`, with the before/after of
   every changed passport filled in, and updates `state/`.
3. Fill in the entry's `TODO(entry)` sections: what changed and why, a quote
   from the source, and how it was confirmed.
4. Bump `lastVerified` in the region file.
5. Run `npm test` and commit everything together.

`npm run rules:check` regenerates `summary.json` (the small digest the app reads to show "rules last changed") and runs the log's tests. `rules:new` updates it too.

## Entry format

`entries/NNNN-YYYY-MM-DD-slug.md`, numbered 1, 2, 3… with no gaps. The date
is the `recorded` date.

```yaml
---
id: 4
title: "Montenegro: Algeria's page now publishes its visa rule"
recorded: 2026-10-15
effective: 2026-10-15          # optional: when it changed in reality
trigger: { type: report, ref: 2026-10-15 }
evidence: [{ region: Montenegro, link: countryPages }]
changes:
  - { region: montenegro, path: passportRules.DZ, before: "visa required · 1 note", after: "visa required" }
---
## What changed and why
## Evidence
## Checked
```

`baseline: true` marks the entry that started the log (2026-10-19).
`backfilled: true` marks entries reconstructed from git history for changes
made before it.
