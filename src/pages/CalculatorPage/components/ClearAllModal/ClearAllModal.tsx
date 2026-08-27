import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import { tokens } from "@/styles/theme";
import { Button } from "@/components/ui/Button";

interface ClearAllModalProps {
  open: boolean;
  onClose: () => void;
  onClearTrips: () => void;
  onClearTravelers: () => void;
  travelerCount: number;
}

function ClearOption({
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
        p: "12px 14px",
        border: `1px solid ${tokens.border}`,
        borderRadius: "12px",
        bgcolor: tokens.white,
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        "&:hover": {
          borderColor: tokens.redBorder,
          bgcolor: tokens.redBg,
        },
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          flexShrink: 0,
          borderRadius: "8px",
          bgcolor: tokens.redBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.red,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.85rem",
            fontWeight: 700,
            color: tokens.text,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.75rem",
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
 * Desktop confirmation modal for the "Clear All" nav action. Offers two
 * destructive options: clear every trip (travelers are kept), or clear
 * every traveler along with their trips.
 */
export function ClearAllModal({
  open,
  onClose,
  onClearTrips,
  onClearTravelers,
  travelerCount,
}: ClearAllModalProps) {
  function handleClearTrips() {
    onClearTrips();
    onClose();
  }

  function handleClearTravelers() {
    onClearTravelers();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: 400,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(12,30,60,0.18)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: "20px",
          pt: "18px",
          pb: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              bgcolor: tokens.redBg,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.red,
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: "1rem" }} />
          </Box>
          <Typography
            sx={{
              fontFamily: tokens.fontDisplay,
              fontSize: "1.1rem",
              fontStyle: "italic",
              fontWeight: 400,
              color: tokens.navy,
            }}
          >
            Clear data?
          </Typography>
        </Box>
        <Box
          component="button"
          onClick={onClose}
          sx={{
            width: 26,
            height: 26,
            border: "none",
            borderRadius: "5px",
            bgcolor: tokens.mist,
            color: tokens.textSoft,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.85rem",
            transition: "all 0.15s",
            "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
          }}
        >
          ✕
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: "20px", pt: "14px", pb: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Typography sx={{ fontSize: "0.8rem", color: tokens.textSoft, lineHeight: 1.5 }}>
          Choose what to remove. This can't be undone.
        </Typography>

        <ClearOption
          icon={<DeleteOutlineIcon sx={{ fontSize: "1.05rem" }} />}
          title="Clear all trips"
          description={`Removes every trip from ${travelerCount > 1 ? `all ${travelerCount} travelers` : "this traveler"}. Travelers are kept.`}
          onClick={handleClearTrips}
        />

        <ClearOption
          icon={<GroupRemoveIcon sx={{ fontSize: "1.05rem" }} />}
          title="Clear all travelers"
          description="Removes every traveler along with all of their trips."
          onClick={handleClearTravelers}
        />
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: tokens.border, mx: 0 }} />

      {/* Footer */}
      <Box sx={{ px: "20px", py: "16px" }}>
        <Button variant="ghost" onClick={onClose} fullWidth>
          Cancel
        </Button>
      </Box>
    </Dialog>
  );
}
