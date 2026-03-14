import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";

export type BadgeVariant = "safe" | "caution" | "danger" | "neutral";

const VARIANT_CONFIG: Record<
  BadgeVariant,
  { bg: string; color: string; border: string; dot: string }
> = {
  safe: {
    bg: tokens.greenBg,
    color: tokens.greenText,
    border: tokens.greenBorder,
    dot: tokens.green,
  },
  caution: {
    bg: tokens.amberBg,
    color: tokens.amberText,
    border: tokens.amberBorder,
    dot: tokens.amber,
  },
  danger: {
    bg: tokens.redBg,
    color: tokens.redText,
    border: tokens.redBorder,
    dot: tokens.red,
  },
  neutral: {
    bg: tokens.mist,
    color: tokens.textSoft,
    border: tokens.border,
    dot: tokens.textGhost,
  },
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  sx?: object;
}

export function StatusBadge({ variant, label, sx = {} }: StatusBadgeProps) {
  const cfg = VARIANT_CONFIG[variant];

  const dot = (
    <Box
      component="span"
      sx={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        bgcolor: cfg.dot,
        flexShrink: 0,
        display: "inline-block",
        // MUI Chip icon gets extra padding we don't want — override
        "&.MuiChip-icon": { ml: "2px", mr: 0 },
      }}
    />
  );

  return (
    <Chip
      label={label}
      icon={dot}
      size="small"
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
        borderRadius: "100px",
        height: "auto",
        fontFamily: tokens.fontBody,
        fontSize: "0.66rem",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        lineHeight: 1.4,
        "& .MuiChip-label": {
          px: "9px",
          py: "3px",
        },
        "& .MuiChip-icon": {
          ml: "6px",
          mr: "-2px",
          fontSize: "5px",
        },
        ...sx,
      }}
    />
  );
}
