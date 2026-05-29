import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { tokens } from "@/styles/theme";
import type { Trip, PassportRule } from "@/types";
import { VisaRegion } from "@/types";
import { parseDate } from "@/features/calculator/utils/dates";
import { format } from "date-fns";
import {
  isTripPlanned,
  isTripOngoing,
  tripDurationDays,
  fmtDateRange,
} from "../tripHelpers";
import {
  CHIP_TOOLTIP_DURATION,
  CHIP_TOOLTIP_SCHENGEN_AVAIL,
  CHIP_TOOLTIP_REENTRY_DATE,
  CHIP_TOOLTIP_NO_REENTRY,
  CHIP_TOOLTIP_PLANNED,
  CHIP_TOOLTIP_ONGOING,
  CHIP_TOOLTIP_OVERSTAY,
  CHIP_TOOLTIP_UNITED_KINGDOM,
  CHIP_TOOLTIP_IRELAND,
  CHIP_TOOLTIP_VISA_REQUIRED,
  CHIP_TOOLTIP_TRANSIT_VISA,
  CHIP_TOOLTIP_ETIAS,
  CHIP_TOOLTIP_SUSPENDED,
} from "@/features/calculator/utils/chipTooltips";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function variantFromMaxStay(days: number): "safe" | "caution" | "danger" {
  if (days > 29) return "safe";
  if (days > 9) return "caution";
  return "danger";
}

function fmtReEntry(iso: string): string {
  return format(parseDate(iso), "d MMM yyyy");
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function Chip({
  children,
  color,
  bg,
  borderStyle = "solid",
  tooltip,
}: {
  children: React.ReactNode;
  color: string;
  bg: string;
  borderStyle?: "solid" | "dashed";
  tooltip?: string;
}) {
  const chip = (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
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
        border: `1px solid ${color}22`,
        borderStyle,
        whiteSpace: "nowrap" as const,
      }}
    >
      {children}
      {tooltip && (
        <InfoOutlinedIcon sx={{ fontSize: "0.6rem", opacity: 0.6, flexShrink: 0 }} />
      )}
    </Box>
  );

  if (!tooltip) return chip;

  return (
    <Tooltip
      title={tooltip}
      placement="top"
      arrow
      enterDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            fontFamily: tokens.fontBody,
            fontSize: "0.72rem",
            fontWeight: 500,
            bgcolor: tokens.navy,
            "& .MuiTooltip-arrow": { color: tokens.navy },
            maxWidth: 240,
          },
        },
      }}
    >
      {chip}
    </Tooltip>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TripListCardProps {
  trip: Trip;
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
  /**
   * When true the card renders with red background/text to indicate that
   * this trip overlaps an overstay in the 90/180-day window.
   */
  isOverstay?: boolean;
  /**
   * When true the top stripe is rendered in green — used for the currently
   * ongoing trip or the next upcoming trip when no trip is ongoing.
   */
  isHighlighted?: boolean;
  /**
   * Resolved Schengen passport rule for the traveler who owns this card.
   * When provided and the trip is Schengen, visa-requirement chips are shown.
   */
  passportRule?: PassportRule;
  onEdit: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TripListCard({
  trip,
  maxStayAtExit,
  earliestReEntry,
  isOverstay = false,
  isHighlighted = false,
  passportRule,
  onEdit,
}: TripListCardProps) {
  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isUK = trip.region === VisaRegion.UnitedKingdom;
  const isIreland = trip.region === VisaRegion.Ireland;
  const dur = tripDurationDays(trip.entryDate, trip.exitDate);
  const showSchengenChips = isSchengen && !isOngoing;

  // Region label — no "Elsewhere" chip; UK/Ireland get their real name
  const regionLabel = isOverstay
    ? "Overstay"
    : isPlanned
      ? "Planned"
      : isOngoing
        ? "Ongoing"
        : isSchengen
          ? "Schengen"
          : isUK
            ? "United Kingdom"
            : isIreland
              ? "Ireland"
              : null; // Elsewhere → no chip

  const regionTooltip = isOverstay
    ? CHIP_TOOLTIP_OVERSTAY
    : isPlanned
      ? CHIP_TOOLTIP_PLANNED
      : isOngoing
        ? CHIP_TOOLTIP_ONGOING
        : isUK
          ? CHIP_TOOLTIP_UNITED_KINGDOM
          : isIreland
            ? CHIP_TOOLTIP_IRELAND
            : undefined;

  const regionBg = isOverstay
    ? tokens.redBg
    : isPlanned
      ? tokens.amberBg
      : isSchengen
        ? tokens.greenBg
        : tokens.mist;

  const regionColor = isOverstay
    ? tokens.redText
    : isPlanned
      ? tokens.amberText
      : isSchengen
        ? tokens.greenText
        : tokens.textSoft;

  const stripeColor = isOverstay
    ? tokens.red
    : isPlanned
      ? tokens.amber
      : isHighlighted
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
  const cardBorderStyle = isPlanned && !isOverstay ? "dashed" : "solid";

  const destinationColor = isOverstay ? tokens.red : tokens.navy;

  // Max stay chip colours
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

  return (
    <Box
      onClick={onEdit}
      sx={{
        minHeight: "88px",
        position: "relative",
        borderRadius: "10px",
        border: `1px solid ${cardBorderColor}`,
        borderStyle: cardBorderStyle,
        bgcolor: cardBg,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: isOverstay
          ? `0 1px 3px rgba(239,68,68,0.12)`
          : "0 1px 3px rgba(12,30,60,0.06)",
        transition: "box-shadow 0.15s, transform 0.12s",
        "&:hover": {
          boxShadow: isOverstay
            ? "0 4px 14px rgba(239,68,68,0.18)"
            : "0 4px 14px rgba(12,30,60,0.09)",
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
            fontWeight: isOverstay ? 500 : 400,
            color: destinationColor,
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
            color: isOverstay ? tokens.redText : tokens.textSoft,
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
          {/* Duration */}
          <Chip color={tokens.textSoft} bg={tokens.mist} tooltip={CHIP_TOOLTIP_DURATION}>
            {dur}d
          </Chip>

          {/* Region / overstay label — suppressed for plain Elsewhere */}
          {regionLabel && (
            <Chip color={regionColor} bg={regionBg} tooltip={regionTooltip}>
              {isOverstay ? "⚠ Overstay" : regionLabel}
            </Chip>
          )}

          {/* Schengen availability — dashed, status-coloured. Hidden when overstay. */}
          {!isOverstay && showSchengenChips && maxStayAtExit > 0 && (
            <Chip color={stayColor} bg={stayBg} borderStyle="dashed" tooltip={CHIP_TOOLTIP_SCHENGEN_AVAIL}>
              +{maxStayAtExit}d
            </Chip>
          )}

          {!isOverstay && showSchengenChips && maxStayAtExit === 0 && (
            <Chip
              color={tokens.redText}
              bg={tokens.redBg}
              borderStyle="dashed"
              tooltip={earliestReEntry ? CHIP_TOOLTIP_REENTRY_DATE : CHIP_TOOLTIP_NO_REENTRY}
            >
              {earliestReEntry
                ? `from ${fmtReEntry(earliestReEntry)}`
                : "no re-entry"}
            </Chip>
          )}

          {/* Passport rule chips — Schengen trips only */}
          {isSchengen && !isOverstay && passportRule && (
            <>
              {passportRule.access === "visa_required" && (
                <Chip color={tokens.redText} bg={tokens.redBg} tooltip={CHIP_TOOLTIP_VISA_REQUIRED}>
                  Visa required
                </Chip>
              )}
              {passportRule.requiresATV && (
                <Chip color={tokens.white} bg={tokens.red} tooltip={CHIP_TOOLTIP_TRANSIT_VISA}>
                  Transit visa
                </Chip>
              )}
              {passportRule.requiresETIAS && (
                <Chip color={tokens.navy} bg={tokens.mist} tooltip={CHIP_TOOLTIP_ETIAS}>
                  ETIAS 2026
                </Chip>
              )}
              {passportRule.access === "suspended" && (
                <Chip color={tokens.amberText} bg={tokens.amberBg} tooltip={CHIP_TOOLTIP_SUSPENDED}>
                  Suspended
                </Chip>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
