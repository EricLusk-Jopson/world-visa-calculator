import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { Button } from "@/components/ui/Button";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
import { tokens } from "@/styles/theme";
import { TripFormCardName } from "./TripFormCardName";
import { TripFormCardTravelers } from "./TripFormCardTravelers";
import { TripFormCardDestination } from "./TripFormCardDestination";
import { TripFormCardDates } from "./TripFormCardDates";

export interface TripFormSliderProps {
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

export function TripFormSlider({
  open,
  mode,
  travelers,
  initialTravelerIds,
  initialTrip,
  onSave,
  onDelete,
  onClose,
  onAddNewTraveler,
}: TripFormSliderProps) {
  const [activeCard, setActiveCard] = useState<ActiveCard>(null);
  const [name, setName] = useState("");
  const [travelerIds, setTravelerIds] = useState<string[]>([]);
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [isPlanned, setIsPlanned] = useState(false);
  const [attempted, setAttempted] = useState(false);

  // Auto-select newly added traveler
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

  // Reset form when opening
  useEffect(() => {
    if (!open) return;
    setActiveCard(null);
    setAttempted(false);
    setIsPlanned(false);
    setTravelerIds(initialTravelerIds);
    if (mode === "edit" && initialTrip) {
      setName(initialTrip.destination ?? "");
      setEntryDate(initialTrip.entryDate);
      setExitDate(initialTrip.exitDate ?? "");
      setOngoing(!initialTrip.exitDate);
      setRegion(initialTrip.region);
    } else {
      setName("");
      setEntryDate("");
      setExitDate("");
      setOngoing(false);
      setRegion(VisaRegion.Schengen);
    }
  }, [open, mode, initialTrip, initialTravelerIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave =
    travelerIds.length > 0 &&
    !!entryDate &&
    (!exitDate || !ongoing && exitDate > entryDate || ongoing);

  const handleSave = useCallback(() => {
    setAttempted(true);
    if (!canSave) return;
    const resolvedExit = ongoing ? undefined : exitDate || undefined;
    onSave(travelerIds, {
      id: initialTrip?.id ?? crypto.randomUUID(),
      entryDate,
      exitDate: resolvedExit,
      region,
      destination: name.trim() || undefined,
    });
    onClose();
  }, [canSave, ongoing, exitDate, travelerIds, entryDate, region, name, initialTrip, onSave, onClose]);

  const openCard = useCallback((card: ActiveCard) => setActiveCard(card), []);
  const closeCard = useCallback(() => setActiveCard(null), []);

  const validationError = attempted && !canSave
    ? travelerIds.length === 0
      ? "Please select at least one traveler."
      : !entryDate
        ? "Please select an entry date."
        : "Exit date must be after entry date."
    : null;

  const footer = (
    <Box sx={{ display: "flex", gap: "8px" }}>
      {mode === "edit" && onDelete && (
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      )}
      <Button variant="ghost" onClick={onClose} sx={{ flex: 1 }}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={attempted && !canSave} sx={{ flex: 2 }}>
        Save Trip
      </Button>
    </Box>
  );

  return (
    <FullScreenSlider
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit trip" : "Add a trip"}
      footer={footer}
    >
      <Box
        sx={{
          px: "16px",
          py: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <TripFormCardName
          name={name}
          onChange={setName}
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
          expanded={activeCard === "travelers"}
          onExpand={() => openCard("travelers")}
        />

        <TripFormCardDestination
          region={region}
          onRegionChange={setRegion}
          expanded={activeCard === "destination"}
          onExpand={() => openCard("destination")}
          onCollapse={closeCard}
        />

        <TripFormCardDates
          entryDate={entryDate}
          exitDate={exitDate}
          ongoing={ongoing}
          isPlanned={isPlanned}
          onEntryChange={setEntryDate}
          onExitChange={setExitDate}
          onOngoingChange={setOngoing}
          onPlannedChange={setIsPlanned}
          expanded={activeCard === "dates"}
          onExpand={() => openCard("dates")}
        />

        {validationError && (
          <Typography
            sx={{
              fontFamily: tokens.fontBody,
              fontSize: "0.8rem",
              color: tokens.red,
              px: "4px",
            }}
          >
            {validationError}
          </Typography>
        )}
      </Box>
    </FullScreenSlider>
  );
}
