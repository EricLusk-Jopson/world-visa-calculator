import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { tokens } from "@/styles/theme";
import { Button } from "@/components/ui/Button";

interface ClearAllModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  travelerCount: number;
}

/**
 * Desktop confirmation modal for the "Clear All" nav action. Removes every
 * trip from every traveler — travelers themselves are kept.
 */
export function ClearAllModal({
  open,
  onClose,
  onConfirm,
  travelerCount,
}: ClearAllModalProps) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: 380,
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
            Clear all trips?
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
      <Box sx={{ px: "20px", py: "16px" }}>
        <Typography sx={{ fontSize: "0.85rem", color: tokens.textSoft, lineHeight: 1.6 }}>
          This will remove every trip from{" "}
          {travelerCount > 1 ? `all ${travelerCount} travelers` : "this traveler"}.
          Travelers themselves won't be deleted. This can't be undone.
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: tokens.border, mx: 0 }} />

      {/* Footer */}
      <Box sx={{ px: "20px", py: "16px", display: "flex", gap: "7px" }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} sx={{ flex: 2 }}>
          Clear All Trips
        </Button>
      </Box>
    </Dialog>
  );
}
