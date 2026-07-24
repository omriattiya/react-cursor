import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { ClickEffectConfig } from "../core/types";
import { useReducedMotion } from "./useReducedMotion";

const MAX_INSTANCES = 10;
const DEFAULT_DURATION_MS = 450;
const DEFAULT_COLOR = "#000";
const DEFAULT_SIZE = 48;
const RAY_COUNT = 8;

const KEYFRAMES_ID = "react-cursor-click-keyframes-v2";

const KEYFRAMES = `
@keyframes react-cursor-click-ripple {
  from { transform: translate(-50%, -50%) scale(0.15); opacity: 1; }
  to { transform: translate(-50%, -50%) scale(1); opacity: 0; }
}
@keyframes react-cursor-click-ray {
  from { transform: scaleY(0.2); opacity: 1; }
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
  duration: number;
  color: string;
  size: number;
  variant: ClickEffectConfig["variant"];
}

const layerStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 2147483647,
  overflow: "hidden",
};

function RippleVisual({
  x,
  y,
  color,
  size,
  duration,
}: {
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
}) {
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
        animation: `react-cursor-click-ripple ${duration}ms ease-out forwards`,
        pointerEvents: "none",
      }}
    />
  );
}

function RaysVisual({
  x,
  y,
  color,
  size,
  duration,
}: {
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
}) {
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
              animation: `react-cursor-click-ray ${duration}ms ease-out forwards`,
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
  const configRef = useRef(config);
  configRef.current = config;

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

      const current = configRef.current;
      const duration = current.duration ?? DEFAULT_DURATION_MS;
      const id = ++nextId.current;
      const point: Instance = {
        id,
        x: event.clientX,
        y: event.clientY,
        duration,
        color: current.color ?? DEFAULT_COLOR,
        size: current.size ?? DEFAULT_SIZE,
        variant: current.variant,
      };
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
      }, duration);
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
        item.variant === "ripple" ? (
          <RippleVisual
            key={item.id}
            x={item.x}
            y={item.y}
            color={item.color}
            size={item.size}
            duration={item.duration}
          />
        ) : (
          <RaysVisual
            key={item.id}
            x={item.x}
            y={item.y}
            color={item.color}
            size={item.size}
            duration={item.duration}
          />
        ),
      )}
    </div>
  );
}
