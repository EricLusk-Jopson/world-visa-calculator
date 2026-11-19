import { useCallback, useState } from "react";

const STORAGE_KEY = "timeline_muted_trips_v1";

/**
 * Whether trip cards are drawn as plain tiles so the timeline's markers read
 * clearly over them. Remembered per browser; storage failures (private mode,
 * blocked site data) just fall back to off.
 */
export function useMutedTrips(): [boolean, () => void] {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const toggle = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  return [muted, toggle];
}
