import { useEffect, useRef, useMemo } from "react";
import Box from "@mui/material/Box";
import { type Traveler, type Trip, VisaRegion } from "@/types";

import { tokens } from "@/styles/theme";
import { DateSidebar } from "../DateSidebar";
import { TravelerTimelineColumn } from "../TravelerTimelineColumn";
import { TravelerColumnHeader } from "../../travelers/TravelerColumnHeader";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";
import { computeTravelerStatus } from "../../travelers/travelerStatus";
import { calculateMaxStay } from "@/features/calculator/utils/schengen";
import {
  computeTimelineStart,
  computeTimelineEnd,
  dateToTop,
  SIDEBAR_WIDTH,
  COLUMN_MIN_WIDTH,
  COLUMN_HEADER_HEIGHT,
} from "@/features/calculator/utils/timelineLayout";
import {
  today as getToday,
  formatDate,
} from "@/features/calculator/utils/dates";

interface TimelineViewProps {
  travelers: Traveler[];
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
  onAddTraveler: () => void;
  onPassportChange: (travelerId: string, passportCode: string | null) => void;
}

export function TimelineView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
  onAddTraveler,
  onPassportChange,
}: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const timelineStart = useMemo(
    () => computeTimelineStart(travelers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  const timelineEnd = useMemo(
    () => computeTimelineEnd(travelers),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [travelers],
  );

  useEffect(() => {
    if (hasScrolledRef.current) return;
    if (!scrollRef.current) return;
    const vh = scrollRef.current.clientHeight;
    const todayTop = dateToTop(getToday(), timelineStart);
    const scrollTop =
      COLUMN_HEADER_HEIGHT + todayTop - (vh - COLUMN_HEADER_HEIGHT) * 0.38;
    scrollRef.current.scrollTop = Math.max(0, scrollTop);
    hasScrolledRef.current = true;
  }, [timelineStart]);

  if (travelers.length === 0) {
    return <AddTravelerGhost onAddTraveler={onAddTraveler} />;
  }

  const todayStr = formatDate(getToday());

  const sidebarSx = {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    flexShrink: 0,
    bgcolor: tokens.offWhite,
    borderRight: `1px solid ${tokens.border}`,
  } as const;

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
          <Box sx={{ ...sidebarSx, alignSelf: "stretch" }} />

          {travelers.map((traveler) => {
            const status = computeTravelerStatus(traveler);

            // Max stay: calculateMaxStay correctly accounts for historical days
            // aging off the window during the proposed trip, unlike the naive
            // 90 − daysUsed figure in status.daysRemaining.
            const schengenTrips = traveler.trips.filter(
              (t) => t.region === VisaRegion.Schengen,
            );
            const maxStayResult = calculateMaxStay(todayStr, schengenTrips);
            const maxStay = maxStayResult.canEnter ? maxStayResult.maxDays : 0;

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
                  maxStay={maxStay}
                  onDelete={() => onDeleteTraveler(traveler.id)}
                  onPassportChange={(code) => onPassportChange(traveler.id, code)}
                  sx={{ width: "100%" }}
                />
              </Box>
            );
          })}

          <Box sx={{ ...rightSidebarSx, alignSelf: "stretch" }} />
        </Box>

        {/* ── Content row ─────────────────────────────────────────────────── */}
        <Box sx={{ display: "flex", flexDirection: "row", width: "100%" }}>
          <DateSidebar
            timelineStart={timelineStart}
            timelineEnd={timelineEnd}
          />

          {travelers.map((traveler) => (
            <TravelerTimelineColumn
              key={traveler.id}
              traveler={traveler}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              onAddTrip={onAddTrip}
              onEditTrip={onEditTrip}
            />
          ))}

          <Box
            sx={{ ...rightSidebarSx, height: "100%", alignSelf: "stretch" }}
          />
        </Box>
      </Box>
    </Box>
  );
}
