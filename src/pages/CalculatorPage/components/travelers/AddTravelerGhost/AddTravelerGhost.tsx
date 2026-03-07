import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { TOTAL_HEIGHT, COLUMN_MIN_WIDTH } from "@/features/calculator/utils/timelineLayout";

interface AddTravelerGhostProps {
  onAddTraveler: () => void;
}

/**
 * Dashed ghost column at the right end of the timeline.
 * Single CTA that opens the Add Traveler modal.
 */
export function AddTravelerGhost({ onAddTraveler }: AddTravelerGhostProps) {
  return (
    <Box
      sx={{
        minWidth: COLUMN_MIN_WIDTH * 0.7,
        flexShrink: 0,
        height: TOTAL_HEIGHT,
        borderLeft: `1px dashed ${tokens.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: "24px",
      }}
    >
      <Box
        component="button"
        onClick={onAddTraveler}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
          px: "20px",
          py: "16px",
          bgcolor: "transparent",
          border: `1.5px dashed ${tokens.border}`,
          borderRadius: "12px",
          cursor: "pointer",
          color: tokens.textGhost,
          transition: "all 0.15s",
          "&:hover": {
            borderColor: tokens.navy,
            color: tokens.textSoft,
            bgcolor: tokens.mist,
          },
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle
            cx="10" cy="7" r="3"
            stroke="currentColor" strokeWidth="1.3" opacity="0.5"
          />
          <path
            d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"
          />
          <path
            d="M10 1v4M8 3h4"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
          />
        </svg>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "inherit",
          }}
        >
          Add traveler
        </Typography>
      </Box>
    </Box>
  );
}
