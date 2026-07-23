import { useId, type CSSProperties, type ReactNode } from "react";
import type { PresetCursor } from "../core/types";

const center: CSSProperties = { transform: "translate(-50%, -50%)", display: "block" };

/** Lighten/darken a `#rrggbb` color; non-hex values are returned unchanged. */
function shadeHex(color: string, amount: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (!hex) return color;
  const n = Number.parseInt(hex, 16);
  const channel = (shift: number) => {
    const value = (n >> shift) & 0xff;
    return Math.max(0, Math.min(255, Math.round(value + 255 * amount)));
  };
  const r = channel(16);
  const g = channel(8);
  const b = channel(0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/** Renders the visual for a built-in preset (also used for playground chip previews). */
export function PresetVisual({ style }: { style: PresetCursor }): ReactNode {
  const uid = useId().replaceAll(":", "");

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
    case "arrow": {
      const size = style.size ?? 24;
      const color = style.color ?? "#000";
      // Tip sits on the mouse (native default-cursor hotspot), so no center transform.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }} aria-hidden>
          <path
            d="M1 1 L1 17.5 L5.8 13.2 L9.6 22 L13 20.4 L9.3 11.7 L16.5 11.7 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    case "hand": {
      const size = style.size ?? 28;
      const color = style.color ?? "#000";
      // Index-fingertip hotspot at top — classic OS pointing-hand silhouette.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }} aria-hidden>
          <path
            d={HAND_PATH}
            fill={color}
            stroke="#fff"
            strokeWidth="1.35"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    }
    case "crosshair": {
      const size = style.size ?? 28;
      const color = style.color ?? "#000";
      // FPS-style reticle: open center, short arms, center dot, corner brackets.
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" style={{ ...center, overflow: "visible" }} aria-hidden>
          <g stroke="#fff" strokeWidth="2.8" strokeLinecap="square" fill="none">
            <line x1="12" y1="1.5" x2="12" y2="6.5" />
            <line x1="12" y1="17.5" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="6.5" y2="12" />
            <line x1="17.5" y1="12" x2="22.5" y2="12" />
            <path d="M4.5 7.5 V4.5 H7.5" />
            <path d="M16.5 4.5 H19.5 V7.5" />
            <path d="M19.5 16.5 V19.5 H16.5" />
            <path d="M7.5 19.5 H4.5 V16.5" />
            <circle cx="12" cy="12" r="1.15" fill="#fff" stroke="none" />
          </g>
          <g stroke={color} strokeWidth="1.5" strokeLinecap="square" fill="none">
            <line x1="12" y1="1.5" x2="12" y2="6.5" />
            <line x1="12" y1="17.5" x2="12" y2="22.5" />
            <line x1="1.5" y1="12" x2="6.5" y2="12" />
            <line x1="17.5" y1="12" x2="22.5" y2="12" />
            <path d="M4.5 7.5 V4.5 H7.5" />
            <path d="M16.5 4.5 H19.5 V7.5" />
            <path d="M19.5 16.5 V19.5 H16.5" />
            <path d="M7.5 19.5 H4.5 V16.5" />
            <circle cx="12" cy="12" r="1.15" fill={color} stroke="none" />
          </g>
        </svg>
      );
    }
    case "wand": {
      const size = style.size ?? 28;
      const color = style.color ?? "#c084fc";
      // Star tip on the mouse hotspot.
      return (
        <span style={{ position: "relative", display: "block", width: size, height: size }}>
          <style>{WAND_CSS}</style>
          <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", overflow: "visible" }} aria-hidden>
            <line
              x1="7.5"
              y1="7.5"
              x2="20"
              y2="20"
              stroke="#fff"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <line
              x1="7.5"
              y1="7.5"
              x2="20"
              y2="20"
              stroke={color}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              className="react-cursor-wand-star"
              d="M4 1.2 L5.1 3.9 L8 4.2 L5.8 6.1 L6.5 9 L4 7.5 L1.5 9 L2.2 6.1 L0 4.2 L2.9 3.9 Z"
              fill={color}
              stroke="#fff"
              strokeWidth="0.9"
              strokeLinejoin="round"
            />
            <circle className="react-cursor-wand-spark" cx="11" cy="3" r="0.9" fill={color} />
            <circle className="react-cursor-wand-spark" cx="14.5" cy="6.5" r="0.7" fill={color} />
            <circle className="react-cursor-wand-spark" cx="3" cy="12" r="0.7" fill={color} />
          </svg>
        </span>
      );
    }
    case "comet": {
      const size = style.size ?? 28;
      const color = style.color ?? "#a78bfa";
      return (
        <span
          className="react-cursor-comet"
          style={{
            ...center,
            width: size,
            height: size,
            borderRadius: "50%",
            background: `radial-gradient(circle at 35% 35%, #fff 0%, ${color} 40%, transparent 72%)`,
            boxShadow: `0 0 ${Math.round(size * 0.55)}px ${color}, 0 0 ${Math.round(size * 1.1)}px ${color}`,
          }}
        >
          <style>{COMET_CSS}</style>
        </span>
      );
    }
    case "trump": {
      const size = style.size ?? 32;
      const hair = style.color ?? "#f5d76e";
      const hairDeep = shadeHex(hair, -0.22);
      const hairLite = shadeHex(hair, 0.28);
      const skinId = `trump-skin-${uid}`;
      const suitId = `trump-suit-${uid}`;
      return (
        <svg
          className="react-cursor-trump"
          width={size}
          height={size}
          viewBox="0 0 40 44"
          style={{ ...center, overflow: "visible" }}
          aria-hidden
        >
          <defs>
            <radialGradient id={skinId} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffc9a0" />
              <stop offset="55%" stopColor="#f0a06a" />
              <stop offset="100%" stopColor="#d9844f" />
            </radialGradient>
            <linearGradient id={suitId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Suit shoulders */}
          <path
            d="M8 38 C12 34.5 16 33.5 20 33.5 C24 33.5 28 34.5 32 38 L34 44 H6 Z"
            fill={`url(#${suitId})`}
            stroke="#fff"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          {/* Collar */}
          <path d="M14.5 34.5 L20 38.5 L25.5 34.5 L23.5 33.2 L20 35.8 L16.5 33.2 Z" fill="#f8fafc" />
          {/* Tie */}
          <path d="M18.6 35.5 L20 37.2 L21.4 35.5 L22.2 42.5 L20 44 L17.8 42.5 Z" fill="#dc2626" />
          <path d="M18.6 35.5 L20 37.2 L21.4 35.5 L20 34.6 Z" fill="#ef4444" />

          {/* Ears */}
          <ellipse cx="8.2" cy="22" rx="2.2" ry="3.1" fill="#e89560" stroke="#fff" strokeWidth="0.7" />
          <ellipse cx="31.8" cy="22" rx="2.2" ry="3.1" fill="#e89560" stroke="#fff" strokeWidth="0.7" />

          {/* Head */}
          <path
            d="M10 20
               C9.2 12.5 12.5 7.5 20 7.2
               C27.5 7 31 12.2 30.2 20
               C30.8 24.5 29.5 29.5 26.5 32.2
               C24.2 34.2 21.5 35.2 20 35.2
               C18.5 35.2 15.8 34.2 13.5 32.2
               C10.5 29.5 9.2 24.5 10 20 Z"
            fill={`url(#${skinId})`}
            stroke="#fff"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />

          {/* Hair base / combover volume */}
          <path
            className="react-cursor-trump-hair"
            d="M9.5 18.5
               C8.2 11 12 5.2 20 4.6
               C28.2 4 33 9.5 32.2 17.5
               C33.8 14.5 34 11 31.5 8
               C27.5 3.2 21.5 2.4 16 3.6
               C11.2 4.8 8 9.5 9.5 18.5 Z"
            fill={hair}
            stroke="#fff"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Hair depth / shadow sweep */}
          <path d="M11 16 C12.5 10 17 7.5 22 7.2 C26.5 7 30 10 30.5 14.5 C28 10.5 24 9 20 9.2 C15.5 9.5 12.5 12 11 16 Z" fill={hairDeep} opacity="0.55" />
          {/* Forehead fringe */}
          <path
            d="M10.5 17.5
               C13 13.5 16.5 12.2 20.2 12
               C24.5 11.8 28.2 13.5 30 17.2
               C27.5 14.2 24 13.5 20.2 13.6
               C16 13.8 12.8 15 10.5 17.5 Z"
            fill={hair}
          />
          {/* Hair highlight streaks */}
          <path d="M14 8.2 C16.5 6.8 20 6.5 23.5 7.2" stroke={hairLite} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9" />
          <path d="M12.5 11.5 C16 9.2 21 8.8 26 10.5" stroke={hairLite} strokeWidth="0.9" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* Brows */}
          <path d="M12.2 18.2 Q15.2 16.8 17.6 18.4" stroke="#6b4423" strokeWidth="1.35" strokeLinecap="round" fill="none" />
          <path d="M22.4 18.4 Q25 16.8 27.8 18.2" stroke="#6b4423" strokeWidth="1.35" strokeLinecap="round" fill="none" />

          {/* Eyes */}
          <ellipse cx="14.8" cy="20.6" rx="2.15" ry="1.7" fill="#fff" />
          <ellipse cx="25.2" cy="20.6" rx="2.15" ry="1.7" fill="#fff" />
          <ellipse cx="15.1" cy="20.7" rx="1.05" ry="1.15" fill="#3d2914" />
          <ellipse cx="25.5" cy="20.7" rx="1.05" ry="1.15" fill="#3d2914" />
          <circle cx="15.4" cy="20.35" r="0.35" fill="#fff" />
          <circle cx="25.8" cy="20.35" r="0.35" fill="#fff" />

          {/* Nose */}
          <path
            d="M20 21.2 C18.6 23.8 18.4 25.6 19.2 26.6 C19.7 27.2 20.8 27.3 21.4 26.6 C22.2 25.6 21.8 23.8 20.6 21.2"
            fill="#e09058"
            opacity="0.95"
          />
          <path d="M19.1 26.3 Q20.3 27.1 21.5 26.3" stroke="#c56f42" strokeWidth="0.7" strokeLinecap="round" fill="none" />

          {/* Mouth — pursed smirk */}
          <ellipse cx="20" cy="29.6" rx="3.6" ry="1.35" fill="#c45c54" />
          <path d="M16.8 29.3 Q20 30.6 23.2 29.3" stroke="#9a3d38" strokeWidth="0.7" strokeLinecap="round" fill="none" />
          <path d="M17.4 29.1 Q20 28.2 22.6 29.1" stroke="#e8a090" strokeWidth="0.65" strokeLinecap="round" fill="none" opacity="0.8" />

          {/* Chin shade */}
          <path d="M15.5 32.2 Q20 33.6 24.5 32.2" stroke="#d07a4a" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.45" />
        </svg>
      );
    }
  }
}

/**
 * Pointing hand with distinct fingers (index tip ≈ 0,0 hotspot).
 * Tall index, stepped middle/ring/pinky, thumb out left, palm base.
 */
const HAND_PATH = [
  // Index finger — tip sits on the mouse
  "M0.2 1.6",
  "C0.2 0.55 1.05 0 2 0",
  "C2.95 0 3.8 0.55 3.8 1.6",
  "V9.8",
  // Middle finger
  "H4.35",
  "V4",
  "C4.35 2.95 5.2 2.4 6.15 2.4",
  "C7.1 2.4 7.95 2.95 7.95 4",
  "V9.8",
  // Ring finger
  "H8.5",
  "V5.3",
  "C8.5 4.4 9.25 3.85 10.15 3.85",
  "C11.05 3.85 11.8 4.4 11.8 5.3",
  "V9.8",
  // Pinky
  "H12.35",
  "V6.8",
  "C12.35 6.05 12.95 5.55 13.7 5.55",
  "C14.45 5.55 15.05 6.05 15.05 6.8",
  "V14",
  "C15.05 16.75 12.85 18.95 10.1 18.95",
  "H4.9",
  "C3.8 18.95 2.75 18.55 1.9 17.8",
  // Thumb
  "L-3.3 13.05",
  "C-4.4 12.05 -4.5 10.35 -3.5 9.25",
  "C-2.5 8.15 -0.8 8.25 0.2 9.25",
  "L0.2 9.7",
  "Z",
].join("");

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

const WAND_CSS = `
@keyframes react-cursor-wand-twinkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.85); }
}
.react-cursor-wand-star {
  transform-origin: 4px 5px;
  animation: react-cursor-wand-twinkle 1.1s ease-in-out infinite;
}
.react-cursor-wand-spark {
  animation: react-cursor-wand-twinkle 1.4s ease-in-out infinite;
}
.react-cursor-wand-spark:nth-of-type(2) {
  animation-delay: 0.25s;
}
.react-cursor-wand-spark:nth-of-type(3) {
  animation-delay: 0.5s;
}
@media (prefers-reduced-motion: reduce) {
  .react-cursor-wand-star,
  .react-cursor-wand-spark {
    animation: none;
    opacity: 1;
  }
}
`;

const COMET_CSS = `
@keyframes react-cursor-comet {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.35); }
}
.react-cursor-comet {
  animation: react-cursor-comet 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .react-cursor-comet {
    animation: none;
  }
}
`;
