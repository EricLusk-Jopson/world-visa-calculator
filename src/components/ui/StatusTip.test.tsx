import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MontenegroSources } from "@/data/sources";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("StatusTip", () => {
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
    [...document.querySelectorAll<HTMLElement>("button, p, [role=button]")].find((el) => el.textContent?.trim().startsWith(text));

  it("explains the status, links its sources and shows the icon guide, without clicking through to its parent", async () => {
    const { StatusTip } = await import("./StatusTip");
    const parentClick = vi.fn();
    await act(async () =>
      root.render(
        <div onClick={parentClick}>
          <StatusTip
            kind="eligibility"
            state="visa"
            detail="Schengen visa needed."
            sources={[{ label: "Entry rule", source: MontenegroSources.DZ }]}
          >
            <span>icon</span>
          </StatusTip>
        </div>,
      ),
    );

    const trigger = document.querySelector<HTMLElement>('[role="button"][aria-label="Visa required"]')!;
    await act(async () => trigger.click()); // a click pins the tooltip open

    expect(byText("Visa required")).toBeDefined();
    expect(byText("Schengen visa needed.")).toBeDefined();
    expect(byText("Entry rule source")).toBeDefined();
    expect(sent.find((s) => s.event === "status_tip_opened")?.properties).toMatchObject({ kind: "eligibility", state: "visa" });

    expect(document.querySelector('[data-testid="icon-guide"]')).toBeNull();
    await act(async () => byText("Icon guide")!.click());
    const guide = document.querySelector('[data-testid="icon-guide"]')!;
    // The guide for the icon being explained comes first, then the other kind.
    expect(guide.textContent).toMatch(/^Entry eligibility.*Visa required.*Stay duration.*Over the limit/);

    // The source opens its own details from inside the tooltip.
    await act(async () => byText("Entry rule source")!.click());
    expect(document.querySelector('[data-testid="source-links"]')).not.toBeNull();

    expect(parentClick).not.toHaveBeenCalled();
  });

  it("counts the travelers in a summary status", async () => {
    const { StatusTip } = await import("./StatusTip");
    await act(async () =>
      root.render(
        <StatusTip kind="duration" state="caution" count={2}>
          <span>icon</span>
        </StatusTip>,
      ),
    );
    await act(async () => document.querySelector<HTMLElement>('[aria-label="Approaching the limit: 2"]')!.click());
    expect(byText("2 travelers")).toBeDefined();
    expect(byText("Few days left in the allowance.")).toBeDefined();
  });
});
