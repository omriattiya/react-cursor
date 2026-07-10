import { render, screen } from "@testing-library/react";
import { CursorProvider, useCursor, useHasCursor } from "../index";

function mockPointerCapability(hasFinePointer: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: query === "(pointer: fine)" ? hasFinePointer : false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

function Probe() {
  return <span>{useHasCursor() ? "has-cursor" : "no-cursor"}</span>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useHasCursor", () => {
  test("returns true on devices with a fine pointer", () => {
    mockPointerCapability(true);

    render(
      <CursorProvider>
        <Probe />
      </CursorProvider>,
    );

    expect(screen.getByText("has-cursor")).toBeInTheDocument();
  });

  test("returns false on touch-only devices", () => {
    mockPointerCapability(false);

    render(
      <CursorProvider>
        <Probe />
      </CursorProvider>,
    );

    expect(screen.getByText("no-cursor")).toBeInTheDocument();
  });
});

describe("touch-only devices", () => {
  test("no custom cursor element is rendered", () => {
    mockPointerCapability(false);

    function DotCursor() {
      useCursor({ preset: "dot" });
      return null;
    }

    render(
      <CursorProvider>
        <DotCursor />
      </CursorProvider>,
    );

    expect(document.querySelector("[data-react-cursor]")).not.toBeInTheDocument();
  });
});
