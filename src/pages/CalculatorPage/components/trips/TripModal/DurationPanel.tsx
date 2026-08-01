import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { tokens } from "@/styles/theme";
import type { StayAssessment, ReentryRisk } from "@/features/calculator/utils/stayCalculator";
import { parseDate } from "@/features/calculator/utils/dates";

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtHintDate(iso: string): string {
  const d = parseDate(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

// ─── Entry constraint hint ─────────────────────────────────────────────────────
// Shown pre-exit (Schengen): "X days available · latest exit …". Rendered
// standalone by TripModal, so it survives the Duration Status panel gating.

export function EntryConstraintHint({
  entryConstraint,
  travelerCount,
}: {
  entryConstraint: { daysAvailable: number; latestExit: string };
  travelerCount: number;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "12px",
        py: "9px",
        bgcolor: tokens.mist,
        border: `1px solid ${tokens.border}`,
        borderRadius: "10px",
      }}
    >
      {entryConstraint.daysAvailable === 0 ? (
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.75rem",
            color: tokens.red,
            fontWeight: 600,
          }}
        >
          No days available — entry not possible on this date.
        </Typography>
      ) : (
        <>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              color: tokens.textSoft,
              fontWeight: 500,
            }}
          >
            {entryConstraint.daysAvailable === 1
              ? "1 day available"
              : `${entryConstraint.daysAvailable} days available`}
            {travelerCount > 1 && " (most constrained)"}
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              fontWeight: 700,
              color: tokens.navy,
              ml: "8px",
              whiteSpace: "nowrap",
            }}
          >
            Latest exit: {fmtHintDate(entryConstraint.latestExit)}
          </Typography>
        </>
      )}
    </Box>
  );
}

// ─── Per-visit detail (UK / Ireland) ───────────────────────────────────────────
// The stay assessment box + re-entry risk box shown for the most-constrained
// traveler. Rolling-window regions render ImpactPreview instead (handled by
// DurationStatusPanel).

export interface DurationPanelProps {
  stayAssessment: StayAssessment | null;
  reentryRisk: ReentryRisk | null;
}

export function DurationPanel({ stayAssessment, reentryRisk }: DurationPanelProps) {
  return (
    <>
      {stayAssessment && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            px: "12px",
            py: "9px",
            bgcolor:
              stayAssessment.variant === "danger"
                ? "rgba(220,38,38,0.06)"
                : stayAssessment.variant === "caution"
                  ? tokens.amberBg
                  : tokens.mist,
            border: `1px solid ${
              stayAssessment.variant === "danger"
                ? tokens.red
                : stayAssessment.variant === "caution"
                  ? tokens.amberBorder
                  : tokens.border
            }`,
            borderRadius: "10px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, fontWeight: 500 }}>
              {stayAssessment.variant === "danger" && stayAssessment.daysRemaining < 0
                ? `Over the ${stayAssessment.limitLabel} limit by ${Math.abs(stayAssessment.daysRemaining)} day${Math.abs(stayAssessment.daysRemaining) === 1 ? "" : "s"}`
                : `${stayAssessment.tripDays} day${stayAssessment.tripDays === 1 ? "" : "s"} of ${stayAssessment.limitLabel} visit`}
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: stayAssessment.variant === "danger" ? tokens.red : stayAssessment.variant === "caution" ? tokens.amberText : tokens.navy,
                whiteSpace: "nowrap",
              }}
            >
              Latest exit: {fmtHintDate(stayAssessment.maxExitDate)}
            </Typography>
          </Box>
          {stayAssessment.variant !== "safe" && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
              <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "1px", flexShrink: 0, color: stayAssessment.variant === "danger" ? tokens.red : tokens.amberText }} />
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: stayAssessment.variant === "danger" ? tokens.red : tokens.amberText, lineHeight: 1.4 }}>
                {stayAssessment.variant === "danger"
                  ? `This trip exceeds the ${stayAssessment.limitLabel} limit. Authorities may require you to leave or deny entry.`
                  : `Approaching the ${stayAssessment.limitLabel} limit. Plan an exit date before the deadline.`}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {reentryRisk && (() => {
        const isRed = reentryRisk.variant === "danger";
        const isAmber = reentryRisk.variant === "caution";
        const bg = isRed ? "rgba(220,38,38,0.06)" : isAmber ? tokens.amberBg : tokens.greenBg;
        const borderColor = isRed ? tokens.red : isAmber ? tokens.amberBorder : tokens.greenBorder;
        const textColor = isRed ? tokens.red : isAmber ? tokens.amberText : tokens.greenText;
        const heading = isRed
          ? "Re-entry after a maximum-duration stay — entry may be refused"
          : isAmber
            ? "Previous long stay on record"
            : "Previous stay noted";
        const body = isRed
          ? `Your last trip lasted ${reentryRisk.lastTripDays} days, exiting only ${reentryRisk.daysSinceExit} days ago. Immediate re-entry after a near-maximum stay is likely to attract scrutiny.`
          : isAmber
            ? `Your last trip lasted ${reentryRisk.lastTripDays} days. Officers may scrutinise this entry — carry evidence of ties to your home country and clear reasons for returning.`
            : `A previous trip of ${reentryRisk.lastTripDays} days is on record. This entry is unlikely to cause issues, but be ready to explain your travel pattern if asked.`;
        return (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "6px", px: "12px", py: "9px", bgcolor: bg, border: `1px solid ${borderColor}`, borderRadius: "10px" }}>
            <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "2px", flexShrink: 0, color: textColor }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: textColor }}>{heading}</Typography>
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, lineHeight: 1.4 }}>{body}</Typography>
            </Box>
          </Box>
        );
      })()}
    </>
  );
}
