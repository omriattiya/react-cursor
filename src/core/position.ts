export interface Point {
  x: number;
  y: number;
}

export interface NextPositionInput {
  current: Point;
  target: Point;
  /** 0 = snap to target; (0, 1] = fraction of remaining distance covered per frame. */
  smoothing: number;
}

/** Below this remaining distance (px) the cursor settles onto the target. */
const SETTLE_THRESHOLD = 4.5;

export function nextPosition({ current, target, smoothing }: NextPositionInput): Point {
  if (smoothing <= 0) {
    return { x: target.x, y: target.y };
  }

  const dx = target.x - current.x;
  const dy = target.y - current.y;

  if (Math.hypot(dx, dy) < SETTLE_THRESHOLD) {
    return { x: target.x, y: target.y };
  }

  return {
    x: current.x + dx * smoothing,
    y: current.y + dy * smoothing,
  };
}
