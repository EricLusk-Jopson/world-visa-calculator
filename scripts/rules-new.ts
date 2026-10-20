/**
 * npm run rules:new -- --title "…" --trigger <type>:<ref> [--evidence Region:linkId …] [--effective YYYY-MM-DD] [--date YYYY-MM-DD]
 * npm run rules:new -- --baseline
 *
 * Records the difference between the current rules (src/data/regions/) and
 * the recorded state (src/data/rule-changes/state/) as the next entry in the
 * rule-change log, then updates the state. See src/data/rule-changes/README.md.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { stringify } from "yaml";
import { diffRegion, normalizeRegion, RULE_REGIONS, type RuleChange } from "@/data/rule-changes/normalize";
import { ENTRIES_DIR, loadEntries, readState, TRIGGER_TYPES, UNFINISHED, writeState, writeSummary } from "@/data/rule-changes/entries";

const { values } = parseArgs({
  options: {
    title: { type: "string" },
    trigger: { type: "string" },
    evidence: { type: "string", multiple: true },
    effective: { type: "string" },
    date: { type: "string" },
    slug: { type: "string" },
    baseline: { type: "boolean" },
  },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const today = values.date ?? new Date().toISOString().slice(0, 10);
const entries = loadEntries();
const id = entries.length + 1;

let changes: RuleChange[] = [];
for (const { def } of RULE_REGIONS) changes.push(...diffRegion(readState(def.code), def));

let front: Record<string, unknown>;
let body: string;
if (values.baseline) {
  if (entries.some((e) => e.baseline)) fail("There is already a baseline entry.");
  front = {
    id,
    title: values.title ?? "Baseline: the rules of every destination as of this date",
    recorded: today,
    baseline: true,
    trigger: { type: "manual", ref: "rule-change log started" },
    evidence: [],
    changes: [],
  };
  body = `\nRecords the rules of all ${RULE_REGIONS.length} regions as they stand, as the starting point of the log. Every later change to them is a numbered entry after this one.\n\nEarlier changes, reconstructed from git history, are the entries marked \`backfilled\` before it.\n`;
  changes = [];
} else {
  if (changes.length === 0) fail("No rule changes to record: the rules match src/data/rule-changes/state/.");
  if (!values.title) fail('Give a --title, e.g. --title "Montenegro: Algeria now visa-required".');
  const [type, ...rest] = (values.trigger ?? "").split(":");
  const ref = rest.join(":");
  if (!TRIGGER_TYPES.includes(type as (typeof TRIGGER_TYPES)[number]) || !ref) {
    fail(`Give --trigger <type>:<ref>, type one of ${TRIGGER_TYPES.join(", ")}, e.g. report:2026-10-18 or external:https://…`);
  }
  const evidence = (values.evidence ?? []).map((ev) => {
    const [region, link] = ev.split(":");
    if (!region || !link) fail(`--evidence takes Region:linkId (playbook link), e.g. Montenegro:countryPages; got "${ev}"`);
    return { region, link };
  });
  front = {
    id,
    title: values.title,
    recorded: today,
    ...(values.effective ? { effective: values.effective } : {}),
    trigger: { type, ref },
    evidence,
    changes,
  };
  body = [
    "",
    "## What changed and why",
    "",
    `${UNFINISHED}: what the source now says, and how the rules were updated to match.`,
    "",
    "## Evidence",
    "",
    `> ${UNFINISHED}: quote the source text (and where it is), or link the report section.`,
    "",
    "## Checked",
    "",
    `- ${UNFINISHED}: confirmed on the live source (the playbook's Human steps), and \`lastVerified\` bumped in each changed region file.`,
    "",
  ].join("\n");
}

const slug =
  values.slug ??
  (front.title as string)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50)
    .replace(/-$/, "");
const file = join(ENTRIES_DIR, `${String(id).padStart(4, "0")}-${today}-${slug}.md`);
writeFileSync(file, `---\n${stringify(front, { lineWidth: 0 }).trimEnd()}\n---\n${body}`);

const changedRegions = values.baseline ? RULE_REGIONS.map((r) => r.def) : RULE_REGIONS.map((r) => r.def).filter((d) => changes.some((c) => c.region === d.code));
for (const def of changedRegions) writeState(normalizeRegion(def));
writeSummary(loadEntries());

console.log(`Wrote ${file}`);
if (!values.baseline) {
  for (const c of changes) console.log(`  ${c.region} ${c.path}: ${c.before} → ${c.after}`);
  console.log(
    `\nFill in its ${UNFINISHED} sections (the tests fail until you do), bump lastVerified in ${changedRegions.map((d) => d.code).join(", ")}, ` +
      "and bump dateChecked on the sources the changed rules cite (src/data/sources.ts). Then npm run rules:check.",
  );
}
