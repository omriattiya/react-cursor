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
  const trailVisualRefs = useRef<(HTMLDivElement | null)[]>([]);
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
    const trailVelocities = Array.from({ length: trailCount }, (): Point => ({ x: 0, y: 0 }));
    let lastTrailPos: Point[] = [];
    let trailPath: TrailPathPoint[] = [];
    let lastTime: number | null = null;
    let frame: number | null = null;
    let movedSinceTick = false;
    let strokeStart: number | null = null;
    const revealed = Array.from({ length: trailCount }, () => false);
    const faded = Array.from({ length: trailCount }, () => false);
    const stoppedAt: (number | null)[] = Array.from({ length: trailCount }, () => null);
    const fadeDelay = trail?.fadeDelay ?? 200;

    const tick = (now: number) => {
      frame = null;
      const dt = lastTime === null ? 1 / 60 : Math.max((now - lastTime) / 1000, 1 / 1000);
      lastTime = now;

      const previous = current;
      current = nextPosition({ current, target, smoothing });
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;

      const stretchAmount = velocity?.stretch ?? 1;
      const stretchCss = (vel: Point) => {
        const t = velocityTransform({ velocity: vel, stretch: stretchAmount });
        return {
          css: `rotate(${t.angle}rad) scale(${t.scaleX}, ${t.scaleY}) rotate(${-t.angle}rad)`,
          active: Math.abs(t.scaleX - 1) > 0.001,
        };
      };

      let effectActive = false;
      if (velocity !== undefined && visual !== null) {
        // Raw per-frame velocity is noisy (settle snaps, event jitter); smooth it
        // so the stretch axis doesn't whip around
        effectVelocity = smoothVelocity(
          effectVelocity,
          { x: (current.x - previous.x) / dt, y: (current.y - previous.y) / dt },
          dt,
        );
        // The counter-rotation keeps the visual upright: only the stretch axis
        // aligns to the movement direction, the shape itself never spins
        const stretch = stretchCss(effectVelocity);
        visual.style.transform = stretch.css;
        effectActive = stretch.active;
      }

      let trailMoving = false;
      if (trail !== undefined && trailCount > 0) {
        const delay = trail.delay ?? 100;
        const opts = { count: trailCount, delay };
        trailPath = recordTrailPoint(trailPath, current, now, opts);
        const sampled = sampleTrail(trailPath, now, opts);
        const onHead = sampled.map(
          (seg) => Math.hypot(seg.x - current.x, seg.y - current.y) <= TRAIL_SETTLE,
        );
        trailMoving = onHead.some((atRest) => !atRest);
        sampled.forEach((seg, i) => {
          const node = trailRefs.current[i];
          if (node) node.style.transform = `translate3d(${seg.x}px, ${seg.y}px, 0)`;

          if (velocity !== undefined) {
            const prev = lastTrailPos[i] ?? seg;
            trailVelocities[i] = smoothVelocity(
              trailVelocities[i]!,
              { x: (seg.x - prev.x) / dt, y: (seg.y - prev.y) / dt },
              dt,
            );
            const stretch = stretchCss(trailVelocities[i]!);
            const visualNode = trailVisualRefs.current[i];
            if (visualNode) visualNode.style.transform = stretch.css;
            if (stretch.active) effectActive = true;
          }
        });
        lastTrailPos = sampled;

        const headMoving = movedSinceTick || current.x !== target.x || current.y !== target.y;
        const fullyFaded = revealed.some(Boolean) && revealed.every((on, i) => !on || faded[i]);

        if (headMoving) {
          if (fullyFaded) {
            // Trail had fully dissolved: peel a fresh one off the cursor.
            for (const node of trailRefs.current) {
              if (node) {
                node.style.transition = "";
                node.style.opacity = "0";
              }
            }
            revealed.fill(false);
            faded.fill(false);
            stoppedAt.fill(null);
            strokeStart = now;
          } else {
            // Pause-and-go: keep the snake on its path. Never hide a tail that
            // is still out, even if some segments had started fading.
            faded.fill(false);
            stoppedAt.fill(null);
            for (const node of trailRefs.current) {
              if (node) node.style.transition = "";
            }
            if (strokeStart === null) strokeStart = now;
          }
          for (let i = 0; i < trailCount; i++) {
            if (now - strokeStart! >= (i + 1) * delay) {
              revealed[i] = true;
            }
            const node = trailRefs.current[i];
            if (node) {
              node.style.opacity = revealed[i] ? String(trailOpacity(i, trailCount)) : "0";
            }
          }
          movedSinceTick = false;
        } else {
          // Mouse stopped: a segment starts its fadeDelay only once it has
          // arrived on the cursor — not when its per-frame step gets small.
          if (!trailMoving) {
            trailPath = [{ x: current.x, y: current.y, t: now }];
          }
          for (let i = 0; i < trailCount; i++) {
            if (!onHead[i]) {
              stoppedAt[i] = null;
            } else if (stoppedAt[i] === null) {
              stoppedAt[i] = now;
            }
            if (
              revealed[i] &&
              !faded[i] &&
              stoppedAt[i] !== null &&
              now - stoppedAt[i]! >= fadeDelay
            ) {
              const node = trailRefs.current[i];
              if (node) {
                node.style.transition = `opacity ${TRAIL_FADE_MS}ms ease-out`;
                node.style.opacity = "0";
              }
              faded[i] = true;
            }
          }
          movedSinceTick = false;
        }
      }

      const awaitingFade = revealed.some((on, i) => on && !faded[i]);

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
            <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0" }}>
              <div
                ref={(node) => {
                  trailVisualRefs.current[i] = node;
                }}
                data-react-cursor-trail-visual=""
              >
                {visualNode}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

