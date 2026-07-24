import { render } from "@testing-library/react";
import { CursorProvider, useCursor } from "../index";

function GrabCursor() {
  useCursor("grab");
  return null;
}

describe("useCursor with a native cursor", () => {
  test("applies the cursor to the document while mounted", () => {
    render(
      <CursorProvider>
        <GrabCursor />
      </CursorProvider>,
    );

    expect(document.documentElement.style.cursor).toBe("grab");
  });

  test("applies the native cursor on elements with their own cursor styling (e.g. buttons)", () => {
    render(
      <CursorProvider>
        <GrabCursor />
        <button>click me</button>
      </CursorProvider>,
    );

    const button = document.querySelector("button")!;
    expect(getComputedStyle(button).cursor).toBe("grab");
  });

  test("reverts to the default cursor on unmount", () => {
    const { rerender } = render(
      <CursorProvider>
        <GrabCursor />
      </CursorProvider>,
    );

    rerender(<CursorProvider>{null}</CursorProvider>);

    expect(document.documentElement.style.cursor).toBe("auto");
  });

  test("picks up hideNativeCursor changes on a render cursor with a stable node", () => {
    const stableNode = <span>custom</span>;

    function Cursor({ hide }: { hide: boolean }) {
      useCursor({ render: stableNode, hideNativeCursor: hide });
      return null;
    }

    const { rerender } = render(
      <CursorProvider>
        <Cursor hide={true} />
      </CursorProvider>,
    );
    expect(document.documentElement.style.cursor).toBe("none");

    rerender(
      <CursorProvider>
        <Cursor hide={false} />
      </CursorProvider>,
    );
    expect(document.documentElement.style.cursor).toBe("auto");
  });

  test("picks up trail changes on a render cursor with a stable node", () => {
    const stableNode = <span>custom</span>;
    const getTrailElements = () => document.querySelectorAll("[data-react-cursor-trail]");

    function Cursor({ trail }: { trail?: { count: number } }) {
      useCursor({ render: stableNode, trail });
      return null;
    }

    const { rerender } = render(
      <CursorProvider>
        <Cursor trail={{ count: 3 }} />
      </CursorProvider>,
    );
    expect(getTrailElements()).toHaveLength(3);

    rerender(
      <CursorProvider>
        <Cursor />
      </CursorProvider>,
    );
    expect(getTrailElements()).toHaveLength(0);

    rerender(
      <CursorProvider>
        <Cursor trail={{ count: 5 }} />
      </CursorProvider>,
    );
    expect(getTrailElements()).toHaveLength(5);
  });

  test("last writer wins when two components set the global cursor", () => {
    function WaitCursor() {
      useCursor("wait");
      return null;
    }

    render(
      <CursorProvider>
        <GrabCursor />
        <WaitCursor />
      </CursorProvider>,
    );

    expect(document.documentElement.style.cursor).toBe("wait");
  });
});
