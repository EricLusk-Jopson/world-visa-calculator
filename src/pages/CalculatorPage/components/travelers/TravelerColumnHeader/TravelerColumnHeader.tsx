import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Traveler } from "@/types";
import { TravelerStatus } from "../travelerStatus";

interface TravelerColumnHeaderProps {
  traveler: Traveler;
  status: TravelerStatus;
  onDelete: () => void;
  sx?: object;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO date string as "4 Sep 2024" for compact display. */
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

/**
 * Shared column header used in both the Timeline and Cards views.
 *
 * Changes from previous version:
 *  1. Delete button is in the flex flow (not absolutely positioned), so it
 *     can never overlap the status badge. Space is always reserved; the button
 *     fades in on hover via opacity.
 *  2. Progress bar now shows temporal context: "Schengen" label, "X/90 used
 *     · as of today" count, and (when windowStart is provided) date flankers
 *     below the bar marking the window boundaries.
 *  3. Deletion requires confirmation when the traveler has existing trips
 *     (tripCount > 0). An inline strip replaces the header content until the
 *     user confirms or cancels. Zero-trip deletion remains immediate.
 */
export function TravelerColumnHeader({
  traveler,
  status,
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

  // ── Delete handling ─────────────────────────────────────────────────────────

  const handleDeleteClick = () => {
    if (tripCount === 0) {
      // No trips — delete immediately, no confirmation needed.
      onDelete();
    } else {
      setConfirmingDelete(true);
    }
  };

  const handleConfirmDelete = () => {
    setConfirmingDelete(false);
    onDelete();
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        // Don't cancel confirmingDelete on mouse-leave — user needs to be
        // able to move to the confirm/cancel buttons.
      }}
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
      {/* ── Row 1: Name · StatusBadge · Delete (in flow, no absolute) ────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minWidth: 0,
        }}
      >
        {/* Name */}
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

        {/* Status badge */}
        <StatusBadge
          variant={variant}
          label={`${daysRemaining} days left`}
          sx={{ flexShrink: 0 }}
        />

        {/* Delete button — in flow so it never overlaps the badge.
            Width is always reserved; opacity controls visibility. */}
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
            // Keep it tabbable even when hidden so keyboard users can reach it.
            // Pointer events still fire so the hover logic works correctly.
            "&:hover": {
              bgcolor: tokens.redBg,
              color: tokens.red,
            },
          }}
        >
          ✕
        </Box>
      </Box>

      {/* ── Row 2: Schengen label + days count ──────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        {/* "Schengen" — makes it explicit which allowance this bar tracks */}
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

        {/* Days count with temporal anchor */}
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.68rem",
            fontWeight: 600,
            color: tokens.textSoft,
            whiteSpace: "nowrap",
          }}
        >
          {daysUsed}/90 days used since {fmtWindowDate(status.windowStart)}
        </Typography>
      </Box>

      {/* ── Row 3: Progress bar ─────────────────────────────────────────── */}
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

      {/* ── Delete confirmation strip ────────────────────────────────────── */}
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

          {/* Cancel */}
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
              "&:hover": {
                bgcolor: tokens.border,
                color: tokens.text,
              },
            }}
          >
            Cancel
          </Box>

          {/* Confirm remove */}
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
