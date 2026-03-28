import Box from "@mui/material/Box";
import { type Traveler, type Trip, VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";

import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { TripListCard } from "../../trips/TripListCard";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import {
  calculateMaxStay,
  calculateEarliestEntry,
} from "@/features/calculator/utils/schengen";
import {
  parseDate,
  formatDate,
  addDays,
  today as getToday,
} from "@/features/calculator/utils/dates";
import { AddTripButton } from "./AddTripButton";
import { MIN_COLUMN_WIDTH } from "../CardsView/CardsView";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns a Set of trip IDs that are in an overstay state at their exit date.
 * A trip is overstay when, at the moment it ends, more than 90 Schengen days
 * have been used in the trailing 180-day window.
 */
function computeOverstayTripIds(traveler: Traveler): Set<string> {
  const schengenTrips = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );
  if (schengenTrips.length === 0) return new Set();

  const mockTraveler = { id: "__overstay__", name: "", trips: schengenTrips };
  const result = new Set<string>();

  for (const trip of schengenTrips) {
    const refDate = trip.exitDate ? parseDate(trip.exitDate) : getToday();
    const status = computeTravelerStatus(mockTraveler, refDate);
    if (status.daysUsed > 90) {
      result.add(trip.id);
    }
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface TravelerCardsColumnProps {
  traveler: Traveler;
  /**
   * When true, every column header switches to the two-row compact layout.
   * Sourced from CardsView so the transition fires simultaneously for all
   * columns.
   */
  compact: boolean;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
}

/**
 * One column in the cards view. Sticky header + scrollable trip list +
 * "Add trip" button at the bottom.
 *
 * flex: "1 1 0" — zero flex-basis ensures equal width distribution.
 * minWidth: MIN_COLUMN_WIDTH — horizontal scroll kicks in before columns
 * compress below the minimum content width.
 */
export function TravelerCardsColumn({
  traveler,
  compact,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
}: TravelerCardsColumnProps) {
  const status = computeTravelerStatus(traveler);

  const sortedTrips = [...traveler.trips].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
  );

  const schengenTrips = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );

  const todayStr = formatDate(new Date());
  const headerMaxStayResult = calculateMaxStay(todayStr, schengenTrips);
  const headerMaxStay = headerMaxStayResult.canEnter
    ? headerMaxStayResult.maxDays
    : 0;

  // Overstay detection — computed once for the column, passed per card.
  const overstayTripIds = computeOverstayTripIds(traveler);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // Zero flex-basis so every column starts from the same baseline before
        // flex distributes the remaining space — guarantees equal widths.
        flex: "1 1 0",
        minWidth: MIN_COLUMN_WIDTH,
        height: "100%",
        borderRight: `1px solid ${tokens.border}`,
        "&:last-of-type": { borderRight: "none" },
      }}
    >
      {/* Sticky header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: tokens.offWhite,
          borderBottom: `1px solid ${tokens.border}`,
          p: "12px",
        }}
      >
        <TravelerColumnHeader
          traveler={traveler}
          status={status}
          maxStay={headerMaxStay}
          compact={compact}
          onDelete={() => onDeleteTraveler(traveler.id)}
        />
      </Box>

      {/* Trip list */}
      <Box
        sx={{
          p: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            mx: "3px",
            pt: "100px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: tokens.border,
            borderRadius: "4px",
            border: "1px solid transparent",
          },
        }}
      >
        {sortedTrips.length >= 5 && (
          <AddTripButton onClick={() => onAddTrip(traveler.id)} />
        )}

        {sortedTrips.length === 0 ? (
          <Box
            sx={{
              border: `1.5px dashed ${tokens.border}`,
              borderRadius: "10px",
              p: "24px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              bgcolor: tokens.white,
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontDisplay,
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: tokens.text,
              }}
            >
              No trips yet
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: tokens.textSoft,
                textAlign: "center",
              }}
            >
              Add a trip to start tracking this traveler&apos;s allowance.
            </Typography>
          </Box>
        ) : (
          sortedTrips.map((trip) => {
            let maxStayAtExit = 0;
            let earliestReEntry: string | null = null;

            if (trip.region === VisaRegion.Schengen && trip.exitDate) {
              const exitDate = parseDate(trip.exitDate);
              const nextEntryStr = formatDate(addDays(exitDate, 1));
              const maxStay = calculateMaxStay(nextEntryStr, schengenTrips);
              if (maxStay.canEnter) {
                maxStayAtExit = maxStay.maxDays;
              } else {
                const earliest = calculateEarliestEntry(
                  schengenTrips,
                  nextEntryStr,
                );
                earliestReEntry = earliest.earliestDate;
              }
            }

            return (
              <TripListCard
                key={trip.id}
                trip={trip}
                maxStayAtExit={maxStayAtExit}
                earliestReEntry={earliestReEntry}
                isOverstay={overstayTripIds.has(trip.id)}
                onEdit={() => onEditTrip(traveler.id, trip)}
              />
            );
          })
        )}

        <AddTripButton
          onClick={() => onAddTrip(traveler.id)}
          mt={sortedTrips.length > 0 ? "4px" : 0}
        />
      </Box>
    </Box>
  );
}
