import Box from "@mui/material/Box";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { TripDetailStack } from "./TripDetailStack";
import type { TravelerEligibility } from "@/pages/CalculatorPage/components/trips/tripEligibility";
import type { TravelerDuration } from "@/pages/CalculatorPage/components/trips/tripDuration";

export function MobileTripDetailFrame({
  open,
  onClose,
  eligibility,
  durations,
  entryDate,
  exitDate,
}: {
  open: boolean;
  onClose: () => void;
  eligibility: TravelerEligibility[];
  durations: TravelerDuration[];
  entryDate: string;
  exitDate: string;
}) {
  return (
    <FullScreenSlider
      open={open}
      onClose={onClose}
      title="Eligibility & Duration"
    >
      <Box
        sx={{
          px: "16px",
          py: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <TripDetailStack
          eligibility={eligibility}
          durations={durations}
          entryDate={entryDate}
          exitDate={exitDate}
        />
      </Box>
    </FullScreenSlider>
  );
}
