import type { CursorStyle, NativeCursorValue } from "../core/types";

export type CursorInput = NativeCursorValue | CursorStyle;

export function normalizeCursor(input: CursorInput): CursorStyle {
  return typeof input === "string" ? { native: input } : (input as CursorStyle);
}
