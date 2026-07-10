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

  test("reverts to the default cursor on unmount", () => {
    const { rerender } = render(
      <CursorProvider>
        <GrabCursor />
      </CursorProvider>,
    );

    rerender(<CursorProvider>{null}</CursorProvider>);

    expect(document.documentElement.style.cursor).toBe("auto");
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
