import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { VISA_REGION_LABELS, type VisaRegion } from "@/types";
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  parseDate,
} from "@/features/calculator/utils/dates";
import {
  rowWindowStats,
  tripDaysInWindow,
  tripEnd,
  tripLength,
  type DateBounds,
  type ExplorerRow,
} from "@/features/calculator/utils/rollingWindowExplorer";

/**
 * The explorer's timeline: the blog's rolling-window canvas
 * (astro/pages/blog/the-schengen-90-180-rolling-window.astro) redrawn as SVG,
 * with one row per traveler per destination. Each row carries its own window
 * band, sized by that traveler's rule and tinted red when they're over it.
 * Dragging anywhere on the plot moves the shared window end date.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChartRow extends ExplorerRow {
  color: string;
}

export interface ChartSection {
  region: VisaRegion;
  rows: ChartRow[];
}

interface RollingWindowChartProps {
  sections: ChartSection[];
  bounds: DateBounds;
  windowEnd: string;
  today: string;
  onWindowEndChange: (date: string) => void;
}

// ─── Palette (matches the blog explorer) ──────────────────────────────────────

const GREEN = "#047857";
const GREEN_BG = "rgba(4,120,87,0.07)";
const GREEN_BORDER = "rgba(4,120,87,0.35)";
const RED_BG = "rgba(153,27,27,0.08)";
const RED_BORDER = "rgba(153,27,27,0.35)";
const NEUTRAL_BAR = "#e5ebef";
const NEUTRAL_BORDER = "#aebfc9";
const GRID = "rgba(0,0,0,0.07)";
const AXIS_TEXT = "rgba(0,0,0,0.45)";

// ─── Layout ───────────────────────────────────────────────────────────────────

const M_LEFT = 150;
const M_RIGHT = 16;
const M_TOP = 40;
const SECTION_H = 28;
const ROW_H = 22;
const ROW_GAP = 12;
const SECTION_GAP = 10;
const AXIS_H = 34;
const MIN_WIDTH = 560;

const fmtShort = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const fmtLong = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function ruleSummary(rows: ChartRow[]): string {
  const rules = [...new Set(rows.flatMap((r) => (r.limit ? [`${r.limit.days}/${r.limit.windowDays}`] : [])))];
  if (rules.length === 0) return "No rolling window for these passports";
  if (rules.length === 1) {
    const [days, window] = rules[0].split("/");
    return `${days} days in any ${window}`;
  }
  return `Varies by passport: ${rules.join(", ")}`;
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/** Vertical positions: a header per destination, then one row per traveler. */
function layoutSections(sections: ChartSection[]) {
  let y = M_TOP;
  const placed = [];
  for (const section of sections) {
    const headerY = y;
    y += SECTION_H;
    const rows = [];
    for (const row of section.rows) {
      rows.push({ row, rowY: y });
      y += ROW_H + ROW_GAP;
    }
    y += SECTION_GAP;
    placed.push({ section, headerY, rows });
  }
  return { placed, axisY: y };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RollingWindowChart({
  sections,
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
  const xOfDay = (dayIndex: number) => M_LEFT + (dayIndex / total) * plotW;
  const xOf = (iso: string) => xOfDay(differenceInCalendarDays(parseDate(iso), start));
  const clampX = (x: number) => Math.min(Math.max(x, M_LEFT), width - M_RIGHT);

  const { placed, axisY } = layoutSections(sections);
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
      const x = xOf(iso);
      const showLabel = i % labelStep === 0;
      months.push({
        iso,
        x,
        label: showLabel ? cur.toLocaleDateString("en-GB", { month: "short" }) : "",
        year: showLabel && (cur.getMonth() < labelStep || i === 0) ? String(cur.getFullYear()) : undefined,
      });
      cur.setMonth(cur.getMonth() + 1);
      i++;
    }
  }

  // ── Window end cursor ───────────────────────────────────────────────────────
  const xEnd = clampX(xOf(formatDate(addDays(parseDate(windowEnd), 1))));
  const endLabelX = Math.min(Math.max(xEnd, M_LEFT + 30), width - M_RIGHT - 30);
  const windowSizes = new Set(
    sections.flatMap((s) => s.rows.flatMap((r) => (r.limit ? [r.limit.windowDays] : []))),
  );
  const sharedWindowDays = windowSizes.size === 1 ? [...windowSizes][0] : null;
  const sharedStart = sharedWindowDays
    ? formatDate(addDays(parseDate(windowEnd), -(sharedWindowDays - 1)))
    : null;
  const xSharedStart = sharedStart ? xOf(sharedStart) : 0;
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
              <line x1={m.x} x2={m.x} y1={M_TOP - 4} y2={axisY} stroke={GRID} strokeWidth={0.5} />
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
            <line x1={xToday} x2={xToday} y1={M_TOP - 22} y2={axisY} stroke={alpha(tokens.navy, 0.3)} strokeWidth={1} strokeDasharray="2 3" />
            <text x={xToday + 3} y={M_TOP - 24} fontSize={10} fontWeight={600} fill={alpha(tokens.navy, 0.55)}>
              Today
            </text>
          </g>
        )}

        {placed.map(({ section, headerY, rows }) => (
          <g key={section.region} pointerEvents="none">
            {/* Section header: destination and its rule */}
            <text x={0} y={headerY + 16} fontSize={12} fontWeight={700} fill={tokens.navy}>
              {VISA_REGION_LABELS[section.region]}
              <tspan dx={8} fontWeight={400} fill={tokens.textSoft}>
                {ruleSummary(section.rows)}
              </tspan>
            </text>

            {rows.map(({ row, rowY }) => {
              const stats = rowWindowStats(row, windowEnd);
              const bandX0 = stats ? clampX(xOf(stats.windowStart)) : 0;
              const bandX1 = xEnd;
              return (
                <g key={row.key}>
                  {/* Traveler label */}
                  <circle cx={6} cy={rowY + ROW_H / 2} r={4} fill={row.limit ? row.color : NEUTRAL_BORDER} />
                  <text
                    x={16}
                    y={rowY + ROW_H / 2 + 4}
                    fontSize={12}
                    fontWeight={600}
                    fill={row.limit ? row.color : tokens.textGhost}
                  >
                    {truncate(row.travelerName, 17)}
                    <title>{row.limit ? row.travelerName : `${row.travelerName}: ${row.noLimitReason}`}</title>
                  </text>

                  {/* This traveler's window */}
                  {stats && bandX1 > bandX0 && (
                    <rect
                      x={bandX0}
                      y={rowY - 5}
                      width={bandX1 - bandX0}
                      height={ROW_H + 10}
                      rx={4}
                      fill={stats.over ? RED_BG : GREEN_BG}
                      stroke={stats.over ? RED_BORDER : GREEN_BORDER}
                      strokeWidth={1}
                    />
                  )}

                  {/* Trips: tinted bar, solid where the days count in the window */}
                  {row.trips.map((trip) => {
                    const end = tripEnd(trip);
                    const x0 = xOf(trip.entryDate);
                    const x1 = xOf(formatDate(addDays(parseDate(end), 1)));
                    if (x1 < M_LEFT || x0 > width - M_RIGHT) return null;
                    const cx0 = clampX(x0);
                    const cw = Math.max(clampX(x1) - cx0, 2);
                    const inWindow = stats ? tripDaysInWindow(trip, stats.windowStart, windowEnd) : 0;
                    let countedX0 = 0;
                    let countedX1 = 0;
                    if (stats && inWindow > 0) {
                      const os = trip.entryDate > stats.windowStart ? trip.entryDate : stats.windowStart;
                      const oe = end < windowEnd ? end : windowEnd;
                      countedX0 = clampX(xOf(os));
                      countedX1 = clampX(xOf(formatDate(addDays(parseDate(oe), 1))));
                    }
                    const label = trip.destination?.trim();
                    return (
                      <g key={trip.id}>
                        <title>
                          {`${label ? `${label}\n` : ""}${fmtLong(trip.entryDate)} – ${trip.exitDate ? fmtLong(trip.exitDate) : "ongoing"}\n${tripLength(trip)} days${stats ? `, ${inWindow} in window` : ""}`}
                        </title>
                        <rect
                          x={cx0}
                          y={rowY}
                          width={cw}
                          height={ROW_H}
                          rx={4}
                          fill={row.limit ? alpha(row.color, 0.16) : NEUTRAL_BAR}
                          stroke={row.limit ? alpha(row.color, 0.55) : NEUTRAL_BORDER}
                          strokeWidth={1}
                          strokeDasharray={trip.exitDate ? undefined : "4 2"}
                        />
                        {countedX1 > countedX0 && (
                          <rect x={countedX0} y={rowY} width={countedX1 - countedX0} height={ROW_H} rx={4} fill={row.color} />
                        )}
                        {label && cw > 70 && (
                          <text
                            x={cx0 + cw / 2}
                            y={rowY + ROW_H / 2 + 4}
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
                  })}
                </g>
              );
            })}
          </g>
        ))}

        {/* Window end cursor, matching the blog's green dashed line + handle */}
        <g pointerEvents="none">
          <line x1={xEnd} x2={xEnd} y1={M_TOP - 4} y2={axisY} stroke={GREEN} strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={xEnd} cy={axisY} r={5} fill={GREEN} stroke="#fff" strokeWidth={2} />
          <text x={endLabelX} y={M_TOP - 8} fontSize={11} fontWeight={600} textAnchor="middle" fill={GREEN}>
            {fmtShort(windowEnd)}
          </text>
          {sharedStart && xSharedStart > M_LEFT && xEnd - xSharedStart > 90 && (
            <text x={xSharedStart + 2} y={M_TOP - 8} fontSize={10} fontWeight={500} fill="rgba(4,120,87,0.7)">
              {`${fmtShort(sharedStart)} · ${sharedWindowDays}-day window`}
            </text>
          )}
        </g>
      </svg>
    </Box>
  );
}
