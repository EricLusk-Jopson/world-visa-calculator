import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Traveler, Trip } from "@/types";
import { tokens } from "@/styles/theme";

import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { TripListCard } from "../../trips/TripListCard";
import {
  computeTravelerStatus,
  computeStatusAtTripExit,
} from "../../travelers/travelerStatus";
import { AddTripButton } from "./AddTripButton";

interface TravelerCardsColumnProps {
  traveler: Traveler;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
}

/**
 * One column in the cards view. Sticky header + scrollable list of trip cards
 * sorted chronologically + an "Add trip" button at the bottom.
 */
export function TravelerCardsColumn({
  traveler,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
}: TravelerCardsColumnProps) {
  const status = computeTravelerStatus(traveler);

  // Sort trips chronologically by entry date
  const sortedTrips = [...traveler.trips].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 280,
        flex: 1,
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
          "&::-webkit-scrollbar": {
            width: "5px", // thinner
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            mx: "3px", // MUI sx won't apply here — use margin in the thumb instead
            pt: "100px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: tokens.border,
            borderRadius: "4px",
            border: "1px solid transparent", // creates a small gap around the thumb
          },
        }}
      >
        {/* Top "Add trip" — only when list is long */}
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
              Add a trip to start tracking this traveler's allowance.
            </Typography>
          </Box>
        ) : (
          sortedTrips.map((trip) => {
            const statusAtExit = computeStatusAtTripExit(traveler, trip.id);
            return (
              <TripListCard
                key={trip.id}
                trip={trip}
                statusAtExit={statusAtExit}
                onEdit={() => onEditTrip(traveler.id, trip)}
              />
            );
          })
        )}

        {/* Add trip button */}
        <AddTripButton
          onClick={() => onAddTrip(traveler.id)}
          mt={sortedTrips.length > 0 ? "4px" : 0}
        />
      </Box>
    </Box>
  );
}
