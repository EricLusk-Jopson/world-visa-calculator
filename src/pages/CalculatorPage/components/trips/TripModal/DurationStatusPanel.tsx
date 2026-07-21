import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { TravelerImpact } from "../../ImpactPreview/ImpactPreview";
import type { TravelerStatus, ImpactBreakdown } from "../../travelers/travelerStatus";
import type { StayAssessment, ReentryRisk } from "@/features/calculator/utils/stayCalculator";
import type { TravelerDuration } from "../tripDuration";
import { DurationPanel } from "./DurationPanel";

// ─── Per-traveler bar (per-visit / non-Schengen regions) ──────────────────────

const VARIANT_VALUE = {
  safe: tokens.green,
  caution: tokens.amber,
  danger: tokens.red,
} as const;

const VARIANT_CHIP = {
  safe: { bg: tokens.greenBg, border: tokens.greenBorder, text: tokens.greenText },
  caution: { bg: tokens.amberBg, border: tokens.amberBorder, text: tokens.amberText },
  danger: { bg: tokens.redBg, border: tokens.redBorder, text: tokens.redText },
} as const;

function DurationBarRow({ duration }: { duration: TravelerDuration }) {
  const chip = VARIANT_CHIP[duration.variant];
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Box
        sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: duration.color, flexShrink: 0 }}
      />
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "0.85rem",
          fontStyle: "italic",
          fontWeight: 400,
          color: tokens.navy,
          flexShrink: 0,
        }}
      >
        {duration.name}
      </Typography>
      <Box sx={{ flex: 1, height: 3, bgcolor: tokens.mist, borderRadius: "100px", overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: `${duration.fillPct}%`,
            bgcolor: VARIANT_VALUE[duration.variant],
            borderRadius: "100px",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          px: "7px",
          py: "2px",
          borderRadius: "100px",
          bgcolor: chip.bg,
          border: `1px solid ${chip.border}`,
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: chip.text, lineHeight: 1, whiteSpace: "nowrap" }}>
          {duration.chipLabel}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DurationStatusPanelProps {
  region: VisaRegion;
  entryDate: string;
  exitDate: string;
  travelerCount: number;
  durations: TravelerDuration[];
  // Passed through to DurationPanel (the expanded detail view).
  entryConstraint: { daysAvailable: number; latestExit: string } | null;
  impactStatus: TravelerStatus | null;
  impactVariant: "safe" | "caution" | "danger" | "neutral";
  impactBreakdown: ImpactBreakdown | undefined;
  travelerImpacts: TravelerImpact[] | undefined;
  hasVisaFreeTravelers: boolean;
  stayAssessment: StayAssessment | null;
  reentryRisk: ReentryRisk | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DurationStatusPanel(props: DurationStatusPanelProps) {
  const { region, entryDate, exitDate, durations, hasVisaFreeTravelers } = props;
  const [expanded, setExpanded] = useState(true);

  // Only meaningful once both dates are chosen for a tracked region.
  if (region === VisaRegion.Elsewhere || !entryDate || !exitDate) return null;

  const okCount = durations.filter((d) => !d.hasIssue).length;
  const issueCount = durations.filter((d) => d.hasIssue).length;
  const noneTracked = durations.length === 0;

  return (
    <Box
      sx={{
        border: `1px solid ${tokens.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* ── Header ── */}
      <Box
        onClick={() => setExpanded((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "12px",
          py: "8px",
          cursor: "pointer",
          userSelect: "none",
          borderBottom: expanded ? `1px solid ${tokens.border}` : "none",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.textSoft,
            }}
          >
            Duration Status:
          </Typography>
          {okCount > 0 && (
            <Tooltip
              title={`${okCount} ${okCount === 1 ? "traveler is" : "travelers are"} within their allowance`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.green }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.green }}>{okCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {issueCount > 0 && (
            <Tooltip
              title={`${issueCount} ${issueCount === 1 ? "traveler has" : "travelers have"} a stay or re-entry concern`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <WarningAmberIcon sx={{ fontSize: "0.9rem", color: tokens.red }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.red }}>{issueCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {noneTracked && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, fontStyle: "italic" }}>
              {hasVisaFreeTravelers ? "No day limit" : "Not tracked for visa holders"}
            </Typography>
          )}
        </Box>
        {expanded ? (
          <ExpandLessIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1rem", color: tokens.textGhost }} />
        )}
      </Box>

      {/* ── Body ── */}
      {expanded && (
        <Box sx={{ px: "12px", py: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Per-traveler bars for non-Schengen regions (Schengen renders its
              own bars inside ImpactPreview below). */}
          {region !== VisaRegion.Schengen && durations.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {durations.map((d) => (
                <DurationBarRow key={d.id} duration={d} />
              ))}
            </Box>
          )}
          <DurationPanel {...props} />
        </Box>
      )}
    </Box>
  );
}
