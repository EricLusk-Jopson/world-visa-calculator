import { useState, useEffect, useRef, useCallback } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tokens } from "@/styles/theme";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/utils/analytics";
import {
  blockedTripRanges,
  hasBlockingOverlap,
} from "@/features/calculator/utils/tripOverlap";
import { computeTravelerEligibility } from "../tripEligibility";
import { computeTravelerDurations } from "../tripDuration";
import {
  TripFormCardName,
  TripFormCardTravelers,
  TripFormCardDestination,
  TripFormCardDates,
  TripSummaryRow,
  EligibilityDetailList,
  DurationDetailList,
} from "@/features/trips/components";

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
  onAddNewTraveler: () => void;
}

type ActiveCard = "name" | "travelers" | "destination" | "dates" | null;

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
  onAddNewTraveler,
}: TripModalProps) {
  const isEdit = mode === "edit";

  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [name, setName] = useState("");
  const [travelerIds, setTravelerIds] = useState<string[]>([]);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [eligOpen, setEligOpen] = useState(false);
  const [durOpen, setDurOpen] = useState(false);

  // Auto-select a newly added traveler (added via the "+ Add new traveler" flow).
  const prevTravelerCountRef = useRef(travelers.length);
  useEffect(() => {
    if (!open) {
      prevTravelerCountRef.current = travelers.length;
      return;
    }
    if (travelers.length > prevTravelerCountRef.current) {
      const newTraveler = travelers[travelers.length - 1];
      setTravelerIds((prev) =>
        prev.includes(newTraveler.id) ? prev : [...prev, newTraveler.id],
      );
    }
    prevTravelerCountRef.current = travelers.length;
  }, [travelers, open]);

  // Reset only on closed → open, so mid-session changes (e.g. adding a traveler)
  // don't clobber the user's current selections.
  useEffect(() => {
    if (!open) return;
    setActiveCard(null);
    setEligOpen(false);
    setDurOpen(false);
    setTravelerIds(initialTravelerIds);
    if (isEdit && initialTrip) {
      setName(initialTrip.destination ?? "");
      setEntryDate(initialTrip.entryDate);
      setExitDate(initialTrip.exitDate ?? "");
      setRegion(initialTrip.region);
    } else {
      setName("");
      setEntryDate("");
      setExitDate("");
      setRegion(VisaRegion.Schengen);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const blockedRanges = blockedTripRanges(
    travelers,
    travelerIds,
    initialTrip?.id,
    initialTrip,
  );

  const canSave =
    name.trim().length > 0 &&
    travelerIds.length > 0 &&
    !!entryDate &&
    !!exitDate &&
    exitDate > entryDate &&
    !hasBlockingOverlap(
      travelers,
      travelerIds,
      entryDate,
      exitDate || undefined,
      initialTrip?.id,
      initialTrip,
    );

  // ── Entry eligibility + stay duration summaries ──
  const datesSet = !!entryDate && !!exitDate;

  const eligibility =
    region !== VisaRegion.Elsewhere
      ? computeTravelerEligibility(region, travelers, travelerIds)
      : [];
  const eligOk = eligibility.filter((e) => e.ok).length;
  const eligWarn = eligibility.filter((e) => !e.ok).length;

  const durations = datesSet
    ? computeTravelerDurations({
        region,
        travelers,
        travelerIds,
        entryDate,
        exitDate,
        destination: name,
        excludeTripId: initialTrip?.id,
      })
    : [];
  const durOk = durations.filter((d) => d.tracked && d.severity === "safe").length;
  const durCaution = durations.filter((d) => d.tracked && d.severity === "caution").length;
  // "danger" splits into close-to-limit (red clock) and actual overstay (red warning).
  const durDanger = durations.filter((d) => d.tracked && d.severity === "danger" && !d.overstay).length;
  const durOverstay = durations.filter((d) => d.tracked && d.overstay).length;
  const durUnknown = durations.filter((d) => !d.tracked).length;

  const handleSave = useCallback(() => {
    if (!canSave) return;

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

    onSave(travelerIds, {
      id: initialTrip?.id ?? crypto.randomUUID(),
      entryDate,
      exitDate: exitDate || undefined,
      region,
      destination: name.trim() || undefined,
    });
    onClose();
  }, [canSave, durations, exitDate, travelerIds, entryDate, region, name, initialTrip, onSave, onClose]);

  const openCard = useCallback((card: ActiveCard) => setActiveCard(card), []);
  const closeCard = useCallback(() => setActiveCard(null), []);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            width: 460,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "88vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            bgcolor: tokens.offWhite,
            boxShadow: "0 12px 40px rgba(12,30,60,0.18)",
          },
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          px: "20px",
          pt: "18px",
          pb: "12px",
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
          px: "16px",
          pb: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto",
          flex: 1,
          "&::-webkit-scrollbar": { width: "5px" },
          "&::-webkit-scrollbar-thumb": {
            background: tokens.border,
            borderRadius: "4px",
          },
        }}
      >
        <TripFormCardName
          name={name}
          onChange={setName}
          onReset={() => setName("")}
          expanded={activeCard === "name"}
          onExpand={() => openCard("name")}
          onCollapse={closeCard}
        />

        <TripFormCardTravelers
          travelers={travelers}
          travelerIds={travelerIds}
          onToggle={(id) =>
            setTravelerIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
            )
          }
          onAddNewTraveler={onAddNewTraveler}
          onReset={() => setTravelerIds([])}
          expanded={activeCard === "travelers"}
          onExpand={() => openCard("travelers")}
          onCollapse={closeCard}
        />

        <TripFormCardDestination
          region={region}
          onRegionChange={setRegion}
          onReset={() => setRegion(VisaRegion.Schengen)}
          expanded={activeCard === "destination"}
          onExpand={() => openCard("destination")}
          onCollapse={closeCard}
          footer={
            region !== VisaRegion.Elsewhere ? (
              <TripSummaryRow
                label="Entry Eligibility"
                okCount={eligOk}
                dangerCount={eligWarn}
                placeholder="Select travelers"
                disabled={eligibility.length === 0}
                onClick={() => setEligOpen((v) => !v)}
              />
            ) : undefined
          }
        />
        {eligOpen && region !== VisaRegion.Elsewhere && (
          <EligibilityDetailList eligibility={eligibility} />
        )}

        <TripFormCardDates
          entryDate={entryDate}
          exitDate={exitDate}
          onEntryChange={setEntryDate}
          onExitChange={setExitDate}
          blockedRanges={blockedRanges}
          onReset={() => {
            setEntryDate("");
            setExitDate("");
          }}
          expanded={activeCard === "dates"}
          onExpand={() => openCard("dates")}
          onCollapse={closeCard}
          footer={
            region !== VisaRegion.Elsewhere ? (
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
                onClick={() => setDurOpen((v) => !v)}
              />
            ) : undefined
          }
        />
        {durOpen && region !== VisaRegion.Elsewhere && (
          <DurationDetailList
            eligibility={eligibility}
            durations={durations}
            entryDate={entryDate}
            exitDate={exitDate}
          />
        )}
      </Box>

      {/* ── Divider ── */}
      <Box sx={{ height: 1, bgcolor: tokens.border, flexShrink: 0 }} />

      {/* ── Footer ── */}
      <Box
        sx={{
          px: "20px",
          py: "16px",
          display: "flex",
          gap: "7px",
          flexShrink: 0,
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
        <Button onClick={handleSave} disabled={!canSave} sx={{ flex: 2 }}>
          Save Trip
        </Button>
      </Box>
    </Dialog>
  );
}
