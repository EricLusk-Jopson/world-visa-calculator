import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { NationalitySelector } from "../travelers/NationalitySelector";
import { getSchengenRule } from "@/data/regions/schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddTravelerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, passportCode: string | null) => void;
}

// ─── Shared input sx ──────────────────────────────────────────────────────────

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.9rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": { borderColor: tokens.navy, borderWidth: 1.5 },
  },
  "& .MuiOutlinedInput-input": { py: "10px", px: "12px", color: tokens.text },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function AddTravelerDrawer({ open, onClose, onAdd }: AddTravelerDrawerProps) {
  const [name, setName] = useState("");
  const [passportCode, setPassportCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setPassportCode(null);
      setError(null);
    }
  }, [open]);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a name.");
      return;
    }
    onAdd(trimmed, passportCode);
  }

  const isDisabled = !name.trim();

  const schengenHint = passportCode
    ? (() => {
        const r = getSchengenRule(passportCode);
        if (r.access === "entitled") return null;
        return r.access === "free_movement"
          ? "EU/EEA/Swiss passports have free movement — no 90-day limit applies."
          : "A Schengen visa is required for this passport.";
      })()
    : null;

  return (
    <BottomDrawer open={open} onClose={onClose} title="Add Traveler">
      <Box
        sx={{
          px: "20px",
          pb: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Name */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.textSoft,
              mb: "6px",
            }}
          >
            Name
          </Typography>
          <TextField
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder="e.g. Emma"
            fullWidth
            autoFocus
            inputProps={{ maxLength: 30 }}
            sx={INPUT_SX}
            error={Boolean(error)}
            helperText={error ?? undefined}
          />
        </Box>

        {/* Passport */}
        <Box>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontFamily: tokens.fontBody,
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: tokens.textSoft,
              mb: "6px",
            }}
          >
            Passport
          </Typography>
          <NationalitySelector value={passportCode} onChange={setPassportCode} />
        </Box>

        {schengenHint && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.72rem",
              color: tokens.textGhost,
            }}
          >
            {schengenHint}
          </Typography>
        )}

        {/* Actions */}
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
            onClick={handleAdd}
            disabled={isDisabled}
            sx={{
              flex: 2,
              py: "11px",
              border: "none",
              borderRadius: "10px",
              bgcolor: isDisabled ? tokens.border : tokens.navy,
              color: isDisabled ? tokens.textGhost : tokens.white,
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: isDisabled ? "default" : "pointer",
              "&:active": !isDisabled ? { opacity: 0.85 } : {},
            }}
          >
            Add
          </Box>
        </Box>
      </Box>
    </BottomDrawer>
  );
}
