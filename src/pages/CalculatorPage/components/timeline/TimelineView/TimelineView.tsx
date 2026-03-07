import React, { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";

import { DateSidebar } from "../DateSidebar";
import { TravelerTimelineColumn } from "../TravelerTimelineColumn";
import {
  TIMELINE_DAYS_BEFORE,
  PX_PER_DAY,
  TOTAL_HEIGHT,
} from "@/features/calculator/utils/timelineLayout";
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
 * On mount, scrolls vertically to center ~today in the viewport.
 */
export function TimelineView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
  onAddTraveler,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to ~today on mount
  useEffect(() => {
    if (!scrollRef.current) return;
    const viewportHeight = scrollRef.current.clientHeight;
    const todayOffset = TIMELINE_DAYS_BEFORE * PX_PER_DAY;
    // Position today ~38% from the top of the viewport
    const scrollTop = todayOffset - viewportHeight * 0.38;
    scrollRef.current.scrollTop = Math.max(0, scrollTop);
  }, []);

  return (
    <Box
      ref={scrollRef}
      sx={{
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        // Horizontal scroll when needed
        overflowX: "auto",
      }}
    >
      {/* Inner layout row: DateSidebar + columns */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          minWidth: "100%",
          minHeight: TOTAL_HEIGHT,
          alignItems: "flex-start",
        }}
      >
        {/* Sticky date sidebar */}
        <DateSidebar />

        {/* Traveler columns */}
        {travelers.map((traveler) => (
          <TravelerTimelineColumn
            key={traveler.id}
            traveler={traveler}
            onAddTrip={onAddTrip}
            onEditTrip={onEditTrip}
            onDeleteTraveler={onDeleteTraveler}
          />
        ))}

        {/* Ghost "add traveler" column */}
        <AddTravelerGhost onAddTraveler={onAddTraveler} />
      </Box>
    </Box>
  );
}
