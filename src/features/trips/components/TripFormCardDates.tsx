import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { parseDate } from "@/features/calculator/utils/dates";
import { TripFormCard } from "./TripFormCard";
import { TripDateRangeCalendar } from "./TripDateRangeCalendar";

interface Props {
  entryDate: string;
  exitDate: string;
  ongoing: boolean;
  isPlanned: boolean;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
  onOngoingChange: (v: boolean) => void;
  onPlannedChange: (v: boolean) => void;
  expanded: boolean;
  onExpand: () => void;
}

function fmtShort(iso: string) {
  return parseDate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function buildSummary(entry: string, exit: string, ongoing: boolean): string {
  if (!entry) return "";
  if (ongoing || !exit) {
    return `From ${fmtShort(entry)} · ongoing`;
  }
  const days =
    Math.round(
      (parseDate(exit).getTime() - parseDate(entry).getTime()) / 86_400_000,
    ) + 1;
  return `${fmtShort(entry)} – ${fmtShort(exit)} · ${days} day${days === 1 ? "" : "s"}`;
}

function SegmentControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        border: `1px solid ${tokens.border}`,
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Box
            key={opt.value}
            component="button"
            onClick={() => onChange(opt.value)}
            sx={{
              flex: 1,
              py: "8px",
              border: "none",
              borderRight:
                options[options.length - 1].value !== opt.value
                  ? `1px solid ${tokens.border}`
                  : "none",
              bgcolor: active ? tokens.navy : tokens.white,
              color: active ? tokens.white : tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </Box>
        );
      })}
    </Box>
  );
}

const SUMMARY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.95rem",
  textAlign: "right" as const,
};

export function TripFormCardDates({
  entryDate,
  exitDate,
  ongoing,
  isPlanned,
  onEntryChange,
  onExitChange,
  onOngoingChange,
  onPlannedChange,
  expanded,
  onExpand,
}: Props) {
  const summary = buildSummary(entryDate, exitDate, ongoing);
  const filled = !!entryDate;

  const summaryNode = (
    <Typography
      sx={{
        ...SUMMARY_SX,
        color: filled ? tokens.text : tokens.textGhost,
        fontWeight: filled ? 500 : 400,
      }}
    >
      {filled ? summary : "Select dates"}
    </Typography>
  );

  return (
    <TripFormCard
      label="Dates"
      summary={summaryNode}
      expanded={expanded}
      onExpand={onExpand}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mb: "12px" }}>
        <SegmentControl
          options={[
            { label: "Confirmed", value: "confirmed" },
            { label: "Planned", value: "planned" },
          ]}
          value={isPlanned ? "planned" : "confirmed"}
          onChange={(v) => onPlannedChange(v === "planned")}
        />
        <SegmentControl
          options={[
            { label: "Round trip", value: "roundtrip" },
            { label: "Ongoing", value: "ongoing" },
          ]}
          value={ongoing ? "ongoing" : "roundtrip"}
          onChange={(v) => {
            const nowOngoing = v === "ongoing";
            onOngoingChange(nowOngoing);
            if (nowOngoing) onExitChange("");
          }}
        />
      </Box>

      <TripDateRangeCalendar
        ongoing={ongoing}
        entryDate={entryDate}
        exitDate={exitDate}
        onEntryChange={onEntryChange}
        onExitChange={onExitChange}
      />

      {/* TODO: per-traveler stay summary rows — deferred to same pass as day colouring */}
    </TripFormCard>
  );
}
