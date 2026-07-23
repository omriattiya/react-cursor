import type { CSSProperties, ReactNode } from "react";

/** All values accepted by the CSS `cursor` property. */
export type NativeCursorValue = CSSProperties["cursor"];

export type PresetName = "dot" | "ring" | "spotlight" | "emoji" | "image" | "text" | "pulse";

/** A cursor rendered by the browser via the CSS `cursor` property. */
export interface NativeCursor {
  native: NativeCursorValue;
  preset?: never;
  render?: never;
}

/** Spring-based tracking: the cursor follows the mouse with momentum. */
export interface PhysicsConfig {
  /** Spring stiffness. Higher = snappier. Default 200. */
  stiffness?: number;
  /** Velocity damping. Lower = more overshoot/wobble. Default 20. */
  damping?: number;
  /** Cursor weight. Heavier = more sluggish. Default 1. */
  mass?: number;
}

/** Visual response to cursor speed. */
export interface VelocityEffectConfig {
  /** Maximum elongation along the movement axis (1 = no stretch). */
  stretch?: number;
}

/** A chain of segments trailing behind the cursor (snake effect). */
export interface TrailConfig {
  /** Number of trail segments. Default 3. */
  count?: number;
  /** Lag (ms) each segment trails the one before it along the mouse path. Default 100. */
  delay?: number;
  /** Scale segments down with depth. Default true; set false to keep every segment the cursor's full size. */
  shrink?: boolean;
  /**
   * Once the mouse stops, segments fade away one by one — deepest first —
   * this many ms apart. Default 200.
   */
  fadeDelay?: number;
}

/**
 * Physics (springs) and Smoothing (lerp) are mutually exclusive tracking
 * models — a cursor style declares at most one of them.
 */
type Tracking =
  | {
      /** 0 = snap; (0, 1] = fraction of remaining distance per frame (default 0.75). */
      smoothing?: number;
      physics?: never;
    }
  | {
      physics?: PhysicsConfig;
      smoothing?: never;
    };

/** Options shared by all custom cursors (presets and render). */
interface CustomCursorOptions {
  velocity?: VelocityEffectConfig;
  trail?: TrailConfig;
  /** Set false to keep the native cursor visible alongside the custom one. */
  hideNativeCursor?: boolean;
}

/** A custom cursor built from one of the shipped presets. */
export type PresetCursor = {
  preset: PresetName;
  native?: never;
  render?: never;
  size?: number;
  color?: string;
  /** Content for the emoji / image / text presets. */
  content?: string;
} & CustomCursorOptions &
  Tracking;

/** A fully custom-rendered cursor (escape hatch). */
export type RenderCursor = {
  render: ReactNode;
  native?: never;
  preset?: never;
} & CustomCursorOptions &
  Tracking;

export type CursorStyle = NativeCursor | PresetCursor | RenderCursor;
