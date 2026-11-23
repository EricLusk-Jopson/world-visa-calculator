/**
 * Two rows over the same dates: the traveller's own trips, and the record
 * the EES likely holds under the flagged hypothesis, with the phantom days
 * shaded. The flagged crossing gets a marker and a one-line label, and the
 * 180-day window the EU checker counts for the arrival date is bracketed.
 */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { addDays, differenceInCalendarDays, formatDate, parseDate } from "@/features/calculator/utils/dates";
import { describeHypothesis, eesView, formatLong, type Hypothesis, type ResolvedTrip } from "../engine";
import { SHORT_STAY_WINDOW } from "../constants";
import { eesCountryName } from "../countries";

const W = 640;
const LABEL_W = 0;
const ROW_H = 26;
const TOP = 26;
const GAP = 34;

interface Props {
  record: ResolvedTrip[];
  hypothesis: Hypothesis;
  arrival: string;
}

export function TimelineDiff({ record, hypothesis, arrival }: Props) {
  const windowStart = formatDate(addDays(parseDate(arrival), -(SHORT_STAY_WINDOW - 1)));
  const starts = [windowStart, hypothesis.trip.entry];
  const start = formatDate(addDays(parseDate(starts.sort()[0]), -7));
  const ends = [arrival, hypothesis.phantomUntil].sort();
  const end = formatDate(addDays(parseDate(ends[ends.length - 1]), 7));
  const span = differenceInCalendarDays(parseDate(end), parseDate(start)) + 1;
  const x = (iso: string) => LABEL_W + (differenceInCalendarDays(parseDate(iso), parseDate(start)) / span) * (W - LABEL_W);
  const wDays = (a: string, b: string) => Math.max(2, x(formatDate(addDays(parseDate(b), 1))) - x(a));

  const row1Y = TOP;
  const row2Y = TOP + ROW_H + GAP;
  const H = row2Y + ROW_H + 40;

  // Months for tick labels.
  const ticks: string[] = [];
  let cursor = parseDate(start);
  cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  while (formatDate(cursor) <= end) {
    ticks.push(formatDate(cursor));
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const flaggedExit = hypothesis.trip.exit!;
  const phantomFrom = formatDate(addDays(parseDate(flaggedExit), 1));
  const isLate = hypothesis.kind === "LATE_EXIT";
  const phantomColor = isLate ? tokens.amber : tokens.red;
  const label = describeHypothesis(hypothesis, eesCountryName);
  const visible = eesView(hypothesis.record);

  return (
    <Box sx={{ border: `1px solid ${tokens.border}`, borderRadius: "12px", bgcolor: tokens.white, p: { xs: "10px", sm: "14px" } }}>
      <Box sx={{ display: "flex", gap: "14px", flexWrap: "wrap", mb: "6px", fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textSoft }}>
        <Legend color={tokens.navy}>Your trips</Legend>
        <Legend color={phantomColor} hatched>
          {isLate ? "Days counted by a late exit" : "Days counted with no exit"}
        </Legend>
        <Legend color={tokens.green} outline>
          180 days before arrival
        </Legend>
      </Box>
      <Box
        component="svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Timeline. Top row: your trips. Bottom row: what the EES likely records. ${label}.`}
        sx={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
      >
        <defs>
          <pattern id="evc-phantom" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={phantomColor} opacity="0.18" />
            <line x1="0" y1="0" x2="0" y2="6" stroke={phantomColor} strokeWidth="2.5" />
          </pattern>
        </defs>

        {/* 180-day window bracket */}
        <rect
          x={x(windowStart)}
          y={row1Y - 10}
          width={x(arrival) - x(windowStart)}
          height={row2Y + ROW_H - row1Y + 20}
          fill={tokens.greenBg}
          stroke={tokens.greenBorder}
          rx="6"
        />

        {/* Month ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={row1Y - 10} y2={row2Y + ROW_H + 10} stroke={tokens.border} strokeDasharray="2 3" />
            <text x={x(t) + 3} y={H - 8} fontSize="10" fill={tokens.textGhost} fontFamily="system-ui, sans-serif">
              {parseDate(t).toLocaleDateString("en-GB", { month: "short" })}
            </text>
          </g>
        ))}

        {/* Row labels */}
        <text x={4} y={row1Y - 14} fontSize="11" fontWeight="700" fill={tokens.textSoft} fontFamily="system-ui, sans-serif">
          Your record
        </text>
        <text x={4} y={row2Y - 14} fontSize="11" fontWeight="700" fill={tokens.textSoft} fontFamily="system-ui, sans-serif">
          What the EES likely sees
        </text>

        {/* Row 1: own trips */}
        {record.map((r) =>
          r.exit < start || r.entry > end ? null : (
            <rect key={`a-${r.trip.id}`} x={x(clamp(r.entry, start))} y={row1Y} width={wDays(clamp(r.entry, start), clampEnd(r.exit, end))} height={ROW_H} rx="4" fill={tokens.navy} />
          ),
        )}

        {/* Row 2: the EES view, with phantom days hatched */}
        {visible.map((r) => {
          if (r.exit < start || r.entry > end) return null;
          const isFlagged = r.trip.id === hypothesis.trip.id;
          const realEnd = isFlagged ? (flaggedExit < r.entry ? r.entry : flaggedExit) : r.exit;
          return (
            <g key={`b-${r.trip.id}`}>
              {realEnd >= r.entry && (
                <rect x={x(clamp(r.entry, start))} y={row2Y} width={wDays(clamp(r.entry, start), clampEnd(realEnd, end))} height={ROW_H} rx="4" fill={tokens.navy} />
              )}
              {isFlagged && hypothesis.phantomUntil >= phantomFrom && (
                <rect
                  x={x(clamp(phantomFrom, start))}
                  y={row2Y}
                  width={wDays(clamp(phantomFrom, start), clampEnd(hypothesis.phantomUntil, end))}
                  height={ROW_H}
                  rx="4"
                  fill="url(#evc-phantom)"
                  stroke={phantomColor}
                  strokeWidth="1"
                />
              )}
            </g>
          );
        })}

        {/* Flagged crossing */}
        <line x1={x(phantomFrom)} x2={x(phantomFrom)} y1={row1Y - 4} y2={row2Y + ROW_H + 4} stroke={phantomColor} strokeWidth="2" />
        <circle cx={x(phantomFrom)} cy={row2Y + ROW_H / 2} r="5" fill={tokens.white} stroke={phantomColor} strokeWidth="2" />

        {/* Arrival */}
        <line x1={x(arrival)} x2={x(arrival)} y1={row1Y - 10} y2={row2Y + ROW_H + 10} stroke={tokens.green} strokeWidth="2" />
        <text x={x(arrival) - 4} y={row1Y - 14} fontSize="10" fontWeight="700" textAnchor="end" fill={tokens.greenText} fontFamily="system-ui, sans-serif">
          Arrival {formatLong(arrival)}
        </text>
      </Box>
      <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.86rem", fontWeight: 700, color: tokens.navy, mt: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
        <Box component="span" aria-hidden sx={{ width: 10, height: 10, borderRadius: "50%", border: `2px solid ${phantomColor}`, flexShrink: 0 }} />
        {label}
      </Typography>
    </Box>
  );
}

const clamp = (iso: string, min: string) => (iso < min ? min : iso);
const clampEnd = (iso: string, max: string) => (iso > max ? max : iso);

function Legend({ color, children, hatched, outline }: { color: string; children: string; hatched?: boolean; outline?: boolean }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 14,
          height: 9,
          borderRadius: "2px",
          bgcolor: outline ? tokens.greenBg : hatched ? undefined : color,
          border: outline ? `1px solid ${color}` : hatched ? `1px solid ${color}` : "none",
          backgroundImage: hatched ? `repeating-linear-gradient(45deg, ${color} 0 2px, transparent 2px 5px)` : undefined,
        }}
      />
      {children}
    </Box>
  );
}
