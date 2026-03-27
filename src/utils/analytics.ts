const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL as string;

console.log("[analytics] ANALYTICS_URL =", ANALYTICS_URL || "(not set)");

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: string, properties: EventProperties = {}): void {
  console.log("[analytics] trackEvent called:", event, "| URL set:", !!ANALYTICS_URL);

  // Silently skip if no endpoint configured (e.g. local dev)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!ANALYTICS_URL) {
    console.warn("[analytics] Skipping — VITE_ANALYTICS_URL is not set");
    return;
  }

  // Fire-and-forget — never block the UI
  console.log("[analytics] Firing fetch for:", event);
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
  })
    .then(() => console.log("[analytics] fetch completed (opaque):", event))
    .catch((err) => console.error("[analytics] fetch error:", event, err));
}
