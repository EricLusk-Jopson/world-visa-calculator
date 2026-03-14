import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export type DaysVariant = "safe" | "caution" | "danger" | "empty";

const VARIANT_CONFIG: Record<
  DaysVariant,
  {
    bg: string;
    border: string;
    labelColor: string;
    sublabelColor: string;
    countColor: string;
  }
> = {
  safe: {
    bg: tokens.greenBg,
    border: tokens.greenBorder,
    labelColor: tokens.greenText,
    sublabelColor: "#059669",
    countColor: tokens.green,
  },
  caution: {
    bg: tokens.amberBg,
    border: tokens.amberBorder,
    labelColor: tokens.amberText,
    sublabelColor: "#D97706",
    countColor: tokens.amber,
  },
  danger: {
    bg: tokens.redBg,
    border: tokens.redBorder,
    labelColor: tokens.redText,
    sublabelColor: "#DC2626",
    countColor: tokens.red,
  },
  empty: {
    bg: tokens.mist,
    border: tokens.border,
    labelColor: tokens.textSoft,
    sublabelColor: tokens.textGhost,
    countColor: tokens.border,
  },
};

interface DaysRemainingDisplayProps {
  variant: DaysVariant;
  days: number | null;
  label: string;
  sublabel?: string;
  sx?: object;
}

export function DaysRemainingDisplay({
  variant,
  days,
  label,
  sublabel,
  sx = {},
}: DaysRemainingDisplayProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        py: "14px",
        borderRadius: "10px",
        border: `1.5px solid ${cfg.border}`,
        bgcolor: cfg.bg,
        minHeight: 62,
        transition: "background 0.35s ease, border-color 0.35s ease",
        ...sx,
      }}
      role="status"
      aria-label={`${days ?? "—"} days remaining`}
    >
      {/* Left: label stack */}
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.68rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            lineHeight: 1,
            color: cfg.labelColor,
          }}
        >
          {label}
        </Typography>

        {sublabel && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 500,
              mt: "3px",
              color: cfg.sublabelColor,
            }}
          >
            {sublabel}
          </Typography>
        )}
      </Box>

      {/* Right: large count */}
      <Typography
        component="span"
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "2.2rem",
          fontWeight: 600,
          lineHeight: 1,
          color: cfg.countColor,
          transition: "color 0.35s ease",
        }}
      >
        {days !== null ? days : "—"}
      </Typography>
    </Box>
  );
}
