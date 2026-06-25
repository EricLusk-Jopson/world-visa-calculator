import { useState, useRef, useLayoutEffect } from "react";
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
  SHOW_DATE_THRESHOLD,
  SHOW_BADGE_THRESHOLD,
  CARD_PADDING_V,
  BADGE_CONTENT_ABOVE,
  CHIP_ROW_HEIGHT,
  CHIP_ROW_GAP,
} from "@/features/calculator/utils/timelineLayout";
import { isTripPlanned, isTripOngoing, fmtDateRange } from "../tripHelpers";
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
  return format(parseDate(iso), "d MMM");
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TripBadge({
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
  const badge = (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
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
      {tooltip && (
        <InfoOutlinedIcon sx={{ fontSize: "0.6rem", opacity: 0.6, flexShrink: 0 }} />
      )}
    </Box>
  );

  if (!tooltip) return badge;

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
      <span>{badge}</span>
    </MobileAwareTooltip>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimelineTripCardProps {
  trip: Trip;
  top: number;
  height: number;
  naturalHeight: number;
  /**
   * Max Schengen stay available starting the day after this trip exits.
   * 0 means re-entry is not possible immediately after exit.
   */
  maxStayAtExit: number;
  /**
   * Earliest Schengen re-entry date when maxStayAtExit === 0.
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
  /**
   * When true the left accent bar is rendered in green — used for the currently
   * ongoing trip or the next upcoming trip when no trip is ongoing.
   */
  isHighlighted?: boolean;
  /** Resolved Schengen passport rule for visa/ETIAS chips on Schengen trips. */
  passportRule?: PassportRule;
  /** Resolved UK passport rule for ETA/DATV/visa chips on UK trips. */
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
  isHighlighted = false,
  passportRule,
  ukPassportRule,
  irelandPassportRule,
  ukStayInfo,
  irelandStayInfo,
  onEdit,
}: TimelineTripCardProps) {
  const [hovered, setHovered] = useState(false);

  const badgeRowRef = useRef<HTMLDivElement>(null);

  const isPlanned = isTripPlanned(trip);
  const isOngoing = isTripOngoing(trip);
  const isSchengen = trip.region === VisaRegion.Schengen;
  const isUK = trip.region === VisaRegion.UnitedKingdom;
  const isIreland = trip.region === VisaRegion.Ireland;
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

  const destinationColor = isOverstay ? tokens.red : tokens.navy;

  // ── Ranked chip list ──────────────────────────────────────────────────────

  const chips: ChipDef[] = [];

  chips.push({
    rank: 500,
    label: `${durationDays}d`,
    color: isOverstay ? tokens.redText : tokens.textSoft,
    bg: isOverstay ? tokens.redBg : tokens.mist,
    tooltip: CHIP_TOOLTIP_DURATION,
  });

  if (isOverstay) {
    chips.push({
      rank: 200,
      label: "⚠ Overstay",
      color: tokens.redText,
      bg: tokens.redBg,
      tooltip: CHIP_TOOLTIP_OVERSTAY,
    });
  } else {
    // Region label chip (rank 400)
    const regionLabel = isOngoing
      ? "Ongoing"
      : isSchengen
        ? "Schengen"
        : isUK
          ? "United Kingdom"
          : isIreland
            ? "Ireland"
            : null;

    if (regionLabel) {
      const regionTooltip: React.ReactNode = isOngoing
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
        rank: isPlanned ? 401 : 400,
        label: isPlanned ? "Planned" : regionLabel,
        color: regionColor,
        bg: regionBg,
        tooltip: isPlanned ? CHIP_TOOLTIP_PLANNED : regionTooltip,
      });
    }

    // Schengen chips
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
        chips.push({ rank: 100, label: "Visa req.", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
      }
      if (isVisaRequired(passportRule) && passportRule.notes?.some(n => n.text.startsWith('Airport transit visa'))) {
        chips.push({ rank: 101, label: "Transit visa", color: tokens.white, bg: tokens.red, tooltip: CHIP_TOOLTIP_TRANSIT_VISA });
      }
      if (isEntitled(passportRule) && passportRule.entitlements.some(e => e.preAuth?.type === 'ETIAS')) {
        chips.push({ rank: 111, label: "ETIAS 2026", color: tokens.textSoft, bg: tokens.mist, tooltip: CHIP_TOOLTIP_ETIAS });
      }
    }

    // UK chips
    if (isUK && ukPassportRule) {
      if (ukPassportRule.access === "visa_required") {
        chips.push({ rank: 100, label: "Visa req.", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
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
        chips.push({ rank: 311, label: "~150d", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_UK_STAY_CAUTION });
      }
      if (ukStayInfo.reentryVariant === "danger") {
        chips.push({ rank: 210, label: "Re-entry risk", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_DANGER });
      } else if (ukStayInfo.reentryVariant === "caution") {
        chips.push({ rank: 320, label: "Prior long stay", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_CAUTION });
      } else if (ukStayInfo.reentryVariant === "safe") {
        chips.push({ rank: 331, label: "Prior stay", color: tokens.greenText, bg: tokens.greenBg, tooltip: CHIP_TOOLTIP_UK_REENTRY_SAFE });
      }
    }

    // Ireland chips
    if (isIreland && irelandPassportRule) {
      if (irelandPassportRule.access === "visa_required") {
        chips.push({ rank: 100, label: "Visa req.", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_VISA_REQUIRED });
      }
    }

    if (isIreland && irelandStayInfo && !isOngoing) {
      if (irelandStayInfo.stayVariant === "danger") {
        chips.push({ rank: 300, label: "Over 90d", color: tokens.redText, bg: tokens.redBg, tooltip: CHIP_TOOLTIP_IRELAND_STAY_DANGER });
      } else if (irelandStayInfo.stayVariant === "caution") {
        chips.push({ rank: 311, label: "~75d", color: tokens.amberText, bg: tokens.amberBg, tooltip: CHIP_TOOLTIP_IRELAND_STAY_CAUTION });
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
    `${durationDays}d · ${isOverstay ? "Overstay" : isSchengen ? "Schengen" : isUK ? "UK" : isIreland ? "Ireland" : "—"}`,
    availText,
  ].filter(Boolean);

  const tooltipText = !showBadges ? tooltipLines.join("\n") : undefined;

  // Greedy chip-visibility pass: hide any chip that would overflow the badge row.
  useLayoutEffect(() => {
    const container = badgeRowRef.current;
    if (!container) return;

    const children = Array.from(container.children) as HTMLElement[];
    children.forEach((c) => (c.style.display = ""));

    if (!showBadges) return;

    const containerWidth = container.clientWidth;
    const availableForBadges = height - BADGE_CONTENT_ABOVE - CARD_PADDING_V;
    const maxRows = Math.max(
      1,
      Math.floor(
        (availableForBadges + CHIP_ROW_GAP) / (CHIP_ROW_HEIGHT + CHIP_ROW_GAP),
      ),
    );

    let currentRow = 0;
    let rowUsedWidth = 0;
    let overflow = false;

    for (const child of children) {
      if (overflow) {
        child.style.display = "none";
        continue;
      }

      const chipWidth = child.offsetWidth;
      const needed =
        rowUsedWidth === 0 ? chipWidth : rowUsedWidth + CHIP_ROW_GAP + chipWidth;

      if (needed <= containerWidth) {
        rowUsedWidth = needed;
      } else if (currentRow + 1 < maxRows) {
        currentRow++;
        rowUsedWidth = chipWidth;
      } else {
        overflow = true;
        child.style.display = "none";
      }
    }
  }, [
    showBadges,
    height,
    cardWidth,
    durationDays,
    isOverstay,
    showSchengenChips,
    maxStayAtExit,
    earliestReEntry,
    passportRule,
    ukPassportRule,
    irelandPassportRule?.access,
    ukStayInfo?.stayVariant,
    ukStayInfo?.reentryVariant,
    irelandStayInfo?.stayVariant,
    irelandStayInfo?.reentryVariant,
  ]);

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
          pt: showDateRange ? `${CARD_PADDING_V}px` : 0,
          pb: showDateRange ? `${CARD_PADDING_V}px` : 0,
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

        {/* Badge row — shown at SHOW_BADGE_THRESHOLD, chips sorted by rank */}
        {showBadges && (
          <Box
            ref={badgeRowRef}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: "4px",
              flexWrap: "wrap",
              overflow: "hidden",
              mt: "2px",
            }}
          >
            {chips.map((chip, i) => (
              <TripBadge
                key={i}
                color={chip.color}
                bg={chip.bg}
                borderStyle={chip.borderStyle}
                tooltip={chip.tooltip}
              >
                {chip.label}
              </TripBadge>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
