import { useState, useEffect, useMemo, useRef } from "react";
import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import { alpha } from "@mui/material/styles";
import { tokens } from "@/styles/theme";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { COUNTRIES, getCountryName } from "../travelers/NationalitySelector";
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
// inside a user-gesture handler. The overlay is always mounted so the ref
// is always valid — we call focus() synchronously in the button's onClick.

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
  const [query, setQuery] = useState("");

  // Reset search when picker opens
  useEffect(() => { if (pickerOpen) setQuery(""); }, [pickerOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [query]);

  // Portal lifts the overlay out of CalculatorPage's stacking context so it
  // renders above MUI Drawer portals regardless of z-index comparisons.
  return (
    <Portal>
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
      {/* Navy header */}
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

      {/* Search input */}
      <Box sx={{ px: "16px", py: "12px", flexShrink: 0, bgcolor: tokens.offWhite }}>
        <Box
          ref={pickerInputRef}
          component="input"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search countries…"
          sx={{
            display: "block",
            width: "100%",
            px: "14px",
            py: "11px",
            bgcolor: tokens.mist,
            border: `1.5px solid ${tokens.border}`,
            borderRadius: "10px",
            fontFamily: tokens.fontBody,
            fontSize: "1rem",
            color: tokens.text,
            outline: "none",
            "&:focus": {
              borderColor: tokens.navy,
              boxShadow: `0 0 0 3px ${alpha(tokens.navy, 0.06)}`,
            },
            "&::placeholder": { color: tokens.textGhost },
          }}
        />
      </Box>

      {/* Country list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <Typography
            sx={{
              px: "20px",
              py: "24px",
              fontFamily: tokens.fontBody,
              fontSize: "0.88rem",
              color: tokens.textGhost,
              textAlign: "center",
            }}
          >
            No countries match "{query}"
          </Typography>
        ) : (
          filtered.map((country) => {
            const isSelected = country.code === value;
            return (
              <Box
                key={country.code}
                component="button"
                onClick={() => onSelect(country.code)}
                sx={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: "20px",
                  py: "14px",
                  bgcolor: isSelected ? alpha(tokens.navy, 0.04) : "transparent",
                  border: "none",
                  borderBottom: `1px solid ${tokens.border}`,
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: tokens.fontBody,
                  fontSize: "0.92rem",
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? tokens.navy : tokens.text,
                  "&:active": { bgcolor: tokens.mist },
                }}
              >
                {country.name}
                {isSelected && (
                  <CheckIcon sx={{ fontSize: "1rem", color: tokens.green, flexShrink: 0 }} />
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
    </Portal>
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
                "&:active": { borderColor: tokens.navy },
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

      {/* Always mounted so pickerInputRef is valid for synchronous focus() */}
      <PassportPickerScreen
        pickerOpen={passportPickerOpen}
        pickerInputRef={pickerInputRef}
        value={passportCode}
        onSelect={(code) => {
          setPassportCode(code);
          setPassportPickerOpen(false);
        }}
        onClose={() => setPassportPickerOpen(false)}
      />
    </>
  );
}
