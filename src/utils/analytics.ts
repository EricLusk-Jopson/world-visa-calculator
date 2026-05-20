const ANALYTICS_URL = import.meta.env.PUBLIC_ANALYTICS_URL as string;

const NOTRACK_SESSION_KEY = "evc_notrack";

function isTrackingOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).has("notrack")) {
    try { sessionStorage.setItem(NOTRACK_SESSION_KEY, "1"); } catch { /* ignore */ }
    return true;
  }
  try { return sessionStorage.getItem(NOTRACK_SESSION_KEY) === "1"; } catch { return false; }
}

const trackingOptedOut = isTrackingOptedOut();

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: string, properties: EventProperties = {}): void {
  // Silently skip if no endpoint configured (e.g. local dev) or user has opted out
  if (!ANALYTICS_URL || trackingOptedOut) return;

  // Fire-and-forget — never block the UI
  try {
    fetch(ANALYTICS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        event,
        properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
      }),
    });
  } catch {
    // Analytics should never crash the app
  }
}
