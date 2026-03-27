const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL as string;

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: string, properties: EventProperties = {}): void {
  // Silently skip if no endpoint configured (e.g. local dev)
  if (!ANALYTICS_URL) return;

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
