import type { Point } from "./position";

export interface TrailOptions {
  count: number;
  /** Lag (ms) each segment trails the one before it. */
  delay: number;
}

/** A recorded head position on the mouse path. */
export interface TrailPathPoint extends Point {
  /** Timestamp (ms) the head was here. */
  t: number;
}

/** Movements smaller than this (px) are not recorded. */
const RECORD_EPSILON = 0.01;

/**
 * Appends the head's position to the recorded path and prunes history that can
 * no longer be sampled. Returns the input path unchanged if the head hasn't moved.
 */
export function recordTrailPoint(
  path: TrailPathPoint[],
  head: Point,
  t: number,
  { count, delay }: TrailOptions,
): TrailPathPoint[] {
  const last = path.at(-1);
  if (last !== undefined && Math.hypot(head.x - last.x, head.y - last.y) < RECORD_EPSILON) {
    return path;
  }

  // Pause longer than the trail's settle window: start a new stroke from the
  // rest position so a twitch doesn't replay the previous swipe.
  const prefix =
    last !== undefined && t - last.t > count * delay
      ? [{ x: last.x, y: last.y, t: t - 1 }]
      : path;

  const next = [...prefix, { x: head.x, y: head.y, t }];

  // A point is dead once the point after it is already older than the deepest
  // sample; interpolating any live sample time then never needs it.
  const timeCutoff = t - (count + 1) * delay;
  let start = 0;
  while (start < next.length - 1 && next[start + 1]!.t <= timeCutoff) {
    start++;
  }
  return start > 0 ? next.slice(start) : next;
}

/** Position of the head at time `t`, interpolated along the recorded path. */
function pointAtTime(path: readonly TrailPathPoint[], t: number): Point {
  const first = path[0]!;
  const last = path[path.length - 1]!;
  if (t <= first.t) return { x: first.x, y: first.y };
  if (t >= last.t) return { x: last.x, y: last.y };

  for (let i = path.length - 2; i >= 0; i--) {
    const a = path[i]!;
    const b = path[i + 1]!;
    if (t >= a.t) {
      const span = b.t - a.t;
      if (span === 0) return { x: b.x, y: b.y };
      const f = (t - a.t) / span;
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return { x: first.x, y: first.y };
}

/**
 * Places each segment on the exact recorded mouse path: segment N replays the
 * head's position (N+1) delays ago. Segments therefore emerge from the cursor
 * as it starts moving and slide back onto it after it stops — sampling past
 * the end of the history clamps to the head's resting position.
 */
export function sampleTrail(
  path: readonly TrailPathPoint[],
  t: number,
  { count, delay }: TrailOptions,
): Point[] {
  if (path.length === 0) return [];

  const segments: Point[] = [];
  for (let i = 0; i < count; i++) {
    segments.push(pointAtTime(path, t - (i + 1) * delay));
  }
  return segments;
}
