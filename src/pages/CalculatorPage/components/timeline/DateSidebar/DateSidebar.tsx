import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { tokens } from "@/styles/theme";
import {
  buildMonthMarks,
  computeTotalHeight,
  dateToTop,
  SIDEBAR_WIDTH,
} from "@/features/calculator/utils/timelineLayout";
import { today as getToday } from "@/features/calculator/utils/dates";

interface DateSidebarProps {
  timelineStart: Date;
  timelineEnd: Date;
}

/**
 * Sticky-left date ruler.
 *
 * Lives in the content row of TimelineView, alongside the card-body columns.
 * Because the content row starts immediately below the unified sticky header
 * row (which TimelineView owns), this sidebar needs no header spacer — its
 * top:0 already aligns with top:0 of every card-body canvas.
 */
export function DateSidebar({ timelineStart, timelineEnd }: DateSidebarProps) {
  const monthMarks = buildMonthMarks(timelineStart, timelineEnd);
  const today = getToday();
  const todayTop = dateToTop(today, timelineStart);
  const totalHeight = computeTotalHeight(timelineStart, timelineEnd);

  return (
    <Box
      sx={{
        position: "sticky",
        left: 0,
        zIndex: 9, // below column headers (10) so it's obscured on h-scroll
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: totalHeight,
        flexShrink: 0,
        bgcolor: tokens.offWhite,
        borderRight: `1px solid ${tokens.border}`,
        background: `linear-gradient(to right, ${tokens.offWhite} 80%, transparent)`,
        pointerEvents: "none",
      }}
    >
      {/* Month labels */}
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
  );
}
