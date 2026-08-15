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

  test("the cursor follows the pointer while dragging (e.g. sliders)", () => {
    function SnapCursor() {
      useCursor({ preset: "dot", smoothing: 0 });
      return null;
    }

    render(
      <CursorProvider>
        <SnapCursor />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 40, clientY: 40 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    // Native slider drag uses pointer capture: pointermove fires, mousemove often does not.
    fireEvent.pointerMove(window, { clientX: 220, clientY: 90 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    expect(getCursorElement()!.style.transform).toBe("translate3d(220px, 90px, 0)");
  });

  test("the cursor keeps tracking when smoothing changes mid-drag", () => {
    function SmoothCursor({ smoothing }: { smoothing: number }) {
      useCursor({ preset: "dot", smoothing });
      return null;
    }

    const { rerender } = render(
      <CursorProvider>
        <SmoothCursor smoothing={0.75} />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    rerender(
      <CursorProvider>
        <SmoothCursor smoothing={0.2} />
      </CursorProvider>,
    );

    fireEvent.pointerMove(window, { clientX: 400, clientY: 100 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    // From 100 toward 400 at smoothing 0.2 → 160, not a snap to 400 or a jump offscreen.
    expect(getCursorElement()!.style.transform).toBe("translate3d(160px, 100px, 0)");
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

  test("velocity stretch is ignored on custom render cursors", () => {
    function StretchyRender() {
      // @ts-expect-error velocity is preset-only
      useCursor({ render: <span data-testid="custom">x</span>, velocity: { stretch: 3 } });
      return null;
    }

    render(
      <CursorProvider>
        <StretchyRender />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 0, clientY: 0 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    fireEvent.mouseMove(window, { clientX: 400, clientY: 0 });
    act(() => {
      for (let i = 0; i < 10; i++) vi.advanceTimersToNextFrame();
    });

    const visual = document.querySelector<HTMLElement>("[data-react-cursor-visual]")!;
    expect(visual.style.transform).toBe("");
  });

  test("the cursor fades out when the pointer leaves the page", () => {
    render(
      <CursorProvider>
        <DotCursor />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    fireEvent.mouseLeave(document.documentElement);

    expect(document.querySelector<HTMLElement>("[data-react-cursor-root]")!.style.opacity).toBe("0");
  });

  test("the cursor fades back in at the re-entry point without lerping across the page", () => {
    function SmoothCursor() {
      useCursor({ preset: "dot", smoothing: 0.2 });
      return null;
    }

    render(
      <CursorProvider>
        <SmoothCursor />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });
    fireEvent.mouseLeave(document.documentElement);

    fireEvent.mouseMove(window, { clientX: 400, clientY: 300 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    const root = document.querySelector<HTMLElement>("[data-react-cursor-root]")!;
    expect(root.style.opacity).toBe("1");
    expect(getCursorElement()!.style.transform).toBe("translate3d(400px, 300px, 0)");
  });

  test("the cursor fades out when the pointer is dragged off the page", () => {
    render(
      <CursorProvider>
        <DotCursor />
      </CursorProvider>,
    );

    fireEvent.mouseMove(window, { clientX: 40, clientY: 40 });
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    fireEvent.pointerMove(window, { clientX: -8, clientY: 40 });

    expect(document.querySelector<HTMLElement>("[data-react-cursor-root]")!.style.opacity).toBe("0");
    expect(getCursorElement()!.style.transform).toBe("translate3d(40px, 40px, 0)");
  });
});
