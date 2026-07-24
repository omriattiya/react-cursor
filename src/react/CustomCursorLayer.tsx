import { useEffect, useRef, type CSSProperties } from "react";
import { nextPosition, type Point } from "../core/position";
import { recordTrailPoint, sampleTrail, type TrailPathPoint } from "../core/trail";
import type { PresetCursor, RenderCursor } from "../core/types";
import { smoothVelocity, velocityTransform } from "../core/velocity";
import { PresetVisual } from "./PresetVisual";
import { useReducedMotion } from "./useReducedMotion";

type CustomCursorStyle = PresetCursor | RenderCursor;

const OFFSCREEN: Point = { x: -9999, y: -9999 };

const layerStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  pointerEvents: "none",
  zIndex: 2147483647,
  transform: `translate3d(${OFFSCREEN.x}px, ${OFFSCREEN.y}px, 0)`,
};

/** How far (px) a trail segment may sit from its rest position and still count as settled. */
const TRAIL_SETTLE = 0.5;

/** Duration (ms) of the trail's fade-out once the idle fade delay has elapsed. */
const TRAIL_FADE_MS = 300;

/** Opacity of trail segment `i` out of `count` (deeper = fainter). */
const trailOpacity = (i: number, count: number) => 1 - (i + 1) / (count + 1);

export function CustomCursorLayer({ style }: { style: CustomCursorStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const smoothing = reducedMotion ? 0 : (style.smoothing ?? 0.75);
  // Velocity stretch is preset-only — custom render cursors own their own motion.
  const velocity =
    reducedMotion || "render" in style ? undefined : (style as PresetCursor).velocity;
  const trail = reducedMotion ? undefined : style.trail;
  const trailCount = trail === undefined ? 0 : (trail.count ?? 3);

  useEffect(() => {
    const el = ref.current;
    const visual = visualRef.current;
    if (el === null) return;

    let current = OFFSCREEN;
    let target = OFFSCREEN;
    let effectVelocity: Point = { x: 0, y: 0 };
    let trailPath: TrailPathPoint[] = [];
    let lastSampled: Point[] = [];
    let lastTime: number | null = null;
    let frame: number | null = null;
    let movedSinceTick = false;
    let idleSince: number | null = null;
    let fadedCount = 0; // segments faded so far, counted from the deepest end
    const fadeDelay = trail?.fadeDelay ?? 200;

    const tick = (now: number) => {
      frame = null;
      const dt = lastTime === null ? 1 / 60 : Math.max((now - lastTime) / 1000, 1 / 1000);
      lastTime = now;

      const previous = current;
      current = nextPosition({ current, target, smoothing });
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      let effectActive = false;
      if (velocity !== undefined && visual !== null) {
        // Raw per-frame velocity is noisy (settle snaps, event jitter); smooth it
        // so the stretch axis doesn't whip around
        effectVelocity = smoothVelocity(
          effectVelocity,
          { x: (current.x - previous.x) / dt, y: (current.y - previous.y) / dt },
          dt,
        );
        const t = velocityTransform({ velocity: effectVelocity, stretch: velocity.stretch ?? 1 });
        // The counter-rotation keeps the visual upright: only the stretch axis
        // aligns to the movement direction, the shape itself never spins
        visual.style.transform = `rotate(${t.angle}rad) scale(${t.scaleX}, ${t.scaleY}) rotate(${-t.angle}rad)`;
        effectActive = Math.abs(t.scaleX - 1) > 0.001;
      }

      let trailMoving = false;
      if (trail !== undefined && trailCount > 0) {
        const opts = { count: trailCount, delay: trail.delay ?? 100 };
        trailPath = recordTrailPoint(trailPath, current, now, opts);
        const sampled = sampleTrail(trailPath, now, opts);
        trailMoving = sampled.some((seg, i) => {
          const before = lastSampled[i];
          return before === undefined || Math.hypot(seg.x - before.x, seg.y - before.y) > TRAIL_SETTLE;
        });
        lastSampled = sampled;
        sampled.forEach((seg, i) => {
          const node = trailRefs.current[i];
          if (node) node.style.transform = `translate3d(${seg.x}px, ${seg.y}px, 0)`;
        });

        // Leave the trail alone until it has finished catching up; only then
        // dissolve one segment per fadeDelay, deepest first.
        if (movedSinceTick || trailMoving) {
          idleSince = now;
          movedSinceTick = false;
        }
        if (idleSince !== null) {
          const dueToFade = Math.min(trailCount, Math.floor((now - idleSince) / fadeDelay));
          while (fadedCount < dueToFade) {
            const node = trailRefs.current[trailCount - 1 - fadedCount];
            if (node) {
              node.style.transition = `opacity ${TRAIL_FADE_MS}ms ease-out`;
              node.style.opacity = "0";
            }
            fadedCount++;
          }
        }
      }

      const awaitingFade = trail !== undefined && fadedCount < trailCount;

      // Keep ticking until the position rests, effects relax, the tail settles,
      // and (if a trail is shown) its post-settle fade has finished
      if (current.x !== target.x || current.y !== target.y || effectActive || trailMoving || awaitingFade) {
        frame = requestAnimationFrame(tick);
      } else {
        lastTime = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      // Jump instead of lerping across the screen on the very first movement
      if (current === OFFSCREEN) {
        current = { x: e.clientX, y: e.clientY };
      }
      target = { x: e.clientX, y: e.clientY };
      movedSinceTick = true;
      if (fadedCount > 0) {
        // Reappear instantly — the fade transition only applies on the way out
        trailRefs.current.forEach((node, i) => {
          if (node) {
            node.style.transition = "";
            node.style.opacity = String(trailOpacity(i, trailCount));
          }
        });
        fadedCount = 0;
      }
      if (frame === null) {
        frame = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [smoothing, velocity, trail, trailCount]);

  const visualNode =
    "render" in style && style.render !== undefined ? style.render : <PresetVisual style={style as PresetCursor} />;

  return (
    <>
      <div ref={ref} data-react-cursor="" aria-hidden style={layerStyle}>
        <div ref={visualRef} data-react-cursor-visual="">
          {visualNode}
        </div>
      </div>
      {Array.from({ length: trailCount }, (_, i) => {
        // Deeper segments are fainter, and (unless shrink is off) smaller
        const depth = trailOpacity(i, trailCount);
        const scale = trail?.shrink === false ? 1 : depth;
        return (
          <div
            key={i}
            ref={(node) => {
              trailRefs.current[i] = node;
            }}
            data-react-cursor-trail=""
            aria-hidden
            style={{ ...layerStyle, zIndex: 2147483646, opacity: depth }}
          >
            <div style={{ transform: `scale(${scale})` }}>{visualNode}</div>
          </div>
        );
      })}
    </>
  );
}

