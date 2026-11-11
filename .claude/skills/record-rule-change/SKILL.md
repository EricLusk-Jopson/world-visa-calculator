---
name: record-rule-change
description: Change a destination's visa rules and record it in the rule-change log, with trigger and evidence. Use whenever a rule in src/data/regions/ must change, whatever prompted it (a report diff, a manual check, a user report, or news of a new law).
---

# Record a rule change

Every change to `src/data/regions/*.ts` goes through the rule-change log
(`src/data/rule-changes/README.md`). The tests fail otherwise.

## 1. Establish the change

- **Trigger:** what prompted it.
  - `report:<YYYY-MM-DD>`: a source-check report.
  - `manual:<what you were checking>`: your own review.
  - `user-report:<sheet row or date>`: a user flagged it.
  - `external:<URL or citation>`: a law or official publication.
- **Evidence:** the playbook link(s) that show the new rule (`docs/sources/<region>.md`),
  and a **verbatim quote** from the live source. Without a quote that the
  user has seen or that you fetched, stop and ask the user to confirm it
  (give them the playbook's Human steps).
- **Effective date:** when the rule changes in reality, if the source says.

## 2. Edit the rules

- Edit `src/data/regions/<region>.ts`, following the conventions in its
  header comment. For example:
  - a renewed seasonal waiver is a new `TemporalWindow` appended after the
    old one, never an edit of it;
  - "from first entry" wording stays a rolling window.
- Update or add the region's tests (`src/data/regions/<region>.test.ts`) to
  pin the new rule.
- If a source link changed too, update `src/data/sources.ts` and the
  playbook (the playbook test enforces it).

## 3. Record it

```bash
npm run rules:new -- --title "<Region>: <what changed>" --trigger <type>:<ref> \
  --evidence <SourceRegions key>:<playbook link id> [--effective YYYY-MM-DD]
```

- Check that the printed before → after lines are what you meant.
- Fill in the new entry's `TODO(entry)` sections: what changed and why; the
  quote and where it is; how it was confirmed.
- Bump `lastVerified` in the region file, and in its header's "Last
  verified" line. Set `lastChanged` (next to it) to the entry's `recorded`
  date; a test checks it against the log.
- Bump `dateChecked` on every SourceDoc the changed rules cite:
  `npm run sources:verified -- <Region> <key …>`. You just checked them. The tests fail otherwise,
  because the app shows "Verified <date> · Rule changed <date>" side by side.
- Run `npm run rules:check` to refresh `summary.json`.
- If the change came from a report, set the triage item's `verdict:
  rule-change` and `ruleChange: <id>`, then run `npm run stats`.
- Run `npm test`.

## 4. Tell the user

Give the entry id, the before → after, and anything they should know, e.g.
a related region that likely needs the same change (Cyprus mirrors
Schengen's Annex I/II).
