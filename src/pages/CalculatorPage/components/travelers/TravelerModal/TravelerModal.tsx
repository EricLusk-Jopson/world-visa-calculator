import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { tokens } from "@/styles/theme";
import { TRAVELER_NAME_MAX_LENGTH } from "@/features/sharing";
import { INPUT_SX, INPUT_ERROR_SX } from "@/styles/formStyles";
import {
  STANDARD_TRANSITION,
  DIALOG_BOX_SHADOW,
  DIALOG_BORDER_RADIUS,
} from "@/styles/constants";
import { ValidationMessage, Button, FormLabel } from "@/components/ui";

interface TravelerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the new traveler name when the user confirms. */
  onAdd: (name: string) => void;
}

/**
 * Simple modal for adding a new traveler.
 * Only collects a name — all other traveler data comes from trips.
 */
export function TravelerModal({ open, onClose, onAdd }: TravelerModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName("");
      setError(null);
    }
  }, [open]);

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    onAdd(trimmed);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: DIALOG_BORDER_RADIUS,
          width: 360,
          maxWidth: "calc(100vw - 32px)",
          overflow: "hidden",
          boxShadow: DIALOG_BOX_SHADOW,
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
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1.1rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.navy,
          }}
        >
          Add a traveler
        </Typography>
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
            transition: STANDARD_TRANSITION,
            "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
          }}
        >
          ✕
        </Box>
      </Box>

      {/* Body */}
      <Box
        sx={{
          px: "20px",
          py: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <FormLabel htmlFor="traveler-name-input">Name</FormLabel>
          <TextField
            id="traveler-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Sophie"
            autoFocus
            inputProps={{ maxLength: TRAVELER_NAME_MAX_LENGTH }}
            sx={error ? INPUT_ERROR_SX : INPUT_SX}
          />
        </Box>

        {error && (
          <ValidationMessage variant="error">{error}</ValidationMessage>
        )}

        <Typography
          sx={{
            fontFamily: tokens.fontBody,
            fontSize: "0.72rem",
            color: tokens.textSoft,
          }}
        >
          Use first names — they appear as column headers in the tracker.
        </Typography>
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: tokens.border, mx: 0 }} />

      {/* Footer */}
      <Box sx={{ px: "20px", py: "16px", display: "flex", gap: "7px" }}>
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="green" onClick={handleSave} sx={{ flex: 2 }}>
          Add Traveler
        </Button>
      </Box>
    </Dialog>
  );
}
