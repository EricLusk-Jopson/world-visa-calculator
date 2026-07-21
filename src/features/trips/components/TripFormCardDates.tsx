import { useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { parseDate } from "@/features/calculator/utils/dates";
import { TripFormCard } from "./TripFormCard";
import { TripDateRangeCalendar } from "./TripDateRangeCalendar";

interface Props {
  entryDate: string;
  exitDate: string;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
  onReset: () => void;
  expanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  footer?: React.ReactNode;
}

function fmtShort(iso: string) {
  return parseDate(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function buildSummary(entry: string, exit: string): string {
  if (!entry) return "";
  if (!exit) return `From ${fmtShort(entry)}`;
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
  onEntryChange,
  onExitChange,
  onReset,
  expanded,
  onExpand,
  onCollapse,
  footer,
}: Props) {
  const scrollToTodayRef = useRef<(() => void) | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll the card into view when it expands so the calendar is visible.
  useEffect(() => {
    if (expanded) {
      requestAnimationFrame(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [expanded]);

  const summary = buildSummary(entryDate, exitDate);
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

  const todayBtn = (
    <Box
      component="button"
      onClick={() => scrollToTodayRef.current?.()}
      sx={{
        border: "none",
        bgcolor: "transparent",
        fontFamily: tokens.fontBody,
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        px: "4px",
        py: "2px",
        color: tokens.textSoft,
      }}
    >
      Today
    </Box>
  );

  return (
    <div ref={cardRef}>
    <TripFormCard
      label="Dates"
      summary={summaryNode}
      expanded={expanded}
      onExpand={onExpand}
      onDone={onCollapse}
      onReset={onReset}
      headerExtra={todayBtn}
      footer={footer}
    >
      <TripDateRangeCalendar
        entryDate={entryDate}
        exitDate={exitDate}
        onEntryChange={onEntryChange}
        onExitChange={onExitChange}
        scrollToTodayRef={scrollToTodayRef}
      />

      {/* TODO: per-traveler stay summary rows — deferred to same pass as day colouring */}
    </TripFormCard>
    </div>
  );
}
