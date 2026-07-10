import { act, fireEvent, render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function mockMatchMedia({ reducedMotion }: { reducedMotion: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches:
          query === "(prefers-reduced-motion: reduce)"
            ? reducedMotion
            : query === "(pointer: fine)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function SmoothedDot() {
  useCursor({ preset: "dot", smoothing: 0.5 });
  return null;
}

function renderAndMoveTwice() {
  render(
    <CursorProvider>
      <SmoothedDot />
    </CursorProvider>,
  );

  // First move jumps the cursor onto the pointer; second move exercises smoothing
  fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
  act(() => {
    vi.advanceTimersToNextFrame();
  });
  fireEvent.mouseMove(window, { clientX: 200, clientY: 100 });
  act(() => {
    vi.advanceTimersToNextFrame();
  });

  return document.querySelector<HTMLElement>("[data-react-cursor]")!;
}

describe("prefers-reduced-motion", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("smoothing trails behind the mouse when motion is allowed", () => {
    mockMatchMedia({ reducedMotion: false });

    const el = renderAndMoveTwice();

    expect(el.style.transform).toBe("translate3d(150px, 100px, 0)");
  });

  test("cursor snaps to the mouse when reduced motion is preferred", () => {
    mockMatchMedia({ reducedMotion: true });

    const el = renderAndMoveTwice();

    expect(el.style.transform).toBe("translate3d(200px, 100px, 0)");
  });
});
