import { useContext, useMemo } from "react";
import { SourceTripContext, type SourceTrip } from "./sourceTrip";

export function SourceTripProvider({ trip, children }: { trip: SourceTrip; children: React.ReactNode }) {
  return <SourceTripContext.Provider value={trip}>{children}</SourceTripContext.Provider>;
}

/** Narrows the trip to one traveler's card, keeping the trip-wide counts. */
export function SourceTravelerProvider({ nationality, children }: { nationality: string | null; children: React.ReactNode }) {
  const parent = useContext(SourceTripContext);
  const value = useMemo(
    () => (parent ? { ...parent, travelerNationality: nationality } : null),
    [parent, nationality],
  );
  return <SourceTripContext.Provider value={value}>{children}</SourceTripContext.Provider>;
}
