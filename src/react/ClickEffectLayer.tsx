import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { ClickEffectConfig } from "../core/types";
import { useReducedMotion } from "./useReducedMotion";

const MAX_INSTANCES = 10;
const DURATION_MS = 450;
const DEFAULT_COLOR = "rgba(0,0,0,0.35)";
const DEFAULT_SIZE = 48;
const RAY_COUNT = 8;

const KEYFRAMES_ID = "react-cursor-click-keyframes";

const KEYFRAMES = `
@keyframes react-cursor-click-ripple {
  from { transform: translate(-50%, -50%) scale(0.15); opacity: 0.85; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@keyframes react-cursor-click-ray {
  from { transform: scaleY(0.2); opacity: 0.9; }
  to { transform: scaleY(1); opacity: 0; }
}
`;

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = KEYFRAMES;
  document.head.appendChild(style);
}

interface Instance {
  id: number;
  x: number;
  y: number;
}

const layerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 2147483647,
  overflow: "hidden",
};

function RippleVisual({ x, y, color, size }: { x: number; y: number; color: string; size: number }) {
  return (
    <span
      data-react-cursor-click="ripple"
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        boxSizing: "border-box",
        animation: `react-cursor-click-ripple ${DURATION_MS}ms ease-out forwards`,
        pointerEvents: "none",
      }}
    />
  );
}

function RaysVisual({ x, y, color, size }: { x: number; y: number; color: string; size: number }) {
  const rayLength = size / 2;
  const rayWidth = Math.max(1.5, size / 24);

  return (
    <span
      data-react-cursor-click="rays"
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: RAY_COUNT }, (_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transform: `rotate(${(360 / RAY_COUNT) * i}deg)`,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: rayWidth,
              height: rayLength,
              marginLeft: -rayWidth / 2,
              marginTop: -rayLength,
              borderRadius: rayWidth,
              background: color,
              transformOrigin: "50% 100%",
              animation: `react-cursor-click-ray ${DURATION_MS}ms ease-out forwards`,
              pointerEvents: "none",
            }}
          />
        </span>
      ))}
    </span>
  );
}

export function ClickEffectLayer({ config }: { config: ClickEffectConfig }) {
  const reducedMotion = useReducedMotion();
  const [instances, setInstances] = useState<Instance[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const layerId = useId();

  const color = config.color ?? DEFAULT_COLOR;
  const size = config.size ?? DEFAULT_SIZE;
  const variant = config.variant;

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
      setInstances([]);
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;

      const id = ++nextId.current;
      const point = { id, x: event.clientX, y: event.clientY };
      setInstances((prev) => {
        const next = [...prev, point];
        if (next.length <= MAX_INSTANCES) return next;
        const dropped = next.slice(0, next.length - MAX_INSTANCES);
        for (const item of dropped) {
          const timer = timers.current.get(item.id);
          if (timer !== undefined) {
            clearTimeout(timer);
            timers.current.delete(item.id);
          }
        }
        return next.slice(-MAX_INSTANCES);
      });

      const timer = setTimeout(() => {
        timers.current.delete(id);
        setInstances((prev) => prev.filter((item) => item.id !== id));
      }, DURATION_MS);
      timers.current.set(id, timer);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div aria-hidden data-react-cursor-click-layer={layerId} style={layerStyle}>
      {instances.map((item) =>
        variant === "ripple" ? (
          <RippleVisual key={item.id} x={item.x} y={item.y} color={color} size={size} />
        ) : (
          <RaysVisual key={item.id} x={item.x} y={item.y} color={color} size={size} />
        ),
      )}
    </div>
  );
}
