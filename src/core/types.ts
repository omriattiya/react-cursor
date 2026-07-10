import type { CSSProperties, ReactNode } from "react";

/** All values accepted by the CSS `cursor` property. */
export type NativeCursorValue = CSSProperties["cursor"];

export type PresetName = "dot" | "ring" | "spotlight" | "emoji" | "image" | "text";

/** A cursor rendered by the browser via the CSS `cursor` property. */
export interface NativeCursor {
  native: NativeCursorValue;
  preset?: never;
  render?: never;
}

/** A custom cursor built from one of the shipped presets. */
export interface PresetCursor {
  preset: PresetName;
  native?: never;
  render?: never;
  size?: number;
  color?: string;
  /** Content for the emoji / image / text presets. */
  content?: string;
  /** 0 = snap (default); (0, 1] = fraction of remaining distance per frame. */
  smoothing?: number;
  /** Set false to keep the native cursor visible alongside the custom one. */
  hideNativeCursor?: boolean;
}

/** A fully custom-rendered cursor (escape hatch). */
export interface RenderCursor {
  render: ReactNode;
  native?: never;
  preset?: never;
  smoothing?: number;
  hideNativeCursor?: boolean;
}

export type CursorStyle = NativeCursor | PresetCursor | RenderCursor;
