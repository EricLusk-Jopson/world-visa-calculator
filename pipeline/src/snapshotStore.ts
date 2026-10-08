import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { ContentSnapshot } from './types';

/**
 * Snapshots are keyed by URL, not by SourceDoc key: one page cited by 190
 * entries is stored (and diffed) once. Files live under the URL's host so the
 * folder stays browsable; the filename is a short hash of the full URL.
 */
function snapshotPath(root: string, url: string): string {
  let host = 'unknown-host';
  try {
    host = new URL(url).host.replace(/[^a-z0-9.-]/gi, '_');
  } catch {
    // keep fallback
  }
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  return join(root, host, `${hash}.json`);
}

export function readSnapshot(root: string, url: string): ContentSnapshot | null {
  const path = snapshotPath(root, url);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as ContentSnapshot;
  } catch {
    return null;
  }
}

export function writeSnapshot(root: string, snapshot: ContentSnapshot): void {
  const path = snapshotPath(root, snapshot.url);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
}
