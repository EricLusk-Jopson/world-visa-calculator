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

// ─── Marker visuals ───────────────────────────────────────────────────────────

function markerColors(days: number, isCurrent: boolean) {
  // Generous (≥30d) → green palette. Limited (<30d) → amber palette.
  const isGenerous = days >= 30;
  return {
    lineBase: isGenerous ? tokens.green : tokens.amber,
    textColor: isGenerous ? tokens.greenText : tokens.amberText,
    bgColor: isGenerous ? tokens.greenBg : tokens.amberBg,
    // Current snapshot: slightly bolder treatment; threshold: subtler
    lineOpacity: isCurrent ? 0.45 : days % 30 === 0 ? 0.35 : 0.18,
    pillOpacity: isCurrent ? 1 : days % 30 === 0 ? 1 : 0.65,
  };
}

/**
 * A horizontal marker at a specific date on the timeline.
 *
 * Two variants:
 *
 * isCurrent=true  — "snapshot" chip at a phase boundary (today or the day
 *   after a pending trip ends). Shows the exact max stay available on that
 *   date. No dashed line — the pill floats alone against the timeline.
 *
 * isCurrent=false — "milestone" chip at the first date a given threshold
 *   (15/30/45/60/75/90) becomes achievable. Has a dashed horizontal rule.
 *
 * The outer Box uses pointerEvents:none so it never intercepts scroll or card
 * clicks. The pill re-enables them so the Tooltip can trigger on hover.
 */
function MarkerLine({ top, days, isCurrent }: ReturnMarker) {
  const { lineBase, textColor, bgColor, lineOpacity, pillOpacity } =
    markerColors(days, isCurrent);

  const tooltipText = isCurrent
    ? `Currently, you can start a Schengen trip of up to ${days} days.`
    : `From this date, a ${days}-day Schengen trip first becomes possible.`;

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {/* Dashed rule — only for milestone (threshold) chips */}
      {!isCurrent && (
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
      )}

      {/* Pill */}
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
              maxWidth: 220,
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            // Current chips sit at the left column edge; threshold chips at
            // the same left:32 position as before to align with the dashed line.
            left: isCurrent ? 20 : 32,
            top: 0,
            transform: "translateY(-50%)",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            px: isCurrent ? "7px" : "5px",
            py: "2px",
            borderRadius: "100px",
            bgcolor: bgColor,
            border: `1px solid ${alpha(lineBase, isCurrent ? 0.4 : 0.2)}`,
            // Solid border for current chips; inherit for threshold chips
            borderStyle: isCurrent ? "solid" : "dashed",
            pointerEvents: "auto",
            cursor: "default",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: isCurrent ? "0.58rem" : "0.52rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: alpha(textColor, pillOpacity),
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {days}d
          </Typography>
          <InfoOutlinedIcon
            sx={{
              fontSize: isCurrent ? "0.65rem" : "0.6rem",
              color: alpha(textColor, pillOpacity * 0.7),
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

  // Keep the Add Trip button clear of the lowest marker.
  const ADD_BUTTON_HEIGHT = 36;
  const ADD_BUTTON_MARGIN = 16;
  const defaultButtonTop = totalHeight - ADD_BUTTON_HEIGHT - ADD_BUTTON_MARGIN;

  const addButtonTop = useMemo(() => {
    if (returnMarkers.length === 0) return defaultButtonTop;
    const lastMarkerTop = Math.max(...returnMarkers.map((m) => m.top));
    // Pill is centered (translateY -50%); its bottom edge is ~top + 10px.
    const minTop = lastMarkerTop + 10 + ADD_BUTTON_MARGIN;
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
        // Extend canvas if the add button has been pushed below totalHeight.
        height: Math.max(
          totalHeight,
          addButtonTop + ADD_BUTTON_HEIGHT + ADD_BUTTON_MARGIN,
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
      {returnMarkers.map((marker, i) => (
        <MarkerLine
          key={`${marker.isCurrent ? "cur" : "thr"}-${marker.days}-${i}`}
          {...marker}
        />
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

      {/* Add trip button */}
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
