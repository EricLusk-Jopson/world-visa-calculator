import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { alpha } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { tokens } from "@/styles/theme";
import type { Traveler } from "@/types";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import { getCountryName } from "../../travelers/NationalitySelector";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TravelerFilterBarProps {
  travelers: Traveler[];
  hiddenTravelerIds: string[];
  onToggleTraveler: (id: string) => void;
  /** Open the full-screen traveler frame for this traveler. */
  onOpenTraveler: (id: string) => void;
  onAddTraveler: () => void;
}

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join("");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelerFilterBar({
  travelers,
  hiddenTravelerIds,
  onToggleTraveler,
  onOpenTraveler,
  onAddTraveler,
}: TravelerFilterBarProps) {
  const [open, setOpen] = useState(false);

  if (travelers.length === 0) {
    return (
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: tokens.white,
          borderBottom: `1px solid ${tokens.border}`,
          zIndex: 5,
        }}
      >
        <Box
          component="button"
          onClick={onAddTraveler}
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            px: "16px",
            py: "12px",
            border: "none",
            bgcolor: "transparent",
            cursor: "pointer",
            color: tokens.textSoft,
            fontFamily: tokens.fontBody,
            fontSize: "0.82rem",
            fontWeight: 600,
            "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
          }}
        >
          <PersonAddAlt1Icon sx={{ fontSize: "1rem" }} />
          Add Traveler
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        bgcolor: tokens.white,
        borderBottom: `1px solid ${tokens.border}`,
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {/* ── Collapse toggle ─────────────────────────────────────────────── */}
      <Box
        component="button"
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "16px",
          py: "11px",
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

        {/* Traveler dots — compact visibility summary when collapsed */}
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
          <ExpandLessIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />
        )}
      </Box>

      {/* ── Traveler rows ──────────────────────────────────────────────── */}
      {/* Cap the expanded list at ~half the screen and scroll beyond that. */}
      <Collapse in={open}>
        <Box sx={{ maxHeight: "50vh", overflowY: "auto" }}>
        {travelers.map((traveler, i) => {
          const color = getTravelerColor(i);
          const hidden = hiddenTravelerIds.includes(traveler.id);

          return (
            <Box
              key={traveler.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenTraveler(traveler.id)}
              aria-label={`Open ${traveler.name}`}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                px: "14px",
                py: "11px",
                borderTop: `1px solid ${tokens.border}`,
                opacity: hidden ? 0.5 : 1,
                transition: "opacity 0.15s",
                cursor: "pointer",
                "&:active": { bgcolor: alpha(tokens.navy, 0.04) },
              }}
            >
              {/* Colour dot */}
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: hidden ? tokens.border : color,
                  flexShrink: 0,
                }}
              />

              {/* Flag */}
              {traveler.passportCode && (
                <Typography
                  component="span"
                  sx={{ fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}
                  aria-hidden="true"
                >
                  {countryFlag(traveler.passportCode)}
                </Typography>
              )}

              {/* Name + nationality */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: tokens.fontDisplay,
                    fontSize: "1.05rem",
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: hidden ? tokens.textGhost : tokens.navy,
                    lineHeight: 1.15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {traveler.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.68rem",
                    color: tokens.textGhost,
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {traveler.passportCode
                    ? getCountryName(traveler.passportCode)
                    : "Nationality not set"}
                </Typography>
              </Box>

              {/* Visibility toggle — stops the row's open-frame click */}
              <Box
                component="button"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onToggleTraveler(traveler.id);
                }}
                aria-label={`${hidden ? "Show" : "Hide"} ${traveler.name}`}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  border: "none",
                  borderRadius: "6px",
                  bgcolor: "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  color: hidden ? tokens.textGhost : tokens.textSoft,
                  "&:active": { bgcolor: alpha(tokens.navy, 0.06), color: tokens.navy },
                }}
              >
                {hidden ? (
                  <VisibilityOffIcon sx={{ fontSize: "1.05rem" }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: "1.05rem" }} />
                )}
              </Box>

              {/* Carat — affordance for opening the traveler frame */}
              <ChevronRightIcon sx={{ fontSize: "1.3rem", color: tokens.textGhost, flexShrink: 0 }} />
            </Box>
          );
        })}
        </Box>
      </Collapse>
    </Box>
  );
}
