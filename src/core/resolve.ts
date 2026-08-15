import type { ClickEffectConfig, CursorStyle } from "./types";

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

/**
 * Decides the active click effect. Innermost zone with an explicit value wins
 * (`false` disables); zones that omit it inherit the enclosing zone, then the
 * Provider.
 */
export function resolveClickEffect(
  provider: false | ClickEffectConfig | undefined,
  hoveredZones: readonly (false | ClickEffectConfig | undefined)[],
): false | ClickEffectConfig | undefined {
  for (let i = hoveredZones.length - 1; i >= 0; i--) {
    const zone = hoveredZones[i];
    if (zone !== undefined) return zone;
  }
  return provider;
}
