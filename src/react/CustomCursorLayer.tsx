import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { nextPosition, type Point } from "../core/position";
import type { PresetCursor, RenderCursor } from "../core/types";
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

export function CustomCursorLayer({ style }: { style: CustomCursorStyle }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const smoothing = reducedMotion ? 0 : (style.smoothing ?? 0);

  useEffect(() => {
    const el = ref.current;
    if (el === null) return;

    let current = OFFSCREEN;
    let target = OFFSCREEN;
    let frame: number | null = null;

    const tick = () => {
      frame = null;
      current = nextPosition({ current, target, smoothing });
      el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      if (current.x !== target.x || current.y !== target.y) {
        frame = requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      // Jump instead of lerping across the screen on the very first movement
      if (current === OFFSCREEN) {
        current = { x: e.clientX, y: e.clientY };
      }
      target = { x: e.clientX, y: e.clientY };
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
  }, [smoothing]);

  return (
    <div ref={ref} data-react-cursor="" aria-hidden style={layerStyle}>
      {"render" in style && style.render !== undefined ? style.render : <PresetVisual style={style as PresetCursor} />}
    </div>
  );
}

function PresetVisual({ style }: { style: PresetCursor }): ReactNode {
  const center: CSSProperties = { transform: "translate(-50%, -50%)", display: "block" };

  switch (style.preset) {
    case "dot": {
      const size = style.size ?? 10;
      return (
        <span
          style={{
            ...center,
            width: size,
            height: size,
            borderRadius: "50%",
            background: style.color ?? "#000",
          }}
        />
      );
    }
    case "ring": {
      const size = style.size ?? 32;
      return (
        <span
          style={{
            ...center,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${style.color ?? "#000"}`,
            background: "transparent",
          }}
        />
      );
    }
    case "spotlight": {
      const size = style.size ?? 200;
      return (
        <span
          style={{
            ...center,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${style.color ?? "rgba(255, 255, 255, 0.15)"} 0%, transparent 70%)`,
          }}
        />
      );
    }
    case "emoji":
      return <span style={{ ...center, fontSize: style.size ?? 24, lineHeight: 1 }}>{style.content}</span>;
    case "text":
      return (
        <span style={{ ...center, fontSize: style.size ?? 14, color: style.color ?? "#000", whiteSpace: "nowrap" }}>
          {style.content}
        </span>
      );
    case "image": {
      const size = style.size ?? 32;
      return <img src={style.content} alt="" style={{ ...center, width: size, height: size }} />;
    }
    case "pulse": {
      const size = style.size ?? 32;
      const color = style.color ?? "#000";
      const dotSize = Math.max(4, Math.round(size * 0.25));
      return (
        <span style={{ ...center, position: "relative", width: size, height: size }}>
          <style>{PULSE_CSS}</style>
          <span
            className="react-cursor-pulse-ring"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `2px solid ${color}`,
            }}
          />
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: color,
            }}
          />
        </span>
      );
    }
  }
}

const PULSE_CSS = `
@keyframes react-cursor-pulse {
  0% { transform: scale(0.35); opacity: 0.9; }
  100% { transform: scale(1); opacity: 0; }
}
.react-cursor-pulse-ring {
  animation: react-cursor-pulse 1.2s ease-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .react-cursor-pulse-ring {
    animation: none;
    opacity: 0.6;
  }
}
`;
