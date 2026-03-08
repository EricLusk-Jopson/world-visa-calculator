import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { tokens } from "@/styles/theme";
import { parseDate } from "@/features/calculator/utils/dates";
import { ImpactBreakdown, StatusVariant } from "../travelers/travelerStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImpactPreviewProps {
  daysRemaining: number;
  daysUsed: number;
  variant: StatusVariant | "neutral";
  /** When provided, a "See breakdown" toggle is shown. */
  breakdown?: ImpactBreakdown;
}

// ─── Design tokens by variant ────────────────────────────────────────────────

const VARIANT_COLORS = {
  safe: {
    bg: tokens.greenBg,
    border: tokens.greenBorder,
    text: tokens.greenText,
    value: tokens.green,
  },
  caution: {
    bg: tokens.amberBg,
    border: tokens.amberBorder,
    text: tokens.amberText,
    value: tokens.amber,
  },
  danger: {
    bg: tokens.redBg,
    border: tokens.redBorder,
    text: tokens.redText,
    value: tokens.red,
  },
  neutral: {
    bg: tokens.mist,
    border: tokens.border,
    text: tokens.textSoft,
    value: tokens.textGhost,
  },
} as const;

// ─── Internal helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function fmtShort(iso: string): string {
  const d = parseDate(iso);
  const suffix =
    d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}${suffix}`;
}

function fmtRange(entryDate: string, exitDate?: string): string {
  return `${fmtShort(entryDate)} → ${exitDate ? fmtShort(exitDate) : "ongoing"}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Section header row with a label on the left and a day count on the right. */
function SectionRow({
  label,
  days,
  sign,
  dimmed,
}: {
  label: string;
  days: number;
  sign: "+" | "−" | "";
  dimmed?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "8px",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: dimmed ? tokens.textGhost : tokens.textSoft,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "0.85rem",
          fontWeight: 600,
          fontStyle: "italic",
          color: dimmed ? tokens.textGhost : tokens.navy,
          whiteSpace: "nowrap",
        }}
      >
        {sign}
        {days}d
      </Typography>
    </Box>
  );
}

/** A single trip line within a section. */
function TripRow({
  name,
  range,
  days,
  sign,
}: {
  name?: string;
  range: string;
  days: number;
  sign: "+" | "−";
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "8px",
        pl: "10px",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {name && (
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "0.78rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.text,
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
        )}
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.68rem",
            color: tokens.textSoft,
            lineHeight: 1.4,
          }}
        >
          {range}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 600,
          color: sign === "−" ? tokens.textSoft : tokens.greenText,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {sign}
        {days}d
      </Typography>
    </Box>
  );
}

/** Thin horizontal rule used to separate breakdown sections. */
function Divider() {
  return <Box sx={{ height: "1px", bgcolor: tokens.border, mx: "-12px" }} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImpactPreview({
  daysRemaining,
  daysUsed,
  variant,
  breakdown,
}: ImpactPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = VARIANT_COLORS[variant];

  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        overflow: "hidden",
      }}
    >
      {/* ── Summary row (always visible) ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: "12px",
          py: "10px",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: colors.text,
              lineHeight: 1,
            }}
          >
            After this trip
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 500,
              color: colors.text,
              opacity: 0.75,
              mt: "3px",
            }}
          >
            {daysUsed} of 90 days used
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "2rem",
              fontWeight: 600,
              lineHeight: 1,
              color: colors.value,
            }}
          >
            {daysRemaining}
            <Typography
              component="span"
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: colors.text,
                ml: "3px",
              }}
            >
              d
            </Typography>
          </Typography>

          {/* Expand toggle — only shown when breakdown data is available */}
          {breakdown && (
            <Box
              component="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Hide breakdown" : "See breakdown"}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 24,
                height: 24,
                border: "none",
                borderRadius: "5px",
                bgcolor: "rgba(0,0,0,0.06)",
                color: colors.text,
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.15s",
                "&:hover": { bgcolor: "rgba(0,0,0,0.12)" },
              }}
            >
              {/* Chevron — rotates when expanded */}
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRight: `1.5px solid currentColor`,
                  borderBottom: `1.5px solid currentColor`,
                  transform: expanded
                    ? "rotate(225deg) translateY(2px)"
                    : "rotate(45deg) translateY(-2px)",
                  transition: "transform 0.2s",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Expandable breakdown ── */}
      {breakdown && (
        <Collapse in={expanded}>
          <Box
            sx={{
              bgcolor: tokens.white,
              borderTop: `1px solid ${colors.border}`,
              px: "12px",
              py: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* ── Section A: previous trips in window ── */}
            <SectionRow
              label="Previous trips in window"
              days={breakdown.previousDaysTotal}
              sign="−"
              dimmed={breakdown.previousDaysTotal === 0}
            />

            {breakdown.previousTrips.length === 0 ? (
              <Typography
                sx={{
                  pl: "10px",
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
                  color: tokens.textGhost,
                  fontStyle: "italic",
                }}
              >
                No previous Schengen trips in this window.
              </Typography>
            ) : (
              breakdown.previousTrips.map((c) => (
                <TripRow
                  key={c.tripId}
                  name={c.destination}
                  range={fmtRange(c.entryDate, c.exitDate)}
                  days={c.daysInWindow}
                  sign="−"
                />
              ))
            )}

            <Divider />

            {/* ── Section B: trips aging out ── */}
            <SectionRow
              label="Freed during this trip"
              days={breakdown.agingOutTotal}
              sign="+"
              dimmed={breakdown.agingOutTotal === 0}
            />

            {breakdown.agingOutTrips.length === 0 ? (
              <Typography
                sx={{
                  pl: "10px",
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
                  color: tokens.textGhost,
                  fontStyle: "italic",
                }}
              >
                No days age out during this stay.
              </Typography>
            ) : (
              breakdown.agingOutTrips.map((c) => (
                <TripRow
                  key={c.tripId}
                  name={c.destination}
                  range={fmtRange(c.entryDate, c.exitDate)}
                  days={c.daysAgingOut}
                  sign="+"
                />
              ))
            )}

            <Divider />

            {/* ── Section C: this trip ── */}
            <SectionRow
              label="This trip"
              days={breakdown.currentTripDays}
              sign="−"
            />

            <Divider />

            {/* ── Result row ── */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "8px",
              }}
            >
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: colors.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Remaining
              </Typography>
              <Typography
                sx={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: "1rem",
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: colors.value,
                }}
              >
                {breakdown.daysRemaining}d
              </Typography>
            </Box>

            {/* ── Formula annotation ── */}
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.62rem",
                color: tokens.textGhost,
                textAlign: "right",
                mt: "-4px",
              }}
            >
              90 − {breakdown.previousDaysTotal} + {breakdown.agingOutTotal} −{" "}
              {breakdown.currentTripDays} = {breakdown.daysRemaining}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
