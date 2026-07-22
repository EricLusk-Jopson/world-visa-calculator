import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { parseDate } from "@/features/calculator/utils/dates";
import type { TravelerDuration } from "@/pages/CalculatorPage/components/trips/tripDuration";

const VARIANT_VALUE = { safe: tokens.green, caution: tokens.amber, danger: tokens.red } as const;
const VARIANT_CHIP = {
  safe: { bg: tokens.greenBg, border: tokens.greenBorder, text: tokens.greenText },
  caution: { bg: tokens.amberBg, border: tokens.amberBorder, text: tokens.amberText },
  danger: { bg: tokens.redBg, border: tokens.redBorder, text: tokens.redText },
} as const;

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parseDate(iso));
}

function EqRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.74rem", color: tokens.textSoft }}>{label}</Typography>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", fontWeight: 600, color: tokens.navy, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
    </Box>
  );
}

function WarningBlock({ variant, text }: { variant: "caution" | "danger"; text: string }) {
  const c = VARIANT_CHIP[variant];
  return (
    <Box sx={{ display: "flex", gap: "6px", alignItems: "flex-start", bgcolor: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px", px: "10px", py: "8px" }}>
      <WarningAmberIcon sx={{ fontSize: "0.9rem", color: c.text, mt: "1px", flexShrink: 0 }} />
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: c.text, lineHeight: 1.45 }}>{text}</Typography>
    </Box>
  );
}

function DurationCard({ d }: { d: TravelerDuration }) {
  const [open, setOpen] = useState(true);
  const chip = VARIANT_CHIP[d.variant];
  const ok = !d.hasIssue;
  const bd = d.schengenBreakdown;
  const a = d.assessment;

  return (
    <Box sx={{ borderRadius: "14px", border: `1.5px solid ${tokens.border}`, bgcolor: tokens.white, overflow: "hidden" }}>
      {/* Title bar */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: "flex", alignItems: "center", gap: "8px", px: "14px", py: "12px", cursor: "pointer", userSelect: "none" }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", color: tokens.navy, flex: 1 }}>
          {d.name}
        </Typography>
        {!d.tracked ? (
          <HelpOutlineIcon sx={{ fontSize: "1.1rem", color: tokens.textGhost }} />
        ) : ok ? (
          <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem", color: tokens.green }} />
        ) : (
          <WarningAmberIcon sx={{ fontSize: "1.1rem", color: VARIANT_VALUE[d.variant] }} />
        )}
        {open ? (
          <ExpandLessIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        )}
      </Box>

      {open && !d.tracked && (
        <Box sx={{ px: "14px", pb: "14px" }}>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", color: tokens.textSoft, lineHeight: 1.5 }}>
            {d.note}
          </Typography>
        </Box>
      )}

      {open && d.tracked && (
        <Box sx={{ px: "14px", pb: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Progress bar + chip */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Box sx={{ flex: 1, height: 5, bgcolor: tokens.mist, borderRadius: "100px", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${d.fillPct}%`, bgcolor: VARIANT_VALUE[d.variant], borderRadius: "100px" }} />
            </Box>
            <Box sx={{ display: "inline-flex", alignItems: "center", px: "8px", py: "3px", borderRadius: "100px", bgcolor: chip.bg, border: `1px solid ${chip.border}`, flexShrink: 0 }}>
              <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: chip.text, whiteSpace: "nowrap" }}>{d.chipLabel}</Typography>
            </Box>
          </Box>

          {/* Rolling-window breakdown (Schengen) */}
          {bd && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px", bgcolor: tokens.mist, borderRadius: "8px", px: "10px", py: "9px" }}>
              <EqRow label="Previous days in window" value={`− ${bd.previousDaysTotal}d`} />
              <EqRow label="Freed during / after trip" value={`+ ${bd.agingOutTotal}d`} />
              <EqRow label="This trip" value={`− ${bd.currentTripDays}d`} />
              <Box sx={{ height: "1px", bgcolor: tokens.border, my: "2px" }} />
              <EqRow label="Can extend by" value={`${bd.daysRemaining}d`} />
              {bd.maxExitDate && <EqRow label="Latest exit" value={fmtDate(bd.maxExitDate)} />}
            </Box>
          )}

          {/* Per-visit summary */}
          {a && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "5px", bgcolor: tokens.mist, borderRadius: "8px", px: "10px", py: "9px" }}>
              <EqRow label="This trip" value={`${a.tripDays} of ${a.limitLabel} allowance`} />
              <EqRow label={a.daysRemaining >= 0 ? "Days remaining" : "Over by"} value={`${Math.abs(a.daysRemaining)}d`} />
              <EqRow label="Latest exit" value={fmtDate(a.maxExitDate)} />
            </Box>
          )}

          {/* Warnings */}
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
          {d.reentry && d.reentry.variant !== "safe" && (
            <WarningBlock
              variant={d.reentry.variant}
              text={
                d.reentry.variant === "danger"
                  ? `Last trip lasted ${d.reentry.lastTripDays} days, exiting only ${d.reentry.daysSinceExit} days ago. Immediate re-entry after a near-maximum stay is likely to attract scrutiny.`
                  : `Last trip lasted ${d.reentry.lastTripDays} days. Officers may scrutinise this entry — carry evidence of ties to your home country.`
              }
            />
          )}
        </Box>
      )}
    </Box>
  );
}

export function MobileDurationFrame({
  open,
  onClose,
  durations,
  allVisaRequired,
}: {
  open: boolean;
  onClose: () => void;
  durations: TravelerDuration[];
  allVisaRequired: boolean;
}) {
  return (
    <FullScreenSlider open={open} onClose={onClose} title="Stay Duration">
      <Box sx={{ px: "16px", py: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {durations.length === 0 ? (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem", color: tokens.textGhost, textAlign: "center", mt: "24px" }}>
            {allVisaRequired
              ? "Day tracking isn't available for visa holders — allowances depend on the specific visa granted."
              : "Select travelers and dates to see stay duration."}
          </Typography>
        ) : (
          durations.map((d) => <DurationCard key={d.id} d={d} />)
        )}
      </Box>
    </FullScreenSlider>
  );
}
