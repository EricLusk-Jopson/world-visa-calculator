import { useState, useEffect, forwardRef } from "react";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import useMediaQuery from "@mui/material/useMediaQuery";
import type { TransitionProps } from "@mui/material/transitions";
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
import { parseISO } from "date-fns";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { getPassportRule } from "@/data/regions";
import { ValidationMessage } from "@/components/ui/ValidationMessage";
import { Button } from "@/components/ui/Button";
import { RegionSelector } from "@/components/ui/RegionSelector";
import {
  parseDate,
  formatDate,
  addDays,
  differenceInCalendarDays,
  countTripDays,
} from "@/features/calculator/utils/dates";
import { blockedTripRanges, isDateBlocked } from "@/features/calculator/utils/tripOverlap";
import { calculateMaxStay } from "@/features/calculator/utils/schengen";
import { trackEvent } from "@/utils/analytics";
import {
  assessStay,
  detectReentryRisk,
  resolveStayLimits,
  perVisitApproxDays,
} from "@/features/calculator/utils/stayCalculator";
import type { StayAssessment, ReentryRisk } from "@/features/calculator/utils/stayCalculator";
import type { PerVisitLimit } from "@/types";
import { getRegionDefinition } from "@/data/regions";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { EntryConstraintHint } from "./DurationPanel";
import { computeTravelerDurations } from "../tripDuration";
import { computeTravelerEligibility } from "../tripEligibility";
import { TripSummaryRow } from "@/features/trips/components/TripSummaryRow";
import { TripDetailStack } from "@/features/trips/components/TripDetailStack";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripModalProps {
  open: boolean;
  mode: "add" | "edit";
  travelers: Traveler[];
  initialTravelerIds: string[];
  initialTrip?: Trip;
  onSave: (travelerIds: string[], trip: Trip) => void;
  onDelete?: () => void;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasOverlap(
  trips: Trip[],
  entry: string,
  exit: string | null,
  excludeId?: string,
  excludeTrip?: Pick<Trip, "entryDate" | "exitDate" | "region">,
): string | null {
  const nEntry = parseDate(entry);
  const nExit = exit ? parseDate(exit) : new Date("2099-01-01");

  for (const t of trips) {
    if (t.id === excludeId) continue;

    if (
      excludeTrip &&
      t.entryDate === excludeTrip.entryDate &&
      t.exitDate === excludeTrip.exitDate &&
      t.region === excludeTrip.region
    ) {
      continue;
    }

    const tEntry = parseDate(t.entryDate);
    const tExit = t.exitDate ? parseDate(t.exitDate) : new Date("2099-01-01");

    // Trips may touch on a single day (an overland crossing to another region);
    // an overlap of two or more days is a conflict, in any region.
    const overlapStart = nEntry > tEntry ? nEntry : tEntry;
    const overlapEnd = nExit < tExit ? nExit : tExit;
    const overlapDays = differenceInCalendarDays(overlapEnd, overlapStart) + 1;
    if (overlapDays >= 2) {
      return `Overlaps with "${t.destination || t.entryDate}".`;
    }
  }
  return null;
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

// ─── Shared input sx ──────────────────────────────────────────────────────────

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
} as const;

const INPUT_ERROR_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.redBg,
    "& fieldset": { borderColor: tokens.red, borderWidth: 1.5 },
  },
} as const;

// Amber-highlighted field — used to flag a caution-level overstay / re-entry risk.
const INPUT_CAUTION_SX = {
  "& .MuiOutlinedInput-root": {
    ...INPUT_SX["& .MuiOutlinedInput-root"],
    bgcolor: tokens.amberBg,
    "& fieldset": { borderColor: tokens.amber, borderWidth: 1.5 },
  },
} as const;

// Map a caution/danger variant to the matching field style (null = default).
function fieldSxForVariant(variant: "caution" | "danger" | null) {
  if (variant === "danger") return INPUT_ERROR_SX;
  if (variant === "caution") return INPUT_CAUTION_SX;
  return INPUT_SX;
}

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

// ─── Mobile slide transition ──────────────────────────────────────────────────

const MobileSlideTransition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide {...props} direction={props.in ? "left" : "right"} ref={ref} />;
});

// ─── Component ────────────────────────────────────────────────────────────────

export function TripModal({
  open,
  mode,
  travelers,
  initialTravelerIds,
  initialTrip,
  onSave,
  onDelete,
  onClose,
}: TripModalProps) {
  // ── Form state ──────────────────────────────────────────────────────────────

  const [travelerIds, setTravelerIds] = useState<string[]>(initialTravelerIds);
  const [destination, setDestination] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [error, setError] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(mode === "edit");
  const [detailOpen, setDetailOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width:599.95px)");

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsEdit(mode === "edit");
    setTravelerIds(initialTravelerIds);
    setError(null);
    setDetailOpen(false);
    if (mode === "edit" && initialTrip) {
      setDestination(initialTrip.destination ?? "");
      setEntryDate(initialTrip.entryDate);
      setExitDate(initialTrip.exitDate ?? "");
      setRegion(initialTrip.region);
    } else {
      setDestination("");
      setEntryDate("");
      setExitDate("");
      setRegion(VisaRegion.Schengen);
    }
  }, [open, mode, initialTrip, initialTravelerIds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time overlap check ─────────────────────────────────────────────────
  // Runs on every render so the Save button and inline message stay in sync
  // without waiting for the user to click Save.

  const resolvedExit = exitDate || undefined;

  const overlapError: string | null = (() => {
    if (!open) return null;
    if (!entryDate) return null;

    const conflicts: string[] = [];
    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;
      const msg = hasOverlap(
        traveler.trips,
        entryDate,
        resolvedExit ?? null,
        initialTrip?.id,
        initialTrip,
      );
      if (msg) conflicts.push(`${traveler.name}: ${msg}`);
    }

    return conflicts.length > 0 ? conflicts.join("\n") : null;
  })();

  // Interior days of the travelers' other trips — disabled in the date pickers.
  const blockedRanges = blockedTripRanges(travelers, travelerIds, initialTrip?.id, initialTrip);
  const isDayBlocked = (date: Date) => isDateBlocked(date, blockedRanges);

  // ── Entry constraint hint ───────────────────────────────────────────────────

  let entryConstraint: { daysAvailable: number; latestExit: string } | null =
    null;

  if (entryDate && region === VisaRegion.Schengen && !exitDate) {
    let minDays = Infinity;
    let latestExit = "";

    for (const tid of travelerIds) {
      const traveler = travelers.find((t) => t.id === tid);
      if (!traveler) continue;

      const historicalTrips = traveler.trips.filter(
        (t) => t.region === VisaRegion.Schengen && t.id !== initialTrip?.id,
      );

      const result = calculateMaxStay(entryDate, historicalTrips);

      if (!result.canEnter) {
        entryConstraint = { daysAvailable: 0, latestExit: entryDate };
        break;
      }

      if (result.maxDays < minDays) {
        minDays = result.maxDays;
        latestExit = result.maxExitDate!;
      }
    }

    if (entryConstraint === null && isFinite(minDays) && minDays > 0) {
      entryConstraint = { daysAvailable: minDays, latestExit };
    }
  }

  // ── Generic stay assessment (per_visit + rolling_window regions) ─────────────

  let stayAssessment: StayAssessment | null = null;
  let reentryRisk: ReentryRisk | null = null;

  if (
    region !== VisaRegion.Schengen &&
    region !== VisaRegion.Elsewhere &&
    entryDate
  ) {
    const regionRule = getRegionDefinition(region)?.rule ?? null;
    const checkDate = exitDate || undefined;

    let worstAssessment: StayAssessment | null = null;
    let worstRisk: ReentryRisk | null = null;

    for (const tid of travelerIds) {
      const t = travelers.find((x) => x.id === tid);
      if (!t) continue;

      // Limits come from the traveler's own passport entitlement (respecting
      // per-passport allowances and units), falling back to the region default
      // for travelers with no nationality set.
      const rule = getPassportRule(region, t.passportCode);
      const limits = resolveStayLimits(t.passportCode, rule, regionRule);
      if (!limits) continue;

      const tripHistory = t.trips.filter(
        (tr) => tr.region === region && tr.id !== initialTrip?.id,
      );
      const assessment = assessStay(limits, tripHistory, entryDate, checkDate);
      if (
        assessment &&
        (!worstAssessment || assessment.daysRemaining < worstAssessment.daysRemaining)
      ) {
        worstAssessment = assessment;
      }

      const perVisit = limits.find(
        (l): l is PerVisitLimit => l.type === "per_visit",
      );
      if (perVisit) {
        const completedTrips = t.trips.filter(
          (tr) => tr.region === region && tr.exitDate && tr.id !== initialTrip?.id,
        );
        const risk = detectReentryRisk(
          perVisitApproxDays(perVisit),
          completedTrips,
          entryDate,
        );
        if (risk && (!worstRisk || risk.variant === "danger")) worstRisk = risk;
      }
    }

    stayAssessment = worstAssessment;
    reentryRisk = worstRisk;
  }

  // ── Per-traveler duration data (all regions) ────────────────────────────────

  const durations = computeTravelerDurations({
    region,
    travelers,
    travelerIds,
    entryDate,
    exitDate,
    destination,
    excludeTripId: initialTrip?.id,
  });

  // ── Per-traveler eligibility + summary counts (for the detail overlay) ──────

  const eligibility =
    region !== VisaRegion.Elsewhere
      ? computeTravelerEligibility(region, travelers, travelerIds, entryDate || undefined)
      : [];
  // A temporary (date_range) entitlement currently in effect gets its own
  // amber bucket — technically "ok", but worth flagging as temporary rather
  // than folding into the plain green count.
  const eligOk = eligibility.filter((e) => e.ok && !e.temporalException?.active).length;
  const eligTemporary = eligibility.filter((e) => e.temporalException?.active).length;
  // No-passport travelers are "unknown" (grey), not a visa-required failure (red).
  const eligWarn = eligibility.filter((e) => !e.ok && e.access !== "unknown").length;
  const eligUnknown = eligibility.filter((e) => e.access === "unknown").length;

  const datesSet = !!entryDate && !!exitDate;
  const durOk = durations.filter((d) => d.tracked && d.severity === "safe").length;
  const durCaution = durations.filter((d) => d.tracked && d.severity === "caution").length;
  // "danger" splits into close-to-limit (red clock) and actual overstay (red warning).
  const durDanger = durations.filter((d) => d.tracked && d.severity === "danger" && !d.overstay).length;
  const durOverstay = durations.filter((d) => d.tracked && d.overstay).length;
  const durUnknown = durations.filter((d) => !d.tracked).length;

  // ── Date-field highlighting ─────────────────────────────────────────────────
  // Exit date mirrors the duration assessment (overstay); entry date mirrors
  // the re-entry risk. Both surface caution (amber) / danger (red) only.

  const worstTrackedVariant = durations
    .filter((d) => d.tracked)
    .reduce<"safe" | "caution" | "danger" | null>(
      (w, d) =>
        d.variant === "danger" || (d.variant === "caution" && w !== "danger")
          ? d.variant
          : w,
      null,
    );
  const exitVariant: "caution" | "danger" | null =
    worstTrackedVariant === "caution" || worstTrackedVariant === "danger"
      ? worstTrackedVariant
      : null;

  const entryVariant: "caution" | "danger" | null =
    reentryRisk &&
    (reentryRisk.variant === "caution" || reentryRisk.variant === "danger")
      ? reentryRisk.variant
      : null;

  const entryFieldSx = fieldSxForVariant(entryVariant);
  const exitFieldSx = fieldSxForVariant(exitVariant);

  // ── Validation & submit ─────────────────────────────────────────────────────

  function handleSave() {
    if (!destination.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (travelerIds.length === 0) {
      setError("Please select at least one traveler.");
      return;
    }
    if (!entryDate) {
      setError("Please enter an entry date.");
      return;
    }
    if (!exitDate) {
      setError("Please enter an exit date.");
      return;
    }
    if (exitDate < entryDate) {
      setError("Exit date must be after entry date.");
      return;
    }
    // overlapError is already shown inline — guard here as a safety net
    if (overlapError) return;

    const worstRemaining = durations
      .filter((d) => d.tracked)
      .reduce((min, d) => {
        const dr =
          d.rollingBreakdown?.daysRemaining ??
          d.rollingStatus?.daysRemaining ??
          d.assessment?.daysRemaining ??
          0;
        return Math.min(min, dr);
      }, Infinity);
    if (Number.isFinite(worstRemaining) && worstRemaining < 0) {
      trackEvent("overstay_warning_shown", {
        days_over: Math.abs(worstRemaining),
      });
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

  const isSaveDisabled = Boolean(overlapError);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen={isMobile}
        TransitionComponent={isMobile ? MobileSlideTransition : undefined}
        slotProps={{
          paper: {
            sx: isMobile
              ? {
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  bgcolor: tokens.offWhite,
                  overflow: "hidden",
                }
              : {
                  position: "relative",
                  borderRadius: "20px",
                  width: 420,
                  maxWidth: "calc(100vw - 32px)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  maxHeight: "85vh",
                  boxShadow: "0 12px 40px rgba(12,30,60,0.18)",
                },
          },
        }}
      >
        {/* ── Header ── */}
        {isMobile ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              pl: "4px",
              pr: "12px",
              py: "8px",
              bgcolor: tokens.navy,
              flexShrink: 0,
            }}
          >
            <Box
              component="button"
              onClick={onClose}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                border: "none",
                borderRadius: "8px",
                bgcolor: "transparent",
                color: tokens.white,
                cursor: "pointer",
                fontSize: "1rem",
                "&:active": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              ‹
            </Box>
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
              {isEdit ? "Edit trip" : "Add a trip"}
            </Typography>
          </Box>
        ) : (
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
        )}

        {/* ── Body ── */}
        <Box
          sx={{
            pl: "20px",
            pr: isMobile ? "20px" : "14px",
            mr: isMobile ? 0 : "6px",
            py: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflowY: "scroll",
            flex: isMobile ? 1 : undefined,
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              background: tokens.border,
              borderRadius: "4px",
              border: "1px solid transparent",
            },
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Validation error (non-overlap) */}
          {error && (
            <ValidationMessage variant="error" sx={{ whiteSpace: "pre-line" }}>
              {error}
            </ValidationMessage>
          )}

          {/* Real-time overlap error */}
          {overlapError && (
            <ValidationMessage variant="error" sx={{ whiteSpace: "pre-line" }}>
              {overlapError}
            </ValidationMessage>
          )}

          {/* 1 · Traveler selector — editable in both add and edit modes */}
          <Box>
            <FormLabel>Traveler(s)</FormLabel>
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
              {travelers.map((t) => {
                const alreadyOnTrip =
                  isEdit && initialTravelerIds.includes(t.id);
                return (
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
                      secondary={
                        alreadyOnTrip ? "Already on this trip" : undefined
                      }
                      primaryTypographyProps={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.85rem",
                      }}
                      secondaryTypographyProps={{
                        fontFamily: tokens.fontBody,
                        fontSize: "0.68rem",
                        color: tokens.textGhost,
                      }}
                    />
                  </MenuItem>
                );
              })}
            </Select>
          </Box>

          {/* 2 · Region */}
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

          {/* 3 · Trip name */}
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
            <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <FormLabel>Dates</FormLabel>
              {entryDate && exitDate && (
                <Typography
                  sx={{
                    fontFamily: tokens.fontBody,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: tokens.textSoft,
                    mb: "5px",
                  }}
                >
                  {(() => {
                    const days = countTripDays(parseDate(entryDate), parseDate(exitDate));
                    return `${days} day${days === 1 ? "" : "s"}`;
                  })()}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                mb: "6px",
              }}
            >
              <DatePicker
                value={entryDate ? parseISO(entryDate) : null}
                shouldDisableDate={isDayBlocked}
                onChange={(date) => {
                  if (!date) return;
                  const iso = formatDate(date);
                  setEntryDate(iso);
                  if (!exitDate || exitDate <= iso) {
                    setExitDate(formatDate(addDays(date, 1)));
                  }
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Entry",
                    sx:
                      error && !entryDate
                        ? INPUT_ERROR_SX
                        : entryFieldSx,
                  },
                }}
              />
              <DatePicker
                value={exitDate ? parseISO(exitDate) : null}
                disabled={!entryDate}
                minDate={entryDate ? parseISO(entryDate) : undefined}
                shouldDisableDate={isDayBlocked}
                onChange={(date) => {
                  if (!date) return;
                  setExitDate(formatDate(date));
                  setError(null);
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Exit",
                    sx: {
                      ...(!entryDate ? { opacity: 0.5 } : {}),
                      ...exitFieldSx,
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* 5 · Duration & overstay analysis */}
          {entryConstraint && (
            <EntryConstraintHint
              entryConstraint={entryConstraint}
              travelerCount={travelerIds.length}
            />
          )}

          {/* 6 · Eligibility & duration — open the per-traveler detail overlay */}
          {region !== VisaRegion.Elsewhere && (
            <Box
              sx={{
                border: `1px solid ${tokens.border}`,
                borderRadius: "10px",
                overflow: "hidden",
                "& > button:first-of-type": { borderTop: "none" },
              }}
            >
              <TripSummaryRow
                label="Entry Eligibility"
                okCount={eligOk}
                temporaryCount={eligTemporary}
                dangerCount={eligWarn}
                unknownCount={eligUnknown}
                placeholder="Select travelers"
                disabled={eligibility.length === 0}
                onClick={() => setDetailOpen(true)}
              />
              <TripSummaryRow
                label="Stay Duration"
                statusKind="duration"
                okCount={durOk}
                cautionCount={durCaution}
                dangerCount={durDanger}
                overstayCount={durOverstay}
                unknownCount={durUnknown}
                placeholder={!datesSet ? "Set dates" : ""}
                disabled={!datesSet}
                onClick={() => setDetailOpen(true)}
              />
            </Box>
          )}
        </Box>

        {/* ── Divider ── */}
        <Box sx={{ height: 1, bgcolor: tokens.border }} />

        {/* ── Footer ── */}
        <Box
          sx={{
            px: "20px",
            py: "16px",
            paddingBottom: isMobile
              ? "calc(env(safe-area-inset-bottom) + 16px)"
              : "16px",
            display: "flex",
            gap: "7px",
          }}
        >
          {isEdit && onDelete && (
            <Button variant="danger" onClick={onDelete} sx={{ mr: "auto" }}>
              Delete
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaveDisabled}
            sx={{ flex: 2 }}
          >
            {isSaveDisabled ? "Overlap detected" : "Save Trip"}
          </Button>
        </Box>

        {/* ── Eligibility & Duration detail overlay ── */}
        {/* Matches the modal's own chrome: same background, and the title sits
            in the same place as the modal header (title left, control right). */}
        {detailOpen && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              bgcolor: tokens.white,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header — mirrors the modal header layout */}
            <Box
              sx={{
                px: "20px",
                pt: "18px",
                pb: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
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
                Eligibility & Duration
              </Typography>
              <Box
                component="button"
                onClick={() => setDetailOpen(false)}
                aria-label="Back to trip form"
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
                  transition: "all 0.15s",
                  "&:hover": { bgcolor: tokens.border, color: tokens.navy },
                }}
              >
                <ArrowBackIosNewIcon sx={{ fontSize: "0.8rem" }} />
              </Box>
            </Box>

            {/* Scrollable per-traveler detail */}
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                pl: "20px",
                pr: "14px",
                py: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <TripDetailStack
                eligibility={eligibility}
                durations={durations}
                entryDate={entryDate}
                exitDate={exitDate}
                defaultOpen={false}
              />
            </Box>
          </Box>
        )}
      </Dialog>
    </LocalizationProvider>
  );
}
