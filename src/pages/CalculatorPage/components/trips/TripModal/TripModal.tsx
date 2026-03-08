import { useState, useEffect, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, formatISO } from "date-fns";

import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/ui/RegionSelector";
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
  /** Pre-selected traveler when opening the modal. */
  initialTravelerId: string;
  /** In edit mode, the trip being modified. */
  initialTrip?: Trip;
  /**
   * In add mode, travelerIds will contain every traveler the trip should be
   * written to (the same trip data, independent objects per traveler).
   * In edit mode, travelerIds is always a single-element array.
   */
  onSave: (travelerIds: string[], trip: Trip) => void;
  /** Only provided in edit mode. */
  onDelete?: () => void;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns an overlap error string if the proposed [entry, exit] window
 * conflicts with any existing trip in the same region, ignoring excludeId.
 *
 * Same-day adjacency (a trip ending on the same date another begins) is
 * explicitly permitted — only strict interior overlaps are flagged.
 */
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

    // Strict inequality on both boundaries: same-day exit/entry is valid travel.
    if (nEntry < tExit && nExit > tEntry) {
      return `Overlaps with "${t.destination || t.entryDate}".`;
    }
  }
  return null;
}

/** Add n days to a YYYY-MM-DD string and return YYYY-MM-DD. */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

/** Format a YYYY-MM-DD string for display (e.g. "14 Jun 2025"). */
function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

// ─── Form label ───────────────────────────────────────────────────────────────

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

// ─── Shared input sx ─────────────────────────────────────────────────────────

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
} as const;

const INPUT_ERROR_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.redBg,
    "& fieldset": { borderColor: tokens.red, borderWidth: 1.5 },
  },
} as const;

const SELECT_BASE_SX = {
  fontFamily: tokens.fontBody,
  fontSize: "0.85rem",
  bgcolor: tokens.mist,
  borderRadius: "10px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.border,
    borderWidth: 1.5,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.navy },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: tokens.navy,
    borderWidth: 1.5,
  },
  "& .MuiSelect-select": { py: "9px", px: "11px" },
} as const;

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

  /**
   * In add mode this is a multi-select — the user can write the same trip to
   * several travelers at once.  In edit mode the selector is locked to the
   * single traveler who owns the trip.
   */
  const [travelerIds, setTravelerIds] = useState<string[]>([initialTravelerId]);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);

  // Seed from props whenever the dialog opens.
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTravelerIds([initialTravelerId]);
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

  // ── Entry constraint hint ───────────────────────────────────────────────────
  //
  // Shown after a valid entry date is supplied but before an exit date is chosen.
  // Answers: "How many days do I have available, and what is the latest I can stay?"
  //
  // Implementation note: this derives the ceiling from computeTravelerStatus at
  // the entry date, which gives a *conservative* estimate — the true maximum may
  // be longer because old trips roll out of the 180-day window during the stay.
  // TODO: replace with computeExitConstraint (proper iterative ceiling) once its
  // signature is available from features/calculator/utils/schengen.ts.
  const entryConstraint = useMemo(() => {
    if (!entryDate || region !== VisaRegion.Schengen) return null;
    // Once exit is known the full ImpactPreview takes over; hide the hint.
    if (exitDate || ongoing) return null;

    // Compute across all selected travelers, surface the most constrained result.
    let minDays = Infinity;

    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

      const tripsWithoutCurrent = traveler.trips.filter(
        (t) => t.id !== initialTrip?.id,
      );
      const tempTraveler = { ...traveler, trips: tripsWithoutCurrent };
      const status = computeTravelerStatus(
        tempTraveler,
        parseLocalDate(entryDate),
      );

      if (status.daysRemaining < minDays) {
        minDays = status.daysRemaining;
      }
    }

    if (!isFinite(minDays) || minDays <= 0) return null;

    return {
      daysAvailable: minDays,
      // Latest exit = entry + (days available - 1) because entry day counts.
      latestExit: addDays(entryDate, minDays - 1),
    };
  }, [
    entryDate,
    exitDate,
    ongoing,
    region,
    travelerIds,
    travelers,
    initialTrip,
  ]);

  // ── Impact preview (exit date known) ────────────────────────────────────────
  const impactStatus = useMemo(() => {
    if (!entryDate || region !== VisaRegion.Schengen) return null;

    // Show against the most constrained selected traveler.
    let worst: ReturnType<typeof computeTravelerStatus> | null = null;

    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

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
      const status = computeTravelerStatus(tempTraveler, refDate);

      if (!worst || status.daysRemaining < worst.daysRemaining) {
        worst = status;
      }
    }

    return worst;
  }, [
    travelerIds,
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
    if (travelerIds.length === 0) {
      setError("Please select at least one traveler.");
      return;
    }
    if (!entryDate) {
      setError("Please enter an entry date.");
      return;
    }
    if (!ongoing && exitDate && exitDate < entryDate) {
      setError("Exit date must be after entry date.");
      return;
    }

    const resolvedExit = ongoing ? undefined : exitDate || undefined;

    // Run overlap validation independently for each selected traveler.
    const conflicts: string[] = [];
    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;
      const msg = hasOverlap(
        traveler.trips,
        entryDate,
        resolvedExit ?? null,
        region,
        initialTrip?.id,
      );
      if (msg) {
        const name = traveler.name;
        conflicts.push(`${name}: ${msg}`);
      }
    }

    if (conflicts.length > 0) {
      setError(conflicts.join("\n"));
      return;
    }

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

  // ── Render ───────────────────────────────────────────────────────────────────

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
      {/* ── Header ── */}
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

      {/* ── Body ── */}
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
        {/* 1 · Traveler selector
              Add mode: multi-select with checkboxes.
              Edit mode: locked to the owning traveler (single, disabled). */}
        <Box>
          <FormLabel>{isEdit ? "Traveler" : "Traveler(s)"}</FormLabel>
          {isEdit ? (
            <Select
              value={travelerIds[0] ?? ""}
              disabled
              fullWidth
              size="small"
              sx={SELECT_BASE_SX}
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
          ) : (
            <Select
              multiple
              value={travelerIds}
              onChange={(e) => {
                const val = e.target.value;
                setTravelerIds(typeof val === "string" ? val.split(",") : val);
                setError(null);
              }}
              fullWidth
              size="small"
              displayEmpty
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return (
                    <Typography
                      sx={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.85rem",
                        color: tokens.textGhost,
                      }}
                    >
                      Select travelers…
                    </Typography>
                  );
                }
                return (selected as string[])
                  .map((id) => travelers.find((t) => t.id === id)?.name ?? id)
                  .join(", ");
              }}
              sx={SELECT_BASE_SX}
            >
              {travelers.map((t) => (
                <MenuItem
                  key={t.id}
                  value={t.id}
                  sx={{ fontFamily: tokens.fontBody, fontSize: "0.85rem" }}
                >
                  <Checkbox
                    checked={travelerIds.includes(t.id)}
                    size="small"
                    sx={{ p: "2px", mr: "6px", color: tokens.border }}
                  />
                  <ListItemText
                    primary={t.name}
                    primaryTypographyProps={{
                      fontFamily: tokens.fontBody,
                      fontSize: "0.85rem",
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          )}
        </Box>

        {/* 2 · Region — declared before dates so validation context is clear */}
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

        {/* 3 · Trip name (formerly "Destination") */}
        <Box>
          <FormLabel>Trip name</FormLabel>
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

        {/* 4 · Dates */}
        <Box>
          <FormLabel>Dates</FormLabel>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                mb: "6px",
              }}
            >
              <DatePicker
                label={null}
                value={entryDate ? parseISO(entryDate) : null}
                onChange={(date) => {
                  if (!date) return;
                  const iso = formatISO(date, { representation: "date" });
                  setEntryDate(iso);
                  if (!exitDate && !ongoing) setExitDate(addDays(iso, 1));
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Entry",
                    sx: error && !entryDate ? INPUT_ERROR_SX : INPUT_SX,
                  },
                }}
              />
              <DatePicker
                label={null}
                value={exitDate ? parseISO(exitDate) : null}
                disabled={ongoing || !entryDate}
                minDate={entryDate ? parseISO(entryDate) : undefined}
                onChange={(date) => {
                  if (!date) return;
                  setExitDate(formatISO(date, { representation: "date" }));
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Exit",
                    sx: {
                      ...(ongoing || !entryDate ? { opacity: 0.5 } : {}),
                      ...INPUT_SX,
                    },
                  },
                }}
              />
            </Box>
          </LocalizationProvider>
        </Box>

        {/* Entry constraint hint — visible once entry date is known, exit not yet set.
            Tells the user how many days are available and the ceiling date,
            so they can choose a compliant exit date before touching the picker. */}
        {entryConstraint && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: "12px",
              py: "9px",
              bgcolor: tokens.mist,
              border: `1px solid ${tokens.border}`,
              borderRadius: "10px",
            }}
          >
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                color: tokens.textSoft,
                fontWeight: 500,
              }}
            >
              {entryConstraint.daysAvailable === 1
                ? "1 day available"
                : `${entryConstraint.daysAvailable} days available`}
              {travelerIds.length > 1 && " (most constrained traveler)"}
            </Typography>
            <Typography
              sx={{
                fontFamily: tokens.fontBody,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: tokens.navy,
                ml: "8px",
                whiteSpace: "nowrap",
              }}
            >
              Latest exit: {fmtDate(entryConstraint.latestExit)}
            </Typography>
          </Box>
        )}

        {/* Impact preview — shown for Schengen trips once exit date (or ongoing) is set */}
        {region === VisaRegion.Schengen &&
          entryDate &&
          (exitDate || ongoing) &&
          impactStatus && (
            <ImpactPreview
              daysRemaining={impactStatus.daysRemaining}
              daysUsed={impactStatus.daysUsed}
              variant={impactVariant}
            />
          )}

        {/* Validation error — supports newline-delimited multi-traveler conflicts */}
        {error && (
          <ValidationMessage variant="error" sx={{ whiteSpace: "pre-line" }}>
            {error}
          </ValidationMessage>
        )}
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ height: 1, bgcolor: tokens.border }} />

      {/* ── Footer ── */}
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
