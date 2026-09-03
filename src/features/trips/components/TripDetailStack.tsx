import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
 * The per-traveler combined Eligibility + Duration cards. Shared by the mobile
 * detail frame (wrapped in a FullScreenSlider) and the desktop trip-modal
 * overlay, so both show the same combined content with identical wording.
 */

function TravelerCard({
  e,
  dur,
  entryDate,
  exitDate,
  defaultOpen = true,
}: {
  e: TravelerEligibility;
  dur: TravelerDuration | undefined;
  entryDate: string;
  exitDate: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const accessColor = e.access === "visa_required" ? tokens.red : tokens.text;

  // Two status icons per traveler: entry eligibility (check / warning) and
  // stay duration (clock / warning / question).
  const durState = durStateFor(dur);

  return (
    <Box
      sx={{
        borderRadius: "14px",
        border: `1.5px solid ${tokens.border}`,
        bgcolor: tokens.white,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "14px",
          py: "12px",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: e.color,
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontStyle: "italic",
            color: tokens.navy,
            flex: 1,
          }}
        >
          {e.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {e.access === "unknown" ? (
            // Nationality not set — unknown eligibility, not a failure.
            <HelpOutlineIcon
              sx={{ fontSize: "1.1rem", color: tokens.textGhost }}
            />
          ) : e.temporalException ? (
            // A date_range-gated entitlement is in play — either currently
            // overriding the base rule (green: access is granted right now,
            // the clock just signals it's time-limited) or currently dormant
            // while the base rule applies (red: no access today, though a
            // seasonal exception exists — see notes).
            <AccessTimeIcon
              sx={{
                fontSize: "1.1rem",
                color: e.temporalException.active ? tokens.green : tokens.red,
              }}
            />
          ) : e.ok ? (
            <CheckCircleOutlineIcon
              sx={{ fontSize: "1.1rem", color: tokens.green }}
            />
          ) : (
            <WarningAmberIcon sx={{ fontSize: "1.1rem", color: tokens.red }} />
          )}
          <DurationIcon state={durState} />
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
            px: "14px",
            pb: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Eligibility */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionLabel>Entry eligibility</SectionLabel>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <InfoRow label="Passport" value={e.passportDisplay} />
              <InfoRow label="Destination" value={e.regionLabel} />
              <InfoRow
                label="Access"
                value={e.accessLabel}
                valueColor={accessColor}
                source={e.ruleTexts.length === 0 ? e.ruleSource : undefined}
              />
              {e.ruleTexts.length > 0 && (
                <InfoRow
                  label={e.ruleTexts.length > 1 ? "Rules" : "Rule"}
                  value={e.ruleTexts.join(" · ")}
                  source={e.ruleSource}
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
          </Box>

          <Box sx={{ height: "1px", bgcolor: tokens.border }} />

          {/* Duration */}
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
              {overstayDays(dur) > 0 && (
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: tokens.red,
                  }}
                >
                  Over by {overstayDays(dur)}d
                </Typography>
              )}
            </Box>
            <DurationSection dur={dur} entryDate={entryDate} exitDate={exitDate} />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export function TripDetailStack({
  eligibility,
  durations,
  entryDate,
  exitDate,
  defaultOpen,
}: {
  eligibility: TravelerEligibility[];
  durations: TravelerDuration[];
  entryDate: string;
  exitDate: string;
  /** Whether each traveler card starts expanded (default true). */
  defaultOpen?: boolean;
}) {
  if (eligibility.length === 0) {
    return (
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.85rem",
          color: tokens.textGhost,
          textAlign: "center",
          mt: "24px",
        }}
      >
        Select travelers and a destination to see entry requirements.
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {eligibility.map((e) => (
        <TravelerCard
          key={e.id}
          e={e}
          dur={durations.find((d) => d.id === e.id)}
          entryDate={entryDate}
          exitDate={exitDate}
          defaultOpen={defaultOpen}
        />
      ))}
    </Box>
  );
}
