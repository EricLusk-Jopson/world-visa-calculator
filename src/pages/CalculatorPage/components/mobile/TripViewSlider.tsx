import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { tokens } from "@/styles/theme";
import { type Traveler, type Trip, VisaRegion } from "@/types";
import {
  parseDate,
  countTripDays,
  todayISO,
} from "@/features/calculator/utils/dates";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { DurationIcon } from "@/components/ui/DurationIcon";
import { TripDetailStack } from "@/features/trips/components/TripDetailStack";
import { computeTravelerEligibility } from "../trips/tripEligibility";
import { computeTravelerDurations } from "../trips/tripDuration";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripViewSliderProps {
  open: boolean;
  onClose: () => void;
  travelers: Traveler[];
  travelerIds: string[];
  trip: Trip | null;
  onModify: () => void;
  onDelete: (travelerIds: string[], trip: Trip) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRegionLabel(region: VisaRegion): string {
  switch (region) {
    case VisaRegion.Schengen: return "Schengen";
    case VisaRegion.UnitedKingdom: return "United Kingdom";
    case VisaRegion.Ireland: return "Ireland";
    case VisaRegion.Turkiye: return "Türkiye";
    case VisaRegion.Montenegro: return "Montenegro";
    case VisaRegion.Serbia: return "Serbia";
    case VisaRegion.Bosnia: return "Bosnia and Herzegovina";
    case VisaRegion.Kosovo: return "Kosovo";
    default: return "Elsewhere";
  }
}

/** Small uppercase label for a header status group ("Entry" / "Duration"). */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.6rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        color: tokens.textGhost,
      }}
    >
      {children}
    </Typography>
  );
}

/** A status icon paired with a count (used in the header summary strip). */
function IconCount({
  icon,
  count,
  color,
}: {
  icon: React.ReactNode;
  count: number;
  color: string;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
      {icon}
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.8rem",
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {count}
      </Typography>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TripViewSlider({
  open,
  onClose,
  travelers,
  travelerIds,
  trip,
  onModify,
  onDelete,
}: TripViewSliderProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const relevantTravelers = useMemo(
    () => travelers.filter((t) => travelerIds.includes(t.id)),
    [travelers, travelerIds],
  );

  if (!trip) return null;

  const regionLabel = getRegionLabel(trip.region);
  const isOngoing = !trip.exitDate;
  const exitStr = trip.exitDate ?? todayISO();
  const entryObj = parseDate(trip.entryDate);
  const exitObj = parseDate(exitStr);
  const days = countTripDays(entryObj, exitObj);
  const dateRange = isOngoing
    ? `${format(entryObj, "d MMM yyyy")} – ongoing`
    : `${format(entryObj, "d MMM")} – ${format(exitObj, "d MMM yyyy")}`;

  // Per-traveler eligibility + duration — the same data as the create/edit frame.
  const eligibility = computeTravelerEligibility(
    trip.region,
    travelers,
    travelerIds,
    trip.entryDate,
    trip.exitDate,
  );
  const durations = computeTravelerDurations({
    region: trip.region,
    travelers,
    travelerIds,
    entryDate: trip.entryDate,
    exitDate: trip.exitDate ?? "",
    destination: trip.destination ?? "",
    excludeTripId: trip.id,
    excludeTrip: {
      entryDate: trip.entryDate,
      exitDate: trip.exitDate,
      region: trip.region,
    },
  });

  // Aggregate status for the header summary strip.
  const eligOk = eligibility.filter((e) => e.ok).length;
  const eligWarn = eligibility.filter((e) => !e.ok && e.access !== "unknown").length;
  const eligUnknown = eligibility.filter((e) => e.access === "unknown").length;

  const durOk = durations.filter((d) => d.tracked && d.severity === "safe").length;
  const durCaution = durations.filter((d) => d.tracked && d.severity === "caution").length;
  const durDanger = durations.filter((d) => d.tracked && d.severity === "danger" && !d.overstay).length;
  const durOverstay = durations.filter((d) => d.tracked && d.overstay).length;
  const durUnknown = durations.filter((d) => !d.tracked).length;

  const hasElig = eligOk + eligWarn + eligUnknown > 0;
  const hasDur = durOk + durCaution + durDanger + durOverstay + durUnknown > 0;

  // ── Footer ────────────────────────────────────────────────────────────────

  const footer = (
    <Box sx={{ display: "flex", gap: "8px" }}>
      <Box
        component="button"
        onClick={() => setConfirmDelete(true)}
        sx={{
          flex: 1,
          py: "11px",
          border: `1.5px solid ${alpha(tokens.red, 0.5)}`,
          borderRadius: "10px",
          bgcolor: "transparent",
          color: tokens.red,
          fontFamily: tokens.fontBody,
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          "&:active": { bgcolor: tokens.redBg },
        }}
      >
        Delete
      </Box>
      <Box
        component="button"
        onClick={onModify}
        sx={{
          flex: 2,
          py: "11px",
          border: "none",
          borderRadius: "10px",
          bgcolor: tokens.navy,
          color: tokens.white,
          fontFamily: tokens.fontBody,
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: "pointer",
          "&:active": { opacity: 0.85 },
        }}
      >
        Modify Trip
      </Box>
    </Box>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <FullScreenSlider
        open={open}
        onClose={onClose}
        title="Trip Detail"
        footer={footer}
      >
        <Box
          sx={{
            p: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* ── Header: title, subheader, status icons ─────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: tokens.navy,
                  lineHeight: 1.15,
                }}
              >
                {trip.destination || regionLabel}
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: tokens.textSoft,
                }}
              >
                {regionLabel} · {dateRange} · {days} day{days === 1 ? "" : "s"}
              </Typography>
            </Box>

            {(hasElig || hasDur) && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                {hasElig && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GroupLabel>Entry</GroupLabel>
                    {eligOk > 0 && (
                      <IconCount
                        count={eligOk}
                        color={tokens.green}
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: "1.05rem", color: tokens.green }} />}
                      />
                    )}
                    {eligWarn > 0 && (
                      <IconCount
                        count={eligWarn}
                        color={tokens.red}
                        icon={<WarningAmberIcon sx={{ fontSize: "1.05rem", color: tokens.red }} />}
                      />
                    )}
                    {eligUnknown > 0 && (
                      <IconCount
                        count={eligUnknown}
                        color={tokens.textGhost}
                        icon={<HelpOutlineIcon sx={{ fontSize: "1.05rem", color: tokens.textGhost }} />}
                      />
                    )}
                  </Box>
                )}

                {hasElig && hasDur && (
                  <Box sx={{ width: "1px", height: 16, bgcolor: tokens.border }} />
                )}

                {hasDur && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <GroupLabel>Duration</GroupLabel>
                    {durOk > 0 && (
                      <IconCount count={durOk} color={tokens.green} icon={<DurationIcon state="safe" size="1.05rem" />} />
                    )}
                    {durCaution > 0 && (
                      <IconCount count={durCaution} color={tokens.amberText} icon={<DurationIcon state="caution" size="1.05rem" />} />
                    )}
                    {durDanger > 0 && (
                      <IconCount count={durDanger} color={tokens.red} icon={<DurationIcon state="danger" size="1.05rem" />} />
                    )}
                    {durOverstay > 0 && (
                      <IconCount count={durOverstay} color={tokens.red} icon={<DurationIcon state="overstay" size="1.05rem" />} />
                    )}
                    {durUnknown > 0 && (
                      <IconCount count={durUnknown} color={tokens.textGhost} icon={<DurationIcon state="untracked" size="1.05rem" />} />
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* ── Per-traveler cards (collapsed unless there's only one) ───────── */}
          <TripDetailStack
            eligibility={eligibility}
            durations={durations}
            entryDate={trip.entryDate}
            exitDate={trip.exitDate ?? ""}
            defaultOpen={eligibility.length === 1}
          />
        </Box>
      </FullScreenSlider>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            px: "4px",
            py: "4px",
            maxWidth: 340,
            width: "calc(100vw - 48px)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            pb: "6px",
          }}
        >
          Delete this trip?
        </DialogTitle>
        <DialogContent sx={{ pb: "8px" }}>
          <Typography sx={{ fontSize: "0.83rem", color: tokens.textSoft }}>
            This will remove the trip from{" "}
            {relevantTravelers.length > 1
              ? `${relevantTravelers.length} travelers`
              : (relevantTravelers[0]?.name ?? "this traveler")}
            . This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: "16px", pb: "12px", gap: "8px" }}>
          <Box
            component="button"
            onClick={() => setConfirmDelete(false)}
            sx={{
              flex: 1,
              py: "8px",
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              bgcolor: "transparent",
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tokens.textSoft,
              cursor: "pointer",
              "&:active": { bgcolor: tokens.mist },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={() => {
              setConfirmDelete(false);
              onDelete(travelerIds, trip);
            }}
            sx={{
              flex: 1,
              py: "8px",
              border: "none",
              borderRadius: "8px",
              bgcolor: tokens.red,
              fontFamily: tokens.fontBody,
              fontSize: "0.82rem",
              fontWeight: 600,
              color: tokens.white,
              cursor: "pointer",
              "&:active": { opacity: 0.85 },
            }}
          >
            Delete
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
}
