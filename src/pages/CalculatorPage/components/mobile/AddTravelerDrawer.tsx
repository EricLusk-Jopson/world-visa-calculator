import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
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

interface AddTravelerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, passportCode: string | null) => void;
}

function PassportPickerScreen({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: string | null;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => { if (open) setQuery(""); }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : COUNTRIES;
  }, [query]);

  return (
    <Dialog fullScreen open={open} onClose={onClose} style={{ zIndex: 1500 }}>
      <Box sx={{ bgcolor: tokens.navy, display: "flex", alignItems: "center", gap: "4px", pl: "4px", pr: "12px", py: "8px", flexShrink: 0 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: tokens.white, p: "8px" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", fontWeight: 400, color: tokens.white }}>
          Passport
        </Typography>
      </Box>

      <Box sx={{ px: "16px", py: "12px", flexShrink: 0 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search countries…"
          fullWidth
          autoFocus
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((country) => (
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
              bgcolor: country.code === value ? alpha(tokens.navy, 0.04) : "transparent",
              border: "none",
              borderBottom: `1px solid ${tokens.border}`,
              textAlign: "left",
              cursor: "pointer",
              fontFamily: tokens.fontBody,
              fontSize: "0.92rem",
              fontWeight: country.code === value ? 600 : 400,
              color: country.code === value ? tokens.navy : tokens.text,
              "&:active": { bgcolor: tokens.mist },
            }}
          >
            {country.name}
            {country.code === value && <CheckIcon sx={{ fontSize: "1rem", color: tokens.green }} />}
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}

export function AddTravelerDrawer({ open, onClose, onAdd }: AddTravelerDrawerProps) {
  const [name, setName] = useState("");
  const [passportCode, setPassportCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (open) { setName(""); setPassportCode(null); setError(null); }
    else setPickerOpen(false);
  }, [open]);

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Please enter a name."); return; }
    onAdd(trimmed, passportCode);
  }

  const schengenHint = passportCode ? (() => {
    const r = getSchengenRule(passportCode);
    if (r.access === "entitled") return null;
    return r.access === "free_movement"
      ? "EU/EEA/Swiss passports have free movement — no 90-day limit applies."
      : "A Schengen visa is required for this passport.";
  })() : null;

  const isDisabled = !name.trim();

  return (
    <>
      <BottomDrawer open={open} onClose={onClose} title="Add Traveler">
        <Box sx={{ px: "20px", pb: "8px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <Box>
            <Typography component="label" sx={{ display: "block", fontFamily: tokens.fontBody, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tokens.textSoft, mb: "6px" }}>
              Name
            </Typography>
            <TextField
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              placeholder="e.g. Emma"
              fullWidth
              autoFocus
              inputProps={{ maxLength: 30 }}
              error={Boolean(error)}
              helperText={error ?? undefined}
            />
          </Box>

          <Box>
            <Typography component="label" sx={{ display: "block", fontFamily: tokens.fontBody, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tokens.textSoft, mb: "6px" }}>
              Passport
            </Typography>
            <Box
              component="button"
              onClick={() => setPickerOpen(true)}
              sx={{
                width: "100%", display: "flex", alignItems: "center",
                px: "12px", py: "11px",
                bgcolor: tokens.mist, border: `1.5px solid ${tokens.border}`, borderRadius: "10px",
                fontFamily: tokens.fontBody, fontSize: "1rem",
                color: passportCode ? tokens.text : tokens.textGhost,
                cursor: "pointer", textAlign: "left",
                "&:active": { borderColor: tokens.navy },
              }}
            >
              {passportCode ? getCountryName(passportCode) : "Passport / nationality"}
            </Box>
          </Box>

          {schengenHint && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.72rem", color: tokens.textGhost }}>
              {schengenHint}
            </Typography>
          )}

          <Box sx={{ display: "flex", gap: "8px", pb: "8px" }}>
            <Box component="button" onClick={onClose} sx={{ flex: 1, py: "11px", border: `1px solid ${tokens.border}`, borderRadius: "10px", bgcolor: tokens.mist, color: tokens.textSoft, fontFamily: tokens.fontBody, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", "&:active": { bgcolor: tokens.border } }}>
              Cancel
            </Box>
            <Box component="button" onClick={handleAdd} disabled={isDisabled} sx={{ flex: 2, py: "11px", border: "none", borderRadius: "10px", bgcolor: isDisabled ? tokens.border : tokens.navy, color: isDisabled ? tokens.textGhost : tokens.white, fontFamily: tokens.fontBody, fontSize: "0.85rem", fontWeight: 600, cursor: isDisabled ? "default" : "pointer", "&:active": !isDisabled ? { opacity: 0.85 } : {} }}>
              Add
            </Box>
          </Box>
        </Box>
      </BottomDrawer>

      <PassportPickerScreen
        open={pickerOpen}
        value={passportCode}
        onSelect={(code) => { setPassportCode(code); setPickerOpen(false); }}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
