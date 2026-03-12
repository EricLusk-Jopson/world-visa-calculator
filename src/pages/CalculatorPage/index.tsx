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

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------

/** Minimum time the loading screen is visible, in ms. */
const MIN_LOAD_MS = 650;

/** Duration of the crossfade between loader and content, in ms. */
const FADE_MS = 300;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to   { opacity: 0; }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CalcView = "timeline" | "cards";

/**
 * loading  — loader visible, content not yet mounted
 * fading   — loader fading out, content fading in (both in DOM)
 * ready    — loader unmounted, content fully visible
 *
 * Derived — never stored in state — so no setState-in-effect cascade.
 *
 *   animationComplete=false, minTimeDone=false, hydrationDone=false → loading
 *   animationComplete=false, minTimeDone=true,  hydrationDone=true  → fading
 *   animationComplete=true                                          → ready
 */
type LoadPhase = "loading" | "fading" | "ready";

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

  // ── Load phase (derived) ─────────────────────────────────────────────────
  //
  // Three primitive booleans — each set by a single, non-cascading source:
  //   minTimeDone      ← setTimeout callback (external)
  //   hydrationDone    ← useUrlSync onHydrated callback (external)
  //   animationComplete ← onAnimationEnd DOM event (external)
  //
  // `phase` is computed from them inline; no syncing effect needed.

  const [minTimeDone, setMinTimeDone] = useState(false);
  const [hydrationDone, setHydrationDone] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const phase: LoadPhase = animationComplete
    ? "ready"
    : minTimeDone && hydrationDone
      ? "fading"
      : "loading";

  // Minimum display timer — driven by an external system (setTimeout), so
  // calling setState in its callback is the correct pattern.
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

      {/*
       * Content area — a relative container so the loading screen can sit
       * absolutely on top of the view during the crossfade.
       */}
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* ── App content ─────────────────────────────────────────────────
         * Mounted as soon as we enter "fading" so it's already rendering
         * while the loader is fading out above it.
         */}
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
        )}

        {/* ── Loading screen ───────────────────────────────────────────────
         * Sits above the content via z-index. When phase reaches "fading"
         * the fadeOut animation runs; onAnimationEnd flips animationComplete
         * which derives phase to "ready" and removes this from the DOM.
         */}
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
