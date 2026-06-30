import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import { ImpactPreview } from "@/components/ui";
import type { TravelerImpact } from "../../ImpactPreview/ImpactPreview";
import type { TravelerStatus, ImpactBreakdown } from "../../travelers/travelerStatus";
import type { UKStayAssessment, UKReentryRisk } from "@/features/calculator/utils/uk";
import type { IrelandStayAssessment, IrelandReentryRisk } from "@/features/calculator/utils/ireland";
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

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DurationPanelProps {
  region: VisaRegion;
  entryDate: string;
  exitDate: string;
  ongoing: boolean;
  travelerCount: number;
  // Schengen
  entryConstraint: { daysAvailable: number; latestExit: string } | null;
  impactStatus: TravelerStatus | null;
  impactVariant: "safe" | "caution" | "danger" | "neutral";
  impactBreakdown: ImpactBreakdown | undefined;
  travelerImpacts: TravelerImpact[] | undefined;
  hasVisaFreeTravelers: boolean;
  // UK
  ukMaxStay: UKStayAssessment | null;
  ukReentryRisk: UKReentryRisk | null;
  // Ireland
  irelandMaxStay: IrelandStayAssessment | null;
  irelandReentryRisk: IrelandReentryRisk | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DurationPanel({
  region,
  entryDate,
  exitDate,
  ongoing,
  travelerCount,
  entryConstraint,
  impactStatus,
  impactVariant,
  impactBreakdown,
  travelerImpacts,
  hasVisaFreeTravelers,
  ukMaxStay,
  ukReentryRisk,
  irelandMaxStay,
  irelandReentryRisk,
}: DurationPanelProps) {
  const resolvedExit = ongoing ? undefined : exitDate || undefined;

  return (
    <>
      {/* Entry constraint hint */}
      {entryConstraint && (
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
      )}

      {/* Impact preview */}
      {region === VisaRegion.Schengen &&
        entryDate &&
        (exitDate || ongoing) &&
        impactStatus &&
        hasVisaFreeTravelers && (
          <ImpactPreview
            daysRemaining={impactStatus.daysRemaining}
            daysUsed={impactStatus.daysUsed}
            variant={impactVariant}
            breakdown={impactBreakdown}
            travelerImpacts={travelerImpacts}
            currentTripEntry={entryDate}
            currentTripExit={resolvedExit}
          />
        )}

      {/* Visa-required disclaimer — shown when no visa-free travelers are selected */}
      {region === VisaRegion.Schengen &&
        !hasVisaFreeTravelers &&
        entryDate &&
        (exitDate || ongoing) && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              fontStyle: "italic",
              color: tokens.textGhost,
              px: "20px",
              pb: "12px",
            }}
          >
            Day tracking isn't available yet for Schengen visa holders as allowances depend on the specific visa granted.
          </Typography>
        )}

      {/* UK max-stay warning */}
      {ukMaxStay && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            px: "12px",
            py: "9px",
            bgcolor:
              ukMaxStay.variant === "danger"
                ? "rgba(220,38,38,0.06)"
                : ukMaxStay.variant === "caution"
                  ? tokens.amberBg
                  : tokens.mist,
            border: `1px solid ${
              ukMaxStay.variant === "danger"
                ? tokens.red
                : ukMaxStay.variant === "caution"
                  ? tokens.amberBorder
                  : tokens.border
            }`,
            borderRadius: "10px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, fontWeight: 500 }}>
              {ukMaxStay.variant === "danger" && ukMaxStay.daysRemaining < 0
                ? `Over the 6-month limit by ${Math.abs(ukMaxStay.daysRemaining)} day${Math.abs(ukMaxStay.daysRemaining) === 1 ? "" : "s"}`
                : `${ukMaxStay.tripDays} day${ukMaxStay.tripDays === 1 ? "" : "s"} of 6-month visit`}
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: ukMaxStay.variant === "danger" ? tokens.red : ukMaxStay.variant === "caution" ? tokens.amberText : tokens.navy,
                whiteSpace: "nowrap",
              }}
            >
              Latest exit: {fmtHintDate(ukMaxStay.maxExitDate)}
            </Typography>
          </Box>
          {ukMaxStay.variant !== "safe" && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
              <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "1px", flexShrink: 0, color: ukMaxStay.variant === "danger" ? tokens.red : tokens.amberText }} />
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: ukMaxStay.variant === "danger" ? tokens.red : tokens.amberText, lineHeight: 1.4 }}>
                {ukMaxStay.variant === "danger"
                  ? "This trip exceeds the 6-month visit limit. Border Force may deny entry or curtail leave."
                  : "Approaching the 6-month visit limit. Leave time before the deadline."}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* UK re-entry risk */}
      {ukReentryRisk && (() => {
        const isRed = ukReentryRisk.variant === "danger";
        const isAmber = ukReentryRisk.variant === "caution";
        const bg = isRed ? "rgba(220,38,38,0.06)" : isAmber ? tokens.amberBg : tokens.greenBg;
        const borderColor = isRed ? tokens.red : isAmber ? tokens.amberBorder : tokens.greenBorder;
        const textColor = isRed ? tokens.red : isAmber ? tokens.amberText : tokens.greenText;
        const heading = isRed
          ? "Re-entry after a long UK stay — high scrutiny"
          : isAmber
            ? "Previous long UK stay on record"
            : "Previous UK stay noted";
        const body = isRed
          ? `Your last UK trip lasted ${ukReentryRisk.lastTripDays} days, exiting only ${ukReentryRisk.daysSinceExit} days ago. Immediate re-entry after a near-maximum stay is likely to be refused under the genuine visitor test.`
          : isAmber
            ? `Your last UK trip lasted ${ukReentryRisk.lastTripDays} days. Border Force may scrutinise this entry — carry evidence of ties to your home country and clear reasons for returning.`
            : `A previous UK trip of ${ukReentryRisk.lastTripDays} days is on record. This entry is unlikely to cause issues, but be ready to explain your travel pattern if asked.`;
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

      {/* Ireland max-stay warning */}
      {irelandMaxStay && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            px: "12px",
            py: "9px",
            bgcolor:
              irelandMaxStay.variant === "danger"
                ? "rgba(220,38,38,0.06)"
                : irelandMaxStay.variant === "caution"
                  ? tokens.amberBg
                  : tokens.mist,
            border: `1px solid ${
              irelandMaxStay.variant === "danger"
                ? tokens.red
                : irelandMaxStay.variant === "caution"
                  ? tokens.amberBorder
                  : tokens.border
            }`,
            borderRadius: "10px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, fontWeight: 500 }}>
              {irelandMaxStay.variant === "danger" && irelandMaxStay.daysRemaining < 0
                ? `Over the 90-day limit by ${Math.abs(irelandMaxStay.daysRemaining)} day${Math.abs(irelandMaxStay.daysRemaining) === 1 ? "" : "s"}`
                : `${irelandMaxStay.tripDays} day${irelandMaxStay.tripDays === 1 ? "" : "s"} of 90-day permission`}
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: irelandMaxStay.variant === "danger" ? tokens.red : irelandMaxStay.variant === "caution" ? tokens.amberText : tokens.navy,
                whiteSpace: "nowrap",
              }}
            >
              Latest exit: {fmtHintDate(irelandMaxStay.maxExitDate)}
            </Typography>
          </Box>
          {irelandMaxStay.variant !== "safe" && (
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
              <WarningAmberIcon sx={{ fontSize: "0.85rem", mt: "1px", flexShrink: 0, color: irelandMaxStay.variant === "danger" ? tokens.red : tokens.amberText }} />
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: irelandMaxStay.variant === "danger" ? tokens.red : tokens.amberText, lineHeight: 1.4 }}>
                {irelandMaxStay.variant === "danger"
                  ? "This trip exceeds the 90-day permission limit. You may be asked to leave."
                  : "Approaching the 90-day permission limit. Plan an exit date before the deadline."}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Ireland re-entry risk */}
      {irelandReentryRisk && (() => {
        const isRed = irelandReentryRisk.variant === "danger";
        const isAmber = irelandReentryRisk.variant === "caution";
        const bg = isRed ? "rgba(220,38,38,0.06)" : isAmber ? tokens.amberBg : tokens.greenBg;
        const borderColor = isRed ? tokens.red : isAmber ? tokens.amberBorder : tokens.greenBorder;
        const textColor = isRed ? tokens.red : isAmber ? tokens.amberText : tokens.greenText;
        const heading = isRed
          ? "Re-entry after a maximum-duration Ireland stay — entry may be refused"
          : isAmber
            ? "Previous long Ireland stay on record"
            : "Previous Ireland stay noted";
        const body = isRed
          ? `Your last Ireland trip lasted ${irelandReentryRisk.lastTripDays} days, exiting only ${irelandReentryRisk.daysSinceExit} days ago. INIS has explicitly stated that immediate re-entry after a maximum-duration stay is not permitted.`
          : isAmber
            ? `Your last Ireland trip lasted ${irelandReentryRisk.lastTripDays} days. Officers may scrutinise this entry — carry evidence of your home ties and clear reasons for visiting.`
            : `A previous Ireland trip of ${irelandReentryRisk.lastTripDays} days is on record. This entry is unlikely to cause issues, but be prepared to explain your travel pattern.`;
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
