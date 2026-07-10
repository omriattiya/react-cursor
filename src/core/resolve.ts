import type { CursorStyle } from "./types";

export const DEFAULT_CURSOR: CursorStyle = { native: "auto" };

/**
 * Decides the active cursor. Hovered zones (outermost-first) take priority
 * over the global cursor; the innermost zone wins among nested zones.
 */
export function resolveCursor(
  global: CursorStyle | undefined,
  hoveredZones: readonly CursorStyle[],
): CursorStyle {
  return hoveredZones.at(-1) ?? global ?? DEFAULT_CURSOR;
}
