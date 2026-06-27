import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { parseDate, today } from "@/features/calculator/utils/dates";
import { OngoingToggle } from "@/components/ui/OngoingToggle";
import { TripFormCard } from "./TripFormCard";
import { TripDateRangeCalendar } from "./TripDateRangeCalendar";

interface Props {
  entryDate: string;
  exitDate: string;
  ongoing: boolean;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
  onOngoingChange: (v: boolean) => void;
  onClear: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
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

const SUMMARY_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.95rem",
  textAlign: "right" as const,
};

export function TripFormCardDates({
  entryDate,
  exitDate,
  ongoing,
  onEntryChange,
  onExitChange,
  onOngoingChange,
  onClear,
  expanded,
  onExpand,
  onCollapse,
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

  // Ongoing only makes sense if the trip has already started (entry ≤ today)
  const ongoingDisabled = !!entryDate && parseDate(entryDate) > today();

  return (
    <TripFormCard
      label="Dates"
      summary={summaryNode}
      expanded={expanded}
      onExpand={onExpand}
      onDone={onCollapse}
      onClear={onClear}
    >
      <OngoingToggle
        checked={ongoing}
        disabled={ongoingDisabled}
        onChange={(v) => {
          onOngoingChange(v);
          if (v) onExitChange("");
        }}
        sx={{ mb: "12px" }}
      />

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
