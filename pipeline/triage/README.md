# Triage records

One file per source-check report that flagged diffs, named after the report
(`2026-11-06.yml` for `pipeline/reports/2026-11-06.json`). Each flagged diff
gets a verdict:

```yaml
report: 2026-11-06
items:
  - region: Montenegro                     # the report's region (SourceRegions key)
    url: https://www.gov.me/en/…/algeria   # the rule check's url, as in the report
    verdict: rule-change                   # rule-change | no-rule-change | unclear
    ruleChange: 6                          # for rule-change: the rule-change log entry id
    by: ai-assisted                        # human | ai-assisted
    notes: Visas section added; visa required.
  - region: Serbia
    url: https://mfa.gov.rs/en/citizens/travel-serbia/visa-regime/finska
    verdict: no-rule-change
    noise: url-format                      # layout | contact-info | date-stamp | url-format | wording | not-modelled | pipeline | other
    by: ai-assisted
```

- **Verdicts:**
  - Use `unclear` when the live source has to be checked by hand first.
    Change it once that's done.
  - `not-modelled` means the source changed something the app doesn't model,
    such as diplomatic passports or fees.
  - `pipeline` means the diff came from our own extraction, not the source.
- **Validation:** `src/data/triage/triage.test.ts` checks that every item
  matches a diff its report flagged and that each verdict is complete.
- **Statistics:** `npm run stats` (repo root) joins these files with the
  reports and the rule-change log into `docs/sources/STATS.md`, giving
  observed precision and recall per playbook link. The test fails if
  STATS.md is out of date.

In Claude Code, `/triage-report <date>` does the triage.
