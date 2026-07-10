import { resolveCursor } from "./resolve";
import type { CursorStyle } from "./types";

const ring: CursorStyle = { preset: "ring" };
const pointer: CursorStyle = { native: "pointer" };
const grab: CursorStyle = { native: "grab" };

describe("resolveCursor", () => {
  test("uses the global cursor when no zone is hovered", () => {
    expect(resolveCursor(ring, [])).toEqual(ring);
  });

  test("a hovered zone overrides the global cursor", () => {
    expect(resolveCursor(ring, [pointer])).toEqual(pointer);
  });

  test("the innermost zone wins when zones are nested", () => {
    // Zones are listed outermost-first; the last entered (innermost) takes priority
    expect(resolveCursor(ring, [pointer, grab])).toEqual(grab);
  });

  test("falls back to auto native cursor when nothing is set", () => {
    expect(resolveCursor(undefined, [])).toEqual({ native: "auto" });
  });
});
