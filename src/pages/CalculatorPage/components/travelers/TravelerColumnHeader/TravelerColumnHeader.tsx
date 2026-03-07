import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Traveler } from "@/types";
import type { TravelerStatus } from "@/features/calculator/utils/timelineLayout";

interface TravelerColumnHeaderProps {
  traveler: Traveler;
  status: TravelerStatus;
  onDelete: () => void;
  sx?: object;
}

/**
 * Shared column header used in both the Timeline and Cards views.
 * Renders traveler name, StatusBadge, progress bar, and a hover-revealed
 * delete button.
 */
export function TravelerColumnHeader({
  traveler,
  status,
  onDelete,
  sx = {},
}: TravelerColumnHeaderProps) {
  const [hovered, setHovered] = useState(false);
  const { daysUsed, daysRemaining, variant } = status;
  const fillPct = Math.min(100, (daysUsed / 90) * 100);

  const barColor =
    variant === "safe"
      ? tokens.green
      : variant === "caution"
      ? tokens.amber
      : tokens.red;

  return (
    <Box
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: tokens.offWhite,
        px: "14px",
        py: "12px",
        borderBottom: `1px solid ${tokens.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative",
        zIndex: 4,
        ...sx,
      }}
    >
      {/* Top row: name + badge */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.05rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
            lineHeight: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {traveler.name}
        </Typography>
        <StatusBadge
          variant={variant}
          label={`${daysRemaining} days left`}
          sx={{ flexShrink: 0 }}
        />
      </Box>

      {/* Progress row: track + label */}
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Box
          sx={{
            flex: 1,
            height: 3,
            bgcolor: tokens.border,
            borderRadius: "100px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${fillPct}%`,
              bgcolor: barColor,
              borderRadius: "100px",
              transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.68rem",
            fontWeight: 600,
            color: tokens.textSoft,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {daysUsed}/90 used
        </Typography>
      </Box>

      {/* Delete button — ghost, hover-revealed */}
      <Box
        component="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Remove ${traveler.name}`}
        sx={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: 20,
          height: 20,
          border: "none",
          borderRadius: "4px",
          bgcolor: "transparent",
          color: tokens.textGhost,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          transition: "all 0.14s",
          opacity: hovered ? 1 : 0,
          "&:hover": {
            bgcolor: tokens.redBg,
            color: tokens.red,
          },
        }}
      >
        ✕
      </Box>
    </Box>
  );
}
