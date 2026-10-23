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
import {
  JURISDICTION_PALETTE,
  nextFreeJurisdictionColor,
} from "@/features/calculator/utils/jurisdictionColours";
import {
  addDays,
  differenceInCalendarDays,
  formatDate,
  isValidDateString,
  parseDate,
  todayISO,
} from "@/features/calculator/utils/dates";
import {
  buildTravelerTimelines,
  clampDate,
  countTripsOutside,
  fitBounds,
  listExplorerDestinations,
  longestWindowDays,
  rowWindowStats,
  tripDaysInWindow,
  tripLength,
  tripOverlaps,
  type DateBounds,
  type TravelerTimeline,
} from "@/features/calculator/utils/rollingWindowExplorer";
import { RollingWindowChart } from "./RollingWindowChart";

/**
 * Desktop-only "Rolling Window" explorer: the blog's interactive 90/180
 * explainer, applied to the user's own travelers and trips. Set the date
 * range, pick up to four rolling-window destinations in it and the
 * travelers to show, then slide the window end date to see which days count.
 *
 * Selections live in this component (which stays mounted while the dialog is
 * closed), so reopening the explorer keeps where the user left off.
 */

interface RollingWindowModalProps {
  open: boolean;
  onClose: () => void;
  travelers: Traveler[];
}

interface ActiveDestination {
  region: VisaRegion;
  color: string;
}

const MAX_ACTIVE = JURISDICTION_PALETTE.length;

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

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

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

const NOTE_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.72rem",
  lineHeight: 1.5,
  color: tokens.textSoft,
  px: "10px",
  mt: "8px",
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

const LINK_BUTTON_SX = {
  p: 0,
  border: "none",
  bgcolor: "transparent",
  color: tokens.greenText,
  fontFamily: tokens.fontBody,
  fontSize: "inherit",
  fontWeight: 600,
  textDecoration: "underline",
  cursor: "pointer",
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
  const [chosen, setChosen] = useState<ActiveDestination[] | null>(null);
  const [hiddenTravelerIds, setHiddenTravelerIds] = useState<string[]>([]);
  // null = fit to every trip of the visible travelers.
  const [customBounds, setCustomBounds] = useState<DateBounds | null>(null);
  // null = today (clamped into the bounds).
  const [chosenWindowEnd, setChosenWindowEnd] = useState<string | null>(null);

  const visibleTravelers = useMemo(
    () => travelers.filter((t) => !hiddenTravelerIds.includes(t.id)),
    [travelers, hiddenTravelerIds],
  );
  const hiddenTripCount = travelers
    .filter((t) => hiddenTravelerIds.includes(t.id))
    .reduce((n, t) => n + t.trips.length, 0);

  // ── Date range, then the destinations inside it ────────────────────────────
  const fittedBounds = useMemo(
    () =>
      fitBounds(
        visibleTravelers.flatMap((t) => t.trips),
        longestWindowDays(visibleTravelers, today),
      ),
    [visibleTravelers, today],
  );
  const bounds = customBounds ?? fittedBounds;
  const windowEnd = clampDate(chosenWindowEnd ?? today, bounds);
  const totalDays = differenceInCalendarDays(parseDate(bounds.end), parseDate(bounds.start));

  // Only rolling-window destinations are offered; trips elsewhere stay on
  // the timeline as ghosts.
  const destinations = useMemo(
    () => listExplorerDestinations(visibleTravelers, today, bounds).filter((d) => d.supported),
    [visibleTravelers, today, bounds],
  );
  const supported = destinations.map((d) => d.region);
  const outsideCount = countTripsOutside(visibleTravelers, bounds);

  const active: ActiveDestination[] = chosen
    ? chosen.filter((c) => supported.includes(c.region))
    : supported.slice(0, 1).map((region) => ({ region, color: JURISDICTION_PALETTE[0] }));
  const regionColors = new Map(active.map((a) => [a.region, a.color]));
  const rollingRegions = new Set(supported);

  const timelines = buildTravelerTimelines(
    visibleTravelers,
    active.map((a) => a.region),
    windowEnd,
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  function toggleRegion(region: VisaRegion) {
    if (regionColors.has(region)) {
      setChosen(active.filter((a) => a.region !== region));
      return;
    }
    const color = nextFreeJurisdictionColor(active.map((a) => a.color));
    if (color) setChosen([...active, { region, color }]);
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

  const hasTrips = travelers.some((t) => t.trips.length > 0);
  const emptyMessage = !hasTrips
    ? "Add a trip to a destination with a rolling window (such as the Schengen Area) to see it here."
    : visibleTravelers.length === 0
      ? "Pick at least one traveler."
      : null;
  const hint =
    supported.length === 0
      ? "No trips to a destination with a rolling window in this date range."
      : active.length === 0
        ? "Pick a destination to see its rolling window."
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
                Fit to all trips
              </Box>
            </Box>
          </Box>

          <Box role="group" aria-label="Destinations">
            <Typography sx={SIDEBAR_HEADING_SX}>Destinations</Typography>
            {destinations.length === 0 && (
              <Typography sx={{ ...NOTE_SX, mt: 0 }}>No rolling-window trips in this date range</Typography>
            )}
            {destinations.map((d) => {
              const isActive = regionColors.has(d.region);
              const full = !isActive && active.length >= MAX_ACTIVE;
              return (
                <ToggleRow
                  key={d.region}
                  checked={isActive}
                  disabled={full}
                  onToggle={() => toggleRegion(d.region)}
                  color={regionColors.get(d.region) ?? tokens.navy}
                  label={VISA_REGION_LABELS[d.region]}
                  detail={full ? `Up to ${MAX_ACTIVE} at a time` : plural(d.tripCount, "trip", "trips")}
                />
              );
            })}
            {(outsideCount > 0 || hiddenTripCount > 0) && (
              <Typography sx={NOTE_SX}>
                {outsideCount > 0 && (
                  <>
                    {plural(outsideCount, "trip", "trips")} in your history{" "}
                    {outsideCount === 1 ? "is" : "are"} outside this date range.{" "}
                    <Box component="button" onClick={() => setCustomBounds(null)} sx={LINK_BUTTON_SX}>
                      Include all
                    </Box>
                  </>
                )}
                {outsideCount > 0 && hiddenTripCount > 0 && " "}
                {hiddenTripCount > 0 &&
                  `${plural(hiddenTripCount, "trip belongs", "trips belong")} to hidden travelers.`}
              </Typography>
            )}
          </Box>

          <Box role="group" aria-label="Travelers">
            <Typography sx={SIDEBAR_HEADING_SX}>Travelers</Typography>
            {travelers.map((t) => (
              <ToggleRow
                key={t.id}
                checked={!hiddenTravelerIds.includes(t.id)}
                onToggle={() => toggleTraveler(t.id)}
                color={tokens.navy}
                label={t.name}
              />
            ))}
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
                    flexWrap: "wrap",
                    gap: "8px 16px",
                    mb: "6px",
                  }}
                >
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", fontWeight: 650, color: tokens.navy }}>
                    {fmtLong(bounds.start)} – {fmtLong(bounds.end)}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontFamily: tokens.fontBody, fontSize: "0.7rem", color: tokens.textSoft }}>
                    {active.map((a) => (
                      <LegendSwatch key={a.region} fill={a.color} label={VISA_REGION_LABELS[a.region]} />
                    ))}
                    <LegendSwatch fill="rgba(160,170,187,0.35)" border="rgba(160,170,187,0.55)" label="Not selected" />
                    <LegendSwatch fill="rgba(160,170,187,0.1)" border="rgba(160,170,187,0.3)" label="No rolling window" />
                    <LegendSwatch fill={alpha(tokens.navy, 0.75)} label="Solid: counted in window" />
                    <LegendSwatch fill={alpha(tokens.navy, 0.08)} border={alpha(tokens.navy, 0.35)} label="Window" />
                    <LegendSwatch fill="rgba(153,27,27,0.12)" border="rgba(153,27,27,0.45)" label="Over the limit" />
                  </Box>
                </Box>
                {hint && (
                  <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, mb: "4px" }}>
                    {hint}
                  </Typography>
                )}

                <RollingWindowChart
                  timelines={timelines}
                  regionColors={regionColors}
                  rollingRegions={rollingRegions}
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

              {/* One card per traveler: their standing, then their trips */}
              {active.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))",
                    gap: "14px",
                    mt: "18px",
                  }}
                >
                  {timelines.map((timeline) => (
                    <TravelerCard
                      key={timeline.travelerId}
                      timeline={timeline}
                      regionColors={regionColors}
                      bounds={bounds}
                      windowEnd={windowEnd}
                    />
                  ))}
                </Box>
              )}
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

// ─── Traveler card ────────────────────────────────────────────────────────────

const CELL_SX = {
  py: "8px",
  px: 0,
  textAlign: "right",
  fontFamily: tokens.fontBody,
  fontSize: "0.75rem",
  borderTop: "1px solid #edf1f4",
  verticalAlign: "top",
} as const;

function Dot({ color }: { color: string }) {
  return (
    <Box
      component="span"
      aria-hidden="true"
      sx={{ display: "inline-block", width: 8, height: 8, borderRadius: "2px", bgcolor: color, flexShrink: 0, mt: "5px" }}
    />
  );
}

/**
 * A traveler's standing in each active destination they've been to in the
 * range (days used of the allowance, in their own window), then those trips
 * with the days each one contributes to the window.
 */
function TravelerCard({
  timeline,
  regionColors,
  bounds,
  windowEnd,
}: {
  timeline: TravelerTimeline;
  regionColors: ReadonlyMap<VisaRegion, string>;
  bounds: DateBounds;
  windowEnd: string;
}) {
  const jurisdictions = timeline.jurisdictions
    .map((row) => ({ row, inRange: row.trips.filter((t) => tripOverlaps(t, bounds)) }))
    .filter((j) => j.inRange.length > 0);
  const trips = jurisdictions
    .flatMap(({ row, inRange }) => inRange.map((trip) => ({ row, trip })))
    .sort((a, b) => (a.trip.entryDate < b.trip.entryDate ? -1 : 1));

  return (
    <Box sx={{ ...CARD_SX, p: "16px 20px" }}>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.9rem", fontWeight: 700, color: tokens.navy }}>
        {timeline.travelerName}
      </Typography>

      {jurisdictions.length === 0 ? (
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.75rem", color: tokens.textSoft, mt: "6px" }}>
          No trips to the selected destinations in this date range.
        </Typography>
      ) : (
        <>
          {/* Standing per destination */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "10px", mt: "10px" }}>
            {jurisdictions.map(({ row }) => {
              const color = regionColors.get(row.region) ?? tokens.textGhost;
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
                  key={row.region}
                  sx={{
                    flex: "1 1 180px",
                    minWidth: 0,
                    p: "9px 12px",
                    borderRadius: "9px",
                    border: `1px solid ${tokens.border}`,
                    borderLeft: `3px solid ${color}`,
                    bgcolor: tokens.offWhite,
                  }}
                >
                  <Typography noWrap sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", fontWeight: 600, color: tokens.textSoft }}>
                    {VISA_REGION_LABELS[row.region]}
                    {row.limit && ` · ${row.limit.days} in ${row.limit.windowDays}`}
                  </Typography>
                  {stats ? (
                    <>
                      <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1.5rem", lineHeight: 1.15, color: valueColor }}>
                        {stats.daysUsed}
                        <Box component="span" sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, ml: "4px" }}>
                          / {stats.allowance}
                        </Box>
                      </Typography>
                      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.7rem", color: tokens.textSoft }}>
                        {stats.over
                          ? `Over by ${plural(stats.daysUsed - stats.allowance, "day", "days")}`
                          : stats.remaining === 0
                            ? "No allowance left"
                            : `${plural(stats.remaining, "day", "days")} left`}
                        {` · since ${fmtLong(stats.windowStart)}`}
                      </Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft, mt: "4px" }}>
                      {row.noLimitReason}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Trips */}
          <Box
            component="table"
            sx={{ width: "100%", mt: "12px", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums", color: tokens.navy }}
          >
            <Box component="caption" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
              {timeline.travelerName}'s trips and the days each counts in the window
            </Box>
            <thead>
              <tr>
                {["Trip", "Full trip", "In window"].map((h, i) => (
                  <Box
                    component="th"
                    scope="col"
                    key={h}
                    sx={{
                      pb: "6px",
                      textAlign: i === 0 ? "left" : "right",
                      fontFamily: tokens.fontBody,
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      color: tokens.textSoft,
                      width: i === 0 ? "auto" : "90px",
                    }}
                  >
                    {h}
                  </Box>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map(({ row, trip }) => {
                const stats = rowWindowStats(row, windowEnd);
                const counted = stats ? tripDaysInWindow(trip, stats.windowStart, windowEnd) : null;
                const label = trip.destination?.trim();
                return (
                  <tr key={trip.id}>
                    <Box component="th" scope="row" sx={{ ...CELL_SX, textAlign: "left", fontWeight: 400 }}>
                      <Box sx={{ display: "flex", gap: "8px" }}>
                        <Dot color={regionColors.get(row.region) ?? tokens.textGhost} />
                        <Box sx={{ minWidth: 0 }}>
                          <Box component="span" sx={{ display: "block", fontWeight: 650 }}>
                            {label || VISA_REGION_LABELS[trip.region]}
                          </Box>
                          <Box component="span" sx={{ display: "block", color: tokens.textSoft, fontSize: "0.7rem", mt: "1px" }}>
                            {label && `${VISA_REGION_LABELS[trip.region]} · `}
                            {fmtLong(trip.entryDate)} – {trip.exitDate ? fmtLong(trip.exitDate) : "ongoing"}
                          </Box>
                        </Box>
                      </Box>
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
                          <Box
                            component="strong"
                            sx={{ color: counted > 0 ? tokens.greenText : tokens.textGhost, fontSize: "0.88rem" }}
                          >
                            {counted}
                          </Box>
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
        </>
      )}
    </Box>
  );
}
