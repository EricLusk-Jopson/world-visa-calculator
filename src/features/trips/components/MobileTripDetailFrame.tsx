import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
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
          {e.ok ? (
            <CheckCircleOutlineIcon
              sx={{ fontSize: "1.1rem", color: tokens.green }}
            />
          ) : (
            <WarningAmberIcon sx={{ fontSize: "1.1rem", color: tokens.red }} />
          )}
          <DurationIcon state={durState} />
        </Box>
        {open ? (
          <ExpandLessIcon
            sx={{ fontSize: "1.2rem", color: tokens.textGhost }}
          />
        ) : (
          <ExpandMoreIcon
            sx={{ fontSize: "1.2rem", color: tokens.textGhost }}
          />
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
              />
              {e.ruleTexts.length > 0 && (
                <InfoRow
                  label={e.ruleTexts.length > 1 ? "Rules" : "Rule"}
                  value={e.ruleTexts.join(" · ")}
                />
              )}
            </Box>
            {e.notes.length > 0 && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
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
            <DurationSection
              dur={dur}
              entryDate={entryDate}
              exitDate={exitDate}
            />
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
    <FullScreenSlider
      open={open}
      onClose={onClose}
      title="Eligibility & Duration"
    >
      <Box
        sx={{
          px: "16px",
          py: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {eligibility.length === 0 ? (
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
