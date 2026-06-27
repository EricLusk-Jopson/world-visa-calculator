import { useState, useEffect, useMemo } from "react";
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
import {
  parseDate,
  formatDate,
  addDays,
  today as getToday,
} from "@/features/calculator/utils/dates";
import { Button } from "@/components/ui/Button";
import { OngoingToggle } from "@/components/ui/OngoingToggle";

// ─── Types ────────────────────────────────────────────────────────────────────

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

type ActiveCard = "name" | "region" | "dates" | "travelers" | null;

// ─── Regions ──────────────────────────────────────────────────────────────────

const REGIONS = [
  { value: VisaRegion.Schengen, label: "Schengen Area" },
  { value: VisaRegion.UnitedKingdom, label: "United Kingdom" },
  { value: VisaRegion.Ireland, label: "Ireland" },
];

function regionLabel(r: VisaRegion) {
  return REGIONS.find((x) => x.value === r)?.label ?? r;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function fmtShort(iso: string) {
  return parseDate(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dateSummary(entry: string, exit: string, ongoing: boolean): string {
  if (!entry) return "";
  if (ongoing || !exit) {
    const days = Math.round((new Date().getTime() - parseDate(entry).getTime()) / 86_400_000) + 1;
    return `${fmtShort(entry)} — today · ${days} day${days === 1 ? "" : "s"}`;
  }
  const days = Math.round((parseDate(exit).getTime() - parseDate(entry).getTime()) / 86_400_000) + 1;
  return `${fmtShort(entry)} — ${fmtShort(exit)} · ${days} day${days === 1 ? "" : "s"}`;
}

// ─── Region picker (full-screen searchable, like PassportPickerScreen) ────────

function RegionPickerScreen({
  open,
  value,
  onSelect,
  onClose,
}: {
  open: boolean;
  value: VisaRegion;
  onSelect: (r: VisaRegion) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  useEffect(() => { if (open) setQuery(""); }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? REGIONS.filter((r) => r.label.toLowerCase().includes(q)) : REGIONS;
  }, [query]);

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <Box sx={{ bgcolor: tokens.navy, display: "flex", alignItems: "center", gap: "4px", pl: "4px", pr: "12px", py: "8px", flexShrink: 0 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: tokens.white, p: "8px" }}>
          <ArrowBackIosNewIcon sx={{ fontSize: "1rem" }} />
        </IconButton>
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: "1rem", fontStyle: "italic", fontWeight: 400, color: tokens.white }}>
          Region
        </Typography>
      </Box>
      <Box sx={{ px: "16px", py: "12px", flexShrink: 0 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search regions…"
          fullWidth
          autoFocus
        />
      </Box>
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {filtered.map((r) => (
          <Box
            key={r.value}
            component="button"
            onClick={() => onSelect(r.value)}
            sx={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              px: "20px", py: "18px", bgcolor: "transparent", border: "none",
              borderBottom: `1px solid ${tokens.border}`, textAlign: "left", cursor: "pointer",
              fontFamily: tokens.fontBody, fontSize: "1rem",
              fontWeight: r.value === value ? 600 : 400,
              color: r.value === value ? tokens.navy : tokens.text,
              "&:active": { bgcolor: tokens.mist },
            }}
          >
            {r.label}
            {r.value === value && <CheckIcon sx={{ fontSize: "1rem", color: tokens.green }} />}
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}

// ─── Card shell ───────────────────────────────────────────────────────────────

const CARD_BASE = {
  borderRadius: "14px",
  border: `1.5px solid ${tokens.border}`,
  overflow: "hidden",
  transition: "border-color 0.15s",
} as const;

function CardLabel({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <Typography sx={{
      fontFamily: tokens.fontBody, fontSize: "0.65rem", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.09em",
      color: active ? tokens.navy : tokens.textSoft,
      mb: "4px", transition: "color 0.15s",
    }}>
      {children}
    </Typography>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MobileTripDialog({
  open, mode, travelers, initialTravelerIds, initialTrip, onSave, onDelete, onClose,
}: MobileTripDialogProps) {
  const [travelerIds, setTravelerIds] = useState<string[]>(initialTravelerIds);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [regionPickerOpen, setRegionPickerOpen] = useState(false);

  const isEdit = mode === "edit";
  const todayStr = formatDate(getToday());

  useEffect(() => {
    if (!open) return;
    setTravelerIds(initialTravelerIds);
    setError(null);
    setActiveCard(null);
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
    onSave(travelerIds, { id: initialTrip?.id ?? crypto.randomUUID(), entryDate, exitDate: resolvedExit, region, destination: destination.trim() || undefined });
    onClose();
  }

  function toggleTraveler(id: string) {
    setTravelerIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  const ongoingLabel =
    region === VisaRegion.Schengen ? "Currently inside Schengen (no exit yet)" :
    region === VisaRegion.UnitedKingdom ? "Currently in the UK (no exit yet)" :
    region === VisaRegion.Ireland ? "Currently in Ireland (no exit yet)" :
    "Currently travelling (no exit date yet)";

  // ── Card: Name ──────────────────────────────────────────────────────────────

  const nameActive = activeCard === "name";
  const nameFilled = destination.trim().length > 0;

  const NameCard = (
    <Box
      sx={{ ...CARD_BASE, borderColor: nameActive ? tokens.navy : tokens.border }}
      onClick={!nameActive ? () => setActiveCard("name") : undefined}
    >
      <Box sx={{ px: "16px", pt: "14px", pb: nameActive ? "12px" : "14px" }}>
        <CardLabel active={nameActive}>Trip name</CardLabel>
        {nameActive ? (
          <>
            <TextField
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris & Barcelona"
              fullWidth
              autoFocus
              inputProps={{ maxLength: 60 }}
              variant="standard"
              sx={{ "& .MuiInputBase-input": { fontFamily: tokens.fontBody, fontSize: "1rem", color: tokens.text, "&::placeholder": { color: tokens.textGhost, opacity: 1 } }, "& .MuiInput-underline:before": { borderBottomColor: tokens.border }, "& .MuiInput-underline:after": { borderBottomColor: tokens.navy } }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "10px" }}>
              <Box component="button" onClick={() => setActiveCard(null)} sx={{ border: "none", bgcolor: "transparent", fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: 600, color: tokens.navy, cursor: "pointer", px: "4px", py: "4px" }}>Done</Box>
            </Box>
          </>
        ) : (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.95rem", color: nameFilled ? tokens.text : tokens.textGhost, fontWeight: nameFilled ? 500 : 400 }}>
            {nameFilled ? destination : "e.g. Paris & Barcelona"}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // ── Card: Region ────────────────────────────────────────────────────────────

  const regionActive = activeCard === "region";

  const RegionCard = (
    <Box
      sx={{ ...CARD_BASE, borderColor: regionActive ? tokens.navy : tokens.border, cursor: "pointer" }}
      onClick={() => { setActiveCard("region"); setRegionPickerOpen(true); }}
    >
      <Box sx={{ px: "16px", py: "14px" }}>
        <CardLabel active={false}>Region</CardLabel>
        <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.95rem", color: tokens.text, fontWeight: 500 }}>
          {regionLabel(region)}
        </Typography>
      </Box>
    </Box>
  );

  // ── Card: Dates ─────────────────────────────────────────────────────────────

  const datesActive = activeCard === "dates";
  const datesFilled = !!entryDate;
  const datesSummary = datesFilled ? dateSummary(entryDate, exitDate, ongoing) : "";

  const DatesCard = (
    <Box
      sx={{ ...CARD_BASE, borderColor: datesActive ? tokens.navy : tokens.border }}
      onClick={!datesActive ? () => setActiveCard("dates") : undefined}
    >
      <Box sx={{ px: "16px", pt: "14px", pb: datesActive ? "12px" : "14px" }}>
        <CardLabel active={datesActive}>Dates</CardLabel>
        {datesActive ? (
          <>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", mt: "8px", mb: "12px" }}>
              <Box>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.65rem", fontWeight: 600, color: tokens.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>Entry</Typography>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={entryDate}
                  onChange={(e) => {
                    const iso = e.target.value;
                    setEntryDate(iso);
                    if (iso > todayStr && ongoing) setOngoing(false);
                    if (!ongoing && iso && (!exitDate || exitDate <= iso)) setExitDate(formatDate(addDays(parseDate(iso), 1)));
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: tokens.mist, "& fieldset": { borderColor: tokens.border } }, "& .MuiOutlinedInput-input": { py: "8px", px: "10px", fontFamily: tokens.fontBody } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.65rem", fontWeight: 600, color: tokens.textSoft, textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>Exit</Typography>
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={exitDate}
                  disabled={ongoing || !entryDate}
                  inputProps={{ min: entryDate || undefined }}
                  onChange={(e) => setExitDate(e.target.value)}
                  sx={{ opacity: ongoing || !entryDate ? 0.4 : 1, "& .MuiOutlinedInput-root": { borderRadius: "8px", bgcolor: tokens.mist, "& fieldset": { borderColor: tokens.border } }, "& .MuiOutlinedInput-input": { py: "8px", px: "10px", fontFamily: tokens.fontBody } }}
                />
              </Box>
            </Box>
            <OngoingToggle checked={ongoing} label={ongoingLabel} onChange={(v) => { setOngoing(v); if (v) setExitDate(""); }} />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "10px" }}>
              <Box component="button" onClick={() => setActiveCard(null)} sx={{ border: "none", bgcolor: "transparent", fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: 600, color: tokens.navy, cursor: "pointer", px: "4px", py: "4px" }}>Done</Box>
            </Box>
          </>
        ) : (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.95rem", color: datesFilled ? tokens.text : tokens.textGhost, fontWeight: datesFilled ? 500 : 400 }}>
            {datesFilled ? datesSummary : "Select dates"}
          </Typography>
        )}
      </Box>
    </Box>
  );

  // ── Card: Travelers ─────────────────────────────────────────────────────────

  const travelersActive = activeCard === "travelers";
  const travelersFilled = travelerIds.length > 0;
  const travelerNames = travelers.filter((t) => travelerIds.includes(t.id)).map((t) => t.name).join(", ");

  const TravelersCard = travelers.length > 0 ? (
    <Box
      sx={{ ...CARD_BASE, borderColor: travelersActive ? tokens.navy : tokens.border }}
      onClick={!travelersActive ? () => setActiveCard("travelers") : undefined}
    >
      <Box sx={{ px: "16px", pt: "14px", pb: travelersActive ? "12px" : "14px" }}>
        <CardLabel active={travelersActive}>Traveler(s)</CardLabel>
        {travelersActive ? (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px", mt: "10px" }}>
              {travelers.map((t) => {
                const selected = travelerIds.includes(t.id);
                return (
                  <Box
                    key={t.id}
                    component="button"
                    onClick={() => toggleTraveler(t.id)}
                    sx={{
                      px: "14px", py: "7px",
                      border: `1.5px solid ${selected ? tokens.navy : tokens.border}`,
                      borderRadius: "100px",
                      bgcolor: selected ? tokens.navy : "transparent",
                      color: selected ? tokens.white : tokens.textSoft,
                      fontFamily: tokens.fontBody, fontSize: "0.9rem",
                      fontWeight: selected ? 600 : 400,
                      cursor: "pointer", transition: "all 0.15s",
                      "&:active": { opacity: 0.75 },
                    }}
                  >
                    {t.name}
                  </Box>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "10px" }}>
              <Box component="button" onClick={() => setActiveCard(null)} sx={{ border: "none", bgcolor: "transparent", fontFamily: tokens.fontBody, fontSize: "0.8rem", fontWeight: 600, color: tokens.navy, cursor: "pointer", px: "4px", py: "4px" }}>Done</Box>
            </Box>
          </>
        ) : (
          <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.95rem", color: travelersFilled ? tokens.text : tokens.textGhost, fontWeight: travelersFilled ? 500 : 400 }}>
            {travelersFilled ? travelerNames : "Select travelers"}
          </Typography>
        )}
      </Box>
    </Box>
  ) : null;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
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
        <Box sx={{ flex: 1, height: 100, overflowY: "auto", px: "16px", py: "14px", display: "flex", flexDirection: "column", gap: "10px", bgcolor: tokens.offWhite }}>
          {error && (
            <Typography sx={{ fontFamily: tokens.fontBody, fontSize: "0.8rem", color: tokens.red, px: "4px" }}>{error}</Typography>
          )}
          {NameCard}
          {TravelersCard}
          {RegionCard}
          {DatesCard}
        </Box>

        {/* Footer */}
        <Box sx={{ px: "16px", py: "14px", paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)", display: "flex", gap: "8px", borderTop: `1px solid ${tokens.border}` }}>
          {isEdit && onDelete && <Button variant="danger" onClick={onDelete} sx={{ mr: "auto" }}>Delete</Button>}
          <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>Cancel</Button>
          <Button onClick={handleSave} sx={{ flex: 2 }}>Save Trip</Button>
        </Box>
      </Dialog>

      <RegionPickerScreen
        open={regionPickerOpen}
        value={region}
        onSelect={(r) => { setRegion(r); setRegionPickerOpen(false); setActiveCard(null); }}
        onClose={() => { setRegionPickerOpen(false); setActiveCard(null); }}
      />
    </>
  );
}
