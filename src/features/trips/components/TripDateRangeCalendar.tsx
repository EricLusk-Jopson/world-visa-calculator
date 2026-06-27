import "react-day-picker/style.css";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
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
  /** Assign a ref here and call ref.current() to jump to today's month. */
  scrollToTodayRef?: React.MutableRefObject<(() => void) | null>;
}

const MONTHS_FORWARD = 24;
const BASE_MONTHS_BACK = 120; // 10 years; extended dynamically by scrolling to top

const CALENDAR_SX = {
  maxHeight: "55dvh",
  overflowY: "auto" as const,
  "& .rdp-root": {
    "--rdp-accent-color": tokens.navy,
    "--rdp-accent-background-color": tokens.mist,
    "--rdp-range_middle-background-color": tokens.mist,
    "--rdp-range_start-date-background-color": tokens.navy,
    "--rdp-range_end-date-background-color": tokens.navy,
    "--rdp-today-color": tokens.navy,
    "--rdp-disabled-opacity": 1,
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
  // Blue dot below today when not part of a selected range
  "& .rdp-today:not(.rdp-range_start):not(.rdp-range_end):not(.rdp-range_middle) .rdp-day_button": {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "3px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: tokens.navy,
    },
  },
  // Disabled days: use explicit grey rather than opacity fade
  "& .rdp-disabled:not(.rdp-selected) .rdp-day_button": {
    color: tokens.border,
    cursor: "default",
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
  scrollToTodayRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [extraMonthsBack, setExtraMonthsBack] = useState(0);
  const savedScrollHeightRef = useRef(0);

  const totalMonthsBack = BASE_MONTHS_BACK + extraMonthsBack;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - totalMonthsBack, 1);
  const totalMonths = totalMonthsBack + MONTHS_FORWARD;

  // Build the scroll-to-today function using the current layout values.
  // Each month is assumed equal height; the ratio gives accurate positioning.
  function doScrollToToday() {
    const el = containerRef.current;
    if (!el || el.scrollHeight === 0) return;
    const avgMonthPx = el.scrollHeight / totalMonths;
    el.scrollTop = Math.max(0, avgMonthPx * totalMonthsBack - 40);
  }

  // Keep the external ref in sync so Today button always calls the latest version.
  useEffect(() => {
    if (scrollToTodayRef) scrollToTodayRef.current = doScrollToToday;
  });

  // Scroll to today on mount, after the browser has calculated layout.
  useEffect(() => {
    requestAnimationFrame(doScrollToToday);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When extra months are prepended, preserve relative scroll position.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || savedScrollHeightRef.current === 0) return;
    el.scrollTop += el.scrollHeight - savedScrollHeightRef.current;
    savedScrollHeightRef.current = 0;
  }, [extraMonthsBack]);

  // Prepend 12 months when the user scrolls to the top sentinel.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          savedScrollHeightRef.current = container.scrollHeight;
          setExtraMonthsBack((prev) => prev + 12);
        }
      },
      { root: container, threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const entryDateObj = entryDate ? parseDate(entryDate) : undefined;
  const exitDateObj = exitDate ? parseDate(exitDate) : undefined;

  if (ongoing) {
    return (
      <Box ref={containerRef} sx={CALENDAR_SX}>
        <Box ref={sentinelRef} sx={{ height: "1px" }} />
        {/* TODO: add modifiers prop for green/yellow/red day shading */}
        <DayPicker
          mode="single"
          selected={entryDateObj}
          onSelect={(date) => onEntryChange(date ? formatDate(date) : "")}
          defaultMonth={startMonth}
          numberOfMonths={totalMonths}
          hideNavigation
        />
      </Box>
    );
  }

  const range: DateRange | undefined = entryDateObj
    ? { from: entryDateObj, to: exitDateObj }
    : undefined;

  // Disable dates before the entry date while the user is picking an exit date.
  const disabledDays = entryDateObj && !exitDateObj ? { before: entryDateObj } : undefined;

  return (
    <Box ref={containerRef} sx={CALENDAR_SX}>
      <Box ref={sentinelRef} sx={{ height: "1px" }} />
      {/* TODO: add modifiers prop for green/yellow/red day shading */}
      <DayPicker
        mode="range"
        selected={range}
        disabled={disabledDays}
        onSelect={(selected) => {
          onEntryChange(selected?.from ? formatDate(selected.from) : "");
          onExitChange(selected?.to ? formatDate(selected.to) : "");
        }}
        defaultMonth={startMonth}
        numberOfMonths={totalMonths}
        hideNavigation
      />
    </Box>
  );
}
