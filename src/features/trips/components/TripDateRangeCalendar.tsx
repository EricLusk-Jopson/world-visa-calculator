import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import { formatDate, todayISO } from "@/features/calculator/utils/dates";
import type { BlockedRange } from "@/features/calculator/utils/tripOverlap";
import type { OverstayPreview } from "@/pages/CalculatorPage/components/trips/overstayPreview";
import {
  CAPTION_HEIGHT,
  ROW_HEIGHT,
  buildLayout,
  isoDay,
  monthIndexOf,
  nextRange,
  visibleMonths,
} from "../utils/dateRangeCalendar";
import type { CalendarMonth, IsoInterval, IsoRange } from "../utils/dateRangeCalendar";

interface Props {
  entryDate: string;
  exitDate: string;
  onEntryChange: (iso: string) => void;
  onExitChange: (iso: string) => void;
  /** Interior days of the travelers' other trips — disabled (not selectable). */
  blockedRanges?: BlockedRange[];
  /** Shades the days whose selection would overstay for any traveler. */
  overstay?: OverstayPreview;
  /** Assign a ref here and call ref.current() to jump to today's month. */
  scrollToTodayRef?: React.MutableRefObject<(() => void) | null>;
}

// The whole span is laid out up front (positions are arithmetic, see
// dateRangeCalendar.ts), but only the months on screen are rendered.
const MONTHS_BACK = 240;
const MONTHS_FORWARD = 36;
/** Extra pixels rendered above and below the viewport. */
const OVERSCAN_PX = 400;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const DAY_LABEL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

interface DayState {
  disabled: boolean;
  overstay: boolean;
  start: boolean;
  end: boolean;
  middle: boolean;
}

// One stylesheet for every day button: the state lives in data attributes,
// so a month renders as plain elements with no per-day style objects.
const GRID_SX = {
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gridAutoRows: `${ROW_HEIGHT}px`,
  "& .day": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // Range band: the cell carries the band, the button carries the circle.
    "&[data-middle]": { background: tokens.mist },
    "&[data-start]:not([data-end])": { background: `linear-gradient(90deg, transparent 50%, ${tokens.mist} 50%)` },
    "&[data-end]:not([data-start])": { background: `linear-gradient(90deg, ${tokens.mist} 50%, transparent 50%)` },
    "&[data-middle][data-overstay]": { background: tokens.redBorder },
  },
  "& .day > button": {
    position: "relative",
    width: "40px",
    height: "40px",
    maxWidth: "100%",
    padding: 0,
    border: "none",
    borderRadius: "50%",
    background: "transparent",
    color: tokens.text,
    fontFamily: tokens.fontBody,
    fontSize: "0.9rem",
    cursor: "pointer",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
  },
  "& .day[data-overstay] > button": {
    borderRadius: "8px",
    background: tokens.redBg,
    color: tokens.redText,
  },
  "& .day[data-middle][data-overstay] > button": { background: "transparent" },
  "& .day[data-start] > button, & .day[data-end] > button": {
    borderRadius: "50%",
    background: tokens.navy,
    color: tokens.white,
    fontWeight: 700,
  },
  "& .day[data-overstay][data-start] > button, & .day[data-overstay][data-end] > button": {
    background: tokens.red,
  },
  "& .day[data-disabled] > button": { color: tokens.border, cursor: "default" },
  // Blue dot below today when it isn't a range end
  "& .day[data-today]:not([data-start]):not([data-end]) > button::after": {
    content: '""',
    position: "absolute",
    bottom: "4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    background: tokens.navy,
  },
  "& .day > button:focus-visible": { outline: `2px solid ${tokens.navy}`, outlineOffset: "1px" },
};

interface MonthProps {
  month: CalendarMonth;
  top: number;
  today: string;
  dayState: (iso: string) => DayState;
  onPick: (iso: string) => void;
}

const Month = memo(function Month({ month, top, today, dayState, onPick }: MonthProps) {
  const { year, month: m, firstWeekday, daysInMonth } = month;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(<div key={`pad${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = isoDay(year, m, d);
    const s = dayState(iso);
    const label = DAY_LABEL.format(new Date(year, m, d));
    cells.push(
      <div
        key={iso}
        className="day"
        data-start={s.start || undefined}
        data-end={s.end || undefined}
        data-middle={s.middle || undefined}
        data-overstay={(s.overstay && !s.disabled) || undefined}
        data-disabled={s.disabled || undefined}
        data-today={iso === today || undefined}
      >
        <button
          type="button"
          disabled={s.disabled}
          aria-pressed={s.start || s.end || s.middle}
          aria-label={s.overstay && !s.disabled ? `${label}, would overstay` : label}
          onClick={() => onPick(iso)}
        >
          {d}
        </button>
      </div>,
    );
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top,
        left: 0,
        right: 0,
        contain: "layout paint",
      }}
    >
      <Box
        sx={{
          height: CAPTION_HEIGHT,
          display: "flex",
          alignItems: "center",
          px: "8px",
          fontFamily: tokens.fontBody,
          fontWeight: 700,
          fontSize: "0.88rem",
          color: tokens.text,
        }}
      >
        {MONTH_LABEL.format(new Date(year, m, 1))}
      </Box>
      <Box sx={GRID_SX}>{cells}</Box>
    </Box>
  );
});

export function TripDateRangeCalendar({
  entryDate,
  exitDate,
  onEntryChange,
  onExitChange,
  blockedRanges,
  overstay,
  scrollToTodayRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = todayISO();

  // Fixed for the calendar's lifetime so month positions never shift under
  // the user. Reaches back further if the trip being edited is older.
  const [layout] = useState(() => {
    const now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth() - MONTHS_BACK, 1);
    if (entryDate) {
      const [y, m] = entryDate.split("-").map(Number);
      const entryMonth = new Date(y, m - 1, 1);
      if (entryMonth < start) start = entryMonth;
    }
    const end = new Date(now.getFullYear(), now.getMonth() + MONTHS_FORWARD, 1);
    const count =
      (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    return buildLayout(start.getFullYear(), start.getMonth(), count);
  });
  const [visible, setVisible] = useState<[number, number]>([0, -1]);

  const updateVisible = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const [a, b] = visibleMonths(
      layout,
      el.scrollTop - OVERSCAN_PX,
      el.scrollTop + el.clientHeight + OVERSCAN_PX,
    );
    setVisible((prev) => (prev[0] === a && prev[1] === b ? prev : [a, b]));
  }, [layout]);

  const scrollToMonth = useCallback(
    (iso: string) => {
      const el = containerRef.current;
      const i = monthIndexOf(layout, iso);
      if (!el || i < 0) return;
      el.scrollTop = layout.offsets[i];
      updateVisible();
    },
    [layout, updateVisible],
  );

  useEffect(() => {
    if (scrollToTodayRef) scrollToTodayRef.current = () => scrollToMonth(todayISO());
  });

  // Open on the trip's month (or today's) before the first paint.
  useLayoutEffect(() => {
    scrollToMonth(entryDate || todayISO());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render only when the set of on-screen months changes, at most once a frame.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        updateVisible();
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateVisible]);

  const blocked = useMemo<IsoInterval[]>(
    () => (blockedRanges ?? []).map((r) => ({ from: formatDate(r.from), to: formatDate(r.to) })),
    [blockedRanges],
  );

  const current: IsoRange | undefined = entryDate
    ? { from: entryDate, to: exitDate || undefined }
    : undefined;
  const from = current?.from;
  const to = current?.to;

  const dayState = useMemo(() => {
    const sel: IsoRange | undefined = from ? { from, to } : undefined;
    // A day on or after the entry is red when a trip from the entry to that day
    // overstays (so the chosen exit shows the selected trip's state). Every
    // exit from the first overstaying one onward overstays, so one search
    // covers all of them. Earlier days preview the trip a tap would select.
    const threshold = from && overstay ? overstay.firstOverstayExit(from) : null;
    return (iso: string): DayState => {
      const disabled =
        (!!from && !to && iso < from) || blocked.some((b) => iso >= b.from && iso <= b.to);
      let isOver = false;
      if (overstay && !disabled) {
        if (from && iso >= from) {
          isOver = threshold !== null && iso >= threshold;
        } else {
          const next = nextRange(iso, sel, blocked) ?? { from: iso, to: iso };
          isOver = overstay.overstays(next.from, next.to ?? next.from);
        }
      }
      return {
        disabled,
        overstay: isOver,
        start: iso === from,
        end: !!to && iso === to,
        middle: !!from && !!to && iso > from && iso < to,
      };
    };
  }, [from, to, blocked, overstay]);

  const onPick = useCallback(
    (iso: string) => {
      const next = nextRange(iso, from ? { from, to } : undefined, blocked);
      onEntryChange(next?.from ?? "");
      onExitChange(next?.to ?? "");
    },
    [from, to, blocked, onEntryChange, onExitChange],
  );

  const months: React.ReactNode[] = [];
  for (let i = visible[0]; i <= visible[1]; i++) {
    const m = layout.months[i];
    months.push(
      <Month
        key={`${m.year}-${m.month}`}
        month={m}
        top={layout.offsets[i]}
        today={today}
        dayState={dayState}
        onPick={onPick}
      />,
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        aria-hidden
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: `1px solid ${tokens.border}`,
          pb: "4px",
        }}
      >
        {WEEKDAYS.map((w) => (
          <Box
            key={w}
            sx={{
              textAlign: "center",
              fontFamily: tokens.fontBody,
              fontSize: "0.75rem",
              color: tokens.textSoft,
            }}
          >
            {w}
          </Box>
        ))}
      </Box>
      <Box
        ref={containerRef}
        sx={{
          height: "55dvh",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Box sx={{ position: "relative", height: layout.offsets[layout.months.length] }}>
          {months}
        </Box>
      </Box>
    </Box>
  );
}
