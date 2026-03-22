import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { Trip } from "@/types";
import { VisaRegion } from "@/types";
import { parseDate } from "@/features/calculator/utils/dates";
import { format } from "date-fns";
import {
  SHOW_DATE_THRESHOLD,
  SHOW_BADGE_THRESHOLD,
} from "@/features/calculator/utils/timelineLayout";
import { isTripPlanned, isTripOngoing, fmtDateRange } from "../tripHelpers";
import {
  STATUS_SAFE_THRESHOLD,
  STATUS_CAUTION_THRESHOLD,
} from "../../travelers/travelerStatus";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantFromMaxStay(days: number): "safe" | "caution" | "danger" {
  if (days >= STATUS_SAFE_THRESHOLD) return "safe";
  if (days >= STATUS_CAUTION_THRESHOLD) return "caution";
  return "danger";
}

function fmtReEntry(iso: string): string {
  return format(parseDate(iso), "d MMM");
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TripBadge({
  children,
  color,
  bg,
  borderStyle = "solid",
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  borderStyle?: "solid" | "dashed";
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
        border: `1px solid ${color}22`,
        borderStyle,
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
  /**
   * Max stay available starting the day after this trip exits.
   * 0 means re-entry is not possible immediately after exit.
   */
  maxStayAtExit: number;
  /**
   * Earliest date re-entry becomes possible, when maxStayAtExit === 0.
   * Null if no re-entry is possible within the search horizon.
   */
  earliestReEntry: string | null;
  durationDays: number;
  cardLeft: number;
  cardWidth: number;
  baseZIndex: number;
  /**
   * When true the card renders with red styling to indicate that this trip
   * falls within an overstay period in the 90/180-day window.
   */
  isOverstay?: boolean;
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
 *   height >= SHOW_BADGE_THRESHOLD → adds region + availability badges
 *
 * Tooltip is shown whenever badges are hidden so detail is never lost.
 */
export function TimelineTripCard({
  trip,
  top,
  height,
  naturalHeight,
  maxStayAtExit,
  earliestReEntry,
  durationDays,
  cardLeft,
  cardWidth,
  baseZIndex,
  isOverstay = false,
  onEdit,
}: TimelineTripCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isExpanded = naturalHeight < height;
  const showSchengenChips = isSchengen && !isOngoing;

  // Display flags — derived from height, not a layout mode enum.
  const showDateRange = height >= SHOW_DATE_THRESHOLD;
  const showBadges = height >= SHOW_BADGE_THRESHOLD;

  // Overstay overrides accent and background colours.
  const accentColor = isOverstay
    ? tokens.red
    : isPlanned
      ? tokens.amber
      : isSchengen
        ? tokens.green
        : tokens.border;

  const cardBg = isOverstay
    ? tokens.redBg
    : isPlanned
      ? "#FDFCF8"
      : tokens.white;

  const cardBorderColor = isOverstay
    ? tokens.redBorder
    : isPlanned
      ? tokens.amberBorder
      : tokens.border;

  const destinationColor = isOverstay ? tokens.red : tokens.navy;

  // Region label + colours (only used when not overstay)
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

  // Availability chip colours
  const stayVariant = variantFromMaxStay(maxStayAtExit);
  const stayBg =
    stayVariant === "safe"
      ? tokens.greenBg
      : stayVariant === "caution"
        ? tokens.amberBg
        : tokens.redBg;
  const stayColor =
    stayVariant === "safe"
      ? tokens.greenText
      : stayVariant === "caution"
        ? tokens.amberText
        : tokens.redText;

  // Tooltip whenever badges aren't visible — ensures detail is never lost.
  const availText = showSchengenChips
    ? maxStayAtExit > 0
      ? `+${maxStayAtExit}d available after exit`
      : earliestReEntry
        ? `re-entry from ${fmtReEntry(earliestReEntry)}`
        : "no re-entry within horizon"
    : "";

  const tooltipLines = [
    isOverstay ? "⚠ Overstay — exceeds 90/180 days" : null,
    trip.destination || "—",
    fmtDateRange(trip.entryDate, trip.exitDate),
    `${durationDays}d · ${isOverstay ? "Overstay" : regionLabel}`,
    availText,
  ].filter(Boolean);

  const tooltipText = !showBadges ? tooltipLines.join("\n") : undefined;

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
        border: `1px solid ${cardBorderColor}`,
        borderStyle: isPlanned && !isOverstay ? "dashed" : "solid",
        bgcolor: cardBg,
        overflow: "hidden",
        cursor: "pointer",
        zIndex: hovered ? 50 : baseZIndex,
        boxShadow: hovered
          ? isOverstay
            ? "0 4px 14px rgba(239,68,68,0.18)"
            : "0 4px 14px rgba(12,30,60,0.09)"
          : isOverstay
            ? "0 1px 3px rgba(239,68,68,0.1)"
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
              color: destinationColor,
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
                color: isOverstay
                  ? tokens.redText
                  : isExpanded
                    ? tokens.textGhost
                    : tokens.textSoft,
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
              color: isOverstay ? tokens.redText : tokens.textSoft,
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

            {isOverstay ? (
              <TripBadge color={tokens.redText} bg={tokens.redBg}>
                ⚠ Overstay
              </TripBadge>
            ) : (
              <>
                <TripBadge color={regionColor} bg={regionBg}>
                  {regionLabel}
                </TripBadge>
                {showSchengenChips && maxStayAtExit > 0 && (
                  <TripBadge color={stayColor} bg={stayBg} borderStyle="dashed">
                    +{maxStayAtExit}d
                  </TripBadge>
                )}
                {showSchengenChips && maxStayAtExit === 0 && (
                  <TripBadge
                    color={tokens.redText}
                    bg={tokens.redBg}
                    borderStyle="dashed"
                  >
                    {earliestReEntry
                      ? `from ${fmtReEntry(earliestReEntry)}`
                      : "no re-entry"}
                  </TripBadge>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
