import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Traveler, Trip } from "@/types";
import { tokens } from "@/styles/theme";
import {
  computeTravelerStatus,
  computeStatusAtTripExit,
} from "@/features/calculator/utils/timelineLayout";
import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { TripListCard } from "../../trips/TripListCard";

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
        }}
      >
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
        <Box
          onClick={() => onAddTrip(traveler.id)}
          sx={{
            border: `1.5px dashed ${tokens.border}`,
            borderRadius: "8px",
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
            color: tokens.textSoft,
            fontFamily: tokens.fontBody,
            fontSize: "0.78rem",
            fontWeight: 600,
            bgcolor: tokens.white,
            mt: sortedTrips.length > 0 ? "4px" : 0,
            transition: "all 0.15s",
            "&:hover": {
              borderColor: tokens.navy,
              color: tokens.navy,
              bgcolor: tokens.mist,
            },
          }}
        >
          <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
            +
          </Box>
          Add trip
        </Box>
      </Box>
    </Box>
  );
}
