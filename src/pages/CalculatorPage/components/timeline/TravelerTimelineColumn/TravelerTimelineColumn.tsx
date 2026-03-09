import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { tokens } from "@/styles/theme";
import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { TimelineTripCard } from "../../trips/TimelineTripCard";
import {
  dateToTop,
  computeTotalHeight,
  getTripGeometry,
  COLUMN_MIN_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import {
  computeTravelerStatus,
  computeStatusAtTripExit,
} from "../../travelers/travelerStatus";
import { today as getToday } from "@/features/calculator/utils/dates";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  timelineStart: Date;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
}

/**
 * One vertical column in the timeline view.
 *
 * Two-layer structure:
 *   1. Sticky header  — position:sticky, top:0, zIndex:10. Always above cards.
 *   2. Scrolling body — position:relative, full canvas height. Contains shading,
 *      spine, today line, and absolutely-positioned trip cards.
 *
 * z-index stacking for cards: later entry date = higher base z (so a short trip
 * expanded to CARD_MIN_HEIGHT is covered by later trips that overlap it visually).
 * Hovering bumps the card to zIndex 50 so it always reads above neighbours.
 *
 * z-index ladder:
 *   DateSidebar          15
 *   Column headers       10
 *   Hovered card         50  (managed inside TimelineTripCard)
 *   Cards          3 … 3+n  (later entry = higher)
 *   Add-trip button        3  (below cards so cards clip over it)
 *   Today line             2
 *   Spine / shading      0–1
 */
export function TravelerTimelineColumn({
  traveler,
  timelineStart,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
}: TravelerTimelineColumnProps) {
  const today = getToday();
  const todayTop = dateToTop(today, timelineStart);
  const totalHeight = computeTotalHeight(timelineStart);
  const status = computeTravelerStatus(traveler);

  // Sort trips by entry date ascending so we can derive a stable z-index rank.
  // Later trips (higher index) get a higher z so they paint over earlier ones
  // when min-height expansion causes visual overlap.
  const sortedTripIds = [...traveler.trips]
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
    .map((t) => t.id);

  const BASE_Z = 4; // cards start above today line (z=2) and add button (z=3)

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
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
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

      {/* ── Scrolling body ────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: totalHeight,
          bgcolor: tokens.white,
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

        {/* Today line — in body so it scrolls with the calendar */}
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
          const baseZIndex = BASE_Z + rank;

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
              baseZIndex={baseZIndex}
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
    </Box>
  );
}
