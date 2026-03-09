import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { Trip } from "@/types";
import { VisaRegion } from "@/types";
import type { CardLayoutMode } from "@/features/calculator/utils/timelineLayout";
import { TravelerStatus } from "../../travelers/travelerStatus";
import { isTripPlanned, isTripOngoing, fmtDateRange } from "../tripHelpers";

// ─── Sub-component ────────────────────────────────────────────────────────────

function TripBadge({
  children,
  color,
  bg,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        fontFamily: tokens.fontBody,
        fontSize: "0.6rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        px: "7px",
        py: "2px",
        borderRadius: "100px",
        bgcolor: bg,
        color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimelineTripCardProps {
  trip: Trip;
  top: number;
  /** Rendered (clamped) height in pixels. */
  height: number;
  /** Natural height (durationDays × PX_PER_DAY) — used for tooltip context. */
  naturalHeight: number;
  statusAtExit: TravelerStatus;
  durationDays: number;
  /**
   * Layout density, computed by the parent from rendered vs threshold heights.
   *
   * - "pill"    — 32–47px: single line (destination · Xd), tooltip for detail.
   * - "compact" — 48–63px: destination + date range line + duration badge.
   * - "full"    — 64px+  : full card with all badges.
   */
  layoutMode: CardLayoutMode;
  /**
   * Base z-index derived from entry date rank (later entry = higher value).
   * Card bumps to 50 on hover so it always reads above neighbours.
   */
  baseZIndex: number;
  onEdit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Absolutely positioned trip card in the timeline view.
 *
 * Purely presentational — all layout/z-index decisions are computed by
 * TravelerTimelineColumn and passed in as props.
 *
 * Three layout modes handle the fact that short trips are expanded to
 * CARD_MIN_HEIGHT. The "pill" mode discloses the true duration via a "· Xd"
 * suffix and exposes full detail through a native title tooltip.
 */
export function TimelineTripCard({
  trip,
  top,
  height,
  naturalHeight,
  statusAtExit,
  durationDays,
  layoutMode,
  baseZIndex,
  onEdit,
}: TimelineTripCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isExpanded = naturalHeight < height; // min-height is in play

  // Accent colour
  const accentColor = isPlanned
    ? tokens.amber
    : isSchengen
      ? tokens.green
      : tokens.border;

  // Region label + colours
  const regionLabel = isPlanned
    ? "Planned"
    : isOngoing
      ? "Ongoing"
      : isSchengen
        ? "Schengen"
        : "Elsewhere";
  const regionBg = isPlanned
    ? tokens.amberBg
    : isSchengen
      ? tokens.greenBg
      : tokens.mist;
  const regionColor = isPlanned
    ? tokens.amberText
    : isSchengen
      ? tokens.greenText
      : tokens.textSoft;

  // Remaining days chip
  const remainingBg =
    statusAtExit.variant === "safe"
      ? tokens.greenBg
      : statusAtExit.variant === "caution"
        ? tokens.amberBg
        : tokens.redBg;
  const remainingColor =
    statusAtExit.variant === "safe"
      ? tokens.greenText
      : statusAtExit.variant === "caution"
        ? tokens.amberText
        : tokens.redText;

  // Tooltip shown in pill/compact modes so detail is never truly hidden.
  const tooltipText = [
    trip.destination || "—",
    fmtDateRange(trip.entryDate, trip.exitDate),
    `${durationDays}d · ${regionLabel}`,
    isSchengen ? `${statusAtExit.daysRemaining}d remaining` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Box
      title={layoutMode !== "full" ? tooltipText : undefined}
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "absolute",
        left: "20px",
        right: "10px",
        top,
        height,
        borderRadius: "8px",
        border: `1px solid ${isPlanned ? tokens.amberBorder : tokens.border}`,
        borderStyle: isPlanned ? "dashed" : "solid",
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        overflow: "hidden",
        cursor: "pointer",
        // Later entry = higher base z; hover bumps to 50 (above all siblings).
        zIndex: hovered ? 50 : baseZIndex,
        boxShadow: hovered
          ? "0 4px 14px rgba(12,30,60,0.09)"
          : "0 1px 3px rgba(12,30,60,0.06)",
        transform: hovered ? "translateX(2px)" : "none",
        transition: "box-shadow 0.12s, transform 0.12s, z-index 0s",
        display: "flex",
        flexDirection: "column",
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
          borderRadius: "8px 0 0 8px",
          flexShrink: 0,
        }}
      />

      {/* ── Pill layout (32–47px) ──────────────────────────────────────────
          Single line: destination (truncated) + "· Xd" duration hint.
          The hint discloses that the card is visually expanded.
          Full detail is available via the native title tooltip.
      ─────────────────────────────────────────────────────────────────── */}
      {layoutMode === "pill" && (
        <Box
          sx={{
            pl: "10px",
            pr: "8px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.78rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
              lineHeight: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: "1 1 0",
              minWidth: 0,
            }}
          >
            {trip.destination || "—"}
          </Typography>
          {/* Duration hint — always shown in pill mode so the visual lie is disclosed */}
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.6rem",
              fontWeight: 700,
              color: isExpanded ? tokens.textGhost : tokens.textSoft,
              lineHeight: 1,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            · {durationDays}d
          </Typography>
        </Box>
      )}

      {/* ── Compact layout (48–63px) ───────────────────────────────────────
          Destination on first line; date range + duration badge on second.
          No region/status badges (not enough room).
      ─────────────────────────────────────────────────────────────────── */}
      {layoutMode === "compact" && (
        <Box
          sx={{
            pl: "10px",
            pr: "8px",
            pt: "6px",
            pb: "5px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.82rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {trip.destination || "—"}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.65rem",
                color: tokens.textSoft,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: "1 1 0",
                minWidth: 0,
              }}
            >
              {fmtDateRange(trip.entryDate, trip.exitDate)}
            </Typography>
            <TripBadge color={tokens.textSoft} bg={tokens.mist}>
              {durationDays}d
            </TripBadge>
          </Box>
        </Box>
      )}

      {/* ── Full layout (64px+) ────────────────────────────────────────────
          Destination + date range + all badges + hover edit bar.
      ─────────────────────────────────────────────────────────────────── */}
      {layoutMode === "full" && (
        <>
          <Box
            sx={{
              pl: "10px",
              pr: "8px",
              pt: "7px",
              pb: "6px",
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontDisplay,
                fontSize: "0.88rem",
                fontStyle: "italic",
                fontWeight: 400,
                color: tokens.navy,
                lineHeight: 1.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {trip.destination || "—"}
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.7rem",
                color: tokens.textSoft,
                fontWeight: 500,
                mt: "2px",
                mb: "7px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {fmtDateRange(trip.entryDate, trip.exitDate)}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexWrap: "wrap",
              }}
            >
              <TripBadge color={tokens.textSoft} bg={tokens.mist}>
                {durationDays}d
              </TripBadge>
              <TripBadge color={regionColor} bg={regionBg}>
                {regionLabel}
              </TripBadge>
              {isSchengen && (
                <TripBadge color={remainingColor} bg={remainingBg}>
                  {statusAtExit.daysRemaining}d left
                </TripBadge>
              )}
            </Box>
          </Box>

          {hovered && (
            <Box
              sx={{
                px: "8px",
                py: "4px",
                borderTop: `1px solid ${tokens.mist}`,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                bgcolor: "rgba(255,255,255,0.96)",
                flexShrink: 0,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.64rem",
                  fontWeight: 600,
                  px: "8px",
                  py: "3px",
                  borderRadius: "5px",
                  bgcolor: tokens.mist,
                  color: tokens.textSoft,
                  cursor: "pointer",
                  "&:hover": { bgcolor: tokens.navy, color: "#fff" },
                }}
              >
                Edit
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
