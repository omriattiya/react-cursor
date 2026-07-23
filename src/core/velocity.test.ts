import { smoothVelocity, velocityTransform } from "./velocity";

describe("velocityTransform", () => {
  test("is the identity transform when the cursor is at rest", () => {
    expect(velocityTransform({ velocity: { x: 0, y: 0 }, stretch: 1.5 })).toEqual({
      angle: 0,
      scaleX: 1,
      scaleY: 1,
    });
  });

  test("elongates along the movement axis as speed grows, up to the configured max", () => {
    const slow = velocityTransform({ velocity: { x: 300, y: 0 }, stretch: 1.5 });
    const fast = velocityTransform({ velocity: { x: 1200, y: 0 }, stretch: 1.5 });
    const beyond = velocityTransform({ velocity: { x: 99999, y: 0 }, stretch: 1.5 });

    expect(slow.scaleX).toBeGreaterThan(1);
    expect(fast.scaleX).toBeGreaterThan(slow.scaleX);
    expect(beyond.scaleX).toBe(1.5);
  });

  test("preserves apparent area while stretching (squashes the cross axis)", () => {
    const { scaleX, scaleY } = velocityTransform({ velocity: { x: 1000, y: 0 }, stretch: 2 });
    expect(scaleX * scaleY).toBeCloseTo(1);
  });

  test("the stretch axis follows the movement direction", () => {
    const down = velocityTransform({ velocity: { x: 0, y: 500 }, stretch: 1.5 });
    expect(down.angle).toBeCloseTo(Math.PI / 2);
  });
});

describe("smoothVelocity", () => {
  test("a single frame only moves partway toward the raw velocity", () => {
    // Raw per-frame velocity is noisy (settle snaps, event jitter); jumping straight
    // to it whips the stretch axis around
    const smoothed = smoothVelocity({ x: 0, y: 0 }, { x: 1000, y: 0 }, 1 / 60);
    expect(smoothed.x).toBeGreaterThan(0);
    expect(smoothed.x).toBeLessThan(500);
  });

  test("converges to a steady raw velocity over time", () => {
    let smoothed = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) {
      smoothed = smoothVelocity(smoothed, { x: 1000, y: 0 }, 1 / 60);
    }
    expect(smoothed.x).toBeCloseTo(1000, 0);
  });

  test("a one-frame direction spike barely deflects the smoothed direction", () => {
    // Steady rightward motion, then a single noisy downward frame
    let smoothed = { x: 0, y: 0 };
    for (let i = 0; i < 60; i++) {
      smoothed = smoothVelocity(smoothed, { x: 1000, y: 0 }, 1 / 60);
    }
    smoothed = smoothVelocity(smoothed, { x: 0, y: 1000 }, 1 / 60);

    const angle = Math.atan2(smoothed.y, smoothed.x);
    expect(Math.abs(angle)).toBeLessThan(Math.PI / 8); // deflected < 22.5° despite a 90° spike
  });
});
