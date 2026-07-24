import { useContext, useEffect, useId } from "react";
import type { RenderCursor } from "../core/types";
import { CursorContext } from "./context";
import { normalizeCursor, type CursorInput } from "./normalize";

function isRenderCursor(input: CursorInput): input is RenderCursor {
  return typeof input === "object" && input !== null && "render" in input;
}

/** Sets the Global Cursor while the calling component is mounted. */
export function useCursor(input: CursorInput): void {
  const registry = useContext(CursorContext);
  if (registry === null) {
    throw new Error("useCursor must be used within a <CursorProvider>");
  }

  const id = useId();
  // React elements can't be stringified (circular); use the node's identity
  // instead, and track the remaining (serializable) properties separately.
  const renderKey = isRenderCursor(input) ? input.render : null;
  const styleKey = isRenderCursor(input)
    ? JSON.stringify({
        smoothing: input.smoothing,
        trail: input.trail,
        hideNativeCursor: input.hideNativeCursor,
      })
    : JSON.stringify(input);

  useEffect(() => {
    registry.setGlobal(id, normalizeCursor(input));
    return () => registry.removeGlobal(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- renderKey + styleKey stand in for the input object
  }, [registry, id, renderKey, styleKey]);
}
