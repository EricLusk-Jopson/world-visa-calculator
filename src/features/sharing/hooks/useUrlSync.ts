/**
 * useUrlSync.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * A React hook that keeps the URL query string and localStorage in sync with
 * the app's traveler/trip state, and hydrates state from URL or localStorage
 * on first mount.
 *
 * HYDRATION PRIORITY (on mount, in order):
 *   1. URL query string  — highest priority (shared link clicked)
 *   2. localStorage      — returning user with no URL state
 *   3. Default empty     — fresh session
 *
 * URL updates use `history.replaceState` (not `pushState`) so that every
 * trivial data change doesn't pollute the browser's back/forward stack.
 *
 * localStorage key: "schengen_tracker_v1"
 */

import { useEffect, useRef, useCallback } from "react";
import {
  buildShareableUrl,
  decodeCurrentUrl,
  encodeState,
  decodeState,
} from "../utils/urlEncoding";
import type { ShareableState } from "@/types";
import { trackEvent } from "@/utils/analytics";

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCALSTORAGE_KEY = "schengen_tracker_v1";

// ─── localStorage helpers ─────────────────────────────────────────────────────

const saveToLocalStorage = (state: ShareableState): void => {
  try {
    const encoded = encodeState(state);
    localStorage.setItem(LOCALSTORAGE_KEY, encoded);
  } catch (err) {
    console.warn("[useUrlSync] Failed to write localStorage:", err);
  }
};

const loadFromLocalStorage = (): ShareableState | null => {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return null;
    const result = decodeState(raw);
    return result.ok ? result.state : null;
  } catch {
    return null;
  }
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch {
    /* ignore */
  }
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseUrlSyncOptions {
  /** Current shareable state from the store. */
  state: ShareableState;
  /** Called once on mount with the hydrated state (from URL or localStorage). */
  onHydrate: (state: ShareableState) => void;
  /**
   * Called once on mount after the hydration attempt settles, regardless of
   * whether any data was found. Use this to clear a loading state.
   */
  onHydrated?: () => void;
  /**
   * If true, the URL is updated on every state change.
   * Set to false when you want to prevent the URL from updating
   * (e.g. during a "what-if" ephemeral scenario).
   * Defaults to true.
   */
  syncToUrl?: boolean;
}

export interface UseUrlSyncReturn {
  /** Call this to copy the current shareable URL to the clipboard. */
  copyShareableUrl: () => Promise<void>;
  /** Clears all state from localStorage (but not URL). */
  clearSavedData: () => void;
  /** The current shareable URL as a string. */
  shareableUrl: string;
}

export const useUrlSync = ({
  state,
  onHydrate,
  onHydrated,
  syncToUrl = true,
}: UseUrlSyncOptions): UseUrlSyncReturn => {
  const hasMounted = useRef(false);

  // ── Hydration on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // 1. Try URL first (shared link).
    const urlResult = decodeCurrentUrl();
    if (urlResult.ok && urlResult.state.travelers.length > 0) {
      onHydrate(urlResult.state);
      // Persist the URL state to localStorage so it survives navigation.
      saveToLocalStorage(urlResult.state);
      trackEvent("data_loaded_from_url");
      onHydrated?.();
      return;
    }

    // 2. Fall back to localStorage (returning user).
    const lsState = loadFromLocalStorage();
    if (lsState && lsState.travelers.length > 0) {
      onHydrate(lsState);
      trackEvent("data_loaded_from_localstorage");
      onHydrated?.();
      return;
    }

    // 3. Nothing to hydrate — app starts with default empty state.
    onHydrated?.();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync state => URL + localStorage ────────────────────────────────────────
  useEffect(() => {
    if (!hasMounted.current) return; // don't sync before hydration completes

    if (syncToUrl) {
      const url = buildShareableUrl(state);
      // replaceState keeps the back button clean.
      window.history.replaceState(null, "", url);
    }

    // Always persist to localStorage regardless of URL sync setting.
    saveToLocalStorage(state);
  }, [state, syncToUrl]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const shareableUrl = buildShareableUrl(state);

  const copyShareableUrl = useCallback(async (): Promise<void> => {
    const url = buildShareableUrl(state);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API not available — fall back to document.execCommand.
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [state]);

  const clearSavedData = useCallback((): void => {
    clearLocalStorage();
  }, []);

  return {
    copyShareableUrl,
    clearSavedData,
    shareableUrl,
  };
};
