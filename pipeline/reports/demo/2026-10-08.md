# Source Verification Report

Generated: 2026-10-08T02:35:40.237Z

## Summary

| | |
|---|---|
| Unique links checked | 7 |
| 🔴 Broken | 2 |
| ↪️ Redirected | 0 |
| 🚫 Blocked (could not verify) | 1 |
| Content sources diffed (`checkDiff`) | 4 |
| ✏️ Changed since last baseline | 3 |
| 🆕 First run (no baseline yet) | 0 |
| ⚠️ Fetch errors | 0 |

## Demo

### Link health

| Used by | Status | URL |
|---|---|---|
| ruleList | ✅ live (200) | http://127.0.0.1:47819/ruleList.html |
| docVault (direct) | 🔴 broken (404) | http://127.0.0.1:47819/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf |
| docVault (parent) | ✅ live (200) | http://127.0.0.1:47819/docVault.html |
| stable, blockedWithAlternate | ✅ live (200) | http://127.0.0.1:47819/stable.html |
| blockedWithAlternate (direct) | 🚫 blocked (202) | http://127.0.0.1:47819/regulation-human.html<br>HTTP 202 with no page: bot-protection challenge or site in degraded mode |
| blockedWithAlternate (direct.alternate) | ✅ live (200) | http://127.0.0.1:47819/regulation.html |
| brokenInRun2 | 🔴 broken (404) | http://127.0.0.1:47819/brokenInRun2.html |

### Content diffing

#### ruleList — ✏️ text changed

URL: http://127.0.0.1:47819/ruleList.html
<br>Last-updated metadata: `2026-04-01T10:00:00Z` → `2026-10-01T09:30:00Z`

```diff
+ Azerbaijan
```

#### docVault (parent) — 🔗 link target changed

URL: http://127.0.0.1:47819/docVault.html

| Change | Anchor text | Previous target | Current target |
|---|---|---|---|
| target-changed | Annex 7b | http://127.0.0.1:47819/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf | http://127.0.0.1:47819/document/download/9f1c22a0-aaaa-4bbb-9ccc-123456789abc_en?filename=Annex%207b_en.pdf |

#### blockedWithAlternate (direct.alternate) — ✏️ text changed

URL: http://127.0.0.1:47819/regulation.html

```diff
+ Azerbaijan
```

| Keys | Status | URL |
|---|---|---|
| stable | ✅ unchanged | http://127.0.0.1:47819/stable.html |
