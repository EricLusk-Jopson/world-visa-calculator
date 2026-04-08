import { useRef, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { type Traveler, type Trip, VisaRegion } from "@/types";

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
import {
  today as getToday,
  parseDate,
  formatDate,
  addDays,
} from "@/features/calculator/utils/dates";
import {
  type ReturnMarker,
  computeReturnMarkers,
} from "@/features/calculator/utils/returnmarkers";
import {
  type AgingMarker,
  computeAgingMarkers,
} from "@/features/calculator/utils/agingMarkers";
import {
  calculateEarliestEntry,
  calculateMaxStay,
} from "@/features/calculator/utils/schengen";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import { getSchengenRule } from "@/data/regions/schengen";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  timelineStart: Date;
  timelineEnd: Date;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
}

// ─── Return marker visual ─────────────────────────────────────────────────────

function markerColors(days: number, isCurrent: boolean) {
  const isGenerous = days >= 30;
  return {
    lineBase: isGenerous ? tokens.green : tokens.amber,
    textColor: isGenerous ? tokens.greenText : tokens.amberText,
    bgColor: isGenerous ? tokens.greenBg : tokens.amberBg,
    lineOpacity: isCurrent ? 0.45 : days % 30 === 0 ? 0.35 : 0.18,
    pillOpacity: isCurrent ? 1 : days % 30 === 0 ? 1 : 0.65,
  };
}

function MarkerLine({ top, days, isCurrent, date }: ReturnMarker) {
  const { lineBase, textColor, bgColor, lineOpacity, pillOpacity } =
    markerColors(days, isCurrent);

  const tooltipText = isCurrent
    ? `Currently, you can start a Schengen trip of up to ${days} days.`
    : `From ${date.toDateString()}, a ${days}-day Schengen trip first becomes possible.`;

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

// ─── Aging-out marker visual ──────────────────────────────────────────────────

/**
 * Marks the date when a historical trip's days start aging out of the 180-day
 * window. Visually distinct from return markers: dotted line (vs dashed),
 * lower opacity, and a centered label breaking the line.
 */
function AgingMarkerLine({
  top,
  tripDays,
  destination,
  entryDate,
}: AgingMarker) {
  const LINE_OPACITY = 0.12;
  const TEXT_OPACITY = 0.4;

  const agingDate = addDays(parseDate(entryDate), 180);
  const agingDateStr = agingDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const tooltipText =
    `From ${agingDateStr}, the ${destination} trip's ${tripDays} Schengen days begin ` +
    `aging out of the 180-day window. As each day exits, your available allowance ` +
    `grows — this is typically what causes max stay to jump noticeably.`;
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
      <Box
        sx={{
          position: "absolute",
          left: 30,
          right: 10,
          top: 0,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: 0,
            borderTop: `1px dotted ${alpha(tokens.textGhost, LINE_OPACITY)}`,
          }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.52rem",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: alpha(tokens.textGhost, TEXT_OPACITY),
            whiteSpace: "nowrap",
            lineHeight: 1,
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {destination} ages out
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: 0,
            borderTop: `1px dotted ${alpha(tokens.textGhost, LINE_OPACITY)}`,
          }}
        />
      </Box>

      <Tooltip
        title={tooltipText}
        placement="left"
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
              maxWidth: 240,
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: 10,
            top: 0,
            transform: "translateY(-50%)",
            zIndex: 3,
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            px: "5px",
            py: "1.5px",
            borderRadius: "100px",
            bgcolor: tokens.mist,
            border: `1px solid ${alpha(tokens.textGhost, 0.15)}`,
            borderStyle: "dotted",
            pointerEvents: "auto",
            cursor: "default",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.5rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: alpha(tokens.textSoft, 0.7),
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            +{tripDays}d
          </Typography>
          <InfoOutlinedIcon
            sx={{
              fontSize: "0.55rem",
              color: alpha(tokens.textGhost, 0.5),
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

  // Per-trip availability.
  const tripAvailability = useMemo(() => {
    const schengenTrips = traveler.trips.filter(
      (t) => t.region === VisaRegion.Schengen,
    );
    return new Map(
      sortedTrips.map((trip) => {
        if (trip.region !== VisaRegion.Schengen || !trip.exitDate) {
          return [
            trip.id,
            { maxStayAtExit: 0, earliestReEntry: null as string | null },
          ];
        }
        const exitDate = parseDate(trip.exitDate);
        const nextEntryStr = formatDate(addDays(exitDate, 1));
        const maxStay = calculateMaxStay(nextEntryStr, schengenTrips);
        if (maxStay.canEnter) {
          return [
            trip.id,
            {
              maxStayAtExit: maxStay.maxDays,
              earliestReEntry: null as string | null,
            },
          ];
        }
        const earliest = calculateEarliestEntry(schengenTrips, nextEntryStr);
        return [
          trip.id,
          { maxStayAtExit: 0, earliestReEntry: earliest.earliestDate },
        ];
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traveler]);

  // Overstay detection — computed once per traveler change.
  const overstayTripIds = useMemo(() => {
    const schengenTrips = traveler.trips.filter(
      (t) => t.region === VisaRegion.Schengen,
    );
    if (schengenTrips.length === 0) return new Set<string>();

    const mockTraveler = {
      id: "__overstay__",
      name: "",
      passportCode: null,
      trips: schengenTrips,
    };
    const result = new Set<string>();

    for (const trip of schengenTrips) {
      const refDate = trip.exitDate ? parseDate(trip.exitDate) : getToday();
      const status = computeTravelerStatus(mockTraveler, refDate);
      if (status.daysUsed > 90) {
        result.add(trip.id);
      }
    }

    return result;
  }, [traveler]);

  const returnMarkers = useMemo(
    () => computeReturnMarkers(traveler, timelineStart, timelineEnd),
    [traveler, timelineStart, timelineEnd],
  );

  const agingMarkers = useMemo(
    () => computeAgingMarkers(traveler, timelineStart, timelineEnd),
    [traveler, timelineStart, timelineEnd],
  );

  const ADD_BUTTON_HEIGHT = 36;
  const ADD_BUTTON_MARGIN = 16;
  const defaultButtonTop = totalHeight - ADD_BUTTON_HEIGHT - ADD_BUTTON_MARGIN;

  const addButtonTop = useMemo(() => {
    const allMarkerTops = [
      ...returnMarkers.map((m) => m.top),
      ...agingMarkers.map((m) => m.top),
    ];
    if (allMarkerTops.length === 0) return defaultButtonTop;
    const lastMarkerTop = Math.max(...allMarkerTops);
    const minTop = lastMarkerTop + 10 + ADD_BUTTON_MARGIN;
    return Math.max(defaultButtonTop, minTop);
  }, [returnMarkers, agingMarkers, defaultButtonTop]);

  const BASE_Z = 4;

  return (
    <Box
      ref={columnRef}
      sx={{
        position: "relative",
        zIndex: 1,
        minWidth: COLUMN_MIN_WIDTH,
        flex: 1,
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

      {/* Return markers (threshold milestones) */}
      {returnMarkers
        .filter((marker) => !marker.isCurrent)
        .map((marker, i) => (
          <MarkerLine key={`thr-${marker.days}-${i}`} {...marker} />
        ))}

      {/* Aging-out markers */}
      {agingMarkers.map((marker, i) => (
        <AgingMarkerLine key={`aging-${marker.entryDate}-${i}`} {...marker} />
      ))}

      {/* Trip cards */}
      {sortedTrips.map((trip, rank) => {
        const { top, height, naturalHeight, durationDays } = geometries.get(
          trip.id,
        )!;
        const { cardLeft, cardWidth } = resolveCardGeometry(trip.id);
        const { maxStayAtExit, earliestReEntry } = tripAvailability.get(
          trip.id,
        ) ?? { maxStayAtExit: 0, earliestReEntry: null };

        return (
          <TimelineTripCard
            key={trip.id}
            trip={trip}
            top={top}
            height={height}
            naturalHeight={naturalHeight}
            maxStayAtExit={maxStayAtExit}
            earliestReEntry={earliestReEntry}
            durationDays={durationDays}
            cardLeft={cardLeft}
            cardWidth={cardWidth}
            baseZIndex={BASE_Z + rank}
            isOverstay={overstayTripIds.has(trip.id)}
            passportRule={getSchengenRule(traveler.passportCode)}
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
