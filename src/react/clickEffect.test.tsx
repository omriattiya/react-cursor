import { act, fireEvent, render, screen } from "@testing-library/react";
import { CursorProvider, CursorZone, useCursor } from "../index";

function mockMatchMedia({ reducedMotion }: { reducedMotion: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches:
          query === "(prefers-reduced-motion: reduce)"
            ? reducedMotion
            : query === "(pointer: fine)",
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );
}

const getClickEffects = () => [...document.querySelectorAll("[data-react-cursor-click]")];

function press(x = 100, y = 120, button = 0) {
  fireEvent.pointerDown(window, {
    clientX: x,
    clientY: y,
    button,
    isPrimary: button === 0,
    pointerType: "mouse",
  });
}

describe("click effect", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("spawns a ripple at the press point", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <div />
      </CursorProvider>,
    );

    press(140, 80);

    const [el] = getClickEffects();
    expect(el).toBeTruthy();
    expect(el).toHaveAttribute("data-react-cursor-click", "ripple");
    expect(el).toHaveStyle({ left: "140px", top: "80px" });
  });

  test("spawns rays at the press point", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "rays" }}>
        <div />
      </CursorProvider>,
    );

    press();

    expect(getClickEffects()[0]).toHaveAttribute("data-react-cursor-click", "rays");
  });

  test("ignores non-primary button presses", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <div />
      </CursorProvider>,
    );

    press(50, 50, 1);

    expect(getClickEffects()).toHaveLength(0);
  });

  test("stacks up to 10 instances", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <div />
      </CursorProvider>,
    );

    for (let i = 0; i < 11; i++) {
      press(i * 10, 10);
    }

    expect(getClickEffects()).toHaveLength(10);
  });

  test("does not spawn when clickEffect is omitted", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider>
        <div />
      </CursorProvider>,
    );

    press();

    expect(getClickEffects()).toHaveLength(0);
  });

  test("does not spawn when clickEffect is false", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={false}>
        <div />
      </CursorProvider>,
    );

    press();

    expect(getClickEffects()).toHaveLength(0);
  });

  test("is disabled under prefers-reduced-motion", () => {
    mockMatchMedia({ reducedMotion: true });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <div />
      </CursorProvider>,
    );

    press();

    expect(getClickEffects()).toHaveLength(0);
  });

  test("works with a Native Cursor (no custom cursor layer)", () => {
    mockMatchMedia({ reducedMotion: false });

    function Native() {
      useCursor("pointer");
      return null;
    }

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <Native />
      </CursorProvider>,
    );

    press(200, 200);

    expect(document.querySelector("[data-react-cursor]")).toBeNull();
    expect(getClickEffects()).toHaveLength(1);
  });

  test("removes an instance after its animation duration", () => {
    vi.useFakeTimers();
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <div />
      </CursorProvider>,
    );

    press();
    expect(getClickEffects()).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(getClickEffects()).toHaveLength(0);
  });

  test("respects a custom duration", () => {
    vi.useFakeTimers();
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple", duration: 200 }}>
        <div />
      </CursorProvider>,
    );

    press();
    expect(getClickEffects()).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(getClickEffects()).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(getClickEffects()).toHaveLength(0);
  });

  test("a hovered zone clickEffect spawns without a provider effect", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider>
        <CursorZone cursor="pointer" clickEffect={{ variant: "ripple" }} data-testid="zone">
          zone
        </CursorZone>
      </CursorProvider>,
    );

    press();
    expect(getClickEffects()).toHaveLength(0);

    fireEvent.mouseEnter(screen.getByTestId("zone"));
    press();
    expect(getClickEffects()[0]).toHaveAttribute("data-react-cursor-click", "ripple");
  });

  test("leaving a zone restores the provider clickEffect", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "rays" }}>
        <CursorZone cursor="pointer" clickEffect={{ variant: "ripple" }} data-testid="zone">
          zone
        </CursorZone>
      </CursorProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("zone"));
    press();
    expect(getClickEffects()[0]).toHaveAttribute("data-react-cursor-click", "ripple");

    fireEvent.mouseLeave(screen.getByTestId("zone"));
    press();
    const effects = getClickEffects();
    expect(effects.at(-1)).toHaveAttribute("data-react-cursor-click", "rays");
  });

  test("the innermost zone clickEffect wins", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider>
        <CursorZone cursor="pointer" clickEffect={{ variant: "ripple" }} data-testid="outer">
          <CursorZone cursor="pointer" clickEffect={{ variant: "rays" }} data-testid="inner">
            inner
          </CursorZone>
        </CursorZone>
      </CursorProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("outer"));
    fireEvent.mouseEnter(screen.getByTestId("inner"));
    press();

    expect(getClickEffects()[0]).toHaveAttribute("data-react-cursor-click", "rays");
  });

  test("clickEffect={false} on a zone disables the provider effect", () => {
    mockMatchMedia({ reducedMotion: false });

    render(
      <CursorProvider clickEffect={{ variant: "ripple" }}>
        <CursorZone cursor="pointer" clickEffect={false} data-testid="zone">
          zone
        </CursorZone>
      </CursorProvider>,
    );

    fireEvent.mouseEnter(screen.getByTestId("zone"));
    press();
    expect(getClickEffects()).toHaveLength(0);
  });
});
