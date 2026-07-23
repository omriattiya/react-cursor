import { act, fireEvent, render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function SpringDot() {
  // Underdamped on purpose: overshoot is what distinguishes a spring from lerp
  useCursor({ preset: "dot", physics: { stiffness: 300, damping: 8, mass: 1 } });
  return null;
}

function StretchDot() {
  useCursor({ preset: "dot", velocity: { stretch: 2 } });
  return null;
}

const getCursorElement = () => document.querySelector<HTMLElement>("[data-react-cursor]")!;
const getVisualElement = () => document.querySelector<HTMLElement>("[data-react-cursor-visual]")!;

const currentX = () => {
  const match = /translate3d\((-?[\d.]+)px/.exec(getCursorElement().style.transform)!;
  return Number(match[1]);
};

function advanceFrames(count: number) {
  act(() => {
    for (let i = 0; i < count; i++) {
      vi.advanceTimersToNextFrame();
    }
  });
}

describe("physics tracking", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("an underdamped spring overshoots the mouse, then settles exactly on it", () => {
    render(
      <CursorProvider>
        <SpringDot />
      </CursorProvider>,
    );

    // First move jumps the cursor onto the pointer
    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    advanceFrames(1);

    fireEvent.mouseMove(window, { clientX: 300, clientY: 100 });

    // Lerp approaches monotonically, so exceeding the target proves spring momentum
    let maxX = -Infinity;
    for (let i = 0; i < 300; i++) {
      advanceFrames(1);
      maxX = Math.max(maxX, currentX());
    }

    expect(maxX).toBeGreaterThan(300);
    expect(getCursorElement().style.transform).toBe("translate3d(300px, 100px, 0)");
  });
});

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
});
