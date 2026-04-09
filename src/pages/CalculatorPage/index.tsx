import { useState, useCallback, useMemo, useEffect } from "react";
import { trackEvent } from "@/utils/analytics";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";
import type { Traveler, Trip, ShareableState } from "@/types";
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
import { MobileTimelineView } from "./components/mobile/MobileTimelineView/MobileTimelineView";
import { MobileTripsView } from "./components/mobile/MobileTripView/MobileTripView";
import { TravelerFilterBar } from "./components/mobile/TravelerFilterBar";

const MIN_LOAD_MS = 650;
const FADE_MS = 300;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const fadeOut = keyframes`from { opacity: 1; } to { opacity: 0; }`;

type CalcView = "timeline" | "cards";
type LoadPhase = "loading" | "fading" | "ready";

interface ModalState {
  open: boolean;
  kind: "none" | "traveler" | "trip";
  mode: "add" | "edit";
  /** All traveler IDs associated with this modal instance */
  travelerIds: string[];
  trip: Trip | null;
}

const CLOSED_MODAL: ModalState = {
  open: false,
  kind: "none",
  mode: "add",
  travelerIds: [],
  trip: null,
};

function makeTraveler(name: string, passportCode: string | null = null): Traveler {
  return { id: crypto.randomUUID(), name, passportCode, trips: [] };
}

export function CalculatorPage() {
  const [view, setView] = useState<CalcView>("timeline");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [hiddenTravelerIds, setHiddenTravelerIds] = useState<string[]>([]);

  const handleToggleTraveler = useCallback((id: string) => {
    setHiddenTravelerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  useEffect(() => {
    const validIds = new Set(travelers.map((t) => t.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHiddenTravelerIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [travelers]);

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

  const shareableState = useMemo<ShareableState>(
    () => ({ travelers }),
    [travelers],
  );

  const { shareableUrl, copyShareableUrl } = useUrlSync({
    state: shareableState,
    onHydrate: (s) => setTravelers(s.travelers),
    onHydrated: () => setHydrationDone(true),
  });

  // ── Traveler actions ────────────────────────────────────────────────────────

  const handleAddTraveler = useCallback(() => {
    setModal({ ...CLOSED_MODAL, open: true, kind: "traveler" });
  }, []);

  const handleTravelerSave = useCallback((name: string, passportCode: string | null) => {
    setTravelers((prev) => {
      trackEvent("traveler_added", { total_travelers: prev.length + 1 });
      return [...prev, makeTraveler(name, passportCode)];
    });
    setModal(CLOSED_MODAL);
  }, []);

  const handleTravelerEdit = useCallback(
    (travelerId: string, name: string, passportCode: string | null) => {
      setTravelers((prev) =>
        prev.map((t) => (t.id === travelerId ? { ...t, name, passportCode } : t)),
      );
    },
    [],
  );

  const handleDeleteTraveler = useCallback((travelerId: string) => {
    setTravelers((prev) => {
      const next = prev.filter((t) => t.id !== travelerId);
      trackEvent("traveler_removed", { remaining_travelers: next.length });
      return next;
    });
  }, []);

  // ── Trip actions ────────────────────────────────────────────────────────────

  const handleOpenAddTrip = useCallback((travelerId: string) => {
    setModal({
      open: true,
      kind: "trip",
      mode: "add",
      travelerIds: [travelerId],
      trip: null,
    });
  }, []);

  /** Desktop: single-traveler edit (one column = one person) */
  const handleOpenEditTrip = useCallback((travelerId: string, trip: Trip) => {
    setModal({
      open: true,
      kind: "trip",
      mode: "edit",
      travelerIds: [travelerId],
      trip,
    });
  }, []);

  /** Mobile: multi-traveler edit (merged card may represent several people) */
  const handleOpenEditTripForMany = useCallback(
    (travelerIds: string[], trip: Trip) => {
      setModal({
        open: true,
        kind: "trip",
        mode: "edit",
        travelerIds,
        trip,
      });
    },
    [],
  );

  const handleTripSave = useCallback(
    (travelerIds: string[], trip: Trip) => {
      if (modal.mode === "add") {
        trackEvent("trip_added", {
          traveler_count: travelers.length,
          is_ongoing: !trip.exitDate,
        });
      } else {
        trackEvent("trip_edited");
      }
      setTravelers((prev) =>
        prev.map((t) => {
          const wasOnTrip = modal.travelerIds.includes(t.id);
          const isOnTrip = travelerIds.includes(t.id);

          // Traveler was unchecked — remove this trip from their list.
          if (wasOnTrip && !isOnTrip && modal.trip) {
            return {
              ...t,
              trips: t.trips.filter(
                (x) =>
                  !(
                    x.entryDate === modal.trip!.entryDate &&
                    x.exitDate === modal.trip!.exitDate &&
                    x.region === modal.trip!.region
                  ),
              ),
            };
          }

          if (!isOnTrip) return t;

          // Match by ID first (single-traveler add/edit), then by coordinates
          // (multi-traveler edit where each copy has a different UUID).
          const existingIndex = t.trips.findIndex(
            (x) =>
              x.id === trip.id ||
              (x.entryDate === (modal.trip?.entryDate ?? "") &&
                x.exitDate === modal.trip?.exitDate &&
                x.region === (modal.trip?.region ?? trip.region)),
          );

          if (existingIndex !== -1) {
            const updated = [...t.trips];
            updated[existingIndex] = {
              ...trip,
              id: t.trips[existingIndex].id, // preserve each traveler's own ID
            };
            return { ...t, trips: updated };
          }

          // Traveler newly added to this trip.
          return {
            ...t,
            trips: [...t.trips, { ...trip, id: crypto.randomUUID() }],
          };
        }),
      );
      setModal(CLOSED_MODAL);
    },
    [modal.trip, modal.travelerIds, modal.mode, travelers.length],
  );

  /** Deletes the trip from every traveler in modal.travelerIds */
  const handleTripDelete = useCallback(() => {
    if (modal.travelerIds.length === 0 || !modal.trip) return;
    trackEvent("trip_deleted");
    const { travelerIds, trip } = modal;
    setTravelers((prev) =>
      prev.map((t) =>
        !travelerIds.includes(t.id)
          ? t
          : {
              ...t,
              trips: t.trips.filter(
                (x) =>
                  !(
                    x.entryDate === trip.entryDate &&
                    x.exitDate === trip.exitDate &&
                    x.region === trip.region
                  ),
              ),
            },
      ),
    );
    setModal(CLOSED_MODAL);
  }, [modal]);

  const handleClearAllTrips = useCallback(() => {
    setTravelers((prev) => prev.map((t) => ({ ...t, trips: [] })));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

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
            {/* ── Mobile layout (xs only) ────────────────────────────────── */}
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
                onEditTraveler={handleTravelerEdit}
                onAddTraveler={handleAddTraveler}
              />

              {view === "timeline" ? (
                <MobileTimelineView
                  travelers={travelers}
                  hiddenTravelerIds={hiddenTravelerIds}
                  onEditTrip={handleOpenEditTripForMany}
                  onAddTraveler={handleAddTraveler}
                  onAddTrip={() => handleOpenAddTrip(travelers[0]?.id ?? "")}
                />
              ) : (
                <MobileTripsView
                  travelers={travelers}
                  hiddenTravelerIds={hiddenTravelerIds}
                  onEditTrip={handleOpenEditTripForMany}
                  onAddTraveler={handleAddTraveler}
                  onAddTrip={() => handleOpenAddTrip(travelers[0]?.id ?? "")}
                />
              )}
            </Box>

            {/* ── Desktop layout (sm+) — unchanged ──────────────────────── */}
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
                  onEdit={handleTravelerEdit}
                />
              ) : (
                <CardsView
                  travelers={travelers}
                  onAddTrip={handleOpenAddTrip}
                  onEditTrip={handleOpenEditTrip}
                  onDeleteTraveler={handleDeleteTraveler}
                  onEdit={handleTravelerEdit}
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
        initialTravelerIds={modal.travelerIds}
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
