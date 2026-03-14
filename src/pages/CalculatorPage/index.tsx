import { useState, useCallback, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
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
import { MobileTripsView } from "./components/mobile/MobileTripView/MobileTripView";
import { TravelerFilterBar } from "./components/mobile/TravelerFilterBar";

// ─── Animation constants ──────────────────────────────────────────────────────

const MIN_LOAD_MS = 650;
const FADE_MS = 300;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type CalcView = "timeline" | "cards";
type LoadPhase = "loading" | "fading" | "ready";

interface ModalState {
  open: boolean;
  kind: "none" | "traveler" | "trip";
  mode: "add" | "edit";
  travelerId: string | null;
  trip: Trip | null;
}

const CLOSED_MODAL: ModalState = {
  open: false,
  kind: "none",
  mode: "add",
  travelerId: null,
  trip: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTraveler(name: string): Traveler {
  return { id: crypto.randomUUID(), name, trips: [] };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalculatorPage() {
  // ── Core state ───────────────────────────────────────────────────────────
  const [view, setView] = useState<CalcView>("timeline");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // ── Traveler visibility filter (mobile only) ──────────────────────────────
  const [hiddenTravelerIds, setHiddenTravelerIds] = useState<string[]>([]);

  const handleToggleTraveler = useCallback((id: string) => {
    setHiddenTravelerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  // Prune hidden IDs when a traveler is deleted
  useEffect(() => {
    const validIds = new Set(travelers.map((t) => t.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHiddenTravelerIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [travelers]);

  // ── Load phase ────────────────────────────────────────────────────────────
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [hydrationDone, setHydrationDone] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const phase: LoadPhase = animationComplete
    ? "ready"
    : minTimeDone && hydrationDone
      ? "fading"
      : "loading";

  useEffect(() => {
    const id = setTimeout(() => setMinTimeDone(true), MIN_LOAD_MS);
    return () => clearTimeout(id);
  }, []);

  // ── URL / localStorage sync ───────────────────────────────────────────────
  const shareableState = useMemo<ShareableState>(
    () => ({ travelers }),
    [travelers],
  );

  const { shareableUrl, copyShareableUrl } = useUrlSync({
    state: shareableState,
    onHydrate: (s) => setTravelers(s.travelers),
    onHydrated: () => setHydrationDone(true),
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
        }
        return {
          ...t,
          trips: [...t.trips, { ...trip, id: crypto.randomUUID() }],
        };
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

  const handleClearAllTrips = useCallback(() => {
    setTravelers((prev) => prev.map((t) => ({ ...t, trips: [] })));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
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
      <CalculatorNav
        view={view}
        onViewChange={setView}
        onAddTraveler={handleAddTraveler}
        onAddTrip={() => handleOpenAddTrip(travelers[0]?.id ?? "")}
        travelerCount={travelers.length}
        onShare={() => setShareModalOpen(true)}
        onClearAll={handleClearAllTrips}
      />

      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {phase !== "loading" && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              animation: `${fadeIn} ${FADE_MS}ms ease-out both`,
            }}
          >
            {/*
             * ── Mobile layout (xs only) ────────────────────────────────────
             * TravelerFilterBar collapses per-traveler status into a single
             * panel with visibility toggles. MobileTripsView merges all
             * visible trips into a single chronological column.
             */}
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <TravelerFilterBar
                travelers={travelers}
                hiddenTravelerIds={hiddenTravelerIds}
                onToggleTraveler={handleToggleTraveler}
                onDeleteTraveler={handleDeleteTraveler}
              />
              <MobileTripsView
                travelers={travelers}
                hiddenTravelerIds={hiddenTravelerIds}
                onEditTrip={handleOpenEditTrip}
                onAddTraveler={handleAddTraveler}
              />
            </Box>

            {/*
             * ── Desktop layout (sm+) ───────────────────────────────────────
             * Original multi-column views, completely unchanged.
             */}
            <Box
              sx={{
                display: { xs: "none", sm: "flex" },
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
              }}
            >
              {view === "timeline" ? (
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
            </Box>
          </Box>
        )}

        {phase !== "ready" && (
          <Box
            onAnimationEnd={
              phase === "fading" ? () => setAnimationComplete(true) : undefined
            }
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              display: "flex",
              flexDirection: "column",
              animation:
                phase === "fading"
                  ? `${fadeOut} ${FADE_MS}ms ease-out forwards`
                  : "none",
            }}
          >
            <LoadingScreen />
          </Box>
        )}
      </Box>

      <TravelerModal
        open={modal.open && modal.kind === "traveler"}
        onAdd={handleTravelerSave}
        onClose={() => setModal(CLOSED_MODAL)}
      />

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
