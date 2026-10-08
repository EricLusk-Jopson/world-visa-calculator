# EuroVisaCalculator — source verification pipeline

Monthly check that the external sources `sources.ts` points at are (a) still
live and (b) still say what the app assumes they say. Built in the agreed
agile scope: **link health + diffing only, for now.** Semantic/LLM
classification of *which* diffs are rule-relevant is on hold — see "Deferred"
below.

## What it does, per run

1. **Link health.** Every `directUrl` and `parentUrl` in the app's
   `src/data/sources.ts`, in every region with `checkLinks: true`, is
   fetched and classified `live` / `redirected` / `broken` (see "Fetching
   and flaky connections" below). Each unique URL is fetched **once per run**,
   however many entries cite it. Bosnia, Kosovo, North Macedonia and Albania
   each point ~100–200 `SourceDoc` entries at a single page, so ~1,080
   entries come down to ~440 requests. The report lists each URL once, with
   the keys that use it.
2. **Content diffing.** This runs only for entries flagged `parseForRules: true`,
   on the URL named by `parseField` (default `directUrl`). It reuses the
   response body from the link-health fetch, so it adds no extra requests.
   Two independent diffs run against the last committed snapshot:
   - **Text diff.** Block-level text (`li, p, h1-h4, td, th`) inside the
     page's main content region (`#content` → `main` → `body`), one line
     per element.
   - **Link-target diff.** Every link inside that same content region,
     matched run-to-run **by anchor text** and diffed on `href`. This catches
     a "document vault" rotation, where Schengen's Annex 7b PDF link gets a
     new target while the page text, and the anchor text "Annex 7b", stay
     identical. A pure text diff would report nothing; this reports a
     `target-changed` link.

   Non-HTML responses such as PDFs are tracked by SHA-256 hash only.
   Snapshots are stored per URL in `data/snapshots/<host>/<hash>.json`.
3. **Report.** One standardized report per run, broken down **by region,
   then by link**, with health results before diffing results. It is
   written to `reports/<YYYY-MM-DD>.{md,json}` and `reports/latest.{md,json}`,
   plus a findings-only `reports/pr-body.md` (gitignored) that becomes the
   PR description.

## How a run reaches review

`.github/workflows/source-check.yml` runs `npm run check` monthly, and can
also be started manually from the Actions tab (**Run workflow**). It then
commits `reports/` and `data/snapshots/` to the `automation/source-check`
branch and opens a PR, or updates the existing one.

- **PR body:** a summary, plus only the items that need a human look (broken,
  redirected, changed, fetch errors). It is capped under GitHub's body limit.
- **PR preview:** the site's `/source-report` page
  (`astro/pages/source-report.astro`) renders `reports/latest.json` at build
  time. The PR's Vercel preview therefore shows that run's report, with a
  "Needs review" section and a per-region breakdown. Until a real report
  is committed, the page falls back to `reports/demo/latest.json` with a
  banner. The page is `noindex` and excluded from the sitemap.
- **Merging** accepts the new snapshots as the baseline for the next run.
  If the PR is left open, the next run still diffs against the last *merged*
  baseline, so nothing is silently lost.

One-time repo setting: **Settings → Actions → General → Workflow
permissions → "Allow GitHub Actions to create and approve pull requests"**.

## Running it locally

```bash
cd pipeline
npm install

# Real run over regions with checkLinks: true. Updates data/snapshots/ and writes reports/.
# Needs open network egress to gov.uk, eur-lex.europa.eu, gov.me, etc.
npm run check

# Every region, ignoring checkLinks (what the monthly schedule runs).
npm run check -- --all

# Exit non-zero when anything needs review (combines with --all).
npm run check -- --fail-on-findings

# Offline proof: serves fixtures/run1 then fixtures/run2 from a local server
# and runs the same pipeline code against both, simulating "this month" vs
# "next month". Writes reports/demo/.
npm run demo

npm run typecheck
```

The pipeline imports `src/data/sources.ts` directly, using the `@/` alias
mapped in `tsconfig.json` and resolved by `tsx`. There is no copy to keep in
sync.

## Choosing which regions run: `checkLinks`

`SourceRegions`, at the bottom of `src/data/sources.ts`, lists every region
with a `checkLinks` flag. A new region must be added there to be checked.
`checkLinks: false` skips the region entirely: no link health and no
content diffing. Skipped regions are named in the report.

The flag exists so local runs can stay small while you iterate (a full sweep
is ~440 URLs). Right now only Schengen and UK are on.

- The **scheduled** monthly workflow always passes `--all`, so the flag never
  silently drops a region from production monitoring.
- A **manual** run (Actions → Source check → Run workflow) honours the flags
  unless you tick **all_regions**.

## Fetching and flaky connections

A dropped connection shouldn't show up as a dead link, so fetching is
deliberately cautious:

- **Concurrency:** at most 8 requests in flight overall and 2 per host.
  URLs are interleaved across hosts so Serbia's ~195 `mfa.gov.rs` pages
  aren't fetched back to back.
- **Timeouts and retries:** a 30s timeout per request. Network errors,
  timeouts, 429 and 5xx are retried twice, after 2s and 6s.
- **Recheck pass:** after the sweep, every URL that still failed is fetched
  once more, one at a time with a 1s gap. It's reported `broken` only if it
  fails again; a 404 is a 404 either way.
- **Error detail:** errors carry the underlying cause, e.g.
  `fetch failed (ECONNRESET)` or `fetch failed (UND_ERR_CONNECT_TIMEOUT)`,
  not just `fetch failed`.
- **Blocked:** some sites answer automated clients with a bot-protection
  response instead of the page. An HTTP 202 (a WAF JavaScript challenge), or
  a redirect to a known "turned away" page such as EUR-Lex's `/TodayOJ/`
  homepage, is reported as `blocked`, not `live` or `redirected`. The link
  probably works for people, but we couldn't confirm it, and its content is
  never diffed or saved as a baseline. Add new "turned away" pages to
  `BLOCK_LANDINGS` in `src/fetchPage.ts`.
- **Empty pages:** a parsed page with no extractable text (a bot-check
  interstitial or script-rendered shell) is reported as a fetch error. It is
  never saved as the baseline.

`npm run demo` exercises every outcome end to end:

- a genuine text change
- a Schengen-style link-only rotation, parsed via `parseField: 'parentUrl'`,
  where the old PDF `directUrl` also goes broken
- a source that doesn't change
- a link-health-only source that goes dead between runs

## What's flagged `parseForRules`

The flag lives on `SourceDoc` in the app (`src/types/index.ts`). Content
diffing currently covers **Schengen and UK only**: 9 entries, 9 URLs. UK
`standardVisitor` stays off because it is guidance, not a statutory rule.
Every other region is link-health only. Turn a source on once its page
structure has been checked.

On the first real run, every flagged URL reports **first run (baseline
captured)**. Diffs start from the second run, once that baseline PR is merged.

Expect some noise on that second run. Only the GOV.UK pages have been
verified to expose a stable `#content` region. Other sites may carry
dynamic text (dates, counters, session tokens) that shows up as a text
change every month. When a source turns out to be noisy, either set it back
to `parseForRules: false` or tighten `selectContentRoot` in
`src/contentCheck.ts` for that host.

### The Schengen doc-vault case specifically

`src/types.ts` adds a pipeline-only `parseField?: 'directUrl' | 'parentUrl'` on top of the app's `SourceDoc`,
defaulting to `directUrl`, for exactly this case: `SchengenSources.atvSpecific`'s
`directUrl` **is** the PDF itself (expected to rotate on its own, not
meaningful to diff), while `parentUrl` is the landing page whose "Annex 7b"
link is what you'd actually want to watch. The diffing mechanism (link-target
diff via anchor-text matching, as proven in the demo) is ready for this —
it's just not turned on for Schengen yet. To enable it, add the field to the
entry in `src/data/sources.ts` (and to `SourceDoc` in `src/types/index.ts`, or
cast at the call site):

```ts
atvSpecific: {
  directUrl: '...',
  parentUrl: '...',
  dateChecked: '...',
  parseForRules: true,
  parseField: 'parentUrl',
} satisfies SourceDoc,
```

## Known limitation: anchor-text link matching

Link-target diffing matches links across runs by their visible anchor text,
not position or any other identifier. That's deliberate — it's what survives
a document rotation (href changes, "Annex 7b" doesn't). It breaks down if:
a page has two different links with the same anchor text (only one is
tracked, arbitrarily), or if a redesign changes the anchor text itself
(reported as one link "removed" and a different one "added", not matched as
a rename). Neither case has shown up in the regions reviewed so far; worth
knowing about before trusting this against a new source.

## Deferred (explicitly, not forgotten)

- **Semantic/LLM classification** of whether a detected change is actually
  rule-relevant or just cosmetic. This is on hold per the agile scope cut;
  link health and diffing come first.
- **Where the parse-eligibility config should live.** `parseForRules` sits on
  the app's `SourceDoc` while `parseField` is pipeline-only; the split is not
  settled yet.
- **Per-host content selectors** for non-GOV.UK sources, to cut diff noise
  (see above).
