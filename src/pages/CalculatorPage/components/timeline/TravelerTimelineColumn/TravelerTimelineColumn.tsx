import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { tokens } from "@/styles/theme";
import { TimelineTripCard } from "../../trips/TimelineTripCard";
import {
  dateToTop,
  computeTotalHeight,
  getTripGeometry,
  computeLaneAssignments,
  COLUMN_MIN_WIDTH,
  CARD_LEFT_BASE,
  CARD_RIGHT_MARGIN,
  LANE_GAP,
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
 * Uses a ResizeObserver to track the column's actual rendered width so that
 * lane geometry is always computed against the real pixel width rather than
 * a fallback constant. This avoids the "all cards are 40% wide" bug that
 * occurs when offsetWidth is read synchronously during render (before layout).
 */
export function TravelerTimelineColumn({
  traveler,
  timelineStart,
  onAddTrip,
  onEditTrip,
}: TravelerTimelineColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [columnWidth, setColumnWidth] = useState(COLUMN_MIN_WIDTH);

  // ResizeObserver keeps columnWidth in sync with the actual rendered width.
  // Fires once after mount (with the real width) and again on any resize.
  useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width && width > 0) setColumnWidth(width);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const today = getToday();
  const todayTop = dateToTop(today, timelineStart);
  const totalHeight = computeTotalHeight(timelineStart);

  const sortedTrips = [...traveler.trips].sort((a, b) =>
    a.entryDate < b.entryDate ? -1 : 1,
  );

  const geometries = new Map(
    sortedTrips.map((trip) => [trip.id, getTripGeometry(trip, timelineStart)]),
  );

  const laneAssignments = computeLaneAssignments(
    sortedTrips.map((trip) => {
      const g = geometries.get(trip.id)!;
      return { id: trip.id, top: g.top, height: g.height };
    }),
    columnWidth,
  );

  const availableWidth = columnWidth - CARD_LEFT_BASE - CARD_RIGHT_MARGIN;

  function resolveCardGeometry(tripId: string): {
    cardLeft: number;
    cardWidth: number;
  } {
    const { laneIndex, numLanes } = laneAssignments.get(tripId) ?? {
      laneIndex: 0,
      numLanes: 1,
    };
    const laneWidth = availableWidth / numLanes;
    const cardLeft = CARD_LEFT_BASE + laneIndex * laneWidth;
    const cardWidth =
      laneIndex < numLanes - 1 ? laneWidth - LANE_GAP : laneWidth;
    return { cardLeft, cardWidth };
  }

  const BASE_Z = 4;

  return (
    <Box
      ref={columnRef}
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
      {sortedTrips.map((trip, rank) => {
        const { top, height, naturalHeight, durationDays, layoutMode } =
          geometries.get(trip.id)!;
        const statusAtExit = computeStatusAtTripExit(traveler, trip.id);
        const { cardLeft, cardWidth } = resolveCardGeometry(trip.id);

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
            cardLeft={cardLeft}
            cardWidth={cardWidth}
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
