import type { SourceLink } from '@/types';
import type { FetchOutcome } from '../fetchPage';
import type { ContentSnapshot } from '../types';
import { mvpGovBa } from './mvpGovBa';

export type ResolverId = NonNullable<SourceLink['resolver']>;

/**
 * What a resolver learned on this run: the value to put in each SourceDoc
 * key's `{key}`, plus the discovered list itself as a diffable snapshot, so a
 * country added, removed, renamed or republished shows up in the report.
 */
export type Discovery = {
  /** SourceDoc key → value for the link template's `{key}`. */
  fill: Map<string, string>;
  /** SourceDoc keys the site has no page for, by design (not a finding). */
  noPage: ReadonlySet<string>;
  /** The discovered list; written as the next baseline only when discovery succeeded. */
  listing: ContentSnapshot;
  /** Page the list was read from, shown in the report. */
  indexUrl: string;
  /** Set when discovery failed; `fill` then comes from the previous run's listing. */
  error?: string;
  note?: string;
};

export interface Resolver {
  /** Snapshot id of the discovered list. */
  listingId: string;
  discover(fetch: (url: string) => Promise<FetchOutcome>, previousListing: ContentSnapshot | null): Promise<Discovery>;
  /**
   * Snapshot id for one key's resolved page. Stable across runs even though
   * the URL isn't, so a republished page is diffed against its old content
   * instead of starting over as a first run.
   */
  snapshotId(key: string): string;
  /** Reduces one resolved page's response to what's diffed. */
  extract(body: Buffer, contentType: string, url: string): ContentSnapshot;
}

export const RESOLVERS: Record<ResolverId, Resolver> = {
  'mvp.gov.ba': mvpGovBa,
};
