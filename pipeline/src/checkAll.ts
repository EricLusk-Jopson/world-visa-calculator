import { join } from 'node:path';
import {
  SchengenSources,
  UKSources,
  IrelandSources,
  TurkiyeSources,
  MontenegroSources,
  SerbiaSources,
  BosniaSources,
  KosovoSources,
  NorthMacedoniaSources,
  AlbaniaSources,
  CyprusSources,
  BelarusSources,
  GeorgiaSources,
  ArmeniaSources,
} from '@/data/sources';
import { runChecks, type RegionSources } from './runChecks';
import { buildReport, hasFindings, writeReportFiles } from './report';

// Reads the app's real sources.ts — adding a region there means adding it here.
const ALL_REGIONS: RegionSources = {
  Schengen: SchengenSources,
  UK: UKSources,
  Ireland: IrelandSources,
  Turkiye: TurkiyeSources,
  Montenegro: MontenegroSources,
  Serbia: SerbiaSources,
  Bosnia: BosniaSources,
  Kosovo: KosovoSources,
  NorthMacedonia: NorthMacedoniaSources,
  Albania: AlbaniaSources,
  Cyprus: CyprusSources,
  Belarus: BelarusSources,
  Georgia: GeorgiaSources,
  Armenia: ArmeniaSources,
};

const PIPELINE_ROOT = join(import.meta.dirname, '..');

async function main() {
  const regionReports = await runChecks(ALL_REGIONS, {
    snapshotDir: join(PIPELINE_ROOT, 'data', 'snapshots'),
    log: console.log,
  });

  const report = buildReport(regionReports);
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
