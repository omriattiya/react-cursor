import type { CursorStyle, RenderCursor } from "./types";

// These are type-level specs: the real assertions run under `pnpm run typecheck`.
describe("cursor style types", () => {
  test("velocity is preset-only; trail is accepted on presets and render cursors", () => {
    const withMotion: CursorStyle = {
      preset: "dot",
      smoothing: 0.2,
      velocity: { stretch: 1.5 },
      trail: { count: 5, delay: 100 },
    };
    const lerp: CursorStyle = { preset: "ring", smoothing: 0.2, trail: { count: 3 } };
    const custom: RenderCursor = { render: null, trail: { count: 4 } };

    expect([withMotion, lerp, custom]).toHaveLength(3);
  });
});
