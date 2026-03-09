import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { tokens } from "@/styles/theme";
import {
  buildMonthMarks,
  computeTotalHeight,
  dateToTop,
  SIDEBAR_WIDTH,
  COLUMN_HEADER_HEIGHT,
} from "@/features/calculator/utils/timelineLayout";
import { today as getToday } from "@/features/calculator/utils/dates";

interface DateSidebarProps {
  timelineStart: Date;
}

/**
 * Sticky left sidebar showing month labels and a "Today" pill.
 *
 * Structure mirrors the column layout:
 *   ┌────────────────────────┐
 *   │  header spacer         │  ← COLUMN_HEADER_HEIGHT, matches sticky header
 *   ├────────────────────────┤
 *   │  date ruler body       │  ← computeTotalHeight, matches card body canvas
 *   └────────────────────────┘
 *
 * Without the spacer the ruler starts at the very top of the flex row while
 * trip cards start below the header, causing a growing misalignment.
 */
export function DateSidebar({ timelineStart }: DateSidebarProps) {
  const monthMarks = buildMonthMarks(timelineStart);
  const today = getToday();
  const todayTop = dateToTop(today, timelineStart);
  const totalHeight = computeTotalHeight(timelineStart);

  return (
    <Box
      sx={{
        position: "sticky",
        left: 0,
        zIndex: 15,
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        flexShrink: 0,
        // Total height = header spacer + card body
        height: COLUMN_HEADER_HEIGHT + totalHeight,
        bgcolor: tokens.offWhite,
        borderRight: `1px solid ${tokens.border}`,
        background: `linear-gradient(to right, ${tokens.offWhite} 80%, transparent)`,
        pointerEvents: "none",
      }}
    >
      {/* Header spacer — blank area that aligns with the sticky column header */}
      <Box
        sx={{
          height: COLUMN_HEADER_HEIGHT,
          borderBottom: `1px solid ${tokens.border}`,
          flexShrink: 0,
        }}
      />

      {/* Date ruler body — coordinate origin matches top of card-body canvas */}
      <Box sx={{ position: "relative", height: totalHeight }}>
        {monthMarks.map((mark) => (
          <Box
            key={mark.label}
            sx={{
              position: "absolute",
              top: mark.topPx,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              pr: "10px",
              transform: "translateY(-1px)",
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "1px",
                bgcolor: tokens.border,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.6rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: tokens.textGhost,
                lineHeight: 1,
                pt: "3px",
              }}
            >
              {mark.label}
            </Typography>
          </Box>
        ))}

        {/* Today pill */}
        <Box
          sx={{
            position: "absolute",
            top: todayTop,
            right: "6px",
            transform: "translateY(-50%)",
            zIndex: 4,
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              bgcolor: tokens.greenBg,
              border: `1px solid ${tokens.greenBorder}`,
              borderRadius: "100px",
              px: "6px",
              py: "2px",
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: tokens.green,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.55rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: tokens.greenText,
                lineHeight: 1,
              }}
            >
              Today
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
