import React, { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { DateSidebar } from "../DateSidebar";
import { TravelerTimelineColumn } from "../TravelerTimelineColumn";
import {
  computeTimelineStart,
  computeTotalHeight,
  dateToTop,
} from "@/features/calculator/utils/timelineLayout";
import { today as getToday } from "@/features/calculator/utils/dates";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";

interface TimelineViewProps {
  travelers: Traveler[];
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
  onAddTraveler: () => void;
}

/**
 * Full timeline view. Horizontally scrollable when many travelers are present.
 *
 * The timeline's start date is derived dynamically from the earliest trip entry
 * across all travelers (with a buffer), so old trips don't fall off the top.
 *
 * On mount, scrolls vertically to position today ~38% from the top of the
 * visible area.
 */
export function TimelineView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
  onAddTraveler,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived once per render — cheap since it's just date comparisons.
  const timelineStart = useMemo(
    () => computeTimelineStart(travelers),
    // Re-derive when the set of trip entry dates changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  const totalHeight = computeTotalHeight(timelineStart);

  // Scroll to ~today on mount (and whenever timelineStart shifts significantly).
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewportHeight = scrollRef.current.clientHeight;
    const todayTop = dateToTop(getToday(), timelineStart);
    // Position today ~38% from the top of the viewport.
    const scrollTop = todayTop - viewportHeight * 0.38;
    scrollRef.current.scrollTop = Math.max(0, scrollTop);
  }, [timelineStart]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "auto",
      }}
    >
      {/* Inner layout row: DateSidebar + traveler columns */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minWidth: "100%",
          minHeight: totalHeight,
          alignItems: "flex-start",
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
            onDeleteTraveler={onDeleteTraveler}
          />
        ))}

        <AddTravelerGhost onAddTraveler={onAddTraveler} />
      </Box>
    </Box>
  );
}
