/**
 * npm run sources:verified -- <Region> <key> [<key> …] [--date YYYY-MM-DD]
 * npm run sources:verified -- <Region> --all [--date YYYY-MM-DD]
 *
 * Records that you checked these sources by hand: sets their `dateChecked`
 * in src/data/sources.ts to today (or --date). Run it after confirming the
 * live source still says what the app's rules say (the playbook's "Human"
 * steps). <Region> is a SourceRegions key (Schengen, UK, NorthMacedonia, …);
 * keys are that region's SourceDoc keys (visaList, DZ, …).
 *
 * From then on, every source check that finds a diffed source unchanged
 * carries its "Verified" date forward on its own (pipeline/src/stability.ts).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { SourceRegions } from "@/data/sources";

const SOURCES_FILE = join(import.meta.dirname, "..", "src", "data", "sources.ts");

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { date: { type: "string" }, all: { type: "boolean" } },
});

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const date = values.date ?? today;
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(`--date must be YYYY-MM-DD, not ${date}`);
if (date > today) fail(`--date ${date} is in the future.`);

const [region, ...requested] = positionals;
const regions = SourceRegions as Record<string, { sources: Record<string, { dateChecked: string }> }>;
if (!region || !regions[region]) fail(`Usage: npm run sources:verified -- <Region> <key …|--all> [--date YYYY-MM-DD]\nRegions: ${Object.keys(regions).join(", ")}`);
const known = Object.keys(regions[region].sources);
if (Boolean(values.all) === requested.length > 0) fail(`Name the keys you checked, or pass --all for every ${region} source (${known.length}).`);
const unknown = requested.filter((k) => !known.includes(k));
if (unknown.length) fail(`Not ${region} source keys: ${unknown.join(", ")}\n${region} keys: ${known.join(", ")}`);
const keys = new Set(values.all ? known : requested);

// The region's object literal: `export const <Name> = {` up to its closing `}`.
const text = readFileSync(SOURCES_FILE, "utf-8");
const constName = new RegExp(`^  ${region}: \\{ sources: (\\w+)`, "m").exec(text)?.[1] ?? fail(`Can't find ${region} in SourceRegions.`);
const lines = text.split("\n");
const start = lines.findIndex((l) => l.startsWith(`export const ${constName} = {`));
const end = lines.findIndex((l, i) => i > start && /^}/.test(l));
if (start < 0 || end < 0) fail(`Can't find the ${constName} block in sources.ts.`);

let key: string | undefined;
const updated: string[] = [];
const skipped: string[] = [];
for (let i = start + 1; i < end; i++) {
  key = /^ {2}"?([\w-]+)"?: /.exec(lines[i])?.[1] ?? key;
  const m = /^( {4}dateChecked: ")(\d{4}-\d{2}-\d{2})(",.*)$/.exec(lines[i]);
  if (!m || !key || !keys.has(key)) continue;
  if (m[2] > date) skipped.push(`${key} (already ${m[2]})`);
  else {
    lines[i] = m[1] + date + m[3];
    updated.push(key);
  }
}
const missing = [...keys].filter((k) => !updated.includes(k) && !skipped.some((s) => s.startsWith(`${k} `)));
if (missing.length) fail(`No dateChecked line found for: ${missing.join(", ")} (defined outside the ${constName} literal?). Nothing written.`);

if (updated.length) {
  writeFileSync(SOURCES_FILE, lines.join("\n"));
  console.log(`${region}: dateChecked set to ${date} on ${updated.length} source${updated.length === 1 ? "" : "s"}${updated.length <= 12 ? ` (${updated.join(", ")})` : ""}.`);
}
if (skipped.length) console.log(`Left as they were (checked later than ${date}): ${skipped.join(", ")}`);
if (updated.length) console.log("Quiet source checks from now on carry these dates forward on their own. Commit src/data/sources.ts.");
