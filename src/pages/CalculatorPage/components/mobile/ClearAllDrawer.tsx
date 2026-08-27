import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";

interface ClearAllDrawerProps {
  open: boolean;
  onClose: () => void;
  onClearTrips: () => void;
  onClearTravelers: () => void;
  travelerCount: number;
}

function ClearOptionRow({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        width: "100%",
        textAlign: "left",
        py: "13px",
        px: "20px",
        bgcolor: "transparent",
        border: "none",
        borderTop: `1px solid ${tokens.border}`,
        cursor: "pointer",
        "&:active": { bgcolor: alpha(tokens.red, 0.04) },
      }}
    >
      <Box sx={{ color: tokens.red, display: "flex", flexShrink: 0, mt: "1px" }}>
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.92rem",
            fontWeight: 600,
            color: tokens.red,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.76rem",
            color: tokens.textSoft,
            lineHeight: 1.45,
            mt: "2px",
          }}
        >
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Mobile confirmation drawer for the "Clear data" utility action. Offers
 * two destructive options: clear every trip (travelers are kept), or clear
 * every traveler along with their trips.
 */
export function ClearAllDrawer({
  open,
  onClose,
  onClearTrips,
  onClearTravelers,
  travelerCount,
}: ClearAllDrawerProps) {
  function handleClearTrips() {
    onClearTrips();
    onClose();
  }

  function handleClearTravelers() {
    onClearTravelers();
    onClose();
  }

  return (
    <BottomDrawer open={open} onClose={onClose} title="Clear data?">
      <Typography
        sx={{
          fontSize: "0.8rem",
          color: tokens.textSoft,
          lineHeight: 1.5,
          px: "20px",
          pb: "4px",
        }}
      >
        Choose what to remove. This can't be undone.
      </Typography>

      <Box sx={{ pb: "8px" }}>
        <ClearOptionRow
          icon={<DeleteOutlineIcon sx={{ fontSize: "1.1rem" }} />}
          title="Clear all trips"
          description={`Removes every trip from ${travelerCount > 1 ? `all ${travelerCount} travelers` : "this traveler"}. Travelers are kept.`}
          onClick={handleClearTrips}
        />
        <ClearOptionRow
          icon={<GroupRemoveIcon sx={{ fontSize: "1.1rem" }} />}
          title="Clear all travelers"
          description="Removes every traveler along with all of their trips."
          onClick={handleClearTravelers}
        />
      </Box>

      <Box sx={{ px: "20px", pb: "8px" }}>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: "100%",
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
      </Box>
    </BottomDrawer>
  );
}
