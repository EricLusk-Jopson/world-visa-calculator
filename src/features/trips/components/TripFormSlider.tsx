import { useState, useEffect, useRef, useCallback } from "react";
import Box from "@mui/material/Box";
import { FullScreenSlider } from "@/components/ui/FullScreenSlider";
import { Button } from "@/components/ui/Button";
import { VisaRegion } from "@/types";
import type { Trip, Traveler } from "@/types";
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

  // Reset form only when the slider transitions from closed → open.
  // Deliberately omit mode/initialTrip/initialTravelerIds from deps so that
  // mid-session changes (e.g. adding a traveler while the form is open) don't
  // clobber the user's current selections.
  useEffect(() => {
    if (!open) return;
    setActiveCard(null);
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
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const canSave =
    travelerIds.length > 0 &&
    !!entryDate &&
    (ongoing || (!!exitDate && exitDate > entryDate));

  const handleSave = useCallback(() => {
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
      <Button onClick={handleSave} disabled={!canSave} sx={{ flex: 2 }}>
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
        />

        <TripFormCardDates
          entryDate={entryDate}
          exitDate={exitDate}
          ongoing={ongoing}
          onEntryChange={setEntryDate}
          onExitChange={setExitDate}
          onOngoingChange={setOngoing}
          onReset={() => { setEntryDate(""); setExitDate(""); setOngoing(false); }}
          expanded={activeCard === "dates"}
          onExpand={() => openCard("dates")}
          onCollapse={closeCard}
        />
      </Box>
    </FullScreenSlider>
  );
}
