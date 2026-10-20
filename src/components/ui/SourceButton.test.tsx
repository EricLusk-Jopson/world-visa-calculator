import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MontenegroSources } from "@/data/sources";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("SourceButton", () => {
  let container: HTMLDivElement;
  let root: Root;
  const sent: { event: string; properties: Record<string, string> }[] = [];

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("PUBLIC_ANALYTICS_URL", "https://analytics.test/");
    vi.stubGlobal("fetch", vi.fn((_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return Promise.resolve(new Response(null));
    }));
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    sent.length = 0;
  });

  const byText = (text: string) =>
    [...document.querySelectorAll<HTMLElement>("a, button, label, p")].find((el) => el.textContent?.trim().startsWith(text));

  it("opens the source details and sends a problem report", async () => {
    const { SourceButton } = await import("./SourceButton");
    await act(async () => root.render(<SourceButton source={MontenegroSources.DZ} variant="text" />));
    await act(async () => byText("Source")!.click());

    expect(byText("Official source")?.getAttribute("href")).toBe(MontenegroSources.DZ.direct.url);
    const links = document.querySelector('[data-testid="source-links"]')!;
    expect(links.querySelectorAll("a")).toHaveLength(2); // official and overview, side by side
    expect(byText("Verified")?.textContent).toBe("Verified 15 Oct 2026 · Rule changed 15 Oct 2026 →");
    expect(byText("Rule changed 15 Oct 2026")?.getAttribute("href")).toBe("/rule-changes#rule-4");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50)); // link status loads lazily
    });
    expect(document.body.textContent).not.toMatch(/Link checked|couldn't reach/); // a working link isn't announced

    await act(async () => byText("Report a problem")!.click());
    const send = byText("Send report") as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    await act(async () => (document.querySelector('input[value="wrong-info"]') as HTMLInputElement).click());
    await act(async () => send.click());

    expect(byText("Thanks.")).toBeDefined();
    const report = sent.find((s) => s.event === "source_issue_reported");
    expect(report?.properties).toMatchObject({ region: "Montenegro", key: "DZ", kind: "wrong-info", url: MontenegroSources.DZ.direct.url });
  });
});
