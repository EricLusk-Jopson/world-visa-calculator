---
name: review-user-reports
description: Work through "Report a problem" submissions from the app's source links (exported from the analytics sheet), match each to its source and playbook, and resolve it as a rule change, a link fix, or no issue. Use when the user pastes or exports user reports.
---

# Review user reports

The app's source popover sends `source_issue_reported` events to the
analytics sheet. Each has `region`, `key` (the SourceDoc key), `url`,
`kind` (`broken-link | wrong-info | other`), an optional `message`, and a
timestamp. The user pastes the rows, or a CSV export, into the session.

## For each report

1. Find the SourceDoc: `<Region>Sources.<key>` in `src/data/sources.ts`.
   Then find its playbook link: `docs/sources/<region>.md`, matched by URL.
2. Classify the report:
   - **`broken-link`**: compare with the latest report's link health for
     that URL. Broken there too means fix the URL in `sources.ts` and the
     playbook. Live there means it's probably the user's network; note it
     and move on. Blocked: see the playbook's `access` field.
   - **`wrong-info`**: read the message, then check the live source with the
     playbook's **Human** steps. Ask the user if you can't reach it.
     - The source supports the user: run `/record-rule-change` with trigger
       `user-report:<date or sheet row>`.
     - The source supports the app: no change.
     - Unclear: list it for the user.
   - **Spam or nonsense**: drop it.
3. Duplicates of the same issue resolve together.

## Record outcomes

Append to `pipeline/user-reports/<YYYY-MM-DD>.yml`, dated the day of
review:

```yaml
- received: 2026-11-03
  region: Albania
  key: SA
  kind: wrong-info
  message: "Saudi visa-free ended in December"
  outcome: rule-change        # rule-change | link-fixed | no-issue | unclear | spam
  ruleChange: 7               # when outcome is rule-change
```

Don't record personal data. The form collects none; drop anything a
message volunteers.

Finish with a summary: how many reports, outcomes, and what's left for the
user to check.
