import { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import { alpha } from "@mui/material/styles";
import { DaysRemainingDisplay } from "../../../components/ui/DaysRemainingDisplay/DaysRemainingDisplay";
import type { DaysVariant } from "../../../components/ui/DaysRemainingDisplay/DaysRemainingDisplay";
import { tokens } from "@/styles/theme";

// ── 90/180 algorithm ─────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function calcDaysUsedIn180(
  entry: Date,
  exit: Date | null,
  refDate: Date,
): number {
  const windowStart = new Date(refDate);
  windowStart.setDate(windowStart.getDate() - 179);
  const tStart = entry < windowStart ? windowStart : entry;
  const tEnd = exit && exit < refDate ? exit : refDate;
  if (tStart > tEnd) return 0;
  return Math.min(daysBetween(tStart, tEnd) + 1, 90);
}

// ── Derived result ────────────────────────────────────────────────────────────

type CalcResult = {
  variant: DaysVariant;
  days: number | null;
  label: string;
  sublabel: string;
  windowNote: string;
};

const DEFAULT_NOTE =
  "The 90/180 rule counts days in any rolling 180-day window — not a fixed calendar period.";

function computeResult(
  name: string,
  entryVal: string,
  exitVal: string,
): CalcResult {
  const displayName = name.trim() || "You";

  if (!entryVal) {
    return {
      variant: "empty",
      days: null,
      label: "Days remaining",
      sublabel: "Enter your entry date above",
      windowNote: DEFAULT_NOTE,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entry = new Date(entryVal);
  const exit = exitVal ? new Date(exitVal) : null;

  if (exit && exit < entry) {
    return {
      variant: "danger",
      days: null,
      label: "Invalid dates",
      sublabel: "Exit date must be after entry date",
      windowNote: DEFAULT_NOTE,
    };
  }

  const refDate = exit ?? today;
  const used = calcDaysUsedIn180(entry, exit, refDate);
  const remaining = Math.max(0, 90 - used);
  const refLabel = refDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const windowNote = `Based on a 180-day window ending ${refLabel}. Days roll off as time passes.`;

  if (remaining >= 30)
    return {
      variant: "safe",
      days: remaining,
      label: `${displayName}'s remaining days`,
      sublabel: `${used} of 90 days used · safe to travel`,
      windowNote,
    };
  if (remaining >= 10)
    return {
      variant: "caution",
      days: remaining,
      label: `${displayName}'s remaining days`,
      sublabel: `${used} of 90 days used · plan carefully`,
      windowNote,
    };
  if (remaining > 0)
    return {
      variant: "danger",
      days: remaining,
      label: `${displayName}'s remaining days`,
      sublabel: `${used} of 90 days used · at risk`,
      windowNote,
    };
  return {
    variant: "danger",
    days: 0,
    label: `${displayName} has exceeded the limit`,
    sublabel: `${used} of 90 days used — must leave now`,
    windowNote,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HeroCalculatorCardProps {
  appHref?: string;
}

export function HeroCalculatorCard({
  appHref = "https://eurovisacalculator.com/app",
}: HeroCalculatorCardProps) {
  const [name, setName] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");

  const result = computeResult(name, entryDate, exitDate);
  const hasInput = !!entryDate;

  // Shared input styles — override MUI's default label float behaviour
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: tokens.mist,
      borderRadius: "10px",
      fontSize: "0.92rem",
      fontFamily: tokens.fontBody,
      color: tokens.text,
      "& fieldset": { borderColor: tokens.border, borderWidth: "1.5px" },
      "&:hover fieldset": { borderColor: tokens.border },
      "&.Mui-focused fieldset": {
        borderColor: tokens.navy,
        borderWidth: "1.5px",
        boxShadow: `0 0 0 3px ${alpha(tokens.navy, 0.06)}`,
      },
      "&.Mui-focused": { bgcolor: tokens.white },
    },
    "& .MuiOutlinedInput-input": {
      p: "11px 14px",
      "&::placeholder": { color: tokens.textGhost, opacity: 1 },
    },
    "& .MuiInputLabel-root": {
      fontFamily: tokens.fontBody,
      fontSize: "0.72rem",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: tokens.textSoft,
      // Keep label above field at all times (no float animation)
      position: "static",
      transform: "none",
      mb: "5px",
      "&.Mui-focused": { color: tokens.textSoft },
    },
    "& .MuiFormLabel-root + .MuiInputBase-root": { mt: 0 },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 460,
        bgcolor: tokens.white,
        border: `1px solid ${tokens.border}`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow:
          "0 4px 40px rgba(12,30,60,0.08), 0 1px 4px rgba(12,30,60,0.06)",
        animation: "heroCardFadeUp 0.7s 0.3s both cubic-bezier(0.16,1,0.3,1)",
        "@keyframes heroCardFadeUp": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: tokens.navy,
          px: 3,
          pt: "20px",
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.9rem",
            fontWeight: 400,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Check your allowance
        </Typography>
        <Box
          component="span"
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tokens.green,
            bgcolor: alpha(tokens.green, 0.15),
            px: "10px",
            py: "3px",
            borderRadius: "100px",
            border: `1px solid ${alpha(tokens.green, 0.3)}`,
          }}
        >
          Live calculator
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Traveler name */}
        <Box>
          <Typography
            component="label"
            htmlFor="calc-name"
            sx={{
              display: "block",
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tokens.textSoft,
              mb: "5px",
            }}
          >
            Traveler name
          </Typography>
          <TextField
            id="calc-name"
            fullWidth
            variant="outlined"
            placeholder="e.g. Emma"
            inputProps={{ maxLength: 30 }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={inputSx}
          />
        </Box>

        {/* Entry date */}
        <Box>
          <Typography
            component="label"
            htmlFor="calc-entry"
            sx={{
              display: "block",
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tokens.textSoft,
              mb: "5px",
            }}
          >
            Most recent Schengen entry
          </Typography>
          <TextField
            id="calc-entry"
            fullWidth
            variant="outlined"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            sx={inputSx}
          />
        </Box>

        {/* Exit date */}
        <Box>
          <Typography
            component="label"
            htmlFor="calc-exit"
            sx={{
              display: "block",
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: tokens.textSoft,
              mb: "5px",
            }}
          >
            Exit date{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
                color: tokens.textGhost,
              }}
            >
              (leave blank if still inside)
            </Box>
          </Typography>
          <TextField
            id="calc-exit"
            fullWidth
            variant="outlined"
            type="date"
            inputProps={{ min: entryDate || undefined }}
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            sx={inputSx}
          />
        </Box>

        {/* Result display */}
        <DaysRemainingDisplay
          variant={result.variant}
          days={result.days}
          label={result.label}
          sublabel={result.sublabel}
        />

        {/* Rolling window note */}
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            color: tokens.textSoft,
            textAlign: "center",
            lineHeight: 1.55,
          }}
        >
          {result.windowNote}
        </Typography>

        {/* Primary CTA */}
        <Link
          href={appHref}
          underline="none"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            py: "13px",
            px: 2,
            bgcolor: tokens.green,
            color: tokens.white,
            fontFamily: tokens.fontBody,
            fontSize: "0.925rem",
            fontWeight: 600,
            borderRadius: "10px",
            letterSpacing: "-0.01em",
            transition: "background 0.18s, transform 0.15s, box-shadow 0.15s",
            "&:hover": {
              bgcolor: "#00A05C",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 20px rgba(0,185,107,0.30)",
            },
            "&:active": { transform: "none", boxShadow: "none" },
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="2"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
              opacity="0.5"
            />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" />
            <rect
              x="9"
              y="9"
              width="5"
              height="5"
              rx="1"
              fill="currentColor"
              opacity="0.5"
            />
          </svg>
          {hasInput
            ? "↗ Track multiple travelers & full history"
            : "Track all travelers — free"}
        </Link>

        {/* Secondary note */}
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.78rem",
            color: tokens.textSoft,
            textAlign: "center",
            lineHeight: 1.5,
            "& a": {
              color: tokens.navy,
              fontWeight: 500,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            },
          }}
        >
          No account needed · Shareable via link ·{" "}
          <a href="#how">How does it work?</a>
        </Typography>
      </Box>
    </Paper>
  );
}
