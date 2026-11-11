import { useRef, useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
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
  MARKER_GUTTER_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import {
  today as getToday,
  parseDate,
  formatDate,
  addDays,
} from "@/features/calculator/utils/dates";
import {
  calculateEarliestEntry,
  calculateMaxStay,
} from "@/features/calculator/utils/schengen";
import {
  type WindowMarkers,
  returnMarkerThresholdText,
  agingMarkerTripLine,
  regionMarkerName,
  stackGutterItems,
  AGING_MARKER_EXPLANATION,
} from "@/features/calculator/utils/windowMarkers";
import {
  MarkerGuideLine,
  ReturnGutterChip,
  AgingGutterChip,
} from "../GutterMarkers";
import {
  returnMarkerColors,
  RETURN_CHIP_HEIGHT,
  AGING_CHIP_HEIGHT,
  AGING_CHIP_FIRST_ROW,
  GUTTER_CHIP_GAP,
} from "../gutterMarkerStyle";
import { computeOverstayTripIds } from "../../trips/tripDuration";
import { tripGroupKey } from "../../trips/tripHelpers";
import { getSchengenRule } from "@/data/regions/schengen";
import { getUKRule } from "@/data/regions/uk";
import { getIrelandRule } from "@/data/regions/ireland";
import { assessRegionTripStay } from "@/features/calculator/utils/stayCalculator";

interface TravelerTimelineColumnProps {
  traveler: Traveler;
  timelineStart: Date;
  timelineEnd: Date;
  width: number;
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (trip: Trip) => void;
  /** Group key of the shared trip currently hovered in any column. */
  hoveredTripKey: string | null;
  onHoverTrip: (key: string | null) => void;
  /** This traveller's rolling-window markers, computed by the timeline. */
  markers: WindowMarkers;
  /**
   * Trip cards drawn as plain light-grey tiles, with the marker lines on top
   * of them — for reading markers against trips.
   */
  mutedTrips: boolean;
}

// ─── Marker gutter ────────────────────────────────────────────────────────────

/** x of the timeline spine; gutter chips start just right of it. */
const SPINE_LEFT = 28;
const GUTTER_ITEM_LEFT = SPINE_LEFT + 8;
const GUTTER_ITEM_WIDTH = MARKER_GUTTER_WIDTH - 12;

// ─── Column ───────────────────────────────────────────────────────────────────

export function TravelerTimelineColumn({
  traveler,
  timelineStart,
  timelineEnd,
  onEditTrip,
  hoveredTripKey,
  onHoverTrip,
  width,
  markers,
  mutedTrips,
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

  const todayStr = formatDate(today);
  const highlightedTripId = (() => {
    const ongoing = sortedTrips.find(
      (t) => !t.exitDate && t.entryDate <= todayStr,
    );
    if (ongoing) return ongoing.id;
    const upcoming = sortedTrips.find((t) => t.entryDate > todayStr);
    return upcoming?.id ?? null;
  })();

  const geometries = new Map(
    sortedTrips.map((trip) => [trip.id, getTripGeometry(trip, timelineStart)]),
  );

  // Markers only exist where the traveller's passport gets a rolling window,
  // so a visa-required destination simply contributes none. The gutter is
  // only reserved when there is something to put in it.
  const thresholdMarkers = useMemo(
    () => markers.returnMarkers.filter((m) => !m.isCurrent),
    [markers],
  );
  const { agingMarkers } = markers;
  const hasGutter = thresholdMarkers.length + agingMarkers.length > 0;
  const cardLeftBase = hasGutter
    ? CARD_LEFT_BASE + MARKER_GUTTER_WIDTH
    : CARD_LEFT_BASE;

  // Gutter placement: return chips first, then aging chips, in one stack.
  const gutterTops = useMemo(
    () =>
      stackGutterItems(
        [
          ...thresholdMarkers.map((m) => ({
            anchor: m.top,
            height: RETURN_CHIP_HEIGHT,
            firstRowHeight: RETURN_CHIP_HEIGHT,
          })),
          ...agingMarkers.map((m) => ({
            anchor: m.top,
            height: AGING_CHIP_HEIGHT,
            firstRowHeight: AGING_CHIP_FIRST_ROW,
          })),
        ],
        GUTTER_CHIP_GAP,
      ),
    [thresholdMarkers, agingMarkers],
  );
  const returnTops = gutterTops.slice(0, thresholdMarkers.length);
  const agingTops = gutterTops.slice(thresholdMarkers.length);

  const laneAssignments = computeLaneAssignments(
    sortedTrips.map((trip) => {
      const g = geometries.get(trip.id)!;
      return { id: trip.id, top: g.top, height: g.height };
    }),
    columnWidth,
    cardLeftBase,
  );

  const availableWidth = columnWidth - cardLeftBase - CARD_RIGHT_MARGIN;

  function resolveCardGeometry(tripId: string): {
    cardLeft: number;
    cardWidth: number;
  } {
    const { laneIndex, numLanes } = laneAssignments.get(tripId) ?? {
      laneIndex: 0,
      numLanes: 1,
    };
    const laneWidth = availableWidth / numLanes;
    const cardLeft = cardLeftBase + laneIndex * laneWidth;
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

  // Overstay detection — region-aware (Schengen, Türkiye, UK, Ireland).
  const overstayTripIds = useMemo(
    () => computeOverstayTripIds(traveler),
    [traveler],
  );

  const ADD_BUTTON_HEIGHT = 36;
  const ADD_BUTTON_MARGIN = 16;
  const defaultButtonTop = totalHeight - ADD_BUTTON_HEIGHT - ADD_BUTTON_MARGIN;

  const addButtonTop = useMemo(() => {
    if (gutterTops.length === 0) return defaultButtonTop;
    const lastMarkerBottom = Math.max(...gutterTops) + AGING_CHIP_HEIGHT;
    const minTop = lastMarkerBottom + ADD_BUTTON_MARGIN;
    return Math.max(defaultButtonTop, minTop);
  }, [gutterTops, defaultButtonTop]);

  const BASE_Z = 4;
  // Guide lines sit behind the cards, or over them while cards are muted.
  const guideZ = mutedTrips ? BASE_Z + sortedTrips.length + 1 : 2;

  return (
    <Box
      ref={columnRef}
      sx={{
        position: "relative",
        zIndex: 1,
        minWidth: COLUMN_MIN_WIDTH,
        maxWidth: width,
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
          left: SPINE_LEFT,
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

      {/* Marker guide lines, at each marker's exact date, across the trip
          area only — they start where the gutter ends, so they never
          strike through a gutter chip. */}
      {thresholdMarkers.map((m, i) => {
        const { lineBase, lineOpacity } = returnMarkerColors(m.days, m.allowance);
        return (
          <MarkerGuideLine
            key={`thr-line-${m.region}-${m.days}-${i}`}
            top={m.top}
            left={cardLeftBase - 4}
            kind="return"
            color={lineBase}
            opacity={mutedTrips ? Math.min(1, lineOpacity * 2) : lineOpacity}
            zIndex={guideZ}
          />
        );
      })}
      {agingMarkers.map((m, i) => (
        <MarkerGuideLine
          key={`aging-line-${m.region}-${m.entryDate}-${i}`}
          top={m.top}
          left={cardLeftBase - 4}
          kind="aging"
          color={tokens.textSoft}
          opacity={mutedTrips ? 0.55 : 0.25}
          zIndex={guideZ}
        />
      ))}

      {/* Marker gutter — chips never sit under a card */}
      {thresholdMarkers.map((m, i) => (
        <ReturnGutterChip
          key={`thr-${m.region}-${m.days}-${i}`}
          top={returnTops[i]}
          left={GUTTER_ITEM_LEFT}
          width={GUTTER_ITEM_WIDTH}
          regionName={regionMarkerName(m.region)}
          days={m.days}
          allowance={m.allowance}
          tooltip={returnMarkerThresholdText(m.region, m.date, m.days)}
        />
      ))}
      {agingMarkers.map((m, i) => (
        <AgingGutterChip
          key={`aging-${m.region}-${m.entryDate}-${i}`}
          top={agingTops[i]}
          left={GUTTER_ITEM_LEFT}
          width={GUTTER_ITEM_WIDTH}
          title={m.destination}
          tripDays={m.tripDays}
          tooltip={`${agingMarkerTripLine(m.region, m.destination, m.tripDays, m.date)}. ${AGING_MARKER_EXPLANATION}`}
        />
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

        const ukRule = getUKRule(traveler.passportCode);
        const irelandRule = getIrelandRule(traveler.passportCode);

        const ukStayInfo =
          trip.region === VisaRegion.UnitedKingdom && trip.exitDate
            ? (assessRegionTripStay(
                VisaRegion.UnitedKingdom,
                traveler.passportCode,
                trip,
                traveler.trips,
              ) ?? undefined)
            : undefined;

        const irelandStayInfo =
          trip.region === VisaRegion.Ireland && trip.exitDate
            ? (assessRegionTripStay(
                VisaRegion.Ireland,
                traveler.passportCode,
                trip,
                traveler.trips,
              ) ?? undefined)
            : undefined;

        const groupKey = tripGroupKey(trip);

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
            isHighlighted={trip.id === highlightedTripId}
            passportRule={getSchengenRule(traveler.passportCode)}
            ukPassportRule={traveler.passportCode ? ukRule : undefined}
            irelandPassportRule={
              traveler.passportCode ? irelandRule : undefined
            }
            ukStayInfo={ukStayInfo}
            irelandStayInfo={irelandStayInfo}
            muted={mutedTrips}
            hovered={hoveredTripKey === groupKey}
            onHoverChange={(h) =>
              h
                ? onHoverTrip(groupKey)
                : hoveredTripKey === groupKey && onHoverTrip(null)
            }
            onEdit={() => onEditTrip(trip)}
          />
        );
      })}
    </Box>
  );
}
