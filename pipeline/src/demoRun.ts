/**
 * Offline proof of the pipeline. Spins up a local static server over
 * fixtures/run1 and fixtures/run2 and runs the real pipeline code
 * (runChecks.ts, contentCheck.ts, report.ts — unmodified) against it twice,
 * simulating "this month" vs "next month".
 *
 * Demonstrates, end to end:
 *  - first-run baseline capture
 *  - text-content change detection (ruleList: a country added to a list)
 *  - the Schengen "document vault" case (docVault: the parent page is
 *    diffed; page text identical, but the "Annex 7b" link now targets a new
 *    PDF — reported as a link-target change, and the old PDF direct link as
 *    broken)
 *  - a machine-readable alternate (blockedWithAlternate: the human page
 *    answers with a bot-protection 202 and is reported blocked, while its
 *    machine alternate is diffed and shows the text change)
 *  - a source that genuinely doesn't change (stable)
 *  - a link-health-only source going dead between runs (brokenInRun2)
 *  - the standardized report, written to reports/demo/ as markdown + JSON
 *
 * Run: npm run demo
 */
import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { SourceDoc, SourceLink } from './types';
import { runChecks } from './runChecks';
import { buildReport, writeReportFiles, type RegionReport } from './report';

const FIXTURES_ROOT = join(import.meta.dirname, '..', 'fixtures');
const DEMO_REPORT_DIR = join(import.meta.dirname, '..', 'reports', 'demo');
// Fixed port so URLs in the committed demo report stay stable between runs.
const PORT = Number(process.env.DEMO_PORT ?? 47819);

const PDF_IDS = {
  run1: '7337515c-60a1-4510-b639-80de714f543e_en',
  run2: '9f1c22a0-aaaa-4bbb-9ccc-123456789abc_en',
};

let activeRun: 'run1' | 'run2' = 'run1';

function startServer(): Promise<Server> {
  const server = createServer(async (req, res) => {
    const urlPath = (req.url ?? '/').split('?')[0];

    if (urlPath === '/regulation-human.html') {
      res.writeHead(202, { 'Content-Type': 'text/html' });
      res.end('');
      return;
    }

    if (urlPath === '/brokenInRun2.html') {
      if (activeRun === 'run2') {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<html><body><div id="content"><p>Fine for now.</p></div></body></html>');
      return;
    }

    // DG HOME-style document vault: only the currently linked PDF exists.
    if (urlPath.startsWith('/document/download/')) {
      if (urlPath === `/document/download/${PDF_IDS[activeRun]}`) {
        res.writeHead(200, { 'Content-Type': 'application/pdf' });
        res.end(`%PDF-1.4 Annex 7b (${activeRun})`);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
      return;
    }

    const filePath = join(FIXTURES_ROOT, activeRun, urlPath.replace(/^\//, ''));
    try {
      const html = await readFile(filePath, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end('Not Found');
    }
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function link(url: string, type: SourceLink['type'], checkDiff: boolean, alternate?: SourceLink): SourceLink {
  return { url, type, checkDiff, ...(alternate ? { alternate } : {}) };
}

function demoSources(): Record<string, SourceDoc> {
  const base = `http://127.0.0.1:${PORT}`;
  return {
    ruleList: {
      direct: link(`${base}/ruleList.html`, 'direct', true),
      parent: link(`${base}/ruleList.html`, 'parent', false),
      dateChecked: '2026-10-05',
    },
    docVault: {
      // The PDF itself rotates; the landing page that links to it is what's diffed.
      direct: link(`${base}/document/download/${PDF_IDS.run1}?filename=Annex%207b_en.pdf`, 'direct', false),
      parent: link(`${base}/docVault.html`, 'parent', true),
      dateChecked: '2026-10-05',
    },
    stable: {
      direct: link(`${base}/stable.html`, 'direct', true),
      parent: link(`${base}/stable.html`, 'parent', false),
      dateChecked: '2026-10-05',
    },
    blockedWithAlternate: {
      // Human page is health-checked only; its machine-readable copy is diffed.
      direct: link(`${base}/regulation-human.html`, 'direct', false, link(`${base}/regulation.html`, 'machine', true)),
      parent: link(`${base}/stable.html`, 'parent', false),
      dateChecked: '2026-10-05',
    },
    brokenInRun2: {
      direct: link(`${base}/brokenInRun2.html`, 'direct', false),
      parent: link(`${base}/brokenInRun2.html`, 'parent', false),
      dateChecked: '2026-10-05',
    },
  };
}

async function runOnce(label: string, snapshotDir: string): Promise<RegionReport[]> {
  console.log(`\n=== ${label} (serving fixtures/${activeRun}) ===`);
  const reports = await runChecks({ Demo: demoSources() }, { snapshotDir });

  for (const { linkHealth, ruleChecks } of reports) {
    for (const l of linkHealth) {
      console.log(`  [link-health] ${l.usedBy.map((u) => `${u.key}.${u.field}`).join(', ')}: ${l.status}${l.httpStatus ? ` (${l.httpStatus})` : ''}`);
    }
    for (const c of ruleChecks) {
      console.log(`  [content]     ${c.keys.join(', ')}: ${c.status}`);
      if (c.textDiffPreview) console.log(c.textDiffPreview.split('\n').map((line) => '      ' + line).join('\n'));
      for (const lc of c.linkChanges ?? []) console.log(`      link ${lc.kind} "${lc.text}": ${lc.previousHref ?? '—'} -> ${lc.currentHref ?? '—'}`);
    }
  }
  return reports;
}

async function main() {
  // Fresh snapshot dir each time so run 1 is always a true first run.
  const snapshotDir = await mkdtemp(join(tmpdir(), 'evc-demo-snapshots-'));
  await rm(DEMO_REPORT_DIR, { recursive: true, force: true });

  const server = await startServer();
  try {
    activeRun = 'run1';
    await runOnce('Run 1 — this month (establishes baseline)', snapshotDir);

    activeRun = 'run2';
    const secondRun = await runOnce('Run 2 — next month (changes should be detected)', snapshotDir);

    const report = buildReport(secondRun);
    const { markdownPath, jsonPath } = writeReportFiles(report, DEMO_REPORT_DIR, {
      reportPath: 'pipeline/reports/demo/latest.md',
      pagePath: '/source-report',
    });
    console.log(`\nStandardized report written to:\n  ${markdownPath}\n  ${jsonPath}`);

    console.log('\nExpected outcome:');
    console.log('  ruleList      -> text-changed   (Azerbaijan added to the list)');
    console.log('  docVault      -> links-changed  (Annex 7b href rotated, page text identical), old PDF direct link broken');
    console.log('  blockedWithAlternate -> human page blocked (202); machine alternate text-changed (Azerbaijan added)');
    console.log('  stable        -> unchanged');
    console.log('  brokenInRun2  -> broken on run 2 (link-health only, not parsed for rules)');
  } finally {
    server.close();
    await rm(snapshotDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
