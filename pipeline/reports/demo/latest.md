# Source Verification Report

Generated: 2026-10-08T00:07:56.103Z

## Summary

| | |
|---|---|
| Unique links checked | 5 |
| 🔴 Broken | 2 |
| ↪️ Redirected | 0 |
| Content sources diffed (`parseForRules`) | 3 |
| ✏️ Changed since last baseline | 2 |
| 🆕 First run (no baseline yet) | 0 |
| ⚠️ Fetch errors | 0 |

## Demo

### Link health

| Used by | Status | URL |
|---|---|---|
| ruleList | ✅ live (200) | http://127.0.0.1:47819/ruleList.html |
| docVault (directUrl) | 🔴 broken (404) | http://127.0.0.1:47819/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf |
| docVault (parentUrl) | ✅ live (200) | http://127.0.0.1:47819/docVault.html |
| stable | ✅ live (200) | http://127.0.0.1:47819/stable.html |
| brokenInRun2 | 🔴 broken (404) | http://127.0.0.1:47819/brokenInRun2.html |

### Content diffing

#### ruleList — ✏️ text changed

URL: http://127.0.0.1:47819/ruleList.html
<br>Last-updated metadata: `2026-04-01T10:00:00Z` → `2026-10-01T09:30:00Z`

```diff
+ Azerbaijan
```

#### docVault — 🔗 link target changed

URL: http://127.0.0.1:47819/docVault.html

| Change | Anchor text | Previous target | Current target |
|---|---|---|---|
| target-changed | Annex 7b | http://127.0.0.1:47819/document/download/7337515c-60a1-4510-b639-80de714f543e_en?filename=Annex%207b_en.pdf | http://127.0.0.1:47819/document/download/9f1c22a0-aaaa-4bbb-9ccc-123456789abc_en?filename=Annex%207b_en.pdf |

| Keys | Status | URL |
|---|---|---|
| stable | ✅ unchanged | http://127.0.0.1:47819/stable.html |
