import { useState } from "react";
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
import type { Traveler } from "@/types";
import { parseDate } from "@/features/calculator/utils/dates";
import { computeTravelerStatus } from "../travelers/travelerStatus";
import { getSchengenRule } from "@/data/regions/schengen";
import { getCountryName } from "../travelers/NationalitySelector";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";

interface TravelerViewSliderProps {
  open: boolean;
  traveler: Traveler | null;
  color: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join("");
}

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

export function TravelerViewSlider({
  open,
  traveler,
  color,
  onClose,
  onEdit,
  onDelete,
}: TravelerViewSliderProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!traveler) return null;

  const tripCount = traveler.trips.length;
  const access = traveler.passportCode
    ? getSchengenRule(traveler.passportCode).access
    : "unknown";

  const status = computeTravelerStatus(traveler);
  const daysUsed = status.daysUsed;
  const daysRemaining = status.daysRemaining;
  const fillPct = Math.min(100, (Math.max(0, daysUsed) / 90) * 100);
  const windowStartFmt = status.windowStart
    ? format(parseDate(status.windowStart), "d MMM")
    : null;
  const remColor =
    status.variant === "danger"
      ? tokens.red
      : status.variant === "caution"
        ? tokens.amber
        : tokens.green;

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
        onClick={onEdit}
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
        Edit Traveler
      </Box>
    </Box>
  );

  return (
    <>
      <FullScreenSlider
        open={open}
        onClose={onClose}
        title="Traveler"
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
          {/* ── Header ───────────────────────────────────────────────────── */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <Box
                sx={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: color,
                  flexShrink: 0,
                }}
              />
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
                {traveler.name}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.85rem",
                fontWeight: 500,
                color: traveler.passportCode ? tokens.textSoft : tokens.textGhost,
                pl: "20px",
              }}
            >
              {traveler.passportCode
                ? `${countryFlag(traveler.passportCode)} ${getCountryName(traveler.passportCode)}`
                : "No nationality set"}
              {tripCount > 0
                ? ` · ${tripCount} trip${tripCount === 1 ? "" : "s"}`
                : ""}
            </Typography>
          </Box>

          {/* ── Schengen allowance ───────────────────────────────────────── */}
          <Box>
            <SectionHeading>Schengen Allowance</SectionHeading>
            <Box
              sx={{
                bgcolor: tokens.white,
                borderRadius: "12px",
                p: "16px",
                border: `1px solid ${tokens.border}`,
              }}
            >
              {access === "entitled" ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box>
                      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, mb: "2px" }}>
                        Days used in window
                      </Typography>
                      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "1.6rem", fontWeight: 700, color: tokens.navy, lineHeight: 1 }}>
                        {daysUsed}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, mb: "2px" }}>
                        Days remaining
                      </Typography>
                      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "1.6rem", fontWeight: 700, color: remColor, lineHeight: 1 }}>
                        {daysRemaining}
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={fillPct}
                    sx={{
                      height: 6,
                      borderRadius: "100px",
                      bgcolor: tokens.mist,
                      "& .MuiLinearProgress-bar": { bgcolor: remColor, borderRadius: "100px" },
                    }}
                  />
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.68rem", color: tokens.textGhost, fontStyle: "italic" }}>
                    {daysUsed > 0
                      ? `90-day allowance in the rolling 180-day window${windowStartFmt ? `, since ${windowStartFmt}` : ""}.`
                      : "No Schengen days used yet."}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.82rem", color: tokens.textSoft, lineHeight: 1.5 }}>
                  {access === "free_movement"
                    ? "Free movement — no 90/180-day limit applies to this passport."
                    : access === "visa_required"
                      ? "A Schengen visa is required; the day allowance depends on the visa granted."
                      : "Set a nationality to see this traveler's Schengen allowance."}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </FullScreenSlider>

      {/* Delete confirmation */}
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
          Delete {traveler.name}?
        </DialogTitle>
        <DialogContent sx={{ pb: "8px" }}>
          <Typography sx={{ fontSize: "0.83rem", color: tokens.textSoft }}>
            {tripCount > 0
              ? `This will permanently delete ${tripCount} trip${tripCount === 1 ? "" : "s"} for ${traveler.name}. `
              : ""}
            This cannot be undone.
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
              onDelete();
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
