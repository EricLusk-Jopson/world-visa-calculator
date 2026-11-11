import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useDebouncedValue from "./useDebouncedValue";
import useFrameThrottledState from "./useFrameThrottledState";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  container = document.createElement("div");
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  vi.useRealTimers();
});

describe("useDebouncedValue", () => {
  function Probe({ value }: { value: string }) {
    return <>{useDebouncedValue(value, 150)}</>;
  }

  it("follows the value only once it stops changing", () => {
    act(() => root.render(<Probe value="a" />));
    act(() => root.render(<Probe value="b" />));
    act(() => vi.advanceTimersByTime(100));
    act(() => root.render(<Probe value="c" />));
    act(() => vi.advanceTimersByTime(100));
    expect(container.textContent).toBe("a");
    act(() => vi.advanceTimersByTime(60));
    expect(container.textContent).toBe("c");
  });
});

describe("useFrameThrottledState", () => {
  let set: (v: number) => void = () => {};
  let renders = 0;
  function Probe() {
    const [value, setValue] = useFrameThrottledState(0);
    set = setValue;
    renders++;
    return <>{value}</>;
  }

  it("applies only the latest of several calls in one frame, in one render", () => {
    act(() => root.render(<Probe />));
    const before = renders;
    act(() => {
      set(1);
      set(2);
      set(3);
    });
    expect(container.textContent).toBe("0");
    act(() => vi.advanceTimersToNextFrame());
    expect(container.textContent).toBe("3");
    expect(renders - before).toBe(1);
  });
});
