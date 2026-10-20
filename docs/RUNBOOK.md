# Maintainer's runbook: keeping the rules and their sources right

Read this before each biweekly check. It says what runs on its own, what
needs you, and exactly what to do in each kind of week:

- [a quiet week](#a-quiet-week): nothing flagged;
- [a noisy week](#a-noisy-week): diffs, broken links or new errors;
- [a change you found yourself](#you-found-a-change-yourself): news, a
  government announcement, your own reading;
- [user reports](#user-reports): "Report a problem" from the app.

Every week also has a share of [by-hand checks](#by-hand-checks-every-cycle)
for the sources a machine can't vouch for.

Most steps run in a Claude Code session in this repo. Its skills
(`/triage-report`, `/verify-region`, `/record-rule-change`,
`/review-user-reports`) do the reading and bookkeeping. Anything that needs
a government website is yours: the cloud sandbox can't reach most of them.

---

## How it fits together

| Piece | Where | What it does | Who runs it |
|---|---|---|---|
| Source check | `pipeline/`, `.github/workflows/source-check.yml` | Every second Friday (07:30 Vancouver, 14:30 UTC), fetches every source link: is it up (link health), and did its content change since the last run (diff)? | GitHub Actions |
| Report PR | branch `automation/source-check`, label `source-check` | The run's report, the new snapshots, and the app's link and date data. The PR body lists only what needs a look. The Vercel preview's `/source-report` page shows the whole report. | Opened by the workflow; **merged by you** |
| Playbooks | `docs/sources/<region>.md` | Per link: what it establishes, how to read it by hand, what a real change looks like vs noise, and when a person must look (`humanCheck`). | Read by you and Claude |
| Human checklist | `docs/sources/OVERVIEW.md` → "Human checklist" | The links a person has to look at regardless of the report. | You |
| Triage records | `pipeline/triage/<date>.yml` | One verdict per flagged diff: rule change, noise (which kind), or unclear. | `/triage-report` |
| Rule-change log | `src/data/rule-changes/` | Every change to a rule: before/after, what prompted it, evidence. Public at `/rule-changes`. | `/record-rule-change` |
| Stats | `docs/sources/STATS.md` | Per link: how many diffs were real changes vs noise, and which changes no diff caught. | `npm run stats` |
| User reports | the analytics sheet (`source_issue_reported` rows) | What users flag from a source's "Report a problem" form. | `/review-user-reports` |

### What the app's "Verified" date means

Each source's details in the app show **Verified &lt;date&gt;**:

1. **You set the starting point.** When you check a source by hand (or
   change a rule from it), `npm run sources:verified` writes today's date
   into that source's `dateChecked` in `src/data/sources.ts`.
2. **Quiet runs carry it forward.** After that, each source check that
   finds the source's content unchanged moves the shown date to that run's
   date. A diff you triage as "no rule change" counts as unchanged.
3. **Only where a diff can vouch for it.** This applies only to sources
   whose load-bearing links are all `humanCheck: on-diff` in their playbook.
   Sources marked `periodic` or `manual-only` keep the date of your last
   check by hand, because a diff can't see how they change:
   - Schengen and Cyprus cite fixed EUR-Lex consolidated versions; a new
     consolidation appears at a new URL.
   - Albania blocks the pipeline.
   - Several Ireland and Belarus links are marked `periodic`.
4. **A change, or a new baseline, stops the carry-forward.** A diff that
   isn't triaged as noise, or a first run on a new link, freezes the date
   until someone checks the source again.

> **Why Schengen's date only moves monthly.** Its sources are `periodic`, so
> no run can move that date. Only the consolidation check can. Do it, then
> run `npm run sources:verified -- Schengen --all`.
>
> **The same applies to sources a diff covers, for now.** Every
> `dateChecked` today predates the pipeline's first snapshots (Oct 2026). A
> run that finds "unchanged" proves nothing changed since that snapshot, not
> since your last check. The date starts moving once you verify a source and
> a later run finds it unchanged.

The data behind step 2 is `pipeline/reports/stability.json`. The source check
writes it, and `npm run stats` rewrites it after triage. The rule-change log
adds one more line to a source's details, "Rule changed &lt;date&gt; →", when a
rule citing that source changed. A test makes sure the "Verified" date is
never older than that change.

---

## Every cycle: start here

The report PR, titled "Source check: YYYY-MM-DD", arrives on the Friday
that opens a two-week period.

1. **Open the PR and read its body.** If it has nothing under the summary
   except the expected items below, it's [a quiet week](#a-quiet-week).
   Anything else makes it [a noisy week](#a-noisy-week).

   **Expected every run, not news:**
   - 🚫 **blocked:** the two Albania pages (Incapsula; some runs get
     through), `gov.cy/en/information/visas/` (Cyprus), and the EUR-Lex
     pages (HTTP 202 challenge since 2026-10-20; their Cellar copies still
     load);
   - ⚠️ **fetch errors:** the two Albania pages.

   Anything else blocked or erroring is new.
2. **Merge the PR.** It's data: the report, new snapshots, link status and
   carried-forward dates. Merging makes this run the baseline for the next
   one. It doesn't decide anything about rules: a flagged diff stays in the
   report for triage.
3. **Pull, then run `npm run stats`.** It refreshes `STATS.md` and the
   "Verified" date data. Commit whatever changed; `npm test` fails while
   they're stale.
4. **Do this cycle's [by-hand checks](#by-hand-checks-every-cycle).**
5. **If any user reports came in, do [those](#user-reports).**

---

## A quiet week

The report says 0 changed, 0 broken, 0 redirected, with only the expected
blocked items.

**What happens on its own:**
- every link was fetched; nothing went down;
- every diffed source matched its last snapshot;
- once you merge, the "Verified" date of every source you've verified since
  its snapshot moves to this run's date.

**What you do:**
1. Merge the PR, pull, run `npm run stats`, and commit if it changed.
2. Do this cycle's [by-hand checks](#by-hand-checks-every-cycle).

That's it, about 15 minutes without the by-hand checks.

---

## A noisy week

The report flags at least one of these. Merge the PR first (step 2 above),
then handle each kind.

### ✏️ Changed (a diff)

1. In Claude Code, run **`/triage-report <date>`**. For each diff it reads
   the link's playbook ("Real change vs noise") and gives a verdict:
   - **no-rule-change** (noise): layout, contact details, a date stamp, URL
     format, rewording, or something the app doesn't model such as fees or
     diplomatic passports. **Nothing for you to do.**
   - **unclear**: it couldn't settle it, usually because the site has to be
     read by hand. **You** follow the steps it gives (from the playbook's
     "Human" section) and paste back what the page says.
   - **rule-change**: never decided from a diff alone. It needs your
     confirmation against the live page, so it starts as unclear. Once you
     confirm, it runs `/record-rule-change`.
2. **When a rule really changed,** `/record-rule-change` does the following:
   - edits `src/data/regions/<region>.ts`;
   - writes a numbered log entry with your quote as evidence;
   - bumps the sources' `dateChecked` with `npm run sources:verified`;
   - updates the triage verdict.

   **You** review the before → after it prints, then commit and push. The
   change appears on `/rule-changes`.
3. Claude writes the verdicts to `pipeline/triage/<date>.yml` and runs
   `npm run stats`. Commit both.
4. **If the diff showed something new about a site** (new noise, a moved
   table), Claude adds it to the playbook so next time it's recognised.
   Review that edit.

**Your time:** a few minutes per unclear item, plus a review of each rule
change.

### 🔴 Broken or ↪️ redirected link

1. Open the link yourself. Government sites have outages; the pipeline
   already retries, so a break is usually real.
2. If the page moved, find the new address. Then, in the same change:
   - update `src/data/sources.ts`;
   - update the link in the region's playbook (`npm test` fails otherwise);
   - run `npm run playbooks:overview`.
3. A moved page is a re-read: check it still says what the rules say.
   - Same rules: run `npm run sources:verified -- <Region> <key …>`.
   - Different rules: treat it as [a change you found](#you-found-a-change-yourself).
4. If it's down for everyone, wait a cycle. The app already tells users "We
   couldn't reach this link on &lt;date&gt;".

### 🚫 Blocked or ⚠️ fetch error that's new

The site has started refusing the pipeline, or its page changed shape.
1. Read the link's playbook "Machine" section. It names the known fixes:
   - a browser fallback host (`BROWSER_FALLBACK_HOSTS`);
   - an outage landing page (`OUTAGE_LANDINGS`);
   - a resolver that needs a new alias.
2. Ask Claude to look into it. If it can't be fixed, set the link's
   `humanCheck` to `manual-only` in the playbook. It then joins the human
   checklist, as Albania did.

### 🆕 First run

A link diffed for the first time (new source, or `checkDiff` newly on). No
action is needed; its next run diffs against this baseline. Verify it by
hand once if you want its date to start moving.

---

## By-hand checks (every cycle)

`docs/sources/OVERVIEW.md` → **Human checklist** lists every link a person
must look at whether or not the report flags it. You don't do all of them
every cycle. Each link's "Human work" line in its playbook says how often.
In practice:

| How often | What | Why |
|---|---|---|
| **Every cycle** | Albania: `visaTable`, `visaTableCountries`, `visaRegime` | The site blocks the pipeline, so this is the only check it gets. |
| **Monthly** (every second cycle) | Schengen: the consolidation check, i.e. is there a newer consolidated version of Reg. 2018/1806 (visa list) and 810/2009 (ATV)? Then `atvSpecific` (Annex 7b) and `etias`. Cyprus shares the check. | New consolidations get new URLs that no diff sees. |
| **Quarterly** | Ireland's `periodic` INIS pages (`visaNationalityList` first), Belarus `general` and `airportPdf` | Diffs are weak or absent there. |
| **Yearly** | Ireland links marked "a yearly look" | They rarely change. |

**How:**
1. In Claude Code, run **`/verify-region <Region>`**. It turns each link's
   playbook "Human" steps into numbered instructions: the URL, what to click,
   and a console snippet where useful.
2. Do them in your browser and paste back what you see.
3. Then one of:
   - **Matches:** it runs `npm run sources:verified -- <Region> <keys>`. That
     date is what the app shows, and for diff-covered sources the starting
     point quiet runs extend.
   - **Differs:** it runs `/record-rule-change` with the pasted text as
     evidence.
   - **The site works differently than the playbook says:** it updates the
     playbook.
4. It bumps the playbook's `lastReviewed`. Commit.

Doing it yourself without Claude:
`npm run sources:verified -- <Region> <key> [<key> …]`, or `--all` for every
source in the region, or `--date YYYY-MM-DD` for a check on an earlier day.
Then commit `src/data/sources.ts`.

---

## You found a change yourself

Examples: a news item, an official journal publication, or a change you
noticed while browsing.

1. **Confirm it at the source.** Find the official page the app cites for
   that rule; the region's playbook lists them. Copy the exact sentence that
   shows the new rule. A news article alone isn't evidence.
2. In Claude Code, run **`/record-rule-change`**. Tell it:
   - what changed, the quote and where it is;
   - when it takes effect, if the source says.

   The trigger is `manual:<what you were checking>`, or `external:<URL>` for
   an official publication.
3. It edits the rules, writes the log entry, and bumps `dateChecked`. Review
   the before → after and commit.
4. **Ask yourself why no diff caught it.** `npm run stats` lists it as
   "missed by diffs" for that link, which is how the playbooks' confidence
   gets corrected. Typical answers: the link is `periodic`, the change was
   on a page we don't cite, or it hasn't been published at the cited page
   yet. If the cited page should have shown it, tell Claude to look at the
   link's playbook.
5. Related regions may need the same change. Cyprus mirrors Schengen's
   Annex I/II, and the skill says when.

---

## User reports

Each "Report a problem" submission lands in the analytics sheet as a
`source_issue_reported` row with the region, source key, URL and kind
(broken link / wrong info / other), plus an optional message. Users
can send at most three per page load, with no personal details.

**When:** once a cycle, after the report PR. Sooner if someone emails.

1. Filter the sheet to `source_issue_reported` rows since your last review.
   Copy them, or export CSV.
2. In Claude Code, run **`/review-user-reports`** and paste them. For each
   report:
   - **Broken link:** Claude compares it with the latest report's link health.
     - Broken there too: fix the link, as for a broken link in [a noisy week](#a-noisy-week).
     - Live there: probably the user's network. No action.
   - **Wrong info:** Claude gives you the playbook's steps to check the live
     source. **You** check it.
     - The source agrees with the user: `/record-rule-change` with trigger
       `user-report:<date>`.
     - The source agrees with the app: no change. Optionally, record your
       check with `npm run sources:verified`.
   - **Spam:** dropped.
3. Claude records the outcomes in `pipeline/user-reports/<date>.yml`. Commit.

---

## Command reference

Run from the repo root unless noted.

| Command | When |
|---|---|
| `npm run sources:verified -- <Region> <key …\|--all> [--date YYYY-MM-DD]` | After checking sources by hand. Sets `dateChecked`. |
| `npm run stats` | After merging a report PR, and after triage. Refreshes `STATS.md` and `pipeline/reports/stability.json`. |
| `npm run rules:new -- …` | Recording a rule change (`/record-rule-change` runs it for you). |
| `npm run rules:check` | After editing a log entry. Runs the log's tests and refreshes its summary. |
| `npm run playbooks:overview` | After editing a playbook. Regenerates `OVERVIEW.md`. |
| `npm test` | Before committing. Fails on anything out of step: undocumented links, unrecorded rule changes, stale stats, a "Verified" date older than a rule change. |
| `cd pipeline && npm run check -- --all` | A source check run locally. Needs open network access to government sites, so not from the cloud sandbox. |
| Actions → Source check → **Run workflow** | An extra run between cycles, e.g. after fixing a broken link. |

| Skill | When |
|---|---|
| `/triage-report [date]` | A report flagged diffs. |
| `/verify-region <Region>` | By-hand checks. |
| `/record-rule-change` | Any rule change, whatever found it. |
| `/review-user-reports` | User reports from the sheet. |

---

## What needs you, at a glance

| Situation | Automatic | You |
|---|---|---|
| Quiet week | Fetch, diff, report PR, dates carried forward on merge | Merge, `npm run stats`, this cycle's by-hand checks |
| Diff flagged | Triage verdicts for noise; drafts for the rest | Confirm unclear items on the live site; review rule changes |
| Broken / redirected link | Detected; users see "couldn't reach" | Find the new URL; re-read the page |
| New blocked / fetch error | Detected | Ask Claude to fix the fetch, or move the link to by-hand checks |
| Periodic and manual-only links | Nothing; no diff can vouch for them | Check on schedule; `npm run sources:verified` |
| Change you heard about | Nothing | Quote the official source; `/record-rule-change` |
| User report | Collected in the sheet | Paste into `/review-user-reports`; check "wrong info" ones on the live site |
