/**
 * Lets any part of /app open the EES Record Fixer without threading a
 * callback through every layer. CalculatorPage provides it; outside the app
 * (or in tests) there's no provider and the entry points render nothing.
 */
import { createContext, useContext } from "react";

export interface FixerLaunch {
  travelerId?: string;
  /** Step to open at, e.g. STEP.diagnosis for "the EU checker shows fewer days". */
  step?: number;
}

export const EesFixerLauncherContext = createContext<((launch: FixerLaunch) => void) | null>(null);

export function useEesFixerLauncher() {
  return useContext(EesFixerLauncherContext);
}
