import { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import { format } from "date-fns";
import { Traveler, Trip } from "@/types";
import { tokens } from "@/styles/theme";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";
import {
  computeTimelineStart,
  dateToTop,
  SIDEBAR_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import {
  today as getToday,
  parseDate,
  todayISO,
} from "@/features/calculator/utils/dates";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { DateSidebar } from "../../timeline/DateSidebar";

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
  /** The original trip record for this traveler (used for editing) */
  trip: Trip;
}

interface PositionedTrip {
  /** Canonical trip — used for dates, region, destination, planned state */
  trip: Trip;
  entries: TravelerEntry[];
  top: number;
  height: number;
  lane: number;
  laneCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_TRIP_HEIGHT = 28;
const LANE_GAP = 2;
const BOTTOM_PADDING = 80;
const CARD_GUTTER = 3;

// ─── Merge + lane assignment ──────────────────────────────────────────────────

/**
 * Merges trips that share the same entryDate, exitDate, and region across
 * travelers, then assigns pixel positions and lanes to each merged group.
 *
 * Two trips are considered identical when entryDate + exitDate + region match.
 * The first traveler's trip record becomes the canonical source for display.
 */
function buildPositionedTrips(
  travelers: Traveler[],
  hiddenIds: string[],
  timelineStart: Date,
  todayStr: string,
): Omit<PositionedTrip, "lane" | "laneCount">[] {
  const merged: Omit<PositionedTrip, "lane" | "laneCount">[] = [];

  travelers.forEach((traveler, travelerIndex) => {
    if (hiddenIds.includes(traveler.id)) return;

    traveler.trips.forEach((trip) => {
      const existing = merged.find(
        (m) =>
          m.trip.entryDate === trip.entryDate &&
          m.trip.exitDate === trip.exitDate &&
          m.trip.region === trip.region,
      );

      if (existing) {
        existing.entries.push({ traveler, travelerIndex, trip });
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

// ─── Trip card ────────────────────────────────────────────────────────────────

interface MobileTimelineTripCardProps {
  positioned: PositionedTrip;
  onClick: () => void;
}

function MobileTimelineTripCard({
  positioned,
  onClick,
}: MobileTimelineTripCardProps) {
  const { trip, entries, height } = positioned;
  const todayStr = todayISO();

  const isPlanned = trip.entryDate > todayStr;
  const showDates = height >= 44;
  const showNames = height >= 64;

  return (
    <Box
      onClick={onClick}
      sx={{
        position: "absolute",
        inset: 0,
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        border: "1px solid",
        borderColor: isPlanned ? alpha(tokens.amber, 0.28) : tokens.border,
        borderStyle: isPlanned ? "dashed" : "solid",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(12,30,60,0.05)",
        "&:active": {
          boxShadow: "0 3px 10px rgba(12,30,60,0.1)",
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
        {/* ── Always visible: dots + destination/fallback ─────────────── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            minWidth: 0,
          }}
        >
          {/* Colored dot per traveler */}
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

          {/* Destination — falls back to date range if unnamed */}
          <Typography
            sx={{
              fontFamily: trip.destination
                ? tokens.fontDisplay
                : tokens.fontBody,
              fontSize: "0.72rem",
              fontStyle: trip.destination ? "italic" : "normal",
              fontWeight: trip.destination ? 400 : 500,
              color: tokens.navy,
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

        {/* ── Date range — shown when destination already occupies top row ── */}
        {showDates && trip.destination && (
          <Typography
            sx={{
              fontSize: "0.6rem",
              color: tokens.textGhost,
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

        {/* ── Traveler name chips — only when there's real estate for them ── */}
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

  const positionedTrips = useMemo(
    () => assignLanes(travelers, hiddenTravelerIds, timelineStart, todayStr),
    [travelers, hiddenTravelerIds, timelineStart, todayStr],
  );

  const contentHeight = useMemo(() => {
    if (positionedTrips.length === 0) return 600;
    const maxBottom = Math.max(...positionedTrips.map((p) => p.top + p.height));
    return maxBottom + BOTTOM_PADDING;
  }, [positionedTrips]);

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
      <Box sx={{ display: "flex", minHeight: "100%" }}>
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
          <DateSidebar timelineStart={timelineStart} />
        </Box>

        {/* Single merged content column */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            minHeight: contentHeight,
          }}
        >
          {/* Today line */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              top: todayTop,
              height: 2,
              bgcolor: tokens.green,
              zIndex: 3,
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

          {/* Positioned trip cards */}
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

          {/* Add Trip — bottom of scrollable content */}
          {!allHidden && (
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: CARD_GUTTER + 4,
                right: CARD_GUTTER + 4,
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
        {/* ↑ content column closes here — button is now inside it */}
      </Box>
    </Box>
  );
}
