import { act, fireEvent, render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function StretchDot() {
  useCursor({ preset: "dot", velocity: { stretch: 2 } });
  return null;
}

const getVisualElement = () => document.querySelector<HTMLElement>("[data-react-cursor-visual]")!;

function advanceFrames(count: number) {
  act(() => {
    for (let i = 0; i < count; i++) {
      vi.advanceTimersToNextFrame();
    }
  });
}

describe("velocity effect", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("stretches while moving fast and relaxes at rest", () => {
    render(
      <CursorProvider>
        <StretchDot />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);

    // 300px in a single frame is far beyond full-stretch speed
    fireEvent.mouseMove(window, { clientX: 400, clientY: 100 });
    advanceFrames(1);
    expect(getVisualElement().style.transform).toContain("scale(2");

    // No further mouse movement: the effect relaxes back to identity
    advanceFrames(5);
    expect(getVisualElement().style.transform).not.toContain("scale(2");
  });

  test("trail segments stretch along their own motion too", () => {
    function StretchTrail() {
      useCursor({ preset: "dot", velocity: { stretch: 2 }, trail: { count: 3, delay: 40 } });
      return null;
    }

    render(
      <CursorProvider>
        <StretchTrail />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);
    for (let x = 140; x <= 700; x += 40) {
      fireEvent.mouseMove(window, { clientX: x, clientY: 100 });
      advanceFrames(1);
    }

    const trailVisuals = [...document.querySelectorAll<HTMLElement>("[data-react-cursor-trail-visual]")];
    expect(trailVisuals.some((el) => el.style.transform.includes("scale("))).toBe(true);
    expect(trailVisuals.some((el) => /scale\(1[.]|scale\([2-9]/.test(el.style.transform))).toBe(true);
  });
});
