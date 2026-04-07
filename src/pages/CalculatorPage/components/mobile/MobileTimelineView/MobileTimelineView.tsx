import { useRef, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { format } from "date-fns";
import { type Traveler, type Trip, VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";
import {
  computeTimelineEnd,
  computeTimelineStart,
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
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import {
  type ReturnMarker,
  computeReturnMarkers,
} from "@/features/calculator/utils/returnmarkers";
import {
  type AgingMarker,
  computeAgingMarkers,
} from "@/features/calculator/utils/agingMarkers";
import { MobileAwareTooltip } from "@/components/ui/MobileAwareTooltip";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTimelineViewProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onEditTrip: (travelerIds: string[], trip: Trip) => void;
  onAddTraveler: () => void;
  onAddTrip: () => void;
}

interface TravelerEntry {
  traveler: Traveler;
  travelerIndex: number;
  trip: Trip;
}

interface PositionedTrip {
  trip: Trip;
  entries: TravelerEntry[];
  top: number;
  height: number;
  lane: number;
  laneCount: number;
  /** True if any traveler in this merged card is in an overstay state. */
  isOverstay: boolean;
}

/** One entry contributed by a traveler into a return-marker group. */
interface ReturnMarkerEntry {
  top: number;
  date: Date;
  days: number;
  travelerIndex: number;
  travelerName: string;
}

/**
 * A group of return-marker entries whose dates fall within a 6-day window of
 * the earliest entry. The group is displayed at `top` (the earliest entry's
 * position) with a combined pill and unified tooltip.
 */
interface MobileReturnMarkerGroup {
  top: number;
  entries: ReturnMarkerEntry[];
  /** Unique traveler indices across all entries (for colour dots). */
  travelerIndices: number[];
  /** Highest threshold across all entries. */
  maxDays: number;
}

/**
 * A group of aging markers whose dates fall within a 6-day window of the
 * earliest marker. When more than one trip is in the group the centre label
 * reads "X Trips Age Out" instead of the trip destination.
 */
interface MobileAgingMarkerGroup {
  top: number;
  markers: AgingMarker[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_TRIP_HEIGHT = 28;
const HEIGHT_SHOW_DATES = 44;
const HEIGHT_SHOW_BADGES = 56;
const HEIGHT_SHOW_NAMES = 72;
const LANE_GAP = 2;
const CARD_GUTTER = 3;

/** 6-day rollup window in pixels. */
const ROLLUP_PX = 6 * PX_PER_DAY;

/** Shared tooltip styling used by both mobile marker types. */
const TOOLTIP_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.72rem",
  fontWeight: 500,
  bgcolor: tokens.navy,
  "& .MuiTooltip-arrow": { color: tokens.navy },
  maxWidth: 260,
};

// ─── Overstay helpers ─────────────────────────────────────────────────────────

function computeOverstayCoords(traveler: Traveler): Set<string> {
  const schengenTrips = traveler.trips.filter(
    (t) => t.region === VisaRegion.Schengen,
  );
  if (schengenTrips.length === 0) return new Set();

  const mockTraveler = { id: "__overstay__", name: "", trips: schengenTrips };
  const result = new Set<string>();

  for (const trip of schengenTrips) {
    const refDate = trip.exitDate ? parseDate(trip.exitDate) : getToday();
    const status = computeTravelerStatus(mockTraveler, refDate);
    if (status.daysUsed > 90) {
      result.add(`${trip.entryDate}|${trip.exitDate ?? ""}|${trip.region}`);
    }
  }

  return result;
}

// ─── Merge + lane assignment ──────────────────────────────────────────────────

function buildPositionedTrips(
  travelers: Traveler[],
  hiddenIds: string[],
  timelineStart: Date,
  todayStr: string,
): Omit<PositionedTrip, "lane" | "laneCount">[] {
  const overstayByTraveler = new Map<string, Set<string>>(
    travelers.map((t) => [t.id, computeOverstayCoords(t)]),
  );

  const merged: Omit<PositionedTrip, "lane" | "laneCount">[] = [];

  travelers.forEach((traveler, travelerIndex) => {
    if (hiddenIds.includes(traveler.id)) return;

    traveler.trips.forEach((trip) => {
      const tripKey = `${trip.entryDate}|${trip.exitDate ?? ""}|${trip.region}`;
      const tripIsOverstay =
        overstayByTraveler.get(traveler.id)?.has(tripKey) ?? false;

      const existing = merged.find(
        (m) =>
          m.trip.entryDate === trip.entryDate &&
          m.trip.exitDate === trip.exitDate &&
          m.trip.region === trip.region,
      );

      if (existing) {
        existing.entries.push({ traveler, travelerIndex, trip });
        if (tripIsOverstay) {
          (existing as PositionedTrip).isOverstay = true;
        }
      } else {
        const top = dateToTop(parseDate(trip.entryDate), timelineStart);
        const exitStr = trip.exitDate ?? todayStr;
        const rawBottom = dateToTop(parseDate(exitStr), timelineStart);
        const height = Math.max(rawBottom - top, MIN_TRIP_HEIGHT);
        merged.push({
          trip,
          entries: [{ traveler, travelerIndex, trip }],
          top,
          height,
          isOverstay: tripIsOverstay,
        });
      }
    });
  });

  return merged;
}

function assignLanes(
  travelers: Traveler[],
  hiddenIds: string[],
  timelineStart: Date,
  todayStr: string,
): PositionedTrip[] {
  const flat = buildPositionedTrips(
    travelers,
    hiddenIds,
    timelineStart,
    todayStr,
  );
  flat.sort((a, b) => a.top - b.top || b.height - a.height);

  const laneBottoms: number[] = [];
  const lanes = flat.map((item) => {
    let lane = laneBottoms.findIndex((bottom) => bottom + LANE_GAP <= item.top);
    if (lane === -1) lane = laneBottoms.length;
    laneBottoms[lane] = item.top + item.height;
    return lane;
  });

  return flat.map((item, i) => {
    const overlapMaxLane = flat.reduce((max, other, j) => {
      if (i === j) return max;
      const overlaps =
        other.top < item.top + item.height &&
        other.top + other.height > item.top;
      return overlaps ? Math.max(max, lanes[j]) : max;
    }, lanes[i]);
    return { ...item, lane: lanes[i], laneCount: overlapMaxLane + 1 };
  });
}

// ─── Marker grouping helpers ──────────────────────────────────────────────────

/**
 * Groups return-marker entries whose pixel positions fall within a 6-day window
 * of the earliest entry in a run. The window is anchored to the first entry —
 * it does NOT cascade (the window never advances beyond the original anchor).
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
      top: anchor.top,
      entries: group,
      travelerIndices: [...new Set(group.map((e) => e.travelerIndex))],
      maxDays: Math.max(...group.map((e) => e.days)),
    });
  }

  return groups;
}

/**
 * Groups aging markers whose pixel positions fall within a 6-day window of the
 * earliest marker in a run. Same non-cascading anchor logic as return markers.
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

    groups.push({ top: anchor.top, markers: group });
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
  onClick: () => void;
}

function MobileTimelineTripCard({
  positioned,
  onClick,
}: MobileTimelineTripCardProps) {
  const { trip, entries, height, isOverstay } = positioned;
  const todayStr = todayISO();

  const isOngoing = !trip.exitDate;
  const isPlanned = trip.entryDate > todayStr;
  const isSchengen = trip.region === VisaRegion.Schengen;

  const showDates = height >= HEIGHT_SHOW_DATES;
  const showBadges = height >= HEIGHT_SHOW_BADGES;
  const showNames = height >= HEIGHT_SHOW_NAMES;

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
          : "Elsewhere";

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

  const cardBg = isOverstay
    ? tokens.redBg
    : isPlanned
      ? "#FDFCF8"
      : tokens.white;
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
      <Box
        sx={{
          pl: "7px",
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
                ? tokens.fontDisplay
                : tokens.fontBody,
              fontSize: "0.72rem",
              fontStyle: trip.destination ? "italic" : "normal",
              fontWeight: trip.destination ? 400 : 500,
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
            <Chip color={regionColor} bg={regionBg}>
              {regionLabel}
            </Chip>
          </Box>
        )}

        {/* ── Traveler name chips ───────────────────────────────────────── */}
        {showNames && (
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: "2px", mt: "1px" }}
          >
            {entries.map(({ traveler, travelerIndex }) => {
              const color = getTravelerColor(travelerIndex);
              return (
                <Box
                  key={traveler.id}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    px: "5px",
                    py: "1px",
                    borderRadius: "100px",
                    bgcolor: alpha(color, 0.1),
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      bgcolor: color,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.58rem",
                      fontWeight: 700,
                      color,
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {traveler.name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Mobile return marker ─────────────────────────────────────────────────────

function MobileReturnMarker({ top, entries, travelerIndices, maxDays }: MobileReturnMarkerGroup) {
  const isGenerous = maxDays >= 30;
  const lineBase = isGenerous ? tokens.green : tokens.amber;
  const textColor = isGenerous ? tokens.greenText : tokens.amberText;
  const bgColor = isGenerous ? tokens.greenBg : tokens.amberBg;

  // Opacity mirrors desktop logic, keyed to the smallest threshold in the group.
  const minDays = Math.min(...entries.map((e) => e.days));
  const lineOpacity = minDays % 30 === 0 ? 0.35 : 0.18;
  const pillOpacity = minDays % 30 === 0 ? 1 : 0.65;

  // Deduplicate entries by traveler, keeping only the max-threshold entry per
  // traveler. This mirrors the pill logic: only the best reachable value matters.
  const perTraveler = new Map<number, ReturnMarkerEntry>();
  entries.forEach((e) => {
    const existing = perTraveler.get(e.travelerIndex);
    if (!existing || e.days > existing.days) perTraveler.set(e.travelerIndex, e);
  });
  const dedupedEntries = [...perTraveler.values()].sort((a, b) => a.top - b.top);

  // Tooltip: one traveler → concise sentence; multiple → per-traveler list.
  const tooltipTitle =
    dedupedEntries.length === 1 ? (
      `From ${format(dedupedEntries[0].date, "MMM d, yyyy")}, a ${dedupedEntries[0].days}-day Schengen trip first becomes possible.`
    ) : (
      <Box component="div">
        {dedupedEntries.map((e, i) => (
          <Box
            key={i}
            component="div"
            sx={{ "&:not(:last-child)": { mb: "3px" } }}
          >
            {e.travelerName} · {format(e.date, "MMM d")} · up to {e.days}d
          </Box>
        ))}
      </Box>
    );

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Dashed threshold line */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 0,
          borderTop: `1px dashed ${alpha(lineBase, lineOpacity)}`,
        }}
      />

      {/* Pill: traveller colour dots + max threshold */}
      <MobileAwareTooltip
        title={tooltipTitle}
        placement="bottom-start"
        arrow
        componentsProps={{ tooltip: { sx: TOOLTIP_SX } }}
      >
        <Box
          sx={{
            position: "absolute",
            left: CARD_GUTTER + 2,
            top: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            px: "5px",
            py: "2px",
            borderRadius: "100px",
            bgcolor: bgColor,
            border: `1px dashed ${alpha(lineBase, 0.25)}`,
            pointerEvents: "auto",
            cursor: "default",
            opacity: pillOpacity,
          }}
        >
          {travelerIndices.map((idx) => (
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
          ))}

          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.52rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              color: alpha(textColor, pillOpacity),
              lineHeight: 1,
              userSelect: "none",
            }}
          >
            {maxDays}d
          </Typography>

          <InfoOutlinedIcon
            sx={{
              fontSize: "0.55rem",
              color: alpha(textColor, pillOpacity * 0.7),
              flexShrink: 0,
            }}
          />
        </Box>
      </MobileAwareTooltip>
    </Box>
  );
}

// ─── Mobile aging marker ──────────────────────────────────────────────────────

function MobileAgingMarker({ top, markers }: MobileAgingMarkerGroup) {
  const LINE_OPACITY = 0.12;
  const TEXT_OPACITY = 0.4;

  const isSingle = markers.length === 1;
  const centreLabel = isSingle
    ? `${markers[0].destination} ages out`
    : `${markers.length} Trips Age Out`;

  // Tooltip: single trip → two-line format (trip summary + behaviour note);
  // multiple trips → compact per-trip list, no em dashes.
  const tooltipTitle = isSingle ? (
    (() => {
      const m = markers[0];
      const agingDate = addDays(parseDate(m.entryDate), 180);
      const dateStr = format(agingDate, "MMM d, yyyy");
      return (
        <Box component="div">
          <Box component="div">
            {m.destination} ({m.tripDays}d) ages out {dateStr}
          </Box>
          <Box component="div" sx={{ mt: "4px", opacity: 0.8 }}>
            Each exiting day frees up allowance and typically causes a
            noticeable jump in max stay.
          </Box>
        </Box>
      );
    })()
  ) : (
    <Box component="div">
      {markers.map((m, i) => {
        const agingDate = addDays(parseDate(m.entryDate), 180);
        return (
          <Box
            key={i}
            component="div"
            sx={{ "&:not(:last-child)": { mb: "3px" } }}
          >
            {m.destination} ({m.tripDays}d) ages out {format(agingDate, "MMM d")}
          </Box>
        );
      })}
    </Box>
  );

  // Right-side pill: "+Xd" for a single trip; info icon only for multiples.
  const pillContent = isSingle ? (
    <>
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
        +{markers[0].tripDays}d
      </Typography>
      <InfoOutlinedIcon
        sx={{ fontSize: "0.55rem", color: alpha(tokens.textGhost, 0.5), flexShrink: 0 }}
      />
    </>
  ) : (
    <InfoOutlinedIcon
      sx={{ fontSize: "0.6rem", color: alpha(tokens.textGhost, 0.6), flexShrink: 0 }}
    />
  );

  return (
    <Box
      sx={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {/* Dotted line with centred label */}
      <Box
        sx={{
          position: "absolute",
          left: CARD_GUTTER + 2,
          right: 36,
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
          {centreLabel}
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: 0,
            borderTop: `1px dotted ${alpha(tokens.textGhost, LINE_OPACITY)}`,
          }}
        />
      </Box>

      {/* Right-side info pill */}
      <MobileAwareTooltip
        title={tooltipTitle}
        placement="bottom-start"
        arrow
        componentsProps={{ tooltip: { sx: TOOLTIP_SX } }}
      >
        <Box
          sx={{
            position: "absolute",
            right: CARD_GUTTER + 2,
            top: 0,
            transform: "translateY(-50%)",
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            px: "5px",
            py: "1.5px",
            borderRadius: "100px",
            bgcolor: tokens.mist,
            border: `1px dotted ${alpha(tokens.textGhost, 0.15)}`,
            pointerEvents: "auto",
            cursor: "default",
          }}
        >
          {pillContent}
        </Box>
      </MobileAwareTooltip>
    </Box>
  );
}

// ─── MobileTimelineView ───────────────────────────────────────────────────────

export function MobileTimelineView({
  travelers,
  hiddenTravelerIds,
  onEditTrip,
  onAddTraveler,
  onAddTrip,
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

  // ── Return marker groups (6-day rollup) ───────────────────────────────────
  const returnMarkerGroups = useMemo((): MobileReturnMarkerGroup[] => {
    const allEntries: ReturnMarkerEntry[] = [];

    travelers.forEach((traveler, i) => {
      if (hiddenTravelerIds.includes(traveler.id)) return;

      computeReturnMarkers(traveler, timelineStart, timelineEnd)
        .filter((m: ReturnMarker) => !m.isCurrent)
        .forEach((m: ReturnMarker) => {
          allEntries.push({
            top: m.top,
            date: m.date,
            days: m.days,
            travelerIndex: i,
            travelerName: traveler.name,
          });
        });
    });

    return groupReturnMarkers(allEntries);
  }, [travelers, hiddenTravelerIds, timelineStart, timelineEnd]);

  // ── Aging marker groups (deduplicated + 6-day rollup) ─────────────────────
  const agingMarkerGroups = useMemo((): MobileAgingMarkerGroup[] => {
    const seen = new Set<string>();
    const unique: AgingMarker[] = [];

    travelers.forEach((traveler) => {
      if (hiddenTravelerIds.includes(traveler.id)) return;

      computeAgingMarkers(traveler, timelineStart, timelineEnd).forEach((m) => {
        const key = `${m.entryDate}|${m.exitDate}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(m);
        }
      });
    });

    return groupAgingMarkers(unique);
  }, [travelers, hiddenTravelerIds, timelineStart, timelineEnd]);

  const contentHeight = useMemo(() => {
    const tripBottom =
      positionedTrips.length === 0
        ? 0
        : Math.max(...positionedTrips.map((p) => p.top + p.height));

    const allMarkerTops = [
      ...returnMarkerGroups.map((g) => g.top),
      ...agingMarkerGroups.map((g) => g.top),
    ];
    const markerBottom =
      allMarkerTops.length === 0 ? 0 : Math.max(...allMarkerTops);

    const maxBottom = Math.max(tripBottom, markerBottom);
    return maxBottom === 0 ? 600 : maxBottom + 24;
  }, [positionedTrips, returnMarkerGroups, agingMarkerGroups]);

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
        <Box sx={{ display: "flex", minHeight: contentHeight }}>
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
              timelineEnd={timelineEnd}
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

            {/* Return markers — zIndex 1, below trip cards */}
            {!allHidden &&
              returnMarkerGroups.map((group) => (
                <MobileReturnMarker
                  key={`ret-${group.top}-${group.maxDays}`}
                  {...group}
                />
              ))}

            {/* Aging-out markers — zIndex 1, below trip cards */}
            {!allHidden &&
              agingMarkerGroups.map((group) => (
                <MobileAgingMarker
                  key={`aging-${group.top}-${group.markers.length}`}
                  {...group}
                />
              ))}

            {/* Trip cards — zIndex 3, above markers */}
            {positionedTrips.map((positioned) => {
              const { lane, laneCount, top, height } = positioned;
              const pct = (1 / laneCount) * 100;
              const leftPct = (lane / laneCount) * 100;

              return (
                <Box
                  key={`${positioned.trip.entryDate}-${positioned.trip.exitDate ?? "ongoing"}-${positioned.trip.region}`}
                  sx={{
                    position: "absolute",
                    top,
                    height,
                    left: `calc(${leftPct}% + ${CARD_GUTTER}px)`,
                    width: `calc(${pct}% - ${CARD_GUTTER * 2}px)`,
                    zIndex: 3,
                  }}
                >
                  <MobileTimelineTripCard
                    positioned={positioned}
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

        {/* ── Add Trip — in normal flow ────────────────────────────────────── */}
        {!allHidden && (
          <Box
            sx={{
              ml: `${SIDEBAR_WIDTH}px`,
              px: `${CARD_GUTTER + 4}px`,
              pt: "8px",
              pb: "20px",
              borderTop: `1px solid ${tokens.border}`,
            }}
          >
            <Box
              component="button"
              onClick={onAddTrip}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                py: "10px",
                border: `1.5px dashed ${tokens.border}`,
                borderRadius: "10px",
                bgcolor: alpha(tokens.white, 0.9),
                fontFamily: tokens.fontBody,
                fontSize: "0.82rem",
                fontWeight: 600,
                color: tokens.textSoft,
                cursor: "pointer",
                "&:active": {
                  borderColor: tokens.navy,
                  color: tokens.navy,
                  bgcolor: tokens.white,
                },
              }}
            >
              <AddIcon sx={{ fontSize: "0.95rem" }} />
              Add Trip
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
