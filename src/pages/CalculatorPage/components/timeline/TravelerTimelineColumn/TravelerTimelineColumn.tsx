import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { tokens } from "@/styles/theme";
import {
  COLUMN_MIN_WIDTH,
  computeStatusAtTripExit,
  computeTravelerStatus,
  dateToTop,
  getToday,
  getTripGeometry,
  PX_PER_DAY,
  TIMELINE_DAYS_BEFORE,
  TOTAL_HEIGHT,
} from "@/features/calculator/utils/timelineLayout";
import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { TimelineTripCard } from "../../trips/TimelineTripCard";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
}

/**
 * One vertical column in the timeline view, containing:
 * - Sticky traveler header
 * - 180-day lookback shade
 * - Future shade (after today)
 * - Vertical spine
 * - Today line
 * - Absolutely-positioned trip cards
 * - "Add trip" dashed button at the bottom
 */
export function TravelerTimelineColumn({
  traveler,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
}: TravelerTimelineColumnProps) {
  const today = getToday();
  // const timelineStart = getTimelineStart();
  const todayTop = dateToTop(today);
  const status = computeTravelerStatus(traveler);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: COLUMN_MIN_WIDTH,
        flex: 1,
        borderRight: `1px solid ${tokens.border}`,
        "&:last-of-type": { borderRight: "none" },
      }}
    >
      {/* Sticky column header */}
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

      {/* Scrollable timeline body */}
      <Box
        sx={{
          position: "relative",
          height: TOTAL_HEIGHT,
          bgcolor: tokens.white,
        }}
      >
        {/* 180-day lookback window shade */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: TIMELINE_DAYS_BEFORE * PX_PER_DAY,
            bgcolor: `rgba(12,30,60,0.025)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Future shade (after today) */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: todayTop,
            bottom: 0,
            bgcolor: `rgba(237,240,245,0.45)`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Vertical spine */}
        <Box
          sx={{
            position: "absolute",
            left: 28,
            top: 0,
            bottom: 0,
            width: 2,
            bgcolor: tokens.border,
            zIndex: 1,
          }}
        />

        {/* Today line */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: todayTop,
            height: 2,
            bgcolor: tokens.green,
            zIndex: 2,
            "&::before": {
              content: '""',
              position: "absolute",
              left: 22,
              top: "50%",
              transform: "translateY(-50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: tokens.green,
              border: `2px solid ${tokens.white}`,
              boxShadow: `0 0 0 3px ${tokens.greenBg}`,
            },
          }}
        />

        {/* Trip cards */}
        {traveler.trips.map((trip) => {
          const { top, height, durationDays } = getTripGeometry(trip);
          const statusAtExit = computeStatusAtTripExit(traveler, trip.id);
          return (
            <TimelineTripCard
              key={trip.id}
              trip={trip}
              top={top}
              height={height}
              statusAtExit={statusAtExit}
              durationDays={durationDays}
              onEdit={() => onEditTrip(traveler.id, trip)}
            />
          );
        })}

        {/* Add trip dashed button */}
        <Box
          onClick={() => onAddTrip(traveler.id)}
          sx={{
            position: "absolute",
            left: 40,
            right: 12,
            bottom: 16,
            height: 36,
            border: `1.5px dashed ${tokens.border}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
            bgcolor: tokens.white,
            color: tokens.textSoft,
            fontFamily: tokens.fontBody,
            fontSize: "0.75rem",
            fontWeight: 600,
            zIndex: 3,
            transition: "all 0.15s",
            "&:hover": {
              borderColor: tokens.navy,
              color: tokens.navy,
              bgcolor: tokens.mist,
            },
          }}
        >
          <Box component="span" sx={{ fontSize: "0.9rem", lineHeight: 1 }}>
            +
          </Box>
          Add trip
        </Box>
      </Box>
    </Box>
  );
}
