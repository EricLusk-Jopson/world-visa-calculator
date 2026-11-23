import { useState } from "react";
import { ThemeProvider } from "@mui/material";
import theme from "@/styles/theme";
import type { Traveler } from "@/types";
import { loadFromLocalStorage, saveToLocalStorage } from "@/features/sharing";
import { EesFixer } from "@/features/eesFixer";

/**
 * The EES Record Fixer on /ees-record-fixer. Mounted `client:only` because
 * it reads browser storage. It loads the trips saved by the calculator on
 * this device and writes edits back, so /app shows them too.
 */
export function EesFixerIsland() {
  const [travelers, setTravelers] = useState<Traveler[]>(() => loadFromLocalStorage()?.travelers ?? []);
  const onTravelersChange = (next: Traveler[]) => {
    setTravelers(next);
    saveToLocalStorage({ travelers: next });
  };
  return (
    <ThemeProvider theme={theme}>
      <EesFixer travelers={travelers} onTravelersChange={onTravelersChange} surface="landing" />
    </ThemeProvider>
  );
}
