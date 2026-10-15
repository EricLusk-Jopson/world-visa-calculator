import { join } from 'node:path';
import { SourceRegions } from '@/data/sources';
import { runChecks, type RegionSources } from './runChecks';
import { buildReport, hasFindings, writeReportFiles } from './report';

const PIPELINE_ROOT = join(import.meta.dirname, '..');

/**
 * Regions to check, from the SourceRegions registry in the app's sources.ts.
 * `checkLinks: false` regions are skipped unless `--all` is passed.
 */
function selectRegions(all: boolean): { regions: RegionSources; skipped: string[] } {
  const regions: RegionSources = {};
  const skipped: string[] = [];
  for (const [name, { sources, checkLinks }] of Object.entries(SourceRegions)) {
    if (all || checkLinks) regions[name] = sources;
    else skipped.push(name);
  }
  return { regions, skipped };
}

async function main() {
  const { regions, skipped } = selectRegions(process.argv.includes('--all'));
  console.log(`Checking: ${Object.keys(regions).join(', ') || '(none)'}`);
  if (skipped.length > 0) console.log(`Skipping (checkLinks: false): ${skipped.join(', ')}`);

  const regionReports = await runChecks(regions, {
    snapshotDir: join(PIPELINE_ROOT, 'data', 'snapshots'),
    log: console.log,
  });

  const report = buildReport(regionReports, { skippedRegions: skipped });
  const { markdownPath, jsonPath, prBodyPath } = writeReportFiles(report, join(PIPELINE_ROOT, 'reports'), {
    reportPath: 'pipeline/reports/latest.md',
    pagePath: '/source-report',
  });

  const s = report.summary;
  console.log('');
  console.log(`Links checked: ${s.totalLinksChecked} (broken: ${s.brokenLinks}, redirected: ${s.redirectedLinks})`);
  console.log(`Content sources checked: ${s.sourcesChecked} (changed: ${s.sourcesChanged}, first-run: ${s.sourcesFirstRun}, errors: ${s.sourcesFetchError})`);
  console.log('');
  console.log(`Report written to:\n  ${markdownPath}\n  ${jsonPath}\n  ${prBodyPath}`);

  // Findings are the expected output of a run, not a failure — the workflow
  // turns them into a PR. Opt into a non-zero exit for local/CI gating.
  if (process.argv.includes('--fail-on-findings') && hasFindings(report)) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
