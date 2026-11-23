/**
 * EES Record Fixer: what the fixer keeps between visits.
 *
 * Trips stay in the calculator's own state (schengen_tracker_v1). Everything
 * else the fixer collects, personal details included, lives under one
 * localStorage key in this browser only: never in the URL, share links,
 * analytics or error reports. If storage is unavailable (private window,
 * blocked site data), the fixer keeps working from memory for the session.
 */

import { EMPTY_DETAILS, type PersonalDetails } from "./letters";

export const FIXER_STORAGE_KEY = "evc_ees_fixer_v1";

export type FixerProblem = "missing_exit" | "zero_days" | "wrong_date";

export interface SavedObservation {
  date: string;
  /** Null until the traveller types the result in. */
  remaining: number | null;
}

/** Border countries for a trip, keyed by tripKey (trip ids don't survive a reload). */
export type TripCountries = Record<string, { entry?: string; exit?: string }>;

export interface FixerState {
  step: number;
  problem: FixerProblem | null;
  /** Which calculator traveler the fixer is working on. */
  travelerId: string | null;
  tripCountries: TripCountries;
  observations: SavedObservation[];
  /** What the EU checker said alongside the days: OK or NOT OK. */
  checkerStatus: "ok" | "not_ok" | null;
  evidence: string[];
  details: PersonalDetails;
  /** ISO code of the country the letter is addressed to. */
  addressedTo: string | null;
  /** The authority's email, as the traveller found it on the EU list. */
  authorityEmail: string;
  borderPoint: string;
  /** "wrong_date" path: the traveller's own description of what's wrong. */
  manualNote: string;
  /** Overrides the diagnosis's choice of letter. */
  letterKind: "correction" | "access" | null;
  sendDate: string | null;
}

export const INITIAL_STATE: FixerState = {
  step: 0,
  problem: null,
  travelerId: null,
  tripCountries: {},
  observations: [{ date: "", remaining: null }],
  checkerStatus: null,
  evidence: ["passport"],
  details: EMPTY_DETAILS,
  addressedTo: null,
  authorityEmail: "",
  borderPoint: "",
  manualNote: "",
  letterKind: null,
  sendDate: null,
};

/** A trip's key for tripCountries: its dates. */
export function tripKey(entry: string, exit: string | null | undefined): string {
  return `${entry}_${exit ?? ""}`;
}

let memory: FixerState | null = null;

export function loadFixerState(): FixerState {
  try {
    const raw = localStorage.getItem(FIXER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FixerState>;
      return {
        ...INITIAL_STATE,
        ...parsed,
        details: { ...EMPTY_DETAILS, ...parsed.details },
      };
    }
  } catch {
    /* storage unavailable or corrupt: fall back to memory */
  }
  return memory ?? INITIAL_STATE;
}

export function saveFixerState(state: FixerState): void {
  memory = state;
  try {
    localStorage.setItem(FIXER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable: memory only */
  }
}

/** "Delete my data": everything the fixer stored. Calculator trips are left alone. */
export function clearFixerState(): void {
  memory = null;
  try {
    localStorage.removeItem(FIXER_STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
}
