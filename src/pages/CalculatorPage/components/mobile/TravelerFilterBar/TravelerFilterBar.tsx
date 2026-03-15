import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { alpha } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { Traveler } from "@/types";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import { parseDate } from "@/features/calculator/utils/dates";
import { format } from "date-fns";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";

interface TravelerFilterBarProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onToggleTraveler: (id: string) => void;
  onDeleteTraveler: (id: string) => void;
}

type StatusLevel = "safe" | "caution" | "danger" | "neutral";

function getStatusLevel(daysRemaining: number | null): StatusLevel {
  if (daysRemaining === null) return "neutral";
  if (daysRemaining > 29) return "safe";
  if (daysRemaining > 9) return "caution";
  return "danger";
}

const STATUS_COLORS: Record<
  StatusLevel,
  { bg: string; border: string; text: string; bar: string }
> = {
  safe: {
    bg: tokens.greenBg,
    border: alpha(tokens.green, 0.22),
    text: tokens.greenText,
    bar: tokens.green,
  },
  caution: {
    bg: tokens.amberBg,
    border: alpha(tokens.amber, 0.22),
    text: tokens.amberText,
    bar: tokens.amber,
  },
  danger: {
    bg: tokens.redBg,
    border: alpha(tokens.red, 0.22),
    text: tokens.redText,
    bar: tokens.red,
  },
  neutral: {
    bg: tokens.mist,
    border: tokens.border,
    text: tokens.textSoft,
    bar: tokens.border,
  },
};

const ICON_BTN_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  border: "none",
  bgcolor: "transparent",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
  flexShrink: 0,
} as const;

export function TravelerFilterBar({
  travelers,
  hiddenTravelerIds,
  onToggleTraveler,
  onDeleteTraveler,
}: TravelerFilterBarProps) {
  const [open, setOpen] = useState(true);

  if (travelers.length === 0) return null;

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: tokens.white,
        borderBottom: `1px solid ${tokens.border}`,
        borderRadius: 0, // ← no rounding; flush with nav above
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {/* ── Collapse toggle ───────────────────────────────────────────────── */}
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "16px",
          py: "7px",
          border: "none",
          bgcolor: "transparent",
          cursor: "pointer",
          "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
        }}
      >
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: tokens.textGhost,
            flex: 1,
            textAlign: "left",
          }}
        >
          Travelers
        </Typography>

        <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {travelers.map((t, i) => (
            <Box
              key={t.id}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: hiddenTravelerIds.includes(t.id)
                  ? tokens.border
                  : getTravelerColor(i),
              }}
            />
          ))}
        </Box>

        {open ? (
          <ExpandLessIcon
            sx={{ fontSize: "0.9rem", color: tokens.textGhost }}
          />
        ) : (
          <ExpandMoreIcon
            sx={{ fontSize: "0.9rem", color: tokens.textGhost }}
          />
        )}
      </Box>

      {/* ── Traveler rows ─────────────────────────────────────────────────── */}
      <Collapse in={open}>
        {travelers.map((traveler, i) => {
          const status = computeTravelerStatus(traveler);
          const color = getTravelerColor(i);
          const hidden = hiddenTravelerIds.includes(traveler.id);
          const level = getStatusLevel(status.daysRemaining);
          const sc = STATUS_COLORS[level];
          const daysUsed =
            status.daysRemaining !== null ? 90 - status.daysRemaining : 0;
          const fillPct = Math.min(100, (Math.max(0, daysUsed) / 90) * 100);
          const windowStartFmt = status.windowStart
            ? format(parseDate(status.windowStart), "MMM d")
            : null;

          return (
            <Box
              key={traveler.id}
              sx={{
                borderTop: `1px solid ${tokens.border}`,
                opacity: hidden ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  px: "14px",
                  pt: "10px",
                  pb: "6px",
                }}
              >
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: hidden ? tokens.border : color,
                    flexShrink: 0,
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: tokens.fontDisplay,
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: hidden ? tokens.textGhost : tokens.navy,
                    lineHeight: 1,
                  }}
                >
                  {traveler.name}
                </Typography>

                {status.daysRemaining !== null && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.66rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      px: "9px",
                      py: "3px",
                      borderRadius: "100px",
                      bgcolor: sc.bg,
                      color: sc.text,
                      border: `1px solid ${sc.border}`,
                      lineHeight: 1.4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        bgcolor: sc.bar,
                        flexShrink: 0,
                      }}
                    />
                    {status.daysRemaining}d left
                  </Box>
                )}

                <Box sx={{ flex: 1 }} />

                <Box
                  component="button"
                  onClick={() => onToggleTraveler(traveler.id)}
                  sx={{
                    ...ICON_BTN_SX,
                    color: hidden ? tokens.textGhost : tokens.textSoft,
                    "&:active": {
                      bgcolor: alpha(tokens.navy, 0.06),
                      color: tokens.navy,
                    },
                  }}
                >
                  {hidden ? (
                    <VisibilityOffIcon sx={{ fontSize: "1rem" }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: "1rem" }} />
                  )}
                </Box>

                <Box
                  component="button"
                  onClick={() => onDeleteTraveler(traveler.id)}
                  sx={{
                    ...ICON_BTN_SX,
                    color: tokens.textGhost,
                    "&:active": {
                      bgcolor: alpha(tokens.red, 0.08),
                      color: tokens.red,
                    },
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: "1rem" }} />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  px: "14px",
                  pb: "10px",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    height: 3,
                    bgcolor: tokens.mist,
                    borderRadius: "100px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${fillPct}%`,
                      bgcolor: hidden ? tokens.border : sc.bar,
                      borderRadius: "100px",
                      transition: "width 0.3s ease-out",
                    }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    color: tokens.textSoft,
                    whiteSpace: "nowrap",
                  }}
                >
                  {status.daysRemaining !== null
                    ? `${daysUsed}/90${windowStartFmt ? ` since ${windowStartFmt}` : ""}`
                    : "No trips yet"}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Collapse>
    </Box>
  );
}
