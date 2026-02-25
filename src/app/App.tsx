import { useState, useMemo } from "react";
import { useUrlSync } from "@/features/sharing";
import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import type { ShareableState, Trip } from "@/types";
import { calculateMaxStay } from "@/features/calculator/utils/schengen";
import { parseDate, formatDate } from "@/features/calculator/utils/dates";

// ─── Date constraint helpers ───────────────────────────────────────────────────

/**
 * Returns an error message if entryDate falls inside any of the traveler's
 * existing trips, null otherwise.
 */
function getEntryDateError(entryDate: string, trips: Trip[]): string | null {
  for (const trip of trips) {
    const tExit = trip.exitDate ?? "9999-12-31"; // ongoing trips block indefinitely
    if (entryDate >= trip.entryDate && entryDate <= tExit) {
      return `Overlaps existing trip (${trip.entryDate} → ${trip.exitDate ?? "ongoing"}).`;
    }
  }
  return null;
}

interface ExitConstraint {
  /** Last allowed exit date, or null when entry itself is impossible. */
  maxDate: string | null;
  /** Human-readable reason for the ceiling. */
  reason: string;
}

/**
 * Given a proposed entry date, the traveler's existing trips, and the region
 * for the new trip, compute the maximum allowed exit date.
 *
 * Two independent ceilings are computed and the binding (earlier) one is returned:
 *  1. Overlap — the day before the next existing trip starts.
 *  2. Schengen — the `maxExitDate` from `calculateMaxStay` (Schengen only).
 *
 * Returns null when there is no upper bound (Elsewhere with no future trips).
 */
function computeExitConstraint(
  entryDate: string,
  existingTrips: Trip[],
  region: VisaRegion,
): ExitConstraint | null {
  // Ceiling 1: day before the next trip that starts after entryDate.
  const nextTrip = [...existingTrips]
    .filter((t) => t.entryDate > entryDate)
    .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))[0];

  const maxFromOverlap: string | null = nextTrip
    ? formatDate(parseDate(nextTrip.entryDate))
    : null;

  // Ceiling 2: Schengen 90/180 rule (only applies to Schengen trips).
  let maxFromSchengen: string | null = null;
  if (region === VisaRegion.Schengen) {
    // calculateMaxStay must receive only Schengen trips as history.
    const schengenHistory = existingTrips.filter(
      (t) => t.region === VisaRegion.Schengen,
    );
    const result = calculateMaxStay(entryDate, schengenHistory);
    if (!result.canEnter) {
      return {
        maxDate: null,
        reason: "No Schengen allowance remaining on this date.",
      };
    }
    maxFromSchengen = result.maxExitDate;
  }

  // Pick the binding (earlier) ceiling.
  const candidates = [maxFromOverlap, maxFromSchengen].filter(
    (d): d is string => d !== null,
  );

  if (candidates.length === 0) return null;

  const maxDate = candidates.reduce((min, d) => (d < min ? d : min));

  const reason =
    maxDate === maxFromSchengen && maxFromSchengen
      ? "Schengen 90/180 rule"
      : `next trip begins ${nextTrip!.entryDate}`;

  return { maxDate, reason };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function App() {
  // Form state
  const [selectedTravelerId, setSelectedTravelerId] =
    useState<string>("__new__");
  const [name, setName] = useState("");
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [entryError, setEntryError] = useState<string | null>(null);

  // App state
  const [state, setState] = useState<ShareableState>({ travelers: [] });
  const { shareableUrl, copyShareableUrl, clearSavedData } = useUrlSync({
    state,
    onHydrate: setState,
  });

  const isNewTraveler = selectedTravelerId === "__new__";

  const selectedTraveler = useMemo(
    () => state.travelers.find((t) => t.id === selectedTravelerId) ?? null,
    [state.travelers, selectedTravelerId],
  );

  // Recomputed whenever entry date, region, or traveler trips change.
  const exitConstraint = useMemo<ExitConstraint | null>(() => {
    if (!entryDate || entryError || !selectedTraveler) return null;
    return computeExitConstraint(entryDate, selectedTraveler.trips, region);
  }, [entryDate, entryError, selectedTraveler, region]);

  const cannotEnter = exitConstraint?.maxDate === null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleTravelerChange(id: string) {
    setSelectedTravelerId(id);
    setEntryDate("");
    setExitDate("");
    setEntryError(null);
  }

  function handleRegionChange(r: VisaRegion) {
    setRegion(r);
    // Exit date may no longer be valid under the new region's rules.
    setExitDate("");
  }

  function handleEntryDateChange(value: string) {
    setEntryDate(value);
    setExitDate(""); // exit ceiling changes with every entry date update

    if (value && selectedTraveler) {
      setEntryError(getEntryDateError(value, selectedTraveler.trips));
    } else {
      setEntryError(null);
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (isNewTraveler && !name.trim()) return;
    if (!entryDate) return;

    // Final guard: re-validate (handles the case where traveler was already
    // selected and trips changed before submit).
    if (selectedTraveler) {
      const err = getEntryDateError(entryDate, selectedTraveler.trips);
      if (err) {
        setEntryError(err);
        return;
      }
    }

    const newTrip = {
      entryDate,
      exitDate: exitDate || undefined,
      region,
    };

    if (isNewTraveler) {
      setState((prev) => ({
        travelers: [
          ...prev.travelers,
          {
            id: crypto.randomUUID(),
            name: name.replace(/[^a-zA-Z]/g, "").slice(0, 30),
            trips: [newTrip],
          },
        ],
      }));
      setName("");
    } else {
      setState((prev) => ({
        travelers: prev.travelers.map((t) =>
          t.id === selectedTravelerId
            ? { ...t, trips: [...t.trips, newTrip] }
            : t,
        ),
      }));
    }

    setEntryDate("");
    setExitDate("");
    setEntryError(null);
    setRegion(VisaRegion.Schengen);
  }

  function handleReset() {
    setState({ travelers: [] });
    setSelectedTravelerId("__new__");
    clearSavedData();
    window.history.replaceState(null, "", window.location.pathname);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const submitDisabled =
    !!entryError ||
    cannotEnter ||
    !entryDate ||
    (isNewTraveler && !name.trim());

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "60px auto",
        fontFamily: "sans-serif",
        padding: "0 16px",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 24 }}>
        Schengen Tracker — Demo
      </h1>

      <form
        onSubmit={handleAdd}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        {/* Traveler selector — only shown once at least one traveler exists */}
        {state.travelers.length > 0 && (
          <label>
            Traveler
            <select
              value={selectedTravelerId}
              onChange={(e) => handleTravelerChange(e.target.value)}
              style={inputStyle}
            >
              <option value="__new__">+ New traveler</option>
              {state.travelers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Name field — only for new travelers */}
        {isNewTraveler && (
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Emma"
              style={inputStyle}
            />
          </label>
        )}

        {/* Region */}
        <label>
          Region
          <select
            value={region}
            onChange={(e) =>
              handleRegionChange(Number(e.target.value) as VisaRegion)
            }
            style={inputStyle}
          >
            {(Object.entries(VISA_REGION_LABELS) as [string, string][]).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        {/* Entry date */}
        <label>
          Entry date
          <input
            type="date"
            value={entryDate}
            onChange={(e) => handleEntryDateChange(e.target.value)}
            style={{
              ...inputStyle,
              borderColor: entryError ? "#dc2626" : "#ccc",
            }}
          />
          {entryError && <span style={errorTextStyle}>{entryError}</span>}
        </label>

        {/* Exit date */}
        <label>
          Exit date{" "}
          <span style={{ color: "#888", fontSize: 13 }}>
            (leave blank if ongoing)
          </span>
          <input
            type="date"
            value={exitDate}
            min={entryDate || undefined}
            max={exitConstraint?.maxDate ?? undefined}
            disabled={!entryDate || !!entryError || cannotEnter}
            onChange={(e) => setExitDate(e.target.value)}
            style={{
              ...inputStyle,
              opacity: !entryDate || !!entryError || cannotEnter ? 0.5 : 1,
            }}
          />
          {/* Ceiling hint */}
          {exitConstraint?.maxDate && (
            <span style={hintTextStyle}>
              Latest exit: <strong>{exitConstraint.maxDate}</strong> —{" "}
              {exitConstraint.reason}
            </span>
          )}
          {/* Cannot enter message */}
          {entryDate && !entryError && cannotEnter && (
            <span style={errorTextStyle}>{exitConstraint?.reason}</span>
          )}
        </label>

        <button
          type="submit"
          disabled={submitDisabled}
          style={{
            ...buttonStyle,
            opacity: submitDisabled ? 0.5 : 1,
            cursor: submitDisabled ? "not-allowed" : "pointer",
          }}
        >
          {isNewTraveler ? "Add traveler" : "Add trip"}
        </button>
      </form>

      {/* Traveler list */}
      {state.travelers.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Travelers</h2>
          {state.travelers.map((t) => (
            <div key={t.id} style={cardStyle}>
              <strong>{t.name}</strong>
              {[...t.trips]
                .sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1))
                .map((trip, i) => (
                  <div
                    key={i}
                    style={{ fontSize: 13, color: "#555", marginTop: 4 }}
                  >
                    {VISA_REGION_LABELS[trip.region]} · {trip.entryDate} →{" "}
                    {trip.exitDate ?? "ongoing"}
                  </div>
                ))}
            </div>
          ))}

          <div
            style={{
              marginTop: 20,
              fontSize: 13,
              wordBreak: "break-all",
              color: "#333",
            }}
          >
            <strong>Shareable URL:</strong>
            <div
              style={{
                marginTop: 4,
                background: "#f4f4f4",
                padding: 8,
                borderRadius: 4,
              }}
            >
              {shareableUrl}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={copyShareableUrl} style={buttonStyle}>
              Copy URL
            </button>
            <button
              onClick={handleReset}
              style={{ ...buttonStyle, background: "#dc2626" }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: "6px 8px",
  fontSize: 15,
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: 4,
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: 15,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const cardStyle: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: 6,
  marginBottom: 8,
};

const errorTextStyle: React.CSSProperties = {
  display: "block",
  marginTop: 4,
  fontSize: 12,
  color: "#dc2626",
};

const hintTextStyle: React.CSSProperties = {
  display: "block",
  marginTop: 4,
  fontSize: 12,
  color: "#6b7280",
};
