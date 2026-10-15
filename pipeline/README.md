# EuroVisaCalculator — source verification pipeline

Biweekly check that the external sources `sources.ts` points at are (a) still
live and (b) still say what the app assumes they say. Built in the agreed
agile scope: **link health + diffing only, for now.** Semantic/LLM
classification of *which* diffs are rule-relevant is on hold — see "Deferred"
below.

## What it does, per run

1. **Link health.** Every link in the app's `src/data/sources.ts` (each
   entry's `direct` and `parent` link, plus any `alternate`), in every region
   with `checkLinks: true`, is fetched and classified `live` / `redirected` /
   `blocked` / `broken` (see "Fetching
   and flaky connections" below). Each unique URL is fetched **once per run**,
   however many entries cite it. Bosnia, North Macedonia and Albania each
   point ~100–200 `SourceDoc` entries at a single page, so ~980 entries
   come down to ~440 requests. (Kosovo's single page is one `visaExempt`
   entry, shared by every Kosovo rule.) The report lists each URL once, with
   the keys that use it.
2. **Content diffing.** This runs only for links with `checkDiff: true`. It
   reuses the response body from the link-health fetch, so it adds no extra
   requests.
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

   JSON responses (e.g. a search API used as a `machine` alternate, even
   when served as `text/plain`) are pretty-printed with sorted keys and
   diffed line by line. Keys that change on every request without the data
   changing (`responseHeader`, `QTime`, `_version_`) are dropped first. Other
   non-HTML responses such as PDFs are tracked by SHA-256 hash only.
   Snapshots are stored per URL in `data/snapshots/<host>/<hash>.json`.
3. **Report.** One standardized report per run, broken down **by region,
   then by link**, with health results before diffing results. It is
   written to `reports/<YYYY-MM-DD>.{md,json}` and `reports/latest.{md,json}`,
   plus a findings-only `reports/pr-body.md` (gitignored) that becomes the
   PR description.

## How a run reaches review

`.github/workflows/source-check.yml` runs `npm run check` every two weeks, on the
changelog's Friday-to-Thursday periods (the first Friday of each period), and can
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
npm exec playwright install chromium   # once, from pipeline/; for sites that turn away plain HTTP clients

# Real run over regions with checkLinks: true. Updates data/snapshots/ and writes reports/.
# Needs open network egress to gov.uk, eur-lex.europa.eu, gov.me, etc.
npm run check

# Every region, ignoring checkLinks (what the biweekly schedule runs).
npm run check -- --all

# Exit non-zero when anything needs review (combines with --all).
npm run check -- --fail-on-findings

# Offline proof: serves fixtures/run1 then fixtures/run2 from a local server
# and runs the same pipeline code against both, simulating "this month" vs
# "next month". Writes reports/demo/.
npm run demo

npm test        # unit tests (node:test via tsx); offline
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

- The **scheduled** biweekly workflow always passes `--all`, so the flag never
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
- **Blocked:** an HTTP 403, or a 202 with no page, is reported `blocked`,
  not `broken` or `live`. Public government pages answering 403 are refusing
  automated clients (e.g. citizensinformation.ie from GitHub's runners), and
  202 is how bot-protection challenges answer, though some sites in a
  degraded mode do the same. The link probably works for people, but we
  couldn't confirm it; the reason names the server when it says (e.g.
  Cloudflare).
- **Site outages:** a redirect to a known outage page is reported `broken`,
  with the outage as the reason. While EUR-Lex is "temporarily not fully
  available" it sends every visitor to its Official Journal homepage
  (`/TodayOJ/`), so people can't reach the regulation either. Add other
  sites' outage pages to `OUTAGE_LANDINGS` in `src/fetchPage.ts`.
- Neither kind of page is diffed or saved as a content baseline.
- **Empty pages:** a parsed page with no extractable text (a bot-check
  interstitial or script-rendered shell) is reported as a fetch error. It is
  never saved as the baseline.

`npm run demo` exercises every outcome end to end:

- a genuine text change
- a Schengen-style link-only rotation, found by diffing the `parent` page,
  where the old PDF `direct` link also goes broken
- a human page that answers with a bot-protection 202 (reported `blocked`)
  while its machine-readable `alternate` is diffed
- a source that doesn't change
- a link-health-only source that goes dead between runs

**`mfa.gov.mk` (North Macedonia).** The MFA's "Do you need a visa?" page is a
Laravel Livewire component with no per-country URLs. Each country button is
`wire:click="changeHardcodedRecord(<id>)"`, and a country's rule only appears
once that call is POSTed to `/livewire/update`. Every NorthMacedoniaSources
entry cites the page as its human link, plus this `machine` alternate:

```
https://mfa.gov.mk/en-GB/konzularni-uslugi/dali-ti-e-potrebna-viza#{key}
```

`{key}` is `<region>/<button id>`, e.g. `africa/51` for Benin. The URL is
only the page's name in the report; the resolver fetches it itself. Each run:

1. GETs every region page (`?region=africa`, … read from the region buttons),
   keeping the Laravel session cookies, and reads the component's
   `wire:snapshot`, the CSRF token and the country buttons.
2. Maps button names to nationality codes: Intl's English country names plus
   `ALIASES` for the site's own spellings ("Tunizi", "DR of the Congo",
   "Côte D 'Ivoire"). A name it can't place is reported as a note.
3. Diffs the button list itself (`…#countries`): a country added, removed,
   renamed or moved between regions, or given a new button id.
4. POSTs each country's call against its region's original snapshot (signed
   by the server, so reusable), one at a time 400 ms apart, and diffs the
   rule panel from the response's `effects.html`, keyed by nationality code.

A 419 from `/livewire/update` means the session or CSRF token was rejected.

**`punetejashtme.gov.al` (Albania).** The MFA's "Visa regime for foreign
citizens" table is filled in by script: picking a country copies its entry
from an inline `const countryData = { 'slug': {...}, … }` into the table, so
every country's rule is in the page's HTML but not in its text. Every
AlbaniaSources entry cites the page as its human link, plus this `machine`
alternate:

```
https://punetejashtme.gov.al/en/informacione-mbi-regjimin-e-vizave-te-shtetasve-te-huaj/#{key}
```

`{key}` is the country's slug on the page, e.g. `arabia-saudite`. Each run
GETs the page once and:

1. Parses `countryData` as data, never running it: only literals are
   accepted, plus `currentLanguage === 'en' ? A : B`, read as A. Any other
   syntax fails discovery with the line it stopped at.
2. Maps slugs to nationality codes through the country selector's English
   names (`<option value="kongo"> CONGO </option>`), with `ALIASES` for the
   site's spellings ("R0MANIA", "SLLOVENIA", "PHILIPPINE").
3. Diffs the country list (`…#countries`), then each country's entry as
   labelled lines: the A/C and D visa status per passport type, fees,
   application notes (e.g. a seasonal visa-free window), where to apply.
   Keyed by nationality code; no further requests are made.

The site is behind Imperva Incapsula, which answers the pipeline's HTTP
client with a 200 block page ("Request unsuccessful. Incapsula incident ID
…"), so it is fetched in a headless browser (below). As of 2026-10-15
Incapsula turns that away too, so both Albania pages are reported 🚫
blocked and are checked by hand; the parser is ready (and tested against a
saved copy of the page) for when a run gets through.

### Sites that turn away plain HTTP clients

Some bot protection blocks any non-browser client, whatever its headers.
The pipeline reports that as 🚫 blocked, including Imperva Incapsula's
block page and its JavaScript challenge (a near-empty page whose script sets
a cookie and reloads), both of which come with a 200 status. For hosts in
`BROWSER_FALLBACK_HOSTS` (`src/fetchPage.ts`), a blocked response is then
retried once in headless Chromium through Playwright (`src/browserFetch.ts`),
one page at a time, giving a challenge up to 20 s to reload into the page. The page's HTML is read back from the DOM, so inline
scripts such as Albania's `countryData` keep their source text. It uses
the Chromium build `npm exec playwright install chromium` fetches (run it in
`pipeline/`, so the build matches the Playwright version installed there),
else the machine's Chrome or Edge. With none of these, the page is reported
blocked, with that hint.

### Incomplete certificate chains

Some servers send their certificate without the intermediate CA that links
it to a trusted root. www.mvp.gov.ba does this; Node then fails with
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`, though browsers open the site fine. On
that error, `src/tlsChain.ts` does what browsers do. It downloads the missing
intermediate from the certificate's "CA Issuers" URL and retries with it
offered for chain building. Certificate verification stays on: the chain
must still end at a trusted root. The host is remembered for the rest of the
run.

## Source links: `direct`, `parent`, `alternate` and `checkDiff`

Every `SourceDoc` in `src/data/sources.ts` has a `direct` and a `parent`
link. Each link is a full object (`SourceLink` in `src/types/index.ts`):

```ts
visaList: {
  direct: {
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A02018R1806-20251230",
    type: "direct",
    checkDiff: false,             // the human page is only health-checked…
    alternate: {                  // …its machine-readable copy is diffed
      url: "https://publications.europa.eu/resource/celex/02018R1806-20251230",
      type: "machine",
      checkDiff: true,
    },
  },
  parent: {
    url: "https://home-affairs.ec.europa.eu/policies/schengen/visa-policy_en",
    type: "parent",
    checkDiff: false,
  },
  dateChecked: "2026-04-08",
} satisfies SourceDoc,
```

- **`type`:** `direct` is the specific regulation or document, `parent` the
  overview page for human navigation, and `machine` a machine-readable copy
  used as an `alternate`.
- **Health checks:** every link is checked, alternates included. Users
  still need the human page to work even when we diff a machine copy.
- **`checkDiff`:** set per link, so any link can be diffed. Diffing a
  landing page instead of the document it links to (the doc-vault case) is
  `checkDiff: true` on `parent`.
- **`alternate`:** use one when the human page can't be fetched or parsed
  automatically (bot protection, client-side rendering). Typically the
  human link gets `checkDiff: false` and the alternate `checkDiff: true`.
  The report shows which link was diffed, e.g. `visaList (direct.alternate)`.

Right now content diffing covers **Schengen and UK only**: 8 URLs. UK
`standardVisitor` (guidance, not a statutory rule) and Schengen `etias`
(rendered client-side) are off. Schengen `visaList` and `atvCommon` diff
their **Cellar** alternates rather than the EUR-Lex pages, which are only
health-checked. Cellar is the Publications Office repository behind EUR-Lex,
and it stayed up during an EUR-Lex outage:

```
https://publications.europa.eu/resource/celex/{CELEX}
```

A CELEX URI identifies the act; Cellar picks the format from the `Accept`
header and the language from `Accept-Language` (the fetcher sends `en`), then
redirects to the document. That redirect is expected, so a URL used only as
a `machine` link is reported `live` when it redirects. Use the same pattern
for any other EUR-Lex source.

On the first run, every newly diffed URL reports **first run (baseline
captured)**. Diffs start from the run after that baseline PR is merged.
When a source turns out to be noisy, either set its `checkDiff` back to
`false` or tighten `selectContentRoot` in `src/contentCheck.ts` for that
host.

### Resolver links: per-country URLs discovered at run time

Some sites have no stable per-country URL to cite. A link with a `resolver`
holds a URL template, and the pipeline fills its `{key}` for each SourceDoc
key before fetching. Resolvers live in `src/resolvers/`.

**`mvp.gov.ba` (Bosnia and Herzegovina).** Every BosniaSources entry cites the
MFA's `/en/vize` index as its human page, plus this `machine` alternate:

```
https://www.mvp.gov.ba/api/subpage/{key}?domain=https://www.mvp.gov.ba
```

`{key}` is the slug the index's country selector opens for that nationality,
e.g. `org_cmd57sdlc000nn43u2rk8pgsd_639142770283664500` for Canada. The slug
ends in a .NET timestamp and changes when a page is republished, so each run:

1. Fetches the index and reads the selector's `"subpages"` list from the
   Next.js RSC payload (`self.__next_f.push` chunks). The selector's options
   aren't in the server-rendered DOM.
2. Maps each country name to a nationality code with `NAME_TO_ISO` in
   `src/resolvers/mvpGovBa.ts`, which uses the site's own spellings ("Jemen",
   "New Zeland"). A name missing from the table is reported as a note. A
   BosniaSources key with no page is reported as a fetch error, except Taiwan
   and Kosovo, which have no page by design (`NO_PAGE`).
3. Diffs the list itself as `…/en/vize#subpages`. A country added, removed or
   renamed changes its text. A republished page changes its slug, its
   "page dated" (decoded from the slug) and its link target.
4. Fetches every country's API URL and diffs the JSON's `title`, `content`
   (as HTML text and links) and `attachedFiles`, but no layout fields. Each
   country's snapshot is keyed by its nationality code, not by URL, so a
   republished page diffs against its old content.

Every country is fetched on every run, because a page can also be edited
without getting a new slug. If the index can't be read, or lists fewer than
150 countries (the page changed shape), the run uses the previous run's slugs
and reports the list as a fetch error. The site's reverse proxy turns away
non-browser clients, so `src/fetchPage.ts` sends a browser-style User-Agent
(still naming the monitor) to `www.mvp.gov.ba`, and `Accept: application/json`
to its API.

### The Schengen doc-vault case

`SchengenSources.atvSpecific`'s `direct` link **is** the Annex 7b PDF. It
rotates on its own schedule and is only tracked by hash, while its `parent`
is the landing page whose "Annex 7b" link is what you'd actually want to
watch. The link-target diff (anchor-text matching, proven in the demo)
catches a rotation there as a one-line `href` change. To switch over, set
`checkDiff: false` on `direct` and `checkDiff: true` on `parent`.

Two spellings of the same target aren't counted as a link change:
mfa.gov.rs sometimes writes its links through the front controller
(`/index%2ephp/en/…`) and sometimes not (`/en/…`); see `canonicalHref` in
`src/contentCheck.ts`.

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
- **Per-host content selectors** for non-GOV.UK sources, to cut diff noise
  (see above).
