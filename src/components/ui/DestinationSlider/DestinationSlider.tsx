import Box from "@mui/material/Box";
import { tokens } from "@/styles/theme";
import type { StayVariant } from "@/features/calculator/utils/stayCalculator";

interface DestinationSliderProps {
  fillPct: number;
  variant: StayVariant;
  /** "sm" — 3px, desktop column header. "lg" — 6px, mobile detail cards. */
  size?: "sm" | "lg";
  sx?: object;
}

const HEIGHT: Record<"sm" | "lg", number> = { sm: 3, lg: 6 };

/**
 * Generic allowance progress bar, driven by fillPct + variant so it works
 * for any RegionRule type (rolling_window "days used", per_visit "day N of
 * the visit"). Replaces the hand-rolled bars previously duplicated across
 * TravelerColumnHeader and TravelerViewSlider.
 */
export function DestinationSlider({
  fillPct,
  variant,
  size = "sm",
  sx = {},
}: DestinationSliderProps) {
  const barColor =
    variant === "safe" ? tokens.green : variant === "caution" ? tokens.amber : tokens.red;

  return (
    <Box
      sx={{
        height: HEIGHT[size],
        bgcolor: tokens.border,
        borderRadius: "100px",
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${Math.max(0, Math.min(100, fillPct))}%`,
          bgcolor: barColor,
          borderRadius: "100px",
          transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </Box>
  );
}
