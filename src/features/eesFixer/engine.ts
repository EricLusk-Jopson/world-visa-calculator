/**
 * EES Record Fixer: diagnosis engine.
 *
 * Given a traveller's own Schengen trips and what the EU's "Check how long
 * you can stay" page told them, find the error in their EES record that
 * best explains the gap.
 *
 * The engine models a few ways the EES can have a crossing wrong. For each
 * past trip it builds the record the EES would hold under that error, predicts
 * what the EU checker would then show, and keeps the errors whose prediction
 * matches every result the traveller has seen. When several trips fit, it
 * picks a probe date: a second query to the EU checker whose answer differs
 * between them.
 *
 *   MISSING_EXIT_PAIRED  the exit was never registered, and the EES counts
 *                        the stay as running to the next recorded exit
 *   MISSING_EXIT_OPEN    the exit was never registered, and the EES counts
 *                        the traveller as present ever since (to today)
 *   LATE_EXIT            the exit was registered k days late
 *
 * How the EES treats an entry with no matching exit isn't published, so both
 * MISSING_EXIT readings run side by side. For a letter it doesn't matter
 * which one is right: both point at the same missing crossing.
 *
 * The 90/180 counting is the calculator's own (getDaysUsedBeforeEntry), so
 * the fixer and the calculator can never disagree about a traveller's days.
 *
 * Everything runs on ISO dates (YYYY-MM-DD), inclusive on both ends, with
 * `today` passed in so results are reproducible.
 */

import { VisaRegion, type Trip } from "@/types";
import { getDaysUsedBeforeEntry } from "@/features/calculator/utils/schengen";
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  parseDate,
} from "@/features/calculator/utils/dates";
import {
  EES_FULL,
  EES_START,
  MAX_LATE_EXIT_DAYS,
  MAX_PROBES,
  PROBE_HORIZON_DAYS,
  SHORT_STAY_DAYS,
  SHORT_STAY_WINDOW,
} from "./constants";

// ─── Types ────────────────────────────────────────────────────────────────────

/** One Schengen trip as the fixer sees it. */
export interface FixerTrip {
  id: string;
  /** First day in the Schengen Area. */
  entry: string;
  /** Last day in the Schengen Area; null while the trip is ongoing. */
  exit: string | null;
  /** ISO alpha-2 code of the Schengen country entered through. */
  entryCountry?: string;
  /** ISO alpha-2 code of the Schengen country left from. Its authority corrects a missing exit. */
  exitCountry?: string;
}

/** One answer from the EU checker. */
export interface Observation {
  /** The arrival date typed into the EU checker. */
  date: string;
  /** "Remaining days at the moment of entry", 0 to 90. */
  remaining: number;
}

export type HypothesisKind = "MISSING_EXIT_PAIRED" | "MISSING_EXIT_OPEN" | "LATE_EXIT";

/**
 * EXACT: the prediction equals every non-zero result.
 * CONSISTENT: every result is 0 and the prediction is 0 too. A 0 is clipped
 * (any overcount gives 0), so this is weaker evidence.
 */
export type Match = "EXACT" | "CONSISTENT" | "NONE";

/** HIGH for trips that ended before full EES operation, when unregistered crossings were more common. */
export type Prior = "HIGH" | "NORMAL";

export interface Hypothesis {
  kind: HypothesisKind;
  /** The trip whose exit the EES is believed to have wrong. */
  trip: FixerTrip;
  /** LATE_EXIT only: how many days late the exit was recorded. */
  lateDays?: number;
  /** The exit the EES is believed to hold: null when missing, the late date for LATE_EXIT. */
  recordedExit: string | null;
  /** The last day the EES would count the traveller as present for this trip. */
  phantomUntil: string;
  /** The traveller's trips as the EES would hold them under this hypothesis. */
  record: ResolvedTrip[];
  match: Match;
  prior: Prior;
  /** Predicted EU checker result for each observation, in order. */
  predicted: number[];
}

export type VerdictType =
  | "RULE_PROBLEM"
  | "NO_DISCREPANCY"
  | "MISSING_EXIT"
  | "LATE_EXIT"
  | "AMBIGUOUS"
  | "UNEXPLAINED";

export interface Diagnosis {
  verdict: VerdictType;
  /** The traveller's own count on arrival (first observation), all trips counted. */
  mine: number;
  /** What the EU checker showed for that arrival. */
  observed: number;
  /**
   * The checker shows more days than the traveller's own count, and trips
   * from before 12 Oct 2025 sit in the window: the checker can't see them,
   * but the 90/180 rule still counts them.
   */
  preEesWarning: boolean;
  /** Hypotheses matching every observation, best first. */
  candidates: Hypothesis[];
  /** The hypothesis the letter is about, when one trip stands out. */
  flagged: Hypothesis | null;
  /** AMBIGUOUS only: a date to run in the EU checker to separate the candidates, if one exists and probes remain. */
  probe: string | null;
  /** Which letter to write; null when no letter should be written. */
  letter: "correction" | "access" | null;
  /** ISO code of the country whose authority entered the wrong data, when known. */
  authorityCountry: string | null;
  /** Trips starting after today: plans, not crossings, so left out. */
  excludedFutureTrips: number;
}

export interface DiagnoseInput {
  trips: FixerTrip[];
  /** First entry: the arrival the traveller checked. Later entries: probe results. */
  observations: Observation[];
  today: string;
}

// ─── Day counting ─────────────────────────────────────────────────────────────

/** A trip with its exit resolved: an ongoing trip runs to today. */
export interface ResolvedTrip {
  trip: FixerTrip;
  entry: string;
  exit: string;
  open: boolean;
}

function toCalcTrips(record: { entry: string; exit: string }[]): Trip[] {
  return record.map((r, i) => ({
    id: String(i),
    entryDate: r.entry,
    exitDate: r.exit,
    region: VisaRegion.Schengen,
  }));
}

/**
 * Days left on arrival under the 90/180 rule: 90 minus the days used in
 * [arrival − 179, arrival − 1].
 *
 * TODO(human): confirm with a test date that the EU checker leaves the
 * arrival day out of its count the same way (spec open question
 * "Window boundary").
 */
export function remainingOnArrival(
  record: { entry: string; exit: string }[],
  arrival: string,
): number {
  return Math.max(
    0,
    SHORT_STAY_DAYS - getDaysUsedBeforeEntry(arrival, toCalcTrips(record)),
  );
}

/**
 * The part of a record the EES can hold: nothing before EES_START. The EU
 * checker counts only these days.
 */
export function eesView(record: ResolvedTrip[]): ResolvedTrip[] {
  return record
    .filter((r) => r.exit >= EES_START)
    .map((r) => (r.entry < EES_START ? { ...r, entry: EES_START } : r));
}

/** What the EU checker would show for this record. */
export function predictChecker(record: ResolvedTrip[], arrival: string): number {
  return remainingOnArrival(eesView(record), arrival);
}

function shift(iso: string, days: number): string {
  return formatDate(addDays(parseDate(iso), days));
}

/**
 * Keep the trips that have started by today, sorted by entry. An ongoing
 * trip, or one whose exit is still ahead, counts as present to today.
 */
export function resolveTrips(
  trips: FixerTrip[],
  today: string,
): { record: ResolvedTrip[]; excluded: number } {
  const started = trips.filter((t) => t.entry <= today);
  const record = started
    .map((trip) => {
      const open = trip.exit === null || trip.exit > today;
      return { trip, entry: trip.entry, exit: open ? today : trip.exit!, open };
    })
    .sort((a, b) => (a.entry < b.entry ? -1 : a.entry > b.entry ? 1 : 0));
  return { record, excluded: trips.length - started.length };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function score(predicted: number[], observations: Observation[]): Match {
  let exact = false;
  for (let i = 0; i < observations.length; i++) {
    const seen = observations[i].remaining;
    if (predicted[i] !== seen) return "NONE";
    if (seen > 0) exact = true;
  }
  return exact ? "EXACT" : "CONSISTENT";
}

const MATCH_RANK: Record<Match, number> = { EXACT: 0, CONSISTENT: 1, NONE: 2 };
const PRIOR_RANK: Record<Prior, number> = { HIGH: 0, NORMAL: 1 };
const KIND_RANK: Record<HypothesisKind, number> = {
  MISSING_EXIT_PAIRED: 0,
  MISSING_EXIT_OPEN: 1,
  LATE_EXIT: 2,
};

function compareHypotheses(a: Hypothesis, b: Hypothesis): number {
  return (
    MATCH_RANK[a.match] - MATCH_RANK[b.match] ||
    PRIOR_RANK[a.prior] - PRIOR_RANK[b.prior] ||
    // most recent trip first
    (b.trip.exit ?? "").localeCompare(a.trip.exit ?? "") ||
    KIND_RANK[a.kind] - KIND_RANK[b.kind]
  );
}

// ─── Hypotheses ───────────────────────────────────────────────────────────────

/** The record with one trip's exit moved to `exit`. */
function withExit(record: ResolvedTrip[], index: number, exit: string): ResolvedTrip[] {
  return record.map((r, i) => (i === index ? { ...r, exit } : r));
}

/**
 * Every way the EES could have a past trip's exit wrong, scored against the
 * observations. Ongoing trips have no exit to get wrong, and trips that ended
 * before EES_START were never in the EES.
 */
export function buildHypotheses(
  record: ResolvedTrip[],
  observations: Observation[],
  today: string,
): Hypothesis[] {
  const out: Hypothesis[] = [];
  const anyPositive = observations.some((o) => o.remaining > 0);

  const make = (
    kind: HypothesisKind,
    index: number,
    phantomUntil: string,
    recordedExit: string | null,
    lateDays?: number,
  ): Hypothesis => {
    const r = record[index];
    const hyp = withExit(record, index, phantomUntil);
    const predicted = observations.map((o) => predictChecker(hyp, o.date));
    return {
      kind,
      trip: r.trip,
      lateDays,
      recordedExit,
      phantomUntil,
      record: hyp,
      match: score(predicted, observations),
      prior: r.exit < EES_FULL ? "HIGH" : "NORMAL",
      predicted,
    };
  };

  record.forEach((r, i) => {
    if (r.open || r.exit < EES_START || r.exit >= today) return;

    // H1: the stay runs on to the next recorded exit.
    const next = record[i + 1];
    if (next && next.exit < today) {
      out.push(make("MISSING_EXIT_PAIRED", i, next.exit, null));
    }
    // H2: the stay runs on to today. When there's no later recorded exit, H1
    // and H2 are the same record, so only this one is kept.
    out.push(make("MISSING_EXIT_OPEN", i, today, null));

    // H3: the exit was recorded k days late. A 0 is clipped and can't pin k.
    if (anyPositive) {
      // A late exit dated today, or on the next trip's exit, is the same
      // record as a missing one, so those are left to H1 and H2.
      const maxK = Math.min(
        MAX_LATE_EXIT_DAYS,
        differenceInCalendarDays(parseDate(today), parseDate(r.exit)) - 1,
      );
      for (let k = 1; k <= maxK; k++) {
        const late = shift(r.exit, k);
        if (next && late === next.exit) continue;
        const h = make("LATE_EXIT", i, late, late, k);
        if (h.match === "EXACT") {
          out.push(h);
          break;
        }
      }
    }
  });

  return out;
}

// ─── Probe dates ──────────────────────────────────────────────────────────────

/**
 * A date to run in the EU checker whose result best separates the candidate
 * trips: the most distinct predicted results, then the fewest results clipped
 * to 0 or 90 (a clipped result says little), then the earliest date. Null when
 * no date in the next 180 days tells any two candidate trips apart.
 */
export function findProbe(
  candidates: Hypothesis[],
  today: string,
  usedDates: string[] = [],
): string | null {
  const trips = new Set(candidates.map((c) => c.trip.id));
  if (trips.size < 2) return null;

  let best: { date: string; distinct: number; clipped: number } | null = null;
  for (let d = 0; d <= PROBE_HORIZON_DAYS; d++) {
    const date = shift(today, d);
    if (usedDates.includes(date)) continue;
    const values = candidates.map((c) => predictChecker(c.record, date));
    // Group the predicted results by value, noting which trips give each.
    const byValue = new Map<number, Set<string>>();
    values.forEach((v, i) => {
      const set = byValue.get(v) ?? new Set<string>();
      set.add(candidates[i].trip.id);
      byValue.set(v, set);
    });
    const distinct = byValue.size;
    // Useless unless some value comes from one trip only.
    if (distinct < 2 || ![...byValue.values()].some((s) => s.size === 1)) continue;
    const clipped = values.filter((v) => v === 0 || v === SHORT_STAY_DAYS).length;
    if (
      !best ||
      distinct > best.distinct ||
      (distinct === best.distinct && clipped < best.clipped)
    ) {
      best = { date, distinct, clipped };
    }
  }
  return best?.date ?? null;
}

// ─── Diagnosis ────────────────────────────────────────────────────────────────

/**
 * Run the whole diagnosis. The first observation is the arrival the
 * traveller checked; any later ones are probe results.
 */
export function diagnose({ trips, observations, today }: DiagnoseInput): Diagnosis {
  if (observations.length === 0) throw new Error("diagnose: at least one observation is required");
  const { record, excluded } = resolveTrips(trips, today);
  const first = observations[0];
  const mine = remainingOnArrival(record, first.date);

  const base: Diagnosis = {
    verdict: "NO_DISCREPANCY",
    mine,
    observed: first.remaining,
    preEesWarning: false,
    candidates: [],
    flagged: null,
    probe: null,
    letter: null,
    authorityCountry: null,
    excludedFutureTrips: excluded,
  };

  // Step 1: can the record be wrong at all?
  if (mine === 0) return { ...base, verdict: "RULE_PROBLEM" };
  if (first.remaining >= mine) {
    const windowStart = shift(first.date, -(SHORT_STAY_WINDOW - 1));
    const preEesInWindow = record.some(
      (r) => r.entry < EES_START && r.exit >= windowStart,
    );
    return {
      ...base,
      preEesWarning: first.remaining > mine && preEesInWindow,
    };
  }

  // Steps 2 and 3: hypotheses, scored against every observation.
  const candidates = buildHypotheses(record, observations, today)
    .filter((h) => h.match !== "NONE")
    .sort(compareHypotheses);

  if (candidates.length === 0) {
    return { ...base, verdict: "UNEXPLAINED", letter: "access" };
  }

  // Step 5: one trip fits. Every candidate shares a match level (EXACT
  // needs a non-zero result, CONSISTENT needs all zeros), so "a clear
  // winner" means every candidate points at the same trip. Its readings
  // (missing exit to the next exit or to today, or a late exit) all ask for
  // the same crossing to be corrected.
  const top = candidates[0];
  const tripIds = new Set(candidates.map((c) => c.trip.id));

  if (tripIds.size === 1) {
    return {
      ...base,
      verdict: top.kind === "LATE_EXIT" ? "LATE_EXIT" : "MISSING_EXIT",
      candidates,
      flagged: top,
      letter: "correction",
      authorityCountry: top.trip.exitCountry ?? null,
    };
  }

  // Step 4: several trips fit. Ask for a probe date while probes remain.
  const probesUsed = observations.length - 1;
  const probe =
    probesUsed < MAX_PROBES
      ? findProbe(candidates, today, observations.map((o) => o.date))
      : null;
  return { ...base, verdict: "AMBIGUOUS", candidates, probe, letter: "access" };
}

/** One line naming the crossing a hypothesis flags, for the timeline and the letter. */
export function describeHypothesis(h: Hypothesis, countryName: (code?: string) => string): string {
  const exit = formatLong(h.trip.exit!);
  const from = h.trip.exitCountry ? ` from ${countryName(h.trip.exitCountry)}` : "";
  if (h.kind === "LATE_EXIT") {
    return `Exit${from} on ${exit} likely recorded ${h.lateDays} day${h.lateDays === 1 ? "" : "s"} late, as ${formatLong(h.recordedExit!)}`;
  }
  return `Exit${from} on ${exit} likely not recorded`;
}

/** "10 Jul 2026" */
export function formatLong(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
