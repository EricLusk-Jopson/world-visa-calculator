import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { tokens } from "@/styles/theme";
import type { Traveler, VisaRegion } from "@/types";
import { VISA_REGION_LABELS } from "@/types";
import { getTravelerColor } from "@/features/calculator/utils/travelerColours";
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  isValidDateString,
  parseDate,
  todayISO,
} from "@/features/calculator/utils/dates";
import {
  buildExplorerRows,
  clampDate,
  fitBounds,
  listExplorerDestinations,
  rowWindowStats,
  tripDaysInWindow,
  tripLength,
  type DateBounds,
} from "@/features/calculator/utils/rollingWindowExplorer";
import { RollingWindowChart, type ChartRow, type ChartSection } from "./RollingWindowChart";

/**
 * Desktop-only "Rolling Window" explorer: the blog's interactive 90/180
 * explainer, applied to the user's own travelers and trips. Pick one or more
 * rolling-window destinations and travelers, set the date range, and slide
 * the window end date to see which days count.
 *
 * Selections live in this component (which stays mounted while the dialog is
 * closed), so reopening the explorer keeps where the user left off.
 */

interface RollingWindowModalProps {
  open: boolean;
  onClose: () => void;
  travelers: Traveler[];
}

// Typed dates go through intermediate values like "0002-03-04"; ignore those.
const MIN_YEAR = 1990;
const MAX_YEAR = 2100;
const MIN_RANGE_DAYS = 30;

function isUsableDate(s: string): boolean {
  if (!isValidDateString(s)) return false;
  const year = parseDate(s).getFullYear();
  return year >= MIN_YEAR && year <= MAX_YEAR;
}

const fmtLong = (iso: string) =>
  parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// ─── Styles ───────────────────────────────────────────────────────────────────

const EYEBROW_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.65rem",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: tokens.greenText,
} as const;

const SIDEBAR_HEADING_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: tokens.textSoft,
  mb: "8px",
} as const;

const CARD_SX = {
  bgcolor: tokens.white,
  border: `1px solid ${tokens.border}`,
  borderRadius: "16px",
  p: "20px 24px",
  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
} as const;

const DATE_INPUT_SX = {
  width: "100%",
  px: "10px",
  py: "7px",
  border: `1px solid ${tokens.border}`,
  borderRadius: "8px",
  bgcolor: tokens.white,
  color: tokens.text,
  fontFamily: tokens.fontBody,
  fontSize: "0.8rem",
  colorScheme: "light",
  "&:focus": { outline: `2px solid ${alpha(tokens.green, 0.4)}`, borderColor: tokens.green },
} as const;

const TEXT_BUTTON_SX = {
  border: `1px solid ${tokens.border}`,
  borderRadius: "7px",
  bgcolor: tokens.white,
  color: tokens.navy,
  fontFamily: tokens.fontBody,
  fontSize: "0.75rem",
  fontWeight: 600,
  px: "10px",
  py: "5px",
  cursor: "pointer",
  "&:hover:not(:disabled)": { bgcolor: tokens.mist },
  "&:disabled": { color: tokens.textGhost, cursor: "default" },
} as const;

// ─── Sidebar toggle row ───────────────────────────────────────────────────────

function ToggleRow({
  checked,
  disabled,
  onToggle,
  color,
  label,
  detail,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
  color: string;
  label: string;
  detail?: string;
}) {
  return (
    <Box
      component="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        textAlign: "left",
        px: "10px",
        py: "7px",
        border: "1px solid",
        borderColor: checked ? alpha(color, 0.45) : "transparent",
        borderRadius: "9px",
        bgcolor: checked ? alpha(color, 0.07) : "transparent",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 0.15s, border-color 0.15s",
        "&:hover:not(:disabled)": { bgcolor: alpha(color, checked ? 0.11 : 0.05) },
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: "4px",
          border: `1.5px solid ${checked ? color : tokens.textGhost}`,
          bgcolor: checked ? color : "transparent",
          color: tokens.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <CheckIcon sx={{ fontSize: "0.75rem" }} />}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          noWrap
          sx={{ fontFamily: tokens.fontBody, fontSize: "0.82rem", fontWeight: 600, color: tokens.text }}
        >
          {label}
        </Typography>
        {detail && (
          <Typography
            noWrap
            sx={{ fontFamily: tokens.fontBody, fontSize: "0.7rem", color: tokens.textSoft }}
          >
            {detail}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RollingWindowModal({ open, onClose, travelers }: RollingWindowModalProps) {
  const today = todayISO();

  // null = not chosen yet: the most-visited rolling-window destination.
  const [chosenRegions, setChosenRegions] = useState<VisaRegion[] | null>(null);
  const [hiddenTravelerIds, setHiddenTravelerIds] = useState<string[]>([]);
  // null = fit to the selected trips.
  const [customBounds, setCustomBounds] = useState<DateBounds | null>(null);
  // null = today (clamped into the bounds).
  const [chosenWindowEnd, setChosenWindowEnd] = useState<string | null>(null);

  const destinations = useMemo(
    () => listExplorerDestinations(travelers, today),
    [travelers, today],
  );
  const supported = destinations.filter((d) => d.supported).map((d) => d.region);

  const selectedRegions = chosenRegions
    ? supported.filter((r) => chosenRegions.includes(r))
    : supported.slice(0, 1);

  const visibleTravelers = travelers.filter((t) => !hiddenTravelerIds.includes(t.id));

  // Bounds are fitted to rules as of today, so moving the window can't
  // resize the range it moves in.
  const fittedBounds = useMemo(
    () => fitBounds(buildExplorerRows(visibleTravelers, selectedRegions, today)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers, hiddenTravelerIds, selectedRegions.join(","), today],
  );
  const bounds = customBounds ?? fittedBounds;
  const windowEnd = clampDate(chosenWindowEnd ?? today, bounds);
  const totalDays = differenceInCalendarDays(parseDate(bounds.end), parseDate(bounds.start));

  const colorOf = (travelerId: string) =>
    getTravelerColor(Math.max(0, travelers.findIndex((t) => t.id === travelerId)));

  // A traveler only gets a row in destinations they have trips to.
  const rows: ChartRow[] = buildExplorerRows(visibleTravelers, selectedRegions, windowEnd)
    .filter((r) => r.trips.length > 0)
    .map((r) => ({ ...r, color: colorOf(r.travelerId) }));
  const sections: ChartSection[] = selectedRegions
    .map((region) => ({ region, rows: rows.filter((r) => r.region === region) }))
    .filter((s) => s.rows.length > 0);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function toggleRegion(region: VisaRegion) {
    setChosenRegions(
      selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region],
    );
  }

  function toggleTraveler(id: string) {
    setHiddenTravelerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function setBound(which: keyof DateBounds, value: string) {
    if (!isUsableDate(value)) return;
    const next = { ...bounds, [which]: value };
    if (differenceInCalendarDays(parseDate(next.end), parseDate(next.start)) < MIN_RANGE_DAYS) return;
    setCustomBounds(next);
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const hasDestinations = destinations.length > 0;
  const emptyMessage = !hasDestinations
    ? "Add a trip to a destination with a rolling window (such as the Schengen Area) to see it here."
    : supported.length === 0
      ? "None of these trips are to a destination with a rolling window."
      : selectedRegions.length === 0
        ? "Pick at least one destination."
        : visibleTravelers.length === 0
          ? "Pick at least one traveler."
          : rows.length === 0
            ? "The selected travelers have no trips to these destinations."
            : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      aria-labelledby="rolling-window-title"
      slotProps={{
        paper: {
          sx: {
            width: "min(1480px, calc(100vw - 48px))",
            height: "calc(100vh - 48px)",
            maxHeight: "none",
            m: 0,
            borderRadius: "20px",
            bgcolor: tokens.offWhite,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          px: "28px",
          py: "18px",
          bgcolor: tokens.white,
          borderBottom: `1px solid ${tokens.border}`,
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography sx={EYEBROW_SX}>Interactive timeline</Typography>
          <Typography
            id="rolling-window-title"
            sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.35rem", color: tokens.navy, lineHeight: 1.3 }}
          >
            Rolling window explorer
          </Typography>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.textSoft, mt: "2px" }}>
            Slide the window across your trips to see which days count toward each traveler's limit on any date.
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close" size="small" sx={{ color: tokens.textSoft }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <Box
          component="aside"
          sx={{
            width: 270,
            flexShrink: 0,
            overflowY: "auto",
            p: "20px 16px",
            bgcolor: tokens.white,
            borderRight: `1px solid ${tokens.border}`,
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <Box role="group" aria-label="Destinations">
            <Typography sx={SIDEBAR_HEADING_SX}>Destinations</Typography>
            {!hasDestinations && (
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", color: tokens.textGhost, px: "10px" }}>
                No trips yet
              </Typography>
            )}
            {destinations.map((d) => (
              <ToggleRow
                key={d.region}
                checked={selectedRegions.includes(d.region)}
                disabled={!d.supported}
                onToggle={() => toggleRegion(d.region)}
                color={tokens.greenText}
                label={VISA_REGION_LABELS[d.region]}
                detail={
                  d.supported
                    ? `${d.tripCount} ${d.tripCount === 1 ? "trip" : "trips"}`
                    : "Not a rolling window"
                }
              />
            ))}
          </Box>

          <Box role="group" aria-label="Travelers">
            <Typography sx={SIDEBAR_HEADING_SX}>Travelers</Typography>
            {travelers.map((t) => (
              <ToggleRow
                key={t.id}
                checked={!hiddenTravelerIds.includes(t.id)}
                onToggle={() => toggleTraveler(t.id)}
                color={colorOf(t.id)}
                label={t.name}
              />
            ))}
          </Box>

          <Box>
            <Typography sx={SIDEBAR_HEADING_SX}>Date range</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", px: "2px" }}>
              <Box component="label" sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft }}>
                From
                <Box
                  component="input"
                  type="date"
                  value={bounds.start}
                  max={formatDate(addDays(parseDate(bounds.end), -MIN_RANGE_DAYS))}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBound("start", e.target.value)}
                  sx={{ ...DATE_INPUT_SX, mt: "3px" }}
                />
              </Box>
              <Box component="label" sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft }}>
                To
                <Box
                  component="input"
                  type="date"
                  value={bounds.end}
                  min={formatDate(addDays(parseDate(bounds.start), MIN_RANGE_DAYS))}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBound("end", e.target.value)}
                  sx={{ ...DATE_INPUT_SX, mt: "3px" }}
                />
              </Box>
              <Box
                component="button"
                onClick={() => setCustomBounds(null)}
                disabled={customBounds === null}
                sx={{ ...TEXT_BUTTON_SX, alignSelf: "flex-start" }}
              >
                Fit to trips
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", p: "24px 28px 32px" }}>
          {emptyMessage ? (
            <Box sx={{ ...CARD_SX, textAlign: "center", py: "48px" }}>
              <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.9rem", color: tokens.textSoft }}>
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Timeline */}
              <Box component="figure" sx={{ ...CARD_SX, m: 0 }}>
                <Box
                  component="figcaption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    mb: "6px",
                    fontFamily: tokens.fontBody,
                  }}
                >
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", fontWeight: 650, color: tokens.navy }}>
                    {fmtLong(bounds.start)} – {fmtLong(bounds.end)}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "16px", fontSize: "0.7rem", color: tokens.textSoft }}>
                    <LegendSwatch fill={alpha(tokens.navy, 0.75)} label="Counted days" />
                    <LegendSwatch fill={alpha(tokens.navy, 0.12)} border={alpha(tokens.navy, 0.4)} label="Not counted" />
                    <LegendSwatch fill="rgba(4,120,87,0.12)" border="rgba(4,120,87,0.45)" label="Window, within limit" />
                    <LegendSwatch fill="rgba(153,27,27,0.12)" border="rgba(153,27,27,0.45)" label="Window, over limit" />
                  </Box>
                </Box>

                <RollingWindowChart
                  sections={sections}
                  bounds={bounds}
                  windowEnd={windowEnd}
                  today={today}
                  onWindowEndChange={setChosenWindowEnd}
                />

                {/* Slider */}
                <Box component="label" sx={{ display: "block", mt: "14px" }}>
                  <Box
                    component="span"
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: tokens.fontBody,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: tokens.navy,
                    }}
                  >
                    <span>Move the date (or drag on the timeline)</span>
                    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Box
                        component="button"
                        type="button"
                        onClick={() => setChosenWindowEnd(today)}
                        disabled={windowEnd === today || today < bounds.start || today > bounds.end}
                        sx={TEXT_BUTTON_SX}
                      >
                        Today
                      </Box>
                      <Box component="output" sx={{ color: tokens.greenText, fontVariantNumeric: "tabular-nums" }}>
                        {fmtLong(windowEnd)}
                      </Box>
                    </Box>
                  </Box>
                  <Box
                    component="input"
                    type="range"
                    min={0}
                    max={totalDays}
                    step={1}
                    value={differenceInCalendarDays(parseDate(windowEnd), parseDate(bounds.start))}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setChosenWindowEnd(formatDate(addDays(parseDate(bounds.start), Number(e.target.value))))
                    }
                    aria-label="Window end date"
                    aria-valuetext={fmtLong(windowEnd)}
                    sx={{
                      display: "block",
                      width: "100%",
                      height: "32px",
                      m: "2px 0 0",
                      accentColor: tokens.greenText,
                      cursor: "ew-resize",
                    }}
                  />
                </Box>
              </Box>

              {/* Stats per row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "10px",
                  mt: "18px",
                }}
              >
                {rows.map((row) => (
                  <StatCard key={row.key} row={row} windowEnd={windowEnd} showRegion={selectedRegions.length > 1} />
                ))}
              </Box>

              {/* Trips table */}
              <TripsTable rows={rows} windowEnd={windowEnd} />
            </>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function LegendSwatch({ fill, border, label }: { fill: string; border?: string; label: string }) {
  return (
    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
      <Box
        component="i"
        aria-hidden="true"
        sx={{
          width: 10,
          height: 10,
          borderRadius: "2px",
          bgcolor: fill,
          border: border ? `1px solid ${border}` : "none",
        }}
      />
      {label}
    </Box>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ row, windowEnd, showRegion }: { row: ChartRow; windowEnd: string; showRegion: boolean }) {
  const stats = rowWindowStats(row, windowEnd);
  const valueColor = !stats
    ? tokens.textGhost
    : stats.over || stats.remaining === 0
      ? tokens.redText
      : stats.remaining < stats.allowance * 0.25
        ? tokens.amberText
        : tokens.greenText;

  return (
    <Box
      sx={{
        minWidth: 0,
        p: "11px 13px",
        border: `1px solid ${stats ? "#dce9e1" : tokens.border}`,
        borderLeft: `3px solid ${stats ? row.color : tokens.textGhost}`,
        bgcolor: stats ? "#f4f9f6" : tokens.white,
        borderRadius: "9px",
      }}
    >
      <Typography noWrap sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: stats ? row.color : tokens.textSoft }}>
        {row.travelerName}
        {showRegion && (
          <Box component="span" sx={{ color: tokens.textSoft, fontWeight: 400 }}>
            {" · "}
            {VISA_REGION_LABELS[row.region]}
          </Box>
        )}
      </Typography>
      {stats ? (
        <>
          <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.75rem", lineHeight: 1.1, color: valueColor }}>
            {stats.daysUsed}
            <Box component="span" sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, ml: "4px" }}>
              / {stats.allowance}
            </Box>
          </Typography>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, mt: "2px" }}>
            {stats.over
              ? `Over by ${stats.daysUsed - stats.allowance} ${stats.daysUsed - stats.allowance === 1 ? "day" : "days"}`
              : stats.remaining === 0
                ? "No allowance left"
                : `${stats.remaining} ${stats.remaining === 1 ? "day" : "days"} left`}
            {" · "}
            {fmtLong(stats.windowStart)} – {fmtLong(stats.windowEnd)}
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, mt: "4px" }}>
          {row.noLimitReason}
        </Typography>
      )}
    </Box>
  );
}

// ─── Trips table ──────────────────────────────────────────────────────────────

const CELL_SX = {
  py: "9px",
  px: 0,
  textAlign: "right",
  fontFamily: tokens.fontBody,
  fontSize: "0.75rem",
  borderTop: "1px solid #edf1f4",
} as const;

function TripsTable({ rows, windowEnd }: { rows: ChartRow[]; windowEnd: string }) {
  const lines = rows.flatMap((row) => {
    const stats = rowWindowStats(row, windowEnd);
    return row.trips.map((trip) => ({ row, trip, stats }));
  });
  if (lines.length === 0) return null;

  return (
    <Box
      component="table"
      sx={{
        ...CARD_SX,
        width: "100%",
        mt: "18px",
        borderCollapse: "separate",
        borderSpacing: 0,
        fontVariantNumeric: "tabular-nums",
        color: tokens.navy,
      }}
    >
      <Box component="caption" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Trip lengths and days counted in the selected window
      </Box>
      <thead>
        <tr>
          {["Trip", "Traveler", "Destination", "Full trip", "In window"].map((h, i) => (
            <Box
              component="th"
              scope="col"
              key={h}
              sx={{
                pb: "7px",
                textAlign: i < 3 ? "left" : "right",
                fontFamily: tokens.fontBody,
                fontSize: i === 0 ? "0.75rem" : "0.65rem",
                fontWeight: i === 0 ? 650 : 500,
                color: i === 0 ? tokens.navy : tokens.textSoft,
              }}
            >
              {h}
            </Box>
          ))}
        </tr>
      </thead>
      <tbody>
        {lines.map(({ row, trip, stats }) => {
          const counted = stats ? tripDaysInWindow(trip, stats.windowStart, windowEnd) : null;
          return (
            <tr key={`${row.key}:${trip.id}`}>
              <Box component="th" scope="row" sx={{ ...CELL_SX, textAlign: "left", fontWeight: 400 }}>
                <Box component="span" sx={{ display: "block", fontWeight: 650 }}>
                  {trip.destination?.trim() || VISA_REGION_LABELS[trip.region]}
                </Box>
                <Box component="span" sx={{ display: "block", color: tokens.textSoft, fontSize: "0.7rem", mt: "2px" }}>
                  {fmtLong(trip.entryDate)} – {trip.exitDate ? fmtLong(trip.exitDate) : "ongoing"}
                </Box>
              </Box>
              <Box component="td" sx={{ ...CELL_SX, textAlign: "left", color: row.color, fontWeight: 600 }}>
                {row.travelerName}
              </Box>
              <Box component="td" sx={{ ...CELL_SX, textAlign: "left", color: tokens.textSoft }}>
                {VISA_REGION_LABELS[row.region]}
              </Box>
              <Box component="td" sx={CELL_SX}>
                {tripLength(trip)}
                <Box component="span" sx={{ fontSize: "0.65rem", color: tokens.textSoft }}> days</Box>
              </Box>
              <Box component="td" sx={CELL_SX}>
                {counted === null ? (
                  <Box component="span" sx={{ color: tokens.textGhost }}>n/a</Box>
                ) : (
                  <>
                    <Box component="strong" sx={{ color: tokens.greenText, fontSize: "0.88rem" }}>{counted}</Box>
                    <Box component="span" sx={{ fontSize: "0.65rem", color: tokens.textSoft }}>
                      {counted === 1 ? " day" : " days"}
                    </Box>
                  </>
                )}
              </Box>
            </tr>
          );
        })}
      </tbody>
    </Box>
  );
}
