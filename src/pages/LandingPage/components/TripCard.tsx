import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";

export type TripVariant = "schengen" | "elsewhere" | "planned" | "ongoing";
export type RemainingStatus = "safe" | "caution" | "danger";

const ACCENT_COLOR: Record<TripVariant, string> = {
  schengen: tokens.green,
  elsewhere: tokens.border,
  planned: tokens.amber,
  ongoing: tokens.green,
};

const REGION_LABEL: Record<TripVariant, string> = {
  schengen: "Schengen",
  elsewhere: "Elsewhere",
  planned: "Planned",
  ongoing: "Ongoing",
};

const REGION_BADGE_SX: Record<TripVariant, object> = {
  schengen: { bgcolor: tokens.greenBg, color: tokens.greenText },
  elsewhere: { bgcolor: tokens.mist, color: tokens.textSoft },
  planned: { bgcolor: tokens.amberBg, color: tokens.amberText },
  ongoing: { bgcolor: tokens.greenBg, color: tokens.greenText },
};

const REMAINING_BADGE_SX: Record<RemainingStatus, object> = {
  safe: { bgcolor: tokens.greenBg, color: tokens.greenText },
  caution: { bgcolor: tokens.amberBg, color: tokens.amberText },
  danger: { bgcolor: tokens.redBg, color: tokens.redText },
};

// Shared mini-badge sx
const badgeBase = {
  fontFamily: tokens.fontBody,
  fontSize: "0.6rem",
  fontWeight: 700,
  px: "7px",
  py: "2px",
  borderRadius: "100px",
  display: "inline-flex",
  alignItems: "center",
  whiteSpace: "nowrap",
};

interface TripCardProps {
  destination: string;
  dateRange: string;
  variant: TripVariant;
  durationDays?: number;
  daysRemaining?: number;
  remainingStatus?: RemainingStatus;
  onEdit?: () => void;
  onDelete?: () => void;
  sx?: object;
}

export function TripCard({
  destination,
  dateRange,
  variant,
  durationDays,
  daysRemaining,
  remainingStatus,
  onEdit,
  onDelete,
  sx = {},
}: TripCardProps) {
  const isPlanned = variant === "planned";
  const showHoverBar = !!(onEdit || onDelete);

  return (
    <Paper
      elevation={1}
      sx={{
        position: "relative",
        borderRadius: "10px",
        border: `1px solid ${isPlanned ? tokens.amber : tokens.border}`,
        borderStyle: isPlanned ? "dashed" : "solid",
        bgcolor: isPlanned ? "#FDFCF8" : tokens.white,
        overflow: "hidden",
        cursor: "pointer",
        width: 230,
        boxShadow: "0 1px 3px rgba(12,30,60,0.06)",
        transition: "box-shadow 0.15s, transform 0.12s",
        "&:hover": {
          boxShadow: "0 4px 14px rgba(12,30,60,0.09)",
          transform: "translateX(2px)",
        },
        // Coloured left-edge accent via pseudo-element
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "3px",
          bgcolor: ACCENT_COLOR[variant],
        },
        ...sx,
      }}
    >
      {/* Body */}
      <Box sx={{ p: "10px 12px 10px 14px" }}>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "0.88rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            lineHeight: 1.25,
            mb: "3px",
          }}
        >
          {destination}
        </Typography>

        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.7rem",
            color: tokens.textSoft,
            fontWeight: 500,
            mb: "9px",
          }}
        >
          {dateRange}
        </Typography>

        {/* Badge row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          {durationDays != null && (
            <Box
              component="span"
              sx={{
                ...badgeBase,
                bgcolor: tokens.mist,
                color: tokens.textSoft,
              }}
            >
              {durationDays}d
            </Box>
          )}

          <Box
            component="span"
            sx={{ ...badgeBase, ...REGION_BADGE_SX[variant] }}
          >
            {REGION_LABEL[variant]}
          </Box>

          {daysRemaining != null && remainingStatus && (
            <Box
              component="span"
              sx={{
                ...badgeBase,
                ...REMAINING_BADGE_SX[remainingStatus],
                ml: "auto",
              }}
            >
              {daysRemaining}d left
            </Box>
          )}
        </Box>
      </Box>

      {/* Hover action bar */}
      {showHoverBar && (
        <Box
          sx={{
            px: "10px",
            py: "5px",
            borderTop: `1px solid ${tokens.mist}`,
            bgcolor: "rgba(255,255,255,0.96)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {onEdit && (
            <Box
              component="button"
              onClick={onEdit}
              aria-label={`Edit ${destination} trip`}
              sx={{
                px: "8px",
                py: "3px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontFamily: tokens.fontBody,
                fontSize: "0.64rem",
                fontWeight: 600,
                bgcolor: tokens.mist,
                color: tokens.textSoft,
                transition: "all 0.12s",
                "&:hover": { bgcolor: tokens.navy, color: "#fff" },
              }}
            >
              Edit
            </Box>
          )}
          {onDelete && (
            <Box
              component="button"
              onClick={onDelete}
              aria-label={`Delete ${destination} trip`}
              sx={{
                px: "8px",
                py: "3px",
                borderRadius: "5px",
                border: "none",
                cursor: "pointer",
                fontFamily: tokens.fontBody,
                fontSize: "0.64rem",
                fontWeight: 600,
                bgcolor: "transparent",
                color: tokens.border,
                ml: "auto",
                transition: "all 0.12s",
                "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
              }}
            >
              ✕
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
