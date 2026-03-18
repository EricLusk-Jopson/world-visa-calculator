import { useRef, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
import {
  ReturnMarker,
  computeReturnMarkers,
} from "@/features/calculator/utils/returnmarkers";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  timelineStart: Date;
  timelineEnd: Date;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
}

// ─── Return marker visual ─────────────────────────────────────────────────────

/**
 * A horizontal marker on the timeline showing when a Schengen trip of `days`
 * duration first becomes possible.
 *
 * Multiples of 30 (30d, 60d, 90d) are "major" — stronger line + opaque label.
 * Other thresholds (10d, 20d, 40d …) are "minor" — faint line + dimmed label.
 *
 * The outer container is pointer-events:none so it doesn't intercept scroll,
 * but the pill itself opts back in so the MUI Tooltip can trigger on hover.
 */
function MarkerLine({ top, days }: ReturnMarker) {
  const isMajor = days % 30 === 0;
  const isGenerous = days >= 30;

  const lineBase = isGenerous ? tokens.green : tokens.amber;
  const textColor = isGenerous ? tokens.greenText : tokens.amberText;
  const bgColor = isGenerous ? tokens.greenBg : tokens.amberBg;
  const lineOpacity = isMajor ? 0.35 : 0.18;

  const tooltipText = `From this date you can start a Schengen trip of up to ${days} days.`;

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        // Pointer events off on the container so it doesn't block scroll or
        // click-through to trip cards. The pill re-enables them selectively.
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Dashed horizontal rule */}
      <Box
        sx={{
          position: "absolute",
          left: 30,
          right: 10,
          top: 0,
          height: 0,
          borderTop: `1px dashed ${alpha(lineBase, lineOpacity)}`,
        }}
      />

      {/* Pill — opt back into pointer events so Tooltip works */}
      <Tooltip
        title={tooltipText}
        placement="right"
        arrow
        enterDelay={200}
        componentsProps={{
          tooltip: {
            sx: {
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 500,
              bgcolor: tokens.navy,
              "& .MuiTooltip-arrow": { color: tokens.navy },
              maxWidth: 200,
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            left: 32,
            top: 0,
            transform: "translateY(-50%)",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            px: "5px",
            py: "1.5px",
            borderRadius: "100px",
            bgcolor: bgColor,
            border: `1px solid ${alpha(lineBase, isMajor ? 0.3 : 0.15)}`,
            // Re-enable pointer events on the pill itself
            pointerEvents: "auto",
            cursor: "default",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.52rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: isMajor ? textColor : alpha(textColor, 0.65),
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {days}d
          </Typography>
          <InfoOutlinedIcon
            sx={{
              fontSize: "0.6rem",
              color: isMajor ? textColor : alpha(textColor, 0.5),
              flexShrink: 0,
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

export function TravelerTimelineColumn({
  traveler,
  timelineStart,
  timelineEnd,
  onAddTrip,
  onEditTrip,
}: TravelerTimelineColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);
  const [columnWidth, setColumnWidth] = useState(COLUMN_MIN_WIDTH);

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
  const totalHeight = computeTotalHeight(timelineStart, timelineEnd);

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

  const returnMarkers = useMemo(
    () => computeReturnMarkers(traveler, timelineStart, timelineEnd),
    [traveler, timelineStart, timelineEnd],
  );

  // Keep the Add Trip button below the last return marker so they never
  // overlap. Default is 16px from the bottom of the canvas; if markers extend
  // further down we push the button below the bottommost marker.
  const ADD_BUTTON_HEIGHT = 36;
  const ADD_BUTTON_BOTTOM_MARGIN = 16;
  const defaultButtonTop =
    totalHeight - ADD_BUTTON_HEIGHT - ADD_BUTTON_BOTTOM_MARGIN;

  const addButtonTop = useMemo(() => {
    if (returnMarkers.length === 0) return defaultButtonTop;
    const lastMarkerTop = Math.max(...returnMarkers.map((m) => m.top));
    // Pill is centered on the marker top (translateY -50%), so bottom edge is
    // at lastMarkerTop + ~10px. Add 16px clearance below that.
    const minTop = lastMarkerTop + 10 + 16;
    return Math.max(defaultButtonTop, minTop);
  }, [returnMarkers, defaultButtonTop]);

  const BASE_Z = 4;

  return (
    <Box
      ref={columnRef}
      sx={{
        position: "relative",
        zIndex: 1,
        minWidth: COLUMN_MIN_WIDTH,
        flex: 1,
        // Extend canvas height if the add button has been pushed below the
        // default bottom so the button is never clipped.
        height: Math.max(
          totalHeight,
          addButtonTop + ADD_BUTTON_HEIGHT + ADD_BUTTON_BOTTOM_MARGIN,
        ),
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

      {/* Return markers */}
      {returnMarkers.map((marker) => (
        <MarkerLine key={marker.days} top={marker.top} days={marker.days} />
      ))}

      {/* Trip cards */}
      {sortedTrips.map((trip, rank) => {
        const { top, height, naturalHeight, durationDays } = geometries.get(
          trip.id,
        )!;
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
            cardLeft={cardLeft}
            cardWidth={cardWidth}
            baseZIndex={BASE_Z + rank}
            onEdit={() => onEditTrip(traveler.id, trip)}
          />
        );
      })}

      {/* Add trip button — positioned below the last return marker */}
      <Box
        onClick={() => onAddTrip(traveler.id)}
        sx={{
          position: "absolute",
          left: 40,
          right: 12,
          top: addButtonTop,
          height: ADD_BUTTON_HEIGHT,
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
