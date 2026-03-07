import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import type { StatusVariant } from "@/types";

const COUNT_COLOR: Record<StatusVariant | "neutral", string> = {
  safe: tokens.green,
  caution: tokens.amber,
  danger: tokens.red,
  neutral: tokens.textSoft,
};

interface ImpactPreviewProps {
  /** Remaining days after the trip ends. Null = not yet computed. */
  daysRemaining: number | null;
  /** Days consumed in the rolling window (for the sublabel). */
  daysUsed: number | null;
  variant: StatusVariant | "neutral";
  sx?: object;
}

/**
 * Displays the projected Schengen allowance after a trip ends.
 * Shown inside the TripModal whenever a valid Schengen entry date is set.
 *
 * Matches the `.impact-box` component from the playground.
 */
export function ImpactPreview({
  daysRemaining,
  daysUsed,
  variant,
  sx = {},
}: ImpactPreviewProps) {
  const hasData = daysRemaining !== null && daysUsed !== null;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: tokens.mist,
        borderRadius: "9px",
        px: "14px",
        py: "12px",
        border: `1px solid ${tokens.border}`,
        ...sx,
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
            color: tokens.textSoft,
            lineHeight: 1,
          }}
        >
          After this trip
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.68rem",
            color: tokens.textSoft,
            mt: "2px",
          }}
        >
          {hasData ? `${daysUsed} of 90 days used` : "Enter dates above"}
        </Typography>
      </Box>

      <Typography
        component="span"
        sx={{
          fontFamily: tokens.fontDisplay,
          fontSize: "1.6rem",
          fontWeight: 600,
          lineHeight: 1,
          color: COUNT_COLOR[variant],
          transition: "color 0.25s ease",
        }}
      >
        {hasData ? `${daysRemaining}d` : "—"}
      </Typography>
    </Box>
  );
}
