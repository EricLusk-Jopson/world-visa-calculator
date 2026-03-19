import { useRef, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";
import { TravelerCardsColumn } from "../TravelerCardsColumn";
import { tokens } from "@/styles/theme";
import { SIDEBAR_WIDTH } from "../../timeline/timelineConstants";

/**
 * The minimum rendered width of a column's content area (excluding the 14 px
 * horizontal padding on each side used by the header).
 */
const MIN_COLUMN_CONTENT_WIDTH = 225;
const COLUMN_H_PADDING = 14 * 2; // px: "14px" on each side in TravelerColumnHeader
export const MIN_COLUMN_WIDTH = MIN_COLUMN_CONTENT_WIDTH + COLUMN_H_PADDING; // 178 px

/**
 * Column width below which every header switches to the compact two-row layout
 * (name + delete on row A, badges on row B). The flag is shared so all headers
 * always flip simultaneously.
 */
const COMPACT_THRESHOLD = 340;

interface CardsViewProps {
  travelers: Traveler[];
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
}

/**
 * Cards view layout.
 *
 * Equal-width columns — every TravelerCardsColumn uses `flex: "1 1 0"` (zero
 * flex-basis) so available space is distributed equally regardless of content.
 *
 * Horizontal scroll — once columns hit MIN_COLUMN_WIDTH the container scrolls
 * horizontally instead of compressing further. Vertical scroll is handled
 * internally by each column's trip list.
 *
 * Synchronised compact layout — a ResizeObserver tracks container width and
 * derives an `effectiveColumnWidth = max(MIN_COLUMN_WIDTH, available / N)`.
 * One shared `compact` boolean is passed to every column so all headers switch
 * layout at exactly the same moment.
 */
export function CardsView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
}: CardsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Seed synchronously to avoid a layout flash on the first paint.
    setContainerWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const numColumns = travelers.length;
  const naturalColumnWidth =
    numColumns > 0 ? (containerWidth - SIDEBAR_WIDTH * 2) / numColumns : 0;
  // Use the floored value so compact matches what the browser actually renders.
  const effectiveColumnWidth = Math.max(MIN_COLUMN_WIDTH, naturalColumnWidth);
  const compact =
    effectiveColumnWidth > 0 && effectiveColumnWidth < COMPACT_THRESHOLD;

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        // Columns handle their own vertical scroll; we only need horizontal here.
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        flexDirection: "row",
        minHeight: 0,
      }}
    >
      {/* Sidebar spacer — mirrors DateSidebar width for visual alignment */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
          alignSelf: "stretch",
          bgcolor: tokens.offWhite,
          borderRight: `1px solid ${tokens.border}`,
        }}
      />

      {travelers.map((traveler) => (
        <TravelerCardsColumn
          key={traveler.id}
          traveler={traveler}
          compact={compact}
          onAddTrip={onAddTrip}
          onEditTrip={onEditTrip}
          onDeleteTraveler={onDeleteTraveler}
        />
      ))}

      {/* Right sidebar spacer */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          flexShrink: 0,
          alignSelf: "stretch",
          bgcolor: tokens.offWhite,
          borderLeft: `1px solid ${tokens.border}`,
        }}
      />
    </Box>
  );
}
