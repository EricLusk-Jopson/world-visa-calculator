import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { Trip } from "@/types";
import { VisaRegion } from "@/types";
import {
  SHOW_DATE_THRESHOLD,
  SHOW_BADGE_THRESHOLD,
} from "@/features/calculator/utils/timelineLayout";
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
  height: number;
  naturalHeight: number;
  statusAtExit: TravelerStatus;
  durationDays: number;
  cardLeft: number;
  cardWidth: number;
  baseZIndex: number;
  onEdit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Absolutely positioned trip card in the timeline view.
 *
 * Content is derived directly from rendered height against two named thresholds
 * from timelineLayout.ts — no layoutMode enum, no separate render blocks.
 *
 *   height < SHOW_DATE_THRESHOLD  → destination + duration suffix only
 *   height >= SHOW_DATE_THRESHOLD → adds date range line; duration moves to badge
 *   height >= SHOW_BADGE_THRESHOLD → adds region + remaining-days badges
 *
 * Tooltip is shown whenever badges are hidden so detail is never lost.
 */
export function TimelineTripCard({
  trip,
  top,
  height,
  naturalHeight,
  statusAtExit,
  durationDays,
  cardLeft,
  cardWidth,
  baseZIndex,
  onEdit,
}: TimelineTripCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isExpanded = naturalHeight < height;

  // Display flags — derived from height, not a layout mode enum.
  const showDateRange = height >= SHOW_DATE_THRESHOLD;
  const showBadges = height >= SHOW_BADGE_THRESHOLD;

  // Accent colour
  const accentColor = isPlanned
    ? tokens.amber
    : isSchengen
      ? tokens.green
      : tokens.border;

  // Region label + colours
  const regionLabel = isOngoing
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

  // Remaining days chip colours
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

  // Tooltip whenever badges aren't visible — ensures detail is never lost.
  const tooltipText = !showBadges
    ? [
        trip.destination || "—",
        fmtDateRange(trip.entryDate, trip.exitDate),
        `${durationDays}d · ${regionLabel}`,
        isSchengen ? `${statusAtExit.daysRemaining}d remaining` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : undefined;

  return (
    <Box
      title={tooltipText}
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "absolute",
        left: cardLeft,
        width: cardWidth,
        top,
        height,
        borderRadius: "8px",
        border: `1px solid ${isPlanned ? tokens.amberBorder : tokens.border}`,
        borderStyle: isPlanned ? "dashed" : "solid",
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        overflow: "hidden",
        cursor: "pointer",
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
        }}
      />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          pl: "10px",
          pr: "8px",
          pt: showDateRange ? "6px" : 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: showDateRange ? "flex-start" : "center",
          gap: "3px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Destination — always visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            overflow: "hidden",
          }}
        >
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.8rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: "1 1 0",
              minWidth: 0,
            }}
          >
            {trip.destination || "—"}
          </Typography>

          {/* Duration suffix — only when date range line is hidden */}
          {!showDateRange && (
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
          )}
        </Box>

        {/* Date range — shown at SHOW_DATE_THRESHOLD */}
        {showDateRange && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.65rem",
              color: tokens.textSoft,
              fontWeight: 500,
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fmtDateRange(trip.entryDate, trip.exitDate)}
          </Typography>
        )}

        {/* Badge row — shown at SHOW_BADGE_THRESHOLD */}
        {showBadges && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "nowrap",
              overflow: "hidden",
              mt: "2px",
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
        )}
      </Box>
    </Box>
  );
}
