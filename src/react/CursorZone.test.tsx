import { fireEvent, render, screen } from "@testing-library/react";
import { CursorProvider, CursorZone, useCursor } from "../index";

function GrabCursor() {
  useCursor("grab");
  return null;
}

function renderZone() {
  render(
    <CursorProvider>
      <GrabCursor />
      <CursorZone cursor="pointer">
        <button>hover me</button>
      </CursorZone>
    </CursorProvider>,
  );
  return screen.getByText("hover me").parentElement!;
}

describe("CursorZone", () => {
  test("overrides the global cursor while hovered", () => {
    const zone = renderZone();

    fireEvent.mouseEnter(zone);

    expect(document.documentElement.style.cursor).toBe("pointer");
  });

  test("falls back to the global cursor when the mouse leaves", () => {
    const zone = renderZone();

    fireEvent.mouseEnter(zone);
    fireEvent.mouseLeave(zone);

    expect(document.documentElement.style.cursor).toBe("grab");
  });

  test("the innermost zone wins when zones are nested", () => {
    render(
      <CursorProvider>
        <CursorZone cursor="pointer" data-testid="outer">
          <CursorZone cursor="crosshair" data-testid="inner">
            <span>deep</span>
          </CursorZone>
        </CursorZone>
      </CursorProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("outer"));
    fireEvent.mouseEnter(screen.getByTestId("inner"));

    expect(document.documentElement.style.cursor).toBe("crosshair");
  });
});
