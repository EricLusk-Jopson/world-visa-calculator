import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { DurationIcon } from "@/components/ui/DurationIcon";
import type { TravelerEligibility } from "@/pages/CalculatorPage/components/trips/tripEligibility";
import type { TravelerDuration } from "@/pages/CalculatorPage/components/trips/tripDuration";
import {
  SectionLabel,
  InfoRow,
  NoteBlock,
  DurationSection,
  overstayDays,
  durStateFor,
} from "./tripDetailParts";

/**
 * Desktop inline detail: the Entry Eligibility and Stay Duration sections that
 * expand beneath the Destination and Dates cards. Each lists travelers as
 * collapsible rows (name + status icon), all collapsed by default. Row bodies
 * reuse the shared mobile parts so wording matches exactly.
 */

const EMPTY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.8rem",
  color: tokens.textGhost,
  fontStyle: "italic",
  px: "4px",
  py: "6px",
} as const;

/** A collapsible per-traveler row: dot + name + status icon, expandable body. */
function TravelerDetailRow({
  name,
  color,
  statusIcon,
  children,
}: {
  name: string;
  color: string;
  statusIcon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: `1.5px solid ${tokens.border}`,
        bgcolor: tokens.white,
        overflow: "hidden",
      }}
    >
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "12px",
          py: "10px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: color,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.95rem",
            fontStyle: "italic",
            color: tokens.navy,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>
        <Box
          sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          {statusIcon}
        </Box>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: "1.2rem", color: tokens.textGhost }} />
        )}
      </Box>

      {open && (
        <Box
          sx={{
            px: "12px",
            pb: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}

// ─── Entry eligibility ────────────────────────────────────────────────────────

function EligibilityTravelerRow({ e }: { e: TravelerEligibility }) {
  const accessColor = e.access === "visa_required" ? tokens.red : tokens.text;
  return (
    <TravelerDetailRow
      name={e.name}
      color={e.color}
      statusIcon={
        e.ok ? (
          <CheckCircleOutlineIcon sx={{ fontSize: "1.1rem", color: tokens.green }} />
        ) : (
          <WarningAmberIcon sx={{ fontSize: "1.1rem", color: tokens.red }} />
        )
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <InfoRow label="Passport" value={e.passportDisplay} />
        <InfoRow label="Destination" value={e.regionLabel} />
        <InfoRow label="Access" value={e.accessLabel} valueColor={accessColor} />
        {e.ruleTexts.length > 0 && (
          <InfoRow
            label={e.ruleTexts.length > 1 ? "Rules" : "Rule"}
            value={e.ruleTexts.join(" · ")}
          />
        )}
      </Box>
      {e.notes.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {e.notes.map((n, i) => (
            <NoteBlock key={i} note={n} />
          ))}
        </Box>
      )}
    </TravelerDetailRow>
  );
}

export function EligibilityDetailList({
  eligibility,
}: {
  eligibility: TravelerEligibility[];
}) {
  if (eligibility.length === 0) {
    return (
      <Typography sx={EMPTY_SX}>
        Select travelers and a destination to see entry requirements.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {eligibility.map((e) => (
        <EligibilityTravelerRow key={e.id} e={e} />
      ))}
    </Box>
  );
}

// ─── Stay duration ────────────────────────────────────────────────────────────

function DurationTravelerRow({
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
  const over = overstayDays(dur);
  return (
    <TravelerDetailRow
      name={e.name}
      color={e.color}
      statusIcon={<DurationIcon state={durStateFor(dur)} />}
    >
      {/* Key metadata (intentionally overlaps the eligibility section) */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <InfoRow label="Passport" value={e.passportDisplay} />
        <InfoRow label="Destination" value={e.regionLabel} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <SectionLabel>Stay duration</SectionLabel>
          {over > 0 && (
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.7rem",
                fontWeight: 700,
                color: tokens.red,
              }}
            >
              Over by {over}d
            </Typography>
          )}
        </Box>
        <DurationSection dur={dur} entryDate={entryDate} exitDate={exitDate} />
      </Box>
    </TravelerDetailRow>
  );
}

export function DurationDetailList({
  eligibility,
  durations,
  entryDate,
  exitDate,
}: {
  eligibility: TravelerEligibility[];
  durations: TravelerDuration[];
  entryDate: string;
  exitDate: string;
}) {
  if (eligibility.length === 0) {
    return (
      <Typography sx={EMPTY_SX}>
        Select travelers and a destination to see stay duration.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {eligibility.map((e) => (
        <DurationTravelerRow
          key={e.id}
          e={e}
          dur={durations.find((d) => d.id === e.id)}
          entryDate={entryDate}
          exitDate={exitDate}
        />
      ))}
    </Box>
  );
}
