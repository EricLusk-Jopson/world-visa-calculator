import { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip } from "@/types";
import type { ShareableState } from "@/types";
import { tokens } from "@/styles/theme";
import { useUrlSync } from "@/features/sharing";
import {
  CalculatorNav,
  CardsView,
  TimelineView,
  TravelerModal,
  TripModal,
} from "./components";
import { ShareModal } from "./components/ShareModal";
import { LoadingScreen } from "./components/LoadingScreen";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalcView = "timeline" | "cards";

interface ModalState {
  open: boolean;
  kind: "none" | "traveler" | "trip";
  /** Only set when kind === "trip" */
  mode: "add" | "edit";
  /** Pre-selected traveler id when opening Add Trip from a specific column */
  travelerId: string | null;
  /** The trip being edited; null when adding */
  trip: Trip | null;
}

const CLOSED_MODAL: ModalState = {
  open: false,
  kind: "none",
  mode: "add",
  travelerId: null,
  trip: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTraveler(name: string): Traveler {
  return { id: crypto.randomUUID(), name, trips: [] };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CalculatorPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [view, setView] = useState<CalcView>("timeline");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // True until useUrlSync has finished its one-time hydration attempt.
  // Prevents the AddTravelerGhost from flashing before saved data loads.
  const [isHydrating, setIsHydrating] = useState(true);

  // ── URL / localStorage sync ───────────────────────────────────────────────
  const shareableState = useMemo<ShareableState>(
    () => ({ travelers }),
    [travelers],
  );

  const { shareableUrl, copyShareableUrl } = useUrlSync({
    state: shareableState,
    onHydrate: (s) => setTravelers(s.travelers),
    onHydrated: () => setIsHydrating(false),
  });

  // ── Traveler actions ─────────────────────────────────────────────────────

  const handleAddTraveler = useCallback(() => {
    setModal({ ...CLOSED_MODAL, open: true, kind: "traveler" });
  }, []);

  const handleTravelerSave = useCallback((name: string) => {
    setTravelers((prev) => [...prev, makeTraveler(name)]);
    setModal(CLOSED_MODAL);
  }, []);

  const handleDeleteTraveler = useCallback((travelerId: string) => {
    setTravelers((prev) => prev.filter((t) => t.id !== travelerId));
  }, []);

  // ── Trip actions ─────────────────────────────────────────────────────────

  const handleOpenAddTrip = useCallback((travelerId: string) => {
    setModal({ open: true, kind: "trip", mode: "add", travelerId, trip: null });
  }, []);

  const handleOpenEditTrip = useCallback((travelerId: string, trip: Trip) => {
    setModal({ open: true, kind: "trip", mode: "edit", travelerId, trip });
  }, []);

  const handleTripSave = useCallback((travelerIds: string[], trip: Trip) => {
    setTravelers((prev) =>
      prev.map((t) => {
        if (!travelerIds.includes(t.id)) return t;

        const exists = t.trips.some((x) => x.id === trip.id);

        if (exists) {
          return {
            ...t,
            trips: t.trips.map((x) => (x.id === trip.id ? trip : x)),
          };
        } else {
          return {
            ...t,
            trips: [...t.trips, { ...trip, id: crypto.randomUUID() }],
          };
        }
      }),
    );
    setModal(CLOSED_MODAL);
  }, []);

  const handleTripDelete = useCallback(() => {
    if (!modal.travelerId || !modal.trip) return;
    const { travelerId, trip } = modal;
    setTravelers((prev) =>
      prev.map((t) =>
        t.id !== travelerId
          ? t
          : { ...t, trips: t.trips.filter((x) => x.id !== trip.id) },
      ),
    );
    setModal(CLOSED_MODAL);
  }, [modal]);

  // ── Clear all trips ───────────────────────────────────────────────────────

  const handleClearAllTrips = useCallback(() => {
    setTravelers((prev) => prev.map((t) => ({ ...t, trips: [] })));
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
        bgcolor: tokens.offWhite,
        overflow: "hidden",
      }}
    >
      {/* Nav renders immediately — it has no dependency on traveler data */}
      <CalculatorNav
        view={view}
        onViewChange={setView}
        onAddTraveler={handleAddTraveler}
        onAddTrip={() => handleOpenAddTrip(travelers[0]?.id ?? "")}
        travelerCount={travelers.length}
        onShare={() => setShareModalOpen(true)}
        onClearAll={handleClearAllTrips}
      />

      {/* Content area: hold on LoadingScreen until hydration settles */}
      {isHydrating ? (
        <LoadingScreen />
      ) : view === "timeline" ? (
        <TimelineView
          travelers={travelers}
          onAddTrip={handleOpenAddTrip}
          onEditTrip={handleOpenEditTrip}
          onDeleteTraveler={handleDeleteTraveler}
          onAddTraveler={handleAddTraveler}
        />
      ) : (
        <CardsView
          travelers={travelers}
          onAddTrip={handleOpenAddTrip}
          onEditTrip={handleOpenEditTrip}
          onDeleteTraveler={handleDeleteTraveler}
        />
      )}

      {/* Traveler modal */}
      <TravelerModal
        open={modal.open && modal.kind === "traveler"}
        onAdd={handleTravelerSave}
        onClose={() => setModal(CLOSED_MODAL)}
      />

      {/* Trip modal */}
      <TripModal
        open={modal.open && modal.kind === "trip"}
        mode={modal.mode}
        travelers={travelers}
        initialTravelerId={modal.travelerId ?? ""}
        initialTrip={modal.trip ?? undefined}
        onSave={handleTripSave}
        onDelete={modal.mode === "edit" ? handleTripDelete : undefined}
        onClose={() => setModal(CLOSED_MODAL)}
      />

      {/* Share modal */}
      <ShareModal
        open={shareModalOpen}
        shareableUrl={shareableUrl}
        onCopy={copyShareableUrl}
        onClose={() => setShareModalOpen(false)}
        travelerCount={travelers.length}
      />
    </Box>
  );
}
