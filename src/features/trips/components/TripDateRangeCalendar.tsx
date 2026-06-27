import "react-day-picker/style.css";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import { parseDate, formatDate } from "@/features/calculator/utils/dates";

interface Props {
  ongoing: boolean;
  entryDate: string;
  exitDate: string;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
}

const CALENDAR_SX = {
  maxHeight: "55dvh",
  overflowY: "auto" as const,
  // Override react-day-picker CSS variables to match app tokens
  "& .rdp-root": {
    "--rdp-accent-color": tokens.navy,
    "--rdp-accent-background-color": tokens.mist,
    "--rdp-range_middle-background-color": tokens.mist,
    "--rdp-range_start-date-background-color": tokens.navy,
    "--rdp-range_end-date-background-color": tokens.navy,
    "--rdp-today-color": tokens.navy,
    fontFamily: tokens.fontBody,
    fontSize: "0.9rem",
    width: "100%",
  },
  "& .rdp-month_caption": {
    fontFamily: tokens.fontBody,
    fontWeight: 700,
    color: tokens.text,
    fontSize: "0.88rem",
  },
  "& .rdp-weekday": {
    fontFamily: tokens.fontBody,
    fontSize: "0.75rem",
    color: tokens.textSoft,
  },
  "& .rdp-day_button": {
    fontFamily: tokens.fontBody,
  },
  width: "100%",
  overflowX: "auto",
};

export function TripDateRangeCalendar({
  ongoing,
  entryDate,
  exitDate,
  onEntryChange,
  onExitChange,
}: Props) {
  const entryDateObj = entryDate ? parseDate(entryDate) : undefined;
  const exitDateObj = exitDate ? parseDate(exitDate) : undefined;

  if (ongoing) {
    return (
      <Box sx={CALENDAR_SX}>
        {/* TODO: add modifiers prop for green/yellow/red day shading — requires useDateModifiers hook */}
        <DayPicker
          mode="single"
          selected={entryDateObj}
          onSelect={(date) => {
            onEntryChange(date ? formatDate(date) : "");
          }}
          numberOfMonths={18}
          hideNavigation
        />
      </Box>
    );
  }

  const range: DateRange | undefined = entryDateObj
    ? { from: entryDateObj, to: exitDateObj }
    : undefined;

  return (
    <Box sx={CALENDAR_SX}>
      {/* TODO: add modifiers prop for green/yellow/red day shading — requires useDateModifiers hook */}
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(selected) => {
          onEntryChange(selected?.from ? formatDate(selected.from) : "");
          onExitChange(selected?.to ? formatDate(selected.to) : "");
        }}
        numberOfMonths={18}
        hideNavigation
      />
    </Box>
  );
}
