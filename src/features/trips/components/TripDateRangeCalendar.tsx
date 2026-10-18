import "react-day-picker/style.css";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange, Matcher } from "react-day-picker";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import { parseDate, formatDate } from "@/features/calculator/utils/dates";
import type { BlockedRange } from "@/features/calculator/utils/tripOverlap";

interface Props {
  entryDate: string;
  exitDate: string;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
  /** Interior days of the travelers' other trips — disabled (not selectable). */
  blockedRanges?: BlockedRange[];
  /** Assign a ref here and call ref.current() to jump to today's month. */
  scrollToTodayRef?: React.MutableRefObject<(() => void) | null>;
}

// A small initial window keeps first mount cheap; scrolling toward either
// edge extends it. Total live months are capped so a long scroll session
// doesn't grow the mounted DOM forever — growing past the cap trims the
// opposite edge instead.
const MONTHS_BACK_INITIAL = 6;
const MONTHS_FORWARD_INITIAL = 12;
const EXTEND_STEP = 12;
const MAX_LIVE_MONTHS = 24;
const MIN_EDGE_MONTHS = 4;

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
  entryDate,
  exitDate,
  onEntryChange,
  onExitChange,
  blockedRanges,
  scrollToTodayRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const [monthsBack, setMonthsBack] = useState(MONTHS_BACK_INITIAL);
  const [monthsForward, setMonthsForward] = useState(MONTHS_FORWARD_INITIAL);
  const savedScrollHeightRef = useRef(0);

  const totalMonths = monthsBack + monthsForward;
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

  // Build the scroll-to-today function using the current layout values.
  // Each month is assumed equal height; the ratio gives accurate positioning.
  function doScrollToToday() {
    const el = containerRef.current;
    if (!el || el.scrollHeight === 0) return;
    const avgMonthPx = el.scrollHeight / totalMonths;
    el.scrollTop = Math.max(0, avgMonthPx * monthsBack - 40);
  }

  // Keep the external ref in sync so Today button always calls the latest version.
  useEffect(() => {
    if (scrollToTodayRef) scrollToTodayRef.current = doScrollToToday;
  });

  // Scroll to today on mount, after the browser has calculated layout.
  useEffect(() => {
    requestAnimationFrame(doScrollToToday);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Growing (or trimming) the number of months *before* the current scroll
  // position shifts everything below it down (or up); measure the height
  // change and apply it to scrollTop so the visible content doesn't jump.
  // Months *after* the scroll position never need this — appending or
  // removing content below the fold doesn't move anything already on screen.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || savedScrollHeightRef.current === 0) return;
    el.scrollTop += el.scrollHeight - savedScrollHeightRef.current;
    savedScrollHeightRef.current = 0;
  }, [monthsBack]);

  // Extend the window when the user scrolls near the top sentinel, trimming
  // the forward edge if that pushes the total past the cap. Trimming forward
  // is scroll-neutral (see above), so it needs no compensation.
  function growBack() {
    const nextBack = monthsBack + EXTEND_STEP;
    const overflow = nextBack + monthsForward - MAX_LIVE_MONTHS;
    const nextForward =
      overflow > 0
        ? Math.max(MIN_EDGE_MONTHS, monthsForward - overflow)
        : monthsForward;
    const el = containerRef.current;
    if (el) savedScrollHeightRef.current = el.scrollHeight;
    setMonthsBack(nextBack);
    if (nextForward !== monthsForward) setMonthsForward(nextForward);
  }

  // Extend the window when the user scrolls near the bottom sentinel,
  // trimming the back edge if that pushes the total past the cap. Trimming
  // the back edge shifts content, so it goes through the same
  // scroll-compensation path as growBack.
  function growForward() {
    const nextForward = monthsForward + EXTEND_STEP;
    const overflow = monthsBack + nextForward - MAX_LIVE_MONTHS;
    if (overflow > 0 && monthsBack > MIN_EDGE_MONTHS) {
      const nextBack = Math.max(MIN_EDGE_MONTHS, monthsBack - overflow);
      const el = containerRef.current;
      if (el) savedScrollHeightRef.current = el.scrollHeight;
      setMonthsBack(nextBack);
    }
    setMonthsForward(nextForward);
  }

  // Keep these in sync every render (rather than recreating the observers
  // below on every window-size change) so growBack/growForward always see
  // the current monthsBack/monthsForward without any risk of an observer
  // re-firing against a stale intersection state right after it reconnects.
  const growBackRef = useRef(growBack);
  const growForwardRef = useRef(growForward);
  useEffect(() => {
    growBackRef.current = growBack;
    growForwardRef.current = growForward;
  });

  // Extend the window when the user scrolls near either edge. The observers
  // are created once and call through growBackRef/growForwardRef so they
  // never need to be recreated as monthsBack/monthsForward change.
  useEffect(() => {
    const container = containerRef.current;
    const topSentinel = topSentinelRef.current;
    const bottomSentinel = bottomSentinelRef.current;
    if (!container || !topSentinel || !bottomSentinel) return;
    const topObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) growBackRef.current();
      },
      { root: container, threshold: 0.1 },
    );
    const bottomObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) growForwardRef.current();
      },
      { root: container, threshold: 0.1 },
    );
    topObserver.observe(topSentinel);
    bottomObserver.observe(bottomSentinel);
    return () => {
      topObserver.disconnect();
      bottomObserver.disconnect();
    };
  }, []);

  const entryDateObj = entryDate ? parseDate(entryDate) : undefined;
  const exitDateObj = exitDate ? parseDate(exitDate) : undefined;

  const range: DateRange | undefined = entryDateObj
    ? { from: entryDateObj, to: exitDateObj }
    : undefined;

  // Disable other trips' interior days, plus dates before the entry date while
  // the user is picking an exit. excludeDisabled stops a range from spanning a
  // blocked day.
  const disabled: Matcher[] = [...(blockedRanges ?? [])];
  if (entryDateObj && !exitDateObj) disabled.push({ before: entryDateObj });

  return (
    <Box ref={containerRef} sx={CALENDAR_SX}>
      <Box ref={topSentinelRef} sx={{ height: "1px" }} />
      {/* TODO: add modifiers prop for green/yellow/red day shading */}
      <DayPicker
        mode="range"
        selected={range}
        disabled={disabled}
        excludeDisabled
        onSelect={(selected) => {
          onEntryChange(selected?.from ? formatDate(selected.from) : "");
          onExitChange(selected?.to ? formatDate(selected.to) : "");
        }}
        defaultMonth={startMonth}
        numberOfMonths={totalMonths}
        hideNavigation
      />
      <Box ref={bottomSentinelRef} sx={{ height: "1px" }} />
    </Box>
  );
}
