import { useState, useEffect, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/ui/RegionSelector";
import { OngoingToggle } from "@/components/ui/OngoingToggle";
import {
  computeTravelerStatus,
  getStatusVariant,
  parseLocalDate,
} from "@/features/calculator/utils/timelineLayout";
import { ImpactPreview } from "@/components/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TripModalProps {
  open: boolean;
  /** "add" = creating a new trip; "edit" = modifying an existing one. */
  mode: "add" | "edit";
  travelers: Traveler[];
  /** Pre-selected traveler when opening an add/edit. */
  initialTravelerId: string;
  /** In edit mode, the trip being modified. */
  initialTrip?: Trip;
  onSave: (travelerId: string, trip: Trip) => void;
  /** Only provided in edit mode. */
  onDelete?: () => void;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Checks for date overlaps in the same region, excluding the edited trip. */
function hasOverlap(
  trips: Trip[],
  entry: string,
  exit: string | null,
  region: VisaRegion,
  excludeId?: string,
): string | null {
  const nEntry = parseLocalDate(entry);
  const nExit = exit ? parseLocalDate(exit) : new Date("2099-01-01");

  for (const t of trips) {
    if (t.id === excludeId) continue;
    if (t.region !== region) continue;

    const tEntry = parseLocalDate(t.entryDate);
    const tExit = t.exitDate
      ? parseLocalDate(t.exitDate)
      : new Date("2099-01-01");

    if (nEntry <= tExit && nExit >= tEntry) {
      return `Overlaps with "${t.destination || t.entryDate}".`;
    }
  }
  return null;
}

// ─── Form field ───────────────────────────────────────────────────────────────

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
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
        mb: "5px",
      }}
    >
      {children}
    </Typography>
  );
}

const INPUT_SX = {
  "& .MuiOutlinedInput-root": {
    fontFamily: tokens.fontBody,
    fontSize: "0.85rem",
    bgcolor: tokens.mist,
    borderRadius: "10px",
    "& fieldset": { borderColor: tokens.border, borderWidth: 1.5 },
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
  "& input[type='date']::-webkit-calendar-picker-indicator": {
    filter: "opacity(0.4)",
  },
};

const INPUT_ERROR_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.redBg,
    "& fieldset": { borderColor: tokens.red, borderWidth: 1.5 },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function TripModal({
  open,
  mode,
  travelers,
  initialTravelerId,
  initialTrip,
  onSave,
  onDelete,
  onClose,
}: TripModalProps) {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [travelerId, setTravelerId] = useState(initialTravelerId);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);

  // Seed from initialTrip when opening in edit mode
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTravelerId(initialTravelerId);
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
  }, [open, mode, initialTrip, initialTravelerId]);

  // ── Impact preview ──────────────────────────────────────────────────────────
  const impactStatus = useMemo(() => {
    if (!entryDate || region !== VisaRegion.Schengen) return null;

    const traveler = travelers.find((t) => t.id === travelerId);
    if (!traveler) return null;

    // Build a temporary traveler with the preview trip substituted in
    const tempTrips = traveler.trips
      .filter((t) => t.id !== initialTrip?.id)
      .concat([
        {
          id: "__preview__",
          entryDate,
          exitDate: ongoing ? undefined : exitDate || undefined,
          region: VisaRegion.Schengen,
          destination,
        },
      ]);

    const tempTraveler = { ...traveler, trips: tempTrips };
    const refDate =
      !ongoing && exitDate ? parseLocalDate(exitDate) : new Date();

    return computeTravelerStatus(tempTraveler, refDate);
  }, [
    travelerId,
    travelers,
    entryDate,
    exitDate,
    ongoing,
    region,
    destination,
    initialTrip,
  ]);

  const impactVariant = impactStatus
    ? getStatusVariant(impactStatus.daysRemaining)
    : ("neutral" as const);

  // ── Validation & submit ─────────────────────────────────────────────────────
  function handleSave() {
    if (!entryDate) {
      setError("Please enter an entry date.");
      return;
    }
    if (!ongoing && exitDate && exitDate < entryDate) {
      setError("Exit date must be after entry date.");
      return;
    }

    const traveler = travelers.find((t) => t.id === travelerId);
    if (!traveler) return;

    const resolvedExit = ongoing ? undefined : exitDate || undefined;
    const overlapMsg = hasOverlap(
      traveler.trips,
      entryDate,
      resolvedExit ?? null,
      region,
      initialTrip?.id,
    );
    if (overlapMsg) {
      setError(overlapMsg);
      return;
    }

    const trip: Trip = {
      id: initialTrip?.id ?? crypto.randomUUID(),
      entryDate,
      exitDate: resolvedExit,
      region,
      destination: destination.trim() || undefined,
    };

    onSave(travelerId, trip);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (
      e.key === "Enter" &&
      !(e.target as HTMLElement).tagName.match(/SELECT/i)
    ) {
      handleSave();
    }
    if (e.key === "Escape") onClose();
  }

  const isEdit = mode === "edit";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: 420,
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
          {isEdit ? "Edit trip" : "Add a trip"}
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
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s",
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
        onKeyDown={handleKeyDown}
      >
        {/* Traveler selector */}
        <Box>
          <FormLabel>Traveler</FormLabel>
          <Select
            value={travelerId}
            onChange={(e) => {
              setTravelerId(e.target.value);
              setError(null);
            }}
            fullWidth
            size="small"
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.85rem",
              bgcolor: tokens.mist,
              borderRadius: "10px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: tokens.border,
                borderWidth: 1.5,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: tokens.navy,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: tokens.navy,
                borderWidth: 1.5,
              },
              "& .MuiSelect-select": { py: "9px", px: "11px" },
            }}
          >
            {travelers.map((t) => (
              <MenuItem
                key={t.id}
                value={t.id}
                sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem" }}
              >
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Destination */}
        <Box>
          <FormLabel>Destination</FormLabel>
          <TextField
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Paris & Barcelona"
            fullWidth
            autoFocus={!isEdit}
            inputProps={{ maxLength: 60 }}
            sx={INPUT_SX}
          />
        </Box>

        {/* Dates */}
        <Box>
          <FormLabel>Dates</FormLabel>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              mb: "6px",
            }}
          >
            <TextField
              type="date"
              value={entryDate}
              onChange={(e) => {
                setEntryDate(e.target.value);
                setExitDate(""); // reset exit when entry changes
                setError(null);
              }}
              inputProps={{ placeholder: "Entry" }}
              sx={error && !entryDate ? INPUT_ERROR_SX : INPUT_SX}
            />
            <TextField
              type="date"
              value={exitDate}
              onChange={(e) => {
                setExitDate(e.target.value);
                setError(null);
              }}
              disabled={ongoing || !entryDate}
              inputProps={{ min: entryDate || undefined }}
              sx={{
                ...(ongoing || !entryDate ? { opacity: 0.5 } : {}),
                ...INPUT_SX,
              }}
            />
          </Box>
          <OngoingToggle
            checked={ongoing}
            onChange={(v) => {
              setOngoing(v);
              if (v) setExitDate("");
              setError(null);
            }}
          />
        </Box>

        {/* Region */}
        <Box>
          <FormLabel>Region</FormLabel>
          <RegionSelector
            value={region}
            onChange={(r) => {
              setRegion(r);
              setError(null);
            }}
          />
        </Box>

        {/* Impact preview — only shown for Schengen trips with an entry date */}
        {region === VisaRegion.Schengen && entryDate && impactStatus && (
          <ImpactPreview
            daysRemaining={impactStatus.daysRemaining}
            daysUsed={impactStatus.daysUsed}
            variant={impactVariant}
          />
        )}

        {/* Validation error */}
        {error && (
          <ValidationMessage variant="error">{error}</ValidationMessage>
        )}
      </Box>

      {/* Divider */}
      <Box sx={{ height: 1, bgcolor: tokens.border }} />

      {/* Footer */}
      <Box sx={{ px: "20px", py: "16px", display: "flex", gap: "7px" }}>
        {isEdit && onDelete && (
          <Button variant="danger" onClick={onDelete} sx={{ mr: "auto" }}>
            Delete
          </Button>
        )}
        <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} sx={{ flex: 2 }}>
          Save Trip
        </Button>
      </Box>
    </Dialog>
  );
}
