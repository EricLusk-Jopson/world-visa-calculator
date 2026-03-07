import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import { Traveler, Trip, VisaRegion } from "@/types";
import { tokens } from "@/styles/theme";
import {
  CalculatorNav,
  CardsView,
  TimelineView,
  TravelerModal,
  TripModal,
} from "./components";

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

function makeTrip(
  entryDate: string,
  exitDate: string | undefined,
  region: VisaRegion,
  destination?: string,
): Trip {
  return {
    id: crypto.randomUUID(),
    entryDate,
    exitDate,
    region,
    destination,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CalculatorPage
 *
 * Top-level page orchestrator. Owns:
 *  - travelers[] state (synced to URL + localStorage via useUrlSync)
 *  - view toggle (timeline | cards)
 *  - modal state machine (traveler modal, add-trip modal, edit-trip modal)
 *
 * Renders CalculatorNav + the active view + both modals.
 *
 * Note: wire `useUrlSync(travelers, setTravelers)` here once the hook is
 * available in the project.
 */
export function CalculatorPage() {
  // ── State ────────────────────────────────────────────────────────────────
  const [view, setView] = useState<CalcView>("timeline");
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [modal, setModal] = useState<ModalState>(CLOSED_MODAL);

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

  const handleTripSave = useCallback((travelerId: string, trip: Trip) => {
    setTravelers((prev) =>
      prev.map((t) => {
        if (t.id !== travelerId) return t;
        const exists = t.trips.some((x) => x.id === trip.id);
        return {
          ...t,
          trips: exists
            ? t.trips.map((x) => (x.id === trip.id ? trip : x))
            : [...t.trips, trip],
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

  // ── Copy link ─────────────────────────────────────────────────────────────

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {
      // Silently fail — clipboard not available in all contexts
    });
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
      {/* Nav */}
      <CalculatorNav
        view={view}
        onViewChange={setView}
        onAddTraveler={handleAddTraveler}
        onCopyLink={handleCopyLink}
      />

      {/* Active view */}
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
          onAddTraveler={handleAddTraveler}
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
    </Box>
  );
}
