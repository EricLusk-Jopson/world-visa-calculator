import { useState } from "react";
import { useUrlSync } from "@/features/sharing";
import { VisaRegion, VISA_REGION_LABELS } from "@/types";
import type { ShareableState } from "@/types";

export default function App() {
  const [name, setName] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [exitDate, setExitDate] = useState("");
  const [region, setRegion] = useState<VisaRegion>(VisaRegion.Schengen);
  const [state, setState] = useState<ShareableState>({ travelers: [] });

  const { shareableUrl, copyShareableUrl, clearSavedData } = useUrlSync({
    state,
    onHydrate: setState,
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !entryDate) return;

    setState((prev) => ({
      travelers: [
        ...prev.travelers,
        {
          id: crypto.randomUUID(),
          name: name.replace(/[^a-zA-Z]/g, "").slice(0, 30),
          trips: [{ entryDate, exitDate: exitDate || undefined, region }],
        },
      ],
    }));

    setName("");
    setEntryDate("");
    setExitDate("");
    setRegion(VisaRegion.Schengen);
  }

  function handleReset() {
    setState({ travelers: [] });
    clearSavedData();
    window.history.replaceState(null, "", window.location.pathname);
  }

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
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Emma"
            style={inputStyle}
          />
        </label>
        <label>
          Entry date
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Exit date{" "}
          <span style={{ color: "#888", fontSize: 13 }}>
            (leave blank if ongoing)
          </span>
          <input
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label>
          Region
          <select
            value={region}
            onChange={(e) => setRegion(Number(e.target.value) as VisaRegion)}
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
        <button type="submit" style={buttonStyle}>
          Add traveler
        </button>
      </form>

      {state.travelers.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Travelers</h2>
          {state.travelers.map((t) => (
            <div key={t.id} style={cardStyle}>
              <strong>{t.name}</strong>
              {t.trips.map((trip, i) => (
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
              style={{ ...buttonStyle, background: "#e55" }}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
