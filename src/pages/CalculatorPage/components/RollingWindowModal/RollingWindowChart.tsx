import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { VISA_REGION_LABELS, type Trip, type VisaRegion } from "@/types";
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  parseDate,
} from "@/features/calculator/utils/dates";
import {
  tripEnd,
  tripLength,
  windowBands,
  type DateBounds,
  type TravelerTimeline,
} from "@/features/calculator/utils/rollingWindowExplorer";

/**
 * The explorer's timeline: the blog's rolling-window canvas
 * (astro/pages/blog/the-schengen-90-180-rolling-window.astro) redrawn as SVG,
 * with one row per traveler. Every trip is on the row: greyed out, or in its
 * destination's colour when that destination is active, solid for the days
 * that count in the window. Each active destination's window is laid over
 * the row; windows of different lengths nest (all end on the same date), so
 * the shorter one reads darker. A window turns red when the traveler is over
 * the limit of a destination using it. Dragging anywhere on the plot moves
 * the shared window end date.
 */

interface RollingWindowChartProps {
  timelines: TravelerTimeline[];
  /** Colour per active destination. */
  regionColors: ReadonlyMap<VisaRegion, string>;
  bounds: DateBounds;
  windowEnd: string;
  today: string;
  onWindowEndChange: (date: string) => void;
}

// ─── Palette (cursor matches the blog explorer) ───────────────────────────────

const GREEN = "#047857";
const WINDOW_BG = alpha(tokens.navy, 0.08);
const WINDOW_BORDER = alpha(tokens.navy, 0.28);
const RED_BG = "rgba(153,27,27,0.08)";
const RED_BORDER = "rgba(153,27,27,0.4)";
const INACTIVE_BAR = "rgba(160,170,187,0.35)";
const INACTIVE_BORDER = "rgba(160,170,187,0.55)";
const GRID = "rgba(0,0,0,0.07)";
const AXIS_TEXT = "rgba(0,0,0,0.45)";

// ─── Layout ───────────────────────────────────────────────────────────────────

const M_LEFT = 140;
const M_RIGHT = 16;
const M_TOP = 44;
const ROW_H = 24;
const ROW_GAP = 20;
const AXIS_H = 34;
const MIN_WIDTH = 560;
/** Minimum spacing between the window-start labels along the top. */
const LABEL_GAP = 120;

const fmtShort = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const fmtLong = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

const later = (a: string, b: string) => (a > b ? a : b);
const earlier = (a: string, b: string) => (a < b ? a : b);

// ─── Component ────────────────────────────────────────────────────────────────

export function RollingWindowChart({
  timelines,
  regionColors,
  bounds,
  windowEnd,
  today,
  onWindowEndChange,
}: RollingWindowChartProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);
  const dragging = useRef(false);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.max(MIN_WIDTH, Math.floor(entry.contentRect.width))),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const start = parseDate(bounds.start);
  // Plot spans whole days, bounds.end included.
  const total = differenceInCalendarDays(parseDate(bounds.end), start) + 1;
  const plotW = width - M_LEFT - M_RIGHT;
  const xOf = (iso: string) =>
    M_LEFT + (differenceInCalendarDays(parseDate(iso), start) / total) * plotW;
  /** x of the end of a day (the start of the next). */
  const xAfter = (iso: string) => xOf(formatDate(addDays(parseDate(iso), 1)));
  const clampX = (x: number) => Math.min(Math.max(x, M_LEFT), width - M_RIGHT);

  const rowY = (i: number) => M_TOP + i * (ROW_H + ROW_GAP);
  const axisY = rowY(timelines.length) - ROW_GAP + 14;
  const height = axisY + AXIS_H;

  // ── Month grid ──────────────────────────────────────────────────────────────
  const months: { iso: string; x: number; label: string; year?: string }[] = [];
  const pxPerMonth = (plotW / total) * 30.44;
  const labelStep = pxPerMonth < 22 ? 3 : pxPerMonth < 36 ? 2 : 1;
  {
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endDate = parseDate(bounds.end);
    let i = 0;
    while (cur <= endDate) {
      const iso = formatDate(cur);
      const showLabel = i % labelStep === 0;
      months.push({
        iso,
        x: xOf(iso),
        label: showLabel ? cur.toLocaleDateString("en-GB", { month: "short" }) : "",
        year: showLabel && (cur.getMonth() < labelStep || i === 0) ? String(cur.getFullYear()) : undefined,
      });
      cur.setMonth(cur.getMonth() + 1);
      i++;
    }
  }

  // ── Windows per row, and their start labels along the top ──────────────────
  const rows = timelines.map((timeline) => ({ timeline, bands: windowBands(timeline, windowEnd) }));
  const xEnd = clampX(xAfter(windowEnd));
  const endLabelX = Math.min(Math.max(xEnd, M_LEFT + 30), width - M_RIGHT - 30);

  const startLabels: { x: number; text: string }[] = [];
  {
    const lengths = new Map<number, string>();
    for (const { bands } of rows) for (const b of bands) lengths.set(b.windowDays, b.windowStart);
    const sorted = [...lengths.entries()]
      .map(([days, iso]) => ({ x: xOf(iso), text: `${fmtShort(iso)} · ${days}-day window` }))
      .filter((l) => l.x > M_LEFT && xEnd - l.x > LABEL_GAP)
      .sort((a, b) => a.x - b.x);
    for (const l of sorted) {
      const prev = startLabels[startLabels.length - 1];
      if (!prev || l.x - prev.x > LABEL_GAP) startLabels.push(l);
    }
  }

  const xToday = xOf(today);
  const todayVisible = today >= bounds.start && today <= bounds.end;

  // ── Dragging ────────────────────────────────────────────────────────────────
  function dateAt(clientX: number, svg: SVGSVGElement): string {
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * width;
    // The cursor sits at the end of the window's last day, hence the − 1.
    const dayIndex = Math.round(((x - M_LEFT) / plotW) * total) - 1;
    const clamped = Math.min(Math.max(dayIndex, 0), total - 1);
    return formatDate(addDays(start, clamped));
  }

  return (
    <Box ref={outerRef} sx={{ width: "100%", overflowX: "auto" }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Timeline from ${fmtLong(bounds.start)} to ${fmtLong(bounds.end)}, window ending ${fmtLong(windowEnd)}`}
        style={{ display: "block", fontFamily: tokens.fontBody, touchAction: "none", userSelect: "none" }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          onWindowEndChange(dateAt(e.clientX, e.currentTarget));
        }}
        onPointerMove={(e) => {
          if (dragging.current) onWindowEndChange(dateAt(e.clientX, e.currentTarget));
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* Plot area: the cursor hints that it can be dragged */}
        <rect x={M_LEFT} y={0} width={plotW} height={height} fill="transparent" style={{ cursor: "ew-resize" }} />

        {/* Month grid + axis labels */}
        {months.map((m) =>
          m.x >= M_LEFT && m.x <= width - M_RIGHT ? (
            <g key={m.iso} pointerEvents="none">
              <line x1={m.x} x2={m.x} y1={M_TOP - 8} y2={axisY} stroke={GRID} strokeWidth={0.5} />
              {m.label && m.x + 8 < width - M_RIGHT && (
                <text x={m.x + 3} y={axisY + 13} fontSize={11} fill={AXIS_TEXT}>
                  {m.label}
                </text>
              )}
              {m.year && (
                <text x={m.x + 3} y={axisY + 26} fontSize={10} fontWeight={600} fill={AXIS_TEXT}>
                  {m.year}
                </text>
              )}
            </g>
          ) : null,
        )}
        <line x1={M_LEFT} x2={width - M_RIGHT} y1={axisY} y2={axisY} stroke="rgba(0,0,0,0.12)" strokeWidth={0.5} />

        {/* Today */}
        {todayVisible && (
          <g pointerEvents="none">
            <line x1={xToday} x2={xToday} y1={M_TOP - 26} y2={axisY} stroke={alpha(tokens.navy, 0.3)} strokeWidth={1} strokeDasharray="2 3" />
            <text x={xToday + 3} y={M_TOP - 28} fontSize={10} fontWeight={600} fill={alpha(tokens.navy, 0.55)}>
              Today
            </text>
          </g>
        )}

        {rows.map(({ timeline, bands }, i) => {
          const y = rowY(i);
          const byRegion = new Map(timeline.jurisdictions.map((j) => [j.region, j]));
          const hasLimit = timeline.jurisdictions.some((j) => j.limit);
          const reasons = timeline.jurisdictions
            .filter((j) => !j.limit && j.trips.length > 0)
            .map((j) => `${VISA_REGION_LABELS[j.region]}: ${j.noLimitReason}`);
          return (
            <g key={timeline.travelerId} pointerEvents="none">
              {/* Traveler label */}
              <text x={0} y={y + ROW_H / 2 + 4} fontSize={12} fontWeight={600} fill={tokens.navy}>
                {truncate(timeline.travelerName, 18)}
                <title>{[timeline.travelerName, ...reasons].join("\n")}</title>
              </text>

              {/* Windows, longest first: shorter ones stack on top and read darker */}
              {hasLimit &&
                bands.map((band) => {
                  const x0 = clampX(xOf(band.windowStart));
                  if (xEnd <= x0) return null;
                  return (
                    <rect
                      key={band.windowDays}
                      x={x0}
                      y={y - 6}
                      width={xEnd - x0}
                      height={ROW_H + 12}
                      rx={4}
                      fill={band.over ? RED_BG : WINDOW_BG}
                      stroke={band.over ? RED_BORDER : WINDOW_BORDER}
                      strokeWidth={1}
                    >
                      <title>
                        {band.members
                          .map(
                            (m) =>
                              `${VISA_REGION_LABELS[m.region]}: ${m.stats.daysUsed} of ${m.stats.allowance} days in the ${band.windowDays} days to ${fmtLong(windowEnd)}`,
                          )
                          .join("\n")}
                      </title>
                    </rect>
                  );
                })}

              {/* Trips: inactive ones first, so active trips draw on top */}
              {[...timeline.trips]
                .sort((a, b) => Number(regionColors.has(a.region)) - Number(regionColors.has(b.region)))
                .map((trip) => {
                  const color = regionColors.get(trip.region);
                  const row = byRegion.get(trip.region);
                  const band = row?.limit ? bands.find((b) => b.windowDays === row.limit!.windowDays) : undefined;
                  return (
                    <TripBar
                      key={trip.id}
                      trip={trip}
                      y={y}
                      color={color}
                      windowStart={band?.windowStart}
                      windowEnd={windowEnd}
                      xOf={xOf}
                      xAfter={xAfter}
                      clampX={clampX}
                      plotRight={width - M_RIGHT}
                    />
                  );
                })}
            </g>
          );
        })}

        {/* Window end cursor, matching the blog's green dashed line + handle */}
        <g pointerEvents="none">
          <line x1={xEnd} x2={xEnd} y1={M_TOP - 8} y2={axisY} stroke={GREEN} strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={xEnd} cy={axisY} r={5} fill={GREEN} stroke="#fff" strokeWidth={2} />
          <text x={endLabelX} y={M_TOP - 12} fontSize={11} fontWeight={600} textAnchor="middle" fill={GREEN}>
            {fmtShort(windowEnd)}
          </text>
          {startLabels.map((l) => (
            <g key={l.text}>
              <line x1={l.x} x2={l.x} y1={M_TOP - 8} y2={M_TOP - 2} stroke={alpha(tokens.navy, 0.4)} strokeWidth={1} />
              <text x={l.x + 3} y={M_TOP - 12} fontSize={10} fontWeight={500} fill={alpha(tokens.navy, 0.6)}>
                {l.text}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </Box>
  );
}

// ─── Trip bar ─────────────────────────────────────────────────────────────────

function TripBar({
  trip,
  y,
  color,
  windowStart,
  windowEnd,
  xOf,
  xAfter,
  clampX,
  plotRight,
}: {
  trip: Trip;
  y: number;
  /** The destination's colour; undefined when it isn't active (greyed out). */
  color?: string;
  /** Start of the window that applies to this trip, if any. */
  windowStart?: string;
  windowEnd: string;
  xOf: (iso: string) => number;
  xAfter: (iso: string) => number;
  clampX: (x: number) => number;
  plotRight: number;
}) {
  const end = tripEnd(trip);
  const x0 = xOf(trip.entryDate);
  const x1 = xAfter(end);
  if (x1 < M_LEFT || x0 > plotRight) return null;
  const cx0 = clampX(x0);
  const cw = Math.max(clampX(x1) - cx0, 2);

  // Days inside the window, drawn solid.
  let countedX0 = 0;
  let countedX1 = 0;
  let inWindow = 0;
  if (color && windowStart) {
    const os = later(trip.entryDate, windowStart);
    const oe = earlier(end, windowEnd);
    if (os <= oe) {
      countedX0 = clampX(xOf(os));
      countedX1 = clampX(xAfter(oe));
      inWindow = differenceInCalendarDays(parseDate(oe), parseDate(os)) + 1;
    }
  }

  const label = trip.destination?.trim();
  const tooltip = [
    `${VISA_REGION_LABELS[trip.region]}${label ? `: ${label}` : ""}`,
    `${fmtLong(trip.entryDate)} – ${trip.exitDate ? fmtLong(trip.exitDate) : "ongoing"}`,
    `${tripLength(trip)} days${color && windowStart ? `, ${inWindow} in window` : ""}`,
  ].join("\n");

  return (
    <g>
      <title>{tooltip}</title>
      <rect
        x={cx0}
        y={y}
        width={cw}
        height={ROW_H}
        rx={4}
        fill={color ? alpha(color, 0.18) : INACTIVE_BAR}
        stroke={color ? alpha(color, 0.6) : INACTIVE_BORDER}
        strokeWidth={1}
        strokeDasharray={trip.exitDate ? undefined : "4 2"}
      />
      {countedX1 > countedX0 && (
        <rect x={countedX0} y={y} width={countedX1 - countedX0} height={ROW_H} rx={4} fill={color} />
      )}
      {color && label && cw > 70 && (
        <text
          x={cx0 + cw / 2}
          y={y + ROW_H / 2 + 4}
          fontSize={11}
          fontWeight={500}
          textAnchor="middle"
          fill={countedX1 - countedX0 > cw / 2 ? "rgba(255,255,255,0.95)" : "rgba(12,30,60,0.82)"}
        >
          {truncate(label, Math.floor(cw / 7))}
        </text>
      )}
    </g>
  );
}
