import type { Point } from "./position";
import { springStep, type SpringState } from "./spring";

const DT = 1 / 60;

function simulate(
  initial: SpringState,
  target: Point,
  config: { stiffness: number; damping: number; mass: number },
  frames: number,
): SpringState {
  let state = initial;
  for (let i = 0; i < frames; i++) {
    state = springStep({ ...state, target, dt: DT, ...config });
  }
  return state;
}

const atRest = (position: Point): SpringState => ({ position, velocity: { x: 0, y: 0 } });

describe("springStep", () => {
  test("reaches the target and comes to rest", () => {
    // 3 simulated seconds is plenty for a stiff, well-damped spring
    const final = simulate(
      atRest({ x: 0, y: 0 }),
      { x: 300, y: 150 },
      { stiffness: 200, damping: 20, mass: 1 },
      180,
    );
    expect(final.position).toEqual({ x: 300, y: 150 });
    expect(final.velocity).toEqual({ x: 0, y: 0 });
  });

  test("an underdamped spring overshoots the target before settling", () => {
    let state = atRest({ x: 0, y: 0 });
    let maxX = 0;
    for (let i = 0; i < 180; i++) {
      state = springStep({ ...state, target: { x: 100, y: 0 }, dt: DT, stiffness: 300, damping: 8, mass: 1 });
      maxX = Math.max(maxX, state.position.x);
    }
    expect(maxX).toBeGreaterThan(100);
    expect(state.position).toEqual({ x: 100, y: 0 });
  });

  test("survives a huge dt (backgrounded tab) without diverging", () => {
    // A raw 1s Euler step at stiffness 200 would overshoot by thousands of px
    const final = simulate(atRest({ x: 0, y: 0 }), { x: 100, y: 0 }, { stiffness: 200, damping: 20, mass: 1 }, 1);
    const step = springStep({
      ...atRest({ x: 0, y: 0 }),
      target: { x: 100, y: 0 },
      dt: 1,
      stiffness: 200,
      damping: 20,
      mass: 1,
    });
    expect(Math.abs(step.position.x)).toBeLessThanOrEqual(200);
    expect(Math.abs(final.position.x)).toBeLessThanOrEqual(200);
  });

  test("a heavier cursor responds more slowly", () => {
    const config = { stiffness: 200, damping: 20 };
    const light = simulate(atRest({ x: 0, y: 0 }), { x: 100, y: 0 }, { ...config, mass: 0.5 }, 10);
    const heavy = simulate(atRest({ x: 0, y: 0 }), { x: 100, y: 0 }, { ...config, mass: 2 }, 10);
    expect(heavy.position.x).toBeLessThan(light.position.x);
  });
});
