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
} from "@/features/calculator/utils/dates";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MergedTrip {
  /**
   * The canonical trip record used for dates, region, and destination.
   * When multiple travelers share the same trip, the first traveler's
   * record is used.
   */
  trip: Trip;
  entries: Array<{ traveler: Traveler; travelerIndex: number }>;
}

interface MobileTripsViewProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onAddTraveler: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Merges trips from all visible travelers into a single sorted list.
 *
 * Two trips are considered the same trip when they share identical
 * entryDate, exitDate, and region. When merged, the first traveler's
 * trip record is used as the canonical source.
 *
 * Sort order: ongoing → upcoming → past (most recent first within past).
 */
function buildMergedTrips(
  travelers: Traveler[],
  hiddenIds: string[],
  todayStr: string,
): MergedTrip[] {
  const merged: MergedTrip[] = [];

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
        existing.entries.push({ traveler, travelerIndex });
      } else {
        merged.push({ trip, entries: [{ traveler, travelerIndex }] });
      }
    });
  });

  const sortPriority = (t: Trip): number => {
    if (!t.exitDate) return 0; // ongoing
    if (t.entryDate > todayStr) return 1; // upcoming
    return 2; // past
  };

  return merged.sort((a, b) => {
    const pa = sortPriority(a.trip);
    const pb = sortPriority(b.trip);
    if (pa !== pb) return pa - pb;
    // Within each group: most recent entry date first
    return b.trip.entryDate.localeCompare(a.trip.entryDate);
  });
}

function fmtDate(iso: string): string {
  return format(parseDate(iso), "MMM d");
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
  const { trip, entries } = merged;

  const isOngoing = !trip.exitDate;
  const isPlanned = trip.entryDate > todayStr;
  const isSchengen = trip.region === VisaRegion.Schengen;
  const days = countTripDays(
    parseDate(trip.entryDate),
    parseDate(trip.exitDate ?? todayStr),
  );

  return (
    <Box
      onClick={onEdit}
      sx={{
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        border: "1px solid",
        borderColor: isPlanned ? alpha(tokens.amber, 0.3) : tokens.border,
        borderStyle: isPlanned ? "dashed" : "solid",
        borderRadius: "10px",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(12,30,60,0.06)",
        transition: "box-shadow 0.15s",
        "&:active": {
          boxShadow: "0 3px 10px rgba(12,30,60,0.1)",
        },
      }}
    >
      <Box sx={{ px: "14px", py: "10px" }}>
        {/* Destination */}
        {trip.destination && (
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.9rem",
              fontStyle: "italic",
              color: tokens.navy,
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

        {/* Date range */}
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: tokens.textSoft,
            fontWeight: 500,
            mb: "8px",
          }}
        >
          {fmtDate(trip.entryDate)}
          {isOngoing ? " → ongoing" : ` → ${fmtDate(trip.exitDate!)}`}
        </Typography>

        {/* Badges + traveler chips */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "5px",
          }}
        >
          {/* Duration */}
          <Box
            sx={{ ...BADGE_SX, bgcolor: tokens.mist, color: tokens.textSoft }}
          >
            {days}d
          </Box>

          {/* Region */}
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

          {/* Traveler chips — pushed to the right */}
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

  // All travelers hidden
  const allHidden =
    travelers.length > 0 &&
    travelers.every((t) => hiddenTravelerIds.includes(t.id));

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
          py: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
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
              Add a trip using the button above.
            </Typography>
          </Box>
        ) : (
          mergedTrips.map((merged) => (
            <MergedTripCard
              key={`${merged.trip.entryDate}-${merged.trip.exitDate ?? "ongoing"}-${merged.trip.region}`}
              merged={merged}
              onEdit={() =>
                onEditTrip(merged.entries[0].traveler.id, merged.trip)
              }
            />
          ))
        )}
      </Box>
    </Box>
  );
}
