/**
 * EES Record Fixer: the evidence checklist. It proves two things: that the
 * traveller left on the date claimed, and that they were outside the
 * Schengen Area afterwards. Ticked items are listed in the letter; the files
 * themselves never reach EVC.
 */

export type EvidenceRating = "required" | "best" | "helps";

export interface EvidenceItem {
  id: string;
  label: string;
  proves: string;
  rating: EvidenceRating;
}

export const EVIDENCE: EvidenceItem[] = [
  { id: "passport", label: "Passport photo page", proves: "Identity", rating: "required" },
  { id: "boarding", label: "Boarding pass (paper or mobile)", proves: "Departure on the date", rating: "best" },
  { id: "eticket", label: "E-ticket receipt or booking confirmation", proves: "Departure booked for the date", rating: "best" },
  { id: "airline", label: "Airline email confirming the flight was flown", proves: "Departure happened", rating: "best" },
  { id: "ground", label: "Train, bus or ferry ticket", proves: "Departure on the date", rating: "best" },
  { id: "arrival", label: "Entry stamp or arrival record of a non-Schengen country", proves: "Presence outside after the exit", rating: "best" },
  { id: "hotel", label: "Hotel invoice outside the Schengen Area", proves: "Presence outside", rating: "helps" },
  { id: "card", label: "Card payments or cash withdrawals outside the Schengen Area", proves: "Presence outside", rating: "helps" },
  { id: "toll", label: "Toll receipts or vignettes from non-Schengen countries", proves: "Presence outside (road trips)", rating: "helps" },
  { id: "work", label: "Work or school attendance records", proves: "Presence outside", rating: "helps" },
];

export const RATING_LABEL: Record<EvidenceRating, string> = {
  required: "Required",
  best: "Best proof",
  helps: "Also helps",
};

/** Ticked ids → labels, in checklist order. */
export function evidenceLabels(ids: string[]): string[] {
  return EVIDENCE.filter((e) => ids.includes(e.id)).map((e) => e.label);
}
