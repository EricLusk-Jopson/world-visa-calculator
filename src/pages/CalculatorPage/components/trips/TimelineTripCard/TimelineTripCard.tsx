import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { Trip } from "@/types";
import { VisaRegion } from "@/types";
import { PX_PER_DAY } from "@/features/calculator/utils/timelineLayout";
import { TravelerStatus } from "../../travelers/travelerStatus";
import { isTripPlanned, isTripOngoing, fmtDateRange } from "../tripHelpers";

// Pixel threshold: below this height we suppress some content to avoid crowding
const COMPACT_THRESHOLD = PX_PER_DAY * 3; // < 3 days → compact
const MINI_THRESHOLD = PX_PER_DAY * 1.5; // < 1.5 days → just a bar

interface TimelineTripCardProps {
  trip: Trip;
  /** Pixel offset from the top of the timeline column body. */
  top: number;
  /** Pixel height of the card. */
  height: number;
  /** Allowance status computed at the trip's exit date (for the "Xd left" chip). */
  statusAtExit: TravelerStatus;
  /** Duration in calendar days. */
  durationDays: number;
  onEdit: () => void;
}

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
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Absolutely positioned trip card in the timeline view.
 * Adjusts content density based on available height.
 */
export function TimelineTripCard({
  trip,
  top,
  height,
  statusAtExit,
  durationDays,
  onEdit,
}: TimelineTripCardProps) {
  const [hovered, setHovered] = useState(false);

  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;

  const isCompact = height < COMPACT_THRESHOLD;
  const isMini = height < MINI_THRESHOLD;

  // Accent colour based on trip state
  const accentColor = isPlanned
    ? tokens.amber
    : isSchengen
      ? tokens.green
      : tokens.border;

  // Region badge
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

  // Remaining days chip colour
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

  return (
    <Box
      onClick={onEdit}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: "absolute",
        left: "20px",
        right: "10px",
        top,
        height,
        borderRadius: "10px",
        border: `1px solid ${isPlanned ? tokens.amberBorder : tokens.border}`,
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        borderStyle: isPlanned ? "dashed" : "solid",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? "0 4px 14px rgba(12,30,60,0.09)"
          : "0 1px 3px rgba(12,30,60,0.06)",
        transform: hovered ? "translateX(2px)" : "none",
        transition: "all 0.12s cubic-bezier(0.16,1,0.3,1)",
        display: "flex",
        flexDirection: "column",
        zIndex: 2,
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
          borderRadius: "10px 0 0 10px",
        }}
      />

      {!isMini && (
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
          {/* Destination */}
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

          {/* Date range — hidden when compact */}
          {!isCompact && (
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
          )}

          {/* Badges — hidden when compact */}
          {!isCompact && (
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
          )}
        </Box>
      )}

      {/* Hover action bar */}
      {hovered && !isMini && (
        <Box
          sx={{
            px: "8px",
            py: "4px",
            borderTop: `1px solid ${tokens.mist}`,
            display: "flex",
            alignItems: "center",
            gap: "4px",
            bgcolor: "rgba(255,255,255,0.96)",
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
    </Box>
  );
}
