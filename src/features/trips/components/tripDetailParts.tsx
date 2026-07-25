import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { tokens } from "@/styles/theme";
import { ImpactPreview } from "@/components/ui";
import { type DurationState } from "@/components/ui/DurationIcon";
import { parseDate } from "@/features/calculator/utils/dates";
import type { EligibilityNote } from "@/pages/CalculatorPage/components/trips/tripEligibility";
import type { TravelerDuration } from "@/pages/CalculatorPage/components/trips/tripDuration";

/**
 * Shared presentational parts for the per-traveler eligibility + duration
 * detail, used by both the mobile detail frame (MobileTripDetailFrame) and the
 * desktop trip modal's inline sections (TripDetailSections). Keeping them here
 * guarantees identical wording and value labelling across platforms.
 */

export const VARIANT_CHIP = {
  safe: {
    bg: tokens.greenBg,
    border: tokens.greenBorder,
    text: tokens.greenText,
  },
  caution: {
    bg: tokens.amberBg,
    border: tokens.amberBorder,
    text: tokens.amberText,
  },
  danger: { bg: tokens.redBg, border: tokens.redBorder, text: tokens.redText },
} as const;

export function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parseDate(iso));
}

/** Days a tracked trip is over its allowance (0 when within the limit). */
export function overstayDays(dur?: TravelerDuration): number {
  if (!dur || !dur.tracked) return 0;
  if (dur.assessment)
    return dur.assessment.daysRemaining < 0 ? -dur.assessment.daysRemaining : 0;
  if (dur.rollingStatus)
    return Math.max(0, dur.rollingStatus.daysUsed - dur.rollingStatus.maxDays);
  return 0;
}

/** The status icon for a traveler's stay duration (mobile + desktop share this). */
export function durStateFor(dur: TravelerDuration | undefined): DurationState {
  return !dur
    ? "pending"
    : !dur.tracked
      ? "untracked"
      : dur.overstay
        ? "overstay"
        : dur.severity;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontFamily: tokens.fontBody,
        fontSize: "0.62rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: tokens.textGhost,
      }}
    >
      {children}
    </Typography>
  );
}

export function InfoRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "12px",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: tokens.textSoft,
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.8rem",
          fontWeight: valueColor ? 600 : 400,
          color: valueColor ?? tokens.text,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function NoteBlock({ note }: { note: EligibilityNote }) {
  return (
    <Box
      sx={{
        bgcolor: tokens.mist,
        borderRadius: "8px",
        px: "10px",
        py: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <SectionLabel>{note.label}</SectionLabel>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.76rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
        }}
      >
        {note.text}
      </Typography>
      {note.source && (
        <Box
          component="a"
          href={note.source.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            color: tokens.navy,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Source ↗
        </Box>
      )}
    </Box>
  );
}

export function EqRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "8px",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.74rem",
          color: tokens.textSoft,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.78rem",
          fontWeight: 600,
          color: tokens.navy,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function WarningBlock({
  variant,
  text,
}: {
  variant: "caution" | "danger";
  text: string;
}) {
  const c = VARIANT_CHIP[variant];
  return (
    <Box
      sx={{
        display: "flex",
        gap: "6px",
        alignItems: "flex-start",
        bgcolor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "8px",
        px: "10px",
        py: "8px",
      }}
    >
      <WarningAmberIcon
        sx={{ fontSize: "0.9rem", color: c.text, mt: "1px", flexShrink: 0 }}
      />
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.75rem",
          color: c.text,
          lineHeight: 1.45,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

// ─── Duration section ─────────────────────────────────────────────────────────

export function DurationSection({
  dur,
  entryDate,
  exitDate,
}: {
  dur: TravelerDuration | undefined;
  entryDate: string;
  exitDate: string;
}) {
  if (!dur || !entryDate || !exitDate) {
    return (
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.76rem",
          color: tokens.textGhost,
          fontStyle: "italic",
        }}
      >
        Add trip dates to see stay duration.
      </Typography>
    );
  }

  if (!dur.tracked) {
    return (
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.78rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
        }}
      >
        {dur.note}
      </Typography>
    );
  }

  // Rolling window — full ImpactPreview breakdown (the calculation the user likes).
  if (dur.rollingStatus) {
    return (
      <ImpactPreview
        daysRemaining={dur.rollingStatus.daysRemaining}
        daysUsed={dur.rollingStatus.daysUsed}
        variant={dur.variant}
        maxDays={dur.rollingStatus.maxDays}
        breakdown={dur.rollingBreakdown}
        travelerImpacts={[
          {
            id: dur.id,
            name: dur.name,
            color: dur.color,
            daysRemaining: dur.rollingStatus.daysRemaining,
            daysUsed: dur.rollingStatus.daysUsed,
          },
        ]}
        currentTripEntry={entryDate}
        currentTripExit={exitDate || undefined}
      />
    );
  }

  // Per-visit summary + warnings.
  const a = dur.assessment;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {a && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            bgcolor: tokens.mist,
            borderRadius: "8px",
            px: "10px",
            py: "9px",
          }}
        >
          <EqRow
            label="This trip"
            value={`${a.tripDays} of ${a.limitLabel} visit`}
          />
          <EqRow
            label={a.daysRemaining >= 0 ? "Days remaining" : "Over by"}
            value={`${Math.abs(a.daysRemaining)}d`}
          />
          <EqRow label="Latest exit" value={fmtDate(a.maxExitDate)} />
        </Box>
      )}
      {a && a.variant !== "safe" && (
        <WarningBlock
          variant={a.variant}
          text={
            a.variant === "danger"
              ? `This trip exceeds the ${a.limitLabel} limit. Authorities may require you to leave or deny entry.`
              : `Approaching the ${a.limitLabel} limit. Plan an exit before the deadline.`
          }
        />
      )}
      {dur.reentry && dur.reentry.variant !== "safe" && (
        <WarningBlock
          variant={dur.reentry.variant}
          text={
            dur.reentry.variant === "danger"
              ? `Last trip lasted ${dur.reentry.lastTripDays} days, exiting only ${dur.reentry.daysSinceExit} days ago. Immediate re-entry after a near-maximum stay is likely to attract scrutiny.`
              : `Last trip lasted ${dur.reentry.lastTripDays} days. Officers may scrutinise this entry — carry evidence of ties to your home country.`
          }
        />
      )}
    </Box>
  );
}
