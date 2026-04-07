import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { tokens } from "@/styles/theme";
import { MobileAwareTooltip } from "@/components/ui/MobileAwareTooltip";

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
  /** When provided, an info icon is rendered inside the chip and a Tooltip wraps it. */
  tooltip?: string;
  sx?: object;
}

export function StatusBadge({
  variant,
  label,
  tooltip,
  sx = {},
}: StatusBadgeProps) {
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
        "&.MuiChip-icon": { ml: "8px", mr: 0 },
      }}
    />
  );

  // When a tooltip is provided the label becomes a flex row: text + info icon.
  const labelNode = tooltip ? (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
    >
      {label}
      <InfoOutlinedIcon
        sx={{ fontSize: "0.6rem", opacity: 0.6, flexShrink: 0 }}
      />
    </Box>
  ) : (
    label
  );

  const chip = (
    <Chip
      label={labelNode}
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

  if (!tooltip) return chip;

  return (
    <MobileAwareTooltip
      title={tooltip}
      placement="bottom"
      arrow
      enterDelay={300}
      componentsProps={{
        tooltip: {
          sx: {
            fontFamily: tokens.fontBody,
            fontSize: "0.72rem",
            fontWeight: 500,
            bgcolor: tokens.navy,
            "& .MuiTooltip-arrow": { color: tokens.navy },
            maxWidth: 240,
          },
        },
      }}
    >
      {/* Tooltip requires a forwardRef-compatible child */}
      <span>{chip}</span>
    </MobileAwareTooltip>
  );
}
