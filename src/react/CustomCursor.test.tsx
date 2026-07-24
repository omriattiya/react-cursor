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

  test("the pulse preset renders an animated ripple ring", () => {
    function PulseCursor() {
      useCursor({ preset: "pulse", color: "tomato", size: 40 });
      return null;
    }

    render(
      <CursorProvider>
        <PulseCursor />
      </CursorProvider>,
    );

    const ring = getCursorElement()!.querySelector<HTMLElement>(".react-cursor-pulse-ring");
    expect(ring).toBeInTheDocument();
    expect(ring!.style.border).toContain("tomato");
  });

  test("native-look presets render SVG cursors", () => {
    function ArrowCursor() {
      useCursor({ preset: "arrow", color: "navy" });
      return null;
    }

    render(
      <CursorProvider>
        <ArrowCursor />
      </CursorProvider>,
    );

    const path = getCursorElement()!.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path!.getAttribute("fill")).toBe("navy");
  });

  test("the wand preset renders a star tip", () => {
    function WandCursor() {
      useCursor({ preset: "wand", color: "orchid", size: 32 });
      return null;
    }

    render(
      <CursorProvider>
        <WandCursor />
      </CursorProvider>,
    );

    const star = getCursorElement()!.querySelector(".react-cursor-wand-star");
    expect(star).toBeInTheDocument();
    expect(star!.getAttribute("fill")).toBe("orchid");
  });

  test("the comet preset renders a bloom orb", () => {
    function CometCursor() {
      useCursor({ preset: "comet", color: "violet" });
      return null;
    }

    render(
      <CursorProvider>
        <CometCursor />
      </CursorProvider>,
    );

    const comet = getCursorElement()!.querySelector<HTMLElement>(".react-cursor-comet");
    expect(comet).toBeInTheDocument();
    expect(comet!.style.background).toContain("violet");
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
