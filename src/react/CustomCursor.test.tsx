import { act, fireEvent, render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function DotCursor() {
  useCursor({ preset: "dot" });
  return null;
}

function GrabCursor() {
  useCursor("grab");
  return null;
}

const getCursorElement = () => document.querySelector<HTMLElement>("[data-react-cursor]");

describe("custom cursor", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("a preset cursor renders a cursor element", () => {
    render(
      <CursorProvider>
        <DotCursor />
      </CursorProvider>,
    );

    expect(getCursorElement()).toBeInTheDocument();
  });

  test("a native cursor does not render a cursor element", () => {
    render(
      <CursorProvider>
        <GrabCursor />
      </CursorProvider>,
    );

    expect(getCursorElement()).not.toBeInTheDocument();
  });

  test("the cursor element moves to the mouse position", () => {
    render(
      <CursorProvider>
        <DotCursor />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    expect(getCursorElement()!.style.transform).toBe("translate3d(120px, 80px, 0)");
  });

  test("the render escape hatch renders custom content", () => {
    function FancyCursor() {
      useCursor({ render: <span>sparkle</span> });
      return null;
    }

    render(
      <CursorProvider>
        <FancyCursor />
      </CursorProvider>,
    );

    expect(getCursorElement()).toHaveTextContent("sparkle");
  });
});
