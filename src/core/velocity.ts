import type { Point } from "./position";

export interface VelocityTransformInput {
  /** Cursor velocity in px/s. */
  velocity: Point;
  /** Maximum elongation factor along the movement axis (1 = no stretch). */
  stretch: number;
}

export interface VelocityTransform {
  /**
   * Movement direction in radians (0 = right, positive = clockwise on screen).
   * Only orients the stretch axis — the visual itself never spins; callers
   * counter-rotate by `-angle` after the scale.
   */
  angle: number;
  scaleX: number;
  scaleY: number;
}

/** Speed (px/s) at which the stretch reaches its configured maximum. */
const FULL_STRETCH_SPEED = 1500;

/** Below this speed (px/s) the cursor counts as resting. */
const REST_SPEED = 1;

export function velocityTransform({ velocity, stretch }: VelocityTransformInput): VelocityTransform {
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed < REST_SPEED) {
    return { angle: 0, scaleX: 1, scaleY: 1 };
  }

  const angle = Math.atan2(velocity.y, velocity.x);
  const scaleX = 1 + (stretch - 1) * Math.min(speed / FULL_STRETCH_SPEED, 1);
  return { angle, scaleX, scaleY: 1 / scaleX };
}

/** Time constant (s) of the velocity low-pass filter. */
const VELOCITY_TAU = 0.06;

/**
 * Low-pass filters the raw per-frame velocity. Raw values are noisy — settle
 * snaps and event jitter produce one-frame spikes that whip the stretch axis
 * around; smoothing keeps the derived transform stable.
 */
export function smoothVelocity(previous: Point, raw: Point, dt: number): Point {
  const alpha = 1 - Math.exp(-dt / VELOCITY_TAU);
  return {
    x: previous.x + (raw.x - previous.x) * alpha,
    y: previous.y + (raw.y - previous.y) * alpha,
  };
}
