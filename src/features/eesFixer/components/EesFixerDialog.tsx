/**
 * The fixer inside /app: a dialog (full screen on phones) sharing the
 * calculator's traveler state, so trips edited here update the timeline.
 */
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { Traveler } from "@/types";
import { tokens } from "@/styles/theme";
import { EesFixer } from "./EesFixer";
import type { FixerLaunch } from "../launcher";

interface Props {
  launch: FixerLaunch | null;
  onClose: () => void;
  travelers: Traveler[];
  onTravelersChange: (next: Traveler[]) => void;
}

export function EesFixerDialog({ launch, onClose, travelers, onTravelersChange }: Props) {
  const fullScreen = useMediaQuery("(max-width:599.95px)");
  return (
    <Dialog
      open={launch !== null}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
      aria-labelledby="ees-fixer-title"
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : "16px", bgcolor: tokens.offWhite } }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          px: { xs: "16px", sm: "24px" },
          py: "14px",
          bgcolor: tokens.navy,
          color: tokens.white,
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography id="ees-fixer-title" component="h2" sx={{ fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: "1.15rem" }}>
            EES Record Fixer
          </Typography>
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.78rem", opacity: 0.75 }}>
            Find the crossing your EES record is missing, and ask for it to be corrected.
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close the EES Record Fixer" sx={{ color: tokens.white }}>
          <CloseIcon />
        </IconButton>
      </Box>
      {launch && (
        <EesFixer
          travelers={travelers}
          onTravelersChange={onTravelersChange}
          surface="app"
          initialStep={launch.step}
          initialTravelerId={launch.travelerId}
        />
      )}
    </Dialog>
  );
}
