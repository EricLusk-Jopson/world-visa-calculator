import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import { ImpactPreview } from "@/components/ui";
import { DurationIcon } from "@/components/ui/DurationIcon";
import type { TravelerImpact } from "../../ImpactPreview/ImpactPreview";
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

function UntrackedRow({ duration }: { duration: TravelerDuration }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
      <HelpOutlineIcon sx={{ fontSize: "1rem", color: tokens.textGhost, mt: "1px", flexShrink: 0 }} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "0.85rem", fontStyle: "italic", color: tokens.navy }}>
          {duration.name}
        </Typography>
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.68rem", color: tokens.textSoft, lineHeight: 1.4 }}>
          {duration.note}
        </Typography>
      </Box>
    </Box>
  );
}

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
  durations: TravelerDuration[];
  // Per-visit detail (UK / Ireland), for the most-constrained traveler.
  stayAssessment: StayAssessment | null;
  reentryRisk: ReentryRisk | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DurationStatusPanel(props: DurationStatusPanelProps) {
  const { region, entryDate, exitDate, durations, stayAssessment, reentryRisk } = props;
  const [expanded, setExpanded] = useState(true);

  // Only meaningful once both dates are chosen for a tracked region.
  if (region === VisaRegion.Elsewhere || !entryDate || !exitDate) return null;

  const tracked = durations.filter((d) => d.tracked);
  const untracked = durations.filter((d) => !d.tracked);
  const okCount = tracked.filter((d) => d.severity === "safe").length;
  const cautionCount = tracked.filter((d) => d.severity === "caution").length;
  // "danger" covers both close-to-limit (red clock) and actual overstay (red
  // warning); split them so the summary icons match the per-traveler ones.
  const dangerCount = tracked.filter((d) => d.severity === "danger" && !d.overstay).length;
  const overstayCount = tracked.filter((d) => d.overstay).length;
  const untrackedCount = untracked.length;
  const noneTracked = durations.length === 0;

  // Rolling-window travelers (Schengen, Türkiye, …) render ImpactPreview with
  // the full breakdown; per-visit travelers (UK, Ireland) render bars + boxes.
  const rollingTravelers = tracked.filter((d) => d.rollingStatus);
  const isRolling = rollingTravelers.length > 0;

  const extendableDays = (d: TravelerDuration) =>
    d.rollingBreakdown?.daysRemaining ?? d.rollingStatus?.daysRemaining ?? 0;
  const worst = rollingTravelers.reduce<TravelerDuration | null>(
    (w, d) => (w === null || extendableDays(d) < extendableDays(w) ? d : w),
    null,
  );
  const impactTravelers: TravelerImpact[] = rollingTravelers.map((d) => ({
    id: d.id,
    name: d.name,
    color: d.color,
    daysRemaining: d.rollingStatus!.daysRemaining,
    daysUsed: d.rollingStatus!.daysUsed,
  }));

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
                <DurationIcon state="safe" size="0.9rem" />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.green }}>{okCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {cautionCount > 0 && (
            <Tooltip
              title={`${cautionCount} ${cautionCount === 1 ? "traveler is" : "travelers are"} approaching a stay limit`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <DurationIcon state="caution" size="0.9rem" />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.amberText }}>{cautionCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {dangerCount > 0 && (
            <Tooltip
              title={`${dangerCount} ${dangerCount === 1 ? "traveler is" : "travelers are"} close to a limit or at re-entry risk`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <DurationIcon state="danger" size="0.9rem" />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.red }}>{dangerCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {overstayCount > 0 && (
            <Tooltip
              title={`${overstayCount} ${overstayCount === 1 ? "traveler exceeds" : "travelers exceed"} a stay limit`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <DurationIcon state="overstay" size="0.9rem" />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.red }}>{overstayCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {untrackedCount > 0 && (
            <Tooltip
              title={`${untrackedCount} visa-required ${untrackedCount === 1 ? "traveler has" : "travelers have"} no automatic day tracking`}
              placement="top"
              arrow
              componentsProps={{ tooltip: { sx: { fontFamily: tokens.fontBody, fontSize: "0.72rem", bgcolor: tokens.navy, "& .MuiTooltip-arrow": { color: tokens.navy } } } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <HelpOutlineIcon sx={{ fontSize: "0.9rem", color: tokens.textGhost }} />
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.textGhost }}>{untrackedCount}</Typography>
              </Box>
            </Tooltip>
          )}
          {noneTracked && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost, fontStyle: "italic" }}>
              No day limit
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
          {/* Rolling-window regions: full ImpactPreview breakdown. */}
          {isRolling && worst && worst.rollingStatus && (
            <ImpactPreview
              daysRemaining={worst.rollingStatus.daysRemaining}
              daysUsed={worst.rollingStatus.daysUsed}
              variant={worst.variant}
              maxDays={worst.rollingStatus.maxDays}
              breakdown={worst.rollingBreakdown}
              travelerImpacts={impactTravelers}
              currentTripEntry={entryDate}
              currentTripExit={exitDate || undefined}
            />
          )}

          {/* Per-visit regions: per-traveler bars + stay/re-entry boxes. */}
          {!isRolling && tracked.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {tracked.map((d) => (
                <DurationBarRow key={d.id} duration={d} />
              ))}
            </Box>
          )}

          {/* Visa-required travelers — grey, with an explanatory note. */}
          {untracked.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {untracked.map((d) => (
                <UntrackedRow key={d.id} duration={d} />
              ))}
            </Box>
          )}

          {!isRolling && (
            <DurationPanel stayAssessment={stayAssessment} reentryRisk={reentryRisk} />
          )}
        </Box>
      )}
    </Box>
  );
}
