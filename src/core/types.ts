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
   * Once the trail settles after the mouse stops, segments fade away one by
   * one — deepest first — this many ms apart. Default 200.
   */
  fadeDelay?: number;
}

/** Options shared by all custom cursors (presets and render). */
interface CustomCursorOptions {
  /** 0 = snap; (0, 1] = fraction of remaining distance per frame (default 0.75). */
  smoothing?: number;
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
} & CustomCursorOptions;

/** A fully custom-rendered cursor (escape hatch). */
export type RenderCursor = {
  render: ReactNode;
  native?: never;
  preset?: never;
} & CustomCursorOptions;

export type CursorStyle = NativeCursor | PresetCursor | RenderCursor;
