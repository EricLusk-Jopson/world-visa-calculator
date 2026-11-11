import { useRef, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { type Traveler, type Trip, VisaRegion, isEntitled, isVisaRequired } from "@/types";
import { tokens } from "@/styles/theme";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";
import {
  computeTimelineEnd,
  computeTimelineStart,
  computeTotalHeight,
  dateToTop,
  PX_PER_DAY,
  SIDEBAR_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import {
  today as getToday,
  parseDate,
  todayISO,
  countTripDays,
  addDays,
} from "@/features/calculator/utils/dates";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { DateSidebar } from "../../timeline/DateSidebar";
import { type PositionedTrip, assignLanes } from "./mobileTripLayout";
import { getSchengenRule } from "@/data/regions/schengen";
import {
  type AgingMarker,
  type WindowMarkers,
  computeWindowMarkers,
  stackGutterItems,
  regionMarkerName,
  returnMarkerRowText,
  agingMarkerTripLine,
  AGING_MARKER_EXPLANATION,
} from "@/features/calculator/utils/windowMarkers";
import {
  MarkerGuideLine,
  ReturnGutterChip,
  AgingGutterChip,
} from "../../timeline/GutterMarkers";
import {
  returnMarkerColors,
  RETURN_CHIP_HEIGHT,
  AGING_CHIP_HEIGHT,
  AGING_CHIP_FIRST_ROW,
  GUTTER_CHIP_GAP,
} from "../../timeline/gutterMarkerStyle";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTimelineViewProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onEditTrip: (travelerIds: string[], trip: Trip) => void;
  onAddTraveler: () => void;
  /** Draw trip cards as plain tiles so the markers read clearly over them. */
  mutedTrips: boolean;
}

/** One entry contributed by a traveler into a return-marker group. */
interface ReturnMarkerEntry {
  region: VisaRegion;
  top: number;
  date: Date;
  days: number;
  travelerIndex: number;
  travelerName: string;
  /** Longest stay the destination's rule allows this traveller. */
  allowance: number;
}

/**
 * A group of one destination's return-marker entries whose dates fall within
 * a 6-day window of the earliest entry. The group is displayed at `top` (the
 * earliest entry's position) with a combined pill and unified tooltip.
 */
interface MobileReturnMarkerGroup {
  region: VisaRegion;
  top: number;
  entries: ReturnMarkerEntry[];
  /** Unique traveler indices across all entries (for colour dots). */
  travelerIndices: number[];
  /** Highest threshold across all entries. */
  maxDays: number;
  /** Largest allowance across all entries — scales the pill's colour. */
  allowance: number;
}

/**
 * A group of aging markers whose dates fall within a 6-day window of the
 * earliest marker. When more than one trip is in the group the centre label
 * reads "X Trips Age Out" instead of the trip destination.
 */
interface MobileAgingMarkerGroup {
  region: VisaRegion;
  top: number;
  markers: AgingMarker[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEIGHT_SHOW_DATES = 44;
const HEIGHT_SHOW_BADGES = 56;
/** Vertical gap between back-to-back cards that share a lane. */
const LANE_GAP = 2;
const CARD_GUTTER = 3;

/**
 * Space kept below the last trip or marker so the fixed Add Trip button
 * (16px inset + ~44px tall, plus the safe-area inset on notched phones)
 * never covers it when the timeline is scrolled to the bottom.
 */
const FAB_CLEARANCE_PX = 120;

/** 6-day rollup window in pixels. */
const ROLLUP_PX = 6 * PX_PER_DAY;

/**
 * Width of the marker gutter at the left of the canvas, where return chips
 * and age-out labels live so a trip card never covers them. Only reserved
 * when there are markers to show.
 */
const MARKER_GUTTER_PX = 116;

// ─── Marker grouping helpers ──────────────────────────────────────────────────

/** Splits items by destination, so rollups never merge two destinations. */
function byRegion<T extends { region: VisaRegion }>(items: T[]): T[][] {
  const map = new Map<VisaRegion, T[]>();
  for (const item of items) {
    const list = map.get(item.region);
    if (list) list.push(item);
    else map.set(item.region, [item]);
  }
  return [...map.values()];
}

/**
 * Groups one destination's return-marker entries whose pixel positions fall
 * within a 6-day window of the earliest entry in a run. The window is anchored
 * to the first entry — it does NOT cascade (the window never advances beyond
 * the original anchor).
 */
function groupReturnMarkers(
  entries: ReturnMarkerEntry[],
): MobileReturnMarkerGroup[] {
  if (entries.length === 0) return [];

  const sorted = [...entries].sort((a, b) => a.top - b.top);
  const visited = new Set<number>();
  const groups: MobileReturnMarkerGroup[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const anchor = sorted[i];
    const group: ReturnMarkerEntry[] = [anchor];

    for (let j = i + 1; j < sorted.length; j++) {
      if (visited.has(j)) continue;
      if (sorted[j].top - anchor.top <= ROLLUP_PX) {
        group.push(sorted[j]);
        visited.add(j);
      }
    }

    groups.push({
      region: anchor.region,
      top: anchor.top,
      entries: group,
      travelerIndices: [...new Set(group.map((e) => e.travelerIndex))],
      maxDays: Math.max(...group.map((e) => e.days)),
      allowance: Math.max(...group.map((e) => e.allowance)),
    });
  }

  return groups;
}

/**
 * Groups one destination's aging markers whose pixel positions fall within a
 * 6-day window of the earliest marker in a run. Same non-cascading anchor
 * logic as return markers.
 */
function groupAgingMarkers(
  markers: AgingMarker[],
): MobileAgingMarkerGroup[] {
  if (markers.length === 0) return [];

  const sorted = [...markers].sort((a, b) => a.top - b.top);
  const visited = new Set<number>();
  const groups: MobileAgingMarkerGroup[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);
    const anchor = sorted[i];
    const group: AgingMarker[] = [anchor];

    for (let j = i + 1; j < sorted.length; j++) {
      if (visited.has(j)) continue;
      if (sorted[j].top - anchor.top <= ROLLUP_PX) {
        group.push(sorted[j]);
        visited.add(j);
      }
    }

    groups.push({ region: anchor.region, top: anchor.top, markers: group });
  }

  return groups;
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

const CHIP_SX = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.58rem",
  fontWeight: 700,
  px: "5px",
  py: "1px",
  borderRadius: "100px",
  lineHeight: "14px",
  whiteSpace: "nowrap" as const,
  flexShrink: 0,
};

function Chip({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Box component="span" sx={{ ...CHIP_SX, bgcolor: bg, color }}>
      {children}
    </Box>
  );
}

// ─── Trip card ────────────────────────────────────────────────────────────────

interface MobileTimelineTripCardProps {
  positioned: PositionedTrip;
  isHighlighted: boolean;
  /** Plain light-grey tile with no text or chips, so markers read over it. */
  muted: boolean;
  onClick: () => void;
}

function MobileTimelineTripCard({
  positioned,
  isHighlighted,
  muted,
  onClick,
}: MobileTimelineTripCardProps) {
  const { trip, entries, height, isOverstay } = positioned;

  if (muted) {
    return (
      <Box
        onClick={onClick}
        sx={{
          height: "100%",
          borderRadius: "8px",
          bgcolor: alpha(tokens.mist, 0.7),
          border: `1px solid ${alpha(isOverstay ? tokens.red : tokens.border, 0.6)}`,
          cursor: "pointer",
        }}
      />
    );
  }

  // Aggregate passport rules across all travelers in this merged card.
  const rules = entries.map((e) => getSchengenRule(e.traveler.passportCode));
  const todayStr = todayISO();

  const isOngoing = !trip.exitDate;
  const isPlanned = trip.entryDate > todayStr;
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isUK = trip.region === VisaRegion.UnitedKingdom;
  const isIreland = trip.region === VisaRegion.Ireland;

  const showDates = height >= HEIGHT_SHOW_DATES;
  const showBadges = height >= HEIGHT_SHOW_BADGES;

  const days = countTripDays(
    parseDate(trip.entryDate),
    parseDate(trip.exitDate ?? todayStr),
  );

  const regionLabel = isOverstay
    ? "⚠ Overstay"
    : isPlanned
      ? "Planned"
      : isOngoing
        ? "Ongoing"
        : isSchengen
          ? "Schengen"
          : isUK
            ? "United Kingdom"
            : isIreland
              ? "Ireland"
              : null; // Elsewhere → no chip

  const regionBg = isOverstay
    ? alpha(tokens.red, 0.12)
    : isPlanned
      ? alpha(tokens.amber, 0.12)
      : isSchengen
        ? alpha(tokens.green, 0.12)
        : tokens.mist;

  const regionColor = isOverstay
    ? tokens.redText
    : isPlanned
      ? tokens.amberText
      : isSchengen
        ? tokens.greenText
        : tokens.textSoft;

  const accentColor = isOverstay
    ? tokens.red
    : isPlanned
      ? tokens.amber
      : isHighlighted
        ? tokens.green
        : tokens.border;

  const cardBg = isOverstay ? tokens.redBg : tokens.white;
  const cardBorderColor = isOverstay
    ? alpha(tokens.red, 0.28)
    : isPlanned
      ? alpha(tokens.amber, 0.28)
      : tokens.border;

  const destinationColor = isOverstay ? tokens.red : tokens.navy;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: cardBg,
        border: "1px solid",
        borderColor: cardBorderColor,
        borderStyle: isPlanned && !isOverstay ? "dashed" : "solid",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: isOverstay
          ? "0 1px 3px rgba(239,68,68,0.1)"
          : "0 1px 3px rgba(12,30,60,0.05)",
        "&:active": {
          boxShadow: isOverstay
            ? "0 3px 10px rgba(239,68,68,0.18)"
            : "0 3px 10px rgba(12,30,60,0.1)",
        },
      }}
    >
      {/* Left accent bar */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: accentColor,
          borderRadius: "6px 0 0 6px",
        }}
      />
      <Box
        sx={{
          pl: "10px",
          pr: "5px",
          pt: "4px",
          pb: "4px",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {/* ── Always: traveler dots + destination ───────────────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: 0,
          }}
        >
          <Box sx={{ display: "flex", gap: "2px", flexShrink: 0 }}>
            {entries.map(({ traveler, travelerIndex }) => (
              <Box
                key={traveler.id}
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  bgcolor: getTravelerColor(travelerIndex),
                  flexShrink: 0,
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontFamily: trip.destination
                ? tokens.fontBody
                : tokens.fontBody,
              fontSize: "0.75rem",
              fontStyle: "normal",
              fontWeight: trip.destination ? 430 : 500,
              color: destinationColor,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              minWidth: 0,
            }}
          >
            {trip.destination
              ? trip.destination
              : `${format(parseDate(trip.entryDate), "MMM d")}${
                  trip.exitDate
                    ? ` – ${format(parseDate(trip.exitDate), "MMM d")}`
                    : " →"
                }`}
          </Typography>
        </Box>

        {/* ── Date range ────────────────────────────────────────────────── */}
        {showDates && trip.destination && (
          <Typography
            sx={{
              fontSize: "0.6rem",
              color: isOverstay ? tokens.redText : tokens.textGhost,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {format(parseDate(trip.entryDate), "MMM d")}
            {trip.exitDate
              ? ` – ${format(parseDate(trip.exitDate), "MMM d")}`
              : " →"}
          </Typography>
        )}

        {/* ── Duration + region badges ──────────────────────────────────── */}
        {showBadges && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              overflow: "hidden",
            }}
          >
            <Chip color={tokens.textSoft} bg={tokens.mist}>
              {days}d
            </Chip>
            {regionLabel && (
              <Chip color={regionColor} bg={regionBg}>
                {regionLabel}
              </Chip>
            )}

            {/* Passport rule chips — Schengen trips, not overstay, not ongoing */}
            {isSchengen && !isOverstay && !isOngoing && (
              <>
                {rules.some((r) => r.access === "visa_required") && (
                  <Chip color={tokens.redText} bg={alpha(tokens.red, 0.1)}>
                    Visa req.
                  </Chip>
                )}
                {rules.some((r) => isVisaRequired(r) && r.notes?.some(n => n.text.startsWith('Airport transit visa'))) && (
                  <Chip color={tokens.white} bg={tokens.red}>
                    ATV
                  </Chip>
                )}
                {rules.some((r) => isEntitled(r) && r.entitlements.some(e => e.preAuth?.type === 'ETIAS')) && (
                  <Chip color={tokens.navy} bg={tokens.mist}>
                    ETIAS
                  </Chip>
                )}
              </>
            )}
          </Box>
        )}

      </Box>
    </Box>
  );
}

// ─── Mobile return marker ─────────────────────────────────────────────────────

function MobileReturnMarker({
  group,
  chipTop,
  mutedTrips,
  showTravelerDots,
}: {
  group: MobileReturnMarkerGroup;
  chipTop: number;
  mutedTrips: boolean;
  /** Only worth the space when more than one traveller is on screen. */
  showTravelerDots: boolean;
}) {
  const { region, top, entries, travelerIndices, maxDays, allowance } = group;
  const { lineBase, lineOpacity } = returnMarkerColors(maxDays, allowance);

  // Deduplicate entries by traveler, keeping only the max-threshold entry per
  // traveler. This mirrors the pill logic: only the best reachable value matters.
  const perTraveler = new Map<number, ReturnMarkerEntry>();
  entries.forEach((e) => {
    const existing = perTraveler.get(e.travelerIndex);
    if (!existing || e.days > existing.days) perTraveler.set(e.travelerIndex, e);
  });
  const dedupedEntries = [...perTraveler.values()].sort((a, b) => a.top - b.top);

  // Tooltip: the destination, then a per-traveler list (same format for one or many).
  const tooltipTitle = (
    <Box component="div">
      <Box component="div" sx={{ mb: "3px", fontWeight: 700 }}>
        {regionMarkerName(region)}
      </Box>
      {dedupedEntries.map((e, i) => (
        <Box
          key={i}
          component="div"
          sx={{ "&:not(:last-child)": { mb: "3px" } }}
        >
          {returnMarkerRowText(e.travelerName, e.date, e.days)}
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <MarkerGuideLine
        top={top}
        left={MARKER_GUTTER_PX}
        kind="return"
        color={lineBase}
        opacity={mutedTrips ? Math.min(1, lineOpacity * 2) : lineOpacity}
        zIndex={mutedTrips ? 4 : 1}
      />
      <ReturnGutterChip
        top={chipTop}
        left={CARD_GUTTER + 2}
        width={MARKER_GUTTER_PX - CARD_GUTTER - 4}
        regionName={regionMarkerName(region)}
        days={maxDays}
        allowance={allowance}
        tooltip={tooltipTitle}
        leading={showTravelerDots ? travelerIndices.map((idx) => (
          <Box
            key={idx}
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: getTravelerColor(idx),
              flexShrink: 0,
            }}
          />
        )) : undefined}
      />
    </>
  );
}

// ─── Mobile aging marker ──────────────────────────────────────────────────────

function MobileAgingMarker({
  group,
  chipTop,
  mutedTrips,
}: {
  group: MobileAgingMarkerGroup;
  chipTop: number;
  mutedTrips: boolean;
}) {
  const { region, top, markers } = group;
  const isSingle = markers.length === 1;

  // Tooltip: always a per-trip list followed by the behaviour note (same
  // format for one trip or many).
  const tooltipTitle = (
    <Box component="div">
      {markers.map((m, i) => (
        <Box
          key={i}
          component="div"
          sx={{ "&:not(:last-child)": { mb: "3px" } }}
        >
          {agingMarkerTripLine(region, m.destination, m.tripDays, m.date)}
        </Box>
      ))}
      <Box component="div" sx={{ mt: "4px", opacity: 0.8 }}>
        {AGING_MARKER_EXPLANATION}
      </Box>
    </Box>
  );

  return (
    <>
      <MarkerGuideLine
        top={top}
        left={MARKER_GUTTER_PX}
        kind="aging"
        color={tokens.textSoft}
        opacity={mutedTrips ? 0.55 : 0.25}
        zIndex={mutedTrips ? 4 : 1}
      />
      <AgingGutterChip
        top={chipTop}
        left={CARD_GUTTER + 2}
        width={MARKER_GUTTER_PX - CARD_GUTTER - 4}
        title={isSingle ? markers[0].destination : `${markers.length} trips`}
        tripDays={isSingle ? markers[0].tripDays : null}
        tooltip={tooltipTitle}
      />
    </>
  );
}

// ─── MobileTimelineView ───────────────────────────────────────────────────────

export function MobileTimelineView({
  travelers,
  hiddenTravelerIds,
  onEditTrip,
  onAddTraveler,
  mutedTrips,
}: MobileTimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const todayStr = todayISO();

  const timelineStart = useMemo(
    () => computeTimelineStart(travelers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  const timelineEnd = useMemo(
    () => computeTimelineEnd(travelers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  const positionedTrips = useMemo(
    () => assignLanes(travelers, hiddenTravelerIds, timelineStart, todayStr),
    [travelers, hiddenTravelerIds, timelineStart, todayStr],
  );

  // Set of trip keys that are highlighted (ongoing or next-upcoming per traveler).
  const highlightedKeys = useMemo((): Set<string> => {
    const keys = new Set<string>();
    travelers.forEach((traveler) => {
      if (hiddenTravelerIds.includes(traveler.id)) return;
      const sorted = [...traveler.trips].sort((a, b) =>
        a.entryDate < b.entryDate ? -1 : 1,
      );
      const ongoing = sorted.find((t) => !t.exitDate && t.entryDate <= todayStr);
      const highlighted = ongoing ?? sorted.find((t) => t.entryDate > todayStr);
      if (highlighted) {
        keys.add(`${highlighted.entryDate}|${highlighted.exitDate ?? ""}|${highlighted.region}`);
      }
    });
    return keys;
  }, [travelers, hiddenTravelerIds, todayStr]);

  // ── Rolling-window markers for every visible traveller ────────────────────
  // Destinations where a passport gets no rolling window contribute none.
  const visibleMarkers = useMemo(
    (): { index: number; traveler: Traveler; markers: WindowMarkers }[] =>
      travelers.flatMap((traveler, index) =>
        hiddenTravelerIds.includes(traveler.id)
          ? []
          : [
              {
                index,
                traveler,
                markers: computeWindowMarkers(traveler, timelineStart, timelineEnd),
              },
            ],
      ),
    [travelers, hiddenTravelerIds, timelineStart, timelineEnd],
  );

  // ── Return marker groups (6-day rollup, per destination) ──────────────────
  const returnMarkerGroups = useMemo((): MobileReturnMarkerGroup[] => {
    const allEntries: ReturnMarkerEntry[] = visibleMarkers.flatMap(
      ({ index, traveler, markers }) =>
        markers.returnMarkers
          .filter((m) => !m.isCurrent)
          .map((m) => ({
            region: m.region,
            top: m.top,
            date: m.date,
            days: m.days,
            travelerIndex: index,
            travelerName: traveler.name,
            allowance: m.allowance,
          })),
    );

    return byRegion(allEntries).flatMap(groupReturnMarkers);
  }, [visibleMarkers]);

  // ── Aging marker groups (deduplicated + 6-day rollup, per destination) ────
  const agingMarkerGroups = useMemo((): MobileAgingMarkerGroup[] => {
    const seen = new Set<string>();
    const unique: AgingMarker[] = [];

    visibleMarkers.forEach(({ markers }) => {
      markers.agingMarkers.forEach((m) => {
        const key = `${m.region}|${m.entryDate}|${m.exitDate}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(m);
        }
      });
    });

    return byRegion(unique).flatMap(groupAgingMarkers);
  }, [visibleMarkers]);

  // Gutter placement: return chips first, then aging chips, in one stack.
  const gutterTops = useMemo(
    () =>
      stackGutterItems(
        [
          ...returnMarkerGroups.map((g) => ({
            anchor: g.top,
            height: RETURN_CHIP_HEIGHT,
            firstRowHeight: RETURN_CHIP_HEIGHT,
          })),
          ...agingMarkerGroups.map((g) => ({
            anchor: g.top,
            height: AGING_CHIP_HEIGHT,
            firstRowHeight: AGING_CHIP_FIRST_ROW,
          })),
        ],
        GUTTER_CHIP_GAP,
      ),
    [returnMarkerGroups, agingMarkerGroups],
  );
  const returnTops = gutterTops.slice(0, returnMarkerGroups.length);
  const agingTops = gutterTops.slice(returnMarkerGroups.length);
  const gutterPx = gutterTops.length > 0 ? MARKER_GUTTER_PX : 0;

  const contentHeight = useMemo(() => {
    const tripBottom =
      positionedTrips.length === 0
        ? 0
        : Math.max(...positionedTrips.map((p) => p.top + p.height));

    const markerBottom =
      gutterTops.length === 0 ? 0 : Math.max(...gutterTops) + AGING_CHIP_HEIGHT;

    const maxBottom = Math.max(tripBottom, markerBottom);
    return maxBottom === 0 ? 600 : maxBottom + 24;
  }, [positionedTrips, gutterTops]);

  // Markers are computed up to timelineEnd, so the last chips can sit right
  // at its bottom edge. Draw the timeline (date ruler included) far enough
  // past the content that it clears the floating Add Trip button.
  const displayEnd = useMemo(() => {
    const height = Math.max(
      computeTotalHeight(timelineStart, timelineEnd),
      contentHeight + FAB_CLEARANCE_PX,
    );
    return addDays(timelineStart, Math.ceil(height / PX_PER_DAY));
  }, [timelineStart, timelineEnd, contentHeight]);

  useEffect(() => {
    if (hasScrolledRef.current || !scrollRef.current) return;
    const vh = scrollRef.current.clientHeight;
    const todayTop = dateToTop(getToday(), timelineStart);
    scrollRef.current.scrollTop = Math.max(0, todayTop - vh * 0.38);
    hasScrolledRef.current = true;
  }, [timelineStart]);

  if (travelers.length === 0) {
    return <AddTravelerGhost onAddTraveler={onAddTraveler} />;
  }

  const allHidden =
    travelers.length > 0 &&
    travelers.every((t) => hiddenTravelerIds.includes(t.id));

  const todayTop = dateToTop(getToday(), timelineStart);

  return (
    <Box ref={scrollRef} sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* ── Timeline row ────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            minHeight: computeTotalHeight(timelineStart, displayEnd),
          }}
        >
          {/* Date sidebar */}
          <Box
            sx={{
              width: SIDEBAR_WIDTH,
              minWidth: SIDEBAR_WIDTH,
              flexShrink: 0,
              bgcolor: tokens.offWhite,
              borderRight: `1px solid ${tokens.border}`,
            }}
          >
            <DateSidebar
              timelineStart={timelineStart}
              timelineEnd={displayEnd}
            />
          </Box>

          {/* Canvas */}
          <Box sx={{ flex: 1, position: "relative" }}>
            {/* Today line — above cards */}
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                top: todayTop,
                height: 2,
                bgcolor: tokens.green,
                zIndex: 4,
                pointerEvents: "none",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: CARD_GUTTER,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: tokens.green,
                  border: `2px solid ${tokens.white}`,
                  boxShadow: `0 0 0 3px ${alpha(tokens.green, 0.2)}`,
                }}
              />
            </Box>

            {/* All hidden message */}
            {allHidden && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  pt: "48px",
                  px: "24px",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.85rem",
                    color: tokens.textGhost,
                    textAlign: "center",
                  }}
                >
                  All travelers hidden — tap the eye icon above to show trips.
                </Typography>
              </Box>
            )}

            {/* Markers: guide lines across the trips (behind the cards, or
                over them while cards are muted) and chips in the gutter. */}
            {!allHidden &&
              returnMarkerGroups.map((group, i) => (
                <MobileReturnMarker
                  key={`ret-${group.region}-${group.top}-${group.maxDays}`}
                  group={group}
                  chipTop={returnTops[i]}
                  mutedTrips={mutedTrips}
                  showTravelerDots={visibleMarkers.length > 1}
                />
              ))}
            {!allHidden &&
              agingMarkerGroups.map((group, i) => (
                <MobileAgingMarker
                  key={`aging-${group.region}-${group.top}-${group.markers.length}`}
                  group={group}
                  chipTop={agingTops[i]}
                  mutedTrips={mutedTrips}
                />
              ))}

            {/* Trip cards — zIndex 3, above markers */}
            {positionedTrips.map((positioned) => {
              const { lane, laneSpan, laneCount, top, height } = positioned;
              const pct = (laneSpan / laneCount) * 100;
              const leftPct = (lane / laneCount) * 100;

              return (
                <Box
                  key={`${positioned.trip.entryDate}-${positioned.trip.exitDate ?? "ongoing"}-${positioned.trip.region}`}
                  sx={{
                    position: "absolute",
                    top,
                    height: height - LANE_GAP,
                    // Lanes share the canvas width right of the marker gutter.
                    left: `calc(${gutterPx}px + (100% - ${gutterPx}px) * ${leftPct / 100} + ${CARD_GUTTER}px)`,
                    width: `calc((100% - ${gutterPx}px) * ${pct / 100} - ${CARD_GUTTER * 2}px)`,
                    zIndex: 3,
                  }}
                >
                  <MobileTimelineTripCard
                    positioned={positioned}
                    muted={mutedTrips}
                    isHighlighted={highlightedKeys.has(
                      `${positioned.trip.entryDate}|${positioned.trip.exitDate ?? ""}|${positioned.trip.region}`
                    )}
                    onClick={() =>
                      onEditTrip(
                        positioned.entries.map((e) => e.traveler.id),
                        positioned.entries[0].trip,
                      )
                    }
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
