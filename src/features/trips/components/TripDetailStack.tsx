import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { tokens } from "@/styles/theme";
import { SourceButton } from "@/components/ui/SourceButton";
import { StatusTip, type StatusSource } from "@/components/ui/StatusTip";
import {
  ELIGIBILITY_LEGEND,
  DURATION_LEGEND,
  type EligibilityState,
} from "@/components/ui/statusLegend";
import {
  SourceTripProvider,
  SourceTravelerProvider,
} from "@/components/ui/sourceTracking";
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

/** The entry eligibility icon for a traveler. */
function eligStateFor(e: TravelerEligibility): EligibilityState {
  // Nationality not set — unknown eligibility, not a failure.
  if (e.access === "unknown") return "unknown";
  // A temporal window is relevant to this trip — either currently governing
  // it (green: access is granted right now, the clock just signals it's
  // time-limited) or only a nearby one (red: no access today, though a
  // waiver applies before/after — see notes).
  if (e.temporalWindows.length > 0)
    return e.temporalWindows.some((w) => w.active) ? "temporary" : "nearby";
  return e.ok ? "ok" : "visa";
}

/** The sources behind a traveler's entry status: the rule in effect, then any waiver windows it mentions. */
function eligSources(e: TravelerEligibility): StatusSource[] {
  const out: StatusSource[] = e.ruleSource
    ? [{ label: "Entry rule", source: e.ruleSource }]
    : [];
  let waivers = 0;
  for (const w of e.temporalWindows) {
    const source = w.window.source;
    if (source && !out.some((s) => s.source.direct.url === source.direct.url)) {
      waivers++;
      out.push({ label: waivers > 1 ? `Waiver ${waivers}` : "Waiver", source });
    }
  }
  return out;
}

function durationDetail(dur: TravelerDuration | undefined): string | undefined {
  if (!dur) return undefined;
  if (!dur.tracked) return dur.note;
  const parts = [
    dur.chipLabel
      ? `${dur.chipLabel.charAt(0).toUpperCase()}${dur.chipLabel.slice(1)} on this trip.`
      : "",
  ];
  if (dur.reentry && dur.reentry.variant !== "safe")
    parts.push("Re-entry soon after a long stay may draw scrutiny.");
  return parts.filter(Boolean).join(" ") || undefined;
}

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
  // stay duration (clock / warning / question). Each explains itself and
  // links its sources on hover (desktop) or tap (touch).
  const eligState = eligStateFor(e);
  const durState = durStateFor(dur);
  const eligDetail =
    eligState === "ok" || eligState === "visa"
      ? [...e.ruleTexts, e.preAuthName && `${e.preAuthName} required`]
          .filter(Boolean)
          .join(" · ") || undefined
      : undefined;

  return (
    <SourceTravelerProvider nationality={e.passportCode}>
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
              fontFamily: tokens.fontBody,
              fontSize: "0.95rem",
              fontWeight: 430,
              color: tokens.navy,
              flex: 1,
            }}
          >
            {e.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <StatusTip
              kind="eligibility"
              state={eligState}
              heading={eligState === "ok" ? e.accessLabel : undefined}
              detail={eligDetail}
              sources={eligSources(e)}
            >
              {ELIGIBILITY_LEGEND[eligState].icon("1.1rem")}
            </StatusTip>
            <StatusTip
              kind="duration"
              state={durState}
              detail={durationDetail(dur)}
              sources={
                e.ruleSource && durState !== "pending"
                  ? [{ label: "Stay limit", source: e.ruleSource }]
                  : []
              }
            >
              {DURATION_LEGEND[durState].icon("1.1rem")}
            </StatusTip>
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
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
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
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <SectionLabel>Stay duration</SectionLabel>
                  {/* The stay limit comes from the same rule as entry. */}
                  {e.ruleSource && dur && (
                    <SourceButton source={e.ruleSource} />
                  )}
                </Box>
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
    </SourceTravelerProvider>
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
  // Every source link opened from these cards is tracked with the trip's travelers.
  const trip = useMemo(
    () => ({
      travelerCount: eligibility.length,
      nationalities: eligibility.flatMap((e) =>
        e.passportCode ? [e.passportCode] : [],
      ),
    }),
    [eligibility],
  );
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
    <SourceTripProvider trip={trip}>
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
    </SourceTripProvider>
  );
}
