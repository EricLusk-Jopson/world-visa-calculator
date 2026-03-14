import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export type AllowanceVariant = "safe" | "caution" | "danger";

const BAR_COLOR: Record<AllowanceVariant, string> = {
  safe: tokens.green,
  caution: tokens.amber,
  danger: tokens.red,
};

const BADGE_SX: Record<AllowanceVariant, object> = {
  safe: { bgcolor: tokens.greenBg, color: tokens.greenText },
  caution: { bgcolor: tokens.amberBg, color: tokens.amberText },
  danger: { bgcolor: tokens.redBg, color: tokens.redText },
};

interface AllowanceBarProps {
  name: string;
  daysUsed: number;
  daysTotal?: number;
  variant: AllowanceVariant;
  daysRemaining: number;
  sx?: object;
}

export function AllowanceBar({
  name,
  daysUsed,
  daysTotal = 90,
  variant,
  daysRemaining,
  sx = {},
}: AllowanceBarProps) {
  const fillPct = Math.min(100, (daysUsed / daysTotal) * 100);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        ...sx,
      }}
    >
      {/* Name */}
      <Typography
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.78rem",
          fontWeight: 600,
          color: tokens.textSoft,
          width: 60,
          flexShrink: 0,
        }}
      >
        {name}
      </Typography>

      {/* Progress track */}
      <Box
        sx={{
          flex: 1,
          height: 28,
          bgcolor: tokens.mist,
          borderRadius: "6px",
          overflow: "hidden",
          position: "relative",
        }}
        role="progressbar"
        aria-valuenow={daysUsed}
        aria-valuemax={daysTotal}
        aria-label={`${name}: ${daysUsed} of ${daysTotal} days used`}
      >
        {/*
         * LinearProgress doesn't let us control the inner bar geometry precisely,
         * so we use a raw Box fill instead — matches the landing page's inset style.
         */}
        <Box
          sx={{
            position: "absolute",
            top: "4px",
            bottom: "4px",
            left: "5%",
            width: `${fillPct * 0.9}%`, // 90% of available width to stay within the 5% inset
            borderRadius: "4px",
            bgcolor: BAR_COLOR[variant],
            opacity: variant === "safe" ? 0.75 : 0.85,
            transition: "width 0.45s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </Box>

      {/* Status badge */}
      <Box
        component="span"
        sx={{
          fontFamily: tokens.fontBody,
          fontSize: "0.72rem",
          fontWeight: 700,
          px: "10px",
          py: "3px",
          borderRadius: "100px",
          flexShrink: 0,
          whiteSpace: "nowrap",
          ...BADGE_SX[variant],
        }}
      >
        {daysRemaining} days left
      </Box>
    </Box>
  );
}
