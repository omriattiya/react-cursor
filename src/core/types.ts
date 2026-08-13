import type { CSSProperties, ReactNode } from "react";

/** All values accepted by the CSS `cursor` property. */
export type NativeCursorValue = CSSProperties["cursor"];

export type PresetName =
  | "dot"
  | "ring"
  | "spotlight"
  | "emoji"
  | "image"
  | "text"
  | "pulse"
  | "arrow"
  | "hand"
  | "crosshair"
  | "wand"
  | "comet";

/** A cursor rendered by the browser via the CSS `cursor` property. */
export interface NativeCursor {
  native: NativeCursorValue;
  preset?: never;
  render?: never;
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
   * Once the mouse stops, segments fade away one by one — nearest first —
   * this many ms apart, without waiting for the tail to catch up. Default 200.
   */
  fadeDelay?: number;
}

/** Visual variant for a Click Effect spawned at the press point. */
export type ClickEffectVariant = "ripple" | "rays";

/** Provider-level press feedback at the pointer coordinates. */
export interface ClickEffectConfig {
  variant: ClickEffectVariant;
  /** Fill/stroke color (any CSS color, including alpha). Default `#000`. */
  color?: string;
  /** Max radius (ripple) or ray length in px. Default 48. */
  size?: number;
  /** Animation duration in ms. Default 450. */
  duration?: number;
}

/** Options shared by all custom cursors (presets and render). */
interface CustomCursorOptions {
  /** 0 = snap; (0, 1] = fraction of remaining distance per frame (default 0.75). */
  smoothing?: number;
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
  /** Speed-based stretch — presets only (not available on custom `render` cursors). */
  velocity?: VelocityEffectConfig;
} & CustomCursorOptions;

/** A fully custom-rendered cursor (escape hatch). */
export type RenderCursor = {
  render: ReactNode;
  native?: never;
  preset?: never;
} & CustomCursorOptions;

export type CursorStyle = NativeCursor | PresetCursor | RenderCursor;
