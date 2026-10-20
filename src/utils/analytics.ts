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

// Random per-page-load ID, kept in memory only (never persisted) so it can't link separate
// visits together. Lets the sheet count distinct sessions per day without storing any
// cross-visit identifier.
const SESSION_ID =
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

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
        sessionId: SESSION_ID,
      }),
    });
  } catch {
    // Analytics should never crash the app
  }
}

const MAX_ISSUE_REPORTS_PER_PAGE = 3;
let issueReportsSent = 0;

/**
 * Sends a "Report a problem" submission from a source link to the same
 * endpoint as analytics. A report is something the user chose to send, so
 * it goes even with ?notrack. Returns false when it can't be sent: no
 * endpoint (local dev), or the per-page limit is reached.
 */
export function reportSourceIssue(properties: EventProperties): "sent" | "unavailable" | "limit" {
  if (!ANALYTICS_URL) return "unavailable";
  if (issueReportsSent >= MAX_ISSUE_REPORTS_PER_PAGE) return "limit";
  issueReportsSent++;
  try {
    fetch(ANALYTICS_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        event: "source_issue_reported",
        properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        sessionId: SESSION_ID,
      }),
    }).catch(() => {
      // no-cors: an unreachable endpoint is all we can detect, and the user can't act on it
    });
  } catch {
    return "unavailable";
  }
  return "sent";
}
