import type { FetchOutcome } from './fetchPage';

/**
 * Stops one unresponsive host from stalling the whole sweep.
 *
 * A request that gets no response at all costs fetchPage ~100 s (three 30 s
 * timeouts plus backoff), and with ~195 pages on one host behind a 2-request
 * limiter, every worker ends up queued on that host: on 2026-11-06 the run
 * crawled at ~4 s per URL and hit the job's 30-minute timeout. After
 * `threshold` such failures in a row from a host, its remaining URLs are
 * reported as skipped instead of fetched.
 *
 * Only no-response failures count (timeouts, refused or reset connections):
 * an HTTP error status means the host is answering, so it never trips.
 */
export function createHostBreaker(threshold = 3) {
  const streak = new Map<string, number>();
  const tripped = new Map<string, string>();

  return {
    isTripped: (host: string) => tripped.has(host),

    /** Records a fetch result; returns true when this result trips the host. */
    record(host: string, outcome: FetchOutcome): boolean {
      if (outcome.status !== 'broken' || outcome.httpStatus !== undefined) {
        streak.set(host, 0);
        return false;
      }
      const n = (streak.get(host) ?? 0) + 1;
      streak.set(host, n);
      if (n >= threshold && !tripped.has(host)) {
        tripped.set(host, outcome.error ?? 'no response');
        return true;
      }
      return false;
    },

    /** Clears a tripped host, e.g. when a later probe gets an answer. */
    reset(host: string) {
      tripped.delete(host);
      streak.set(host, 0);
    },

    /** The outcome reported for a URL skipped on a tripped host. */
    skipped(host: string): FetchOutcome {
      return {
        status: 'broken',
        error: `not fetched: ${host} stopped responding (${threshold} requests in a row got no response; last: ${tripped.get(host)})`,
      };
    },
  };
}
