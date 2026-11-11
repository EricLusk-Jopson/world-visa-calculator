import { useEffect, useState } from "react";

/**
 * `value`, but only once it has stopped changing for `delayMs`. Lets
 * expensive parts of a view lag behind a control that changes rapidly (a
 * slider being dragged) while the cheap parts follow it live.
 */
export default function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
