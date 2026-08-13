import { act, fireEvent, render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function TrailDot() {
  useCursor({ preset: "dot", trail: { count: 3, delay: 100 } });
  return null;
}

const getTrailElements = () => [...document.querySelectorAll<HTMLElement>("[data-react-cursor-trail]")];

const transformX = (el: HTMLElement) => {
  const match = /translate3d\((-?[\d.]+)px/.exec(el.style.transform)!;
  return Number(match[1]);
};

function advanceFrames(count: number) {
  act(() => {
    for (let i = 0; i < count; i++) {
      vi.advanceTimersToNextFrame();
    }
  });
}

describe("trail", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders one segment element per configured count", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    expect(getTrailElements()).toHaveLength(3);
  });

  test("segments fade with depth", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    const opacities = getTrailElements().map((el) => Number(el.style.opacity));
    expect(opacities[0]).toBeGreaterThan(opacities[1]!);
    expect(opacities[1]).toBeGreaterThan(opacities[2]!);
  });

  test("segments trail behind the cursor in order while it moves", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    // Continuous rightward movement so every segment has real path history to
    // replay; sampled mid-flight, before anything converges back onto the head
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    const head = document.querySelector<HTMLElement>("[data-react-cursor]")!;
    const [first, second, third] = getTrailElements() as [HTMLElement, HTMLElement, HTMLElement];

    expect(transformX(head)).toBeGreaterThan(transformX(first));
    expect(transformX(first)).toBeGreaterThan(transformX(second));
    expect(transformX(second)).toBeGreaterThan(transformX(third));
  });

  test("segments converge all the way onto the cursor after the mouse stops", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    // Mouse rests: within count * delay every segment slides back onto the
    // head instead of parking spread out behind it
    advanceFrames(40);

    const head = document.querySelector<HTMLElement>("[data-react-cursor]")!;
    for (const el of getTrailElements()) {
      expect(transformX(el)).toBeCloseTo(transformX(head), 0);
    }
  });

  test("segments shrink with depth by default", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    const scales = getTrailElements().map((el) => {
      const inner = el.firstElementChild as HTMLElement;
      return Number(/scale\(([\d.]+)\)/.exec(inner.style.transform)![1]);
    });
    expect(scales[0]).toBeLessThan(1);
    expect(scales[1]).toBeLessThan(scales[0]!);
    expect(scales[2]).toBeLessThan(scales[1]!);
    // Scale around the hotspot so shrunk clones sit on the mouse, not offset
    for (const el of getTrailElements()) {
      const inner = el.firstElementChild as HTMLElement;
      expect(inner.style.transformOrigin).toMatch(/^0(px)? 0(px)?$/);
    }
  });

  test("shrink: false keeps every segment at the cursor's full size", () => {
    function FullSizeTrail() {
      useCursor({ preset: "dot", trail: { count: 3, shrink: false } });
      return null;
    }

    render(
      <CursorProvider>
        <FullSizeTrail />
      </CursorProvider>,
    );

    for (const el of getTrailElements()) {
      const inner = el.firstElementChild as HTMLElement;
      expect(inner.style.transform).toBe("scale(1)");
    }
    // Depth fade still applies — only the size is uniform
    const opacities = getTrailElements().map((el) => Number(el.style.opacity));
    expect(opacities[0]).toBeGreaterThan(opacities[1]!);
  });

  test("renders 3 segments by default when count is omitted", () => {
    function DefaultTrail() {
      useCursor({ preset: "dot", trail: {} });
      return null;
    }

    render(
      <CursorProvider>
        <DefaultTrail />
      </CursorProvider>,
    );

    expect(getTrailElements()).toHaveLength(3);
  });

  test("each segment fades fadeDelay after it stops, not after the mouse stops", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    // ~240ms after mouse stop: past fadeDelay (200) from the mouse, but the
    // nearest segment itself only stopped ~100ms ago — none should be fading
    advanceFrames(15);
    for (const el of getTrailElements()) {
      expect(Number(el.style.opacity)).toBeGreaterThan(0);
    }

    // Nearest stop (~100ms) + fadeDelay (200) ≈ 300ms → nearest gone only
    advanceFrames(8);
    const [nearest, middle, deepest] = getTrailElements() as [HTMLElement, HTMLElement, HTMLElement];
    expect(nearest.style.opacity).toBe("0");
    expect(nearest.style.transition).toContain("opacity");
    expect(Number(middle.style.opacity)).toBeGreaterThan(0);
    expect(Number(deepest.style.opacity)).toBeGreaterThan(0);
  });

  test("segments fade one by one from the nearest end, not as a single block", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    // Nearest stop + fadeDelay ≈ 300ms → nearest gone only
    advanceFrames(22);

    const [nearest, middle, deepest] = getTrailElements() as [HTMLElement, HTMLElement, HTMLElement];
    expect(nearest.style.opacity).toBe("0");
    expect(nearest.style.transition).toContain("opacity"); // gradual, not a hard cut
    expect(Number(middle.style.opacity)).toBeGreaterThan(0);
    expect(Number(deepest.style.opacity)).toBeGreaterThan(0);

    // Deepest stop (~300ms) + fadeDelay → whole tail gone
    advanceFrames(26);
    for (const el of getTrailElements()) {
      expect(el.style.opacity).toBe("0");
    }

    // A twitch must not pop the whole trail back at once
    fireEvent.mouseMove(window, { clientX: 410, clientY: 100 });
    advanceFrames(1);
    for (const el of getTrailElements()) {
      expect(Number(el.style.opacity)).toBe(0);
    }

    // Keep moving: nearest appears first, then the rest one delay apart
    for (let x = 420; x <= 520; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }
    const afterFirstDelay = getTrailElements().map((el) => Number(el.style.opacity));
    expect(afterFirstDelay[0]).toBeGreaterThan(0);
    expect(afterFirstDelay[1]).toBe(0);
    expect(afterFirstDelay[2]).toBe(0);

    // ~6 more frames: second delay elapsed, third not yet
    for (let x = 530; x <= 580; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }
    const afterSecondDelay = getTrailElements().map((el) => Number(el.style.opacity));
    expect(afterSecondDelay[0]).toBeGreaterThan(0);
    expect(afterSecondDelay[1]).toBeGreaterThan(0);
    expect(afterSecondDelay[2]).toBe(0);
    expect(afterSecondDelay[0]).toBeGreaterThan(afterSecondDelay[1]!);
  });

  test("resuming before the trail finishes keeps continuous motion", () => {
    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    const [nearest, middle, deepest] = getTrailElements() as [HTMLElement, HTMLElement, HTMLElement];
    expect(Number(deepest.style.opacity)).toBeGreaterThan(0);

    // Brief pause: tail is still catching up, nearest may even have started fading
    advanceFrames(5);

    fireEvent.mouseMove(window, { clientX: 450, clientY: 100 });
    advanceFrames(1);
    for (let x = 460; x <= 500; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    // Must not hide-and-re-peel: already-visible segments stay up
    expect(Number(nearest.style.opacity)).toBeGreaterThan(0);
    expect(Number(middle.style.opacity)).toBeGreaterThan(0);
    expect(Number(deepest.style.opacity)).toBeGreaterThan(0);
  });

  test("a custom fadeDelay keeps the trail visible longer", () => {
    function SlowFadeDot() {
      useCursor({ preset: "dot", trail: { count: 2, fadeDelay: 1000 } });
      return null;
    }

    render(
      <CursorProvider>
        <SlowFadeDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 110; x <= 400; x += 10) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    // Past default 200ms, but well within fadeDelay 1000
    advanceFrames(40);

    for (const el of getTrailElements()) {
      expect(Number(el.style.opacity)).toBeGreaterThan(0);
    }
  });

  test("no trail is rendered when reduced motion is preferred", () => {
    vi.stubGlobal(
      "matchMedia",
      (query: string) =>
        ({
          matches: query === "(prefers-reduced-motion: reduce)" || query === "(pointer: fine)",
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );

    render(
      <CursorProvider>
        <TrailDot />
      </CursorProvider>,
    );

    expect(document.querySelector("[data-react-cursor]")).toBeInTheDocument();
    expect(getTrailElements()).toHaveLength(0);

    vi.unstubAllGlobals();
  });
});
