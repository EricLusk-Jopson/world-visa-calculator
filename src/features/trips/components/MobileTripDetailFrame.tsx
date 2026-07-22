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
import { ImpactPreview } from "@/components/ui";
import { parseDate } from "@/features/calculator/utils/dates";
import type { TravelerEligibility, EligibilityNote } from "@/pages/CalculatorPage/components/trips/tripEligibility";
import type { TravelerDuration } from "@/pages/CalculatorPage/components/trips/tripDuration";

const VARIANT_CHIP = {
  safe: { bg: tokens.greenBg, border: tokens.greenBorder, text: tokens.greenText },
  caution: { bg: tokens.amberBg, border: tokens.amberBorder, text: tokens.amberText },
  danger: { bg: tokens.redBg, border: tokens.redBorder, text: tokens.redText },
} as const;

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parseDate(iso));
}

function SectionLabel({ children }: { children: React.ReactNode }) {
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

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box sx={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.textSoft, minWidth: 92, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: valueColor ? 600 : 400, color: valueColor ?? tokens.text }}>
        {value}
      </Typography>
    </Box>
  );
}

function NoteBlock({ note }: { note: EligibilityNote }) {
  return (
    <Box sx={{ bgcolor: tokens.mist, borderRadius: "8px", px: "10px", py: "8px", display: "flex", flexDirection: "column", gap: "3px" }}>
      <SectionLabel>{note.label}</SectionLabel>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.76rem", color: tokens.textSoft, lineHeight: 1.5 }}>
        {note.text}
      </Typography>
      {note.source && (
        <Box
          component="a"
          href={note.source.directUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ fontFamily: tokens.fontBody, fontSize: "0.7rem", color: tokens.navy, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          Source ↗
        </Box>
      )}
    </Box>
  );
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

// ─── Duration section ─────────────────────────────────────────────────────────

function DurationSection({
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
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.76rem", color: tokens.textGhost, fontStyle: "italic" }}>
        Add trip dates to see stay duration.
      </Typography>
    );
  }

  if (!dur.tracked) {
    return (
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", color: tokens.textSoft, lineHeight: 1.5 }}>
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
        travelerImpacts={[{ id: dur.id, name: dur.name, color: dur.color, daysRemaining: dur.rollingStatus.daysRemaining, daysUsed: dur.rollingStatus.daysUsed }]}
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: "5px", bgcolor: tokens.mist, borderRadius: "8px", px: "10px", py: "9px" }}>
          <EqRow label="This trip" value={`${a.tripDays} of ${a.limitLabel} visit`} />
          <EqRow label={a.daysRemaining >= 0 ? "Days remaining" : "Over by"} value={`${Math.abs(a.daysRemaining)}d`} />
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

// ─── Per-traveler card ────────────────────────────────────────────────────────

function TravelerCard({
  e,
  dur,
  entryDate,
  exitDate,
}: {
  e: TravelerEligibility;
  dur: TravelerDuration | undefined;
  entryDate: string;
  exitDate: string;
}) {
  const [open, setOpen] = useState(true);
  const accessColor = e.access === "visa_required" ? tokens.red : tokens.text;

  // Header icon reflects the worst of entry eligibility and stay duration:
  // visa-required/unknown → red, approaching a limit → amber, otherwise green.
  const durSeverity = dur?.tracked ? dur.severity : "safe";
  const overall: "safe" | "caution" | "danger" = !e.ok ? "danger" : durSeverity;

  return (
    <Box sx={{ borderRadius: "14px", border: `1.5px solid ${tokens.border}`, bgcolor: tokens.white, overflow: "hidden" }}>
      {/* Title bar */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{ display: "flex", alignItems: "center", gap: "8px", px: "14px", py: "12px", cursor: "pointer", userSelect: "none" }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: e.color, flexShrink: 0 }} />
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", color: tokens.navy, flex: 1 }}>
          {e.name}
        </Typography>
        {overall === "safe" ? (
          <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem", color: tokens.green }} />
        ) : (
          <WarningAmberIcon sx={{ fontSize: "1.1rem", color: overall === "danger" ? tokens.red : tokens.amber }} />
        )}
        {open ? (
          <ExpandLessIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        )}
      </Box>

      {open && (
        <Box sx={{ px: "14px", pb: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Eligibility */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionLabel>Entry eligibility</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <InfoRow label="Passport" value={e.passportDisplay} />
              <InfoRow label="Destination" value={e.regionLabel} />
              <InfoRow label="Access" value={e.accessLabel} valueColor={accessColor} />
              {e.ruleTexts.length > 0 && (
                <InfoRow label={e.ruleTexts.length > 1 ? "Rules" : "Rule"} value={e.ruleTexts.join(" · ")} />
              )}
            </Box>
            {e.notes.length > 0 && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {e.notes.map((n, i) => (
                  <NoteBlock key={i} note={n} />
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ height: "1px", bgcolor: tokens.border }} />

          {/* Duration */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionLabel>Stay duration</SectionLabel>
            <DurationSection dur={dur} entryDate={entryDate} exitDate={exitDate} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ─── Frame ────────────────────────────────────────────────────────────────────

export function MobileTripDetailFrame({
  open,
  onClose,
  eligibility,
  durations,
  entryDate,
  exitDate,
}: {
  open: boolean;
  onClose: () => void;
  eligibility: TravelerEligibility[];
  durations: TravelerDuration[];
  entryDate: string;
  exitDate: string;
}) {
  return (
    <FullScreenSlider open={open} onClose={onClose} title="Eligibility & Duration">
      <Box sx={{ px: "16px", py: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {eligibility.length === 0 ? (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem", color: tokens.textGhost, textAlign: "center", mt: "24px" }}>
            Select travelers and a destination to see entry requirements.
          </Typography>
        ) : (
          eligibility.map((e) => (
            <TravelerCard
              key={e.id}
              e={e}
              dur={durations.find((d) => d.id === e.id)}
              entryDate={entryDate}
              exitDate={exitDate}
            />
          ))
        )}
      </Box>
    </FullScreenSlider>
  );
}
