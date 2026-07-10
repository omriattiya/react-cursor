import { nextPosition } from "./position";

describe("nextPosition", () => {
  test("snaps exactly to the mouse position when smoothing is off", () => {
    expect(
      nextPosition({ current: { x: 0, y: 0 }, target: { x: 120, y: 80 }, smoothing: 0 }),
    ).toEqual({ x: 120, y: 80 });
  });

  test("moves a fraction of the way toward the mouse when smoothing is on", () => {
    // smoothing 0.25 => cursor covers 25% of the remaining distance per frame
    expect(
      nextPosition({ current: { x: 0, y: 0 }, target: { x: 100, y: 200 }, smoothing: 0.25 }),
    ).toEqual({ x: 25, y: 50 });
  });

  test("stays put when already at the target", () => {
    expect(
      nextPosition({ current: { x: 42, y: 7 }, target: { x: 42, y: 7 }, smoothing: 0.5 }),
    ).toEqual({ x: 42, y: 7 });
  });

  test("settles onto the target when the remaining distance is sub-pixel", () => {
    // Without settling, lerp approaches the target forever and the rAF loop never rests
    expect(
      nextPosition({ current: { x: 99.7, y: 99.7 }, target: { x: 100, y: 100 }, smoothing: 0.25 }),
    ).toEqual({ x: 100, y: 100 });
  });
});
