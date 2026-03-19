import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import AddIcon from "@mui/icons-material/Add";
import { Traveler, Trip, VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import {
  parseDate,
  todayISO,
  countTripDays,
  today as getToday,
} from "@/features/calculator/utils/dates";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { computeTravelerStatus } from "../../travelers/travelerStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MergedTrip {
  trip: Trip;
  entries: Array<{ traveler: Traveler; travelerIndex: number }>;
  isOverstay: boolean;
}

interface MobileTripsViewProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onEditTrip: (travelerIds: string[], trip: Trip) => void;
  onAddTrip: () => void;
  onAddTraveler: () => void;
}

// ─── Overstay helpers ─────────────────────────────────────────────────────────

/**
 * Returns a Set of coordinate keys ("entryDate|exitDate|region") that are in
 * an overstay state at their exit date for the given traveler. Coordinate
 * keys are used instead of UUIDs because merged cards consolidate trips from
 * multiple travelers, each with a different UUID.
 */
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildMergedTrips(
  travelers: Traveler[],
  hiddenIds: string[],
  todayStr: string,
): MergedTrip[] {
  // Pre-compute overstay coords per traveler once.
  const overstayByTraveler = new Map<string, Set<string>>(
    travelers.map((t) => [t.id, computeOverstayCoords(t)]),
  );

  const merged: MergedTrip[] = [];

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
        existing.entries.push({ traveler, travelerIndex });
        // Any traveler in overstay marks the merged card.
        if (tripIsOverstay) existing.isOverstay = true;
      } else {
        merged.push({
          trip,
          entries: [{ traveler, travelerIndex }],
          isOverstay: tripIsOverstay,
        });
      }
    });
  });

  const sortPriority = (t: Trip): number => {
    if (!t.exitDate) return 0;
    if (t.entryDate > todayStr) return 1;
    return 2;
  };

  return merged.sort((a, b) => {
    const pa = sortPriority(a.trip);
    const pb = sortPriority(b.trip);
    if (pa !== pb) return pa - pb;
    return b.trip.entryDate.localeCompare(a.trip.entryDate);
  });
}

function fmtDate(iso: string): string {
  return format(parseDate(iso), "MMM d");
}

// ─── Add Trip button ──────────────────────────────────────────────────────────

function AddTripButton({ onClick }: { onClick: () => void }) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        py: "11px",
        border: `1.5px dashed ${tokens.border}`,
        borderRadius: "10px",
        bgcolor: tokens.white,
        fontFamily: tokens.fontBody,
        fontSize: "0.82rem",
        fontWeight: 600,
        color: tokens.textSoft,
        cursor: "pointer",
        transition: "border-color 0.15s, color 0.15s, background 0.15s",
        "&:active": {
          borderColor: tokens.navy,
          color: tokens.navy,
          bgcolor: alpha(tokens.navy, 0.03),
        },
      }}
    >
      <AddIcon sx={{ fontSize: "0.95rem" }} />
      Add Trip
    </Box>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE_SX = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.6rem",
  fontWeight: 700,
  px: "7px",
  py: "2px",
  borderRadius: "100px",
  lineHeight: "16px",
  whiteSpace: "nowrap" as const,
};

// ─── MergedTripCard ───────────────────────────────────────────────────────────

interface MergedTripCardProps {
  merged: MergedTrip;
  onEdit: () => void;
}

function MergedTripCard({ merged, onEdit }: MergedTripCardProps) {
  const todayStr = todayISO();
  const { trip, entries, isOverstay } = merged;

  const isOngoing = !trip.exitDate;
  const isPlanned = trip.entryDate > todayStr;
  const isSchengen = trip.region === VisaRegion.Schengen;
  const days = countTripDays(
    parseDate(trip.entryDate),
    parseDate(trip.exitDate ?? todayStr),
  );

  // Overstay overrides the card's colour scheme.
  const cardBg = isOverstay
    ? tokens.redBg
    : isPlanned
      ? "#FDFCF8"
      : tokens.white;
  const cardBorderColor = isOverstay
    ? alpha(tokens.red, 0.35)
    : isPlanned
      ? alpha(tokens.amber, 0.3)
      : tokens.border;
  const cardBorderStyle = isPlanned && !isOverstay ? "dashed" : "solid";

  const destinationColor = isOverstay ? tokens.red : tokens.navy;
  const dateColor = isOverstay ? tokens.redText : tokens.textSoft;

  // Top accent stripe colour
  const stripeColor = isOverstay
    ? tokens.red
    : isPlanned
      ? tokens.amber
      : isSchengen
        ? tokens.green
        : tokens.border;

  return (
    <Box
      onClick={onEdit}
      sx={{
        bgcolor: cardBg,
        border: "1px solid",
        borderColor: cardBorderColor,
        borderStyle: cardBorderStyle,
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: isOverstay
          ? "0 1px 3px rgba(239,68,68,0.1)"
          : "0 1px 3px rgba(12,30,60,0.06)",
        transition: "box-shadow 0.15s",
        "&:active": {
          boxShadow: isOverstay
            ? "0 3px 10px rgba(239,68,68,0.18)"
            : "0 3px 10px rgba(12,30,60,0.1)",
        },
      }}
    >
      {/* Top accent stripe */}
      <Box sx={{ height: 3, bgcolor: stripeColor }} />

      <Box sx={{ px: "14px", py: "10px" }}>
        {trip.destination && (
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: destinationColor,
              fontWeight: isOverstay ? 500 : 400,
              lineHeight: 1.25,
              mb: "3px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {trip.destination}
          </Typography>
        )}

        <Typography
          sx={{
            fontSize: "0.72rem",
            color: dateColor,
            fontWeight: 500,
            mb: "8px",
          }}
        >
          {fmtDate(trip.entryDate)}
          {isOngoing ? " → ongoing" : ` → ${fmtDate(trip.exitDate!)}`}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "5px",
          }}
        >
          {/* Duration badge — always neutral */}
          <Box
            sx={{ ...BADGE_SX, bgcolor: tokens.mist, color: tokens.textSoft }}
          >
            {days}d
          </Box>

          {/* Region / overstay label */}
          {isOverstay ? (
            <Box
              sx={{
                ...BADGE_SX,
                bgcolor: alpha(tokens.red, 0.12),
                color: tokens.redText,
              }}
            >
              ⚠ Overstay
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  ...BADGE_SX,
                  bgcolor: isSchengen ? alpha(tokens.green, 0.1) : tokens.mist,
                  color: isSchengen ? tokens.greenText : tokens.textSoft,
                }}
              >
                {isSchengen ? "Schengen" : "Elsewhere"}
              </Box>

              {isOngoing && (
                <Box
                  sx={{
                    ...BADGE_SX,
                    bgcolor: alpha(tokens.green, 0.1),
                    color: tokens.greenText,
                  }}
                >
                  Ongoing
                </Box>
              )}

              {isPlanned && (
                <Box
                  sx={{
                    ...BADGE_SX,
                    bgcolor: alpha(tokens.amber, 0.1),
                    color: tokens.amberText,
                  }}
                >
                  Planned
                </Box>
              )}
            </>
          )}

          {/* Traveler chips — right-aligned, unaffected by overstay */}
          <Box
            sx={{
              display: "flex",
              gap: "4px",
              ml: "auto",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {entries.map(({ traveler, travelerIndex }) => {
              const color = getTravelerColor(travelerIndex);
              return (
                <Box
                  key={traveler.id}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "7px",
                    py: "2px",
                    borderRadius: "100px",
                    bgcolor: alpha(color, 0.1),
                    border: `1px solid ${alpha(color, 0.25)}`,
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
                      fontSize: "0.62rem",
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
        </Box>
      </Box>
    </Box>
  );
}

// ─── MobileTripsView ──────────────────────────────────────────────────────────

export function MobileTripsView({
  travelers,
  hiddenTravelerIds,
  onEditTrip,
  onAddTrip,
  onAddTraveler,
}: MobileTripsViewProps) {
  const todayStr = todayISO();

  const mergedTrips = useMemo(
    () => buildMergedTrips(travelers, hiddenTravelerIds, todayStr),
    [travelers, hiddenTravelerIds, todayStr],
  );

  // No travelers at all
  if (travelers.length === 0) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          px: "24px",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: tokens.mist,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: tokens.textGhost,
            mb: "4px",
          }}
        >
          <AddIcon sx={{ fontSize: "1.1rem" }} />
        </Box>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: tokens.text,
          }}
        >
          No travelers yet
        </Typography>
        <Typography
          sx={{ fontSize: "0.78rem", color: tokens.textSoft, lineHeight: 1.6 }}
        >
          Add travelers to start tracking your Schengen allowance.
        </Typography>
        <Box
          component="button"
          onClick={onAddTraveler}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            mt: "4px",
            px: "16px",
            py: "8px",
            bgcolor: tokens.green,
            color: tokens.white,
            border: "none",
            borderRadius: "8px",
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <AddIcon sx={{ fontSize: "0.9rem" }} />
          Add traveler
        </Box>
      </Box>
    );
  }

  const allHidden = travelers.every((t) => hiddenTravelerIds.includes(t.id));

  if (allHidden) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Box
        sx={{
          maxWidth: 600,
          width: "100%",
          mx: "auto",
          px: "14px",
          pt: "14px",
          pb: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Add Trip — top */}
        <AddTripButton onClick={onAddTrip} />

        {mergedTrips.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              py: "48px",
              gap: "8px",
              border: "1.5px dashed",
              borderColor: tokens.border,
              borderRadius: "14px",
              bgcolor: tokens.white,
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontDisplay,
                fontSize: "0.95rem",
                fontStyle: "italic",
                color: tokens.text,
              }}
            >
              No trips yet
            </Typography>
            <Typography sx={{ fontSize: "0.78rem", color: tokens.textSoft }}>
              Use the button above to add your first trip.
            </Typography>
          </Box>
        ) : (
          <>
            {mergedTrips.map((merged) => (
              <MergedTripCard
                key={`${merged.trip.entryDate}-${merged.trip.exitDate ?? "ongoing"}-${merged.trip.region}`}
                merged={merged}
                onEdit={() =>
                  onEditTrip(
                    merged.entries.map((e) => e.traveler.id),
                    merged.trip,
                  )
                }
              />
            ))}

            {/* Add Trip — bottom */}
            <AddTripButton onClick={onAddTrip} />
          </>
        )}
      </Box>
    </Box>
  );
}
