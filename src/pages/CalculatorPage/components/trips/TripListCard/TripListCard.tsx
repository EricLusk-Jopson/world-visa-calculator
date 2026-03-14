import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { Trip } from "@/types";
import { VisaRegion } from "@/types";
import { TravelerStatus } from "../../travelers/travelerStatus";
import {
  isTripPlanned,
  isTripOngoing,
  tripDurationDays,
  fmtDateRange,
} from "../tripHelpers";

interface TripListCardProps {
  trip: Trip;
  /** Allowance at trip exit, used for the "Xd left" chip on Schengen trips. */
  statusAtExit: TravelerStatus;
  onEdit: () => void;
}

function Chip({
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
        textTransform: "uppercase" as const,
        letterSpacing: "0.04em",
        px: "7px",
        py: "2px",
        borderRadius: "100px",
        bgcolor: bg,
        color,
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Vertical list card used in the Cards view.
 * Distinct from the landing page TripCard — uses a top accent stripe,
 * not a left bar.
 */
export function TripListCard({
  trip,
  statusAtExit,
  onEdit,
}: TripListCardProps) {
  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const dur = tripDurationDays(trip.entryDate, trip.exitDate);

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

  const stripeColor = isPlanned
    ? tokens.amber
    : isSchengen
      ? tokens.green
      : tokens.border;

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
      sx={{
        minHeight: "88px",
        position: "relative",
        borderRadius: "10px",
        border: `1px solid ${isPlanned ? tokens.amberBorder : tokens.border}`,
        borderStyle: isPlanned ? "dashed" : "solid",
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(12,30,60,0.06)",
        transition: "box-shadow 0.15s, transform 0.12s",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(12,30,60,0.09)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Top accent stripe */}
      <Box sx={{ height: 3, bgcolor: stripeColor }} />

      {/* Body */}
      <Box sx={{ px: "12px", pt: "8px", pb: "10px" }}>
        {/* Destination */}
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.88rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            lineHeight: 1.25,
            mb: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {trip.destination || "—"}
        </Typography>

        {/* Date range */}
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            color: tokens.textSoft,
            fontWeight: 500,
            mb: "8px",
          }}
        >
          {fmtDateRange(trip.entryDate, trip.exitDate)}
        </Typography>

        {/* Badges */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <Chip color={tokens.textSoft} bg={tokens.mist}>
            {dur}d
          </Chip>
          <Chip color={regionColor} bg={regionBg}>
            {regionLabel}
          </Chip>
          {isSchengen && (
            <Chip color={remainingColor} bg={remainingBg}>
              {statusAtExit.daysRemaining}d left
            </Chip>
          )}
        </Box>
      </Box>
    </Box>
  );
}
