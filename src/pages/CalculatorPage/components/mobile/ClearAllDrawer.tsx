import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";

interface ClearAllDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  travelerCount: number;
}

/**
 * Mobile confirmation drawer for the "Clear all trips" utility action.
 * Removes every trip from every traveler — travelers themselves are kept.
 */
export function ClearAllDrawer({
  open,
  onClose,
  onConfirm,
  travelerCount,
}: ClearAllDrawerProps) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Clear all trips?">
      <Box sx={{ px: "20px", pb: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <Typography sx={{ fontSize: "0.85rem", color: tokens.textSoft, lineHeight: 1.6 }}>
          This will remove every trip from{" "}
          {travelerCount > 1 ? `all ${travelerCount} travelers` : "this traveler"}.
          Travelers themselves won't be deleted. This can't be undone.
        </Typography>

        <Box sx={{ display: "flex", gap: "8px", pb: "8px" }}>
          <Box
            component="button"
            onClick={onClose}
            sx={{
              flex: 1,
              py: "11px",
              border: `1px solid ${tokens.border}`,
              borderRadius: "10px",
              bgcolor: tokens.mist,
              color: tokens.textSoft,
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              "&:active": { bgcolor: tokens.border },
            }}
          >
            Cancel
          </Box>
          <Box
            component="button"
            onClick={handleConfirm}
            sx={{
              flex: 2,
              py: "11px",
              border: "none",
              borderRadius: "10px",
              bgcolor: tokens.red,
              color: tokens.white,
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              "&:active": { opacity: 0.85 },
            }}
          >
            Clear All Trips
          </Box>
        </Box>
      </Box>
    </BottomDrawer>
  );
}
