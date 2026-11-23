/**
 * EES Record Fixer: step order, and how calculator trips become engine trips.
 */
import { VisaRegion, type Trip } from "@/types";
import type { FixerTrip } from "../engine";
import { tripKey, type FixerState } from "../storage";

export const STEPS = ["Problem", "Trips", "Diagnosis", "Proof", "Details", "Send"] as const;
export const STEP = { problem: 0, trips: 1, diagnosis: 2, proof: 3, details: 4, send: 5 } as const;

/** The chosen traveler's Schengen trips, as the engine sees them. */
export function toFixerTrips(trips: Trip[], countries: FixerState["tripCountries"]): FixerTrip[] {
  return trips
    .filter((t) => t.region === VisaRegion.Schengen)
    .map((t) => {
      const c = countries[tripKey(t.entryDate, t.exitDate)] ?? {};
      return { id: t.id, entry: t.entryDate, exit: t.exitDate ?? null, entryCountry: c.entry, exitCountry: c.exit };
    });
}
