import type { Point } from "./position";
import { recordTrailPoint, sampleTrail, type TrailPathPoint } from "./trail";

const OPTS = { count: 3, delay: 80 };

/** Records a list of head positions 16ms apart and returns the path. */
function buildPath(heads: Point[], opts = OPTS): TrailPathPoint[] {
  let path: TrailPathPoint[] = [];
  heads.forEach((head, i) => {
    path = recordTrailPoint(path, head, i * 16, opts);
  });
  return path;
}

/** An L-shaped mouse movement: right along y=0, then down along x=100. */
const L_SHAPE: Point[] = [
  ...Array.from({ length: 11 }, (_, i) => ({ x: i * 10, y: 0 })),
  ...Array.from({ length: 10 }, (_, j) => ({ x: 100, y: (j + 1) * 10 })),
];

describe("sampleTrail", () => {
  test("segments replay the head's earlier position exactly", () => {
    const path = buildPath(L_SHAPE);
    const now = (L_SHAPE.length - 1) * 16; // 320ms, head at (100, 100)

    // delay 80ms => segment 0 sits where the head was at t=240: (100, 50)
    const [first] = sampleTrail(path, now, { count: 1, delay: 80 });
    expect(first).toEqual({ x: 100, y: 50 });
  });

  test("segments stay on the recorded path around corners instead of cutting them", () => {
    const path = buildPath(L_SHAPE);
    const now = (L_SHAPE.length - 1) * 16;

    // Deep enough in the past to reach back around the corner onto the horizontal leg
    const segments = sampleTrail(path, now, { count: 3, delay: 80 });

    for (const seg of segments) {
      const onVerticalLeg = seg.x === 100;
      const onHorizontalLeg = seg.y === 0;
      expect(onVerticalLeg || onHorizontalLeg).toBe(true); // easing would put it on the diagonal
    }
  });

  test("a slight movement only spreads segments over the distance actually travelled", () => {
    // 2px of total movement must not fan the trail out to full spread
    const path = buildPath([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]);

    const segments = sampleTrail(path, 32, { count: 5, delay: 80 });
    for (const seg of segments) {
      expect(seg.x).toBeGreaterThanOrEqual(0);
      expect(seg.x).toBeLessThanOrEqual(2);
    }
  });

  test("segments converge onto the head after it stops, one delay apart", () => {
    const path = buildPath(L_SHAPE);
    const stoppedAt = (L_SHAPE.length - 1) * 16; // head rests at (100, 100)
    const opts = { count: 3, delay: 80 };

    // Mid-convergence: the nearest segment has caught up, the deepest is still travelling
    const mid = sampleTrail(path, stoppedAt + 2 * 80, opts);
    expect(mid[0]).toEqual({ x: 100, y: 100 });
    expect(mid[2]).not.toEqual({ x: 100, y: 100 });

    // After count * delay of rest, every segment sits exactly on the head
    const settled = sampleTrail(path, stoppedAt + 3 * 80, opts);
    for (const seg of settled) {
      expect(seg).toEqual({ x: 100, y: 100 });
    }
  });

  test("clamps to the start of the recorded path when there is not enough history", () => {
    const path = buildPath([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ]);

    // Far more lag than 16ms of history: everything pins to the oldest point
    const segments = sampleTrail(path, 16, { count: 2, delay: 500 });
    expect(segments[0]).toEqual({ x: 0, y: 0 });
    expect(segments[1]).toEqual({ x: 0, y: 0 });
  });
});

describe("recordTrailPoint", () => {
  test("ignores sub-pixel movement so a resting mouse doesn't grow the path", () => {
    const still = { x: 50, y: 50 };
    let path = recordTrailPoint([], still, 0, OPTS);
    const before = path.length;
    for (let i = 1; i <= 100; i++) {
      path = recordTrailPoint(path, still, i * 16, OPTS);
    }
    expect(path.length).toBe(before);
  });

  test("prunes history that is too old to ever be sampled", () => {
    let path: TrailPathPoint[] = [];
    // A long steady movement: 1000 points, 10px apart
    for (let i = 0; i < 1000; i++) {
      path = recordTrailPoint(path, { x: i * 10, y: 0 }, i * 16, OPTS);
    }
    // Needs at most (count+1) delays of history — far fewer than 1000 points
    expect(path.length).toBeLessThan(100);
  });
});
