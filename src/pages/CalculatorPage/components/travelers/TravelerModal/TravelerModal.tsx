import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { tokens } from "@/styles/theme";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { Button } from "@/components/ui/Button";

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
          borderRadius: "20px",
          width: 360,
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
            transition: "all 0.15s",
            "&:hover": { bgcolor: tokens.redBg, color: tokens.red },
          }}
        >
          ✕
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: "20px", py: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Typography
            component="label"
            htmlFor="traveler-name-input"
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.textSoft,
            }}
          >
            Name
          </Typography>
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
            inputProps={{ maxLength: 30 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontFamily: tokens.fontBody,
                fontSize: "0.85rem",
                bgcolor: tokens.mist,
                borderRadius: "10px",
                "& fieldset": { borderColor: error ? tokens.red : tokens.border, borderWidth: 1.5 },
                "&:hover fieldset": { borderColor: tokens.navy },
                "&.Mui-focused fieldset": {
                  borderColor: tokens.navy,
                  borderWidth: 1.5,
                  boxShadow: `0 0 0 3px rgba(12,30,60,0.06)`,
                },
              },
              "& .MuiOutlinedInput-input": {
                py: "9px",
                px: "11px",
                color: tokens.text,
                "&::placeholder": { color: tokens.textGhost, opacity: 1 },
              },
            }}
          />
        </Box>

        {error && <ValidationMessage variant="error">{error}</ValidationMessage>}

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
