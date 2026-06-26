import { useState, useEffect, useCallback, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { NationalitySelector, getCountryName } from "../travelers/NationalitySelector";
import { getSchengenRule } from "@/data/regions/schengen";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddTravelerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, passportCode: string | null) => void;
}

// ─── Passport picker ──────────────────────────────────────────────────────────
//
// iOS Safari only opens the keyboard when focus() is called synchronously
// inside a user-gesture handler. Using a Dialog (which unmounts/remounts)
// makes that impossible because the <input> doesn't exist at click time.
//
// Fix: render the picker as a position:fixed overlay that is ALWAYS in the
// DOM, hidden only via transform:translateY(100%). The inputRef is therefore
// always valid, so we can call focus() synchronously in the button's onClick
// before any state update — iOS respects the gesture chain and opens the
// keyboard immediately as the overlay slides into view.

// Dropdown delay: let the CSS slide-up finish before asking the Autocomplete
// Popper to measure and position itself.
const DROPDOWN_DELAY_MS = 260;

function PassportPickerScreen({
  pickerOpen,
  pickerInputRef,
  value,
  onSelect,
  onClose,
}: {
  pickerOpen: boolean;
  pickerInputRef: React.RefObject<HTMLInputElement | null>;
  value: string | null;
  onSelect: (code: string | null) => void;
  onClose: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!pickerOpen) { setDropdownOpen(false); return; }
    const id = setTimeout(() => setDropdownOpen(true), DROPDOWN_DELAY_MS);
    return () => clearTimeout(id);
  }, [pickerOpen]);

  const handleDropdownOpen  = useCallback(() => setDropdownOpen(true),  []);
  const handleDropdownClose = useCallback(() => setDropdownOpen(false), []);

  return (
    <Box
      aria-hidden={!pickerOpen}
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        bgcolor: tokens.offWhite,
        display: "flex",
        flexDirection: "column",
        transform: pickerOpen ? "translateY(0)" : "translateY(100%)",
        transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: pickerOpen ? "auto" : "none",
      }}
    >
      {/* Navy header — back arrow + title */}
      <Box
        sx={{
          bgcolor: tokens.navy,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "4px",
          pl: "4px",
          pr: "12px",
          py: "8px",
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: tokens.white, p: "8px" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography
          sx={{
            fontFamily: tokens.fontDisplay,
            fontSize: "1rem",
            fontStyle: "italic",
            fontWeight: 400,
            color: tokens.white,
            flex: 1,
          }}
        >
          Passport
        </Typography>
      </Box>

      {/* Search input — Autocomplete dropdown opens after slide animation */}
      <Box sx={{ px: "16px", pt: "16px" }}>
        <NationalitySelector
          value={value}
          onChange={onSelect}
          inputRef={pickerInputRef}
          open={dropdownOpen}
          onOpen={handleDropdownOpen}
          onClose={handleDropdownClose}
        />
      </Box>
    </Box>
  );
}

// ─── Shared input sx ──────────────────────────────────────────────────────────

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
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
  const [passportPickerOpen, setPassportPickerOpen] = useState(false);

  // Ref to the native <input> inside PassportPickerScreen's NationalitySelector.
  // Always valid because the picker is always mounted.
  const pickerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setPassportCode(null);
      setError(null);
    } else {
      setPassportPickerOpen(false);
    }
  }, [open]);

  function handleOpenPicker() {
    // Focus synchronously inside the gesture handler so iOS opens the keyboard
    // as the overlay slides into view — setTimeout breaks the gesture chain.
    pickerInputRef.current?.focus();
    setPassportPickerOpen(true);
  }

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

  const passportDisplayName = passportCode ? getCountryName(passportCode) : null;

  return (
    <>
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

          {/* Passport — tappable display field, opens full-screen picker */}
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
            <Box
              component="button"
              onClick={handleOpenPicker}
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                px: "12px",
                py: "11px",
                bgcolor: tokens.mist,
                border: `1.5px solid ${tokens.border}`,
                borderRadius: "10px",
                fontFamily: tokens.fontBody,
                fontSize: "1rem",
                color: passportDisplayName ? tokens.text : tokens.textGhost,
                cursor: "pointer",
                textAlign: "left",
                "&:focus-visible": {
                  outline: `2px solid ${tokens.navy}`,
                  outlineOffset: 2,
                },
              }}
            >
              {passportDisplayName ?? "Passport / nationality"}
            </Box>
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

      {/* Always mounted — keeps pickerInputRef valid for synchronous focus() */}
      <PassportPickerScreen
        pickerOpen={passportPickerOpen}
        pickerInputRef={pickerInputRef}
        value={passportCode}
        onSelect={(code) => {
          setPassportCode(code);
          if (code !== null) setPassportPickerOpen(false);
        }}
        onClose={() => setPassportPickerOpen(false)}
      />
    </>
  );
}
