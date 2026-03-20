import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Traveler } from "@/types";
import { TravelerStatus } from "../travelerStatus";
import {
  AVAILABLE_DAYS_DESCRIPTION,
  MAX_STAY_DESCRIPTION,
} from "@/features/calculator/utils/schengenConstants";

interface TravelerColumnHeaderProps {
  traveler: Traveler;
  status: TravelerStatus;
  /**
   * Longest single trip startable today, accounting for historical days aging
   * out of the window. Distinct from status.daysRemaining.
   */
  maxStay: number;
  /**
   * When true the header uses a two-row layout:
   *   Row A — traveler name (flex:1) + delete button (always opposite the name)
   *   Row B — status chips
   *
   * This flag comes from CardsView and is the same for every column, so the
   * transition always fires simultaneously across all headers.
   */
  compact?: boolean;
  onDelete: () => void;
  sx?: object;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtWindowDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TravelerColumnHeader({
  traveler,
  status,
  maxStay,
  compact = false,
  onDelete,
  sx = {},
}: TravelerColumnHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { daysUsed, daysRemaining, variant } = status;
  const tripCount = traveler.trips?.length ?? 0;
  const fillPct = Math.min(100, (daysUsed / 90) * 100);

  const barColor =
    variant === "safe"
      ? tokens.green
      : variant === "caution"
        ? tokens.amber
        : tokens.red;

  const handleDeleteClick = () => {
    if (tripCount === 0) onDelete();
    else setConfirmingDelete(true);
  };
  const handleConfirmDelete = () => {
    setConfirmingDelete(false);
    onDelete();
  };
  const handleCancelDelete = () => setConfirmingDelete(false);

  // The delete button is always on the same row as the traveler name (right-aligned).
  // Its opacity is 0 when not hovered so it takes up space but remains invisible.
  const deleteButton = (
    <Box
      component="button"
      onClick={handleDeleteClick}
      aria-label={`Remove ${traveler.name}`}
      sx={{
        flexShrink: 0,
        width: 22,
        height: 22,
        border: "none",
        borderRadius: "4px",
        bgcolor: "transparent",
        color: tokens.textGhost,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.7rem",
        lineHeight: 1,
        transition: "opacity 0.14s, background-color 0.14s, color 0.14s",
        opacity: hovered && !confirmingDelete ? 1 : 0,
        "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
      }}
    >
      ✕
    </Box>
  );

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: tokens.offWhite,
        px: "14px",
        pt: "12px",
        pb: confirmingDelete ? "10px" : "12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative",
        zIndex: 4,
        ...sx,
      }}
    >
      {/*
       * ── Name row (always Row A) ────────────────────────────────────────
       *
       * The delete button lives here in both modes so it is always visually
       * opposite the traveler name.
       */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            lineHeight: 1,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {traveler.name}
        </Typography>

        {/*
         * Normal mode: badges between name and delete on the same row.
         * Compact mode: badges are rendered separately below; only the delete
         * button stays here so it remains opposite the name.
         */}
        {!compact && (
          <>
            <StatusBadge
              variant={variant}
              label={`${daysRemaining}d avail`}
              tooltip={AVAILABLE_DAYS_DESCRIPTION}
            />
            <StatusBadge
              variant={maxStay > daysRemaining ? "safe" : variant}
              label={`${maxStay}d max`}
              tooltip={MAX_STAY_DESCRIPTION}
            />
          </>
        )}

        {deleteButton}
      </Box>

      {/*
       * ── Badges row (compact mode only, Row B) ─────────────────────────
       *
       * Rendered below the name row when there isn't room for everything on
       * one line.
       */}
      {compact && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <StatusBadge
            variant={variant}
            label={`${daysRemaining}d avail`}
            tooltip={AVAILABLE_DAYS_DESCRIPTION}
          />
          <StatusBadge
            variant={maxStay > daysRemaining ? "safe" : variant}
            label={`${maxStay}d max`}
            tooltip={MAX_STAY_DESCRIPTION}
          />
        </Box>
      )}

      {/*
       * ── Schengen usage info ───────────────────────────────────────────
       *
       * Normal: label and date string on the same row (space-between).
       * Compact: date string wraps below the label in a smaller, lighter
       *   weight so it doesn't compete for horizontal space.
       */}
      {compact ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tokens.textGhost,
            }}
          >
            Schengen
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.62rem",
              fontWeight: 500,
              color: tokens.textGhost,
              lineHeight: 1.35,
            }}
          >
            {daysUsed}/90 used since {fmtWindowDate(status.windowStart)}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "6px",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tokens.textGhost,
            }}
          >
            Schengen
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 600,
              color: tokens.textSoft,
              whiteSpace: "nowrap",
            }}
          >
            {daysUsed}/90 used since {fmtWindowDate(status.windowStart)}
          </Typography>
        </Box>
      )}

      {/* ── Progress bar ──────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 3,
          bgcolor: tokens.border,
          borderRadius: "100px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${fillPct}%`,
            bgcolor: barColor,
            borderRadius: "100px",
            transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </Box>

      {/* ── Delete confirmation strip ──────────────────────────────────── */}
      {confirmingDelete && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            mt: "2px",
            pt: "10px",
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              fontWeight: 500,
              color: tokens.text,
              flex: 1,
            }}
          >
            Remove {traveler.name} and their {tripCount} trip
            {tripCount !== 1 ? "s" : ""}?
          </Typography>
          <Box
            component="button"
            onClick={handleCancelDelete}
            sx={{
              border: `1px solid ${tokens.border}`,
              borderRadius: "6px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 600,
              px: "10px",
              py: "4px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": { bgcolor: tokens.border, color: tokens.text },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={handleConfirmDelete}
            sx={{
              border: `1px solid ${tokens.redBorder}`,
              borderRadius: "6px",
              bgcolor: tokens.redBg,
              color: tokens.redText,
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              px: "10px",
              py: "4px",
              cursor: "pointer",
              transition: "all 0.12s",
              "&:hover": {
                bgcolor: tokens.red,
                color: "#fff",
                borderColor: tokens.red,
              },
            }}
          >
            Remove
          </Box>
        </Box>
      )}
    </Box>
  );
}
