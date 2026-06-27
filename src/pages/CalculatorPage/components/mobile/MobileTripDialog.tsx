import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CheckIcon from "@mui/icons-material/Check";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { parseDate, formatDate, addDays, today as getToday } from "@/features/calculator/utils/dates";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/ui/RegionSelector";
import { OngoingToggle } from "@/components/ui/OngoingToggle";

export interface MobileTripDialogProps {
  open: boolean;
  mode: "add" | "edit";
  travelers: Traveler[];
  initialTravelerIds: string[];
  initialTrip?: Trip;
  onSave: (travelerIds: string[], trip: Trip) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ display: "block", fontFamily: tokens.fontBody, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: tokens.textSoft, mb: "6px" }}>
      {children}
    </Typography>
  );
}

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
    "&:hover fieldset": { borderColor: tokens.navy },
    "&.Mui-focused fieldset": { borderColor: tokens.navy, borderWidth: 1.5 },
  },
  "& .MuiOutlinedInput-input": {
    py: "9px",
    px: "11px",
    color: tokens.text,
    "&::placeholder": { color: tokens.textGhost, opacity: 1 },
  },
} as const;

export function MobileTripDialog({ open, mode, travelers, initialTravelerIds, initialTrip, onSave, onDelete, onClose }: MobileTripDialogProps) {
  const [travelerIds, setTravelerIds] = useState<string[]>(initialTravelerIds);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const todayStr = formatDate(getToday());

  useEffect(() => {
    if (!open) return;
    setTravelerIds(initialTravelerIds);
    setError(null);
    if (mode === "edit" && initialTrip) {
      setDestination(initialTrip.destination ?? "");
      setEntryDate(initialTrip.entryDate);
      setExitDate(initialTrip.exitDate ?? "");
      setOngoing(!initialTrip.exitDate);
      setRegion(initialTrip.region);
    } else {
      setDestination("");
      setEntryDate("");
      setExitDate("");
      setOngoing(false);
      setRegion(VisaRegion.Schengen);
    }
  }, [open, mode, initialTrip, initialTravelerIds]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSave() {
    if (travelerIds.length === 0) { setError("Please select at least one traveler."); return; }
    if (!entryDate) { setError("Please enter an entry date."); return; }
    const resolvedExit = ongoing ? undefined : exitDate || undefined;
    const trip: Trip = {
      id: initialTrip?.id ?? crypto.randomUUID(),
      entryDate,
      exitDate: resolvedExit,
      region,
      destination: destination.trim() || undefined,
    };
    onSave(travelerIds, trip);
    onClose();
  }

  function toggleTraveler(id: string) {
    setTravelerIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    setError(null);
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      {/* Header */}
      <Box sx={{ bgcolor: tokens.navy, display: "flex", alignItems: "center", gap: "4px", pl: "4px", pr: "12px", py: "8px", flexShrink: 0 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: tokens.white, p: "8px" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", fontWeight: 400, color: tokens.white }}>
          {isEdit ? "Edit trip" : "Add a trip"}
        </Typography>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: "auto", px: "20px", py: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {error && (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.red }}>{error}</Typography>
        )}

        {/* Travelers */}
        {travelers.length > 0 && (
          <Box>
            <FormLabel>Traveler(s)</FormLabel>
            <Box sx={{ border: `1.5px solid ${tokens.border}`, borderRadius: "10px", overflow: "hidden" }}>
              {travelers.map((t, i) => {
                const selected = travelerIds.includes(t.id);
                return (
                  <Box
                    key={t.id}
                    component="button"
                    onClick={() => toggleTraveler(t.id)}
                    sx={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      px: "14px", py: "12px", border: "none",
                      borderTop: i > 0 ? `1px solid ${tokens.border}` : "none",
                      bgcolor: selected ? tokens.navy : "transparent",
                      color: selected ? tokens.white : tokens.text,
                      fontFamily: tokens.fontBody, fontSize: "0.92rem",
                      textAlign: "left", cursor: "pointer",
                    }}
                  >
                    {t.name}
                    {selected && <CheckIcon sx={{ fontSize: "1rem" }} />}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Region */}
        <Box>
          <FormLabel>Region</FormLabel>
          <RegionSelector value={region} onChange={setRegion} />
        </Box>

        {/* Trip name */}
        <Box>
          <FormLabel>Trip name</FormLabel>
          <TextField value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Paris & Barcelona" fullWidth inputProps={{ maxLength: 60 }} sx={INPUT_SX} />
        </Box>

        {/* Dates */}
        <Box>
          <FormLabel>Dates</FormLabel>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", mb: "8px" }}>
            <TextField
              type="date"
              size="small"
              value={entryDate}
              onChange={(e) => {
                const iso = e.target.value;
                setEntryDate(iso);
                if (iso > todayStr && ongoing) setOngoing(false);
                if (!ongoing && iso && (!exitDate || exitDate <= iso)) setExitDate(formatDate(addDays(parseDate(iso), 1)));
                setError(null);
              }}
              sx={INPUT_SX}
            />
            <TextField
              type="date"
              size="small"
              value={exitDate}
              disabled={ongoing || !entryDate}
              inputProps={{ min: entryDate || undefined }}
              onChange={(e) => { setExitDate(e.target.value); setError(null); }}
              sx={{ ...(ongoing || !entryDate ? { opacity: 0.5 } : {}), ...INPUT_SX }}
            />
          </Box>
          <OngoingToggle
            checked={ongoing}
            label={
              region === VisaRegion.Schengen ? "Currently inside Schengen (no exit yet)" :
              region === VisaRegion.UnitedKingdom ? "Currently in the UK (no exit yet)" :
              region === VisaRegion.Ireland ? "Currently in Ireland (no exit yet)" :
              "Currently travelling (no exit date yet)"
            }
            onChange={(v) => { setOngoing(v); if (v) setExitDate(""); setError(null); }}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ height: 1, bgcolor: tokens.border }} />
      <Box sx={{ px: "20px", py: "16px", paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)", display: "flex", gap: "8px" }}>
        {isEdit && onDelete && <Button variant="danger" onClick={onDelete} sx={{ mr: "auto" }}>Delete</Button>}
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancel</Button>
        <Button onClick={handleSave} sx={{ flex: 2 }}>Save Trip</Button>
      </Box>
    </Dialog>
  );
}
