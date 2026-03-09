import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";
import { TravelerCardsColumn } from "../TravelerCardsColumn";
import { tokens } from "@/styles/theme";
import { SIDEBAR_WIDTH } from "../../timeline/timelineConstants";
import { AddTravelerGhost } from "../../travelers/AddTravelerGhost";

interface CardsViewProps {
  travelers: Traveler[];
  onAddTrip: (travelerId: string) => void;
  onEditTrip: (travelerId: string, trip: Trip) => void;
  onDeleteTraveler: (travelerId: string) => void;
  onAddTraveler: () => void;
}

/**
 * Cards view layout. A blank sidebar spacer keeps the column layout aligned
 * with the timeline view's DateSidebar, then traveler columns flow horizontally.
 */
export function CardsView({
  travelers,
  onAddTrip,
  onEditTrip,
  onDeleteTraveler,
  onAddTraveler,
}: CardsViewProps) {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
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

      {/* Traveler columns */}
      {travelers.map((traveler) => (
        <TravelerCardsColumn
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
  );
}
