import { createContext, useContext } from "react";

/**
 * The trip a source link is being read for. Source buttons sit deep inside
 * the trip detail views, so the trip's travelers reach them through context
 * rather than props, and every source link click is tracked with them.
 */
export interface SourceTrip {
  /** Travelers on the trip, including any whose nationality isn't set yet. */
  travelerCount: number;
  /** ISO alpha-2 passport codes of the trip's travelers, one per traveler with a nationality set. */
  nationalities: string[];
  /** The traveler whose card the link sits on, when it belongs to one. */
  travelerNationality?: string | null;
}

export const SourceTripContext = createContext<SourceTrip | null>(null);

export function useSourceTrip(): SourceTrip | null {
  return useContext(SourceTripContext);
}

/** Analytics properties for the trip a source is read for (none outside a trip). */
export function sourceTripProperties(trip: SourceTrip | null): Record<string, string | number | undefined> {
  if (!trip) return {};
  return {
    traveler_count: trip.travelerCount,
    // Sorted, with repeats kept: two British travelers and one American is "GB,GB,US".
    nationalities: [...trip.nationalities].sort().join(","),
    traveler_nationality: trip.travelerNationality ?? undefined,
  };
}
