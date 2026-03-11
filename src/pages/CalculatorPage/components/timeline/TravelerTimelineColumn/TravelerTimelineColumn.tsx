import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { tokens } from "@/styles/theme";
import { TimelineTripCard } from "../../trips/TimelineTripCard";
import {
  dateToTop,
  computeTotalHeight,
  getTripGeometry,
  COLUMN_MIN_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import { computeStatusAtTripExit } from "../../travelers/travelerStatus";
import { today as getToday } from "@/features/calculator/utils/dates";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  timelineStart: Date;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
}

/**
 * Card-body canvas for one traveler in the timeline.
 *
 * Intentionally has no header — the header lives in TimelineView's unified
 * sticky header row. This component is purely the scrollable card area.
 *
 * z-index ladder within this canvas:
 *   Hovered card    50  (managed inside TimelineTripCard)
 *   Cards         4…4+n (later entry = higher, covers min-height overlap)
 *   Add button       3
 *   Today line       2
 *   Shading        0–1
 */
export function TravelerTimelineColumn({
  traveler,
  timelineStart,
  onAddTrip,
  onEditTrip,
}: TravelerTimelineColumnProps) {
  const today = getToday();
  const todayTop = dateToTop(today, timelineStart);
  const totalHeight = computeTotalHeight(timelineStart);

  // Later entry date = higher base z so min-height expansion doesn't bury newer trips.
  const sortedTripIds = [...traveler.trips]
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((t) => t.id);

  const BASE_Z = 4;

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        minWidth: COLUMN_MIN_WIDTH,
        flex: 1,
        height: totalHeight,
        bgcolor: tokens.white,
        borderRight: `1px solid ${tokens.border}`,
        "&:last-of-type": { borderRight: "none" },
      }}
    >
      {/* Past shade */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: todayTop,
          bgcolor: "rgba(12,30,60,0.025)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Future shade */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: todayTop,
          bottom: 0,
          bgcolor: "rgba(237,240,245,0.45)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Spine */}
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
        const { top, height, naturalHeight, durationDays, layoutMode } =
          getTripGeometry(trip, timelineStart);
        const statusAtExit = computeStatusAtTripExit(traveler, trip.id);
        const rank = sortedTripIds.indexOf(trip.id);

        return (
          <TimelineTripCard
            key={trip.id}
            trip={trip}
            top={top}
            height={height}
            naturalHeight={naturalHeight}
            statusAtExit={statusAtExit}
            durationDays={durationDays}
            layoutMode={layoutMode}
            baseZIndex={BASE_Z + rank}
            onEdit={() => onEditTrip(traveler.id, trip)}
          />
        );
      })}

      {/* Add trip button */}
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
  );
}
