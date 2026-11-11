import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useState whose setter applies at most once per animation frame: calls in
 * between are coalesced and only the latest value lands. Pointer and range
 * input events can fire many times a frame; this keeps renders to what the
 * screen can show.
 */
export default function useFrameThrottledState<T>(
  initial: T,
): [T, (next: T) => void] {
  const [value, setValue] = useState(initial);
  const pending = useRef<{ next: T } | null>(null);
  const frame = useRef<number | null>(null);

  const set = useCallback((next: T) => {
    pending.current = { next };
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current) setValue(pending.current.next);
      pending.current = null;
    });
  }, []);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  return [value, set];
}
