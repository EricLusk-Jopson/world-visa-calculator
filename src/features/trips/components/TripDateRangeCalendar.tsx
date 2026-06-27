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
}

const MONTHS_FORWARD = 24;
const BASE_MONTHS_BACK = 120; // 10 years; extended by scrolling to top

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

/** Walk the offsetParent chain to find an element's top relative to a scrollable container. */
function offsetFromContainer(el: HTMLElement, container: HTMLElement): number {
  let offset = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    offset += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return offset;
}

export function TripDateRangeCalendar({
  ongoing,
  entryDate,
  exitDate,
  onEntryChange,
  onExitChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [extraMonthsBack, setExtraMonthsBack] = useState(0);
  const savedScrollHeightRef = useRef(0);

  const totalMonthsBack = BASE_MONTHS_BACK + extraMonthsBack;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - totalMonthsBack, 1);
  const totalMonths = totalMonthsBack + MONTHS_FORWARD;

  // Scroll to today on initial mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const todayBtn = el.querySelector<HTMLElement>('[aria-current="date"]');
      if (!todayBtn) return;
      el.scrollTop = Math.max(0, offsetFromContainer(todayBtn, el) - 40);
    });
  }, []); // run once

  // When extra months are prepended, restore the relative scroll position
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || savedScrollHeightRef.current === 0) return;
    el.scrollTop += el.scrollHeight - savedScrollHeightRef.current;
    savedScrollHeightRef.current = 0;
  }, [extraMonthsBack]);

  // IntersectionObserver: load more months when the user scrolls to the top
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
        {/* TODO: add modifiers prop for green/yellow/red day shading — requires useDateModifiers hook */}
        <DayPicker
          mode="single"
          selected={entryDateObj}
          onSelect={(date) => {
            onEntryChange(date ? formatDate(date) : "");
          }}
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

  return (
    <Box ref={containerRef} sx={CALENDAR_SX}>
      <Box ref={sentinelRef} sx={{ height: "1px" }} />
      {/* TODO: add modifiers prop for green/yellow/red day shading — requires useDateModifiers hook */}
      <DayPicker
        mode="range"
        selected={range}
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
