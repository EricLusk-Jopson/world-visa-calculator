import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// analytics.ts reads its env at import, so each test imports a fresh copy.
const load = () => import("./analytics");

describe("analytics", () => {
  const sent: { url: string; body: Record<string, unknown> }[] = [];

  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init: RequestInit) => {
        sent.push({ url, body: JSON.parse(String(init.body)) });
        return Promise.resolve(new Response(null));
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    sent.length = 0;
  });

  it("sends the token with every event", async () => {
    vi.stubEnv("PUBLIC_ANALYTICS_URL", "https://analytics.test/");
    vi.stubEnv("PUBLIC_ANALYTICS_TOKEN", "evc-token");
    const { trackEvent } = await load();

    trackEvent("trip_added", { days: 5 });

    expect(sent).toHaveLength(1);
    expect(sent[0].url).toBe("https://analytics.test/");
    expect(sent[0].body).toMatchObject({
      token: "evc-token",
      event: "trip_added",
      properties: { days: 5 },
    });
  });

  it("sends the token with problem reports", async () => {
    vi.stubEnv("PUBLIC_ANALYTICS_URL", "https://analytics.test/");
    vi.stubEnv("PUBLIC_ANALYTICS_TOKEN", "evc-token");
    const { reportSourceIssue } = await load();

    expect(reportSourceIssue({ kind: "broken-link" })).toBe("sent");
    expect(sent[0].body).toMatchObject({
      token: "evc-token",
      event: "source_issue_reported",
    });
  });

  it("sends an empty token when none is configured", async () => {
    vi.stubEnv("PUBLIC_ANALYTICS_URL", "https://analytics.test/");
    vi.stubEnv("PUBLIC_ANALYTICS_TOKEN", "");
    const { trackEvent } = await load();

    trackEvent("trip_added");

    expect(sent[0].body.token).toBe("");
  });

  it("sends nothing without an endpoint", async () => {
    vi.stubEnv("PUBLIC_ANALYTICS_URL", "");
    vi.stubEnv("PUBLIC_ANALYTICS_TOKEN", "evc-token");
    const { trackEvent } = await load();

    trackEvent("trip_added");

    expect(sent).toHaveLength(0);
  });
});
