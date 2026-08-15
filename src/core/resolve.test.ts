import { resolveClickEffect, resolveCursor } from "./resolve";
import type { ClickEffectConfig, CursorStyle } from "./types";

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

const ripple: ClickEffectConfig = { variant: "ripple" };
const rays: ClickEffectConfig = { variant: "rays" };

describe("resolveClickEffect", () => {
  test("uses the provider when no zone sets a click effect", () => {
    expect(resolveClickEffect(ripple, [])).toEqual(ripple);
    expect(resolveClickEffect(ripple, [undefined])).toEqual(ripple);
  });

  test("a hovered zone overrides the provider", () => {
    expect(resolveClickEffect(ripple, [rays])).toEqual(rays);
  });

  test("the innermost explicit zone wins when zones are nested", () => {
    expect(resolveClickEffect(ripple, [rays, false])).toEqual(false);
    expect(resolveClickEffect(undefined, [ripple, undefined, rays])).toEqual(rays);
  });

  test("an outer zone is used when the inner zone inherits", () => {
    expect(resolveClickEffect(ripple, [rays, undefined])).toEqual(rays);
  });

  test("returns undefined when nothing is set", () => {
    expect(resolveClickEffect(undefined, [])).toBeUndefined();
    expect(resolveClickEffect(undefined, [undefined])).toBeUndefined();
  });
});
