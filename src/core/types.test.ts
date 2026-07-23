import type { CursorStyle, PresetCursor, RenderCursor } from "./types";

// These are type-level specs: the real assertions run under `pnpm run typecheck`.
describe("cursor style types", () => {
  test("physics, velocity, and trail are accepted on presets and render cursors", () => {
    const spring: CursorStyle = {
      preset: "dot",
      physics: { stiffness: 300, damping: 12, mass: 0.8 },
      velocity: { stretch: 1.5 },
      trail: { count: 5, delay: 100 },
    };
    const lerp: CursorStyle = { preset: "ring", smoothing: 0.2, trail: { count: 3 } };
    const custom: RenderCursor = { render: null, physics: {} };

    expect([spring, lerp, custom]).toHaveLength(3);
  });

  test("physics and smoothing are mutually exclusive", () => {
    // @ts-expect-error -- a cursor style cannot use both tracking models
    const both: PresetCursor = { preset: "dot", physics: { stiffness: 300 }, smoothing: 0.2 };

    expect(both).toBeDefined();
  });
});
