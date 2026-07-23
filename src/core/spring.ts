import type { Point } from "./position";

export interface SpringState {
  position: Point;
  velocity: Point;
}

export interface SpringStepInput extends SpringState {
  target: Point;
  /** Seconds elapsed since the previous step. */
  dt: number;
  stiffness: number;
  damping: number;
  mass: number;
}

/** Below this remaining distance (px) and speed (px/s) the spring settles onto the target. */
const SETTLE_DISTANCE = 0.5;
const SETTLE_SPEED = 10;

/** Euler integration diverges with large steps (backgrounded tabs), so cap dt. */
const MAX_DT = 1 / 30;

export function springStep({ position, velocity, target, dt: rawDt, stiffness, damping, mass }: SpringStepInput): SpringState {
  const dt = Math.min(rawDt, MAX_DT);
  const vx = velocity.x + ((target.x - position.x) * stiffness - velocity.x * damping) * (dt / mass);
  const vy = velocity.y + ((target.y - position.y) * stiffness - velocity.y * damping) * (dt / mass);
  const next: SpringState = {
    position: { x: position.x + vx * dt, y: position.y + vy * dt },
    velocity: { x: vx, y: vy },
  };

  const distance = Math.hypot(target.x - next.position.x, target.y - next.position.y);
  if (distance < SETTLE_DISTANCE && Math.hypot(vx, vy) < SETTLE_SPEED) {
    return { position: { x: target.x, y: target.y }, velocity: { x: 0, y: 0 } };
  }
  return next;
}
