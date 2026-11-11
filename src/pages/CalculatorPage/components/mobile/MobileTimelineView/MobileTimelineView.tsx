import { useRef, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { format } from "date-fns";
import { type Traveler, type Trip, VisaRegion, VISA_REGION_LABELS, isEntitled, isVisaRequired } from "@/types";
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
import { type MarkerDetail, MarkerDetailDrawer } from "../MarkerDetailDrawer";
import {
  type AgingMarker,
  type WindowMarkers,
  computeWindowMarkers,
  assignChipSlots,
  thresholdsFor,
  regionMarkerName,
  returnMarkerRowText,
  agingMarkerTripLine,
  AGING_MARKER_EXPLANATION,
} from "@/features/calculator/utils/windowMarkers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTimelineViewProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onEditTrip: (travelerIds: string[], trip: Trip) => void;
  onAddTraveler: () => void;
  /**
   * Trip cards fade to plain light-grey tiles and the markers are drawn on
   * top of them, so chips and age-out labels can be read where they sit.
   */
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

/** Horizontal slot, resolved for the whole view, and the tap handler. */
interface MarkerPlacement {
  slot: number;
  /** Opens the marker's details in the bottom drawer. */
  onOpenDetail: (detail: MarkerDetail) => void;
}

/** Resets a <button> so the marker pill inside it looks unchanged. */
const PILL_BUTTON_SX = {
  font: "inherit",
  appearance: "none",
  margin: 0,
  pointerEvents: "auto",
  cursor: "pointer",
  "&:active": { filter: "brightness(0.96)" },
} as const;

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

/** Horizontal step between pills of different destinations on nearby dates. */
const RETURN_CHIP_SLOT_PX = 104;
const AGING_CHIP_SLOT_PX = 44;
const CHIP_MIN_GAP_PX = 15;

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
  /** Fade to a plain light-grey tile (animated) so markers read over it. */
  muted: boolean;
  onClick: () => void;
}

const MUTE_TRANSITION = "0.25s ease";

function MobileTimelineTripCard({
  positioned,
  isHighlighted,
  muted,
  onClick,
}: MobileTimelineTripCardProps) {
  const { trip, entries, height, isOverstay } = positioned;

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
        bgcolor: muted ? alpha(tokens.mist, 0.7) : cardBg,
        border: "1px solid",
        borderColor: muted
          ? alpha(isOverstay ? tokens.red : tokens.border, 0.6)
          : cardBorderColor,
        borderStyle: isPlanned && !isOverstay && !muted ? "dashed" : "solid",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: muted
          ? "none"
          : isOverstay
            ? "0 1px 3px rgba(239,68,68,0.1)"
            : "0 1px 3px rgba(12,30,60,0.05)",
        transition: `background-color ${MUTE_TRANSITION}, border-color ${MUTE_TRANSITION}, box-shadow ${MUTE_TRANSITION}`,
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
          opacity: muted ? 0 : 1,
          transition: `opacity ${MUTE_TRANSITION}`,
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
          opacity: muted ? 0 : 1,
          transition: `opacity ${MUTE_TRANSITION}`,
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
  region,
  top,
  entries,
  travelerIndices,
  maxDays,
  allowance,
  slot,
  onOpenDetail,
}: MobileReturnMarkerGroup & MarkerPlacement) {
  const isGenerous = maxDays >= allowance / 3;
  const lineBase = isGenerous ? tokens.green : tokens.amber;
  const textColor = isGenerous ? tokens.greenText : tokens.amberText;
  const bgColor = isGenerous ? tokens.greenBg : tokens.amberBg;

  // Opacity mirrors desktop logic, keyed to the smallest threshold in the group.
  const minDays = Math.min(...entries.map((e) => e.days));
  const isMajor = thresholdsFor(allowance).indexOf(minDays) % 2 === 1;
  const lineOpacity = isMajor ? 0.35 : 0.18;
  const pillOpacity = isMajor ? 1 : 0.65;

  // Deduplicate entries by traveler, keeping only the max-threshold entry per
  // traveler. This mirrors the pill logic: only the best reachable value matters.
  const perTraveler = new Map<number, ReturnMarkerEntry>();
  entries.forEach((e) => {
    const existing = perTraveler.get(e.travelerIndex);
    if (!existing || e.days > existing.days) perTraveler.set(e.travelerIndex, e);
  });
  const dedupedEntries = [...perTraveler.values()].sort((a, b) => a.top - b.top);

  // Details: the destination, then one sentence per traveler (same format
  // for one or many).
  const detail: MarkerDetail = {
    title: VISA_REGION_LABELS[region],
    lines: dedupedEntries.map((e) =>
      returnMarkerRowText(e.travelerName, e.date, e.days),
    ),
  };

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

      {/* Pill: traveller colour dots + destination + max threshold. Tapping it
          opens the details in the bottom drawer. */}
      <Box
        sx={{
          position: "absolute",
          left: CARD_GUTTER + 2 + slot * RETURN_CHIP_SLOT_PX,
          top: 0,
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
          <Box
            component="button"
            type="button"
            aria-label={`${regionMarkerName(region)}: up to ${maxDays} days. Show details`}
            onClick={() => onOpenDetail(detail)}
            sx={{
              ...PILL_BUTTON_SX,
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              px: "5px",
              py: "2px",
              borderRadius: "100px",
              bgcolor: bgColor,
              border: `1px dashed ${alpha(lineBase, 0.25)}`,
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
                fontWeight: 600,
                color: alpha(textColor, pillOpacity * 0.85),
                lineHeight: 1,
                whiteSpace: "nowrap",
                userSelect: "none",
              }}
            >
              {regionMarkerName(region)}
            </Typography>

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
      </Box>
    </Box>
  );
}

// ─── Mobile aging marker ──────────────────────────────────────────────────────

function MobileAgingMarker({
  region,
  top,
  markers,
  slot,
  prominent,
  onOpenDetail,
}: MobileAgingMarkerGroup & MarkerPlacement & { prominent: boolean }) {
  // Faint behind the trip cards; darker while the cards are muted, when the
  // label sits over a grey tile and is the thing being read.
  const LINE_OPACITY = prominent ? 0.4 : 0.12;
  const TEXT_OPACITY = prominent ? 0.95 : 0.4;

  const isSingle = markers.length === 1;
  const centreLabel = isSingle
    ? `${markers[0].destination} ages out`
    : `${markers.length} Trips Age Out`;

  // Details: one sentence per trip, then the behaviour note (same format for
  // one trip or many).
  const detail: MarkerDetail = {
    title: centreLabel,
    lines: markers.map((m) =>
      agingMarkerTripLine(region, m.destination, m.tripDays, m.date),
    ),
    note: AGING_MARKER_EXPLANATION,
  };

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
    <>
      <InfoOutlinedIcon
        sx={{ fontSize: "0.6rem", color: alpha(tokens.textGhost, 0.6), flexShrink: 0 }}
      />
    </>
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
      {/* Dotted line with centred label — first slot only, so two
          destinations aging out on nearby dates don't overprint labels. */}
      {slot === 0 && (
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
            color: alpha(prominent ? tokens.textSoft : tokens.textGhost, TEXT_OPACITY),
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
      )}

      {/* Right-side info pill — tapping it opens the details drawer. */}
      <Box
        sx={{
          position: "absolute",
          right: CARD_GUTTER + 2 + slot * AGING_CHIP_SLOT_PX,
          top: 0,
          transform: "translateY(-50%)",
          zIndex: 2,
        }}
      >
          <Box
            component="button"
            type="button"
            aria-label={`${centreLabel}. Show details`}
            onClick={() => onOpenDetail(detail)}
            sx={{
              ...PILL_BUTTON_SX,
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              px: "5px",
              py: "1.5px",
              borderRadius: "100px",
              bgcolor: tokens.mist,
              border: `1px dotted ${alpha(tokens.textGhost, 0.15)}`,
            }}
          >
            {pillContent}
          </Box>
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
  mutedTrips,
}: MobileTimelineViewProps) {
  const [markerDetail, setMarkerDetail] = useState<MarkerDetail | null>(null);
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

  const returnSlots = useMemo(
    () => assignChipSlots(returnMarkerGroups.map((g) => g.top), CHIP_MIN_GAP_PX),
    [returnMarkerGroups],
  );
  const agingSlots = useMemo(
    () => assignChipSlots(agingMarkerGroups.map((g) => g.top), CHIP_MIN_GAP_PX),
    [agingMarkerGroups],
  );

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

            {/* Markers — below the trip cards (zIndex 3), or above them while
                the cards are muted to plain tiles. */}
            {!allHidden && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: mutedTrips ? 4 : 1,
                }}
              >
                {returnMarkerGroups.map((group, i) => (
                  <MobileReturnMarker
                    key={`ret-${group.region}-${group.top}-${group.maxDays}`}
                    {...group}
                    slot={returnSlots[i]}
                    onOpenDetail={setMarkerDetail}
                  />
                ))}
                {agingMarkerGroups.map((group, i) => (
                  <MobileAgingMarker
                    key={`aging-${group.region}-${group.top}-${group.markers.length}`}
                    {...group}
                    slot={agingSlots[i]}
                    onOpenDetail={setMarkerDetail}
                    prominent={mutedTrips}
                  />
                ))}
              </Box>
            )}

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
                    left: `calc(${leftPct}% + ${CARD_GUTTER}px)`,
                    width: `calc(${pct}% - ${CARD_GUTTER * 2}px)`,
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

      <MarkerDetailDrawer
        detail={markerDetail}
        onClose={() => setMarkerDetail(null)}
      />
    </Box>
  );
}
