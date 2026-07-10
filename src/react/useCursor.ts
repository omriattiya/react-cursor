import { useContext, useEffect, useId } from "react";
import { CursorContext } from "./context";
import { normalizeCursor, type CursorInput } from "./normalize";

function isRenderCursor(input: CursorInput): boolean {
  return typeof input === "object" && input !== null && "render" in input;
}

/** Sets the Global Cursor while the calling component is mounted. */
export function useCursor(input: CursorInput): void {
  const registry = useContext(CursorContext);
  if (registry === null) {
    throw new Error("useCursor must be used within a <CursorProvider>");
  }

  const id = useId();
  // React elements can't be stringified (circular); use the node's identity instead.
  const styleKey = isRenderCursor(input) ? (input as { render: unknown }).render : JSON.stringify(input);

  useEffect(() => {
    registry.setGlobal(id, normalizeCursor(input));
    return () => registry.removeGlobal(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- styleKey stands in for the input object
  }, [registry, id, styleKey]);
}
