import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { alpha } from "@mui/material/styles";
import { format } from "date-fns";
import { tokens } from "@/styles/theme";
import { type Traveler, type Trip, VisaRegion } from "@/types";
import {
  parseDate,
  countTripDays,
  todayISO,
} from "@/features/calculator/utils/dates";
import { computeTravelerStatus } from "../travelers/travelerStatus";
import { getSchengenRule } from "@/data/regions/schengen";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";

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
    default: return "Elsewhere";
  }
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: tokens.textGhost,
        mb: "8px",
      }}
    >
      {children}
    </Typography>
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
  const todayStr = todayISO();

  const relevantTravelers = useMemo(
    () => travelers.filter((t) => travelerIds.includes(t.id)),
    [travelers, travelerIds],
  );

  if (!trip) return null;

  const isOngoing = !trip.exitDate;
  const isPlanned = trip.entryDate > todayStr;
  const isSchengen = trip.region === VisaRegion.Schengen;

  const exitStr = trip.exitDate ?? todayStr;
  const entryDateObj = parseDate(trip.entryDate);
  const exitDateObj = parseDate(exitStr);
  const days = countTripDays(entryDateObj, exitDateObj);

  // Per-traveler Schengen status
  const statusPerTraveler = isSchengen
    ? relevantTravelers.map((t) => {
        const refDate = trip.exitDate ? parseDate(trip.exitDate) : new Date();
        const status = computeTravelerStatus(t, refDate);
        const rule = getSchengenRule(t.passportCode);
        const travelerIndex = travelers.findIndex((x) => x.id === t.id);
        return {
          traveler: t,
          status,
          rule,
          color: getTravelerColor(travelerIndex),
        };
      })
    : [];

  const worstStatus = statusPerTraveler.reduce<
    (typeof statusPerTraveler)[0] | null
  >((worst, curr) => {
    if (!worst) return curr;
    return curr.status.daysRemaining < worst.status.daysRemaining ? curr : worst;
  }, null);

  const hasOverstay = statusPerTraveler.some((s) => s.status.daysRemaining < 0);
  const isApproaching =
    !hasOverstay && statusPerTraveler.some((s) => s.status.daysRemaining < 10);

  const accent = hasOverstay
    ? tokens.red
    : isPlanned
      ? tokens.amber
      : tokens.green;

  const statusLabel = hasOverstay
    ? "⚠ Overstay"
    : isPlanned
      ? "Planned"
      : isOngoing
        ? "Ongoing"
        : getRegionLabel(trip.region);

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
            p: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* ── Region + destination + travelers ──────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: "10px",
                py: "4px",
                borderRadius: "100px",
                bgcolor: alpha(accent, 0.12),
                alignSelf: "flex-start",
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: accent,
                }}
              >
                {statusLabel}
              </Typography>
            </Box>

            {trip.destination && (
              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: "1.5rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: tokens.navy,
                  lineHeight: 1.2,
                }}
              >
                {trip.destination}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {relevantTravelers.map((t) => {
                const idx = travelers.findIndex((x) => x.id === t.id);
                return (
                  <Box
                    key={t.id}
                    sx={{ display: "flex", alignItems: "center", gap: "7px" }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: getTravelerColor(idx),
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.9rem",
                        color: tokens.textSoft,
                        fontWeight: 500,
                      }}
                    >
                      {t.name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* ── Dates + duration ──────────────────────────────────────────── */}
          <Box>
            <Box
              sx={{
                bgcolor: tokens.white,
                borderRadius: "12px",
                p: "16px",
                border: `1px solid ${tokens.border}`,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: tokens.textGhost,
                      mb: "4px",
                    }}
                  >
                    Entry
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: tokens.fontDisplay,
                      fontSize: "1.2rem",
                      fontStyle: "italic",
                      color: tokens.navy,
                    }}
                  >
                    {format(entryDateObj, "MMM d, yyyy")}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    sx={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: tokens.textGhost,
                      mb: "4px",
                    }}
                  >
                    Exit
                  </Typography>
                  {isOngoing ? (
                    <Typography
                      sx={{
                        fontFamily: tokens.fontDisplay,
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                        color: tokens.green,
                      }}
                    >
                      Ongoing →
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontFamily: tokens.fontDisplay,
                        fontSize: "1.2rem",
                        fontStyle: "italic",
                        color: tokens.navy,
                      }}
                    >
                      {format(exitDateObj, "MMM d, yyyy")}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.82rem",
                  color: tokens.textSoft,
                  fontWeight: 500,
                }}
              >
                Duration: {days} day{days !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

          {/* ── Rolling window status (Schengen only) ─────────────────────── */}
          {isSchengen && worstStatus && (
            <Box>
              <SectionHeading>Rolling Window Status</SectionHeading>
              <Box
                sx={{
                  bgcolor: tokens.white,
                  borderRadius: "12px",
                  p: "16px",
                  border: `1px solid ${tokens.border}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.72rem",
                        color: tokens.textGhost,
                        mb: "2px",
                      }}
                    >
                      Days used in window
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: tokens.navy,
                        lineHeight: 1,
                      }}
                    >
                      {worstStatus.status.daysUsed}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.72rem",
                        color: tokens.textGhost,
                        mb: "2px",
                      }}
                    >
                      Days remaining
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: hasOverstay
                          ? tokens.red
                          : isApproaching
                            ? tokens.amber
                            : tokens.green,
                        lineHeight: 1,
                      }}
                    >
                      {Math.max(0, worstStatus.status.daysRemaining)}
                    </Typography>
                  </Box>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={Math.min(
                    100,
                    (worstStatus.status.daysUsed / 90) * 100,
                  )}
                  sx={{
                    height: 6,
                    borderRadius: "100px",
                    bgcolor: tokens.mist,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: hasOverstay
                        ? tokens.red
                        : isApproaching
                          ? tokens.amber
                          : tokens.green,
                      borderRadius: "100px",
                    },
                  }}
                />

                {statusPerTraveler.length > 1 && (
                  <Typography
                    sx={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.68rem",
                      color: tokens.textGhost,
                      fontStyle: "italic",
                    }}
                  >
                    Showing most constrained traveler
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* ── Eligibility ───────────────────────────────────────────────── */}
          {isSchengen && statusPerTraveler.length > 0 && (
            <Box>
              <SectionHeading>Eligibility</SectionHeading>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {statusPerTraveler.map(({ traveler, rule, color }) => {
                  const label = !traveler.passportCode
                    ? "Set nationality to see requirements"
                    : rule.access === "free_movement"
                      ? "Free movement — no day limit"
                      : rule.access === "entitled"
                        ? "Visa-free, 90/180 rule"
                        : "Schengen visa required";
                  const labelColor =
                    !traveler.passportCode
                      ? tokens.textGhost
                      : rule.access === "visa_required"
                        ? tokens.red
                        : tokens.greenText;

                  return (
                    <Box
                      key={traveler.id}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        bgcolor: tokens.white,
                        borderRadius: "10px",
                        p: "12px",
                        border: `1px solid ${tokens.border}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: color,
                          flexShrink: 0,
                          mt: "4px",
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontFamily: tokens.fontBody,
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: tokens.navy,
                            mb: "2px",
                          }}
                        >
                          {traveler.name}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: tokens.fontBody,
                            fontSize: "0.75rem",
                            color: labelColor,
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Warnings ──────────────────────────────────────────────────── */}
          {(hasOverstay || isApproaching) && (
            <Box>
              <SectionHeading>Warnings</SectionHeading>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {hasOverstay && worstStatus && (
                  <Box
                    sx={{
                      bgcolor: tokens.redBg,
                      border: `1px solid ${alpha(tokens.red, 0.28)}`,
                      borderRadius: "10px",
                      p: "12px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <Typography sx={{ fontSize: "1rem", flexShrink: 0 }}>
                      ⚠️
                    </Typography>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: tokens.fontBody,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: tokens.red,
                          mb: "3px",
                        }}
                      >
                        Overstay —{" "}
                        {Math.abs(worstStatus.status.daysRemaining)} day
                        {Math.abs(worstStatus.status.daysRemaining) !== 1
                          ? "s"
                          : ""}{" "}
                        over limit
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: tokens.fontBody,
                          fontSize: "0.75rem",
                          color: tokens.redText,
                        }}
                      >
                        This trip exceeds the 90-day allowance in the 180-day
                        rolling window.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {isApproaching && worstStatus && (
                  <Box
                    sx={{
                      bgcolor: tokens.amberBg,
                      border: `1px solid ${alpha(tokens.amber, 0.28)}`,
                      borderRadius: "10px",
                      p: "12px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <Typography sx={{ fontSize: "1rem", flexShrink: 0 }}>
                      ⚠️
                    </Typography>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: tokens.fontBody,
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: tokens.amberText,
                          mb: "3px",
                        }}
                      >
                        Approaching limit —{" "}
                        {worstStatus.status.daysRemaining} day
                        {worstStatus.status.daysRemaining !== 1 ? "s" : ""}{" "}
                        remaining
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: tokens.fontBody,
                          fontSize: "0.75rem",
                          color: tokens.amberText,
                        }}
                      >
                        Close to the 90-day Schengen limit. Plan your exit date
                        carefully.
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
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
