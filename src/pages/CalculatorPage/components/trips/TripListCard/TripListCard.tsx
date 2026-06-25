import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { tokens } from "@/styles/theme";
import type { Trip, PassportRule } from "@/types";
import { VisaRegion, isEntitled, isVisaRequired } from "@/types";
import { MobileAwareTooltip } from "@/components/ui/MobileAwareTooltip";
import { SchengenTooltipContent } from "@/components/ui/SchengenTooltipContent";
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
  CHIP_TOOLTIP_PLANNED,
  CHIP_TOOLTIP_ONGOING,
  CHIP_TOOLTIP_UNITED_KINGDOM,
  CHIP_TOOLTIP_IRELAND,
  CHIP_TOOLTIP_VISA_REQUIRED,
} from "@/features/calculator/utils/chipTooltips";
import {
  CHIP_TOOLTIP_SCHENGEN_AVAIL,
  CHIP_TOOLTIP_REENTRY_DATE,
  CHIP_TOOLTIP_NO_REENTRY,
  CHIP_TOOLTIP_OVERSTAY,
  CHIP_TOOLTIP_TRANSIT_VISA,
  CHIP_TOOLTIP_ETIAS,
} from "@/features/calculator/utils/schengen";
import {
  CHIP_TOOLTIP_UK_ETA,
  CHIP_TOOLTIP_UK_DATV,
  CHIP_TOOLTIP_UK_STAY_CAUTION,
  CHIP_TOOLTIP_UK_STAY_DANGER,
  CHIP_TOOLTIP_UK_REENTRY_DANGER,
  CHIP_TOOLTIP_UK_REENTRY_CAUTION,
  CHIP_TOOLTIP_UK_REENTRY_SAFE,
} from "@/features/calculator/utils/uk";
import {
  CHIP_TOOLTIP_IRELAND_STAY_CAUTION,
  CHIP_TOOLTIP_IRELAND_STAY_DANGER,
  CHIP_TOOLTIP_IRELAND_REENTRY_DANGER,
  CHIP_TOOLTIP_IRELAND_REENTRY_CAUTION,
  CHIP_TOOLTIP_IRELAND_REENTRY_SAFE,
} from "@/features/calculator/utils/ireland";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChipDef {
  rank: number;
  label: string;
  color: string;
  bg: string;
  borderStyle?: "solid" | "dashed";
  tooltip?: React.ReactNode;
}

interface PerVisitStayInfo {
  stayVariant: "safe" | "caution" | "danger";
  daysRemaining: number;
  reentryVariant?: "danger" | "caution" | "safe";
}

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
  tooltip?: React.ReactNode;
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
    <MobileAwareTooltip
      title={tooltip}
      placement="bottom"
      arrow
      enterDelay={300}
      componentsProps={{
        tooltip: {
          sx: {
            fontFamily: tokens.fontBody,
            fontSize: "0.72rem",
            fontWeight: 500,
            bgcolor: tokens.navy,
            "& .MuiTooltip-arrow": { color: tokens.navy },
            maxWidth: 320,
          },
        },
      }}
    >
      <span>{chip}</span>
    </MobileAwareTooltip>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TripListCardProps {
  trip: Trip;
  /**
   * Max stay available starting the day after this trip exits (Schengen).
   * 0 means re-entry is not possible immediately after exit.
   */
  maxStayAtExit: number;
  /**
   * Earliest Schengen re-entry date when maxStayAtExit === 0.
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
  /** Resolved Schengen passport rule for visa chips on Schengen trips. */
  passportRule?: PassportRule;
  /** Resolved UK passport rule for visa/ETA/DATV chips on UK trips. */
  ukPassportRule?: PassportRule;
  /** Resolved Ireland passport rule for visa chips on Ireland trips. */
  irelandPassportRule?: PassportRule;
  /** Stay assessment for UK per-visit trips. */
  ukStayInfo?: PerVisitStayInfo;
  /** Stay assessment for Ireland per-visit trips. */
  irelandStayInfo?: PerVisitStayInfo;
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
  ukPassportRule,
  irelandPassportRule,
  ukStayInfo,
  irelandStayInfo,
  onEdit,
}: TripListCardProps) {
  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isUK = trip.region === VisaRegion.UnitedKingdom;
  const isIreland = trip.region === VisaRegion.Ireland;
  const dur = tripDurationDays(trip.entryDate, trip.exitDate);
  const showSchengenChips = isSchengen && !isOngoing;

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

  // ── Ranked chip list ────────────────────────────────────────────────────────

  const chips: ChipDef[] = [];

  // ── Duration chip (rank 500) ─────────────────────────────────────────────
  chips.push({
    rank: 500,
    label: `${dur}d`,
    color: isOverstay ? tokens.redText : tokens.textSoft,
    bg: isOverstay ? tokens.redBg : tokens.mist,
    tooltip: CHIP_TOOLTIP_DURATION,
  });

  if (isOverstay) {
    // Overstay overrides the region chip and most status chips (rank 200)
    chips.push({
      rank: 200,
      label: "⚠ Overstay",
      color: tokens.redText,
      bg: tokens.redBg,
      tooltip: CHIP_TOOLTIP_OVERSTAY,
    });
  } else {
    // ── Region label chip (rank 400) ────────────────────────────────────────
    const regionLabel = isPlanned
      ? "Planned"
      : isOngoing
        ? "Ongoing"
        : isSchengen
          ? "Schengen"
          : isUK
            ? "United Kingdom"
            : isIreland
              ? "Ireland"
              : null;

    if (regionLabel) {
      const regionTooltip: React.ReactNode = isPlanned
        ? CHIP_TOOLTIP_PLANNED
        : isOngoing
          ? CHIP_TOOLTIP_ONGOING
          : isSchengen
            ? <SchengenTooltipContent />
            : isUK
              ? CHIP_TOOLTIP_UNITED_KINGDOM
              : isIreland
                ? CHIP_TOOLTIP_IRELAND
                : undefined;

      const regionBg = isPlanned ? tokens.amberBg : tokens.mist;
      const regionColor = isPlanned ? tokens.amberText : tokens.textSoft;

      chips.push({
        rank: 400,
        label: regionLabel,
        color: regionColor,
        bg: regionBg,
        tooltip: regionTooltip,
      });
    }

    // ── Schengen chips ──────────────────────────────────────────────────────
    if (showSchengenChips) {
      const stayVariant = variantFromMaxStay(maxStayAtExit);
      const stayBg =
        stayVariant === "safe" ? tokens.greenBg : stayVariant === "caution" ? tokens.amberBg : tokens.redBg;
      const stayColor =
        stayVariant === "safe" ? tokens.greenText : stayVariant === "caution" ? tokens.amberText : tokens.redText;

      if (maxStayAtExit > 0) {
        chips.push({
          rank: 330,
          label: `+${maxStayAtExit}d`,
          color: stayColor,
          bg: stayBg,
          borderStyle: "dashed",
          tooltip: CHIP_TOOLTIP_SCHENGEN_AVAIL,
        });
      } else {
        chips.push({
          rank: 310,
          label: earliestReEntry ? `from ${fmtReEntry(earliestReEntry)}` : "no re-entry",
          color: tokens.redText,
          bg: tokens.redBg,
          borderStyle: "dashed",
          tooltip: earliestReEntry ? CHIP_TOOLTIP_REENTRY_DATE : CHIP_TOOLTIP_NO_REENTRY,
        });
      }
    }

    if (isSchengen && passportRule) {
      if (passportRule.access === "visa_required") {
        chips.push({ rank: 100, label: "Visa required", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
      }
      if (isVisaRequired(passportRule) && passportRule.notes?.some(n => n.text.startsWith('Airport transit visa'))) {
        chips.push({ rank: 101, label: "Transit visa", color: tokens.white, bg: tokens.red, tooltip: CHIP_TOOLTIP_TRANSIT_VISA });
      }
      if (isEntitled(passportRule) && passportRule.entitlements.some(e => e.preAuth?.type === 'ETIAS')) {
        chips.push({ rank: 111, label: "ETIAS 2026", color: tokens.textSoft, bg: tokens.mist, tooltip: CHIP_TOOLTIP_ETIAS });
      }
    }

    // ── UK chips ────────────────────────────────────────────────────────────
    if (isUK && ukPassportRule) {
      if (ukPassportRule.access === "visa_required") {
        chips.push({ rank: 100, label: "Visa required", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
      }
      if (isVisaRequired(ukPassportRule) && ukPassportRule.notes?.some(n => n.text.includes('DATV'))) {
        chips.push({ rank: 101, label: "Transit visa", color: tokens.white, bg: tokens.red, tooltip: CHIP_TOOLTIP_UK_DATV });
      }
      if (isEntitled(ukPassportRule) && ukPassportRule.entitlements.some(e => e.preAuth?.type === 'ETA')) {
        chips.push({ rank: 110, label: "UK ETA", color: tokens.textSoft, bg: tokens.mist, tooltip: CHIP_TOOLTIP_UK_ETA });
      }
    }

    if (isUK && ukStayInfo && !isOngoing) {
      if (ukStayInfo.stayVariant === "danger") {
        chips.push({ rank: 300, label: "Over 6mo", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_UK_STAY_DANGER });
      } else if (ukStayInfo.stayVariant === "caution") {
        chips.push({ rank: 311, label: "~150d stay", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_UK_STAY_CAUTION });
      }
      if (ukStayInfo.reentryVariant === "danger") {
        chips.push({ rank: 210, label: "Re-entry risk", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_DANGER });
      } else if (ukStayInfo.reentryVariant === "caution") {
        chips.push({ rank: 320, label: "Prior long stay", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_CAUTION });
      } else if (ukStayInfo.reentryVariant === "safe") {
        chips.push({ rank: 331, label: "Prior stay", color: tokens.greenText, bg: tokens.greenBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_SAFE });
      }
    }

    // ── Ireland chips ────────────────────────────────────────────────────────
    if (isIreland && irelandPassportRule) {
      if (irelandPassportRule.access === "visa_required") {
        chips.push({ rank: 100, label: "Visa required", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
      }
    }

    if (isIreland && irelandStayInfo && !isOngoing) {
      if (irelandStayInfo.stayVariant === "danger") {
        chips.push({ rank: 300, label: "Over 90d", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_IRELAND_STAY_DANGER });
      } else if (irelandStayInfo.stayVariant === "caution") {
        chips.push({ rank: 311, label: "~75d stay", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_IRELAND_STAY_CAUTION });
      }
      if (irelandStayInfo.reentryVariant === "danger") {
        chips.push({ rank: 210, label: "Re-entry risk", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_IRELAND_REENTRY_DANGER });
      } else if (irelandStayInfo.reentryVariant === "caution") {
        chips.push({ rank: 320, label: "Prior long stay", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_IRELAND_REENTRY_CAUTION });
      } else if (irelandStayInfo.reentryVariant === "safe") {
        chips.push({ rank: 331, label: "Prior stay", color: tokens.greenText, bg: tokens.greenBg, tooltip: CHIP_TOOLTIP_IRELAND_REENTRY_SAFE });
      }
    }
  }

  chips.sort((a, b) => a.rank - b.rank);

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
      <Box sx={{ px: "12px", pt: "8px", pb: "10px", minWidth: 0, overflow: "hidden" }}>
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
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {fmtDateRange(trip.entryDate, trip.exitDate)}
        </Typography>

        {/* Chips — sorted by rank */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
          {chips.map((chip, i) => (
            <Chip
              key={i}
              color={chip.color}
              bg={chip.bg}
              borderStyle={chip.borderStyle}
              tooltip={chip.tooltip}
            >
              {chip.label}
            </Chip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
