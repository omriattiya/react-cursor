import { useEffect, useMemo, useState, type ReactNode } from "react";
import { resolveClickEffect, resolveCursor } from "../core/resolve";
import type { ClickEffectConfig, CursorStyle, PresetCursor, RenderCursor } from "../core/types";
import { ClickEffectLayer } from "./ClickEffectLayer";
import { CursorContext, type CursorRegistry } from "./context";
import { CustomCursorLayer } from "./CustomCursorLayer";
import { useHasCursor } from "./useHasCursor";

interface Entry {
  id: string;
  style: CursorStyle;
  clickEffect?: false | ClickEffectConfig;
}

export interface CursorProviderProps {
  children?: ReactNode;
  /**
   * Optional press feedback at the pointer coordinates. Independent of the
   * active Cursor (including Native Cursor). Pass `false` or omit to disable.
   * Hovered `CursorZone`s can override this.
   */
  clickEffect?: false | ClickEffectConfig;
}

export function CursorProvider({ children, clickEffect }: CursorProviderProps) {
  const [globals, setGlobals] = useState<Entry[]>([]);
  const [hoveredZones, setHoveredZones] = useState<Entry[]>([]);

  const registry = useMemo<CursorRegistry>(
    () => ({
      setGlobal(id, style) {
        setGlobals((prev) => [...prev.filter((e) => e.id !== id), { id, style }]);
      },
      removeGlobal(id) {
        setGlobals((prev) => prev.filter((e) => e.id !== id));
      },
      enterZone(id, style, clickEffect) {
        setHoveredZones((prev) => [
          ...prev.filter((e) => e.id !== id),
          { id, style, clickEffect },
        ]);
      },
      leaveZone(id) {
        setHoveredZones((prev) => prev.filter((e) => e.id !== id));
      },
    }),
    [],
  );

  const active = resolveCursor(
    globals.at(-1)?.style,
    hoveredZones.map((z) => z.style),
  );
  const activeClickEffect = resolveClickEffect(
    clickEffect,
    hoveredZones.map((z) => z.clickEffect),
  );

  const hasCursor = useHasCursor();
  const isCustom = active.native === undefined && hasCursor;
  const hideNative = isCustom && (active as PresetCursor | RenderCursor).hideNativeCursor !== false;
  const cursorValue = hideNative ? "none" : (active.native ?? "auto");

  useEffect(() => {
    document.documentElement.style.cursor = cursorValue;

    // Inheritance alone isn't enough: buttons, links, etc. get their own
    // cursor from the UA stylesheet, so apply the active value everywhere.
    const styleEl = document.createElement("style");
    styleEl.textContent = `html, html * { cursor: ${cursorValue} !important; }`;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, [cursorValue]);

  return (
    <CursorContext.Provider value={registry}>
      {children}
      {isCustom && <CustomCursorLayer style={active as PresetCursor | RenderCursor} />}
      {activeClickEffect ? <ClickEffectLayer config={activeClickEffect} /> : null}
    </CursorContext.Provider>
  );
}
