import { render } from "@testing-library/react";
import { CursorProvider, useCursor, type CursorInput } from "../index";

function Cursor({ style }: { style: CursorInput }) {
  useCursor(style);
  return null;
}

describe("native cursor hiding", () => {
  test("hides the native cursor while a custom cursor is active", () => {
    render(
      <CursorProvider>
        <Cursor style={{ preset: "dot" }} />
      </CursorProvider>,
    );

    expect(document.documentElement.style.cursor).toBe("none");
  });

  test("keeps the native cursor when hideNativeCursor is false", () => {
    render(
      <CursorProvider>
        <Cursor style={{ preset: "dot", hideNativeCursor: false }} />
      </CursorProvider>,
    );

    expect(document.documentElement.style.cursor).toBe("auto");
  });

  test("hides the native cursor on elements with their own cursor styling (e.g. buttons)", () => {
    render(
      <CursorProvider>
        <Cursor style={{ preset: "dot" }} />
        <button style={{ cursor: "pointer" }}>click me</button>
      </CursorProvider>,
    );

    const button = document.querySelector("button")!;
    expect(getComputedStyle(button).cursor).toBe("none");
  });

  test("restores the native cursor when the custom cursor unmounts", () => {
    const { rerender } = render(
      <CursorProvider>
        <Cursor style={{ preset: "dot" }} />
      </CursorProvider>,
    );

    rerender(<CursorProvider>{null}</CursorProvider>);

    expect(document.documentElement.style.cursor).toBe("auto");
  });
});
