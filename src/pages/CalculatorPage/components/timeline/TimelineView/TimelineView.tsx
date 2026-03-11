import React, { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { tokens } from "@/styles/theme";
import { DateSidebar } from "../DateSidebar";
import { TravelerTimelineColumn } from "../TravelerTimelineColumn";
import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import {
  computeTimelineStart,
  dateToTop,
  SIDEBAR_WIDTH,
  COLUMN_MIN_WIDTH,
  COLUMN_HEADER_HEIGHT,
} from "@/features/calculator/utils/timelineLayout";
import { today as getToday } from "@/features/calculator/utils/dates";

interface TimelineViewProps {
  travelers: Traveler[];
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
  onAddTraveler: () => void;
}

/**
 * Full timeline view.
 *
 * Layout mirrors CardsView structurally — left sidebar, traveler columns,
 * right sidebar — but the left sidebar is the live DateSidebar (sticky-left)
 * and the right sidebar is a plain spacer matching CardsView's right gutter.
 *
 * ┌──────────────────────────────────────────────────────┐
 * │ Sticky header row (position:sticky, top:0, zIndex:10)│
 * │ [left placeholder] [header₁] [header₂]… [right pad] │
 * ├──────────────────────────────────────────────────────┤
 * │ Content row (scrolls vertically + horizontally)      │
 * │ [DateSidebar sticky-left] [col₁] [col₂]… [right pad]│
 * └──────────────────────────────────────────────────────┘
 *
 * Header cells have no fixed height — they size to TravelerColumnHeader's
 * intrinsic content, matching the cards view's natural padding exactly.
 * COLUMN_HEADER_HEIGHT is used only as a scroll-position hint.
 *
 * Empty state: replaced entirely by AddTravelerGhost.
 */
export function TimelineView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
  onAddTraveler,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const timelineStart = useMemo(
    () => computeTimelineStart(travelers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  useEffect(() => {
    if (!scrollRef.current) return;
    const vh = scrollRef.current.clientHeight;
    const todayTop = dateToTop(getToday(), timelineStart);
    // COLUMN_HEADER_HEIGHT is approximate — close enough for scroll hinting.
    const scrollTop =
      COLUMN_HEADER_HEIGHT + todayTop - (vh - COLUMN_HEADER_HEIGHT) * 0.38;
    scrollRef.current.scrollTop = Math.max(0, scrollTop);
  }, [timelineStart]);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (travelers.length === 0) {
    return <AddTravelerGhost onAddTraveler={onAddTraveler} />;
  }

  // ── Shared sidebar column style ──────────────────────────────────────────────
  const sidebarSx = {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    flexShrink: 0,
    bgcolor: tokens.offWhite,
    borderRight: `1px solid ${tokens.border}`,
  } as const;

  // Right-side spacer has no right border (it's the edge of the layout).
  const rightSidebarSx = {
    ...sidebarSx,
    borderRight: "none",
    borderLeft: `1px solid ${tokens.border}`,
  } as const;

  return (
    <Box ref={scrollRef} sx={{ flex: 1, overflow: "auto" }}>
      <Box sx={{ width: "max-content", minWidth: "100%" }}>
        {/* ── Sticky header row ───────────────────────────────────────────── */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
            bgcolor: tokens.offWhite,
            borderBottom: `1px solid ${tokens.border}`,
            width: "100%",
          }}
        >
          {/* Left placeholder — aligns with DateSidebar */}
          <Box sx={{ ...sidebarSx, alignSelf: "stretch" }} />

          {/* Traveler header cells — natural height, no fixed constraint */}
          {travelers.map((traveler) => {
            const status = computeTravelerStatus(traveler);
            return (
              <Box
                key={traveler.id}
                sx={{
                  minWidth: COLUMN_MIN_WIDTH,
                  flex: 1,
                  p: "12px",
                  borderRight: `1px solid ${tokens.border}`,
                  "&:last-of-type": { borderRight: "none" },
                }}
              >
                <TravelerColumnHeader
                  traveler={traveler}
                  status={status}
                  onDelete={() => onDeleteTraveler(traveler.id)}
                  sx={{ width: "100%" }}
                />
              </Box>
            );
          })}

          {/* Right placeholder — mirrors CardsView's right gutter */}
          <Box sx={{ ...rightSidebarSx, alignSelf: "stretch" }} />
        </Box>

        {/* ── Content row ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
          }}
        >
          <DateSidebar timelineStart={timelineStart} />

          {travelers.map((traveler) => (
            <TravelerTimelineColumn
              key={traveler.id}
              traveler={traveler}
              timelineStart={timelineStart}
              onAddTrip={onAddTrip}
              onEditTrip={onEditTrip}
            />
          ))}

          {/* Right sidebar spacer — blank column matching CardsView layout */}
          <Box
            sx={{
              ...rightSidebarSx,
              height: "100%",
              alignSelf: "stretch",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
