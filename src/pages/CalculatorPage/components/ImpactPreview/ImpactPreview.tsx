import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import { tokens } from "@/styles/theme";
import { parseDate } from "@/features/calculator/utils/dates";
import { ImpactBreakdown, StatusVariant } from "../travelers/travelerStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TravelerImpact {
  id: string;
  name: string;
  color: string;
  daysRemaining: number;
  daysUsed: number;
}

interface ImpactPreviewProps {
  daysRemaining: number;
  daysUsed: number;
  variant: StatusVariant | "neutral";
  breakdown?: ImpactBreakdown;
  /**
   * When provided (multi-traveler add/edit), renders a per-traveler row
   * instead of the single large number. The summary variant + breakdown
   * still reflect the most constrained traveler.
   */
  travelerImpacts?: TravelerImpact[];
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function statusVariantForDays(days: number): StatusVariant {
  if (days > 29) return "safe";
  if (days > 9) return "caution";
  return "danger";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function Divider() {
  return <Box sx={{ height: "1px", bgcolor: tokens.border, mx: "-12px" }} />;
}

// ─── Per-traveler row ─────────────────────────────────────────────────────────

function TravelerImpactRow({ impact }: { impact: TravelerImpact }) {
  const variant = statusVariantForDays(impact.daysRemaining);
  const vc = VARIANT_COLORS[variant];
  const fillPct = Math.min(100, (Math.max(0, impact.daysUsed) / 90) * 100);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          bgcolor: impact.color,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "0.85rem",
          fontStyle: "italic",
          fontWeight: 400,
          color: tokens.navy,
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        {impact.name}
      </Typography>
      <Box
        sx={{
          flex: 1,
          height: 3,
          bgcolor: tokens.mist,
          borderRadius: "100px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${fillPct}%`,
            bgcolor: vc.value,
            borderRadius: "100px",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          px: "7px",
          py: "2px",
          borderRadius: "100px",
          bgcolor: vc.bg,
          border: `1px solid ${vc.border}`,
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: vc.text,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {impact.daysRemaining}d left
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImpactPreview({
  daysRemaining,
  daysUsed,
  variant,
  breakdown,
  travelerImpacts,
}: ImpactPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  // When a breakdown is present, color the whole component from the extendable
  // days figure rather than the raw daysRemaining prop, which is computed from
  // 90 − daysUsed and doesn't account for days rolling off the window.
  const effectiveVariant = breakdown
    ? statusVariantForDays(breakdown.daysRemaining)
    : variant;
  const colors = VARIANT_COLORS[effectiveVariant];
  const isMulti = travelerImpacts && travelerImpacts.length > 1;

  return (
    <Box
      sx={{
        borderRadius: "10px",
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
      }}
    >
      {/* ── Summary row ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: "12px",
          py: "10px",
          gap: "12px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flex: isMulti ? 1 : "unset",
          }}
        >
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

          {!isMulti && (
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 500,
                color: colors.text,
                opacity: 0.75,
              }}
            >
              {breakdown && breakdown.agingOutTotal > 0
                ? `${daysUsed}/90 used · ${breakdown.agingOutTotal}d rolling off`
                : `${daysUsed} of 90 days used`}
            </Typography>
          )}

          {isMulti && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                mt: "4px",
              }}
            >
              {travelerImpacts.map((impact) => (
                <TravelerImpactRow key={impact.id} impact={impact} />
              ))}
            </Box>
          )}

          {breakdown && (
            <Typography
              component="button"
              onClick={() => setExpanded((v) => !v)}
              sx={{
                all: "unset",
                fontFamily: tokens.fontBody,
                fontSize: "0.68rem",
                fontWeight: 600,
                color: colors.text,
                opacity: 0.6,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                mt: "2px",
                "&:hover": { opacity: 1 },
              }}
            >
              {expanded ? "Hide breakdown" : "Show breakdown"}
              {isMulti && (
                <Typography
                  component="span"
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.65rem",
                    fontWeight: 500,
                    color: colors.text,
                    opacity: 0.7,
                    ml: "4px",
                  }}
                >
                  (most constrained)
                </Typography>
              )}
            </Typography>
          )}
        </Box>

        {!isMulti && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontDisplay,
                fontSize: "2rem",
                fontWeight: 600,
                lineHeight: 1,
                color: colors.value,
              }}
            >
              {breakdown ? breakdown.daysRemaining : daysRemaining}
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
            {breakdown?.maxExitDate && (
              <Typography
                sx={{
                  fontFamily: tokens.fontBody,
                  fontSize: "0.62rem",
                  fontWeight: 600,
                  color: colors.text,
                  opacity: 0.6,
                  whiteSpace: "nowrap",
                }}
              >
                until {fmtShort(breakdown.maxExitDate)}
              </Typography>
            )}
          </Box>
        )}
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
            {/* Previous trips */}
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

            {/* Freed during specified trip */}
            <SectionRow
              label="Freed during this trip"
              days={breakdown.agingOutDuringTripTotal}
              sign="+"
              dimmed={breakdown.agingOutDuringTripTotal === 0}
            />
            {breakdown.agingOutDuringTripTrips.length === 0 ? (
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
              breakdown.agingOutDuringTripTrips.map((c) => (
                <TripRow
                  key={c.tripId}
                  name={c.destination}
                  range={fmtRange(c.entryDate, c.exitDate)}
                  days={c.daysAgingOutDuringTrip}
                  sign="+"
                />
              ))
            )}

            <Divider />

            {/* This trip */}
            <SectionRow
              label="This trip"
              days={breakdown.currentTripDays}
              sign="−"
            />

            <Divider />

            {/* Freed if extended beyond exit */}
            <SectionRow
              label="Freed if extended"
              days={breakdown.agingOutOverMaxStayTotal}
              sign="+"
              dimmed={breakdown.agingOutOverMaxStayTotal === 0}
            />
            {breakdown.agingOutOverMaxStayTrips.length === 0 ? (
              <Typography
                sx={{
                  pl: "10px",
                  fontFamily: tokens.fontBody,
                  fontSize: "0.68rem",
                  color: tokens.textGhost,
                  fontStyle: "italic",
                }}
              >
                No additional days age out after this stay.
              </Typography>
            ) : (
              breakdown.agingOutOverMaxStayTrips.map((c) => (
                <TripRow
                  key={c.tripId}
                  name={c.destination}
                  range={fmtRange(c.entryDate, c.exitDate)}
                  days={c.daysAgingOutOverMaxStay}
                  sign="+"
                />
              ))
            )}

            <Divider />

            {/* Result */}
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
                Can extend by
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

            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.62rem",
                color: tokens.textGhost,
                textAlign: "right",
                mt: "-4px",
              }}
            >
              90 − {breakdown.previousDaysTotal} +{" "}
              {breakdown.agingOutDuringTripTotal} +{" "}
              {breakdown.agingOutOverMaxStayTotal} − {breakdown.currentTripDays}{" "}
              = {breakdown.daysRemaining}
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
