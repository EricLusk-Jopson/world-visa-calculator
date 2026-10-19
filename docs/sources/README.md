# Source playbooks

One file per region (`albania.md`, `uk.md`, …). Each one says, for every
distinct link the region's rules cite:

- whether a rule rests on it (**load-bearing**) or it's only there for
  navigation;
- what kind of source it is and how it publishes changes;
- how the pipeline checks it, and how far to trust that check;
- how a **person** reads it, step by step;
- what a real rule change looks like there, and which diffs are known noise;
- when human work is needed.

They're written so that whoever opens a source-check report, you or Claude
in a Claude Code session, can triage it without remembering how each site
works.

`src/data/sourcePlaybooks.test.ts` keeps them honest. It fails if:

- a URL cited in `src/data/sources.ts` isn't documented, or a documented one
  is no longer cited;
- a link's `machineCheck` disagrees with what `sources.ts` actually does;
- a load-bearing link that nothing diffs is left waiting for a diff;
- a link has no `## <id>` section in the body.

So adding a source means adding it here too.

## Frontmatter

```yaml
region: Albania            # the key in SourceRegions (src/data/sources.ts)
lastReviewed: 2026-10-19   # when this playbook was last checked against the live sites
links:
  - id: visaTable          # unique in the file; the body has a "## visaTable" section
    url: https://…         # or urlPrefix: https://…/ for a set of per-country pages
    loadBearing: true
    category: interactive
    revisions: in-place
    access: bot-protected
    machineCheck: resolver
    diffConfidence: high
    humanCheck: manual-only
    checkedVia: visaTableCountries   # optional; see below
```

An exact `url` entry wins over a `urlPrefix` one. A prefix entry covers
every cited URL starting with it, e.g. Serbia's ~195 country pages.

### `category`: what the page is

| Value | Meaning | Example |
|---|---|---|
| `html-page` | The rule is readable in the page's own text. | UK Appendix Visitor: visa national list |
| `document` | A legal text or file (regulation, statutory instrument, PDF) that the rule is taken from. | Schengen Reg. 2018/1806 on EUR-Lex, Ireland S.I. 473/2014 |
| `interactive` | The rule only appears after using the page: picking a country, clicking a button, or running its script. | North Macedonia's country buttons, Albania's country table |
| `index` | A menu or overview page, for navigation and for spotting pages added or removed. | Serbia's visa-regime index |
| `machine-copy` | A machine-readable copy the pipeline diffs instead of the human page (API, Cellar, Solr). | Georgia's content API |

### `revisions`: how a change gets published

| Value | Meaning | What it means for checking |
|---|---|---|
| `in-place` | The page is edited where it is. | A diff of the page catches it. |
| `consolidated-versions` | Each consolidation is a new document with a new address. The cited one never changes. | Diffing the cited version can't catch a new one. Someone has to look for a newer consolidation. |
| `separate-amendments` | The base text is never updated. Amendments are published as separate instruments. | Watch where amendments get listed (Ireland's Solr search). |
| `replaced-file` | A file (usually a PDF) is replaced or renamed when it changes. | A hash change or a broken link is the signal. Read the new file by hand. |
| `regenerated` | Rendered from a data source on each request; the data changes underneath. | Diff the data (resolver or API), not the page. |

### `access`

- `open`: a plain fetch gets the page.
- `script-rendered`: the HTML is a shell; content arrives by script (hence a `machine-copy` or resolver).
- `bot-protected`: the site refuses automated clients (403, Incapsula). The report shows it as 🚫 blocked.

### `machineCheck`: what the pipeline does with it (checked against `sources.ts`)

- `diff`: fetched and its text or links diffed each run.
- `resolver`: per-country content extracted by a resolver (`pipeline/src/resolvers/`) and diffed per nationality.
- `link-only`: health-checked only.

### `diffConfidence`: declared prior

How likely it is that a real rule change at this link shows up as a flagged
diff: `high`, `medium`, `low`, or `none` (not diffed). This is a judgement,
written down so it can be checked. The observed figures (diffs that were rule
changes, diffs that were noise, rule changes no diff caught) come from the
triage records and stats.

### `checkedVia`

Only for a link the pipeline doesn't diff itself. It names the link whose
diff covers its content, e.g. Bosnia's human page `/en/vize`, whose countries
the resolver reads through the site's API. Without it, a load-bearing link
that nothing diffs must have `humanCheck` set to `periodic` or `manual-only`.

### `humanCheck`: when a person has to look

- `on-diff`: only when the report flags it.
- `periodic`: by hand on a schedule even without a diff, because the diff
  can't be relied on (link-only, low confidence, consolidated versions).
- `manual-only`: the machine can't read it right now (blocked); check it by
  hand on a schedule.

## Body

Each link gets a `## <id>` section with these parts:

- **Establishes**: which rules or keys rest on it.
- **Machine**: how the pipeline reads it, with pointers to the code.
- **Human**: exact steps to read it yourself, including console snippets
  where they help.
- **Real change vs noise**: what a rule change looks like in a diff here,
  and the known noise.
- **Human work**: what still has to be done by hand.

A region file also opens with a summary and a **Provenance** section (how the
current rules were first extracted), and ends with **Open questions** for
anything not yet known. Items marked `TODO(human)` need the maintainer.

## Keeping them current

- Adding or changing a source in `sources.ts`: update the region's playbook
  in the same change (the test enforces the link list).
- After checking a region's sources by hand, or learning something new about
  a site (new noise, new blocking, a new place amendments appear): update
  the playbook and bump `lastReviewed`.
